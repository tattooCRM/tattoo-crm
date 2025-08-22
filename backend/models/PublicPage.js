const mongoose = require('mongoose');

const PublicPageSchema = new mongoose.Schema({
    tatoueur: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    titre: { type: String, required: true },
    bio: { type: String },
    portfolio: [{ type: String }],
    dispo: { type: Object, default: {} },
    reseaux_sociaux: { type: Object, default: {} },
    url_slug: { type: String, unique: true, required: true }
}, { timestamps: true });

export default mongoose.model('PublicPage', PublicPageSchema);