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

-- 插入管理员账户
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES 
('system_admin', '3820332398@qq.com', MD5('Hjy413113'), '系统管理员', 'admin');

-- 插入演示用户
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES 
('tech_guru', 'zhangsan@example.com', MD5('Demo@123456'), '张三', 'user'),
('code_master', 'lisi@example.com', MD5('Demo@123456'), '李四', 'moderator'),
('design_wizard', 'wangwu@example.com', MD5('Demo@123456'), '王五', 'user'),
('new_user_001', 'zhaoliu@example.com', MD5('Demo@123456'), '赵六', 'user');

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

-- 创建索引
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_status_role ON users(status, role);
CREATE INDEX idx_login_history_time ON login_history(login_time);

-- 存储过程：验证用户登录
DELIMITER $$
CREATE PROCEDURE VerifyUserLogin(IN p_username VARCHAR(50), IN p_password VARCHAR(255), OUT p_user_id INT)
BEGIN
    DECLARE hashed_password VARCHAR(255);
    DECLARE stored_hash VARCHAR(255);
    
    SELECT id, password_hash INTO p_user_id, stored_hash 
    FROM users 
    WHERE username = p_username AND status = 'active';
    
    IF p_user_id IS NOT NULL THEN
        SET hashed_password = MD5(p_password);
        
        IF stored_hash = hashed_password THEN
            INSERT INTO login_history (user_id, success) VALUES (p_user_id, TRUE);
            UPDATE users SET last_login = NOW() WHERE id = p_user_id;
        ELSE
            INSERT INTO login_history (user_id, success) VALUES (p_user_id, FALSE);
            SET p_user_id = NULL;
        END IF;
    END IF;
END$$
DELIMITER ;

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

-- 存储过程：修改用户密码
DELIMITER $$
CREATE PROCEDURE ChangePassword(IN user_id INT, IN new_password VARCHAR(255))
BEGIN
    UPDATE users 
    SET password_hash = MD5(new_password), 
        updated_at = NOW() 
    WHERE id = user_id;
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

-- 函数：验证用户凭据
DELIMITER $$
CREATE FUNCTION ValidateUserCredentials(p_username VARCHAR(50), p_password VARCHAR(255))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE valid BOOLEAN DEFAULT FALSE;
    
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE username = p_username 
        AND password_hash = MD5(p_password)
        AND status = 'active'
    ) THEN
        SET valid = TRUE;
    END IF;
    
    RETURN valid;
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

-- 事件：清理过期密码重置令牌
DELIMITER $$
CREATE EVENT CleanExpiredTokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM password_resets WHERE expires_at < NOW();
END$$
DELIMITER ;

-- 事件：清理旧登录历史记录
DELIMITER $$
CREATE EVENT CleanOldLoginHistory
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM login_history WHERE login_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$
DELIMITER ;

-- 存储过程：测试登录
DELIMITER $$
CREATE PROCEDURE TestLogin()
BEGIN
    DECLARE test_user_id INT;
    
    CALL VerifyUserLogin('system_admin', 'Hjy413113', @test_user_id);
    
    IF @test_user_id IS NOT NULL THEN
        SELECT '管理员登录测试: 成功' as result, @test_user_id as user_id;
    ELSE
        SELECT '管理员登录测试: 失败 - 检查用户名或密码' as result;
    END IF;
    
    CALL VerifyUserLogin('tech_guru', 'Demo@123456', @test_user_id);
    
    IF @test_user_id IS NOT NULL THEN
        SELECT '演示用户登录测试: 成功' as result, @test_user_id as user_id;
    ELSE
        SELECT '演示用户登录测试: 失败' as result;
    END IF;
    
    CALL VerifyUserLogin('system_admin', 'WrongPassword', @test_user_id);
    
    IF @test_user_id IS NULL THEN
        SELECT '错误密码测试: 成功 (正确拒绝了错误密码)' as result;
    END IF;
    
END$$
DELIMITER ;

-- 显示所有用户及其密码（用于调试）
SELECT 
    '===== 用户登录信息 (仅用于测试) =====' as info
UNION ALL
SELECT 
    CONCAT(
        '用户名: ', username, 
        ' | 密码: ', 
        CASE username 
            WHEN 'system_admin' THEN 'Hjy413113' 
            ELSE 'Demo@123456' 
        END,
        ' | 邮箱: ', email,
        ' | 角色: ', role
    ) as user_info
FROM users
UNION ALL
SELECT 
    '===== 测试登录 =====' as info
UNION ALL
SELECT 
    '1. 管理员登录: CALL VerifyUserLogin(''system_admin'', ''Hjy413113'', @user_id);' as test_command
UNION ALL
SELECT 
    '2. 演示用户登录: CALL VerifyUserLogin(''tech_guru'', ''Demo@123456'', @user_id);' as test_command
UNION ALL
SELECT 
    '3. 运行所有测试: CALL TestLogin();' as test_command;