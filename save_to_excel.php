<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Google\Cloud\Firestore\FirestoreClient;

// Настройка логирования
ini_set('log_errors', 1);
ini_set('error_log', 'excel_export_errors.log');

try {
    // Инициализация Firestore
    $firestore = new FirestoreClient([
        'projectId' => 'party-registration-web',
        'keyFilePath' => 'path/to/your/service-account-key.json' // Замените на реальный путь
    ]);

    // Создание нового документа Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Установка заголовков
    $headers = [
        'ФИО', 'Телефон', 'Telegram', 'Статус оплаты', 'Транспорт',
        'Активности', 'Статус отношений', 'Музыка', 'Дата регистрации'
    ];
    
    foreach ($headers as $idx => $header) {
        $sheet->setCellValueByColumnAndRow($idx + 1, 1, $header);
    }

    // Получение данных из Firestore
    $registrations = $firestore->collection('registrations')->documents();
    $row = 2;

    foreach ($registrations as $registration) {
        $data = $registration->data();
        
        // Заполнение данных
        $sheet->setCellValueByColumnAndRow(1, $row, $data['fullName'] ?? '');
        $sheet->setCellValueByColumnAndRow(2, $row, $data['phone'] ?? '');
        $sheet->setCellValueByColumnAndRow(3, $row, $data['telegram'] ?? '');
        $sheet->setCellValueByColumnAndRow(4, $row, $data['paymentConfirmed'] ? 'Оплачено' : 'Не оплачено');
        $sheet->setCellValueByColumnAndRow(5, $row, $data['transport'] ?? '');
        
        // Форматирование активностей
        $activities = $data['activities'] ?? [];
        $activitiesStr = implode(", ", $activities);
        $sheet->setCellValueByColumnAndRow(6, $row, $activitiesStr);
        
        $sheet->setCellValueByColumnAndRow(7, $row, $data['relationshipStatus'] ?? '');
        
        // Форматирование музыкальных ссылок
        $musicLinks = $data['musicLinks'] ?? [];
        $musicLinksStr = implode("\n", $musicLinks);
        $sheet->setCellValueByColumnAndRow(8, $row, $musicLinksStr);
        
        // Форматирование даты
        $registrationDate = $data['registrationDate']->get()->format('Y-m-d H:i:s');
        $sheet->setCellValueByColumnAndRow(9, $row, $registrationDate);
        
        $row++;
    }

    // Автоматическая настройка ширины столбцов
    foreach (range('A', $sheet->getHighestColumn()) as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    // Установка заголовков для скачивания
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="registrations.xlsx"');
    header('Cache-Control: max-age=0');

    // Сохранение файла
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    
} catch (Exception $e) {
    error_log("Ошибка при экспорте в Excel: " . $e->getMessage());
    http_response_code(500);
    echo "Произошла ошибка при экспорте данных. Пожалуйста, проверьте лог ошибок.";
}
?>

