/* SHOW MENU */
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navMenu = document.getElementById('nav-menu');

/* MENU SHOW */
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.add('show-menu');
        }
    });
}

/* MENU HIDDEN */
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', () =>{
        if (navMenu) {
            navMenu.classList.remove('show-menu');
        }
    })
}

/* REMOVE MENU MOBILE */
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/* CHANGE BACKGROUND HEADER */
const scrollHeader = () =>{
    const header = document.getElementById('header')
    // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
    this.scrollY >= 50 ? header.classList.add('bg-header') 
                       : header.classList.remove('bg-header')
}
window.addEventListener('scroll', scrollHeader)

/* SCROLL SECTIONS ACTIVE LINK */
const sections = document.querySelectorAll('section[id]')
    
const scrollActive = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

        // Check if sectionsClass exists before working with it
        if (sectionsClass) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                sectionsClass.classList.add('active-link');
            } else {
                sectionsClass.classList.remove('active-link');
            }
        }
    });
};

window.addEventListener('scroll', scrollActive)

/* SHOW SCROLL UP */ 
const scrollUp = () =>{
	const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
						: scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/* SCROLL REVEAL ANIMATION */
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
})

sr.reveal('.home__data, .footer__container, .footer__group')
sr.reveal('.home__image', {delay: 700, origin: 'bottom'})
sr.reveal('.logos__img, .program__card, .pricing__card', {interval: 100})
sr.reveal('.choose__img, .calculate__content', {origin: 'left'})
sr.reveal('.choose__content, .calculate__image', {origin: 'right'})

/* DOMContentLoaded event listener */
document.addEventListener("DOMContentLoaded", function () {
    console.log('DOMContentLoaded event fired.');
    /* CALCULATE JS */
    // Check if the current page is the homepage
    if (window.location.pathname === '/homepage.html') {
        const calculateForm = document.getElementById('calculate-form');
        const calculateCm = document.getElementById('calculate-cm');
        const calculateKg = document.getElementById('calculate-kg');
        const calculateMessage = document.getElementById('calculate-message');

        console.log('calculateForm:', calculateForm);
        console.log('calculateCm:', calculateCm);
        console.log('calculateKg:', calculateKg);
        console.log('calculateMessage:', calculateMessage);

        console.log('JavaScript code is running');

        const calculateBmi = (e) => {
            // Prevent form submission
            e.preventDefault();

            console.log('calculateBmi function is executing');
        
            // Check if the fields have a value
            if (calculateCm.value === '' || calculateKg.value === '') {
                // Add and remove color
                calculateMessage.classList.remove('color-green');
                calculateMessage.classList.add('color-red');
        
                // Show Message
                calculateMessage.textContent = 'Fill in the Height and Weight';
        
                // Make the message element visible
                calculateMessage.style.display = 'block';
        
                // Remove Message after three seconds
                setTimeout(() => {
                    calculateMessage.textContent = '';
                    calculateMessage.style.display = 'none'; // Hide the message
                }, 3000);
            } else {
                // BMI Formula
                const cm = calculateCm.value / 100;
                const kg = calculateKg.value;
                const bmi = Math.round(kg / (cm * cm));
        
                console.log(`Calculated BMI: ${bmi}`);
        
                // Show your health status
                if (bmi < 18.5) {
                    // Add color and display message
                    console.log('Skinny');
                    calculateMessage.classList.add('color-green');
                    calculateMessage.textContent = `Your BMI is ${bmi} and you are skinny`;
        
                    // Make the message element visible
                    calculateMessage.style.display = 'block';
                } else if (bmi < 25) {
                    console.log('Healthy');
                    calculateMessage.classList.add('color-green');
                    calculateMessage.textContent = `Your BMI is ${bmi} and you are healthy`;
        
                    // Make the message element visible
                    calculateMessage.style.display = 'block';
                } else {
                    console.log('Overweight');
                    calculateMessage.classList.add('color-green');
                    calculateMessage.textContent = `Your BMI is ${bmi} and you are overweight`;
        
                    // Make the message element visible
                    calculateMessage.style.display = 'block';
                }
        
                // To clear the input field
                calculateCm.value = '';
                calculateKg.value = '';
        
                // Remove message in seconds
                setTimeout(() => {
                    calculateMessage.textContent = '';
                    calculateMessage.style.display = 'none'; // Hide the message
                }, 4000);
            }
        };        

        calculateForm.addEventListener('submit', calculateBmi);

        // This is where you can test the calculateBmi function
        calculateBmi({ preventDefault: () => {} });
    }
});

/* EMAIL JS */
/* const contactForm = document.getElementById('contact-form'),
    contactMessage = document.getElementById('contact-message'),
    contactUser = document.getElementById('contact-user')

const sendEmail = (e) => {
    e.preventDefault()

    //Check if the field has a value
    if(contactUser.value === '') {
        //Add and remove color
        contactMessage.classList.remove('color-green')
        contactMessage.classList.add('color-red')

        //Show message
        contactMessage.textContent = 'You must enter your email!'

        //Remove message in three seconds
        setTimeout(() =>{
            contactMessage.textContent = ''
        }, 3000)
    } else {
        //ServiceID - TemplateID - #form - publicKey
        emailjs.sendForm('service_s9b7ig8', 'template_a4ylnfe', '#contact-form', 'GNBGx7tjiwCVFewcF')
            .then(() =>{
                //Show message and add color
                contactMessage.classList.add('color-green')
                contactMessage.textContent = 'You registered successfully!'

                //Remove after three seconds
                setTimeout(() =>{
                    contactMessage.textContent = ''
                }, 3000)
           }, (error) =>{
                //Mail sending error
                alert('Error! Something has failed!', error)
            })
        //To clear the input field
        contactUser.value = ''
    }
}

contactForm.addEventListener('submit', sendEmail) */