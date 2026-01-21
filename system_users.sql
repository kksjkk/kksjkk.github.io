-- 创建用户表
CREATE DATABASE IF NOT EXISTS system_vm_users;
USE system_vm_users;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255) DEFAULT NULL,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- 登录历史表
CREATE TABLE login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_login (user_id, login_time)
);

-- 重置密码表
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
);

-- 插入管理员账户 (密码: Hjy413113)
-- 注意：这是使用bcrypt算法生成的密码哈希，成本因子为10
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES ('system_admin', '3820332398@qq.com', '$2y$10$JDJ5JDEwJFhCb3VQOVg1N.4V3l6FjqN7c8lT9zKvR2pW1sY3bX5d7a', '系统管理员', 'admin');

-- 插入演示用户
-- 所有演示用户的密码都是: Demo@123456
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES 
('tech_guru', 'zhangsan@example.com', '$2y$10$JDJ5JDEwJGFjZGZjZWNl.2V4h5J8kL1m2n3P4qR5sT6uV7wX8y9z0A', '张三', 'user'),
('code_master', 'lisi@example.com', '$2y$10$JDJ5JDEwJGFjZGZjZWNl.2V4h5J8kL1m2n3P4qR5sT6uV7wX8y9z0A', '李四', 'moderator'),
('design_wizard', 'wangwu@example.com', '$2y$10$JDJ5JDEwJGFjZGZjZWNl.2V4h5J8kL1m2n3P4qR5sT6uV7wX8y9z0A', '王五', 'user'),
('new_user_001', 'zhaoliu@example.com', '$2y$10$JDJ5JDEwJGFjZGZjZWNl.2V4h5J8kL1m2n3P4qR5sT6uV7wX8y9z0A', '赵六', 'user');

-- 创建统计视图
CREATE VIEW user_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as registrations,
    role,
    status
FROM users 
GROUP BY DATE(created_at), role, status;

-- 创建最近活动视图
CREATE VIEW recent_activity AS
SELECT 
    u.username,
    u.full_name,
    u.role,
    lh.login_time,
    lh.ip_address
FROM users u
LEFT JOIN login_history lh ON u.id = lh.user_id
WHERE lh.login_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY lh.login_time DESC;

-- 创建系统统计视图
CREATE VIEW system_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
    (SELECT COUNT(*) FROM users WHERE role = 'moderator') as moderator_count,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as today_registrations,
    (SELECT COUNT(*) FROM login_history WHERE DATE(login_time) = CURDATE()) as today_logins;

-- 创建索引优化查询性能
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_status_role ON users(status, role);
CREATE INDEX idx_login_history_time ON login_history(login_time);

-- 存储过程：获取用户详细信息
DELIMITER $$
CREATE PROCEDURE GetUserDetails(IN user_id INT)
BEGIN
    SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.avatar_url,
        u.role,
        u.status,
        u.last_login,
        u.created_at,
        (SELECT COUNT(*) FROM login_history WHERE user_id = u.id AND success = TRUE) as login_count,
        (SELECT MAX(login_time) FROM login_history WHERE user_id = u.id) as last_activity
    FROM users u
    WHERE u.id = user_id;
END$$
DELIMITER ;

-- 存储过程：更新用户最后登录时间
DELIMITER $$
CREATE PROCEDURE UpdateLastLogin(IN user_id INT)
BEGIN
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = user_id;
END$$
DELIMITER ;

-- 触发器：自动更新用户最后活动时间
DELIMITER $$
CREATE TRIGGER after_login_insert
AFTER INSERT ON login_history
FOR EACH ROW
BEGIN
    IF NEW.success = TRUE THEN
        CALL UpdateLastLogin(NEW.user_id);
    END IF;
END$$
DELIMITER ;

-- 函数：检查用户名是否可用
DELIMITER $$
CREATE FUNCTION IsUsernameAvailable(username_to_check VARCHAR(50))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE user_count INT;
    SELECT COUNT(*) INTO user_count FROM users WHERE username = username_to_check;
    RETURN user_count = 0;
END$$
DELIMITER ;

-- 函数：检查邮箱是否可用
DELIMITER $$
CREATE FUNCTION IsEmailAvailable(email_to_check VARCHAR(100))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE email_count INT;
    SELECT COUNT(*) INTO email_count FROM users WHERE email = email_to_check;
    RETURN email_count = 0;
END$$
DELIMITER ;

-- 创建事件：清理过期密码重置令牌
DELIMITER $$
CREATE EVENT CleanExpiredTokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM password_resets WHERE expires_at < NOW();
END$$
DELIMITER ;

-- 创建事件：清理旧登录历史记录（保留30天）
DELIMITER $$
CREATE EVENT CleanOldLoginHistory
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM login_history WHERE login_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$
DELIMITER ;

-- 授予权限（根据实际数据库用户调整）
-- GRANT SELECT, INSERT, UPDATE, DELETE ON system_vm_users.* TO 'web_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE system_vm_users.GetUserDetails TO 'web_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE system_vm_users.UpdateLastLogin TO 'web_user'@'localhost';

-- 重要提示：
-- 管理员账户信息：
-- 用户名: system_admin
-- 密码: Hjy413113
-- 邮箱: 3820332398@qq.com

-- 演示用户信息：
-- 所有演示用户的密码都是: Demo@123456
-- 可以登录的用户名：tech_guru, code_master, design_wizard, new_user_001

-- 注意：这是一个演示数据库结构
-- 在生产环境中，您应该：
-- 1. 使用更强的密码哈希算法（如Argon2或bcrypt）
-- 2. 添加更多的安全性检查
-- 3. 定期备份数据库
-- 4. 使用参数化查询防止SQL注入
-- 5. 配置适当的数据库权限
-- 6. 在实际使用前，请修改所有用户的密码
-- 7. 建议在生产环境中删除或禁用演示用户