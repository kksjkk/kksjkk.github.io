// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 标记主脚本已初始化
    window.mainScriptInitialized = true;
    document.body.setAttribute('data-main-script-initialized', 'true');
    
    // 检查登录状态并更新导航栏
    function checkLoginAndUpdateNav() {
        const savedUser = localStorage.getItem('admin_user');
        const navMenu = document.querySelector('.nav-menu');
        
        if (savedUser && navMenu) {
            try {
                const user = JSON.parse(savedUser);
                const username = user.username || user.full_name || '用户';
                
                const loginLinks = navMenu.querySelectorAll('a[href="login.html"]');
                loginLinks.forEach(link => {
                    if (user.role === 'admin' || user.role === 'moderator') {
                        link.innerHTML = `<span class="btn-icon">👤</span> ${username} (管理)`;
                        link.href = 'admin.html';
                        link.title = '进入管理后台';
                    } else {
                        link.innerHTML = `<span class="btn-icon">👤</span> ${username}`;
                        link.href = 'profile.html';
                        link.title = '查看个人中心';
                    }
                    link.classList.add('user-status');
                    link.classList.remove('auth-link');
                });
            } catch (error) {
                console.error('解析用户信息失败:', error);
            }
        } else {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                const existingAuthLink = navMenu.querySelector('a[href="login.html"]');
                if (!existingAuthLink) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <a href="login.html" class="scifi-link auth-link" id="register-btn" aria-label="注册或登录">
                            <span class="btn-icon">🔐</span> 注册/登录
                        </a>
                    `;
                    navMenu.appendChild(listItem);
                }
            }
        }
    }
    
    setTimeout(checkLoginAndUpdateNav, 100);
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'admin_user') {
            setTimeout(checkLoginAndUpdateNav, 100);
        }
    });
    
    // 统一的requestAnimationFrame兼容性处理
    if (!window.requestAnimationFrame) {
        initRAF();
    }
    
    // 移动端菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // 初始化菜单状态
    function initMenuState() {
        if (navToggle && navMenu) {
            if (window.innerWidth <= 768) {
                navMenu.style.display = 'none';
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.style.display = 'flex';
                navToggle.style.visibility = 'visible';
                navToggle.style.opacity = '1';
                navToggle.style.pointerEvents = 'auto';
            } else {
                navMenu.style.display = 'flex';
                navToggle.setAttribute('aria-expanded', 'true');
                navToggle.style.display = 'none';
            }
        }
    }
    
    // 切换菜单函数
    function toggleMenu(forceClose = false) {
        if (!navToggle || !navMenu) return;
        
        const isActive = navMenu.classList.contains('active') && !forceClose;
        const spans = navToggle.querySelectorAll('span');
        
        requestAnimationFrame(() => {
            if (!isActive || forceClose) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                navMenu.style.display = 'flex';
                
                void navMenu.offsetHeight;
                
                if (!forceClose) {
                    navMenu.classList.add('active');
                    navToggle.setAttribute('aria-expanded', 'true');
                }
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                
                setTimeout(() => {
                    if (!navMenu.classList.contains('active')) {
                        navMenu.style.display = 'none';
                    }
                }, 300);
            }
        });
    }
    
    // 菜单系统初始化
    if (navToggle && navMenu) {
        if (!navToggle.hasAttribute('data-menu-initialized')) {
            navToggle.setAttribute('data-menu-initialized', 'true');
            
            navToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });

            navMenu.querySelectorAll('a, button').forEach(item => {
                item.addEventListener('click', function(e) {
                    if (this.id === 'download-btn' || this.id === 'theme-toggle') {
                        return;
                    }
                    
                    if (window.innerWidth <= 768) {
                        toggleMenu(true);
                    }
                });
            });

            document.addEventListener('click', function(e) {
                if (navMenu.classList.contains('active') && 
                    !navMenu.contains(e.target) && 
                    !navToggle.contains(e.target)) {
                    toggleMenu(true);
                }
            });
        }
    }
    
    initMenuState();

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                initMenuState();
                if (window.innerWidth > 768 && navMenu) {
                    navMenu.style.display = 'flex';
                    navMenu.classList.remove('active');
                    if (navToggle) {
                        const spans = navToggle.querySelectorAll('span');
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            });
        }, 100);
    });

    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme');
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.textContent = '☀️ 亮色模式';
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.textContent = '🌓 暗色模式';
        }
    }

    if (!currentTheme) {
        currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    }

    applyTheme(currentTheme);

    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        try {
            colorSchemeQuery.addEventListener('change', function(e) {
                if (!localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    applyTheme(newTheme);
                }
            });
        } catch (e) {
            colorSchemeQuery.addListener(function(e) {
                if (!localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    applyTheme(newTheme);
                }
            });
        }
    }

    if (themeToggle && !themeToggle.hasAttribute('data-theme-initialized')) {
        themeToggle.setAttribute('data-theme-initialized', 'true');
        
        themeToggle.addEventListener('click', function() {
            requestAnimationFrame(() => {
                document.body.style.opacity = '0.8';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    const isDarkMode = document.body.classList.contains('dark-mode');
                    const newTheme = isDarkMode ? 'light' : 'dark';
                    
                    document.body.classList.toggle('dark-mode');
                    localStorage.setItem('theme', newTheme);
                    
                    if (isDarkMode) {
                        themeToggle.textContent = '☀️ 亮色模式';
                    } else {
                        themeToggle.textContent = '🌓 暗色模式';
                    }
                    
                    setTimeout(() => {
                        document.body.style.opacity = '1';
                    }, 50);
                }, 300);
            });
        });
    }

    // 图片懒加载
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

    // 访问统计
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

    // 平滑滚动
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
                        
                        if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                            toggleMenu(true);
                        }
                    }
                });
            }
        });
    }

    initSmoothScroll();

    // 高性能滚动处理
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

    // 初始化进度条动画
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

    // 注意：原有的下载模拟功能已移除，现在使用<a>标签直接下载
    // 下载按钮已修改为指向 https://kksjkk.github.io/signed.apk

    // 键盘导航支持
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                toggleMenu(true);
                if (navToggle) navToggle.focus();
            }
            
            if (e.key === 'Tab' && navMenu && navMenu.classList.contains('active')) {
                const focusableElements = navMenu.querySelectorAll('a, button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    initKeyboardNavigation();

    // 改善可访问性
    function improveAccessibility() {
        if (navToggle) {
            navToggle.setAttribute('aria-label', '切换导航菜单');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'nav-menu');
        }
        
        if (navMenu) {
            navMenu.id = 'nav-menu';
            navMenu.setAttribute('aria-label', '主导航');
        }
        
        const progressElement = document.getElementById('system-progress');
        if (progressElement) {
            progressElement.setAttribute('aria-label', '系统加载进度');
            progressElement.setAttribute('aria-valuemin', '0');
            progressElement.setAttribute('aria-valuemax', '100');
            progressElement.setAttribute('aria-valuenow', '75');
        }
    }

    improveAccessibility();

    // 页面卸载前清理
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

// requestAnimationFrame兼容性处理函数
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

// 浏览器兼容性检测和修复
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

// 用户权限检查函数
function checkUserAccess(requiredRole) {
    const savedUser = localStorage.getItem('admin_user');
    if (!savedUser) {
        return false;
    }
    
    try {
        const user = JSON.parse(savedUser);
        
        if (requiredRole === 'admin') {
            return user.role === 'admin';
        } else if (requiredRole === 'moderator') {
            return user.role === 'admin' || user.role === 'moderator';
        } else if (requiredRole === 'user') {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('解析用户信息失败:', error);
        return false;
    }
}

// 页面跳转前的权限检查
function navigateWithPermissionCheck(url, requiredRole) {
    if (checkUserAccess(requiredRole)) {
        window.location.href = url;
    } else {
        alert('抱歉，您没有权限访问该页面。');
        
        if (!localStorage.getItem('admin_user')) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// 用户信息获取函数
function getCurrentUser() {
    const savedUser = localStorage.getItem('admin_user');
    if (!savedUser) {
        return null;
    }
    
    try {
        return JSON.parse(savedUser);
    } catch (error) {
        console.error('解析用户信息失败:', error);
        return null;
    }
}

// 更新用户信息的全局函数
function updateCurrentUser(userData) {
    try {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('admin_user', JSON.stringify(updatedUser));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'admin_user',
                newValue: JSON.stringify(updatedUser)
            }));
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('更新用户信息失败:', error);
        return false;
    }
}

// 退出登录函数
function logoutUser() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('admin_user');
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'admin_user',
            newValue: null
        }));
        
        alert('已成功退出登录');
        window.location.href = 'index.html';
    }
}

// 全局暴露函数
window.checkUserAccess = checkUserAccess;
window.navigateWithPermissionCheck = navigateWithPermissionCheck;
window.getCurrentUser = getCurrentUser;
window.updateCurrentUser = updateCurrentUser;
window.logoutUser = logoutUser;

// 自动处理权限受限页面的访问
(function() {
    'use strict';
    
    const currentPage = window.location.pathname.split('/').pop();
    
    const pagePermissions = {
        'admin.html': 'moderator',
        'profile.html': 'user',
    };
    
    if (pagePermissions[currentPage]) {
        const requiredRole = pagePermissions[currentPage];
        
        setTimeout(() => {
            if (!checkUserAccess(requiredRole)) {
                const savedUser = localStorage.getItem('admin_user');
                if (!savedUser) {
                    window.location.href = 'login.html';
                } else if (requiredRole === 'moderator') {
                    if (currentPage === 'admin.html') {
                        window.location.href = 'profile.html';
                    }
                }
            }
        }, 100);
    }
})();
