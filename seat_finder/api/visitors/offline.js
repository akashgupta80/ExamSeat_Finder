
const pool = require("../../lib/db");
const {
    allowMethods,
    bodyTooLarge,
    getBody,
    sendServerError
} = require("../../lib/security");

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    if (!allowMethods(req, res, ["POST"])) return;
    if (bodyTooLarge(req, res)) return;

    const body = getBody(req);
    const sessionId = typeof body.sessionId === "string"
        ? body.sessionId.trim()
        : "";

    if (!/^[A-Za-z0-9-]{8,64}$/.test(sessionId)) {
        return res.status(400).json({
            message: "Invalid session ID."
        });
    }

    try {
        await pool.execute(
            "DELETE FROM online_students WHERE session_id = ?",
            [sessionId]
        );

        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS studentsOnline
             FROM online_students
             WHERE last_seen >= UTC_TIMESTAMP() - INTERVAL 60 SECOND`
        );

        return res.status(200).json({
            studentsOnline: Number(rows[0].studentsOnline)
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};
