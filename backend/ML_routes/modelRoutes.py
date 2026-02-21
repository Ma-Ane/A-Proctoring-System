from fastapi import FastAPI, UploadFile, File, HTTPException, Form, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from PIL import Image
import io, base64, json, time, os
import numpy as np
from dotenv import load_dotenv
from bson import ObjectId


# Custom file 
from backend.ML_helper_function.faceVerification import load_face_verification_model, get_embedding, cosine_similarity
from backend.ML_helper_function.multipleFaceDetection import load_yolo_model, detect_faces
from backend.ML_helper_function.gazeDetection import detect_gaze

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Mongo DB connection
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client.get_database('test')
flags_collection = db["flags"]  # collection for storing flags


# Root
@app.get('/')
def root():
    print('FastAPI is running')
    
model = None 
yolo_model = None


# to check the mongo db connection for saving flags
@app.on_event("startup")
def check_mongo_connection():
    try:
        client.admin.command("ping")
        print("MongoDB Atlas connected ✅")
    except Exception as e:
        print("MongoDB Atlas connection failed ❌", e)

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
        
        print("\n✅ Models loaded successfully") 
    
    except Exception as e: 
        print("❌ Error loading models:", e)

@app.post('/register-user')
async def register_user(hd_image: UploadFile = File(...)):
    global model

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")

    try:
        hd_image_bytes = await hd_image.read()
        hd_img = Image.open(io.BytesIO(hd_image_bytes)).convert('RGB')

        embedding = get_embedding(model, hd_img)

        if embedding is None:
            raise HTTPException(
                status_code=400,
                detail="Face not detected or multiple faces detected."
            )

        return {
            "message": "User registered successfully!",
            "embedding": embedding.tolist() if hasattr(embedding, "tolist") else embedding
        }

    except HTTPException:
        # 🔴 THIS IS IMPORTANT
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def proctor_ws(websocket: WebSocket, exam_id: str = Query(...), user_id: str = Query(...)):
    await websocket.accept()
    print("🟢 Client connected")
    
    relative_yaw = 0.0
    sclera = 0.0
    side = "STRAIGHT"
    gaze_state = "ON_SCREEN"
    
    state = {
        "warning_count": 0,
        "suspicion_score": 0.0,
        "off_screen_start": None,
        "eyes_down_start": None,
        "prev_yaw": 0.0,
        "frame_count": 0
    }

    last_face_time = 0
    last_gaze_inference = 0
    last_face_inference = 0
    GAZE_INFERENCE_INTERVAL = 0.5
    FACE_INFERENCE_INTERVAL = 0.8
    multi_face_counter = 0
    
    global yolo_model
    if yolo_model is None:
        await websocket.send_json({"error": "YOLO model not loaded"})
        return

    try:
        while True:
            data = await websocket.receive_text()
            print("Data fetched in websocket try module")
            
            # Ignore empty frames
            if not data or len(data) < 100:
                continue
            
            img_bytes = base64.b64decode(data)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            now = time.time()
            if now - last_gaze_inference >= GAZE_INFERENCE_INTERVAL:
                #Detect gaze
                relative_yaw, sclera, side, gaze_state, state["suspicion_score"], state["warning_count"] = detect_gaze(img, state)
                print("Detect gaze works")
                last_gaze_inference = now
            
            if now - last_face_inference >= FACE_INFERENCE_INTERVAL:
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
                    
                print("Detect faces works")
                
                last_face_inference = now

            status = {
                "faces_detected": face_count,
                "multiple_faces": face_count > 1,
                "multi_face_violation": multi_face_counter >= 3,
                "absent": absence_seconds > 5,
                "absence_seconds": round(absence_seconds, 1),
                "no_face": face_count == 0,
                "yaw": relative_yaw,
                "sclera": sclera,
                "gaze_side": side,
                "gaze_state": gaze_state,
                "suspicion_score": state["suspicion_score"],
                "warning_count": state["warning_count"]
            }
            
            await websocket.send_json(status)

            # Store violations in mongodb
            if status["multi_face_violation"] or status["no_face"] or status["absent"]:
                # Determine violation message
                violations = []
                if status["multi_face_violation"]:
                    violations.append("Multiple faces detected")
                if status["no_face"]:
                    violations.append("No face detected")
                if status["absent"]:
                    violations.append("Student absent")
                # Optional: add gaze-based violations
                if gaze_state != "ON_SCREEN":
                    violations.append(f"Gaze off screen ({gaze_state})")
                if abs(relative_yaw) > 20:  # example threshold for head tilt
                    violations.append("Head tilted")

                violation_message = ", ".join(violations) if violations else "Unknown violation"
                
                # Convert image to base64 string for DB
                img_buffer = io.BytesIO()
                img.save(img_buffer, format="JPEG")
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode("utf-8")

                flag_doc = {
                    "examId": ObjectId(exam_id),
                    "userId": ObjectId(user_id),
                    "timestamp": time.time(),
                    "status": status,
                    "screenshot": img_base64,
                    "violation": violation_message
                }

                # Insert into MongoDB
                flags_collection.insert_one(flag_doc)

    except Exception as e:
        # await websocket.close(code=1011, reason=str(e))
        print("🔴 Client disconnected:", e)
