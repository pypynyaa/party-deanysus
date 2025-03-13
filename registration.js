import { 
    db, 
    storage,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    testDatabaseConnection,
    loadExistingRegistration,
    findRegistrationByName,
    findRegistrationByPhone,
    findRegistrationByTelegram,
    deleteExistingRegistration
} from './firebase-config.js';

import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Получение элементов формы
const form = document.getElementById('registrationForm');
const paymentCheckbox = document.getElementById('paymentDone');
const paymentProofDiv = document.querySelector('.payment-proof');
const paymentProofInput = document.getElementById('paymentProof');
const fileNameSpan = document.querySelector('.file-name');
const deleteFileBtn = document.querySelector('.delete-file');
const imagePreview = document.querySelector('.image-preview');
const previewImage = document.getElementById('previewImage');
const fileUploadLabel = document.querySelector('.file-upload-label');
const transportOptions = document.querySelectorAll('input[name="transport"]');
const licenseGroup = document.querySelector('.license-group');
const musicLinks = document.getElementById('musicLinks');

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM загружен, начинаем инициализацию...');
    
    try {
        // Проверяем подключение к базе данных
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
            throw new Error('Не удалось подключиться к базе данных');
        }
        console.log('Подключение к базе данных успешно установлено');
        
        // Загружаем существующую регистрацию
        const existingRegistration = await loadExistingRegistration();
        if (existingRegistration) {
            console.log('Найдена существующая регистрация');
        }

        // Добавляем первое поле для музыкальной ссылки
        const musicLinksContainer = document.getElementById('musicLinks');
        if (musicLinksContainer && !musicLinksContainer.children.length) {
            window.addMusicLink();
        }
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        alert('Ошибка подключения к базе данных. Пожалуйста, обратитесь к администратору.');
    }
});

// Обработка показа/скрытия поля для загрузки скриншота
if (paymentCheckbox && paymentProofDiv) {
    paymentProofDiv.classList.toggle('hidden', !paymentCheckbox.checked);
    
    paymentCheckbox.addEventListener('change', () => {
        paymentProofDiv.classList.toggle('hidden', !paymentCheckbox.checked);
        if (!paymentCheckbox.checked) {
            removeFile();
        }
    });
}

// Обработка выбора транспорта
if (transportOptions && licenseGroup) {
    transportOptions.forEach(option => {
        option.addEventListener('change', () => {
            licenseGroup.classList.toggle('hidden', option.value !== 'self');
        });
    });
}

// Обработка загрузки файла
if (paymentProofInput) {
    paymentProofInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Проверяем тип файла
            const allowedTypes = [
                'image/jpeg', 
                'image/png', 
                'image/jpg', 
                'application/pdf'
            ];
            if (!allowedTypes.includes(file.type)) {
                alert('Пожалуйста, выберите изображение (JPG, JPEG, PNG) или документ (PDF)');
                removeFile();
                return;
            }
            
            // Проверяем размер файла (не более 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Размер файла не должен превышать 10MB');
                removeFile();
                return;
            }

            // Получаем только имя файла без пути
            const fileName = file.name.split('\\').pop().split('/').pop();
            console.log('Загружаемый файл:', fileName, 'Тип:', file.type, 'Размер:', file.size);

            // Показываем имя файла и кнопку удаления
            fileNameSpan.textContent = fileName;
            deleteFileBtn.classList.remove('hidden');
            fileUploadLabel.classList.add('file-selected');

            // Добавляем класс для мобильных устройств
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                fileUploadLabel.classList.add('mobile');
            }

            // Показываем уведомление
            showNotification('Файл успешно выбран');
        } else {
            resetFileInput();
        }
    });
}

function removeFile() {
    if (paymentProofInput) {
        paymentProofInput.value = '';
        resetFileInput();
    }
}

function resetFileInput() {
    if (fileNameSpan) fileNameSpan.textContent = 'Прикрепить файл оплаты';
    if (deleteFileBtn) deleteFileBtn.classList.add('hidden');
    if (fileUploadLabel) {
        fileUploadLabel.classList.remove('file-selected');
        fileUploadLabel.classList.remove('mobile');
    }
}

// Функция для показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'upload-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('visible');
    });

    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Обработка клика по кнопке удаления файла
if (deleteFileBtn) {
    deleteFileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        removeFile();
    });
}

// Глобальные функции для работы с музыкальными ссылками
window.addMusicLink = function() {
    const container = document.getElementById('musicLinks');
    if (!container) return;

    // Создаем новый контейнер для поля ввода
    const inputContainer = document.createElement('div');
    inputContainer.className = 'music-input-container';

    // Создаем поле ввода
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'music-input';
    input.placeholder = 'Вставьте ссылку на трек';
    input.required = true;

    // Создаем кнопку удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-track-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function() {
        inputContainer.remove();
    };

    // Добавляем элементы в контейнер
    inputContainer.appendChild(input);
    inputContainer.appendChild(deleteBtn);

    // Добавляем новый контейнер в основной блок
    container.appendChild(inputContainer);
};

