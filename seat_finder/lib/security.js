
const crypto = require("crypto");
const pool = require("./db");

const MAX_BODY_BYTES = 10000;

function clientIp(req) {
    const ip = req.headers["x-real-ip"];

    if (typeof ip === "string" && ip.trim()) {
        return ip.trim();
    }

    return "unknown";
}

function allowMethods(req, res, methods) {
    if (methods.includes(req.method)) {
        return true;
    }

    res.setHeader("Allow", methods.join(", "));
    res.status(405).json({
        error: "Method not allowed."
    });

    return false;
}

function bodyTooLarge(req, res) {
    const headerSize = Number(req.headers["content-length"] || 0);
    let bodySize = 0;

    if (typeof req.body === "string") {
        bodySize = Buffer.byteLength(req.body, "utf8");
    } else if (req.body && typeof req.body === "object") {
        bodySize = Buffer.byteLength(JSON.stringify(req.body), "utf8");
    }

    if (
        (Number.isFinite(headerSize) && headerSize > MAX_BODY_BYTES) ||
        bodySize > MAX_BODY_BYTES
    ) {
        res.status(413).json({
            error: "Request is too large."
        });

        return true;
    }

    return false;
}

function getBody(req) {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
        return req.body;
    }

    if (typeof req.body === "string") {
        try {
            const body = JSON.parse(req.body);

            if (body && typeof body === "object" && !Array.isArray(body)) {
                return body;
            }
        } catch (error) {
            return {};
        }
    }

    return {};
}

async function rateLimit(req, res, bucket, limit, windowSeconds) {
    if (
        typeof bucket !== "string" ||
        !/^[a-zA-Z0-9_-]{1,40}$/.test(bucket) ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        !Number.isInteger(windowSeconds) ||
        windowSeconds < 1
    ) {
        res.status(500).json({
            error: "Invalid rate limit configuration."
        });

        return false;
    }

    const salt = process.env.RATE_LIMIT_SALT;

    if (!salt || salt.length < 32) {
        console.error("RATE_LIMIT_SALT is missing or too short.");

        res.status(503).json({
            error: "Service temporarily unavailable."
        });

        return false;
    }

    const ip = clientIp(req);

    if (ip === "unknown") {
        res.status(503).json({
            error: "Unable to identify request source."
        });

        return false;
    }

    const hashedIp = crypto
        .createHmac("sha256", salt)
        .update(ip)
        .digest("hex");

    const key = `${bucket}:${hashedIp}`;

    try {
        await pool.execute(
            `INSERT INTO rate_limit (rl_key, hits, window_start)
             VALUES (?, 1, UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE
                hits = IF(
                    window_start < TIMESTAMPADD(SECOND, -?, UTC_TIMESTAMP()),
                    1,
                    hits + 1
                ),
                window_start = IF(
                    window_start < TIMESTAMPADD(SECOND, -?, UTC_TIMESTAMP()),
                    UTC_TIMESTAMP(),
                    window_start
                )`,
            [key, windowSeconds, windowSeconds]
        );

        const [rows] = await pool.execute(
            "SELECT hits FROM rate_limit WHERE rl_key = ?",
            [key]
        );

        const hits = rows.length ? Number(rows[0].hits) : 0;

        if (hits > limit) {
            res.setHeader("Retry-After", String(windowSeconds));

            res.status(429).json({
                error: "Too many requests. Please wait before trying again."
            });

            return false;
        }

        return true;
    } catch (error) {
        console.error(
            "Rate limit check failed:",
            error.code || error.message
        );

        res.status(503).json({
            error: "Service temporarily unavailable. Please try again."
        });

        return false;
    }
}

function sendServerError(res, error) {
    console.error(error && (error.code || error.message));

    return res.status(500).json({
        error: "Something went wrong. Please try again."
    });
}

module.exports = {
    allowMethods,
    bodyTooLarge,
    getBody,
    rateLimit,
    sendServerError
};
