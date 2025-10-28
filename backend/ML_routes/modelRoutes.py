from fastapi import FastAPI, UploadFile, File, HTTPException
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

    MODEL_PATH = "backend/ML_models/new-with-min-200"
    NUM_CLASSES = 517  # From training file 
    
    try:
        model = load_face_verification_model(MODEL_PATH, NUM_CLASSES)
    except Exception as e:
        print("❌ Error loading the model:", e)


# API to verify the user
@app.post('/check-verification')
async def check_verification(hd_image: UploadFile = File(...), webcam_image: UploadFile = File(...)):
    # Check if the model is loaded
    global model

    load_model()
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")

    try:
        # read bytes
        hd_image_bytes = await hd_image.read()
        webcam_image_bytes = await webcam_image.read()

        # conver to PIl for model
        hd_img = Image.open(io.BytesIO(hd_image_bytes)).convert('RGB')
        webcam_img = Image.open(io.BytesIO(webcam_image_bytes)).convert('RGB')

        # get embeddings from the model
        emb1 = get_embedding(model, webcam_img)
        print("S")
        emb2 = get_embedding(model, hd_img)

        print("DS")
        if emb1 is not None and emb2 is not None:
            similarity = cosine_similarity(emb1, emb2)
            print(f"\n🧩 Cosine Similarity: {similarity:.4f}")
            threshold = 0.146     # from LFW dataset

            if similarity >= threshold:
                return {"message": "Same person"}
            else:
                return {'message': "Different person"}


        return {"message": "Error in verification process."}
    
    except Exception as e:
        return {"error": str(e)}