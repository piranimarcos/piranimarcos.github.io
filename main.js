// ========== Floating Tech Icons ==========
const floatingIconsContainer = document.getElementById('floatingIcons');
const techIcons = [
    'fa-lightbulb', 'fa-bolt', 'fa-microchip', 'fa-code',
    'fa-cog', 'fa-database', 'fa-server', 'fa-network-wired',
    'fa-memory', 'fa-hdd', 'fa-wifi', 'fa-plug',
    'fa-terminal', 'fa-laptop-code', 'fa-robot', 'fa-brain'
];

function createFloatingIcons() {
    for (let i = 0; i < 30; i++) {
        const icon = document.createElement('i');
        const randomIcon = techIcons[Math.floor(Math.random() * techIcons.length)];
        icon.className = `fas ${randomIcon} floating-icon`;

        // Random position
        icon.style.left = Math.random() * 100 + '%';
        icon.style.top = Math.random() * 100 + '%';

        // Random animation delay and duration
        icon.style.animationDelay = Math.random() * 20 + 's';
        icon.style.animationDuration = (15 + Math.random() * 15) + 's';

        // Random size
        icon.style.fontSize = (16 + Math.random() * 20) + 'px';

        floatingIconsContainer.appendChild(icon);
    }
}
createFloatingIcons();

// ========== Particles Canvas ==========
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Track mouse
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                this.x -= dx * 0.02;
                this.y -= dy * 0.02;
            }
        }

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = (1 - distance / 120) * 0.15;
                ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ========== Mobile Menu Toggle ==========
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== Header Scroll Effect ==========
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ========== Scroll Animations ==========
const fadeElements = document.querySelectorAll('.fade-in');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

fadeElements.forEach(el => observer.observe(el));

// ========== Form Submission ==========
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    const whatsappMessage = `Hola Marcos, soy ${name}.\n\nEmail: ${email}\n\nMensaje: ${message}`;
    const whatsappURL = `https://wa.me/549336561615?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, '_blank');
    contactForm.reset();
});

// ========== Smooth Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});