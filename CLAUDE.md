# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static wedding website for **Manohar & Manvitha** (May 3, 2026, South Jordan, Utah). Indian aesthetic with lavender/white/gold color palette. No build tools, no frameworks — pure HTML/CSS/JS served as static files.

## Architecture

```
Guest Browser ──POST──> Google Apps Script ──> Google Sheet ("RSVPs" tab)
              <──token──
Guest Browser ──GET?token=xxx──> Google Apps Script ──> returns guest data
```

- **`manohar-manvitha.html`** — Primary wedding site. Single-file SPA with all CSS/JS inline. Contains RSVP form, event filtering, countdown timer, animations, and guest personalization logic.
- **`google-apps-script/Code.gs`** — Google Apps Script backend. Handles `doPost` (RSVP submission, token generation) and `doGet` (guest lookup by token). Deployed as a web app.

## Key Concepts

### RSVP Flow & Guest Personalization
1. Guest submits RSVP form → POST to Apps Script → receives 8-char token
2. Events section (hidden by default) appears showing only selected events
3. URL updates to `?guest=<token>` — this is the guest's personal link
4. Returning guests: GET with token → data fetched → events auto-filtered, success state restored

### Event Cards
Each event card requires a `data-event` attribute matching checkbox values exactly: `haldi`, `mehendi`, `sangeet`, `wedding`, `reception`.

### API Connection
The `RSVP_API` constant in `manohar-manvitha.html` (search for `YOUR_DEPLOYMENT_ID_HERE`) must be set to the Google Apps Script deployment URL. The form sends `Content-Type: text/plain` to avoid CORS preflight.

### Google Sheet Schema
Tab name must be exactly `RSVPs`. Columns: Token | FormType | Name | Attendance | GuestCount | Meal | Drink | DJSong | Dance | DanceSong | BangleSize | FavoriteGod | Message | Timestamp.

Two form types populate the same sheet:
- **cocktail** — fills: Meal, Drink, DJSong, Dance, DanceSong
- **wedding** — fills: BangleSize, FavoriteGod

Shared columns (both forms): Token, FormType, Name, Attendance, GuestCount, Message, Timestamp.

## Development

No build step. Open HTML files directly in a browser or use any static file server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

For Apps Script changes: edit in the Apps Script editor, then redeploy (Deploy > Manage deployments > pencil icon > New version > Deploy).

## Design Tokens

Both HTML files use CSS custom properties for the lavender/gold theme (e.g., `--lav-600: #9333ea`, `--gold: #d4af37`). Fonts: Great Vibes (script headings), Cormorant Infant (body), Cinzel (nav/labels), Playfair Display (accents).
