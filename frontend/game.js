const apiBaseUrl = 'http://localhost:5000/api/auth';

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        window.location.href = 'index.html';
    } else {
        showProfileLink();
        showLogoutButton();
        startGame({ username });
    }
});

function showProfileLink() {
    document.getElementById('profileLink').style.display = 'block';
}

function showLogoutButton() {
    document.getElementById('logoutButton').style.display = 'block';
}

function startGame(user) {
    // Show game section
    document.getElementById('game').style.display = 'block';

    // Initialize the map
    var map = L.map('map').setView([20, 0], 2); // Centered at (20, 0) with zoom level 2

    // Add a tile layer to the map (OpenStreetMap in this case)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Variable to store the clicked coordinates
    var clickedCoords = null;
    var marker = null;

    // Add a click event listener to the map
    map.on('click', function(e) {
        clickedCoords = e.latlng;

        // If a marker already exists, remove it
        if (marker) {
            map.removeLayer(marker);
        }

        // Add a marker at the clicked location
        marker = L.marker(clickedCoords).addTo(map);

        console.log("Coordinates clicked: " + clickedCoords.lat + ", " + clickedCoords.lng);
    });

    // Add event listener to the submit button
    document.getElementById('submitGuess').addEventListener('click', async function() {
        const username = localStorage.getItem('username');

        if (clickedCoords) {
            console.log("Location clicked: " + clickedCoords.lat + ", " + clickedCoords.lng);

            // Calculate the score
            var score = evaluateGuess(clickedCoords);

            // Save the guess to the backend
            const response = await fetch(`${apiBaseUrl}/guess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, lat: clickedCoords.lat, lng: clickedCoords.lng, score })
            });

            if (response.ok) {
                console.log('Guess saved successfully');
            } else {
                console.log('Failed to save guess');
            }

            // Show the score in a custom popup
            showPopup(score);
        } else {
            console.log("No location clicked yet.");
        }
    });

    // Function to evaluate the guess and calculate a score
    function evaluateGuess(guessCoords) {
        var correctCoords = { lat: 35.676, lng: 139.65};

        // Calculate the distance between the guess and the correct answer
        var distance = getDistance(guessCoords.lat, guessCoords.lng, correctCoords.lat, correctCoords.lng);

        // Calculate score based on distance (example: closer distance gets higher score)
        var score = Math.max(0, 100 - distance); // Simple example: 100 points minus the distance

        return score;
    }

    // Function to calculate the distance between two coordinates (Haversine formula)
    function getDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the Earth in kilometers
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = 
            0.5 - Math.cos(dLat) / 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            (1 - Math.cos(dLon)) / 2;

        return R * 2 * Math.asin(Math.sqrt(a));
    }

    // Function to show the custom popup with the score
    function showPopup(score) {
        var popup = document.getElementById('popup');
        var overlay = document.getElementById('overlay');
        var scoreText = document.getElementById('scoreText');

        scoreText.innerText = "Your score is: " + score;

        popup.style.display = 'block';
        overlay.style.display = 'block';
    }

    // Function to close the custom popup
    document.getElementById('closePopup').addEventListener('click', function() {
        var popup = document.getElementById('popup');
        var overlay = document.getElementById('overlay');

        popup.style.display = 'none';
        overlay.style.display = 'none';
    });
}