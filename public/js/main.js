document.addEventListener("DOMContentLoaded", () => {
  // Menyimpan state animasi tiap bar
  const animationState = new WeakMap();

  function animateSkill(bar) {
    const target = parseInt(bar.dataset.progress || 0);
    const text = bar.querySelector(".skill-text");
    const logo = bar.querySelector(".skill-logo");

    let width = 0;

    // Hentikan animasi sebelumnya jika ada
    if (animationState.has(bar)) {
      cancelAnimationFrame(animationState.get(bar));
    }

    function step() {
      if (width < target) {
        width++;
        bar.style.width = width + "%";
        if (text) text.textContent = width + "%";

        if (logo) {
          const barWidth = bar.getBoundingClientRect().width;
          const logoWidth = logo.getBoundingClientRect().width;
          const leftPos = Math.min(
            barWidth - logoWidth,
            (barWidth * width) / 100
          );
          logo.style.left = leftPos + "px";
        }

        const raf = requestAnimationFrame(step);
        animationState.set(bar, raf);
      } else {
        // Pastikan target tepat
        bar.style.width = target + "%";
        if (text) text.textContent = target + "%";
      }
    }

    step();
  }

  // Hover animasi
  document.querySelectorAll(".skills").forEach((bar) => {
    const parent = bar.parentElement;
    parent.addEventListener("mouseenter", () => {
      bar.style.width = "0%";
      const text = bar.querySelector(".skill-text");
      if (text) text.textContent = "0%";
      animateSkill(bar);
    });
  });

  // Accordion animasi
  function setupAccordion(selector, panelClass) {
    const accordions = document.querySelectorAll(selector);

    accordions.forEach((accordion) => {
      accordion.addEventListener("click", () => {
        accordion.classList.toggle("active");
        const panel = accordion.nextElementSibling;
        panel.classList.toggle(panelClass);

        if (panel.classList.contains(panelClass)) {
          const barsInPanel = panel.querySelectorAll(".skills");
          barsInPanel.forEach((bar) => {
            bar.style.width = "0%";
            const text = bar.querySelector(".skill-text");
            if (text) text.textContent = "0%";
            animateSkill(bar);
          });
        }
      });
    });
  }

  setupAccordion(".accordion", "show");
  setupAccordion(".accordion-programming", "show-programming");

  
});
/**
 * Robust seamless slider
 * - container: selector untuk slideshow (.slideshow-container)
 * - slideClass: class tiap slide (mySlides1)
 * - interval: autoplay interval (ms)
 * - numberElSelector: optional selector untuk tempat menampilkan "1 / N" (global)
 */
