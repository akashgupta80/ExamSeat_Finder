
const isLocalFrontend =
    location.protocol === "file:" ||
    (
        ["localhost", "127.0.0.1"].includes(location.hostname) &&
        location.port !== "8080"
    );

const API_BASE_URL = isLocalFrontend
    ? "http://localhost:8080/api"
    : "/api";

console.log("Seat Finder API:", API_BASE_URL);



/* ---------- ELEMENTS ---------- */

const searchView = document.getElementById("searchView");
const dashboardView = document.getElementById("dashboardView");
const searchForm = document.getElementById("searchForm");
const admissionInput = document.getElementById("admissionNo");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const visitorCount = document.getElementById("visitorCount");
const onlineCount = document.getElementById("onlineCount");
const onlineLabel = document.getElementById("onlineLabel");
const searchAgainBtn = document.getElementById("searchAgainBtn");

const studentNameDisplay = document.getElementById("studentNameDisplay");
const admissionDisplay = document.getElementById("admissionDisplay");
const programBadge = document.getElementById("programBadge");
const studentAvatar = document.getElementById("studentAvatar");

const upcomingExamContainer = document.getElementById("upcomingExamContainer");
const pastExamsContainer = document.getElementById("pastExamsContainer");
const togglePastExams = document.getElementById("togglePastExams");
const upcomingCount = document.getElementById("upcomingCount");
const pastCount = document.getElementById("pastCount");

const disclaimerButton = document.getElementById("disclaimerButton");
const disclaimerDialog = document.getElementById("disclaimerDialog");
const closeDisclaimer = document.getElementById("closeDisclaimer");
const okDisclaimer = document.getElementById("okDisclaimer");


const shiftTimings = {
    "1": "09:30 AM – 11:00 AM",
    "2": "11:40 AM – 01:10 PM",
    "3": "01:50 PM – 03:20 PM",
    "4": "04:00 PM – 05:30 PM"
};


/* ---------- SHIFT HELPERS ---------- */

// Supports 3, "3", "Shift 3", and "shift-3".
function getShiftNumber(shift) {
    const match = String(shift ?? "").trim().match(/\d+/);
    return match && shiftTimings[match[0]] ? match[0] : null;
}

function formatShift(shift) {
    const number = getShiftNumber(shift);
    return number ? `Shift ${number}` : (shift || "Not available");
}

function getExamTime(shift) {
    const number = getShiftNumber(shift);
    return number ? shiftTimings[number] : "Timing unavailable";
}


/* ---------- DATE HELPERS ---------- */

// Today's date in the device's local timezone (YYYY-MM-DD).
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeDate(dateValue) {
    return dateValue ? String(dateValue).substring(0, 10) : "";
}

// 2026-10-25 -> 25 Oct 2026
function formatDate(dateValue) {
    const dateString = normalizeDate(dateValue);
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
        return dateValue ? String(dateValue) : "Not available";
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

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
    if (!message) return;
    message.textContent = text;
    message.className = `message ${type}`;
    message.hidden = !text;
}


/* ---------- SAFE ELEMENT HELPERS (no innerHTML with data) ---------- */

function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);

    element.textContent =
        text === null || text === undefined || text === ""
            ? "Not available"
            : String(text);

    if (className) element.className = className;
    return element;
}

function createIcon(classes) {
    const icon = document.createElement("i");
    icon.className = classes;
    icon.setAttribute("aria-hidden", "true");
    return icon;
}


/* ---------- PROGRAM BADGE ---------- */

function updateProgramBadge(record) {
    if (!programBadge) return;

    const details = [record.program, record.semester, record.section]
        .filter(v => v !== null && v !== undefined && String(v).trim() !== "")
        .map(v => String(v).trim());

    programBadge.textContent =
        details.length > 0 ? details.join(" | ") : "Program details unavailable";
}


/* =========================================================
   EXAM CARD (ticket layout)
   ========================================================= */

// Big Room / Seat cell
function createCell(iconClasses, label, value, variant) {
    const cell = document.createElement("div");
    cell.className = `seat-cell ${variant}`;

    const labelRow = document.createElement("span");
    labelRow.className = "cell-label";
    labelRow.append(createIcon(iconClasses), label);

    cell.append(labelRow, createTextElement("strong", value, "cell-value"));
    return cell;
}

