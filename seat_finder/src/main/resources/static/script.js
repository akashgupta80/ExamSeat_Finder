const API_BASE_URL = "https://examseat-finder.onrender.com/api";

/* ---------- HTML ELEMENTS ---------- */

const searchView = document.getElementById("searchView");
const dashboardView = document.getElementById("dashboardView");
const searchForm = document.getElementById("searchForm");
const admissionInput = document.getElementById("admissionNo");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const visitorCount = document.getElementById("visitorCount");
const searchAgainBtn = document.getElementById("searchAgainBtn");

const studentNameDisplay =
    document.getElementById("studentNameDisplay");

const admissionDisplay =
    document.getElementById("admissionDisplay");

const programBadge =
    document.getElementById("programBadge");

const upcomingExamContainer =
    document.getElementById("upcomingExamContainer");

const pastExamsContainer =
    document.getElementById("pastExamsContainer");

const togglePastExams =
    document.getElementById("togglePastExams");

const pastExamsIcon =
    document.getElementById("pastExamsIcon");

const disclaimerButton =
    document.getElementById("disclaimerButton");

const disclaimerDialog =
    document.getElementById("disclaimerDialog");

const closeDisclaimer =
    document.getElementById("closeDisclaimer");

const okDisclaimer =
    document.getElementById("okDisclaimer");


/* ---------- SHIFT TIMINGS ---------- */

const shiftTimings = {
    "1": "09:30 AM – 11:00 AM",
    "2": "11:40 AM – 01:10 PM",
    "3": "01:50 PM – 03:20 PM",
    "4": "04:00 PM – 05:30 PM"
};


/* ---------- SHIFT HELPERS ---------- */

// Supports 3, "3", "Shift 3", and "shift-3".
function getShiftNumber(shift) {

    const value = String(shift ?? "").trim();
    const match = value.match(/\d+/);

    if (match && shiftTimings[match[0]]) {
        return match[0];
    }

    return null;
}


function formatShift(shift) {

    const number = getShiftNumber(shift);

    return number
        ? `Shift ${number}`
        : (shift || "Not available");
}


function getExamTime(shift) {

    const number = getShiftNumber(shift);

    return number
        ? shiftTimings[number]
        : "Timing unavailable";
}


/* ---------- DATE HELPERS ---------- */

// Get today's date in the computer's local timezone.
function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Normalize dates to YYYY-MM-DD.
function normalizeDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    return String(dateValue).substring(0, 10);
}


