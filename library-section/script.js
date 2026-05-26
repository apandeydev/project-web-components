/* =========================
   NAVBAR SCROLL
========================= */

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});


/* =========================
   THEME SWITCHER
   (mirrors main site logic)
========================= */

const themes = ['noir', 'forest', 'navy', 'obsidian', 'ash', 'ivory'];
let currentTheme = 0;

const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % themes.length;
        document.documentElement.setAttribute('data-theme', themes[currentTheme]);
    });
}


/* =========================
   ANIMATED COUNTERS
========================= */

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// Trigger counters when they enter view
const counterEls = document.querySelectorAll('.meta-number[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));


/* =========================
   SCROLL REVEAL
========================= */

const revealEls = document.querySelectorAll('.scroll-reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* =========================
   BOOK CARD REVEAL
   (staggered on load)
========================= */

const bookCards = document.querySelectorAll('.book-card');

bookCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`;

    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100 + i * 100);
});


/* =========================
   FILTER BAR
========================= */

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        bookCards.forEach(card => {
            if (filter === 'all') {
                card.classList.remove('hidden');
            } else {
                const cats = card.getAttribute('data-category') || '';
                if (cats.includes(filter)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    });
});