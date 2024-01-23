const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  exportToCSV: () => ipcRenderer.invoke("export-to-csv"),
  exportToExcel: () => ipcRenderer.invoke("export-to-excel"),
  exportToPDF: () => ipcRenderer.invoke("export-to-pdf"),
});
