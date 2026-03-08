# RSVP System Setup Guide

Personalized RSVP system for the Manohar & Manvitha wedding website.
Guests submit their info via the form, receive a unique link, and see only the events they're attending.

---

## Architecture Overview

```
Guest Browser                  Google Apps Script             Google Sheet
     |                               |                            |
     |-- POST /exec (RSVP data) ---->|                            |
     |                               |-- appendRow() ------------>|
     |                               |<-- row saved ------------  |
     |<-- { token: "a1b2c3d4" } -----|                            |
     |                               |                            |
     |-- GET /exec?token=xxx ------->|                            |
     |                               |-- getDataRange() --------->|
     |                               |<-- row data -------------- |
     |<-- { guest: { ... } } --------|                            |
```

**Stack:** Static HTML + Google Sheets (via Apps Script) — no server, no database, no hosting cost.

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new blank spreadsheet**
2. Rename the spreadsheet to: `Manohar & Manvitha Wedding RSVPs`
3. Rename the default tab (bottom-left) to exactly: **`RSVPs`** (case-sensitive)
4. Add these **8 column headers** in Row 1:

   | A       | B    | C          | D    | E      | F     | G        | H         |
   |---------|------|------------|------|--------|-------|----------|-----------|
   | Token   | Name | GuestCount | Meal | Events | Phone | Blessing | Timestamp |

5. Save the sheet (Ctrl+S / Cmd+S)

> **Why these columns?** The Apps Script writes data in this exact order. The `Token` column (A) acts as a unique guest identifier, and `Events` stores a comma-separated list like `haldi,wedding,reception`.

---

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. A new Apps Script editor opens in a separate tab
3. **Delete** all default code in `Code.gs`
4. Open the file `google-apps-script/Code.gs` from this project
5. **Copy the entire contents** and paste into the Apps Script editor
6. Press **Ctrl+S** (Cmd+S) to save
7. Name the project: `Wedding RSVP Backend` (click "Untitled project" at the top-left)

### What the script does

| Function          | Purpose                                                        |
|-------------------|----------------------------------------------------------------|
| `doPost(e)`       | Receives RSVP form data, generates a unique token, saves a row |
| `doGet(e)`        | Looks up a guest by `?token=xxx` and returns their data        |
| `generateToken()` | Creates an 8-character UUID-based token                        |
| `jsonResponse()`  | Wraps responses as JSON with proper MIME type                  |

---

## Step 3: Deploy as a Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the **gear icon** (Select type) and choose **Web app**
3. Configure:
   - **Description:** `RSVP API v1`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**

### Authorization prompt

5. Click **Authorize access**
6. Choose your Google account
7. If you see **"Google hasn't verified this app"**:
   - Click **Advanced** (bottom-left)
   - Click **Go to Wedding RSVP Backend (unsafe)**
   - Click **Allow**

> This is normal for personal Apps Script projects. You're granting your own script permission to access your own sheet.

