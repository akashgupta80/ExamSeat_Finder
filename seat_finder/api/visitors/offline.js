
const pool = require("../../lib/db");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {
        const sessionId = String(req.body?.sessionId || "").trim();

        if (!/^[A-Za-z0-9-]{8,64}$/.test(sessionId)) {
            return res.status(400).json({
                message: "Invalid session ID."
            });
        }

        await pool.execute(
            "DELETE FROM online_students WHERE session_id = ?",
            [sessionId]
        );

        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS studentsOnline
             FROM online_students
             WHERE last_seen >= NOW() - INTERVAL 60 SECOND`
        );

        return res.status(200).json({
            studentsOnline: Number(rows[0].studentsOnline)
        });

    } catch (error) {
        console.error("Offline students API error:", error);

        return res.status(500).json({
            message: "Unable to update online students."
        });
    }
};
