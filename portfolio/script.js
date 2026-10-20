document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = navLinks.querySelectorAll('a');

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
    });
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Navbar border once the page is scrolled
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active-section indicator in the navigation
    const sections = [...links]
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    // Reveal cards as they scroll into view
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
