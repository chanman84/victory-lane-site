# Victory Lane Cards

Homepage and admin tools for Victory Lane Cards.

## Local development

Run the API and the Vite site in separate terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

The frontend runs on `http://localhost:5173`.
The admin API runs on `http://localhost:3001`.

## Admin login

The first time the API starts, it creates a default admin user if no users exist yet.

Default local login:

- Username: `admin`
- Password: `ChangeMe123!`

Sign in from the `Admin Login` button in the site header, then create your real accounts right away.

## Environment variables

See [.env.example](C:\Users\JamesChandler\OneDrive - Virtumarc\Desktop\Virtumarc\CodeX\victory-lane-site\.env.example) for the full set.

Important values:

- `VITE_API_BASE_URL`
  Use this when building the frontend for GitHub Pages so it knows where the hosted API lives.
- `FRONTEND_ORIGIN`
  The live site origin allowed to call the API, for example your GitHub Pages URL or custom domain.
- `VLC_AUTH_SECRET`
  Long random secret used to sign admin auth tokens.
- `VLC_DATA_DIR`
  Directory where `users.json` and `show-settings.json` are stored.

## GitHub Pages frontend

The workflow at [.github/workflows/deploy.yml](C:\Users\JamesChandler\OneDrive - Virtumarc\Desktop\Virtumarc\CodeX\victory-lane-site\.github\workflows\deploy.yml) builds the frontend on pushes to `main`.

Set this GitHub repository variable before deploying:

- `VITE_API_BASE_URL`

Example:

```text
https://victory-lane-cards-api.onrender.com
```

## Render backend

Recommended service type:

- Web Service

Recommended settings:

- Build Command: `npm ci`
- Start Command: `npm run server`
- Node version: `20`

Recommended Render environment variables:

- `FRONTEND_ORIGIN`
- `VLC_AUTH_SECRET`
- `VLC_ADMIN_USERNAME`
- `VLC_ADMIN_PASSWORD`
- `VLC_DATA_DIR`

Important:

- If you want users and show settings to survive deploys and restarts, point `VLC_DATA_DIR` at a persistent disk mount.
- Without persistent storage, Render will eventually reset your saved users and show updates.

## Deployment flow

1. Create the Render backend service.
2. Set the backend environment variables.
3. Copy the Render service URL.
4. Add that URL to the GitHub repository variable `VITE_API_BASE_URL`.
5. Push to `main` again to redeploy the frontend against the hosted API.
