/**
 * NileScan — CS Knowledge Hub
 * Assignment 2 | CSCI 2170 | Dalhousie University
 * Author : Yassin Ibrahem
 *
 * Node.js core modules only: http, fs, path, url
 * Routes:
 *   GET  /                → home (article list + optional create form)
 *   GET  /article?id=N    → single article view
 *   GET  /login           → login form
 *   POST /login           → process login
 *   POST /logout          → destroy session → redirect /
 *   POST /create          → create article (author only)
 */

"use strict";

const http = require("http");
const fs   = require("fs");
const path = require("path");
const url  = require("url");

// ── Paths ───────────────────────────────────────────────────────────────────
const PORT          = 3000;
const ROOT          = path.join(__dirname, "..");
const VIEWS         = path.join(ROOT, "views");
const DATA          = path.join(ROOT, "data");
const ARTICLES_FILE = path.join(DATA, "articles.json");
const USERS_FILE    = path.join(DATA, "users.json");
const SESSION_FILE  = path.join(DATA, "session.json");

// ── File I/O helpers ─────────────────────────────────────────────────────────
function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); }
  catch { return null; }
}

function writeJSON(filePath, data) {
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8"); return true; }
  catch { return false; }
}

function readView(name) {
  try { return fs.readFileSync(path.join(VIEWS, name), "utf-8"); }
  catch { return `<p style="color:red">View not found: ${name}</p>`; }
}

// ── Session helpers ──────────────────────────────────────────────────────────
function getSession() {
  const data = readJSON(SESSION_FILE);
  if (!data || !data.username) return null;
  return data;
}

function createSession(username, role) {
  writeJSON(SESSION_FILE, { username, role });
}

function destroySession() {
  try { fs.unlinkSync(SESSION_FILE); } catch { /* already gone — fine */ }
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

/** Escape HTML to prevent XSS. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Build the nav-auth HTML snippet based on current session. */
function buildNavAuth(session) {
  if (!session) {
    return `<a href="/login" class="btn-nav btn-signin">Sign In</a>`;
  }
  const roleClass = session.role === "author" ? "author" : "user";
  return `
    <div class="nav-user-pill">
      <span class="u-dot ${roleClass}"></span>
      <span class="u-name">${esc(session.username)}</span>
      <span class="u-role ${roleClass}">${esc(session.role)}</span>
    </div>
    <form method="POST" action="/logout" style="display:inline;margin:0">
      <button type="submit" class="btn-nav btn-signout">Sign Out</button>
    </form>`;
}

/** Build flash HTML (empty string if no flash). */
function buildFlash(msg, type = "info") {
  if (!msg) return "";
  return `<div class="flash-msg ${esc(type)}">${esc(msg)}</div>`;
}

/**
 * Wrap a view body inside header + footer.
 * @param {string} title    - Page title for <title> tag
 * @param {string} body     - HTML body content (from view file after template substitution)
 * @param {object|null} session
 * @param {string} flash    - Optional flash message text
 * @param {string} flashType - "info" | "error" | "success"
 * @param {string} activeRoute - "/" to mark Home as active
 */
function buildPage(title, body, session, flash = "", flashType = "info", activeRoute = "") {
  let header = readView("header.html");
  const footer = readView("footer.html");

  header = header
    .replace(/{{PAGE_TITLE}}/g,  esc(title))
    .replace(/{{NAV_AUTH}}/g,    buildNavAuth(session))
    .replace(/{{FLASH_HTML}}/g,  buildFlash(flash, flashType))
    .replace(/{{HOME_ACTIVE}}/g, activeRoute === "/" ? "active" : "");

  return header + body + footer;
}

// ── Body parser ───────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
      if (body.length > 500_000) { req.destroy(); reject(new Error("Payload too large")); }
    });
    req.on("end",   () => resolve(body));
    req.on("error", reject);
  });
}

