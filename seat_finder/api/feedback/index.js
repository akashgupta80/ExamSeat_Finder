
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
    if (!(await rateLimit(req, res, "feedback", 10, 600))) return;

    const body = getBody(req);

    // Ignore automated submissions that fill the hidden honeypot field.
    if (typeof body.website === "string" && body.website.trim() !== "") {
        return res.status(201).json({
            message: "Thank you for your feedback."
        });
    }

    const rating = body.rating;
    const comment = typeof body.comment === "string"
        ? body.comment.trim()
        : "";
    const name = typeof body.name === "string"
        ? body.name.trim()
        : "";
    const detailsAccurate = body.detailsAccurate;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
            error: "Rating must be between 1 and 5."
        });
    }

    if (comment.length < 1 || comment.length > 2000) {
        return res.status(400).json({
            error: "Comment must be between 1 and 2000 characters."
        });
    }

    if (name.length > 100) {
        return res.status(400).json({
            error: "Name must not exceed 100 characters."
        });
    }

    if (typeof detailsAccurate !== "boolean") {
        return res.status(400).json({
            error: "Please provide an accuracy response."
        });
    }

    try {
        await pool.execute(
            `INSERT INTO feedback
             (rating, comment, name, details_accurate, submitted_at)
             VALUES (?, ?, ?, ?, UTC_TIMESTAMP(6))`,
            [rating, comment, name || null, detailsAccurate ? 1 : 0]
        );

        return res.status(201).json({
            message: "Thank you for your feedback."
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};
