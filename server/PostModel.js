const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: String,
    image: {
        type:String,
        default:"https://res.cloudinary.com/media-db/raw/upload/v1623867647/ImageUploads/download.jpeg"
    },
    audio: {
        type:String,
        default:"https://res.cloudinary.com/media-db/raw/upload/v1623773435/AudioUploads/file_example_MP3_1MG.mp3"
    },
    video: {
        type:String,
        default:"https://res.cloudinary.com/media-db/video/upload/v1623774038/VideoUploads/file_example_MP4_480_1_5MG.mp4"
    },
  });

const Post = mongoose.model('Post', postSchema)

module.exports = Post