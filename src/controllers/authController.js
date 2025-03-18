const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { registerSchema, loginSchema } = require('../validators/authValidator');

exports.register = async (req, res) => {
    try {
        // Validate request
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({ name, email, password: hashedPassword });

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // res.status(201).json({ user: { id: user.id, name, email }, token });

        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                },
                meta: {
                    access_token: token
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        // Validate request
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                meta: {
                    access_token: token
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get currently authenticated user
exports.getMe = async (req, res) => {
    try {
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    created_at: req.user.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
