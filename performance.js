// 高级性能优化层（兼容性修复版） - 修复版
(function() {
    'use strict';
    
    // 使用更安全的浏览器检测
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isEdge = /Edg/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent);
    const isVia = /ViaBrowser/i.test(navigator.userAgent);
    const isBaidu = /baidubrowser|BIDUBrowser/i.test(navigator.userAgent);
    const isSogou = /SogouMobileBrowser/i.test(navigator.userAgent);
    
    // 事件管理器 - 防止重复绑定
    class EventManager {
        constructor() {
            this.registry = new Map();
        }
        
        add(element, event, handler, options = {}) {
            if (!this.registry.has(element)) {
                this.registry.set(element, new Map());
            }
            
            const elementEvents = this.registry.get(element);
            if (!elementEvents.has(event)) {
                elementEvents.set(event, new Set());
            }
            
            // 检查是否已经绑定过
            if (elementEvents.get(event).has(handler)) {
                return;
            }
            
            elementEvents.get(event).add(handler);
            element.addEventListener(event, handler, options);
        }
        
        remove(element, event, handler) {
            if (this.registry.has(element)) {
                const elementEvents = this.registry.get(element);
                if (elementEvents.has(event)) {
                    const handlers = elementEvents.get(event);
                    if (handlers.has(handler)) {
                        element.removeEventListener(event, handler);
                        handlers.delete(handler);
                    }
                }
            }
        }
        
        clearElement(element) {
            if (this.registry.has(element)) {
                const elementEvents = this.registry.get(element);
                elementEvents.forEach((handlers, event) => {
                    handlers.forEach(handler => {
                        element.removeEventListener(event, handler);
                    });
                });
                this.registry.delete(element);
            }
        }
    }
    
    const eventManager = new EventManager();
    
    // 修复Safari和其他浏览器的requestAnimationFrame兼容性
    const optimizedRAF = (function() {
        const vendors = ['ms', 'moz', 'webkit', 'o'];
        for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
        
        if (!window.requestAnimationFrame) {
            let lastTime = 0;
            return function(callback) {
                const currTime = new Date().getTime();
                const timeToCall = Math.max(0, 16 - (currTime - lastTime));
                const id = window.setTimeout(function() { 
                    callback(currTime + timeToCall); 
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        return window.requestAnimationFrame.bind(window);
    })();
    
    // 兼容性更好的节流函数
    function throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    // 防抖函数
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
    
    // 浏览器兼容的粒子系统
    let cleanupInterval = null;
    let mouseMoveHandler = null;
    
    function initParticleSystem() {
        // 只在支持transform的浏览器中启用粒子
        if (typeof document.body.style.transform === 'undefined' && 
            typeof document.body.style.webkitTransform === 'undefined') {
            console.log('当前浏览器不支持transform，禁用粒子系统');
            return;
        }
        
        let mouseX = 0, mouseY = 0;
        let particleCreationTime = 0;
        
        mouseMoveHandler = throttle(function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const now = Date.now();
            if (now - particleCreationTime > 33) {
                createOptimizedParticle(mouseX, mouseY);
                particleCreationTime = now;
            }
        }, 16);
        
        document.addEventListener('mousemove', mouseMoveHandler);
    }
    
    function createOptimizedParticle(x, y) {
        const particles = document.querySelector('.floating-particles');
        if (!particles) return;
        
        // 限制粒子数量（特别针对移动端）
        const maxParticles = window.innerWidth <= 768 ? 10 : 20;
        if (particles.children.length >= maxParticles) {
            // 移除最早的粒子
            const firstParticle = particles.querySelector('.mouse-particle');
            if (firstParticle) {
                particles.removeChild(firstParticle);
            }
        }
        
        optimizedRAF(() => {
            const particle = document.createElement('div');
            particle.className = 'particle mouse-particle';
            
            // 使用兼容性更好的样式设置
            particle.style.position = 'absolute';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = (Math.random() * 3 + 2) + 'px';
            particle.style.height = (Math.random() * 3 + 2) + 'px';
            particle.style.background = 'rgba(0, 243, 255, 0.7)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            
            // 兼容性动画
            if (typeof particle.style.animation !== 'undefined') {
                particle.style.animation = 'optimizedFloat 1s ease-out forwards';
            } else if (typeof particle.style.webkitAnimation !== 'undefined') {
                particle.style.webkitAnimation = 'optimizedFloat 1s ease-out forwards';
            }
            
            particles.appendChild(particle);
            
            // 自动清理
            setTimeout(() => {
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        });
    }
    
    // 内存清理 - 针对移动浏览器优化
    function initCleanupSystem() {
        if (cleanupInterval) clearInterval(cleanupInterval);
        
        cleanupInterval = setInterval(() => {
            const hiddenParticles = document.querySelectorAll('.mouse-particle');
            hiddenParticles.forEach(particle => {
                if (particle.getBoundingClientRect) {
                    const rect = particle.getBoundingClientRect();
                    if (rect.bottom < -100 || rect.top > window.innerHeight + 100 || 
                        rect.right < -100 || rect.left > window.innerWidth + 100) {
                        particle.remove();
                    }
                }
            });
        }, 10000); // 延长清理间隔减少性能消耗
    }
    
    // 页面可见性API优化（兼容性处理）
    function initVisibilityHandler() {
        if (typeof document.hidden !== 'undefined') {
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    document.body.classList.add('page-hidden');
                    if (mouseMoveHandler) {
                        document.removeEventListener('mousemove', mouseMoveHandler);
                    }
                    if (cleanupInterval) {
                        clearInterval(cleanupInterval);
                        cleanupInterval = null;
                    }
                } else {
                    document.body.classList.remove('page-hidden');
                    initParticleSystem();
                    initCleanupSystem();
                }
            });
        }
    }
    
    // 性能监控（兼容性处理）
    function initPerformanceMonitoring() {
        if (typeof window.performance !== 'undefined' && 
            typeof window.performance.timing !== 'undefined') {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    try {
                        const perfData = window.performance.timing;
                        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                        console.log(`页面加载时间: ${loadTime}ms`);
                    } catch (e) {
                        console.log('性能监控数据不可用');
                    }
                }, 100);
            });
        }
    }

    // APK下载功能 - 只负责性能优化，不重复处理下载逻辑
    function initDownloadButton() {
        // 确保下载功能只被主脚本处理
        if (document.querySelector('[data-main-script-initialized]')) {
            console.log('下载功能已由主脚本处理，跳过性能层处理');
            return;
        }
        
        const downloadButtons = document.querySelectorAll('#download-btn, #hero-download-btn');
        
        if (downloadButtons.length === 0) {
            console.warn('未找到下载按钮，将在2秒后重试');
            setTimeout(initDownloadButton, 2000);
            return;
        }
        
        downloadButtons.forEach(button => {
            // 检查是否已经被其他脚本处理过
            if (button.hasAttribute('data-download-initialized') || 
                button.hasAttribute('data-download-optimized')) {
                return;
            }
            
            // 标记为已处理，避免重复处理
            button.setAttribute('data-download-optimized', 'true');
            
            // 只绑定一次事件
            eventManager.add(button, 'click', function(e) {
                // 只负责性能优化，不处理具体下载逻辑
                e.preventDefault();
                e.stopPropagation();
                console.log('性能层下载按钮点击，应由主脚本处理');
                
                // 阻止默认行为，让主脚本处理
                return false;
            });
        });
    }

    // 动画性能检查
    function checkAnimationPerformance() {
        if ('animation' in document.documentElement.style) {
            // 检查是否支持硬件加速
            const testEl = document.createElement('div');
            testEl.style.cssText = 'transform: translateZ(0);';
            document.body.appendChild(testEl);
            const transform = getComputedStyle(testEl).transform;
            document.body.removeChild(testEl);
            
            if (transform === 'none') {
                console.warn('硬件加速可能不可用，简化特效');
                document.body.classList.add('performance-mode');
            }
        }
    }

    // 初始化所有功能
    function initAll() {
        console.log('初始化性能优化层...');
        
        // 检查是否已经有主脚本处理过
        if (document.querySelector('[data-main-script-initialized]')) {
            console.log('主脚本已初始化，优化层跳过重复功能');
            return;
        }
        
        // 初始化基础功能
        initPerformanceMonitoring();
        initVisibilityHandler();
        checkAnimationPerformance();
        
        // 根据浏览器能力选择性初始化
        if (!isSafari || window.innerWidth > 768) {
            try {
                initParticleSystem();
                initCleanupSystem();
            } catch (error) {
                console.error('粒子系统初始化失败:', error);
            }
        }
        
        // 针对移动浏览器的优化
        if (window.innerWidth <= 768) {
            // 减少动画复杂度
            document.body.classList.add('mobile-optimized');
        }
    }
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        setTimeout(initAll, 0);
    }
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        eventManager.clearElement(document);
        if (cleanupInterval) {
            clearInterval(cleanupInterval);
        }
    });
})();