document.addEventListener('DOMContentLoaded', () => {
    // Navigation toggle functionality
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Get modal elements
    const modal = document.getElementById('deliveryChargesModal');
    const closeBtn = document.querySelector('.close-btn');
    const proceedBtn = document.querySelector('.proceed-btn');
    const orderButtons = document.querySelectorAll('.btn');

    // Only set up modal functionality if all required elements exist
    if (modal && closeBtn && proceedBtn) {
        // Show modal on page load if we're on services.html
        if (window.location.pathname.endsWith('services.html')) {
            modal.style.display = 'block';
        }

        // Close modal when X is clicked
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Handle proceed button click
        proceedBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Set up order buttons to open in new tab
    if (orderButtons.length > 0) {
        orderButtons.forEach(button => {
            if (button.href) {
                button.setAttribute('target', '_blank');
            }
        });
    }
});