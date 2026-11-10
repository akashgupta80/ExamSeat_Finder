
const pool = require("../../lib/db");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {
        await pool.execute(
            `UPDATE visitor_counter
             SET total_visitors = total_visitors + 1
             WHERE id = 1`
        );

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
        console.error("Visitor increment error:", error);

        return res.status(500).json({
            message: "Unable to update visitor count."
        });
    }
};
