[file name]: performance.js
[file content begin]
// 高级性能优化层（兼容性修复版）
(function() {
    'use strict';
    
    // 使用更安全的浏览器检测
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isEdge = /Edg/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent);
    const isVia = /ViaBrowser/i.test(navigator.userAgent);
    const isBaidu = /baidubrowser|BIDUBrowser/i.test(navigator.userAgent);
    const isSogou = /SogouMobileBrowser/i.test(navigator.userAgent);
    
    // 针对不同浏览器的优化
    console.log('检测到浏览器:', {
        userAgent: navigator.userAgent.substring(0, 100),
        isSafari: isSafari,
        isEdge: isEdge,
        isChrome: isChrome,
        isVia: isVia,
        isBaidu: isBaidu,
        isSogou: isSogou
    });
    
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

    // APK下载功能 - 浏览器兼容性修复
    function initDownloadButton() {
        const downloadButtons = document.querySelectorAll('#download-btn, #hero-download-btn');
        
        if (downloadButtons.length === 0) {
            console.warn('未找到下载按钮');
            return;
        }
        
        downloadButtons.forEach(button => {
            // 清除旧事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', downloadHandler);
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
        // 检查按钮是否已被禁用
        if (button.disabled || button.classList.contains('downloading')) {
            console.log('下载正在进行中，请稍候...');
            return;
        }
        
        // 标记为下载中
        button.disabled = true;
        button.classList.add('downloading');
        button.style.opacity = '0.8';
        button.style.cursor = 'not-allowed';
        
        // 显示进度条
        const existingProgress = button.querySelector('.download-progress');
        if (existingProgress) {
            existingProgress.remove();
        }
        
        const progressBar = document.createElement('div');
        progressBar.className = 'download-progress';
        progressBar.style.width = '0%';
        button.appendChild(progressBar);
        
        // 模拟下载进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                completeDownload(button, progressBar);
            }
            progressBar.style.width = progress + '%';
        }, 100);
        
        // 记录下载事件
        logDownloadEvent();
    }

    function completeDownload(button, progressBar) {
        // 下载完成动画
        button.classList.add('download-complete');
        
        // 延迟显示完成消息
        setTimeout(() => {
            showDownloadCompleteMessage();
            
            // 触发实际下载
            triggerActualDownload();
            
            // 恢复按钮状态
            setTimeout(() => {
                button.disabled = false;
                button.classList.remove('downloading', 'download-complete');
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                if (progressBar && progressBar.parentNode) {
                    progressBar.remove();
                }
            }, 1500);
        }, 600);
    }

    function triggerActualDownload() {
        try {
            const apkUrl = generateApkUrl();
            const apkFilename = 'System_VM_D62E_v1.0.0.apk';
            
            // 创建兼容性下载方法
            if (window.navigator.msSaveBlob) {
                // IE专用方法
                const xhr = new XMLHttpRequest();
                xhr.open('GET', apkUrl, true);
                xhr.responseType = 'blob';
                xhr.onload = function() {
                    if (this.status === 200) {
                        const blob = new Blob([this.response], { type: 'application/vnd.android.package-archive' });
                        window.navigator.msSaveBlob(blob, apkFilename);
                    }
                };
                xhr.send();
            } else {
                // 标准下载方法
                const link = document.createElement('a');
                link.href = apkUrl;
                link.download = apkFilename;
                link.style.display = 'none';
                
                // 处理Safari的下载限制
                if (isSafari) {
                    link.target = '_blank';
                    window.open(apkUrl, '_blank');
                } else {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        } catch (error) {
            console.error('下载失败:', error);
            // 备用方案：提示用户手动下载
            setTimeout(() => {
                alert('如果下载未自动开始，请手动访问: https://kksjkk.github.io/app/System_VM_D62E.apk');
            }, 500);
        }
    }

    function logDownloadEvent() {
        try {
            const downloadData = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                url: window.location.href,
                browser: {
                    isSafari: isSafari,
                    isEdge: isEdge,
                    isChrome: isChrome,
                    isVia: isVia,
                    isBaidu: isBaidu,
                    isSogou: isSogou
                }
            };
            
            // 存储到localStorage
            let downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
            downloadHistory.push(downloadData);
            
            if (downloadHistory.length > 20) {
                downloadHistory = downloadHistory.slice(-20);
            }
            
            localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
        } catch (error) {
            console.warn('无法保存下载记录:', error);
        }
    }

    function showDownloadCompleteMessage() {
        const existingMessage = document.querySelector('.download-complete-message');
        if (existingMessage) return;
        
        const message = document.createElement('div');
        message.className = 'download-complete-message';
        message.innerHTML = `
            <div class="download-message-box">
                <div class="download-icon">✅</div>
                <h3>下载完成！</h3>
                <p>APK文件已保存到您的设备</p>
                <p class="download-note">安装后应用功能完整，数据永久保存</p>
                <button class="download-confirm-btn">确定</button>
            </div>
        `;
        
        // 添加CSS样式
        const style = document.createElement('style');
        style.textContent = `
            .download-message-box {
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
                -webkit-backdrop-filter: blur(10px);
                text-align: center;
                z-index: 10000;
                box-shadow: 0 0 30px rgba(0, 243, 255, 0.3);
                animation: fadeIn 0.3s ease;
                min-width: 300px;
                max-width: 90vw;
            }
            
            .download-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .download-message-box h3 {
                margin-bottom: 0.5rem;
                color: #00f3ff;
            }
            
            .download-message-box p {
                margin-bottom: 0.5rem;
                opacity: 0.8;
            }
            
            .download-note {
                font-size: 0.9rem;
                opacity: 0.6;
            }
            
            .download-confirm-btn {
                margin-top: 1rem;
                padding: 0.5rem 1.5rem;
                background: rgba(0, 243, 255, 0.2);
                border: 1px solid rgba(0, 243, 255, 0.5);
                color: #00f3ff;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
                min-height: 44px;
                min-width: 100px;
            }
            
            .download-confirm-btn:hover {
                background: rgba(0, 243, 255, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(message);
        
        // 绑定关闭事件
        message.querySelector('.download-confirm-btn').addEventListener('click', function() {
            message.remove();
        });
        
        // 3秒后自动消失
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 3000);
    }

    // 初始化所有功能
    function initAll() {
        console.log('初始化性能优化层...');
        
        // 初始化基础功能
        initDownloadButton();
        initPerformanceMonitoring();
        initVisibilityHandler();
        
        // 根据浏览器能力选择性初始化
        if (!isSafari || window.innerWidth > 768) {
            initParticleSystem();
            initCleanupSystem();
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
        initAll();
    }
})();

// 独立函数，保持外部可访问性
function generateApkUrl() {
    try {
        const userRegion = getUserRegion();
        const cdnConfig = getOptimalCDN(userRegion);
        console.log(`检测到用户区域: ${userRegion}, 使用CDN: ${cdnConfig.name}`);
        return cdnConfig.url;
    } catch (error) {
        console.warn('CDN选择失败，使用备用URL:', error);
        return 'https://kksjkk.github.io/app/System_VM_D62E.apk';
    }
}

function getUserRegion() {
    try {
        // 改进的区域检测
        const timezone = Intl.DateTimeFormat ? 
            Intl.DateTimeFormat().resolvedOptions().timeZone : '';
        const language = navigator.language || navigator.userLanguage || '';
        
        if (!timezone && !language) return 'global';
        
        if (timezone.includes('Asia') || language.includes('zh') || 
            language.includes('CN') || language.includes('TW') || 
            language.includes('HK')) {
            return 'asia';
        } else if (timezone.includes('Europe')) {
            return 'europe';
        } else if (timezone.includes('America')) {
            return 'america';
        }
        return 'global';
    } catch (error) {
        return 'global';
    }
}

function getOptimalCDN(region) {
    // 所有CDN都使用同一个URL确保兼容性
    const cdns = {
        asia: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages - 亚洲'
        },
        europe: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages - 欧洲'
        },
        america: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages - 美洲'
        },
        global: {
            url: 'https://kksjkk.github.io/app/System_VM_D62E.apk',
            name: 'GitHub Pages - 全球'
        }
    };

// 创建一个可以直接调用的下载函数
function createDownloadLink() {
    const url = generateApkUrl();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'System_VM_D62E_v1.0.0.apk';
    link.textContent = '点击下载APK文件';
    link.className = 'scifi-button';
    link.style.display = 'inline-block';
    link.style.margin = '10px';
    return link;
}

// 使用示例
const downloadLink = createDownloadLink();
document.body.appendChild(downloadLink);

    
    return cdns[region] || cdns.global;
}
[file content end]