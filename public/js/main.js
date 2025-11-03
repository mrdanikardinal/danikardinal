
//start function send html layouting
function includeHTML(id, file) {
  return trackFetch(file)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then((html) => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = html;
      } else {
        const errorLog = document.getElementById("error-log") || document.body;
        errorLog.innerHTML += `
              <div class="error-box">
                🔧 Gagal memuat komponen <strong>#${id}</strong>. Periksa struktur HTML Anda.
              </div>`;
        throw new Error(`Element #${id} tidak ditemukan`);
      }
    });
}
// Fetch tracker for progress bar
let activeRequests = 0;
function updateProgressBar() {
  const bar = document.getElementById("page-progress-bar");
  if (!bar) return;
  if (activeRequests > 0) {
    bar.style.display = "block";
    bar.style.width = `${Math.min(90, activeRequests * 20)}%`;
  } else {
    bar.style.width = "100%";
    setTimeout(() => {
      bar.style.display = "none";
      bar.style.width = "0%";
    }, 300);
  }
}
function trackFetch(...args) {
  activeRequests++;
  updateProgressBar();
  return fetch(...args)
    .then((res) => res)
    .catch((err) => { throw err; })
    .finally(() => {
      activeRequests = Math.max(0, activeRequests - 1);
      updateProgressBar();
    });
}
function setupChildHeaderButtonScroll() {
  const childHeader = document.getElementById("child-header");
  const scrollLeftBtn = document.getElementById("scroll-child-left");
  const scrollRightBtn = document.getElementById("scroll-child-right");

  if (childHeader && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener("click", () => {
      childHeader.scrollBy({ left: -150, behavior: "smooth" });
    });

    scrollRightBtn.addEventListener("click", () => {
      childHeader.scrollBy({ left: 150, behavior: "smooth" });
    });
  }
}

// Mulai saat halaman dimuat
const pathParts = window.location.pathname.split("/");
const section2 = pathParts[2];
const section3 = pathParts[3];
const jsonPath = section2 && section3
  ? `/docs/${section2}/${section3}/sidebar.json`
  : "/components/data/default-sidebar.json";


//end sidebar left css

//start body-code-sniping
async function initPage() {
  try {
    // Tambahkan class loading ke body
    document.body.classList.add("loading");

    // Load komponen HTML secara paralel
    const includeTasks = [
      includeHTML("header", "../../../components/header.html"),
      includeHTML("main-navbar", "../../../components/navbar.html"),
      includeHTML("footer", "../../../components/footer.html"),
    ];

    await Promise.all(includeTasks);

    // Hapus class loading setelah semua komponen termuat
    document.body.classList.remove("loading");

    // Setup tombol toggle sidebar
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebarBtn");
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = sidebar.style.display === "none";
        sidebar.style.display = isHidden ? "block" : "none";
        toggleBtn.textContent = isHidden
          ? "Sembunyikan Sidebar"
          : "Tampilkan Sidebar";
      });
    }

    // Set tahun sekarang di elemen #year-now jika tersedia
    const yearNow = document.getElementById("year-now");
    if (yearNow) {
      yearNow.textContent = new Date().getFullYear();
    }

    // Render sidebar, header anak, dan fungsionalitas tambahan
    await renderSidebarFromJSON(jsonPath);
    await renderChildHeader("../../../components/data/child-header.json");

    // Aktifkan berbagai fitur UX/UI
    setupChildHeaderScroll();
    setupScrollSpy();
    setupBackToTop();
    setupChildHeaderButtonScroll();
  } catch (err) {
    console.error("Terjadi kesalahan saat memuat komponen:", err);
  }
}

// Jalankan initPage setelah DOM siap
window.addEventListener("DOMContentLoaded", initPage);

// Fungsi progress loading saat halaman dimuat
document.addEventListener("readystatechange", () => {
  const bar = document.getElementById("page-progress-bar");
  if (!bar) return;

  if (document.readyState === "interactive") {
    bar.style.width = "50%";
  } else if (document.readyState === "complete") {
    bar.style.width = "100%";
    setTimeout(() => bar.style.display = "none", 500); // Sembunyikan setelah selesai
  }
});

