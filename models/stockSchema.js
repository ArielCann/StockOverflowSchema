
import mongoose from "mongoose";
const { Schema } = mongoose;
const stockSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Ticker: {
        type: String,
        required: true
    }
})