/** Parse application/x-www-form-urlencoded body into a plain object (values trimmed). */
function parseForm(bodyStr) {
  const params = new url.URLSearchParams(bodyStr);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v.trim();
  return obj;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function send(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

/** Encode a message safely for use in a query string. */
function encodeFlash(msg) {
  return encodeURIComponent(msg);
}

// ── Route: GET / ──────────────────────────────────────────────────────────────
function handleHome(req, res, session, query) {
  const articles = readJSON(ARTICLES_FILE) || [];
  const flash    = decodeURIComponent(query.flash || "");
  const flashType = query.ft || "info";

  // Sort newest first
  const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build article cards
  const cardsHtml = sorted.length
    ? sorted.map(a => {
        const excerpt = esc(String(a.content).slice(0, 160));
        return `
          <a href="/article?id=${a.id}" class="article-card fade-in d2">
            <div class="card-meta">
              <span class="author-chip">${esc(a.author)}</span>
              <span>${esc(a.date)}</span>
            </div>
            <div class="card-title">${esc(a.title)}</div>
            <div class="card-excerpt">${excerpt}&hellip;</div>
            <div class="card-cta">Read article &rarr;</div>
          </a>`;
      }).join("\n")
    : `<p class="no-articles">No articles yet. Be the first to publish one.</p>`;

  // Create form — only for logged-in authors
  const createForm = (session && session.role === "author")
    ? `<div class="create-panel fade-in d1">
        <h2>Publish a New Article</h2>
        <p class="create-sub">Logged in as <strong style="color:var(--gold)">${esc(session.username)}</strong> &mdash; author</p>
        <form method="POST" action="/create" novalidate>
          <div class="form-row">
            <label class="ns-label" for="title">Article Title</label>
            <input class="ns-input" type="text" id="title" name="title"
              placeholder="e.g. Understanding Memory Allocation in C" required/>
          </div>
          <div class="form-row">
            <label class="ns-label" for="content">Content</label>
            <textarea class="ns-textarea" id="content" name="content"
              placeholder="Write your article here..." required></textarea>
          </div>
          <button type="submit" class="btn-primary">Publish Article &rarr;</button>
        </form>
      </div>`
    : "";

  let body = readView("home.html");
  body = body
    .replace("{{CREATE_FORM}}", createForm)
    .replace("{{ARTICLES_LIST}}", cardsHtml);

  send(res, 200, buildPage("Home", body, session, flash, flashType, "/"));
}

// ── Route: GET /article?id=N ──────────────────────────────────────────────────
function handleArticleDetail(req, res, session, query) {
  const idStr = (query.id || "").trim();
  const id    = parseInt(idStr, 10);

  // Validate id
  if (!idStr || isNaN(id) || id <= 0) {
    return handle404(req, res, session);
  }

  const articles = readJSON(ARTICLES_FILE) || [];
  const article  = articles.find(a => a.id === id);

  if (!article) {
    return handle404(req, res, session);
  }

  // Wrap content into paragraphs
  const paragraphsHtml = String(article.content)
    .split(/\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${esc(p)}</p>`)
    .join("\n");

  let body = readView("article.html");
  body = body
    .replace(/{{ARTICLE_TITLE}}/g,      esc(article.title))
    .replace(/{{ARTICLE_AUTHOR}}/g,     esc(article.author))
    .replace(/{{ARTICLE_DATE}}/g,       esc(article.date))
    .replace(/{{ARTICLE_PARAGRAPHS}}/g, paragraphsHtml);

  send(res, 200, buildPage(article.title, body, session));
}

// ── Route: GET /login ─────────────────────────────────────────────────────────
function handleLoginGet(req, res, session, query) {
  // Already logged in — redirect home
  if (session) return redirect(res, "/");

  const flash     = decodeURIComponent(query.flash || "");
  const flashType = query.ft || "error";
  const body      = readView("login.html");

  send(res, 200, buildPage("Sign In", body, null, flash, flashType));
}

// ── Route: POST /login ────────────────────────────────────────────────────────
async function handleLoginPost(req, res, session) {
  if (session) return redirect(res, "/");

  let fields;
  try {
    const raw = await readBody(req);
    fields = parseForm(raw);
  } catch {
    return redirect(res, `/login?flash=${encodeFlash("Request error.")}&ft=error`);
  }

  const username = fields.username || "";
  const password = fields.password || "";

  // Validate — fields already trimmed by parseForm
  if (!username || !password) {
    return redirect(res, `/login?flash=${encodeFlash("Username and password are required.")}&ft=error`);
  }

  // Look up user
  const users = readJSON(USERS_FILE) || [];
  const user  = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return redirect(res, `/login?flash=${encodeFlash("Invalid username or password.")}&ft=error`);
  }

  // Create session
  createSession(user.username, user.role);
  redirect(res, `/?flash=${encodeFlash(`Welcome back, ${user.username}!`)}&ft=success`);
}

// ── Route: POST /logout ───────────────────────────────────────────────────────
function handleLogout(req, res) {
  destroySession();
  redirect(res, `/?flash=${encodeFlash("You have been signed out.")}&ft=info`);
}

// ── Route: POST /create ───────────────────────────────────────────────────────
async function handleCreate(req, res, session) {
  // Must be logged in as author
  if (!session || session.role !== "author") {
    return redirect(res, `/?flash=${encodeFlash("Access denied. Authors only.")}&ft=error`);
  }

  let fields;
  try {
    const raw = await readBody(req);
    fields = parseForm(raw);
  } catch {
    return redirect(res, `/?flash=${encodeFlash("Request error.")}&ft=error`);
  }

  const title   = fields.title   || "";
  const content = fields.content || "";

  if (!title || !content) {
    return redirect(res, `/?flash=${encodeFlash("Title and content are required.")}&ft=error`);
  }

  const articles = readJSON(ARTICLES_FILE) || [];
  const maxId    = articles.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
  const today    = new Date().toISOString().slice(0, 10);

  articles.push({
    id:      maxId + 1,
    title,
    content,
    author:  session.username,
    date:    today,
  });

  const ok = writeJSON(ARTICLES_FILE, articles);
  if (!ok) {
    return redirect(res, `/?flash=${encodeFlash("Failed to save article. Please try again.")}&ft=error`);
  }

  redirect(res, `/?flash=${encodeFlash(`Article "${title}" published!`)}&ft=success`);
}

// ── Route: 404 ────────────────────────────────────────────────────────────────
function handle404(req, res, session) {
  const body = readView("404.html");
  send(res, 404, buildPage("404 Not Found", body, session));
}

// ── Request dispatcher ────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query    = parsed.query;
  const method   = req.method.toUpperCase();
  const session  = getSession();

  try {
    if (pathname === "/" && method === "GET")             return handleHome(req, res, session, query);
    if (pathname === "/article" && method === "GET")      return handleArticleDetail(req, res, session, query);
    if (pathname === "/login" && method === "GET")        return handleLoginGet(req, res, session, query);
    if (pathname === "/login" && method === "POST")       return await handleLoginPost(req, res, session);
    if (pathname === "/logout" && method === "POST")      return handleLogout(req, res);
    if (pathname === "/create" && method === "POST")      return await handleCreate(req, res, session);

    handle404(req, res, session);
  } catch (err) {
    console.error("Unhandled error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`\n🌊 NileScan is running at http://localhost:${PORT}`);
  console.log(`   Core modules only — no npm install needed.\n`);
});