//end function send html layouting
//start fungsi render child header menu katogori
function renderChildHeader(jsonPath) {
  return fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      console.warn(`⚠️ Gagal memuat ${jsonPath}, menggunakan kategori default.`);
      return [
        { label: "Programming", category: "programming" },
        { label: "Broadcasting", category: "broadcasting" },
      ];
    })
    .then((categories) => {
      const container = document.getElementById("child-header-container");
      const wrapper = document.getElementById("child-header");
      if (!container || !wrapper) return;

      container.innerHTML = categories
        .map(
          (cat) =>
            `<button class="child-btn" data-category="${cat.category}">${cat.label}</button>`
        )
        .join("");

      container.querySelectorAll(".child-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          container.querySelectorAll(".child-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          renderNavbarByCategory("/components/data/navbar.json", btn.dataset.category);

          // Scroll tombol ke tengah view
          const offsetLeft = btn.offsetLeft;
          const centerPos = offsetLeft - wrapper.clientWidth / 2 + btn.clientWidth / 2;
          wrapper.scrollTo({ left: centerPos, behavior: "smooth" });
        });
      });

      if (categories.length > 0) {
        container.querySelector(".child-btn").click();
        updateScrollButtonsVisibility();

        // ⬅️ Tambahkan ini agar tombol scroll langsung sinkron:
        setTimeout(updateScrollButtonsVisibility, 300);
      }
    });
}
//end  fungsi render child header menu katogori

