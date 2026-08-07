# gvbapps.github.io — developer Pages site

These files are the source for the developer's public GitHub Pages site,
hosted OUTSIDE this repo in a repo named `gvbapps.github.io` (GitHub user/org
site → serves at `https://gvbapps.github.io/`).

- `app-ads.txt` → `https://gvbapps.github.io/app-ads.txt` (AdMob authorized-sellers)
- `privacy.html` → `https://gvbapps.github.io/privacy.html` (wired into the app as PRIVACY_POLICY_URL)
- `index.html`  → landing page

Keep `privacy.html` in sync with `docs/reference-privacy-policy.md`.
To deploy: copy these three files into the root of the `gvbapps.github.io` repo,
push to `main`, then enable Pages (Settings → Pages → Deploy from a branch → main / root).
