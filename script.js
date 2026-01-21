// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('script.js: DOM加载完成');
    // 在 script.js 的 DOMContentLoaded 事件中添加
document.addEventListener('DOMContentLoaded', function() {
    console.log('script.js: DOM加载完成');
    
    // 标记主脚本已初始化
    window.mainScriptInitialized = true;
    document.body.setAttribute('data-main-script-initialized', 'true');
    
    // 检查是否有性能层已初始化，避免重复
    if (window.performanceLayerInitialized) {
        console.log('性能层已初始化，跳过部分功能');
    }
    
    // 检查卡片系统是否已加载
    if (window.adaptiveCardSystemInitialized) {
        console.log('卡片特效系统已加载，跳过兼容性处理');
    }
    
    // 检查登录状态并更新导航栏
    function checkLoginAndUpdateNav() {
        const savedUser = localStorage.getItem('admin_user');
        const navMenu = document.querySelector('.nav-menu');
        
        if (savedUser && navMenu) {
            try {
                const user = JSON.parse(savedUser);
                const username = user.username || user.full_name || '用户';
                
                // 查找导航栏中的登录注册按钮并替换
                const loginLinks = navMenu.querySelectorAll('a[href="login.html"]');
                loginLinks.forEach(link => {
                    if (user.role === 'admin' || user.role === 'moderator') {
                        link.innerHTML = `<span class="btn-icon">👤</span> ${username} (管理)`;
                        link.href = 'admin.html';
                        link.title = '进入管理后台';
                    } else {
                        link.innerHTML = `<span class="btn-icon">👤</span> ${username}`;
                        link.href = 'admin.html';
                        link.title = '查看个人中心';
                    }
                    link.classList.add('user-status');
                    link.classList.remove('auth-link');
                });
                
                console.log('导航栏已更新为登录状态');
            } catch (error) {
                console.error('解析用户信息失败:', error);
            }
        }
    }
    
    // 初始检查
    setTimeout(checkLoginAndUpdateNav, 100);
    
    // 监听存储变化
    window.addEventListener('storage', function(e) {
        if (e.key === 'admin_user') {
            setTimeout(checkLoginAndUpdateNav, 100);
        }
    });
    
    // ... 原有的其他代码保持不变 ...
});
    
    // 标记主脚本已初始化
    window.mainScriptInitialized = true;
    document.body.setAttribute('data-main-script-initialized', 'true');
    
    // 检查是否有性能层已初始化，避免重复
    if (window.performanceLayerInitialized) {
        console.log('性能层已初始化，跳过部分功能');
    }
    
    // 检查卡片系统是否已加载
    if (window.adaptiveCardSystemInitialized) {
        console.log('卡片特效系统已加载，跳过兼容性处理');
    }
    
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
                // 打开菜单或强制关闭
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                navMenu.style.display = 'flex';
                
                // 强制重绘以确保过渡生效
                void navMenu.offsetHeight;
                
                if (!forceClose) {
                    navMenu.classList.add('active');
                    navToggle.setAttribute('aria-expanded', 'true');
                    console.log('菜单打开');
                }
            } else {
                // 关闭菜单
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                
                // 等待过渡完成后再隐藏
                setTimeout(() => {
                    if (!navMenu.classList.contains('active')) {
                        navMenu.style.display = 'none';
                        console.log('菜单关闭');
                    }
                }, 300);
            }
        });
    }
    
    // 菜单系统初始化
    if (navToggle && navMenu) {
        console.log('初始化菜单系统');
        
        // 确保只绑定一次事件
        if (!navToggle.hasAttribute('data-menu-initialized')) {
            navToggle.setAttribute('data-menu-initialized', 'true');
            
            navToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });

            // 点击菜单项时关闭菜单（移动端）
            navMenu.querySelectorAll('a, button').forEach(item => {
                item.addEventListener('click', function(e) {
                    // 如果是下载按钮或主题切换按钮，不要关闭菜单
                    if (this.id === 'download-btn' || this.id === 'theme-toggle') {
                        return;
                    }
                    
                    if (window.innerWidth <= 768) {
                        toggleMenu(true);
                    }
                });
            });

            // 点击页面其他地方关闭菜单
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

    // 窗口大小改变时重置菜单状态（使用防抖优化）
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                initMenuState();
                // 如果窗口变大，确保菜单关闭
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
    
  // 应用保存的主题
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️ 亮色模式';
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.textContent = '🌓 暗色模式';
    }
}

// 如果没有保存的主题，检测系统偏好
if (!currentTheme) {
    currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

applyTheme(currentTheme);

// 监听系统主题变化
if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    try {
        // 新的API
        colorSchemeQuery.addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
            }
        });
    } catch (e) {
        // 旧的API
        colorSchemeQuery.addListener(function(e) {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
            }
        });
    }
}

// 主题切换事件
if (themeToggle && !themeToggle.hasAttribute('data-theme-initialized')) {
    themeToggle.setAttribute('data-theme-initialized', 'true');
    
    themeToggle.addEventListener('click', function() {
        requestAnimationFrame(() => {
            // 添加切换动画
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
                
                // 恢复透明度
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
                        // 添加淡入效果
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.5s ease';
                        
                        // 设置图片源
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // 移除懒加载类
                        img.classList.remove('lazy-load');
                        
                        // 淡入图片
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
            rootMargin: '0px 0px 100px 0px' // 提前100px加载
        });
        
        lazyImages.forEach(img => {
            // 确保图片有data-src属性
            if (img.src && !img.dataset.src) {
                img.dataset.src = img.src;
                img.src = '';
            }
            imageObserver.observe(img);
        });
    } else {
        // 直接加载所有图片
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
            userAgent: navigator.userAgent.substring(0, 100), // 截断避免过长
            screen: `${window.screen.width}x${window.screen.height}`
        };
        
        // 存储到 localStorage
        let visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '[]');
        visitHistory.push(visitData);
        
        // 保留最近10次访问记录
        if (visitHistory.length > 10) {
            visitHistory = visitHistory.slice(-10);
        }
        
        localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
        console.log('访问记录已保存');
    } catch (error) {
        console.warn('无法保存访问记录:', error);
    }
}

