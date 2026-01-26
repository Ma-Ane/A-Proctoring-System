import cv2
import numpy as np
from time import time
import torch.backends.cudnn as cudnn
import torch
import numpy as np
from ultralytics import YOLO
from PIL import Image
import time

def get_model(weights):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    device = 'mps' if torch.backends.mps.is_available() else device
    print(device)
    
    if device == 'cuda': cudnn.benchmark = True
    
    model = YOLO(weights)                
    model.to(device)
    return model

def detect_faces(model, img, box_format='xyxy',th=0.5):
    total_crops = []
    total_boxes = []
    total_scores = []
    total_cls = []
    
    results = model.predict(img, conf=th, verbose=False)
    
    # results = model.predict(imgs, stream=False, verbose=False)
    
    boxes = []
    for res in results:
        if box_format == 'xyxy':
            boxes = res.boxes.xyxy.cpu().numpy()
        elif box_format == 'xywh':
            xyxy = res.boxes.xyxy.cpu().numpy()
            boxes = [[int(x1), int(y1), int(x2-x1), int(y2-y1)] for x1,y1,x2,y2 in xyxy]
    return boxes
    
    """for i, image_result in enumerate(results):
        filtered_crops = []
        filtered_boxes = []
        filtered_scores = []
        filtered_cls = []
        
        img = imgs[i]
        img_w, img_h = np.array(img).shape[:2]
        
        if box_format == 'xyxy':
            image_boxes = image_result.boxes.xyxy.cpu().numpy()
        elif box_format == 'xywh':
            image_boxes = image_result.boxes.xyxy.cpu().numpy()
            image_boxes = [[round(x1), round(y1), round(np.abs(x1-x2)), round(np.abs(y1-y2))] for x1,y1,x2,y2 in image_boxes]
        elif box_format == 'xyxyn':
            image_boxes = image_result.boxes.xyxyn.cpu().numpy()
        elif box_format == 'xywhn':
            image_boxes = image_result.boxes.xyxyn.cpu().numpy()
            image_boxes = [[float(x1), float(y1), float(np.abs(x1-x2)), float(np.abs(y1-y2))] for x1,y1,x2,y2 in image_boxes]
              
        image_scores = image_result.boxes.conf.cpu().numpy()
        image_cls = image_result.boxes.cls.cpu().numpy()
        
        for j in range(len(image_boxes)):
            (x1, y1, x2, y2), score, c = image_boxes[j], image_scores[j], image_cls[j]
            if score >= th:
                filtered_scores.append(score)
                filtered_cls.append(c)
                if box_format == 'xyxy':
                    filtered_crops.append(img.crop([x1,y1,x2,y2]))
                    filtered_boxes.append([int(x1),int(y1),int(x2),int(y2)])
                elif box_format == 'xyxyn':
                    filtered_crops.append(img.crop([x1*img_w, y1*img_h, x2*img_w, y2*img_h]))
                    filtered_boxes.append([float(x1),float(y1),float(x2),float(y2)])
                elif box_format == 'xywh':
                    filtered_crops.append(img.crop([x1,y1,x1+x2,y1+y2]))
                    filtered_boxes.append([int(x1),int(y1),int(x2),int(y2)])
                elif box_format == 'xywhn':
                    filtered_crops.append(img.crop([x1*img_w,y1*img_h,(x1+x2)*img_w,(y1+y2)*img_h]))
                    filtered_boxes.append([float(x1),float(y1),float(x2),float(y2)])
                    
        total_crops.append(filtered_crops)        
        total_boxes.append(filtered_boxes)
        total_scores.append(filtered_scores)
        total_cls.append(filtered_cls)
                

    return total_crops, total_boxes, total_scores, total_cls"""

def load_yolo_model(Model_Path:str):
    # Init model and webcam
    detector = get_model(Model_Path)
    return detector
    
    """cap = cv2.VideoCapture(0)

    # Variables to store last detection results
    last_boxes = []
    last_scores = []
    num_faces = 0
    last_detection_time = time.time()

    DETECTION_INTERVAL = 5 # seconds

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            break

        current_time = time.time()

        # Run detection every 10 seconds
        if current_time - last_detection_time >= DETECTION_INTERVAL:
            last_detection_time = current_time

            # Detect faces
            crops, boxes, scores, cls = detect_faces(detector, [Image.fromarray(image)], box_format='xywh', th=0.4)
            num_faces = len(boxes[0]) if boxes and len(boxes) > 0 else 0

            # Update last detection results
            last_boxes = boxes[0] if len(boxes) > 0 else []
            last_scores = scores[0] if len(scores) > 0 else []

        # Draw last detected faces (if any)
        for (left, top, width, height), score in zip(last_boxes, last_scores):
            cv2.rectangle(image, (int(left), int(top)), (int(left + width), int(top + height)), (255, 0, 0), 2)
            cv2.putText(image, f"Face {score:.2f}", (int(left), int(top) - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Display face count
        cv2.putText(image, f'Faces: {num_faces}', (10, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Show time until next detection
        time_remaining = max(0, int(DETECTION_INTERVAL - (current_time - last_detection_time)))
        cv2.putText(image, f'Next detection in: {time_remaining}s', (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

        # Show live feed
        cv2.imshow('YOLO Face Detection', image)

        if cv2.waitKey(5) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()"""
