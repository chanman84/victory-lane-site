import { useEffect, useState } from "react";
import "./App.css";
import indyHero from "./assets/indy.jpg";
import vlcLogo from "./assets/VLCLogo.jpg";
import ownerPhoto from "./assets/Owner.jpg";
import indycarBg from "./assets/indycar.png";
import baseballBg from "./assets/baseb.png";
import footballBg from "./assets/football.png";
import hockeyBg from "./assets/Hockey.png";
import vintageBg from "./assets/vintage.png";
import vlcName from "./assets/VLCName.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Saturday Show", href: "#saturday-show" },
  { label: "Referrals", href: "#referrals" },
  { label: "Categories", href: "#categories" },
  { label: "Contact", href: "#contact" },
];

const whatnotProfileUrl = "https://www.whatnot.com/user/chanman84";
const facebookPageUrl = "https://www.facebook.com/profile.php?id=61587744621760";
const instagramUrl = "https://www.instagram.com/victorylane_cards/?hl=en";
const buyerReferralUrl = "https://whatnot.com/invite/chanman84";
const sellerReferralUrl = "https://whatnot.com/invite/seller/chanman84";
const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL ?? ""}`.trim().replace(/\/$/, "");
const adminTokenStorageKey = "vlc_admin_token";

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
};

const referralCards = [
  {
    title: "Watch on Whatnot",
    description:
      "Get into the room before the best cards move. Saturday nights bring fast-paced singles, competitive bidding, and a live experience built for collectors who don't want to miss out.",
    href: whatnotProfileUrl,
    button: "Enter the Live Room",
    featured: true,
  },
  {
    title: "Buyer Referral Link",
    description:
      "New to Whatnot? Start here. Get into the hobby with a buyer referral that makes it easier to jump in, grab your first cards, and experience the energy of a live show.",
    href: buyerReferralUrl,
    button: "Start as a Buyer",
  },
  {
    title: "Seller Referral Link",
    description:
      "Thinking about selling? Use this referral to get started on Whatnot with a setup built around consistency, transparency, and a real collector audience.",
    href: sellerReferralUrl,
    button: "Start Selling on Whatnot",
  },
];

const categories = [
  {
    title: "IndyCar",
    theme: "indycar",
    description:
      "Where Victory Lane Begins. A dedicated lane for IndyCar singles, racing legends, modern drivers, and collector-focused pieces that define the Victory Lane identity.",
  },
  {
    title: "Baseball",
    theme: "baseball",
    description:
      "The backbone of the hobby. Bowman, flagship, chrome, rookies, autos, and key singles - built for collectors who understand the market and move with it.",
  },
  {
    title: "Football",
    theme: "football",
    description:
      "High upside, fast action. Quarterbacks, patch autos, numbered parallels, and impact singles that move quickly when the show is live.",
  },
  {
    title: "Hockey",
    theme: "hockey",
    description:
      "Undervalued depth, serious collectors. Young Guns, star players, sharp slabs, and quality inventory that stands out from the standard rotation.",
  },
  {
    title: "Vintage",
    theme: "vintage",
    description:
      "History that still competes. Classic cardboard with proven appeal - built for collectors who value legacy, condition, and long-term relevance.",
  },
];

const reasons = [
  {
    title: "Fair, consistent pricing.",
    body: "Respect for both the card and the collector - every time.",
  },
  {
    title: "Transparent, clean live shows.",
    body: "No confusion, no gimmicks - just straightforward selling.",
  },
  {
    title: "Built for collectors first.",
    body: "Driven by hobby trust, not corporate polish.",
  },
  {
    title: "Energy that's part of the brand.",
    body: "Not forced - built into every show from the start.",
  },
  {
    title: "Saturday is the destination.",
    body: "A weekly show collectors can count on - and come back for.",
  },
  {
    title: "Multi-platform, one community.",
    body: "Live selling on Whatnot, supported by Facebook, Instagram, and a growing web presence.",
  },
  {
    title: "Consistent execution, every show.",
    body: "A structured approach that keeps things smooth, predictable, and professional week after week.",
  },
  {
    title: "Built for long-term collectors.",
    body: "Focused on relationships, not one-time transactions.",
  },
];

function buildShowForm(settings) {
  const messages = Array.isArray(settings.messages) ? settings.messages : [];
  return {
    label: settings.label ?? defaultShowSettings.label,
    headline: settings.headline ?? defaultShowSettings.headline,
    messageOne: messages[0] ?? "",
    messageTwo: messages[1] ?? "",
    messageThree: messages[2] ?? "",
    buttonLabel: settings.buttonLabel ?? defaultShowSettings.buttonLabel,
    buttonHref: settings.buttonHref ?? defaultShowSettings.buttonHref,
  };
}

function normalizeShowSettings(rawSettings) {
  return {
    label: rawSettings?.label?.trim() || defaultShowSettings.label,
    headline: rawSettings?.headline?.trim() || defaultShowSettings.headline,
    messages: Array.isArray(rawSettings?.messages) && rawSettings.messages.length > 0
      ? rawSettings.messages.filter(Boolean).slice(0, 3)
      : defaultShowSettings.messages,
    buttonLabel: rawSettings?.buttonLabel?.trim() || defaultShowSettings.buttonLabel,
    buttonHref: rawSettings?.buttonHref?.trim() || defaultShowSettings.buttonHref,
  };
}

function buildShowPayload(form) {
  return {
    label: form.label.trim(),
    headline: form.headline.trim(),
    messages: [form.messageOne, form.messageTwo, form.messageThree]
      .map((message) => message.trim())
      .filter(Boolean),
    buttonLabel: form.buttonLabel.trim(),
    buttonHref: form.buttonHref.trim(),
  };
}

function buildApiUrl(pathname) {
  return apiBaseUrl ? `${apiBaseUrl}${pathname}` : pathname;
}

function readStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(adminTokenStorageKey) || "";
}

function writeStoredToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(adminTokenStorageKey, token);
  } else {
    window.localStorage.removeItem(adminTokenStorageKey);
  }
}

function buildAuthHeaders(token, headers = {}) {
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H16.8V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H7.5v3h2.8v8h3.2Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 1.8A2.7 2.7 0 1 0 14.7 12 2.7 2.7 0 0 0 12 9.3Z"
      />
    </svg>
  );
}

function WhatnotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 4.5h4.5l1.6 2.2h5.4A1.5 1.5 0 0 1 19 8.2v8.1A3.7 3.7 0 0 1 15.3 20H8.7A3.7 3.7 0 0 1 5 16.3V6A1.5 1.5 0 0 1 6.5 4.5H6Zm1.2 2.2v9.6a1.5 1.5 0 0 0 1.5 1.5h6.6a1.5 1.5 0 0 0 1.5-1.5V8.9h-5.1L10.1 6.7H7.2Zm2.6 2.4h1.8v5.2H9.8V9.1Zm3.1 0h1.8v5.2h-1.8V9.1Z"
      />
    </svg>
  );
}

function App() {
  const [showSettings, setShowSettings] = useState(defaultShowSettings);
  const [showForm, setShowForm] = useState(buildShowForm(defaultShowSettings));
  const [showApiOnline, setShowApiOnline] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authToken, setAuthToken] = useState(() => readStoredToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showSaveState, setShowSaveState] = useState({ type: "idle", message: "" });
  const [showSaving, setShowSaving] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "editor",
  });
  const [userFormState, setUserFormState] = useState({ type: "idle", message: "" });
  const [userSaving, setUserSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordState, setPasswordState] = useState({ type: "idle", message: "" });
  const [resetPasswordForms, setResetPasswordForms] = useState({});
  const [resetPasswordStates, setResetPasswordStates] = useState({});
  const [resettingUserId, setResettingUserId] = useState("");

  useEffect(() => {
    void loadShowSettings();

    if (authToken) {
      void loadSession(authToken);
    } else {
      setSessionLoading(false);
    }
  }, []);

  function persistAuthToken(nextToken) {
    setAuthToken(nextToken);
    writeStoredToken(nextToken);
  }

  function clearAuthSession(message = "") {
    persistAuthToken("");
    setCurrentUser(null);
    setUserList([]);
    setAuthError(message);
  }

  async function loadShowSettings() {
    try {
      const response = await fetch(buildApiUrl("/api/show-settings"));
      const data = await readJson(response);
      setShowApiOnline(true);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load live show settings.");
      }

      const normalizedSettings = normalizeShowSettings(data?.showSettings);
      setShowSettings(normalizedSettings);
      setShowForm(buildShowForm(normalizedSettings));
    } catch (error) {
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    }
  }

  async function loadSession(tokenToUse = authToken) {
    if (!tokenToUse) {
      setSessionLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/session"), {
        headers: buildAuthHeaders(tokenToUse),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("");
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to check admin session.");
      }

      setCurrentUser(data.user);
      setAuthError("");

      if (data.user?.role === "admin") {
        await loadUsers(tokenToUse);
      }
    } catch (error) {
      clearAuthSession("The admin API is offline right now. Once the Render service is live, the admin tools will connect automatically.");
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setSessionLoading(false);
    }
  }

  async function loadUsers(tokenToUse = authToken) {
    if (!tokenToUse) {
      return;
    }

    setUsersLoading(true);

    try {
      const response = await fetch(buildApiUrl("/api/users"), {
        headers: buildAuthHeaders(tokenToUse),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("Your admin session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load users.");
      }

      setUserList(data.users ?? []);
    } catch (error) {
      setUserFormState({
        type: "error",
        message: error.message || "We couldn't load the saved admin users.",
      });
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setUsersLoading(false);
    }
  }

  function openAdminPanel() {
    setAdminOpen(true);
    setAuthError("");
  }

  function closeAdminPanel() {
    setAdminOpen(false);
    setShowSaveState({ type: "idle", message: "" });
    setUserFormState({ type: "idle", message: "" });
    setPasswordState({ type: "idle", message: "" });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setResetPasswordForms({});
    setResetPasswordStates({});
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginPending(true);
    setAuthError("");

    try {
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to sign in.");
      }

      persistAuthToken(data.token || "");
      setCurrentUser(data.user);
      setLoginForm({ username: "", password: "" });

      if (data.user?.role === "admin") {
        await loadUsers(data.token);
      } else {
        setUserList([]);
      }
    } catch (error) {
      setAuthError(error.message || "We couldn't sign you in.");
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setSessionLoading(false);
      setLoginPending(false);
    }
  }

  function handleLogout() {
    clearAuthSession("");
    setUserFormState({ type: "idle", message: "" });
    setPasswordState({ type: "idle", message: "" });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setResetPasswordForms({});
    setResetPasswordStates({});
  }

  async function handleShowSave(event) {
    event.preventDefault();

    const payload = buildShowPayload(showForm);
    if (!payload.headline) {
      setShowSaveState({
        type: "error",
        message: "The show headline can't be empty.",
      });
      return;
    }

    if (payload.messages.length === 0) {
      setShowSaveState({
        type: "error",
        message: "Add at least one show message so the card has something to say.",
      });
      return;
    }

    setShowSaving(true);
    setShowSaveState({ type: "idle", message: "" });

    try {
      const response = await fetch(buildApiUrl("/api/show-settings"), {
        method: "PUT",
        headers: buildAuthHeaders(authToken, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("Your admin session expired. Please sign in again.");
        setShowSaveState({
          type: "error",
          message: "Your session expired before the update could be saved.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save show settings.");
      }

      const normalizedSettings = normalizeShowSettings(data?.showSettings);
      setShowSettings(normalizedSettings);
      setShowForm(buildShowForm(normalizedSettings));
      setShowSaveState({
        type: "success",
        message: "The homepage show notification is live.",
      });
    } catch (error) {
      setShowSaveState({
        type: "error",
        message: error.message || "We couldn't save those show settings.",
      });
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setShowSaving(false);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setUserSaving(true);
    setUserFormState({ type: "idle", message: "" });

    try {
      const response = await fetch(buildApiUrl("/api/users"), {
        method: "POST",
        headers: buildAuthHeaders(authToken, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(userForm),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("Your admin session expired. Please sign in again.");
        setUserFormState({
          type: "error",
          message: "Your session expired before that user could be created.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create that user.");
      }

      setUserForm({
        username: "",
        displayName: "",
        password: "",
        role: "editor",
      });
      setUserFormState({
        type: "success",
        message: "New admin access has been created.",
      });
      await loadUsers();
    } catch (error) {
      setUserFormState({
        type: "error",
        message: error.message || "We couldn't create that user.",
      });
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setUserSaving(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setPasswordState({
        type: "error",
        message: "Use at least 8 characters for the new password.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState({
        type: "error",
        message: "The new password and confirmation did not match.",
      });
      return;
    }

    setPasswordSaving(true);
    setPasswordState({ type: "idle", message: "" });

    try {
      const response = await fetch(buildApiUrl("/api/auth/password"), {
        method: "PUT",
        headers: buildAuthHeaders(authToken, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("Your admin session expired. Please sign in again.");
        setPasswordState({
          type: "error",
          message: "Your session expired before the password change completed.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update your password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordState({
        type: "success",
        message: "Your password has been updated.",
      });
    } catch (error) {
      setPasswordState({
        type: "error",
        message: error.message || "We couldn't update your password.",
      });
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleUserPasswordReset(event, userId) {
    event.preventDefault();

    const nextPassword = resetPasswordForms[userId] ?? "";
    if (nextPassword.length < 8) {
      setResetPasswordStates((current) => ({
        ...current,
        [userId]: {
          type: "error",
          message: "Use at least 8 characters for the replacement password.",
        },
      }));
      return;
    }

    setResettingUserId(userId);
    setResetPasswordStates((current) => ({
      ...current,
      [userId]: {
        type: "idle",
        message: "",
      },
    }));

    try {
      const response = await fetch(buildApiUrl(`/api/users/${userId}/password`), {
        method: "PUT",
        headers: buildAuthHeaders(authToken, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          newPassword: nextPassword,
        }),
      });
      const data = await readJson(response);
      setShowApiOnline(true);

      if (response.status === 401) {
        clearAuthSession("Your admin session expired. Please sign in again.");
        setResetPasswordStates((current) => ({
          ...current,
          [userId]: {
            type: "error",
            message: "Your session expired before that password update completed.",
          },
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update that user's password.");
      }

      setResetPasswordForms((current) => ({
        ...current,
        [userId]: "",
      }));
      setResetPasswordStates((current) => ({
        ...current,
        [userId]: {
          type: "success",
          message: data?.message || "Password updated.",
        },
      }));
    } catch (error) {
      setResetPasswordStates((current) => ({
        ...current,
        [userId]: {
          type: "error",
          message: error.message || "We couldn't update that password.",
        },
      }));
      if (error instanceof TypeError) {
        setShowApiOnline(false);
      }
    } finally {
      setResettingUserId("");
    }
  }

  return (
    <div className="site-shell" id="home">
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand-lockup" href="#home">
            <img
              className="brand-lockup__logo"
              src={vlcLogo}
              alt="Victory Lane Cards logo"
            />
            <div className="brand-lockup__text">
              <span className="brand-lockup__name">Victory Lane Cards</span>
              <span className="brand-lockup__tagline">Where Collecting Meets Competition</span>
            </div>
          </a>

          <nav className="main-nav" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="button button--secondary topbar-admin"
              onClick={openAdminPanel}
            >
              {currentUser ? "Admin Dashboard" : "Admin Login"}
            </button>
            <a className="button button--primary topbar-cta" href={whatnotProfileUrl}>
              Watch on Whatnot
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="cover-section">
          <div className="container">
            <div className="cover-frame">
              <img
                className="cover-frame__image"
                src={indyHero}
                alt="Indianapolis Motor Speedway yard of bricks"
              />
              <div className="cover-frame__photo-accent" aria-hidden="true" />
              <div className="cover-frame__overlay" />
              <div className="cover-frame__content">
                <img
                  className="cover-frame__title-image"
                  src={vlcName}
                  alt="Victory Lane Cards"
                />
                <p className="cover-frame__tagline">Where Collecting Meets Competition</p>
                <p className="cover-frame__copy">
                  Family-built. Professionally driven. Collector-focused. Powered by a lifelong passion for collecting
                  and nearly two decades in IT operations, Victory Lane Cards brings structure, transparency, and
                  reliability to live sports card sales across baseball, football, hockey, and vintage.
                </p>
                <div className="cover-frame__actions">
                  <a className="button button--primary" href={whatnotProfileUrl}>
                    Join Saturday Show
                  </a>
                  <a className="button button--secondary" href={facebookPageUrl}>
                    Visit Facebook Page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section" id="saturday-show">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Featured Event</p>
              <h2>Saturday is the headline slot.</h2>
              <p>
                Saturday is where everything comes together. Each week, we bring the energy of the hobby to a live,
                structured show built for collectors - combining transparency, fast-moving singles, and a community
                that knows how to compete.
              </p>
            </div>

            <div className="show-highlight">
              <div className="show-highlight__main">
                <span className="show-badge">Live Every Saturday</span>
                <h3>Victory Lane Saturday Singles Show</h3>
                <p>
                  From Racing and baseball to football, hockey, vintage, and select Pokemon - every show is built for
                  momentum. Expect clean singles, real-time action, and a community-driven experience that keeps things
                  moving.
                </p>
              </div>

              <div className="show-schedule-card">
                <span className="show-schedule-card__label">{showSettings.label}</span>
                <strong>{showSettings.headline}</strong>
                {showSettings.messages.map((message, index) => (
                  <p key={`${message}-${index}`}>{message}</p>
                ))}
                <a className="button button--primary button--block" href={showSettings.buttonHref}>
                  {showSettings.buttonLabel}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="referral-section" id="referrals">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Action Center</p>
              <h2>Referral links and show traffic, all in one place.</h2>
              <p>Everything you need to join, buy, or start selling - right here.</p>
            </div>

            <div className="referral-grid">
              {referralCards.map((card) => (
                <article
                  key={card.title}
                  className={`referral-card${card.featured ? " referral-card--featured" : ""}`}
                >
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <a className={`button ${card.featured ? "button--primary" : "button--secondary"}`} href={card.href}>
                    {card.button}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="categories-section" id="categories">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Categories</p>
              <h2>Built around what your audience actually collects.</h2>
              <p>
                IndyCar at the core, backed by baseball, football, hockey, and vintage - a mix built for collectors
                who want something different.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <article key={category.title} className={`category-card category-card--${category.theme}`}>
                  <div
                    className="category-card__bg"
                    aria-hidden="true"
                    style={
                      category.theme === "indycar"
                        ? { backgroundImage: `url(${indycarBg})` }
                        : category.theme === "baseball"
                          ? { backgroundImage: `url(${baseballBg})` }
                          : category.theme === "football"
                            ? { backgroundImage: `url(${footballBg})` }
                            : category.theme === "hockey"
                              ? { backgroundImage: `url(${hockeyBg})` }
                              : category.theme === "vintage"
                                ? { backgroundImage: `url(${vintageBg})` }
                                : undefined
                    }
                  />
                  <div className="category-card__accent" />
                  <div className="category-card__content">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-section" id="about">
          <div className="container">
            <div className="profile-card">
              <div className="profile-card__identity">
                <div className="profile-card__avatar-wrap">
                  <img
                    className="profile-card__avatar"
                    src={ownerPhoto}
                    alt="Victory Lane Cards owner"
                  />
                </div>
                <div className="profile-card__copy">
                  <h2>About Victory Lane Cards</h2>
                  <p className="profile-card__tagline">Where Collecting Meets Competition</p>
                  <p>
                    Victory Lane Cards started as more than just a business - it was built around family, time, and
                    purpose.
                  </p>
                  <p>
                    What began as a way to share the hobby of collecting has grown into something much deeper: an
                    opportunity for our family to build something together. My wife Jenn, my son Nick, and my daughter
                    Lilly are all part of this journey, learning, growing, and contributing as we go.
                  </p>
                  <p>
                    The inspiration behind it came during a difficult time. As my father battled cancer for the fifth
                    time, I made it a priority to spend as much time with him as possible. One of our traditions has
                    always been attending the St. Pete Grand Prix together - a reminder of how meaningful shared
                    experiences can be.
                  </p>
                  <p>
                    That season of life made one thing clear: I wished I had started building something alongside him
                    sooner.
                  </p>
                  <p>
                    Victory Lane Cards is my way of ensuring my children don't have that same regret. It's about
                    creating something that evolves with them - from childhood into adulthood - where we're not just
                    family, but teammates working toward a shared goal.
                  </p>
                  <p className="profile-card__trust">
                    At its core, this isn't just about cards. It's about building relationships, creating memories,
                    and competing together every step of the way.
                  </p>
                </div>
              </div>

              <div className="profile-card__stats">
                <div className="info-chip">
                  <span className="info-chip__label">Focus</span>
                  <strong>IndyCar-led singles, core sports, and a growing collector community</strong>
                </div>
                <div className="info-chip">
                  <span className="info-chip__label">Main Platform</span>
                  <strong>Built on Facebook, expanding into a dedicated collector hub</strong>
                </div>
                <div className="info-chip">
                  <span className="info-chip__label">Weekly Rhythm</span>
                  <strong>Saturday is race day - live Whatnot shows every week</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reasons-section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Why Collectors Choose Us</p>
              <h2>Trust, energy, and hobby credibility.</h2>
            </div>

            <div className="reasons-grid">
              {reasons.map((reason) => (
                <div key={reason.title} className="reason-tile">
                  <p>
                    <strong>{reason.title}</strong> {reason.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="container footer__inner">
          <div>
            <h2>Victory Lane Cards</h2>
            <p>Where Collecting Meets Competition</p>
          </div>

          <div className="footer__links">
            <a
              href={facebookPageUrl}
              className="footer__icon-link"
              aria-label="Facebook Page"
              title="Facebook Page"
            >
              <FacebookIcon />
            </a>
            <a
              href={instagramUrl}
              className="footer__icon-link"
              aria-label="Instagram"
              title="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatnotProfileUrl}
              className="footer__icon-link"
              aria-label="Whatnot Show"
              title="Whatnot Show"
            >
              <WhatnotIcon />
            </a>
            <a href="mailto:james@victorylanecards.com">james@victorylanecards.com</a>
          </div>
        </div>
      </footer>

      <div className={`admin-shell${adminOpen ? " is-open" : ""}`} aria-hidden={!adminOpen}>
        <button
          type="button"
          className="admin-shell__backdrop"
          onClick={closeAdminPanel}
          aria-label="Close admin panel"
        />
        <section
          className="admin-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-panel-title"
        >
          <div className="admin-panel__header">
            <div>
              <p className="eyebrow">Admin Access</p>
              <h2 id="admin-panel-title">
                {currentUser ? "Show Control Center" : "Sign in to manage show updates"}
              </h2>
            </div>
            <button type="button" className="admin-close" onClick={closeAdminPanel}>
              Close
            </button>
          </div>

          {!showApiOnline && (
            <div className="admin-alert admin-alert--warning">
              The admin API is offline or unreachable. Once the Render service is live and VITE_API_BASE_URL is set,
              the admin tools will connect here automatically.
            </div>
          )}

          {sessionLoading ? (
            <p className="admin-empty">Checking your saved admin session...</p>
          ) : currentUser ? (
            <div className="admin-panel__grid">
              <section className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <h3>Logged in and ready</h3>
                    <p>
                      You can update the live show card here, and the homepage will use the latest saved version.
                    </p>
                  </div>
                  <button type="button" className="button button--secondary" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>

                <div className="admin-panel__meta">
                  <span className="admin-pill">{currentUser.displayName}</span>
                  <span className="admin-pill admin-pill--muted">{currentUser.role}</span>
                </div>

                <form className="admin-form" onSubmit={handleShowSave}>
                  <div className="admin-form__row">
                    <label className="admin-field">
                      <span>Status Label</span>
                      <input
                        type="text"
                        value={showForm.label}
                        onChange={(event) => setShowForm((current) => ({
                          ...current,
                          label: event.target.value,
                        }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Headline</span>
                      <input
                        type="text"
                        value={showForm.headline}
                        onChange={(event) => setShowForm((current) => ({
                          ...current,
                          headline: event.target.value,
                        }))}
                      />
                    </label>
                  </div>

                  <label className="admin-field">
                    <span>Message One</span>
                    <textarea
                      value={showForm.messageOne}
                      onChange={(event) => setShowForm((current) => ({
                        ...current,
                        messageOne: event.target.value,
                      }))}
                    />
                  </label>

                  <label className="admin-field">
                    <span>Message Two</span>
                    <textarea
                      value={showForm.messageTwo}
                      onChange={(event) => setShowForm((current) => ({
                        ...current,
                        messageTwo: event.target.value,
                      }))}
                    />
                  </label>

                  <label className="admin-field">
                    <span>Message Three</span>
                    <textarea
                      value={showForm.messageThree}
                      onChange={(event) => setShowForm((current) => ({
                        ...current,
                        messageThree: event.target.value,
                      }))}
                    />
                  </label>

                  <div className="admin-form__row">
                    <label className="admin-field">
                      <span>Button Label</span>
                      <input
                        type="text"
                        value={showForm.buttonLabel}
                        onChange={(event) => setShowForm((current) => ({
                          ...current,
                          buttonLabel: event.target.value,
                        }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Button URL</span>
                      <input
                        type="url"
                        value={showForm.buttonHref}
                        onChange={(event) => setShowForm((current) => ({
                          ...current,
                          buttonHref: event.target.value,
                        }))}
                      />
                    </label>
                  </div>

                  <div className="admin-form__actions">
                    <p className={`admin-status ${showSaveState.type ? `admin-status--${showSaveState.type}` : ""}`}>
                      {showSaveState.message || "Save here any time you want to update the homepage show card."}
                    </p>
                    <button type="submit" className="button button--primary" disabled={showSaving}>
                      {showSaving ? "Saving..." : "Save Show Update"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <h3>Change your password</h3>
                    <p>Use this any time you want to rotate your own login without creating a replacement user.</p>
                  </div>
                </div>

                <form className="admin-form" onSubmit={handlePasswordChange}>
                  <label className="admin-field">
                    <span>Current Password</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))}
                    />
                  </label>

                  <div className="admin-form__row">
                    <label className="admin-field">
                      <span>New Password</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordForm.newPassword}
                        onChange={(event) => setPasswordForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Confirm New Password</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))}
                      />
                    </label>
                  </div>

                  <div className="admin-form__actions">
                    <p className={`admin-status ${passwordState.type ? `admin-status--${passwordState.type}` : ""}`}>
                      {passwordState.message || "Pick a new password with at least 8 characters."}
                    </p>
                    <button type="submit" className="button button--primary" disabled={passwordSaving}>
                      {passwordSaving ? "Updating..." : "Update My Password"}
                    </button>
                  </div>
                </form>
              </section>

              {currentUser.role === "admin" && (
                <section className="admin-card">
                  <div className="admin-card__header">
                    <div>
                      <h3>Admin users</h3>
                      <p>Add more people here when you want trusted teammates to log in and update the show card.</p>
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleCreateUser}>
                    <div className="admin-form__row">
                      <label className="admin-field">
                        <span>Username</span>
                        <input
                          type="text"
                          value={userForm.username}
                          onChange={(event) => setUserForm((current) => ({
                            ...current,
                            username: event.target.value,
                          }))}
                        />
                      </label>
                      <label className="admin-field">
                        <span>Display Name</span>
                        <input
                          type="text"
                          value={userForm.displayName}
                          onChange={(event) => setUserForm((current) => ({
                            ...current,
                            displayName: event.target.value,
                          }))}
                        />
                      </label>
                    </div>

                    <div className="admin-form__row">
                      <label className="admin-field">
                        <span>Password</span>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(event) => setUserForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))}
                        />
                      </label>
                      <label className="admin-field">
                        <span>Role</span>
                        <select
                          value={userForm.role}
                          onChange={(event) => setUserForm((current) => ({
                            ...current,
                            role: event.target.value,
                          }))}
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                    </div>

                    <div className="admin-form__actions">
                      <p className={`admin-status ${userFormState.type ? `admin-status--${userFormState.type}` : ""}`}>
                        {userFormState.message || "Editors can update show notifications. Admins can add more users."}
                      </p>
                      <button type="submit" className="button button--primary" disabled={userSaving}>
                        {userSaving ? "Creating..." : "Create User"}
                      </button>
                    </div>
                  </form>

                  {usersLoading ? (
                    <p className="admin-empty">Loading saved users...</p>
                  ) : (
                    <ul className="admin-user-list">
                      {userList.map((user) => (
                        <li key={user.id} className="admin-user-item">
                          <div className="admin-user-item__header">
                            <div>
                              <strong>{user.displayName}</strong>
                              <span className="admin-user-handle">@{user.username}</span>
                            </div>
                            <span className="admin-pill admin-pill--muted">{user.role}</span>
                          </div>

                          <form className="admin-inline-form" onSubmit={(event) => handleUserPasswordReset(event, user.id)}>
                            <label className="admin-field">
                              <span>Set a new password</span>
                              <input
                                type="password"
                                autoComplete="new-password"
                                value={resetPasswordForms[user.id] ?? ""}
                                onChange={(event) => setResetPasswordForms((current) => ({
                                  ...current,
                                  [user.id]: event.target.value,
                                }))}
                              />
                            </label>
                            <button
                              type="submit"
                              className="button button--secondary"
                              disabled={resettingUserId === user.id}
                            >
                              {resettingUserId === user.id ? "Saving..." : "Update Password"}
                            </button>
                          </form>

                          {resetPasswordStates[user.id]?.message && (
                            <p className={`admin-inline-status admin-inline-status--${resetPasswordStates[user.id].type}`}>
                              {resetPasswordStates[user.id].message}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          ) : (
            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <h3>Login link, real backend, saved users</h3>
                  <p>
                    This admin panel talks to the backend API and stores user accounts plus show notifications, so
                    the homepage can update without touching the source code.
                  </p>
                </div>
              </div>

              {authError && <div className="admin-alert admin-alert--error">{authError}</div>}

              <form className="admin-form" onSubmit={handleLoginSubmit}>
                <label className="admin-field">
                  <span>Username</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={loginForm.username}
                    onChange={(event) => setLoginForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))}
                  />
                </label>

                <label className="admin-field">
                  <span>Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))}
                  />
                </label>

                <div className="admin-form__actions">
                  <p className="admin-status">
                    Once you're in, you can update the show card and create additional editor logins for your team.
                  </p>
                  <button type="submit" className="button button--primary" disabled={loginPending}>
                    {loginPending ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
