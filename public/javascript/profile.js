document.addEventListener('DOMContentLoaded', async function () {
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('subscription-video');

    // Make an AJAX request to the server to check the subscription status
    try {
        const response = await fetch('/profile/check-subscription', {
            method: 'GET',
            headers: {
                'Accept': 'application/json', // For JSON response
            },  
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType.includes('application/json')) {
                // Handle JSON response
                const data = await response.json();
                const isSubscribed = data.isSubscribed;
                // Your JSON response handling logic here
                if (isSubscribed) {
                    // Load the subscribed user's video content
                    video.src = '/public/videos/cows (1080p).mp4'; // Set the video source
                    video.controls = true; // Show video controls (play, pause, volume, etc.)
                    videoContainer.style.display = 'block'; // Show the video container
                } else {
                    // Check if videoContainer exists before setting innerHTML
                    if (videoContainer) {
                        // Display a message or alternative content for non-subscribed users
                        videoContainer.innerHTML = '<p>Sorry, this video is only available to subscribed users.</p>';
                        videoContainer.style.display = 'block'; // Show the message
                    } else {
                        console.error('videoContainer not found.');
                    }
                }
            } else {
                // Handle HTML response
                const htmlContent = await response.text();
                // Your HTML response handling logic here
                // ...
            }
        } else {
            console.error('Failed to fetch subscription status');
        }
    } catch (error) {
        console.error('Error fetching subscription status:', error);
    }
});
