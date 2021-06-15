const mongoose =require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI_DEV, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`Database connected! ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(error);
  }
};

module.exports= connectDB;