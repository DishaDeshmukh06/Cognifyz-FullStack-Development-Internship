const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "cognifyz_jwt_secret";

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({
            message: "Access Denied. No Token Provided."
        });

    }

    jwt.verify(token, SECRET_KEY, (err, user) => {

        if (err) {

            return res.status(403).json({
                message: "Invalid Token"
            });

        }

        req.user = user;

        next();

    });

};

module.exports = {
    authenticateToken,
    SECRET_KEY
};