from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
from . import models, schemas

# Initialize the database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI LMS Portal Backend")

# Enable CORS so your local HTML frontend files can safely request database records
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- COURSE ENDPOINTS ---

@app.get("/api/courses", response_model=List[schemas.CourseResponse])
def get_all_courses(db: Session = Depends(get_db)):
    """Fetch every course catalog record stored in the SQL database."""
    return db.query(models.Course).all()

@app.get("/api/courses/{course_id}", response_model=schemas.CourseResponse)
def get_single_course(course_id: int, db: Session = Depends(get_db)):
    """Fetch details and full lesson lineups for a specific individual course."""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.post("/api/courses", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    """Add an entirely new course catalog structure into the SQL database."""
    new_course = models.Course(title=course.title, description=course.description)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

# --- LESSON ENDPOINTS ---

@app.post("/api/courses/{course_id}/lessons", response_model=schemas.LessonResponse)
def create_lesson_for_course(course_id: int, lesson: schemas.LessonCreate, db: Session = Depends(get_db)):
    """Inject a new text lesson module directly into a target course."""
    # Ensure parent course exists first
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Target course not found")
        
    new_lesson = models.Lesson(title=lesson.title, content=lesson.content, course_id=course_id)
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson