// 自适应旋转刷新卡片特效系统
class AdaptiveRotateRefreshCardEffects {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card');
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.activeCards = new Set();
        this.cardStates = new Map();
        this.resizeObserver = null;
        
        // 自适应配置
        this.config = {
            enableRotation: true,
            enableRefresh: true,
            maxRotationAngle: this.getOptimalRotationAngle(),
            rotationDuration: this.getOptimalDuration(),
            refreshDuration: 1200,
            autoAdjust: true
        };
        
        this.init();
    }
    
    init() {
        this.setupCards();
        this.setupPerformanceMode();
        this.setupResizeObserver();
        this.setupViewportListener();
        console.log('自适应旋转刷新卡片特效系统初始化完成');
    }
    
    getOptimalRotationAngle() {
        if (window.innerWidth <= 480) return 8;
        if (window.innerWidth <= 768) return 10;
        if (window.innerWidth <= 1024) return 12;
        if (window.innerWidth <= 1440) return 14;
        return 15; // 大屏幕
    }
    
    getOptimalDuration() {
        if (window.innerWidth <= 480) return 400;
        if (window.innerWidth <= 768) return 500;
        return 600; // 大屏幕
    }
    
    setupCards() {
        if (!this.cards.length) {
            console.warn('未找到卡片元素');
            return;
        }
        
        this.cards.forEach((card, index) => {
            card.setAttribute('data-card-index', index);
            card.setAttribute('data-card-id', `card-${index}`);
            
            this.cardStates.set(card, {
                rotated: false,
                clickCount: 0,
                lastClickTime: 0
            });
            
            // 应用自适应CSS变量
            this.applyAdaptiveStyles(card);
            
            // 包装卡片结构
            this.wrapCardStructure(card, index);
            
            // 添加事件
            this.addCardEvents(card);
        });
    }
    
    applyAdaptiveStyles(card) {
        // 设置自适应旋转角度
        const rotationAngle = this.getOptimalRotationAngle();
        card.style.setProperty('--rotation-angle', `${rotationAngle}deg`);
        
        // 设置自适应尺寸
        const isLandscape = window.innerHeight < window.innerWidth;
        const isSmallScreen = window.innerWidth <= 480;
        
        if (isLandscape && window.innerHeight < 600) {
            card.style.setProperty('--icon-size', '30px');
            card.style.setProperty('--font-size-title', '0.9rem');
            card.style.setProperty('--font-size-text', '0.75rem');
        } else if (isSmallScreen) {
            card.style.setProperty('--icon-size', '40px');
            card.style.setProperty('--font-size-title', '1rem');
            card.style.setProperty('--font-size-text', '0.8rem');
        } else {
            card.style.setProperty('--icon-size', '60px');
            card.style.setProperty('--font-size-title', '1.3rem');
            card.style.setProperty('--font-size-text', '0.95rem');
        }
    }
    
    wrapCardStructure(card, index) {
        // 检查是否已经包装过
        if (card.querySelector('.card-content')) {
            return;
        }
        
        // 获取原始内容
        const icon = card.querySelector('.card-icon');
        const title = card.querySelector('h3');
        const text = card.querySelector('p');
        const glow = card.querySelector('.card-glow');
        
        if (!icon || !title || !text) return;
        
        // 保存原始内容
        const originalIcon = icon.textContent || icon.innerHTML;
        const originalTitle = title.textContent;
        const originalText = text.textContent;
        
        // 清空卡片内容
        card.innerHTML = '';
        
        // 创建刷新特效容器
        const refreshContainer = document.createElement('div');
        refreshContainer.className = 'card-refresh-container';
        
        // 添加刷新扫描线
        const scanLine = document.createElement('div');
        scanLine.className = 'refresh-scan-line';
        refreshContainer.appendChild(scanLine);
        
        // 添加刷新网格
        const refreshGrid = document.createElement('div');
        refreshGrid.className = 'refresh-grid';
        refreshContainer.appendChild(refreshGrid);
        
        // 添加边框辉光
        const borderGlow = document.createElement('div');
        borderGlow.className = 'card-border-glow';
        refreshContainer.appendChild(borderGlow);
        
        // 添加渐变覆盖层
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'gradient-overlay';
        refreshContainer.appendChild(gradientOverlay);
        
        // 创建卡片内容容器
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';
        
        // 创建图标元素
        const iconElement = document.createElement('div');
        iconElement.className = 'card-icon';
        iconElement.innerHTML = originalIcon;
        imageContainer.appendChild(iconElement);
        
        // 创建标题
        const titleElement = document.createElement('h3');
        titleElement.textContent = originalTitle;
        
        // 创建文本
        const textElement = document.createElement('p');
        textElement.textContent = originalText;
        
        // 添加刷新计数器
        const refreshCounter = document.createElement('div');
        refreshCounter.className = 'refresh-counter';
        refreshCounter.textContent = '0次';
        
        // 组装内容
        cardContent.appendChild(imageContainer);
        cardContent.appendChild(titleElement);
        cardContent.appendChild(textElement);
        
        // 如果有辉光效果，添加到刷新容器
        if (glow) {
            refreshContainer.appendChild(glow);
        }
        
        // 添加到卡片
        card.appendChild(refreshContainer);
        card.appendChild(cardContent);
        card.appendChild(refreshCounter);
        
        // 保存原始内容引用
        card._originalContent = {
            icon: originalIcon,
            title: originalTitle,
            text: originalText
        };
    }
    
    addCardEvents(card) {
        if (card.hasAttribute('data-effects-initialized')) return;
        
        card.setAttribute('data-effects-initialized', 'true');
        
        // 点击事件
        card.addEventListener('click', (e) => {
            if (this.activeCards.has(card)) return;
            
            // 检查双击
            const now = Date.now();
            const cardState = this.cardStates.get(card);
            const isDoubleClick = (now - cardState.lastClickTime) < 300;
            
            if (isDoubleClick) {
                this.handleDoubleClick(card);
                return;
            }
            
            cardState.lastClickTime = now;
            
            this.activeCards.add(card);
            this.handleCardClick(e, card);
            
            setTimeout(() => {
                this.activeCards.delete(card);
            }, this.config.refreshDuration);
        });
        
        // 触摸设备优化
        if ('ontouchstart' in window) {
            card.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    card.style.transform = 'scale(0.98)';
                }
            }, { passive: true });
            
            card.addEventListener('touchend', () => {
                card.style.transform = '';
            }, { passive: true });
            
            // 防止长按菜单
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        // 悬停效果
        card.addEventListener('mouseenter', () => {
            if (!this.activeCards.has(card)) {
                card.style.transform = 'translateY(-8px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!this.activeCards.has(card)) {
                card.style.transform = '';
            }
        });
    }
    
    handleCardClick(e, card) {
        const cardState = this.cardStates.get(card);
        cardState.clickCount++;
        
        // 添加激活状态
        card.classList.add('active');
        
        // 如果是旋转状态，先恢复
        if (cardState.rotated) {
            this.rotateBack(card);
            
            setTimeout(() => {
                this.rotateImage(card);
                this.refreshCard(card);
                this.updateCounter(card);
            }, 400);
        } else {
            // 直接执行特效
            if (this.config.enableRotation) {
                this.rotateImage(card);
            }
            
            if (this.config.enableRefresh) {
                this.refreshCard(card);
            }
            
            this.updateCounter(card);
        }
        
        // 移除激活状态
        setTimeout(() => {
            card.classList.remove('active');
        }, this.config.refreshDuration);
    }
    
    handleDoubleClick(card) {
        const cardState = this.cardStates.get(card);
        
        // 重置点击计数
        cardState.clickCount = 0;
        
        // 强制恢复旋转
        if (cardState.rotated) {
            this.rotateBack(card);
            cardState.rotated = false;
        }
        
        // 显示重置消息
        this.showResetMessage(card);
        
        // 更新计数器
        this.updateCounter(card);
    }
    
    showResetMessage(card) {
        const counter = card.querySelector('.refresh-counter');
        if (counter) {
            const originalText = counter.textContent;
            counter.textContent = '已重置';
            counter.style.color = '#4CAF50';
            counter.style.fontWeight = 'bold';
            
            setTimeout(() => {
                counter.textContent = originalText;
                counter.style.color = '';
                counter.style.fontWeight = '';
            }, 1000);
        }
    }
    
    rotateImage(card) {
        const cardState = this.cardStates.get(card);
        const imageContainer = card.querySelector('.card-image-container');
        
        if (!imageContainer) return;
        
        // 移除之前的旋转类
        card.classList.remove('rotating-back');
        
        // 添加旋转效果
        card.classList.add('rotated');
        cardState.rotated = true;
    }
    
    rotateBack(card) {
        const cardState = this.cardStates.get(card);
        card.classList.remove('rotated');
        card.classList.add('rotating-back');
        cardState.rotated = false;
        
        setTimeout(() => {
            card.classList.remove('rotating-back');
        }, 400);
    }
    
    refreshCard(card) {
        // 触发扫描线动画
        const scanLine = card.querySelector('.refresh-scan-line');
        if (scanLine) {
            scanLine.style.animation = 'none';
            setTimeout(() => {
                scanLine.style.animation = `refreshScan ${this.config.refreshDuration}ms ease-out forwards`;
            }, 10);
        }
        
        // 触发网格动画
        const refreshGrid = card.querySelector('.refresh-grid');
        if (refreshGrid) {
            refreshGrid.style.animation = 'none';
            setTimeout(() => {
                refreshGrid.style.animation = `gridFlash ${this.config.refreshDuration}ms ease-out`;
            }, 10);
        }
        
        // 添加内容刷新效果
        const cardContent = card.querySelector('.card-content');
        if (cardContent) {
            cardContent.style.animation = 'none';
            setTimeout(() => {
                cardContent.style.animation = `contentRefresh ${this.config.refreshDuration}ms ease-out`;
            }, 10);
        }
    }
    
    updateCounter(card) {
        const cardState = this.cardStates.get(card);
        const counter = card.querySelector('.refresh-counter');
        
        if (counter) {
            // 显示计数
            counter.textContent = `${cardState.clickCount}次`;
            counter.style.animation = 'none';
            
            setTimeout(() => {
                counter.style.animation = `countUp 0.5s ease-out 0.3s forwards`;
                counter.style.opacity = '1';
            }, 10);
            
            // 5秒后逐渐隐藏
            setTimeout(() => {
                if (counter) {
                    counter.style.transition = 'opacity 1s ease';
                    counter.style.opacity = '0.3';
                }
            }, 5000);
        }
    }
    
    setupPerformanceMode() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('用户偏好减少动画，禁用特效');
            this.config.enableRotation = false;
            this.config.enableRefresh = false;
            document.body.classList.add('reduced-motion');
        }
        
        // 根据设备性能调整
        if (this.isMobile && 'hardwareConcurrency' in navigator) {
            const cores = navigator.hardwareConcurrency;
            if (cores < 4) {
                this.config.autoAdjust = false;
                this.config.maxRotationAngle = 8;
                this.config.rotationDuration = 300;
            }
        }
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    const card = entry.target;
                    if (card.classList.contains('feature-card')) {
                        this.applyAdaptiveStyles(card);
                    }
                });
            });
            
            this.cards.forEach(card => {
                this.resizeObserver.observe(card);
            });
        }
    }
    
    setupViewportListener() {
        window.addEventListener('resize', () => {
            // 更新配置
            this.config.maxRotationAngle = this.getOptimalRotationAngle();
            this.config.rotationDuration = this.getOptimalDuration();
            
            // 更新所有卡片的CSS变量
            this.cards.forEach(card => {
                this.applyAdaptiveStyles(card);
            });
        });
    }
    
    // 清理方法
    cleanup() {
        this.activeCards.clear();
        this.cards.forEach(card => {
            card.classList.remove('active', 'rotated', 'rotating-back');
            
            // 重置旋转
            const imageContainer = card.querySelector('.card-image-container');
            if (imageContainer) {
                imageContainer.style.transform = 'rotate(0deg) scale(1)';
            }
            
            // 隐藏计数器
            const counter = card.querySelector('.refresh-counter');
            if (counter) {
                counter.style.opacity = '0';
            }
        });
        
        // 清理ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
    
    // 手动触发卡片刷新
    triggerCardRefresh(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.cards.length) {
            const card = this.cards[cardIndex];
            this.handleCardClick({ clientX: 0, clientY: 0 }, card);
        }
    }
    
    // 获取卡片状态
    getCardState(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.cards.length) {
            const card = this.cards[cardIndex];
            return this.cardStates.get(card);
        }
        return null;
    }
}