8. Copy the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycbx_LONG_ID_HERE/exec
   ```

**Keep this URL safe** — you'll need it in the next step.

---

## Step 4: Connect the Website

1. Open `manohar-manvitha.html`
2. Find **line 1491** (search for `YOUR_DEPLOYMENT_ID_HERE`):
   ```js
   const RSVP_API='https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';
   ```
3. Replace the **entire URL** with the one you copied in Step 3:
   ```js
   const RSVP_API='https://script.google.com/macros/s/AKfycbx_YOUR_ACTUAL_ID/exec';
   ```
4. Save the file

---

## Step 5: Test the System

### Test A — Submit an RSVP

1. Open `manohar-manvitha.html` in your browser
2. Confirm the **Events section is NOT visible** on the page (hidden by default)
3. Confirm the **Events nav link** is also hidden
4. Scroll to the **RSVP section**
5. Fill in: name, guest count, meal preference, select some events, phone, blessing
6. Click **Send RSVP**
7. Expected results:
   - A **success card** appears with a copyable personal link
   - The **URL updates** to `?guest=<8-char-token>` (e.g., `?guest=a1b2c3d4`)
   - The **Events section appears** with only the events you selected
   - The **Events nav link** becomes visible in the navigation
   - A **personal banner** appears above the event cards
   - The page **scrolls to the Events section** automatically

### Test B — Verify the Sheet

1. Open your Google Sheet
2. A new row should appear with all the submitted data
3. Column A has the generated token

### Test C — Returning Guest

1. Copy the personal link from the success card
2. Open it in a **new tab** or **incognito window**
3. The page should auto-load with:
   - Filtered events matching the guest's selections
   - RSVP form replaced with the success/thank-you state

### Test D — Mobile

1. Open in Chrome DevTools (F12 > toggle device toolbar) or on your phone
2. Verify the RSVP form, checkboxes, and success state render correctly

---

## Step 6: Host and Share

The website is a static HTML file. Host it anywhere:

| Option            | How                                                      |
|-------------------|----------------------------------------------------------|
| **GitHub Pages**  | Push to a repo, enable Pages in Settings                 |
| **Netlify**       | Drag and drop the HTML file at [app.netlify.com](https://app.netlify.com) |
| **Vercel**        | `vercel deploy` from this directory                      |
| **Firebase**      | `firebase init hosting` + `firebase deploy`              |

Once hosted, share the **base URL** (e.g., `https://yoursite.com/manohar-manvitha.html`) with guests.
After they RSVP, they receive a personal link they can bookmark.

---

## How Guest Personalization Works

```
1. Guest opens: https://yoursite.com/manohar-manvitha.html
   → Sees full site with RSVP form (Events section is HIDDEN)

2. Guest submits RSVP (selects: haldi, wedding)
   → POST to Apps Script → gets token "a1b2c3d4"
   → Events section APPEARS showing only Haldi & Wedding cards
   → URL becomes: ?guest=a1b2c3d4
   → Events section shows only Haldi & Wedding cards
   → Form replaced with success card + copyable link

3. Guest revisits: ?guest=a1b2c3d4
   → GET to Apps Script → fetches their data
   → Events auto-filtered, success state restored
```

---

## Troubleshooting

### "Failed to submit RSVP" error
- **Check the API URL** — make sure you replaced `YOUR_DEPLOYMENT_ID_HERE` with the actual deployment URL
- **Check CORS** — the form sends `Content-Type: text/plain` to avoid preflight. If you changed this, revert it
- **Check the sheet tab name** — must be exactly `RSVPs` (capital R, capital S, capital V, capital P, lowercase s)

### Form submits but no row in the sheet
- Open Apps Script editor > **Executions** (left sidebar) to see logs
- Ensure the script is deployed with **Execute as: Me** and **Who has access: Anyone**

### Events not filtering
- Verify each event card in the HTML has a `data-event` attribute:
  ```html
  <div class="evp-card" data-event="haldi">
  <div class="evp-card" data-event="mehendi">
  <div class="evp-card" data-event="sangeet">
  <div class="evp-card" data-event="wedding">
  <div class="evp-card" data-event="reception">
  ```
- Check the checkbox values match: `haldi`, `mehendi`, `sangeet`, `wedding`, `reception`

### "Google hasn't verified this app" warning
- This is normal for personal scripts. Click **Advanced > Go to (project name) > Allow**
- Only you (the sheet owner) see this during setup. Guests never see it — they interact through the web app URL

### Updating the Apps Script code
- After editing `Code.gs` in the Apps Script editor, you must **redeploy**:
  1. Go to **Deploy > Manage deployments**
  2. Click the **pencil icon** on your deployment
  3. Change **Version** to **New version**
  4. Click **Deploy**

---

## Google Sheet Column Reference

| Column | Field      | Example Value                  | Max Length |
|--------|------------|--------------------------------|------------|
| A      | Token      | `a1b2c3d4`                     | 8 chars    |
| B      | Name       | `John & Family`                | 200 chars  |
| C      | GuestCount | `4`                            | —          |
| D      | Meal       | `veg`                          | —          |
| E      | Events     | `haldi,wedding,reception`      | —          |
| F      | Phone      | `+91 98765 43210`              | 30 chars   |
| G      | Blessing   | `Wishing you a happy life...`  | 500 chars  |
| H      | Timestamp  | `2026-04-15T10:30:00.000Z`     | ISO 8601   |
