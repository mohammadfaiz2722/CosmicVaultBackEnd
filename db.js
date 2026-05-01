require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri=process.env.MONGO_URI
const connectToMongo = async() => {
    try{

        await mongoose.connect(mongoUri, 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        console.log("Connected to db")
    }
    catch(e)
    {
        console.log("Error connecting database")
    }
      
};


module.exports = connectToMongo;
