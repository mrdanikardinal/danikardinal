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
let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
document.addEventListener("DOMContentLoaded", () => {

  showSlides(slideIndex);

});


