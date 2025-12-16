// 卡片点击特效系统
class CardEffectsSystem {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card');
        this.soundEnabled = false;
        this.performanceMode = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
        this.activeEffects = new Set(); // 跟踪活动中的特效
        this.audioContext = null;
        this.initialized = false;
        this.config = {
            particles: !this.isMobile,
            ripples: true,
            sounds: !this.isMobile,
            matrixRain: !this.isMobile && window.innerWidth > 480,
            maxParticles: this.isMobile ? 8 : 16,
            animationQuality: this.isMobile ? 'medium' : 'high',
            colors: {
                primary: '#00f3ff',
                secondary: '#9400d3',
                matrix: '#00ff00'
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.setupAudioContext();
            this.setupCards();
            this.setupPerformanceMode();
            this.initialized = true;
            console.log('卡片特效系统初始化完成');
        } catch (error) {
            console.error('卡片特效系统初始化失败:', error);
            // 禁用所有特效
            this.config.particles = false;
            this.config.sounds = false;
            this.config.matrixRain = false;
        }
    }
    
    setupCards() {
        if (!this.cards.length) {
            console.warn('未找到卡片元素');
            return;
        }
        
        this.cards.forEach((card, index) => {
            // 添加唯一标识
            card.setAttribute('data-card-index', index);
            
            // 添加网格覆盖层
            const gridOverlay = document.createElement('div');
            gridOverlay.className = 'card-grid-overlay';
            card.appendChild(gridOverlay);
            
            // 添加边框流光层
            const borderFlow = document.createElement('div');
            borderFlow.className = 'border-flow';
            card.appendChild(borderFlow);
            
            // 添加点击事件
            this.addCardClickEvent(card);
            
            // 触摸设备优化
            this.addTouchEvents(card);
        });
    }
    
    addCardClickEvent(card) {
        if (card.hasAttribute('data-click-initialized')) return;
        
        card.setAttribute('data-click-initialized', 'true');
        
        card.addEventListener('click', (e) => {
            // 防止重复点击
            if (card.classList.contains('click-active')) return;
            
            const cardId = card.getAttribute('data-card-index');
            if (this.activeEffects.has(cardId)) return;
            
            this.activeEffects.add(cardId);
            this.handleCardClick(e, card);
            
            // 一段时间后允许再次点击
            setTimeout(() => {
                this.activeEffects.delete(cardId);
            }, 800);
        });
    }
    
    addTouchEvents(card) {
        if (!('ontouchstart' in window)) return;
        
        card.addEventListener('touchstart', () => {
            requestAnimationFrame(() => {
                card.style.transform = 'scale(0.98)';
            });
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            requestAnimationFrame(() => {
                card.style.transform = '';
            });
        }, { passive: true });
        
        card.addEventListener('touchcancel', () => {
            requestAnimationFrame(() => {
                card.style.transform = '';
            });
        }, { passive: true });
    }
    
    setupAudioContext() {
        if (this.isMobile) {
            this.soundEnabled = false;
            return;
        }
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = true;
            
            // iOS需要用户交互后才能启动音频上下文
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    this.audioContext.resume().then(() => {
                        console.log('音频上下文已恢复');
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('touchstart', resumeAudio);
                    });
                };
                
