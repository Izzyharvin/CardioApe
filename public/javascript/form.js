document.addEventListener('DOMContentLoaded', async function () {
    // Wait for the DOM to be fully loaded
    const form = document.querySelector('.form');
    const subscribedSection = document.getElementById('subscribed-section');
    const nonSubscribedSection = document.getElementById('non-subscribed-section');
    const videoSection = document.getElementById('video-section');
    const email = document.querySelector('.email');
    const password = document.querySelector('.password');
    const submitBtn = document.querySelector('.submit-btn');

    if (form) {
        // Check if the form element exists

        // Add an event listener to the submit button
        submitBtn.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default form submission behavior

            // Send a POST request to the login route
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/html', // Set the Accept header for both JSON and HTML
                    }),
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');

                if (contentType.includes('application/json')) {
                    const data = await response.json();

                    if (data.message === 'Unauthorized') {
                        alert('Authentication failed. Please check your email and password.');
                    } else {
                        // Redirect to the profile page on successful login
                        sessionStorage.email = data.email;

                        // Update the display based on the subscription status
                        if (data.isSubscribed) {
                            videoSection.style.display = 'block';
                        } else {
                            videoSection.style.display = 'none';
                        }
                    }
                    // Add a console log to check if the videoSection visibility is being set correctly
                    console.log('Video Section Visibility:', videoSection.style.display);
                    
                } else if (contentType.includes('text/html')) {
                    // Handle HTML content as text
                    const htmlData = await response.text();
                    // You can do something with the HTML response here if needed
                } else {
                    throw new Error(`Unsupported content type: ${contentType}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    } else {
        console.error('.form element not found in the HTML');
    }

    // Fetch the subscription status from the server
    const response = await fetch('/profile');
    const data = await response.json();
    const isSubscribed = data.isSubscribed;

    if (isSubscribed) {
        // User is subscribed, show the subscribed section
        subscribedSection.style.display = 'block';
        nonSubscribedSection.style.display = 'none';
    } else {
        // User is not subscribed, show the non-subscribed section
        subscribedSection.style.display = 'none';
        nonSubscribedSection.style.display = 'block';
    }
});
