// Function to generate random CAPTCHA
function generateCaptcha(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < length; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

// Display CAPTCHA
let currentCaptcha = generateCaptcha();
document.getElementById('captchaText').innerText = currentCaptcha;

// Form validation
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission

    const userCaptcha = document.getElementById('captchaInput').value;
    if (userCaptcha === currentCaptcha) {
        alert('CAPTCHA correct! Form submitted.');
        // You can now submit form data to server
    } else {
        alert('Incorrect CAPTCHA. Try again.');
        currentCaptcha = generateCaptcha(); // Generate new CAPTCHA
        document.getElementById('captchaText').innerText = currentCaptcha;
        document.getElementById('captchaInput').value = '';
    }
});
