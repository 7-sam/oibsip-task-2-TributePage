/**
 * Ratan Tata Tribute Page - JavaScript Interactivity
 * Features: Preloader, Sticky Nav, Scroll Progress, Scroll-reveal (AOS),
 *           Animated Counters, Auto-carousel, Custom Lightbox,
 *           Flip Card Fallbacks, Interactive Local Storage Tribute Wall.
 * Author: AI Pair Programmer (Antigravity)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. DOM Element Selectors (Declared at top to avoid ReferenceErrors during early events)
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const navLinks = document.querySelectorAll('.nav-link, .nav-btn');
    const sections = document.querySelectorAll('section');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const menuLinks = document.querySelectorAll('.nav-menu a');
    const backToTopBtn = document.getElementById('backToTop');
    
    // Lightbox Selectors
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // Tribute Wall Selectors
    const tributeForm = document.getElementById('tributeForm');
    const tributeName = document.getElementById('tributeName');
    const tributeMessage = document.getElementById('tributeMessage');
    const layFlowerCheckbox = document.getElementById('layFlower');
    const tributeWall = document.getElementById('tributeWall');
    const tributeCount = document.getElementById('tributeCount');

    // Section specific items
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const statNumbers = document.querySelectorAll('.info-num');
    const philanthropySection = document.getElementById('philanthropy');
    const slides = document.querySelectorAll('.quote-slide');
    const dots = document.querySelectorAll('.dot');
    const masonryItems = document.querySelectorAll('.masonry-item');
    const principleCards = document.querySelectorAll('.principle-card');
    // ==========================================================================
    // 1b. Safe Storage Helper (Handles environments where localStorage throws SecurityError or is disabled)
    // ==========================================================================
    const getSafeStorage = () => {
        let storage;
        try {
            storage = window.localStorage;
            if (storage) {
                const testKey = '__storage_test__';
                storage.setItem(testKey, testKey);
                storage.removeItem(testKey);
            }
        } catch (e) {
            storage = null;
        }

        const memoryStorage = {};
        return {
            getItem: (key) => {
                if (storage) {
                    try {
                        return storage.getItem(key);
                    } catch (e) {
                        console.warn("Failed to get item from localStorage, falling back to memory:", e);
                    }
                }
                return memoryStorage[key] || null;
            },
            setItem: (key, value) => {
                if (storage) {
                    try {
                        storage.setItem(key, value);
                        return;
                    } catch (e) {
                        console.warn("Failed to set item in localStorage, falling back to memory:", e);
                    }
                }
                memoryStorage[key] = String(value);
            }
        };
    };

    const safeStorage = getSafeStorage();

    // ==========================================================================
    // 2. Preloader Screen Handler (Robust state check)
    // ==========================================================================
    let preloaderHidden = false;

    const hidePreloader = () => {
        if (preloaderHidden) return;
        preloaderHidden = true;
        
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800); // Matches transition duration in CSS
        }
    };

    // If page is already loaded (from cache or fast local disk), hide preloader
    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 800);
    } else {
        window.addEventListener('load', () => {
            setTimeout(hidePreloader, 800);
        });
    }

    // Ultimate fallback (preloader will hide after 3 seconds max, no matter what)
    setTimeout(hidePreloader, 3000);


    // ==========================================================================
    // 3. Scroll Indicators, Sticky Navbar & Active Links
    // ==========================================================================
    const handleScrollEffects = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Sticky Navigation shadow/shading
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Scroll Progress Bar
        const totalScrollable = docHeight - windowHeight;
        if (scrollProgress && totalScrollable > 0) {
            const percentage = (scrollY / totalScrollable) * 100;
            scrollProgress.style.width = `${percentage}%`;
        }

        // Active Section Navigation Link Highlighting
        let currentSectionId = '';
        if (sections) {
            sections.forEach(section => {
                if (section) {
                    const sectionTop = section.offsetTop - 120; // offset for sticky nav header
                    const sectionHeight = section.offsetHeight;
                    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                        currentSectionId = section.getAttribute('id') || '';
                    }
                }
            });
        }

        if (navLinks) {
            navLinks.forEach(link => {
                if (link) {
                    link.classList.remove('active-link');
                    if (currentSectionId && link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active-link');
                    }
                }
            });
        }

        // Show/Hide Back to Top button
        if (backToTopBtn) {
            if (scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    };

    // Listen to scroll events
    window.addEventListener('scroll', handleScrollEffects);
    
    // Initial call to sync states on load
    handleScrollEffects();


    // ==========================================================================
    // 4. Mobile Hamburger Menu Toggle
    // ==========================================================================
    const toggleMenu = () => {
        if (hamburgerBtn) hamburgerBtn.classList.toggle('active');
        if (navMenu) navMenu.classList.toggle('active');
    };

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked
    if (menuLinks) {
        menuLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', () => {
                    if (navMenu && navMenu.classList.contains('active')) {
                        toggleMenu();
                    }
                });
            }
        });
    }


    // ==========================================================================
    // 5. Scroll Reveal Animations (Custom Intersection Observer)
    // ==========================================================================
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once for performance
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of element is in view
        rootMargin: '0px 0px -50px 0px'
    });

    if (revealElements) {
        revealElements.forEach(element => {
            if (element) {
                revealObserver.observe(element);
            }
        });
    }


    // ==========================================================================
    // 6. Philanthropy Stats Counter Animation
    // ==========================================================================
    let countersStarted = false;

    const startCounters = () => {
        if (!statNumbers) return;
        statNumbers.forEach(stat => {
            if (!stat) return;
            const targetAttr = stat.getAttribute('data-target');
            const target = targetAttr ? parseInt(targetAttr, 10) : 0;
            if (isNaN(target) || target <= 0) return;
            
            const duration = 1800; // Total duration in ms
            const stepTime = Math.max(Math.floor(duration / target), 10);
            let current = 0;

            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = current;
                }
            }, stepTime);
        });
    };

    // Trigger counters only when the philanthropy section enters the screen
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                startCounters();
                countersStarted = true;
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (philanthropySection) {
        counterObserver.observe(philanthropySection);
    }


    // ==========================================================================
    // 7. Inspirational Quotes Auto Carousel
    // ==========================================================================
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
        if (!slides || !dots || slides.length === 0 || dots.length === 0) return;
        slides.forEach(slide => { if (slide) slide.classList.remove('active'); });
        dots.forEach(dot => { if (dot) dot.classList.remove('active'); });
        
        if (slides[index]) slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    };

    const nextSlide = () => {
        if (!slides || slides.length === 0) return;
        let index = currentSlide + 1;
        if (index >= slides.length) {
            index = 0;
        }
        showSlide(index);
    };

    const startSlideShow = () => {
        if (!slides || slides.length === 0) return;
        slideInterval = setInterval(nextSlide, 6000); // Changes quotes every 6 seconds
    };

    const resetSlideShow = () => {
        clearInterval(slideInterval);
        startSlideShow();
    };

    // Manual dots controls
    if (dots) {
        dots.forEach(dot => {
            if (dot) {
                dot.addEventListener('click', (e) => {
                    const indexAttr = e.target.getAttribute('data-index');
                    const index = indexAttr ? parseInt(indexAttr, 10) : 0;
                    if (!isNaN(index)) {
                        showSlide(index);
                        resetSlideShow();
                    }
                });
            }
        });
    }

    // Initialize slide rotation
    startSlideShow();


    // ==========================================================================
    // 8. Premium Masonry Image Lightbox Gallery
    // ==========================================================================
    let currentImgIndex = 0;
    const galleryImages = [];

    // Map all images for navigation indexes
    if (masonryItems) {
        masonryItems.forEach((item, index) => {
            if (item) {
                const img = item.querySelector('img');
                if (img) {
                    const caption = item.getAttribute('data-caption');
                    galleryImages.push({
                        src: img.getAttribute('src') || '',
                        caption: caption || img.getAttribute('alt') || ''
                    });

                    item.addEventListener('click', () => {
                        openLightbox(index);
                    });
                }
            }
        });
    }

    const openLightbox = (index) => {
        currentImgIndex = index;
        updateLightboxContent();
        if (lightbox) lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    };

    const closeLightbox = () => {
        if (lightbox) lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Unlock scrolling
    };

    const updateLightboxContent = () => {
        const activeImage = galleryImages[currentImgIndex];
        if (activeImage) {
            if (lightboxImg) lightboxImg.src = activeImage.src;
            if (lightboxCaption) lightboxCaption.textContent = activeImage.caption;
        }
    };

    const showPrevImg = () => {
        if (galleryImages.length === 0) return;
        currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxContent();
    };

    const showNextImg = () => {
        if (galleryImages.length === 0) return;
        currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
        updateLightboxContent();
    };

    // Lightbox Event Listeners
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevImg(); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextImg(); });
    
    // Close lightbox when clicking outside image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard support for Lightbox controls
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevImg();
            if (e.key === 'ArrowRight') showNextImg();
        }
    });


    // ==========================================================================
    // 9. 3D Leadership Cards Mobile Flip Support
    // ==========================================================================
    if (principleCards) {
        principleCards.forEach(card => {
            if (card) {
                card.addEventListener('click', () => {
                    card.classList.toggle('flipped');
                });
            }
        });
    }


    // ==========================================================================
    // 10. Interactive Tribute Wall (Local Storage Integrated)
    // ==========================================================================
    // Default tributes to populate initially
    const defaultTributes = [
        {
            name: "A Proud Citizen",
            message: "Ratan Tata was not just a businessman, but a pure human being who kept the nation before anything else. His humility is a lesson for generations to come.",
            flower: true,
            timestamp: new Date().toLocaleDateString()
        },
        {
            name: "An Entrepreneur",
            message: "He showed the world that business values and human compassion can walk hand in hand. His personal investments in youth startups changed our ecosystem forever.",
            flower: false,
            timestamp: new Date().toLocaleDateString()
        },
        {
            name: "Dr. Ananya Sharma",
            message: "Tata Memorial Hospital represents Ratan Tata's true legacy. Giving millions of cancer patients high-quality care is a service that cannot be priced. Rest in peace, sir.",
            flower: true,
            timestamp: new Date().toLocaleDateString()
        }
    ];

    const getTributes = () => {
        const stored = safeStorage.getItem('tributeList');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (err) {
                console.error("Error parsing stored tributes:", err);
            }
        }
        // Save initial default tributes if nothing is found or parsing fails
        safeStorage.setItem('tributeList', JSON.stringify(defaultTributes));
        return defaultTributes;
    };

    const renderTributeWall = () => {
        const tributes = getTributes();
        if (tributeCount) tributeCount.textContent = tributes.length;
        if (tributeWall) {
            tributeWall.innerHTML = '';

            tributes.forEach((tribute) => {
                if (tribute) {
                    const card = document.createElement('div');
                    card.className = 'tribute-card-item';
                    
                    let flowerHTML = '';
                    if (tribute.flower) {
                        flowerHTML = `<span class="tribute-flower"><i class="fa-rose fa-solid"></i> Laid a flower</span>`;
                    }

                    card.innerHTML = `
                        <div class="tribute-card-header">
                            <span class="tribute-card-name">${escapeHTML(tribute.name || '')}</span>
                            ${flowerHTML}
                        </div>
                        <p class="tribute-card-text">"${escapeHTML(tribute.message || '')}"</p>
                    `;
                    
                    tributeWall.appendChild(card);
                }
            });
        }
    };

    const escapeHTML = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Form submission event
    if (tributeForm) {
        tributeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = tributeName ? tributeName.value.trim() : '';
            const message = tributeMessage ? tributeMessage.value.trim() : '';
            const flower = layFlowerCheckbox ? layFlowerCheckbox.checked : false;

            if (name && message) {
                const newTribute = {
                    name: name,
                    message: message,
                    flower: flower,
                    timestamp: new Date().toLocaleDateString()
                };

                const tributes = getTributes();
                // Insert at the beginning of the array so new messages appear at the top
                tributes.unshift(newTribute);
                safeStorage.setItem('tributeList', JSON.stringify(tributes));

                // Clear inputs
                if (tributeName) tributeName.value = '';
                if (tributeMessage) tributeMessage.value = '';
                if (layFlowerCheckbox) layFlowerCheckbox.checked = false;

                // Re-render
                renderTributeWall();
                
                // Scroll wall to top to view new tribute
                if (tributeWall) tributeWall.scrollTop = 0;
            }
        });
    }

    // Initialize Tribute Wall
    renderTributeWall();


    // ==========================================================================
    // 11. Back to Top Button Action
    // ==========================================================================
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
