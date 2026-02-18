import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque

# =============================
# INITIALIZATION
# =============================
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,  
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# cap = cv2.VideoCapture(0)

# warning_count = 0
MAX_WARNINGS = 5
WARNING_COOLDOWN = 3
last_warning_time = 0

# off_screen_start = None

# prev_yaw = 0.0
# relative_yaw = 0.0

LEFT_THRESHOLD = 0.42  # Threshold for left gaze
RIGHT_THRESHOLD = 0.58  # Threshold for right gaze

# eyes_down_start = None
# frame_count=0

# startup = True

# =============================
# LANDMARK INDEXES
# =============================
NOSE_TIP = 1
CHIN = 152
LEFT_EYE = 33
RIGHT_EYE = 263
HEAD_POSE_LANDMARKS = {
    "nose": 1,
    "chin": 152,
    "left_eye": 33,
    "right_eye": 263,
    "left_mouth": 61,
    "right_mouth": 291
}
# Iris landmarks
LEFT_IRIS  = [468, 469, 470, 471]
RIGHT_IRIS = [473, 474, 475, 476]

# Eye corners (already using these, but let's be explicit)
LEFT_EYE_OUTER = 33
LEFT_EYE_INNER = 133
RIGHT_EYE_OUTER = 263
RIGHT_EYE_INNER = 362


SIDE_EYE_SCLERA = 0.22   # Windows
# # or
# SIDE_EYE_SCLERA = 0.26   # macOS


# =============================
# HEAD POSE FUNCTION
# =============================
def sclera_ratio(landmarks, image_shape, state):
    global frame_count
    h, w = image_shape
    state["frame_count"] += 1

    def eye_sclera(outer, inner, iris_ids):
        outer = np.array([landmarks[outer].x * w, landmarks[outer].y * h])
        inner = np.array([landmarks[inner].x * w, landmarks[inner].y * h])

        iris = np.array([[landmarks[i].x * w, landmarks[i].y * h] for i in iris_ids])
        iris_center = iris.mean(axis=0)

        left_white = np.linalg.norm(iris_center - outer)
        right_white = np.linalg.norm(inner - iris_center)
        if state["frame_count"] % 10 == 0:
            print(f"outer={outer}, inner={inner}")
            print(f"L={left_white:.3f}, R={right_white:.3f}")

        return (right_white - left_white) / (left_white + right_white + 1e-6)

    left_eye = eye_sclera(33, 133, LEFT_IRIS)
    right_eye = eye_sclera(263, 362, RIGHT_IRIS)

    # return (left_eye + right_eye) / 2
    return left_eye if abs(left_eye) > abs(right_eye) else right_eye


def eye_vertical_ratio(landmarks, image_shape):
    h, w = image_shape

    def eye_ratio(left, right, top, bottom):
        left = np.array([landmarks[left].x * w, landmarks[left].y * h])
        right = np.array([landmarks[right].x * w, landmarks[right].y * h])
        top = np.array([landmarks[top].x * w, landmarks[top].y * h])
        bottom = np.array([landmarks[bottom].x * w, landmarks[bottom].y * h])

        horiz_dist = np.linalg.norm(left - right)
        vert_dist = np.linalg.norm(top - bottom)
        if horiz_dist == 0:
            return 0.0

        return vert_dist / horiz_dist

    left_eye_ratio = eye_ratio(33, 133, 159, 145)
    right_eye_ratio = eye_ratio(263, 362, 386, 374)

    avg_ratio = (left_eye_ratio + right_eye_ratio) / 2

    print("Eye avg ratio:", avg_ratio)

    # Thresholds (empirical, stable)
    if avg_ratio < 0.18:
        return "EYES_DOWN"
    elif avg_ratio > 0.32:
        return "EYES_WIDE"
    else:
        return "EYES_CENTER"

