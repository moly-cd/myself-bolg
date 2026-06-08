(function () {
  var STORAGE_KEY = "blogAPlayerState";
  var currentIndex = 0;
  var saveTimer = null;

  function readJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures in restricted browsing modes.
    }
  }

  function initAPlayer() {
    var container = document.getElementById("aplayer");
    var dock = document.querySelector("[data-aplayer-dock]");
    var handle = document.querySelector("[data-aplayer-handle]");
    var savedState = readJson(STORAGE_KEY);

    if (!container || typeof window.APlayer === "undefined") {
      return;
    }

    var player = new window.APlayer({
      container: container,
      fixed: false,
      mini: false,
      autoplay: false,
      theme: "#0f766e",
      loop: "all",
      order: "list",
      preload: "none",
      volume: savedState && typeof savedState.volume === "number" ? savedState.volume : 0.65,
      mutex: true,
      lrcType: 3,
      listFolded: true,
      listMaxHeight: 260,
      audio: [
        {
          name: "ワールドイズマイン",
          artist: "早见纱织",
          url: "/audio/ワールドイズマイン.mp3",
          cover: "/images/music/ワールドイズマイン.jpg",
          lrc: "/audio/ワールドイズマイン.lrc"
        },
        {
          name: "Killing Me",
          artist: "Ofelia K",
          url: "/audio/Killing Me.mp3",
          cover: "/images/music/killing Me.jpg",
          lrc: "/audio/Killing Me - Ofelia K.lrc"
        },
        {
          name: "Life is Reason",
          artist: "Daniel Pemberton",
          url: "/audio/Life is Reason.mp3",
          cover: "/images/music/Life is Rasion.jpg",
          lrc: "/audio/Life is Reason - Daniel Pemberton.lrc"
        }
      ]
    });

    function saveState() {
      if (!player.audio) {
        return;
      }

      writeJson(STORAGE_KEY, {
        index: currentIndex,
        currentTime: Number.isFinite(player.audio.currentTime) ? player.audio.currentTime : 0,
        paused: player.audio.paused,
        volume: player.audio.volume
      });
    }

    function scheduleSaveState() {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveState, 250);
    }

    if (dock && handle) {
      handle.addEventListener("click", function () {
        var isExpanded = dock.classList.toggle("is-expanded");
        handle.textContent = isExpanded ? "‹" : "›";
      });
    }

    if (typeof player.on === "function") {
      player.on("listswitch", function (event) {
        currentIndex = event && typeof event.index === "number" ? event.index : currentIndex;
        scheduleSaveState();
      });
      player.on("play", scheduleSaveState);
      player.on("pause", scheduleSaveState);
      player.on("volumechange", scheduleSaveState);
    }

    if (player.audio) {
      player.audio.addEventListener("timeupdate", scheduleSaveState);
      player.audio.addEventListener("loadedmetadata", function () {
        if (savedState && typeof savedState.currentTime === "number" && savedState.currentTime > 0) {
          player.audio.currentTime = Math.min(savedState.currentTime, player.audio.duration || savedState.currentTime);
        }
      }, { once: true });
    }

    if (savedState && typeof savedState.index === "number" && player.list && typeof player.list.switch === "function") {
      currentIndex = savedState.index;
      player.list.switch(savedState.index);
    }

    window.addEventListener("beforeunload", saveState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAPlayer);
    return;
  }

  initAPlayer();
})();
