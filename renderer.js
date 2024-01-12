function saveData() {
  const plantName = document.getElementById('plantDropdown').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  const height = document.getElementById('height').value;
  const width = document.getElementById('width').value;
  const storedLocationData = JSON.parse(localStorage.getItem('locationData'));


  ipcRenderer.send('save-data', { plantName, latitude, longitude, height, width, ...storedLocationData });


  alert("Data saved successfully!");
}

function discardData() {

  ipcRenderer.send("discard-data");

  alert("Data discarded!");
}

document.getElementById('captureNfcButton').addEventListener('click', () => {
  window.electronAPI.runPythonScript();
});

// window.electronAPI.onPythonOutput((event, data) => {
//   console.log('Received Data:', data);
//   readExcelData(data);
// });

// function readExcelData(searchId) {
//   const sheetName = 'Sheet1'; 
//   const idColumn = 'Serial No';

//   window.electronAPI.readExcelFile('data.xlsx', sheetName, idColumn, searchId)
//       .then(data => {
//           if (data) {
//               document.getElementById('species').value = data.Species || '';
//               document.getElementById('common').value = data.CommonName || '';
//           } else {
//               document.getElementById('species').value = '';
//               document.getElementById('common').value = '';
//               alert('No data found for the provided ID.');
//           }
//       })
//       .catch(err => {
//           alert(`Error: ${err.message}`);
//       });
// }

window.electronAPI.onExcelData((event, data) => {
  if (data) {
      document.getElementById('species').value = data.Species || '';
      document.getElementById('common').value = data.CommonName || '';
  } else {
      document.getElementById('species').value = '';
      document.getElementById('common').value = '';
      alert('No data found for the provided ID.');
  }
});

function Carbon(height, width) {
  var Tbv = 0.4 * (width * width) * height;
  var AGB = 0.7 * Tbv;
  var BGB = AGB * 0.26;
  var TB = AGB + BGB;
  var C = TB / 2;
  var CS = C * 3.6663;
  return CS;
}

