
const pool = require("../../lib/db");
const {
    allowMethods,
    sendServerError
} = require("../../lib/security");

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    if (!allowMethods(req, res, ["GET"])) return;

    try {
        const [rows] = await pool.execute(
            "SELECT total_visitors FROM visitor_counter WHERE id = 1"
        );

        const totalVisitors = rows.length > 0
            ? Number(rows[0].total_visitors)
            : 0;

        return res.status(200).json({
            totalVisitors
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};
