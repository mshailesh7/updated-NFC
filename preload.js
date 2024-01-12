const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the window object
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

contextBridge.exposeInMainWorld('api', {
    captureNFC: () => ipcRenderer.send('capture-nfc')
  });

  contextBridge.exposeInMainWorld('electronAPI', {
    runPythonScript: () => ipcRenderer.send('run-script'),
    // onPythonOutput: (callback) => ipcRenderer.on('script-output', callback)
    onExcelData: (callback) => ipcRenderer.on('excel-data', callback)
});

// contextBridge.exposeInMainWorld('electronAPI', {
//   readExcelFile: (filePath, sheetName, idColumn, searchId) =>
//     ipcRenderer.invoke(
//       "read-excel-file",
//       filePath,
//       sheetName,
//       idColumn,
//       searchId
//     ),
// });
