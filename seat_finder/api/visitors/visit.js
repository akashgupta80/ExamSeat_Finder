
const pool = require("../../lib/db");
const {
    allowMethods,
    bodyTooLarge,
    getBody,
    rateLimit,
    sendServerError
} = require("../../lib/security");

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    if (!allowMethods(req, res, ["POST"])) return;
    if (bodyTooLarge(req, res)) return;
    if (!(await rateLimit(req, res, "visit", 100, 600))) return;

    const body = getBody(req);
    const sessionId = typeof body.sessionId === "string"
        ? body.sessionId.trim()
        : "";

    if (!/^[A-Za-z0-9-]{8,64}$/.test(sessionId)) {
        return res.status(400).json({
            message: "Invalid visitor session."
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let isNewVisitor = false;

        try {
            await connection.execute(
                `INSERT INTO unique_visitors (visitor_id, first_visit)
                 VALUES (?, UTC_TIMESTAMP(6))`,
                [sessionId]
            );

            isNewVisitor = true;
        } catch (error) {
            if (error.code !== "ER_DUP_ENTRY") {
                throw error;
            }
        }

        if (isNewVisitor) {
            const [result] = await connection.execute(
                `UPDATE visitor_counter
                 SET total_visitors = total_visitors + 1
                 WHERE id = 1`
            );

            if (result.affectedRows !== 1) {
                throw new Error("Visitor counter row not found.");
            }
        }

        const [rows] = await connection.execute(
            "SELECT total_visitors FROM visitor_counter WHERE id = 1"
        );

        if (rows.length === 0) {
            throw new Error("Visitor counter row not found.");
        }

        const totalVisitors = Number(rows[0].total_visitors);

        await connection.commit();

        return res.status(200).json({
            totalVisitors
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Visitor transaction rollback failed:",
                    rollbackError.message
                );
            }
        }

        return sendServerError(res, error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
