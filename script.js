/* =========================================
   ELEMENTS
========================================= */

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const menuIcon = menuToggle.querySelector("i");
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* =========================================
   MOBILE NAVIGATION
========================================= */

function toggleMenu() {
  const isOpen = navMenu.classList.toggle("active");

  menuToggle.setAttribute("aria-expanded", isOpen);

  menuIcon.classList.toggle("fa-bars", !isOpen);
  menuIcon.classList.toggle("fa-xmark", isOpen);
}

function closeMenu() {
  navMenu.classList.remove("active");

  menuToggle.setAttribute("aria-expanded", "false");

  menuIcon.classList.remove("fa-xmark");
  menuIcon.classList.add("fa-bars");
}

menuToggle.addEventListener("click", toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  const clickedInsideMenu = navMenu.contains(event.target);
  const clickedMenuButton = menuToggle.contains(event.target);

  if (
    !clickedInsideMenu &&
    !clickedMenuButton &&
    navMenu.classList.contains("active")
  ) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu.classList.contains("active")) {
    closeMenu();
  }
});

/* =========================================
   SCROLL PROGRESS BAR
========================================= */

const scrollProgress = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");

function updateScrollProgress() {
  if (!scrollProgress) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;

  if (backToTop) {
    backToTop.classList.toggle("visible", scrollTop > 480);
  }
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

/* =========================================
   SCROLL REVEAL — IntersectionObserver
========================================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  /* Fallback for older browsers */

  revealElements.forEach((element) => element.classList.add("active"));
}

/* =========================================
   ACTIVE NAVIGATION LINK
========================================= */

function updateActiveNav() {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop - 180 &&
      window.scrollY < sectionTop + sectionHeight - 180
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    const linkTarget = link.getAttribute("href");

    if (linkTarget === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

/* =========================================
   MAGNETIC BUTTONS
========================================= */

if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();

      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.3}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}


/* =========================================
   SKILL PROGRESS ANIMATION
========================================= */

const skillItems = document.querySelectorAll(".skill-item");

if ("IntersectionObserver" in window) {
  const skillObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const skill = entry.target;

        const progressCircle = skill.querySelector(".skill-progress");

        const level = skill.dataset.level;

        if (progressCircle && level) {
          progressCircle.style.setProperty("--target-progress", level);

          progressCircle.classList.add("animate");
        }

        observer.unobserve(skill);
      });
    },
    {
      threshold: 0.5,
    },
  );

  skillItems.forEach((skill) => {
    skillObserver.observe(skill);
  });
} else {
  skillItems.forEach((skill) => {
    const progressCircle = skill.querySelector(".skill-progress");

    const level = skill.dataset.level;

    if (progressCircle && level) {
      progressCircle.style.setProperty("--progress", level);
    }
  });
}

/* =========================================
   FOOTER — dynamic year
========================================= */

const footerYearEl = document.getElementById("footer-year");

if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear();
}

/* =========================================
   CUSTOM CURSOR
   Runs only on real mouse/trackpad devices —
   touch devices never get this, so tapping
   still works normally everywhere else.
========================================= */

const isFinePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

if (isFinePointer && !prefersReducedMotion) {
  document.body.classList.add("has-custom-cursor");

  const cursorDot = document.createElement("div");
  cursorDot.className = "cursor-dot";

  const cursorOutline = document.createElement("div");
  cursorOutline.className = "cursor-outline";

  document.body.append(cursorDot, cursorOutline);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;
  let hasMoved = false;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    if (!hasMoved) {
      hasMoved = true;
      outlineX = mouseX;
      outlineY = mouseY;
      cursorDot.classList.add("is-active");
      cursorOutline.classList.add("is-active");
    }
  });

  // Outline eases toward the dot for a soft trailing feel
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;

    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateOutline);
  }

  animateOutline();

  window.addEventListener("mousedown", () => {
    cursorOutline.classList.add("is-clicking");
  });

  window.addEventListener("mouseup", () => {
    cursorOutline.classList.remove("is-clicking");
  });

  // Grow the outline over anything clickable
  const hoverTargets =
    "a, button, .btn, .skill-item, .project-card, .contact-item, .certificate-card, input, textarea";

  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorOutline.classList.add("is-hovering");
    });

    el.addEventListener("mouseleave", () => {
      cursorOutline.classList.remove("is-hovering");
    });
  });

  // Hide the custom cursor when it leaves the window
  document.addEventListener("mouseleave", () => {
    cursorDot.classList.remove("is-active");
    cursorOutline.classList.remove("is-active");
  });

  document.addEventListener("mouseenter", () => {
    if (hasMoved) {
      cursorDot.classList.add("is-active");
      cursorOutline.classList.add("is-active");
    }
  });

  /* =========================================
   MAILTO FALLBACK — copy email if no mail app
========================================= */

  const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');

  if (mailtoLinks.length) {
    const toast = document.createElement("div");
    toast.className = "email-toast";
    toast.textContent = "Email copied to clipboard!";
    document.body.appendChild(toast);

    let toastTimeout;

    mailtoLinks.forEach((link) => {
      link.addEventListener("click", async (event) => {
        const email = link.href.replace("mailto:", "").split("?")[0];

        try {
          await navigator.clipboard.writeText(email);

          toast.classList.add("visible");

          clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => {
            toast.classList.remove("visible");
          }, 2500);
        } catch (err) {
          // Clipboard failed silently — mailto link still attempts to open
        }
      });
    });
  }
}
/* =========================================
   CONTACT FORM SUBMISSION
   Sends form data to the live Express backend,
   which validates it and emails it to me.
========================================= */

const CONTACT_API_URL = "/api/contact";
// ^ Same-origin Vercel serverless function — frontend and backend deploy
//   together from this repo, so no separate URL or CORS setup is needed.

(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = document.getElementById("cf-submit");
  const submitText = document.getElementById("cf-submit-text");
  const statusEl = document.getElementById("cf-status");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const message = document.getElementById("cf-message").value.trim();

    statusEl.textContent = "";
    statusEl.className = "form-status";

    if (!name || !email || !message) {
      statusEl.textContent = "Please fill in all fields.";
      statusEl.classList.add("error");
      return;
    }

    submitBtn.disabled = true;
    submitText.textContent = "Sending...";

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        statusEl.textContent = "Message sent! I'll get back to you soon.";
        statusEl.classList.add("success");
        form.reset();
      } else {
        statusEl.textContent =
          data.error || "Something went wrong. Please try again.";
        statusEl.classList.add("error");
      }
    } catch (err) {
      statusEl.textContent =
        "Could not reach the server. Please try again later.";
      statusEl.classList.add("error");
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = "Send Message";
    }
  });
})();