//start funtion scroll logic navbar support left-right button
function setupChildHeaderScroll() {
  const scrollArea = document.getElementById("child-header");
  const leftBtn = document.querySelector(".child-header-wrapper .scroll-btn.left");
  const rightBtn = document.querySelector(".child-header-wrapper .scroll-btn.right");

  if (!scrollArea || !leftBtn || !rightBtn) return;

  leftBtn.addEventListener("click", () => {
    scrollArea.scrollBy({ left: -120, behavior: "smooth" });
    setTimeout(updateScrollButtonsVisibility, 300);
  });

  rightBtn.addEventListener("click", () => {
    scrollArea.scrollBy({ left: 120, behavior: "smooth" });
    setTimeout(updateScrollButtonsVisibility, 300);
  });

  // Deteksi scroll manual
  scrollArea.addEventListener("scroll", updateScrollButtonsVisibility);
}
function setupNavbarScroll() {
  const scrollArea = document.getElementById("main-navbar");
  const leftBtn = document.querySelector(
    ".navbar-scroll-wrapper .scroll-btn.left"
  );
  const rightBtn = document.querySelector(
    ".navbar-scroll-wrapper .scroll-btn.right"
  );

  if (!scrollArea || !leftBtn || !rightBtn) return;

  leftBtn.addEventListener("click", () => {
    scrollArea.scrollBy({ left: -120, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    scrollArea.scrollBy({ left: 120, behavior: "smooth" });
  });
}
//end funtion scroll logic navbar support left-right button
// start fungsi render navbar by categori
function renderNavbarByCategory(jsonPath, selectedCategory) {
  return fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((allItems) => {
      const navbar = document.getElementById("main-navbar");
      if (!navbar) return;

      let items = allItems.filter((item) => item.category === selectedCategory);

      if (!items || items.length === 0) {
        navbar.innerHTML = `
              <div class="nav-empty">
                ⚠️ Tidak ada item untuk kategori <b>${selectedCategory}</b>.
              </div>
            `;
        return;
      }

      navbar.innerHTML = items
        .map((item) => {
          return `<a class="nav-item" href="${item.path}">${item.label}</a>`;
        })
        .join("");



      setupNavbarScroll();
      startAutoScrollNavbar();
      setupAutoScrollPauseOnHover();
    })
    .catch((err) => {
      console.error(`❌ Gagal memuat navbar dari ${jsonPath}`, err);
      const navbar = document.getElementById("main-navbar");
      if (navbar) {
        navbar.innerHTML = `<div class="nav-empty">🚫 Gagal memuat menu navigasi.</div>`;
      }
    });
}

// end fungsi render navbar by categori
//start sidebar left function
//baca konten & deteksi list sidebar jadi path & auto collapse & Check hover active saat reload
let originalSidebarItems = [];
function renderSidebarFromJSON(jsonPath) {
  return fetch(jsonPath) // ⬅️ TAMBAHKAN `return` DI SINI
    .then((res) => res.json())
    .then((items) => {
      originalSidebarItems = items;
      updateSidebar(items, "");
      setupSearchListener();
    });
}
function updateSidebar(filteredItems, keyword = "") {
  const sidebar = document.getElementById("sidebar");
  const counter = document.getElementById("search-count");
  const currentFile = window.location.pathname.split("/").pop();

  if (filteredItems.length === 0) {
    sidebar.innerHTML = `<div class="no-results">Tidak ada menu yang cocok.</div>`;
    if (counter) {
      counter.textContent = "";
      counter.style.visibility = "hidden";
    }
    return;
  }

  const html = buildSidebarList(filteredItems, currentFile, keyword);
  sidebar.innerHTML = html;
  enableToggles();

  if (counter) {
    const count = countSidebarItems(filteredItems);
    counter.textContent = count + " Cocok Bos";
    counter.style.visibility = keyword ? "visible" : "hidden";
  }
}
function countSidebarItems(items) {
  let count = 0;

  for (const item of items) {
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;

    if (!hasChildren) {
      count += 1; // hanya item akhir yang dihitung
    } else {
      // Hanya hitung dari anaknya, bukan parentnya
      count += countSidebarItems(item.children);
    }
  }

  return count;
}
function filterSidebarItems(items, keyword) {
  const result = [];
  for (const item of items) {
    const label = item.label || "";
    const hasChildren = Array.isArray(item.children);
    const match = label.toLowerCase().includes(keyword.toLowerCase());

    if (match) {
      result.push(item);
    } else if (hasChildren) {
      const filteredChildren = filterSidebarItems(item.children, keyword);
      if (filteredChildren.length > 0) {
        result.push({
          ...item,
          children: filteredChildren,
        });
      }
    }
  }
  return result;
}
function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
function buildSidebarList(items, currentFile, keyword = "") {
  function build(items) {
    let html = "<ul>";
    let anyActive = false;

    for (const item of items) {
      const isCurrent = item.file === currentFile;
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;

      let childHTML = "";
      let childActive = false;

      if (hasChildren) {
        const result = build(item.children);
        childHTML = result.html;
        childActive = result.anyActive;
      }

      // Cek apakah label cocok dengan keyword
      const matchSelf =
        keyword && item.label.toLowerCase().includes(keyword.toLowerCase());
      const isActive = isCurrent || matchSelf || childActive;
      const activeClass = isCurrent ? "active" : "";
      const openClass = isActive && hasChildren ? "open" : "";
      const labelHTML = highlightKeyword(item.label, keyword);

      html += `
            <li class="toggleable ${openClass}">
              <a href="${item.file || "#"}" class="sidebar-item ${activeClass}">
                ${hasChildren ? '<span class="icon-chevron"></span>' : ""}
                ${labelHTML}
              </a>
              ${hasChildren ? `<div class="nested">${childHTML}</div>` : ""}
            </li>
          `;

      if (isActive) anyActive = true;
    }

    html += "</ul>";
    return { html, anyActive };
  }

  return build(items).html;
}
function enableToggles() {
  document.querySelectorAll(".toggleable > .sidebar-item").forEach((link) => {
    link.addEventListener("click", function (e) {
      const parent = this.parentElement;
      const hasNested = parent.querySelector(".nested");

      if (hasNested) {
        e.preventDefault(); // mencegah navigasi link
        parent.classList.toggle("open");
      }
    });
  });
}
function setupSearchListener() {
  const input = document.getElementById("sidebar-search");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    const filtered = filterSidebarItems(originalSidebarItems, keyword);
    updateSidebar(filtered, keyword);
  });
}


//start body-code-sniping

function copyCode(btn) {
  const codeEl = btn?.parentElement?.querySelector("code");
  if (!codeEl) return;

  navigator.clipboard.writeText(codeEl.innerText).then(() => {
    btn.innerText = "Copied!";
    setTimeout(() => (btn.innerText = "Copy"), 1500);
  });
}

