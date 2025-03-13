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

    // Проверка и загрузка файла
    $paymentProofPath = null;
    if (isset($_FILES['paymentProof']) && $_FILES['paymentProof']['error'] === UPLOAD_ERR_OK) {
        // Проверка размера файла
        if ($_FILES['paymentProof']['size'] > MAX_FILE_SIZE) {
            throw new Exception('Размер файла превышает допустимый');
        }

        // Проверка типа файла
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!in_array($_FILES['paymentProof']['type'], $allowedTypes)) {
            throw new Exception('Недопустимый тип файла');
        }

        // Создание директории, если не существует
        $uploadDir = __DIR__ . '/' . UPLOAD_DIR;
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Генерация уникального имени файла
        $fileExtension = pathinfo($_FILES['paymentProof']['name'], PATHINFO_EXTENSION);
        $uniqueFilename = uniqid('payment_') . '.' . $fileExtension;
        $paymentProofPath = UPLOAD_DIR . $uniqueFilename;
        $fullPath = $uploadDir . $uniqueFilename;

        // Сохранение файла
        if (!move_uploaded_file($_FILES['paymentProof']['tmp_name'], $fullPath)) {
            throw new Exception('Ошибка при загрузке файла');
        }
    }

    // Проверяем существующую регистрацию
    $stmt = $pdo->prepare("SELECT id, payment_proof FROM registrations WHERE full_name = ? OR phone = ? OR telegram = ?");
    $stmt->execute([$fullName, $phone, $telegram]);
    $existingRegistration = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRegistration) {
        // Удаляем старый файл, если он существует
        if ($existingRegistration['payment_proof']) {
            $oldFile = __DIR__ . '/' . $existingRegistration['payment_proof'];
            if (file_exists($oldFile)) {
                unlink($oldFile);
            }
        }
        // Удаляем старую регистрацию
        $stmt = $pdo->prepare("DELETE FROM registrations WHERE id = ?");
        $stmt->execute([$existingRegistration['id']]);
    }

    // Добавляем новую регистрацию
    $sql = "INSERT INTO registrations (
        full_name, phone, telegram, transport, has_license,
        activities, sauna, hide_and_seek, relationship_status,
        equipment, music_links, wishes, payment_done, payment_proof,
        registration_date
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        CURRENT_TIMESTAMP
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $fullName, $phone, $telegram, $transport, $hasLicense,
        $activities, $sauna, $hideAndSeek, $relationship,
        $equipment, $musicLinks, $wishes, $paymentDone, $paymentProofPath
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Регистрация успешно завершена',
        'filename' => $paymentProofPath ? basename($paymentProofPath) : null
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при регистрации: ' . $e->getMessage()
    ]);
}
?> 