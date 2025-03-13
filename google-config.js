// Google API Configuration
export const GOOGLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY', // Замените на ваш API ключ
    CLIENT_ID: 'YOUR_CLIENT_ID', // Замените на ваш Client ID
    SCOPE: 'https://www.googleapis.com/auth/spreadsheets'
};

// Инициализация Google API
export async function initGoogleAPI() {
    try {
        await new Promise((resolve, reject) => {
            gapi.load('client:auth2', resolve);
        });
        
        await gapi.client.init({
            apiKey: GOOGLE_CONFIG.API_KEY,
            clientId: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPE
        });
        
        await gapi.client.load('sheets', 'v4');
        console.log('Google Sheets API initialized');
        return true;
    } catch (error) {
        console.error('Error initializing Google Sheets API:', error);
        return false;
    }
}

// Экспорт в Google Таблицы
export async function exportToGoogleSheets(data) {
    try {
        // Проверяем авторизацию
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
            await gapi.auth2.getAuthInstance().signIn();
        }
        
        // Создаем новую таблицу
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: {
                title: `Регистрации_${new Date().toLocaleDateString()}`
            }
        });
        
        const spreadsheetId = response.result.spreadsheetId;
        
        // Подготавливаем данные
        const headers = Object.keys(data[0]);
        const values = [
            headers,
            ...data.map(row => headers.map(header => row[header] || ''))
        ];
        
        // Записываем данные
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: 'A1',
            valueInputOption: 'RAW',
            resource: { values }
        });
        
        // Форматируем таблицу
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: {
                                        red: 0.8,
                                        green: 0.8,
                                        blue: 0.8
                                    },
                                    textFormat: {
                                        bold: true
                                    }
                                }
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    },
                    {
                        autoResizeDimensions: {
                            dimensions: {
                                sheetId: 0,
                                dimension: 'COLUMNS',
                                startIndex: 0,
                                endIndex: headers.length
                            }
                        }
                    }
                ]
            }
        });
        
        // Открываем таблицу в новой вкладке
        window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        return true;
    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        throw error;
    }
} 