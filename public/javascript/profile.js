document.addEventListener('DOMContentLoaded', async function () {
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('subscription-video');

    try {
        const response = await fetch('/profile/check-subscription', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });        

        if (response.ok) {
            const data = await response.json();
            const isSubscribed = data.isSubscribed;

            if (isSubscribed) {
                // Load the subscribed user's video content
                video.src = '/videos/video.mp4';
                video.controls = true;
                videoContainer.style.display = 'block';
            } else {
                // Display a message for non-subscribed users
                videoContainer.innerHTML = '<p>Sorry, this video is only available to subscribed users.</p>';
                videoContainer.style.display = 'block';
            }
        } else {
            console.error('Failed to fetch subscription status');
        }
    } catch (error) {
        console.error('Error fetching subscription status:', error);
    }
});


//document.addEventListener('DOMContentLoaded', async function () {
//    const videoContainer = document.getElementById('video-container');
//    const video = document.getElementById('subscription-video');

//    try {
//        const response = await fetch('/profile/check-subscription', {
//            method: 'GET',
//            headers: {
//                'Accept': 'application/json',
//            },
//        });

//        if (response.ok) {
//            const data = await response.json();
//            const isSubscribed = data.isSubscribed;

//            if (isSubscribed) {
//                // Load the subscribed user's video content
//                video.src = '/videos/video.mp4';
//                video.controls = true;
//                videoContainer.style.display = 'block';
//            } else {
                // Display a message for non-subscribed users
//                videoContainer.innerHTML = '<p>Sorry, this video is only available to subscribed users.</p>';
//                videoContainer.style.display = 'block';
//            }
//        } else {
//            console.error('Failed to fetch subscription status');
//        }
//    } catch (error) {
//        console.error('Error fetching subscription status:', error);
//    }
//});

// Assuming you have a global variable 'isSubscribed' that holds the subscription status
// This variable can be set in your server-side route handler

//document.addEventListener('DOMContentLoaded', function () {
//    const videoContainer = document.getElementById('video-container');

//    if (isSubscribed) {
        // Load the subscribed user's video content
//        videoContainer.innerHTML = '<iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>';
//    } else {
        // Display a message or alternative content for non-subscribed users
//        videoContainer.innerHTML = '<p>Sorry, this video is only available to subscribed users.</p>';
//    }
//});
