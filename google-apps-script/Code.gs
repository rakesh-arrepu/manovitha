/**
 * Google Apps Script — RSVP Backend for Manohar & Manvitha Wedding
 *
 * SETUP:
 * 1. Create a Google Sheet and name the first tab "RSVPs"
 * 2. Add headers in row 1:
 *    Token | FormType | Name | Attendance | GuestCount | Meal | Drink | DJSong | Dance | DanceSong | BangleSize | FavoriteGod | Message | Timestamp
 * 3. Go to Extensions > Apps Script, paste this code
 * 4. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and paste it into the RSVP_API constant in manohar-manvitha.html
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVPs');
    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet "RSVPs" not found' });
    }

    var data = JSON.parse(e.postData.contents);

    // Generate unique 8-char token
    var token = generateToken();
    var tokens = sheet.getRange('A:A').getValues().flat().filter(String);
    var attempts = 0;
    while (tokens.indexOf(token) !== -1 && attempts < 10) {
      token = generateToken();
      attempts++;
    }

    sheet.appendRow([
      token,
      data.formType || '',                           // cocktail | wedding
      (data.name || '').substring(0, 200),            // guest name
      data.attendance || '',                          // joyfully | trying | blessings
      data.guestCount || '',                          // 1-5+
      data.meal || '',                                // veg | nonveg (cocktail form)
      data.drink || '',                               // cocktail | mocktail (cocktail form)
      (data.djSong || '').substring(0, 300),          // DJ song requests (cocktail form)
      data.dance || '',                               // yes | maybe | no (cocktail form)
      (data.danceSong || '').substring(0, 300),       // dance song request (cocktail form)
      (data.bangleSize || '').substring(0, 100),      // bangle size (wedding form)
      (data.favoriteGod || '').substring(0, 100),     // favorite god (wedding form)
      (data.message || '').substring(0, 500),         // comments / blessings
      new Date().toISOString()
    ]);

    return jsonResponse({ status: 'ok', token: token });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  try {
    var token = e.parameter.token;
    if (!token) {
      return jsonResponse({ status: 'error', message: 'No token provided' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVPs');
    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet "RSVPs" not found' });
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === token) {
        return jsonResponse({
          status: 'ok',
          guest: {
            token:       data[i][0],
            formType:    data[i][1],
            name:        data[i][2],
            attendance:  data[i][3],
            guestCount:  data[i][4],
            meal:        data[i][5],
            drink:       data[i][6],
            djSong:      data[i][7],
            dance:       data[i][8],
            danceSong:   data[i][9],
            bangleSize:  data[i][10],
            favoriteGod: data[i][11],
            message:     data[i][12]
          }
        });
      }
    }

    return jsonResponse({ status: 'error', message: 'Guest not found' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function generateToken() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 8);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
