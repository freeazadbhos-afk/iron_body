import "./styles.css";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";

/* ─── Firebase ───────────────────────────────────────────────────────────────── */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile as fbUpdateProfile,
  deleteUser,
  linkWithCredential,
  signInAnonymously,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYl7kGDqnHVdDU0bxtaFdqto_7KdeN_SE",
  authDomain: "iron-body-b1e75.firebaseapp.com",
  projectId: "iron-body-b1e75",
  storageBucket: "iron-body-b1e75.firebasestorage.app",
  messagingSenderId: "370346548163",
  appId: "1:370346548163:web:c1243987e21dca182fbb76",
  measurementId: "G-4519ELG9ZB",
};
const fbApp = initializeApp(firebaseConfig);
const fbAuth = getAuth(fbApp);
const fbDb = getFirestore(fbApp);

/* ─── Auto-Theme ─────────────────────────────────────────────────────────────── */
function getAutoTheme() {
  const h = new Date().getHours();
  return h >= 6 && h < 20 ? "light" : "dark";
}

/* ─── Themes ────────────────────────────────────────────────────────────────── */
const DARK = {
  bg: "#080809",
  card: "#0f0f12",
  border: "#1e1e23",
  text: "#f0f0f0",
  sub: "#bbb",
  muted: "#aaa",
  dim: "#555",
  input: "#111115",
  inputB: "#252528",
  row: "#1a1a1f",
  nav: "#0a0a0d",
  navB: "#1a1a1f",
  sect: "#111115",
  accentBg: "#c8f030",
  accentT: "#080809",
  accentFg: "#c8f030",
  done: "#1a2a0a",
  doneB: "#2a4010",
  doneText: "#7aaa20",
  del: "#1a0a0a",
  delB: "#2a1515",
  delText: "#ff6b6b",
  pause: "#1e1800",
  pauseB: "#fd9644",
};
const LIGHT = {
  bg: "#f0efea",
  card: "#ffffff",
  border: "#d0cfc8",
  text: "#0a0a0a",
  sub: "#1a1a1a",
  muted: "#333",
  dim: "#555",
  input: "#f5f4ef",
  inputB: "#d0cfc8",
  row: "#ece9e2",
  nav: "#ffffff",
  navB: "#e0dfd8",
  sect: "#f5f4ef",
  accentBg: "#c8f030",
  accentT: "#1a1a1a",
  accentFg: "#3d6200",
  done: "#eaf5d0",
  doneB: "#b8d860",
  doneText: "#2e5200",
  del: "#fff0f0",
  delB: "#ffd0d0",
  delText: "#cc3333",
  pause: "#fff8e0",
  pauseB: "#e8a800",
};
const ThemeCtx = createContext(DARK);
const useTheme = () => useContext(ThemeCtx);
function useS() {
  const th = useTheme();
  return {
    input: {
      width: "100%",
      background: th.input,
      border: `1px solid ${th.inputB}`,
      borderRadius: 12,
      padding: "14px 16px",
      color: th.text,
      fontSize: 16,
      fontWeight: 500,
      outline: "none",
      fontFamily: "'Outfit',sans-serif",
    },
    card: {
      background: th.card,
      border: `1px solid ${th.border}`,
      borderRadius: 16,
      overflow: "hidden",
    },
    label: {
      fontSize: 11,
      color: th.muted,
      letterSpacing: "2px",
      fontWeight: 700,
    },
    tag: (g) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      background: `${gc(g)}22`,
      color: gc(g),
    }),
  };
}

/* ─── Exercise Database ─────────────────────────────────────────────────────── */
const DB = [
  {
    id: "e1",
    name: "Smith Machine Incline Press",
    muscle: "Upper Chest",
    group: "Chest",
  },
  {
    id: "e2",
    name: "Dumbbell Flat Bench Press",
    muscle: "Chest",
    group: "Chest",
  },
  { id: "e3", name: "Cable Pec Dec Fly", muscle: "Chest", group: "Chest" },
  {
    id: "e4",
    name: "Dumbbell Incline Press",
    muscle: "Upper Chest",
    group: "Chest",
  },
  {
    id: "e5",
    name: "Smith Machine Flat Press",
    muscle: "Chest",
    group: "Chest",
  },
  {
    id: "e6",
    name: "Low-Pulley Cable Fly",
    muscle: "Lower Chest",
    group: "Chest",
  },
  { id: "e7", name: "Machine Chest Press", muscle: "Chest", group: "Chest" },
  {
    id: "e8",
    name: "Forward Lean Dips",
    muscle: "Lower Chest",
    group: "Chest",
  },
  {
    id: "e51",
    name: "Flat Barbell Bench Press",
    muscle: "Chest",
    group: "Chest",
  },
  {
    id: "e52",
    name: "Decline Barbell Bench Press",
    muscle: "Lower Chest",
    group: "Chest",
  },
  {
    id: "e53",
    name: "Decline Dumbbell Press",
    muscle: "Lower Chest",
    group: "Chest",
  },
  { id: "e54", name: "Cable Crossover", muscle: "Chest", group: "Chest" },
  {
    id: "e55",
    name: "High-to-Low Cable Fly",
    muscle: "Lower Chest",
    group: "Chest",
  },
  {
    id: "e56",
    name: "Low-to-High Cable Fly",
    muscle: "Upper Chest",
    group: "Chest",
  },
  { id: "e57", name: "Dumbbell Pullover", muscle: "Chest", group: "Chest" },
  { id: "e58", name: "Push-Ups", muscle: "Chest", group: "Chest" },
  { id: "e15", name: "Wide-Grip Lat Pulldown", muscle: "Lats", group: "Back" },
  { id: "e16", name: "Close-Grip Lat Pulldown", muscle: "Lats", group: "Back" },
  {
    id: "e17",
    name: "Plate-Loaded Front Pulldown",
    muscle: "Lats",
    group: "Back",
  },
  { id: "e18", name: "Seated Machine Row", muscle: "Mid Back", group: "Back" },
  {
    id: "e19",
    name: "Single-Arm Iso-Lateral Row",
    muscle: "Lats",
    group: "Back",
  },
  { id: "e20", name: "T-Bar Row", muscle: "Mid Back", group: "Back" },
  {
    id: "e21",
    name: "Cable Straight-Arm Pulldown",
    muscle: "Lats",
    group: "Back",
  },
  {
    id: "e22",
    name: "Bent-Over Dumbbell Row",
    muscle: "Mid Back",
    group: "Back",
  },
  {
    id: "e59",
    name: "Conventional Deadlift",
    muscle: "Full Back",
    group: "Back",
  },
  { id: "e60", name: "Rack Pull", muscle: "Upper Back", group: "Back" },
  {
    id: "e61",
    name: "Barbell Bent-Over Row",
    muscle: "Mid Back",
    group: "Back",
  },
  {
    id: "e62",
    name: "Chest-Supported Dumbbell Row",
    muscle: "Mid Back",
    group: "Back",
  },
  { id: "e63", name: "Pull-Ups", muscle: "Lats", group: "Back" },
  { id: "e64", name: "Chin-Ups", muscle: "Lats", group: "Back" },
  {
    id: "e65",
    name: "Cable Row (Wide Grip)",
    muscle: "Mid Back",
    group: "Back",
  },
  {
    id: "e66",
    name: "Cable Row (Close Grip)",
    muscle: "Mid Back",
    group: "Back",
  },
  { id: "e67", name: "Hyperextension", muscle: "Lower Back", group: "Back" },
  { id: "e68", name: "Good Mornings", muscle: "Lower Back", group: "Back" },
  { id: "e69", name: "Meadows Row", muscle: "Lats", group: "Back" },
  {
    id: "e9",
    name: "Seated EZ Bar Preacher Curl",
    muscle: "Biceps",
    group: "Arms",
  },
  {
    id: "e10",
    name: "Dumbbell Concentration Curl",
    muscle: "Biceps",
    group: "Arms",
  },
  { id: "e11", name: "Hammer Curl", muscle: "Brachialis", group: "Arms" },
  { id: "e12", name: "Standing Cable Curl", muscle: "Biceps", group: "Arms" },
  {
    id: "e13",
    name: "Seated Incline Dumbbell Curl",
    muscle: "Biceps",
    group: "Arms",
  },
  { id: "e14", name: "Machine Preacher Curl", muscle: "Biceps", group: "Arms" },
  { id: "e70", name: "Standing Barbell Curl", muscle: "Biceps", group: "Arms" },
  { id: "e71", name: "Standing EZ Bar Curl", muscle: "Biceps", group: "Arms" },
  {
    id: "e72",
    name: "Cross-Body Hammer Curl",
    muscle: "Brachialis",
    group: "Arms",
  },
  { id: "e73", name: "Spider Curl", muscle: "Biceps", group: "Arms" },
  {
    id: "e74",
    name: "Reverse Barbell Curl",
    muscle: "Forearms",
    group: "Arms",
  },
  {
    id: "e75",
    name: "Cable Rope Hammer Curl",
    muscle: "Brachialis",
    group: "Arms",
  },
  { id: "e23", name: "V-Bar Cable Pushdown", muscle: "Triceps", group: "Arms" },
  {
    id: "e24",
    name: "Low-Pulley Overhead Triceps Extension",
    muscle: "Triceps",
    group: "Arms",
  },
  {
    id: "e25",
    name: "Overhead Cable Triceps Extension",
    muscle: "Triceps",
    group: "Arms",
  },
  {
    id: "e26",
    name: "Straight-Bar Cable Pushdown",
    muscle: "Triceps",
    group: "Arms",
  },
  { id: "e27", name: "Parallel Bar Dips", muscle: "Triceps", group: "Arms" },
  { id: "e76", name: "EZ Bar Skull Crusher", muscle: "Triceps", group: "Arms" },
  {
    id: "e77",
    name: "Dumbbell Skull Crusher",
    muscle: "Triceps",
    group: "Arms",
  },
  {
    id: "e78",
    name: "Close-Grip Bench Press",
    muscle: "Triceps",
    group: "Arms",
  },
  {
    id: "e79",
    name: "Dumbbell Overhead Triceps Extension",
    muscle: "Triceps",
    group: "Arms",
  },
  { id: "e80", name: "Rope Pushdown", muscle: "Triceps", group: "Arms" },
  { id: "e81", name: "Tricep Kickback", muscle: "Triceps", group: "Arms" },
  {
    id: "e41",
    name: "Straight-Bar Wrist Curl",
    muscle: "Forearms",
    group: "Arms",
  },
  { id: "e82", name: "Reverse Wrist Curl", muscle: "Forearms", group: "Arms" },
  {
    id: "e83",
    name: "Behind-the-Back Wrist Curl",
    muscle: "Forearms",
    group: "Arms",
  },
  {
    id: "e28",
    name: "Barbell Seated Overhead Press",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e29",
    name: "Dumbbell Seated Overhead Press",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e30",
    name: "Machine Shoulder Press",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e31",
    name: "Rope Face Pull",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "e32",
    name: "Barbell Upright Row",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e33",
    name: "Plate-Loaded Shoulder Press",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e34",
    name: "Cable Lateral Raise",
    muscle: "Side Delts",
    group: "Shoulders",
  },
  {
    id: "e35",
    name: "Cable Front Raise",
    muscle: "Front Delts",
    group: "Shoulders",
  },
  {
    id: "e36",
    name: "Dumbbell Lateral Raise",
    muscle: "Side Delts",
    group: "Shoulders",
  },
  {
    id: "e37",
    name: "Reverse Pec Deck Fly",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "e38",
    name: "Dumbbell Bent-Over Rear Delt Fly",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "e39",
    name: "Cable Silverback Shrug",
    muscle: "Traps",
    group: "Shoulders",
  },
  {
    id: "e40",
    name: "Dumbbell Shoulder Shrug",
    muscle: "Traps",
    group: "Shoulders",
  },
  { id: "e84", name: "Arnold Press", muscle: "Shoulders", group: "Shoulders" },
  {
    id: "e85",
    name: "Dumbbell Front Raise",
    muscle: "Front Delts",
    group: "Shoulders",
  },
  {
    id: "e86",
    name: "Machine Lateral Raise",
    muscle: "Side Delts",
    group: "Shoulders",
  },
  { id: "e87", name: "Barbell Shrug", muscle: "Traps", group: "Shoulders" },
  { id: "e88", name: "Cable Shrug", muscle: "Traps", group: "Shoulders" },
  {
    id: "e89",
    name: "Dumbbell Upright Row",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e90",
    name: "Landmine Press",
    muscle: "Shoulders",
    group: "Shoulders",
  },
  {
    id: "e91",
    name: "Machine Rear Delt Fly",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "e42",
    name: "Smith Machine Back Squat",
    muscle: "Quads",
    group: "Legs",
  },
  { id: "e43", name: "V-Squat Machine", muscle: "Quads", group: "Legs" },
  { id: "e44", name: "Machine Hack Squat", muscle: "Quads", group: "Legs" },
  { id: "e45", name: "Leg Press Machine", muscle: "Quads", group: "Legs" },
  { id: "e46", name: "Seated Leg Extension", muscle: "Quads", group: "Legs" },
  { id: "e47", name: "Dumbbell Split Squat", muscle: "Quads", group: "Legs" },
  { id: "e48", name: "Lying Leg Curl", muscle: "Hamstrings", group: "Legs" },
  {
    id: "e49",
    name: "Smith Machine Calf Raise",
    muscle: "Calves",
    group: "Legs",
  },
  {
    id: "e50",
    name: "V-Squat Machine Calf Raise",
    muscle: "Calves",
    group: "Legs",
  },
  { id: "e92", name: "Barbell Back Squat", muscle: "Quads", group: "Legs" },
  { id: "e93", name: "Romanian Deadlift", muscle: "Hamstrings", group: "Legs" },
  { id: "e94", name: "Bulgarian Split Squat", muscle: "Quads", group: "Legs" },
  { id: "e95", name: "Hip Thrust", muscle: "Glutes", group: "Legs" },
  { id: "e96", name: "Glute Bridge", muscle: "Glutes", group: "Legs" },
  { id: "e97", name: "Seated Leg Curl", muscle: "Hamstrings", group: "Legs" },
  { id: "e98", name: "Standing Calf Raise", muscle: "Calves", group: "Legs" },
  { id: "e99", name: "Seated Calf Raise", muscle: "Calves", group: "Legs" },
  {
    id: "e100",
    name: "Leg Adductor Machine",
    muscle: "Inner Thigh",
    group: "Legs",
  },
  {
    id: "e101",
    name: "Leg Abductor Machine",
    muscle: "Outer Thigh",
    group: "Legs",
  },
  { id: "e102", name: "Sumo Squat", muscle: "Glutes", group: "Legs" },
  {
    id: "e103",
    name: "Nordic Hamstring Curl",
    muscle: "Hamstrings",
    group: "Legs",
  },
  { id: "e104", name: "Cable Pull-Through", muscle: "Glutes", group: "Legs" },
  { id: "e105", name: "Walking Lunges", muscle: "Quads", group: "Legs" },
  { id: "e106", name: "Step-Ups", muscle: "Quads", group: "Legs" },
  /* ── ADDITIONAL STRENGTH EXERCISES ── */
  // Glutes / Legs extras
  { id: "x1", name: "Cable Kickback", muscle: "Glutes", group: "Legs" },
  {
    id: "x2",
    name: "Donkey Kickback Machine",
    muscle: "Glutes",
    group: "Legs",
  },
  {
    id: "x3",
    name: "Cable Hip Abduction",
    muscle: "Outer Thigh",
    group: "Legs",
  },
  { id: "x4", name: "Banded Hip Thrust", muscle: "Glutes", group: "Legs" },
  { id: "x5", name: "Single-Leg Hip Thrust", muscle: "Glutes", group: "Legs" },
  {
    id: "x6",
    name: "Smith Machine Split Squat",
    muscle: "Quads",
    group: "Legs",
  },
  {
    id: "x7",
    name: "Leg Press (Wide Stance)",
    muscle: "Glutes",
    group: "Legs",
  },
  { id: "x8", name: "Cable Pull-Through", muscle: "Glutes", group: "Legs" },
  { id: "x9", name: "Reverse Hyperextension", muscle: "Glutes", group: "Legs" },
  { id: "x10", name: "Sissy Squat", muscle: "Quads", group: "Legs" },
  {
    id: "x11",
    name: "Calf Press on Leg Press",
    muscle: "Calves",
    group: "Legs",
  },
  { id: "x12", name: "Tibialis Raise", muscle: "Calves", group: "Legs" },
  // Chest extras
  { id: "x13", name: "Svend Press", muscle: "Chest", group: "Chest" },
  { id: "x14", name: "Landmine Press", muscle: "Upper Chest", group: "Chest" },
  { id: "x15", name: "Plate Press", muscle: "Chest", group: "Chest" },
  {
    id: "x16",
    name: "Cable Fly (High-to-Low)",
    muscle: "Lower Chest",
    group: "Chest",
  },
  {
    id: "x17",
    name: "Cable Fly (Low-to-High)",
    muscle: "Upper Chest",
    group: "Chest",
  },
  // Back extras
  { id: "x18", name: "Single-Arm Cable Row", muscle: "Lats", group: "Back" },
  {
    id: "x19",
    name: "Chest-Supported Row (Machine)",
    muscle: "Mid Back",
    group: "Back",
  },
  {
    id: "x20",
    name: "Seated Cable Row (Wide Grip)",
    muscle: "Upper Back",
    group: "Back",
  },
  {
    id: "x21",
    name: "Straight-Arm Cable Pulldown",
    muscle: "Lats",
    group: "Back",
  },
  { id: "x22", name: "Face Pull (Rope)", muscle: "Rear Delts", group: "Back" },
  { id: "x23", name: "Kroc Row", muscle: "Lats", group: "Back" },
  { id: "x24", name: "Pendlay Row", muscle: "Mid Back", group: "Back" },
  // Arms extras
  { id: "x25", name: "Bayesian Curl", muscle: "Biceps", group: "Arms" },
  { id: "x26", name: "Cable Overhead Curl", muscle: "Biceps", group: "Arms" },
  {
    id: "x27",
    name: "Incline Hammer Curl",
    muscle: "Brachialis",
    group: "Arms",
  },
  { id: "x28", name: "Drag Curl", muscle: "Biceps", group: "Arms" },
  { id: "x29", name: "JM Press", muscle: "Triceps", group: "Arms" },
  { id: "x30", name: "Tate Press", muscle: "Triceps", group: "Arms" },
  {
    id: "x31",
    name: "Cable Tricep Kickback",
    muscle: "Triceps",
    group: "Arms",
  },
  {
    id: "x32",
    name: "Overhead EZ Bar Tricep Extension",
    muscle: "Triceps",
    group: "Arms",
  },
  // Shoulders extras
  {
    id: "x33",
    name: "Seated Dumbbell Clean",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "x34",
    name: "Cable Lateral Raise (Cross-Body)",
    muscle: "Side Delts",
    group: "Shoulders",
  },
  {
    id: "x35",
    name: "Plate Front Raise",
    muscle: "Front Delts",
    group: "Shoulders",
  },
  { id: "x36", name: "Lu Raises", muscle: "Side Delts", group: "Shoulders" },
  {
    id: "x37",
    name: "Machine Shoulder Shrug",
    muscle: "Traps",
    group: "Shoulders",
  },
  {
    id: "x38",
    name: "Snatch-Grip Upright Row",
    muscle: "Traps",
    group: "Shoulders",
  },
  // Core (new group)
  { id: "x39", name: "Plank", muscle: "Core", group: "Core" },
  { id: "x40", name: "Cable Crunch", muscle: "Core", group: "Core" },
  { id: "x41", name: "Hanging Leg Raise", muscle: "Core", group: "Core" },
  { id: "x42", name: "Ab Wheel Rollout", muscle: "Core", group: "Core" },
  { id: "x43", name: "Decline Sit-Up", muscle: "Core", group: "Core" },
  { id: "x44", name: "Russian Twist", muscle: "Core", group: "Core" },
  { id: "x45", name: "Side Plank", muscle: "Core", group: "Core" },
  { id: "x46", name: "Cable Woodchop", muscle: "Core", group: "Core" },
  { id: "x47", name: "Landmine Rotation", muscle: "Core", group: "Core" },
  { id: "x48", name: "Pallof Press", muscle: "Core", group: "Core" },

  /* ── CARDIO ── type:"cardio" marks these as cardio log entries (no sets/reps/weight) */
  {
    id: "c1",
    name: "Running (Outdoor)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c2",
    name: "Running (Treadmill)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c3",
    name: "Walking (Outdoor)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c4",
    name: "Walking (Treadmill)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c5",
    name: "Cycling (Outdoor)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c6",
    name: "Cycling (Stationary)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c7",
    name: "Elliptical",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c8",
    name: "Swimming (Outdoor)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c9",
    name: "Swimming (Pool)",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c10",
    name: "Rowing Machine",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c11",
    name: "Stair Climber",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c12",
    name: "Jump Rope",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },
  {
    id: "c13",
    name: "HIIT",
    muscle: "Full Body",
    group: "Cardio",
    type: "cardio",
  },

  /* ── GLUTES (missing exercises) ── */

  { id: "g6", name: "Reverse Hyperextension", muscle: "Glutes", group: "Legs" },
  { id: "g7", name: "Kneeling Squat", muscle: "Glutes", group: "Legs" },

  /* ── CHEST (additional) ── */
  { id: "ch1", name: "Chest Dip", muscle: "Lower Chest", group: "Chest" },
  { id: "ch2", name: "Svend Press", muscle: "Chest", group: "Chest" },
  {
    id: "ch3",
    name: "Dumbbell Squeeze Press",
    muscle: "Chest",
    group: "Chest",
  },

  /* ── BACK (additional) ── */
  { id: "bk1", name: "Single-Arm Cable Row", muscle: "Lats", group: "Back" },
  { id: "bk2", name: "Seal Row", muscle: "Mid Back", group: "Back" },
  {
    id: "bk3",
    name: "Snatch-Grip Deadlift",
    muscle: "Full Back",
    group: "Back",
  },
  { id: "bk4", name: "Jefferson Curl", muscle: "Lower Back", group: "Back" },

  /* ── ARMS (additional) ── */
  { id: "ar1", name: "Cable Overhead Curl", muscle: "Biceps", group: "Arms" },
  { id: "ar2", name: "Bayesian Curl", muscle: "Biceps", group: "Arms" },
  { id: "ar3", name: "Tate Press", muscle: "Triceps", group: "Arms" },
  { id: "ar4", name: "JM Press", muscle: "Triceps", group: "Arms" },
  { id: "ar5", name: "Cable Wrist Curl", muscle: "Forearms", group: "Arms" },
  {
    id: "ar6",
    name: "Pronation / Supination",
    muscle: "Forearms",
    group: "Arms",
  },

  /* ── SHOULDERS (additional) ── */
  {
    id: "sh1",
    name: "Cable Y-Raise",
    muscle: "Rear Delts",
    group: "Shoulders",
  },
  {
    id: "sh2",
    name: "Lying Cable Lateral Raise",
    muscle: "Side Delts",
    group: "Shoulders",
  },
  {
    id: "sh3",
    name: "Plate Front Raise",
    muscle: "Front Delts",
    group: "Shoulders",
  },
  {
    id: "sh4",
    name: "Dumbbell Scarecrow",
    muscle: "Rear Delts",
    group: "Shoulders",
  },

  /* ── LEGS (additional) ── */
  { id: "lg1", name: "Barbell Front Squat", muscle: "Quads", group: "Legs" },
  { id: "lg2", name: "Hack Squat (Barbell)", muscle: "Quads", group: "Legs" },
  { id: "lg3", name: "Sissy Squat", muscle: "Quads", group: "Legs" },
  {
    id: "lg4",
    name: "Leg Press (Wide Stance)",
    muscle: "Glutes",
    group: "Legs",
  },
  {
    id: "lg5",
    name: "Leg Press (Narrow Stance)",
    muscle: "Quads",
    group: "Legs",
  },
  {
    id: "lg6",
    name: "Cable Romanian Deadlift",
    muscle: "Hamstrings",
    group: "Legs",
  },
  {
    id: "lg7",
    name: "Dumbbell Romanian Deadlift",
    muscle: "Hamstrings",
    group: "Legs",
  },
  { id: "lg8", name: "Single-Leg Leg Press", muscle: "Quads", group: "Legs" },
  {
    id: "lg9",
    name: "Standing Hip Extension",
    muscle: "Glutes",
    group: "Legs",
  },
  {
    id: "lg10",
    name: "Seated Hip Abductor",
    muscle: "Outer Thigh",
    group: "Legs",
  },
  { id: "lg11", name: "Cable Hip Flexion", muscle: "Quads", group: "Legs" },
];

