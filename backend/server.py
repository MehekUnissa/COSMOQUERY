from pathlib import Path
from typing import Optional
import sqlite3
import shutil
import base64
import requests
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="COSMO QUERY",
    version="1.0"
)

app.mount(
    "/css",
    StaticFiles(directory=str(PROJECT_DIR / "css")),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory=str(PROJECT_DIR / "js")),
    name="js"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = STORAGE_DIR / "cosmo_query.db"


# ============================================================
# OLLAMA
# ============================================================

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = "qwen2.5vl:3b"


# ============================================================
# MODES
# ============================================================

VALID_MODES = {
    "vqa",
    "grounding",
    "change_detection",
    "optical_sar"
}

SECONDARY_REQUIRED = {
    "change_detection",
    "optical_sar"
}

ALLOWED_EXTENSIONS = {
    ".tif",
    ".tiff",
    ".jp2",
    ".png",
    ".jpg",
    ".jpeg",
    ".pdf"
}


# ============================================================
# DATABASE
# ============================================================

def get_db():

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


def init_database():

    db = get_db()

    try:

        db.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                primary_filename TEXT NOT NULL,

                secondary_filename TEXT,

                analysis_mode TEXT NOT NULL,

                status TEXT NOT NULL,

                confidence REAL DEFAULT 0,

                result_text TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )
            """
        )

        db.commit()

    finally:

        db.close()


init_database()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return FileResponse(PROJECT_DIR / "index.html")


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    ollama_status = "offline"

    try:

        response = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=3
        )

        if response.ok:
            ollama_status = "online"

    except Exception:
        pass

    return {
        "backend": "online",
        "ollama": ollama_status,
        "model": OLLAMA_MODEL,
        "database": str(DATABASE_PATH)
    }


# ============================================================
# UPLOAD
# ============================================================

@app.post("/upload")
async def upload_analysis(

    primary_image: UploadFile = File(...),

    secondary_image: Optional[UploadFile] = File(None),

    analysis_mode: str = Form("vqa")

):

    # --------------------------------------------------------
    # MODE
    # --------------------------------------------------------

    if analysis_mode not in VALID_MODES:

        raise HTTPException(
            status_code=400,
            detail="Invalid analysis mode."
        )


    # --------------------------------------------------------
    # PRIMARY FILE
    # --------------------------------------------------------

    primary_name = Path(
        primary_image.filename or ""
    ).name

    primary_extension = Path(
        primary_name
    ).suffix.lower()

    if primary_extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail="Unsupported primary file."
        )


    # --------------------------------------------------------
    # SECONDARY FILE
    # --------------------------------------------------------

    secondary_name = None

    if secondary_image:

        secondary_name = Path(
            secondary_image.filename or ""
        ).name

        secondary_extension = Path(
            secondary_name
        ).suffix.lower()

        if secondary_extension not in ALLOWED_EXTENSIONS:

            raise HTTPException(
                status_code=400,
                detail="Unsupported secondary file."
            )


    if (
        analysis_mode in SECONDARY_REQUIRED
        and secondary_image is None
    ):

        raise HTTPException(
            status_code=400,
            detail="Secondary image is required for this mode."
        )


    # --------------------------------------------------------
    # DATABASE RECORD
    # --------------------------------------------------------

    db = get_db()

    try:

        cursor = db.execute(
            """
            INSERT INTO analyses
            (
                primary_filename,
                secondary_filename,
                analysis_mode,
                status,
                confidence
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                primary_name,
                secondary_name,
                analysis_mode,
                "uploaded",
                0.0
            )
        )

        analysis_id = cursor.lastrowid

        db.commit()

    finally:

        db.close()


    # --------------------------------------------------------
    # ANALYSIS FOLDER
    # --------------------------------------------------------

    analysis_folder = (
        UPLOAD_DIR / str(analysis_id)
    )

    analysis_folder.mkdir(
        parents=True,
        exist_ok=True
    )


    # --------------------------------------------------------
    # SAVE PRIMARY
    # --------------------------------------------------------

    primary_path = (
        analysis_folder / primary_name
    )

    try:

        with open(
            primary_path,
            "wb"
        ) as output_file:

            shutil.copyfileobj(
                primary_image.file,
                output_file
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save primary image: {e}"
        )


    # --------------------------------------------------------
    # SAVE SECONDARY
    # --------------------------------------------------------

    if secondary_image:

        secondary_path = (
            analysis_folder / secondary_name
        )

        try:

            with open(
                secondary_path,
                "wb"
            ) as output_file:

                shutil.copyfileobj(
                    secondary_image.file,
                    output_file
                )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Could not save secondary image: {e}"
            )


    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    db = get_db()

    try:

        db.execute(
            """
            UPDATE analyses
            SET status = ?
            WHERE id = ?
            """,
            (
                "initialized",
                analysis_id
            )
        )

        db.commit()

    finally:

        db.close()


    return {
        "success": True,
        "analysis_id": int(analysis_id),
        "analysis_mode": analysis_mode,
        "status": "initialized",
        "primary_image": primary_name,
        "secondary_image": secondary_name
    }


