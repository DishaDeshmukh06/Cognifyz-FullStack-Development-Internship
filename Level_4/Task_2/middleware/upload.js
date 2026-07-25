const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpeg|jpg|png/;

    const extname = allowedTypes.test(

        path.extname(file.originalname).toLowerCase()

    );

    const mimetype = allowedTypes.test(

        file.mimetype

    );

    if (mimetype && extname) {

        return cb(null, true);

    }

    cb(new Error("Only JPG, JPEG and PNG files are allowed."));

};

const upload = multer({

    storage,
    fileFilter

});

module.exports = upload;