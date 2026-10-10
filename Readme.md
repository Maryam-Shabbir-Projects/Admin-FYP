# how to run
npm install

npm init -y

npm install express firebase-admin express-session body-parser ejs

node server.js

http://localhost:3001



#  firebase-key.json must be in the same folder as server.js
project/
├── server.js
├── firebase-key.json   ← must be here
├── routes/
├── views/
└── public/

# Routes
GET  /                    (Redirects to login — No login required)
GET  /login               (Displays admin login page — No login required)
POST /login               (Processes admin login — No login required)
GET  /dashboard           (Displays admin dashboard — Login required)
GET  /approve/:id         (Approves a hostel — Login required)
GET  /reject/:id          (Rejects/deletes a hostel — Login required)
GET  /hostel/:id          (Views hostel details — Login required)
GET  /approve-edit/:id    (Approves hostel edit request — Login required)
GET  /reject-edit/:id     (Rejects hostel edit request — Login required)

# login 
username = admin
 password = 1234