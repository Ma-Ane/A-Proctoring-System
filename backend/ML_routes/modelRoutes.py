from fastapi import FastAPI, UploadFile, File, HTTPException, Form, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
from pydantic import BaseModel
from io import BytesIO
import json
import numpy as np

# Custom file 
from backend.ML_helper_function.faceVerification import load_face_verification_model, get_embedding, cosine_similarity
from backend.ML_helper_function.multipleFaceDetection import load_yolo_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def root():
    print('FastAPI is running')
    
model = None 
yolo_model = None


### --------------- Face Verification ---------------

# function to load the model
@app.on_event("startup") # function to load the model 
def startup(): 
    global model, yolo_model 
    MODEL_PATH = "backend/ML_models/face_verification_model_finetuned.pth" 
    NUM_CLASSES = 517 # From training file 
    try: 
        print("🔵 Loading face verification model...") 
        model = load_face_verification_model( "backend/ML_models/face_verification_model_finetuned.pth", 517 ) 
        
        print("🔵 Loading YOLO face detector...") 
        yolo_model = load_yolo_model( "backend/ML_models/best.pt" ) 
        
        print("✅ Models loaded successfully") 
    
    except Exception as e: 
        print("❌ Error loading models:", e)

@app.post('/register-user')
async def register_user(hd_image: UploadFile = File(...)):
    # Check if the model is loaded
    global model
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")
    
    try:
        # Read the uploaded image bytes
        hd_image_bytes = await hd_image.read()
        
        # Convert the image to a PIL Image object
        hd_img = Image.open(io.BytesIO(hd_image_bytes)).convert('RGB')
        
        # Get embeddings from the model
        embedding = get_embedding(model, hd_img)
        
        # Check if the embedding is successfully returned
        if embedding is None:
            return {"error": "Face not detected."}

        # Here you would save the embedding to a database (for example)
        # For simplicity, we just print it
        print(f"Registered user with embedding: {len(embedding)}")

        # Return a success message
        return {"message": "User registered successfully!",
                "embedding": embedding.tolist() if hasattr(embedding, "tolist") else embedding
        }

    except Exception as e:
        return {"error": str(e)}

# API to verify the user
@app.post('/check-verification')
async def check_verification(user_image_embedding: str = Form(...), webcam_image: UploadFile = File(...)):
    # Check if the model is loaded
    global model

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")

    try:
        user_embedding = np.array(json.loads(user_image_embedding), dtype=float)

        # read bytes
        webcam_image_bytes = await webcam_image.read()

        # conver to PIl for model
        webcam_img = Image.open(io.BytesIO(webcam_image_bytes)).convert('RGB')

        # get embeddings from the model
        emb1 = get_embedding(model, webcam_img)

        # check if the embeddings is returned
        if emb1 is None:
            return {"error": "Face not detected."}

        if emb1 is not None and user_embedding is not None:
            similarity = cosine_similarity(emb1, user_embedding)
            print(f"\nCosine Similarity: {similarity:.4f}")
            threshold = 0.146     # from LFW dataset

            if similarity >= threshold:
                return {"message": "Same person"}
            else:
                return {'message': "Different person"}


        return {"message": "Error in verification process."}
    
    except Exception as e:
        return {"error": str(e)}
    
@app.websocket("/ws/proctor")
async def proctor_ws(websocket: WebSocket):
    await websocket.accept()
    print("🟢 Client connected")

    last_face_time = 0
    last_inference = 0
    INFERENCE_INTERVAL = 0.7
    multi_face_counter = 0
    
    global yolo_model
    if yolo_model is None:
        await websocket.send_json({"error": "YOLO model not loaded"})
        return

    try:
        while True:
            data = await websocket.receive_text()
            img_bytes = base64.b64decode(data)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            now = time.time()
            if now - last_inference < INFERENCE_INTERVAL:
                continue
            last_inference = now

            # Detect faces
            boxes = detect_faces(yolo_model, img, box_format='xywh', th=0.4)
            face_count = len(boxes)

            if face_count > 0:
                last_face_time = time.time()

            absence_seconds = time.time() - last_face_time
            
            if face_count > 1:
                multi_face_counter += 1
            else:
                multi_face_counter = 0

            await websocket.send_json({
                "faces_detected": face_count,
                "multiple_faces": face_count > 1,
                "multi_face_violation": multi_face_counter >= 3,
                "absent": absence_seconds > 5,
                "absence_seconds": round(absence_seconds, 1),
                "no_face": face_count == 0,
            })

    except Exception as e:
        print("🔴 Client disconnected", e)
