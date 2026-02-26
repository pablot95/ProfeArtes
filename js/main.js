document.addEventListener('DOMContentLoaded', function () {

    var nav = document.querySelector('.main-nav');
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-links');
    var body = document.body;
    var lightbox = document.querySelector('.lightbox');
    var lightboxImg = lightbox.querySelector('.lightbox-img');
    var lightboxTitle = lightbox.querySelector('.lightbox-title');
    var lightboxClose = lightbox.querySelector('.lightbox-close');
    var lightboxPrev = lightbox.querySelector('.lightbox-prev');
    var lightboxNext = lightbox.querySelector('.lightbox-next');
    var galleryItems = [];
    var currentIndex = 0;

    function updateGalleryItems() {
        galleryItems = Array.from(document.querySelectorAll('.gallery-item')).filter(function (item) {
            return item.style.display !== 'none';
        });
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-delay')) || 0;
                setTimeout(function () {
                    el.classList.add('visible');
                }, delay);
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.anim').forEach(function (el) {
        observer.observe(el);
    });

    var lastScroll = 0;
    window.addEventListener('scroll', function () {
        var scrollY = window.scrollY;
        if (scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }, { passive: true });

    toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
        body.classList.toggle('menu-open');
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            toggle.classList.remove('active');
            menu.classList.remove('open');
            body.classList.remove('menu-open');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) {
                var offset = nav.offsetHeight + 10;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    var sections = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    function highlightNav() {
        var scrollPos = window.scrollY + 250;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            navAnchors.forEach(function (a) {
                if (a.getAttribute('href') === '#' + id) {
                    if (scrollPos >= top && scrollPos < top + height) {
                        a.classList.add('active');
                    } else {
                        a.classList.remove('active');
                    }
                }
            });
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();

    function openLightbox(index) {
        updateGalleryItems();
        if (index < 0 || index >= galleryItems.length) return;
        currentIndex = index;
        var item = galleryItems[index];
        var img = item.querySelector('img');
        var title = item.getAttribute('data-title') || '';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title;
        lightbox.classList.add('active');
        body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        body.style.overflow = '';
    }

    function nextImage() {
        updateGalleryItems();
        currentIndex = (currentIndex + 1) % galleryItems.length;
        var item = galleryItems[currentIndex];
        var img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = item.getAttribute('data-title') || '';
    }

    function prevImage() {
        updateGalleryItems();
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        var item = galleryItems[currentIndex];
        var img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = item.getAttribute('data-title') || '';
    }

    document.querySelector('.gallery-grid').addEventListener('click', function (e) {
        var item = e.target.closest('.gallery-item');
        if (!item) return;
        updateGalleryItems();
        var idx = galleryItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    var filterBtns = document.querySelectorAll('.filter-btn');
    var allGalleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.getAttribute('data-filter');

            allGalleryItems.forEach(function (item) {
                var category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    item.style.display = '';
                    setTimeout(function () {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 30);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(function () {
                        item.style.display = 'none';
                    }, 350);
                }
            });
        });
    });

    var hero = document.querySelector('.hero');
    var heroContent = hero ? hero.querySelector('.hero-content') : null;
    var scrollIndicator = document.querySelector('.scroll-indicator');
    var heroHeight = hero ? hero.offsetHeight : 0;

    function handleHeroParallax() {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var scrolled = window.scrollY;
                    var progress = Math.min(scrolled / (heroHeight * 0.7), 1);

                    if (heroContent) {
                        heroContent.style.transform = 'translateY(' + (scrolled * -0.15) + 'px)';
                        heroContent.style.opacity = 1 - progress * 1.3;
                    }

                    if (scrollIndicator) {
                        scrollIndicator.style.opacity = 1 - progress * 3;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', function () {
            heroHeight = hero ? hero.offsetHeight : 0;
        }, { passive: true });
    }

    if (hero) handleHeroParallax();

    var touchStartX = 0;
    var touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 60) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }, { passive: true });

});