document.addEventListener('DOMContentLoaded', function() {
    window.mainScriptInitialized = true;
    document.body.setAttribute('data-main-script-initialized', 'true');
    
    if (!window.requestAnimationFrame) {
        initRAF();
    }
    
    function initLazyLoad() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        
        if (!lazyImages.length) return;
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        requestAnimationFrame(() => {
                            img.style.opacity = '0';
                            img.style.transition = 'opacity 0.5s ease';
                            
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            
                            img.classList.remove('lazy-load');
                            
                            setTimeout(() => {
                                requestAnimationFrame(() => {
                                    img.style.opacity = '1';
                                });
                            }, 100);
                            
                            imageObserver.unobserve(img);
                        });
                    }
                });
            }, {
                rootMargin: '0px 0px 100px 0px'
            });
            
            lazyImages.forEach(img => {
                if (img.src && !img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = '';
                }
                imageObserver.observe(img);
            });
        } else {
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                }
            });
        }
    }

    initLazyLoad();

    function trackVisit() {
        try {
            const visitData = {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                referrer: document.referrer || '直接访问',
                userAgent: navigator.userAgent.substring(0, 100),
                screen: `${window.screen.width}x${window.screen.height}`
            };
            
            let visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '[]');
            visitHistory.push(visitData);
            
            if (visitHistory.length > 10) {
                visitHistory = visitHistory.slice(-10);
            }
            
            localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
        } catch (error) {
            console.warn('无法保存访问记录:', error);
        }
    }

    setTimeout(trackVisit, 1000);

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.getAttribute('href') === '#' || anchor.hasAttribute('target')) return;
            
            if (!anchor.hasAttribute('data-scroll-initialized')) {
                anchor.setAttribute('data-scroll-initialized', 'true');
                
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const header = document.querySelector('header');
                        const headerHeight = header ? header.offsetHeight : 80;
                        
                        if ('scrollBehavior' in document.documentElement.style) {
                            window.scrollTo({
                                top: targetElement.offsetTop - headerHeight - 20,
                                behavior: 'smooth'
                            });
                        } else {
                            const targetPosition = targetElement.offsetTop - headerHeight - 20;
                            const startPosition = window.pageYOffset;
                            const distance = targetPosition - startPosition;
                            const duration = 500;
                            let start = null;
                            
                            function step(timestamp) {
                                if (!start) start = timestamp;
                                const progress = timestamp - start;
                                window.scrollTo(0, easeInOutCubic(progress, startPosition, distance, duration));
                                if (progress < duration) {
                                    requestAnimationFrame(step);
                                }
                            }
                            
                            function easeInOutCubic(t, b, c, d) {
                                t /= d/2;
                                if (t < 1) return c/2*t*t*t + b;
                                t -= 2;
                                return c/2*(t*t*t + 2) + b;
                            }
                            
                            requestAnimationFrame(step);
                        }
                    }
                });
            }
        });
    }

    initSmoothScroll();

    let ticking = false;
    let scrollProgressHandler = null;

    function updateProgressBar() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
            
            if (scrollPercent >= 100) {
                progressBar.classList.add('hidden');
            } else {
                progressBar.classList.remove('hidden');
            }
        }
        
        const header = document.querySelector('header');
        if (header) {
            if (scrollTop > 50) {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                header.style.boxShadow = '0 2px 30px rgba(0, 212, 255, 0.3)';
            } else {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                header.style.boxShadow = '0 2px 30px rgba(0, 212, 255, 0.2)';
            }
        }
        
        ticking = false;
    }

    function initScrollHandlers() {
        if (scrollProgressHandler) {
            window.removeEventListener('scroll', scrollProgressHandler);
        }
        
        scrollProgressHandler = function() {
            if (!ticking) {
                requestAnimationFrame(updateProgressBar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', scrollProgressHandler, { passive: true });
        updateProgressBar();
    }

    initScrollHandlers();

    function initProgressAnimation() {
        const progressElement = document.getElementById('system-progress');
        if (!progressElement) return;
        
        let progress = 75;
        let lastProgressTime = 0;
        let animationId = null;
        
        function animateProgress(timestamp) {
            if (!lastProgressTime) lastProgressTime = timestamp;
            const elapsed = timestamp - lastProgressTime;
            
            if (elapsed > 200) {
                progress += Math.random() * 2;
                if (progress >= 100) {
                    progress = 100;
                    progressElement.value = progress;
                    const progressText = document.querySelector('.progress-text');
                    const progressGlow = document.querySelector('.progress-glow');
                    if (progressText) progressText.textContent = Math.round(progress) + '%';
                    if (progressGlow) progressGlow.style.width = progress + '%';
                    cancelAnimationFrame(animationId);
                    return;
                }
                
                progressElement.value = progress;
                const progressText = document.querySelector('.progress-text');
                const progressGlow = document.querySelector('.progress-glow');
                if (progressText) progressText.textContent = Math.round(progress) + '%';
                if (progressGlow) progressGlow.style.width = progress + '%';
                lastProgressTime = timestamp;
            }
            
            if (progress < 100) {
                animationId = requestAnimationFrame(animateProgress);
            }
        }
        
        animationId = requestAnimationFrame(animateProgress);
        
        return function() {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }

    let stopProgressAnimation = initProgressAnimation();

    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu');
                const hamburgerBtn = document.getElementById('hamburger-btn');
                const menuOverlay = document.getElementById('menu-overlay');
                
                if (navMenu && hamburgerBtn && menuOverlay) {
                    if (hamburgerBtn.classList.contains('active')) {
                        hamburgerBtn.classList.remove('active');
                        navMenu.classList.remove('active');
                        menuOverlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    }

    initKeyboardNavigation();

    window.addEventListener('beforeunload', function() {
        if (stopProgressAnimation) {
            stopProgressAnimation();
        }
        
        if (scrollProgressHandler) {
            window.removeEventListener('scroll', scrollProgressHandler);
        }
        
        window.mainScriptInitialized = false;
    });
});

function initRAF() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(function() { 
                callback(currTime + timeToCall); 
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}

(function() {
    'use strict';
    
    if (window.browserFeaturesDetected) {
        return;
    }
    
    window.browserFeaturesDetected = true;
    
    const browserFeatures = {
        transform: 'transform' in document.body.style || 'webkitTransform' in document.body.style,
        animation: 'animation' in document.body.style || 'webkitAnimation' in document.body.style,
        grid: 'grid' in document.body.style || 'webkitGrid' in document.body.style,
        flex: 'flex' in document.body.style || 'webkitFlex' in document.body.style,
        backdropFilter: 'backdropFilter' in document.body.style || 'webkitBackdropFilter' in document.body.style
    };
    
    const htmlClass = document.documentElement.className;
    let newClasses = htmlClass;
    
    if (!browserFeatures.transform) newClasses += ' no-transform';
    if (!browserFeatures.animation) newClasses += ' no-animation';
    if (!browserFeatures.grid) newClasses += ' no-cssgrid';
    if (!browserFeatures.flex) newClasses += ' no-flex';
    if (!browserFeatures.backdropFilter) newClasses += ' no-backdrop-filter';
    
    document.documentElement.className = newClasses.trim();
    
    if (!browserFeatures.grid) {
        const style = document.createElement('style');
        style.id = 'grid-fallback-style';
        style.textContent = `
            .features {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                overflow: hidden;
            }
            .feature-card {
                flex: 0 0 calc(33.333% - 20px);
                margin: 10px;
                box-sizing: border-box;
            }
            @media (max-width: 992px) {
                .feature-card {
                    flex: 0 0 calc(50% - 20px);
                }
            }
            @media (max-width: 768px) {
                .feature-card {
                    flex: 0 0 calc(100% - 20px);
                }
            }
        `;
        
        if (!document.getElementById('grid-fallback-style')) {
            document.head.appendChild(style);
        }
    }
    
    if (!browserFeatures.backdropFilter) {
        setTimeout(() => {
            const elements = document.querySelectorAll('.download-message-box');
            elements.forEach(el => {
                if (el) {
                    el.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
                    el.style.backdropFilter = 'none';
                    el.style.webkitBackdropFilter = 'none';
                }
            });
        }, 100);
    }
})();