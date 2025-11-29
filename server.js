import { createServer } from "http";
import { readFile, writeFileSync, existsSync, readFileSync } from "fs";
import path, { dirname, extname, normalize } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, "contact-submissions.json");
const PUBLIC_DIR = __dirname;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function handleContact(req, res) {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      body = "";
      res.writeHead(413);
      res.end();
      req.connection.destroy();
    }
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body || "{}");
      const entry = {
        name: (data.name || "").toString().trim(),
        email: (data.email || "").toString().trim(),
        phone: (data.phone || "").toString().trim(),
        company: (data.company || "").toString().trim(),
        message: (data.message || "").toString().trim(),
        createdAt: new Date().toISOString(),
      };

      if (!entry.name || !entry.email || !entry.message) {
        return sendJson(res, 400, { error: "Missing required fields" });
      }

      let existing = [];
      try {
        if (existsSync(DATA_FILE)) {
          existing = JSON.parse(readFileSync(DATA_FILE, "utf8") || "[]");
        }
      } catch {
        existing = [];
      }

      existing.push(entry);
      writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2));

      sendJson(res, 200, { ok: true });
    } catch {
      sendJson(res, 400, { error: "Invalid request" });
    }
  });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
}

const server = createServer((req, res) => {
  if (req.url.startsWith("/api/contact")) {
    return handleContact(req, res);
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
