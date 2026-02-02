"""
Flask backend for Anna University GPA calculator
Integrated with correct calculation logic from manual entry
"""

from __future__ import annotations
import os, re, json
from typing import Dict, List, Tuple, Optional
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import numpy as np
import pandas as pd
import cv2
import pytesseract

# --- Configuration ---
TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

# --- Subject Database for B.Tech IT 2021 Regulation ---
# From your manual entry script.js
SUBJECT_DATABASE = {
    "1": {
        "HS3152": 3,
        "MA3151": 4,
        "PH3151": 3,
        "CY3151": 3,
        "GE3151": 3,
        "GE3152": 1,
        "GE3171": 2,
        "BS3171": 2,
        "GE3172": 1
    },
    "2": {
        "HS3252": 2,
        "MA3251": 4,
        "PH3256": 3,
        "BE3251": 3,
        "GE3251": 4,
        "CS3251": 3,
        "GE3252": 1,
        "GE3271": 2,
        "CS3271": 2,
        "GE3272": 2
    },
    "3": {
        "MA3354": 4,
        "CS3351": 4,
        "CS3352": 3,
        "CD3291": 3,
        "CS3391": 3,
        "CD3281": 2,
        "CS3381": 1.5,
        "CS3361": 2,
        "GE3361": 1
    },
    "4": {
        "CS3452": 3,
        "CS3491": 4,
        "CS3492": 3,
        "IT3401": 4,
        "CS3451": 3,
        "GE3451": 2,
        "CS3461": 1.5,
        "CS3481": 1.5
    },
    "5": {
        "CS3591": 4,
        "IT3501": 3,
        "CS3551": 3,
        "CS3691": 4,
        "IT3511": 2
    },
    "6": {
        "CCS356": 4,
        "IT3681": 1.5
    },
    "7": {
        "GE3791": 2,
        "IT3711": 2
    },
    "8": {
        "IT3811": 10
    }
}

# All elective courses (3 credits each)
ELECTIVE_COURSES = [
    "GE3751", "GE3752", "GE3753", "GE3754", "GE3755", "GE3792", "CCS346", "CCS360", 
    "CCS355", "CCS369", "CCW331", "CCS349", "CCS338", "CCS334", "CCS335", "CCS332", 
    "CCS336", "CCS370", "CCS366", "CCS374", "CCS342", "CCS358", "CCS372", "CCS341", 
    "CCS367", "CCS365", "CCS368", "CCS362", "CCS344", "CCS343", "CCS363", "CCS351", 
    "CB3591", "CCS339", "CCS354", "CCS333", "CCS352", "CCS371", "CCW332", "CCS373", 
    "CCS347", "CCS353", "CCS361", "CCS340", "CCS359", "CCS331", "CCS350", "CCS364", 
    "CCS357", "CCS337", "CCS345", "OAS351", "OIE351", "OBT351", "OCE351", "OEE351", 
    "OEI351", "OMA351", "OIE352", "OMG351", "OFD351", "AI3021", "OEI352", "OPY351", 
    "OAE351", "OHS351", "OMG352", "OMG353", "CME365", "OME354", "MF3003", "OPR351", 
    "AU3791", "OAS352", "OIM351", "OIE354", "OSF351", "OML351", "OMR351", "ORA351", 
    "OAE352", "OGI351", "OAI351", "OEN351", "OEE352", "OEI353", "OCH351", "OCH352", 
    "OFD352", "OFD353", "OPY352", "OTT351", "OTT352", "OTT353", "OPE351", "CPE334", 
    "OPT351", "OEC351", "OEC352", "CBM348", "CBM333", "OMA352", "OMA353", "OMA354", 
    "OCE353", "OBT352", "OBT353", "OBT354", "OHS352", "OMA355", "OMA356", "OMA357", 
    "OMG354", "OMG355", "OME352", "CME343", "OME355", "MF3010", "OMF354", "AU3002", 
    "AU3008", "OAS353", "OIM352", "OIM353", "OIE353", "OSF352", "OSF353", "OML352", 
    "OML353", "OMR352", "OMR353", "ORA352", "MV3501", "OMV351", "OMV352", "CRA332", 
    "OGI352", "OAI352", "OEN352", "OEE353", "OEI354", "OCH353", "OCH354", "OFD354", 
    "OFD355", "OPY353", "OTT354", "FT3201", "OTT355", "OPE353", "OPE354", "OPT352", 
    "OPT353", "OEC353", "CBM370", "CBM356", "OCE354", "OBT355", "OBT356", "OBT357",
    "CMG331", "CMG332", "CMG333", "CMG334", "CMG335", "CMG336", "CMG337", "CMG338", 
    "CMG339", "CMG340", "CMG341", "CMG342", "CMG343", "CMG344", "CMG345", "CMG346", 
    "CMG347", "CMG348", "CMG349", "CMG350", "CMG351", "CMG352", "CMG353", "CMG354", 
    "CES331", "CES332", "CES333", "CES334", "CES335", "CES336", "CES337", "CES338"
]

