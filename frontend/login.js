const apiBaseUrl = 'http://localhost:5000/api/auth';

document.getElementById('loginButton').addEventListener('click', async function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
        try {
            const response = await fetch(`${apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                console.log(data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', username);
                window.location.href = 'game.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('Please enter a username and password.');
    }
});