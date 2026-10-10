const express = require("express");
const admin = require("firebase-admin");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(express.static('public'));
// ======================================================
// 🔥 FIREBASE SETUP
// ======================================================

const serviceAccount = require("./firebase-key.json");

if (!admin.apps.length) {
admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});
}

const db = admin.firestore();

// ======================================================
// 🧠 EJS VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");

app.set(
"views",
path.join(__dirname, "views")
);

// ======================================================
// 📦 MIDDLEWARES
// ======================================================

// Parse HTML form data
app.use(
bodyParser.urlencoded({
extended: true
})
);

// Parse JSON data
app.use(
bodyParser.json()
);

// Serve files from public folder
app.use(
express.static(
path.join(__dirname, "public")
)
);

// ======================================================
// 🔐 SESSION
// ======================================================

app.use(
session({
secret: "admin_secret_key",


resave: false,

saveUninitialized: false,

cookie: {
  maxAge: 1000 * 60 * 60 * 24
}


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

res.status(404).send(
"404 - Page Not Found"
);

});

// ======================================================
// 🚀 START SERVER
// ======================================================

const PORT = 3001;

app.listen(PORT, () => {

console.log(
`🔥 Admin Panel running on http://localhost:${PORT}`
);

});
