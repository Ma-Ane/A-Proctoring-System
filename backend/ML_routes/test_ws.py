import websocket
import base64
import cv2
import json
import time
from dotenv import load_dotenv
import os

load_dotenv()

WS_URL = os.getenv("WS_URL")

ws = websocket.WebSocket()
ws.connect(WS_URL)
print("Connected to WebSocket")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    _, buffer = cv2.imencode(".jpg", frame)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    ws.send(img_base64)

    response = ws.recv()
    print("Server:", json.loads(response))

    time.sleep(0.3)
