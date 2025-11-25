

document.addEventListener("DOMContentLoaded", () => {
function setupAccordion(selector, panelClass) {
  const accordions = document.querySelectorAll(selector);

  accordions.forEach((accordion) => {
    accordion.addEventListener("click", () => {
      accordion.classList.toggle("active"); // ikon plus/minus
      const panel = accordion.nextElementSibling;
      panel.classList.toggle(panelClass); // toggle panel sesuai class
    });
  });
}

const skillBars = document.querySelectorAll('.skills');

function animateSkill(bar) {
  const target = parseInt(bar.getAttribute('data-progress'));
  let width = 0;
  const stepTime = 45; // ms per step
  const increment = 1;

  const interval = setInterval(() => {
    if (width >= target) {
      clearInterval(interval);
      bar.textContent = target + '%';
    } else {
      width += increment;
      bar.style.width = width + '%';
      bar.textContent = width + '%';
    }
  }, stepTime);
}

// Animasi saat hover
skillBars.forEach((bar) => {
  bar.parentElement.addEventListener('mouseenter', () => {
    bar.style.width = '0%'; // reset dulu
    bar.textContent = '0%';
    animateSkill(bar);
  });

  bar.parentElement.addEventListener('mouseleave', () => {
    bar.style.width = '0%';
    bar.textContent = '0%';
  });
});

// Animasi saat accordion dibuka
function setupAccordion(selector, panelClass) {
  const accordions = document.querySelectorAll(selector);

  accordions.forEach((accordion) => {
    accordion.addEventListener("click", () => {
      accordion.classList.toggle("active");
      const panel = accordion.nextElementSibling;
      panel.classList.toggle(panelClass);

      // Jalankan animasi skill bars di panel yang baru dibuka
      if (panel.classList.contains(panelClass)) {
        const barsInPanel = panel.querySelectorAll('.skills');
        barsInPanel.forEach((bar) => {
          bar.style.width = '0%';
          bar.textContent = '0%';
          animateSkill(bar);
        });
      }
    });
  });
}

// Inisialisasi accordion
setupAccordion(".accordion", "show");
setupAccordion(".accordion-programming", "show-programming");

});
