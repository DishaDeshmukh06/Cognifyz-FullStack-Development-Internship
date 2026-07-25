const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/");

    },

    filename: function (req, file, cb) {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpg|jpeg|png/;

    const ext = allowedTypes.test(

        path.extname(file.originalname).toLowerCase()

    );

    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {

        cb(null, true);

    } else {

        cb(new Error("Only JPG, JPEG and PNG images are allowed."));

    }

};

const upload = multer({

    storage: storage,

    fileFilter: fileFilter

});

module.exports = upload;