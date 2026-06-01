const { onCall, HttpsError } = require("firebase-functions/https");
const { defineSecret } = require("firebase-functions/params");
const STRAVA_CLIENT_ID = "253842";
const STRAVA_CLIENT_SECRET = defineSecret("STRAVA_CLIENT_SECRET");
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/activities";
const STRAVA_DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";
const CALL_OPTIONS = { region: "us-central1" };
const SECRET_CALL_OPTIONS = { ...CALL_OPTIONS, secrets: [STRAVA_CLIENT_SECRET] };

let adminInstance = null;
let dbInstance = null;

function getAdmin() {
  if (!adminInstance) {
    adminInstance = require("firebase-admin");
    if (!adminInstance.apps.length) adminInstance.initializeApp();
  }
  return adminInstance;
}

function getDb() {
  if (!dbInstance) dbInstance = getAdmin().firestore();
  return dbInstance;
}

function authedUid(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in first.");
  return uid;
}

function stravaRef(uid) {
  return getDb().doc(`users/${uid}/integrations/strava`);
}

function cleanAthlete(athlete) {
  if (!athlete) return null;
  return {
    id: athlete.id || null,
    username: athlete.username || null,
    firstname: athlete.firstname || "",
    lastname: athlete.lastname || "",
    profile: athlete.profile || athlete.profile_medium || null,
  };
}

function publicConnection(data) {
  if (!data || !data.refreshToken) return { connected: false };
  return {
    connected: true,
    athlete: data.athlete || null,
    scope: data.scope || "",
    updatedAt: data.updatedAt || null,
  };
}

async function stravaPost(url, body, accessToken) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }
  if (!res.ok) {
    const detail = json && (json.message || json.error || JSON.stringify(json));
    throw new HttpsError("failed-precondition", detail || `Strava request failed (${res.status}).`);
  }
  return json || {};
}

async function saveTokenSet(uid, tokenData, previous = {}) {
  const data = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_at,
    scope: tokenData.scope || previous.scope || "",
    athlete: cleanAthlete(tokenData.athlete) || previous.athlete || null,
    updatedAt: getAdmin().firestore.FieldValue.serverTimestamp(),
  };
  await stravaRef(uid).set(data, { merge: true });
  return data;
}

async function refreshIfNeeded(uid, data) {
  if (!data || !data.refreshToken) {
    throw new HttpsError("failed-precondition", "Strava is not connected.");
  }
  const expiresAtMs = Number(data.expiresAt || 0) * 1000;
  if (data.accessToken && expiresAtMs > Date.now() + 60 * 1000) return data;

  const tokenData = await stravaPost(STRAVA_TOKEN_URL, {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET.value(),
    grant_type: "refresh_token",
    refresh_token: data.refreshToken,
  });
  return saveTokenSet(uid, tokenData, data);
}

function startDateLocal(session) {
  const start = Number(session.startTime || Date.now());
  return new Date(start).toISOString();
}

function elapsedSeconds(session) {
  const explicit = Number(session.elapsedSeconds || 0);
  if (explicit > 0) return Math.max(60, Math.round(explicit));
  const minutes = Number(session.duration || 0);
  if (minutes > 0) return Math.max(60, Math.round(minutes * 60));
  const start = Number(session.startTime || 0);
  const end = Number(session.endTime || 0);
  if (start && end && end > start) return Math.max(60, Math.round((end - start) / 1000));
  return 60;
}

function totalDistanceMeters(session) {
  const exercises = Array.isArray(session.exercises) ? session.exercises : [];
  const km = exercises.reduce((sum, ex) => {
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    return sum + sets.reduce((a, s) => a + Number(s.distance || 0), 0);
  }, 0);
  return km > 0 ? Math.round(km * 1000) : undefined;
}

function descriptionForSession(session) {
  const lines = [];
  lines.push("Posted from Iron Body.");
  if (session.intensity) lines.push(`Intensity: ${session.intensity}/10`);
  if (session.doneSets || session.totalSets) lines.push(`Sets: ${session.doneSets || 0}/${session.totalSets || 0}`);
  if (session.volume) lines.push(`Volume: ${Math.round(session.volume).toLocaleString()} kg`);
  if (session.calories) lines.push(`Calories: ${Math.round(Number(session.calories))} kcal`);

  const exercises = Array.isArray(session.exercises) ? session.exercises : [];
  const exerciseLines = exercises
    .map((ex) => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (!sets.length) return "";
      const setSummary = sets
        .map((s) => {
          if (ex.type === "cardio") {
            const parts = [];
            if (s.duration) parts.push(`${s.duration} min`);
            if (s.distance) parts.push(`${s.distance} km`);
            if (s.calories) parts.push(`${s.calories} kcal`);
            return parts.join(" / ") || "done";
          }
          const reps = s.reps || 0;
          const weight = s.weight || 0;
          return `${reps} x ${weight}kg`;
        })
        .join(", ");
      return `${ex.name || "Exercise"}: ${setSummary}`;
    })
    .filter(Boolean);

  if (exerciseLines.length) {
    lines.push("");
    lines.push("Exercises:");
    lines.push(...exerciseLines.slice(0, 24));
    if (exerciseLines.length > 24) lines.push(`+${exerciseLines.length - 24} more`);
  }
  return lines.join("\n").slice(0, 2000);
}

exports.stravaExchangeCode = onCall(SECRET_CALL_OPTIONS, async (request) => {
  const uid = authedUid(request);
  const code = String(request.data && request.data.code || "");
  const redirectUri = String(request.data && request.data.redirectUri || "");
  if (!code || !redirectUri) {
    throw new HttpsError("invalid-argument", "Missing Strava authorization code.");
  }

  const tokenData = await stravaPost(STRAVA_TOKEN_URL, {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET.value(),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const saved = await saveTokenSet(uid, tokenData);
  return publicConnection(saved);
});

exports.stravaGetConnection = onCall(CALL_OPTIONS, async (request) => {
  const uid = authedUid(request);
  const snap = await stravaRef(uid).get();
  return publicConnection(snap.exists ? snap.data() : null);
});

exports.stravaDisconnect = onCall(SECRET_CALL_OPTIONS, async (request) => {
  const uid = authedUid(request);
  const snap = await stravaRef(uid).get();
  if (snap.exists) {
    const data = snap.data();
    try {
      const fresh = await refreshIfNeeded(uid, data);
      if (fresh.accessToken) {
        await fetch(STRAVA_DEAUTHORIZE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${fresh.accessToken}` },
        });
      }
    } catch (err) {
      console.warn("Strava deauthorize skipped:", err && err.message);
    }
  }
  await stravaRef(uid).delete();
  return { connected: false };
});

exports.stravaSyncSession = onCall(SECRET_CALL_OPTIONS, async (request) => {
  const uid = authedUid(request);
  const session = request.data && request.data.session;
  if (!session || typeof session !== "object") {
    throw new HttpsError("invalid-argument", "Missing workout session.");
  }
  const snap = await stravaRef(uid).get();
  const tokenData = await refreshIfNeeded(uid, snap.exists ? snap.data() : null);

  const activity = {
    name: session.name || "Iron Body Workout",
    sport_type: session.sportType || "WeightTraining",
    start_date_local: startDateLocal(session),
    elapsed_time: elapsedSeconds(session),
    description: descriptionForSession(session),
  };
  const distance = totalDistanceMeters(session);
  if (distance) activity.distance = distance;

  const result = await stravaPost(STRAVA_ACTIVITIES_URL, activity, tokenData.accessToken);
  return {
    activityId: result.id || null,
    externalId: session.id || null,
    status: "created",
  };
});
