import { 
    db, 
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
    addDoc,
    getDoc
} from './firebase-config.js';

// Получение элементов формы
const form = document.getElementById('registrationForm');
const paymentCheckbox = document.getElementById('paymentDone');
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
if (paymentCheckbox) {
    paymentCheckbox.addEventListener('change', () => {
        const paymentProofDiv = document.querySelector('.payment-proof');
        if (paymentProofDiv) {
            paymentProofDiv.classList.toggle('hidden', !paymentCheckbox.checked);
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

        if (paymentCheckbox && paymentCheckbox.checked) {
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
            const wishes = formData.get('wishes')?.trim() || '';

            console.log('Данные формы перед отправкой:', {
                fullName,
                phone,
                telegram,
                wishes,
                wishesType: typeof wishes,
                wishesLength: wishes.length
            });

            if (!fullName || !phone || !telegram) {
                throw new Error('Пожалуйста, заполните все обязательные поля');
            }

            // Отправляем данные на сервер
            const response = await fetch('process_form.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Регистрация успешно завершена!');
                form.reset();
                // Очищаем музыкальные ссылки
                const musicLinksContainer = document.getElementById('musicLinks');
                if (musicLinksContainer) {
                    musicLinksContainer.innerHTML = '';
                    window.addMusicLink();
                }
            } else {
                throw new Error(result.message || 'Произошла ошибка при регистрации');
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            alert(error.message || 'Произошла ошибка при отправке формы');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Вспомогательная функция для генерации ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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