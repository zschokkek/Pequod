const apiBaseUrl = 'http://localhost:5000/api/auth';


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

async function startGame(user) {
    // Show game section
    document.getElementById('game').style.display = 'block';

    let correctCoords = { lat: 35.676, lng: 139.65 }; // Default coordinates

    // Fetch and display the image from the backend
    try {
        const response = await fetch('http://localhost:2500/get-image');
        if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('gameImage').src = imageUrl;

            // Extract EXIF data
            EXIF.getData(imageBlob, function() {
                const exifData = EXIF.getAllTags(this);
                console.log('EXIF Data:', exifData);

                if (exifData.GPSLatitude && exifData.GPSLongitude) {
                    const lat = exifData.GPSLatitude;
                    const lon = exifData.GPSLongitude;

                    // Convert the latitude and longitude to decimal
                    const latRef = exifData.GPSLatitudeRef || "N"; 
                    const lonRef = exifData.GPSLongitudeRef || "W"; 
                    const latitude = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef === "N" ? 1 : -1); 
                    const longitude = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef === "W" ? -1 : 1); 

                    correctCoords = { lat: latitude, lng: longitude };
                    console.log(`Correct location based on EXIF data: Latitude = ${latitude}, Longitude = ${longitude}`);
                } else {
                    console.log('No GPS data found in the image.');
                }
            });
        } else {
            console.error('Failed to load image');
        }
    } catch (error) {
        console.error('Error fetching the image:', error);
    }

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

            try {
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
                    const errorData = await response.json();
                    console.error('Failed to save guess:', errorData);
                }
            } catch (error) {
                console.error('Error during fetch:', error);
            }

            // Show the score in a custom popup
            showPopup(score);
        } else {
            console.log("No location clicked yet.");
        }
    });

    // Function to evaluate the guess and calculate a score
    function evaluateGuess(guessCoords) {
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
    document.getElementById('closePopup').addEventListener('click', function () {
        var popup = document.getElementById('popup');
        var overlay = document.getElementById('overlay');

        popup.style.display = 'none';
        overlay.style.display = 'none';
    });
}