// 初始化自适应旋转刷新卡片特效系统
let adaptiveRotateRefreshCardEffects = null;

function initAdaptiveRotateRefreshCardEffects() {
    try {
        if (!document.querySelectorAll) return;
        
        const init = () => {
            adaptiveRotateRefreshCardEffects = new AdaptiveRotateRefreshCardEffects();
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        
        window.addEventListener('beforeunload', () => {
            if (adaptiveRotateRefreshCardEffects) {
                adaptiveRotateRefreshCardEffects.cleanup();
            }
        });
    } catch (error) {
        console.error('自适应旋转刷新卡片特效初始化失败:', error);
    }
}

// 导出配置和API
const ADAPTIVE_ROTATE_REFRESH_CONFIG = {
    enableRotation: true,
    enableRefresh: true,
    autoAdjust: true
};

// 自动初始化
initAdaptiveRotateRefreshCardEffects();

// 提供手动控制方法
window.AdaptiveCardEffects = {
    init: initAdaptiveRotateRefreshCardEffects,
    config: ADAPTIVE_ROTATE_REFRESH_CONFIG,
    getInstance: () => adaptiveRotateRefreshCardEffects,
    triggerRefresh: function(cardIndex) {
        if (adaptiveRotateRefreshCardEffects) {
            adaptiveRotateRefreshCardEffects.triggerCardRefresh(cardIndex);
        }
    },
    resetAll: function() {
        if (adaptiveRotateRefreshCardEffects) {
            adaptiveRotateRefreshCardEffects.cleanup();
        }
    },
    updateConfig: function(newConfig) {
        if (adaptiveRotateRefreshCardEffects) {
            Object.assign(adaptiveRotateRefreshCardEffects.config, newConfig);
        }
    },
    getCardState: function(cardIndex) {
        if (adaptiveRotateRefreshCardEffects) {
            return adaptiveRotateRefreshCardEffects.getCardState(cardIndex);
        }
        return null;
    }
};