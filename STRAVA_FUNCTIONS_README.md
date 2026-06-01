# Iron Body Strava Functions

This folder contains the Firebase callable backend required by `App_1.9.3.jsx`.

The frontend only contains the Strava client ID. The Strava client secret must stay server-side and be stored in Firebase Secret Manager.

## One-time setup

From this folder:

```bash
npm --prefix functions install
firebase login
firebase use iron-body-b1e75
firebase functions:secrets:set STRAVA_CLIENT_SECRET
firebase deploy --only functions
```

When prompted for `STRAVA_CLIENT_SECRET`, paste the secret from the Strava API application page.

## Strava settings

In your Strava API application settings, set **Authorization Callback Domain** to the domain where the app runs.

Examples:

- `localhost` for local testing
- your StackBlitz preview domain
- your production domain

The app requests the `activity:write` scope and uses Firebase callable functions:

- `stravaExchangeCode`
- `stravaGetConnection`
- `stravaDisconnect`
- `stravaSyncSession`

No Firestore rule change is required for these token documents because the functions use the Firebase Admin SDK.
