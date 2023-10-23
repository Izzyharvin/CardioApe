// Inside your Subscription Videos script tag
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/check-subscription'); // Replace with your actual API endpoint
        const data = await response.json();
        const isSubscribed = data.isSubscribed;

        // Check the subscription status and update the UI
        const subscriptionSection = document.getElementById('subscription-section');
        const videoContainer = document.getElementById('video-container');
        const nonSubscriptionSection = document.getElementById('non-subscription-section');

        if (isSubscribed) {
            // User is subscribed, show the subscription section and hide the non-subscription section
            subscriptionSection.style.display = 'block';
            nonSubscriptionSection.style.display = 'none';
        } else {
            // User is not subscribed, hide the video and show the non-subscription section
            videoContainer.style.display = 'none';
            nonSubscriptionSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching subscription status:', error);
    }
});