# Grade points mapping (from your manual entry)
GRADE_POINTS = {
    "10": 10,  # O
    "9": 9,    # A+
    "8": 8,    # A
    "7": 7,    # B+
    "6": 6,    # B
    "5": 5,    # C
    "0": 0     # F (Fail)
}

# Grade synonyms for OCR
GRADE_SYNONYMS = {
    "O": "10",
    "A+": "9",
    "A": "8", 
    "B+": "7",
    "B": "6",
    "C": "5",
    "F": "0",
    "RA": "0",  # Reappear
    "AB": "0",  # Absent
    "WH": "0"   # Withheld
}

# Regexes
SUBJECT_CODE_RE = re.compile(r"^[A-Z]{2,4}\d{3,4}$")
SEM_VAL_RE = re.compile(r"^(0?[1-9]|10)$")

# --- OCR Functions (same as before but simplified) ---

def read_image_from_werkzeug(file) -> np.ndarray:
    in_mem = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(in_mem, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Unsupported or corrupted image. Please upload PNG/JPG/JPEG.")
    return img

def preprocess_for_ocr(img_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    scale = 1.5 if min(gray.shape[:2]) < 1200 else 1.2
    gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.bilateralFilter(gray, 11, 15, 15)
    thr = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thr = cv2.morphologyEx(thr, cv2.MORPH_CLOSE, kernel, iterations=1)
    return thr

def tesseract_words(img: np.ndarray) -> pd.DataFrame:
    custom_oem_psm_config = r"--oem 1 --psm 6"
    whitelist = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/-"
    config = f'{custom_oem_psm_config} -c tessedit_char_whitelist="{whitelist}"'
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DATAFRAME, lang="eng", config=config)
    if data is None or data.empty:
        return pd.DataFrame(columns=["text", "conf", "left", "top", "width", "height", "line_num", "block_num", "par_num"])
    df = data.dropna(subset=["text"]).copy()
    df["text"] = df["text"].astype(str).str.strip()
    df["conf"] = pd.to_numeric(df["conf"], errors="coerce").fillna(-1).astype(int)
    df = df[df["text"] != ""]
    return df

def extract_semester_global(df: pd.DataFrame) -> Optional[str]:
    up = df["text"].str.upper()
    sem_rows = df[up.str.contains(r"\bSEM\b|\bSEMESTER\b", regex=True, na=False)]
    candidates = []
    def find_near(rows):
        for _, r in rows.iterrows():
            cx, cy = int(r.left + r.width // 2), int(r.top + r.height // 2)
            near = df[df.left.between(cx - 180, cx + 180) & df.top.between(cy - 60, cy + 60)]
            for t in near["text"].astype(str):
                t2 = t.strip()
                if SEM_VAL_RE.fullmatch(t2):
                    candidates.append(str(int(t2)))
    if not sem_rows.empty:
        find_near(sem_rows)
    if not candidates:
        for _, group in df.groupby(["block_num", "par_num", "line_num"]):
            joined = " ".join(group["text"].astype(str)).upper()
            if "SEM" in joined or "SEMESTER" in joined:
                for tok in group["text"].astype(str):
                    if SEM_VAL_RE.fullmatch(tok.strip()):
                        candidates.append(str(int(tok)))
    return candidates[0] if candidates else None

def normalize_grade(g: str) -> Optional[str]:
    g = (g or "").strip().upper().replace(" ", "")
    if not g:
        return None
    # Direct grade points
    if g in ["10", "9", "8", "7", "6", "5", "0"]:
        return g
    # Letter grades
    if g in GRADE_SYNONYMS:
        return GRADE_SYNONYMS[g]
    # OCR variations
    if g == "APLUS" or g == "A PLUS":
        return "9"
    if g == "O" or g == "0":  # OCR might read O as 0
        return "10"
    return None

def find_rows_subjects_and_grades(df: pd.DataFrame) -> List[Dict]:
    rows = []
    for (_, _, line_num), line_df in df.groupby(["block_num", "par_num", "line_num"], sort=True):
        toks = line_df.sort_values("left").to_dict("records")
        if not toks:
            continue
        
        codes = []
        for t in toks:
            txt = t["text"].strip().upper().replace(" ", "")
            if SUBJECT_CODE_RE.match(txt):
                codes.append((txt, t))
        if not codes:
            continue
        
        grade_list = []
        for t in toks:
            g = normalize_grade(str(t["text"]))
            if g:
                grade_list.append((g, t))
        
        for code, code_t in codes:
            chosen_grade = None
            # Find nearest grade on the right
            candidates = [(g, t) for g, t in grade_list if t["left"] >= code_t["left"]]
            if not candidates:
                candidates = grade_list
            if candidates:
                g, t = min(candidates, key=lambda p: abs(p[1]["left"] - code_t["left"]))
                chosen_grade = g
            
            rows.append({
                "subject_code": code,
                "grade": chosen_grade
            })
    return rows

# --- Calculate GPA with correct logic ---

def calculate_gpa(user_data: dict) -> dict:
    semester = user_data.get("semester", "4")
    subjects = user_data.get("subjects", [])
    
    total_credit_points = 0
    total_credits = 0
    has_arrear = False
    invalid_subjects = []
    details = []
    
    # Check for arrears (F grades = 0) first
    for subject in subjects:
        grade = subject.get("grade", "")
        if grade == "0":
            has_arrear = True
            break
    
    if has_arrear:
        return {
            "success": False,
            "message": "Arrear Found! You have failed in one or more subjects.",
            "gpa": 0
        }
    
    # Calculate GPA for each subject
    for subject in subjects:
        subject_code = subject.get("subject_code", "").upper().strip()
        grade = subject.get("grade", "")
        
        # Skip empty subject codes
        if not subject_code:
            continue
        
        # Skip NM subjects
        if subject_code.startswith("NM"):
            details.append({
                "subject_code": subject_code,
                "credits": 0,
                "grade": grade if grade else "N/A",
                "note": "NM subject - excluded from calculation"
            })
            continue
        
        # Get credit value for the subject
        credits = 0
        note = ""
        
        # Check if subject exists in database for the selected semester
        if semester in SUBJECT_DATABASE and subject_code in SUBJECT_DATABASE[semester]:
            credits = SUBJECT_DATABASE[semester][subject_code]
            note = "Core subject"
        # Check if subject is an elective course (3 credits)
        elif subject_code in ELECTIVE_COURSES:
            credits = 3
            note = "Elective course"
        # Invalid subject code
        else:
            invalid_subjects.append(subject_code)
            details.append({
                "subject_code": subject_code,
                "credits": 0,
                "grade": grade if grade else "N/A",
                "note": "Invalid subject code"
            })
            continue
        
        if not grade:
            details.append({
                "subject_code": subject_code,
                "credits": credits,
                "grade": "N/A",
                "note": "Grade not provided"
            })
            continue
        
        try:
            grade_point = float(grade)
            if grade_point not in GRADE_POINTS.values():
                raise ValueError("Invalid grade point")
        except:
            details.append({
                "subject_code": subject_code,
                "credits": credits,
                "grade": grade,
                "note": "Invalid grade format"
            })
            continue
        
        # Add to totals
        weighted_points = credits * grade_point
        total_credit_points += weighted_points
        total_credits += credits
        
        details.append({
            "subject_code": subject_code,
            "credits": credits,
            "grade": {
                "10": "O",
                "9": "A+",
                "8": "A",
                "7": "B+",
                "6": "B",
                "5": "C",
                "0": "F"
            }.get(str(int(float(grade))), grade),
            "grade_point": grade_point,
            "weighted_points": round(weighted_points, 2),
            "note": note
        })
    
    # Check for invalid subjects
    if invalid_subjects:
        return {
            "success": False,
            "message": f"Invalid subject code(s): {', '.join(invalid_subjects)}",
            "gpa": 0,
            "details": details
        }
    
    # Check if we have any valid subjects
    if total_credits == 0:
        return {
            "success": False,
            "message": "No valid subjects found for calculation.",
            "gpa": 0,
            "details": details
        }
    
    # Calculate GPA
    gpa = total_credit_points / total_credits if total_credits > 0 else 0
    
    return {
        "success": True,
        "message": "GPA calculated successfully.",
        "gpa": round(gpa, 2),
        "total_credits": round(total_credits, 2),
        "total_credit_points": round(total_credit_points, 2),
        "details": details,
        "invalid_subjects": invalid_subjects
    }

# --- Routes ---

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "subjects_loaded": sum(len(subs) for subs in SUBJECT_DATABASE.values()),
        "electives_loaded": len(ELECTIVE_COURSES)
    })

