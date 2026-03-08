# Google Apps Script Setup Guide
## Manohar & Manvitha Wedding — RSVP + Photo Upload Backend

---

## Prerequisites

- A Google account (the one that owns the spreadsheet and Drive folder)
- Access to the wedding spreadsheet:
  `https://docs.google.com/spreadsheets/d/1-EAIMlrIq7hZzYQIxmJOirT6PbnKrgnEurFfXWM0U7M/edit`

---

## Step 1 — Open the Google Sheet

Open the spreadsheet link above in your browser.

---

## Step 2 — Open Apps Script

In the spreadsheet menu bar, click:

**Extensions → Apps Script**

A new browser tab opens with the Apps Script editor.

---

## Step 3 — Paste the Code

1. In the Apps Script editor, **select all existing code** (Ctrl+A / Cmd+A) and **delete it**
2. Open the file `Code.gs` from this folder
3. **Copy the entire contents** of `Code.gs`
4. **Paste** it into the Apps Script editor
5. Click **Save** (Ctrl+S / Cmd+S) or the floppy disk icon 💾

---

## Step 4 — Create the RSVPs Sheet Tab (Auto-Setup)

This step creates the `RSVPs` sheet tab with all 14 column headers, purple styling, frozen row, and correct column widths — automatically.

1. In the Apps Script editor toolbar, find the **function dropdown** (it says "Select function")
2. Choose **`setupSheet`** from the dropdown
3. Click **▶ Run**

### First-time authorization (one-time only)

The first time you run any function, Google asks for permission:

1. A dialog says "Authorization required" → click **Review permissions**
2. Choose your **Google account**
3. A warning says "Google hasn't verified this app" → click **Advanced**
4. Click **"Go to (project name) (unsafe)"**
5. Click **Allow**

> This is normal. The script only accesses your own spreadsheet and Drive folder.

### Verify it worked

- At the bottom of the editor, click **Logs** — it should say:
  ```
  Created new sheet: RSVPs
  Headers written to row 1.
  setupSheet() complete.
  ```
- Go back to your **spreadsheet tab** — you will see a new tab called **RSVPs** with purple column headers

---

## Step 5 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the **gear ⚙ icon** (top left of the dialog) → select **Web app**
3. Fill in the settings:
   - **Description:** `Wedding RSVP v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Copy the **Web app URL** shown — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

> **Keep this URL safe.** You will paste it into the website file in the next step.

---

## Step 6 — Connect the URL to the Website

1. Open `manohar-manvitha.html` in a code editor
2. Use Find (Ctrl+F / Cmd+F) to search for:
   ```
   YOUR_DEPLOYMENT_ID_HERE
   ```
3. Replace the **entire URL** on that line with the Web app URL you copied:
   ```js
   const RSVP_API = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Save the file

---

## Step 7 — Share the Drive Photos Folder

Guests upload photos through the website. The Apps Script saves them to a Drive folder on your behalf — but the folder must allow that.

1. Open [Google Drive](https://drive.google.com)
2. Find the **wedding photos folder** (folder ID: `1hyCcXbo7Z5ROM949m7dEZ4jgXXVhFRiJ`)
3. Right-click the folder → **Share**
4. Click **"Change to anyone with the link"**
5. Set the role to **Editor** (so the script can write files)
6. Click **Done**

---

## Step 8 — Test It

Open `manohar-manvitha.html` in a browser (or run `python3 -m http.server 8000` and visit `http://localhost:8000/manohar-manvitha.html`).

### Test RSVP
1. Fill out either the Cocktail or Wedding RSVP form
2. Submit it
3. Open the spreadsheet → **RSVPs** tab → confirm a new row was added

### Test Photo Upload
1. Scroll to the **Share Your Memories** section
2. Tap/click the drop zone and select a small image file
3. Click **Upload Photos**
4. Confirm the file appears in the Drive photos folder

---

## Sheet Column Reference

| Column | Name | Values |
|--------|------|--------|
| A | Token | 8-char unique ID (used in guest's personal URL) |
| B | FormType | `cocktail` or `wedding` |
| C | Name | Guest's full name |
| D | Attendance | `joyfully` / `trying` / `blessings` |
| E | GuestCount | `1`–`5` (empty when sending blessings) |
| F | Meal | `veg` / `nonveg` — Cocktail form only |
| G | Drink | `cocktail` / `mocktail` — Cocktail form only |
| H | DJSong | Song request text — Cocktail form only |
| I | Dance | `yes` / `maybe` / `no` — Cocktail form only |
| J | DanceSong | Dance song request — Cocktail form only |
| K | BangleSize | e.g. `2.6` — Wedding form only |
| L | FavoriteGod | Deity name — Wedding form only |
| M | Message | Personal message or blessings |
| N | Timestamp | ISO 8601 datetime of submission |

---

## How to Update the Code Later

Any time you edit `Code.gs`, the live deployment does **not** update automatically. You must create a new version:

1. Make your edits in the Apps Script editor
2. Click **Deploy → Manage deployments**
3. Click the **pencil ✏ icon** next to your deployment
4. Under Version, select **New version**
5. Click **Deploy**

> The Web app URL stays the same — no changes needed in `manohar-manvitha.html`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| RSVP submit fails silently | Wrong or missing `RSVP_API` URL in HTML | Re-check Step 6 |
| "Sheet RSVPs not found" error | `setupSheet()` was never run | Run Step 4 |
| Photo upload fails | Drive folder not shared as Editor | Re-check Step 7 |
| Old code still running after edit | Deployment not updated | Re-deploy per "Update" section above |
| Authorization error on first run | Permissions not granted | Re-run Steps 4 authorization flow |
