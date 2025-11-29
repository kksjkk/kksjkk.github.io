// 高级性能优化层
(function() {
    'use strict';
    
    // RAF 优化器
    const optimizedRAF = (function() {
        return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               function(callback) {
                   window.setTimeout(callback, 1000 / 60);
               };
    })();
    
    // 节流函数优化版
    function throttle(func, limit) {
        let inThrottle;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastRan);
                lastRan = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    // 防抖函数优化版
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    // 高性能滚动处理
    let scrollTimeout;
    window.addEventListener('scroll', throttle(function() {
        // 清除之前的定时器
        clearTimeout(scrollTimeout);
        
        // 使用RAF处理滚动
        optimizedRAF(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            // 更新进度条
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = scrollPercent + '%';
            }
            
            // 头部背景变化
            const header = document.querySelector('header');
            if (header) {
                if (scrollTop > 50) {
                    header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                } else {
                    header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }
            }
        });
        
        // 延迟隐藏进度条
        scrollTimeout = setTimeout(() => {
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar && scrollPercent >= 100) {
                progressBar.classList.add('hidden');
            }
        }, 1500);
        
    }, 16)); // 约60fps
    
    // 鼠标移动性能优化
    let mouseX = 0, mouseY = 0;
    let particleCreationTime = 0;
    
    document.addEventListener('mousemove', throttle(function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 限制粒子创建频率 (最多每秒30个)
        const now = Date.now();
        if (now - particleCreationTime > 33) {
            createOptimizedParticle(mouseX, mouseY);
            particleCreationTime = now;
        }
    }, 16));
    
    function createOptimizedParticle(x, y) {
        const particles = document.querySelector('.floating-particles');
        if (!particles || particles.children.length > 20) return; // 限制粒子数量
        
        optimizedRAF(() => {
            const particle = document.createElement('div');
            particle.className = 'particle mouse-particle';
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${Math.random() * 3 + 2}px;
                height: ${Math.random() * 3 + 2}px;
                background: rgba(0, 243, 255, 0.7);
                border-radius: 50%;
                position: absolute;
                pointer-events: none;
                animation: optimizedFloat 1s ease-out forwards;
            `;
            
            particles.appendChild(particle);
            
            // 自动清理
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        });
    }
    
    // 内存优化 - 清理不可见元素
    setInterval(() => {
        const hiddenParticles = document.querySelectorAll('.mouse-particle');
        hiddenParticles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight || 
                rect.right < 0 || rect.left > window.innerWidth) {
                particle.remove();
            }
        });
    }, 5000);
    
    // 图片加载优化
    function optimizeImageLoading() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                });
            }
        });
    }
    
    // 布局抖动防护
    let resizeTimeout;
    window.addEventListener('resize', debounce(function() {
        optimizedRAF(() => {
            // 处理resize相关逻辑
            const navMenu = document.querySelector('.nav-menu');
            if (window.innerWidth > 768 && navMenu) {
                navMenu.style.display = 'flex';
            }
        });
    }, 250));
    
    // 页面可见性API优化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时降低动画频率
            document.body.classList.add('page-hidden');
        } else {
            document.body.classList.remove('page-hidden');
        }
    });
    
    // 初始化优化
    document.addEventListener('DOMContentLoaded', function() {
        optimizeImageLoading();
        
        // 预加载关键资源
        const criticalResources = [
            // 添加需要预加载的资源URL
        ];
        
        criticalResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = 'image';
            document.head.appendChild(link);
        });
    });
    
    // 控制台性能监控
    if (typeof window.performance !== 'undefined') {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = window.performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`页面加载时间: ${loadTime}ms`);
            }, 0);
        });
    }
})();