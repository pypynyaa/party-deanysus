<?php
// Проверка авторизации (замените на свою логику)
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    die('Доступ запрещен');
}

// Конфигурация базы данных
$host = 'localhost';
$dbname = 'ваше_имя_базы';
$user = 'ваш_пользователь';
$password = 'ваш_пароль';

try {
    // Подключение к PostgreSQL
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Получение данных из базы
    $stmt = $pdo->query("SELECT * FROM registrations ORDER BY registration_date");
    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Установка заголовков для скачивания CSV
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="registrations_' . date('Y-m-d') . '.csv"');

    // Добавляем BOM для корректной работы с кириллицей в Excel
    echo "\xEF\xBB\xBF";

    // Открываем поток для записи
    $output = fopen('php://output', 'w');

    // Записываем заголовки
    $headers = [
        'ID',
        'ФИО',
        'Телефон',
        'Телеграм',
        'Транспорт',
        'Наличие прав',
        'Активности',
        'Баня',
        'Прятки',
        'Статус отношений',
        'Оборудование',
        'Музыка',
        'Пожелания',
        'Оплата',
        'Чек об оплате',
        'Дата регистрации'
    ];
    fputcsv($output, $headers);

    // Записываем данные
    foreach ($registrations as $row) {
        $csvRow = [
            $row['id'],
            $row['full_name'],
            $row['phone'],
            $row['telegram'],
            $row['transport'],
            $row['has_license'] ? 'Да' : 'Нет',
            $row['activities'],
            $row['sauna'] ? 'Да' : 'Нет',
            $row['hide_and_seek'] ? 'Да' : 'Нет',
            $row['relationship_status'],
            $row['equipment'],
            $row['music_links'],
            $row['wishes'],
            $row['payment_done'] ? 'Да' : 'Нет',
            $row['payment_proof'],
            $row['registration_date']
        ];
        fputcsv($output, $csvRow);
    }

    fclose($output);

} catch(PDOException $e) {
    die('Ошибка при экспорте данных: ' . $e->getMessage());
}
?> 