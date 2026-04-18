import cv2
import numpy as np
from PIL import Image
import pytesseract
import imagehash
import io
import re

# Mock database for storing image hashes to detect duplicates
UPLOADED_HASHES = set()

# Thresholds
BLUR_THRESHOLD = 100.0  # Variance of Laplacian below this is considered blurry

def check_blur(image_bytes: bytes) -> tuple[bool, str]:
    """Check if the image is blurry using variance of Laplacian."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_cv is None:
        return False, "Could not decode image."
    
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    if fm < BLUR_THRESHOLD:
        return True, f"Blurry image (Score: {fm:.2f})"
    return False, "Image is sharp enough."

def check_metadata(image_pil: Image.Image) -> tuple[bool, str]:
    """Check if image metadata contains traces of editing software."""
    # EXIF data could contain editing software info
    info = image_pil.getexif()
    if not info:
        return False, "No EXIF metadata found."
    
    suspicious_keywords = ['photoshop', 'canva', 'gimp', 'illustrator', 'lightroom']
    
    for tag_id, value in info.items():
        if isinstance(value, str):
            val_lower = value.lower()
            if any(keyword in val_lower for keyword in suspicious_keywords):
                return True, f"Suspicious software metadata detected: {value}"
    
    return False, "No suspicious metadata found."

def check_duplicate(image_pil: Image.Image) -> tuple[bool, str]:
    """Check if visually identical image was uploaded before using perceptual hashing."""
    im_hash = imagehash.average_hash(image_pil)
    
    if im_hash in UPLOADED_HASHES:
        return True, "Duplicate receipt. Same receipt used previously."
    
    # Add to our mock db
    UPLOADED_HASHES.add(im_hash)
    return False, "New, unique receipt."

def check_ocr_name(image_pil: Image.Image, student_name: str) -> tuple[bool, str]:
    """Extract text via OCR and check if student_name exists within it."""
    # Use pytesseract to extract text
    # Note: Requires Tesseract to be installed on the system
    try:
        text = pytesseract.image_to_string(image_pil)
        # Normalize text and name for comparison
        text_clean = re.sub(r'[^a-zA-Z0-9\s]', '', text).lower()
        name_clean = re.sub(r'[^a-zA-Z0-9\s]', '', student_name).lower()
        
        # Split names to check for partial matches easily (e.g., First Name Last Name)
        parts = name_clean.split()
        matches = sum(1 for part in parts if part in text_clean)
        
        # If at least half the name parts match, we consider it a hit (hackathon shortcut)
        if len(parts) > 0 and (matches >= len(parts) / 2):
             return False, "Name found in document."
        else:
             return True, "Mismatched student name. Student name not clearly found in text."
    except Exception as e:
        return True, f"OCR Failed. Could not extract text. Make sure Tesseract is installed. Error: {str(e)}"

def analyze_document(file_bytes: bytes, student_name: str) -> dict:
    """Run all fraud checks and calculate Suspicious Document Score."""
    
    image_pil = None
    try:
        image_pil = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        return {"fraud_score": 100, "risk_detected": True, "reasons": ["Invalid image format."]}

    reasons = []
    total_score = 0
    
    # 1. Blurry Check (Weight: 20%)
    is_blurry, blur_msg = check_blur(file_bytes)
    if is_blurry:
        reasons.append(blur_msg)
        total_score += 20
        
    # 2. Duplicate Check (Weight: 80% - highly suspicious)
    is_dup, dup_msg = check_duplicate(image_pil)
    if is_dup:
        reasons.append(dup_msg)
        total_score += 80
        
    # 3. Edited Metadata (Weight: 30%)
    is_edited, meta_msg = check_metadata(image_pil)
    if is_edited:
        reasons.append(meta_msg)
        total_score += 30
        
    # 4. Mismatched Name OCR (Weight: 40%)
    if student_name and student_name.strip():
        is_mismatch, name_msg = check_ocr_name(image_pil, student_name)
        if is_mismatch:
            reasons.append(name_msg)
            total_score += 40
    else:
        reasons.append("No student name provided for verification.")
        total_score += 10 # Minor penalty if missing input
        
    # Cap score at 100
    final_score = min(total_score, 100)
    risk_detected = final_score >= 50 # Flag if score is 50% or more
    
    return {
        "fraud_score": final_score,
        "risk_detected": risk_detected,
        "reasons": reasons
    }
