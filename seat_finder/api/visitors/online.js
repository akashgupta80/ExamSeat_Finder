
const pool = require("../../lib/db");
const {
    allowMethods,
    bodyTooLarge,
    getBody,
    sendServerError
} = require("../../lib/security");

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    if (!allowMethods(req, res, ["GET", "POST"])) return;

    if (req.method === "GET") {
        try {
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
    }

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
            `INSERT INTO online_students (session_id, last_seen)
             VALUES (?, UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE last_seen = UTC_TIMESTAMP()`,
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
