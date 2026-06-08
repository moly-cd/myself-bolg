(() => {
  const topNav = document.querySelector(".top-nav");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("mainNavLinks");

  if (!topNav || !menuToggle || !navLinks) {
    return;
  }

  const isHome = document.body.classList.contains("home-template");

  const normalizePath = (value) => {
    if (!value) {
      return "/";
    }

    const normalized = value.replace(/index\.html$/, "").replace(/\/+$/, "");
    return normalized || "/";
  };

  const syncNavHeight = () => {
    document.documentElement.style.setProperty("--nav-height", `${topNav.offsetHeight}px`);
  };

  const syncHomeNavState = () => {
    if (!isHome) {
      return;
    }

    topNav.classList.toggle("is-ghost", window.scrollY < 48);
  };

  const currentPath = normalizePath(window.location.pathname);
  const navItems = navLinks.querySelectorAll(".nav-item-link");

  navItems.forEach((item) => {
    const itemPath = normalizePath(item.dataset.navPath);
    if (
      currentPath === itemPath ||
      currentPath.endsWith(itemPath === "/" ? "/public" : itemPath)
    ) {
      item.classList.add("active");
    }
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (!navLinks.contains(target) && !menuToggle.contains(target)) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => {
    syncNavHeight();
    syncHomeNavState();
  });
  window.addEventListener("scroll", syncHomeNavState, { passive: true });

  syncNavHeight();
  syncHomeNavState();
})();
