(() => {
  const carousel = document.querySelector("[data-carousel]");

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector("[data-carousel-track]");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const indicators = carousel.querySelector("[data-carousel-indicators]");

  if (!track || !prevButton || !nextButton || !indicators) {
    return;
  }

  const slides = Array.from(track.children);
  if (slides.length === 0) {
    return;
  }

  const videos = slides.map((slide) => slide.querySelector("[data-carousel-video]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentIndex = 0;
  let autoPlayTimer = 0;

  function loadVideo(video) {
    if (!video) {
      return;
    }

    const source = video.querySelector("source[data-src]");
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
  }

  function pauseVideo(video) {
    if (!video) {
      return;
    }

    video.pause();
  }

  function playVideo(video) {
    if (!video || prefersReducedMotion) {
      return;
    }

    loadVideo(video);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Muted video autoplay can still be delayed while the browser is busy.
      });
    }
  }

  function syncVideos() {
    videos.forEach((video, index) => {
      if (index === currentIndex) {
        playVideo(video);
      } else {
        pauseVideo(video);
      }
    });
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-indicator";
    dot.setAttribute("aria-label", "切换到第 " + String(index + 1) + " 张轮播图");
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoPlay();
    });
    indicators.appendChild(dot);
  });

  const dots = Array.from(indicators.children);

  function setTrackPosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    setTrackPosition();
    updateDots();
    syncVideos();
  }

  function restartAutoPlay() {
    window.clearInterval(autoPlayTimer);
    if (!prefersReducedMotion) {
      autoPlayTimer = window.setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 30000);
    }
  }

  prevButton.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    restartAutoPlay();
  });

  nextButton.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    restartAutoPlay();
  });

  carousel.addEventListener("mouseenter", () => {
    window.clearInterval(autoPlayTimer);
  });

  carousel.addEventListener("mouseleave", () => {
    restartAutoPlay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach(pauseVideo);
      window.clearInterval(autoPlayTimer);
      return;
    }

    syncVideos();
    restartAutoPlay();
  });

  setTrackPosition();
  updateDots();
  syncVideos();
  restartAutoPlay();
})();
