const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title : { type: String, required: true },
    description : { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true} 
}, {timestamps: true});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;