function createRobustSeamlessSlider({ container = "#slider", slideClass = "mySlides", interval = 4000 }) {
  const wrap = document.querySelector(container);
  if (!wrap) return;

  const slidesWrapper = wrap.querySelector(".slides-wrapper");
  if (!slidesWrapper) return;

  const prevBtn = wrap.querySelector(".prev");
  const nextBtn = wrap.querySelector(".next");

  let slides = Array.from(slidesWrapper.querySelectorAll("." + slideClass));
  if (slides.length === 0) return;

  // helper: wait for all images to load
  function waitImagesLoad() {
    const imgs = Array.from(slidesWrapper.querySelectorAll("img"));
    const promises = imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise((res) => {
        img.addEventListener("load", res);
        img.addEventListener("error", res);
      });
    });
    return Promise.all(promises);
  }

  waitImagesLoad().then(() => {

    // clone head & tail
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.add("clone");
    lastClone.classList.add("clone");

    slidesWrapper.appendChild(firstClone);
    slidesWrapper.insertBefore(lastClone, slidesWrapper.firstChild);

    slides = Array.from(slidesWrapper.querySelectorAll("." + slideClass));
    const total = slides.length;
    const originalCount = total - 2;

    let index = 1;
    let timer = null;
    let isTransitioning = false;

    // -------------------------------
    // Safe function to set instant transform
    // -------------------------------
    function setTranslateXInstant(posIndex) {
      const prevTransition = slidesWrapper.style.transition;
      slidesWrapper.style.transition = "none";
      slidesWrapper.style.transform = `translateX(-${posIndex * 100}%)`;

      // restore transition safely via RAF
      requestAnimationFrame(() => {
        slidesWrapper.style.transition = prevTransition || "transform 0.8s ease";
      });
    }

    // -------------------------------
    // Move to slide with animation
    // -------------------------------
    function moveTo(posIndex) {
      isTransitioning = true;
      disableButtons(true);

      slidesWrapper.style.transform = `translateX(-${posIndex * 100}%)`;

      // fallback: if transitionend never fires (Chrome DevTools resize bug)
      clearTimeout(slidesWrapper._transitionFallback);
      slidesWrapper._transitionFallback = setTimeout(() => {
        if (isTransitioning) {
          isTransitioning = false;
          disableButtons(false);
        }
      }, 1100); // slightly > transition duration
    }

    function disableButtons(disable = true) {
      prevBtn?.classList.toggle("disabled", disable);
      nextBtn?.classList.toggle("disabled", disable);
    }

    // -------------------------------
    // transitionend handler
    // -------------------------------
    slidesWrapper.addEventListener("transitionend", () => {
      clearTimeout(slidesWrapper._transitionFallback);
      isTransitioning = false;
      disableButtons(false);

      if (index === total - 1) {
        index = 1;
        setTranslateXInstant(index);
      }

      if (index === 0) {
        index = total - 2;
        setTranslateXInstant(index);
      }
    });

    // -------------------------------
    // next / prev
    // -------------------------------
    function next(n = 1) {
      if (isTransitioning) return;
      index += n;
      moveTo(index);
      restartAutoplay();
    }
    function prev(n = 1) {
      if (isTransitioning) return;
      index -= n;
      moveTo(index);
      restartAutoplay();
    }

    nextBtn?.addEventListener("click", () => next(1));
    prevBtn?.addEventListener("click", () => prev(1));

    // -------------------------------
    // autoplay
    // -------------------------------
    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(() => next(1), interval);
    }
    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    wrap.addEventListener("mouseenter", stopAutoplay);
    wrap.addEventListener("mouseleave", startAutoplay);

    // -------------------------------
    // FIX 1 — Reset isTransitioning on resize
    // -------------------------------
    let resizeTimeout = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {

        isTransitioning = false;   // <<< FIX 1
        disableButtons(false);

        setTranslateXInstant(index);
      }, 150);
    });

    // start
    setTranslateXInstant(index);
    startAutoplay();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Inisialisasi slider ---
  createRobustSeamlessSlider({ container: "#slider", slideClass: "mySlides", interval: 2000 });
  createRobustSeamlessSlider({ container: "#slider2", slideClass: "mySlides2", interval: 2000 });

  // --- Konfigurasi slider untuk overlay ---
  const sliders = [
    { wrap: "#slider", class: "mySlides" },
    { wrap: "#slider2", class: "mySlides2" }
  ];

  // --- Inisialisasi overlay ---
  createImageOverlay(sliders, "#imgOverlay");
});


/**
 * Fungsi modular untuk overlay gambar
 */
