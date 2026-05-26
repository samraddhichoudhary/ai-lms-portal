from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    instructor = Column(String, default="Dr. Alex Smith")

    # This sets up a relationship. If we fetch a course, we can easily pull its lessons!
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)  # This will store the text/lecture content for students to read
    course_id = Column(Integer, ForeignKey("courses.id"))

    # Links back to the parent course table
    course = relationship("Course", back_populates="lessons")