/**
 * Google Apps Script — RSVP + Photo Upload Backend
 * Manohar & Manvitha Wedding · May 3, 2026
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ONE-TIME SETUP STEPS (do these in order)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * STEP 1 — Open the Google Sheet
 *   Open this spreadsheet:
 *   https://docs.google.com/spreadsheets/d/1-EAIMlrIq7hZzYQIxmJOirT6PbnKrgnEurFfXWM0U7M/edit
 *
 * STEP 2 — Open Apps Script
 *   In the sheet, click:  Extensions  →  Apps Script
 *   A new browser tab opens with the Apps Script editor.
 *
 * STEP 3 — Paste this entire file
 *   Delete all existing code in the editor, then paste this entire file.
 *
 * STEP 4 — Auto-create the sheet headers
 *   In the editor top toolbar, select the function "setupSheet" from the
 *   dropdown (it shows "Select function"), then click ▶ Run.
 *   → This creates a tab named "RSVPs" with the correct 14-column headers.
 *   → If the tab already exists it is left unchanged (safe to re-run).
 *   → You will be asked to authorize the script — click "Review permissions",
 *     choose your Google account, click "Advanced" → "Go to ... (unsafe)",
 *     then "Allow". This is normal for first-time authorization.
 *
 * STEP 5 — Deploy as a Web App
 *   Click  Deploy  →  New deployment
 *   · Click the gear ⚙ icon and choose  "Web app"
 *   · Description:  Wedding RSVP v1  (any name)
 *   · Execute as:   Me
 *   · Who has access:  Anyone
 *   Click  Deploy  →  Copy the Web app URL that appears.
 *
 * STEP 6 — Paste the URL into the website
 *   Open  manohar-manvitha.html  and find the line:
 *     const RSVP_API = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';
 *   Replace  YOUR_DEPLOYMENT_ID_HERE  with the URL you just copied.
 *   Save the file.
 *
 * STEP 7 — Share the Drive photos folder
 *   Open Google Drive and navigate to the wedding photos folder (ID below).
 *   Right-click the folder → Share → Change to "Anyone with the link"
 *   and set role to "Editor" (Contributor).
 *   This allows the Apps Script to save guest photos to the folder.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * HOW TO REDEPLOY AFTER CODE CHANGES
 * ──────────────────────────────────────────────────────────────────────────────
 *   Any time you edit this file you MUST create a new deployment version:
 *   Deploy  →  Manage deployments  →  pencil ✏ icon  →  Version: New version
 *   →  Deploy.  The URL stays the same — no changes needed in the HTML.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * SHEET SCHEMA  (tab name must be exactly "RSVPs")
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  Col A  Token        — unique 8-char ID, used in the guest's personal URL
 *  Col B  FormType     — "cocktail" or "wedding"
 *  Col C  Name         — guest's full name
 *  Col D  Attendance   — "joyfully" | "trying" | "blessings"
 *  Col E  GuestCount   — number of guests (1-5), empty if sending blessings
 *  Col F  Meal         — "veg" | "nonveg"  (cocktail form only)
 *  Col G  Drink        — "cocktail" | "mocktail"  (cocktail form only)
 *  Col H  DJSong       — DJ song request text  (cocktail form only)
 *  Col I  Dance        — "yes" | "maybe" | "no"  (cocktail form only)
 *  Col J  DanceSong    — dance song request text  (cocktail form only)
 *  Col K  BangleSize   — bangle size e.g. "2.6"  (wedding form only)
 *  Col L  FavoriteGod  — favorite deity name  (wedding form only)
 *  Col M  Message      — personal message / blessings for the couple
 *  Col N  Timestamp    — ISO 8601 datetime of submission
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
var SHEET_NAME  = 'RSVPs';
var FOLDER_ID   = '1hyCcXbo7Z5ROM949m7dEZ4jgXXVhFRiJ'; // Wedding photos Drive folder
var SHEET_HEADERS = [
  'Token', 'FormType', 'Name', 'Attendance', 'GuestCount',
  'Meal', 'Drink', 'DJSong', 'Dance', 'DanceSong',
  'BangleSize', 'FavoriteGod', 'Message', 'Timestamp'
];
// ─────────────────────────────────────────────────────────────────────────────


/**
 * setupSheet()
 * Run this ONCE from the Apps Script editor to create the RSVPs tab and headers.
 * Safe to re-run — will not overwrite existing data.
 */
function setupSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    Logger.log('Created new sheet: ' + SHEET_NAME);
  } else {
    Logger.log('Sheet "' + SHEET_NAME + '" already exists — leaving data intact.');
  }

  // Only write headers if row 1 is empty
  var firstCell = sheet.getRange('A1').getValue();
  if (!firstCell) {
    var headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
    headerRange.setValues([SHEET_HEADERS]);

    // Style the header row
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4a235a');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');

    // Freeze header row so it stays visible while scrolling
    sheet.setFrozenRows(1);

    // Set column widths for readability
    sheet.setColumnWidth(1, 90);   // Token
    sheet.setColumnWidth(2, 90);   // FormType
    sheet.setColumnWidth(3, 200);  // Name
    sheet.setColumnWidth(4, 100);  // Attendance
    sheet.setColumnWidth(5, 90);   // GuestCount
    sheet.setColumnWidth(6, 80);   // Meal
    sheet.setColumnWidth(7, 90);   // Drink
    sheet.setColumnWidth(8, 220);  // DJSong
    sheet.setColumnWidth(9, 80);   // Dance
    sheet.setColumnWidth(10, 220); // DanceSong
    sheet.setColumnWidth(11, 100); // BangleSize
    sheet.setColumnWidth(12, 150); // FavoriteGod
    sheet.setColumnWidth(13, 280); // Message
    sheet.setColumnWidth(14, 170); // Timestamp

    Logger.log('Headers written to row 1.');
  } else {
    Logger.log('Row 1 already has data — headers left unchanged.');
  }

  Logger.log('setupSheet() complete. Open the "' + SHEET_NAME + '" tab to verify.');
}


