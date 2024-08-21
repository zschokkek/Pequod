const apiBaseUrl = 'http://localhost:5000/api/auth';

// Function to fetch and display user data
async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const friendUsername = urlParams.get('friend');
    const username = friendUsername || localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    // Set the username in the banner
    document.getElementById('usernameBanner').textContent = friendUsername 
        ? `Viewing ${friendUsername}'s Profile` 
        : `Welcome, ${username}`;

    // Initialize the map
    const map = L.map('map').setView([20, 0], 2); // Centered at (20, 0) with zoom level 2

    // Add a tile layer to the map (OpenStreetMap in this case)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    try {
        // Fetch the user's or friend's guesses by username
        const response = await fetch(`${apiBaseUrl}/guesses?username=${username}`);
        const guesses = await response.json();

        if (!response.ok) {
            throw new Error(guesses.message);
        }

        // Add guesses to the map
        guesses.forEach((guess, index) => {
            L.marker([guess.lat, guess.lng]).addTo(map).bindPopup(`Guess ${index + 1}: Score ${guess.score}`);
        });

        // Populate the high scores list
        const highScoresList = document.getElementById('highScoresList');
        guesses.sort((a, b) => b.score - a.score);
        console.log(guesses);
        guesses.slice(0, 5).forEach((guess, index) => {
            const li = document.createElement('li');
            li.textContent = `Guess ${index + 1}: ${guess.score}`;
            highScoresList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching guesses:', error);
        alert('Failed to retrieve guesses. Please try again later.');
    }
}

// Initialize the profile data when the page loads
document.addEventListener('DOMContentLoaded', loadUserProfile);

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
});

document.getElementById('addFriendButton').addEventListener('click', function() {
    window.location.href = 'friends.html';
});