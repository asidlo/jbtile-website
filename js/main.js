/* ============================================
   JB TILE LLC — MAIN JAVASCRIPT
   Gallery filtering, lightbox, navigation,
   scroll animations, lazy loading
   ============================================ */

(function () {
    'use strict';

    // ---- DOM REFS ----
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const galleryGrid = document.getElementById('gallery-grid');
    const filtersContainer = document.querySelector('.gallery-filters');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxBackdrop = document.querySelector('.lightbox-backdrop');

    // ---- STATE ----
    let galleryData = null;
    let allImages = [];         // flat list of { src, alt, category }
    let filteredImages = [];    // currently visible images
    let lightboxIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // ---- INIT ----
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initHeader();
        initMobileNav();
        initScrollAnimations();
        initSmoothScroll();
        initFooterYear();
        loadGallery();
    }

    // ============================================
    // HEADER — scroll-aware style
    // ============================================
    function initHeader() {
        function checkScroll() {
            if (window.scrollY > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        checkScroll();
        window.addEventListener('scroll', checkScroll, { passive: true });
    }

    // ============================================
    // MOBILE NAV
    // ============================================
    function initMobileNav() {
        menuToggle.addEventListener('click', toggleMobileNav);

        // Close on link click
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMobileNav);
        });

        // Close on ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileNav();
            }
        });
    }

    function toggleMobileNav() {
        var isOpen = mobileNav.classList.contains('active');
        if (isOpen) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    function openMobileNav() {
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('no-scroll');
    }

    function closeMobileNav() {
        mobileNav.classList.remove('active');
        mobileNav.setAttribute('aria-hidden', 'true');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('no-scroll');
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (!target) return;
                e.preventDefault();
                var headerHeight = header.offsetHeight;
                var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            });
        });
    }

    // ============================================
    // SCROLL ANIMATIONS (IntersectionObserver)
    // ============================================
    function initScrollAnimations() {
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var elements = document.querySelectorAll('.anim-on-scroll');

        if (prefersReducedMotion) {
            return;
        }

        // Mark elements for animation (hiding them via CSS .will-animate)
        elements.forEach(function (el) {
            el.classList.add('will-animate');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        });

        elements.forEach(function (el) {
            observer.observe(el);
        });

        // Fallback: reveal any still-hidden elements after 3 seconds
        setTimeout(function () {
            elements.forEach(function (el) {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                }
            });
        }, 3000);
    }

    // ============================================
    // FOOTER YEAR
    // ============================================
    function initFooterYear() {
        var yearEl = document.getElementById('footer-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    // ============================================
    // GALLERY — load data, build grid, filter
    // ============================================
    function loadGallery() {
        fetch('js/gallery-data.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                galleryData = data;
                buildFilterButtons(data.categories);
                buildGalleryItems(data.categories);
                initLightbox();
            })
            .catch(function (err) {
                console.error('Failed to load gallery data:', err);
                galleryGrid.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);padding:2rem;">Gallery loading...</p>';
            });
    }

    function buildFilterButtons(categories) {
        categories.forEach(function (cat) {
            var btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', cat.id);
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', 'false');
            btn.textContent = cat.name;
            filtersContainer.appendChild(btn);
        });

        // Attach filter handlers
        filtersContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                handleFilter(this.getAttribute('data-filter'));
                // Update active state
                filtersContainer.querySelectorAll('.filter-btn').forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
            });
        });
    }

    function buildGalleryItems(categories) {
        allImages = [];
        categories.forEach(function (cat) {
            cat.images.forEach(function (img) {
                allImages.push({
                    src: img.src,
                    alt: img.alt,
                    category: cat.id,
                    categoryName: cat.name
                });
            });
        });

        filteredImages = allImages.slice();
        renderGallery(filteredImages);
    }

    function renderGallery(images) {
        galleryGrid.innerHTML = '';
        images.forEach(function (img, index) {
            var item = document.createElement('div');
            item.className = 'gallery-item fade-in';
            item.setAttribute('data-category', img.category);
            item.setAttribute('data-index', index);
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', 'View ' + img.alt);
            item.style.animationDelay = (index * 0.08) + 's';

            item.innerHTML =
                '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy" width="600" height="400">' +
                '<div class="gallery-item-overlay" aria-hidden="true">' +
                '<span class="gallery-item-category">' + img.categoryName + '</span>' +
                '</div>';

            item.addEventListener('click', function () {
                openLightbox(index);
            });
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });

            galleryGrid.appendChild(item);
        });
    }

    function handleFilter(filter) {
        if (filter === 'all') {
            filteredImages = allImages.slice();
        } else {
            filteredImages = allImages.filter(function (img) {
                return img.category === filter;
            });
        }
        renderGallery(filteredImages);
    }

    // ============================================
    // LIGHTBOX
    // ============================================
    function initLightbox() {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxBackdrop.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', prevImage);
        lightboxNext.addEventListener('click', nextImage);

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        });

        // Touch swipe support
        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) < 50) return;
        if (diff > 0) {
            nextImage();
        } else {
            prevImage();
        }
    }

    function openLightbox(index) {
        lightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        // Return focus to the gallery item
        var items = galleryGrid.querySelectorAll('.gallery-item');
        if (items[lightboxIndex]) {
            items[lightboxIndex].focus();
        }
    }

    function prevImage() {
        lightboxIndex = (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
        updateLightboxImage();
    }

    function nextImage() {
        lightboxIndex = (lightboxIndex + 1) % filteredImages.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        var img = filteredImages[lightboxIndex];
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + filteredImages.length;

        // Hide nav if only one image
        var showNav = filteredImages.length > 1;
        lightboxPrev.style.display = showNav ? '' : 'none';
        lightboxNext.style.display = showNav ? '' : 'none';
    }

})();