/**
 * doPost(e)
 * Handles two request types:
 *   1. formType === "photoUpload"  → saves file to Drive, returns fileId
 *   2. formType === "cocktail" | "wedding"  → saves RSVP row, returns token
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ── PHOTO UPLOAD ─────────────────────────────────────────────────────────
    if (data.formType === 'photoUpload') {
      if (!data.fileName || !data.mimeType || !data.data)
        return jsonResponse({ status: 'error', message: 'Missing required fields: fileName, mimeType, data' });

      var allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic',
                     'video/mp4', 'video/quicktime'];
      if (allowed.indexOf(data.mimeType) === -1)
        return jsonResponse({ status: 'error', message: 'File type not allowed: ' + data.mimeType });

      var safeName = data.fileName.replace(/[^a-zA-Z0-9._\- ]/g, '_').substring(0, 120);
      var blob     = Utilities.newBlob(Utilities.base64Decode(data.data), data.mimeType, safeName);
      var file     = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
      return jsonResponse({ status: 'ok', fileId: file.getId(), fileName: safeName });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── RSVP SUBMISSION ──────────────────────────────────────────────────────
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet)
      return jsonResponse({ status: 'error', message: 'Sheet "' + SHEET_NAME + '" not found. Run setupSheet() first.' });

    if (!data.formType || !data.name || !data.attendance)
      return jsonResponse({ status: 'error', message: 'Missing required fields: formType, name, attendance' });

    // Generate a unique 8-char token
    var token    = generateToken();
    var existing = sheet.getRange('A:A').getValues().flat().filter(String);
    var attempts = 0;
    while (existing.indexOf(token) !== -1 && attempts < 10) {
      token = generateToken();
      attempts++;
    }

    sheet.appendRow([
      token,                                          // A  Token
      data.formType,                                  // B  FormType       cocktail | wedding
      (data.name         || '').substring(0, 200),    // C  Name
      data.attendance    || '',                        // D  Attendance     joyfully | trying | blessings
      data.guestCount    || '',                        // E  GuestCount     1-5  (empty for blessings)
      data.meal          || '',                        // F  Meal           veg | nonveg  (cocktail only)
      data.drink         || '',                        // G  Drink          cocktail | mocktail  (cocktail only)
      (data.djSong       || '').substring(0, 300),    // H  DJSong         (cocktail only)
      data.dance         || '',                        // I  Dance          yes | maybe | no  (cocktail only)
      (data.danceSong    || '').substring(0, 300),    // J  DanceSong      (cocktail only)
      (data.bangleSize   || '').substring(0, 100),    // K  BangleSize     (wedding only)
      (data.favoriteGod  || '').substring(0, 100),    // L  FavoriteGod    (wedding only)
      (data.message      || '').substring(0, 500),    // M  Message
      new Date().toISOString()                         // N  Timestamp
    ]);

    return jsonResponse({ status: 'ok', token: token });
    // ─────────────────────────────────────────────────────────────────────────

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}


/**
 * doGet(e)
 * Looks up a guest by token: ?token=XXXXXXXX
 * Returns the full guest record so the website can restore the RSVP state.
 */
function doGet(e) {
  try {
    // ── ADMIN ENDPOINT ───────────────────────────────────────────────────────
    if (e.parameter.action === 'admin') {
      if (e.parameter.pin !== '2026')
        return jsonResponse({ status: 'error', message: 'Unauthorized' });

      var adminSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!adminSheet)
        return jsonResponse({ status: 'error', message: 'Sheet not found' });

      var rows = adminSheet.getDataRange().getValues();
      var guests = [];
      for (var i = 1; i < rows.length; i++) {
        if (!rows[i][0] && !rows[i][2]) continue; // skip empty rows
        guests.push({
          token:       rows[i][0],
          formType:    rows[i][1],
          name:        rows[i][2],
          attendance:  rows[i][3],
          guestCount:  rows[i][4],
          meal:        rows[i][5],
          drink:       rows[i][6],
          djSong:      rows[i][7],
          dance:       rows[i][8],
          danceSong:   rows[i][9],
          bangleSize:  rows[i][10],
          favoriteGod: rows[i][11],
          message:     rows[i][12],
          timestamp:   rows[i][13] instanceof Date
                         ? rows[i][13].toISOString()
                         : String(rows[i][13])
        });
      }
      return jsonResponse({ status: 'ok', count: guests.length, guests: guests });
    }
    // ─────────────────────────────────────────────────────────────────────────

    var token = e.parameter.token;
    if (!token)
      return jsonResponse({ status: 'error', message: 'No token provided' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet)
      return jsonResponse({ status: 'error', message: 'Sheet "' + SHEET_NAME + '" not found' });

    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === token) {
        return jsonResponse({
          status: 'ok',
          guest: {
            token:       rows[i][0],   // A
            formType:    rows[i][1],   // B
            name:        rows[i][2],   // C
            attendance:  rows[i][3],   // D
            guestCount:  rows[i][4],   // E
            meal:        rows[i][5],   // F
            drink:       rows[i][6],   // G
            djSong:      rows[i][7],   // H
            dance:       rows[i][8],   // I
            danceSong:   rows[i][9],   // J
            bangleSize:  rows[i][10],  // K
            favoriteGod: rows[i][11],  // L
            message:     rows[i][12]   // M
          }
        });
      }
    }

    return jsonResponse({ status: 'error', message: 'Guest not found' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}


// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateToken() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 8);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