                document.addEventListener('click', resumeAudio, { once: true });
                document.addEventListener('touchstart', resumeAudio, { once: true });
            }
        } catch (error) {
            console.log('音频上下文不可用，禁用音效:', error);
            this.soundEnabled = false;
        }
    }
    
    setupPerformanceMode() {
        if (this.performanceMode) {
            console.log('移动端性能模式启用，简化特效');
            document.body.classList.add('mobile-optimized');
        }
        
        // 检测是否要求减少动画
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('用户偏好减少动画，禁用特效');
            this.config.particles = false;
            this.config.sounds = false;
            this.config.matrixRain = false;
            document.body.classList.add('reduced-motion');
        }
    }
    
    handleCardClick(e, card) {
        // 标记为激活状态
        card.classList.add('click-active');
        
        // 计算点击位置
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 批量执行特效
        const effects = [
            () => this.createRippleEffect(card, x, y),
            () => this.createGridPulse(card),
            () => this.createScanLine(card),
            () => this.createTextEffect(card),
            () => this.createIconEffect(card),
            () => this.createLightPillar(card, x)
        ];
        
        if (this.config.particles) {
            effects.push(() => this.createParticleBurst(card, x, y));
        }
        
        if (this.config.matrixRain) {
            effects.push(() => this.createMatrixRain(card));
        }
        
        if (!this.performanceMode) {
            effects.push(
                () => this.createEnergyWave(card, x, y),
                () => this.createSoundWave(card, x, y),
                () => this.createDigitalFall(card)
            );
        }
        
        // 激活边框流光
        effects.push(() => this.activateBorderFlow(card));
        
        // 按顺序执行特效
        effects.forEach((effect, index) => {
            setTimeout(() => {
                try {
                    effect();
                } catch (error) {
                    console.warn(`特效 ${index} 执行失败:`, error);
                }
            }, index * 30);
        });
        
        // 播放音效
        if (this.config.sounds && this.soundEnabled) {
            setTimeout(() => {
                this.playCyberSound(x, y);
            }, 100);
        }
        
        // 移除激活状态
        setTimeout(() => {
            card.classList.remove('click-active');
        }, 800);
    }
    
    createParticleBurst(card, x, y) {
        if (!this.config.particles || this.performanceMode) return;
        
        const particleCount = Math.min(this.config.maxParticles, 16);
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            
            // 随机角度和距离
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.5 - 0.25);
            const distance = Math.random() * 60 + 30;
            
            // 随机大小和颜色
            const size = Math.random() * 3 + 2;
            const hue = 180 + Math.random() * 60; // 蓝绿色系
            const lightness = 50 + Math.random() * 20;
            
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: hsl(${hue}, 100%, ${lightness}%);
                --tx: ${tx};
                --ty: ${ty};
                animation: particleBurst ${Math.random() * 300 + 400}ms ease-out forwards;
                animation-delay: ${Math.random() * 100}ms;
            `;
            
            card.appendChild(particle);
            particles.push(particle);
        }
        
        // 自动清理
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle && particle.parentNode) {
                    particle.remove();
                }
            });
        }, 1000);
    }
    
    createRippleEffect(card, x, y) {
        if (!this.config.ripples) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple-ring';
        ripple.style.cssText = `
            left: ${x}px;
            top: ${y}px;
        `;
        
        card.appendChild(ripple);
        setTimeout(() => {
            if (ripple.parentNode) ripple.remove();
        }, 1000);
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
        setTimeout(() => {
            if (scanLine.parentNode) scanLine.remove();
        }, 1000);
    }
    
    createTextEffect(card) {
        const title = card.querySelector('h3');
        const text = card.querySelector('p');
        
        if (title) {
            const originalText = title.textContent;
            const chars = originalText.split('');
            
            // 保存原始HTML
            const originalHTML = title.innerHTML;
            
            // 清空并添加动画字符
            title.innerHTML = '';
            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'card-text-char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.animationDelay = `${index * 0.05}s`;
                title.appendChild(span);
            });
            
            // 恢复原始文本
            setTimeout(() => {
                title.innerHTML = originalHTML;
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
        if (!this.config.matrixRain || this.performanceMode) return;
        
        const chars = '01アあぁｱｧABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const count = Math.floor(Math.random() * 4) + 2;
        const matrixChars = [];
        
        for (let i = 0; i < count; i++) {
            const matrixChar = document.createElement('div');
            matrixChar.className = 'matrix-char';
            matrixChar.textContent = chars[Math.floor(Math.random() * chars.length)];
            
            const duration = Math.random() * 800 + 400;
            matrixChar.style.cssText = `
                left: ${Math.random() * 85 + 7.5}%;
                top: ${Math.random() * 85 + 7.5}%;
                animation: matrixRain ${duration}ms ease-out forwards;
                animation-delay: ${i * 80}ms;
            `;
            
            card.appendChild(matrixChar);
            matrixChars.push(matrixChar);
            
            setTimeout(() => {
                if (matrixChar.parentNode) matrixChar.remove();
            }, duration);
        }
    }
    
    createEnergyWave(card, x, y) {
        if (this.performanceMode) return;
        
        const wave = document.createElement('div');
        wave.className = 'energy-wave';
        wave.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            animation: energyWave 1s ease-out forwards;
        `;
        
        card.appendChild(wave);
        setTimeout(() => {
            if (wave.parentNode) wave.remove();
        }, 1000);
    }
    
    createSoundWave(card, x, y) {
        if (this.performanceMode || !this.config.sounds) return;
        
        const waveCount = 2;
        const waves = [];
        
        for (let i = 0; i < waveCount; i++) {
            const soundWave = document.createElement('div');
            soundWave.className = 'sound-wave';
            
            const delay = i * 150;
            soundWave.style.cssText = `
                left: ${x - 50}px;
                top: ${y - 50}px;
                animation: soundWave 1s ease-out forwards ${delay}ms;
            `;
            
            card.appendChild(soundWave);
            waves.push(soundWave);
            
            setTimeout(() => {
                if (soundWave.parentNode) soundWave.remove();
            }, 1000 + delay);
        }
    }
    
    createDigitalFall(card) {
        if (this.performanceMode) return;
        
        const numbers = ['1010', '0101', '1100', '0011', '1001', '0110'];
        const count = Math.floor(Math.random() * 2) + 1;
        const digitals = [];
        
        for (let i = 0; i < count; i++) {
            const digital = document.createElement('div');
            digital.className = 'digital-fall';
            digital.textContent = numbers[Math.floor(Math.random() * numbers.length)];
            
            const duration = Math.random() * 600 + 300;
            digital.style.cssText = `
                left: ${Math.random() * 75 + 12.5}%;
                animation: digitalFall ${duration}ms ease-out forwards;
                animation-delay: ${i * 120}ms;
            `;
            
            card.appendChild(digital);
            digitals.push(digital);
            
            setTimeout(() => {
                if (digital.parentNode) digital.remove();
            }, duration);
        }
    }
    
    createLightPillar(card, x) {
        const pillar = document.createElement('div');
        pillar.className = 'light-pillar';
        
        const duration = Math.random() * 500 + 300;
        pillar.style.cssText = `
            left: ${x}px;
            animation: lightPillar ${duration}ms ease-out forwards;
        `;
        
        card.appendChild(pillar);
        setTimeout(() => {
            if (pillar.parentNode) pillar.remove();
        }, duration);
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
        if (!this.soundEnabled || !this.audioContext || this.audioContext.state !== 'running') return;
        
        try {
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音调（根据点击位置变化）
            const baseFreq = 300 + (x / window.innerWidth) * 400;
            const endFreq = 150 + (y / window.innerHeight) * 200;
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.2);
            
            // 设置音量包络
            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
            
            // 播放声音
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.4);
            
            // 清理
            setTimeout(() => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // 忽略清理错误
                }
            }, 500);
        } catch (error) {
            console.log('音效播放失败:', error);
            this.soundEnabled = false;
        }
    }
    
    // 清理所有特效
    cleanup() {
        this.activeEffects.clear();
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                this.audioContext.close();
            } catch (error) {
                console.log('音频上下文关闭失败:', error);
            }
        }
    }
}

// 初始化卡片特效系统
let cardEffectsSystem = null;

function initCardEffects() {
    try {
        // 检查是否支持必要特性
        if (!document.querySelectorAll || !window.requestAnimationFrame) {
            console.log('浏览器不支持必要特性，禁用卡片特效');
            return;
        }
        
        // 等待DOM完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                cardEffectsSystem = new CardEffectsSystem();
            });
        } else {
            cardEffectsSystem = new CardEffectsSystem();
        }
        
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            if (cardEffectsSystem) {
                cardEffectsSystem.cleanup();
            }
        });
    } catch (error) {
        console.error('卡片特效初始化失败:', error);
    }
}

// 开始初始化
initCardEffects();

// 性能监控（可选）
if ('performance' in window && window.PerformanceObserver) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('Animation')) {
                    console.log(`动画性能: ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        
        perfObserver.observe({ entryTypes: ['animation'] });
    } catch (error) {
        console.log('性能监控不可用:', error);
    }
}

// 导出配置（如果需要）
const CARD_EFFECTS_CONFIG = {
    particles: true,
    ripples: true,
    sounds: true,
    matrixRain: true
};