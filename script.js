// script.js
document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const message = document.getElementById('message');

    loginButton.addEventListener('click', function () {
        const email = emailInput.value;
        const password = passwordInput.value;

        // Replace with your own authentication logic
        if (email === 'your_email@example.com' && password === 'your_password') {
            message.textContent = 'Login successful';
            message.style.color = 'green';
        } else {
            message.textContent = 'Invalid credentials';
            message.style.color = 'red';
        }
    });
});

