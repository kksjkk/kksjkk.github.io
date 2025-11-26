// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
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
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            let buttonText = '🌓 暗色模式';
            
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                buttonText = '☀️ 亮色模式';
            }
            
            localStorage.setItem('theme', theme);
            themeToggle.textContent = buttonText;
        });
    }
    
    // 阅读进度条
    window.addEventListener('scroll', function() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    });
    
    // 图片懒加载
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
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
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});