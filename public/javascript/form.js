document.addEventListener('DOMContentLoaded', function () {
    // Wait for the DOM to be fully loaded

    const form = document.querySelector('.form');

    if (form) {
        // Check if the form element exists

        const name = document.querySelector('.name') || null;
        const email = document.querySelector('.email');
        const password = document.querySelector('.password');
        const submitBtn = document.querySelector('.submit-btn');

        if (name === null) {
            // If the name field is not found, assume it's a login page
            submitBtn.addEventListener('click', () => {
                fetch('/login', {
                    method: 'post',
                    headers: new Headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        validateData(data);
                    });
            });
        } else {
            // If the name field is found, assume it's a register page
            submitBtn.addEventListener('click', () => {
                fetch('/signup', {
                    method: 'post',
                    headers: new Headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        name: name.value,
                        email: email.value,
                        password: password.value,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        validateData(data);
                    });
            });
        }

        const validateData = (data) => {
            if (!data.name) {
                alertBox(data);
            } else {
                sessionStorage.name = data.name;
                sessionStorage.email = data.email;
                location.href = '/profile'; // Redirect to the profile page
            }
        };

        const alertBox = (data) => {
            const alertContainer = document.querySelector('.alert-box');
            const alertMsg = document.querySelector('.alert');
            alertMsg.innerHTML = data;

            alertContainer.style.top = `5%`;
            setTimeout(() => {
                alertContainer.style.top = null;
            }, 5000);
        };
    } else {
        console.error('.form element not found in the HTML');
    }
});