// Course code / Shift row
function createDetail(iconClasses, label, value, sub = "") {
    const item = document.createElement("div");
    item.className = "detail";

    const iconBox = document.createElement("span");
    iconBox.className = "detail-icon";
    iconBox.appendChild(createIcon(iconClasses));

    const text = document.createElement("div");
    text.className = "detail-text";
    text.append(
        createTextElement("span", label, "detail-label"),
        createTextElement("strong", value, "detail-value")
    );

    if (sub) {
        text.appendChild(createTextElement("span", sub, "detail-sub"));
    }

    item.append(iconBox, text);
    return item;
}

function createExamCard(record, isPast = false) {
    const card = document.createElement("article");
    card.className = isPast
        ? "exam-card ticket is-past"
        : "exam-card ticket is-upcoming";

    /* Header */
    const header = document.createElement("div");
    header.className = "exam-card-header";

    const status = document.createElement("span");
    status.className = "status-chip";
    status.append(
        createIcon(isPast ? "fa-solid fa-circle-check" : "fa-solid fa-circle-dot"),
        isPast ? "Completed exam" : "Upcoming exam"
    );

    header.append(
        status,
        createTextElement("span", formatDate(record.examDate), "exam-date")
    );
    card.appendChild(header);

    /* Room and Seat */
    const topGrid = document.createElement("div");
    topGrid.className = "exam-grid-top";
    topGrid.append(
        createCell("fa-solid fa-building", "Room", record.roomNo || "N/A", "cell-room"),
        createCell("fa-solid fa-chair", "Seat", record.seatNo || "N/A", "cell-seat")
    );
    card.appendChild(topGrid);

    /* Divider (decoration) */
    const divider = document.createElement("div");
    divider.className = "ticket-divider";
    divider.setAttribute("aria-hidden", "true");
    card.appendChild(divider);

    /* Course code and Shift */
    const bottomGrid = document.createElement("div");
    bottomGrid.className = "exam-grid-bottom";
    bottomGrid.append(
        createDetail("fa-solid fa-book-open", "Course code", record.courseCode || "N/A"),
        createDetail(
            "fa-solid fa-clock",
            "Shift",
            formatShift(record.shift),
            getShiftNumber(record.shift) ? getExamTime(record.shift) : ""
        )
    );
    card.appendChild(bottomGrid);

    return card;
}


/* ---------- NO UPCOMING EXAMS CARD ---------- */

function renderNoUpcomingExamsCard() {
    const wrapper = document.createElement("div");
    wrapper.className = "empty-exam-card";

    const iconBox = document.createElement("div");
    iconBox.className = "empty-icon-box";
    iconBox.appendChild(createIcon("fa-regular fa-calendar-days"));

    wrapper.append(
        iconBox,
        createTextElement("h3", "No Upcoming Examinations"),
        createTextElement(
            "p",
            "No examinations are currently scheduled. Your examination details will appear here once the university publishes the official schedule."
        )
    );

    return wrapper;
}


/* ---------- AVATAR + COUNTS ---------- */

