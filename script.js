// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // 汉堡菜单动画
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    // 应用保存的主题
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️ 亮色模式';
    }
    
    // 主题切换事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
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
                document.body.style.opacity = '1';
            }, 300);
        });
    }
    
    // 阅读进度条
    window.addEventListener('scroll', function() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
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
    });
    
    // 图片懒加载
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
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
                        img.style.opacity = '1';
                    }, 100);
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px 0px 100px 0px' // 提前100px加载
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 回退方案：直接加载所有图片
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            img.classList.remove('lazy-load');
        });
    }
    
    // 访问统计
    window.addEventListener('load', function() {
        const visitData = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || '直接访问',
            userAgent: navigator.userAgent
        };
        
        // 存储到 localStorage
        let visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '[]');
        visitHistory.push(visitData);
        
        // 只保留最近10次访问记录
        if (visitHistory.length > 10) {
            visitHistory = visitHistory.slice(-10);
        }
        
        localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
        console.log('访问记录:', visitData);
        
        // 添加页面加载完成动画
        document.body.classList.add('loaded');
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
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加鼠标移动效果
    document.addEventListener('mousemove', function(e) {
        const particles = document.querySelector('.floating-particles');
        if (!particles) return;
        
        // 创建跟随鼠标的粒子
        if (Math.random() > 0.97) {
            createParticle(e.clientX, e.clientY);
        }
    });
    
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle mouse-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        
        document.querySelector('.floating-particles').appendChild(particle);
        
        // 移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
    
    // 添加卡片悬停声音效果（可选）
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 可以在这里添加声音效果
            // 例如: new Audio('hover-sound.mp3').play();
        });
    });
    
    // 初始化进度条动画
    const progressElement = document.getElementById('system-progress');
    if (progressElement) {
        let progress = 75;
        const interval = setInterval(() => {
            progress += Math.random() * 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressElement.value = progress;
            document.querySelector('.progress-text').textContent = Math.round(progress) + '%';
            document.querySelector('.progress-glow').style.width = progress + '%';
        }, 200);
    }
});