require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const connectDB = require("./db");
const upload = require("./middleware/upload");
const { authenticateToken, SECRET_KEY } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

let db;

// ================= DATABASE =================

(async () => {

    db = await connectDB();

})();

// ================= MIDDLEWARE =================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({

    secret: process.env.SESSION_SECRET,
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

// Upload Page

app.get("/upload", (req, res) => {

    res.render("upload");

});

// ================= REGISTRATION =================

app.post("/submit", async (req, res) => {

    const {

        name,
        email,
        phone,
        password,
        confirmPassword

    } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {

        return res.send("All fields are required.");

    }

    if (password !== confirmPassword) {

        return res.send("Passwords do not match.");

    }

    const existingUser = await db.get(

        "SELECT * FROM users WHERE email=?",

        [email]

    );

    if (existingUser) {

        return res.send("Email already registered.");

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(

        `INSERT INTO users(name,email,phone,password)
         VALUES(?,?,?,?)`,

        [

            name,
            email,
            phone,
            hashedPassword

        ]

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

    const match = await bcrypt.compare(

        password,

        user.password

    );

    if (!match) {

        return res.send("Invalid Password.");

    }

    const token = jwt.sign(

        {

            id: user.id,
            email: user.email

        },

        SECRET_KEY,

        {

            expiresIn: "1h"

        }

    );

    req.session.user = user;

    res.render("dashboard", {

        user,
        token

    });

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

// ================= FILE UPLOAD =================

app.post(

    "/upload",

    upload.single("image"),

    (req, res) => {

        if (!req.file) {

            return res.send("Please select an image.");

        }

        res.send(`

            <h2>Image Uploaded Successfully!</h2>

            <p><strong>File Name:</strong> ${req.file.filename}</p>

            <img src="/uploads/${req.file.filename}" width="300">

            <br><br>

            <a href="/upload">Upload Another Image</a>

        `);

    }

);

// ================= REST API =================

// GET ALL USERS

app.get("/api/users", authenticateToken, async (req, res) => {

    const users = await db.all(

        "SELECT id, name, email, phone FROM users"

    );

    res.json(users);

});

// GET USER BY ID

app.get("/api/users/:id", authenticateToken, async (req, res) => {

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

// CREATE USER

app.post("/api/users", authenticateToken, async (req, res) => {

    const {

        name,
        email,
        phone,
        password

    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(

        `INSERT INTO users(name,email,phone,password)
         VALUES(?,?,?,?)`,

        [

            name,
            email,
            phone,
            hashedPassword

        ]

    );

    res.status(201).json({

        message: "User Added Successfully",

        id: result.lastID

    });

});

// UPDATE USER

app.put("/api/users/:id", authenticateToken, async (req, res) => {

    const {

        name,
        email,
        phone

    } = req.body;

    await db.run(

        `UPDATE users
         SET name=?, email=?, phone=?
         WHERE id=?`,

        [

            name,
            email,
            phone,
            req.params.id

        ]

    );

    res.json({

        message: "User Updated Successfully"

    });

});

// DELETE USER

app.delete("/api/users/:id", authenticateToken, async (req, res) => {

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