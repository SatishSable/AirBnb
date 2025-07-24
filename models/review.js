const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const reviewSchema = new Schema({
    content : String,
    rating : {
        type : Number,
        min : 1,
        max : 5,
        
    },
    createdAt: {
        type: Date,
        defalut:Date.now(),
    }

});
module.exports = mongoose.model("review",reviewSchema)