const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        
        phone:{
            type: String,
            required: true,
            trim:true
        },
        userName: {
            type: String,
            required: true,
            trim:true

        },
        email: {
            type: String,
            required: true,
            trim:true

        },
        password:{
            type:String,
            required:true,
            trim:true

        },
        count:{
            type:Number
        },
        votedCandidate:{
            type:String,
            trim:true
        }
    }, { timestamps: true })


module.exports = mongoose.model('myuser', userSchema)
