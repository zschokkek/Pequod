const apiBaseUrl = 'http://localhost:5000/api/auth';

document.getElementById('registerButton').addEventListener('click', async function() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (username && password) {
        const response = await fetch(`${apiBaseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = 'index.html';
        } else {
            alert(data.message);
        }
    } else {
        alert('Please enter a username and password.');
    }
});