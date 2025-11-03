function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    alert(`Kamu mencari: "${query}"`);
    // Implementasi pencarian di sini
  } else {
    alert("Silakan masukkan kata pencarian.");
  }
}
