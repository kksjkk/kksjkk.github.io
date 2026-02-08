/**
 * 自适应卡片特效系统 - 简化版本
 */

(function() {
    'use strict';
    
    // 全局变量
    let activeCard = null;
    let clickOutsideHandler = null;
    let animationTimeouts = {};
    let systemInitialized = false;
    
    // 避免重复初始化
    if (window.adaptiveCardSystemInitialized) {
        return;
    }
    
    // 等待页面加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdaptiveCardSystem);
    } else {
        setTimeout(initAdaptiveCardSystem, 100);
    }
    
    function initAdaptiveCardSystem() {
        if (systemInitialized) {
            return;
        }
        
        window.adaptiveCardSystemInitialized = true;
        systemInitialized = true;
        
        const cards = document.querySelectorAll('.feature-card');
        if (cards.length === 0) {
            setTimeout(initAdaptiveCardSystem, 500);
            return;
        }
        
        cards.forEach((card, index) => {
            initSingleCard(card, index);
        });
        
        initGlobalClickListener();
    }
    
    function initSingleCard(card, index) {
        if (card.hasAttribute('data-card-initialized')) {
            return;
        }
        
        try {
            card.setAttribute('data-card-initialized', 'true');
            card.setAttribute('data-card-index', index);
            card._cardId = `card_${index}_${Math.random().toString(36).substr(2, 9)}`;
            
            const icon = card.querySelector('.card-icon');
            const title = card.querySelector('h3');
            const text = card.querySelector('p');
            
            if (!icon || !title || !text) {
                return;
            }
            
            if (card.querySelector('.card-content')) {
                setupCardEvents(card);
                return;
            }
            
            // 保存原始内容
            const originalIcon = icon.innerHTML;
            const originalTitle = title.textContent;
            const originalText = text.textContent;
            
            // 清空卡片
            card.innerHTML = '';
            
            // 创建扫描线容器
            const refreshContainer = document.createElement('div');
            refreshContainer.className = 'card-refresh-container';
            
            const scanLineContainer = document.createElement('div');
            scanLineContainer.className = 'refresh-scan-line-container';
            
            const scanLine = document.createElement('div');
            scanLine.className = 'refresh-scan-line';
            
            scanLineContainer.appendChild(scanLine);
            refreshContainer.appendChild(scanLineContainer);
            
            // 添加网格
            const refreshGrid = document.createElement('div');
            refreshGrid.className = 'refresh-grid';
            refreshContainer.appendChild(refreshGrid);
            
            // 创建卡片内容
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';
            
            const iconElement = document.createElement('div');
            iconElement.className = 'card-icon';
            iconElement.innerHTML = originalIcon;
            imageContainer.appendChild(iconElement);
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = originalTitle;
            
            const textElement = document.createElement('p');
            textElement.textContent = originalText;
            
            cardContent.appendChild(imageContainer);
            cardContent.appendChild(titleElement);
            cardContent.appendChild(textElement);
            
            // 添加到卡片
            card.appendChild(refreshContainer);
            card.appendChild(cardContent);
            
            // 添加边框辉光
            const borderGlow = document.createElement('div');
            borderGlow.className = 'card-border-glow';
            card.appendChild(borderGlow);
            
            // 添加渐变层
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'gradient-overlay';
            card.appendChild(gradientOverlay);
            
            // 保存DOM引用
            card._scanLine = scanLine;
            card._refreshGrid = refreshGrid;
            card._borderGlow = borderGlow;
            card._gradientOverlay = gradientOverlay;
            card._imageContainer = imageContainer;
            card._cardContent = cardContent;
            
        } catch (error) {
            console.error('卡片初始化失败:', error, card);
        }
        
        setupCardEvents(card);
    }
    
    function setupCardEvents(card) {
        let clickTimeout = null;
        let lastClickTime = 0;
        
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const now = Date.now();
            const isDoubleClick = (now - lastClickTime) < 300;
            lastClickTime = now;
            
            if (isDoubleClick) {
                resetCard(this);
                return;
            }
            
            if (clickTimeout) clearTimeout(clickTimeout);
            
            if (activeCard && activeCard !== this) {
                resetCard(activeCard);
            }
            
            activateCard(this);
            activeCard = this;
            
            clickTimeout = setTimeout(() => {
                resetCard(this);
            }, 1500);
        });
        
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                this.style.transform = 'translateY(-8px)';
                
                if (this._borderGlow) this._borderGlow.style.opacity = '1';
                if (this._gradientOverlay) this._gradientOverlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                this.style.transform = '';
                
                if (this._borderGlow) this._borderGlow.style.opacity = '0';
                if (this._gradientOverlay) this._gradientOverlay.style.opacity = '0';
            }
        });
    }
    
    function initGlobalClickListener() {
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
        
        clickOutsideHandler = function(event) {
            const clickedCard = event.target.closest('.feature-card');
            
            if (activeCard && !clickedCard) {
                resetCard(activeCard);
                activeCard = null;
            }
        };
        
        document.addEventListener('click', clickOutsideHandler);
    }
    
    function activateCard(card) {
        if (activeCard && activeCard !== card) {
            resetCard(activeCard);
        }
        
        if (animationTimeouts[card._cardId]) {
            clearTimeout(animationTimeouts[card._cardId]);
            delete animationTimeouts[card._cardId];
        }
        
        card.classList.add('active');
        card.classList.remove('rotating-back');
        
        if (card._scanLine) {
            card._scanLine.style.left = '-100%';
            card._scanLine.style.opacity = '0';
            
            void card._scanLine.offsetWidth;
            
            card._scanLine.style.transition = 'left 1.2s ease-out, opacity 1.2s ease-out';
            card._scanLine.style.left = '100%';
            card._scanLine.style.opacity = '1';
        }
        
        if (card._refreshGrid) {
            card._refreshGrid.style.transition = 'opacity 0.6s ease-out';
            card._refreshGrid.style.opacity = '0.3';
            
            setTimeout(() => {
                if (card._refreshGrid) {
                    card._refreshGrid.style.opacity = '0';
                }
            }, 600);
        }
        
        if (card._imageContainer) {
            card._imageContainer.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card._imageContainer.style.transform = 'rotate(10deg) scale(1.08)';
        }
        
        card.style.borderColor = 'rgba(0, 243, 255, 0.6)';
        card.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.3)';
        card.style.transition = 'border-color 1.2s ease-out, box-shadow 1.2s ease-out';
        
        animationTimeouts[card._cardId] = setTimeout(() => {
            resetCard(card);
        }, 1200);
    }
    
    function resetCard(card) {
        if (!card) return;
        
        card.classList.remove('active');
        
        if (card.classList.contains('rotating-back')) return;
        
        card.classList.add('rotating-back');
        
        if (animationTimeouts[card._cardId]) {
            clearTimeout(animationTimeouts[card._cardId]);
            delete animationTimeouts[card._cardId];
        }
        
        if (card._scanLine) {
            card._scanLine.style.transition = 'none';
            card._scanLine.style.left = '-100%';
            card._scanLine.style.opacity = '0';
        }
        
        if (card._refreshGrid) {
            card._refreshGrid.style.transition = 'opacity 0.3s ease-out';
            card._refreshGrid.style.opacity = '0';
        }
        
        if (card._imageContainer) {
            card._imageContainer.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card._imageContainer.style.transform = 'rotate(0deg) scale(1)';
        }
        
        card.style.borderColor = 'rgba(0, 243, 255, 0.15)';
        card.style.boxShadow = '0 5px 15px rgba(0, 243, 255, 0.05)';
        card.style.transform = '';
        
        if (card._borderGlow) card._borderGlow.style.opacity = '0';
        if (card._gradientOverlay) card._gradientOverlay.style.opacity = '0';
        
        setTimeout(() => {
            card.classList.remove('rotating-back');
            
            if (activeCard === card) {
                activeCard = null;
            }
        }, 400);
    }
    
    window.AdaptiveCardEffects = window.AdaptiveCardEffects || {
        resetActiveCard: function() {
            if (activeCard) {
                resetCard(activeCard);
                activeCard = null;
            }
        },
        getActiveCard: function() {
            return activeCard;
        },
        resetAllCards: function() {
            document.querySelectorAll('.feature-card').forEach(card => {
                resetCard(card);
            });
            activeCard = null;
        },
        triggerCardEffect: function(cardElement) {
            if (cardElement && cardElement.classList.contains('feature-card')) {
                activateCard(cardElement);
                activeCard = cardElement;
            }
        },
        getCardCount: function() {
            return document.querySelectorAll('.feature-card').length;
        },
        isInitialized: function() {
            return systemInitialized;
        }
    };
    
    window.addEventListener('beforeunload', function() {
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
        
        Object.values(animationTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        
        window.adaptiveCardSystemInitialized = false;
        systemInitialized = false;
    });
    
    window.initCardSystem = initAdaptiveCardSystem;
})();