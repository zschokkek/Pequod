document.getElementById('loginButton').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Simple validation for demonstration purposes
    if (username && password) {
        // Hide login form and show game
        document.getElementById('login').style.display = 'none';
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
        document.getElementById('submitGuess').addEventListener('click', function() {
            var userGuess = document.getElementById('guess').value;
            if (clickedCoords) {
                console.log("User's guess: " + userGuess);
                console.log("Location clicked: " + clickedCoords.lat + ", " + clickedCoords.lng);

                // Calculate the score
                var score = evaluateGuess(clickedCoords);

                // Show the score in a custom popup
                showPopup(score);
            } else {
                console.log("No location clicked yet.");
            }
        });

        // Function to evaluate the guess and calculate a score
        function evaluateGuess(guessCoords) {
            // Predefined correct answer coordinates (for example, Paris, France)
            var correctCoords = { lat: 48.8566, lng: 2.3522 };

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

    } else {
        alert("Please enter a username and password.");
    }
});