// 延迟记录访问，避免影响页面加载
setTimeout(trackVisit, 1000);

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // 跳过外部链接和空链接
        if (anchor.getAttribute('href') === '#' || anchor.hasAttribute('target')) return;
        
        if (!anchor.hasAttribute('data-scroll-initialized')) {
            anchor.setAttribute('data-scroll-initialized', 'true');
            
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // 使用平滑滚动
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    
                    // 如果浏览器支持平滑滚动
                    if ('scrollBehavior' in document.documentElement.style) {
                        window.scrollTo({
                            top: targetElement.offsetTop - headerHeight - 20,
                            behavior: 'smooth'
                        });
                    } else {
                        // 降级方案
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
                    
                    // 移动端关闭菜单
                    if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                        toggleMenu(true);
                    }
                }
            });
        }
    });
}

initSmoothScroll();

// 高性能滚动处理（唯一负责滚动进度条）
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
        
        // 当进度达到100%时，添加隐藏类
        if (scrollPercent >= 100) {
            progressBar.classList.add('hidden');
        } else {
            progressBar.classList.remove('hidden');
        }
    }
    
    // 头部背景变化
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
    // 移除旧的监听器
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
    
    // 初始调用一次
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
        
        if (elapsed > 200) { // 控制更新频率
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
    
    // 提供停止函数
    return function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };
}

let stopProgressAnimation = initProgressAnimation();

// 下载功能处理（主脚本统一处理）
function initDownloadButtons() {
    const downloadButtons = document.querySelectorAll('#download-btn, #hero-download-btn');
    
    if (downloadButtons.length === 0) {
        setTimeout(initDownloadButtons, 1000);
        return;
    }
    
    downloadButtons.forEach(button => {
        // 避免重复绑定
        if (button.hasAttribute('data-download-main-initialized')) {
            return;
        }
        
        button.setAttribute('data-download-main-initialized', 'true');
        
        // 移除可能存在的其他事件处理器
        button.replaceWith(button.cloneNode(true));
        const newButton = document.getElementById(button.id);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('主脚本处理下载请求');
            
            // 显示下载进度
            this.classList.add('downloading');
            const progressBar = this.querySelector('.download-progress') || document.createElement('div');
            if (!progressBar.classList.contains('download-progress')) {
                progressBar.className = 'download-progress';
                this.appendChild(progressBar);
            }
            
            progressBar.style.width = '0%';
            
            // 模拟下载进度
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = progress + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // 添加完成动画
                    this.classList.remove('downloading');
                    this.classList.add('download-complete');
                    
                    // 实际下载
                    setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = 'System_VM_D62E.apk'; // 修改为本地路径
                        link.download = 'System_VM_D62E.apk';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // 移除完成动画
                        setTimeout(() => {
                            this.classList.remove('download-complete');
                            progressBar.style.width = '0%';
                        }, 1000);
                    }, 500);
                }
            }, 100);
        });
    });
}

// 延迟初始化下载按钮，确保其他脚本不会干扰
setTimeout(initDownloadButtons, 500);

// 添加键盘导航支持
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape键关闭菜单
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            toggleMenu(true);
            if (navToggle) navToggle.focus();
        }
        
        // Tab键在菜单内循环
        if (e.key === 'Tab' && navMenu && navMenu.classList.contains('active')) {
            const focusableElements = navMenu.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
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
    
    // 为进度条添加aria属性
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
    
    // 清理全局标记
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
    
    // 避免重复检测
    if (window.browserFeaturesDetected) {
        return;
    }
    
    window.browserFeaturesDetected = true;
    
    // 检测浏览器特性
    const browserFeatures = {
        transform: 'transform' in document.body.style || 'webkitTransform' in document.body.style,
        animation: 'animation' in document.body.style || 'webkitAnimation' in document.body.style,
        grid: 'grid' in document.body.style || 'webkitGrid' in document.body.style,
        flex: 'flex' in document.body.style || 'webkitFlex' in document.body.style,
        backdropFilter: 'backdropFilter' in document.body.style || 'webkitBackdropFilter' in document.body.style
    };
    
    // 根据浏览器能力添加类名
    const htmlClass = document.documentElement.className;
    let newClasses = htmlClass;
    
    if (!browserFeatures.transform) newClasses += ' no-transform';
    if (!browserFeatures.animation) newClasses += ' no-animation';
    if (!browserFeatures.grid) newClasses += ' no-cssgrid';
    if (!browserFeatures.flex) newClasses += ' no-flex';
    if (!browserFeatures.backdropFilter) newClasses += ' no-backdrop-filter';
    
    document.documentElement.className = newClasses.trim();
    
    // 针对旧版浏览器的修复
    if (!browserFeatures.grid) {
        // 为不支持grid的浏览器添加回退样式
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
        
        // 避免重复添加
        if (!document.getElementById('grid-fallback-style')) {
            document.head.appendChild(style);
        }
    }
    
    // 针对不支持backdrop-filter的浏览器
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