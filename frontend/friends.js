const apiBaseUrl = 'http://127.0.0.1:2502';

// Function to fetch and display all users
async function loadUsers() {
    try {
        const response = await fetch(`${apiBaseUrl}/list_users`);
        const response_ = await response.json();
        const users = response_.users
        console.log(users)
        console.log(Array.isArray(users)); 
        if (!response.ok) {
            throw new Error(users.message);
        }

        // Populate the users list
        const usersList = document.getElementById('usersList');
        users.forEach((user) => {
            const li = document.createElement('li');
            li.textContent = user.username;
            li.addEventListener('click', () => addFriend(user.id, user.username));
            usersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to retrieve users. Please try again later.');
    }
}

// Function to add a friend
async function addFriend(_id, friendUsername) {
    const username = localStorage.getItem('username');

    try {
        const response = await fetch(`${apiBaseUrl}/add_friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                friendUsername: friendUsername,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(`Friend request sent to ${friendUsername}!`);
    } catch (error) {
        console.error('Error adding friend:', error);
        alert('Failed to add friend. Please try again later.');
    }
}

// Initialize the users list when the page loads
document.addEventListener('DOMContentLoaded', loadUsers);
