import crypto from "node:crypto";
import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = process.env.VLC_DATA_DIR || path.join(__dirname, "data");
const usersFile = path.join(dataDirectory, "users.json");
const showSettingsFile = path.join(dataDirectory, "show-settings.json");

const port = Number(process.env.PORT || 3001);
const authTtlMs = 1000 * 60 * 60 * 12;
const authSecret = process.env.VLC_AUTH_SECRET || "victory-lane-cards-local-auth-secret";
const whatnotProfileUrl = "https://www.whatnot.com/user/chanman84";
const configuredOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.ADDITIONAL_FRONTEND_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredOrigins,
]);

const defaultShowSettings = {
  label: "Next Show",
  headline: "Live Today at 2:30 PM ET",
  messages: [
    "Huge thank you to everyone who joined us last night - the support from this community means everything.",
    "We're back live again today at 2:30 PM and looking forward to seeing you all there.",
    "Let's keep building this together.",
  ],
  buttonLabel: "Watch the Saturday Show",
  buttonHref: whatnotProfileUrl,
  updatedAt: new Date().toISOString(),
};

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

function signValue(value) {
  return crypto.createHmac("sha256", authSecret).update(value).digest("base64url");
}

function issueAuthToken(user) {
  const payload = {
    sub: user.id,
    exp: Date.now() + authTtlMs,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signValue(encodedPayload)}`;
}

function verifyAuthToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.sub || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getRequestToken(request) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.has(origin);
}

function buildCorsHeaders(request) {
  const origin = request.headers.origin;

  if (!origin || !isAllowedOrigin(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
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

function sendJson(request, response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...buildCorsHeaders(request),
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function sendEmpty(request, response, statusCode, extraHeaders = {}) {
  response.writeHead(statusCode, {
    ...buildCorsHeaders(request),
    ...extraHeaders,
  });
  response.end();
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
  const tokenPayload = verifyAuthToken(getRequestToken(request));
  if (!tokenPayload) {
    return null;
  }

  const users = await getSavedUsers();
  const matchingUser = users.find((user) => user.id === tokenPayload.sub);
  return matchingUser ? sanitizeUser(matchingUser) : null;
}

function requireAuthentication(request, response, currentUser) {
  if (!currentUser) {
    sendJson(request, response, 401, { error: "Please sign in before using the admin tools." });
    return false;
  }

  return true;
}

function requireAdminRole(request, response, currentUser) {
  if (currentUser?.role !== "admin") {
    sendJson(request, response, 403, { error: "Admin access is required for that action." });
    return false;
  }

  return true;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (!isAllowedOrigin(request.headers.origin)) {
      sendJson(request, response, 403, { error: "That origin is not allowed to use this API." });
      return;
    }

    if (request.method === "OPTIONS") {
      sendEmpty(request, response, 204);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(request, response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/show-settings") {
      const showSettings = await readJson(showSettingsFile, defaultShowSettings);
      sendJson(request, response, 200, { showSettings });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const currentUser = await getCurrentUser(request);

      if (!currentUser) {
        sendJson(request, response, 401, { error: "No active admin session." });
        return;
      }

      sendJson(request, response, 200, { user: currentUser });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const payload = await readRequestBody(request);
      const username = `${payload.username ?? ""}`.trim().toLowerCase();
      const password = `${payload.password ?? ""}`;

      if (!username || !password) {
        sendJson(request, response, 400, { error: "Username and password are both required." });
        return;
      }

      const users = await getSavedUsers();
      const matchingUser = users.find((user) => user.username === username);

      if (
        !matchingUser ||
        !verifyPassword(password, matchingUser.passwordSalt, matchingUser.passwordHash)
      ) {
        sendJson(request, response, 401, { error: "Those login details did not match a saved user." });
        return;
      }

      sendJson(request, response, 200, {
        token: issueAuthToken(matchingUser),
        user: sanitizeUser(matchingUser),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      sendJson(request, response, 200, { ok: true });
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/auth/password") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(request, response, currentUser)) {
        return;
      }

      const payload = await readRequestBody(request);
      const currentPassword = `${payload.currentPassword ?? ""}`;
      const newPassword = `${payload.newPassword ?? ""}`;

      if (!currentPassword) {
        sendJson(request, response, 400, { error: "Your current password is required." });
        return;
      }

      const passwordError = validateNewPassword(newPassword);
      if (passwordError) {
        sendJson(request, response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      const targetUserIndex = users.findIndex((user) => user.id === currentUser.id);

      if (targetUserIndex === -1) {
        sendJson(request, response, 404, { error: "That user record could not be found." });
        return;
      }

      const targetUser = users[targetUserIndex];
      if (!verifyPassword(currentPassword, targetUser.passwordSalt, targetUser.passwordHash)) {
        sendJson(request, response, 401, { error: "Your current password did not match." });
        return;
      }

      const { salt, hash } = hashPassword(newPassword);
      users[targetUserIndex] = {
        ...targetUser,
        passwordSalt: salt,
        passwordHash: hash,
      };

      await saveUsers(users);
      sendJson(request, response, 200, { ok: true, message: "Your password has been updated." });
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/show-settings") {
      const currentUser = await getCurrentUser(request);
      if (!requireAuthentication(request, response, currentUser)) {
        return;
      }

      const payload = await readRequestBody(request);
      const showSettings = normalizeShowSettings(payload);
      await writeJson(showSettingsFile, showSettings);
      sendJson(request, response, 200, { showSettings });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      const currentUser = await getCurrentUser(request);
      if (
        !requireAuthentication(request, response, currentUser) ||
        !requireAdminRole(request, response, currentUser)
      ) {
        return;
      }

      const users = await getSavedUsers();
      sendJson(request, response, 200, {
        users: users.map((user) => sanitizeUser(user)),
      });
      return;
    }

    if (request.method === "PUT" && /^\/api\/users\/[^/]+\/password$/.test(url.pathname)) {
      const currentUser = await getCurrentUser(request);
      if (
        !requireAuthentication(request, response, currentUser) ||
        !requireAdminRole(request, response, currentUser)
      ) {
        return;
      }

      const userId = decodeURIComponent(url.pathname.split("/")[3] ?? "");
      const payload = await readRequestBody(request);
      const newPassword = `${payload.newPassword ?? ""}`;

      const passwordError = validateNewPassword(newPassword);
      if (passwordError) {
        sendJson(request, response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      const targetUserIndex = users.findIndex((user) => user.id === userId);

      if (targetUserIndex === -1) {
        sendJson(request, response, 404, { error: "That user could not be found." });
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
      sendJson(request, response, 200, {
        ok: true,
        message: `Password updated for ${targetUser.displayName}.`,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/users") {
      const currentUser = await getCurrentUser(request);
      if (
        !requireAuthentication(request, response, currentUser) ||
        !requireAdminRole(request, response, currentUser)
      ) {
        return;
      }

      const payload = await readRequestBody(request);
      const username = `${payload.username ?? ""}`.trim().toLowerCase();
      const displayName = `${payload.displayName ?? ""}`.trim();
      const password = `${payload.password ?? ""}`;
      const role = payload.role === "admin" ? "admin" : "editor";

      if (!/^[a-z0-9_-]{3,24}$/i.test(username)) {
        sendJson(request, response, 400, {
          error: "Username must be 3-24 characters using letters, numbers, dashes, or underscores.",
        });
        return;
      }

      const passwordError = validateNewPassword(password);
      if (passwordError) {
        sendJson(request, response, 400, { error: passwordError });
        return;
      }

      const users = await getSavedUsers();
      if (users.some((user) => user.username === username)) {
        sendJson(request, response, 409, { error: "That username already exists." });
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

      sendJson(request, response, 201, { user: sanitizeUser(newUser) });
      return;
    }

    sendJson(request, response, 404, { error: "That API route was not found." });
  } catch (error) {
    sendJson(request, response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
});

await ensureDataStore();

server.listen(port, () => {
  console.log(`[Victory Lane Cards] Admin API listening on http://localhost:${port}`);
  if (configuredOrigins.length > 0) {
    console.log(`[Victory Lane Cards] Allowed frontend origins: ${configuredOrigins.join(", ")}`);
  }
});