# ============================================================
# IMAGE CONVERSION
# ============================================================

def convert_image_to_png(image_path):

    extension = image_path.suffix.lower()


    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if extension == ".pdf":

        try:

            import fitz

            pdf = fitz.open(
                str(image_path)
            )

            if len(pdf) == 0:

                raise Exception(
                    "PDF contains no pages."
                )

            page = pdf[0]

            pix = page.get_pixmap(
                matrix=fitz.Matrix(
                    1.5,
                    1.5
                ),
                alpha=False
            )

            image_bytes = pix.tobytes(
                "png"
            )

            pdf.close()

            return image_bytes

        except Exception as e:

            raise Exception(
                f"PDF conversion failed: {e}"
            )


    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    try:

        from PIL import Image

        image = Image.open(
            str(image_path)
        )

        if image.mode not in (
            "RGB",
            "L"
        ):

            image = image.convert(
                "RGB"
            )

        output = BytesIO()

        image.save(
            output,
            format="PNG"
        )

        return output.getvalue()

    except Exception as e:

        raise Exception(
            f"Image conversion failed: {e}"
        )


# ============================================================
# GET ANALYSIS
# ============================================================

def find_analysis(analysis_id):

    db = get_db()

    try:

        analysis = db.execute(
            """
            SELECT *
            FROM analyses
            WHERE id = ?
            """,
            (
                int(analysis_id),
            )
        ).fetchone()

    finally:

        db.close()

    if not analysis:

        raise HTTPException(
            status_code=404,
            detail=f"Analysis {analysis_id} was not found."
        )

    return analysis


# ============================================================
# GET IMAGE BASE64
# ============================================================

def get_image_base64(image_path):

    if not image_path.exists():

        raise HTTPException(
            status_code=404,
            detail=f"Image not found: {image_path.name}"
        )

    try:

        image_bytes = convert_image_to_png(
            image_path
        )

        return base64.b64encode(
            image_bytes
        ).decode("utf-8")

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# ASK OLLAMA
# ============================================================

def ask_ollama(prompt, images):

    message = {
        "role": "user",
        "content": prompt
    }

    if images:

        message["images"] = images

    try:

        response = requests.post(

            OLLAMA_URL,

            json={
                "model": OLLAMA_MODEL,
                "messages": [message],
                "stream": False
            },

            timeout=300
        )

    except requests.exceptions.ConnectionError:

        raise HTTPException(
            status_code=503,
            detail="COSMO AI cannot connect to Ollama."
        )

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail="COSMO AI took too long to analyze the image."
        )


    if not response.ok:

        raise HTTPException(
            status_code=500,
            detail="Ollama error: " + response.text
        )


    try:

        result = response.json()

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Invalid response from Ollama."
        )


    answer = ""

    if result.get("message"):

        answer = (
            result["message"]
            .get("content", "")
            .strip()
        )

    if not answer:

        answer = (
            result.get(
                "response",
                ""
            )
            .strip()
        )

    if not answer:

        answer = (
            "COSMO AI could not generate an answer."
        )

    return answer


# ============================================================
# SAVE RESULT
# ============================================================

def save_result(
    analysis_id,
    answer,
    confidence=0.95
):

    db = get_db()

    try:

        db.execute(
            """
            UPDATE analyses
            SET
                result_text = ?,
                status = ?,
                confidence = ?
            WHERE id = ?
            """,
            (
                answer,
                "completed",
                confidence,
                int(analysis_id)
            )
        )

        db.commit()

    finally:

        db.close()


# ============================================================
# VISION Q&A
# ============================================================

