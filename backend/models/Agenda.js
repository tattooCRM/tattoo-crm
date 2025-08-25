const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title : { type: String, required: true },
    description : { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true},
    color: { type: String, default: 'bg-blue-500' }
}, {timestamps: true});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;