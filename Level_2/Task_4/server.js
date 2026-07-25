const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// In-memory database
let users = [];
let id = 1;

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

// Registration Form
app.post("/submit", (req, res) => {

    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
        return res.send("All fields are required.");
    }

    if (password !== confirmPassword) {
        return res.send("Passwords do not match.");
    }

    const user = {
        id: id++,
        name,
        email,
        phone
    };

    users.push(user);

    res.render("success", {
        name,
        email,
        phone
    });

});

// ================= REST API =================

// GET All Users
app.get("/api/users", (req, res) => {

    res.json(users);

});

// GET User by ID
app.get("/api/users/:id", (req, res) => {

    const user = users.find(u => u.id == req.params.id);

    if (!user) {

        return res.status(404).json({
            message: "User not found"
        });

    }

    res.json(user);

});

// POST User
app.post("/api/users", (req, res) => {

    const { name, email, phone } = req.body;

    const user = {
        id: id++,
        name,
        email,
        phone
    };

    users.push(user);

    res.status(201).json({
        message: "User Added Successfully",
        user
    });

});
// PUT Update User
app.put("/api/users/:id", (req, res) => {

    const user = users.find(u => u.id == req.params.id);

    if (!user) {

        return res.status(404).json({
            message: "User not found"
        });

    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    res.json({
        message: "User Updated Successfully",
        user
    });

});

// DELETE User
app.delete("/api/users/:id", (req, res) => {

    const index = users.findIndex(u => u.id == req.params.id);

    if (index === -1) {

        return res.status(404).json({
            message: "User not found"
        });

    }

    users.splice(index, 1);

    res.json({
        message: "User Deleted Successfully"
    });

});

// Start Server
app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});