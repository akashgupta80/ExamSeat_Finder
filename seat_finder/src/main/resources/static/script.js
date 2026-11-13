
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

function getShiftNumber(shift) {
    const number = String(shift ?? "").trim().match(/\d+/)?.[0];
    return shiftTimings[number] ? number : null;
}

function formatShift(shift) {
    const number = getShiftNumber(shift);
    return number ? `Shift ${number}` : (shift || "Not available");
}

function getExamTime(shift) {
    const number = getShiftNumber(shift);
    return number ? shiftTimings[number] : "Timing unavailable";
}

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

function showMessage(text, type = "info") {
    if (!message) return;

    message.textContent = text;
    message.className = `message ${type}`;
    message.hidden = !text;
}

function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);

    element.textContent = text == null || text === ""
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

function getExamType(record) {
    const section = String(record?.section ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    if (section.includes("debr")) return "debarred";
    if (section.includes("back paper")) return "back";

    return "regular";
}

function isDebarredRecord(record) {
    return getExamType(record) === "debarred";
}

function dateKey(record) {
    return normalizeDate(record.examDate);
}

function shiftKey(record) {
    return getShiftNumber(record.shift) || "9";
}

function updateProgramBadge(currentRecord, allRecords = []) {
    const badge = programBadge || document.getElementById("programBadge");

    if (!badge) {
        console.error("Program badge element not found!");
        return;
    }

    badge.replaceChildren();

    if (!Array.isArray(allRecords) || allRecords.length === 0) return;

    const today = getTodayString();

    const upcomingDates = allRecords
        .map(dateKey)
        .filter(date => date && date >= today)
        .sort();

    const selectedDate = upcomingDates.length
        ? upcomingDates[0]
        : allRecords.map(dateKey).filter(Boolean).sort().at(-1);

    if (!selectedDate) return;

    const priority = {
        regular: 1,
        back: 2,
        debarred: 3
    };

    const selectedRecords = allRecords.filter(
        record => dateKey(record) === selectedDate
    );

    const selectedCategory = selectedRecords
        .map(getExamType)
        .sort((a, b) => priority[a] - priority[b])[0];

    const uniqueBadges = new Map();

    selectedRecords
        .filter(record => getExamType(record) === selectedCategory)
        .forEach(record => {
            const type = getExamType(record);
            const program = String(record.program || "Not available").trim();
            const semester = String(record.semester || "Not available").trim();

            let section = String(record.section || "Not available").trim();

            if (type === "back") section = "Back Paper";
            if (type === "debarred") section = "Debr. Exam";

            const key = `${program.toLowerCase()}|${semester.toLowerCase()}|${section.toLowerCase()}`;

            if (uniqueBadges.has(key)) return;

            uniqueBadges.set(key, { program, semester, section });
        });

    const classNames = {
        regular: "regular-program-details",
        back: "back-program-details",
        debarred: "debarred-program-details"
    };

    uniqueBadges.forEach(details => {
        const element = document.createElement("div");
        element.className = classNames[selectedCategory];
        element.textContent =
            `${details.program} | ${details.semester} | ${details.section}`;

        badge.appendChild(element);
    });
}

function createCell(iconClasses, label, value, variant) {
    const cell = document.createElement("div");
    cell.className = `seat-cell ${variant}`;

    const labelRow = document.createElement("span");
    labelRow.className = "cell-label";
    labelRow.append(createIcon(iconClasses), label);

    cell.append(labelRow, createTextElement("strong", value, "cell-value"));

    return cell;
}

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

    const topGrid = document.createElement("div");
    topGrid.className = "exam-grid-top";

    topGrid.append(
        createCell("fa-solid fa-building", "Room", record.roomNo || "N/A", "cell-room"),
        createCell("fa-solid fa-chair", "Seat", record.seatNo || "N/A", "cell-seat")
    );

    card.appendChild(topGrid);

    const divider = document.createElement("div");
    divider.className = "ticket-divider";
    divider.setAttribute("aria-hidden", "true");

    card.appendChild(divider);

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

function syncDashboardUi() {
    if (studentAvatar && studentNameDisplay) {
        const parts = studentNameDisplay.textContent.trim().split(/\s+/).filter(Boolean);

        studentAvatar.textContent = parts.length === 0
            ? "?"
            : (
                parts[0][0] +
                (parts.length > 1 ? parts[parts.length - 1][0] : "")
            ).toUpperCase();
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

// Visitor tracking
const HEARTBEAT_MS = 15000;
let memoryVisitorId = null;

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

    return Array.from(
        bytes,
        byte => byte.toString(16).padStart(2, "0")
    ).join("");
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
        count != null && Number.isFinite(Number(count))
            ? Number(count).toLocaleString("en-IN")
            : "--";
}

function showOnlineTotal(count) {
    if (!onlineCount) return;

    const valid = count != null && Number.isFinite(Number(count));

    onlineCount.textContent = valid ? String(Number(count)) : "--";

    if (onlineLabel && valid) {
        onlineLabel.textContent =
            Number(count) === 1 ? "student online" : "students online";
    }
}

async function loadVisitorCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors`);

        if (!response.ok) {
            throw new Error("Visitor API unavailable");
        }

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

async function sendHeartbeat() {
    if (document.hidden) return;

    try {
        const data = await postJson("/visitors/online", {
            sessionId: VISITOR_ID
        });

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

    }
}

function startTracking() {
    registerVisit();
    sendHeartbeat();

    setInterval(sendHeartbeat, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) sendHeartbeat();
    });

    window.addEventListener("pageshow", event => {
        if (event.persisted) sendHeartbeat();
    });

    window.addEventListener("pagehide", leaveSite);
}

(() => {
    "use strict";

    const modal = document.getElementById("fbModal");
    const openBtn = document.getElementById("openFeedback");
    const closeBtn = document.getElementById("fbClose");
    const doneBtn = document.getElementById("fbDone");

    const form = document.getElementById("fbForm");
    const formView = document.getElementById("fbFormView");
    const successView = document.getElementById("fbSuccessView");

    const stars = document.querySelectorAll("#fbStars .star-btn");
    const ratingInput = document.getElementById("fbRating");
    const ratingLabel = document.getElementById("fbRatingLabel");

    const accuracyButtons = document.querySelectorAll(
        "#fbModal .acc-btn"
    );
    const accurateInput = document.getElementById("fbAccurate");
    const accuracyHint = document.getElementById("fbAccHint");

    const commentInput = document.getElementById("fbComment");
    const nameInput = document.getElementById("fbName");
    const errorMessage = document.getElementById("fbError");

    const submitButton = form?.querySelector(".feedback-submit");

    const ratingText = {
        1: "Very Poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent"
    };

    if (
        !modal || !openBtn || !closeBtn || !form ||
        !formView || !successView || !ratingInput ||
        !accurateInput || !submitButton
    ) {
        console.error("Feedback form: required HTML elements are missing.");
        return;
    }

    let lastFocusedElement = null;

    function showError(message = "") {
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    function animateElement(element) {
        element.classList.remove("pop");
        void element.offsetWidth;
        element.classList.add("pop");
    }

    function updateStars(rating, className) {
        stars.forEach(star => {
            const value = Number(star.dataset.value);

            star.classList.toggle(
                className,
                value <= rating
            );
        });
    }

    function setRating(rating) {
        ratingInput.value = String(rating);

        updateStars(rating, "active");

        if (ratingLabel) {
            ratingLabel.textContent = ratingText[rating];
            animateElement(ratingLabel);
        }

        stars.forEach(star => {
            const value = Number(star.dataset.value);

            if (value <= rating) {
                animateElement(star);
            } else {
                star.classList.remove("pop");
            }
        });

        showError();
    }

    stars.forEach(star => {
        const rating = Number(star.dataset.value);

        star.addEventListener("click", () => {
            setRating(rating);
        });

        star.addEventListener("mouseenter", () => {
            updateStars(rating, "hover");
        });

        star.addEventListener("mouseleave", () => {
            updateStars(0, "hover");
        });

        star.addEventListener("focus", () => {
            updateStars(rating, "hover");
        });

        star.addEventListener("blur", () => {
            updateStars(0, "hover");
        });
    });

    function setAccuracy(value) {
        accurateInput.value = value;

        accuracyButtons.forEach(button => {
            const selected = button.dataset.value === value;

            button.classList.toggle("selected", selected);
            button.setAttribute("aria-pressed", String(selected));

            if (selected) {
                animateElement(button);
            } else {
                button.classList.remove("pop");
            }
        });

        if (accuracyHint) {
            accuracyHint.classList.toggle("show", value === "no");
        }

        showError();
    }

    accuracyButtons.forEach(button => {
        button.addEventListener("click", () => {
            setAccuracy(button.dataset.value);
        });
    });

    function resetFeedbackForm() {
        form.reset();

        ratingInput.value = "";
        accurateInput.value = "";

        updateStars(0, "active");
        updateStars(0, "hover");

        stars.forEach(star => {
            star.classList.remove("pop");
        });

        accuracyButtons.forEach(button => {
            button.classList.remove("selected", "pop");
            button.setAttribute("aria-pressed", "false");
        });

        if (ratingLabel) {
            ratingLabel.textContent = "Select rating";
        }

        if (accuracyHint) {
            accuracyHint.classList.remove("show");
        }

        showError();
    }
    function openModal(event) {
        event.preventDefault();

        resetFeedbackForm();

        formView.hidden = false;
        successView.hidden = true;

        lastFocusedElement = document.activeElement;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
        setTimeout(() => {
            formView.hidden = false;
            successView.hidden = true;
            resetFeedbackForm();
        }, 250);
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    doneBtn?.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("show")
        ) {
            closeModal();
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const rating = Number(ratingInput.value);
        const accurate = accurateInput.value;
        const comment = commentInput?.value.trim() || "";
        const name = nameInput?.value.trim() || "";

        if (rating < 1 || rating > 5) {
            showError("Please select a star rating.");
            return;
        }

        if (!accurate) {
            showError("Please select Yes or No.");
            return;
        }

        if (!comment) {
            showError("Please enter your feedback.");
            commentInput?.focus();
            return;
        }

        const buttonText = submitButton.querySelector("span");
        const originalText = buttonText?.textContent || "Submit Feedback";

        submitButton.disabled = true;
        submitButton.classList.add("is-loading");

        if (buttonText) {
            buttonText.textContent = "Submitting...";
        }

        showError();

        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rating: rating,
                    comment: comment,
                    name: name || null,
                    detailsAccurate: accurate === "yes"
                })
            });

            if (!response.ok) {
                const serverMessage = await response.text();

                throw new Error(
                    serverMessage || `Server error: ${response.status}`
                );
            }

            formView.hidden = true;
            successView.hidden = false;

        } catch (error) {
            console.error("Feedback submission failed:", error);

            showError(
                "Unable to submit feedback. Please try again."
            );

        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove("is-loading");

            if (buttonText) {
                buttonText.textContent = originalText;
            }
        }
    });
})();

// Past exams
let isPastExamsOpen = false;

function setPastExamsOpen(open) {
    isPastExamsOpen = open;

    if (pastExamsContainer) {
        pastExamsContainer.hidden = !open;
    }

    if (togglePastExams) {
        togglePastExams.setAttribute("aria-expanded", String(open));
    }
}

if (togglePastExams) {
    togglePastExams.addEventListener("click", () => {
        setPastExamsOpen(!isPastExamsOpen);
    });
}

// Student search
if (searchForm) {
    searchForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (searchButton.disabled) return;

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

            const currentRecord =
                records.find(record => !isDebarredRecord(record)) || records[0];

            if (studentNameDisplay) {
                studentNameDisplay.textContent =
                    currentRecord.studentName || "Student Details";
            }

            if (admissionDisplay) {
                admissionDisplay.textContent =
                    currentRecord.admissionNo || admissionNo;
            }

            updateProgramBadge(currentRecord, records);

            const today = getTodayString();

            const upcomingExams = records
                .filter(record => !dateKey(record) || dateKey(record) >= today)
                .sort((a, b) =>
                    (dateKey(a) || "9999-99-99").localeCompare(
                        dateKey(b) || "9999-99-99"
                    ) || shiftKey(a).localeCompare(shiftKey(b))
                );

            const pastExams = records
                .filter(record => dateKey(record) && dateKey(record) < today)
                .sort((a, b) =>
                    dateKey(b).localeCompare(dateKey(a)) ||
                    shiftKey(a).localeCompare(shiftKey(b))
                );

            upcomingExamContainer?.replaceChildren();
            pastExamsContainer?.replaceChildren();

            if (upcomingExamContainer) {
                if (upcomingExams.length > 0) {
                    upcomingExams.forEach(record => {
                        upcomingExamContainer.appendChild(
                            createExamCard(record, false)
                        );
                    });
                } else {
                    upcomingExamContainer.appendChild(
                        renderNoUpcomingExamsCard()
                    );
                }
            }

            if (togglePastExams) {
                togglePastExams.hidden = pastExams.length === 0;
            }

            if (pastExamsContainer) {
                pastExams.forEach(record => {
                    pastExamsContainer.appendChild(
                        createExamCard(record, true)
                    );
                });
            }

            if (searchView) searchView.hidden = true;
            if (dashboardView) dashboardView.hidden = false;

            syncDashboardUi();
            showMessage("");

            window.scrollTo({ top: 0, behavior: "smooth" });

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


if (searchAgainBtn) {
    searchAgainBtn.addEventListener("click", () => {
        if (dashboardView) dashboardView.hidden = true;
        if (searchView) searchView.hidden = false;

        if (admissionInput) admissionInput.value = "";

        upcomingExamContainer?.replaceChildren();
        pastExamsContainer?.replaceChildren();

        if (togglePastExams) togglePastExams.hidden = true;

        if (programBadge) {
            programBadge.replaceChildren();
            programBadge.textContent = "Student Program";
        }

        if (studentNameDisplay) studentNameDisplay.textContent = "";
        if (admissionDisplay) admissionDisplay.textContent = "";

        setPastExamsOpen(false);
        syncDashboardUi();
        showMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
        admissionInput?.focus();
    });
}

if (disclaimerButton && disclaimerDialog) {
    disclaimerButton.addEventListener("click", () => {
        disclaimerDialog.showModal();
    });
}

if (closeDisclaimer && disclaimerDialog) {
    closeDisclaimer.addEventListener("click", () => {
        disclaimerDialog.close();
    });
}

if (okDisclaimer && disclaimerDialog) {
    okDisclaimer.addEventListener("click", () => {
        disclaimerDialog.close();
    });
}

if (disclaimerDialog) {
    disclaimerDialog.addEventListener("click", event => {
        if (event.target === disclaimerDialog) {
            disclaimerDialog.close();
        }
    });
}

loadVisitorCount();
startTracking();