window.deleteMusicLink = function(button) {
    const container = button.closest('.music-input-container');
    if (container) {
        container.remove();
    }
};

// Обновляем обработчик отправки формы для работы с Firebase
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (paymentCheckbox && paymentCheckbox.checked && (!paymentProofInput || !paymentProofInput.files[0])) {
            alert('Пожалуйста, прикрепите скриншот оплаты');
            return;
        }

        const submitButton = form.querySelector('.submit-btn');
        if (submitButton) submitButton.disabled = true;

        try {
            const formData = new FormData(form);
            const fullName = formData.get('fullName')?.trim() || '';
            const phone = formData.get('phone')?.trim() || '';
            const telegram = formData.get('telegram')?.trim() || '';

            console.log('Данные формы перед отправкой:', {
                fullName,
                phone,
                telegram
            });

            if (!fullName || !phone || !telegram) {
                throw new Error('Пожалуйста, заполните все обязательные поля');
            }

            const userId = generateUserId();

            // Проверяем и удаляем существующую регистрацию
            try {
                await deleteExistingRegistration(fullName);
            } catch (error) {
                console.error('Ошибка при удалении существующей регистрации:', error);
                alert('Произошла ошибка при обновлении регистрации. Пожалуйста, попробуйте еще раз.');
                if (submitButton) submitButton.disabled = false;
                return;
            }

            // Создаем объект с данными
            const data = {
                userId,
                timestamp: serverTimestamp(),
                fullName: fullName,
                phone: phone,
                telegram: telegram,
                paymentDone: formData.get('paymentDone') === 'on',
                hasLicense: formData.get('hasLicense') === 'on',
                transport: formData.get('transport'),
                activities: Array.from(formData.getAll('activities')),
                sauna: formData.get('sauna') === 'on',
                hideAndSeek: formData.get('hideAndSeek') === 'on',
                relationship: formData.get('relationship'),
                equipment: formData.get('equipment'),
                musicLinks: Array.from(document.querySelectorAll('.music-input')).map(input => input.value.trim()).filter(Boolean),
                lastUpdated: new Date().toISOString()
            };

            console.log('Отправляемые данные:', data);

            // Конвертируем фото в base64, если оно есть
            if (paymentProofInput && paymentProofInput.files[0]) {
                const paymentProof = paymentProofInput.files[0];
                try {
                    if (paymentProof.size > 10 * 1024 * 1024) {
                        throw new Error('Размер файла не должен превышать 10MB');
                    }
                    data.paymentProofBase64 = await getBase64(paymentProof);
                    data.paymentProofFilename = paymentProof.name;
                    data.paymentProofType = paymentProof.type;
                    console.log('Файл оплаты:', {
                        name: paymentProof.name,
                        type: paymentProof.type,
                        size: paymentProof.size
                    });
                } catch (error) {
                    console.error('Ошибка обработки файла:', error);
                    alert('Произошла ошибка при обработке файла. Убедитесь, что размер файла не превышает 10MB.');
                    if (submitButton) submitButton.disabled = false;
                    return;
                }
            }

            // Сохраняем данные в Firestore
            const registrationRef = doc(collection(db, 'registrations'), userId);
            await setDoc(registrationRef, data);

            // Сохраняем ID регистрации
            localStorage.setItem('registrationId', userId);
            
            alert('Регистрация успешно завершена! Мы свяжемся с вами в ближайшее время.');
            form.reset();
            resetFileInput();
            
            // Очищаем музыкальные ссылки
            const musicLinksContainer = document.getElementById('musicLinks');
            if (musicLinksContainer) {
                musicLinksContainer.innerHTML = '';
                window.addMusicLink(); // Добавляем первое поле
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Вспомогательная функция для генерации ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функция для конвертации файла в base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Копирование номера карты
async function copyCardNumber() {
    const cardNumber = document.querySelector('.card-number').textContent;
    const button = document.querySelector('.copy-button');
    
    try {
        await navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
        button.textContent = 'Скопировано!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Скопировать';
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Ошибка при копировании:', err);
        button.textContent = 'Ошибка';
        
        setTimeout(() => {
            button.textContent = 'Скопировать';
        }, 2000);
    }
}

// Обработчики модального окна оплаты
document.addEventListener('DOMContentLoaded', () => {
    const paymentToggle = document.querySelector('.payment-toggle');
    const closeModal = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const copyButton = document.querySelector('.copy-button');
    const paymentModal = document.querySelector('.payment-modal');
    
    function showPaymentModal() {
        modalOverlay.classList.add('show');
        paymentModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hidePaymentModal() {
        modalOverlay.classList.remove('show');
        paymentModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    if (paymentToggle) {
        paymentToggle.addEventListener('click', showPaymentModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', hidePaymentModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hidePaymentModal();
            }
        });
    }
    
    if (copyButton) {
        copyButton.addEventListener('click', copyCardNumber);
    }

    // Обработчик клавиши Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePaymentModal();
        }
    });
}); 