def get_head_pose(landmarks, image_shape):
    image_h, image_w = image_shape
    face_2d = []

    for idx in [NOSE_TIP, CHIN, LEFT_EYE, RIGHT_EYE]:
        lm = landmarks[idx]
        x, y = int(lm.x * image_w), int(lm.y * image_h)
        face_2d.append([x, y])
    
    face_3d = np.array([
            [0.0, 0.0, 0.0],        # Nose tip
            [0.0, -63.6, -12.5],   # Chin
            [-43.3, 32.7, -26.0],  # Left eye corner
            [43.3, 32.7, -26.0],   # Right eye corner
        ], dtype=np.float64)

    face_2d = np.array(face_2d, dtype=np.float64)

    focal_length = image_w
    cam_matrix = np.array([
        [focal_length, 0, image_w / 2],
        [0, focal_length, image_h / 2],
        [0, 0, 1]
    ])

    dist_coeffs = np.zeros((4, 1))
    success, rot_vec, _ = cv2.solvePnP(
        face_3d, face_2d, cam_matrix, dist_coeffs, flags=cv2.SOLVEPNP_EPNP
    )
    
    if not success:
        return None, None, None

    rmat, _ = cv2.Rodrigues(rot_vec)
    angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

    pitch = angles[0]
    yaw = angles[1]
    roll = angles[2]

    return pitch, yaw, roll

# =============================
# CALIBRATION
# =============================
# def calibration(img):
#     print("Calibrating... Look straight at the screen.")
#     CALIBRATION_TIME = 3
#     calibration_yaws = []
#     calibration_sclera = []

#     start_time = time.time()
#     while time.time() - start_time < CALIBRATION_TIME:
#         # success, frame = cap.read()
#         # if not success:
#         #     continue

#         # frame = cv2.flip(frame, 1)
#         # rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         # results = face_mesh.process(rgb)
        
#         results = face_mesh.process(img)

#         if results.multi_face_landmarks:
#             landmarks = results.multi_face_landmarks[0].landmark
#             _, yaw, _ = get_head_pose(landmarks, img_np.shape[:2])
#             if yaw is not None:
#                 calibration_yaws.append(yaw)
            
#             s = sclera_ratio(landmarks, img_np.shape[:2])
#             calibration_sclera.append(abs(s))


#     if not calibration_yaws:
#         raise RuntimeError("Calibration failed: no face detected")
#     baseline_yaw = np.mean(calibration_yaws)
#     print("Baseline yaw:", baseline_yaw)
#     baseline_sclera = np.mean(calibration_sclera)
#     SIDE_EYE_THRESHOLD = baseline_sclera + 0.12

#     smoothed_yaw = baseline_yaw
#     prev_yaw = smoothed_yaw
#     return baseline_yaw

# =============================
# MAIN LOOP
# =============================
# while cap.isOpened():
#     success, frame = cap.read()
#     if not success:
#         break

#     frame = cv2.flip(frame, 1)
#     rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     results = face_mesh.process(rgb)

