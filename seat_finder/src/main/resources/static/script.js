const isLocalFrontend =
    location.protocol === "file:" ||
    (
        ["localhost", "127.0.0.1"].includes(location.hostname) &&
        location.port !== "8080"
    );

const API_BASE_URL = isLocalFrontend
    ? "http://localhost:8080/api"
    : "https://examseat-finder.onrender.com/api";

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

function getExamType(record) {
    const section = String(record?.section ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    if (section.includes("debr")) {
        return "debarred";
    }

    if (section.includes("back paper")) {
        return "back";
    }

    return "regular";
}

function isDebarredRecord(record) {
    return getExamType(record) === "debarred";
}

function updateProgramBadge(currentRecord, allRecords = []) {
    const badge = programBadge || document.getElementById("programBadge");

    if (!badge) {
        console.error("Program badge element not found!");
        return;
    }

    badge.replaceChildren();

    const records = Array.isArray(allRecords) ? allRecords : [];

    if (records.length === 0) {
        return;
    }

    const today = getTodayString();
    const upcomingDates = records
        .map(record => dateKey(record))
        .filter(date => date && date >= today)
        .sort();

    const selectedDate = upcomingDates.length > 0
        ? upcomingDates[0]
        : records
            .map(record => dateKey(record))
            .filter(Boolean)
            .sort()
            .at(-1);

    if (!selectedDate) {
        return;
    }

    const selectedRecords = records.filter(
        record => dateKey(record) === selectedDate
    );
    const priority = {
        regular: 1,
        back: 2,
        debarred: 3
    };

    const selectedCategory = selectedRecords
        .map(record => getExamType(record))
        .sort((a, b) => priority[a] - priority[b])[0];

    const filteredRecords = selectedRecords.filter(
        record => getExamType(record) === selectedCategory
    );
    const uniqueBadges = new Map();

    filteredRecords.forEach(record => {
        const type = getExamType(record);

        const program = String(record.program || "Not available").trim();
        const semester = String(record.semester || "Not available").trim();

        let section = String(record.section || "Not available").trim();

        if (type === "back") {
            section = "Back Paper";
        } else if (type === "debarred") {
            section = "Debr. Exam";
        }

        const key = `${program.toLowerCase()}|${semester.toLowerCase()}|${section.toLowerCase()}`;

        if (!uniqueBadges.has(key)) {
            uniqueBadges.set(key, {
                program,
                semester,
                section
            });
        }
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
        createDetail(
            "fa-solid fa-book-open",
            "Course code",
            record.courseCode || "N/A"
        ),
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
        const parts = studentNameDisplay.textContent
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        studentAvatar.textContent =
            parts.length === 0
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

    return Array.from(bytes, b =>
        b.toString(16).padStart(2, "0")
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
        count !== undefined &&
        count !== null &&
        Number.isFinite(Number(count))
            ? Number(count).toLocaleString("en-IN")
            : "--";
}

function showOnlineTotal(count) {
    if (!onlineCount) return;

    const valid =
        count !== undefined &&
        count !== null &&
        Number.isFinite(Number(count));

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
    } catch (error) {}
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

function dateKey(record) {
    return normalizeDate(record.examDate);
}

function shiftKey(record) {
    return getShiftNumber(record.shift) || "9";
}

if (searchForm) {
    searchForm.addEventListener("submit", async function (event) {
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
            const todayStr = getTodayString();

            const upcomingExams = records
                .filter(r => !dateKey(r) || dateKey(r) >= todayStr)
                .sort((a, b) =>
                    (dateKey(a) || "9999-99-99").localeCompare(
                        dateKey(b) || "9999-99-99"
                    ) ||
                    shiftKey(a).localeCompare(shiftKey(b))
                );

            const pastExams = records
                .filter(r => dateKey(r) && dateKey(r) < todayStr)
                .sort((a, b) =>
                    dateKey(b).localeCompare(dateKey(a)) ||
                    shiftKey(a).localeCompare(shiftKey(b))
                );

            if (upcomingExamContainer) {
                upcomingExamContainer.replaceChildren();
            }

            if (pastExamsContainer) {
                pastExamsContainer.replaceChildren();
            }

            if (upcomingExamContainer) {
                if (upcomingExams.length > 0) {
                    upcomingExams.forEach(r => {
                        upcomingExamContainer.appendChild(
                            createExamCard(r, false)
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
                pastExams.forEach(r => {
                    pastExamsContainer.appendChild(
                        createExamCard(r, true)
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
    searchAgainBtn.addEventListener("click", function () {
        if (dashboardView) dashboardView.hidden = true;
        if (searchView) searchView.hidden = false;

        if (admissionInput) admissionInput.value = "";

        if (upcomingExamContainer) {
            upcomingExamContainer.replaceChildren();
        }

        if (pastExamsContainer) {
            pastExamsContainer.replaceChildren();
        }

        if (togglePastExams) {
            togglePastExams.hidden = true;
        }

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

        if (admissionInput) admissionInput.focus();
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


/* =========================================================
   FEEDBACK POPUP CONTROLLER (Synchronized with new HTML)
   ========================================================= */
(() => {
    "use strict";

    const modal = document.getElementById("fbModal");
    const openBtn = document.getElementById("openFeedback");
    const closeBtn = document.getElementById("fbClose");
    const form = document.getElementById("fbForm");
    const formView = document.getElementById("fbFormView");
    const okView = document.getElementById("fbSuccessView");
    const doneBtn = document.getElementById("fbDone");

    const ratingInput = document.getElementById("fbRating");
    const ratingLabel = document.getElementById("fbRatingLabel");
    const accInput = document.getElementById("fbAccurate");
    const accHint = document.getElementById("fbAccHint");

    const comment = document.getElementById("fbComment");
    const userName = document.getElementById("fbName");
    const errorEl = document.getElementById("fbError");

    if (!modal || !form) return;

    const stars = [...document.querySelectorAll("#fbStars .star-btn")];
    const accBtns = [...document.querySelectorAll(".acc-btn")];
    const TEXT = { 1: "Very Poor", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent" };

    let lastFocus = null;
    let resetTimer = null;

    const setError = text => {
        if (errorEl) errorEl.textContent = text;
    };

    /* ---------- Stars ---------- */
    function paint(n, cls) {
        stars.forEach(s => s.classList.toggle(cls, Number(s.dataset.value) <= n));
    }

    function announce(text) {
        if (!ratingLabel) return;
        ratingLabel.textContent = text;
        ratingLabel.classList.remove("swap");
        void ratingLabel.offsetWidth;
        ratingLabel.classList.add("swap");
    }

    function setRating(n) {
        if (ratingInput) ratingInput.value = String(n);
        paint(n, "active");
        announce(TEXT[n]);
        setError("");

        stars.forEach((s, i) => {
            s.classList.remove("pop");
            if (i < n) {
                s.style.setProperty("--d", `${i * 70}ms`);
                void s.offsetWidth;
                s.classList.add("pop");
            }
        });
    }

    stars.forEach(star => {
        const value = Number(star.dataset.value);
        star.addEventListener("click", () => setRating(value));
        star.addEventListener("mouseenter", () => paint(value, "hover"));
        star.addEventListener("mouseleave", () => paint(0, "hover"));
        star.addEventListener("focus", () => paint(value, "hover"));
        star.addEventListener("blur", () => paint(0, "hover"));
    });

    /* ---------- "Did you find your details accurate?" ---------- */
    function setAccurate(value) {
        if (accInput) accInput.value = value;

        accBtns.forEach(btn => {
            const on = btn.dataset.value === value;
            btn.classList.toggle("selected", on);
            btn.setAttribute("aria-pressed", String(on));
            if (on) {
                btn.classList.remove("pop");
                void btn.offsetWidth;
                btn.classList.add("pop");
            }
        });

        if (accHint) accHint.classList.toggle("show", value === "no");
        setError("");
    }

    accBtns.forEach(btn => btn.addEventListener("click", () => setAccurate(btn.dataset.value)));

    /* ---------- Open / Close / Reset ---------- */
    function resetForm() {
        form.reset();
        if (ratingInput) ratingInput.value = "";
        if (accInput) accInput.value = "";
        announce("Select rating");
        paint(0, "active");
        paint(0, "hover");
        stars.forEach(s => s.classList.remove("pop"));
        accBtns.forEach(b => {
            b.classList.remove("selected", "pop");
            b.setAttribute("aria-pressed", "false");
        });
        if (accHint) accHint.classList.remove("show");
        setError("");
    }

    function openModal(event) {
        if (event) event.preventDefault();
        clearTimeout(resetTimer);

        if (formView) formView.hidden = false;
        if (okView) okView.hidden = true;
        setError("");

        lastFocus = document.activeElement;
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            if (closeBtn) closeBtn.focus();
        }, 60);
    }

    function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            if (formView) formView.hidden = false;
            if (okView) okView.hidden = true;
            resetForm();
        }, 250);

        if (lastFocus && typeof lastFocus.focus === "function") {
            lastFocus.focus();
        }
    }

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (doneBtn) doneBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
    });

    /* ---------- Submit Form ---------- */
    form.addEventListener("submit", async event => {
        event.preventDefault();

        const btn = form.querySelector(".feedback-submit");
        if (!btn || btn.disabled) return;

        const rating = Number(ratingInput?.value || 0);
        const text = comment?.value.trim() || "";
        const name = userName?.value.trim() || "";
        const accurateVal = accInput?.value || "";

        if (!(rating >= 1 && rating <= 5)) return setError("Please select a rating.");
        if (!accurateVal) return setError("Please tell us if your details were accurate.");
        if (!text) {
            setError("Please enter your comments.");
            if (comment) comment.focus();
            return;
        }

        const label = btn.querySelector("span");
        btn.disabled = true;
        btn.classList.add("is-loading");
        if (label) label.textContent = "Submitting...";
        setError("");

        try {
            const base = typeof API_BASE_URL !== "undefined" ? API_BASE_URL : "/api";

            const response = await fetch(`${base}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    comment: text,
                    name: name || null,
                    detailsAccurate: accurateVal === "yes"
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            if (formView) formView.hidden = true;
            if (okView) okView.hidden = false;

        } catch (error) {
            console.error("Feedback submission failed:", error);
            setError("Unable to submit feedback. Please try again.");

        } finally {
            btn.disabled = false;
            btn.classList.remove("is-loading");
            if (label) label.textContent = "Submit Feedback";
        }
    });
})();

loadVisitorCount();
startTracking();