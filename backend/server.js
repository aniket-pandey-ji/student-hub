const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { protect } = require('./authMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected!'))
  .catch((error) => console.error('❌ MongoDB error:', error.message));

// === SCHEMAS ===
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const subjectSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String },
    user:        { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
});
const Subject = mongoose.model('Subject', subjectSchema);

const noteSchema = new mongoose.Schema({
    title:   { type: String, required: true },
    content: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Subject' },
    user:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });
const Note = mongoose.model('Note', noteSchema);

// === ROUTES ===

// Test route
app.get('/', (req, res) => {
    res.send('Student Hub Backend chal raha hai! ✅');
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password)
            return res.status(400).json({ message: "Please enter all fields." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullname, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Enter email and password." });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

        const token = jwt.sign(
            { id: user.id, fullname: user.fullname },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login Successful!", token });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// Dashboard
app.get('/api/dashboard-data', protect, async (req, res) => {
    try {
        res.status(200).json({
            fullname: req.user.fullname,
            attendance: 82,
            deadlines: [
                { title: 'Project Submission', date: 'Oct 15' },
                { title: 'Maths Quiz', date: 'Oct 18' },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// Subjects
app.post('/api/subjects', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Subject name required." });
        const subject = new Subject({ name, description, user: req.user.id });
        res.status(201).json(await subject.save());
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.get('/api/subjects', protect, async (req, res) => {
    try {
        res.status(200).json(await Subject.find({ user: req.user.id }));
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.get('/api/subjects/:id', protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject || subject.user.toString() !== req.user.id)
            return res.status(404).json({ message: "Subject not found." });
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.delete('/api/subjects/:id', protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Not found." });
        if (subject.user.toString() !== req.user.id)
            return res.status(401).json({ message: "Not authorized." });
        await subject.deleteOne();
        res.status(200).json({ message: "Subject removed." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// Notes
app.get('/api/subjects/:id/notes', protect, async (req, res) => {
    try {
        res.status(200).json(
            await Note.find({ subject: req.params.id, user: req.user.id })
        );
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

app.post('/api/notes', protect, async (req, res) => {
    try {
        const { title, content, subjectId } = req.body;
        if (!title || !content || !subjectId)
            return res.status(400).json({ message: "All fields required." });
        const note = new Note({ title, content, subject: subjectId, user: req.user.id });
        res.status(201).json(await note.save());
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// === Server Start ===
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
}

module.exports = app; // ← Vercel ke liye zaroori
