const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

// ======================================================
// LOGIN PAGE
// ======================================================

router.get("/", (req, res) => {
res.render("login");
});

// ======================================================
// LOGIN POST
// ======================================================

router.post("/login", (req, res) => {

const { username, password } = req.body;

if (username === "admin" && password === "1234") {


req.session.admin = true;

return res.redirect("/dashboard");


}

res.send("Invalid credentials");
});

// ======================================================
// ADMIN AUTH CHECK
// ======================================================

function isAdmin(req, res, next) {

if (req.session && req.session.admin) {
return next();
}

return res.redirect("/login");
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get("/dashboard", isAdmin, async (req, res) => {

try {


// ==========================================
// PENDING HOSTELS
// ==========================================

const pendingSnap = await db
  .collection("hostels")
  .where("status", "==", "pending")
  .get();


// ==========================================
// APPROVED HOSTELS
// ==========================================

const approvedSnap = await db
  .collection("hostels")
  .where("status", "==", "approved")
  .get();


// ==========================================
// UPDATE PENDING HOSTELS
// ==========================================

const updateSnap = await db
  .collection("hostels")
  .where("status", "==", "update_pending")
  .get();


// ==========================================
// CONVERT APPROVED HOSTELS TO ARRAY
// ==========================================

const approvedHostels = approvedSnap.docs.map((doc) => {

  return {
    id: doc.id,
    ...doc.data()
  };

});


// ==========================================
// RENDER DASHBOARD
// ==========================================

res.render("dashboard", {

  pending: pendingSnap.size,

  approved: approvedSnap.size,

  updatePending: updateSnap.size,

  approvedHostels: approvedHostels

});


} catch (err) {


console.log("Dashboard Error:", err);

res.render("dashboard", {

  pending: 0,

  approved: 0,

  updatePending: 0,

  approvedHostels: []

});


}

});

// ======================================================
// ALL PENDING HOSTELS
// ======================================================

router.get("/pending-hostels", isAdmin, async (req, res) => {

try {


const snapshot = await db
  .collection("hostels")
  .where("status", "==", "pending")
  .get();


const pendingHostels = snapshot.docs.map((doc) => {

  return {
    id: doc.id,
    ...doc.data()
  };

});


res.render("pending_hostels", {

  pendingHostels: pendingHostels

});


} catch (err) {


console.log("Pending Hostels Error:", err);

res.render("pending_hostels", {

  pendingHostels: []

});


}

});

// ======================================================
// ALL APPROVED HOSTELS
// ======================================================

router.get("/approved-hostels", isAdmin, async (req, res) => {

try {


const snapshot = await db
  .collection("hostels")
  .where("status", "==", "approved")
  .get();


const approvedHostels = snapshot.docs.map((doc) => {

  return {
    id: doc.id,
    ...doc.data()
  };

});


res.render("approved_hostels", {

  approvedHostels: approvedHostels

});


} catch (err) {


console.log("Approved Hostels Error:", err);

res.render("approved_hostels", {

  approvedHostels: []

});


}

});

// ======================================================
// ALL UPDATE REQUESTS
// ======================================================

router.get("/update-pending", isAdmin, async (req, res) => {

try {


const snapshot = await db
  .collection("hostels")
  .where("status", "==", "update_pending")
  .get();


const updatePendingHostels = snapshot.docs.map((doc) => {

  return {
    id: doc.id,
    ...doc.data()
  };

});


res.render("update_pending", {

  updatePendingHostels: updatePendingHostels

});


} catch (err) {


console.log("Update Pending Error:", err);

res.render("update_pending", {

  updatePendingHostels: []

});


}

});

// ======================================================
// HOSTEL DETAIL PAGE
// ======================================================

router.get("/hostel-detail/:id", isAdmin, async (req, res) => {

try {


const doc = await db
  .collection("hostels")
  .doc(req.params.id)
  .get();


if (!doc.exists) {

  return res.status(404).send("Hostel not found");

}


const hostel = {

  id: doc.id,

  ...doc.data()

};


res.render("hostel_detail", {

  hostel: hostel

});


} catch (err) {


console.log("Hostel Detail Error:", err);

res.status(500).send("Error loading hostel details");


}

});

// ======================================================
// OLD HOSTEL MAP PAGE
// ======================================================

router.get("/hostel/:id", isAdmin, async (req, res) => {

try {


const doc = await db
  .collection("hostels")
  .doc(req.params.id)
  .get();


if (!doc.exists) {

  return res.send("Hostel not found");

}


res.render("hostel_map", {

  hostel: {

    id: doc.id,

    ...doc.data()

  }

});


} catch (err) {


console.log("Hostel Map Error:", err);

res.send("Error loading hostel");


}

});

// ======================================================
// APPROVE NEW HOSTEL
// ======================================================

router.get("/approve/:id", isAdmin, async (req, res) => {

try {


const docRef = db
  .collection("hostels")
  .doc(req.params.id);


const doc = await docRef.get();


if (!doc.exists) {

  return res.status(404).send("Hostel not found");

}


await docRef.update({

  status: "approved",

  updatedAt: new Date()

});


res.redirect("/dashboard");


} catch (err) {


console.log("Approve Hostel Error:", err);

res.send("Error approving hostel");


}

});

// ======================================================
// REJECT NEW HOSTEL
// ======================================================

router.get("/reject/:id", isAdmin, async (req, res) => {

try {


const docRef = db
  .collection("hostels")
  .doc(req.params.id);


const doc = await docRef.get();


if (!doc.exists) {

  return res.status(404).send("Hostel not found");

}


await docRef.update({

  status: "rejected",

  rejectedAt: new Date()

});


res.redirect("/dashboard");


} catch (err) {


console.log("Reject Hostel Error:", err);

res.send("Error rejecting hostel");


}

});

// ======================================================
// DELETE HOSTEL
// ======================================================

router.get("/delete/:id", isAdmin, async (req, res) => {

try {


const docRef = db
  .collection("hostels")
  .doc(req.params.id);


const doc = await docRef.get();


if (!doc.exists) {

  return res.status(404).send("Hostel not found");

}


await docRef.delete();


res.redirect("/dashboard");


} catch (err) {


console.log("Delete Hostel Error:", err);

res.send("Error deleting hostel");


}

});

// ======================================================
// APPROVE EDIT REQUEST
// ======================================================

router.get("/approve-edit/:id", isAdmin, async (req, res) => {

try {


const docRef = db
  .collection("hostels")
  .doc(req.params.id);


const doc = await docRef.get();


if (!doc.exists) {

  return res.send("Hostel not found");

}


const data = doc.data();


if (!data.pendingUpdate) {

  return res.send("No edit request found");

}


// ==========================================
// CLEAN PENDING UPDATE DATA
// ==========================================

const cleanData = {};


Object.keys(data.pendingUpdate).forEach((key) => {

  const value = data.pendingUpdate[key];


  if (value !== undefined && value !== null) {

    cleanData[key] = value;

  }

});


// ==========================================
// LIMIT IMAGES TO 3
// ==========================================

if (Array.isArray(cleanData.images)) {

  cleanData.images = cleanData.images.slice(0, 3);

}


// ==========================================
// APPLY CHANGES
// ==========================================

await docRef.update({

  ...cleanData,

  pendingUpdate: null,

  status: "approved",

  updatedAt: new Date()

});


// ==========================================
// RETURN TO UPDATE REQUESTS
// ==========================================

res.redirect("/update-pending");


} catch (err) {


console.log("Approve Edit Error:", err);

res.send("Error approving edit");


}

});

// ======================================================
// REJECT EDIT REQUEST
// ======================================================

router.get("/reject-edit/:id", isAdmin, async (req, res) => {

try {


const docRef = db
  .collection("hostels")
  .doc(req.params.id);


const doc = await docRef.get();


if (!doc.exists) {

  return res.send("Hostel not found");

}


const data = doc.data();


if (!data.pendingUpdate) {

  return res.send("No edit request found");

}


// ==========================================
// REMOVE PENDING CHANGES
// KEEP OLD HOSTEL DATA
// ==========================================

await docRef.update({

  pendingUpdate: null,

  status: "approved",

  updatedAt: new Date()

});


// ==========================================
// RETURN TO UPDATE REQUESTS
// ==========================================

res.redirect("/update-pending");


} catch (err) {


console.log("Reject Edit Error:", err);

res.send("Error rejecting edit");


}

});

// ======================================================
// LOGOUT
// ======================================================

router.get("/logout", isAdmin, (req, res) => {

req.session.destroy((err) => {


if (err) {

  console.log("Logout Error:", err);

  return res.send("Error logging out");

}

res.redirect("/login");


});

});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
