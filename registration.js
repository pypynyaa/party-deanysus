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

// Объявляем переменную db глобально
let db;

// Функция для получения подключения к базе данных
function getDatabase() {
    try {
        if (!db) {
            // Проверяем, что Firebase уже инициализирован
            if (!firebase.apps.length) {
                // Конфигурация Firebase
                const firebaseConfig = {
                    apiKey: "AIzaSyCZgzf39KPvFoR-0Tg33TjypbjK-dxiUVI",
                    authDomain: "party-registration-web.firebaseapp.com",
                    projectId: "party-registration-web",
                    storageBucket: "party-registration-web.firebasestorage.app",
                    messagingSenderId: "437696239321",
                    appId: "1:437696239321:web:ea38f2ed5d3cd75434d0c8",
                    measurementId: "G-FBKQXVRD0D"
                };
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            console.log('База данных успешно подключена');
        }
        return db;
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
        throw error;
    }
}

// Инициализация базы данных после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, пытаемся подключиться к базе данных...');
    
    try {
        // Получаем объект базы данных
        db = getDatabase();
        
        // Пробуем сделать тестовый запрос
        db.collection('registrations').limit(1).get()
            .then(() => {
                console.log('Тестовый запрос к базе данных выполнен успешно');
                // Загружаем существующую регистрацию
                return loadExistingRegistration();
            })
            .catch((error) => {
                console.error('Ошибка при выполнении тестового запроса:', error);
                alert('Ошибка подключения к базе данных. Пожалуйста, обратитесь к администратору.');
            });
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
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

// Обработка музыкальных ссылок
document.addEventListener('DOMContentLoaded', function() {
    const musicLinksContainer = document.getElementById('musicLinksContainer');
    const addMusicLinkBtn = document.getElementById('addMusicLink');
    
    function createMusicLinkInput(isFirst = false) {
        const container = document.createElement('div');
        container.className = 'music-link-input';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control music-link';
        input.placeholder = 'Ссылка на музыку';
        container.appendChild(input);
        
        if (!isFirst) {
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'remove-link';
            deleteBtn.textContent = '×';
            deleteBtn.onclick = () => container.remove();
            container.appendChild(deleteBtn);
        }
        
        return container;
    }
    
    // Добавляем первую ссылку при загрузке
    if (musicLinksContainer) {
        musicLinksContainer.innerHTML = '';
        musicLinksContainer.appendChild(createMusicLinkInput(true));
    }
    
    // Обработчик добавления новых ссылок
    if (addMusicLinkBtn) {
        addMusicLinkBtn.addEventListener('click', () => {
            if (musicLinksContainer) {
                musicLinksContainer.appendChild(createMusicLinkInput(false));
            }
        });
    }
});

// Обновляем обработчик отправки формы для работы с Firebase
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (paymentCheckbox && paymentCheckbox.checked && (!paymentProofInput || !paymentProofInput.files[0])) {
            alert('Пожалуйста, прикрепите скриншот оплаты');
            return;
        }

        const submitButton = form.querySelector('.submit-btn');
        animateSubmitButton(submitButton, true);

        try {
            // Получаем подключение к базе данных
            const database = getDatabase();
            
            const formData = new FormData(form);
            const fullName = formData.get('fullName');
            const phone = formData.get('phone');
            const telegram = formData.get('telegram');

            // Проверяем, существует ли уже регистрация
            let existingRegistration = await findRegistrationByName(fullName) || 
                                     await findRegistrationByPhone(phone) || 
                                     await findRegistrationByTelegram(telegram);

            // Если найдена существующая регистрация, удаляем её
            if (existingRegistration) {
                await database.collection('registrations').doc(existingRegistration.id).delete();
                console.log('Старая регистрация удалена');
            }

            // Создаем новый ID для регистрации
            const userId = generateUserId();
            
            const data = {
                userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                telegram: formData.get('telegram'),
                paymentDone: formData.get('paymentDone') === 'on',
                hasLicense: formData.get('hasLicense') === 'on',
                transport: formData.get('transport'),
                activities: Array.from(formData.getAll('activities')),
                sauna: formData.get('sauna') === 'on',
                hideAndSeek: formData.get('hideAndSeek') === 'on',
                relationship: formData.get('relationship'),
                foodPreferences: formData.get('foodPreferences'),
                camera: formData.get('camera'),
                musicLinks: Array.from(document.querySelectorAll('.music-input')).map(input => input.value).filter(Boolean),
                lastUpdated: new Date().toISOString()
            };

            // Конвертируем фото в base64, если оно есть
            if (paymentProofInput && paymentProofInput.files[0]) {
                const paymentProof = paymentProofInput.files[0];
                try {
                    // Проверяем размер файла (не более 10MB для base64)
                    if (paymentProof.size > 10 * 1024 * 1024) {
                        throw new Error('Размер файла не должен превышать 10MB');
                    }
                    data.paymentProofBase64 = await getBase64(paymentProof);
                    data.paymentProofFilename = paymentProof.name;
                    data.paymentProofType = paymentProof.type;
                } catch (error) {
                    console.error('Ошибка обработки файла:', error);
                    alert('Произошла ошибка при обработке файла. Убедитесь, что размер файла не превышает 10MB.');
                    animateSubmitButton(submitButton, false);
                    return;
                }
            }

            // Сохраняем или обновляем данные
            if (existingRegistration) {
                await database.collection('registrations').doc(userId).update(data);
                alert('Ваша регистрация успешно обновлена!');
            } else {
                await database.collection('registrations').doc(userId).set(data);
                alert('Регистрация успешно завершена! Мы свяжемся с вами в ближайшее время.');
            }

            // Сохраняем ID регистрации в localStorage
            localStorage.setItem('registrationId', userId);
            
            form.reset();
            resetFileInput();
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        } finally {
            animateSubmitButton(submitButton, false);
        }
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