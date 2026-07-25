const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function connectDB() {

    const db = await open({

        filename: "./database.db",
        driver: sqlite3.Database

    });

    await db.exec(`

        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            phone TEXT NOT NULL,

            password TEXT NOT NULL

        )

    `);

    console.log("SQLite Database Connected");

    return db;

}

module.exports = connectDB;