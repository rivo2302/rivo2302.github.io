# Portfolio — Rivo Lalaina

Live: https://rivo2302.github.io

Static one-page site (Vite + TypeScript, no framework). All content lives in `index.html` for SEO.

## Develop

```sh
npm ci
npm run dev       # http://localhost:5173
npm run build     # type-check + production build in dist/
```

## Docker

```sh
docker build -t portfolio .
docker run -p 8080:8080 portfolio   # http://localhost:8080
```

Or pull the published image: `docker run -p 8080:8080 ghcr.io/rivo2302/portfolio:latest`.
Served by unprivileged nginx (security headers, gzip, immutable caching of hashed assets, `/healthz`).
To serve under a sub-path: `docker build --build-arg BASE_PATH=/portfolio/ …`.

## CI/CD

- **CI** (`.github/workflows/ci.yml`, every PR): type-check, build, Lighthouse (SEO 100, a11y/best practices ≥ 95), Docker build + smoke test.
- **CD** (`.github/workflows/cd.yml`, push to `main`): reruns CI, then deploys GitHub Pages and publishes the multi-arch image to GHCR.

One-time setup: *Settings → Pages → Source: GitHub Actions*.

## Custom domain

Update the absolute URLs (`https://rivo2302.github.io/`) in `index.html`, `public/robots.txt`, `public/sitemap.xml` and `public/404.html`. The base path is picked up automatically by CD.