// Format 2026-10-25 as 25 Oct 2026.
function formatDate(dateValue) {

    const dateString = normalizeDate(dateValue);

    const match =
        dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
        return dateValue
            ? String(dateValue)
            : "Not available";
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(
        year,
        month - 1,
        day
    );

    // Reject invalid calendar dates.
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* ---------- MESSAGE HELPER ---------- */

function showMessage(text, type = "info") {

    if (!message) {
        return;
    }

    message.textContent = text;
    message.className = `message ${type}`;
    message.hidden = !text;
}


/* ---------- SAFE HTML ELEMENT CREATION ---------- */

function createTextElement(
    tag,
    text,
    className = ""
) {

    const element =
        document.createElement(tag);

    element.textContent =
        text === null ||
        text === undefined ||
        text === ""
            ? "Not available"
            : String(text);

    if (className) {
        element.className = className;
    }

    return element;
}


/* ---------- PROGRAM BADGE ---------- */

function updateProgramBadge(record) {

    if (!programBadge) {
        return;
    }

    const details = [
        record.program,
        record.semester,
        record.section
    ]
        .filter(value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        )
        .map(value =>
            String(value).trim()
        );

    programBadge.textContent =
        details.length > 0
            ? details.join(" | ")
            : "Program details unavailable";
}


/* ---------- CREATE EXAM CARD ---------- */

function createExamCard(
    record,
    isPast = false
) {

    const card =
        document.createElement("article");

    card.className =
        "exam-result-card";


    /* Card Header */

    const headerDiv =
        document.createElement("div");

    headerDiv.className =
        "exam-card-header";

    const typeSpan =
        createTextElement(
            "span",
            isPast
                ? "COMPLETED EXAM"
                : "UPCOMING EXAM"
        );

    const dateSpan =
        createTextElement(
            "span",
            formatDate(record.examDate)
        );

    headerDiv.append(
        typeSpan,
        dateSpan
    );

    card.appendChild(headerDiv);


    /* Room and Seat */

    const topGrid =
        document.createElement("div");

    topGrid.className =
        "exam-grid-top";


    const roomBox =
        document.createElement("div");

    roomBox.className =
        "recessed-box";

    roomBox.appendChild(
        createTextElement(
            "span",
            "ROOM"
        )
    );

    roomBox.appendChild(
        createTextElement(
            "strong",
            record.roomNo || "N/A"
        )
    );


    const seatBox =
        document.createElement("div");

    seatBox.className =
        "recessed-box seat-box";

    seatBox.appendChild(
        createTextElement(
            "span",
            "SEAT"
        )
    );

    seatBox.appendChild(
        createTextElement(
            "strong",
            record.seatNo || "N/A"
        )
    );


    topGrid.append(
        roomBox,
        seatBox
    );

    card.appendChild(topGrid);


    /* Course, Date and Shift */

    const bottomGrid =
        document.createElement("div");

    bottomGrid.className =
        "exam-grid-bottom";


    // Course code
    const coursePill =
        document.createElement("div");

    coursePill.className =
        "info-pill";

    coursePill.appendChild(
        createTextElement(
            "span",
            "COURSE CODE"
        )
    );

    coursePill.appendChild(
        createTextElement(
            "strong",
            record.courseCode || "N/A"
        )
    );


    // Date
    const datePill =
        document.createElement("div");

    datePill.className =
        "info-pill";

    datePill.appendChild(
        createTextElement(
            "span",
            "DATE"
        )
    );

    datePill.appendChild(
        createTextElement(
            "strong",
            formatDate(record.examDate)
        )
    );


    // Shift and timing
    const shiftPill =
        document.createElement("div");

    shiftPill.className =
        "info-pill";

    shiftPill.appendChild(
        createTextElement(
            "span",
            "SHIFT & TIMING"
        )
    );

    const shiftNumber =
        getShiftNumber(record.shift);

    const shiftText =
        shiftNumber
            ? `${formatShift(record.shift)} (${getExamTime(record.shift)})`
            : formatShift(record.shift);

    shiftPill.appendChild(
        createTextElement(
            "strong",
            shiftText
        )
    );


    bottomGrid.append(
        coursePill,
        datePill,
        shiftPill
    );

    card.appendChild(bottomGrid);

    return card;
}


/* ---------- NO UPCOMING EXAMS CARD ---------- */

function renderNoUpcomingExamsCard() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "empty-exam-card";


    const iconBox =
        document.createElement("div");

    iconBox.className =
        "empty-icon-box";


    const icon =
        document.createElement("i");

    icon.className =
        "fa-regular fa-calendar-days";

    icon.setAttribute(
        "aria-hidden",
        "true"
    );

    iconBox.appendChild(icon);


    const heading =
        createTextElement(
            "h3",
            "No Upcoming Examinations"
        );


    const description =
        createTextElement(
            "p",
            "No examinations are currently scheduled. Your examination details will appear here once the university publishes the official schedule."
        );


    wrapper.append(
        iconBox,
        heading,
        description
    );

    return wrapper;
}


/* ---------- VISITOR COUNTER ---------- */

// Fetching the count does not increment it.
async function loadVisitorCount() {

    if (!visitorCount) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/visitors`
            );

        if (!response.ok) {
            throw new Error(
                "Visitor API unavailable"
            );
        }

        const data =
            await response.json();

        const count =
            typeof data === "number"
                ? data
                : data.totalVisitors ??
                  data.visitorCount ??
                  data.count;

        visitorCount.textContent =
            count !== undefined &&
            count !== null &&
            Number.isFinite(Number(count))
                ? Number(count).toLocaleString("en-IN")
                : "--";

    } catch (error) {

        visitorCount.textContent = "--";

        console.warn(
            "Visitor count unavailable:",
            error.message
        );
    }
}


// Increment only after a successful search with records.
async function recordSuccessfulSearch() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/visitors/visit`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to update visitor count"
            );
        }

        await loadVisitorCount();

    } catch (error) {

        console.warn(
            "Visitor count update failed:",
            error.message
        );
    }
}


/* ---------- PAST EXAMS ACCORDION ---------- */

let isPastExamsOpen = false;


function resetPastExamsAccordion() {

    isPastExamsOpen = false;

    if (pastExamsContainer) {
        pastExamsContainer.hidden = true;
    }

    if (pastExamsIcon) {
        pastExamsIcon.className =
            "fa-solid fa-chevron-up";
    }
}


/* ---------- SEARCH FORM ---------- */