def detect_gaze(img, state):
    SIDE_EYE_THRESHOLD = 0.22
    img_np = np.array(img)
    img_rgb = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(img_rgb)

    gaze_state = "ON_SCREEN"
    
    if results.multi_face_landmarks:
        landmarks = results.multi_face_landmarks[0].landmark

        pitch, yaw, roll = get_head_pose(landmarks, img_np.shape[:2])
        
        if yaw is None:
            return 0.0, 0.0, "STRAIGHT", "ON_SCREEN", state["suspicion_score"], state["warning_count"]

        # Smooth yaw
        alpha = 0.2
        # if startup:
        #     baseline_yaw = calibration(img_rgb)
        
        baseline_yaw = 0.0  # assume neutral
        print(pitch)
        if 'prev_yaw' not in globals():
            state["prev_yaw"] = yaw

        print(state["prev_yaw"])
        smoothed_yaw = alpha * yaw + (1 - alpha) * state["prev_yaw"]

        state["prev_yaw"] = smoothed_yaw
            
        relative_yaw = smoothed_yaw - baseline_yaw

        # Reject impossible rotations
        if abs(relative_yaw) > 60:
            state["off_screen_start"] = None
            return relative_yaw, 0.0, "STRAIGHT", "ON_SCREEN", state["suspicion_score"], state["warning_count"]


        # Determine gaze_statestate based on both head pose and eye gaze
        # horizontal_state = eye_horizontal_ratio(landmarks, frame.shape[:2])
        vertical_state = eye_vertical_ratio(landmarks, img_np.shape[:2])
        sclera = sclera_ratio(landmarks, img_np.shape[:2], state)
        print(pitch)

        # ---- GAZE FUSION (single source of truth) ----
        if abs(relative_yaw) > 30:
            gaze_state = "OFF_SCREEN"

        elif vertical_state == "EYES_DOWN":
            state["eyes_down_start"] = state["eyes_down_start"] or time.time()
            if time.time() - state["eyes_down_start"] > 2.0:
                gaze_state = "OFF_SCREEN"

        elif abs(relative_yaw) < 8 and abs(sclera) > SIDE_EYE_THRESHOLD:
            gaze_state = "SIDE_EYE"

        else:
            gaze_state = "ON_SCREEN"
            state["eyes_down_start"] = None

        # ---- Time gating ----
        current_time = time.time()
        if gaze_state == "OFF_SCREEN":
            if state["off_screen_start"] is None:
                state["off_screen_start"] = current_time
        elif gaze_state == "ON_SCREEN":
            state["off_screen_start"] = None

        # ---- Trigger after OFFSCREEN_TIME ----
        if state["off_screen_start"] is not None:
            if current_time - state["off_screen_start"] >= 2.0:
                state["warning_count"] += 1
                print("⚠️ Looked away too long")
                state["off_screen_start"] = None

        if gaze_state.startswith("SIDE_EYE"):
            state["suspicion_score"] += 0.3

        if gaze_state == "OFF_SCREEN":
            state["suspicion_score"] += 0.6

        state["suspicion_score"] *= 0.95  # decay per frame
        if state["suspicion_score"] > 3.0:
            state["warning_count"] += 1
            state["suspicion_score"] *= 0.3
            
        if sclera > 0.25:
            side = "RIGHT"
        elif sclera < 0:
            side = "LEFT"
        else:
            side = "STRAIGHT"    
        
        print(
            f"Yaw={relative_yaw:6.1f} | "
            f"Sclera={sclera:+.3f} | "
            f"SIDE:={side} | "
            f"Vert={vertical_state:11s} | "
            f"Gaze={gaze_state:10s} | "
            f"Score={state['suspicion_score']:.2f} | "
            f"Warnings={state['warning_count']}"
        )
        
        # if warning_count >= MAX_WARNINGS:
        #     print("❌ EXAM TERMINATED")
        #     break
        
        # terminated = warning_count >= MAX_WARNINGS


    elif not results.multi_face_landmarks:
        gaze_state = "OFF_SCREEN"
        if state["off_screen_start"] is None:
            state["off_screen_start"] = time.time()

        if time.time() - state["off_screen_start"] >= 2.0:
            state["warning_count"] += 1
            print("⚠️ Face missing too long")
            state["off_screen_start"] = None
            
        relative_yaw = 0.0
        sclera = 0.0
        side = "STRAIGHT"
            
    # return 0.0, 0.0, "STRAIGHT", gaze_state, state["suspicion_score"], state["warning_count"]

    return relative_yaw, sclera, side, gaze_state, state["suspicion_score"], state["warning_count"]

    # cv2.imshow("AI Proctoring System", frame)
    # if cv2.waitKey(1) & 0xFF == 27:  # ESC key to exit
    #     break

# cap.release()
# cv2.destroyAllWindows()
