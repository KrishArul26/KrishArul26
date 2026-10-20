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

    // GitHub activity: live stats and contribution graph.
    // The numbers already in the HTML are the fallback if an API is unavailable.
    loadGitHubActivity('KrishArul26');

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

function setStat(name, value) {
    const el = document.querySelector(`[data-gh="${name}"]`);
    if (el && Number.isFinite(value)) el.textContent = value.toLocaleString('en-US');
}

async function loadGitHubActivity(user) {
    const graph = document.querySelector('.gh-graph');

    // Profile and repositories (public GitHub REST API, no token needed)
    try {
        const [profile, repos] = await Promise.all([
            fetch(`https://api.github.com/users/${user}`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
            fetch(`https://api.github.com/users/${user}/repos?per_page=100`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        ]);
        setStat('repos', profile.public_repos);
        setStat('followers', profile.followers);
        setStat('stars', repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0));
    } catch (e) {
        // Keep the fallback numbers from the HTML
    }

    // Contribution calendar for the last 12 months
    try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        setStat('contributions', data.total && data.total.lastYear);

        const days = data.contributions || [];
        if (!days.length) throw new Error('no data');
        const firstWeekday = new Date(days[0].date + 'T00:00:00').getDay();
        const cells = [];
        for (let i = 0; i < firstWeekday; i++) cells.push('<i class="pad"></i>');
        days.forEach(d => {
            const label = `${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`;
            cells.push(`<i class="l${d.level}" title="${label}"></i>`);
        });
        graph.innerHTML = cells.join('');
    } catch (e) {
        graph.closest('.gh-graph-wrap').innerHTML =
            '<a class="gh-user mono" href="https://github.com/KrishArul26" target="_blank" rel="noopener">View the contribution graph on GitHub</a>';
    }
}
