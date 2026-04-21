const video = document.getElementById("feature-video");
const videoFrame = document.getElementById("video-frame");
const videoStage = document.getElementById("video-stage");

const audio = document.getElementById("audio-player");
const audioToggle = document.getElementById("audio-toggle");
const audioToggleLabel = audioToggle?.querySelector(".audio-toggle-label");
const audioSeek = document.getElementById("audio-seek");
const audioCurrent = document.getElementById("audio-current");
const audioDuration = document.getElementById("audio-duration");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const galleryImages = document.querySelectorAll("[data-fullscreen]");
const revealItems = document.querySelectorAll(".reveal");

const formatTime = (timeInSeconds) => {
  if (!Number.isFinite(timeInSeconds)) {
    return "0:00";
  }

  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const syncAudioButton = () => {
  if (!audio || !audioToggle || !audioToggleLabel) {
    return;
  }

  const isPlaying = !audio.paused && !audio.ended;
  audioToggle.classList.toggle("is-playing", isPlaying);
  audioToggle.setAttribute("aria-label", isPlaying ? "Pause audio" : "Play audio");
  audioToggleLabel.textContent = isPlaying ? "Pause" : "Play";
};

const syncAudioSeek = () => {
  if (!audio || !audioSeek || !audioCurrent || !audioDuration) {
    return;
  }

  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  audioSeek.max = String(duration || 0);
  audioSeek.value = String(currentTime);
  audioCurrent.textContent = formatTime(currentTime);
  audioDuration.textContent = formatTime(duration);
};

const toggleVideoPlayback = async () => {
  if (!video) {
    return;
  }

  try {
    if (video.paused || video.ended) {
      await video.play();
    } else {
      video.pause();
    }
  } catch (error) {
    console.error("Video playback failed:", error);
  }
};

const toggleAudioPlayback = async () => {
  if (!audio) {
    return;
  }

  try {
    if (audio.paused || audio.ended) {
      await audio.play();
    } else {
      audio.pause();
    }
  } catch (error) {
    console.error("Audio playback failed:", error);
  } finally {
    syncAudioButton();
  }
};

if (video) {
  video.controls = true;
  video.addEventListener("click", (event) => {
    event.preventDefault();
    toggleVideoPlayback();
  });
  video.addEventListener("loadedmetadata", () => {
    if (videoStage && video.videoWidth && video.videoHeight) {
      videoStage.style.setProperty("--video-ratio", `${video.videoWidth} / ${video.videoHeight}`);
    }
  });
}

if (videoFrame) {
  videoFrame.addEventListener("click", (event) => {
    const isFullscreen = document.fullscreenElement === videoFrame;
    const clickedVideo = event.target === video;
    const clickedInsideStage = event.target === videoStage || videoStage?.contains(event.target);

    if (isFullscreen && !clickedInsideStage && !clickedVideo) {
      document.exitFullscreen().catch(() => {});
    }
  });
}

if (audio && audioToggle) {
  audio.controls = false;
  audioToggle.addEventListener("click", toggleAudioPlayback);
  audio.addEventListener("play", syncAudioButton);
  audio.addEventListener("pause", syncAudioButton);
  audio.addEventListener("ended", syncAudioButton);
  audio.addEventListener("timeupdate", syncAudioSeek);
  audio.addEventListener("loadedmetadata", syncAudioSeek);
  syncAudioButton();
  syncAudioSeek();
}

if (audio && audioSeek) {
  audioSeek.addEventListener("input", () => {
    audio.currentTime = Number(audioSeek.value);
    syncAudioSeek();
  });
}

const openLightbox = (image) => {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
};

galleryImages.forEach((image) => {
  image.addEventListener("click", () => openLightbox(image));
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("is-open")) {
    closeLightbox();
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealItems.forEach((item) => observer.observe(item));
