from pydantic import BaseModel
from typing import List, Optional

# --- Lesson Schemas ---
class LessonCreate(BaseModel):
    title: str
    content: str

class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    course_id: int

    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseCreate(BaseModel):
    title: str
    description: str

class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    instructor: str
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True
        