const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const defaultProfilePicUrl = '/public/images/default_profilepic.jpg';


// Check if a profile picture URL is stored in localStorage
const storedProfilePic = localStorage.getItem('profilePicture');

// Function to update the profile picture
function updateProfilePicture(newImageUrl) {
    profileImage.src = newImageUrl;
    localStorage.setItem('profilePicture', newImageUrl);
}

// Load the stored profile picture URL if available
if (storedProfilePic) {
    updateProfilePicture(storedProfilePic);
}

// Add an event listener to the file input
fileInput.addEventListener('change', function () {
    const selectedFile = this.files[0];

    if (selectedFile) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const newImageUrl = e.target.result;
            updateProfilePicture(newImageUrl);
        };

        reader.readAsDataURL(selectedFile);
    }
});

// Function to clear the profile picture
function clearProfilePicture() {
    profileImage.src = 'default_profilepic.jpg'; // Set a default picture
    localStorage.removeItem('profilePicture'); // Remove the stored URL
}

//Ensure that your client-side JavaScript (in profile.js) correctly makes a GET request to the /api/userinfo endpoint
const userNameElement = document.getElementById("user-name");

if (userNameElement) {
    fetch('/api/userinfo')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            const userName = data.name;
            userNameElement.textContent = userName;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}