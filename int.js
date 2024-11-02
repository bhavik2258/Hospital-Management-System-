// Function to handle login
async function loginUser(event) {
    event.preventDefault(); // Prevent form submission refresh
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            // Redirect to dashboard or main application page
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to handle registration
async function registerUser(event) {
    event.preventDefault(); // Prevent form submission refresh
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = 'index.html'; // Redirect to login page
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
