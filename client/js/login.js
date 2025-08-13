document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable the login button and show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        // Clear any existing error messages
        const existingError = loginForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        try {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const response = await fetch('https://dormq.vercel.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token
            localStorage.setItem('token', data.token);
            
            // Redirect to home page
            window.location.href = 'home.html';

        } catch (error) {
            // Display error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error.message;
            loginForm.appendChild(errorDiv);

            // Reset button state
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
});