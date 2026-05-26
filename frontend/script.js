const API_URL = "http://127.0.0.1:8000/api";
let currentCourseId = null;

// --- DOM ELEMENTS ---
const btnCatalog = document.getElementById("btn-catalog");
const btnStudio = document.getElementById("btn-studio");
const btnBackToCatalog = document.getElementById("btn-back-to-catalog");
const btnSaveLesson = document.getElementById("btn-save-lesson");

const catalogView = document.getElementById("catalog-view");
const studioView = document.getElementById("studio-view");
const lessonView = document.getElementById("lesson-view");

const viewTitle = document.getElementById("view-title");
const viewSubtitle = document.getElementById("view-subtitle");
const courseGridContainer = document.getElementById("course-grid-container");
const courseForm = document.getElementById("course-form");

const lessonListContainer = document.getElementById("lesson-list-container");
const activeLessonTitle = document.getElementById("active-lesson-title");
const activeLessonContent = document.getElementById("active-lesson-content");

// --- VIEW SWITCHERS ---
function showView(view) {
    catalogView.classList.add("hidden");
    studioView.classList.add("hidden");
    lessonView.classList.add("hidden");
    
    btnCatalog.classList.remove("active");
    btnStudio.classList.remove("active");

    if (view === "catalog") {
        catalogView.classList.remove("hidden");
        btnCatalog.classList.add("active");
        viewTitle.innerText = "Available Courses";
        viewSubtitle.innerText = "Explore academic tracks and curriculum content live from the SQL database.";
        loadCourses();
    } else if (view === "studio") {
        studioView.classList.remove("hidden");
        btnStudio.classList.add("active");
        viewTitle.innerText = "Instructor Studio";
        viewSubtitle.innerText = "Create, edit, and expand academic courses effortlessly in real-time.";
    } else if (view === "lessons") {
        lessonView.classList.remove("hidden");
        viewTitle.innerText = "Course Workspace";
        viewSubtitle.innerText = "Deep dive into course materials and active lesson syllabi panels.";
    }
}

// Event Listeners for Tab Navigation
btnCatalog.addEventListener("click", () => showView("catalog"));
btnStudio.addEventListener("click", () => showView("studio"));
btnBackToCatalog.addEventListener("click", () => showView("catalog"));

// --- FETCH DATA: LOAD ALL COURSES ---
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const courses = await response.json();
        
        courseGridContainer.innerHTML = "";
        
        if (courses.length === 0) {
            courseGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No courses found. Head over to the Instructor Studio to publish your first course track!</p>`;
            return;
        }

        courses.forEach(course => {
            const card = document.createElement("div");
            card.className = "course-card";
            card.innerHTML = `
                <div>
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                </div>
                <div>
                    <div class="meta">👨‍🏫 ${course.instructor} • ${course.lessons.length} Modules</div>
                    <button class="action-btn" style="margin-top: 1rem; width: 100%;" onclick="openCourseWorkspace(${course.id})">Study Track →</button>
                </div>
            `;
            courseGridContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading course catalog records:", error);
    }
}

// --- FETCH DATA: CREATE NEW COURSE ---
courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("course-title").value;
    const description = document.getElementById("course-desc").value;

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            courseForm.reset();
            alert("Course track successfully published to database!");
            showView("catalog");
        }
    } catch (error) {
        console.error("Error writing new course record:", error);
    }
});

// --- FETCH DATA: OPEN COURSE WORKSPACE ---
async function openCourseWorkspace(courseId) {
    currentCourseId = courseId;
    showView("lessons");
    await loadLessonsList();
    
    // Reset workspace view display state
    activeLessonTitle.innerText = "Select a Lesson Module";
    activeLessonContent.innerText = "Please select a lesson module from the curriculum checklist panel on the left to begin learning structure.";
}

async function loadLessonsList() {
    try {
        const response = await fetch(`${API_URL}/courses/${currentCourseId}`);
        const course = await response.json();
        
        lessonListContainer.innerHTML = "";
        
        course.lessons.forEach(lesson => {
            const li = document.createElement("li");
            li.className = "lesson-item";
            li.innerText = lesson.title;
            li.onclick = () => {
                activeLessonTitle.innerText = lesson.title;
                activeLessonContent.innerText = lesson.content;
            };
            lessonListContainer.appendChild(li);
        });
    } catch (error) {
        console.error("Error reading lesson indexes:", error);
    }
}

// --- FETCH DATA: ADD LESSON MODULE TO COURSE ---
btnSaveLesson.addEventListener("click", async () => {
    const titleInput = document.getElementById("new-lesson-title");
    const contentInput = document.getElementById("new-lesson-content");

    const title = titleInput.value;
    const content = contentInput.value;

    if (!title || !content) {
        alert("Please enter both a module title and class content.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/courses/${currentCourseId}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            titleInput.value = "";
            contentInput.value = "";
            await loadLessonsList();
        }
    } catch (error) {
        console.error("Error creating new lesson asset:", error);
    }
});

// Initial boot initialization
loadCourses();