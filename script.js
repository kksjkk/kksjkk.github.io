// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('script.js: DOM加载完成');
    
    // 使用RAF优化所有动画
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    // 移动端菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        console.log('初始化菜单系统');
        
        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');
            
            // 使用RAF优化菜单动画
            requestAnimationFrame(() => {
                // 汉堡菜单动画
                const spans = this.querySelectorAll('span');
                if (!isActive) {
                    // 打开菜单
                    spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                    navMenu.style.display = 'flex';
                    // 强制重绘以确保过渡生效
                    void navMenu.offsetHeight;
                    navMenu.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    console.log('菜单打开');
                } else {
                    // 关闭菜单
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                    navMenu.classList.remove('active');
                    this.setAttribute('aria-expanded', 'false');
                    // 等待过渡完成后再隐藏
                    setTimeout(() => {
                        if (!navMenu.classList.contains('active')) {
                            navMenu.style.display = 'none';
                            console.log('菜单关闭');
                        }
                    }, 300);
                }
            });
        });

        // 点击菜单项时关闭菜单（移动端）
        navMenu.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', function(e) {
                // 如果是下载按钮或主题切换按钮，不要关闭菜单
                if (this.id === 'download-btn' || this.id === 'theme-toggle') {
                    return;
                }
                
                if (window.innerWidth <= 768) {
                    requestAnimationFrame(() => {
                        const spans = navToggle.querySelectorAll('span');
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                        navMenu.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                        setTimeout(() => {
                            navMenu.style.display = 'none';
                        }, 300);
                    });
                }
            });
        });
    }
    
    // 初始化菜单状态
    function initMenuState() {
        if (navToggle && navMenu) {
            if (window.innerWidth <= 768) {
                navMenu.style.display = 'none';
                navToggle.setAttribute('aria-expanded', 'false');
                // 确保移动端菜单按钮可见
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
    
    initMenuState();

    // 窗口大小改变时重置菜单状态（使用防抖优化）
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                initMenuState();
            });
        }, 100);
    });

    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    // 应用保存的主题
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️ 亮色模式';
    } else if (currentTheme === 'light' || currentTheme === null) {
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.textContent = '🌓 暗色模式';
    }
    
    // 主题切换事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            requestAnimationFrame(() => {
                // 添加切换动画
                document.body.style.opacity = '0.8';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    document.body.classList.toggle('dark-mode');
                    let theme = 'light';
                    let buttonText = '🌓 暗色模式';
                    
                    if (document.body.classList.contains('dark-mode')) {
                        theme = 'dark';
                        buttonText = '☀️ 亮色模式';
                    }
                    
                    localStorage.setItem('theme', theme);
                    themeToggle.textContent = buttonText;
                    
                    // 恢复透明度
                    setTimeout(() => {
                        document.body.style.opacity = '1';
                    }, 50);
                }, 300);
            });
        });
    }
    
    // 图片懒加载
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
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
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 直接加载所有图片
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            img.classList.remove('lazy-load');
        });
    }
    
    // 访问统计
    window.addEventListener('load', function() {
        try {
            const visitData = {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                referrer: document.referrer || '直接访问',
                userAgent: navigator.userAgent
            };
            
            // 存储到 localStorage
            let visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '[]');
            visitHistory.push(visitData);
            
            // 保留最近10次访问记录
            if (visitHistory.length > 10) {
                visitHistory = visitHistory.slice(-10);
            }
            
            localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
            console.log('访问记录:', visitData);
        } catch (error) {
            console.warn('无法保存访问记录:', error);
        }
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // 使用平滑滚动
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
                
                // 移动端关闭菜单
                if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    setTimeout(() => {
                        navMenu.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
    
    // 高性能滚动处理（唯一负责滚动进度条）
    let ticking = false;
    
    function updateProgressBar() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
            
            // 当进度达到100%时，添加隐藏类
            if (scrollPercent >= 100) {
                progressBar.classList.add('hidden');
            } else {
                progressBar.classList.remove('hidden');
            }
        }
        
        // 头部背景变化
        const header = document.querySelector('header');
        if (scrollTop > 50) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            header.style.boxShadow = '0 2px 30px rgba(0, 212, 255, 0.3)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            header.style.boxShadow = '0 2px 30px rgba(0, 212, 255, 0.2)';
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateProgressBar);
            ticking = true;
        }
    });
    
    // 初始化进度条动画
    const progressElement = document.getElementById('system-progress');
    if (progressElement) {
        let progress = 75;
        let lastProgressTime = 0;
        
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
                requestAnimationFrame(animateProgress);
            }
        }
        
        requestAnimationFrame(animateProgress);
    }
    
    // 添加键盘导航支持
    document.addEventListener('keydown', function(e) {
        // Escape键关闭菜单
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            setTimeout(() => {
                navMenu.style.display = 'none';
            }, 300);
            navToggle.focus();
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
    
    // 改善可访问性
    if (navToggle) {
        navToggle.setAttribute('aria-label', '切换导航菜单');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-menu');
    }
    
    if (navMenu) {
        navMenu.id = 'nav-menu';
        navMenu.setAttribute('aria-label', '主导航');
    }
});