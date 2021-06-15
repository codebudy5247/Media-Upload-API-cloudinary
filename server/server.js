const express =require('express')

const colour=require('colors')

const logger =require("morgan") ;

const dotenv =require("dotenv");
const cors =require ("cors");

const connectDB =require ("./config/DB");

var app = express();

dotenv.config();

//Connect to DB
connectDB();

//Middlewares
app.use(logger("dev"));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({  extended: true }));
app.use(cors());

//Test Route
app.get("/", (req, res) => {
    res.send("API is running....");
});


//Import Routes
//app.use("/api/recipe", require('./routes/RecipeRoute'));


const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server running on port ${PORT}`.yellow.bold
    )
);