/* ─── Exercise picker muscle filter chips ─────────────────────────────────────
   Each entry: label shown in UI + filter function against a DB entry
─────────────────────────────────────────────────────────────────────────────── */
const MUSCLE_FILTERS = [
  { label: "All", fn: () => true },
  { label: "Chest", fn: (e) => e.group === "Chest" },
  { label: "Lats", fn: (e) => e.muscle === "Lats" },
  {
    label: "Mid Back",
    fn: (e) =>
      e.muscle === "Mid Back" ||
      e.muscle === "Upper Back" ||
      e.muscle === "Full Back",
  },
  { label: "Lower Back", fn: (e) => e.muscle === "Lower Back" },
  { label: "Shoulders", fn: (e) => e.muscle === "Shoulders" },
  { label: "Rear Delts", fn: (e) => e.muscle === "Rear Delts" },
  { label: "Side Delts", fn: (e) => e.muscle === "Side Delts" },
  { label: "Front Delts", fn: (e) => e.muscle === "Front Delts" },
  { label: "Traps", fn: (e) => e.muscle === "Traps" },
  {
    label: "Biceps",
    fn: (e) => e.muscle === "Biceps" || e.muscle === "Brachialis",
  },
  { label: "Triceps", fn: (e) => e.muscle === "Triceps" },
  { label: "Forearms", fn: (e) => e.muscle === "Forearms" },
  { label: "Quads", fn: (e) => e.muscle === "Quads" },
  { label: "Hamstrings", fn: (e) => e.muscle === "Hamstrings" },
  { label: "Glutes", fn: (e) => e.muscle === "Glutes" },
  { label: "Calves", fn: (e) => e.muscle === "Calves" },
  {
    label: "Thighs",
    fn: (e) => e.muscle === "Inner Thigh" || e.muscle === "Outer Thigh",
  },
  { label: "Cardio", fn: (e) => e.group === "Cardio" },
  { label: "Core", fn: (e) => e.group === "Core" },
];

/* ─── All muscles for "Muscles Trained" display ───────────────────────────────── */
const ALL_MUSCLES = [
  "Chest",
  "Upper Chest",
  "Lower Chest",
  "Lats",
  "Mid Back",
  "Upper Back",
  "Lower Back",
  "Full Back",
  "Shoulders",
  "Rear Delts",
  "Side Delts",
  "Front Delts",
  "Traps",
  "Biceps",
  "Brachialis",
  "Triceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Inner Thigh",
  "Outer Thigh",
];

/* ─── Suggested program templates ──────────────────────────────────────────── */
const SUGGESTED = [
  {
    name: "Push Day",
    exs: [
      { id: "e1", s: 4, r: 10, w: 60 },
      { id: "e5", s: 4, r: 10, w: 50 },
      { id: "e7", s: 4, r: 12, w: 40 },
      { id: "e28", s: 4, r: 10, w: 40 },
      { id: "e30", s: 4, r: 12, w: 40 },
      { id: "e26", s: 4, r: 12, w: 20 },
      { id: "e23", s: 4, r: 12, w: 20 },
    ],
  },
  {
    name: "Pull Day",
    exs: [
      { id: "e15", s: 4, r: 10, w: 50 },
      { id: "e18", s: 4, r: 10, w: 60 },
      { id: "e61", s: 4, r: 10, w: 50 },
      { id: "e22", s: 4, r: 12, w: 20 },
      { id: "e9", s: 4, r: 12, w: 30 },
      { id: "e70", s: 4, r: 12, w: 30 },
    ],
  },
  {
    name: "Leg Day",
    exs: [
      { id: "e92", s: 5, r: 8, w: 80 },
      { id: "e45", s: 4, r: 10, w: 120 },
      { id: "e46", s: 4, r: 15, w: 40 },
      { id: "e93", s: 4, r: 10, w: 60 },
      { id: "e48", s: 4, r: 12, w: 40 },
      { id: "e95", s: 4, r: 12, w: 60 },
      { id: "e98", s: 4, r: 15, w: 50 },
    ],
  },
  {
    name: "Chest + Biceps",
    exs: [
      { id: "e51", s: 4, r: 10, w: 60 },
      { id: "e2", s: 4, r: 10, w: 20 },
      { id: "e3", s: 4, r: 12, w: 15 },
      { id: "e7", s: 3, r: 12, w: 40 },
      { id: "e70", s: 4, r: 12, w: 30 },
      { id: "e9", s: 4, r: 12, w: 30 },
      { id: "e11", s: 4, r: 12, w: 14 },
    ],
  },
  {
    name: "Back + Triceps",
    exs: [
      { id: "e15", s: 5, r: 10, w: 50 },
      { id: "e18", s: 5, r: 10, w: 60 },
      { id: "e22", s: 4, r: 12, w: 20 },
      { id: "e23", s: 5, r: 12, w: 20 },
      { id: "e76", s: 4, r: 12, w: 20 },
      { id: "e27", s: 3, r: 10, w: 0 },
    ],
  },
  {
    name: "Shoulders + Traps",
    exs: [
      { id: "e28", s: 4, r: 10, w: 40 },
      { id: "e30", s: 4, r: 10, w: 40 },
      { id: "e34", s: 3, r: 15, w: 8 },
      { id: "e36", s: 3, r: 15, w: 8 },
      { id: "e31", s: 4, r: 15, w: 15 },
      { id: "e87", s: 4, r: 12, w: 30 },
      { id: "e39", s: 4, r: 12, w: 20 },
    ],
  },
  {
    name: "Arms Day",
    exs: [
      { id: "e70", s: 4, r: 12, w: 30 },
      { id: "e9", s: 4, r: 12, w: 30 },
      { id: "e11", s: 4, r: 12, w: 14 },
      { id: "e23", s: 4, r: 12, w: 20 },
      { id: "e76", s: 4, r: 12, w: 20 },
      { id: "e27", s: 4, r: 10, w: 0 },
    ],
  },
  {
    name: "Glutes + Hams",
    exs: [
      { id: "e95", s: 4, r: 12, w: 60 },
      { id: "e93", s: 4, r: 10, w: 60 },
      { id: "e97", s: 4, r: 12, w: 40 },
      { id: "e48", s: 4, r: 12, w: 40 },
      { id: "e96", s: 4, r: 15, w: 0 },
      { id: "e104", s: 4, r: 15, w: 30 },
    ],
  },
  {
    name: "Full Body",
    exs: [
      { id: "e59", s: 4, r: 5, w: 80 },
      { id: "e28", s: 3, r: 10, w: 40 },
      { id: "e15", s: 3, r: 10, w: 50 },
      { id: "e92", s: 3, r: 10, w: 80 },
      { id: "e70", s: 3, r: 12, w: 30 },
      { id: "e23", s: 3, r: 12, w: 20 },
    ],
  },
  {
    name: "Upper Body",
    exs: [
      { id: "e51", s: 4, r: 10, w: 60 },
      { id: "e15", s: 4, r: 10, w: 50 },
      { id: "e28", s: 4, r: 10, w: 40 },
      { id: "e70", s: 3, r: 12, w: 30 },
      { id: "e26", s: 3, r: 12, w: 20 },
    ],
  },
];

const DEFAULT_PROGRAMS = [
  {
    id: "p1",
    name: "Chest + Biceps",
    exs: [
      { id: "e1", s: 5, r: 10, w: 60 },
      { id: "e2", s: 4, r: 10, w: 20 },
      { id: "e3", s: 4, r: 12, w: 15 },
      { id: "e4", s: 4, r: 10, w: 20 },
      { id: "e5", s: 4, r: 10, w: 50 },
      { id: "e6", s: 3, r: 12, w: 10 },
      { id: "e7", s: 4, r: 10, w: 40 },
      { id: "e8", s: 3, r: 12, w: 0 },
      { id: "e9", s: 3, r: 10, w: 30 },
      { id: "e10", s: 3, r: 12, w: 12 },
      { id: "e11", s: 4, r: 12, w: 14 },
      { id: "e12", s: 4, r: 12, w: 10 },
      { id: "e13", s: 3, r: 12, w: 10 },
      { id: "e14", s: 5, r: 10, w: 25 },
    ],
  },
  {
    id: "p2",
    name: "Back + Triceps",
    exs: [
      { id: "e15", s: 5, r: 10, w: 50 },
      { id: "e16", s: 5, r: 10, w: 50 },
      { id: "e17", s: 4, r: 10, w: 45 },
      { id: "e18", s: 5, r: 10, w: 60 },
      { id: "e19", s: 4, r: 10, w: 30 },
      { id: "e20", s: 4, r: 10, w: 40 },
      { id: "e21", s: 4, r: 12, w: 20 },
      { id: "e22", s: 3, r: 12, w: 20 },
      { id: "e23", s: 5, r: 12, w: 20 },
      { id: "e24", s: 4, r: 12, w: 15 },
      { id: "e25", s: 4, r: 12, w: 15 },
      { id: "e26", s: 4, r: 12, w: 20 },
      { id: "e27", s: 3, r: 10, w: 0 },
    ],
  },
  {
    id: "p3",
    name: "Shoulders + Delts",
    exs: [
      { id: "e28", s: 4, r: 10, w: 40 },
      { id: "e29", s: 4, r: 10, w: 16 },
      { id: "e30", s: 5, r: 10, w: 40 },
      { id: "e34", s: 3, r: 15, w: 8 },
      { id: "e35", s: 3, r: 15, w: 8 },
      { id: "e36", s: 3, r: 15, w: 8 },
      { id: "e37", s: 4, r: 12, w: 10 },
      { id: "e38", s: 3, r: 15, w: 8 },
      { id: "e31", s: 4, r: 15, w: 15 },
      { id: "e39", s: 4, r: 12, w: 20 },
      { id: "e32", s: 3, r: 12, w: 30 },
      { id: "e40", s: 3, r: 15, w: 20 },
      { id: "e41", s: 4, r: 15, w: 15 },
      { id: "e33", s: 4, r: 10, w: 20 },
    ],
  },
  {
    id: "p4",
    name: "Leg Day",
    exs: [
      { id: "e42", s: 5, r: 10, w: 80 },
      { id: "e43", s: 4, r: 10, w: 80 },
      { id: "e44", s: 4, r: 10, w: 80 },
      { id: "e45", s: 4, r: 12, w: 120 },
      { id: "e46", s: 4, r: 15, w: 40 },
      { id: "e48", s: 4, r: 12, w: 30 },
      { id: "e49", s: 4, r: 15, w: 50 },
      { id: "e50", s: 4, r: 15, w: 50 },
      { id: "e47", s: 4, r: 10, w: 20 },
    ],
  },
];

const WEIGHT_PRESETS = [
  0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5,
  40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5, 60, 62.5, 65, 67.5, 70, 72.5, 75,
  77.5, 80, 82.5, 85, 87.5, 90, 92.5, 95, 97.5, 100, 102.5, 105, 107.5, 110,
  112.5, 115, 117.5, 120, 122.5, 125, 127.5, 130, 132.5, 135, 137.5, 140, 142.5,
  145, 147.5, 150, 152.5, 155, 157.5, 160, 162.5, 165, 167.5, 170, 172.5, 175,
  177.5, 180, 182.5, 185, 187.5, 190, 192.5, 195, 197.5, 200,
];
const GC = {
  Chest: "#ff6b6b",
  Back: "#4ecdc4",
  Shoulders: "#a29bfe",
  Arms: "#fd9644",
  Legs: "#55efc4",
  Cardio: "#74b9ff",
};
const gc = (g) => GC[g] || "#888";
const GREETINGS = [
  "Iron builds character.",
  "No excuses. Just reps.",
  "Earn your rest.",
  "The bar is waiting.",
  "Strength over comfort.",
  "Every rep counts.",
  "Champions train today.",
  "Results don't lie.",
  "Pain is temporary. Pride is forever.",
  "Your only competition is yesterday's you.",
  "The weight doesn't care about your mood.",
  "Show up. Lift. Repeat.",
  "Discipline beats motivation every time.",
  "One more rep. Always.",
  "You don't find willpower — you build it.",
  "Hard work compounds.",
  "The gym is the one place excuses don't walk in.",
  "Progress, not perfection.",
  "Heavy is a matter of mind.",
  "Train like you mean it.",
  "Consistency is the real secret.",
  "Your future self is watching.",
  "The only bad workout is the one you skipped.",
  "Be stronger than your excuses.",
  "Sweat is just fat crying.",
  "You've survived 100% of your hard days.",
  "Push past the voice that says stop.",
  "Make today's workout better than yesterday's.",
  "Rest days are earned. Now earn them.",
  "The barbell doesn't negotiate.",
];
const DEFAULT_SETTINGS = { homePrograms: null };
// Measurements: array of {date, weight, muscle, fat} entries
function getMeasurements(uid) {
  return ls("ib3-" + uid + "-measurements", []);
}
function saveMeasurementsLocal(uid, data) {
  lsSet("ib3-" + uid + "-measurements", data);
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
/* simpleHash removed — Firebase handles password hashing */
function fmtTime(s) {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
function fmtDateFull(ts) {
  return new Date(ts).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function intColor(n) {
  return n >= 8 ? "#c8f030" : n >= 5 ? "#fd9644" : "#ff6b6b";
}
function sessionVol(s) {
  return s.exercises.reduce(
    (a, ex) =>
      a +
      ex.sets
        .filter((st) => st.done)
        .reduce((b, st) => b + st.weight * st.reps, 0),
    0
  );
}
function mkEx(te) {
  const db = DB.find((e) => e.id === te.id);
  if (!db) return null;
  if (db.type === "cardio") {
    return {
      uid: uid(),
      exId: db.id,
      name: db.name,
      muscle: db.muscle,
      group: db.group,
      type: "cardio",
      sets: [
        {
          i: 0,
          done: false,
          duration: te.duration || 0,
          distance: 0,
          calories: te.calories || 0,
          intensity: te.intensity || 0,
        },
      ],
    };
  }
  return {
    uid: uid(),
    exId: te.id,
    name: db.name,
    muscle: db.muscle,
    group: db.group,
    type: "strength",
    sets: Array.from({ length: te.s || 4 }, (_, i) => ({
      i,
      reps: te.r || 10,
      weight: te.w || 20,
      done: false,
    })),
  };
}
function mkCardioEx(dbId) {
  const db = DB.find((e) => e.id === dbId);
  return {
    uid: uid(),
    exId: db.id,
    name: db.name,
    muscle: db.muscle,
    group: "Cardio",
    type: "cardio",
    sets: [
      {
        i: 0,
        done: false,
        duration: 0,
        distance: 0,
        calories: 0,
        intensity: 0,
      },
    ],
  };
}
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}
function progInitials(n) {
  return n
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}
const PROG_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#a29bfe",
  "#fd9644",
  "#55efc4",
  "#74b9ff",
  "#e17055",
  "#00cec9",
  "#fdcb6e",
  "#6c5ce7",
];
function progColor(n) {
  let h = 0;
  for (let i = 0; i < n.length; i++) {
    h = (h * 31 + n.charCodeAt(i)) & 0xffff;
  }
  return PROG_COLORS[h % PROG_COLORS.length];
}
function ProgramIcon({ name, size = 38 }) {
  const c = progColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: `${c}22`,
        border: `1.5px solid ${c}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: Math.round(size * 0.42),
          color: c,
          letterSpacing: 1,
          lineHeight: 1,
        }}
      >
        {progInitials(name)}
      </span>
    </div>
  );
}

/* ─── Storage & Auth ─────────────────────────────────────────────────────────── */
function ls(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function lsDel(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
const uKey = (id, k) => `ib3-${id}-${k}`;
/* getUsers/saveUsers/getCurrentUser replaced by Firebase Auth */
function saveLocalProfile(uid, profile) {
  lsSet("ib3-profile-" + uid, profile);
}
function getLocalProfile(uid) {
  return ls("ib3-profile-" + uid, null);
}

// Resize a base64 image to max 120x120 so it fits in Firestore (<20KB)
function resizeImage(dataUrl, maxSize = 120) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ─── Firestore helpers ──────────────────────────────────────────────────────── */
// strip() removes undefined values — Firestore rejects any field that is undefined
function strip(obj) {
  return JSON.parse(
    JSON.stringify(obj, (k, v) => (v === undefined ? null : v))
  );
}

async function fsGetPrograms(uid) {
  try {
    const snap = await getDoc(doc(fbDb, "users", uid, "data", "programs"));
    if (!snap.exists()) return null;
    return snap.data().list || null;
  } catch (e) {
    console.error("fsGetPrograms:", e.code, e.message);
    return null;
  }
}
async function fsSavePrograms(uid, list) {
  try {
    await setDoc(doc(fbDb, "users", uid, "data", "programs"), {
      list: strip(list),
    });
  } catch (e) {
    console.error("fsSavePrograms:", e.code, e.message);
  }
}
async function fsGetSessions(uid) {
  try {
    const snap = await getDocs(collection(fbDb, "users", uid, "sessions"));
    const docs = snap.docs.map((d) => d.data());
    return docs.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
  } catch (e) {
    console.error("fsGetSessions:", e.code, e.message);
    return [];
  }
}
async function fsAddSession(uid, session) {
  try {
    const clean = strip(session);
    await setDoc(
      doc(fbDb, "users", uid, "sessions", String(session.id)),
      clean
    );
    console.log("fsAddSession: wrote", session.id);
    return true;
  } catch (e) {
    console.error("fsAddSession FAILED:", e.code, e.message);
    return false;
  }
}
async function fsDeleteSession(uid, sessionId) {
  try {
    await deleteDoc(doc(fbDb, "users", uid, "sessions", String(sessionId)));
    return true;
  } catch (e) {
    console.error("fsDeleteSession FAILED:", e.code, e.message);
    return false;
  }
}
async function fsGetSettings(uid) {
  try {
    const snap = await getDoc(doc(fbDb, "users", uid, "data", "settings"));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("fsGetSettings:", e.code, e.message);
    return null;
  }
}
async function fsSaveSettings(uid, settings) {
  try {
    await setDoc(doc(fbDb, "users", uid, "data", "settings"), strip(settings));
  } catch (e) {
    console.error("fsSaveSettings:", e.code, e.message);
  }
}
async function fsSendFeedback(uid, email, text, stars = 0) {
  try {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    await setDoc(doc(fbDb, "feedback", id), {
      uid,
      email,
      text,
      stars,
      date: Date.now(),
      read: false,
    });
    return true;
  } catch (e) {
    console.error("fsSendFeedback:", e.code, e.message);
    return false;
  }
}
async function fsGetAllFeedback() {
  try {
    const snap = await getDocs(collection(fbDb, "feedback"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.date - a.date);
  } catch (e) {
    console.error("fsGetAllFeedback:", e.code, e.message);
    return [];
  }
}
async function fsGetMeasurements(uid) {
  try {
    const snap = await getDoc(doc(fbDb, "users", uid, "data", "measurements"));
    return snap.exists() ? snap.data().list : null;
  } catch (e) {
    console.error("fsGetMeasurements:", e.code, e.message);
    return null;
  }
}
async function fsSaveMeasurements(uid, list) {
  try {
    await setDoc(doc(fbDb, "users", uid, "data", "measurements"), {
      list: strip(list),
    });
  } catch (e) {
    console.error("fsSaveMeasurements:", e.code, e.message);
  }
}
// Full sync: pull everything from Firestore and update local state
async function fsSyncAll(uid) {
  const [progs, sess] = await Promise.all([
    fsGetPrograms(uid),
    fsGetSessions(uid),
  ]);
  return { programs: progs, sessions: sess };
}

/* ─── Firebase error helper ─────────────────────────────────────────────────── */
function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/requires-recent-login":
      return "Please log out and log back in to make this change.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/* ─── Shared UI ─────────────────────────────────────────────────────────────── */
function Btn({ children, onClick, disabled, style = {} }) {
  const th = useTheme();
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        border: "none",
        borderRadius: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Bebas Neue',sans-serif",
        letterSpacing: 2,
        fontSize: 18,
        fontWeight: 700,
        padding: "15px 22px",
        transition: "opacity .2s",
        opacity: disabled ? 0.3 : 1,
        background: th.accentBg,
        color: th.accentT,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
function BackBtn({ onClick }) {
  const th = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: th.sub,
        fontSize: 22,
        cursor: "pointer",
        padding: "4px 8px 4px 0",
        lineHeight: 1,
      }}
    >
      ←
    </button>
  );
}
function CheckCircle({ done, onClick }) {
  const th = useTheme();
  const [pop, setPop] = useState(false);
  const h = () => {
    if (!done) {
      setPop(true);
      setTimeout(() => setPop(false), 300);
    }
    onClick();
  };
  return (
    <div
      onClick={h}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        flexShrink: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .22s",
        border: done ? `2px solid ${th.accentBg}` : `2px solid #2e2e35`,
        background: done ? th.accentBg : "transparent",
        animation: pop ? "pop .3s ease" : "none",
      }}
    >
      {done && (
        <span style={{ color: th.accentT, fontSize: 14, fontWeight: 800 }}>
          ✓
        </span>
      )}
    </div>
  );
}
function HomeIcon({ color, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      <rect x="6" y="6" width="10" height="10" fill={color} />
    </svg>
  );
}

