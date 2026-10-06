# GitHub Pages Deployment

The static site is ready in the `docs/` folder.

## Enable GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings > Pages**.
3. Choose **Deploy from a branch**.
4. Select branch `main` and folder `/docs`.
5. Click **Save**.


The site will be available at: https://sabari2002-m.github.io/Thalir_Holidays/

## Local preview

From the repository root, run a static server such as:

```bash
npx serve docs
```

GitHub Pages uses only the static files in `docs/`.
