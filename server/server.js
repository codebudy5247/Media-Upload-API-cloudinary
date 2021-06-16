const express = require('express')
const path = require('path')
const colour = require('colors')
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require('fs')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const Posts = require("./PostModel.js")

const connectDB = require("./DB");

var app = express();

dotenv.config();

//Connect to DB
connectDB();

//Middlewares
app.use(logger("dev"));
app.use(express.json({
    extended: true
}));
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

//Test Route
app.get("/", (req, res) => {
    res.send("API is running....");
});

//Image Upload Route
app.post("/image", (req, res) => {
    // Get the file name and extension with multer
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const fileExt = file.originalname.split(".").pop();
            const filename = `${new Date().getTime()}.${fileExt}`;
            cb(null, filename);
        },
    });

    // Filter the file to validate if it meets the required audio extension
    const fileFilter = (req, file, cb) => {
        const filetypes = /jpg|jpeg|png/
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = filetypes.test(file.mimetype)

        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb({
                    message: "Unsupported File Format",
                },
                false
            );
        }
    };

    // Set the storage, file filter and file size with multer
    const upload = multer({
        storage,
        limits: {
            fieldNameSize: 200,
            fileSize: 1024 * 1024,
        },
        fileFilter,
    }).single("image");

    // upload to cloudinary
    upload(req, res, (err) => {
        if (err) {
            return res.send(err);
        }

        // SEND FILE TO CLOUDINARY
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        });
        const {
            path
        } = req.file; // file becomes available in req at this point

        const fName = req.file.originalname.split(".")[0];
        cloudinary.uploader.upload(
            path, {
                resource_type: "raw",
                public_id: `ImageUploads/${fName}`,
            },

            // Send cloudinary response or catch error
            (err, image) => {
                if (err) return res.send(err);

                fs.unlinkSync(path);
                //res.send(image)
                res.json({
                    public_id: image.public_id,
                    url: image.secure_url
                })
            }
        );
    });

});

//Audio Upload Route
app.post("/audio", async (req, res) => {
    // Get the file name and extension with multer
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const fileExt = file.originalname.split(".").pop();
            const filename = `${new Date().getTime()}.${fileExt}`;
            cb(null, filename);
        },
    });

    // Filter the file to validate if it meets the required audio extension
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
            cb(null, true);
        } else {
            cb({
                    message: "Unsupported File Format",
                },
                false
            );
        }
    };

    // Set the storage, file filter and file size with multer
    const upload = multer({
        storage,
        limits: {
            fieldNameSize: 200,
            fileSize: 5 * 1024 * 1024, //5 mb
        },
        fileFilter,
    }).single("audio");

    // upload to cloudinary
    upload(req, res, (err) => {
        if (err) {
            return res.send(err);
        }

        // SEND FILE TO CLOUDINARY
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        });
        const {
            path
        } = req.file; // file becomes available in req at this point

        const fName = req.file.originalname.split(".")[0];
        cloudinary.uploader.upload(
            path, {
                resource_type: "raw",
                public_id: `AudioUploads/${fName}`,
            },

            // Send cloudinary response or catch error
            (err, audio) => {
                if (err) return res.send(err);

                fs.unlinkSync(path);
                //res.send(audio);
                res.json({
                    public_id: audio.public_id,
                    url: audio.secure_url
                })
            }
        );
    });
});

//Video Upload Route
app.post("/video", async (req, res) => {
    // Get the file name and extension with multer
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const fileExt = file.originalname.split(".").pop();
            const filename = `${new Date().getTime()}.${fileExt}`;
            cb(null, filename);
        },
    });

    // Filter the file to validate if it meets the required video extension
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "video/mp4") {
            cb(null, true);
        } else {
            cb({
                    message: "Unsupported File Format",
                },
                false
            );
        }
    };

    // Set the storage, file filter and file size with multer
    const upload = multer({
        storage,
        limits: {
            fieldNameSize: 200,
            fileSize: 30 * 1024 * 1024,
        },
        fileFilter,
    }).single("video");

    upload(req, res, (err) => {
        if (err) {
            return res.send(err);
        }

        // SEND FILE TO CLOUDINARY
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        });
        const {
            path
        } = req.file; // file becomes available in req at this point

        const fName = req.file.originalname.split(".")[0];
        cloudinary.uploader.upload(
            path, {
                resource_type: "video",
                public_id: `VideoUploads/${fName}`,
                chunk_size: 6000000,
                eager: [{
                        width: 300,
                        height: 300,
                        crop: "pad",
                        audio_codec: "none",
                    },
                    {
                        width: 160,
                        height: 100,
                        crop: "crop",
                        gravity: "south",
                        audio_codec: "none",
                    },
                ],
            },

            // Send cloudinary response or catch error
            (err, video) => {
                if (err) return res.send(err);

                fs.unlinkSync(path);
                return res.json({
                    public_id: video.public_id,
                    url: video.secure_url
                });
            }
        );
    });
});

//Create a Post
app.post("/posts",async(req,res)=>{
       try {
           const post = req.body

           const newPost = new Posts({
               ...post,
           })
           const data = await newPost.save()
           console.log(data)
           res.status(201).json(data)
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
})

//Get All Posts
app.get("/posts",async(req,res)=>{
    try {
        const posts = await Posts.find()
        console.log(posts)
        res.status(200).json({posts:posts});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server running on port ${PORT}`.yellow.bold
    )
);