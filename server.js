
const express = require("express");
const admin = require("firebase-admin");
const session = require("express-session");
const path = require("path");

const app = express();

// ======================================================
// 🔥 FIREBASE SETUP
// Supports Vercel environment variables and local JSON key
// ======================================================

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    // Production: use Vercel environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    console.log("Firebase initialized using environment variables.");
  } else if (process.env.VERCEL) {
    // Do not silently use a local JSON file on Vercel
    throw new Error(
      "Firebase credentials are missing. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel."
    );
  } else {
    // Local development: use your existing JSON key
    const serviceAccount = require("./firebase-key.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized using firebase-key.json.");
  }
}

const db = admin.firestore();

// ======================================================
// 🧠 EJS VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================================================
// 📦 MIDDLEWARES
// ======================================================

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======================================================
// 🔐 SESSION
// ======================================================

const isProduction = process.env.VERCEL === "1" || !!process.env.VERCEL;

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is missing. Configure it in Vercel Environment Variables."
  );
}

app.set("trust proxy", 1);

app.use(
  session({
    name: "hostel_admin_session",
    secret: process.env.SESSION_SECRET || "local-development-only-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ======================================================
// 🔗 ADMIN ROUTES
// ======================================================

const adminRoutes = require("./routes/adminRoutes");

app.use("/", adminRoutes);

// ======================================================
// ❌ 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// ======================================================
// ⚠️ ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).send("Internal Server Error");
});

// ======================================================
// 🚀 START SERVER
// Local development uses port 3001.
// Vercel imports the app as a serverless handler.
// ======================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Admin Panel running on http://localhost:${PORT}`);
  });
}

module.exports = app;
