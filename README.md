# Lumenari System

The Lumenari System is the home page for six coding puzzle journeys: Noctiluca (Python), Aurora (CSS), Vespera (HTML), Stellara (JavaScript), Lunara (React), and Eclipsa (Django).

## Stack

- React 18 and TypeScript
- Vite 7
- GitHub Actions deployment to GitHub Pages

## Local development

```sh
npm ci
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Deploy

Create the `hassanireza/lumenari-system` repository, upload these files to its `main` branch, and enable GitHub Pages with GitHub Actions as the source. The workflow deploys the built `dist` directory. The production base path is `/lumenari-system/`.

The game cards link to the sibling repositories at `https://hassanireza.github.io/{repository}/`.
