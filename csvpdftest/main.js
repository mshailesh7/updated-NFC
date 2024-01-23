const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const fs = require("fs");

let db = new sqlite3.Database("./demo.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the demo SQLite database.");
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function exportToCSV() {
  db.all("SELECT * FROM plantData", [], (err, rows) => {
    if (err) {
      throw err;
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(rows);
    fs.writeFileSync("output.csv", csv);
  });
}

function exportToExcel() {
  db.all("SELECT * FROM plantData", [], (err, rows) => {
    if (err) {
      throw err;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "output.xlsx");
  });
}

function exportToPDF() {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("output.pdf"));

  db.all("SELECT * FROM plantData", [], (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach((row) => {
      doc.text(JSON.stringify(row));
    });

    doc.end();
  });
}

ipcMain.handle("export-to-csv", async (event) => {
  exportToCSV();
  return "CSV Exported";
});

ipcMain.handle("export-to-excel", async (event) => {
  exportToExcel();
  return "Excel Exported";
});

ipcMain.handle("export-to-pdf", async (event) => {
  exportToPDF();
  return "PDF Exported";
});
