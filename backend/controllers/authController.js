const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET | 'inkflowSecret';

exports.registerUser = async (req, res) => {
    try {
        const { nom, email, motDePasse } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email déjà utilisé.'});

        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        
        const user = new User({ nom, email, motDePasse: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.'});
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        const user = await User.findOne({ email });
        if(!user) return res.status(401).json({ message: 'Utilisateur non trouvé.'});

        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if(!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect.'});

        const token = jwt.sign({ userId: user._id, role: user.role}, JWT_SECRET, { expiresIn: '1h'})

        res.status(200).json({ token, user: { nom: user.nom, email: user.email, role: user.role }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}