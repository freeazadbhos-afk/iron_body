import "./styles.css";
  import { createPortal } from "react-dom";
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
    return h >= 6 && h < 19 ? "light" : "dark";
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
    navInactive: "#888890",
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
    navInactive: "#555555",
    sect: "#f5f4ef",
    accentBg: "#c8f030",
    accentT: "#1a1a1a",
    accentFg: "#0b7a3f",
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
        background: `color-mix(in srgb, ${th.card} 50%, transparent)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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

    /* ── MACHINE EXERCISES ── */
    {
      id: "m1",
      name: "Pectoral Machine (Pec Deck)",
      muscle: "Chest",
      group: "Chest",
    },
    {
      id: "m2",
      name: "Incline Chest Press Machine",
      muscle: "Upper Chest",
      group: "Chest",
    },
    {
      id: "m3",
      name: "Decline Chest Press Machine",
      muscle: "Lower Chest",
      group: "Chest",
    },
    {
      id: "m4",
      name: "Plate-Loaded Chest Fly Machine",
      muscle: "Chest",
      group: "Chest",
    },
    { id: "m5", name: "Lat Pulldown Machine", muscle: "Lats", group: "Back" },
    {
      id: "m6",
      name: "Plate-Loaded Row Machine",
      muscle: "Mid Back",
      group: "Back",
    },
    {
      id: "m7",
      name: "Reverse Fly Machine",
      muscle: "Rear Delts",
      group: "Back",
    },
    {
      id: "m8",
      name: "Back Extension Machine",
      muscle: "Lower Back",
      group: "Back",
    },
    {
      id: "m9",
      name: "Shoulder Press Machine",
      muscle: "Shoulders",
      group: "Shoulders",
    },
    {
      id: "m10",
      name: "Lateral Raise Machine",
      muscle: "Side Delts",
      group: "Shoulders",
    },
    {
      id: "m11",
      name: "Rear Delt Machine",
      muscle: "Rear Delts",
      group: "Shoulders",
    },
    { id: "m12", name: "Shrug Machine", muscle: "Traps", group: "Shoulders" },
    { id: "m13", name: "Bicep Curl Machine", muscle: "Biceps", group: "Arms" },
    { id: "m14", name: "Preacher Curl Machine", muscle: "Biceps", group: "Arms" },
    {
      id: "m15",
      name: "Tricep Extension Machine",
      muscle: "Triceps",
      group: "Arms",
    },
    { id: "m16", name: "Tricep Dip Machine", muscle: "Triceps", group: "Arms" },
    { id: "m17", name: "Leg Extension Machine", muscle: "Quads", group: "Legs" },
    {
      id: "m18",
      name: "Lying Leg Curl Machine",
      muscle: "Hamstrings",
      group: "Legs",
    },
    {
      id: "m19",
      name: "Seated Leg Curl Machine",
      muscle: "Hamstrings",
      group: "Legs",
    },
    { id: "m22", name: "Hip Thrust Machine", muscle: "Glutes", group: "Legs" },
    {
      id: "m23",
      name: "Glute Kickback Machine",
      muscle: "Glutes",
      group: "Legs",
    },
    {
      id: "m24",
      name: "Seated Calf Raise Machine",
      muscle: "Calves",
      group: "Legs",
    },
    {
      id: "m25",
      name: "Standing Calf Raise Machine",
      muscle: "Calves",
      group: "Legs",
    },
    { id: "m26", name: "Hack Squat Machine", muscle: "Quads", group: "Legs" },

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

    /* ── GLUTES (missing exercises) ── */,
    { id: "g7", name: "Kneeling Squat", muscle: "Glutes", group: "Legs" },

    /* ── CHEST (additional) ── */
    { id: "ch1", name: "Chest Dip", muscle: "Lower Chest", group: "Chest" },
    {
      id: "ch3",
      name: "Dumbbell Squeeze Press",
      muscle: "Chest",
      group: "Chest",
    },

    /* ── BACK (additional) ── */,
    { id: "bk2", name: "Seal Row", muscle: "Mid Back", group: "Back" },
    {
      id: "bk3",
      name: "Snatch-Grip Deadlift",
      muscle: "Full Back",
      group: "Back",
    },
    { id: "bk4", name: "Jefferson Curl", muscle: "Lower Back", group: "Back" },

    /* ── ARMS (additional) ── */,
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
      id: "sh4",
      name: "Dumbbell Scarecrow",
      muscle: "Rear Delts",
      group: "Shoulders",
    },

    /* ── LEGS (additional) ── */
    { id: "lg1", name: "Barbell Front Squat", muscle: "Quads", group: "Legs" },
    { id: "lg2", name: "Hack Squat (Barbell)", muscle: "Quads", group: "Legs" },
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


  /* ─── Exercise Difficulty Map ────────────────────────────────────────────────
     1 = Easy  (machine / simple isolation)
     2 = Medium (dumbbell / cable compound / moderate free weight)
     3 = Hard  (heavy barbell / technical compound / bodyweight hard)
  ─────────────────────────────────────────────────────────────────────────────── */
  const DIFFICULTY = {
    // ── Chest ──────────────────────────────────────────────────────────────────
    e1:"M", e2:"M", e3:"E", e4:"M", e5:"M", e6:"M", e7:"E", e8:"M",
    e51:"H", e52:"H", e53:"M", e54:"M", e55:"M", e56:"M", e57:"M", e58:"E",
    ch1:"M", ch3:"M",
    // ── Back ───────────────────────────────────────────────────────────────────
    e15:"M", e16:"M", e17:"M", e18:"E", e19:"M", e20:"H", e21:"E", e22:"M",
    e59:"H", e60:"H", e61:"H", e62:"M", e63:"H", e64:"H", e65:"E", e66:"E",
    e67:"M", e68:"M", e69:"H",
    bk2:"H", bk3:"H", bk4:"H",
    // ── Biceps ─────────────────────────────────────────────────────────────────
    e9:"M", e10:"E", e11:"E", e12:"E", e13:"M", e14:"E",
    e70:"M", e71:"M", e72:"E", e73:"M", e74:"M", e75:"E",
    // ── Triceps ────────────────────────────────────────────────────────────────
    e23:"E", e24:"M", e25:"M", e26:"E", e27:"H",
    e76:"M", e77:"M", e78:"H", e79:"E", e80:"E", e81:"E",
    // ── Forearms ───────────────────────────────────────────────────────────────
    e41:"E", e82:"E", e83:"E",
    ar5:"E", ar6:"E",
    // ── Shoulders ──────────────────────────────────────────────────────────────
    e28:"H", e29:"M", e30:"E", e31:"E", e32:"M", e33:"M",
    e34:"E", e35:"E", e36:"E", e37:"E", e38:"M", e39:"E", e40:"E",
    e84:"M", e85:"E", e86:"E", e87:"M", e88:"E", e89:"M", e90:"H", e91:"E",
    sh1:"E", sh2:"E", sh4:"M",
    // ── Legs ───────────────────────────────────────────────────────────────────
    e42:"M", e43:"E", e44:"E", e45:"E", e46:"E", e47:"M", e48:"E", e49:"E", e50:"E",
    e92:"H", e93:"H", e94:"H", e95:"M", e96:"E", e97:"E", e98:"E", e99:"E",
    e100:"H", e101:"M", e102:"M", e103:"E", e104:"M", e105:"M", e106:"M",
    g7:"M",
    x1:"E", x2:"E", x3:"M", x4:"M", x5:"H", x6:"M", x7:"M", x9:"M", x10:"H",
    x11:"E", x12:"E",
    lg1:"H", lg2:"H", lg5:"E", lg6:"M", lg7:"M", lg8:"E", lg9:"E", lg10:"E", lg11:"E",
    m17:"E", m18:"E", m19:"E", m22:"E", m23:"E", m24:"E", m25:"E", m26:"E",
    // ── Core ───────────────────────────────────────────────────────────────────
    x13:"M", x14:"H", x15:"M", x16:"M", x17:"M", x18:"E", x19:"E", x20:"E",
    x21:"M", x22:"E", x23:"H", x24:"M", x25:"H", x26:"M", x27:"M", x28:"E",
    x29:"E", x30:"M", x31:"E", x32:"M", x33:"H", x34:"M", x35:"E", x36:"M",
    x37:"M", x38:"H", x39:"M", x40:"M", x41:"E", x42:"M", x43:"E", x44:"M",
    x45:"E", x46:"M", x47:"M", x48:"M",
    // ── Machines (all Easy) ────────────────────────────────────────────────────
    m1:"E", m2:"E", m3:"E", m4:"E", m5:"E", m6:"E", m7:"E", m8:"E",
    m9:"E", m10:"E", m11:"E", m12:"E", m13:"E", m14:"E", m15:"E", m16:"E",
    // ── Cardio (all Easy — logging effort, not movement complexity) ────────────
    c1:"E", c2:"E", c3:"E", c4:"E", c5:"E", c6:"E", c7:"E",
    c8:"E", c9:"E", c10:"E", c11:"E", c12:"E", c13:"E",
  };

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
      name: "Legs Glutes",
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
      name: "Chest Biceps",
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
      name: "Back Triceps",
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
      name: "Shoulders Traps",
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
      name: "Chest Biceps",
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
      name: "Back Triceps",
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
      name: "Shoulders Delts",
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
      name: "Legs Glutes",
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
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140,
  ]; // quick-tap dropdown
  const SLIDER_PRESETS = [
    0.0, 2.5, 5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0, 22.5, 25.0, 27.5, 30.0,
    32.5, 35.0, 37.5, 40.0, 42.5, 45.0, 47.5, 50.0, 52.5, 55.0, 57.5, 60.0, 62.5,
    65.0, 67.5, 70.0, 72.5, 75.0, 77.5, 80.0, 82.5, 85.0, 87.5, 90.0, 92.5, 95.0,
    97.5, 100.0, 102.5, 105.0, 107.5, 110.0, 112.5, 115.0, 117.5, 120.0, 122.5,
    125.0, 127.5, 130.0, 132.5, 135.0, 137.5, 140.0,
  ]; // ruler: 0–140 in 2.5kg steps
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
        ex.type === "cardio"
          ? a
          : a +
            ex.sets
              .filter((st) => st.done)
              .reduce((b, st) => b + (st.weight || 0) * (st.reps || 0), 0),
      0
    );
  }
  /* ─── Drag-to-reorder (Todoist-style: card sticks to pointer) ───────────────── */
  function useDragSort(items, setItems) {
    const [dragIdx, setDragIdx] = useState(null);
    const [insertIdx, setInsertIdx] = useState(null);
    const itemRects = useRef([]);
    const dragIdxRef = useRef(null);
    const insertIdxRef = useRef(null);

    const start = (e, idx, containerRef) => {
      e.preventDefault();
      const startY = e.touches ? e.touches[0].clientY : e.clientY;
      let hasMoved = false;
      // Cache all item rects at drag start (before dragged item fades)
      const children = containerRef.current
        ? Array.from(containerRef.current.querySelectorAll("[data-drag-item]"))
        : [];
      itemRects.current = children.map((c) => c.getBoundingClientRect());
      dragIdxRef.current = idx;
      insertIdxRef.current = idx;
      setDragIdx(idx);
      setInsertIdx(idx);

      const onMove = (ev) => {
        if (
          !hasMoved &&
          Math.abs((ev.touches ? ev.touches[0].clientY : ev.clientY) - startY) > 4
        ) {
          hasMoved = true;
        }
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        const rects = itemRects.current;
        // Find which gap the pointer is in.
        // Gap i is between item i-1 and item i (gap 0 = before first, gap n = after last).
        let insert = 0;
        for (let i = 0; i < rects.length; i++) {
          if (clientY > rects[i].top + rects[i].height / 2) {
            insert = i + 1;
          }
        }
        // Clamp
        insert = Math.max(0, Math.min(rects.length, insert));
        if (insert !== insertIdxRef.current) {
          insertIdxRef.current = insert;
          setInsertIdx(insert);
        }
      };

      const onEnd = () => {
        const from = dragIdxRef.current;
        const to = insertIdxRef.current;
        if (hasMoved) {
          // Suppress the synthetic click that fires after pointerup
          window.addEventListener("click", (ev) => ev.stopPropagation(), {
            capture: true,
            once: true,
          });
        }
        // 'to' is an insert gap index. Convert to final array index.
        // After removing item at 'from', insert at 'to' (adjusted for removal).
        if (from !== null && to !== null) {
          const rawTo = to > from ? to - 1 : to; // adjust for splice
          if (rawTo !== from) {
            const next = [...items];
            const [moved] = next.splice(from, 1);
            next.splice(rawTo, 0, moved);
            setItems(next);
          }
        }
        dragIdxRef.current = null;
        insertIdxRef.current = null;
        setDragIdx(null);
        setInsertIdx(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };

      // Attach to window so drag works even if pointer leaves the grip
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    };

    return { dragIdx, insertIdx, start };
  }

  /* ─── 3×3 dot grip icon — denser dots ───────────────────────────────────────── */
  function GripIcon() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,3px)",
          gap: 2,
          padding: "2px 10px 2px 2px",
          cursor: "grab",
          flexShrink: 0,
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#888",
            }}
          />
        ))}
      </div>
    );
  }

  /* ─── Drop line between cards ────────────────────────────────────────────────── */
  function DropLine() {
    return (
      <div
        style={{
          height: 3,
          background: "#c8f030",
          borderRadius: 2,
          margin: "2px 0",
          boxShadow: "0 0 8px #c8f030",
        }}
      />
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
  async function fsUpdateChangelog(id, text) {
    try {
      await setDoc(doc(fbDb, "changelog", id), { text }, { merge: true });
      return true;
    } catch (e) {
      console.error("fsUpdateChangelog:", e);
      return false;
    }
  }
  async function fsGetAllChangelog() {
    try {
      const snap = await getDocs(collection(fbDb, "changelog"));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.date - a.date);
    } catch (e) {
      console.error("fsGetAllChangelog:", e);
      return [];
    }
  }
  async function fsSaveChangelog(text, version) {
    try {
      const id = Date.now().toString(36);
      await setDoc(doc(fbDb, "changelog", id), {
        text,
        date: Date.now(),
        version: version || "1.1.1",
      });
      return true;
    } catch (e) {
      console.error("fsSaveChangelog:", e);
      return false;
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
  async function fsMarkFeedbackRead(uid, timestamp) {
    try {
      await setDoc(
        doc(fbDb, "users", uid, "data", "settings"),
        { lastReadFeedback: timestamp },
        { merge: true }
      );
    } catch (e) {
      console.error("fsMarkFeedbackRead:", e.code, e.message);
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
          background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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
    const [wpClosing, setWpClosing] = useState(false);
    const scrollRef = useRef(null);
    const timerRef = useRef(null);
    const closeWp = () => {
      setWpClosing(true);
      setTimeout(() => { setOpen(false); setWpClosing(false); }, 280);
    };
    const ITEM_W = 72;

    // Scroll ruler to selected value when sheet opens
    useEffect(() => {
      if (!open) return;
      const el = scrollRef.current;
      if (!el) return;
      const idx =
        SLIDER_PRESETS.indexOf(value) >= 0
          ? SLIDER_PRESETS.indexOf(value)
          : SLIDER_PRESETS.reduce(
              (best, w, i) =>
                Math.abs(w - value) < Math.abs(SLIDER_PRESETS[best] - value)
                  ? i
                  : best,
              0
            );
      // With padding = calc(50% - ITEM_W/2) on each side,
      // item[idx] is centered when scrollLeft = idx * ITEM_W
      requestAnimationFrame(() => {
        el.scrollLeft = idx * ITEM_W;
      });
    }, [open]);

    const scrollToIdx = (idx) => {
      const el = scrollRef.current;
      if (!el) return;
      // Same formula: scrollLeft = idx * ITEM_W
      el.scrollTo({ left: idx * ITEM_W, behavior: "smooth" });
    };

    const handleScroll = (e) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const el = e.target;
        // With the padding convention, idx = round(scrollLeft / ITEM_W)
        const idx = Math.max(
          0,
          Math.min(SLIDER_PRESETS.length - 1, Math.round(el.scrollLeft / ITEM_W))
        );
        onChange(SLIDER_PRESETS[idx]);
      }, 120);
    };

    return (
      <div style={{ position: "relative" }}>
        <div
          onClick={() => { if (open) closeWp(); else setOpen(true); }}
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

        {open && createPortal(
          <>
            <div
              onClick={() => closeWp()}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1199,
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
                zIndex: 1200,
                background: th.card,
                borderRadius: "18px 18px 0 0",
                border: `1px solid ${th.border}`,
                borderBottom: "none",
                boxShadow: "0 -8px 40px rgba(0,0,0,.4)",
                animation: wpClosing
                  ? "wpSlideDown 0.28s cubic-bezier(0.4,0,1,1) forwards"
                  : "wpSlideUp 0.32s cubic-bezier(0,0,0.2,1) forwards",
              }}
            >
              <style>{`
                @keyframes wpSlideUp {
                  from { transform: translateX(-50%) translateY(100%); opacity: 0.6; }
                  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
                }
                @keyframes wpSlideDown {
                  from { transform: translateX(-50%) translateY(0);    opacity: 1; }
                  to   { transform: translateX(-50%) translateY(100%); opacity: 0; }
                }
              `}</style>
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
                  position: "relative",
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
                {/* Absolutely centered so it aligns with ruler center line */}
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 22,
                    color: th.accentFg,
                    letterSpacing: 1,
                    pointerEvents: "none",
                  }}
                >
                  {value} KG
                </span>
                <button
                  onClick={() => closeWp()}
                  style={{
                    background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
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
              {/* Ruler */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-1px)",
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
                  onScroll={handleScroll}
                  style={{
                    overflowX: "auto",
                    display: "flex",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    padding: `0 calc(50% - ${ITEM_W / 2}px)`,
                  }}
                >
                  {SLIDER_PRESETS.map((w) => {
                    const isSel = w === value;
                    return (
                      <div
                        key={w}
                        onClick={() => {
                          onChange(w);
                          scrollToIdx(
                            SLIDER_PRESETS.reduce(
                              (b, v, i) =>
                                Math.abs(v - w) < Math.abs(SLIDER_PRESETS[b] - w)
                                  ? i
                                  : b,
                              0
                            )
                          );
                        }}
                        style={{
                          flexShrink: 0,
                          width: ITEM_W,
                          scrollSnapAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          paddingTop: 10,
                          paddingBottom: 8,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: 2,
                            height: isSel ? 32 : 20,
                            background: isSel ? th.accentBg : th.sub,
                            borderRadius: 1,
                            marginBottom: 6,
                          }}
                        />
                        {/* Always render label — never conditional — to prevent layout shifts */}
                        <div
                          style={{
                            fontSize: isSel ? 14 : 12,
                            fontWeight: isSel ? 700 : 500,
                            color: isSel ? th.accentFg : th.dim,
                            lineHeight: 1,
                            minHeight: 14,
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          {w}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              {/* Quick-tap: all presets (0–140 in 10kg steps) */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "0 16px 20px",
                  flexWrap: "wrap",
                }}
              >
                {WEIGHT_PRESETS.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      onChange(w);
                      scrollToIdx(
                        SLIDER_PRESETS.reduce(
                          (b, v, i) =>
                            Math.abs(v - w) < Math.abs(SLIDER_PRESETS[b] - w)
                              ? i
                              : b,
                          0
                        )
                      );
                    }}
                    style={{
                      padding: "6px 10px",
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
          </>,
          document.body
        )}
      </div>
    );
  }
  /* ─── ExerciseEditCard — shared by Programs editor and Shortcuts detail ──────── */
  function ExerciseEditCard({
    ex,
    exI,
    isOpen,
    isOver,
    isDragging,
    onToggleOpen,
    onRemoveEx,
    onUpdateNumSets,
    onUpdateSet,
    onAddSet,
    onRemoveSet,
    onDragStart,
    listRef,
  }) {
    const th = useTheme();
    const S = useS();
    const db = DB.find((d) => d.id === ex.id);
    const isCardio = db?.type === "cardio";
    const sets = ex.sets || [];

    return (
      <div
        data-drag-item=""
        style={{ opacity: isDragging ? 0.35 : 1, transition: "opacity .15s" }}
      >
        {isOver && <DropLine />}
        <div style={{ ...S.card, marginBottom: 7 }}>
          {/* Header: grip + name + muscle tag + chevron + REMOVE */}
          <div
            style={{
              padding: "13px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={onToggleOpen}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onDragStart && onDragStart(e, exI, listRef);
                }}
                style={{ marginRight: 8, flexShrink: 0 }}
              >
                <GripIcon />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>
                  {db?.name || ex.id}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                  }}
                >
                  {db && (
                    <span style={S.tag(db.group)}>
                      {(db.muscle || "").toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: th.muted }}>
                    {isCardio
                      ? "Cardio"
                      : `${sets.length} sets · ${sets[0]?.reps ?? "?"}reps · ${
                          sets[0]?.weight ?? "?"
                        }kg`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveEx();
              }}
              style={{
                background: "none",
                border: "none",
                color: th.dim,
                cursor: "pointer",
                fontSize: 15,
                padding: "2px 6px",
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              ✕
            </button>
          </div>

          {/* Set rows — smooth expand/collapse via max-height transition */}
          <div style={{
            maxHeight: isOpen ? "800px" : "0px",
            overflow: "hidden",
            transition: isOpen
              ? "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease"
              : "max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
            opacity: isOpen ? 1 : 0,
          }}>
            <div style={{ borderTop: `1px solid ${th.border}` }}>
              {isCardio ? (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: th.muted, lineHeight: 1.6 }}>
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
                  {sets.map((set, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 14px",
                        borderBottom: `1px solid ${th.input}`,
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: `2px solid ${th.inputB}`,
                          flexShrink: 0,
                        }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSet(sIdx, "reps", Math.max(1, set.reps - 1));
                          }}
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
                        <span
                          style={{
                            flex: 1,
                            color: th.text,
                            textAlign: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            fontFamily: "'Outfit',sans-serif",
                            userSelect: "none",
                            padding: "6px 0",
                          }}
                        >
                          {set.reps}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSet(sIdx, "reps", set.reps + 1);
                          }}
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
                        onChange={(v) => onUpdateSet(sIdx, "weight", v)}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSet(sIdx);
                        }}
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
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSet();
                    }}
                    style={{
                      padding: "9px 14px",
                      color: th.accentFg,
                      fontSize: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>+</span> Add set
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
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
    const [epClosing, setEpClosing] = useState(false);
    const closeMe = (cb) => {
      setEpClosing(true);
      setTimeout(() => { setEpClosing(false); (cb || onClose)(); }, 300);
    };
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
      closeMe();
    };

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
          animation: epClosing ? "epFadeOut 0.3s ease-in forwards" : "epFadeIn 0.25s ease-out forwards",
        }}
      >
        <style>{`
          @keyframes epFadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes epFadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes epSlideUp   { from { transform: translateY(100%); opacity:0.6; } to { transform: translateY(0); opacity:1; } }
          @keyframes epSlideDown { from { transform: translateY(0); opacity:1; } to { transform: translateY(100%); opacity:0; } }
        `}</style>
        <div
          style={{
            background: `color-mix(in srgb, ${th.card} 85%, transparent)`,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "20px 20px 0 0",
            borderTop: `1px solid ${th.border}`,
            marginTop: 50,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            animation: epClosing ? "epSlideDown 0.3s cubic-bezier(0.4,0,1,1) forwards" : "epSlideUp 0.35s cubic-bezier(0,0,0.2,1) forwards",
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
                      background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
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
                  onClick={() => closeMe()}
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
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontFamily: "'Outfit',sans-serif",
                    background: flt === f.label ? th.accentBg : th.bg,
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
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: gc(e.group), fontWeight: 600 }}>
                        {e.muscle.toUpperCase()}
                      </span>
                      {(() => {
                        const d = DIFFICULTY[e.id];
                        if (!d) return null;
                        const cfg = d === "H"
                          ? { label: "HARD", bg: "rgba(255,107,107,0.15)", color: "#ff6b6b" }
                          : d === "M"
                          ? { label: "MED",  bg: "rgba(253,150,68,0.15)",  color: "#fd9644" }
                          : { label: "EASY", bg: "rgba(34,168,85,0.15)",   color: "#2db55d" };
                        return (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
                            padding: "2px 6px", borderRadius: 4,
                            background: cfg.bg, color: cfg.color,
                          }}>
                            {cfg.label}
                          </span>
                        );
                      })()}
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
                  background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
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
              background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
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
            position: "fixed",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.18)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "fixed",
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
              fontSize: 85,
              textAlign: "left",
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
              textAlign: "left",
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
              // 1. Make the base color semi-transparent (0.8 opacity) so the blur is visible
              background: loading ? "rgba(200,240,48,0.4)" : "rgba(200,240,48,0.9)", 
              // 2. Add the blur effects
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)", // Important for Safari support on iPhones!
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
              color: "rgba(255,255,255,50.35)",
              fontSize: 15,
              fontFamily: "'Outfit',sans-serif",
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
              color: "rgba(255,255,255,100.25)",
              fontSize: 12,
              cursor: "pointer",
              marginTop: 8,
              width: "100%",
              textAlign: "center",
              textDecoration: "underline",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            Continue as guest
          </button>
          <div
            style={{
              marginTop: 48,
              textAlign: "center",
              color: "#c8f030",
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
    onOpenShortcut,
    onUpdateSettings,
    onGoWorkout,
    onViewSession,
  }) {
    const th = useTheme();
    const S = useS();
    const [editShortcuts, setEditShortcuts] = useState(false);
    const [addingShortcut, setAddingShortcut] = useState(false);
    const today = new Date();
    const dow = today
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
    const last7Cutoff2 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const ws = sessions.filter((s) => (s.startTime || 0) >= last7Cutoff2);
    const last8 = [...sessions].slice(0, 8).reverse();
    const firstName = user.name.split(" ")[0];
    const pinnedIds = settings.homePrograms;
    const shownPrograms = pinnedIds
      ? programs.filter((p) => pinnedIds.includes(p.id))
      : programs;

    // Collect all muscles trained in the last 7 days (granular)
    const last7Cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekMuscleSet = new Set();
    sessions
      .filter((s) => (s.startTime || 0) >= last7Cutoff)
      .forEach((s) =>
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
        <div style={{ marginBottom: 22, textAlign: "left" }}>
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
          <div style={{ fontSize: 16, color: th.muted, marginTop: 4, textAlign: "left", }}>
            {
              GREETINGS[
                (new Date().getDay() * 3 + new Date().getHours()) %
                  GREETINGS.length
              ]
            }
          </div>
        </div>

        {/* This Week — removed Volume, expanded muscles */}
        <div style={{ ...S.card, padding: 16, marginBottom: 10, textAlign: "left", }}>
          <div style={{ ...S.label, marginBottom: 14 }}>
            YOUR 7-DAY HIGHLIGHTS
          </div>
          <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
            {[
              { v: ws.length, l: "SESSIONS" },
              { v: ws.reduce((a, s) => a + (s.exercises || []).filter(e => e.type !== "cardio")
              .reduce((b, e) => b + (e.sets || []).filter(st => st.done).length, 0), 0), l: "SETS" },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  flex: 1,
                  background: `color-mix(in srgb, ${th.sect} 50%, transparent)`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
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
                    fontSize: 11,
                    color: th.dim,
                    letterSpacing: "1.5px",
                    marginTop: 3,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
            {/* Loads lifted this week */}
            <div
              key="loads"
              style={{
                flex: 1,
                background: th.sect,
                borderRadius: 10,
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              {(() => {
                const totalKg = ws.reduce((a, s) => a + sessionVol(s), 0);
                const display =
                  totalKg >= 1000
                    ? `${(totalKg / 1000).toFixed(1)}t`
                    : `${totalKg}kg`;
                return (
                  <>
                    <div
                      className="bebas"
                      style={{ fontSize: 26, color: th.accentFg, lineHeight: 1 }}
                    >
                      {display}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: th.dim,
                        letterSpacing: "1.5px",
                        marginTop: 3,
                      }}
                    >
                      LOADS
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          {/* Granular muscles trained */}
          <div>
            <div
              style={{
                fontSize: 10,
                textAlign: "left",
                color: th.dim,
                letterSpacing: "1.5px",
                marginBottom: 7,
              }}
            >
              MUSCLES TRAINED — LAST 7 DAYS
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
            {/* Row 1 — last 7 days stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {(function () {
                const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const recent = sessions.filter(
                  (s) => (s.startTime || 0) >= cutoff
                );
                const mins = recent.reduce((a, s) => a + (s.duration || 0), 0);
                const cals = recent.reduce((a, s) => a + (s.calories || 0), 0);
                const avgInt = recent.length
                  ? (
                      recent.reduce((a, s) => a + (s.intensity || 0), 0) /
                      recent.length
                    ).toFixed(1) + "/10"
                  : "—";
                const statItems = [
                  {
                    v:
                      mins >= 60
                        ? `${Math.floor(mins / 60)}h ${mins % 60}m`
                        : `${mins}m`,
                    l: "TIME TRAINED",
                  },
                  { v: cals.toLocaleString() + " kcal", l: "CALS BURNED" },
                  { v: avgInt, l: "AVERAGE INTENSITY" },
                ];
                return statItems.map((s) => (
                  <div
                    key={s.l}
                    style={{
                      ...S.card,
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
                ));
              })()}
            </div>
            {/* Row 2 — intensity-only bar chart */}
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
                <div style={{ fontSize: 12, color: th.dim }}>last 7 days</div>
              </div>
              {(() => {
                // Build last-7-days slots (always 7, empty days shown dimmed)
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  d.setHours(0, 0, 0, 0);
                  return d;
                });
                const byDate = {};
                sessions.forEach((s) => {
                  if (!s.startTime) return;
                  const dk = new Date(s.startTime).toDateString();
                  if (!byDate[dk]) byDate[dk] = [];
                  byDate[dk].push(s);
                });
                return (
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                  >
                    {days.map((d, i) => {
                      const dk = d.toDateString();
                      const daySessions = byDate[dk] || [];
                      const hasData = daySessions.length > 0;
                      let n = 0;
                      if (hasData) {
                        const vols = daySessions.map((s) => sessionVol(s));
                        const totalVol = vols.reduce((a, v) => a + v, 0);
                        const useEqual = totalVol === 0;
                        n =
                          Math.round(
                            daySessions.reduce((a, s, si) => {
                              const w = useEqual
                                ? 1 / daySessions.length
                                : vols[si] > 0
                                ? vols[si] / totalVol
                                : 0.5 / daySessions.length;
                              return a + (s.intensity || 0) * w;
                            }, 0) * 10
                          ) / 10;
                      }
                      const h = hasData ? Math.max(8, (n / 10) * 80) : 6;
                      const col = hasData ? intColor(n) : th.inputB;
                      const dateLabel = d.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      });
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: hasData ? col : "transparent",
                              marginBottom: 3,
                              lineHeight: 1,
                            }}
                          >
                            {hasData ? n : "·"}
                          </span>
                          <div
                            style={{
                              width: "100%",
                              height: h,
                              background: col,
                              borderRadius: "3px 3px 0 0",
                              opacity: hasData ? 1 : 0.25,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: th.dim,
                              marginTop: 4,
                              lineHeight: 1,
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dateLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 10,
                    borderRadius: 2,
                    background:
                      "linear-gradient(to right,#ff6b6b,#fd9644,#c8f030)",
                  }}
                />
                <span style={{ fontSize: 11, color: th.dim }}>
                  Intensity (accounts for volume, weights & completion)
                </span>
              </div>
            </div>
          </>
        )}

        {/* Body composition dashboard */}
        {measurements && measurements.length > 0 && (
          <div style={{ ...S.card, padding: 16, marginBottom: 10, textAlign: "left", }}>
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
                        ? "#1db954" // green — fat decreased (good)
                        : "#ff6b6b" // red — fat increased (bad)
                      : d > 0
                      ? "#1db954" // green — weight/muscle increased (good)
                      : "#ff6b6b", // red — decreased
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
                      { f: "muscle", l: "MUSCLE MASS", unit: "%" },
                      { f: "fat", l: "BODY FAT %", unit: "%" },
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
                              fontSize: 11,
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
                                fontSize: 12,
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
                  {/* Trend charts — weight, muscle %, body fat % */}
                  {(() => {
                    const trendFields = [
                      {
                        f: "weight",
                        label: "WEIGHT TREND",
                        unit: "kg",
                        barColor: th.accentBg,
                      },
                      {
                        f: "muscle",
                        label: "MUSCLE TREND",
                        unit: "%",
                        barColor: "#4ecdc4",
                      },
                      {
                        f: "fat",
                        label: "BODY FAT TREND",
                        unit: "%",
                        barColor: "#ff6b6b",
                      },
                    ];
                    return trendFields.map(({ f, label, unit, barColor }) => {
                      const pts = measurements
                        .filter((m) => m[f] != null)
                        .slice(0, 6)
                        .reverse();
                      if (pts.length < 2) return null;
                      const vals = pts.map((p) => p[f]);
                      const mn = Math.min(...vals);
                      const mx = Math.max(...vals);
                      // Anchor to a proportional floor so bars reflect real values,
                      // not just the min→max delta (which exaggerates tiny changes).
                      const floor = mn * 0.93;
                      const ceiling = mx * 1.04;
                      const range = ceiling - floor || 1;
                      return (
                        <div key={f} style={{ marginTop: 18 }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: th.sub,
                              letterSpacing: "1.5px",
                              fontWeight: 700,
                              marginBottom: 14,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-end",
                              gap: 4,
                              height: 56,
                            }}
                          >
                            {pts.map((p, i) => {
                              const h = Math.max(
                                4,
                                ((p[f] - floor) / range) * 48
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
                                        ? barColor
                                        : barColor + "55",
                                      borderRadius: "3px 3px 0 0",
                                      transition: "height .3s",
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: th.dim,
                                      textAlign: "center",
                                    }}
                                  >
                                    {p[f]}
                                    {unit}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
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
                      background: "transparent",
                      border: "none",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      cursor: "pointer",
                      color: th.text,
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
                  onClick={() => onOpenShortcut(p)}
                  style={{
                    width: "100%",
                    background: `color-mix(in srgb, ${th.card} 35%, transparent)`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `1px solid ${th.border}`,
                    borderRadius: 14,
                    padding: "15px 13px",
                    textAlign: "left",
                    transition: "border-color .2s",
                    cursor: "pointer",
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
                      fontSize: 13,
                      color: th.muted,
                    }}
                  >
                    {p.exs.length} exercises
                  </div>
                </div>
              </div>
            ))}
            {editShortcuts && (
              <button
                onClick={() => setAddingShortcut((a) => !a)}
                style={{
                  background: "transparent",
                  border: `1px dashed ${th.text}`,
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
                        fontSize: 15,
                        textAlign: "left",
                        color: th.text,
                        fontWeight: 500,
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        color: th.accentFg,
                        fontSize: 28,
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
            <div style={{ ...S.label, marginBottom: 12, textAlign: "left", }}>RECENT SESSIONS</div>
            {sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                onClick={() => onViewSession(s)}
                style={{
                  ...S.card,
                  padding: "14px 16px",
                  marginBottom: 8,
                  textAlign: "left",
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
                        textAlign: "left",
                        color: th.text,
                        marginBottom: 5,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: th.muted, marginBottom: 8, textAlign: "left" }}
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
                      background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
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
                    onClick={() => {
                      if (window.confirm("Delete this program?")) onDelete(p.id);
                    }}
                    style={{
                      background: "rgba(220, 50, 50, 0.15)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(220, 50, 50, 0.3)",
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
    const [exs, setExs] = useState(() =>
      (program?.exs || []).map((e) => {
        // Migrate legacy {s, r, w} format to {sets: [{reps, weight}]}
        if (e.sets) return e; // already new format
        if (e.type === "cardio") return e;
        return {
          ...e,
          sets: Array.from({ length: e.s || 4 }, () => ({
            reps: e.r || 10,
            weight: e.w || 20,
          })),
        };
      })
    );
    const [showPicker, setShowPicker] = useState(false);
    const [expandedEx, setExpandedEx] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(!editing);
    const listRef = useRef(null);
    const { dragIdx, insertIdx, start: dragStart } = useDragSort(exs, setExs);

    const loadSuggestion = (s) => {
      setName(s.name);
      setExs(
        (s.exs || []).map((e) => {
          if (e.sets || e.type === "cardio") return e;
          return {
            ...e,
            sets: Array.from({ length: e.s || 4 }, () => ({
              reps: e.r || 10,
              weight: e.w || 20,
            })),
          };
        })
      );
      setShowSuggestions(false);
    };
    const addEx = (dbId) => {
      const db = DB.find((e) => e.id === dbId);
      const isCardio = db?.type === "cardio";
      setExs((prev) => [
        ...prev,
        isCardio
          ? { id: dbId, type: "cardio", duration: 0, calories: 0, intensity: 0 }
          : {
              id: dbId,
              sets: Array.from({ length: 4 }, () => ({ reps: 10, weight: 20 })),
            },
      ]);
    };
    const removeEx = (id) => setExs((prev) => prev.filter((e) => e.id !== id));
    // Update a single set's field
    const updateSet = (id, sIdx, f, val) =>
      setExs((prev) =>
        prev.map((e) =>
          e.id !== id
            ? e
            : {
                ...e,
                sets: e.sets.map((s, i) =>
                  i !== sIdx
                    ? s
                    : { ...s, [f]: Math.max(0, parseFloat(val) || 0) }
                ),
              }
        )
      );
    // Update cardio fields
    const updateEx = (id, f, val) =>
      setExs((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, [f]: Math.max(0, parseFloat(val) || 0) } : e
        )
      );
    // Add/remove sets
    const updateNumSets = (id, delta) =>
      setExs((prev) =>
        prev.map((e) => {
          if (e.id !== id || !e.sets) return e;
          const n = Math.max(1, Math.min(10, e.sets.length + delta));
          const last = e.sets[e.sets.length - 1] || { reps: 10, weight: 20 };
          const sets =
            n > e.sets.length
              ? [
                  ...e.sets,
                  ...Array.from({ length: n - e.sets.length }, () => ({
                    reps: last.reps,
                    weight: last.weight,
                  })),
                ]
              : e.sets.slice(0, n);
          return { ...e, sets };
        })
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
          <div
            style={{
              ...S.label,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>EXERCISES ({exs.length})</span>
            <span
              style={{
                fontSize: 12,
                color: th.dim,
                fontWeight: 400,
                letterSpacing: 0,
              }}
            >
              hold ⠿ to reorder
            </span>
          </div>
          <div ref={listRef} style={{ position: "relative", textAlign: "left" }}>
            {exs.map((ex, exI) => {
              const isBeingDragged = dragIdx === exI;
              const isOver =
                insertIdx === exI && dragIdx !== null && insertIdx !== dragIdx;
              return (
                <ExerciseEditCard
                  key={ex.id}
                  ex={ex}
                  exI={exI}
                  isOpen={expandedEx === ex.id}
                  isOver={isOver}
                  isDragging={isBeingDragged}
                  onToggleOpen={() =>
                    setExpandedEx(expandedEx === ex.id ? null : ex.id)
                  }
                  onRemoveEx={() => removeEx(ex.id)}
                  onUpdateNumSets={(delta) => updateNumSets(ex.id, delta)}
                  onUpdateSet={(sIdx, f, v) => updateSet(ex.id, sIdx, f, v)}
                  onAddSet={() => updateNumSets(ex.id, 1)}
                  onRemoveSet={(sIdx) =>
                    setExs((prev) =>
                      prev.map((e) =>
                        e.id !== ex.id
                          ? e
                          : { ...e, sets: e.sets.filter((_, i) => i !== sIdx) }
                      )
                    )
                  }
                  onDragStart={dragStart}
                  listRef={listRef}
                />
              );
            })}
            {insertIdx === exs.length && dragIdx !== null && <DropLine />}
          </div>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              width: "100%",
              background: "none",
              border: `1px dashed ${th.text}`,
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
        <div 
        style={{ position: "sticky", bottom: 0, padding: "12px 0 20px" }}>
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
                                  fontSize: 12,
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
                  <div style={{ paddingLeft: 14, marginTop: 2, textAlign: "left", }}>
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
                          <span
                            style={{
                              flex: 1,
                              color: th.text,
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: 700,
                              fontFamily: "'Outfit',sans-serif",
                              userSelect: "none",
                              padding: "6px 0",
                            }}
                          >
                            {set.reps}
                          </span>
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
        <Btn
          onClick={() => {
            if (!window.confirm("Finish this workout and save results?")) return;
            onFinish(exercises);
          }}
          style={{ width: "100%" }}
        >
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
    const vol = sessionVol(finished);

    // Pre-fill from cardio sets if session contains cardio exercises
    const cardioTotals = (() => {
      const cardioExs = (finished.exercises || []).filter(
        (e) => e.type === "cardio"
      );
      if (!cardioExs.length) return null;
      const doneSets = cardioExs.flatMap((e) => e.sets.filter((s) => s.done));
      if (!doneSets.length) return null;
      return {
        cals: doneSets.reduce((a, s) => a + (s.calories || 0), 0),
        dur: doneSets.reduce((a, s) => a + (s.duration || 0), 0),
      };
    })();
    const allCardio =
      (finished.exercises || []).length > 0 &&
      (finished.exercises || []).every((e) => e.type === "cardio");

    const calcAutoIntensity = () => {
      const exs = (finished.exercises || []).filter((e) => e.type !== "cardio");
      if (exs.length === 0) return 7;
      const allSets  = exs.flatMap((ex) => ex.sets || []);
      const doneSets = allSets.filter((s) => s.done);
      if (doneSets.length === 0) return 1;

      // 1. Completion: fraction of planned sets actually done
      const completion = allSets.length > 0 ? doneSets.length / allSets.length : 0;

      // 2. Load: weight × reps per set, normalised against a 60 kg × 10 rep reference
      const REF = 600; // moderate set benchmark
      const avgLoad = doneSets.reduce((sum, s) => {
        const w = (s.weight || 0) > 0 ? s.weight : 30;
        const r = Math.min(s.reps || 0, 30);
        return sum + (w * r) / REF;
      }, 0) / doneSets.length;
      const normLoad = Math.min(avgLoad, 3) / 3; // cap at 3× reference → 0-1

      // 3. Volume: number of completed sets (20 done sets = full score)
      const volumeScore = Math.min(doneSets.length / 20, 1);

      // Weighted composite → map to 1-10
      const composite = completion * 0.4 + normLoad * 0.4 + volumeScore * 0.2;
      const raw = 1 + composite * 9;
      return Math.min(10, Math.max(1, Math.round(raw * 10) / 10));
    };
    // For cardio: use avg intensity from entered set data, fallback to 7
    const cardioIntensityFromData = (() => {
      if (!allCardio) return 7;
      const cardioExs = (finished.exercises || []).filter(e => e.type === "cardio");
      const doneSets = cardioExs.flatMap(e => e.sets.filter(s => s.done));
      const withInt = doneSets.filter(s => (s.intensity || 0) > 0);
      if (!withInt.length) return 7;
      return Math.round(withInt.reduce((a, s) => a + s.intensity, 0) / withInt.length);
    })();
    const autoIntensity = allCardio ? cardioIntensityFromData : calcAutoIntensity();
    const [intensity, setIntensity] = useState(autoIntensity);
    const [calories, setCalories] = useState(
      cardioTotals ? String(cardioTotals.cals || "") : ""
    );
    const [duration, setDuration] = useState(
      cardioTotals?.dur && cardioTotals.dur > 0
        ? String(cardioTotals.dur)
        : String(Math.round(elapsed / 60))
    );
    return (
      <div className="slide-up" style={{ paddingBottom: 32 }}>
        {/* ── Celebration banner ── */}
        {(() => {
          const pct = finished.totalSets > 0 ? finished.doneSets / finished.totalSets : 0;
          const volT = vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}kg`;
          const durMin = Math.round(elapsed / 60);
          const intensity = autoIntensity; // 1-10

          // Composite score 0-100: sets completion 40%, intensity 35%, duration 25%
          const setScore = pct * 40;
          const intScore = (intensity / 10) * 35;
          const durScore = Math.min(durMin / 60, 1) * 25; // 60 min = max duration score
          const score = setScore + intScore + durScore;

          // Tier thresholds
          const tier =
            score >= 85 ? "legend" :
            score >= 70 ? "great" :
            score >= 55 ? "solid" :
            score >= 40 ? "meh" :
            score >= 25 ? "rough" : "ghost";

          const tiers = {
            legend: {
              emoji: "🏆",
              color: "#c8f030",
              bg: "rgba(200,240,48,0.13)",
              border: "rgba(200,240,48,0.3)",
              msgs: [
                "Absolutely elite. That session will be remembered.",
                "Perfect execution. The iron gods are pleased.",
                "That wasn't a workout. That was a statement.",
                "You didn't just train today — you dominated.",
                "Beast mode on. Everything else off. Perfection.",
              ],
            },
            great: {
              emoji: "🔥",
              color: "#c8f030",
              bg: "rgba(200,240,48,0.09)",
              border: "rgba(200,240,48,0.22)",
              msgs: [
                "Strong session. You left very little on the table.",
                "That's how it's done. Consistent, powerful, focused.",
                "The numbers don't lie — that was a great workout.",
                "You showed up and you delivered. Respect.",
                "Hard work compounding in real time. Well done.",
              ],
            },
            solid: {
              emoji: "💪",
              color: "#fd9644",
              bg: "rgba(253,150,68,0.09)",
              border: "rgba(253,150,68,0.22)",
              msgs: [
                "Decent work. The bar is there — now raise it.",
                "Solid session. A bit more gas next time and it's perfect.",
                "You did the work. Could've pushed harder, but it counts.",
                "Good foundation. Build on it next session.",
                "Middle of the road today. Which road are you taking tomorrow?",
              ],
            },
            meh: {
              emoji: "😐",
              color: "#fd9644",
              bg: "rgba(253,150,68,0.07)",
              border: "rgba(253,150,68,0.18)",
              msgs: [
                "That was... a workout. Technically.",
                "The bar was there. You were also there. Occasionally.",
                "Mediocre is just excellence in disguise. Wait, no it isn't.",
                "Your muscles are confused. Your future self is disappointed.",
                "You showed up. That's the most generous thing I can say.",
              ],
            },
            rough: {
              emoji: "🫠",
              color: "#ff6b6b",
              bg: "rgba(255,107,107,0.07)",
              border: "rgba(255,107,107,0.18)",
              msgs: [
                "The gym saw you today. It was not impressed.",
                "Half-effort noted. Logged. Judged.",
                "You came, you barely conquered, you left early.",
                "Somewhere, your future gains are weeping quietly.",
                "On a scale of 1 to 10, this was a 3. And that's generous.",
              ],
            },
            ghost: {
              emoji: "💀",
              color: "#ff6b6b",
              bg: "rgba(255,107,107,0.07)",
              border: "rgba(255,107,107,0.2)",
              msgs: [
                "Were you even here? The weights didn't notice.",
                "You hit the gym so lightly it bounced you back.",
                "This session happened. I can't say much else.",
                "Your body asked for a workout. You sent a strongly worded letter instead.",
                "The bar barely moved. Just like this session.",
              ],
            },
          };

          const t = tiers[tier];
          const msg = t.msgs[Math.floor((finished.doneSets + elapsed + intensity) % t.msgs.length)];

          return (
            <div style={{
              textAlign: "center",
              padding: "14px 20px 16px",
              marginBottom: 20,
              background: `linear-gradient(135deg, ${t.bg} 0%, transparent 100%)`,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              animation: "celebIn 0.6s cubic-bezier(0.34,1.4,0.64,1) both",
              animationDelay: "0.15s",
            }}>
              <style>{`
                @keyframes celebIn {
                  from { opacity: 0; transform: translateY(18px) scale(0.95); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes celebPulse {
                  0%, 100% { transform: scale(1); }
                  50%       { transform: scale(1.18); }
                }
              `}</style>
              <div style={{ fontSize: 28, animation: "celebPulse 1.4s ease-in-out 0.4s 2", display: "inline-block" }}>{t.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.color, marginTop: 6, letterSpacing: "0.3px" }}>{msg}</div>
              <div style={{ fontSize: 11, color: th.muted, marginTop: 5 }}>
                {(() => {
                  if (allCardio) {
                    const cardExs = (finished.exercises || []).filter(e => e.type === "cardio");
                    const dSets = cardExs.flatMap(e => e.sets.filter(s => s.done));
                    const totDur = dSets.reduce((a,s) => a + (s.duration||0), 0);
                    const totCal = dSets.reduce((a,s) => a + (s.calories||0), 0);
                    const parts = [];
                    if (totDur > 0) parts.push(`${totDur}min`);
                    if (totCal > 0) parts.push(`${totCal.toLocaleString()} kcal`);
                    parts.push(`intensity ${intensity}/10`);
                    return parts.join(" · ");
                  }
                  return pct >= 1
                    ? `${finished.doneSets} sets · ${volT} · intensity ${intensity}/10 · ${durMin}min — nothing left`
                    : `${finished.doneSets}/${finished.totalSets} sets · ${volT} · intensity ${intensity}/10 · ${durMin}min`;
                })()}
              </div>
            </div>
          );
        })()}
        <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 4 }}>
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
          {(() => {
            const cardioExs = (finished.exercises || []).filter(e => e.type === "cardio");
            const doneSets = cardioExs.flatMap(e => e.sets.filter(s => s.done));
            const totalCalFromData = doneSets.reduce((a, s) => a + (s.calories || 0), 0);
            const totalDurFromData = doneSets.reduce((a, s) => a + (s.duration || 0), 0);
            const durationDisplay = allCardio && totalDurFromData > 0
              ? totalDurFromData + "min"
              : fmtTime(elapsed);
            const tile4 = allCardio
              ? { v: totalCalFromData > 0 ? totalCalFromData.toLocaleString() + " kcal" : "—", l: "CALORIES", u: "burned" }
              : { v: Math.round(vol).toLocaleString() + "kg", l: "VOLUME", u: "lifted" };
            return [
              { v: finished.doneSets, l: "SETS DONE", u: `of ${finished.totalSets}` },
              { v: finished.exercises.length, l: "EXERCISES", u: "completed" },
              { v: durationDisplay, l: "DURATION", u: "recorded" },
              tile4,
            ];
          })().map((s) => (
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ ...S.label }}>{allCardio ? "SET INTENSITY" : "WORKOUT INTENSITY"}</div>
            {!allCardio && intensity === autoIntensity && (
              <span style={{ fontSize: 10, color: th.accentFg, fontWeight: 700, letterSpacing: "1px" }}>AUTO-ESTIMATED</span>
            )}
            {!allCardio && intensity !== autoIntensity && (
              <button onClick={() => setIntensity(autoIntensity)}
                style={{ background: "none", border: "none", color: th.muted, fontSize: 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textDecoration: "underline" }}>
                Reset to estimate ({autoIntensity})
              </button>
            )}
          </div>
          {allCardio && (
            <div style={{ fontSize: 12, color: th.muted, marginBottom: 10 }}>How hard was your cardio session overall?</div>
          )}
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
        {!allCardio ? (
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
        ) : null}
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
    onDelete,
  }) {
    const th = useTheme();
    const S = useS();
    const [confirmDelete, setConfirmDelete] = useState(null); // session id pending delete
    return (
      <div style={{ paddingBottom: 90 }} className="slide-up">
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
                          background: "rgba(220, 50, 50, 0.15)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: "1px solid rgba(220, 50, 50, 0.3)",
                          borderRadius: 7,
                          color: th.delText,
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
                        textAlign: "left",
                        color: th.text,
                        marginBottom: 4,
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: th.muted, textAlign: "left", }}>
                      {fmtDate(s.startTime)} · {s.doneSets}/{s.totalSets} sets ·{" "}
                      {s.duration || "?"}min
                      {s.calories ? ` · ${s.calories}kcal` : ""}
                    </div>
                    <div style={{ fontSize: 12, color: th.dim, marginTop: 2,textAlign: "left", }}>
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
                  textAlign: "left"
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
              { v: Math.round(vol).toLocaleString() + "kg", l: "VOLUME" },
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
        <div style={{ ...S.label, marginBottom: 12, textAlign: "left" }}>
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
  /* ─── ProfileSection — animated expand/collapse wrapper ─────────────────────── */
  function ProfileSection({ open, children }) {
    const [mounted, setMounted] = useState(open);
    const [closing, setClosing] = useState(false);
    useEffect(() => {
      if (open) {
        setMounted(true);
        setClosing(false);
      } else if (mounted) {
        setClosing(true);
        const t = setTimeout(() => { setMounted(false); setClosing(false); }, 240);
        return () => clearTimeout(t);
      }
    }, [open]);
    if (!mounted) return null;
    return (
      <>
        <style>{`
          @keyframes profExpand {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes profCollapse {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(-8px); }
          }
        `}</style>
        <div style={{
          overflow: "hidden",
          animation: closing
            ? "profCollapse 0.24s ease-in forwards"
            : "profExpand 0.28s cubic-bezier(0,0,0.2,1) forwards",
        }}>
          {children}
        </div>
      </>
    );
  }

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
    // Changelog
    const [showChangelog, setShowChangelog] = useState(false);
    const [changelogText, setChangelogText] = useState("");
    const [changelogSending, setChangelogSending] = useState(false);
    const [changelogSent, setChangelogSent] = useState(false);
    const [changelogEntries, setChangelogEntries] = useState([]);
    const [changelogVersion, setChangelogVersion] = useState("1.1.1");
    const [editingChangelogId, setEditingChangelogId] = useState(null);
    const [editingChangelogText, setEditingChangelogText] = useState("");
    const handleLoadChangelog = async () => {
      const data = await fsGetAllChangelog();
      setChangelogEntries(data);
    };
    const handleSaveChangelog = async () => {
      if (!changelogText.trim()) return;
      setChangelogSending(true);
      const ok = await fsSaveChangelog(
        changelogText.trim(),
        changelogVersion.trim()
      );
      setChangelogSending(false);
      if (ok) {
        setChangelogText("");
        setChangelogSent(true);
        handleLoadChangelog();
      }
    };
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
      // Persist read-up-to timestamp so dot doesn't reappear on reboot
      const fbUserNow = fbAuth.currentUser;
      if (fbUserNow && data.length > 0) {
        await fsMarkFeedbackRead(fbUserNow.uid, data[0].date);
      }
      if (onClearUnread) onClearUnread();
    };
    // Body measurements
    const [showMeasure, setShowMeasure] = useState(false);
    const [editingMeasureIdx, setEditingMeasureIdx] = useState(null); // null=new, n=editing index
    const [mWeight, setMWeight] = useState("");
    const [mMuscle, setMuscle] = useState("");
    const [mFat, setFat] = useState("");
    const [mWaist, setMWaist] = useState("");
    const [mBelly, setMBelly] = useState("");
    const [mHip, setMHip] = useState("");
    const [mChest, setMChest] = useState("");
    const [mArm, setMArm] = useState("");
    const [mThigh, setMThigh] = useState("");
    const [showCircumferences, setShowCircumferences] = useState(false);
    const circumFields = [
      { l: "WAIST (cm)", v: mWaist, set: setMWaist, k: "waist" },
      { l: "BELLY (cm)", v: mBelly, set: setMBelly, k: "belly" },
      { l: "HIP (cm)", v: mHip, set: setMHip, k: "hip" },
      { l: "CHEST (cm)", v: mChest, set: setMChest, k: "chest" },
      { l: "ARM (cm)", v: mArm, set: setMArm, k: "arm" },
      { l: "THIGH (cm)", v: mThigh, set: setMThigh, k: "thigh" },
    ];
    const clearCircum = () => {
      setMWaist("");
      setMBelly("");
      setMHip("");
      setMChest("");
      setMArm("");
      setMThigh("");
    };
    const openMeasureForm = (idx) => {
      if (idx === null) {
        setMWeight("");
        setMuscle("");
        setFat("");
        clearCircum();
      } else {
        const m = measurements[idx];
        setMWeight(m.weight != null ? String(m.weight) : "");
        setMuscle(m.muscle != null ? String(m.muscle) : "");
        setFat(m.fat != null ? String(m.fat) : "");
        setMWaist(m.waist != null ? String(m.waist) : "");
        setMBelly(m.belly != null ? String(m.belly) : "");
        setMHip(m.hip != null ? String(m.hip) : "");
        setMChest(m.chest != null ? String(m.chest) : "");
        setMArm(m.arm != null ? String(m.arm) : "");
        setMThigh(m.thigh != null ? String(m.thigh) : "");
        // auto-open circumferences panel if entry has any
        setShowCircumferences(
          !!(m.waist || m.belly || m.hip || m.chest || m.arm || m.thigh)
        );
      }
      setEditingMeasureIdx(idx);
      setShowMeasure(true);
    };
    const handleSaveMeasurement = () => {
      if (
        !mWeight &&
        !mMuscle &&
        !mFat &&
        !mWaist &&
        !mBelly &&
        !mHip &&
        !mChest &&
        !mArm &&
        !mThigh
      ) {
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
        waist: parseFloat(mWaist) || null,
        belly: parseFloat(mBelly) || null,
        hip: parseFloat(mHip) || null,
        chest: parseFloat(mChest) || null,
        arm: parseFloat(mArm) || null,
        thigh: parseFloat(mThigh) || null,
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
      clearCircum();
      setShowMeasure(false);
      setEditingMeasureIdx(null);
      setShowCircumferences(false);
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
                  background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
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
              <div style={{ fontWeight: 700, fontSize: 17, color: th.text, textAlign: "left" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: th.muted, textAlign: "left" }}>{user.email}</div>
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
          <ProfileSection open={editMode}>
            <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 14 }}>
              <div style={{ ...S.label, marginBottom: 6, textAlign: "left", }}>DISPLAY NAME</div>
              <input
                type="text"
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                style={{ ...S.input, marginBottom: 12 }}
              />
              <div style={{ ...S.label, marginBottom: 6, textAlign: "left", }}>EMAIL</div>
              <input
                type="email"
                value={eEmail}
                onChange={(e) => setEEmail(e.target.value)}
                style={{ ...S.input, marginBottom: 12 }}
              />
              <div style={{ ...S.label, marginBottom: 8, textAlign: "left", }}>
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
              <div style={{ ...S.label, marginBottom: 6, textAlign: "left", }}>
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
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${th.border}` }}>
                <div style={{ fontSize: 10, color: th.dim, letterSpacing: "1.5px", marginBottom: 10 }}> </div>
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
                    
                    // 1. A semi-transparent red background
                    background: "rgba(220, 50, 50, 0.45)", 
                    
                    // 2. The frosted glass blur filters
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)", 
                    
                    // 3. A subtle matching semi-transparent border (replaces th.delB)
                    border: "1px solid rgba(220, 50, 50, 0.3)", 
                    
                    borderRadius: 13,
                    padding: 15,
                    cursor: "pointer",
                    
                    // 4. Keep your dynamic theme text color!
                    color: th.text, 
                    
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "'Outfit',sans-serif",
                    marginBottom: 10,
                  }}
                >
                  DELETE MY ACCOUNT
                </button>
              </div>
            </div>
          </ProfileSection>
        </div>{/* end profile card */}
        {!editMode && (
          <>
            <div style={{ ...S.card, padding: 16, marginBottom: 12 }}>
              <div style={{ ...S.label, marginBottom: 14, textAlign: "left", }}>
                {new Date().getFullYear()} STATS
              </div>
              {(() => {
                const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
                const yrSess = sessions.filter((s) => (s.startTime || 0) >= yearStart);
                const yrVol = yrSess.reduce((a, s) => a + sessionVol(s), 0);
                const yrSets = yrSess.reduce((a, s) => a + (s.doneSets || 0), 0);
                const yrAvgInt = yrSess.length
                  ? (yrSess.reduce((a, s) => a + (s.intensity || 0), 0) / yrSess.length).toFixed(1)
                  : "—";
                const yrAvgDur = yrSess.length
                  ? Math.round(yrSess.reduce((a, s) => a + (s.duration || 0), 0) / yrSess.length) + "min"
                  : "—";
                const yrVolDisplay = yrVol >= 1000
                  ? `${(yrVol / 1000).toFixed(1)}t`
                  : `${Math.round(yrVol).toLocaleString()}kg`;
                const sessWithCals = yrSess.filter((s) => (s.calories || 0) > 0);
                const totalCals = sessWithCals.reduce((a, s) => a + (s.calories || 0), 0);
                const avgCalsPerDay = sessWithCals.length > 0
                  ? Math.round(totalCals / sessWithCals.length).toLocaleString() + " kcal"
                  : "—";
                const tiles = [
                  { v: yrSess.length, l: "SESSIONS" },
                  { v: yrSets.toLocaleString(), l: "TOTAL SETS" },
                  { v: yrAvgInt + "/10", l: "AVG INTENSITY" },
                  { v: yrVolDisplay, l: "VOLUME" },
                  { v: yrAvgDur, l: "AVG DURATION" },
                  { v: avgCalsPerDay, l: "AVG CALS/SESSION" },
                ];
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                    {tiles.map((s) => (
                      <div
                        key={s.l}
                        style={{
                          background: th.sect,
                          borderRadius: 10,
                          padding: "12px 8px",
                          textAlign: "center",
                        }}
                      >
                        <div className="bebas" style={{ fontSize: 22, color: th.accentFg, lineHeight: 1 }}>
                          {s.v}
                        </div>
                        <div style={{ fontSize: 9, color: th.dim, letterSpacing: "1.5px", marginTop: 3 }}>
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
        {/* Body measurements card */}
        <div
          style={{ ...S.card, padding: 0, marginBottom: 12, overflow: "hidden", textAlign: "left", }}
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
              {showMeasure ? "Cancel" : "Log"}
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
                {
                  v: latest.muscle ? latest.muscle + "%" : "—",
                  l: "MUSCLE MASS",
                },
                { v: latest.fat ? latest.fat + "%" : "—", l: "BODY FAT %" },
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
          <ProfileSection open={showMeasure}>
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
                  {
                    l: "MUSCLE MASS (%)",
                    v: mMuscle,
                    set: setMuscle,
                    ph: "e.g. 42",
                  },
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
              {/* Optional circumferences — collapsible */}
              <button
                onClick={() => setShowCircumferences((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: th.accentFg,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "6px 0 10px",
                  textAlign: "left",
                  fontFamily: "'Outfit',sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                {showCircumferences
                  ? "▲ Hide circumferences"
                  : "▼ + Add circumferences (optional)"}
              </button>
              {showCircumferences && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {circumFields.map((f) => (
                    <div key={f.k}>
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
                        placeholder="0"
                        value={f.v}
                        onChange={(e) => f.set(e.target.value)}
                        style={{
                          ...S.input,
                          padding: "10px 10px",
                          fontSize: 15,
                          textAlign: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
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
          </ProfileSection>
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
                      fontSize: 12,
                      color: th.muted,
                      flexShrink: 0,
                      width: 52,
                    }}
                  >
                    {fmtDate(m.date)}
                  </span>
                  <span style={{ fontSize: 12, color: th.sub, flex: 1, textAlign: "left", }}>
                    {m.weight ? m.weight + " kg" : ""}
                    {m.muscle ? ` · ${m.muscle}% muscle` : ""}
                    {m.fat ? ` · ${m.fat}% fat` : ""}
                    {(m.waist ||
                      m.belly ||
                      m.hip ||
                      m.chest ||
                      m.arm ||
                      m.thigh) && (
                      <span style={{ color: th.dim, fontSize: 11 }}>
                        {m.waist ? ` · W:${m.waist}` : ""}
                        {m.belly ? ` B:${m.belly}` : ""}
                        {m.hip ? ` H:${m.hip}` : ""}
                        {m.chest ? ` Ch:${m.chest}` : ""}
                        {m.arm ? ` A:${m.arm}` : ""}
                        {m.thigh ? ` T:${m.thigh}` : ""}
                        {" cm"}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => openMeasureForm(i)}
                    style={{
                      background: "none",
                      border: `1px solid ${th.inputB}`,
                      borderRadius: 6,
                      color: th.muted,
                      cursor: "pointer",
                      fontSize: 12,
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
                      background: "rgba(220, 50, 50, 0.10)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(220, 50, 50, 0.2)",
                      borderRadius: 6,
                      color: th.delText,
                      cursor: "pointer",
                      fontSize: 12,
                      padding: "3px 7px",
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

        {!editMode && (
          <>
            <div style={{ ...S.card, padding: 16, marginBottom: 12, textAlign: "left", }}>
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.text, textAlign: "left", }}>
                    Dark mode
                  </div>
                  <div style={{ fontSize: 11, color: th.muted, marginTop: 2, textAlign: "left", }}>
                    Auto: dark 19:00–06:00
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
        {/* Feedback card */}
        <div style={{ ...S.card, marginBottom: 12, overflow: "hidden", textAlign: "left", }}>
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: th.text, textAlign: "left", }}>
                {isAdmin ? "User Feedback" : "Send Feedback"}
              </div>
              <div style={{ fontSize: 12, color: th.muted, marginTop: 2, textAlign: "left", }}>
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
              {showFeedback ? "Close" : isAdmin ? "View All" : "Send"}
            </button>
          </div>

          <ProfileSection open={showFeedback && !isAdmin}>
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
          </ProfileSection>

          <ProfileSection open={showFeedback && isAdmin}>
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
          </ProfileSection>
        </div>

        {/* Changelog card */}
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
              <div style={{ fontWeight: 700, fontSize: 15, color: th.text, textAlign: "left", }}>
                Change Log
              </div>
              <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>
                {isAdmin ? "Post updates and fixes" : "Latest updates & fixes"}
              </div>
            </div>
            <button
              onClick={() => {
                setShowChangelog((v) => !v);
                if (!showChangelog) handleLoadChangelog();
                setChangelogSent(false);
              }}
              style={{
                background: showChangelog ? th.accentBg : "transparent",
                border: `1px solid ${showChangelog ? th.accentBg : th.inputB}`,
                borderRadius: 9,
                color: showChangelog ? th.accentT : th.muted,
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
              }}
            >
              {showChangelog ? "Close" : isAdmin ? "Manage" : "View"}
            </button>
          </div>

          <ProfileSection open={showChangelog}>
            <div style={{ borderTop: `1px solid ${th.border}`, textAlign: "left", }}>
              {/* Admin post form */}
              {isAdmin && (
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom:
                      changelogEntries.length > 0
                        ? `1px solid ${th.border}`
                        : "none",
                  }}
                >
                  {changelogSent && (
                    <div
                      style={{
                        color: th.accentFg,
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      Posted!
                    </div>
                  )}
                  <input
                    type="text"
                    value={changelogVersion}
                    onChange={(e) => setChangelogVersion(e.target.value)}
                    placeholder="Version (e.g. 1.1.2)"
                    style={{
                      width: "100%",
                      background: th.input,
                      border: `1px solid ${th.inputB}`,
                      borderRadius: 10,
                      padding: "9px 14px",
                      color: th.text,
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "'Outfit',sans-serif",
                      marginBottom: 8,
                      boxSizing: "border-box",
                    }}
                  />
                  <textarea
                    value={changelogText}
                    onChange={(e) => setChangelogText(e.target.value)}
                    placeholder="Describe the update or fixes..."
                    rows={3}
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
                      marginBottom: 10,
                      boxSizing: "border-box",
                    }}
                  />
                  <Btn
                    onClick={handleSaveChangelog}
                    disabled={changelogSending || !changelogText.trim()}
                    style={{ width: "100%", fontSize: 14, padding: "12px" }}
                  >
                    {changelogSending ? "POSTING..." : "POST UPDATE"}
                  </Btn>
                </div>
              )}
              {/* Entries list */}
              {changelogEntries.length === 0 ? (
                <div
                  style={{
                    padding: "16px 18px",
                    fontSize: 13,
                    color: th.muted,
                    textAlign: "center",
                  }}
                >
                  No updates posted yet.
                </div>
              ) : (
                changelogEntries.map((entry, i) => {
                  const isEditingThis = editingChangelogId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      style={{
                        padding: "12px 18px",
                        borderBottom:
                          i < changelogEntries.length - 1
                            ? `1px solid ${th.input}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {entry.version && (
                            <span
                              style={{
                                fontSize: 11,
                                color: th.accentFg,
                                fontWeight: 700,
                              }}
                            >
                              {entry.version}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: th.dim }}>
                            {fmtDate(entry.date)}
                          </span>
                        </div>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: 6 }}>
                            {isEditingThis && (
                              <button
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      "Delete this changelog entry?"
                                    )
                                  )
                                    return;
                                  try {
                                    await deleteDoc(
                                      doc(fbDb, "changelog", entry.id)
                                    );
                                    setChangelogEntries((prev) =>
                                      prev.filter((e) => e.id !== entry.id)
                                    );
                                    setEditingChangelogId(null);
                                    setEditingChangelogText("");
                                  } catch (e) {
                                    console.error("deleteChangelog:", e);
                                  }
                                }}
                                style={{
                                  background: "none",
                                  border: "1px solid #ff6b6b",
                                  borderRadius: 7,
                                  color: "#ff6b6b",
                                  fontSize: 11,
                                  padding: "3px 10px",
                                  cursor: "pointer",
                                  fontFamily: "'Outfit',sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                Delete
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (isEditingThis) {
                                  setEditingChangelogId(null);
                                  setEditingChangelogText("");
                                } else {
                                  setEditingChangelogId(entry.id);
                                  setEditingChangelogText(entry.text);
                                }
                              }}
                              style={{
                                background: "none",
                                border: `1px solid ${th.inputB}`,
                                borderRadius: 7,
                                color: isEditingThis ? th.accentFg : th.muted,
                                fontSize: 11,
                                padding: "3px 10px",
                                cursor: "pointer",
                                fontFamily: "'Outfit',sans-serif",
                                fontWeight: 600,
                              }}
                            >
                              {isEditingThis ? "Cancel" : "Edit"}
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditingThis ? (
                        <div>
                          <textarea
                            value={editingChangelogText}
                            onChange={(e) =>
                              setEditingChangelogText(e.target.value)
                            }
                            rows={3}
                            style={{
                              width: "100%",
                              background: th.input,
                              border: `1px solid ${th.inputB}`,
                              borderRadius: 10,
                              padding: "10px 12px",
                              color: th.text,
                              fontSize: 13,
                              outline: "none",
                              fontFamily: "'Outfit',sans-serif",
                              resize: "none",
                              marginBottom: 8,
                              boxSizing: "border-box",
                            }}
                          />
                          <Btn
                            onClick={async () => {
                              if (!editingChangelogText.trim()) return;
                              const ok = await fsUpdateChangelog(
                                entry.id,
                                editingChangelogText.trim()
                              );
                              if (ok) {
                                setChangelogEntries((prev) =>
                                  prev.map((e) =>
                                    e.id === entry.id
                                      ? {
                                          ...e,
                                          text: editingChangelogText.trim(),
                                        }
                                      : e
                                  )
                                );
                                setEditingChangelogId(null);
                                setEditingChangelogText("");
                              }
                            }}
                            style={{
                              width: "100%",
                              fontSize: 13,
                              padding: "10px",
                            }}
                          >
                            SAVE EDIT
                          </Btn>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: 13,
                            color: th.text,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {entry.text}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ProfileSection>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            
            // 1. A semi-transparent red background
            background: "rgba(220, 50, 50, 0.15)", 
            
            // 2. The frosted glass blur filters
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)", 
            
            // 3. A subtle matching semi-transparent border (replaces th.delB)
            border: "1px solid rgba(220, 50, 50, 0.3)", 
            
            borderRadius: 13,
            padding: 15,
            cursor: "pointer",
            
            // 4. Keep your dynamic theme text color!
            color: th.delText, 
            
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "'Outfit',sans-serif",
            marginBottom: 10,
          }}
        >
          LOG OUT
        </button>
        {/* Version + footer */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              color: th.dim,
              fontSize: 12,
              letterSpacing: "1.5px",
              marginBottom: 4,
            }}
          >
            IRON BODY{" "}
            <span style={{ color: th.accentFg, fontWeight: 700 }}>v1.4.0 (beta)</span>
          </div>
          <div style={{ color: th.dim, fontSize: 11, letterSpacing: "2px" }}>
            DEVELOPED BY AZAD
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════════
    ROOT APP
  ═══════════════════════════════════════════════════════════════════════════════ */
  /* ─── ShortcutDetailView — opens when tapping a shortcut card ───────────────── */
  function ShortcutDetailView({ program, onSave, onStart, onBack }) {
    const th = useTheme();
    const S = useS();
    const [exs, setExs] = useState(() =>
      (program?.exs || []).map((e) => {
        if (e.sets || e.type === "cardio") return e;
        return {
          ...e,
          sets: Array.from({ length: e.s || 4 }, () => ({
            reps: e.r || 10,
            weight: e.w || 20,
          })),
        };
      })
    );
    const [showPicker, setShowPicker] = useState(false);
    const [expandedEx, setExpandedEx] = useState(null);
    const listRef = useRef(null);

    // Auto-save whenever exercises change
    const updateExs = (next) => {
      setExs(next);
      onSave({ ...program, exs: next });
    };

    const { dragIdx, insertIdx, start: dragStart } = useDragSort(exs, updateExs);

    const addEx = (dbId) => {
      const db = DB.find((e) => e.id === dbId);
      const isCardio = db?.type === "cardio";
      updateExs([
        ...exs,
        isCardio
          ? { id: dbId, type: "cardio", duration: 0, calories: 0, intensity: 0 }
          : {
              id: dbId,
              sets: Array.from({ length: 4 }, () => ({ reps: 10, weight: 20 })),
            },
      ]);
    };
    const removeEx = (id) => updateExs(exs.filter((e) => e.id !== id));
    const updateEx = (id, f, val) =>
      updateExs(
        exs.map((e) =>
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
        <div className="slide-up" style={{ paddingBottom: 100, paddingTop: 4, textAlign: "left" }}>
          <div
            style={{
              ...S.label,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>EXERCISES ({exs.length})</span>
            <span
              style={{
                fontSize: 12,
                color: th.dim,
                fontWeight: 400,
                letterSpacing: 0,
              }}
            >
              hold ⠿ to reorder
            </span>
          </div>

          <div ref={listRef}>
            {exs.map((ex, exI) => {
              const isBeingDragged = dragIdx === exI;
              const isOver =
                insertIdx === exI && dragIdx !== null && insertIdx !== dragIdx;
              return (
                <ExerciseEditCard
                  key={ex.id}
                  ex={ex}
                  exI={exI}
                  isOver={isOver}
                  isOpen={expandedEx === ex.id}
                  isDragging={isBeingDragged}
                  onToggleOpen={() =>
                    setExpandedEx(expandedEx === ex.id ? null : ex.id)
                  }
                  onRemoveEx={() => removeEx(ex.id)}
                  onUpdateNumSets={(delta) => {
                    const n = Math.max(
                      1,
                      Math.min(10, (ex.sets || []).length + delta)
                    );
                    const last = (ex.sets || [{}])[
                      (ex.sets || []).length - 1
                    ] || { reps: 10, weight: 20 };
                    const sets =
                      n > (ex.sets || []).length
                        ? [
                            ...(ex.sets || []),
                            ...Array.from(
                              { length: n - (ex.sets || []).length },
                              () => ({ reps: last.reps, weight: last.weight })
                            ),
                          ]
                        : (ex.sets || []).slice(0, n);
                    updateExs(
                      exs.map((e) => (e.id !== ex.id ? e : { ...e, sets }))
                    );
                  }}
                  onUpdateSet={(sIdx, f, v) =>
                    updateExs(
                      exs.map((e) =>
                        e.id !== ex.id
                          ? e
                          : {
                              ...e,
                              sets: (e.sets || []).map((s, i) =>
                                i !== sIdx
                                  ? s
                                  : { ...s, [f]: Math.max(0, parseFloat(v) || 0) }
                              ),
                            }
                      )
                    )
                  }
                  onAddSet={() => {
                    const last = (ex.sets || [{}])[
                      (ex.sets || []).length - 1
                    ] || { reps: 10, weight: 20 };
                    updateExs(
                      exs.map((e) =>
                        e.id !== ex.id
                          ? e
                          : {
                              ...e,
                              sets: [
                                ...(e.sets || []),
                                { reps: last.reps, weight: last.weight },
                              ],
                            }
                      )
                    );
                  }}
                  onRemoveSet={(sIdx) =>
                    updateExs(
                      exs.map((e) =>
                        e.id !== ex.id
                          ? e
                          : {
                              ...e,
                              sets: (e.sets || []).filter((_, i) => i !== sIdx),
                            }
                      )
                    )
                  }
                  onDragStart={dragStart}
                  listRef={listRef}
                />
              );
            })}
            {insertIdx === exs.length && dragIdx !== null && <DropLine />}
          </div>

          {exs.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
              <div className="bebas" style={{ fontSize: 36, color: th.dim }}>
                NO EXERCISES
              </div>
              <div style={{ fontSize: 13, color: th.muted, marginTop: 8 }}>
                Add exercises below
              </div>
            </div>
          )}

          <button
            onClick={() => setShowPicker(true)}
            style={{
              width: "100%",
              background: "none",
              border: `1px dashed ${th.text}`,
              borderRadius: 13,
              padding: 13,
              cursor: "pointer",
              color: th.muted,
              fontSize: 15,
              fontFamily: "'Outfit',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span style={{ color: th.accentFg, fontSize: 20, fontWeight: 700 }}>
              +
            </span>{" "}
            Add Exercise
          </button>
        </div>

        <div style={{ position: "sticky", bottom: 0, padding: "12px 0 20px" }}>
        <Btn
  onClick={() => onStart({ ...program, exs })}
  disabled={exs.length === 0}
  style={{ 
    width: "100%", 
    fontSize: 20, 
    padding: "15px",
    
    // 1. Semi-transparent background with logic for the disabled state
    background: exs.length === 0 ? "rgba(200,240,48,0.2)" : "rgba(200,240,48,0.85)",
    
    // 2. The frosted glass blur effect
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(10px)",
  }}
>
  START WORKOUT &rarr;
</Btn>
        </div>
      </>
    );
  }

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
      Promise.all([fsGetAllFeedback(), fsGetSettings(user.id)])
        .then(([items, fsSet]) => {
          const lastRead = fsSet?.lastReadFeedback || 0;
          setUnreadFeedback(items.filter((f) => f.date > lastRead).length);
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
    const [selShortcut, setSelShortcut] = useState(null); // program opened from shortcuts
    const [showCal, setShowCal] = useState(false);
    const [calOffset, setCalOffset] = useState(0); // months from current, 0=now
    const [calDir, setCalDir] = useState(0); // -1=going back, +1=going fwd
    const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1 | 0
    const countdownDataRef = useRef(null); // stores workout data during countdown
    const [calClosing, setCalClosing] = useState(false);
    const closeCal = () => { setCalClosing(true); setTimeout(() => { setShowCal(false); setCalClosing(false); }, 200); };
    const [measurements, setMeasurements] = useState([]);
    const [paused, setPaused] = useState(false);
    const [pillPressing, setPillPressing] = useState(false);
    const [workoutExiting, setWorkoutExiting] = useState(false);
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
          <div style={{ position: "fixed", inset: 0, background: "#0a0a0c", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {/* Gym photo — same as sign-in */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80)",
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "brightness(0.18)",
            }} />
            {/* Bottom lime glow — same as sign-in */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(200,240,48,0.06), transparent)",
            }} />
            {/* Logo — identical to AuthView */}
            <div style={{ position: "relative", textAlign: "left", padding: "0 28px", width: "100%", maxWidth: 360, animation: "splashIn 0.55s cubic-bezier(0.34,1.2,0.64,1) both" }}>
              <style>{`
                @keyframes splashIn {
                  from { opacity: 0; transform: scale(0.88) translateY(20px); }
                  to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes splashOut {
                  from { opacity: 1; }
                  to   { opacity: 0; }
                }
              `}</style>
              <div className="bebas" style={{ fontSize: 70, color: "#c8f030", lineHeight: 0.85, marginBottom: 8 }}>
                IRON<br />BODY
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 0, letterSpacing: "3px", fontFamily: "'Outfit',sans-serif" }}>
                TRACK · LIFT · PROGRESS
              </div>
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
      // Convert program exs (new per-set format) to workout exercises and start directly
      const exercises = prog.exs
        .map((te) => {
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
                  duration: 0,
                  distance: 0,
                  calories: 0,
                  intensity: 0,
                },
              ],
            };
          }
          // te.sets is [{reps, weight}] — expand to full workout set objects
          const rawSets =
            te.sets ||
            Array.from({ length: te.s || 4 }, () => ({
              reps: te.r || 10,
              weight: te.w || 20,
            }));
          return {
            uid: uid(),
            exId: db.id,
            name: db.name,
            muscle: db.muscle,
            group: db.group,
            type: "strength",
            sets: rawSets.map((s, i) => ({
              i,
              reps: s.reps,
              weight: s.weight,
              done: false,
            })),
          };
        })
        .filter(Boolean);
      handleBeginWorkout({ name: prog.name, exercises, progId: prog.id || null });
    };
    const startWorkoutAfterCountdown = (data) => {
      const now = Date.now();
      const session = {
        id: now,
        name: data.name,
        startTime: now,
        exercises: data.exercises,
        progId: data.progId || null,
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
    const handleBeginWorkout = (data) => {
      countdownDataRef.current = data;
      setCountdown(3);
      let n = 3;
      const tick = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearInterval(tick);
          setCountdown(null);
          startWorkoutAfterCountdown(countdownDataRef.current);
        } else {
          setCountdown(n);
        }
      }, 1000);
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
      if (!window.confirm("Delete this session? This cannot be undone.")) return;
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
      // Sync last-session weights/reps/sets back to the source program
      if (active?.progId) {
        const updatedPrograms = programs.map((p) => {
          if (p.id !== active.progId) return p;
          const updatedExs = p.exs.map((pe) => {
            const workoutEx = finished.exercises.find((we) => we.exId === pe.id);
            if (!workoutEx || workoutEx.type === "cardio") return pe;
            const doneSets = workoutEx.sets.filter((st) => st.done);
            if (!doneSets.length) return pe;
            // Write individual set data (new format)
            const newSets = doneSets.map((st) => ({
              reps: st.reps || 0,
              weight: st.weight || 0,
            }));
            return { ...pe, sets: newSets };
          });
          // Append any new non-cardio exercises added ad-hoc during the session
          const progExIds = new Set(p.exs.map((pe) => pe.id));
          const newlyAdded = finished.exercises
            .filter((we) => !progExIds.has(we.exId) && we.type !== "cardio")
            .map((we) => {
              const doneSets = we.sets.filter((st) => st.done);
              const lastDone = doneSets[doneSets.length - 1] || {};
              return {
                id: we.exId,
                s: we.sets.length,
                r: lastDone.reps  || 10,
                w: lastDone.weight || 20,
                sets: doneSets.map((st) => ({ reps: st.reps || 0, weight: st.weight || 0 })),
              };
            });
          return { ...p, exs: [...updatedExs, ...newlyAdded] };
        });
        savePrograms(updatedPrograms);
      }
      // Push to Firestore — await so we know if it succeeded
      const ok = await fsAddSession(user.id, s);
      if (!ok)
        console.warn(
          "Session may not have synced to Firestore — will retry on next sync"
        );
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
      "shortcutDetail",
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
            width="22"
            height="22"
            viewBox="0 0 26 26"
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
        ? "url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&h=1600&fit=crop) center/cover no-repeat"
        : "url(https://images.unsplash.com/photo-1683889843123-5eca2abfd882?q=80&w=1920&auto=format&fit=crop&w=800&h=1600&fit=crop) center/cover no-repeat";
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
                      textAlign: "left",
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
                    <span style={{ fontSize: 15, color: th.muted }}>
                      {wDoneSets}/{wTotalSets} sets
                    </span>
                    <span
                      style={{
                        color: paused ? "#fd9644" : th.accentFg,
                        fontWeight: 700,
                        fontSize: 18,
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
                    onClick={() => {
                      if (
                        !window.confirm("Finish this workout and save results?")
                      )
                        return;
                      handleFinishWorkout(active.exercises);
                    }}
                    style={{
                      background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
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

          {/* ── Floating pill "workout in progress" — hovers above nav bar ── */}
          {active && view !== "workout" && (
            <div
              onClick={() => {
                if (pillPressing) return;
                setPillPressing(true);
                setTimeout(() => {
                  setPillPressing(false);
                  setView("workout");
                }, 220);
              }}
              style={{
                position: "absolute",
                bottom: 88,
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(80% - 90px)",
                maxWidth: 360,
                zIndex: 15,
                background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: 50,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 14px 6px 16px",
                gap: 10,
                animation: pillPressing
                  ? "pillPress 0.22s cubic-bezier(0.4,0,1,1) forwards"
                  : "pillFadeIn 0.35s cubic-bezier(0,0,0.2,1) forwards",
              }}
            >
              <style>{`
                @keyframes pillFadeIn {
                  from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.94); }
                  to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
                }
                @keyframes pillPress {
                  0%   { transform: translateX(-50%) translateY(0) scale(1);    opacity: 1; }
                  40%  { transform: translateX(-50%) translateY(2px) scale(0.95); opacity: 0.85; }
                  100% { transform: translateX(-50%) translateY(6px) scale(0.9);  opacity: 0; }
                }
              `}</style>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: th.accentT, fontWeight: 700, fontSize: 10, letterSpacing: "1.5px", whiteSpace: "nowrap" }}>
                  WORKOUT IN PROGRESS
                </div>
                <div style={{ color: th.accentT, opacity: 0.7, fontSize: 11, marginTop: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {active.name} · {wDoneSets}/{wTotalSets} sets
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span className="bebas" style={{ color: th.accentT, fontSize: 15, letterSpacing: 1 }}>
                  {fmtTime(elapsed)}
                </span>
                <span style={{ color: th.accentT, fontSize: 16, fontWeight: 700 }}>→</span>
              </div>
            </div>
          )}

          {/* ── Universal locked header — floats over scroll with gradient fade ── */}
          {view !== "workout" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              {/* Solid header background behind text */}
              <div style={{
                background: `color-mix(in srgb, ${th.bg} 25%, transparent)`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)", // Crucial for Safari compatibility
                padding: "14px 16px 1px",
                pointerEvents: "auto",
              }}>
              <div style={{ pointerEvents: "auto" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 32,
                }}
              >
                {/* Back button — shown for sub-views */}
                {[
                  "create",
                  "editProgram",
                  "sessionDetail",
                  "shortcutDetail",
                ].includes(view) && (
                  <button
                    onClick={() => {
                      if (view === "sessionDetail")
                        setView(selSessionOrigin || "history");
                      else if (view === "editProgram") setView("programs");
                      else if (view === "create") setView("home");
                      else if (view === "shortcutDetail") setView("home");
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
                    fontSize: 40,
                    letterSpacing: 2,
                    color: th.text,
                    lineHeight: 1,
                    flex: 1,
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {view === "home"
                    ? "HOME"
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
                    : view === "shortcutDetail"
                    ? selShortcut?.name || "SHORTCUT"
                    : ""}
                </div>
                {/* Date — only shown on Home tab, top-right of header */}
                {view === "home" && (
                  <div
                    onClick={() => { setCalOffset(0); setShowCal(true); setCalClosing(false); }}
                    style={{ textAlign: "right", flexShrink: 0, marginLeft: 20, cursor: "pointer" }}
                  >
                    <div
                      style={{
                        fontSize: 15,
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
                        fontSize: 13,
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
                      background: `color-mix(in srgb, ${th.accentBg} 80%, transparent)`,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
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
                      transform: "translateY(-4px)",
                    }}
                  >
                    + NEW
                  </button>
                )}

              </div>
              </div>
              </div>
              {/* Pure gradient fade strip — no content, just dissolves edge */}
              <div style={{
                height: 0,
                background: `linear-gradient(to bottom, ${th.bg}, transparent)`,
                pointerEvents: "none",
              }} />
            </div>
          )}

          {/* ── Scrollable content ── */}
          <style>{`
            @keyframes workoutFadeIn {
              from { opacity: 0; transform: translateY(18px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0)    scale(1); }
            }
            @keyframes completeFadeIn {
              from { opacity: 0; transform: translateY(24px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes pipExit {
              from { opacity: 1; transform: translateY(0)   scale(1); }
              to   { opacity: 0; transform: translateY(10px) scale(0.97); }
            }
          `}</style>
          <div
            key={view}
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "68px 16px 0",
              minHeight: 0,
              animation:
                workoutExiting      ? "pipExit 0.32s cubic-bezier(0.4,0,1,1) forwards" :
                view === "workout"  ? "workoutFadeIn 0.45s cubic-bezier(0,0,0.2,1) forwards" :
                view === "complete" ? "completeFadeIn 0.4s ease-out forwards" :
                undefined,
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
                onOpenShortcut={(p) => {
                  setSelShortcut(p);
                  setView("shortcutDetail");
                }}
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
                onMinimize={() => {
                  setWorkoutExiting(true);
                  setTimeout(() => {
                    setWorkoutExiting(false);
                    setView("home");
                  }, 320);
                }}
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
            {view === "shortcutDetail" && selShortcut && (
              <ShortcutDetailView
                program={selShortcut}
                onSave={(updated) => {
                  savePrograms(
                    programs.map((x) => (x.id === updated.id ? updated : x))
                  );
                  setSelShortcut(updated);
                }}
                onStart={(p) => {
                  setView("home");
                  handleTemplate(p);
                }}
                onBack={() => setView("home")}
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
              position: "absolute",
              bottom: 20, // Lifts it off the bottom edge
              left: 24,   // Pulls it in from the left
              right: 24,  // Pulls it in from the right
              borderRadius: 200, // Creates the rounded pill shape
              display: "flex",
              background: `color-mix(in srgb, ${th.nav} 30%, transparent)`, 
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: `1px solid ${th.navB}`, // Changed from borderTop to a full border
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)", // The shadow makes it float!
              zIndex: 10,
              overflow: "hidden", // Crucial: Keeps the inner buttons from poking outside the rounded corners
            }}
            >
              {NAV.map((tab) => {
                const isActive =
                  view === tab.id || (view === "workout" && tab.id === "home");
                  const col = isActive ? th.accentFg : th.navInactive;
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
                      padding: "10px 0 10px",
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        marginTop: -1,
                      }}
                    >
                      {tab.icon(col, user?.email === "freeazadbhos@gmail.com")}
                      <span>{tab.label}</span>
                    </div>
                    {tab.id === "home" && active && view !== "workout" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 5,
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
        {/* ── Calendar overlay ── */}
        {showCal && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => closeCal()}
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(2px)",
              }}
            />
            {/* Popup — floats near the date (top-right), scales up from there */}
            <div
              style={{
                position: "fixed",
                top: 52,
                right: 12,
                width: 340,
                background: `color-mix(in srgb, ${th.card} 45%, transparent)`,
                backdropFilter: "blur(12px) brightness(1.9)",
                WebkitBackdropFilter: "blur(12px) brightness(1.3)",
                borderRadius: 36,
                zIndex: 201,
                padding: "16px 16px 18px",
                minHeight: 320,
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                transformOrigin: "top right",
                animation: calClosing ? "calClose 0.2s ease-in forwards" : "calPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
                touchAction: "pan-y",
              }}
              onTouchStart={(e) => { e.currentTarget.dataset.sx = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const sx = parseFloat(e.currentTarget.dataset.sx || "0");
                const dx = e.changedTouches[0].clientX - sx;
                const earliest = sessions.length ? new Date(Math.min(...sessions.map(s => s.startTime || Date.now()))) : new Date();
                const minOff = (earliest.getFullYear() - new Date().getFullYear()) * 12 + earliest.getMonth() - new Date().getMonth();
                if (dx > 40 && calOffset > minOff) { setCalDir(-1); setCalOffset(o => o - 1); }
                if (dx < -40 && calOffset < 0) { setCalDir(1); setCalOffset(o => o + 1); }
              }}
            >
              <style>{`
                @keyframes calPop {
                  from { opacity: 0; transform: scale(0.5); }
                  to   { opacity: 1; transform: scale(1); }
                }
                @keyframes calClose {
                  from { opacity: 1; transform: scale(1); }
                  to   { opacity: 0; transform: scale(0.5); }
                }
                @keyframes calSlideInLeft {
                  from { opacity: 0; transform: translateX(30px); }
                  to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes calSlideInRight {
                  from { opacity: 0; transform: translateX(-30px); }
                  to   { opacity: 1; transform: translateX(0); }
                }
              `}</style>
              {(() => {
                // Determine earliest month with sessions
                const earliest = sessions.length
                  ? new Date(Math.min(...sessions.map((s) => s.startTime || Date.now())))
                  : new Date();
                const minOffset = (earliest.getFullYear() - new Date().getFullYear()) * 12 + earliest.getMonth() - new Date().getMonth();
                const canGoBack = calOffset > minOffset;
                const canGoFwd  = calOffset < 0;

                const base = new Date();
                base.setDate(1);
                base.setMonth(base.getMonth() + calOffset);
                const year  = base.getFullYear();
                const month = base.getMonth();
                const monthName = base.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();

                // Build maps: day → session types
                const dayTypes = {};
                sessions.forEach((s) => {
                  const d = new Date(s.startTime || 0);
                  if (d.getFullYear() !== year || d.getMonth() !== month) return;
                  const day = d.getDate();
                  const hasCardio   = (s.exercises || []).some((e) => e.type === "cardio");
                  const hasStrength = (s.exercises || []).some((e) => e.type !== "cardio");
                  if (!dayTypes[day]) dayTypes[day] = { cardio: false, strength: false };
                  if (hasCardio) dayTypes[day].cardio = true;
                  if (hasStrength) dayTypes[day].strength = true;
                });

                // Monday-first: shift Sunday (0) → 6, Mon (1) → 0, etc.
                const rawDow = new Date(year, month, 1).getDay();
                const firstDow = rawDow === 0 ? 6 : rawDow - 1;
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const now = new Date();
                const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
                const todayDate = now.getDate();
                const cells = [];
                for (let i = 0; i < firstDow; i++) cells.push(null);
                for (let d = 1; d <= daysInMonth; d++) cells.push(d);

                const STRENGTH_COL = "#c8f030";
                const CARDIO_COL   = "#4ecdc4";
                const BOTH_COL     = "#fd9644";

                return (
                  <>
                    {/* Month nav header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <button
                        onClick={() => { if (!canGoBack) return; setCalDir(-1); setCalOffset(o => o - 1); }}
                        style={{ background: "none", border: "none", color: canGoBack ? th.text : th.inputB, fontSize: 36, cursor: canGoBack ? "pointer" : "default", padding: "0 4px" }}
                      >‹</button>
                      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", color: th.sub }}>{monthName}</div>
                      <button
                        onClick={() => { if (!canGoFwd) return; setCalDir(1); setCalOffset(o => o + 1); }}
                        style={{ background: "none", border: "none", color: canGoFwd ? th.text : th.inputB, fontSize: 36, cursor: canGoFwd ? "pointer" : "default", padding: "0 4px" }}
                      >›</button>
                    </div>
                    <div key={calOffset} style={{ overflow: "hidden", animation: calDir < 0 ? "calSlideInRight 0.22s ease-out" : "calSlideInLeft 0.22s ease-out" }}>
                    {/* Day-of-week headers Mon–Sun */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <div key={i} style={{ textAlign: "center", fontSize: 13, color: th.dim, fontWeight: 700 }}>{d}</div>
                      ))}
                    </div>
                    {/* Day cells */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {cells.map((day, i) => {
                        if (!day) return <div key={i} />;
                        const isToday = isCurrentMonth && day === todayDate;
                        const t = dayTypes[day];
                        const hasBoth = t?.strength && t?.cardio;
                        const bg = hasBoth ? BOTH_COL : t?.strength ? STRENGTH_COL : t?.cardio ? CARDIO_COL : "transparent";
                        const isActive = !!t;
                        return (
                          <div key={i} style={{
                            aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "50%", background: bg,
                            border: isToday && !isActive ? `1.5px solid ${th.inputB}` : "none",
                            fontSize: 12, fontWeight: isActive || isToday ? 700 : 400,
                            color: isActive ? "#080809" : isToday ? th.text : th.muted,
                          }}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      {[
                        { col: STRENGTH_COL, label: "Resistance" },
                        { col: CARDIO_COL,   label: "Cardio" },
                        { col: BOTH_COL,     label: "Mix" },
                      ].map(({ col, label }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
                          <span style={{ fontSize: 11, color: th.muted }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  </>
                );
              })()}
            </div> 
          </>
        )}

      {/* ── Countdown overlay ── */}
      {countdown !== null && (() => {
        const quoteIdx = Math.floor(Date.now() / 10000) % GREETINGS.length;
        const quote = GREETINGS[quoteIdx];
        const bgUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80";
        return (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 500,
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "countdownFade 0.3s ease-out",
            }}
          >
            <style>{`
              @keyframes countdownFade {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              @keyframes countdownPop {
                0%   { transform: scale(0.4); opacity: 0; }
                60%  { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes countdownExit {
                0%   { transform: scale(1); opacity: 1; }
                100% { transform: scale(2.5); opacity: 0; }
              }
            `}</style>
            {/* Dark overlay for readability */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,9,0.72)" }} />
            {/* Content */}
            <div style={{ position: "relative", textAlign: "center", padding: "0 32px" }}>
              {/* IRON BODY logo */}
              <div className="bebas" style={{ fontSize: 18, letterSpacing: 6, color: "#c8f030", marginBottom: 40, opacity: 0.8 }}>
                IRON BODY
              </div>
              {/* Countdown number */}
              <div
                key={countdown}
                className="bebas"
                style={{
                  fontSize: 160,
                  lineHeight: 1,
                  color: countdown === 1 ? "#c8f030" : "#fff",
                  animation: "countdownPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
                  textShadow: countdown === 1 ? "0 0 60px rgba(200,240,48,0.6)" : "0 0 40px rgba(255,255,255,0.2)",
                }}
              >
                {countdown}
              </div>
              {/* Quote */}
              <div style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.7)",
                fontStyle: "italic",
                marginTop: 40,
                lineHeight: 1.5,
                maxWidth: 280,
                margin: "40px auto 0",
              }}>
                "{quote}"
              </div>
            </div>
          </div>
        );
      })()}
      </ThemeCtx.Provider>
    );
  }
