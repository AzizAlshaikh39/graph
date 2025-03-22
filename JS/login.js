async function login() {
    console.log('Login function called');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        document.getElementById('loginError').innerText = 'Please enter both username/email and password.';
        return;
    }

    const credentials = btoa(`${username}:${password}`);
    console.log('Credentials:', credentials);

    try {
        console.log('Fetching:', 'https://learn.reboot01.com/api/auth/signin');
        console.log('Headers:', {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
        });

        const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);

        // Read the response body as plain text
        const jwt = await response.text();
        console.log('JWT:', jwt);

        if (!jwt) {
            throw new Error('No token received');
        }

        // Store the JWT in localStorage
        localStorage.setItem('jwt', jwt);
        console.log('JWT stored:', localStorage.getItem('jwt'));

        // Display success message
        document.getElementById('loginError').innerText = 'Login successful! Redirecting...';

        // Redirect to profile page after 2 seconds
        setTimeout(() => {
            window.location.href = '/profile.html';
        }, 2000);

    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginError').innerText = error.message || 'Login failed. Please try again.';
    }
}