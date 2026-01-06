/**
 * 自适应卡片特效系统 - 无计数器版本
 * 增加点击其他地方恢复角度功能
 */

(function() {
    'use strict';
    
    // 全局变量
    let activeCard = null;
    let clickOutsideHandler = null;
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdaptiveCardSystem);
    } else {
        setTimeout(initAdaptiveCardSystem, 100);
    }
    
    function initAdaptiveCardSystem() {
        console.log('初始化自适应卡片特效系统...');
        
        // 检查是否已经初始化
        if (window.adaptiveCardSystemInitialized) {
            console.log('卡片系统已初始化，跳过');
            return;
        }
        
        window.adaptiveCardSystemInitialized = true;
        
        // 获取所有卡片
        const cards = document.querySelectorAll('.feature-card');
        if (cards.length === 0) {
            console.warn('未找到卡片元素');
            return;
        }
        
        // 初始化每张卡片
        cards.forEach((card, index) => {
            initSingleCard(card, index);
        });
        
        // 初始化全局点击事件监听
        initGlobalClickListener();
        
        console.log(`已初始化 ${cards.length} 张卡片特效`);
    }
    
    function initSingleCard(card, index) {
        // 避免重复初始化
        if (card.hasAttribute('data-card-initialized')) return;
        card.setAttribute('data-card-initialized', 'true');
        card.setAttribute('data-card-index', index);
        
        // 包装卡片结构
        wrapCardStructure(card);
        
        // 添加事件监听器
        setupCardEvents(card);
    }
    
    function wrapCardStructure(card) {
        // 检查是否已经包装过
        if (card.querySelector('.card-content')) return;
        
        try {
            // 获取原始内容
            const icon = card.querySelector('.card-icon');
            const title = card.querySelector('h3');
            const text = card.querySelector('p');
            
            if (!icon || !title || !text) return;
            
            // 保存原始内容
            const originalIcon = icon.innerHTML;
            const originalTitle = title.textContent;
            const originalText = text.textContent;
            
            // 清空卡片
            card.innerHTML = '';
            
            // 创建刷新容器
            const refreshContainer = document.createElement('div');
            refreshContainer.className = 'card-refresh-container';
            
            // 添加扫描线
            const scanLine = document.createElement('div');
            scanLine.className = 'refresh-scan-line';
            refreshContainer.appendChild(scanLine);
            
            // 添加网格
            const refreshGrid = document.createElement('div');
            refreshGrid.className = 'refresh-grid';
            refreshContainer.appendChild(refreshGrid);
            
            // 添加边框辉光
            const borderGlow = document.createElement('div');
            borderGlow.className = 'card-border-glow';
            refreshContainer.appendChild(borderGlow);
            
            // 添加渐变覆盖
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'gradient-overlay';
            refreshContainer.appendChild(gradientOverlay);
            
            // 创建卡片内容容器
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            // 创建图片容器
            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';
            
            // 创建图标
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
            
            // 组装内容
            cardContent.appendChild(imageContainer);
            cardContent.appendChild(titleElement);
            cardContent.appendChild(textElement);
            
            // 添加到卡片
            card.appendChild(refreshContainer);
            card.appendChild(cardContent);
            
            // 保存原始内容引用
            card._originalContent = {
                icon: originalIcon,
                title: originalTitle,
                text: originalText
            };
            
        } catch (error) {
            console.error('卡片包装失败:', error);
        }
    }
    
    function setupCardEvents(card) {
        let clickTimeout = null;
        let lastClickTime = 0;
        
        // 点击事件
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            
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
                this.classList.remove('active');
            }, 1200);
        });
        
        // 悬停效果
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-8px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = '';
            }
        });
        
        // 触摸设备优化
        if ('ontouchstart' in window) {
            card.addEventListener('touchstart', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'scale(0.98)';
                }
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                if (!this.classList.contains('active')) {
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
        
        // 添加激活类
        card.classList.add('active');
        
        // 添加旋转类（如果未旋转）
        if (!card.classList.contains('rotated')) {
            card.classList.add('rotated');
        }
    }
    
    function resetCard(card) {
        if (!card) return;
        
        // 移除激活和旋转状态
        card.classList.remove('active');
        card.classList.remove('rotated');
        card.classList.add('rotating-back');
        
        // 移除悬停效果
        card.style.transform = '';
        
        // 移除旋转恢复类
        setTimeout(() => {
            card.classList.remove('rotating-back');
        }, 400);
        
        // 如果这是当前激活的卡片，清空引用
        if (activeCard === card) {
            activeCard = null;
        }
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
        }
    };
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
    });
})();