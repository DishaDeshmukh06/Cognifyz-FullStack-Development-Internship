const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Temporary storage
const users = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Handle Form Submission
app.post("/submit", (req, res) => {

    const { name, email, phone, password, confirmPassword } = req.body;

    // Server-side validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        return res.send("All fields are required.");
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        return res.send("Phone number must contain exactly 10 digits.");
    }

    if (password.length < 6) {
        return res.send("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
        return res.send("Passwords do not match.");
    }

    // Save data temporarily
    users.push({
        name,
        email,
        phone
    });

    console.log("Registered Users:");
    console.table(users);

    res.render("success", {
        name,
        email,
        phone
    });

});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});