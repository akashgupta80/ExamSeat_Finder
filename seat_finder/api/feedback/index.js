
const pool = require("../../lib/db");

module.exports = async (req, res) => {
    try {
        if (req.method === "POST") {
            const { rating, comment, name } = req.body || {};

            const numericRating = Number(rating);
            const cleanComment = String(comment || "").trim();
            const cleanName = String(name || "").trim();

            if (!Number.isInteger(numericRating) ||
                numericRating < 1 || numericRating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5."
                });
            }

            if (!cleanComment) {
                return res.status(400).json({
                    message: "Feedback comment is required."
                });
            }

            if (cleanComment.length > 2000 || cleanName.length > 100) {
                return res.status(400).json({
                    message: "Feedback is too long."
                });
            }

            const [result] = await pool.execute(
                `INSERT INTO feedback (rating, comment, name)
                 VALUES (?, ?, ?)`,
                [numericRating, cleanComment, cleanName || null]
            );

            return res.status(201).json({
                message: "Feedback submitted successfully.",
                id: result.insertId,
                rating: numericRating,
                comment: cleanComment,
                name: cleanName || null
            });
        }

        if (req.method === "GET") {
            const [rows] = await pool.execute(
                `SELECT id, rating, comment, name, submitted_at AS submittedAt
                 FROM feedback
                 ORDER BY submitted_at DESC`
            );

            return res.status(200).json(rows);
        }

        return res.status(405).json({
            message: "Method not allowed"
        });

    } catch (error) {
        console.error("Feedback API error:", error);

        return res.status(500).json({
            message: "Unable to process feedback."
        });
    }
};