if (searchForm) {

    searchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const admissionNo =
                admissionInput.value.trim();


            if (!admissionNo) {

                showMessage(
                    "Please enter your admission number.",
                    "error"
                );

                admissionInput.focus();

                return;
            }


            // Reset old results and accordion state.
            resetPastExamsAccordion();


            searchButton.disabled = true;

            searchButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> ' +
                '<span>Searching...</span>';


            showMessage(
                "Searching for your examination details...",
                "info"
            );


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/exam-seats/${encodeURIComponent(admissionNo)}`
                    );


                if (!response.ok) {

                    if (response.status === 404) {

                        throw new Error(
                            "Admission number not found."
                        );
                    }

                    throw new Error(
                        "Unable to search right now. Please try again."
                    );
                }


                const records =
                    await response.json();


                if (
                    !Array.isArray(records) ||
                    records.length === 0
                ) {

                    showMessage(
                        "No examination records found. Please check your admission number.",
                        "error"
                    );

                    return;
                }


                /* Student Information */

                const firstRecord =
                    records[0];


                if (studentNameDisplay) {

                    studentNameDisplay.textContent =
                        firstRecord.studentName ||
                        "Student Details";
                }


                if (admissionDisplay) {

                    admissionDisplay.textContent =
                        firstRecord.admissionNo ||
                        admissionNo;
                }


                updateProgramBadge(
                    firstRecord
                );


                /* Separate Upcoming and Completed Exams */

                const todayStr =
                    getTodayString();


                const upcomingExams =
                    records
                        .filter(record => {

                            const examDate =
                                normalizeDate(
                                    record.examDate
                                );

                            return (
                                examDate &&
                                examDate >= todayStr
                            );
                        })
                        .sort((a, b) =>
                            normalizeDate(
                                a.examDate
                            ).localeCompare(
                                normalizeDate(
                                    b.examDate
                                )
                            )
                        );


                const pastExams =
                    records
                        .filter(record => {

                            const examDate =
                                normalizeDate(
                                    record.examDate
                                );

                            return (
                                examDate &&
                                examDate < todayStr
                            );
                        })
                        .sort((a, b) =>
                            normalizeDate(
                                b.examDate
                            ).localeCompare(
                                normalizeDate(
                                    a.examDate
                                )
                            )
                        );


                /* Clear Previous Results */

                if (upcomingExamContainer) {
                    upcomingExamContainer.replaceChildren();
                }

                if (pastExamsContainer) {
                    pastExamsContainer.replaceChildren();
                }


                /* Render Upcoming Exams */

                if (upcomingExamContainer) {

                    if (upcomingExams.length > 0) {

                        upcomingExams.forEach(
                            record => {

                                upcomingExamContainer.appendChild(
                                    createExamCard(
                                        record,
                                        false
                                    )
                                );
                            }
                        );

                    } else {

                        upcomingExamContainer.appendChild(
                            renderNoUpcomingExamsCard()
                        );
                    }
                }


                /* Render Completed Exams */

                if (pastExams.length > 0) {

                    if (pastExamsContainer) {

                        pastExams.forEach(
                            record => {

                                pastExamsContainer.appendChild(
                                    createExamCard(
                                        record,
                                        true
                                    )
                                );
                            }
                        );
                    }


                    if (togglePastExams) {

                        togglePastExams.hidden = false;
                        togglePastExams.style.display =
                            "flex";
                    }

                } else {

                    if (togglePastExams) {

                        togglePastExams.hidden = true;
                        togglePastExams.style.display =
                            "none";
                    }
                }


                /* Show Dashboard */

                if (searchView) {
                    searchView.hidden = true;
                }

                if (dashboardView) {
                    dashboardView.hidden = false;
                }


                showMessage("");


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                // Count only successful searches returning records.
                await recordSuccessfulSearch();


            } catch (error) {

                console.error(
                    "Search error:",
                    error
                );


                if (
                    error instanceof TypeError ||
                    error.message.includes("Failed to fetch")
                ) {

                    showMessage(
                        "Cannot connect to the server. Please make sure Spring Boot is running.",
                        "error"
                    );

                } else {

                    showMessage(
                        error.message,
                        "error"
                    );
                }


            } finally {

                searchButton.disabled = false;

                searchButton.innerHTML =
                    '<i class="fa-solid fa-magnifying-glass"></i> ' +
                    '<span>Find My Seat</span>';
            }
        }
    );
}


/* ---------- SEARCH AGAIN BUTTON ---------- */

if (searchAgainBtn) {

    searchAgainBtn.addEventListener(
        "click",
        function () {

            if (dashboardView) {
                dashboardView.hidden = true;
            }

            if (searchView) {
                searchView.hidden = false;
            }


            if (admissionInput) {
                admissionInput.value = "";
            }


            if (upcomingExamContainer) {
                upcomingExamContainer.replaceChildren();
            }

            if (pastExamsContainer) {
                pastExamsContainer.replaceChildren();
            }


            if (programBadge) {
                programBadge.textContent =
                    "Student Program";
            }

            if (studentNameDisplay) {
                studentNameDisplay.textContent = "";
            }

            if (admissionDisplay) {
                admissionDisplay.textContent = "";
            }


            resetPastExamsAccordion();

            showMessage("");


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            if (admissionInput) {
                admissionInput.focus();
            }
        }
    );
}


/* ---------- TOGGLE PAST EXAMS ---------- */

if (togglePastExams) {

    togglePastExams.addEventListener(
        "click",
        function () {

            isPastExamsOpen =
                !isPastExamsOpen;


            if (pastExamsContainer) {

                pastExamsContainer.hidden =
                    !isPastExamsOpen;
            }


            if (pastExamsIcon) {

                pastExamsIcon.className =
                    isPastExamsOpen
                        ? "fa-solid fa-chevron-down"
                        : "fa-solid fa-chevron-up";
            }
        }
    );
}


/* ---------- DISCLAIMER MODAL ---------- */

if (
    disclaimerButton &&
    disclaimerDialog
) {

    disclaimerButton.addEventListener(
        "click",
        function () {
            disclaimerDialog.showModal();
        }
    );
}


if (closeDisclaimer && disclaimerDialog) {

    closeDisclaimer.addEventListener(
        "click",
        function () {
            disclaimerDialog.close();
        }
    );
}


if (okDisclaimer && disclaimerDialog) {

    okDisclaimer.addEventListener(
        "click",
        function () {
            disclaimerDialog.close();
        }
    );
}


// Close when the user clicks outside the dialog content.
if (disclaimerDialog) {

    disclaimerDialog.addEventListener(
        "click",
        function (event) {

            if (event.target === disclaimerDialog) {
                disclaimerDialog.close();
            }
        }
    );
}

/* =========================================================
   FEEDBACK MODAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ---------- ELEMENTS ---------- */

    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedback = document.getElementById("openFeedback");
    const closeFeedback = document.getElementById("closeFeedback");

    const feedbackForm = document.getElementById("feedbackForm");
    const feedbackFormView = document.getElementById("feedbackFormView");
    const feedbackSuccessView = document.getElementById("feedbackSuccessView");
    const feedbackDoneBtn = document.getElementById("feedbackDoneBtn");

    const ratingInput = document.getElementById("ratingInput");
    const ratingLabel = document.getElementById("ratingLabel");

    // Updated IDs from the corrected HTML
    const commentInput = document.getElementById("comment");
    const userNameInput = document.getElementById("userName");
    const feedbackError = document.getElementById("feedbackError");

    // Category section is currently commented out in HTML
    const categoryInput = document.getElementById("categoryInput");

    const stars = document.querySelectorAll(".star-btn");
    const categoryPills = document.querySelectorAll(".category-pill");

    if (!feedbackModal || !openFeedback || !feedbackForm) {
        console.error("Feedback modal: required HTML elements are missing.");
        return;
    }

    /* ---------- ERROR MESSAGE ---------- */

    function showFeedbackError(text, color = "#dc2626") {
        if (feedbackError) {
            feedbackError.textContent = text;
            feedbackError.style.color = color;
        }
    }

    function clearFeedbackError() {
        showFeedbackError("");
    }

    /* ---------- OPEN MODAL ---------- */

    function openFeedbackPopup(event) {
        if (event) event.preventDefault();

        if (feedbackFormView) feedbackFormView.hidden = false;
        if (feedbackSuccessView) feedbackSuccessView.hidden = true;

        feedbackModal.classList.add("show");
        feedbackModal.setAttribute("aria-hidden", "false");

        clearFeedbackError();
    }

    openFeedback.addEventListener("click", openFeedbackPopup);

    /* ---------- RESET FORM ---------- */

    function resetFeedbackForm() {
        feedbackForm.reset();

        if (ratingInput) ratingInput.value = "";
        if (ratingLabel) ratingLabel.textContent = "Select rating";

        stars.forEach(star => {
            star.classList.remove("active", "hover");
        });

        categoryPills.forEach(pill => {
            pill.classList.remove("active");
        });

        // Only set a category if the category section exists
        if (categoryInput && categoryPills.length > 0) {
            categoryPills[0].classList.add("active");
            categoryInput.value =
                categoryPills[0].getAttribute("data-value") || "";
        }

        clearFeedbackError();
    }

    /* ---------- CLOSE MODAL ---------- */

    function closeFeedbackPopup() {
        feedbackModal.classList.remove("show");
        feedbackModal.setAttribute("aria-hidden", "true");

        // Reset after the closing animation
        window.setTimeout(() => {
            if (feedbackFormView) feedbackFormView.hidden = false;
            if (feedbackSuccessView) feedbackSuccessView.hidden = true;

            resetFeedbackForm();
        }, 200);
    }

    if (closeFeedback) {
        closeFeedback.addEventListener("click", closeFeedbackPopup);
    }

    if (feedbackDoneBtn) {
        feedbackDoneBtn.addEventListener("click", closeFeedbackPopup);
    }

    feedbackModal.addEventListener("click", event => {
        if (event.target === feedbackModal) {
            closeFeedbackPopup();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            feedbackModal.classList.contains("show")
        ) {
            closeFeedbackPopup();
        }
    });

    /* ---------- STAR RATING ---------- */

    const ratingTexts = {
        1: "Very Poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent"
    };

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = Number(star.getAttribute("data-value"));

            if (!Number.isInteger(value) || value < 1 || value > 5) {
                return;
            }

            if (ratingInput) ratingInput.value = String(value);
            if (ratingLabel) ratingLabel.textContent = ratingTexts[value];

            stars.forEach(item => {
                const starValue = Number(item.getAttribute("data-value"));
                item.classList.toggle("active", starValue <= value);
            });

            clearFeedbackError();
        });

        star.addEventListener("mouseenter", () => {
            const value = Number(star.getAttribute("data-value"));

            stars.forEach(item => {
                const starValue = Number(item.getAttribute("data-value"));
                item.classList.toggle("hover", starValue <= value);
            });
        });

        star.addEventListener("mouseleave", () => {
            stars.forEach(item => item.classList.remove("hover"));
        });
    });

    /* ---------- CATEGORY PILLS (OPTIONAL) ---------- */

    if (categoryInput && categoryPills.length > 0) {
        categoryPills[0].classList.add("active");
        categoryInput.value =
            categoryPills[0].getAttribute("data-value") || "";

        categoryPills.forEach(pill => {
            pill.addEventListener("click", () => {
                categoryPills.forEach(item => {
                    item.classList.remove("active");
                });

                pill.classList.add("active");
                categoryInput.value =
                    pill.getAttribute("data-value") || "";

                clearFeedbackError();
            });
        });
    }

    /* ---------- SUBMIT FEEDBACK ---------- */

    feedbackForm.addEventListener("submit", async event => {
        event.preventDefault();

        const submitButton =
            feedbackForm.querySelector(".feedback-submit");

        // Read values from the correct HTML IDs
        const rating = Number(ratingInput?.value || 0);
        const comment = String(commentInput?.value ?? "").trim();
        const userName = String(userNameInput?.value ?? "").trim();

        // Validate rating
        if (!ratingInput?.value || rating < 1 || rating > 5) {
            showFeedbackError("Please select a rating.");
            return;
        }

        // Validate comments
        if (!comment) {
            showFeedbackError("Please enter your comments.");
            commentInput?.focus();
            return;
        }

        // Category is optional in the UI.
        // "General" provides a non-empty value if the backend requires it.
        const category =
            String(categoryInput?.value ?? "").trim() || "General";

        const feedback = {
            rating: Number(ratingInput.value),
            comment: commentInput.value.trim(),
            name: (userNameInput.value || "").trim() || null
        };

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        clearFeedbackError();

        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                const errorText = await response.text();

                console.error("Feedback API error:", {
                    status: response.status,
                    response: errorText
                });

                throw new Error(
                    `Server returned ${response.status}. ${errorText}`
                );
            }

            // Show success only after the server accepts the feedback
            if (feedbackFormView) feedbackFormView.hidden = true;
            if (feedbackSuccessView) feedbackSuccessView.hidden = false;

        } catch (error) {
            console.error("Feedback submission failed:", error);

            showFeedbackError(
                "Unable to submit feedback. Please try again."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Feedback";
            }
        }
    });

});




/* ---------- INITIAL PAGE LOAD ---------- */

loadVisitorCount();
