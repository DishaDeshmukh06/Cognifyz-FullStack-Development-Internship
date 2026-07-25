const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./db");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let db;

// Connect SQLite Database
(async () => {

    db = await connectDB();

})();

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

// ================= REGISTER USER =================

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

    await db.run(

        `INSERT INTO users(name,email,phone)
         VALUES(?,?,?)`,

        [name, email, phone]

    );

    res.render("success", {

        name,
        email,
        phone

    });

});

// ================= REST API =================

// GET All Users

app.get("/api/users", async (req, res) => {

    const users = await db.all(

        "SELECT * FROM users"

    );

    res.json(users);

});
// GET User By ID

app.get("/api/users/:id", async (req, res) => {

    const user = await db.get(

        "SELECT * FROM users WHERE id = ?",

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

    const { name, email, phone } = req.body;

    await db.run(

        "INSERT INTO users(name,email,phone) VALUES(?,?,?)",

        [name, email, phone]

    );

    res.status(201).json({

        message: "User Added Successfully"

    });

});

// PUT Update User

app.put("/api/users/:id", async (req, res) => {

    const { name, email, phone } = req.body;

    await db.run(

        `UPDATE users
         SET name = ?, email = ?, phone = ?
         WHERE id = ?`,

        [name, email, phone, req.params.id]

    );

    res.json({

        message: "User Updated Successfully"

    });

});

// DELETE User

app.delete("/api/users/:id", async (req, res) => {

    await db.run(

        "DELETE FROM users WHERE id = ?",

        [req.params.id]

    );

    res.json({

        message: "User Deleted Successfully"

    });

});

// Start Server

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});