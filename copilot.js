const projectStatus = document.querySelector('#project-status');
const projectButtons = document.querySelectorAll('[data-project]');
const contactForm = document.querySelector('#contact form');
const contactStatus = document.querySelector('#contact-status');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const fields = [nameInput, emailInput, messageInput];
const fieldErrors = {
	name: document.querySelector('#name-error'),
	email: document.querySelector('#email-error'),
	message: document.querySelector('#message-error')
};
const menuToggle = document.querySelector('.menu-toggle');
const navigationMenu = document.querySelector('#primary-navigation');
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card');
const projectImages = document.querySelectorAll('.project-image');
const lightbox = document.querySelector('#project-lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const projectApiUrl = 'https://jsonplaceholder.typicode.com/todos/';
let lastFocusedImage;

function validateField(field) {
	const value = field.value.trim();
	let errorMessage = '';

	if (value === '') {
		errorMessage = `Please enter your ${field.name}.`;
	} else if (field === emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
		errorMessage = 'Please enter a valid email address.';
	}

	const errorElement = fieldErrors[field.name];
	field.toggleAttribute('aria-invalid', Boolean(errorMessage));
	errorElement.textContent = errorMessage;
	errorElement.hidden = !errorMessage;

	return errorMessage === '';
}

fields.forEach((field) => {
	field.addEventListener('input', () => {
		validateField(field);
	});

	field.addEventListener('blur', () => {
		validateField(field);
	});
});

function showImageModal(image) {
	lastFocusedImage = image;
	lightboxImage.src = image.src;
	lightboxImage.alt = image.alt;
	lightboxCaption.textContent = image.alt;
	lightbox.hidden = false;
	document.body.classList.add('modal-open');
	lightboxClose.focus();
}

function closeImageModal() {
	lightbox.hidden = true;
	lightboxImage.src = '';
	document.body.classList.remove('modal-open');
	if (lastFocusedImage) {
		lastFocusedImage.focus();
	}
}

projectImages.forEach((image) => {
	image.addEventListener('click', () => {
		showImageModal(image);
	});

	image.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			showImageModal(image);
		}
	});
});

lightboxClose.addEventListener('click', closeImageModal);

lightbox.addEventListener('click', (event) => {
	if (event.target === lightbox) {
		closeImageModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !lightbox.hidden) {
		closeImageModal();
	}
});

function filterProjects(category) {
	let visibleProjectCount = 0;

	projectCards.forEach((projectCard) => {
		const shouldShow = category === 'all' || projectCard.dataset.category === category;

		projectCard.hidden = !shouldShow;
		if (shouldShow) {
			visibleProjectCount += 1;
		}
	});

	filterButtons.forEach((filterButton) => {
		const isActive = filterButton.dataset.filter === category;

		filterButton.classList.toggle('is-active', isActive);
		filterButton.setAttribute('aria-pressed', String(isActive));
	});

	const selectedFilter = category === 'all' ? 'all projects' : `${category} projects`;
	projectStatus.textContent = `Showing ${visibleProjectCount} ${selectedFilter}.`;
}

filterButtons.forEach((filterButton) => {
	filterButton.addEventListener('click', () => {
		filterProjects(filterButton.dataset.filter);
	});
});

navigationMenu.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => {
		if (navigationMenu.classList.contains('is-open')) {
			toggleNavigationMenu();
		}
	});
});

function toggleNavigationMenu() {
	const isOpen = navigationMenu.classList.toggle('is-open');

	menuToggle.setAttribute('aria-expanded', String(isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

menuToggle.addEventListener('click', toggleNavigationMenu);

function fetchProject(button) {
	const projectName = button.dataset.project;
	const projectId = button.dataset.projectId;
	const request = new XMLHttpRequest();

	button.disabled = true;
	button.textContent = 'Loading...';

	request.open('GET', `${projectApiUrl}${projectId}`, true);
	request.onload = () => {
		if (request.status >= 200 && request.status < 300) {
			projectStatus.textContent = '';
		} else {
			projectStatus.textContent = `Unable to load ${projectName}. Please try again.`;
		}
	};
	request.onerror = () => {
		projectStatus.textContent = `Unable to connect to the server for ${projectName}.`;
	};
	request.onloadend = () => {
		button.disabled = false;
		button.textContent = 'View Project';
	};
	request.send();
}

projectButtons.forEach((button) => {
	button.addEventListener('click', () => {
		projectButtons.forEach((projectButton) => {
			projectButton.removeAttribute('aria-pressed');
		});

		button.setAttribute('aria-pressed', 'true');
		fetchProject(button);
	});
});

contactForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const invalidField = fields.find((field) => !validateField(field));

	if (invalidField) {
		contactStatus.textContent = 'Please enter a valid name, email address, and message.';
		invalidField.focus();
		return;
	}

	fields.forEach((field) => field.removeAttribute('aria-invalid'));
	contactStatus.textContent = '';
	window.alert('Thanks for your message! I will get back to you soon.');
	contactForm.reset();
});
