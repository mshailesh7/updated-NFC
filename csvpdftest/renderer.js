document.getElementById("exportCSV").addEventListener("click", () => {
  window.electronAPI.exportToCSV();
});

document.getElementById("exportExcel").addEventListener("click", () => {
  window.electronAPI.exportToExcel();
});

document.getElementById("exportPDF").addEventListener("click", () => {
  window.electronAPI.exportToPDF();
});
