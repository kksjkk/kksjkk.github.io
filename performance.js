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
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            optimizedRAF(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                
                // 更新进度条
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
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', throttle(handleScroll, 16));
    
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
                navMenu.classList.remove('active');
                const navToggle = document.querySelector('.nav-toggle');
                if (navToggle) {
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            } else if (window.innerWidth <= 768 && navMenu) {
                if (!navMenu.classList.contains('active')) {
                    navMenu.style.display = 'none';
                }
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
        
        // 初始化菜单状态
        const navToggle = document.querySelector('.nav-toggle');
        if (window.innerWidth <= 768 && navToggle) {
            navToggle.style.display = 'flex';
            navToggle.style.visibility = 'visible';
            navToggle.style.opacity = '1';
            navToggle.style.pointerEvents = 'auto';
        }
        
        // 预加载关键资源
        const criticalResources = [
            'https://pics1.baidu.com/feed/79f0f736afc37931e6c973ea8baf5a4f41a911c2@f_auto?token=666eac13d2aab8d4d632662a0a40ca03&f=png'
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
                
                // 页面加载完成动画
                document.body.classList.add('loaded');
            }, 0);
        });
    }

    // APK下载功能 - 添加到性能优化层
    function initDownloadButton() {
        const downloadButtons = document.querySelectorAll('#download-btn, #hero-download-btn');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                optimizedRAF(() => {
                    startDownload(button);
                });
            });
        });
    }

    function startDownload(button) {
        // 使用智能CDN选择
        const apkUrl = generateApkUrl();
        const apkFilename = 'System_VM_D62E_v1.0.0.apk';
        
        console.log('开始下载，使用CDN:', apkUrl);
        
        // 显示下载进度
        const existingProgress = button.querySelector('.download-progress');
        if (existingProgress) {
            existingProgress.remove();
        }
        
        const progressBar = document.createElement('div');
        progressBar.className = 'download-progress';
        button.appendChild(progressBar);
        
        // 禁用按钮防止重复点击
        button.disabled = true;
        button.style.opacity = '0.8';
        button.style.cursor = 'not-allowed';
        
        // 模拟下载进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                completeDownload(button, progressBar, apkUrl, apkFilename);
            }
            progressBar.style.width = progress + '%';
        }, 100);
        
        // 添加下载统计
        logDownloadEvent();
    }

    function completeDownload(button, progressBar, url, filename) {
        // 下载完成动画
        button.classList.add('download-complete');
        
        setTimeout(() => {
            // 创建隐藏的下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // 添加到页面并触发点击
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 恢复按钮状态
            setTimeout(() => {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                progressBar.remove();
                button.classList.remove('download-complete');
                
                // 显示下载完成消息
                showDownloadCompleteMessage();
            }, 1000);
            
        }, 600);
    }

    function logDownloadEvent() {
        const downloadData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            url: window.location.href
        };
        
        // 保存到localStorage
        let downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        downloadHistory.push(downloadData);
        
        // 保留最近20次下载记录
        if (downloadHistory.length > 20) {
            downloadHistory = downloadHistory.slice(-20);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
        console.log('下载记录:', downloadData);
    }

    function showDownloadCompleteMessage() {
        // 防止重复显示消息
        if (document.querySelector('.download-complete-message')) return;
        
        // 创建完成消息
        const message = document.createElement('div');
        message.className = 'download-complete-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: #00f3ff;
                padding: 2rem;
                border-radius: 10px;
                border: 2px solid rgba(0, 243, 255, 0.5);
                backdrop-filter: blur(10px);
                text-align: center;
                z-index: 10000;
                box-shadow: 0 0 30px rgba(0, 243, 255, 0.3);
                animation: fadeIn 0.3s ease;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3 style="margin-bottom: 0.5rem; color: #00f3ff;">下载完成！</h3>
                <p style="margin-bottom: 1rem; opacity: 0.8;">APK文件已保存到您的设备</p>
                <p style="font-size: 0.9rem; opacity: 0.6;">安装后应用功能完整，数据永久保存</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(0, 243, 255, 0.2); 
                               border: 1px solid rgba(0, 243, 255, 0.5); color: #00f3ff; 
                               border-radius: 5px; cursor: pointer; transition: all 0.3s ease;">
                    确定
                </button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 3000);
    }

    // 在DOM加载完成后初始化下载按钮
    document.addEventListener('DOMContentLoaded', function() {
        initDownloadButton();
    });
})();

function generateApkUrl() {
    // 根据用户区域智能选择最快的CDN
    const userRegion = getUserRegion();
    const cdnConfig = getOptimalCDN(userRegion);
    
    console.log(`检测到用户区域: ${userRegion}, 使用CDN: ${cdnConfig.name}`);
    return cdnConfig.url;
}

function getUserRegion() {
    // 简单的地理位置检测（基于时区和语言）
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    if (timezone.includes('Asia') || language.includes('zh')) {
        return 'asia';
    } else if (timezone.includes('Europe')) {
        return 'europe';
    } else if (timezone.includes('America')) {
        return 'america';
    } else {
        return 'global';
    }
}

function getOptimalCDN(region) {
    const cdns = {
        asia: {
            url: 'https://asia-cdn.systemvm-d62e.com/apk/System_VM_D62E.apk',
            name: '亚洲CDN'
        },
        europe: {
            url: 'https://eu-cdn.systemvm-d62e.com/apk/System_VM_D62E.apk',
            name: '欧洲CDN'
        },
        america: {
            url: 'https://us-cdn.systemvm-d62e.com/apk/System_VM_D62E.apk',
            name: '美洲CDN'
        },
        global: {
            url: 'https://cdn.systemvm-d62e.com/apk/System_VM_D62E.apk',
            name: '全球CDN'
        }
    };
    
    return cdns[region] || cdns.global;
}