import crypto from "node:crypto";
import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const usersFile = path.join(dataDirectory, "users.json");
const showSettingsFile = path.join(dataDirectory, "show-settings.json");

const port = Number(process.env.PORT || 3001);
const cookieName = "vlc_admin_session";
const sessionTtlMs = 1000 * 60 * 60 * 12;
const sessionSecret = process.env.VLC_SESSION_SECRET || "victory-lane-cards-local-session-secret";
const whatnotProfileUrl = "https://www.whatnot.com/user/chanman84";

const defaultShowSettings = {
  label: "Next Show",
  headline: "Live Today at 2:30 PM ET",
  messages: [
    "Huge thank you to everyone who joined us last night — the support from this community means everything.",
    "We're back live again today at 2:30 PM and looking forward to seeing you all there.",
    "Let's keep building this together.",
  ],
  buttonLabel: "Watch the Saturday Show",
  buttonHref: whatnotProfileUrl,
  updatedAt: new Date().toISOString(),
};

const activeSessions = new Map();

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, passwordSalt, passwordHash) {
  const calculatedHash = crypto.pbkdf2Sync(password, passwordSalt, 120000, 64, "sha512").toString("hex");
  const storedBuffer = Buffer.from(passwordHash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  if (storedBuffer.length !== calculatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, calculatedBuffer);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function buildSessionCookie(sessionId, maxAgeSeconds) {
  const signature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex");
  return `${cookieName}=${sessionId}.${signature}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function verifySignedSessionToken(rawToken) {
  if (!rawToken || !rawToken.includes(".")) {
    return null;
  }

  const [sessionId, signature] = rawToken.split(".");
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex");

  if (!signature) {
    return null;
  }

  const providedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer) ? sessionId : null;
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

async function ensureDataStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(showSettingsFile);
  } catch {
    await writeJson(showSettingsFile, defaultShowSettings);
  }

  let usersData = await readJson(usersFile, { users: [] });
  if (!Array.isArray(usersData.users)) {
    usersData = { users: [] };
  }

  if (usersData.users.length === 0) {
    const username = (process.env.VLC_ADMIN_USERNAME || "admin").trim().toLowerCase();
    const password = process.env.VLC_ADMIN_PASSWORD || "ChangeMe123!";
    const { salt, hash } = hashPassword(password);

    usersData.users.push({
      id: crypto.randomUUID(),
      username,
      displayName: "Victory Lane Admin",
      role: "admin",
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    });

    await writeJson(usersFile, usersData);

    console.log("");
    console.log("[Victory Lane Cards] Created initial admin login.");
    console.log(`[Victory Lane Cards] Username: ${username}`);
    console.log(`[Victory Lane Cards] Password: ${password}`);
    console.log("[Victory Lane Cards] Sign in once, then create additional users from the admin panel.");
    console.log("");
  }
}

async function readJson(filePath, fallbackValue) {
  try {
    const rawValue = await fs.readFile(filePath, "utf8");
    return JSON.parse(rawValue);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallbackValue;
    }

    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 1_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });

    request.on("error", reject);
  });
}

function normalizeShowSettings(payload) {
  const messages = Array.isArray(payload.messages)
    ? payload.messages.map((message) => `${message ?? ""}`.trim()).filter(Boolean).slice(0, 3)
    : [];

  const normalizedPayload = {
    label: `${payload.label ?? ""}`.trim() || "Next Show",
    headline: `${payload.headline ?? ""}`.trim(),
    messages,
    buttonLabel: `${payload.buttonLabel ?? ""}`.trim() || "Watch the Saturday Show",
    buttonHref: `${payload.buttonHref ?? ""}`.trim() || whatnotProfileUrl,
    updatedAt: new Date().toISOString(),
  };

  if (!normalizedPayload.headline) {
    throw new Error("Headline is required.");
  }

  if (normalizedPayload.messages.length === 0) {
    throw new Error("At least one show message is required.");
  }

  return normalizedPayload;
}

async function getSavedUsers() {
  const usersData = await readJson(usersFile, { users: [] });
  return Array.isArray(usersData.users) ? usersData.users : [];
}

async function saveUsers(users) {
  await writeJson(usersFile, { users });
}

function validateNewPassword(password) {
  if (password.length < 8) {
    return "Passwords must be at least 8 characters long.";
  }

  return null;
}

async function getCurrentUser(request) {
  const cookies = parseCookies(request.headers.cookie);
  const sessionToken = cookies[cookieName];
  const sessionId = verifySignedSessionToken(sessionToken);

  if (!sessionId) {
    return null;
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(sessionId);
    return null;
  }

  const users = await getSavedUsers();
  const matchingUser = users.find((user) => user.id === session.userId);
  if (!matchingUser) {
    activeSessions.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + sessionTtlMs;
  activeSessions.set(sessionId, session);

  return sanitizeUser(matchingUser);
}

function requireAuthentication(response, currentUser) {
  if (!currentUser) {
    sendJson(
      response,
      401,
      { error: "Please sign in before using the admin tools." },
      { "Set-Cookie": clearSessionCookie() },
    );
    return false;
  }

  return true;
}

function requireAdminRole(response, currentUser) {
  if (currentUser?.role !== "admin") {
    sendJson(response, 403, { error: "Admin access is required for that action." });
    return false;
  }

  return true;
}

function cleanupExpiredSessions() {
  const now = Date.now();

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(sessionId);
    }
  }
}

const server = http.createServer(async (request, response) => {
  cleanupExpiredSessions();

  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/show-settings") {
      const showSettings = await readJson(showSettingsFile, defaultShowSettings);
      sendJson(response, 200, { showSettings });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const currentUser = await getCurrentUser(request);

      if (!currentUser) {
        sendJson(
          response,
          401,
          { error: "No active admin session." },
          { "Set-Cookie": clearSessionCookie() },
        );
        return;
      }

      sendJson(response, 200, { user: currentUser });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const payload = await readRequestBody(request);
      const username = `${payload.username ?? ""}`.trim().toLowerCase();
      const password = `${payload.password ?? ""}`;

      if (!username || !password) {
        sendJson(response, 400, { error: "Username and password are both required." });
        return;
      }

      const users = await getSavedUsers();
      const matchingUser = users.find((user) => user.username === username);

      if (
        !matchingUser ||
        !verifyPassword(password, matchingUser.passwordSalt, matchingUser.passwordHash)
      ) {
        sendJson(response, 401, { error: "Those login details didn't match a saved user." });
        return;
      }

      const sessionId = crypto.randomUUID();
      activeSessions.set(sessionId, {
        userId: matchingUser.id,
        expiresAt: Date.now() + sessionTtlMs,
      });

      sendJson(
        response,
        200,
        { user: sanitizeUser(matchingUser) },
        { "Set-Cookie": buildSessionCookie(sessionId, Math.floor(sessionTtlMs / 1000)) },
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const cookies = parseCookies(request.headers.cookie);
      const sessionId = verifySignedSessionToken(cookies[cookieName]);
      if (sessionId) {
        activeSessions.delete(sessionId);
      }

      sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/auth/password") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(response, currentUser)) {
        return;
      }

      const payload = await readRequestBody(request);
      const currentPassword = `${payload.currentPassword ?? ""}`;
      const newPassword = `${payload.newPassword ?? ""}`;

      if (!currentPassword) {
        sendJson(response, 400, { error: "Your current password is required." });
        return;
      }

      const passwordError = validateNewPassword(newPassword);
      if (passwordError) {
        sendJson(response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      const targetUserIndex = users.findIndex((user) => user.id === currentUser.id);

      if (targetUserIndex === -1) {
        sendJson(response, 404, { error: "That user record could not be found." });
        return;
      }

      const targetUser = users[targetUserIndex];
      if (!verifyPassword(currentPassword, targetUser.passwordSalt, targetUser.passwordHash)) {
        sendJson(response, 401, { error: "Your current password didn't match." });
        return;
      }

      const { salt, hash } = hashPassword(newPassword);
      users[targetUserIndex] = {
        ...targetUser,
        passwordSalt: salt,
        passwordHash: hash,
      };

      await saveUsers(users);
      sendJson(response, 200, { ok: true, message: "Your password has been updated." });
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/show-settings") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(response, currentUser)) {
        return;
      }

      const payload = await readRequestBody(request);
      const showSettings = normalizeShowSettings(payload);
      await writeJson(showSettingsFile, showSettings);
      sendJson(response, 200, { showSettings });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(response, currentUser) || !requireAdminRole(response, currentUser)) {
        return;
      }

      const users = await getSavedUsers();
      sendJson(response, 200, {
        users: users.map((user) => sanitizeUser(user)),
      });
      return;
    }

    if (request.method === "PUT" && /^\/api\/users\/[^/]+\/password$/.test(url.pathname)) {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(response, currentUser) || !requireAdminRole(response, currentUser)) {
        return;
      }

      const userId = decodeURIComponent(url.pathname.split("/")[3] ?? "");
      const payload = await readRequestBody(request);
      const newPassword = `${payload.newPassword ?? ""}`;

      const passwordError = validateNewPassword(newPassword);
      if (passwordError) {
        sendJson(response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      const targetUserIndex = users.findIndex((user) => user.id === userId);

      if (targetUserIndex === -1) {
        sendJson(response, 404, { error: "That user could not be found." });
        return;
      }

      const targetUser = users[targetUserIndex];
      const { salt, hash } = hashPassword(newPassword);
      users[targetUserIndex] = {
        ...targetUser,
        passwordSalt: salt,
        passwordHash: hash,
      };

      await saveUsers(users);
      sendJson(response, 200, {
        ok: true,
        message: `Password updated for ${targetUser.displayName}.`,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/users") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(response, currentUser) || !requireAdminRole(response, currentUser)) {
        return;
      }

      const payload = await readRequestBody(request);
      const username = `${payload.username ?? ""}`.trim().toLowerCase();
      const displayName = `${payload.displayName ?? ""}`.trim();
      const password = `${payload.password ?? ""}`;
      const role = payload.role === "admin" ? "admin" : "editor";

      if (!/^[a-z0-9_-]{3,24}$/i.test(username)) {
        sendJson(response, 400, {
          error: "Username must be 3-24 characters using letters, numbers, dashes, or underscores.",
        });
        return;
      }

      const passwordError = validateNewPassword(password);
      if (passwordError) {
        sendJson(response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      if (users.some((user) => user.username === username)) {
        sendJson(response, 409, { error: "That username already exists." });
        return;
      }

      const { salt, hash } = hashPassword(password);
      const newUser = {
        id: crypto.randomUUID(),
        username,
        displayName: displayName || username,
        role,
        passwordSalt: salt,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await saveUsers(users);

      sendJson(response, 201, { user: sanitizeUser(newUser) });
      return;
    }

    sendJson(response, 404, { error: "That API route wasn't found." });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
});

await ensureDataStore();

server.listen(port, () => {
  console.log(`[Victory Lane Cards] Admin server listening on http://localhost:${port}`);
});