@app.route("/api/extract", methods=["POST"])
def api_extract():
    if "file" not in request.files:
        return jsonify({"error": "Upload a file field named 'file'"}), 400
    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    try:
        img = read_image_from_werkzeug(f)
        proc = preprocess_for_ocr(img)
        df = tesseract_words(proc)
        global_sem = extract_semester_global(df)
        rows = find_rows_subjects_and_grades(df)
        
        # Format for frontend
        out_rows = []
        for r in rows:
            # Convert grade to your format (10 for O, 9 for A+, etc.)
            grade = r.get("grade", "")
            if grade:
                # If it's already a number grade, keep it
                try:
                    float(grade)
                    formatted_grade = grade
                except:
                    # Convert letter grade to number
                    formatted_grade = GRADE_SYNONYMS.get(grade, "")
            
            out_rows.append({
                "subject_code": r.get("subject_code", ""),
                "grade": formatted_grade if grade else ""
            })
        
        return jsonify({
            "semester_detected": global_sem,
            "extracted_rows": out_rows,
            "note": "Review and edit subjects before calculation."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/compute", methods=["POST"])
def api_compute():
    try:
        payload = request.get_json(force=True)
        semester = payload.get("semester", "4")
        rows = payload.get("rows", [])
        
        # Clean and validate data
        subjects = []
        for r in rows:
            subject_code = (r.get("subject_code") or "").strip().upper()
            grade = (r.get("grade") or "").strip()
            
            # Skip empty rows
            if not subject_code and not grade:
                continue
                
            subjects.append({
                "subject_code": subject_code,
                "grade": grade
            })
        
        # Prepare user data for calculation
        user_data = {
            "semester": semester,
            "subjects": subjects
        }
        
        # Calculate GPA using the correct logic
        result = calculate_gpa(user_data)
        
        return jsonify({
            "success": result["success"],
            "message": result["message"],
            "gpa": result["gpa"],
            "total_credits": result.get("total_credits", 0),
            "total_credit_points": result.get("total_credit_points", 0),
            "details": result.get("details", []),
            "invalid_subjects": result.get("invalid_subjects", [])
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# --- Run ---
if __name__ == "__main__":
    print("=" * 50)
    print("Anna University GPA Calculator - IT Department")
    print("=" * 50)
    print(f"Core subjects loaded: {sum(len(subs) for subs in SUBJECT_DATABASE.values())}")
    print(f"Elective courses loaded: {len(ELECTIVE_COURSES)}")
    print("=" * 50)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)