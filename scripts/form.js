function handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Create query string
    const queryString = new URLSearchParams(data).toString();
    
    // Create response message
    const responseEl = document.getElementById('formResponse');
    responseEl.innerHTML = `
        <h3>Thank you for your message, ${data.name}!</h3>
        <p>Redirecting you back to the dashboard...</p>
    `;
    
    // Add success class and show the response
    responseEl.classList.add('success', 'show');
    
    // Clear the form
    event.target.reset();
    
    // Redirect after a short delay (1.5 seconds to show the thank you message)
    setTimeout(() => {
        window.location.href = `travail_projet.html?${queryString}`;
    }, 1500);
}

// Handle page load with GET parameters on travail_project.html
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('name')) {
        const responseEl = document.getElementById('formResponse');
        if (responseEl) {
            responseEl.innerHTML = `
                <h3>Thank you for your message, ${params.get('name')}!</h3>
                <p>We've received your inquiry about "${params.get('subject')}".</p>
                <p>We'll respond to you at ${params.get('email')} shortly.</p>
                <p>Your message: "${params.get('message')}"</p>
            `;
            responseEl.classList.add('success', 'show');
            responseEl.scrollIntoView({ behavior: 'smooth' });
            
            // Clear URL parameters after 5 seconds
            setTimeout(() => {
                window.history.pushState({}, '', window.location.pathname);
                responseEl.classList.remove('show');
            }, 5000);
        }
    }
}