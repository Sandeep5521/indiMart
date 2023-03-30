const mongoose = require('mongoose');
mongoose.set('strictQuery', true)
// mongoose.connect("mongodb://localhost:27017/mdb") //{ useNewUrlParser: true, useUnifiedTopology: true}
const dataSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    password: String,
    email:String,
    favourites:Array,
    cart:Array,
    orders:Array,
    tokens:Array
})

const Data = new mongoose.model("Data", dataSchema);
module.exports = Data;