@app.post("/ask")
def ask_cosmo(request: dict):

    analysis_id = request.get(
        "analysis_id"
    )

    question = str(
        request.get(
            "question",
            ""
        )
    ).strip()


    if not analysis_id:

        raise HTTPException(
            status_code=400,
            detail="analysis_id is required."
        )


    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question is empty."
        )


    analysis = find_analysis(
        analysis_id
    )


    analysis_folder = (
        UPLOAD_DIR / str(analysis["id"])
    )

    image_path = (
        analysis_folder /
        analysis["primary_filename"]
    )

    image_base64 = get_image_base64(
        image_path
    )


    prompt = f"""
You are COSMO AI, an intelligent satellite-image
analysis assistant.

Analyze the provided satellite image.

User question:
{question}

Analysis mode:
VISION Q&A

Answer using only information that can reasonably
be observed in the image.

You may discuss buildings, roads, vehicles,
water, vegetation, agriculture, land cover,
terrain, structures, coastlines and spatial patterns.

Do not invent objects.

If something is unclear, say so.

Give a concise useful answer.
"""


    answer = ask_ollama(
        prompt,
        [image_base64]
    )


    save_result(
        analysis_id,
        answer
    )


    return {
        "success": True,
        "answer": answer,
        "model": OLLAMA_MODEL,
        "analysis_id": int(analysis_id)
    }


# ============================================================
# GROUNDING
# ============================================================

@app.post("/grounding")
def grounding(request: dict):

    analysis_id = request.get(
        "analysis_id"
    )

    query = str(
        request.get(
            "query",
            ""
        )
    ).strip()


    if not analysis_id:

        raise HTTPException(
            status_code=400,
            detail="analysis_id is required."
        )


    if not query:

        raise HTTPException(
            status_code=400,
            detail="Grounding query is empty."
        )


    analysis = find_analysis(
        analysis_id
    )


    analysis_folder = (
        UPLOAD_DIR / str(analysis["id"])
    )

    image_path = (
        analysis_folder /
        analysis["primary_filename"]
    )

    image_base64 = get_image_base64(
        image_path
    )


    prompt = f"""
You are COSMO AI performing TEXT-GUIDED
GROUNDING on a satellite image.

User wants to locate:
{query}

Analyze the satellite image carefully.

Identify the most likely region or object
corresponding to the user's description.

Return:

OBJECT:
What was found.

LOCATION:
Describe where it appears in the image
using relative position such as top-left,
center, bottom-right, etc.

EVIDENCE:
Briefly explain the visual evidence.

CONFIDENCE:
Give a confidence estimate from 0 to 100%.

Do not invent objects that are not visible.
"""


    answer = ask_ollama(
        prompt,
        [image_base64]
    )


    save_result(
        analysis_id,
        answer,
        0.90
    )


    return {
        "success": True,
        "analysis_id": int(analysis_id),
        "mode": "grounding",
        "answer": answer
    }


# ============================================================
# CHANGE DETECTION
# ============================================================

@app.post("/change-detection")
def change_detection(request: dict):

    analysis_id = request.get(
        "analysis_id"
    )

    question = str(
        request.get(
            "question",
            "Identify the major changes between the two satellite observations."
        )
    ).strip()


    if not analysis_id:

        raise HTTPException(
            status_code=400,
            detail="analysis_id is required."
        )


    analysis = find_analysis(
        analysis_id
    )


    if analysis["analysis_mode"] != "change_detection":

        raise HTTPException(
            status_code=400,
            detail="Analysis is not configured for change detection."
        )


    if not analysis["secondary_filename"]:

        raise HTTPException(
            status_code=400,
            detail="Secondary image is missing."
        )


    analysis_folder = (
        UPLOAD_DIR / str(analysis["id"])
    )


    primary_path = (
        analysis_folder /
        analysis["primary_filename"]
    )

    secondary_path = (
        analysis_folder /
        analysis["secondary_filename"]
    )


    primary_base64 = get_image_base64(
        primary_path
    )

    secondary_base64 = get_image_base64(
        secondary_path
    )


    prompt = f"""
You are COSMO AI performing MULTITEMPORAL
CHANGE DETECTION.

You have been given two satellite observations.

IMAGE A:
Earlier/first observation.

IMAGE B:
Later/second observation.

User request:
{question}

Compare both images carefully.

Identify visible changes such as:

- new buildings
- demolished buildings
- road changes
- vegetation changes
- water changes
- land-cover changes
- construction
- urban expansion
- terrain or infrastructure changes

Return:

SUMMARY:
Short overall conclusion.

CHANGES:
List the important visible changes.

LOCATIONS:
Describe where the changes appear.

CONFIDENCE:
Give an estimated confidence from 0 to 100%.

Do not claim a change unless there is
visual evidence in the two images.
"""


    answer = ask_ollama(
        prompt,
        [
            primary_base64,
            secondary_base64
        ]
    )


    save_result(
        analysis_id,
        answer,
        0.90
    )


    return {
        "success": True,
        "analysis_id": int(analysis_id),
        "mode": "change_detection",
        "answer": answer
    }


