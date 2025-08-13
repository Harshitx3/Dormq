document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('signupPassword');

    // Password validation function
    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators in UI
        document.getElementById('length').style.color = requirements.length ? 'green' : 'red';
        document.getElementById('uppercase').style.color = requirements.uppercase ? 'green' : 'red';
        document.getElementById('lowercase').style.color = requirements.lowercase ? 'green' : 'red';
        document.getElementById('number').style.color = requirements.number ? 'green' : 'red';
        document.getElementById('special').style.color = requirements.special ? 'green' : 'red';

        return Object.values(requirements).every(Boolean);
    }

    // Check password as user types
    passwordInput.addEventListener('input', () => {
        validatePassword(passwordInput.value);
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate password requirements
        if (!validatePassword(password)) {
            alert('Password must meet all requirements');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://dormq.vercel.app/api/auth/signup', {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password 
                })
            });

            if (!response) {
                throw new Error('No response from server');
            }

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Failed to fetch') {
                alert('Unable to connect to the server. Please make sure the server is running.');
            } else {
                alert('An error occurred during registration. Please try again.');
            }
        }
    });
});