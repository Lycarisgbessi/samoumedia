CREATE DATABASE IF NOT EXISTS samou_media CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE samou_media;

-- Admin Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global Site Settings (Titles, Slogans)
CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Advertising Spaces
CREATE TABLE ad_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL, -- 'horizontal', 'vertical', 'square', 'in-article', 'popup'
    location VARCHAR(100) NOT NULL, -- e.g., 'home_top', 'sidebar', 'article_middle'
    is_active BOOLEAN DEFAULT TRUE,
    content_type VARCHAR(20) DEFAULT 'image', -- 'image' or 'script'
    image_url TEXT,
    target_url TEXT,
    script_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories/Rubriques
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Articles
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT,
    category_id INT,
    image_url TEXT,
    author VARCHAR(100),
    views INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES 
('site_title', 'SAMOU MÉDIA'),
('site_slogan', 'Informer. Éclairer. Rassembler.'),
('contact_email', 'contact@samoumedia.com');

-- Insert Default Admin (password: admin123)
INSERT INTO users (username, password_hash) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
