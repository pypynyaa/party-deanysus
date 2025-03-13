<?php
// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'party31');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// Настройки загрузки файлов
define('UPLOAD_DIR', 'uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB

// Разрешенные типы файлов
define('ALLOWED_FILE_TYPES', [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
]);
?> 