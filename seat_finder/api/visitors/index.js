
const pool = require("../../lib/db");

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {
        const [rows] = await pool.execute(
            "SELECT total_visitors FROM visitor_counter WHERE id = 1"
        );

        const totalVisitors = rows.length > 0
            ? Number(rows[0].total_visitors)
            : 0;

        return res.status(200).json({
            totalVisitors: totalVisitors
        });

    } catch (error) {
        console.error("Visitor counter error:", error);

        return res.status(500).json({
            message: "Unable to fetch visitor count."
        });
    }
};
