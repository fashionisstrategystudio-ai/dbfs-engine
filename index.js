const express = require("express");
const { GoogleDecoder } = require("google-news-url-decoder");

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);
const decoder = new GoogleDecoder();

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function isGoogleNewsUrl(value) {
  try {
    const u = new URL(value);
    return /(^|\.)news\.google\.com$/i.test(u.hostname);
  } catch (_) {
    return false;
  }
}

function checkToken(req) {
  const expected = process.env.RESOLVER_TOKEN || "";
  if (!expected) return true;
  const supplied =
    req.get("x-resolver-token") ||
    req.query.token ||
    "";
  return supplied === expected;
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "fashion-engine-news-resolver",
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/resolve", async (req, res) => {
  if (!checkToken(req)) {
    return res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED"
    });
  }

  const input = String(req.query.url || "").trim();

  if (!input || !isHttpUrl(input)) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_URL"
    });
  }

  // Direct publisher URLs pass through unchanged.
  if (!isGoogleNewsUrl(input)) {
    return res.json({
      ok: true,
      method: "PASSTHROUGH",
      source_url: input
    });
  }

  try {
    const result = await decoder.decode(input);

    if (
      result &&
      result.status === true &&
      result.decoded_url &&
      isHttpUrl(result.decoded_url) &&
      !isGoogleNewsUrl(result.decoded_url)
    ) {
      return res.json({
        ok: true,
        method: "GOOGLE_NEWS_DECODER",
        source_url: result.decoded_url
      });
    }

    return res.status(422).json({
      ok: false,
      error: "DECODE_FAILED",
      message: result && result.message ? String(result.message) : ""
    });
  } catch (err) {
    console.error("Resolver error:", err);
    return res.status(500).json({
      ok: false,
      error: "RESOLVER_EXCEPTION",
      message: String(err && err.message ? err.message : err)
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`fashion-engine-news-resolver listening on ${port}`);
});
