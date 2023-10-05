// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  hashedPassword: { type: String, required: true },
  otpSecret: { type: String },
});

const User = mongoose.model('User', userSchema);

// Define Session Schema and Model
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, expires: '30m', default: Date.now }, // Sessions expire after 30 minutes
});

const Session = mongoose.model('Session', sessionSchema);

// Implement user registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if the password meets strong requirements
    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{12,}$/)) {
      return res.status(400).json({ error: 'Password does not meet requirements' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      email,
      hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Implement user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check OTP (if OTP secret is set for the user)
    if (user.otpSecret) {
      const isValidOtp = speakeasy.totp.verify({
        secret: user.otpSecret,
        encoding: 'base32',
        token: otp,
      });

      if (!isValidOtp) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
    }

    // Generate a JWT token for session
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
      expiresIn: '1h',
    });

    // Create a session in the database
    const session = new Session({ userId: user._id });
    await session.save();

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Implement user logout
app.post('/api/logout', async (req, res) => {
  try {
    // Remove the session from the database (based on the token)
    await Session.deleteOne({ _id: req.sessionId });

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Handle other errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'An error occurred' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
