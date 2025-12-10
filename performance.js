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
    
    // 移除重复的滚动处理，只保留在script.js中
    
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
    const cleanupInterval = setInterval(() => {
        const hiddenParticles = document.querySelectorAll('.mouse-particle');
        hiddenParticles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            if (rect.bottom < -100 || rect.top > window.innerHeight + 100 || 
                rect.right < -100 || rect.left > window.innerWidth + 100) {
                particle.remove();
            }
        });
    }, 5000);
    
    // 页面可见性API优化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时清除清理间隔以节省资源
            clearInterval(cleanupInterval);
            document.body.classList.add('page-hidden');
        } else {
            // 页面可见时重新启动清理
            if (!cleanupInterval) {
                setInterval(() => {
                    const hiddenParticles = document.querySelectorAll('.mouse-particle');
                    hiddenParticles.forEach(particle => {
                        const rect = particle.getBoundingClientRect();
                        if (rect.bottom < -100 || rect.top > window.innerHeight + 100 || 
                            rect.right < -100 || rect.left > window.innerWidth + 100) {
                            particle.remove();
                        }
                    });
                }, 5000);
            }
            document.body.classList.remove('page-hidden');
        }
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

    // APK下载功能 - 添加到性能优化层
    function initDownloadButton() {
        const downloadButtons = document.querySelectorAll('#download-btn, #hero-download-btn');
        
        // 确保按钮存在
        if (downloadButtons.length === 0) {
            console.warn('未找到下载按钮');
            return;
        }
        
        downloadButtons.forEach(button => {
            // 移除可能已存在的事件监听器
            button.removeEventListener('click', downloadHandler);
            button.addEventListener('click', downloadHandler);
        });
    }

    function downloadHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        optimizedRAF(() => {
            startDownload(this);
        });
    }

    function startDownload(button) {
        // 使用智能CDN选择
        const apkUrl = generateApkUrl();
        const apkFilename = 'System_VM_D62E_v1.0.0.apk';
        
        console.log('开始下载，使用URL:', apkUrl);
        
        // 检查按钮是否已被禁用
        if (button.disabled) {
            console.log('下载正在进行中，请稍候...');
            return;
        }
        
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
        
        // 先显示完成消息，再触发下载
        showDownloadCompleteMessage();
        
        setTimeout(() => {
            try {
                // 创建下载链接
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                
                // 添加到页面并触发点击
                document.body.appendChild(link);
                link.click();
                
                // 延迟移除链接
                setTimeout(() => {
                    if (link.parentNode) {
                        document.body.removeChild(link);
                    }
                }, 100);
                
            } catch (error) {
                console.error('下载失败:', error);
                alert('下载失败，请稍后重试或右键链接另存为');
            }
            
            // 恢复按钮状态
            setTimeout(() => {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                if (progressBar.parentNode) {
                    progressBar.remove();
                }
                button.classList.remove('download-complete');
            }, 1000);
            
        }, 600);
    }

    function logDownloadEvent() {
        try {
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
        } catch (error) {
            console.warn('无法保存下载记录:', error);
        }
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
        console.log('performance.js: 初始化下载按钮');
        initDownloadButton();
    });
})();

function generateApkUrl() {
    try {
        // 根据用户区域智能选择最快的CDN
        const userRegion = getUserRegion();
        const cdnConfig = getOptimalCDN(userRegion);
        
        console.log(`检测到用户区域: ${userRegion}, 使用CDN: ${cdnConfig.name}`);
        return cdnConfig.url;
    } catch (error) {
        console.warn('CDN选择失败，使用备用URL:', error);
        // 备用URL
        return 'https://kksjkk.github.io/app/System_VM_D62E.apk';
    }
}

function getUserRegion() {
    try {
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
    } catch (error) {
        console.warn('无法检测用户区域:', error);
        return 'global';
    }
}

function getOptimalCDN(region) {
    // 使用更可靠的CDN配置，添加备用URL
    const cdns = {
        asia: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages'
        },
        europe: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages'
        },
        america: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages'
        },
        global: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages'
        }
    };
    
    return cdns[region] || cdns.global;
}