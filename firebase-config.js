import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    enableIndexedDbPersistence,
    getDoc,
    orderBy,
    serverTimestamp,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-14teCRf0g25whWzxuVGvboO_8a8hCmM",
    authDomain: "party31-19af4.firebaseapp.com",
    projectId: "party31-19af4",
    storageBucket: "party31-19af4.firebasestorage.app",
    messagingSenderId: "692315230973",
    appId: "1:692315230973:web:10871adfa544f501706494",
    measurementId: "G-06K7VD5GD6"
};

let app;
let db;
let storage;

// Initialize Firebase
async function initializeFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        storage = getStorage(app);
        
        // Включаем поддержку IndexedDB persistence
        try {
            await enableIndexedDbPersistence(db);
            console.log('Persistence включен');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('Множественные вкладки открыты, persistence может быть включен только в одной вкладке');
            } else if (err.code === 'unimplemented') {
                console.warn('Текущий браузер не поддерживает persistence');
            }
        }
        
        // Проверяем подключение
        await testDatabaseConnection();
        console.log('Firebase успешно инициализирован');
        return true;
    } catch (error) {
        console.error('Ошибка при инициализации Firebase:', error);
        return false;
    }
}

// Функция для проверки подключения к базе данных
async function testDatabaseConnection() {
    try {
        const testCollection = collection(db, 'test');
        const testDoc = doc(testCollection, 'test-connection');
        
        // Проверяем существование документа
        const docSnap = await getDoc(testDoc);
        
        if (!docSnap.exists()) {
            // Создаем тестовый документ
            await setDoc(testDoc, {
                timestamp: new Date().toISOString(),
                status: 'ok'
            });
        }
        
        console.log('Соединение с Firestore успешно установлено');
        return true;
    } catch (error) {
        console.error('Ошибка при проверке соединения с Firestore:', error);
        return false;
    }
}

// Инициализируем Firebase при загрузке
await initializeFirebase();

// Функции для работы с базой данных
async function loadExistingRegistration() {
    const registrationId = localStorage.getItem('registrationId');
    if (!registrationId) return null;
    
    try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('userId', '==', registrationId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Ошибка при загрузке регистрации:', error);
        return null;
    }
}

async function findRegistrationByField(field, value) {
    if (!value) return null;
    
    try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where(field, '==', value));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error(`Ошибка при поиске по полю ${field}:`, error);
        return null;
    }
}

const findRegistrationByName = (name) => findRegistrationByField('fullName', name);
const findRegistrationByPhone = (phone) => findRegistrationByField('phone', phone);
const findRegistrationByTelegram = (telegram) => findRegistrationByField('telegram', telegram);

// Функция для удаления существующей регистрации
async function deleteExistingRegistration(fullName) {
    try {
        const existingRegistration = await findRegistrationByName(fullName);
        if (existingRegistration) {
            const registrationRef = doc(db, 'registrations', existingRegistration.id);
            await deleteDoc(registrationRef);
            console.log('Существующая регистрация удалена');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка при удалении существующей регистрации:', error);
        throw error;
    }
}

// Функция для экспорта данных в CSV
async function exportToCSV() {
    try {
        const registrationsRef = collection(db, "registrations");
        const q = query(registrationsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        // Add headers
        const headers = [
            'ФИО',
            'Телефон',
            'Telegram',
            'Транспорт',
            'Водительские права',
            'Активности',
            'Сауна',
            'Прятки',
            'Статус отношений',
            'Снаряжение',
            'Музыка',
            'Оплата',
            'Дата регистрации',
            'Пожелания'
        ];
        
        // Создаем маппинг полей для обеспечения соответствия заголовков и данных
        const fieldMapping = {
            'ФИО': 'fullName',
            'Телефон': 'phone',
            'Telegram': 'telegram',
            'Транспорт': 'transport',
            'Водительские права': 'hasLicense',
            'Активности': 'activities',
            'Сауна': 'sauna',
            'Прятки': 'hideAndSeek',
            'Статус отношений': 'relationship',
            'Снаряжение': 'equipment',
            'Музыка': 'musicLinks',
            'Оплата': 'paymentDone',
            'Дата регистрации': 'timestamp',
            'Пожелания': 'wishes'
        };

        csvContent += headers.join(',') + '\n';
        
        // Add data
        snapshot.forEach(doc => {
            const registration = doc.data();
            console.log('Полные данные регистрации:', registration);
            
            const row = [
                registration.fullName || '',
                registration.phone || '',
                registration.telegram || '',
                registration.transport === 'self' ? 'Еду сам' : 'На автобусе',
                registration.hasLicense ? 'Да' : 'Нет',
                (registration.activities || []).join('; '),
                registration.sauna ? 'Да' : 'Нет',
                registration.hideAndSeek ? 'Да' : 'Нет',
                registration.relationship || '',
                registration.equipment || '',
                (registration.musicLinks || []).join('; '),
                registration.paymentDone ? 'Да' : 'Нет',
                registration.timestamp ? new Date(registration.timestamp.seconds * 1000).toLocaleString() : '',
                registration.wishes || ''
            ];
            
            console.log('Подготовленная строка:', {
                wishes: {
                    original: registration.wishes,
                    prepared: row[row.length - 1]
                },
                row: row
            });
            
            // Экранируем значения и оборачиваем в кавычки
            const escapedRow = row.map(field => {
                const value = field === undefined || field === null ? '' : field;
                const escaped = String(value).replace(/"/g, '""').replace(/\n/g, ' ');
                return `"${escaped}"`;
            });
            
            csvContent += escapedRow.join(',') + '\n';
        });
        
        // Create download link
        const link = document.createElement("a");
        const encodedContent = encodeURIComponent(csvContent);
        link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedContent);
        link.setAttribute("download", `registrations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error("Ошибка при экспорте в CSV:", error);
        throw error;
    }
}

export {
    db,
    storage,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    testDatabaseConnection,
    loadExistingRegistration,
    findRegistrationByName,
    findRegistrationByPhone,
    findRegistrationByTelegram,
    deleteExistingRegistration,
    exportToCSV,
    addDoc,
    getDoc
}; 