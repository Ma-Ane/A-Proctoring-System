from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
from pydantic import BaseModel
from io import BytesIO


# Custom file 
from backend.ML_helper_function.faceVerification import load_face_verification_model, get_embedding


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# load the model on startup
@app.on_event("startup")
def load_model():
    global model
    MODEL_PATH = "backend/ML_models/new-with-min-200"
    NUM_CLASSES = 517  # From training file 
    try:
        model = load_face_verification_model(MODEL_PATH, NUM_CLASSES)
    except Exception as e:
        print("❌ Error loading the model:", e)



@app.get('/')
def root():
    print('FastAPI is running')


### --------------- Face Verification ---------------

# type of data to expect from the frontend
class Image(BaseModel):
    image: str

@app.post('/check-verification')
async def check_verification(payload: Image):
    # Check if the model is loaded
    global model
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded yet")


    try:
        header, encoded = payload.image.split(",", 1) if "," in payload.image else ("", payload.image)
        image_bytes = base64.b64decode(encoded)

        image = Image.open(BytesIO(image_bytes))

        embedding = get_embedding(model, image)
        return {"embedding": embedding}
    
    except Exception as e:
        return {"error": str(e)}