function syncDashboardUi() {
    if (studentAvatar && studentNameDisplay) {
        const parts = studentNameDisplay.textContent
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        studentAvatar.textContent =
            parts.length === 0
                ? "?"
                : (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
    }

    const upcomingTotal = upcomingExamContainer
        ? upcomingExamContainer.querySelectorAll(".exam-card").length
        : 0;

    const pastTotal = pastExamsContainer
        ? pastExamsContainer.querySelectorAll(".exam-card").length
        : 0;

    if (upcomingCount) {
        upcomingCount.textContent = String(upcomingTotal);
        upcomingCount.hidden = upcomingTotal === 0;
    }

    if (pastCount) {
        pastCount.textContent = String(pastTotal);
    }
}


/* =========================================================
   VISITOR COUNTER + LIVE "STUDENTS ONLINE"
*/

const HEARTBEAT_MS = 15000;
let memoryVisitorId = null;     // fallback if localStorage is blocked


function generateId() {
    if (window.crypto && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);

    if (window.crypto && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}


function getVisitorId() {
    const KEY = "seatFinderVisitorId";
    const VALID = /^[A-Za-z0-9-]{8,64}$/;

    try {
        let id = localStorage.getItem(KEY);

        if (!id || !VALID.test(id)) {
            id = generateId();
            localStorage.setItem(KEY, id);
        }

        return id;

    } catch (error) {
        if (!memoryVisitorId) memoryVisitorId = generateId();
        return memoryVisitorId;
    }
}

const VISITOR_ID = getVisitorId();


async function postJson(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}


function showVisitorTotal(count) {
    if (!visitorCount) return;

    visitorCount.textContent =
        count !== undefined && count !== null && Number.isFinite(Number(count))
            ? Number(count).toLocaleString("en-IN")
            : "--";
}


function showOnlineTotal(count) {
    if (!onlineCount) return;

    const valid =
        count !== undefined && count !== null && Number.isFinite(Number(count));

    onlineCount.textContent = valid ? String(Number(count)) : "--";

    if (onlineLabel && valid) {
        onlineLabel.textContent =
            Number(count) === 1 ? "student online" : "students online";
    }
}


// Read-only: fetching never increments.
async function loadVisitorCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors`);
        if (!response.ok) throw new Error("Visitor API unavailable");

        const data = await response.json();

        showVisitorTotal(
            typeof data === "number"
                ? data
                : data.totalVisitors ?? data.visitorCount ?? data.count
        );

    } catch (error) {
        showVisitorTotal(null);
        console.warn("Visitor count unavailable:", error.message);
    }
}


// Runs once per page load. The server ignores ids it already knows.
// Counts one page visit whenever the website is opened or refreshed.
async function registerVisit() {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors/visit`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        showVisitorTotal(data.totalVisitors);

    } catch (error) {
        console.warn("Visit registration failed:", error.message);
        await loadVisitorCount();
    }
}


// Keeps this browser in the "online" list (skipped while the tab is hidden).
async function sendHeartbeat() {
    if (document.hidden) return;

    try {
        const data = await postJson("/visitors/online", { sessionId: VISITOR_ID });
        showOnlineTotal(data.studentsOnline);
    } catch (error) {
        showOnlineTotal(null);
        console.warn("Online heartbeat failed:", error.message);
    }
}


function leaveSite() {
    try {
        navigator.sendBeacon(
            `${API_BASE_URL}/visitors/offline`,
            new Blob(
                [JSON.stringify({ sessionId: VISITOR_ID })],
                { type: "application/json" }
            )
        );
    } catch (error) {
        /* nothing to do – the server times the session out anyway */
    }
}


function startTracking() {
    registerVisit();
    sendHeartbeat();

    setInterval(sendHeartbeat, HEARTBEAT_MS);

    // Tab becomes visible again -> refresh immediately
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) sendHeartbeat();
    });

    // Coming back from the browser's back/forward cache
    window.addEventListener("pageshow", event => {
        if (event.persisted) sendHeartbeat();
    });

    // Tab / browser closed
    window.addEventListener("pagehide", leaveSite);
}


/* ---------- PAST EXAMS ACCORDION ---------- */

let isPastExamsOpen = false;

function setPastExamsOpen(open) {
    isPastExamsOpen = open;

    if (pastExamsContainer) pastExamsContainer.hidden = !open;

    // CSS rotates the chevron from aria-expanded (no class swapping needed)
    if (togglePastExams) {
        togglePastExams.setAttribute("aria-expanded", String(open));
    }
}

if (togglePastExams) {
    togglePastExams.addEventListener("click", () => {
        setPastExamsOpen(!isPastExamsOpen);
    });
}


/* ---------- SEARCH FORM ---------- */

function dateKey(record) {
    return normalizeDate(record.examDate);
}

function shiftKey(record) {
    return getShiftNumber(record.shift) || "9";
}

