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
function createRobustSeamlessSlider({ container = "#slider", slideClass = "mySlides", interval = 4000}) {
  const wrap = document.querySelector(container);
  if (!wrap) return;
  const slidesWrapper = wrap.querySelector(".slides-wrapper");
  if (!slidesWrapper) return;
  const prevBtn = wrap.querySelector(".prev");
  const nextBtn = wrap.querySelector(".next");
  let slides = Array.from(slidesWrapper.querySelectorAll("." + slideClass));
  if (slides.length === 0) return;

  // helper: wait for all images inside slidesWrapper to load
  function waitImagesLoad() {
    const imgs = Array.from(slidesWrapper.querySelectorAll("img"));
    const promises = imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise((res) => { img.addEventListener("load", res); img.addEventListener("error", res); });
    });
    return Promise.all(promises);
  }

  // init after images loaded
  waitImagesLoad().then(() => {
    // clone head & tail for seamless
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.add("clone");
    lastClone.classList.add("clone");
    slidesWrapper.appendChild(firstClone);
    slidesWrapper.insertBefore(lastClone, slidesWrapper.firstChild);

    // refresh slides array
    slides = Array.from(slidesWrapper.querySelectorAll("." + slideClass));
    const total = slides.length; // original + 2
    const originalCount = total - 2;

    // index points to position in slides array; start at first real slide (index 1)
    let index = 1;
    let timer = null;
    let isTransitioning = false;

    // set initial transform instantly (no transition)
    function setTranslateXInstant(posIndex) {
      slidesWrapper.style.transition = "none";
      slidesWrapper.style.transform = `translateX(-${posIndex * 100}%)`;
      // force reflow
      slidesWrapper.offsetHeight;
      slidesWrapper.style.transition = ""; // restore
    }

    // move with transition
    function moveTo(posIndex) {
      // block rapid calls
      isTransitioning = true;
      disableButtons(true);

      slidesWrapper.style.transform = `translateX(-${posIndex * 100}%)`;
    }

    

    // disable/enable prev/next
    function disableButtons(disable = true) {
      if (prevBtn) {
        prevBtn.classList.toggle("disabled", disable);
      }
      if (nextBtn) {
        nextBtn.classList.toggle("disabled", disable);
      }
    }

    // on transition end: handle clones jump
    slidesWrapper.addEventListener("transitionend", () => {
      isTransitioning = false;
      disableButtons(false);

      // if landed on the last clone (index === total-1) -> jump to 1
      if (index === total - 1) {
        index = 1;
        setTranslateXInstant(index);
      }

      // if landed on the first clone (index === 0) -> jump to last real (total-2)
      if (index === 0) {
        index = total - 2;
        setTranslateXInstant(index);
      }

      // Update displayed number: convert index to 1..originalCount
      const actualIndex = ((index - 1 + originalCount) % originalCount) + 1;
    });

    // next/prev handlers with guard
    function next(n = 1) {
      if (isTransitioning) return; // ignore while animating
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

    // autoplay control
    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(() => next(1), interval);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    // attach buttons
    if (nextBtn) nextBtn.addEventListener("click", () => next(1));
    if (prevBtn) prevBtn.addEventListener("click", () => prev(1));

    // pause on hover
    wrap.addEventListener("mouseenter", stopAutoplay);
    wrap.addEventListener("mouseleave", startAutoplay);

    // keep correct transform on resize
    let resizeTimeout = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setTranslateXInstant(index), 120);
    });

    // initial position & start
    setTranslateXInstant(index);
    // show initial number
    startAutoplay();
  }); // end waitImagesLoad
}

// usage:
document.addEventListener("DOMContentLoaded", () => {
  createRobustSeamlessSlider({
    container: "#slider",
    slideClass: "mySlides",
    interval: 2000
  });
   createRobustSeamlessSlider({
    container: "#slider2",
    slideClass: "mySlides2",
    interval: 2000
  });
});





