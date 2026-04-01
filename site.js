document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const moonIcon = document.getElementById("moon-icon");
  const sunIcon = document.getElementById("sun-icon");
  const navWrapper = document.getElementById("main-navigation");
  const mobileOverlay = document.getElementById("mobile-overlay");
  const openBtn = document.getElementById("mobile-menu-open");
  const closeBtn = document.getElementById("mobile-menu-close");
  const mobileLinksList = document.querySelector(".navigation-mobile-links");
  const desktopLinks = Array.from(document.querySelectorAll(".navigation-links-list a"));
  const contactLink = document.querySelector(".navigation-cta")?.closest("a");
  let lastScrollTop = 0;

  function setTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const isDark = nextTheme === "dark";

    if (isDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", nextTheme);
    if (moonIcon) moonIcon.style.display = isDark ? "none" : "block";
    if (sunIcon) sunIcon.style.display = isDark ? "block" : "none";
  }

  if (darkModeToggle) {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
    setTheme(initialTheme);
    darkModeToggle.addEventListener("click", () => {
      const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  function normalizePath(path) {
    if (!path) return "/";
    let normalized = path.replace(/index\.html$/, "");
    normalized = normalized.replace(/\/+/g, "/");
    normalized = normalized.replace(/\/$/, "");
    return normalized || "/";
  }

  function markActiveLinks() {
    const currentPath = normalizePath(window.location.pathname);

    desktopLinks.forEach((link) => {
      const navLink = link.querySelector(".navigation-link");
      if (!navLink) return;
      const href = link.getAttribute("href") || "";
      const isMatch = currentPath === normalizePath(new URL(href, window.location.href).pathname);
      navLink.classList.toggle("current-page", isMatch);
    });
  }

  function buildMobileMenu() {
    if (!mobileLinksList || desktopLinks.length === 0) return;

    const links = desktopLinks.map((link) => ({
      href: link.getAttribute("href") || "#",
      label: link.textContent.trim(),
      isCurrent: link.querySelector(".navigation-link")?.classList.contains("current-page"),
    }));

    if (contactLink) {
      links.push({
        href: contactLink.getAttribute("href") || "html/contact.html",
        label: contactLink.textContent.trim() || "Contact Me",
        isCurrent: contactLink.querySelector(".navigation-cta")?.classList.contains("current-page"),
      });
    }

    mobileLinksList.innerHTML = links
      .map(
        ({ href, label, isCurrent }) => `
          <li class="navigation-mobile-item">
            <a href="${href}">
              <div class="navigation-mobile-link${isCurrent ? " current-page" : ""}"><span>${label}</span></div>
            </a>
          </li>`
      )
      .join("");

    const overlayContent = document.querySelector(".navigation-overlay-content");
    overlayContent?.querySelectorAll('[data-thq="thq-dropdown"]').forEach((dropdown) => dropdown.remove());
  }

  function toggleMenu(isOpen) {
    if (!mobileOverlay || !openBtn) return;
    mobileOverlay.classList.toggle("is-active", isOpen);
    openBtn.setAttribute("aria-expanded", String(isOpen));
    mobileOverlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  markActiveLinks();
  buildMobileMenu();

  openBtn?.addEventListener("click", () => toggleMenu(true));
  closeBtn?.addEventListener("click", () => toggleMenu(false));
  document.querySelectorAll(".navigation-mobile-link").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  function setupContactForm() {
    const contactForm = document.getElementById("contactForm");
    const feedbackBox = document.getElementById("formFeedback");
    const submitButton = contactForm?.querySelector('button[type="submit"]');

    if (!contactForm || !feedbackBox) return;

    function showFeedback(message, type) {
      feedbackBox.textContent = message;
      feedbackBox.className = `contact-info__feedback is-visible ${type === "success" ? "is-success" : "is-error"}`;
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const originalButtonText = submitButton?.querySelector("span")?.textContent || "Send Message";
      if (submitButton) {
        submitButton.disabled = true;
        const buttonLabel = submitButton.querySelector("span");
        if (buttonLabel) buttonLabel.textContent = "Sending...";
      }

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Form submission failed.");
        }

        contactForm.reset();
        showFeedback("The form was submitted successfully.", "success");
      } catch (error) {
        showFeedback("Something went wrong. Please try again.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          const buttonLabel = submitButton.querySelector("span");
          if (buttonLabel) buttonLabel.textContent = originalButtonText;
        }
      }
    });
  }

  function setupCustomVideoPlayer() {
    const customVideo = document.querySelector('[data-role="video-wrapper"] [data-role="main-video"]');
    const playBtn = document.querySelector('[data-role="video-play-btn"]');
    const pauseBtn = document.querySelector('[data-role="video-pause-btn"]');

    if (!customVideo || !playBtn || !pauseBtn) return;

    customVideo.autoplay = false;
    customVideo.loop = false;
    customVideo.pause();
    customVideo.currentTime = 0;

    function syncButtons() {
      const isPlaying = !customVideo.paused && !customVideo.ended;
      playBtn.style.display = isPlaying ? "none" : "flex";
      pauseBtn.style.display = isPlaying ? "flex" : "none";
    }

    syncButtons();

    playBtn.addEventListener("click", async () => {
      try {
        await customVideo.play();
      } catch (error) {
        customVideo.pause();
      }
      syncButtons();
    });

    pauseBtn.addEventListener("click", () => {
      customVideo.pause();
      syncButtons();
    });

    customVideo.addEventListener("play", syncButtons);
    customVideo.addEventListener("pause", syncButtons);
    customVideo.addEventListener("ended", () => {
      customVideo.pause();
      syncButtons();
    });
  }

  setupCustomVideoPlayer();
  setupContactForm();

  if (navWrapper) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        navWrapper.classList.toggle("is-scrolled", scrollTop > 16);
        navWrapper.classList.toggle("is-hidden", scrollTop > lastScrollTop && scrollTop > 180 && !mobileOverlay?.classList.contains("is-active"));
        if (scrollTop < 24) {
          navWrapper.classList.remove("is-hidden");
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileOverlay?.classList.contains("is-active")) {
      toggleMenu(false);
    }
  });
});
