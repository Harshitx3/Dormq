// Test API Connection to Vercel Backend

async function testApiConnection() {
    try {
        const response = await fetch('https://dormq.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('API Response:', data);
        
        // Display result on page if element exists
        const resultElement = document.getElementById('api-test-result');
        if (resultElement) {
            resultElement.textContent = JSON.stringify(data, null, 2);
        }
        
        return data;
    } catch (error) {
        console.error('API Connection Error:', error);
        
        // Display error on page if element exists
        const resultElement = document.getElementById('api-test-result');
        if (resultElement) {
            resultElement.textContent = 'Error: ' + error.message;
        }
        
        return { error: error.message };
    }
}

// Export the test function
export { testApiConnection };

// Auto-run the test if this script is loaded directly
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're on the test page
        if (document.getElementById('api-test-result')) {
            testApiConnection();
        }
    });
}