//end body-code-sniping

//start function scrollspy sidebar right and maps on read smooth
function setupScrollSpy() {
  const headings = document.querySelectorAll("main h2, main h3");
  const spyContainer = document.getElementById("scrollspy");

  if (!spyContainer || !headings.length) return;

  const slugify = (text) =>
    text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const usedIds = new Set();
  headings.forEach((heading) => {
    if (!heading.id) {
      let id = slugify(heading.textContent);
      let uniqueId = id, i = 1;
      while (usedIds.has(uniqueId)) uniqueId = `${id}-${i++}`;
      heading.id = uniqueId;
    }
    usedIds.add(heading.id);
  });

  // Bangun daftar scrollspy
  spyContainer.innerHTML = "";
  headings.forEach((heading) => {
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.dataset.target = heading.id;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(heading.id).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Highlight manual saat klik
      setActiveLink(heading.id);
    });

    spyContainer.appendChild(link);
  });

  const links = spyContainer.querySelectorAll("a");

  function setActiveLink(id) {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);

      // Scroll ke link yang aktif jika keluar dari viewport
      if (isActive) {
        link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    });
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -60% 0px", // Heading terlihat 40% dari atas
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        setActiveLink(id);
      }
    });
  }, observerOptions);

  headings.forEach((heading) => observer.observe(heading));
}
//end function scrollspy sidebar right and maps on read smooth

//star tombol kembali keatas
function setupBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const mainContent = document.querySelector("main.main-content");
  if (mainContent) {
    mainContent.addEventListener("scroll", () => {
      btn.classList.toggle("show", mainContent.scrollTop > 300);
    });

    btn.addEventListener("click", () => {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    });
  }


}
//end tombol kembali keatas



//✅ 1. Tambahkan fungsi auto-scroll ini di file JS kamu:
let autoScrollInterval;
let scrollDirection = 1; // 1 = kanan, -1 = kiri

function startAutoScrollNavbar() {
  const navbar = document.getElementById("main-navbar");
  if (!navbar) return;

  stopAutoScrollNavbar(); // Hentikan sebelumnya

  autoScrollInterval = setInterval(() => {
    navbar.scrollLeft += 1 * scrollDirection;

    if (navbar.scrollLeft + navbar.clientWidth >= navbar.scrollWidth) {
      scrollDirection = -1; // berbalik kiri
    } else if (navbar.scrollLeft <= 0) {
      scrollDirection = 1; // berbalik kanan
    }
  }, 50);
}
function stopAutoScrollNavbar() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}
// Fungsi ini bisa dipanggil kapan pun navbar diperbarui
function setupAutoScrollPauseOnHover() {
  const leftBtn = document.getElementById("scroll-navbar-left");
  const rightBtn = document.getElementById("scroll-navbar-right");

  // Pastikan elemen ada
  if (!leftBtn || !rightBtn) return;

  [leftBtn, rightBtn].forEach((btn) => {
    btn.addEventListener("mouseenter", stopAutoScrollNavbar);
    btn.addEventListener("mouseleave", startAutoScrollNavbar);
  });

  // Opsional: jika ingin berhenti juga saat mouse berada di navbar
  const navbar = document.getElementById("main-navbar");
  if (navbar) {
    navbar.addEventListener("mouseenter", stopAutoScrollNavbar);
    navbar.addEventListener("mouseleave", startAutoScrollNavbar);
  }
}
//button scroll menu child-header menghilang
function updateScrollButtonsVisibility() {
  const container = document.getElementById("child-header");
  const leftBtn = document.getElementById("scroll-child-left");
  const rightBtn = document.getElementById("scroll-child-right");

  if (!container || !leftBtn || !rightBtn) return;

  const scrollLeft = container.scrollLeft;
  const maxScrollLeft = container.scrollWidth - container.clientWidth;

  leftBtn.style.display = scrollLeft <= 0 ? "none" : "inline-block";
  rightBtn.style.display = scrollLeft >= maxScrollLeft - 1 ? "none" : "inline-block";
}


