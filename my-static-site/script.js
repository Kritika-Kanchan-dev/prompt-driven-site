const mobileNav = document.getElementById('mobile-nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('#site-nav a');

navToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
});


navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');

    }
  });
});

