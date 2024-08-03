require('dotenv').config();
const mongoose = require('mongoose');
// console.log(process.env.MONGO_URI)
// console.log(process.env.MONGO_URI)
// console.log('Loaded MONGO_URI:', process.env.REACT_APP_API_URL); // Add this line for debugging
const mongoUri=process.env.MONGO_URI || "mongodb+srv://faiz:faizjarvis@cluster1.lmtoo7r.mongodb.net/CosmicVault?retryWrites=true&w=majority&appName=Cluster1"
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
