(function () {
    // Initialize EmailJS
    // IMPORTANT: Replace these placeholders with your actual EmailJS credentials
    const PUBLIC_KEY = "ujF-v_iBHFtxqJNIT";
    const SERVICE_ID = "service_virtadq";
    const TEMPLATE_ID = "template_c5p9ci4";

    emailjs.init(PUBLIC_KEY);

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitButton = this.querySelector('.submit-button');
            const originalButtonContent = submitButton.innerHTML;
            const formMessage = document.getElementById('formMessage');

            // Get localized messages
            const sendingText = submitButton.getAttribute('data-sending-text') || 'Sending...';
            const successMessageText = this.getAttribute('data-success-message') || 'Message sent successfully!';

            // Disable button and show sending state
            submitButton.disabled = true;
            submitButton.innerHTML = `<span>${sendingText}</span>`;

            // Send email
            emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
                .then(function () {
                    // Success
                    formMessage.className = 'form-message success';
                    formMessage.textContent = '✓ ' + successMessageText;
                    formMessage.style.display = 'block';

                    // Reset form
                    contactForm.reset();

                    // Hide message after 5 seconds
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 5000);
                }, function (error) {
                    // Error
                    console.error('FAILED...', error);
                    formMessage.className = 'form-message error';
                    formMessage.textContent = '❌ Failed to send message. Please try again later.';
                    formMessage.style.display = 'block';
                })
                .finally(function () {
                    // Restore button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonContent;
                });
        });
    }
})();
