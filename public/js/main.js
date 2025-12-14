// Start Accordion
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
// SmoothScrool
function smoothScrollToAccordion() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const id = this.getAttribute("href").substring(1);
      const targetAccordion = document.getElementById(id);
      if (!targetAccordion) return;

      /* 1. Hapus # dari URL */
      history.pushState("", document.title, window.location.pathname);

      /* 2. Buka accordion utama */
      openMainAccordion(targetAccordion);

      /* 3. Scroll smooth ke accordion */
      setTimeout(() => {
        targetAccordion.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 200);
    });
  });
}
// OpenMainAccordion
function openMainAccordion(accordionBtn) {
  const panel = accordionBtn.nextElementSibling;

  if (!accordionBtn.classList.contains("active")) {
    accordionBtn.classList.add("active");
    panel.classList.add("show");
  }
  /* 5. Jalankan animasi skill */
  animateSkills(panel);
}
// animateSkill
function animateSkills(panel) {
  const bars = panel.querySelectorAll(".skills");
  bars.forEach(bar => {
    bar.style.width = "0%";
    const text = bar.querySelector(".skill-text");
    if (text) text.textContent = "0%";
    animateSkill(bar);
  });
}
// Automation Run While Call URL root/path
window.addEventListener("load", () => {
  if (window.location.hash) {
    const id = window.location.hash.substring(1);
    const accordion = document.getElementById(id);
    if (accordion) {
      openMainAccordion(accordion);
      accordion.scrollIntoView({ behavior: "smooth" });

      history.pushState("", document.title, window.location.pathname);
    }
  }
});

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
// Start Slider
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
    // Safe function to set instant transform
    function setTranslateXInstant(posIndex) {
      const prevTransition = slidesWrapper.style.transition;
      slidesWrapper.style.transition = "none";
      slidesWrapper.style.transform = `translateX(-${posIndex * 100}%)`;

      // restore transition safely via RAF
      requestAnimationFrame(() => {
        slidesWrapper.style.transition = prevTransition || "transform 0.8s ease";
      });
    }
    // Move to slide with animation
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
      }, 1100);
    }

    function disableButtons(disable = true) {
      prevBtn?.classList.toggle("disabled", disable);
      nextBtn?.classList.toggle("disabled", disable);
    }
    // transitionend handler
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
    // next / prev
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
    // autoplay
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
    //Reset isTransitioning on resize
    let resizeTimeout = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {

        isTransitioning = false;
        disableButtons(false);

        setTranslateXInstant(index);
      }, 150);
    });

    // start
    setTranslateXInstant(index);
    startAutoplay();
  });
}
// Start Overlay Image Zoom
function createImageOverlay(sliders, overlaySelector) {
  const overlay = document.querySelector(overlaySelector);
  if (!overlay) return;

  const overlayImg = overlay.querySelector(".overlayImg");
  const overlayPrev = overlay.querySelector(".overlayPrev");
  const overlayNext = overlay.querySelector(".overlayNext");
  const closeOverlay = overlay.querySelector(".closeOverlay");


  //Tambahkan tombol download
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
// Konfigurasi slider untuk overlay
const sliders = [
  { wrap: "#slider", class: "mySlides" },
  { wrap: "#slider2", class: "mySlides2" },
  { wrap: "#slider3", class: "mySlides3" },
  { wrap: "#slider4", class: "mySlides4" }
];

// InitNode In Header
function initNodeHeader(selector, options = {}) {
  const header = document.querySelector(selector);
  if (!header) return;

  let canvas = document.getElementById("nodeCanvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "nodeCanvas";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";
    header.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");

  const baseNodeCount = 80;
  const baseMaxDistance = 120;

  const config = {
    nodeCount: options.nodeCount || baseNodeCount,
    speed: options.speed || 1.5,
    nodeSize: options.nodeSize || 3,
    nodeColor: options.nodeColor || "0,0,0", // default hitam
    mouseRadius: options.mouseRadius || 200,
    lineOpacity: options.lineOpacity || 0.5,
    funnelMaxRadius: options.funnelMaxRadius || 150,
    funnelMinRadius: options.funnelMinRadius || 10
  };

  let nodes = [];
  const mouse = { x: null, y: null };

  // Resize canvas
  function resizeCanvas() {
    canvas.width = header.offsetWidth;
    canvas.height = header.offsetHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Node class dengan glowing effect
  class Node {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.size = config.nodeSize;
      this.opacity = 0;      // transisi muncul
      this.hue = Math.random() * 360; // warna random
    }

    update() {
      // Gerakan halus
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
      const maxSpeed = config.speed;
      this.vx = Math.max(Math.min(this.vx, maxSpeed), -maxSpeed);
      this.vy = Math.max(Math.min(this.vy, maxSpeed), -maxSpeed);

      this.x += this.vx;
      this.y += this.vy;

      // Pantulan di batas canvas
      if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
      if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

      // Tarikan halus ke mouse (terompet)
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < config.mouseRadius) {
          const ease = 0.02 + 0.03 * (dist / config.mouseRadius);
          const angle = Math.atan2(dy, dx);
          const funnelRadius = config.funnelMinRadius +
            (config.funnelMaxRadius - config.funnelMinRadius) * (dist / config.mouseRadius);

          this.x += Math.cos(angle) * funnelRadius * 0.02 + dx * ease;
          this.y += Math.sin(angle) * funnelRadius * 0.02 + dy * ease;
        }
      }

      // Transisi muncul node baru
      this.opacity += 0.02;
      if (this.opacity > 1) this.opacity = 1;

      // Update hue untuk glowing effect
      this.hue += Math.random() * 2;
      if (this.hue > 360) this.hue -= 360;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

      // efek glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
      ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.opacity})`;
      ctx.fill();

      // reset shadow agar garis tidak terkena efek glow
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
  }

  // Tambah node baru
  function initNodes(count) {
    for (let i = 0; i < count; i++) {
      nodes.push(new Node());
    }
  }

  // Max distance proporsional
  function getMaxDistance() {
    return baseMaxDistance * Math.sqrt(baseNodeCount / nodes.length);
  }

  // Hubungkan node dengan garis halus
  function connectNodes() {
    const maxDistance = getMaxDistance();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          // alpha berdasarkan rata-rata opacity kedua node
          const alpha = ((nodes[i].opacity + nodes[j].opacity) / 2) * (1 - dist / maxDistance) * config.lineOpacity;
          ctx.strokeStyle = `rgba(${config.nodeColor},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(node => { node.update(); node.draw(); });
    connectNodes();
    requestAnimationFrame(animate);
  }

  header.addEventListener("mousemove", e => {
    const rect = header.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  header.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Inisialisasi node awal
  initNodes(config.nodeCount);
  animate();

  // Return object untuk manipulasi node
  return {
    addNodes: (count) => initNodes(count),
    getNodeCount: () => nodes.length
  };
}

document.addEventListener("DOMContentLoaded", () => {
  setupAccordion(".accordion", "show");
  setupAccordion(".accordion-programming", "show-programming");
  // Inisialisasi slider
  createRobustSeamlessSlider({ container: "#slider", slideClass: "mySlides", interval: 4000 });
  createRobustSeamlessSlider({ container: "#slider2", slideClass: "mySlides2", interval: 4000 });
  createRobustSeamlessSlider({ container: "#slider3", slideClass: "mySlides3", interval: 4000 });
  createRobustSeamlessSlider({ container: "#slider4", slideClass: "mySlides4", interval: 4000 });
  // 
  const nodeHeader = initNodeHeader("header", {
    nodeCount: 200,
    speed: 0.5,
    nodeSize: 3,
    nodeColor: "255,255,255", // warna garis tetap hitam
    mouseRadius: 120,
    lineOpacity: 0.6
  });

  const maxNodes = 1000;
  const intervalNode = 10;

  const timer = setInterval(() => {
    const currentCount = nodeHeader.getNodeCount();
    if (currentCount >= maxNodes) {
      clearInterval(timer);
      return;
    }
    nodeHeader.addNodes(intervalNode);
  }, 1000);
  // --- Inisialisasi overlay ---
  createImageOverlay(sliders, "#imgOverlay");
  // 
  smoothScrollToAccordion();
});










