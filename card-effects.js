// 卡片点击特效系统
class CardEffectsSystem {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card');
        this.soundEnabled = false;
        this.performanceMode = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        this.setupCards();
        this.setupAudioContext();
        this.setupPerformanceMode();
    }
    
    setupCards() {
        this.cards.forEach(card => {
            // 添加网格覆盖层
            const gridOverlay = document.createElement('div');
            gridOverlay.className = 'card-grid-overlay';
            card.appendChild(gridOverlay);
            
            // 添加边框流光层
            const borderFlow = document.createElement('div');
            borderFlow.className = 'border-flow';
            card.appendChild(borderFlow);
            
            // 添加点击事件
            card.addEventListener('click', (e) => this.handleCardClick(e, card));
            
            // 触摸设备优化
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', () => {
                card.style.transform = '';
            }, { passive: true });
        });
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = true;
        } catch (error) {
            console.log('音频上下文不可用，禁用音效');
            this.soundEnabled = false;
        }
    }
    
    setupPerformanceMode() {
        // 根据设备性能调整特效复杂度
        if (this.performanceMode) {
            console.log('移动端性能模式启用，简化特效');
        }
    }
    
    handleCardClick(e, card) {
        // 防止重复点击
        if (card.classList.contains('click-active')) return;
        
        // 标记为激活状态
        card.classList.add('click-active');
        
        // 计算点击位置
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 执行所有特效
        this.createParticleBurst(card, x, y);
        this.createRippleEffect(card, x, y);
        this.createGridPulse(card);
        this.createScanLine(card);
        this.createTextEffect(card);
        this.createIconEffect(card);
        this.createMatrixRain(card);
        this.createEnergyWave(card, x, y);
        this.createSoundWave(card, x, y);
        this.createDigitalFall(card);
        this.createLightPillar(card, x);
        
        // 播放音效
        if (this.soundEnabled) {
            this.playCyberSound(x, y);
        }
        
        // 激活边框流光
        this.activateBorderFlow(card);
        
        // 移除激活状态
        setTimeout(() => {
            card.classList.remove('click-active');
        }, 800);
    }
    
    createParticleBurst(card, x, y) {
        if (this.performanceMode) return; // 移动端禁用
        
        const particleCount = this.performanceMode ? 8 : 16;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            
            // 随机角度和距离
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = Math.random() * 80 + 40;
            
            // 设置CSS变量
            particle.style.setProperty('--tx', Math.cos(angle));
            particle.style.setProperty('--ty', Math.sin(angle));
            
            // 随机大小和颜色
            const size = Math.random() * 3 + 2;
            const hue = Math.random() * 60 + 180; // 蓝绿色系
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: hsl(${hue}, 100%, 60%);
                animation: particleBurst ${Math.random() * 500 + 500}ms ease-out forwards;
            `;
            
            card.appendChild(particle);
            
            // 自动清理
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    createRippleEffect(card, x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-ring';
        ripple.style.cssText = `
            left: ${x}px;
            top: ${y}px;
        `;
        
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }
    
    createGridPulse(card) {
        const gridOverlay = card.querySelector('.card-grid-overlay');
        if (!gridOverlay) return;
        
        gridOverlay.style.animation = 'gridPulse 1s ease-out forwards';
        
        setTimeout(() => {
            gridOverlay.style.animation = '';
        }, 1000);
    }
    
    createScanLine(card) {
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';
        scanLine.style.cssText = `
            top: ${Math.random() * 80 + 10}%;
            animation: scanLine 0.6s ease-out forwards;
        `;
        
        card.appendChild(scanLine);
        setTimeout(() => scanLine.remove(), 1000);
    }
    
    createTextEffect(card) {
        const title = card.querySelector('h3');
        const text = card.querySelector('p');
        
        if (title) {
            const originalText = title.textContent;
            title.textContent = '';
            
            originalText.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'card-text-char';
                span.textContent = char;
                span.style.animationDelay = `${index * 0.05}s`;
                title.appendChild(span);
            });
            
            setTimeout(() => {
                title.textContent = originalText;
            }, 1000);
        }
        
        if (text) {
            text.style.animation = 'textDeconstruct 0.8s ease';
            setTimeout(() => {
                text.style.animation = '';
            }, 800);
        }
    }
    
    createIconEffect(card) {
        const icon = card.querySelector('.card-icon');
        if (icon) {
            icon.classList.add('hologram');
            setTimeout(() => {
                icon.classList.remove('hologram');
            }, 1000);
        }
    }
    
    createMatrixRain(card) {
        if (this.performanceMode) return;
        
        const chars = '01アあぁｱｧABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const count = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < count; i++) {
            const matrixChar = document.createElement('div');
            matrixChar.className = 'matrix-char';
            matrixChar.textContent = chars[Math.floor(Math.random() * chars.length)];
            
            const duration = Math.random() * 1000 + 500;
            matrixChar.style.cssText = `
                left: ${Math.random() * 90 + 5}%;
                top: ${Math.random() * 90 + 5}%;
                animation: matrixRain ${duration}ms ease-out forwards;
                animation-delay: ${i * 100}ms;
            `;
            
            card.appendChild(matrixChar);
            setTimeout(() => matrixChar.remove(), duration);
        }
    }
    
    createEnergyWave(card, x, y) {
        const wave = document.createElement('div');
        wave.className = 'energy-wave';
        wave.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            animation: energyWave 1s ease-out forwards;
        `;
        
        card.appendChild(wave);
        setTimeout(() => wave.remove(), 1000);
    }
    
    createSoundWave(card, x, y) {
        if (this.performanceMode) return;
        
        const waveCount = 3;
        
        for (let i = 0; i < waveCount; i++) {
            const soundWave = document.createElement('div');
            soundWave.className = 'sound-wave';
            
            const delay = i * 200;
            soundWave.style.cssText = `
                left: ${x - 50}px;
                top: ${y - 50}px;
                animation: soundWave 1s ease-out forwards ${delay}ms;
            `;
            
            card.appendChild(soundWave);
            setTimeout(() => soundWave.remove(), 1000 + delay);
        }
    }
    
    createDigitalFall(card) {
        if (this.performanceMode) return;
        
        const numbers = ['1010', '0101', '1100', '0011', '1001', '0110'];
        const count = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < count; i++) {
            const digital = document.createElement('div');
            digital.className = 'digital-fall';
            digital.textContent = numbers[Math.floor(Math.random() * numbers.length)];
            
            const duration = Math.random() * 800 + 400;
            digital.style.cssText = `
                left: ${Math.random() * 80 + 10}%;
                animation: digitalFall ${duration}ms ease-out forwards;
                animation-delay: ${i * 150}ms;
            `;
            
            card.appendChild(digital);
            setTimeout(() => digital.remove(), duration);
        }
    }
    
    createLightPillar(card, x) {
        const pillar = document.createElement('div');
        pillar.className = 'light-pillar';
        
        const duration = Math.random() * 600 + 400;
        pillar.style.cssText = `
            left: ${x}px;
            animation: lightPillar ${duration}ms ease-out forwards;
        `;
        
        card.appendChild(pillar);
        setTimeout(() => pillar.remove(), duration);
    }
    
    activateBorderFlow(card) {
        const borderFlow = card.querySelector('.border-flow');
        if (!borderFlow) return;
        
        borderFlow.style.opacity = '1';
        borderFlow.style.animation = 'borderFlow 1s ease-out forwards';
        
        setTimeout(() => {
            borderFlow.style.opacity = '0';
            borderFlow.style.animation = '';
        }, 1000);
    }
    
    playCyberSound(x, y) {
        if (!this.soundEnabled) return;
        
        try {
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音调（根据点击位置变化）
            const baseFreq = 300 + (x / window.innerWidth) * 500;
            const endFreq = 100 + (y / window.innerHeight) * 300;
            
            oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.3);
            
            // 设置音量包络
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            // 播放声音
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
            // 添加第二个振荡器制造更丰富的音效
            setTimeout(() => {
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);
                
                osc2.frequency.setValueAtTime(endFreq + 50, this.audioContext.currentTime + 0.1);
                osc2.frequency.exponentialRampToValueAtTime(endFreq - 50, this.audioContext.currentTime + 0.3);
                
                gain2.gain.setValueAtTime(0.05, this.audioContext.currentTime + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
                
                osc2.start(this.audioContext.currentTime + 0.1);
                osc2.stop(this.audioContext.currentTime + 0.4);
                
                setTimeout(() => {
                    osc2.disconnect();
                    gain2.disconnect();
                }, 500);
            }, 50);
            
            // 清理
            setTimeout(() => {
                oscillator.disconnect();
                gainNode.disconnect();
            }, 600);
        } catch (error) {
            console.log('音效播放失败:', error);
        }
    }
}

// 初始化卡片特效系统
document.addEventListener('DOMContentLoaded', () => {
    new CardEffectsSystem();
    
    // 性能监控
    if ('performance' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('Animation')) {
                    console.log(`动画性能: ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        
        perfObserver.observe({ entryTypes: ['animation'] });
    }
});

const CONFIG = {
    // 特效开关
    particles: true,
    ripples: true,
    sounds: true,
    matrixRain: true,
    
    // 性能设置
    maxParticles: window.innerWidth <= 768 ? 8 : 16,
    animationQuality: 'high', // 'high', 'medium', 'low'
    
    // 颜色主题
    colors: {
        primary: '#00f3ff',
        secondary: '#9400d3',
        matrix: '#00ff00'
    }
};