function createImageOverlay(sliders, overlaySelector) {
  const overlay = document.querySelector(overlaySelector);
  if (!overlay) return;

  const overlayImg = overlay.querySelector(".overlayImg");
  const overlayPrev = overlay.querySelector(".overlayPrev");
  const overlayNext = overlay.querySelector(".overlayNext");
  const closeOverlay = overlay.querySelector(".closeOverlay");


  // --- Tambahkan tombol download ---
let downloadBtn = overlay.querySelector(".downloadOverlay");
if (!downloadBtn) {
  downloadBtn = document.createElement("a");
  downloadBtn.className = "downloadOverlay";
  downloadBtn.textContent = "Download"; // teks
  downloadBtn.style.position = "absolute";
  downloadBtn.style.top = "20px";
  downloadBtn.style.left = "40px";
  downloadBtn.style.fontSize = "20px";
  downloadBtn.style.color = "white";
  downloadBtn.style.textDecoration = "none";
  downloadBtn.style.background = "rgba(0,0,0,0.4)";
  downloadBtn.style.padding = "6px 12px";
  downloadBtn.style.borderRadius = "4px";
  downloadBtn.style.zIndex = 60000;
  downloadBtn.style.cursor = "pointer";
  downloadBtn.style.transition = "all 0.3s ease"; // smooth transition

  // Hover effect
  downloadBtn.addEventListener("mouseenter", () => {
    downloadBtn.style.background = "rgba(0,0,0,0.7)";
    downloadBtn.style.transform = "scale(1.1)";
  });
  downloadBtn.addEventListener("mouseleave", () => {
    downloadBtn.style.background = "rgba(0,0,0,0.4)";
    downloadBtn.style.transform = "scale(1)";
  });

  overlay.appendChild(downloadBtn);
}


  let currentSlider = null;
  let currentIndex = 0;
  let slidesArray = [];

  function openOverlay(sliderID, index) {
    currentSlider = sliderID;
    currentIndex = index;

    const slideSel = sliders.find(s => s.wrap === sliderID)?.class;
    slidesArray = Array.from(
      document.querySelector(sliderID).querySelectorAll("." + slideSel)
    );

    overlayImg.src = slidesArray[currentIndex].querySelector("img").src;
    downloadBtn.href = overlayImg.src;
    downloadBtn.download = overlayImg.src.split("/").pop(); // nama file default

    overlay.style.display = "flex";
    overlayImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    overlayImg.style.opacity = 0;
    overlayImg.style.transform = "scale(0.8)";

    requestAnimationFrame(() => {
      overlay.classList.add("show");
      overlayImg.style.opacity = 1;
      overlayImg.style.transform = "scale(1)";
    });
  }

  function fadeOverlayImage(newIndex) {
    overlayImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    overlayImg.style.opacity = 0;
    overlayImg.style.transform = "scale(0.8)";

    setTimeout(() => {
      currentIndex = newIndex;
      overlayImg.src = slidesArray[currentIndex].querySelector("img").src;

      // update download button
      downloadBtn.href = overlayImg.src;
      downloadBtn.download = overlayImg.src.split("/").pop();

      requestAnimationFrame(() => {
        overlayImg.style.opacity = 1;
        overlayImg.style.transform = "scale(1)";
      });
    }, 600);
  }

  function overlayNextImg() {
    fadeOverlayImage((currentIndex + 1) % slidesArray.length);
  }

  function overlayPrevImg() {
    fadeOverlayImage((currentIndex - 1 + slidesArray.length) % slidesArray.length);
  }

  function closeOverlayFunc() {
    overlayImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    overlayImg.style.opacity = 0;
    overlayImg.style.transform = "scale(0.8)";
    overlay.classList.remove("show");
    setTimeout(() => (overlay.style.display = "none"), 600);
  }

  // --- Event listeners ---
  overlayNext.addEventListener("click", overlayNextImg);
  overlayPrev.addEventListener("click", overlayPrevImg);
  closeOverlay.addEventListener("click", closeOverlayFunc);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlayFunc();
  });

  sliders.forEach(({ wrap, class: slideClass }) => {
    const container = document.querySelector(wrap);
    if (!container) return;

    const slides = container.querySelectorAll("." + slideClass + " img");
    slides.forEach((img, index) => {
      img.addEventListener("click", () => openOverlay(wrap, index));
    });
  });

  return { openOverlay, overlayNextImg, overlayPrevImg, closeOverlayFunc };
}








