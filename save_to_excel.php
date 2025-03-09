<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Подключение к базе данных (MySQL) - ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ!
$host = 'localhost';
$dbname = 'your_database_name';
$user = 'your_username';
$password = 'your_password';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Ошибка подключения к базе данных: " . $e->getMessage();
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = $_POST['fullName'];
    $phoneNumber = $_POST['phoneNumber'];
    $telegramLink = $_POST['telegramLink'];
    $moneySent = ($_POST['moneySent'] === 'Да') ? 1 : 0;
    $hasLicense = ($_POST['hasLicense'] === 'Да') ? 1 : 0;
    $foodPreferences = $_POST['foodPreferences'];
    $musicPreferences = $_POST['musicPreferences'];
    $sports = implode(', ', $_POST['sport']);
    $sauna = ($_POST['sauna'] === 'Да') ? 1 : 0;

    try {
        $stmt = $conn->prepare("INSERT INTO users (fullName, phoneNumber, telegramLink, moneySent, hasLicense, foodPreferences, musicPreferences, sports, sauna) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$fullName, $phoneNumber, $telegramLink, $moneySent, $hasLicense, $foodPreferences, $musicPreferences, $sports, $sauna]);
        echo "Данные успешно сохранены в базу данных.";
    } catch(PDOException $e) {
        echo "Ошибка сохранения данных в базу данных: " . $e->getMessage();
    }
} else {
    http_response_code(405);
    echo "Метод не поддерживается";
}

$conn = null; // Закрываем соединение
?>