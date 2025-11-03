// docs.js (gabungan lengkap semua fungsi)
let activeRequests = 0;
const jsonCache = {};
let originalSidebarItemsForDocs = [];

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

function cachedJSON(url) {
  if (jsonCache[url]) return Promise.resolve(jsonCache[url]);
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Gagal fetch ${url}`);
      return res.json();
    })
    .then(json => {
      jsonCache[url] = json;
      return json;
    });
}

async function renderSidebarFromChildHeaderForDocs(jsonPathHeader, jsonPathSidebar, targetCategory = null) {
  try {
    const [childHeader, sidebarData] = await Promise.all([
      cachedJSON(jsonPathHeader),
      cachedJSON(jsonPathSidebar)
    ]);

    const filteredHeader = targetCategory
      ? childHeader.filter(h => h.category === targetCategory)
      : childHeader;

    const combined = filteredHeader.map(headerItem => {
      const matchingItems = sidebarData
        .filter(sideItem => sideItem.category === headerItem.category)
        .map(sideItem => ({
          ...sideItem,
         path: sideItem.path.replace(/^(\.\.\/)+/, '')

        }));

      return {
        label: headerItem.label,
        file: headerItem.file,
        category: headerItem.category,
        children: matchingItems
      };
    });

    originalSidebarItemsForDocs = combined;
    updateSidebarForDocs(combined);
    setupSearchListenerForDocs();

  } catch (error) {
    console.error("Gagal memuat atau menggabungkan data sidebar:", error);
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.innerHTML = `<div class="error-box">❌ Sidebar tidak dapat dimuat.</div>`;
    }
  }
}


function updateSidebarForDocs(filteredItems, keyword = "") {
  const sidebar = document.getElementById("sidebar");
  const counter = document.getElementById("search-count");
  const currentPath = window.location.pathname.replace(/^.*?\/docs\//, "");

  if (filteredItems.length === 0) {
    sidebar.innerHTML = `<div class="no-results">Tidak ada menu yang cocok.</div>`;
    if (counter) {
      counter.textContent = "";
      counter.style.visibility = "hidden";
    }
    return;
  }

  const html = buildSidebarListForDocs(filteredItems, currentPath, keyword);
  sidebar.innerHTML = html;
  enableTogglesForDocs();

  if (counter) {
    const count = countSidebarItemsForDocs(filteredItems);
    counter.textContent = count + " cocok ditemukan";
    counter.style.visibility = keyword ? "visible" : "hidden";
  }

  setTimeout(() => {
    const activeItem = document.querySelector(".sidebar-item.active");
    if (activeItem) activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

function buildSidebarListForDocs(items, currentPath, keyword = "") {
  function build(children) {
    let html = "<ul>";
    let anyActive = false;

    for (const item of children) {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;

      if (hasChildren) {
        // Render hanya children langsung
        const result = build(item.children);
        html += result.html;
        if (result.anyActive) anyActive = true;
      } else {
        const isCurrent = currentPath.endsWith(item.path || item.file);
        const matchSelf = keyword && item.label.toLowerCase().includes(keyword.toLowerCase());
        const isActive = isCurrent || matchSelf;
        const activeClass = isActive ? "active" : "";
        const labelHTML = highlightKeywordForDocs(item.label, keyword);

        html += `
          <li>
            <a href="${item.path || "#"}" class="sidebar-item ${activeClass}">
              ${labelHTML}
            </a>
          </li>
        `;

        if (isActive) anyActive = true;
      }
    }

    html += "</ul>";
    return { html, anyActive };
  }

  return build(items).html;
}


function countSidebarItemsForDocs(items) {
  let count = 0;
  for (const item of items) {
    if (item.children?.length) {
      count += countSidebarItemsForDocs(item.children);
    } else {
      count += 1;
    }
  }
  return count;
}

function setupSearchListenerForDocs() {
  const input = document.getElementById("sidebar-search");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    const filtered = filterSidebarItemsForDocs(originalSidebarItemsForDocs, keyword);
    updateSidebarForDocs(filtered, keyword);
  });
}

function filterSidebarItemsForDocs(items, keyword) {
  if (!keyword) return items;

  const result = [];
  for (const item of items) {
    const label = item.label || "";
    const hasChildren = Array.isArray(item.children);
    const match = label.toLowerCase().includes(keyword.toLowerCase());

    if (match) {
      result.push(item);
    } else if (hasChildren) {
      const filteredChildren = filterSidebarItemsForDocs(item.children, keyword);
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren });
      }
    }
  }
  return result;
}

function highlightKeywordForDocs(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function enableTogglesForDocs() {
  document.querySelectorAll(".toggle-icon").forEach((icon) => {
    icon.addEventListener("click", function (e) {
      e.preventDefault();
      const parent = this.closest(".toggleable");
      if (parent) parent.classList.toggle("open");
    });
  });
}

async function initPage() {
  try {
    document.body.classList.add("loading");

    await Promise.all([
      includeHTML("header", "../../../components/header.html"),
      includeHTML("footer", "../../../components/footer.html")
    ]);

    document.body.classList.remove("loading");

    const yearNow = document.getElementById("year-now");
    if (yearNow) yearNow.textContent = new Date().getFullYear();

    // Ambil kategori dari URL path: /docs/:category/...
    const pathMatch = window.location.pathname.match(/\/docs\/([^\/]+)/);
    const categoryFromPath = pathMatch ? pathMatch[1] : null;

    await renderSidebarFromChildHeaderForDocs(
      "../../../components/data/child-header.json",
      "../../../components/data/navbar.json",
      categoryFromPath
    );

    setupScrollSpy();
    setupBackToTop();

  } catch (err) {
    console.error("Terjadi kesalahan saat inisialisasi halaman:", err);
  }
}


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

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

window.addEventListener("DOMContentLoaded", initPage);
