document.addEventListener('DOMContentLoaded', function () {
    // Wait for the DOM to be fully loaded
    const form = document.querySelector('.form');
    const subscribedSection = document.getElementById('subscribed-section');
    const nonSubscribedSection = document.getElementById('non-subscribed-section');

    if (form) {
        // Check if the form element exists
        const name = document.querySelector('.name') || null;
        const email = document.querySelector('.email');
        const password = document.querySelector('.password');
        const submitBtn = document.querySelector('.submit-btn');
        const videoSection = document.getElementById('video-section');

        // Add an event listener to the submit button
        submitBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default form submission behavior

            // Send a POST request to the login route
            fetch('/login', {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    email: email.value,
                    password: password.value,
                }),
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Request failed with status ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                // Check the response for authentication status
                if (data.message === 'Unauthorized') {
                    // Handle authentication failure (display an error message, etc.)
                    alert('Authentication failed. Please check your email and password.');
                } else {
                    // Redirect to the profile page on successful login
                    sessionStorage.email = data.email;
                    location.href = '/profile';

                    // Check if the user is subscribed and show/hide the video
                    fetch('/profile')
                    .then((res) => res.json())
                    .then((profileData) => {
                        if (profileData.isSubscribed) {
                            // User is subscribed, show the video
                            videoSection.style.display = 'block';
                        } else {
                            // User is not subscribed, hide the video
                            videoSection.style.display = 'none';
                        }
                    });
                }
            })
            .catch((error) => {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            });
        });
    } else {
        console.error('.form element not found in the HTML');
    }

    // Fetch the subscription status from the server
    fetch('/profile')
        .then((response) => response.json())
        .then((data) => {
            if (data.isSubscribed) {
                // User is subscribed, show the subscribed section
                subscribedSection.style.display = 'block';
                nonSubscribedSection.style.display = 'none';
            } else {
                // User is not subscribed, show the non-subscribed section
                subscribedSection.style.display = 'none';
                nonSubscribedSection.style.display = 'block';
            }
        })
        .catch((error) => {
            console.error('Error fetching subscription status:', error);
        });
});
