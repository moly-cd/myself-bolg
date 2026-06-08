(() => {
  const fishes = Array.from(document.querySelectorAll("[data-site-fish]"));
  const homeHero = document.querySelector(".home-template .home-hero");

  if (fishes.length === 0) {
    return;
  }

  function syncHomeHeroState() {
    if (!homeHero) {
      return;
    }

    const rect = homeHero.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const isHeroDominant = visibleHeight > window.innerHeight * 0.68;

    document.body.classList.toggle("is-home-hero-active", isHeroDominant);
  }

  fishes.forEach((fish) => {
    let timer = 0;

    fish.addEventListener("click", () => {
      window.clearTimeout(timer);
      fish.classList.remove("is-fleeing");
      fish.getAnimations().forEach((animation) => {
        animation.playbackRate = 1;
      });

      fish.classList.add("is-fleeing");
      fish.getAnimations().forEach((animation) => {
        animation.playbackRate = 9;
      });

      timer = window.setTimeout(() => {
        fish.classList.remove("is-fleeing");
        fish.getAnimations().forEach((animation) => {
          animation.playbackRate = 1;
        });
      }, 3600);
    });
  });

  syncHomeHeroState();
  window.addEventListener("scroll", syncHomeHeroState, { passive: true });
  window.addEventListener("resize", syncHomeHeroState);
})();
