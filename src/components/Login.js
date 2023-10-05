// src/components/Login.js
import React, { useState } from 'react';
import Axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('/api/login', { email, password, otp });

      if (response.status === 200) {
        setLoggedIn(true);
        setMessage('Login successful');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An error occurred. Please try again later.');
      }
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('/api/register', { email, password });

      if (response.status === 201) {
        setMessage('Registration successful');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div>
      {loggedIn ? (
        <p>{message}</p>
      ) : (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (12+ characters, including uppercase, lowercase, numbers, and special characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="MFA OTP (if enabled)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          <h2>Register</h2>
          <form onSubmit={handleRegistration}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (12+ characters, including uppercase, lowercase, numbers, and special characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p>Other information (e.g., first name, surname) is optional during registration.</p>
            <button type="submit">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
