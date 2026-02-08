// 高级性能优化层 - 简化版本

(function() {
    'use strict';
    
    // 避免重复初始化
    if (window.performanceLayerInitialized) {
        return;
    }
    
    window.performanceLayerInitialized = true;
    
    // 浏览器检测
    const browserInfo = {
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isEdge: /Edg/i.test(navigator.userAgent),
        isChrome: /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isLowPerformance: navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
    };
    
    // 性能数据
    const perfData = {
        loadTimes: {},
        memoryUsage: null,
        animationFrameRate: 60,
        domReadyTime: null,
        loadCompleteTime: null,
        cardCount: 0
    };
    
    // 帧率监控
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    let fpsUpdateId = null;
    
    function updateFPS() {
        const now = performance.now();
        frameCount++;
        
        if (now >= lastFrameTime + 1000) {
            fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
            frameCount = 0;
            lastFrameTime = now;
            
            if (fps < 30) {
                console.warn(`低帧率检测: ${fps} FPS`);
            }
        }
        
        fpsUpdateId = requestAnimationFrame(updateFPS);
    }
    
    // 加载时间监控
    function monitorLoadTimes() {
        if (performance && performance.timing) {
            const timing = performance.timing;
            
            perfData.loadTimes = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                ttfb: timing.responseStart - timing.requestStart,
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart
            };
            
            if (perfData.loadTimes.pageLoad > 3000) {
                applyHeavyOptimizations();
            }
        }
    }
    
    // 内存监控
    function monitorMemory() {
        if (performance && performance.memory) {
            const memory = performance.memory;
            perfData.memoryUsage = {
                usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576),
                totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
                jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576)
            };
        }
    }
    
    // 卡片监控
    function monitorCardCount() {
        const cards = document.querySelectorAll('.feature-card');
        perfData.cardCount = cards.length;
        
        if (perfData.cardCount > 10) {
            optimizeCardPerformance();
        }
    }
    
    // 卡片性能优化
    function optimizeCardPerformance() {
        const cards = document.querySelectorAll('.feature-card');
        
        if (browserInfo.isLowPerformance || browserInfo.isMobile) {
            cards.forEach(card => {
                card.style.animation = 'none';
                card.style.transition = 'none';
                
                const refreshElements = card.querySelectorAll('.card-refresh-container, .card-border-glow, .gradient-overlay');
                refreshElements.forEach(el => {
                    el.style.display = 'none';
                });
            });
        }
    }
    
    // 重度性能优化
    function applyHeavyOptimizations() {
        document.body.classList.add('performance-mode');
        
        const style = document.createElement('style');
        style.id = 'heavy-optimizations';
        style.textContent = `
            .performance-mode .feature-card {
                animation: none !important;
                transform: none !important;
                transition: none !important;
            }
            .performance-mode .card-refresh-container,
            .performance-mode .card-border-glow,
            .performance-mode .gradient-overlay {
                display: none !important;
            }
        `;
        
        if (!document.getElementById('heavy-optimizations')) {
            document.head.appendChild(style);
        }
    }
    
    // 轻量级粒子系统
    let particleSystemEnabled = false;
    let particleInterval = null;
    
    function initLightweightParticles() {
        if (browserInfo.isMobile || browserInfo.isLowPerformance) {
            return;
        }
        
        if (window.particleSystemInitialized) {
            return;
        }
        
        particleSystemEnabled = true;
        
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createPerformanceParticle(particlesContainer);
            }, i * 300);
        }
        
        particleInterval = setInterval(() => {
            updateParticles();
        }, 100);
    }
    
    function createPerformanceParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'performance-particle';
        
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(0, 243, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.3};
        `;
        
        particle._data = {
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        };
        
        container.appendChild(particle);
        return particle;
    }
    
    function updateParticles() {
        if (!particleSystemEnabled) return;
        
        const particles = document.querySelectorAll('.performance-particle');
        particles.forEach(particle => {
            if (!particle._data) return;
            
            const data = particle._data;
            
            let newLeft = parseFloat(particle.style.left) + data.speedX;
            let newTop = parseFloat(particle.style.top) + data.speedY;
            
            if (newLeft < -10) newLeft = 110;
            if (newLeft > 110) newLeft = -10;
            if (newTop < -10) newTop = 110;
            if (newTop > 110) newTop = -10;
            
            particle.style.left = newLeft + '%';
            particle.style.top = newTop + '%';
        });
    }
    
    // 滚动优化
    let lastScrollY = 0;
    let scrollUpdateScheduled = false;
    
    function initScrollOptimization() {
        window.addEventListener('scroll', function() {
            if (!scrollUpdateScheduled) {
                scrollUpdateScheduled = true;
                
                requestAnimationFrame(() => {
                    const currentScrollY = window.pageYOffset;
                    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
                    
                    if (scrollDelta > 300) {
                        pauseNonEssentialAnimations();
                    }
                    
                    lastScrollY = currentScrollY;
                    scrollUpdateScheduled = false;
                });
            }
        }, { passive: true });
    }
    
    function pauseNonEssentialAnimations() {
        const particles = document.querySelectorAll('.performance-particle');
        particles.forEach(p => {
            p.style.animationPlayState = 'paused';
        });
        
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            if (!card.classList.contains('active')) {
                card.style.animationPlayState = 'paused';
            }
        });
        
        setTimeout(() => {
            particles.forEach(p => {
                p.style.animationPlayState = 'running';
            });
            
            cards.forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }, 100);
    }
    
    // 可见性优化
    function initVisibilityOptimization() {
        if (typeof document.hidden !== 'undefined') {
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    if (particleInterval) {
                        clearInterval(particleInterval);
                        particleInterval = null;
                    }
                    
                    if (fpsUpdateId) {
                        cancelAnimationFrame(fpsUpdateId);
                        fpsUpdateId = null;
                    }
                    
                    document.body.classList.add('page-hidden');
                } else {
                    document.body.classList.remove('page-hidden');
                    
                    if (!fpsUpdateId) {
                        fpsUpdateId = requestAnimationFrame(updateFPS);
                    }
                    
                    if (particleSystemEnabled && !particleInterval) {
                        particleInterval = setInterval(() => {
                            updateParticles();
                        }, 100);
                    }
                }
            };
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }
    }
    
    // 网络监控
    function monitorNetwork() {
        if (navigator.connection) {
            const connection = navigator.connection;
            
            if (connection.effectiveType && connection.effectiveType.includes('2g')) {
                applyNetworkOptimizations();
            }
            
            connection.addEventListener('change', () => {
                if (connection.effectiveType && connection.effectiveType.includes('2g')) {
                    applyNetworkOptimizations();
                }
            });
        }
    }
    
    function applyNetworkOptimizations() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.preload = 'none';
        });
        
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.loading !== 'lazy') {
                img.loading = 'lazy';
            }
        });
        
        if (particleSystemEnabled && particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
    }
    
    // 设备分类
    function classifyDevicePerformance() {
        const classes = [];
        
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency >= 8) {
                classes.push('high-performance');
            } else if (navigator.hardwareConcurrency >= 4) {
                classes.push('medium-performance');
            } else {
                classes.push('low-performance');
            }
        }
        
        classes.forEach(cls => {
            document.documentElement.classList.add(cls);
        });
    }
    
    // 错误监控
    function initErrorMonitoring() {
        window.addEventListener('error', (event) => {
            console.error('全局错误:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
        });
    }
    
    // 初始化性能监控
    function initPerformanceMonitoring() {
        classifyDevicePerformance();
        initErrorMonitoring();
        
        fpsUpdateId = requestAnimationFrame(updateFPS);
        monitorCardCount();
        
        if (document.readyState === 'complete') {
            setTimeout(monitorLoadTimes, 100);
        } else {
            window.addEventListener('load', () => {
                setTimeout(monitorLoadTimes, 100);
            });
        }
        
        if (performance && performance.memory) {
            setInterval(monitorMemory, 10000);
        }
        
        monitorNetwork();
        initScrollOptimization();
        initVisibilityOptimization();
        
        setTimeout(initLightweightParticles, 2000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    } else {
        if (document.readyState === 'interactive') {
            window.addEventListener('load', initPerformanceMonitoring);
        } else {
            initPerformanceMonitoring();
        }
    }
    
    // 页面卸载清理
    window.addEventListener('beforeunload', () => {
        if (particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
        
        if (fpsUpdateId) {
            cancelAnimationFrame(fpsUpdateId);
            fpsUpdateId = null;
        }
        
        window.performanceLayerInitialized = false;
        
        const particles = document.querySelectorAll('.performance-particle');
        particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
    });
    
    // 导出功能
    window.getPerformanceData = () => perfData;
    
    window.PerformanceOptimizer = {
        enableParticles: () => {
            if (!particleSystemEnabled) {
                initLightweightParticles();
            }
        },
        disableParticles: () => {
            particleSystemEnabled = false;
            if (particleInterval) {
                clearInterval(particleInterval);
                particleInterval = null;
            }
        },
        getFPS: () => fps,
        getLoadTimes: () => perfData.loadTimes,
        getCardCount: () => perfData.cardCount,
        optimizeCards: () => optimizeCardPerformance(),
        applyPerformanceMode: () => applyHeavyOptimizations()
    };
})();