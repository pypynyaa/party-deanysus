<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Google\Cloud\Firestore\FirestoreClient;

// Инициализация Firestore
$firestore = new FirestoreClient([
    'projectId' => 'party-registration-web',
    'keyFilePath' => 'path/to/your/service-account-key.json'
]);

// Создаем новый Excel документ
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Заголовки столбцов
$headers = [
    'ФИО', 'Телефон', 'Telegram', 'Оплата', 'Транспорт', 'Права', 
    'Активности', 'Баня', 'Прятки', 'Статус', 'Музыка',
    'Оборудование', 'Предпочтения по еде', 'Дата регистрации'
];

// Записываем заголовки
foreach ($headers as $columnIndex => $header) {
    $sheet->setCellValueByColumnAndRow($columnIndex + 1, 1, $header);
}

// Получаем данные из Firestore
$registrations = $firestore->collection('registrations')->documents();
$row = 2;

foreach ($registrations as $registration) {
    $data = $registration->data();
    
    // Форматируем данные
    $activities = isset($data['activities']) ? implode(', ', $data['activities']) : '';
    $musicLinks = isset($data['musicLinks']) ? implode(', ', $data['musicLinks']) : '';
    $timestamp = isset($data['timestamp']) ? $data['timestamp']->get()->format('Y-m-d H:i:s') : '';
    
    // Записываем данные в строку
    $sheet->setCellValueByColumnAndRow(1, $row, $data['fullName'] ?? '');
    $sheet->setCellValueByColumnAndRow(2, $row, $data['phone'] ?? '');
    $sheet->setCellValueByColumnAndRow(3, $row, $data['telegram'] ?? '');
    $sheet->setCellValueByColumnAndRow(4, $row, $data['paymentDone'] ? 'Да' : 'Нет');
    $sheet->setCellValueByColumnAndRow(5, $row, $data['transport'] ?? '');
    $sheet->setCellValueByColumnAndRow(6, $row, $data['hasLicense'] ? 'Да' : 'Нет');
    $sheet->setCellValueByColumnAndRow(7, $row, $activities);
    $sheet->setCellValueByColumnAndRow(8, $row, $data['sauna'] ? 'Да' : 'Нет');
    $sheet->setCellValueByColumnAndRow(9, $row, $data['hideAndSeek'] ? 'Да' : 'Нет');
    $sheet->setCellValueByColumnAndRow(10, $row, $data['relationship'] ?? '');
    $sheet->setCellValueByColumnAndRow(11, $row, $musicLinks);
    $sheet->setCellValueByColumnAndRow(12, $row, $data['camera'] ?? '');
    $sheet->setCellValueByColumnAndRow(13, $row, $data['foodPreferences'] ?? '');
    $sheet->setCellValueByColumnAndRow(14, $row, $timestamp);
    
    $row++;
}

// Автоматическая ширина столбцов
foreach (range('A', 'N') as $column) {
    $sheet->getColumnDimension($column)->setAutoSize(true);
}

// Создаем writer для записи файла
$writer = new Xlsx($spreadsheet);

// Устанавливаем заголовки для скачивания
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="registrations.xlsx"');
header('Cache-Control: max-age=0');

// Сохраняем файл
$writer->save('php://output');
?>