# ============================================================
# OPTICAL + SAR
# ============================================================

@app.post("/optical-sar")
def optical_sar(request: dict):

    analysis_id = request.get(
        "analysis_id"
    )

    question = str(
        request.get(
            "question",
            "Analyze the optical and SAR observations together."
        )
    ).strip()


    if not analysis_id:

        raise HTTPException(
            status_code=400,
            detail="analysis_id is required."
        )


    analysis = find_analysis(
        analysis_id
    )


    if analysis["analysis_mode"] != "optical_sar":

        raise HTTPException(
            status_code=400,
            detail="Analysis is not configured for Optical + SAR."
        )


    if not analysis["secondary_filename"]:

        raise HTTPException(
            status_code=400,
            detail="SAR image is missing."
        )


    analysis_folder = (
        UPLOAD_DIR / str(analysis["id"])
    )


    optical_path = (
        analysis_folder /
        analysis["primary_filename"]
    )

    sar_path = (
        analysis_folder /
        analysis["secondary_filename"]
    )


    optical_base64 = get_image_base64(
        optical_path
    )

    sar_base64 = get_image_base64(
        sar_path
    )


    prompt = f"""
You are COSMO AI performing MULTIMODAL
OPTICAL + SAR satellite-image analysis.

IMAGE A:
Optical satellite observation.

IMAGE B:
SAR/radar observation.

User request:
{question}

Analyze both observations together.

Use the optical image for visible appearance,
color, land cover, vegetation, structures and
surface patterns.

Use SAR evidence for radar backscatter,
surface structure, roughness, moisture-related
patterns and features visible in the radar image.

Compare the two observations and explain
where their evidence agrees or differs.

Return:

SUMMARY:
Overall finding.

OPTICAL EVIDENCE:
What is visible in the optical observation.

SAR EVIDENCE:
What is visible in the SAR observation.

FUSED INTERPRETATION:
What can reasonably be concluded from both.

CONFIDENCE:
Give an estimated confidence from 0 to 100%.

Do not invent information.
"""


    answer = ask_ollama(
        prompt,
        [
            optical_base64,
            sar_base64
        ]
    )


    save_result(
        analysis_id,
        answer,
        0.90
    )


    return {
        "success": True,
        "analysis_id": int(analysis_id),
        "mode": "optical_sar",
        "answer": answer
    }


# ============================================================
# LATEST ANALYSIS
# ============================================================

@app.get("/analysis/latest")
def get_latest_analysis(
    primary_filename: Optional[str] = None
):

    db = get_db()

    try:

        if primary_filename:

            analysis = db.execute(
                """
                SELECT *
                FROM analyses
                WHERE primary_filename = ?
                ORDER BY id DESC
                LIMIT 1
                """,
                (
                    primary_filename,
                )
            ).fetchone()

        else:

            analysis = db.execute(
                """
                SELECT *
                FROM analyses
                ORDER BY id DESC
                LIMIT 1
                """
            ).fetchone()

    finally:

        db.close()


    if not analysis:

        raise HTTPException(
            status_code=404,
            detail="No uploaded analysis found."
        )


    return {
        "analysis_id": analysis["id"],
        "primary_filename": analysis["primary_filename"],
        "secondary_filename": analysis["secondary_filename"],
        "analysis_mode": analysis["analysis_mode"],
        "status": analysis["status"],
        "result_text": analysis["result_text"]
    }


# ============================================================
# GET ANALYSIS
# ============================================================

@app.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: int
):

    analysis = find_analysis(
        analysis_id
    )


    return {
        "analysis_id": analysis["id"],
        "primary_filename": analysis["primary_filename"],
        "secondary_filename": analysis["secondary_filename"],
        "analysis_mode": analysis["analysis_mode"],
        "status": analysis["status"],
        "result_text": analysis["result_text"]
    }