if (searchForm) {
    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (searchButton.disabled) return;     // ignore double clicks

        const admissionNo = admissionInput.value.trim();

        if (!admissionNo) {
            showMessage("Please enter your admission number.", "error");
            admissionInput.focus();
            return;
        }

        setPastExamsOpen(false);

        searchButton.disabled = true;
        searchButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> <span>Searching...</span>';

        showMessage("Searching for your examination details...", "info");

        try {
            const response = await fetch(
                `${API_BASE_URL}/exam-seats?admissionNo=${encodeURIComponent(admissionNo)}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Admission number not found.");
                }
                if (response.status === 400) {
                    throw new Error("Please enter a valid admission number.");
                }
                throw new Error("Unable to search right now. Please try again.");
            }

            const records = await response.json();

            if (!Array.isArray(records) || records.length === 0) {
                showMessage(
                    "No examination records found. Please check your admission number.",
                    "error"
                );
                return;
            }

            /* Student information */
            const firstRecord = records[0];

            if (studentNameDisplay) {
                studentNameDisplay.textContent =
                    firstRecord.studentName || "Student Details";
            }

            if (admissionDisplay) {
                admissionDisplay.textContent =
                    firstRecord.admissionNo || admissionNo;
            }

            updateProgramBadge(firstRecord);

            /* Upcoming vs completed.
               FIX: records with no exam date used to disappear completely;
               they now show under Upcoming (at the end). */
            const todayStr = getTodayString();

            const upcomingExams = records
                .filter(r => !dateKey(r) || dateKey(r) >= todayStr)
                .sort((a, b) =>
                    (dateKey(a) || "9999-99-99").localeCompare(dateKey(b) || "9999-99-99") ||
                    shiftKey(a).localeCompare(shiftKey(b))
                );

            const pastExams = records
                .filter(r => dateKey(r) && dateKey(r) < todayStr)
                .sort((a, b) =>
                    dateKey(b).localeCompare(dateKey(a)) ||
                    shiftKey(a).localeCompare(shiftKey(b))
                );

            if (upcomingExamContainer) upcomingExamContainer.replaceChildren();
            if (pastExamsContainer) pastExamsContainer.replaceChildren();

            if (upcomingExamContainer) {
                if (upcomingExams.length > 0) {
                    upcomingExams.forEach(r =>
                        upcomingExamContainer.appendChild(createExamCard(r, false))
                    );
                } else {
                    upcomingExamContainer.appendChild(renderNoUpcomingExamsCard());
                }
            }

            if (togglePastExams) {
                togglePastExams.hidden = pastExams.length === 0;
            }

            if (pastExamsContainer) {
                pastExams.forEach(r =>
                    pastExamsContainer.appendChild(createExamCard(r, true))
                );
            }

            /* Show dashboard */
            if (searchView) searchView.hidden = true;
            if (dashboardView) dashboardView.hidden = false;

            syncDashboardUi();
            showMessage("");

            window.scrollTo({ top: 0, behavior: "smooth" });

            // NOTE: no visitor counting here any more.

        } catch (error) {
            console.error("Search error:", error);

            if (
                error instanceof TypeError ||
                String(error.message).includes("Failed to fetch")
            ) {
                showMessage(
                    "Cannot connect to the server. Please make sure the server is running.",
                    "error"
                );
            } else {
                showMessage(error.message, "error");
            }

        } finally {
            searchButton.disabled = false;
            searchButton.innerHTML =
                '<i class="fa-solid fa-magnifying-glass"></i> <span>Find My Seat</span>';
        }
    });
}


/* ---------- SEARCH AGAIN ---------- */

if (searchAgainBtn) {
    searchAgainBtn.addEventListener("click", function () {
        if (dashboardView) dashboardView.hidden = true;
        if (searchView) searchView.hidden = false;

        if (admissionInput) admissionInput.value = "";

        if (upcomingExamContainer) upcomingExamContainer.replaceChildren();
        if (pastExamsContainer) pastExamsContainer.replaceChildren();

        if (togglePastExams) togglePastExams.hidden = true;

        if (programBadge) programBadge.textContent = "Student Program";
        if (studentNameDisplay) studentNameDisplay.textContent = "";
        if (admissionDisplay) admissionDisplay.textContent = "";

        setPastExamsOpen(false);
        syncDashboardUi();
        showMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (admissionInput) admissionInput.focus();
    });
}


/* ---------- DISCLAIMER MODAL ---------- */

if (disclaimerButton && disclaimerDialog) {
    disclaimerButton.addEventListener("click", () => disclaimerDialog.showModal());
}

if (closeDisclaimer && disclaimerDialog) {
    closeDisclaimer.addEventListener("click", () => disclaimerDialog.close());
}

if (okDisclaimer && disclaimerDialog) {
    okDisclaimer.addEventListener("click", () => disclaimerDialog.close());
}

// Click on the dark backdrop closes it.
if (disclaimerDialog) {
    disclaimerDialog.addEventListener("click", event => {
        if (event.target === disclaimerDialog) disclaimerDialog.close();
    });
}


/* =========================================================
   FEEDBACK MODAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedback = document.getElementById("openFeedback");
    const closeFeedback = document.getElementById("closeFeedback");

    const feedbackForm = document.getElementById("feedbackForm");
    const feedbackFormView = document.getElementById("feedbackFormView");
    const feedbackSuccessView = document.getElementById("feedbackSuccessView");
    const feedbackDoneBtn = document.getElementById("feedbackDoneBtn");

    const ratingInput = document.getElementById("ratingInput");
    const ratingLabel = document.getElementById("ratingLabel");

    const commentInput = document.getElementById("comment");
    const userNameInput = document.getElementById("userName");
    const feedbackError = document.getElementById("feedbackError");

    const stars = document.querySelectorAll(".star-btn");

    if (!feedbackModal || !openFeedback || !feedbackForm) {
        console.error("Feedback modal: required HTML elements are missing.");
        return;
    }

    let resetTimer = null;

    function showFeedbackError(text, color = "#dc2626") {
        if (feedbackError) {
            feedbackError.textContent = text;
            feedbackError.style.color = color;
        }
    }

    function clearFeedbackError() {
        showFeedbackError("");
    }

    function openFeedbackPopup(event) {
        if (event) event.preventDefault();

        // FIX: cancel a pending reset so it cannot wipe a form that was just reopened
        window.clearTimeout(resetTimer);

        if (feedbackFormView) feedbackFormView.hidden = false;
        if (feedbackSuccessView) feedbackSuccessView.hidden = true;

        feedbackModal.classList.add("show");
        feedbackModal.setAttribute("aria-hidden", "false");

        clearFeedbackError();
    }

    openFeedback.addEventListener("click", openFeedbackPopup);

    function resetFeedbackForm() {
        feedbackForm.reset();

        if (ratingInput) ratingInput.value = "";
        if (ratingLabel) ratingLabel.textContent = "Select rating";

        stars.forEach(star => star.classList.remove("active", "hover"));

        clearFeedbackError();
    }

    function closeFeedbackPopup() {
        feedbackModal.classList.remove("show");
        feedbackModal.setAttribute("aria-hidden", "true");

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
            if (feedbackFormView) feedbackFormView.hidden = false;
            if (feedbackSuccessView) feedbackSuccessView.hidden = true;
            resetFeedbackForm();
        }, 200);
    }

    if (closeFeedback) closeFeedback.addEventListener("click", closeFeedbackPopup);
    if (feedbackDoneBtn) feedbackDoneBtn.addEventListener("click", closeFeedbackPopup);

    feedbackModal.addEventListener("click", event => {
        if (event.target === feedbackModal) closeFeedbackPopup();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && feedbackModal.classList.contains("show")) {
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

            if (!Number.isInteger(value) || value < 1 || value > 5) return;

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

    /* ---------- SUBMIT FEEDBACK ---------- */

    feedbackForm.addEventListener("submit", async event => {
        event.preventDefault();

        const submitButton = feedbackForm.querySelector(".feedback-submit");

        if (submitButton && submitButton.disabled) return;   // no double submit

        const rating = Number(ratingInput?.value || 0);
        const comment = String(commentInput?.value ?? "").trim();
        const userName = String(userNameInput?.value ?? "").trim();

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            showFeedbackError("Please select a rating.");
            return;
        }

        if (!comment) {
            showFeedbackError("Please enter your comments.");
            commentInput?.focus();
            return;
        }

        const feedback = {
            rating,
            comment,
            name: userName || null
        };

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        clearFeedbackError();

        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                const errorText = await response.text();

                console.error("Feedback API error:", {
                    status: response.status,
                    response: errorText
                });

                throw new Error(`Server returned ${response.status}.`);
            }

            if (feedbackFormView) feedbackFormView.hidden = true;
            if (feedbackSuccessView) feedbackSuccessView.hidden = false;

        } catch (error) {
            console.error("Feedback submission failed:", error);
            showFeedbackError("Unable to submit feedback. Please try again.");

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
startTracking();