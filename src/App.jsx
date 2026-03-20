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

const referralCards = [
  {
    title: "Watch on Whatnot",
    description:
      "Get into the room before the best cards move. Saturday nights bring fast-paced singles, competitive bidding, and a live experience built for collectors who don't want to miss out.",
    href: "https://www.whatnot.com/user/chanman84",
    button: "Enter the Live Room",
    featured: true,
  },
  {
    title: "Buyer Referral Link",
    description:
      "New to Whatnot? Start here. Get into the hobby with a buyer referral that makes it easier to jump in, grab your first cards, and experience the energy of a live show.",
    href: "https://whatnot.com/invite/chanman84",
    button: "Start as a Buyer",
  },
  {
    title: "Seller Referral Link",
    description:
      "Thinking about selling? Use this referral to get started on Whatnot with a setup built around consistency, transparency, and a real collector audience.",
    href: "https://whatnot.com/invite/seller/chanman84",
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
      "The backbone of the hobby. Bowman, flagship, chrome, rookies, autos, and key singles — built for collectors who understand the market and move with it.",
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
      "History that still competes. Classic cardboard with proven appeal — built for collectors who value legacy, condition, and long-term relevance.",
  },
];

const reasons = [
  {
    title: "🏁 Fair, consistent pricing.",
    body: "Respect for both the card and the collector — every time.",
  },
  {
    title: "🏁 Transparent, clean live shows.",
    body: "No confusion, no gimmicks — just straightforward selling.",
  },
  {
    title: "🏁 Built for collectors first.",
    body: "Driven by hobby trust, not corporate polish.",
  },
  {
    title: "🏁 Energy that’s part of the brand.",
    body: "Not forced — built into every show from the start.",
  },
  {
    title: "🏁 Saturday is the destination.",
    body: "A weekly show collectors can count on — and come back for.",
  },
  {
    title: "🏁 Multi-platform, one community.",
    body: "Live selling on Whatnot, supported by Facebook, Instagram, and a growing web presence.",
  },
  {
    title: "🏁 Consistent execution, every show.",
    body: "A structured approach that keeps things smooth, predictable, and professional week after week.",
  },
  {
    title: "🏁 Built for long-term collectors.",
    body: "Focused on relationships, not one-time transactions.",
  },
];
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

          <a className="button button--primary topbar-cta" href="https://www.whatnot.com/user/chanman84">
            Watch on Whatnot
          </a>
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
                  <a className="button button--primary" href="https://www.whatnot.com/user/chanman84">
                    Join Saturday Show
                  </a>
                  <a className="button button--secondary" href="https://www.facebook.com/profile.php?id=61587744621760">
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
                structured show built for collectors — combining transparency, fast-moving singles, and a community
                that knows how to compete.
              </p>
            </div>

            <div className="show-highlight">
              <div className="show-highlight__main">
                <span className="show-badge">Live Every Saturday</span>
                <h3>Victory Lane Saturday Singles Show</h3>
                <p>
                  From Racing and baseball to football, hockey, vintage, and select Pokemon — every show is built for
                  momentum. Expect clean singles, real-time action, and a community-driven experience that keeps things
                  moving.
                </p>
              </div>

              <div className="show-schedule-card">
                <span className="show-schedule-card__label">Next Show</span>
                <strong>Saturday, March 28, 2026 at 7:00 PM ET</strong>
                <p>
                  The first Victory Lane Cards live show is tentatively set for Saturday, March 28, 2026 at 7:00 PM
                  ET. It is shaping up to be our first-ever show and a big Opening Weekend launch for baseball season,
                  with the energy of MLB&apos;s opening stretch carrying straight into the room.
                </p>
                <a className="button button--primary button--block" href="https://www.whatnot.com/user/chanman84">
                  Watch the Saturday Show
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
              <p>
                Everything you need to join, buy, or start selling — right here.
              </p>
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
                IndyCar at the core, backed by baseball, football, hockey, and vintage — a mix built for collectors
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
                    Victory Lane Cards started as more than just a business — it was built around family, time, and
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
                    always been attending the St. Pete Grand Prix together — a reminder of how meaningful shared
                    experiences can be.
                  </p>
                  <p>
                    That season of life made one thing clear: I wished I had started building something alongside him
                    sooner.
                  </p>
                  <p>
                    Victory Lane Cards is my way of ensuring my children don&apos;t have that same regret. It&apos;s about
                    creating something that evolves with them — from childhood into adulthood — where we&apos;re not just
                    family, but teammates working toward a shared goal.
                  </p>
                  <p className="profile-card__trust">
                    At its core, this isn&apos;t just about cards. It&apos;s about building relationships, creating memories,
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
                  <strong>Saturday is race day — live Whatnot shows every week</strong>
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
              href="https://www.facebook.com/profile.php?id=61587744621760"
              className="footer__icon-link"
              aria-label="Facebook Page"
              title="Facebook Page"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/victorylane_cards/?hl=en"
              className="footer__icon-link"
              aria-label="Instagram"
              title="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.whatnot.com/user/chanman84"
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
    </div>
  );
}

export default App;

