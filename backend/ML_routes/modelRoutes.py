from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
from pydantic import BaseModel
from io import BytesIO


# Custom file 
from backend.ML_helper_function.faceVerification import load_face_verification_model, get_embedding, cosine_similarity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def root():
    print('FastAPI is running')


### --------------- Face Verification ---------------

# function to load the model
def load_model():
    global model

    MODEL_PATH = "backend/ML_models/face_verification_model_finetuned.pth"
    NUM_CLASSES = 517  # From training file 
    
    try:
        model = load_face_verification_model(MODEL_PATH, NUM_CLASSES)
    except Exception as e:
        print("❌ Error loading the model:", e)

@app.post('/register-user')
async def register_user(hd_image: UploadFile = File(...)):
    # Check if the model is loaded
    global model
    
    load_model()
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
        print(f"Registered user with embedding: {embedding}")

        # Return a success message
        return {"message": "User registered successfully!"}

    except Exception as e:
        return {"error": str(e)}

# API to verify the user
@app.post('/check-verification')
async def check_verification(user_image_embedding: str = Form(...), webcam_image: UploadFile = File(...)):
    # Check if the model is loaded
    global model

    load_model()
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")

    try:
        # read bytes
        webcam_image_bytes = await webcam_image.read()

        # conver to PIl for model
        webcam_img = Image.open(io.BytesIO(webcam_image_bytes)).convert('RGB')

        # get embeddings from the model
        emb1 = get_embedding(model, webcam_img)

        # check if the embeddings is returned
        if emb1 is None:
            return {"error": "Face not detected."}

        if emb1 is not None and user_image_embedding is not None:
            similarity = cosine_similarity(emb1, user_image_embedding)
            print(f"\n🧩 Cosine Similarity: {similarity:.4f}")
            threshold = 0.146     # from LFW dataset

            if similarity >= threshold:
                return {"message": "Same person"}
            else:
                return {'message': "Different person"}


        return {"message": "Error in verification process."}
    
    except Exception as e:
        return {"error": str(e)}