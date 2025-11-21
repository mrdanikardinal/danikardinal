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

// Gunakan fungsi untuk berbagai accordion
setupAccordion(".accordion", "show");
setupAccordion(".accordion-programming", "show-programming");
