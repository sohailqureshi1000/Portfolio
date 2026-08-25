/* =========================================
   ELEMENTS
========================================= */

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const menuIcon = menuToggle.querySelector("i");
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
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

    if (
        event.key === "Escape" &&
        navMenu.classList.contains("active")
    ) {
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
    const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

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
        }
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
   TYPEWRITER — hero role text (advanced)
   - Variable, human-like typing/deleting speed
   - Gradient-filled text (handled in CSS)
   - Cursor color shifts while deleting
   - Occasional "hesitation" pause mid-word
========================================= */

const typewriterEl = document.getElementById("typewriter-text");
const typewriterCursor = document.querySelector(".typewriter-cursor");

if (typewriterEl) {

    const roles = [
        "Frontend AI Engineer",
        "Full-Stack Developer",
        "MERN Stack Developer",
        "Problem Solver",
    ];

    if (prefersReducedMotion) {

        typewriterEl.textContent = roles[0];

    } else {

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const BASE_TYPE_SPEED = 85;
        const BASE_DELETE_SPEED = 40;
        const HOLD_DELAY = 1700;
        const SWITCH_DELAY = 450;

        function jitter(base, spread) {
            return base + (Math.random() * spread - spread / 2);
        }

        function typeLoop() {

            const currentRole = roles[roleIndex];

            if (isDeleting) {

                typewriterCursor?.classList.add("deleting");

                charIndex -= 1;
                typewriterEl.textContent = currentRole.slice(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    typewriterCursor?.classList.remove("deleting");
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeLoop, SWITCH_DELAY);
                    return;
                }

                setTimeout(typeLoop, jitter(BASE_DELETE_SPEED, 18));

            } else {

                charIndex += 1;
                typewriterEl.textContent = currentRole.slice(0, charIndex);

                if (charIndex === currentRole.length) {
                    isDeleting = true;
                    setTimeout(typeLoop, HOLD_DELAY);
                    return;
                }

                // Small chance of a brief natural pause mid-word
                const extraPause =
                    Math.random() < 0.08 ? jitter(220, 100) : 0;

                setTimeout(
                    typeLoop,
                    jitter(BASE_TYPE_SPEED, 35) + extraPause
                );

            }

        }

        typeLoop();

    }

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

                const progressCircle =
                    skill.querySelector(".skill-progress");

                const level =
                    skill.dataset.level;

                if (progressCircle && level) {

                    progressCircle.style.setProperty(
                        "--target-progress",
                        level
                    );

                    progressCircle.classList.add("animate");

                }

                observer.unobserve(skill);

            });

        },
        {
            threshold: 0.5
        }
    );


    skillItems.forEach((skill) => {

        skillObserver.observe(skill);

    });

} else {

    skillItems.forEach((skill) => {

        const progressCircle =
            skill.querySelector(".skill-progress");

        const level =
            skill.dataset.level;

        if (progressCircle && level) {

            progressCircle.style.setProperty(
                "--progress",
                level
            );

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
    "(hover: hover) and (pointer: fine)"
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
    const hoverTargets = "a, button, .btn, .skill-item, .project-card, .contact-item, .certificate-card, input, textarea";

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