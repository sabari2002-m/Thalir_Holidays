# Thalir Holidays

Static travel website for South Indian tour packages. The site is built with HTML, CSS, and vanilla JavaScript and is deployed with GitHub Pages.

## Live site

https://sabari2002-m.github.io/Thalir_Holidays/

## Features

- Browse destinations and travel packages
- Filter packages by state, duration, and price
- Responsive mobile-friendly layout
- Static package catalog with destination filtering
- No server, database, or environment variables required

## Project structure

```
Thalir/
├── docs/
│   ├── css/styles.css
│   ├── images/
│   ├── js/data.js
│   ├── js/main.js
│   ├── index.html
│   ├── packages.html
├── index.html
├── DEPLOYMENT.md
└── README.md
```

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Open **Settings > Pages**.
3. Choose **Deploy from a branch**.
4. Select branch `main` and folder `/docs`.
5. Click **Save**.

The root `index.html` is also included as a fallback redirect to `docs/index.html`.

## Local preview

From the repository root, run any static file server. For example:

```bash
npx serve docs
```
