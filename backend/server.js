// --- 1. Imports ---
// Sabhi zaroori packages ko import karein
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Password hashing ke liye
const jwt = require('jsonwebtoken'); // JWT ke liye
const { protect } = require('./authMiddleware');
require('dotenv').config(); // .env file ke variables ko load karne ke liye

// --- 2. App Initialization ---
const app = express();
const PORT = 3000;

// --- 3. Middlewares ---
app.use(cors()); // Frontend aur Backend ko aapas mein baat karne ki anumati deta hai
app.use(express.json()); // Frontend se bheje gaye JSON data ko samajhne me madad karta hai

// --- 4. Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB Atlas Successful connected !');
}).catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
});

// --- 5. User Schema and Model ---
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { 
        type: mongoose.Schema.Types.ObjectId, // User ki ID store karega
        required: true,
        ref: 'User' // Yeh User model se juda hai
    }
});
const Subject = mongoose.model('Subject', subjectSchema);

// === ADD THIS NEW SCHEMA ===
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    subject: {
        type: mongoose.Schema.Types.ObjectId, // Links to a Subject
        required: true,
        ref: 'Subject'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Links to a User
        required: true,
        ref: 'User'
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Note = mongoose.model('Note', noteSchema);



// --- 6. API Routes ---

// --- Imports and setup code is here... ---
// सुनिश्चित करें कि यह इम्पोर्ट है

// === PURANE /api/dashboard ROUTE KO HATAYEIN ===

// === YEH NAYA PROTECTED DASHBOARD DATA ROUTE ADD KAREIN ===
app.get('/api/dashboard-data', protect, async (req, res) => {
    try {
        const dashboardData = {
            fullname: req.user.fullname,
            attendance: 82,
            deadlines: [
                { title: 'Project Submission', date: 'Oct 15' },
                { title: 'Maths Quiz', date: 'Oct 18' },
                { title: 'Lab Report', date: 'Oct 22' },
            ],
            // Quick links for important subjects
            subjects: [
                { name: 'IT Tools & Fundamental', link: 'subject-page.html' },
                { name: 'C Programming', link: 'subject-page.html' },
                { name: 'Software Engineering', link: 'subject-page.html' },
            ],
            // Full curriculum data
            curriculum: [
                { name: 'IT Tools & Fundamental', link: 'subject-page.html', iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { name: 'Mathematics', link: 'subject-page.html', iconPath: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3-6h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm3-6h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008ZM6 21a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 6 3h12a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21H6Z' },
                { name: 'C Programming', link: 'subject-page.html', iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                { name: 'OOP & C++', link: 'subject-page.html', iconPath: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
                { name: 'Database Systems', link: 'subject-page.html', iconPath: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375' },
                { name: 'Software Engineering', link: 'subject-page.html', iconPath: 'M11.42 15.17L17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83M11.42 15.17l.017-.017L15.17 11.42l5.83 5.83c.53.53.53 1.39 0 1.92l-1.92 1.92c-.53.53-1.39.53-1.92 0l-5.83-5.83Z M3 8.25a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3 8.25h.008v.008H3V8.25Z' }
            ]
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard data error:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data." });
    }
});


// --- Register and Login routes are here... ---

// --- app.listen is here at the end... ---


// Default test route
app.get('/', (req, res) => {
    res.send('Student Hub Backend chal raha hai!');
});

// --- SECURE SIGNUP API ROUTE ---
app.post('/api/register', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Please! Enter all fields." });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        });

        await newUser.save();
        
        console.log(`✅ Ne user registered: ${email}`);
        res.status(201).json({ message: "User has successfully registered!" });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Server error, Please! try again later." });
    }
});

// --- SECURE LOGIN API ROUTE ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please! enter email and  password ." });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Invalid  credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid  credentials." });
        }
        

        // --- SUBJECTS API ROUTES ---

// 1. Naya subject banane ke liye API
app.post('/api/subjects', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Subject name is required." });
        }

        const newSubject = new Subject({
            name,
            description,
            user: req.user.id // 'protect' middleware se user ki ID mil jaati hai
        });

        const savedSubject = await newSubject.save();
        res.status(201).json(savedSubject);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Logged-in user ke saare subjects laane ke liye API
app.get('/api/subjects', protect, async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id });
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 3. Ek subject ko delete karne ke liye API
app.delete('/api/subjects/:id', protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: "Subject not found." });
        }
        // Yeh check karein ki subject usi user ka hai jo delete kar raha hai
        if (subject.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized." });
        }

        await subject.deleteOne();
        res.status(200).json({ message: "Subject removed." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// --- NOTES & SUBJECT DETAIL API ROUTES ---

// 1. Get details for a SINGLE subject
app.get('/api/subjects/:id', protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject || subject.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Get all notes for a specific subject
app.get('/api/subjects/:id/notes', protect, async (req, res) => {
    try {
        const notes = await Note.find({ subject: req.params.id, user: req.user.id });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 3. Create a new note for a subject
app.post('/api/notes', protect, async (req, res) => {
    try {
        const { title, content, subjectId } = req.body;
        if (!title || !content || !subjectId) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const newNote = new Note({
            title,
            content,
            subject: subjectId,
            user: req.user.id
        });
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});



        // --- Create and Send JWT ---
        const payload = {
            id: user.id,
            fullname: user.fullname
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token 1 ghante me expire ho jayega
        );
        
        console.log(`✅ User has login : ${email}`); // <--- ISE SAHI JAGAH PAR RAKHA GAYA HAI

        // Token ko client ko bhejein
        res.status(200).json({
            message: "Login Successful!",
            token: token // <--- YEH FINAL AUR SAHI JAWAB HAI
        });

    } catch (error) {
        console.error('Login me error:', error);
        res.status(500).json({ message: "Server error, Please! try again later." });
    }
});


// --- 7. Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on http://localhost:${PORT} `);
});