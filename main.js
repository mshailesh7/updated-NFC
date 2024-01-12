const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const sqlite3 = require("sqlite3");
const { exec } = require('child_process');
const xlsx = require('xlsx');
const { NONAME } = require("dns");

let mainWindow;
const dbPath = app.getAppPath() + "/Finaltags.db";
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS plantData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    speciesName TEXT,
    commonName TEXT,
    latitude REAL,
    longitude REAL,
    height REAL,
    width REAL,
    carbonSeq REAL,
    location TEXT,
    date DATE,
    time TIME
  )
`);


function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "NatureMarkSystems",
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), 
    },
  });

  mainWindow.webContents.openDevTools();

  const starturl = url.format({
    pathname: path.join(__dirname, "renders/home.html"),
    protocol: "file",
  });

  mainWindow.loadURL(starturl);
}

app.whenReady().then(() => {
  createMainWindow();

  ipcMain.on("save-data", (event, plantData) => {
    const { plantName, latitude, longitude, height, width, location, date, time } = plantData;
    const carbonSeq = Carbon(height, width);

    const insertQuery =
      "INSERT INTO plantData (speciesName, latitude, longitude, height, width, carbonSeq, location, date, time, commonName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(insertQuery, [plantName, latitude, longitude, height, width, carbonSeq, location, date, time]);

    db.run(
      insertQuery,
      [
        plantName,
        latitude,
        longitude,
        height,
        width,
        carbonSeq,
        location,
        date,
        time,
      ],
      (err) => {
        if (err) {
          console.error("Insert error:", err);
          event.reply("data-save-error", err.message);
        } else {
          event.reply("data-saved");
        }
      }
    );
  });

  ipcMain.on("discard-data", (event) => {
    

    event.reply("data-discarded");
  });

  
});
// ipcMain.on('run-script', (event) => {
//   exec('python3 /home/nms/Desktop/integrationtest/nfc_trail.py', (error, stdout, stderr) => {
//       if (error) {
//           console.error(`Exec error: ${error}`);
//           event.reply('script-output', `Error: ${error.message}`);
//           return;
//       }
//       console.log('Python Script Output:', stdout);
//       event.reply('script-output', stdout.trim());
//   });
// });
// ipcMain.handle(
//   "read-excel-file",
//   async(event, filePath, sheetName, idColumn, searchId) => {
//     const workbook = XLSX.readFile(filePath);
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);
//     const matchingData = data.find((row) => row[idColumn] === searchId);

//     if(matchingData) {
//       return{
//         Species: matchingData["Species"],
//         CommonName: matchingData["Common name"],
//       };
//     } else {
//       return null;
//     }
//   }
// );


ipcMain.on('run-script', (event) => {
  exec('python3 renders/nfc_trail.py', (error, stdout, stderr) => {
      if (error) {
          console.error(`Exec error: ${error}`);
          // event.reply('script-output', `Error: ${error.message}`);
          // return;
      }
      console.log('Python Script Output:', stdout);

      const result = readExcelData('data.xlsx', 'Sheet1', 'Serial No', stdout.trim());
      console.log(result);
      event.reply('excel-data', result);
  });
});

function Carbon(height, width) {
  var Tbv = 0.4 * width * width * height;
  var AGB = 0.7 * Tbv;
  var BGB = AGB * 0.26;
  var TB = AGB + BGB;
  var C = TB / 2;
  var CS = C * 3.6663;
  return CS;
}

function readExcelData(filePath, sheetName, idColumn, searchId) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  const sid=String(searchId).trim()
  console.log('Search ID:', sid);
  const data = xlsx.utils.sheet_to_json(sheet);

  const processedSearchId = searchId.replace(/\s/g, "");
  console.log('Processed Search ID:', processedSearchId);

  

  const found = data.find((row) => {
    const rowId = String(row[idColumn]).trim();
    //console.log('Row ID:', rowId)
    return rowId === sid;
  });
  
  console.log('Found:', found);

  if (found) {
    return {
      Species: found["Species"],
      CommonName: found["Common name"],
    };
  } else {
    return null;
  }
}

