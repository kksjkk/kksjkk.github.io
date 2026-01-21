// 高级性能优化层（兼容性修复版） - 优化版
// 专注于性能监控和浏览器兼容性，不处理业务逻辑

(function() {
    'use strict';
    
    // 检查是否已经初始化
    if (window.performanceLayerInitialized) {
        console.log('性能层已初始化，跳过重复初始化');
        return;
    }
    
    // 标记性能层已初始化
    window.performanceLayerInitialized = true;
    
    // 检查主脚本是否已初始化，避免功能冲突
    if (window.mainScriptInitialized) {
        console.log('主脚本已初始化，性能层将专注于监控');
    }
    
    // 检查卡片系统是否已初始化
    if (window.adaptiveCardSystemInitialized) {
        console.log('卡片系统已初始化，性能层将优化卡片性能');
    }
    
    // 浏览器检测 - 仅用于性能优化决策
    const browserInfo = {
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isEdge: /Edg/i.test(navigator.userAgent),
        isChrome: /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isLowPerformance: navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
    };
    
    // 性能监控数据
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
            
            // 低帧率警告
            if (fps < 30 && !document.body.classList.contains('low-fps-warning')) {
                console.warn(`低帧率检测: ${fps} FPS`);
                // 可以在这里添加低帧率优化
            }
        }
        
        fpsUpdateId = requestAnimationFrame(updateFPS);
    }
    
    // 页面加载时间监控
    function monitorLoadTimes() {
        if (performance && performance.timing) {
            const timing = performance.timing;
            
            perfData.loadTimes = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                ttfb: timing.responseStart - timing.requestStart,
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || null,
                firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || null
            };
            
            console.log('页面加载性能数据:', perfData.loadTimes);
            
            // 如果加载时间过长，应用性能优化
            if (perfData.loadTimes.pageLoad > 3000) {
                applyHeavyOptimizations();
            }
        }
    }
    
    // 内存监控（如果支持）
    function monitorMemory() {
        if (performance && performance.memory) {
            const memory = performance.memory;
            perfData.memoryUsage = {
                usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
                totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
                jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
            };
            
            // 高内存使用警告
            if (perfData.memoryUsage.usedJSHeapSize > 100) {
                console.warn(`高内存使用: ${perfData.memoryUsage.usedJSHeapSize}MB`);
            }
        }
    }
    
    // 监控卡片数量
    function monitorCardCount() {
        const cards = document.querySelectorAll('.feature-card');
        perfData.cardCount = cards.length;
        console.log(`检测到 ${perfData.cardCount} 张卡片`);
        
        // 如果卡片过多，应用优化
        if (perfData.cardCount > 10) {
            console.log('卡片数量过多，应用卡片优化');
            optimizeCardPerformance();
        }
    }
    
    // 卡片性能优化
    function optimizeCardPerformance() {
        const cards = document.querySelectorAll('.feature-card');
        
        // 为低性能设备减少卡片动画
        if (browserInfo.isLowPerformance || browserInfo.isMobile) {
            cards.forEach(card => {
                card.style.animation = 'none';
                card.style.transition = 'none';
                
                // 移除复杂的卡片效果
                const refreshElements = card.querySelectorAll('.card-refresh-container, .card-border-glow, .gradient-overlay');
                refreshElements.forEach(el => {
                    el.style.display = 'none';
                });
            });
            
            console.log('低性能设备，已禁用卡片动画');
        }
    }
    
    // 重度性能优化
    function applyHeavyOptimizations() {
        console.log('应用重度性能优化');
        
        // 简化动画
        document.body.classList.add('performance-mode');
        
        // 减少粒子数量
        const particles = document.querySelectorAll('.particle');
        if (particles.length > 10) {
            for (let i = 10; i < particles.length; i++) {
                particles[i].style.display = 'none';
            }
        }
        
        // 禁用部分特效
        const style = document.createElement('style');
        style.id = 'heavy-optimizations';
        style.textContent = `
            .performance-mode .particle {
                display: none !important;
            }
            .performance-mode .feature-card {
                animation: none !important;
                transform: none !important;
                transition: none !important;
            }
            .performance-mode .logo-glow {
                animation: none !important;
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
    
    // 轻量级粒子系统（仅在需要时启用）
    let particleSystemEnabled = false;
    let particleInterval = null;
    
    function initLightweightParticles() {
        // 仅在桌面设备且非低性能设备上启用
        if (browserInfo.isMobile || browserInfo.isLowPerformance) {
            console.log('移动设备或低性能设备，禁用粒子系统');
            return;
        }
        
        // 检查主脚本是否已处理粒子系统
        if (window.particleSystemInitialized) {
            console.log('粒子系统已由主脚本处理');
            return;
        }
        
        particleSystemEnabled = true;
        
        // 创建基础粒子
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        
        // 限制粒子数量
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createPerformanceParticle(particlesContainer);
            }, i * 300);
        }
        
        // 定期更新粒子位置
        particleInterval = setInterval(() => {
            updateParticles();
        }, 100);
    }
    
    function createPerformanceParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'performance-particle';
        
        // 简单样式
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
            
            const rect = particle.getBoundingClientRect();
            const data = particle._data;
            
            // 简单移动
            let newLeft = parseFloat(particle.style.left) + data.speedX;
            let newTop = parseFloat(particle.style.top) + data.speedY;
            
            // 边界检查
            if (newLeft < -10) newLeft = 110;
            if (newLeft > 110) newLeft = -10;
            if (newTop < -10) newTop = 110;
            if (newTop > 110) newTop = -10;
            
            particle.style.left = newLeft + '%';
            particle.style.top = newTop + '%';
        });
    }
    
    // 滚动性能优化
    let lastScrollY = 0;
    let scrollUpdateScheduled = false;
    
    function initScrollOptimization() {
        window.addEventListener('scroll', function() {
            if (!scrollUpdateScheduled) {
                scrollUpdateScheduled = true;
                
                requestAnimationFrame(() => {
                    const currentScrollY = window.pageYOffset;
                    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
                    
                    // 如果滚动距离很大，应用优化
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
        // 临时暂停部分动画
        const particles = document.querySelectorAll('.performance-particle');
        particles.forEach(p => {
            p.style.animationPlayState = 'paused';
        });
        
        // 暂停卡片动画
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            if (!card.classList.contains('active')) {
                card.style.animationPlayState = 'paused';
            }
        });
        
        // 很快恢复
        setTimeout(() => {
            particles.forEach(p => {
                p.style.animationPlayState = 'running';
            });
            
            cards.forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }, 100);
    }
    
    // 可见性状态管理
    function initVisibilityOptimization() {
        if (typeof document.hidden !== 'undefined') {
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    // 页面隐藏时暂停非必要功能
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
                    // 页面恢复时重新启用
                    document.body.classList.remove('page-hidden');
                    
                    // 恢复FPS监控
                    if (!fpsUpdateId) {
                        fpsUpdateId = requestAnimationFrame(updateFPS);
                    }
                    
                    // 恢复粒子系统
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
    
    // 网络状态监控
    function monitorNetwork() {
        if (navigator.connection) {
            const connection = navigator.connection;
            
            // 低速网络优化
            if (connection.effectiveType && connection.effectiveType.includes('2g')) {
                console.log('低速网络检测，应用网络优化');
                applyNetworkOptimizations();
            }
            
            // 监听网络变化
            connection.addEventListener('change', () => {
                if (connection.effectiveType && connection.effectiveType.includes('2g')) {
                    applyNetworkOptimizations();
                }
            });
        }
    }
    
    function applyNetworkOptimizations() {
        // 禁用高带宽内容
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.preload = 'none';
        });
        
        // 减少图片质量
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.loading !== 'lazy') {
                img.loading = 'lazy';
            }
        });
        
        // 禁用粒子效果
        if (particleSystemEnabled && particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
    }
    
    // 设备性能分类
    function classifyDevicePerformance() {
        const classes = [];
        
        // 基于硬件线程数
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency >= 8) {
                classes.push('high-performance');
            } else if (navigator.hardwareConcurrency >= 4) {
                classes.push('medium-performance');
            } else {
                classes.push('low-performance');
            }
        }
        
        // 基于内存
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory >= 8) {
                classes.push('high-memory');
            } else if (navigator.deviceMemory >= 4) {
                classes.push('medium-memory');
            } else {
                classes.push('low-memory');
            }
        }
        
        // 添加设备类
        classes.forEach(cls => {
            document.documentElement.classList.add(cls);
        });
    }
    
    // 错误监控
    function initErrorMonitoring() {
        // 全局错误捕获
        window.addEventListener('error', (event) => {
            console.error('全局错误:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Promise拒绝捕获
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
        });
    }
    
    // 初始化所有性能监控功能
    function initPerformanceMonitoring() {
        console.log('初始化性能监控层');
        
        // 设备分类
        classifyDevicePerformance();
        
        // 错误监控
        initErrorMonitoring();
        
        // 帧率监控
        fpsUpdateId = requestAnimationFrame(updateFPS);
        
        // 卡片数量监控
        monitorCardCount();
        
        // 加载时间监控
        if (document.readyState === 'complete') {
            setTimeout(monitorLoadTimes, 100);
        } else {
            window.addEventListener('load', () => {
                setTimeout(monitorLoadTimes, 100);
            });
        }
        
        // 内存监控
        if (performance && performance.memory) {
            setInterval(monitorMemory, 10000);
        }
        
        // 网络监控
        monitorNetwork();
        
        // 滚动优化
        initScrollOptimization();
        
        // 可见性优化
        initVisibilityOptimization();
        
        // 粒子系统（条件性启用）
        setTimeout(initLightweightParticles, 2000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    } else {
        // 如果DOM已经加载，等待页面完全加载
        if (document.readyState === 'interactive') {
            window.addEventListener('load', initPerformanceMonitoring);
        } else {
            initPerformanceMonitoring();
        }
    }
    
    // 页面卸载清理
    window.addEventListener('beforeunload', () => {
        // 清理粒子系统
        if (particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
        
        // 清理FPS监控
        if (fpsUpdateId) {
            cancelAnimationFrame(fpsUpdateId);
            fpsUpdateId = null;
        }
        
        // 移除性能层标记
        window.performanceLayerInitialized = false;
        
        // 清理粒子元素
        const particles = document.querySelectorAll('.performance-particle');
        particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
    });
    
    // 导出性能数据供调试使用
    window.getPerformanceData = () => perfData;
    
    // 导出性能优化方法
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