
const pool = require("../lib/db");

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    const admissionNo = req.query.admissionNo;

    if (!admissionNo || !admissionNo.trim()) {
        return res.status(400).json({
            message: "Admission number is required."
        });
    }

    if (admissionNo.trim().length > 50) {
        return res.status(400).json({
            message: "Invalid admission number."
        });
    }

    try {
        const [rows] = await pool.execute(
            `SELECT
                student_name AS studentName,
                admission_no AS admissionNo,
                room_no AS roomNo,
                seat_no AS seatNo,
                course_code AS courseCode,
                exam_date AS examDate,
                shift,
                program,
                semester,
                section
             FROM exam_seats
             WHERE admission_no = ?
             ORDER BY exam_date ASC, shift ASC`,
            [admissionNo.trim()]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No examination records found for this admission number."
            });
        }

        const examRecords = rows.map(row => ({
            ...row,
            examDate: row.examDate
                ? new Date(row.examDate).toISOString().split("T")[0]
                : null,
            examTime: getExamTime(row.shift)
        }));

        return res.status(200).json(examRecords);

    } catch (error) {
        console.error("Exam seat API error:", error);

        return res.status(500).json({
            message: "Unable to fetch examination details."
        });
    }
};

function getExamTime(shift) {
    const times = {
        "1": "09:30 AM - 11:00 AM",
        "2": "11:40 AM - 01:10 PM",
        "3": "01:50 PM - 03:20 PM",
        "4": "04:00 PM - 05:30 PM"
    };

    const match = String(shift).match(/\d+/);
    return match ? times[match[0]] || "Not available" : "Not available";
}
