
const pool = require("../lib/db");
const {
    allowMethods,
    rateLimit,
    sendServerError
} = require("../lib/security");

const ADMISSION_NO = /^[A-Za-z0-9/_.-]{3,40}$/;
const SHOW_FULL_NAME = false;

const EXAM_TIMES = {
    1: "09:30 AM - 11:00 AM",
    2: "11:40 AM - 01:10 PM",
    3: "01:50 PM - 03:20 PM",
    4: "04:00 PM - 05:30 PM"
};

function examTime(shift) {
    const match = String(shift || "").match(/\d+/);

    return (match && EXAM_TIMES[match[0]]) || "Not available";
}

function displayName(name) {
    if (SHOW_FULL_NAME || !name) {
        return name || "";
    }

    const parts = String(name).trim().split(/\s+/);

    if (!parts[0]) return "";

    const rest = parts.slice(1)
        .map(part => part[0].toUpperCase() + ".")
        .join(" ");

    return rest ? parts[0] + " " + rest : parts[0];
}

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    if (!allowMethods(req, res, ["GET"])) return;

    if (!(await rateLimit(req, res, "seats", 60, 60))) return;

    const raw = req.query.admissionNo;

    if (typeof raw !== "string") {
        return res.status(400).json({
            error: "Please enter a valid admission number."
        });
    }

    const admissionNo = raw.trim();

    if (!ADMISSION_NO.test(admissionNo)) {
        return res.status(400).json({
            error: "Please enter a valid admission number."
        });
    }

    try {
        const [rows] = await pool.execute(
            `SELECT student_name, admission_no, room_no, seat_no, course_code,
                    DATE_FORMAT(exam_date, '%Y-%m-%d') AS exam_date_text,
                    shift, program, semester, section
             FROM exam_seats
             WHERE admission_no = ?
             ORDER BY exam_date ASC, shift ASC
             LIMIT 20`,
            [admissionNo]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "No examination records found for this admission number."
            });
        }

        return res.status(200).json(
            rows.map(row => ({
                studentName: displayName(row.student_name),
                admissionNo: row.admission_no,
                roomNo: row.room_no,
                seatNo: row.seat_no,
                courseCode: row.course_code,
                examDate: row.exam_date_text,
                shift: row.shift,
                examTime: examTime(row.shift),
                program: row.program,
                semester: row.semester,
                section: row.section
            }))
        );
    } catch (error) {
        return sendServerError(res, error);
    }
};
