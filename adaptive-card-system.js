/**
 * 自适应卡片特效系统 - 修复扫描线特效版本
 * 增加点击其他地方恢复角度功能
 * 优化版 - 修复初始化问题
 */

(function() {
    'use strict';
    
    // 全局变量
    let activeCard = null;
    let clickOutsideHandler = null;
    let animationTimeouts = {};
    let systemInitialized = false;
    
    // 检查卡片特效系统是否已加载
    if (window.adaptiveCardSystemInitialized) {
        console.warn('卡片特效系统已经初始化，跳过重复初始化');
        return;
    }
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdaptiveCardSystem);
    } else {
        // 如果DOM已经加载，设置延时确保其他脚本已加载
        setTimeout(initAdaptiveCardSystem, 100);
    }
    
    function initAdaptiveCardSystem() {
        console.log('初始化自适应卡片特效系统...');
        
        // 避免重复初始化
        if (systemInitialized) {
            console.log('卡片系统已初始化，跳过');
            return;
        }
        
        // 检查是否已经有主脚本处理卡片
        if (window.mainScriptInitialized && document.body.getAttribute('data-main-script-initialized') === 'true') {
            console.log('主脚本已初始化，确保不会冲突');
        }
        
        window.adaptiveCardSystemInitialized = true;
        systemInitialized = true;
        
        // 获取所有卡片
        const cards = document.querySelectorAll('.feature-card');
        if (cards.length === 0) {
            console.warn('未找到卡片元素，等待重试...');
            // 等待重试
            setTimeout(initAdaptiveCardSystem, 500);
            return;
        }
        
        console.log(`找到 ${cards.length} 张卡片，开始初始化...`);
        
        // 初始化每张卡片
        cards.forEach((card, index) => {
            initSingleCard(card, index);
        });
        
        // 初始化全局点击事件监听
        initGlobalClickListener();
        
        // 添加卡片状态提示
        setTimeout(() => {
            const activeCard = window.AdaptiveCardEffects.getActiveCard();
            console.log(`已初始化 ${cards.length} 张卡片特效，当前激活卡片:`, activeCard ? '有' : '无');
        }, 100);
    }
    
    function initSingleCard(card, index) {
        // 避免重复初始化
        if (card.hasAttribute('data-card-initialized')) {
            return;
        }
        
        try {
            card.setAttribute('data-card-initialized', 'true');
            card.setAttribute('data-card-index', index);
            card._cardId = `card_${index}_${Math.random().toString(36).substr(2, 9)}`;
            
            // 检查卡片结构
            const icon = card.querySelector('.card-icon');
            const title = card.querySelector('h3');
            const text = card.querySelector('p');
            
            if (!icon || !title || !text) {
                console.warn('卡片结构不完整，跳过初始化:', card);
                return;
            }
            
            // 如果已经有包装好的结构，跳过
            if (card.querySelector('.card-content')) {
                console.log('卡片已包装，跳过包装步骤');
                setupCardEvents(card);
                return;
            }
            
            // 保存原始内容
            const originalIcon = icon.innerHTML;
            const originalTitle = title.textContent;
            const originalText = text.textContent;
            const cardGlow = card.querySelector('.card-glow');
            const originalGlow = cardGlow ? cardGlow.outerHTML : '';
            
            // 清空卡片
            card.innerHTML = '';
            
            // 创建刷新容器
            const refreshContainer = document.createElement('div');
            refreshContainer.className = 'card-refresh-container';
            refreshContainer.style.position = 'absolute';
            refreshContainer.style.top = '0';
            refreshContainer.style.left = '0';
            refreshContainer.style.width = '100%';
            refreshContainer.style.height = '100%';
            refreshContainer.style.overflow = 'hidden';
            refreshContainer.style.zIndex = '1';
            refreshContainer.style.pointerEvents = 'none';
            
            // 创建扫描线容器
            const scanLineContainer = document.createElement('div');
            scanLineContainer.className = 'refresh-scan-line-container';
            scanLineContainer.style.position = 'absolute';
            scanLineContainer.style.top = '0';
            scanLineContainer.style.left = '0';
            scanLineContainer.style.width = '100%';
            scanLineContainer.style.height = '100%';
            scanLineContainer.style.overflow = 'hidden';
            
            // 添加扫描线
            const scanLine = document.createElement('div');
            scanLine.className = 'refresh-scan-line';
            scanLine.style.position = 'absolute';
            scanLine.style.top = '0';
            scanLine.style.left = '-100%';
            scanLine.style.width = '100%';
            scanLine.style.height = '2px';
            scanLine.style.background = 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.8), rgba(148, 0, 211, 0.8), transparent)';
            scanLine.style.filter = 'blur(1px)';
            scanLine.style.zIndex = '3';
            
            scanLineContainer.appendChild(scanLine);
            refreshContainer.appendChild(scanLineContainer);
            
            // 添加网格
            const refreshGrid = document.createElement('div');
            refreshGrid.className = 'refresh-grid';
            refreshGrid.style.position = 'absolute';
            refreshGrid.style.top = '0';
            refreshGrid.style.left = '0';
            refreshGrid.style.width = '100%';
            refreshGrid.style.height = '100%';
            refreshGrid.style.backgroundImage = 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)';
            refreshGrid.style.backgroundSize = '20px 20px';
            refreshGrid.style.opacity = '0';
            refreshGrid.style.zIndex = '2';
            refreshContainer.appendChild(refreshGrid);
            
            // 添加原始的光晕效果（如果有）
            if (originalGlow) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalGlow;
                const glowElement = tempDiv.firstChild;
                if (glowElement) {
                    glowElement.style.position = 'absolute';
                    glowElement.style.zIndex = '1';
                    refreshContainer.appendChild(glowElement);
                }
            }
            
            // 创建卡片内容容器
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            cardContent.style.position = 'relative';
            cardContent.style.width = '100%';
            cardContent.style.height = '100%';
            cardContent.style.display = 'flex';
            cardContent.style.flexDirection = 'column';
            cardContent.style.justifyContent = 'center';
            cardContent.style.alignItems = 'center';
            cardContent.style.padding = '1.5rem 1rem';
            cardContent.style.zIndex = '2';
            
            // 创建图片容器
            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';
            imageContainer.style.position = 'relative';
            imageContainer.style.width = '60px';
            imageContainer.style.height = '60px';
            imageContainer.style.margin = '0 auto 1rem';
            imageContainer.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            imageContainer.style.transformOrigin = 'center';
            imageContainer.style.zIndex = '2';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            
            // 创建图标
            const iconElement = document.createElement('div');
            iconElement.className = 'card-icon';
            iconElement.innerHTML = originalIcon;
            iconElement.style.fontSize = '2.5rem';
            iconElement.style.transition = 'all 0.3s ease';
            imageContainer.appendChild(iconElement);
            
            // 创建标题
            const titleElement = document.createElement('h3');
            titleElement.textContent = originalTitle;
            titleElement.style.color = '#00f3ff';
            titleElement.style.marginBottom = '0.8rem';
            titleElement.style.fontSize = '1.3rem';
            titleElement.style.lineHeight = '1.3';
            titleElement.style.textAlign = 'center';
            titleElement.style.width = '100%';
            
            // 创建文本
            const textElement = document.createElement('p');
            textElement.textContent = originalText;
            textElement.style.color = '#a0a0a0';
            textElement.style.fontSize = '0.95rem';
            textElement.style.lineHeight = '1.5';
            textElement.style.textAlign = 'center';
            textElement.style.maxWidth = '90%';
            textElement.style.margin = '0 auto';
            
            // 组装内容
            cardContent.appendChild(imageContainer);
            cardContent.appendChild(titleElement);
            cardContent.appendChild(textElement);
            
            // 添加到卡片
            card.appendChild(refreshContainer);
            card.appendChild(cardContent);
            
            // 添加边框辉光
            const borderGlow = document.createElement('div');
            borderGlow.className = 'card-border-glow';
            borderGlow.style.position = 'absolute';
            borderGlow.style.top = '-1px';
            borderGlow.style.left = '-1px';
            borderGlow.style.right = '-1px';
            borderGlow.style.bottom = '-1px';
            borderGlow.style.borderRadius = 'inherit';
            borderGlow.style.background = 'linear-gradient(45deg, transparent, rgba(0, 243, 255, 0.1), transparent)';
            borderGlow.style.opacity = '0';
            borderGlow.style.transition = 'opacity 0.3s ease';
            borderGlow.style.pointerEvents = 'none';
            borderGlow.style.zIndex = '1';
            card.appendChild(borderGlow);
            
            // 添加渐变覆盖层
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'gradient-overlay';
            gradientOverlay.style.position = 'absolute';
            gradientOverlay.style.top = '0';
            gradientOverlay.style.left = '0';
            gradientOverlay.style.width = '100%';
            gradientOverlay.style.height = '100%';
            gradientOverlay.style.background = 'linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, transparent 50%, rgba(0, 243, 255, 0.05) 100%)';
            gradientOverlay.style.opacity = '0';
            gradientOverlay.style.transition = 'opacity 0.3s ease';
            gradientOverlay.style.pointerEvents = 'none';
            gradientOverlay.style.zIndex = '1';
            card.appendChild(gradientOverlay);
            
            // 保存DOM引用以便后续使用
            card._scanLine = scanLine;
            card._refreshGrid = refreshGrid;
            card._borderGlow = borderGlow;
            card._gradientOverlay = gradientOverlay;
            card._imageContainer = imageContainer;
            card._cardContent = cardContent;
            
        } catch (error) {
            console.error('卡片初始化失败:', error, card);
        }
        
        // 添加事件监听器
        setupCardEvents(card);
    }
    
    function setupCardEvents(card) {
        let clickTimeout = null;
        let lastClickTime = 0;
        
        // 点击事件
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const now = Date.now();
            const isDoubleClick = (now - lastClickTime) < 300;
            lastClickTime = now;
            
            if (isDoubleClick) {
                // 双击重置
                resetCard(this);
                return;
            }
            
            // 清除之前的超时
            if (clickTimeout) clearTimeout(clickTimeout);
            
            // 如果已经有激活的卡片，先恢复它
            if (activeCard && activeCard !== this) {
                resetCard(activeCard);
            }
            
            // 激活当前卡片
            activateCard(this);
            activeCard = this;
            
            // 设置超时自动重置
            clickTimeout = setTimeout(() => {
                resetCard(this);
            }, 1500);
        });
        
        // 悬停效果
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                this.style.transform = 'translateY(-8px)';
                
                // 显示悬停效果
                if (this._borderGlow) this._borderGlow.style.opacity = '1';
                if (this._gradientOverlay) this._gradientOverlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                this.style.transform = '';
                
                // 隐藏悬停效果
                if (this._borderGlow) this._borderGlow.style.opacity = '0';
                if (this._gradientOverlay) this._gradientOverlay.style.opacity = '0';
            }
        });
        
        // 触摸设备优化
        if ('ontouchstart' in window) {
            card.addEventListener('touchstart', function() {
                if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                    this.style.transform = 'scale(0.98)';
                }
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                if (!this.classList.contains('active') && !this.classList.contains('rotating-back')) {
                    this.style.transform = '';
                }
            }, { passive: true });
        }
    }
    
    function initGlobalClickListener() {
        // 移除旧的监听器
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
        
        // 创建新的全局点击监听器
        clickOutsideHandler = function(event) {
            // 检查点击的是否是卡片
            const clickedCard = event.target.closest('.feature-card');
            
            // 如果有激活的卡片且点击的不是卡片
            if (activeCard && !clickedCard) {
                resetCard(activeCard);
                activeCard = null;
            }
        };
        
        // 添加全局点击监听
        document.addEventListener('click', clickOutsideHandler);
    }
    
    function activateCard(card) {
        // 移除之前的激活状态
        if (activeCard && activeCard !== card) {
            resetCard(activeCard);
        }
        
        // 清除可能存在的动画超时
        if (animationTimeouts[card._cardId]) {
            clearTimeout(animationTimeouts[card._cardId]);
            delete animationTimeouts[card._cardId];
        }
        
        // 添加激活类
        card.classList.add('active');
        card.classList.remove('rotating-back');
        
        // 确保扫描线重置并显示
        if (card._scanLine) {
            // 重置扫描线位置
            card._scanLine.style.left = '-100%';
            card._scanLine.style.opacity = '0';
            
            // 强制重绘
            void card._scanLine.offsetWidth;
            
            // 开始扫描线动画
            card._scanLine.style.transition = 'left 1.2s ease-out, opacity 1.2s ease-out';
            card._scanLine.style.left = '100%';
            card._scanLine.style.opacity = '1';
        }
        
        // 显示网格
        if (card._refreshGrid) {
            card._refreshGrid.style.transition = 'opacity 0.6s ease-out';
            card._refreshGrid.style.opacity = '0.3';
            
            // 网格闪烁效果
            setTimeout(() => {
                if (card._refreshGrid) {
                    card._refreshGrid.style.opacity = '0';
                }
            }, 600);
        }
        
        // 旋转图标
        if (card._imageContainer) {
            card._imageContainer.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card._imageContainer.style.transform = 'rotate(10deg) scale(1.08)';
        }
        
        // 添加内容刷新效果
        if (card._cardContent) {
            card._cardContent.style.filter = 'brightness(1.5) contrast(1.3)';
            card._cardContent.style.transition = 'filter 1s ease-out';
            
            setTimeout(() => {
                if (card._cardContent) {
                    card._cardContent.style.filter = 'brightness(1) contrast(1)';
                }
            }, 500);
        }
        
        // 标题和文本动画
        const title = card.querySelector('h3');
        const text = card.querySelector('p');
        
        if (title) {
            title.style.animation = 'textRefresh 0.8s ease-out';
        }
        
        if (text) {
            text.style.animation = 'textRefresh 0.8s ease-out 0.1s';
        }
        
        // 设置卡片边框和阴影动画
        card.style.borderColor = 'rgba(0, 243, 255, 0.6)';
        card.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.3)';
        card.style.transition = 'border-color 1.2s ease-out, box-shadow 1.2s ease-out';
        
        // 设置恢复动画的超时
        animationTimeouts[card._cardId] = setTimeout(() => {
            resetCard(card);
        }, 1200);
    }
    
    function resetCard(card) {
        if (!card) return;
        
        // 清除激活状态
        card.classList.remove('active');
        
        // 如果正在旋转恢复，不重复执行
        if (card.classList.contains('rotating-back')) return;
        
        card.classList.add('rotating-back');
        
        // 清除超时
        if (animationTimeouts[card._cardId]) {
            clearTimeout(animationTimeouts[card._cardId]);
            delete animationTimeouts[card._cardId];
        }
        
        // 恢复扫描线
        if (card._scanLine) {
            card._scanLine.style.transition = 'none';
            card._scanLine.style.left = '-100%';
            card._scanLine.style.opacity = '0';
        }
        
        // 恢复网格
        if (card._refreshGrid) {
            card._refreshGrid.style.transition = 'opacity 0.3s ease-out';
            card._refreshGrid.style.opacity = '0';
        }
        
        // 恢复图标旋转
        if (card._imageContainer) {
            card._imageContainer.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card._imageContainer.style.transform = 'rotate(0deg) scale(1)';
        }
        
        // 恢复内容效果
        if (card._cardContent) {
            card._cardContent.style.filter = 'none';
        }
        
        // 恢复卡片样式
        card.style.borderColor = 'rgba(0, 243, 255, 0.15)';
        card.style.boxShadow = '0 5px 15px rgba(0, 243, 255, 0.05)';
        card.style.transform = '';
        
        // 移除悬停效果
        if (card._borderGlow) card._borderGlow.style.opacity = '0';
        if (card._gradientOverlay) card._gradientOverlay.style.opacity = '0';
        
        // 移除旋转恢复类
        setTimeout(() => {
            card.classList.remove('rotating-back');
            
            // 如果这是当前激活的卡片，清空引用
            if (activeCard === card) {
                activeCard = null;
            }
        }, 400);
    }
    
    // 提供全局访问
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
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
        
        // 清理所有超时
        Object.values(animationTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        
        // 重置标记
        window.adaptiveCardSystemInitialized = false;
        systemInitialized = false;
    });
    
    // 导出初始化函数以便其他脚本可以调用
    window.initCardSystem = initAdaptiveCardSystem;
})();