/* ─── WeightPicker ───────────────────────────────────────────────────────────── */
function WeightPicker({ value, onChange }) {
  const th = useTheme();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  const ITEM_W = 64; // px per weight cell

  // Scroll to current value when opened
  useEffect(() => {
    if (open && scrollRef.current) {
      const idx = WEIGHT_PRESETS.indexOf(value);
      if (idx >= 0) {
        const el = scrollRef.current;
        const target = idx * ITEM_W - el.offsetWidth / 2 + ITEM_W / 2;
        el.scrollLeft = Math.max(0, target);
      }
    }
  }, [open, value]);

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          background: th.row,
          border: `1px solid ${open ? th.accentBg : th.inputB}`,
          borderRadius: 9,
          padding: "7px 11px",
          cursor: "pointer",
          minWidth: 64,
          textAlign: "center",
          color: th.text,
          fontWeight: 700,
          fontSize: 14,
          userSelect: "none",
          transition: "border-color .15s",
        }}
      >
        {value}kg
      </div>

      {/* Full-width sliding scale sheet */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 199,
              background: "rgba(0,0,0,.35)",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 480,
              zIndex: 200,
              background: th.card,
              borderRadius: "18px 18px 0 0",
              border: `1px solid ${th.border}`,
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,.4)",
            }}
          >
            {/* Handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px 0 4px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: th.inputB,
                }}
              />
            </div>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 18px 10px",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: th.muted,
                  fontWeight: 700,
                  letterSpacing: "2px",
                }}
              >
                SELECT WEIGHT
              </span>
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 22,
                  color: th.accentFg,
                  letterSpacing: 1,
                }}
              >
                {value} KG
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: th.accentBg,
                  border: "none",
                  borderRadius: 8,
                  color: th.accentT,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                DONE
              </button>
            </div>
            {/* Sliding scale */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              {/* Centre indicator line */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: th.accentBg,
                  zIndex: 1,
                  pointerEvents: "none",
                  borderRadius: 1,
                }}
              />
              <div
                ref={scrollRef}
                style={{
                  overflowX: "auto",
                  display: "flex",
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  padding: "0 calc(50% - 32px)",
                }}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const scrollCenter = el.scrollLeft + el.offsetWidth / 2;
                  const idx = Math.round((scrollCenter - ITEM_W / 2) / ITEM_W);
                  const clamped = Math.max(
                    0,
                    Math.min(WEIGHT_PRESETS.length - 1, idx)
                  );
                  if (WEIGHT_PRESETS[clamped] !== value)
                    onChange(WEIGHT_PRESETS[clamped]);
                }}
              >
                {WEIGHT_PRESETS.map((w, i) => {
                  const isSel = w === value;
                  return (
                    <div
                      key={w}
                      onClick={() => {
                        onChange(w);
                      }}
                      style={{
                        flexShrink: 0,
                        width: ITEM_W,
                        scrollSnapAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "14px 0",
                        cursor: "pointer",
                        transition: "all .1s",
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          height: isSel ? 28 : w % 10 === 0 ? 18 : 10,
                          background: isSel
                            ? th.accentBg
                            : w % 10 === 0
                            ? th.sub
                            : th.inputB,
                          borderRadius: 1,
                          marginBottom: 4,
                          transition: "height .15s",
                        }}
                      />
                      {(isSel || w % 10 === 0 || w === 0) && (
                        <div
                          style={{
                            fontSize: isSel ? 13 : 10,
                            fontWeight: isSel ? 700 : 500,
                            color: isSel ? th.accentFg : th.dim,
                            lineHeight: 1,
                          }}
                        >
                          {w}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Gradient fade edges */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 60,
                  background: `linear-gradient(to right,${th.card},transparent)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 60,
                  background: `linear-gradient(to left,${th.card},transparent)`,
                  pointerEvents: "none",
                }}
              />
            </div>
            {/* Quick-tap common weights */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "0 16px 20px",
                flexWrap: "wrap",
              }}
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 100, 120].map((w) => (
                <button
                  key={w}
                  onClick={() => onChange(w)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${
                      value === w ? th.accentBg : th.inputB
                    }`,
                    background: value === w ? th.accentBg : th.input,
                    color: value === w ? th.accentT : th.sub,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── ExercisePicker — multi-select, stays open until Done ──────────────────── */
function ExercisePicker({ onAdd, onClose, added = [] }) {
  const th = useTheme();
  const S = useS();
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState("All");
  const [pending, setPending] = useState([]); // ids selected this session
  const filterFn =
    MUSCLE_FILTERS.find((f) => f.label === flt)?.fn || (() => true);
  const filtered = DB.filter(
    (e) =>
      filterFn(e) &&
      (!q ||
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.muscle.toLowerCase().includes(q.toLowerCase()))
  );

  const toggle = (id) => {
    if (added.includes(id)) return; // already in program
    setPending((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };
  const confirmAdd = () => {
    pending.forEach((id) => onAdd(id));
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.9)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: th.card,
          borderRadius: "20px 20px 0 0",
          borderTop: `1px solid ${th.border}`,
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 18px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              className="bebas"
              style={{ fontSize: 24, letterSpacing: 2, color: th.text }}
            >
              ADD EXERCISES
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {pending.length > 0 && (
                <button
                  onClick={confirmAdd}
                  style={{
                    background: th.accentBg,
                    border: "none",
                    borderRadius: 9,
                    color: th.accentT,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "7px 16px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  ADD {pending.length} →
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: th.muted,
                  fontSize: 22,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            style={{ ...S.input, marginBottom: 10 }}
          />
          <div
            style={{
              display: "flex",
              gap: 5,
              overflowX: "auto",
              paddingBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            {MUSCLE_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFlt(f.label)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontFamily: "'Outfit',sans-serif",
                  background: flt === f.label ? th.accentBg : th.row,
                  color: flt === f.label ? th.accentT : th.muted,
                  transition: "all .15s",
                  flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "30px 0",
                color: th.dim,
                fontSize: 13,
              }}
            >
              No exercises found.
            </div>
          )}
          {filtered.map((e) => {
            const isAdded = added.includes(e.id);
            const isPending = pending.includes(e.id);
            return (
              <div
                key={e.id}
                onClick={() => toggle(e.id)}
                style={{
                  padding: "12px 0",
                  borderBottom: `1px solid ${th.border}`,
                  cursor: isAdded ? "default" : "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isPending ? `${th.accentBg}18` : "transparent",
                  borderRadius: isPending ? 8 : 0,
                  padding: isPending ? "12px 10px" : "12px 0",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      color: isAdded ? th.dim : th.text,
                    }}
                  >
                    {e.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: gc(e.group),
                      marginTop: 3,
                      fontWeight: 600,
                    }}
                  >
                    {e.muscle.toUpperCase()}
                  </div>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${
                      isPending ? th.accentBg : isAdded ? th.dim : th.inputB
                    }`,
                    background: isPending ? th.accentBg : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {(isPending || isAdded) && (
                    <span
                      style={{
                        color: isPending ? th.accentT : th.dim,
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {pending.length > 0 && (
          <div
            style={{
              padding: "12px 18px 20px",
              borderTop: `1px solid ${th.border}`,
            }}
          >
            <button
              onClick={confirmAdd}
              style={{
                width: "100%",
                background: th.accentBg,
                border: "none",
                borderRadius: 13,
                padding: "14px",
                cursor: "pointer",
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 18,
                letterSpacing: 2,
                color: th.accentT,
              }}
            >
              ADD {pending.length} EXERCISE{pending.length > 1 ? "S" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Google Setup Modal ─────────────────────────────────────────────────────── */
function GoogleSetupModal({ onClose }) {
  const th = useTheme();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.9)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: th.card,
          borderRadius: 20,
          padding: 24,
          border: `1px solid ${th.border}`,
          width: "100%",
        }}
      >
        <div
          className="bebas"
          style={{
            fontSize: 22,
            color: th.accentFg,
            marginBottom: 14,
            letterSpacing: 2,
          }}
        >
          GOOGLE SIGN-IN SETUP
        </div>
        <div
          style={{
            fontSize: 13,
            color: th.sub,
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          To enable Google Sign-In, connect Firebase to this project:
        </div>
        {[
          "Go to firebase.google.com and create a project",
          "Enable Authentication → Sign-in method → Google",
          "Project Settings → Your Apps → Add Web App",
          "Copy the firebaseConfig object",
          "In App.js replace FIREBASE_CONFIG=null with your config",
          "npm install firebase",
          "Uncomment the Google sign-in code block",
        ].map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: th.accentBg,
                color: th.accentT,
                fontWeight: 800,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontSize: 12, color: th.muted, lineHeight: 1.5 }}>
              {step}
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: th.accentBg,
            border: "none",
            borderRadius: 12,
            padding: "13px",
            cursor: "pointer",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 16,
            letterSpacing: 2,
            color: th.accentT,
            marginTop: 6,
          }}
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AUTH VIEW — with workout photo background
═══════════════════════════════════════════════════════════════════════════════ */
function AuthView() {
  const th = useTheme();
  const S = useS();
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !pw) {
      setErr("Email and password required.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await signInWithEmailAndPassword(fbAuth, email.trim(), pw);
      // onAuthStateChanged in App() will pick up the signed-in user
    } catch (e) {
      setErr(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setErr("");
    try {
      // Use anonymous Firebase auth — gives a uid for keying local data
      const cred = await signInAnonymously(fbAuth);
      const guestName = "Guest";
      saveLocalProfile(cred.user.uid, {
        name: guestName,
        email: "",
        isGuest: true,
      });
      lsSet(uKey(cred.user.uid, "programs"), DEFAULT_PROGRAMS);
      lsSet(uKey(cred.user.uid, "settings"), { homePrograms: [] });
    } catch (e) {
      setErr(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !pw) {
      setErr("All fields required.");
      return;
    }
    if (pw.length < 6) {
      setErr("Password must be 6+ characters.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const trimmedName = name.trim();
      const cred = await createUserWithEmailAndPassword(
        fbAuth,
        email.trim(),
        pw
      );
      // 1. Set displayName on Firebase user
      await fbUpdateProfile(cred.user, { displayName: trimmedName });
      // 2. Write to local cache IMMEDIATELY — guarantees onAuthStateChanged finds the name
      saveLocalProfile(cred.user.uid, {
        name: trimmedName,
        email: email.trim().toLowerCase(),
      });
      // 3. Seed default programs, but keep shortcuts empty so home tab is clean
      lsSet(uKey(cred.user.uid, "programs"), DEFAULT_PROGRAMS);
      lsSet(uKey(cred.user.uid, "settings"), { homePrograms: [] });
      // 4. Reload Firebase user so displayName is fresh on next auth state change
      await cred.user.reload();
      // 5. Belt-and-suspenders: if auth state already fired with empty name, patch it directly
      // (onAuthStateChanged will also fire again after reload, but this handles edge cases)
    } catch (e) {
      setErr(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        overflow: "hidden",
        background: "#0a0a0c",
      }}
    >
      {/* Gym photo background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.18)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(to top,rgba(200,240,48,0.06),transparent)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          position: "relative",
          zIndex: 1,
        }}
        className="slide-up"
      >
        <div
          className="bebas"
          style={{
            fontSize: 70,
            color: "#c8f030",
            lineHeight: 0.85,
            marginBottom: 8,
          }}
        >
          IRON
          <br />
          BODY
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            marginBottom: 36,
            letterSpacing: "3px",
          }}
        >
          TRACK · LIFT · PROGRESS
        </div>
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {["login", "signup"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                background:
                  tab === t ? "rgba(255,255,255,0.12)" : "transparent",
                color: tab === t ? "#f0f0f0" : "rgba(255,255,255,0.35)",
                transition: "all .2s",
              }}
            >
              {t === "login" ? "LOG IN" : "SIGN UP"}
            </button>
          ))}
        </div>
        {tab === "signup" && (
          <input
            type="text"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.09)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: "14px 16px",
              color: "#f0f0f0",
              fontSize: 16,
              fontWeight: 500,
              outline: "none",
              fontFamily: "'Outfit',sans-serif",
              marginBottom: 12,
            }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.09)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            color: "#f0f0f0",
            fontSize: 16,
            fontWeight: 500,
            outline: "none",
            fontFamily: "'Outfit',sans-serif",
            marginBottom: 12,
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.09)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            color: "#f0f0f0",
            fontSize: 16,
            fontWeight: 500,
            outline: "none",
            fontFamily: "'Outfit',sans-serif",
            marginBottom: 12,
          }}
        />
        {err && (
          <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 10 }}>
            {err}
          </div>
        )}
        <button
          onClick={tab === "login" ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "rgba(200,240,48,0.5)" : "#c8f030",
            border: "none",
            borderRadius: 13,
            padding: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 18,
            letterSpacing: 2,
            color: "#080809",
            marginTop: 4,
            transition: "background .2s",
          }}
        >
          {loading
            ? "PLEASE WAIT..."
            : tab === "login"
            ? "LOG IN →"
            : "CREATE ACCOUNT →"}
        </button>
        <button
          onClick={() => {
            setTab((t) => (t === "login" ? "signup" : "login"));
            setErr("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
            cursor: "pointer",
            marginTop: 14,
            width: "100%",
            textAlign: "center",
          }}
        >
          {tab === "login"
            ? "No account? Sign up →"
            : "Already registered? Log in →"}
        </button>
        {/* Guest sign in */}
        <button
          onClick={handleGuest}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.25)",
            fontSize: 11,
            cursor: "pointer",
            marginTop: 8,
            width: "100%",
            textAlign: "center",
            textDecoration: "underline",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Continue as guest (data saved locally)
        </button>
        <div
          style={{
            marginTop: 48,
            textAlign: "center",
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            letterSpacing: "1.5px",
          }}
        >
          DEVELOPED BY AZAD
        </div>
      </div>
    </div>
  );
}

/* ─── Minimized Workout Banner ─────────────────────────────────────────────────
   Shows on all views when a workout is active but minimized
─────────────────────────────────────────────────────────────────────────────── */
function WorkoutBanner({ active, elapsed, onResume }) {
  const th = useTheme();
  if (!active) return null;
  const doneSets = active.exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.done).length,
    0
  );
  const totalSets = active.exercises.reduce((a, ex) => a + ex.sets.length, 0);
  return (
    <div
      onClick={onResume}
      style={{
        background: th.accentBg,
        padding: "10px 16px",
        marginBottom: 12,
        borderRadius: 13,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            color: th.accentT,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "1.5px",
          }}
        >
          WORKOUT IN PROGRESS — TAP TO RETURN
        </div>
        <div
          style={{
            color: th.accentT,
            opacity: 0.7,
            fontSize: 12,
            marginTop: 1,
          }}
        >
          {active.name} · {doneSets}/{totalSets} sets
        </div>
      </div>
      <div
        className="bebas"
        style={{ color: th.accentT, fontSize: 20, letterSpacing: 1 }}
      >
        {fmtTime(elapsed)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME VIEW
═══════════════════════════════════════════════════════════════════════════════ */
function HomeView({
  sessions,
  programs,
  active,
  user,
  settings,
  elapsed,
  measurements,
  onTemplate,
  onUpdateProgram,
  onUpdateSettings,
  onGoWorkout,
  onViewSession,
}) {
  const th = useTheme();
  const S = useS();
  const [editShortcuts, setEditShortcuts] = useState(false);
  const [editingShortcutProg, setEditingShortcutProg] = useState(null);
  const [showPickerForShortcut, setShowPickerForShortcut] = useState(false);
  const [addingShortcut, setAddingShortcut] = useState(false);
  const today = new Date();
  const dow = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const ws = sessions.filter((s) => new Date(s.startTime) >= weekStart);
  const last8 = [...sessions].slice(0, 8).reverse();
  const firstName = user.name.split(" ")[0];
  const pinnedIds = settings.homePrograms;
  const shownPrograms = pinnedIds
    ? programs.filter((p) => pinnedIds.includes(p.id))
    : programs;

  // Collect all muscles trained this week (granular)
  const weekMuscleSet = new Set();
  ws.forEach((s) =>
    s.exercises.forEach((ex) => {
      if (ex.muscle) weekMuscleSet.add(ex.muscle);
    })
  );

  const removeFromHome = (pid) => {
    const c = pinnedIds || programs.map((p) => p.id);
    onUpdateSettings({
      ...settings,
      homePrograms: c.filter((id) => id !== pid),
    });
  };
  const addToHome = (pid) => {
    const c = pinnedIds || programs.map((p) => p.id);
    if (!c.includes(pid))
      onUpdateSettings({ ...settings, homePrograms: [...c, pid] });
    setAddingShortcut(false);
  };

  return (
    <div className="slide-up" style={{ paddingBottom: 90 }}>
      <div style={{ marginBottom: 22 }}>
        <div
          className="bebas"
          style={{
            fontSize: "clamp(28px,8vw,44px)",
            color: th.accentFg,
            lineHeight: 1,
          }}
        >
          {getTimeGreeting()}, {firstName}!
        </div>
        <div style={{ fontSize: 14, color: th.muted, marginTop: 4 }}>
          {
            GREETINGS[
              (new Date().getDay() * 3 + new Date().getHours()) %
                GREETINGS.length
            ]
          }
        </div>
      </div>

      {/* This Week — removed Volume, expanded muscles */}
      <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
        <div style={{ ...S.label, marginBottom: 14 }}>THIS WEEK</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          {[
            { v: ws.length, l: "SESSIONS" },
            { v: ws.reduce((a, s) => a + (s.doneSets || 0), 0), l: "SETS" },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                flex: 1,
                background: th.sect,
                borderRadius: 10,
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              <div
                className="bebas"
                style={{ fontSize: 26, color: th.accentFg, lineHeight: 1 }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: th.dim,
                  letterSpacing: "1.5px",
                  marginTop: 3,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
          {/* Daily activity bars */}
          <div
            style={{
              flex: 2,
              background: th.sect,
              borderRadius: 10,
              padding: "10px 10px 8px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: th.dim,
                letterSpacing: "1.5px",
                marginBottom: 6,
              }}
            >
              ACTIVITY
            </div>
            <div
              style={{
                display: "flex",
                gap: 3,
                alignItems: "flex-end",
                height: 32,
              }}
            >
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                const ds = ws.filter(
                  (s) =>
                    new Date(s.startTime).toDateString() === d.toDateString()
                );
                const has = ds.length > 0;
                const isToday = d.toDateString() === today.toDateString();
                const ai = has
                  ? ds.reduce((a, s) => a + (s.intensity || 0), 0) / ds.length
                  : 0;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: has ? 26 : 5,
                        background: has
                          ? intColor(ai)
                          : isToday
                          ? th.row
                          : th.input,
                        borderRadius: "2px 2px 0 0",
                        transition: "height .3s",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 8,
                        color: isToday ? th.accentFg : th.dim,
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {"SMTWTFS"[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Granular muscles trained */}
        <div>
          <div
            style={{
              fontSize: 10,
              color: th.dim,
              letterSpacing: "1.5px",
              marginBottom: 7,
            }}
          >
            MUSCLES TRAINED THIS WEEK
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {ALL_MUSCLES.map((m) => {
              const hit = weekMuscleSet.has(m);
              return (
                <div
                  key={m}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    background: hit ? "#c8f030" : "transparent",
                    color: hit ? "#080809" : th.dim,
                    border: `1px solid ${hit ? "#c8f030" : th.inputB}`,
                    transition: "all .2s",
                  }}
                >
                  {m}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance dashboards */}
      {sessions.length > 0 && (
        <>
          {/* Row 1 — all-time stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {[
              {
                v: (() => {
                  const mins = sessions.reduce(
                    (a, s) => a + (s.duration || 0),
                    0
                  );
                  return mins >= 60
                    ? `${Math.floor(mins / 60)}h ${mins % 60}m`
                    : `${mins}m`;
                })(),
                l: "TIME TRAINED",
              },
              {
                v:
                  (() => {
                    const c = sessions.reduce(
                      (a, s) => a + (s.calories || 0),
                      0
                    );
                    return c >= 1000 ? `${(c / 1000).toFixed(1)}k` : String(c);
                  })() + "kcal",
                l: "CALS BURNED",
              },
              {
                v:
                  (
                    sessions.reduce((a, s) => a + (s.intensity || 0), 0) /
                    sessions.length
                  ).toFixed(1) + "/10",
                l: "AVG INTENSITY",
              },
            ].map((s) => (
              <div
                key={s.l}
                style={{ ...S.card, padding: "12px 8px", textAlign: "center" }}
              >
                <div
                  className="bebas"
                  style={{
                    fontSize: 19,
                    color: th.accentFg,
                    lineHeight: 1,
                    letterSpacing: 0.5,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: th.dim,
                    letterSpacing: "1.2px",
                    marginTop: 3,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          {/* Row 2 — last 8 sessions intensity bar chart */}
          <div
            style={{ ...S.card, padding: "14px 14px 10px", marginBottom: 16 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ ...S.label }}>RECENT PERFORMANCE</div>
              <div style={{ fontSize: 10, color: th.dim }}>
                {last8.length} sessions
              </div>
            </div>
            {/* Dual bar: intensity (dynamic colour) + duration (lime) */}
            {(() => {
              const maxDur =
                Math.max(...last8.map((x) => x.duration || 0)) || 1;
              // Fixed bar width — each session gets equal space, labels centered above
              const BAR_W = 48; // total column width %
              return (
                <>
                  <div
                    style={{ display: "flex", gap: 3, alignItems: "flex-end" }}
                  >
                    {last8.map((s, i) => {
                      const n = s.intensity || 0;
                      const durH = Math.max(
                        6,
                        ((s.duration || 0) / maxDur) * 56
                      );
                      const intH = Math.max(6, (n / 10) * 80);
                      const intCol = intColor(n); // red ≤4 / orange 5-7 / lime ≥8
                      const durCol = "#c8f030";
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          {/* Values centred above each bar pair */}
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              gap: 1,
                              justifyContent: "center",
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                flex: 1,
                                fontSize: 8,
                                color: intCol,
                                fontWeight: 700,
                                textAlign: "center",
                                lineHeight: 1,
                              }}
                            >
                              {n || "—"}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                fontSize: 8,
                                color: durCol,
                                fontWeight: 700,
                                textAlign: "center",
                                lineHeight: 1,
                              }}
                            >
                              {s.duration || "—"}
                            </span>
                          </div>
                          {/* Bars aligned to baseline */}
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              gap: 1,
                              alignItems: "flex-end",
                              height: 80,
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: intH,
                                background: intCol,
                                borderRadius: "2px 2px 0 0",
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                height: durH,
                                background: durCol + "55",
                                borderRadius: "2px 2px 0 0",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Legend — swatch colours match bars: intColor sample + lime */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 9,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {/* Gradient swatch showing the 3 intensity colours */}
                      <div
                        style={{
                          width: 24,
                          height: 10,
                          borderRadius: 2,
                          background:
                            "linear-gradient(to right,#ff6b6b,#fd9644,#c8f030)",
                        }}
                      />
                      <span style={{ fontSize: 10, color: th.dim }}>
                        intensity
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: "#c8f03055",
                          border: "1px solid #c8f030",
                        }}
                      />
                      <span style={{ fontSize: 10, color: th.dim }}>
                        duration (min)
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Body composition dashboard */}
      {measurements && measurements.length > 0 && (
        <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
          <div style={{ ...S.label, marginBottom: 12 }}>BODY COMPOSITION</div>
          {(() => {
            const latest = measurements[0];
            const prev = measurements[1] || null;
            const delta = (f, unit) => {
              if (!prev || prev[f] == null || latest[f] == null) return null;
              const d = (latest[f] - prev[f]).toFixed(1);
              return {
                d,
                sign: d > 0 ? "+" : "",
                col:
                  f === "fat"
                    ? d < 0
                      ? "#c8f030"
                      : "#ff6b6b"
                    : d > 0
                    ? "#c8f030"
                    : "#ff6b6b",
              };
            };
            return (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {[
                    { f: "weight", l: "WEIGHT", unit: "kg" },
                    { f: "muscle", l: "MUSCLE", unit: "%" },
                    { f: "fat", l: "BODY FAT", unit: "%" },
                  ].map((m) => {
                    const val = latest[m.f];
                    const d = delta(m.f, m.unit);
                    return (
                      <div
                        key={m.f}
                        style={{
                          background: th.sect,
                          borderRadius: 10,
                          padding: "12px 8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          className="bebas"
                          style={{
                            fontSize: 22,
                            color: th.accentFg,
                            lineHeight: 1,
                          }}
                        >
                          {val != null ? val + m.unit : "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: th.dim,
                            letterSpacing: "1.5px",
                            marginTop: 2,
                          }}
                        >
                          {m.l}
                        </div>
                        {d && (
                          <div
                            style={{
                              fontSize: 10,
                              color: d.col,
                              fontWeight: 700,
                              marginTop: 3,
                            }}
                          >
                            {d.sign}
                            {d.d}
                            {m.unit}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Mini trend chart — last 6 weight entries */}
                {measurements.filter((m) => m.weight != null).length > 1 && (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: th.dim,
                        letterSpacing: "1.5px",
                        marginBottom: 6,
                      }}
                    >
                      WEIGHT TREND
                    </div>
                    {(() => {
                      const pts = measurements
                        .filter((m) => m.weight != null)
                        .slice(0, 6)
                        .reverse();
                      const mn = Math.min(...pts.map((p) => p.weight));
                      const mx = Math.max(...pts.map((p) => p.weight));
                      const range = mx - mn || 1;
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 4,
                            height: 40,
                          }}
                        >
                          {pts.map((p, i) => {
                            const h = Math.max(
                              6,
                              ((p.weight - mn) / range) * 36 + 4
                            );
                            const isLatest = i === pts.length - 1;
                            return (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <div
                                  style={{
                                    width: "100%",
                                    height: h,
                                    background: isLatest
                                      ? th.accentBg
                                      : th.accentBg + "55",
                                    borderRadius: "3px 3px 0 0",
                                    transition: "height .3s",
                                  }}
                                />
                                <div style={{ fontSize: 8, color: th.dim }}>
                                  {p.weight}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Shortcuts */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={S.label}>MY SHORTCUTS</div>
        <button
          onClick={() => {
            setEditShortcuts((e) => !e);
            setAddingShortcut(false);
            setEditingShortcutProg(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: editShortcuts ? th.accentFg : th.dim,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 700,
          }}
        >
          {editShortcuts ? "DONE ✓" : "EDIT ✎"}
        </button>
      </div>

      {/* Inline program editor sheet — appears when tapping Edit on a shortcut */}
      {editingShortcutProg && (
        <div
          style={{
            ...S.card,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${th.accentBg}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: th.text }}>
                {editingShortcutProg.name}
              </div>
              <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>
                Editing exercises
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setEditingShortcutProg(null)}
                style={{
                  background: th.row,
                  border: "none",
                  borderRadius: 8,
                  color: th.muted,
                  fontSize: 12,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateProgram(editingShortcutProg);
                  setEditingShortcutProg(null);
                  setEditShortcuts(false);
                }}
                style={{
                  background: th.accentBg,
                  border: "none",
                  borderRadius: 8,
                  color: th.accentT,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
          {/* Exercise list */}
          {editingShortcutProg.exs.map((ex, idx) => {
            const db = DB.find((d) => d.id === ex.id);
            return (
              <div
                key={ex.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 0",
                  borderBottom: `1px solid ${th.border}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: th.text }}
                  >
                    {db?.name || ex.id}
                  </div>
                  <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>
                    {ex.s} sets · {ex.r} reps · {ex.w}kg
                  </div>
                </div>
                <button
                  onClick={() =>
                    setEditingShortcutProg((p) => ({
                      ...p,
                      exs: p.exs.filter((_, i) => i !== idx),
                    }))
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: th.dim,
                    cursor: "pointer",
                    fontSize: 15,
                    padding: "2px 6px",
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <button
            onClick={() => setShowPickerForShortcut(true)}
            style={{
              width: "100%",
              background: "none",
              border: `1px dashed ${th.inputB}`,
              borderRadius: 10,
              padding: 10,
              cursor: "pointer",
              color: th.muted,
              fontSize: 13,
              fontFamily: "'Outfit',sans-serif",
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span style={{ color: th.accentFg, fontSize: 16, fontWeight: 700 }}>
              +
            </span>{" "}
            Add Exercise
          </button>
          {showPickerForShortcut && (
            <ExercisePicker
              onAdd={(dbId) => {
                const db = DB.find((e) => e.id === dbId);
                if (!db) return;
                setEditingShortcutProg((p) => ({
                  ...p,
                  exs: [...p.exs, { id: dbId, s: 4, r: 10, w: 20 }],
                }));
              }}
              onClose={() => setShowPickerForShortcut(false)}
              added={editingShortcutProg.exs.map((e) => e.id)}
            />
          )}
        </div>
      )}

      {shownPrograms.length === 0 && !editShortcuts && (
        <div
          style={{
            ...S.card,
            padding: "22px 18px",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ color: th.sub, fontSize: 14 }}>No shortcuts yet.</div>
          <div style={{ color: th.muted, fontSize: 12, marginTop: 5 }}>
            Tap EDIT to pin programs here.
          </div>
        </div>
      )}
      {(shownPrograms.length > 0 || editShortcuts) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: editShortcuts ? 8 : 16,
          }}
        >
          {shownPrograms.map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              {/* Remove-from-home ✕ */}
              {editShortcuts && (
                <button
                  onClick={() => removeFromHome(p.id)}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    zIndex: 5,
                    background: "rgba(0,0,0,.55)",
                    border: "none",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              )}
              <div
                style={{
                  width: "100%",
                  background: th.card,
                  border: `1px solid ${
                    editingShortcutProg?.id === p.id ? th.accentBg : th.border
                  }`,
                  borderRadius: 14,
                  padding: "15px 13px",
                  textAlign: "left",
                  transition: "border-color .2s",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <ProgramIcon name={p.name} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: th.text,
                    marginBottom: 3,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: th.muted,
                    marginBottom: editShortcuts ? 8 : 0,
                  }}
                >
                  {p.exs.length} exercises
                </div>
                {editShortcuts ? (
                  <button
                    onClick={() => {
                      setEditingShortcutProg(
                        editingShortcutProg?.id === p.id ? null : { ...p }
                      );
                      setShowPickerForShortcut(false);
                    }}
                    style={{
                      background: th.accentBg,
                      border: "none",
                      borderRadius: 8,
                      color: th.accentT,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 12px",
                      cursor: "pointer",
                      fontFamily: "'Outfit',sans-serif",
                      width: "100%",
                    }}
                  >
                    {editingShortcutProg?.id === p.id ? "▲ Close" : "✎ Edit"}
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => {
                        setEditShortcuts(true);
                        setEditingShortcutProg({ ...p });
                        setShowPickerForShortcut(false);
                      }}
                      style={{
                        flex: 1,
                        background: th.row,
                        border: "none",
                        borderRadius: 8,
                        color: th.muted,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "6px 0",
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                        letterSpacing: 0.5,
                      }}
                    >
                      ✎ EDIT
                    </button>
                    <button
                      onClick={() => onTemplate(p)}
                      style={{
                        flex: 2,
                        background: th.accentBg,
                        border: "none",
                        borderRadius: 8,
                        color: th.accentT,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "6px 0",
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                        letterSpacing: 0.5,
                      }}
                    >
                      ▶ START
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {editShortcuts && (
            <button
              onClick={() => setAddingShortcut((a) => !a)}
              style={{
                background: "transparent",
                border: `1px dashed ${th.inputB}`,
                borderRadius: 14,
                padding: "15px 13px",
                cursor: "pointer",
                textAlign: "center",
                fontFamily: "'Outfit',sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: 90,
              }}
            >
              <span
                style={{ fontSize: 26, color: th.accentFg, fontWeight: 700 }}
              >
                +
              </span>
              <span style={{ fontSize: 12, color: th.muted }}>
                Add shortcut
              </span>
            </button>
          )}
        </div>
      )}
      {addingShortcut && (
        <div style={{ ...S.card, padding: 14, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={S.label}>ADD TO HOME</div>
            <button
              onClick={() => setAddingShortcut(false)}
              style={{
                background: "none",
                border: "none",
                color: th.muted,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
          {programs.filter((p) => !pinnedIds || !pinnedIds.includes(p.id))
            .length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: th.muted,
                textAlign: "center",
                padding: "12px 0",
              }}
            >
              All programs are already pinned.
            </div>
          ) : (
            programs
              .filter((p) => !pinnedIds || !pinnedIds.includes(p.id))
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToHome(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: `1px solid ${th.border}`,
                    cursor: "pointer",
                  }}
                >
                  <ProgramIcon name={p.name} size={32} />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: th.text,
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      color: th.accentFg,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                </div>
              ))
          )}
        </div>
      )}

      {sessions.length > 0 && (
        <>
          <div style={{ ...S.label, marginBottom: 12 }}>RECENT SESSIONS</div>
          {sessions.slice(0, 3).map((s) => (
            <div
              key={s.id}
              onClick={() => onViewSession(s)}
              style={{
                ...S.card,
                padding: "14px 16px",
                marginBottom: 8,
                cursor: "pointer",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = th.accentBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = th.border)
              }
            >
              {/* Top row: name + intensity */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: th.text,
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: th.muted }}>
                    {fmtDate(s.startTime)}
                  </div>
                </div>
                {s.intensity != null && (
                  <div
                    className="bebas"
                    style={{
                      fontSize: 28,
                      color: intColor(s.intensity),
                      lineHeight: 1,
                      flexShrink: 0,
                      marginLeft: 12,
                      textAlign: "center",
                    }}
                  >
                    {s.intensity}
                    <span
                      style={{
                        fontSize: 8,
                        color: th.dim,
                        display: "block",
                        letterSpacing: "1px",
                      }}
                    >
                      INT
                    </span>
                  </div>
                )}
              </div>
              {/* Bottom row: stat chips */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                {s.duration != null && (
                  <span
                    style={{
                      background: th.input,
                      borderRadius: 7,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: th.muted,
                      fontWeight: 600,
                    }}
                  >
                    {s.duration}min
                  </span>
                )}
                {s.calories != null && s.calories > 0 && (
                  <span
                    style={{
                      background: th.accentBg + "22",
                      border: `1px solid ${th.accentBg}44`,
                      borderRadius: 7,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: th.accentFg,
                      fontWeight: 700,
                    }}
                  >
                    {s.calories} kcal
                  </span>
                )}
                <span
                  style={{
                    background: th.input,
                    borderRadius: 7,
                    padding: "4px 10px",
                    fontSize: 11,
                    color: th.muted,
                    fontWeight: 600,
                  }}
                >
                  {s.doneSets || 0} sets
                </span>
              </div>
              <div
                style={{ fontSize: 11, color: th.accentFg, fontWeight: 600 }}
              >
                tap for details →
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROGRAMS VIEW
═══════════════════════════════════════════════════════════════════════════════ */
function ProgramsView({
  programs,
  active,
  elapsed,
  onEdit,
  onNew,
  onDelete,
  onGoWorkout,
  onStart,
}) {
  const th = useTheme();
  const S = useS();
  return (
    <div className="slide-up" style={{ paddingBottom: 90 }}>
      {active && (
        <div
          onClick={onGoWorkout}
          style={{
            background: th.accentBg,
            borderRadius: 13,
            padding: "10px 16px",
            marginBottom: 14,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: th.accentT,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "1.5px",
              }}
            >
              WORKOUT IN PROGRESS — TAP TO RETURN
            </div>
            <div
              style={{
                color: th.accentT,
                opacity: 0.7,
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {active.name}
            </div>
          </div>
          <span style={{ color: th.accentT, fontSize: 18, fontWeight: 800 }}>
            →
          </span>
        </div>
      )}
      <div style={{ marginBottom: 12, marginTop: 4 }} />
      {programs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 18px" }}>
          <div className="bebas" style={{ fontSize: 44, color: th.border }}>
            NO PROGRAMS
          </div>
          <div style={{ fontSize: 13, color: th.muted, marginTop: 10 }}>
            Create your first workout program
          </div>
        </div>
      ) : (
        programs.map((p) => (
          <div key={p.id} style={{ ...S.card, marginBottom: 9 }}>
            <div
              style={{
                padding: "15px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  flex: 1,
                  cursor: "pointer",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
                onClick={() => onEdit(p)}
              >
                <ProgramIcon name={p.name} size={44} />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: th.text,
                      marginBottom: 5,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: th.muted, marginBottom: 8 }}
                  >
                    {p.exs.length} exercises
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {[
                      ...new Set(
                        p.exs
                          .map((e) => DB.find((d) => d.id === e.id)?.group)
                          .filter(Boolean)
                      ),
                    ].map((g) => (
                      <span key={g} style={S.tag(g)}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flexShrink: 0,
                  marginLeft: 10,
                }}
              >
                <button
                  onClick={() => onStart(p)}
                  style={{
                    background: th.accentBg,
                    border: "none",
                    borderRadius: 8,
                    color: th.accentT,
                    padding: "7px 14px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  START
                </button>
                <button
                  onClick={() => onEdit(p)}
                  style={{
                    background: th.row,
                    border: "none",
                    borderRadius: 8,
                    color: th.sub,
                    padding: "7px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this program?")) onDelete(p.id);
                  }}
                  style={{
                    background: th.del,
                    border: `1px solid ${th.delB}`,
                    borderRadius: 8,
                    color: th.delText,
                    padding: "7px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Create / Edit Program — with suggestions ───────────────────────────────── */
function CreateProgramView({ program, onSave, onBack }) {
  const th = useTheme();
  const S = useS();
  const editing = !!program?.id;
  const [name, setName] = useState(program?.name || "");
  const [exs, setExs] = useState(program?.exs || []);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedEx, setExpandedEx] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(!editing);

  const loadSuggestion = (s) => {
    setName(s.name);
    setExs(s.exs);
    setShowSuggestions(false);
  };
  const addEx = (dbId) => {
    const db = DB.find((e) => e.id === dbId);
    const isCardio = db?.type === "cardio";
    setExs((prev) => [
      ...prev,
      isCardio
        ? { id: dbId, type: "cardio", duration: 0, calories: 0, intensity: 0 }
        : { id: dbId, s: 4, r: 10, w: 20 },
    ]);
    // No setShowPicker(false) here — ExercisePicker handles multi-select and closes via onClose
  };
  const removeEx = (id) => setExs((prev) => prev.filter((e) => e.id !== id));
  const updateEx = (id, f, val) =>
    setExs((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, [f]: Math.max(0, parseFloat(val) || 0) } : e
      )
    );

  return (
    <>
      {showPicker && (
        <ExercisePicker
          onAdd={addEx}
          onClose={() => setShowPicker(false)}
          added={exs.map((e) => e.id)}
        />
      )}
      <div className="slide-up" style={{ paddingBottom: 100, paddingTop: 4 }}>
        {/* Suggestions section */}
        {showSuggestions && !editing && (
          <div style={{ ...S.card, padding: 14, marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ ...S.label }}>SUGGESTED PROGRAMS</div>
              <button
                onClick={() => setShowSuggestions(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: th.dim,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Start blank
              </button>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: 4,
              }}
            >
              {SUGGESTED.map((s) => (
                <button
                  key={s.name}
                  onClick={() => loadSuggestion(s)}
                  style={{
                    flexShrink: 0,
                    background: th.sect,
                    border: `1px solid ${th.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Outfit',sans-serif",
                    minWidth: 130,
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = th.accentBg)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = th.border)
                  }
                >
                  <ProgramIcon name={s.name} size={32} />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: th.text,
                      marginTop: 8,
                      marginBottom: 2,
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: th.muted }}>
                    {s.exs.length} exercises
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {name && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <ProgramIcon name={name} size={60} />
          </div>
        )}
        <div style={{ ...S.label, marginBottom: 7 }}>PROGRAM NAME</div>
        <input
          type="text"
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...S.input, marginBottom: 18 }}
        />
        <div style={{ ...S.label, marginBottom: 12 }}>
          EXERCISES ({exs.length})
        </div>
        {exs.map((ex) => {
          const db = DB.find((d) => d.id === ex.id);
          const isOpen = expandedEx === ex.id;
          const isCardio = db?.type === "cardio";
          return (
            <div key={ex.id} style={{ ...S.card, marginBottom: 7 }}>
              <div
                style={{
                  padding: "13px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedEx(isOpen ? null : ex.id)}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontWeight: 600, fontSize: 14, color: th.text }}
                  >
                    {db?.name}
                  </div>
                  <div style={{ fontSize: 12, color: th.muted, marginTop: 3 }}>
                    {isCardio
                      ? `${ex.duration || 0}min · ${
                          ex.calories || 0
                        }kcal · intensity ${ex.intensity || 0}/10`
                      : `${ex.s} sets · ${ex.r} reps · ${ex.w}kg`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    style={{
                      color: th.accentFg,
                      fontSize: 12,
                      display: "inline-block",
                      transition: "transform .2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEx(ex.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: th.dim,
                      cursor: "pointer",
                      fontSize: 15,
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {isOpen && (
                <div
                  style={{
                    borderTop: `1px solid ${th.border}`,
                    padding: "13px 14px",
                  }}
                >
                  {isCardio ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {[
                        { l: "DURATION", f: "duration", unit: "min" },
                        { l: "CALORIES", f: "calories", unit: "kcal" },
                        { l: "INTENSITY", f: "intensity", unit: "/10" },
                      ].map((c) => (
                        <div key={c.f}>
                          <div
                            style={{
                              ...S.label,
                              fontSize: 10,
                              marginBottom: 6,
                            }}
                          >
                            {c.l}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: th.row,
                              borderRadius: 9,
                              overflow: "hidden",
                            }}
                          >
                            <input
                              type="number"
                              value={ex[c.f] || ""}
                              placeholder="0"
                              onChange={(e) =>
                                updateEx(ex.id, c.f, e.target.value)
                              }
                              style={{
                                flex: 1,
                                background: "none",
                                border: "none",
                                color: th.text,
                                textAlign: "center",
                                fontSize: 16,
                                fontWeight: 700,
                                outline: "none",
                                fontFamily: "'Outfit',sans-serif",
                                padding: "10px 6px",
                                width: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                color: th.dim,
                                padding: "0 8px",
                                flexShrink: 0,
                              }}
                            >
                              {c.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {[
                          { l: "SETS", f: "s", mn: 1, mx: 10 },
                          { l: "REPS", f: "r", mn: 1, mx: 50 },
                        ].map((c) => (
                          <div key={c.f}>
                            <div
                              style={{
                                ...S.label,
                                fontSize: 10,
                                marginBottom: 6,
                              }}
                            >
                              {c.l}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                background: th.row,
                                borderRadius: 9,
                                overflow: "hidden",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateEx(
                                    ex.id,
                                    c.f,
                                    Math.max(c.mn, ex[c.f] - 1)
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: th.muted,
                                  padding: "7px 11px",
                                  cursor: "pointer",
                                  fontSize: 17,
                                  lineHeight: 1,
                                }}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={ex[c.f]}
                                onChange={(e) =>
                                  updateEx(ex.id, c.f, e.target.value)
                                }
                                style={{
                                  flex: 1,
                                  background: "none",
                                  border: "none",
                                  color: th.text,
                                  textAlign: "center",
                                  fontSize: 16,
                                  fontWeight: 700,
                                  outline: "none",
                                  fontFamily: "'Outfit',sans-serif",
                                  width: 0,
                                }}
                              />
                              <button
                                onClick={() =>
                                  updateEx(
                                    ex.id,
                                    c.f,
                                    Math.min(c.mx, ex[c.f] + 1)
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: th.muted,
                                  padding: "7px 11px",
                                  cursor: "pointer",
                                  fontSize: 17,
                                  lineHeight: 1,
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{ ...S.label, fontSize: 10, marginBottom: 8 }}
                      >
                        WEIGHT
                      </div>
                      <WeightPicker
                        value={ex.w || 0}
                        onChange={(v) => updateEx(ex.id, "w", v)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button
          onClick={() => setShowPicker(true)}
          style={{
            width: "100%",
            background: "none",
            border: `1px dashed ${th.inputB}`,
            borderRadius: 13,
            padding: 13,
            cursor: "pointer",
            color: th.muted,
            fontSize: 14,
            fontFamily: "'Outfit',sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <span style={{ color: th.accentFg, fontSize: 18, fontWeight: 700 }}>
            +
          </span>{" "}
          Add Exercise
        </button>
      </div>
      <div style={{ position: "sticky", bottom: 0, padding: "12px 0 20px" }}>
        <Btn
          onClick={() => {
            if (!name.trim() || exs.length === 0) return;
            onSave({ id: program?.id || uid(), name: name.trim(), exs });
          }}
          disabled={!name.trim() || exs.length === 0}
          style={{ width: "100%" }}
        >
          SAVE PROGRAM
        </Btn>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CREATE VIEW (pre-workout config)
═══════════════════════════════════════════════════════════════════════════════ */
function CreateView({ draft, onStart, onBack }) {
  const th = useTheme();
  const S = useS();
  const [name, setName] = useState(draft.name);
  const [exercises, setExercises] = useState(draft.exercises);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedEx, setExpandedEx] = useState(null);
  const addEx = (dbId) => {
    const db = DB.find((e) => e.id === dbId);
    if (!db) return;
    const isCardio = db.type === "cardio";
    const newEx = isCardio
      ? {
          uid: uid(),
          exId: db.id,
          name: db.name,
          muscle: db.muscle,
          group: db.group,
          type: "cardio",
          sets: [
            {
              i: 0,
              done: false,
              duration: 0,
              distance: 0,
              calories: 0,
              intensity: 0,
            },
          ],
        }
      : {
          uid: uid(),
          exId: db.id,
          name: db.name,
          muscle: db.muscle,
          group: db.group,
          type: "strength",
          sets: Array.from({ length: 4 }, (_, i) => ({
            i,
            reps: 10,
            weight: 20,
            done: false,
          })),
        };
    setExercises((prev) => [...prev, newEx]);
    // No setShowPicker(false) — ExercisePicker handles multi-select and closes via onClose
  };
  const removeEx = (exUid) =>
    setExercises((prev) => prev.filter((e) => e.uid !== exUid));
  const updateNumSets = (exUid, delta) =>
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.uid !== exUid) return ex;
        const n = Math.max(1, Math.min(10, ex.sets.length + delta));
        const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 20 };
        return {
          ...ex,
          sets:
            n > ex.sets.length
              ? [
                  ...ex.sets,
                  ...Array.from({ length: n - ex.sets.length }, (_, i) => ({
                    i: ex.sets.length + i,
                    reps: last.reps,
                    weight: last.weight,
                    done: false,
                  })),
                ]
              : ex.sets.slice(0, n),
        };
      })
    );
  const updateIndivSet = (exUid, sIdx, f, val) =>
    setExercises((prev) =>
      prev.map((ex) =>
        ex.uid !== exUid
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i !== sIdx ? s : { ...s, [f]: parseFloat(val) || 0 }
              ),
            }
      )
    );
  return (
    <>
      {showPicker && (
        <ExercisePicker
          onAdd={addEx}
          onClose={() => setShowPicker(false)}
          added={exercises.map((e) => e.exId)}
        />
      )}
      <div className="slide-up" style={{ paddingBottom: 100, paddingTop: 4 }}>
        <input
          type="text"
          placeholder="Session name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...S.input, marginBottom: 16 }}
        />
        {exercises.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div className="bebas" style={{ fontSize: 36, color: th.dim }}>
              ADD EXERCISES
            </div>
            <div style={{ fontSize: 13, marginTop: 5, color: th.muted }}>
              Tap below to build your session
            </div>
          </div>
        ) : (
          exercises.map((ex) => {
            const isOpen = expandedEx === ex.uid;
            const isCardio = ex.type === "cardio";
            return (
              <div key={ex.uid} style={{ ...S.card, marginBottom: 8 }}>
                <div
                  style={{
                    padding: "13px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedEx(isOpen ? null : ex.uid)}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, color: th.text }}
                    >
                      {ex.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginTop: 4,
                      }}
                    >
                      <span style={S.tag(ex.group)}>
                        {ex.muscle.toUpperCase()}
                      </span>
                      {isCardio ? (
                        <span style={{ fontSize: 11, color: th.muted }}>
                          Cardio — log from wearable
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: th.muted }}>
                          {ex.sets.length} sets · {ex.sets[0]?.reps} reps ·{" "}
                          {ex.sets[0]?.weight}kg
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        color: th.accentFg,
                        fontSize: 12,
                        transition: "transform .2s",
                        display: "inline-block",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEx(ex.uid);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: th.dim,
                        cursor: "pointer",
                        fontSize: 15,
                        padding: "2px 6px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div
                    style={{
                      borderTop: `1px solid ${th.border}`,
                      padding: "13px 15px",
                    }}
                  >
                    {isCardio ? (
                      <div
                        style={{
                          background: th.sect,
                          borderRadius: 10,
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: th.muted,
                            lineHeight: 1.6,
                          }}
                        >
                          During the workout you'll log{" "}
                          <span style={{ color: th.accentFg, fontWeight: 700 }}>
                            duration, active calories
                          </span>{" "}
                          and{" "}
                          <span style={{ color: th.accentFg, fontWeight: 700 }}>
                            intensity
                          </span>{" "}
                          from your fitness band or Apple Watch.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 14,
                          }}
                        >
                          <div style={{ ...S.label, fontSize: 10 }}>SETS</div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: th.row,
                              borderRadius: 9,
                              overflow: "hidden",
                            }}
                          >
                            <button
                              onClick={() => updateNumSets(ex.uid, -1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: th.muted,
                                padding: "7px 13px",
                                cursor: "pointer",
                                fontSize: 17,
                                lineHeight: 1,
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                color: th.text,
                                fontWeight: 700,
                                fontSize: 15,
                                minWidth: 22,
                                textAlign: "center",
                              }}
                            >
                              {ex.sets.length}
                            </span>
                            <button
                              onClick={() => updateNumSets(ex.uid, 1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: th.muted,
                                padding: "7px 13px",
                                cursor: "pointer",
                                fontSize: 17,
                                lineHeight: 1,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {ex.sets.map((set, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: th.muted,
                                width: 36,
                                flexShrink: 0,
                              }}
                            >
                              S{sIdx + 1}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                background: th.row,
                                borderRadius: 8,
                                overflow: "hidden",
                                flex: 1,
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateIndivSet(
                                    ex.uid,
                                    sIdx,
                                    "reps",
                                    Math.max(1, set.reps - 1)
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: th.muted,
                                  padding: "7px 10px",
                                  cursor: "pointer",
                                  fontSize: 15,
                                  lineHeight: 1,
                                }}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) =>
                                  updateIndivSet(
                                    ex.uid,
                                    sIdx,
                                    "reps",
                                    e.target.value
                                  )
                                }
                                style={{
                                  flex: 1,
                                  background: "none",
                                  border: "none",
                                  color: th.text,
                                  textAlign: "center",
                                  fontSize: 16,
                                  fontWeight: 700,
                                  outline: "none",
                                  fontFamily: "'Outfit',sans-serif",
                                  width: 0,
                                }}
                              />
                              <button
                                onClick={() =>
                                  updateIndivSet(
                                    ex.uid,
                                    sIdx,
                                    "reps",
                                    set.reps + 1
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: th.muted,
                                  padding: "7px 10px",
                                  cursor: "pointer",
                                  fontSize: 15,
                                  lineHeight: 1,
                                }}
                              >
                                +
                              </button>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                color: th.muted,
                                flexShrink: 0,
                              }}
                            >
                              rep
                            </span>
                            <WeightPicker
                              value={set.weight}
                              onChange={(v) =>
                                updateIndivSet(ex.uid, sIdx, "weight", v)
                              }
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <button
          onClick={() => setShowPicker(true)}
          style={{
            width: "100%",
            background: "none",
            border: `1px dashed ${th.inputB}`,
            borderRadius: 13,
            padding: 13,
            cursor: "pointer",
            color: th.muted,
            fontSize: 14,
            fontFamily: "'Outfit',sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <span style={{ color: th.accentFg, fontSize: 18, fontWeight: 700 }}>
            +
          </span>{" "}
          Add Exercise
        </button>
      </div>
      <div style={{ position: "sticky", bottom: 0, padding: "12px 0 20px" }}>
        <Btn
          onClick={() => onStart({ name: name || "Workout", exercises })}
          disabled={exercises.length === 0}
          style={{ width: "100%" }}
        >
          START WORKOUT →
        </Btn>
      </div>
    </>
  );
}

/* ─── Cardio Log Row — used inside WorkoutView for cardio exercises ──────────── */
function CardioLogRow({ set, onChange, onRemove, setIdx }) {
  const th = useTheme();
  const S = useS();
  const upd = (f, v) => onChange({ ...set, [f]: parseFloat(v) || 0 });
  const fields = [
    { l: "Duration", k: "duration", unit: "min", step: 1, placeholder: "0" },
    { l: "Distance", k: "distance", unit: "km", step: 0.1, placeholder: "0.0" },
    { l: "Calories", k: "calories", unit: "kcal", step: 1, placeholder: "0" },
    {
      l: "Intensity",
      k: "intensity",
      unit: "/10",
      step: 1,
      min: 0,
      max: 10,
      placeholder: "0",
    },
  ];
  return (
    <div
      style={{
        borderBottom: `1px solid ${th.input}`,
        padding: "10px 14px",
        opacity: set.done ? 0.4 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <CheckCircle
          done={set.done}
          onClick={() => onChange({ ...set, done: !set.done })}
        />
        <span
          style={{
            fontSize: 11,
            color: th.dim,
            width: 28,
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          #{setIdx + 1}
        </span>
        <span style={{ fontSize: 10, color: th.muted, flex: 1 }}>
          FROM WEARABLE / APPLE WATCH
        </span>
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: th.dim,
            cursor: "pointer",
            fontSize: 15,
            padding: "2px 6px",
            opacity: 0.6,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {fields.map((f) => (
          <div key={f.k}>
            <div
              style={{
                fontSize: 10,
                color: th.muted,
                marginBottom: 4,
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {f.l.toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: th.row,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <input
                type="number"
                value={set[f.k] || ""}
                placeholder={f.placeholder}
                step={f.step}
                onChange={(e) => upd(f.k, e.target.value)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: th.text,
                  padding: "8px 10px",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  fontFamily: "'Outfit',sans-serif",
                  width: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: th.dim,
                  padding: "0 10px",
                  flexShrink: 0,
                }}
              >
                {f.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   WORKOUT VIEW — drag-to-sort, remove set, add exercise
═══════════════════════════════════════════════════════════════════════════════ */
function WorkoutView({
  session,
  elapsed,
  paused,
  pct,
  doneSets,
  totalSets,
  onTogglePause,
  onFinish,
  onAbandon,
  onSaveActive,
  onMinimize,
}) {
  const th = useTheme();
  const S = useS();
  const [exercises, setExercises] = useState(session.exercises);
  const [showExPicker, setShowExPicker] = useState(false);

  const upd = (newExs) => {
    setExercises(newExs);
    onSaveActive({ ...session, exercises: newExs });
  };
  const toggleSet = (eIdx, sIdx) =>
    upd(
      exercises.map((ex, i) =>
        i !== eIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== sIdx ? s : { ...s, done: !s.done }
              ),
            }
      )
    );
  const updSetVal = (eIdx, sIdx, f, val) =>
    upd(
      exercises.map((ex, i) =>
        i !== eIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== sIdx
                  ? s
                  : f === "_cardio"
                  ? { ...val }
                  : { ...s, [f]: parseFloat(val) || 0 }
              ),
            }
      )
    );
  const addSet = (eIdx) => {
    const ex = exercises[eIdx];
    const newSet =
      ex.type === "cardio"
        ? {
            i: ex.sets.length,
            done: false,
            duration: 0,
            distance: 0,
            calories: 0,
            intensity: 0,
          }
        : (() => {
            const last = ex.sets[ex.sets.length - 1] || {
              reps: 10,
              weight: 20,
            };
            return {
              i: ex.sets.length,
              reps: last.reps,
              weight: last.weight,
              done: false,
            };
          })();
    upd(
      exercises.map((e, i) =>
        i !== eIdx ? e : { ...e, sets: [...e.sets, newSet] }
      )
    );
  };
  const removeSet = (eIdx, sIdx) =>
    upd(
      exercises.map((ex, i) =>
        i !== eIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== sIdx) }
      )
    );
  const removeEx = (eIdx) => {
    if (window.confirm("Remove this exercise?"))
      upd(exercises.filter((_, i) => i !== eIdx));
  };

  const addExFromPicker = (dbId) => {
    const db = DB.find((e) => e.id === dbId);
    if (!db) return;
    const newEx =
      db.type === "cardio"
        ? mkCardioEx(dbId)
        : {
            uid: uid(),
            exId: db.id,
            name: db.name,
            muscle: db.muscle,
            group: db.group,
            type: "strength",
            sets: [{ i: 0, reps: 10, weight: 20, done: false }],
          };
    upd([...exercises, newEx]);
    setShowExPicker(false);
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      {showExPicker && (
        <ExercisePicker
          onAdd={addExFromPicker}
          onClose={() => setShowExPicker(false)}
          added={exercises.map((e) => e.exId)}
        />
      )}

      {/* Exercise cards */}
      {exercises.map((ex, eIdx) => {
        const allDone = ex.sets.every((s) => s.done);
        const someDone = ex.sets.some((s) => s.done);
        return (
          <div
            key={ex.uid}
            style={{
              ...S.card,
              marginBottom: 9,
              borderColor: allDone ? th.doneB : th.border,
              transition: "border-color .15s",
            }}
          >
            {/* Exercise header */}
            <div
              style={{
                padding: "12px 14px 9px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: allDone
                        ? th.accentBg
                        : someDone
                        ? "#fd9644"
                        : th.row,
                      transition: "background .3s",
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: allDone ? th.doneText : th.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ex.name}
                    {allDone && (
                      <span
                        style={{
                          color: th.accentFg,
                          marginLeft: 6,
                          fontSize: 12,
                        }}
                      >
                        {" "}
                        ✓
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ paddingLeft: 14 }}>
                  <span style={S.tag(ex.group)}>{ex.muscle.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={() => removeEx(eIdx)}
                style={{
                  background: "none",
                  border: `1px solid ${th.inputB}`,
                  borderRadius: 7,
                  color: th.dim,
                  cursor: "pointer",
                  fontSize: 10,
                  padding: "4px 9px",
                  flexShrink: 0,
                  marginLeft: 8,
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                }}
              >
                REMOVE
              </button>
            </div>

            {/* Set rows — cardio gets log fields, strength gets reps/weight */}
            <div style={{ borderTop: `1px solid ${th.border}` }}>
              {ex.type === "cardio"
                ? ex.sets.map((set, sIdx) => (
                    <CardioLogRow
                      key={sIdx}
                      set={set}
                      setIdx={sIdx}
                      onChange={(v) => updSetVal(eIdx, sIdx, "_cardio", v)}
                      onRemove={() => removeSet(eIdx, sIdx)}
                    />
                  ))
                : ex.sets.map((set, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 14px",
                        borderBottom: `1px solid ${th.input}`,
                        opacity: set.done ? 0.32 : 1,
                        transition: "opacity .3s",
                        background: set.done ? th.done : "transparent",
                      }}
                    >
                      <CheckCircle
                        done={set.done}
                        onClick={() => toggleSet(eIdx, sIdx)}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: th.dim,
                          width: 28,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        S{sIdx + 1}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: th.row,
                          borderRadius: 8,
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        <button
                          onClick={() =>
                            updSetVal(
                              eIdx,
                              sIdx,
                              "reps",
                              Math.max(1, set.reps - 1)
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: th.muted,
                            padding: "6px 9px",
                            cursor: "pointer",
                            fontSize: 15,
                            lineHeight: 1,
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            updSetVal(eIdx, sIdx, "reps", e.target.value)
                          }
                          style={{
                            flex: 1,
                            background: "none",
                            border: "none",
                            color: th.text,
                            textAlign: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            outline: "none",
                            fontFamily: "'Outfit',sans-serif",
                            width: 0,
                          }}
                        />
                        <button
                          onClick={() =>
                            updSetVal(eIdx, sIdx, "reps", set.reps + 1)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: th.muted,
                            padding: "6px 9px",
                            cursor: "pointer",
                            fontSize: 15,
                            lineHeight: 1,
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span
                        style={{ fontSize: 11, color: th.muted, flexShrink: 0 }}
                      >
                        rep
                      </span>
                      <WeightPicker
                        value={set.weight}
                        onChange={(v) => updSetVal(eIdx, sIdx, "weight", v)}
                      />
                      <button
                        onClick={() => removeSet(eIdx, sIdx)}
                        title="Remove set"
                        style={{
                          background: "none",
                          border: "none",
                          color: th.dim,
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                          padding: "4px",
                          flexShrink: 0,
                          opacity: 0.6,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              {/* Add set / Add lap */}
              <div
                onClick={() => addSet(eIdx)}
                style={{
                  padding: "9px 14px",
                  color: th.dim,
                  fontSize: 12,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{ color: th.accentFg, fontSize: 14, fontWeight: 700 }}
                >
                  +
                </span>
                {ex.type === "cardio" ? "Add lap / segment" : "Add set"}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add exercise + Finish */}
      <button
        onClick={() => setShowExPicker(true)}
        style={{
          width: "100%",
          background: "none",
          border: `1px dashed ${th.inputB}`,
          borderRadius: 13,
          padding: 13,
          cursor: "pointer",
          color: th.muted,
          fontSize: 14,
          fontFamily: "'Outfit',sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 10,
          marginTop: 4,
        }}
      >
        <span style={{ color: th.accentFg, fontSize: 18, fontWeight: 700 }}>
          +
        </span>{" "}
        Add Exercise
      </button>
      <Btn onClick={() => onFinish(exercises)} style={{ width: "100%" }}>
        FINISH WORKOUT
      </Btn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPLETE VIEW
═══════════════════════════════════════════════════════════════════════════════ */
function CompleteView({ finished, elapsed, onSave }) {
  const th = useTheme();
  const S = useS();
  const [intensity, setIntensity] = useState(7);
  const [calories, setCalories] = useState("");
  const [duration, setDuration] = useState(String(Math.round(elapsed / 60)));
  const vol = sessionVol(finished);
  return (
    <div className="slide-up" style={{ paddingBottom: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 8 }}>
        <div
          className="bebas"
          style={{
            fontSize: 56,
            color: th.accentFg,
            lineHeight: 1,
            letterSpacing: 3,
          }}
        >
          SESSION
          <br />
          COMPLETE
        </div>
        <div style={{ fontSize: 13, color: th.muted, marginTop: 6 }}>
          {finished.name}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          {
            v: finished.doneSets,
            l: "SETS DONE",
            u: `of ${finished.totalSets}`,
          },
          { v: finished.exercises.length, l: "EXERCISES", u: "completed" },
          { v: fmtTime(elapsed), l: "DURATION", u: "recorded" },
          { v: `${vol}kg`, l: "VOLUME", u: "lifted" },
        ].map((s) => (
          <div
            key={s.l}
            style={{ ...S.card, padding: 15, textAlign: "center" }}
          >
            <div className="bebas" style={{ fontSize: 26, color: th.accentFg }}>
              {s.v}
            </div>
            <div
              style={{
                fontSize: 9,
                color: th.dim,
                letterSpacing: "2px",
                marginTop: 3,
              }}
            >
              {s.l}
            </div>
            <div style={{ fontSize: 11, color: th.muted }}>{s.u}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...S.label, marginBottom: 10 }}>RATE INTENSITY</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
            const col = n <= 3 ? "#ff6b6b" : n <= 6 ? "#fd9644" : "#c8f030";
            return (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 7,
                  padding: "12px 0",
                  cursor: "pointer",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 15,
                  background: intensity >= n ? col : th.row,
                  color: intensity >= n ? "#080809" : th.dim,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: th.dim }}>Easy</span>
          <span style={{ fontSize: 10, color: th.dim }}>Max</span>
        </div>
      </div>
      <div style={{ ...S.card, padding: 15, marginBottom: 20 }}>
        <div style={{ ...S.label, marginBottom: 12 }}>
          APPLE WATCH DATA (optional)
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div>
            <div style={{ ...S.label, fontSize: 10, marginBottom: 6 }}>
              DURATION (min)
            </div>
            <input
              type="number"
              value={duration}
              placeholder={String(Math.round(elapsed / 60))}
              onChange={(e) => setDuration(e.target.value)}
              style={S.input}
            />
          </div>
          <div>
            <div style={{ ...S.label, fontSize: 10, marginBottom: 6 }}>
              CALORIES (kcal)
            </div>
            <input
              type="number"
              value={calories}
              placeholder="e.g. 450"
              onChange={(e) => setCalories(e.target.value)}
              style={S.input}
            />
          </div>
        </div>
      </div>
      <Btn
        onClick={() =>
          onSave({
            intensity,
            calories: calories ? parseInt(calories) : null,
            duration: duration ? parseInt(duration) : Math.round(elapsed / 60),
          })
        }
        style={{ width: "100%" }}
      >
        SAVE SESSION →
      </Btn>
    </div>
  );
}

/* ─── History & Session Detail ───────────────────────────────────────────────── */
function HistoryView({
  sessions,
  active,
  elapsed,
  onViewDetail,
  onGoWorkout,
  onSync,
  onDelete,
}) {
  const th = useTheme();
  const S = useS();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // session id pending delete
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      await onSync();
    } catch (e) {
      setSyncMsg("Sync failed — check connection");
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div style={{ paddingBottom: 90 }} className="slide-up">
      {syncMsg && (
        <div
          style={{
            fontSize: 12,
            color: "#ff6b6b",
            marginBottom: 12,
            marginTop: 4,
          }}
        >
          {syncMsg}
        </div>
      )}
      {sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 16px" }}>
          <div className="bebas" style={{ fontSize: 42, color: th.border }}>
            NO SESSIONS
          </div>
          <div style={{ fontSize: 13, color: th.muted, marginTop: 10 }}>
            Complete a workout to see history
          </div>
        </div>
      ) : (
        sessions.map((s) => {
          const vol = sessionVol(s);
          const ic = intColor(s.intensity || 0);
          const isPendingDelete = confirmDelete === s.id;
          return (
            <div
              key={s.id}
              style={{
                ...S.card,
                marginBottom: 8,
                overflow: "hidden",
                borderColor: isPendingDelete ? th.delB : th.border,
              }}
            >
              {/* Delete confirm overlay */}
              {isPendingDelete && (
                <div
                  style={{
                    background: th.del,
                    padding: "12px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: `1px solid ${th.delB}`,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: th.delText, fontWeight: 600 }}
                  >
                    Delete this session?
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        background: "none",
                        border: `1px solid ${th.inputB}`,
                        borderRadius: 7,
                        color: th.muted,
                        fontSize: 12,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(s.id);
                        setConfirmDelete(null);
                      }}
                      style={{
                        background: th.delText,
                        border: "none",
                        borderRadius: 7,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <div
                style={{
                  padding: "14px 15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => onViewDetail(s)}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: th.text,
                      marginBottom: 4,
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: th.muted }}>
                    {fmtDate(s.startTime)} · {s.doneSets}/{s.totalSets} sets ·{" "}
                    {s.duration || "?"}min
                    {s.calories ? ` · ${s.calories}kcal` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: th.dim, marginTop: 2 }}>
                    <span style={{ color: th.accentFg, fontWeight: 700 }}>
                      tap for details →
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    alignItems: "center",
                    marginLeft: 10,
                    flexShrink: 0,
                  }}
                >
                  {s.intensity != null && (
                    <div
                      style={{
                        background: th.sect,
                        borderRadius: 9,
                        padding: "7px 11px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="bebas"
                        style={{ fontSize: 26, color: ic, lineHeight: 1 }}
                      >
                        {s.intensity}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: th.dim,
                          letterSpacing: "1px",
                        }}
                      >
                        INT
                      </div>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(isPendingDelete ? null : s.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: th.dim,
                      cursor: "pointer",
                      padding: "5px 8px",
                      fontSize: 15,
                      lineHeight: 1,
                      fontWeight: 700,
                      opacity: 0.7,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${th.border}`,
                  padding: "8px 15px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                }}
              >
                {s.exercises.map((ex, i) => {
                  const d = ex.sets.filter((st) => st.done).length;
                  return (
                    <span
                      key={i}
                      style={{
                        background: th.input,
                        borderRadius: 6,
                        padding: "3px 8px",
                        fontSize: 11,
                        color: th.muted,
                      }}
                    >
                      {ex.name.split(" ").slice(-2).join(" ")}{" "}
                      <span
                        style={{
                          color: d === ex.sets.length ? th.accentFg : th.dim,
                          fontWeight: d === ex.sets.length ? 700 : 400,
                        }}
                      >
                        {d}/{ex.sets.length}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
function SessionDetailView({ session, onBack }) {
  const th = useTheme();
  const S = useS();
  const vol = sessionVol(session);
  const ic = intColor(session.intensity || 0);
  return (
    <div className="slide-up" style={{ paddingBottom: 60, paddingTop: 4 }}>
      <div style={{ ...S.card, padding: 16, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: th.text,
                marginBottom: 4,
              }}
            >
              {session.name}
            </div>
            <div style={{ fontSize: 13, color: th.sub }}>
              {fmtDateFull(session.startTime)}
            </div>
          </div>
          {session.intensity != null && (
            <div
              style={{
                background: th.sect,
                borderRadius: 10,
                padding: "8px 12px",
                textAlign: "center",
              }}
            >
              <div
                className="bebas"
                style={{ fontSize: 34, color: ic, lineHeight: 1 }}
              >
                {session.intensity}
              </div>
              <div
                style={{ fontSize: 9, color: th.dim, letterSpacing: "1.5px" }}
              >
                INTENSITY
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { v: `${session.duration || "?"}min`, l: "DURATION" },
            { v: `${vol}kg`, l: "VOLUME" },
            {
              v: session.calories ? `${session.calories}kcal` : "—",
              l: "CALORIES",
            },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: th.input,
                borderRadius: 9,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <div
                className="bebas"
                style={{ fontSize: 18, color: th.accentFg, lineHeight: 1 }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: th.dim,
                  letterSpacing: "1.5px",
                  marginTop: 3,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...S.label, marginBottom: 12 }}>
        EXERCISES ({session.exercises.length})
      </div>
      {session.exercises.map((ex, i) => {
        const doneS = ex.sets.filter((s) => s.done).length;
        const exVol = ex.sets
          .filter((s) => s.done)
          .reduce((a, s) => a + s.weight * s.reps, 0);
        return (
          <div key={i} style={{ ...S.card, marginBottom: 8 }}>
            <div style={{ padding: "13px 15px 10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 9,
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: th.text }}
                  >
                    {ex.name}
                  </div>
                  <div style={{ fontSize: 11, color: th.muted, marginTop: 3 }}>
                    {doneS}/{ex.sets.length} sets · {exVol}kg volume
                  </div>
                </div>
                <span style={S.tag(ex.group)}>{ex.muscle.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ex.sets.map((s, si) => (
                  <div
                    key={si}
                    style={{
                      background: s.done ? th.done : th.input,
                      borderRadius: 8,
                      padding: "7px 11px",
                      textAlign: "center",
                      border: `1px solid ${s.done ? th.doneB : th.inputB}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: s.done ? th.accentFg : th.dim,
                      }}
                    >
                      {s.reps}×{s.weight}kg
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: s.done ? th.doneText : th.dim,
                      }}
                    >
                      SET {si + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Profile View ───────────────────────────────────────────────────────────── */
function ProfileView({
  user,
  sessions,
  measurements,
  onSaveMeasurement,
  theme,
  themeAuto,
  active,
  elapsed,
  onLogout,
  onUpdateUser,
  onThemeChange,
  onThemeAutoToggle,
  onGoWorkout,
  onClearUnread,
}) {
  const th = useTheme();
  const S = useS();
  const [editMode, setEditMode] = useState(false);
  const [eName, setEName] = useState(user.name);
  const [eEmail, setEEmail] = useState(user.email);
  const [ePhoto, setEPhoto] = useState(user.photoURL || "");
  const [ePw, setEPw] = useState("");
  const [eConfirm, setEConfirm] = useState("");
  const [eCurrent, setECurrent] = useState("");
  const [editErr, setEditErr] = useState("");
  const [editOk, setEditOk] = useState("");
  // Feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStars, setFeedbackStars] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [adminFeedbacks, setAdminFeedbacks] = useState([]);
  const isAdmin = user.email === "freeazadbhos@gmail.com";
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    const ok = await fsSendFeedback(
      user.id,
      user.email,
      feedbackText.trim(),
      feedbackStars
    );
    setFeedbackSending(false);
    if (ok) {
      setFeedbackSent(true);
      setFeedbackText("");
      setFeedbackStars(0);
    }
  };
  const handleLoadFeedbacks = async () => {
    const data = await fsGetAllFeedback();
    setAdminFeedbacks(data);
    // Mark all as read when admin views them (we just clear local count)
    if (onClearUnread) onClearUnread();
  };
  // Body measurements
  const [showMeasure, setShowMeasure] = useState(false);
  const [editingMeasureIdx, setEditingMeasureIdx] = useState(null); // null=new, n=editing index
  const [mWeight, setMWeight] = useState("");
  const [mMuscle, setMuscle] = useState("");
  const [mFat, setFat] = useState("");
  const openMeasureForm = (idx) => {
    if (idx === null) {
      setMWeight("");
      setMuscle("");
      setFat("");
    } else {
      const m = measurements[idx];
      setMWeight(m.weight != null ? String(m.weight) : "");
      setMuscle(m.muscle != null ? String(m.muscle) : "");
      setFat(m.fat != null ? String(m.fat) : "");
    }
    setEditingMeasureIdx(idx);
    setShowMeasure(true);
  };
  const handleSaveMeasurement = () => {
    if (!mWeight && !mMuscle && !mFat) {
      return;
    }
    const entry = {
      date:
        editingMeasureIdx === null
          ? Date.now()
          : measurements[editingMeasureIdx].date,
      weight: parseFloat(mWeight) || null,
      muscle: parseFloat(mMuscle) || null,
      fat: parseFloat(mFat) || null,
    };
    let next;
    if (editingMeasureIdx === null) {
      next = [entry, ...measurements];
    } else {
      next = measurements.map((m, i) => (i === editingMeasureIdx ? entry : m));
    }
    onSaveMeasurement(next);
    setMWeight("");
    setMuscle("");
    setFat("");
    setShowMeasure(false);
    setEditingMeasureIdx(null);
  };
  const handleDeleteMeasurement = (idx) => {
    onSaveMeasurement(measurements.filter((_, i) => i !== idx));
  };
  const latest = measurements[0] || null;
  const totalVol = sessions.reduce((a, s) => a + sessionVol(s), 0);
  const avgInt = sessions.length
    ? Math.round(
        sessions.reduce((a, s) => a + (s.intensity || 0), 0) / sessions.length
      )
    : 0;
  const handleSaveProfile = async () => {
    setEditErr("");
    setEditOk("");
    if (!eName.trim()) {
      setEditErr("Name cannot be empty.");
      return;
    }
    if (ePw && ePw !== eConfirm) {
      setEditErr("New passwords do not match.");
      return;
    }
    if (ePw && ePw.length < 6) {
      setEditErr("New password must be 6+ characters.");
      return;
    }
    const fbUser = fbAuth.currentUser;
    if (!fbUser) {
      setEditErr("Not authenticated.");
      return;
    }
    try {
      // Re-auth required for email/password changes
      if ((eEmail !== user.email || ePw) && eCurrent) {
        const cred = EmailAuthProvider.credential(fbUser.email, eCurrent);
        await reauthenticateWithCredential(fbUser, cred);
      }
      // Update display name only on Firebase (base64 photos stored locally, not in Firebase)
      const nameChanged = eName.trim() !== user.name;
      if (nameChanged) {
        await fbUpdateProfile(fbUser, { displayName: eName.trim() });
      }
      // Photo is stored in local cache only (base64 can't go to Firebase Auth)
      // Update email
      if (eEmail.trim().toLowerCase() !== user.email) {
        await updateEmail(fbUser, eEmail.trim().toLowerCase());
      }
      // Update password
      if (ePw) {
        await updatePassword(fbUser, ePw);
      }
      // Resize photo to ~120px so it fits in Firestore, then sync
      let photoData = ePhoto.trim() || null;
      if (photoData && photoData.startsWith("data:")) {
        photoData = await resizeImage(photoData, 120);
      }
      saveLocalProfile(fbUser.uid, {
        name: eName.trim(),
        email: eEmail.trim().toLowerCase(),
        photoURL: photoData,
      });
      // Push photo to Firestore so other devices can fetch it
      fsSaveSettings(fbUser.uid, { photoURL: photoData || null });
      onUpdateUser({
        ...user,
        name: eName.trim(),
        email: eEmail.trim().toLowerCase(),
        photoURL: photoData,
      });
      setEPw("");
      setEConfirm("");
      setECurrent("");
      setEditOk("Profile updated!");
      setEditMode(false);
    } catch (e) {
      setEditErr(friendlyError(e.code));
    }
  };
  // Guest upgrade state
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgEmail, setUpgEmail] = useState("");
  const [upgPw, setUpgPw] = useState("");
  const [upgName, setUpgName] = useState("");
  const [upgErr, setUpgErr] = useState("");
  const handleUpgrade = async () => {
    if (!upgName.trim() || !upgEmail.trim() || !upgPw) {
      setUpgErr("All fields required.");
      return;
    }
    if (upgPw.length < 6) {
      setUpgErr("Password must be 6+ chars.");
      return;
    }
    try {
      const fbUser = fbAuth.currentUser;
      const cred = EmailAuthProvider.credential(upgEmail.trim(), upgPw);
      await linkWithCredential(fbUser, cred);
      await fbUpdateProfile(fbUser, { displayName: upgName.trim() });
      saveLocalProfile(fbUser.uid, {
        name: upgName.trim(),
        email: upgEmail.trim().toLowerCase(),
        isGuest: false,
      });
      // Push local data to Firestore
      const localProgs = ls(uKey(fbUser.uid, "programs"), []);
      if (localProgs.length > 0) await fsSavePrograms(fbUser.uid, localProgs);
      const localSess = ls(uKey(fbUser.uid, "sessions"), []);
      for (const s of localSess) await fsAddSession(fbUser.uid, s);
      onUpdateUser({
        ...user,
        name: upgName.trim(),
        email: upgEmail.trim().toLowerCase(),
        isGuest: false,
      });
      setShowUpgrade(false);
    } catch (e) {
      setUpgErr(friendlyError(e.code));
    }
  };

  return (
    <div className="slide-up" style={{ paddingBottom: 90 }}>
      <div style={{ marginBottom: 16, marginTop: 4 }} />
      {/* Guest upgrade banner */}
      {user.isGuest && (
        <div
          style={{
            ...S.card,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${th.accentBg}33`,
          }}
        >
          <div style={{ fontWeight: 700, color: th.text, marginBottom: 4 }}>
            You're signed in as a guest
          </div>
          <div style={{ fontSize: 12, color: th.muted, marginBottom: 12 }}>
            Create an account to sync your data across devices.
          </div>
          {!showUpgrade ? (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                background: th.accentBg,
                border: "none",
                borderRadius: 10,
                color: th.accentT,
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Outfit',sans-serif",
                width: "100%",
              }}
            >
              CREATE ACCOUNT & SAVE DATA
            </button>
          ) : (
            <div>
              <input
                type="text"
                placeholder="First name"
                value={upgName}
                onChange={(e) => setUpgName(e.target.value)}
                style={{ ...S.input, marginBottom: 8 }}
              />
              <input
                type="email"
                placeholder="Email"
                value={upgEmail}
                onChange={(e) => setUpgEmail(e.target.value)}
                style={{ ...S.input, marginBottom: 8 }}
              />
              <input
                type="password"
                placeholder="Password (6+ chars)"
                value={upgPw}
                onChange={(e) => setUpgPw(e.target.value)}
                style={{ ...S.input, marginBottom: 8 }}
              />
              {upgErr && (
                <div
                  style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 8 }}
                >
                  {upgErr}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setShowUpgrade(false);
                    setUpgErr("");
                  }}
                  style={{
                    flex: 1,
                    background: th.row,
                    border: "none",
                    borderRadius: 10,
                    color: th.muted,
                    padding: "11px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Cancel
                </button>
                <Btn
                  onClick={handleUpgrade}
                  style={{ flex: 2, fontSize: 14, padding: "11px" }}
                >
                  SAVE & CREATE
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ ...S.card, padding: 18, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: th.accentBg,
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span
                className="bebas"
                style={{ fontSize: 24, color: th.accentT }}
              >
                {user.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: th.text }}>
              {user.name}
            </div>
            <div style={{ fontSize: 12, color: th.muted }}>{user.email}</div>
          </div>
          <button
            onClick={() => {
              setEditMode((e) => !e);
              setEditErr("");
              setEditOk("");
              setEName(user.name);
              setEEmail(user.email);
              setEPhoto(user.photoURL || "");
            }}
            style={{
              background: editMode ? th.accentBg : "transparent",
              border: `1px solid ${editMode ? th.accentBg : th.inputB}`,
              borderRadius: 9,
              color: editMode ? th.accentT : th.muted,
              padding: "7px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 700,
            }}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>
        {editMode && (
          <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 14 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>DISPLAY NAME</div>
            <input
              type="text"
              value={eName}
              onChange={(e) => setEName(e.target.value)}
              style={{ ...S.input, marginBottom: 12 }}
            />
            <div style={{ ...S.label, marginBottom: 6 }}>EMAIL</div>
            <input
              type="email"
              value={eEmail}
              onChange={(e) => setEEmail(e.target.value)}
              style={{ ...S.input, marginBottom: 12 }}
            />
            <div style={{ ...S.label, marginBottom: 8 }}>
              PROFILE PHOTO{" "}
              <span
                style={{
                  color: th.dim,
                  fontSize: 9,
                  fontWeight: 400,
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: th.row,
                border: `1px dashed ${th.inputB}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: th.accentBg,
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ePhoto ? (
                  <img
                    src={ePhoto}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 22 }}>📷</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.text }}>
                  {ePhoto ? "Change photo" : "Upload from camera roll"}
                </div>
                <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>
                  Tap to choose an image
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    alert("Please choose a photo under 3MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => setEPhoto(ev.target.result);
                  reader.onerror = () =>
                    alert("Could not read the file. Please try another image.");
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {ePhoto && (
              <button
                onClick={() => setEPhoto("")}
                style={{
                  background: "none",
                  border: "none",
                  color: th.dim,
                  cursor: "pointer",
                  fontSize: 12,
                  marginBottom: 12,
                  padding: 0,
                }}
              >
                ✕ Remove photo
              </button>
            )}
            <div style={{ ...S.label, marginBottom: 6 }}>
              NEW PASSWORD{" "}
              <span style={{ color: th.dim, fontSize: 9, letterSpacing: 0 }}>
                (leave blank to keep)
              </span>
            </div>
            <input
              type="password"
              placeholder="New password (6+ chars)"
              value={ePw}
              onChange={(e) => setEPw(e.target.value)}
              style={{ ...S.input, marginBottom: 12 }}
            />
            {ePw && (
              <>
                <div style={{ ...S.label, marginBottom: 6 }}>
                  CONFIRM NEW PASSWORD
                </div>
                <input
                  type="password"
                  placeholder="Confirm"
                  value={eConfirm}
                  onChange={(e) => setEConfirm(e.target.value)}
                  style={{ ...S.input, marginBottom: 12 }}
                />
              </>
            )}
            {(eEmail !== user.email || ePw) && (
              <>
                <div style={{ ...S.label, marginBottom: 6 }}>
                  CURRENT PASSWORD{" "}
                  <span
                    style={{ color: "#ff6b6b", fontSize: 9, letterSpacing: 0 }}
                  >
                    *required
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Verify current password"
                  value={eCurrent}
                  onChange={(e) => setECurrent(e.target.value)}
                  style={{ ...S.input, marginBottom: 12 }}
                />
              </>
            )}
            {editErr && (
              <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 10 }}>
                {editErr}
              </div>
            )}
            {editOk && (
              <div
                style={{
                  color: th.accentFg,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                {editOk}
              </div>
            )}
            <Btn
              onClick={handleSaveProfile}
              style={{ width: "100%", fontSize: 15, padding: "13px" }}
            >
              SAVE CHANGES
            </Btn>
          </div>
        )}
        {!editMode && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { v: sessions.length, l: "SESSIONS" },
              {
                v: sessions.reduce((a, s) => a + (s.doneSets || 0), 0),
                l: "TOTAL SETS",
              },
              { v: avgInt + "/10", l: "AVG INT." },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: th.sect,
                  borderRadius: 10,
                  padding: "11px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  className="bebas"
                  style={{ fontSize: 24, color: th.accentFg, lineHeight: 1 }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: th.dim,
                    letterSpacing: "1.5px",
                    marginTop: 3,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!editMode && (
        <>
          <div style={{ ...S.card, padding: 16, marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 12 }}>LIFETIME STATS</div>
            {[
              {
                l: "Total volume lifted",
                v:
                  totalVol >= 1000
                    ? `${(totalVol / 1000).toFixed(1)}t`
                    : `${totalVol}kg`,
              },
              { l: "Sessions completed", v: sessions.length },
              {
                l: "Avg session duration",
                v: sessions.length
                  ? Math.round(
                      sessions.reduce((a, s) => a + (s.duration || 0), 0) /
                        sessions.length
                    ) + "min"
                  : "—",
              },
              {
                l: "Avg sets per session",
                v: sessions.length
                  ? Math.round(
                      sessions.reduce((a, s) => a + (s.doneSets || 0), 0) /
                        sessions.length
                    )
                  : "—",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < 3 ? `1px solid ${th.border}` : "none",
                }}
              >
                <span style={{ color: th.sub, fontSize: 14 }}>{s.l}</span>
                <span style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>
                  {s.v}
                </span>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, padding: 16, marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 14 }}>APPEARANCE</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>
                  Dark mode
                </div>
                <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>
                  Auto: dark 20:00–06:00
                </div>
              </div>
              {/* Toggle pill */}
              <button
                onClick={() => {
                  onThemeAutoToggle(false);
                  onThemeChange(theme === "dark" ? "light" : "dark");
                }}
                style={{
                  background: theme === "dark" ? th.accentBg : th.row,
                  border: `1px solid ${th.inputB}`,
                  borderRadius: 24,
                  padding: "6px 6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  width: 52,
                  justifyContent: theme === "dark" ? "flex-end" : "flex-start",
                  transition: "all .3s",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: theme === "dark" ? "#080809" : "#aaa",
                    transition: "all .3s",
                  }}
                />
              </button>
            </div>
            {!themeAuto && (
              <button
                onClick={() => onThemeAutoToggle(true)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: `1px dashed ${th.inputB}`,
                  borderRadius: 9,
                  padding: "8px",
                  cursor: "pointer",
                  color: th.dim,
                  fontSize: 11,
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                RESET TO AUTO (TIME-BASED)
              </button>
            )}
            {themeAuto && (
              <div
                style={{
                  fontSize: 11,
                  color: th.dim,
                  textAlign: "center",
                  letterSpacing: "1px",
                }}
              >
                Currently auto —{" "}
                {theme === "dark" ? "dark until 06:00" : "light until 20:00"}
              </div>
            )}
          </div>
        </>
      )}
      {/* Body measurements card */}
      <div
        style={{ ...S.card, padding: 0, marginBottom: 12, overflow: "hidden" }}
      >
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: th.text }}>
              Body Measurements
            </div>
            {latest && (
              <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>
                Last: {fmtDate(latest.date)}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (showMeasure) {
                setShowMeasure(false);
                setEditingMeasureIdx(null);
              } else openMeasureForm(null);
            }}
            style={{
              background: showMeasure ? th.accentBg : "transparent",
              border: `1px solid ${showMeasure ? th.accentBg : th.inputB}`,
              borderRadius: 9,
              color: showMeasure ? th.accentT : th.muted,
              padding: "7px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 700,
            }}
          >
            {showMeasure ? "Cancel" : "+ Log"}
          </button>
        </div>
        {/* Latest snapshot */}
        {latest && !showMeasure && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 0,
              borderTop: `1px solid ${th.border}`,
            }}
          >
            {[
              { v: latest.weight ? latest.weight + "kg" : "—", l: "WEIGHT" },
              { v: latest.muscle ? latest.muscle + "%" : "—", l: "MUSCLE" },
              { v: latest.fat ? latest.fat + "%" : "—", l: "BODY FAT" },
            ].map((s, i) => (
              <div
                key={s.l}
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  borderRight: i < 2 ? `1px solid ${th.border}` : "none",
                }}
              >
                <div
                  className="bebas"
                  style={{ fontSize: 20, color: th.accentFg, lineHeight: 1 }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: th.dim,
                    letterSpacing: "1.5px",
                    marginTop: 3,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Log form */}
        {showMeasure && (
          <div
            style={{
              borderTop: `1px solid ${th.border}`,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[
                {
                  l: "WEIGHT (kg)",
                  v: mWeight,
                  set: setMWeight,
                  ph: "e.g. 82",
                },
                { l: "MUSCLE (%)", v: mMuscle, set: setMuscle, ph: "e.g. 42" },
                { l: "BODY FAT (%)", v: mFat, set: setFat, ph: "e.g. 18" },
              ].map((f) => (
                <div key={f.l}>
                  <div
                    style={{
                      fontSize: 10,
                      color: th.muted,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      marginBottom: 5,
                    }}
                  >
                    {f.l}
                  </div>
                  <input
                    type="number"
                    placeholder={f.ph}
                    value={f.v}
                    onChange={(e) => f.set(e.target.value)}
                    style={{
                      ...S.input,
                      padding: "10px 10px",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 10,
                color: th.muted,
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              {editingMeasureIdx === null
                ? "NEW ENTRY"
                : "EDITING " + fmtDate(measurements[editingMeasureIdx]?.date)}
            </div>
            <Btn
              onClick={handleSaveMeasurement}
              style={{ width: "100%", fontSize: 15, padding: "13px" }}
            >
              SAVE MEASUREMENT
            </Btn>
          </div>
        )}
        {/* History — last 5 entries */}
        {measurements.length > 0 && !showMeasure && (
          <div
            style={{ borderTop: `1px solid ${th.border}`, padding: "4px 0" }}
          >
            {measurements.slice(0, 6).map((m, i) => (
              <div
                key={m.date}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderBottom:
                    i < Math.min(5, measurements.length - 1)
                      ? `1px solid ${th.input}`
                      : "none",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: th.muted,
                    flexShrink: 0,
                    width: 52,
                  }}
                >
                  {fmtDate(m.date)}
                </span>
                <span style={{ fontSize: 12, color: th.sub, flex: 1 }}>
                  {m.weight ? m.weight + "kg" : ""}
                  {m.muscle ? ` · ${m.muscle}%m` : ""}
                  {m.fat ? ` · ${m.fat}%f` : ""}
                </span>
                <button
                  onClick={() => openMeasureForm(i)}
                  style={{
                    background: "none",
                    border: `1px solid ${th.inputB}`,
                    borderRadius: 6,
                    color: th.muted,
                    cursor: "pointer",
                    fontSize: 10,
                    padding: "3px 8px",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMeasurement(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: th.dim,
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "2px 4px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        style={{
          width: "100%",
          background: th.del,
          border: `1px solid ${th.delB}`,
          borderRadius: 13,
          padding: 15,
          cursor: "pointer",
          color: th.delText,
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "'Outfit',sans-serif",
          marginBottom: 10,
        }}
      >
        LOG OUT
      </button>
      <button
        onClick={async () => {
          if (
            !window.confirm(
              "Permanently delete your account and all data? This cannot be undone."
            )
          )
            return;
          try {
            const fbUser = fbAuth.currentUser;
            if (!fbUser) {
              return;
            }
            // Delete Firestore data
            try {
              await fsSavePrograms(fbUser.uid, []);
            } catch {}
            try {
              await fsSaveMeasurements(fbUser.uid, []);
            } catch {}
            // Delete Firebase Auth account
            await deleteUser(fbUser);
            onLogout();
          } catch (e) {
            if (e.code === "auth/requires-recent-login") {
              alert("Please log out and log back in, then try again.");
            } else {
              alert("Could not delete account: " + e.message);
            }
          }
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: `1px solid ${th.delText}`,
          borderRadius: 13,
          padding: 12,
          cursor: "pointer",
          color: th.delText,
          fontWeight: 600,
          fontSize: 13,
          fontFamily: "'Outfit',sans-serif",
          marginBottom: 24,
        }}
      >
        DELETE ACCOUNT
      </button>
      {/* Feedback card */}
      <div style={{ ...S.card, marginBottom: 12, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: th.text }}>
              {isAdmin ? "User Feedback" : "Send Feedback"}
            </div>
            <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>
              {isAdmin
                ? "All submitted reports"
                : "Report bugs or suggest features"}
            </div>
          </div>
          <button
            onClick={() => {
              setShowFeedback((f) => !f);
              setFeedbackSent(false);
              if (isAdmin && !showFeedback) handleLoadFeedbacks();
            }}
            style={{
              background: showFeedback ? th.accentBg : "transparent",
              border: `1px solid ${showFeedback ? th.accentBg : th.inputB}`,
              borderRadius: 9,
              color: showFeedback ? th.accentT : th.muted,
              padding: "7px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 700,
            }}
          >
            {showFeedback ? "Close" : isAdmin ? "View All" : "+ Send"}
          </button>
        </div>

        {showFeedback && !isAdmin && (
          <div
            style={{
              borderTop: `1px solid ${th.border}`,
              padding: "14px 18px",
            }}
          >
            {feedbackSent ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                <div
                  style={{ fontWeight: 700, color: th.accentFg, fontSize: 14 }}
                >
                  Feedback sent!
                </div>
                <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>
                  Thank you for helping improve Iron Body.
                </div>
                <button
                  onClick={() => setFeedbackSent(false)}
                  style={{
                    marginTop: 12,
                    background: "none",
                    border: "none",
                    color: th.accentFg,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Send another →
                </button>
              </div>
            ) : (
              <>
                {/* Star rating */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: th.muted,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      marginBottom: 8,
                    }}
                  >
                    RATE YOUR EXPERIENCE
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFeedbackStars(n)}
                        style={{
                          fontSize: 24,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          lineHeight: 1,
                          filter:
                            n <= feedbackStars
                              ? "none"
                              : "grayscale(1) opacity(0.3)",
                          transition: "filter .15s",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe a bug, or suggest a new feature..."
                  rows={4}
                  style={{
                    width: "100%",
                    background: th.input,
                    border: `1px solid ${th.inputB}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    color: th.text,
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "'Outfit',sans-serif",
                    resize: "none",
                    marginBottom: 12,
                    boxSizing: "border-box",
                  }}
                />
                <Btn
                  onClick={handleSendFeedback}
                  disabled={feedbackSending || !feedbackText.trim()}
                  style={{ width: "100%", fontSize: 15, padding: "13px" }}
                >
                  {feedbackSending ? "SENDING..." : "SEND FEEDBACK"}
                </Btn>
              </>
            )}
          </div>
        )}

        {showFeedback && isAdmin && (
          <div style={{ borderTop: `1px solid ${th.border}` }}>
            {adminFeedbacks.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: th.muted,
                  fontSize: 13,
                }}
              >
                No feedback yet.
              </div>
            ) : (
              adminFeedbacks.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    padding: "12px 18px",
                    borderBottom:
                      i < adminFeedbacks.length - 1
                        ? `1px solid ${th.input}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: th.accentFg,
                        fontWeight: 700,
                      }}
                    >
                      {f.email}
                    </span>
                    <span style={{ fontSize: 11, color: th.dim }}>
                      {fmtDate(f.date)}
                    </span>
                  </div>
                  {f.stars > 0 && (
                    <div style={{ marginBottom: 4 }}>
                      {"★".repeat(f.stars) + "☆".repeat(5 - f.stars)}
                    </div>
                  )}
                  <div
                    style={{ fontSize: 13, color: th.text, lineHeight: 1.5 }}
                  >
                    {f.text}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          color: th.dim,
          fontSize: 11,
          letterSpacing: "2px",
        }}
      >
        DEVELOPED BY AZAD
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState(getAutoTheme);
  const [themeAuto, setThemeAuto] = useState(true);
  const th = theme === "dark" ? DARK : LIGHT;

  // Re-evaluate auto theme every minute if in auto mode
  useEffect(() => {
    if (!themeAuto) return;
    const t = setInterval(() => setTheme(getAutoTheme()), 60000);
    return () => clearInterval(t);
  }, [themeAuto]);

  useEffect(() => {
    document.body.style.background = th.bg;
  }, [th.bg]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Unread feedback count (admin only)
  const [unreadFeedback, setUnreadFeedback] = useState(0);
  useEffect(() => {
    if (!user || user.email !== "freeazadbhos@gmail.com") return;
    // Check for unread feedback on load
    fsGetAllFeedback()
      .then((items) => {
        setUnreadFeedback(items.filter((f) => !f.read).length);
      })
      .catch(() => {});
  }, [user]);

  // Listen to Firebase auth state — single source of truth
  useEffect(() => {
    const unsub = onAuthStateChanged(fbAuth, (fbUser) => {
      if (fbUser) {
        // Build user object from Firebase + local profile cache
        const local = getLocalProfile(fbUser.uid) || {};
        // local.name is written BEFORE onAuthStateChanged fires at signup — always reliable
        // Firebase displayName may lag on first fire; local cache is the source of truth
        const isGuest = fbUser.isAnonymous || local.isGuest || false;
        // Priority: 1) local cache (written at signup before this fires)
        // 2) Firebase displayName  3) Never fall back to email
        const resolvedName = local.name || fbUser.displayName || "";
        const resolvedPhoto = local.photoURL || null;
        setUser({
          id: fbUser.uid,
          name: resolvedName || (isGuest ? "Guest" : ""),
          email: fbUser.email || local.email || "",
          photoURL: resolvedPhoto,
          isGuest,
        });
        // If name is blank after all fallbacks — keep polling until displayName propagates
        if (!resolvedName && !isGuest && fbUser.email) {
          // Try reloading once to get fresh displayName from Firebase
          fbUser
            .reload()
            .then(() => {
              const fresh = fbAuth.currentUser;
              if (fresh?.displayName) {
                saveLocalProfile(fbUser.uid, {
                  name: fresh.displayName,
                  email: fbUser.email || "",
                });
                setUser((u) => (u ? { ...u, name: fresh.displayName } : u));
              }
            })
            .catch(() => {});
        }
        if (resolvedName && !fbUser.displayName) {
          fbUpdateProfile(fbUser, { displayName: resolvedName }).catch(
            () => {}
          );
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);
  const [view, setView] = useState("home");
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState(null);
  const [finished, setFinished] = useState(null);
  const [editingProg, setEditingProg] = useState(null);
  const [selSession, setSelSession] = useState(null);
  const [selSessionOrigin, setSelSessionOrigin] = useState("history");
  const [measurements, setMeasurements] = useState([]);
  const [paused, setPaused] = useState(false);
  const elRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // ── Step 1: Show local cache immediately (instant UI) ──────────────────────
    const localProgs = ls(uKey(user.id, "programs"), null);
    setPrograms(
      localProgs && localProgs.length > 0 ? localProgs : DEFAULT_PROGRAMS
    );
    setSessions(ls(uKey(user.id, "sessions"), []));
    setSettings(ls(uKey(user.id, "settings"), DEFAULT_SETTINGS));
    setMeasurements(getMeasurements(user.id));

    // ── Step 2: Sync Firestore in background (no spinner) ──────────────────────
    const loadFromFirestore = async () => {
      try {
        // Programs
        const fsProgs = await fsGetPrograms(user.id);
        if (fsProgs && fsProgs.length > 0) {
          setPrograms(fsProgs);
          lsSet(uKey(user.id, "programs"), fsProgs);
        } else if (!localProgs || localProgs.length === 0) {
          // Truly new account — seed defaults to Firestore
          await fsSavePrograms(user.id, DEFAULT_PROGRAMS);
        } else {
          // Local has data but Firestore doesn't — push local up
          await fsSavePrograms(user.id, localProgs);
        }
        // Sessions
        const fsSess = await fsGetSessions(user.id);
        if (fsSess.length > 0) {
          setSessions(fsSess);
          lsSet(uKey(user.id, "sessions"), fsSess);
        } else {
          const localSess = ls(uKey(user.id, "sessions"), []);
          if (localSess.length > 0) {
            for (const s of localSess) {
              await fsAddSession(user.id, s);
            }
          }
        }
        // Settings
        const fsSet = await fsGetSettings(user.id);
        if (fsSet) setSettings({ ...DEFAULT_SETTINGS, ...fsSet });
        // Restore photo from Firestore if local cache lacks it
        if (fsSet?.photoURL) {
          const localProf = getLocalProfile(user.id) || {};
          if (!localProf.photoURL) {
            saveLocalProfile(user.id, {
              ...localProf,
              photoURL: fsSet.photoURL,
            });
            setUser((u) => (u ? { ...u, photoURL: fsSet.photoURL } : u));
          }
        }
        // Measurements
        const fsMeas = await fsGetMeasurements(user.id);
        if (fsMeas && fsMeas.length > 0) {
          setMeasurements(fsMeas);
          saveMeasurementsLocal(user.id, fsMeas);
        } else {
          const localMeas = getMeasurements(user.id);
          if (localMeas.length > 0)
            await fsSaveMeasurements(user.id, localMeas);
        }
      } catch (e) {
        console.error("Firestore sync error:", e.code, e.message);
      }
    };
    loadFromFirestore();

    // ── Step 3: Restore in-progress workout from local storage ─────────────────
    const a = ls(uKey(user.id, "active"), null);
    if (a) {
      setActive(a);
      const elapsed = Math.floor((Date.now() - a.startTime) / 1000);
      elRef.current = elapsed;
      setElapsed(elapsed);
      startTsRef.current = a.startTime;
      totalPausedRef.current = 0;
      pauseStartRef.current = null;
      setView("workout");
    }
  }, [user]);

  const saveMeasurements = (data) => {
    setMeasurements(data);
    saveMeasurementsLocal(user.id, data);
    fsSaveMeasurements(user.id, data);
  };

  // saveSessions — updates local state + cache; individual session push done in handleSaveSession
  const saveSessions = (s) => {
    setSessions(s);
    lsSet(uKey(user.id, "sessions"), s);
  };
  const savePrograms = (p) => {
    setPrograms(p);
    lsSet(uKey(user.id, "programs"), p);
    fsSavePrograms(user.id, p);
  };
  const saveSettings = (s) => {
    setSettings(s);
    lsSet(uKey(user.id, "settings"), s);
    fsSaveSettings(user.id, s);
  };
  const saveActive = (a) => {
    setActive(a);
    lsSet(uKey(user.id, "active"), a);
  };

  // ── Timer: timestamp-based so it survives lock screen / tab switch ──────────
  const pauseStartRef = useRef(null); // when current pause began
  const totalPausedRef = useRef(0); // ms paused so far this session
  const startTsRef = useRef(0); // Date.now() when workout started

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const raw = Date.now() - startTsRef.current - totalPausedRef.current;
      const secs = Math.floor(raw / 1000);
      elRef.current = secs;
      setElapsed(secs);
    }, 500); // poll every 500 ms — fast enough, won't drift
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  // Recalculate elapsed when page becomes visible again (phone unlocked)
  useEffect(() => {
    const onVisible = () => {
      if (active && !paused) {
        const raw = Date.now() - startTsRef.current - totalPausedRef.current;
        const secs = Math.floor(raw / 1000);
        elRef.current = secs;
        setElapsed(secs);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [active, paused]);

  // Timer runs whenever a workout is active and not paused — even when minimized
  useEffect(() => {
    if (active && !paused) {
      // Resuming from pause — account for time spent paused
      if (pauseStartRef.current) {
        totalPausedRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      startTimer();
    } else {
      stopTimer();
      // Record when pause started
      if (active && paused && !pauseStartRef.current) {
        pauseStartRef.current = Date.now();
      }
    }
    return stopTimer;
  }, [active, paused, startTimer, stopTimer]);

  if (authLoading)
    return (
      <ThemeCtx.Provider value={th}>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#080809",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="bebas"
            style={{ fontSize: 48, color: "#c8f030", letterSpacing: 2 }}
          >
            IRON BODY
          </div>
        </div>
      </ThemeCtx.Provider>
    );
  if (!user)
    return (
      <ThemeCtx.Provider value={th}>
        <AuthView />
      </ThemeCtx.Provider>
    );
  const handleTemplate = (prog) => {
    setDraft({
      name: prog.name,
      exercises: prog.exs.map((te) => ({ uid: uid(), ...mkEx(te) })),
    });
    setView("create");
  };
  const handleBeginWorkout = (data) => {
    const now = Date.now();
    const session = {
      id: now,
      name: data.name,
      startTime: now,
      exercises: data.exercises,
    };
    elRef.current = 0;
    setElapsed(0);
    setPaused(false);
    startTsRef.current = now;
    totalPausedRef.current = 0;
    pauseStartRef.current = null;
    setActive(session);
    saveActive(session);
    setView("workout");
  };
  const handleFinishWorkout = (exercises) => {
    const total = exercises.reduce((a, ex) => a + ex.sets.length, 0);
    const done = exercises.reduce(
      (a, ex) => a + ex.sets.filter((s) => s.done).length,
      0
    );
    setFinished({ ...active, exercises, totalSets: total, doneSets: done });
    stopTimer();
    setView("complete");
  };
  const handleDeleteSession = async (sessionId) => {
    const next = sessions.filter((s) => s.id !== sessionId);
    saveSessions(next);
    await fsDeleteSession(user.id, sessionId);
  };

  const handleSaveSession = async ({ intensity, calories, duration }) => {
    const s = {
      ...finished,
      endTime: Date.now(),
      intensity,
      calories,
      duration,
    };
    const next = [s, ...sessions];
    saveSessions(next);
    // Push to Firestore — await so we know if it succeeded
    const ok = await fsAddSession(user.id, s);
    if (!ok)
      console.warn(
        "Session may not have synced to Firestore — will retry on next sync"
      );
    // Also re-save programs in case they haven't been pushed yet
    if (programs.length > 0) fsSavePrograms(user.id, programs);
    lsDel(uKey(user.id, "active"));
    setActive(null);
    setFinished(null);
    setView("home");
  };
  const handleAbandon = () => {
    if (!window.confirm("Abandon workout? Progress will be lost.")) return;
    lsDel(uKey(user.id, "active"));
    setActive(null);
    stopTimer();
    setView("home");
  };
  const handleLogout = async () => {
    await signOut(fbAuth);
    setUser(null);
    setView("home");
    setSessions([]);
    setPrograms([]);
    setActive(null);
  };

  const handleSync = async () => {
    if (!user) return;
    const fsProgs = await fsGetPrograms(user.id);
    if (fsProgs && fsProgs.length > 0) {
      setPrograms(fsProgs);
      lsSet(uKey(user.id, "programs"), fsProgs);
    }
    const fsSess = await fsGetSessions(user.id);
    if (fsSess.length > 0) {
      setSessions(fsSess);
      lsSet(uKey(user.id, "sessions"), fsSess);
    }
    console.log(
      "Manual sync complete: programs",
      fsProgs?.length,
      "sessions",
      fsSess?.length
    );
  };

  // Nav is always visible (even during workout — user can minimize)
  const hideNav = [
    "complete",
    "create",
    "editProgram",
    "sessionDetail",
  ].includes(view);

  const NAV = [
    {
      id: "home",
      label: "HOME",
      icon: (c) => <HomeIcon color={c} size={22} />,
    },
    {
      id: "programs",
      label: "PROGRAMS",
      icon: (c) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="5" width="20" height="2.8" rx="1.4" fill={c} />
          <rect x="2" y="11" width="20" height="2.8" rx="1.4" fill={c} />
          <rect x="2" y="17" width="20" height="2.8" rx="1.4" fill={c} />
        </svg>
      ),
    },
    {
      id: "history",
      label: "HISTORY",
      icon: (c) => (
        <span style={{ fontSize: 22, lineHeight: 1, color: c }}>◎</span>
      ),
    },
    {
      id: "profile",
      label: "PROFILE",
      icon: (c, isA) => (
        <div style={{ position: "relative", display: "inline-flex" }}>
          <span style={{ fontSize: 22, lineHeight: 1, color: c }}>◉</span>
          {isA && unreadFeedback > 0 && (
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ff6b6b",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // Workout img background (subtle dumbbell photo behind all views)
  // Dark: dumbbells photo; Light: bright, airy gym
  const appBg =
    theme === "dark"
      ? "url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=60) center/cover no-repeat"
      : "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=60) center/cover no-repeat";
  const bgOverlay =
    theme === "dark" ? "rgba(8,8,9,0.87)" : "rgba(248,246,240,0.77)";

  // Workout progress — computed here so header bar can use them
  const wTotalSets = active
    ? active.exercises.reduce((a, ex) => a + ex.sets.length, 0)
    : 0;
  const wDoneSets = active
    ? active.exercises.reduce(
        (a, ex) => a + ex.sets.filter((s) => s.done).length,
        0
      )
    : 0;
  const wPct = wTotalSets ? wDoneSets / wTotalSets : 0;

  return (
    <ThemeCtx.Provider value={th}>
      {/* Background layers — fixed, never affect layout */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: appBg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: bgOverlay,
        }}
      />
      {/* App shell */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* ── Floating workout header — truly fixed above scroll, never scrolls away ── */}
        {view === "workout" && active && (
          <div
            style={{
              flexShrink: 0,
              background: th.bg,
              borderBottom: `1px solid ${th.border}`,
              padding: "10px 16px 0",
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {/* Left: name + timer */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  className="bebas"
                  style={{
                    fontSize: 20,
                    letterSpacing: 2,
                    color: th.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <span style={{ fontSize: 12, color: th.muted }}>
                    {wDoneSets}/{wTotalSets} sets
                  </span>
                  <span
                    style={{
                      color: paused ? "#fd9644" : th.accentFg,
                      fontWeight: 700,
                      fontSize: 16,
                      fontFamily: "'Bebas Neue',sans-serif",
                      letterSpacing: 1,
                    }}
                  >
                    {paused ? "⏸ " : ""}
                    {fmtTime(elapsed)}
                  </span>
                </div>
              </div>
              {/* Right: icon buttons + FINISH */}
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                  flexShrink: 0,
                  marginLeft: 10,
                }}
              >
                <button
                  onClick={() => setView("home")}
                  style={{
                    background: "transparent",
                    border: `1px solid ${th.inputB}`,
                    borderRadius: 9,
                    color: th.sub,
                    fontSize: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 700,
                    letterSpacing: ".5px",
                  }}
                >
                  PIP
                </button>
                <button
                  onClick={() => setPaused((p) => !p)}
                  style={{
                    background: paused ? th.pause : "transparent",
                    border: `1px solid ${paused ? th.pauseB : th.inputB}`,
                    borderRadius: 9,
                    color: paused ? "#fd9644" : th.muted,
                    fontSize: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {paused ? "RESUME" : "PAUSE"}
                </button>
                <button
                  onClick={handleAbandon}
                  style={{
                    background: "none",
                    border: `1px solid ${th.inputB}`,
                    borderRadius: 9,
                    color: th.delText,
                    fontSize: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  QUIT
                </button>
                <button
                  onClick={() => handleFinishWorkout(active.exercises)}
                  style={{
                    background: th.accentBg,
                    border: "none",
                    borderRadius: 9,
                    color: th.accentT,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    letterSpacing: 0.5,
                  }}
                >
                  FINISH
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div
              style={{
                background: th.row,
                borderRadius: 4,
                height: 4,
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  background: th.accentBg,
                  borderRadius: 4,
                  height: 4,
                  width: `${wPct * 100}%`,
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Floating "workout in progress" banner — visible on all tabs except workout ── */}
        {active && view !== "workout" && (
          <div
            onClick={() => setView("workout")}
            style={{
              flexShrink: 0,
              background: th.accentBg,
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 16px",
              }}
            >
              <div>
                <div
                  style={{
                    color: th.accentT,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "1.5px",
                  }}
                >
                  WORKOUT IN PROGRESS — TAP TO RETURN
                </div>
                <div
                  style={{
                    color: th.accentT,
                    opacity: 0.75,
                    fontSize: 12,
                    marginTop: 1,
                  }}
                >
                  {active.name} · {wDoneSets}/{wTotalSets} sets
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="bebas"
                  style={{ color: th.accentT, fontSize: 18, letterSpacing: 1 }}
                >
                  {fmtTime(elapsed)}
                </span>
                <span
                  style={{ color: th.accentT, fontSize: 18, fontWeight: 700 }}
                >
                  →
                </span>
              </div>
            </div>
            {/* thin progress strip */}
            <div style={{ height: 3, background: "rgba(0,0,0,0.15)" }}>
              <div
                style={{
                  height: 3,
                  width: `${wPct * 100}%`,
                  background: "rgba(0,0,0,0.35)",
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Universal locked header — covers ALL views ── */}
        {view !== "workout" && (
          <div
            style={{
              flexShrink: 0,
              background: th.bg,
              padding: "14px 16px 0",
              zIndex: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 32,
              }}
            >
              {/* Back button — shown for sub-views */}
              {["create", "editProgram", "sessionDetail", "complete"].includes(
                view
              ) && (
                <button
                  onClick={() => {
                    if (view === "sessionDetail")
                      setView(selSessionOrigin || "history");
                    else if (view === "editProgram") setView("programs");
                    else if (view === "create") setView("home");
                    else if (view === "complete") {
                      /* complete has its own save/flow */
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: th.sub,
                    fontSize: 22,
                    cursor: "pointer",
                    padding: "0 8px 0 0",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>
              )}
              <div
                className="bebas"
                style={{
                  fontSize: 32,
                  letterSpacing: 2,
                  color: th.text,
                  lineHeight: 1,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {view === "home"
                  ? "IRON BODY"
                  : view === "programs"
                  ? "MY PROGRAMS"
                  : view === "history"
                  ? "SESSION HISTORY"
                  : view === "profile"
                  ? "PROFILE"
                  : view === "create"
                  ? "CONFIGURE SESSION"
                  : view === "editProgram"
                  ? editingProg
                    ? "EDIT PROGRAM"
                    : "NEW PROGRAM"
                  : view === "sessionDetail"
                  ? "SESSION DETAIL"
                  : view === "complete"
                  ? "SESSION COMPLETE"
                  : ""}
              </div>
              {/* Date — only shown on Home tab, top-right of header */}
              {view === "home" && (
                <div
                  style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: th.muted,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      lineHeight: 1,
                    }}
                  >
                    {new Date()
                      .toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                      .toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: th.dim,
                      letterSpacing: "1px",
                      marginTop: 2,
                    }}
                  >
                    {new Date()
                      .toLocaleDateString("en-US", { weekday: "short" })
                      .toUpperCase()}
                  </div>
                </div>
              )}
              {/* Right-side action for programs tab: NEW button */}
              {view === "programs" && (
                <button
                  onClick={() => {
                    setEditingProg(null);
                    setView("editProgram");
                  }}
                  style={{
                    background: th.accentBg,
                    border: "none",
                    borderRadius: 10,
                    color: th.accentT,
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 1,
                    fontFamily: "'Outfit',sans-serif",
                    flexShrink: 0,
                  }}
                >
                  + NEW
                </button>
              )}
              {/* Right-side action for history tab: SYNC button */}
              {view === "history" && (
                <button
                  onClick={handleSync}
                  disabled={false}
                  style={{
                    background: "transparent",
                    border: `1px solid ${th.inputB}`,
                    borderRadius: 9,
                    color: th.accentFg,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "7px 13px",
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    letterSpacing: 1,
                    flexShrink: 0,
                  }}
                >
                  SYNC
                </button>
              )}
            </div>
            <div style={{ height: 1, background: th.border, marginTop: 10 }} />
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "12px 16px 0",
            minHeight: 0,
          }}
        >
          {view === "home" && (
            <HomeView
              sessions={sessions}
              programs={programs}
              active={active}
              user={user}
              settings={settings}
              elapsed={elapsed}
              measurements={measurements}
              onTemplate={handleTemplate}
              onUpdateProgram={(p) =>
                savePrograms(programs.map((x) => (x.id === p.id ? p : x)))
              }
              onNew={() => {
                setDraft({ name: "", exercises: [] });
                setView("create");
              }}
              onResume={() => setView("workout")}
              onUpdateSettings={saveSettings}
              onGoWorkout={() => setView("workout")}
              onViewSession={(s) => {
                setSelSession(s);
                setSelSessionOrigin("home");
                setView("sessionDetail");
              }}
            />
          )}
          {view === "create" && draft && (
            <CreateView
              draft={draft}
              onStart={handleBeginWorkout}
              onBack={() => setView("home")}
            />
          )}
          {view === "workout" && active && (
            <WorkoutView
              session={active}
              elapsed={elapsed}
              paused={paused}
              pct={wPct}
              doneSets={wDoneSets}
              totalSets={wTotalSets}
              onTogglePause={() => setPaused((p) => !p)}
              onFinish={handleFinishWorkout}
              onAbandon={handleAbandon}
              onSaveActive={saveActive}
              onMinimize={() => setView("home")}
            />
          )}
          {view === "complete" && finished && (
            <CompleteView
              finished={finished}
              elapsed={elapsed}
              onSave={handleSaveSession}
            />
          )}
          {view === "programs" && (
            <ProgramsView
              programs={programs}
              active={active}
              elapsed={elapsed}
              onEdit={(p) => {
                setEditingProg(p);
                setView("editProgram");
              }}
              onNew={() => {
                setEditingProg(null);
                setView("editProgram");
              }}
              onDelete={(id) =>
                savePrograms(programs.filter((p) => p.id !== id))
              }
              onGoWorkout={() => setView("workout")}
              onStart={handleTemplate}
            />
          )}
          {view === "editProgram" && (
            <CreateProgramView
              program={editingProg}
              onSave={(p) => {
                savePrograms(
                  editingProg
                    ? programs.map((x) => (x.id === p.id ? p : x))
                    : [...programs, p]
                );
                setView("programs");
              }}
              onBack={() => setView("programs")}
            />
          )}
          {view === "history" && (
            <HistoryView
              sessions={sessions}
              active={active}
              elapsed={elapsed}
              onViewDetail={(s) => {
                setSelSession(s);
                setSelSessionOrigin("history");
                setView("sessionDetail");
              }}
              onGoWorkout={() => setView("workout")}
              onSync={handleSync}
              onDelete={handleDeleteSession}
            />
          )}
          {view === "sessionDetail" && selSession && (
            <SessionDetailView
              session={selSession}
              onBack={() => setView(selSessionOrigin || "history")}
              onOrigin={selSessionOrigin}
            />
          )}
          {view === "profile" && (
            <ProfileView
              user={user}
              sessions={sessions}
              measurements={measurements}
              onSaveMeasurement={saveMeasurements}
              theme={theme}
              themeAuto={themeAuto}
              active={active}
              elapsed={elapsed}
              onLogout={handleLogout}
              onUpdateUser={(u) => setUser(u)}
              onThemeChange={(t) => {
                setTheme(t);
              }}
              onThemeAutoToggle={(auto) => {
                setThemeAuto(auto);
                if (auto) setTheme(getAutoTheme());
              }}
              onGoWorkout={() => setView("workout")}
              onClearUnread={() => setUnreadFeedback(0)}
            />
          )}
        </div>

        {/* ── Nav bar ── */}
        {!hideNav && (
          <div
            style={{
              display: "flex",
              background: th.nav,
              borderTop: `1px solid ${th.navB}`,
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            {NAV.map((tab) => {
              const isActive =
                view === tab.id || (view === "workout" && tab.id === "home");
              const col = isActive ? th.accentFg : th.dim;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "home" && view === "workout")
                      setView("home");
                    else setView(tab.id);
                  }}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "22px 0 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    color: col,
                    transition: "color .2s",
                    position: "relative",
                  }}
                >
                  {tab.icon(col, user?.email === "freeazadbhos@gmail.com")}
                  <span>{tab.label}</span>
                  {tab.id === "home" && active && view !== "workout" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 18,
                        right: "calc(50% - 15px)",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: th.accentBg,
                        animation: "pulse 1.5s ease-in-out infinite",
                        boxShadow: `0 0 0 2px ${th.nav}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
