document.getElementById('year').textContent = new Date().getFullYear();

// Mobile navigation toggle
const hamburger = document.querySelector('.nav__hamburger');
const nav = document.querySelector('.nav');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
    const isOpen = document.body.classList.contains('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav__links a').forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', false);
  });
});

// Scroll-in animations via IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Smooth scroll polyfill for older browsers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
