function identifyObject(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;

  // Pastikan hanya berjalan jika yang diedit adalah kolom A (komentar)
  if (range.getColumn() == 1 && range.getRow() > 1) {
    var comment = range.getValue();
    var object = getObjectFromComment(comment);
    
    // Isi kolom C dengan hasil identifikasi objek
    sheet.getRange(range.getRow(), 3).setValue(object);
  }

  // Hapus isi kolom B jika kolom A kosong
  clearEmptySentimentRows(sheet);
}

function getObjectFromComment(comment) {
  var apiKey = "GEMINI_API_KEY"; // Ganti dengan API Key Gemini
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  var payload = {
    "contents": [
      {
        "parts": [
          {
            "text": "Dari komentar berikut: '" + comment + "', tentukan objek utama yang disebutkan. Jawab hanya dengan objeknya saja."
          }
        ]
      }
    ]
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());

  if (json && json.candidates && json.candidates.length > 0) {
    return json.candidates[0].content.parts[0].text.trim();
  }

  return "Tidak dikenali"; // Jika gagal mendapatkan hasil
}

/**
 * Menghapus data di kolom C jika kolom A kosong
 * @param {Object} sheet - Objek sheet Google Spreadsheet
 */
function clearEmptySentimentRows(sheet) {
  var lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) { // Mulai dari baris ke-2 (hindari header)
    var comment = sheet.getRange(i, 1).getValue();
    if (comment === "") {
      sheet.getRange(i, 3).setValue(""); // Hapus nilai di kolom C
    }
  }
}
