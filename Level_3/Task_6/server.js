const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const connectDB = require("./db");

const app = express();
const PORT = 3000;

let db;

// Connect SQLite Database
(async () => {
    db = await connectDB();
})();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session Middleware
app.use(session({
    secret: "cognifyz_secret_key",
    resave: false,
    saveUninitialized: false
}));

// ================= WEBSITE ROUTES =================

// Home
app.get("/", (req, res) => {
    res.render("index");
});

// About
app.get("/about", (req, res) => {
    res.render("about");
});

// Contact
app.get("/contact", (req, res) => {
    res.render("contact");
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});
// ================= REGISTRATION =================

app.post("/submit", async (req, res) => {

    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {

        return res.send("All fields are required.");

    }

    if (password !== confirmPassword) {

        return res.send("Passwords do not match.");

    }

    // Check if email already exists
    const existingUser = await db.get(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (existingUser) {

        return res.send("Email already registered.");

    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User
    await db.run(

        `INSERT INTO users(name,email,phone,password)
         VALUES(?,?,?,?)`,

        [name, email, phone, hashedPassword]

    );

    res.render("success", {

        name,
        email,
        phone

    });

});

// ================= LOGIN =================

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await db.get(

        "SELECT * FROM users WHERE email=?",

        [email]

    );

    if (!user) {

        return res.send("User not found.");

    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {

        return res.send("Invalid Password.");

    }

    req.session.user = user;

    res.redirect("/dashboard");

});
// ================= DASHBOARD =================

app.get("/dashboard", (req, res) => {

    if (!req.session.user) {

        return res.redirect("/login");

    }

    res.render("dashboard", {

        user: req.session.user

    });

});

// ================= LOGOUT =================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login");

    });

});

// ================= REST API =================

// GET All Users
app.get("/api/users", async (req, res) => {

    const users = await db.all("SELECT id, name, email, phone FROM users");

    res.json(users);

});

// GET User By ID
app.get("/api/users/:id", async (req, res) => {

    const user = await db.get(

        "SELECT id, name, email, phone FROM users WHERE id=?",

        [req.params.id]

    );

    if (!user) {

        return res.status(404).json({

            message: "User not found"

        });

    }

    res.json(user);

});

// POST User
app.post("/api/users", async (req, res) => {

    const { name, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(

        `INSERT INTO users(name,email,phone,password)
         VALUES(?,?,?,?)`,

        [name, email, phone, hashedPassword]

    );

    res.status(201).json({

        message: "User Added Successfully",

        id: result.lastID

    });

});

// PUT User
app.put("/api/users/:id", async (req, res) => {

    const { name, email, phone } = req.body;

    await db.run(

        `UPDATE users
         SET name=?, email=?, phone=?
         WHERE id=?`,

        [name, email, phone, req.params.id]

    );

    res.json({

        message: "User Updated Successfully"

    });

});

// DELETE User
app.delete("/api/users/:id", async (req, res) => {

    await db.run(

        "DELETE FROM users WHERE id=?",

        [req.params.id]

    );

    res.json({

        message: "User Deleted Successfully"

    });

});

// ================= START SERVER =================

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});