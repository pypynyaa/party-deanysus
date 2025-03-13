<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Подключение к PostgreSQL
    $dsn = "pgsql:host=" . DB_HOST . ";dbname=" . DB_NAME;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Получение данных из формы
    $fullName = $_POST['fullName'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $telegram = $_POST['telegram'] ?? '';
    $transport = $_POST['transport'] ?? '';
    $hasLicense = isset($_POST['hasLicense']) ? true : false;
    $activities = isset($_POST['activities']) ? implode(',', $_POST['activities']) : '';
    $sauna = isset($_POST['sauna']) ? true : false;
    $hideAndSeek = isset($_POST['hideAndSeek']) ? true : false;
    $relationship = $_POST['relationship'] ?? '';
    $equipment = $_POST['equipment'] ?? '';
    $musicLinks = isset($_POST['musicLinks']) ? $_POST['musicLinks'] : '';
    $wishes = $_POST['wishes'] ?? '';
    $paymentDone = isset($_POST['paymentDone']) ? true : false;

    // Проверяем существующую регистрацию
    $stmt = $pdo->prepare("SELECT id FROM registrations WHERE full_name = ? OR phone = ? OR telegram = ?");
    $stmt->execute([$fullName, $phone, $telegram]);
    $existingRegistration = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRegistration) {
        // Удаляем старую регистрацию
        $stmt = $pdo->prepare("DELETE FROM registrations WHERE id = ?");
        $stmt->execute([$existingRegistration['id']]);
    }

    // Добавляем новую регистрацию
    $sql = "INSERT INTO registrations (
        full_name, phone, telegram, transport, has_license,
        activities, sauna, hide_and_seek, relationship_status,
        equipment, music_links, wishes, payment_done,
        registration_date
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        CURRENT_TIMESTAMP
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $fullName, $phone, $telegram, $transport, $hasLicense,
        $activities, $sauna, $hideAndSeek, $relationship,
        $equipment, $musicLinks, $wishes, $paymentDone
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Регистрация успешно завершена'
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при регистрации: ' . $e->getMessage()
    ]);
}
?> 