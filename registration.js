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

// Обработка показа/скрытия поля для загрузки скриншота
if (paymentCheckbox && paymentProofDiv) {
    // Проверяем начальное состояние
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
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!allowedTypes.includes(file.type)) {
                alert('Пожалуйста, выберите изображение (JPG, JPEG, PNG) или документ (PDF, DOC, DOCX)');
                removeFile();
                return;
            }
            
            // Проверяем размер файла (не более 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Размер файла не должен превышать 10MB');
                removeFile();
                return;
            }

            console.log('Загружаемый файл:', file.name, 'Тип:', file.type, 'Размер:', file.size);

            // Показываем имя файла и кнопку удаления
            fileNameSpan.textContent = file.name;
            deleteFileBtn.classList.remove('hidden');
            fileUploadLabel.classList.add('file-selected');

            // Создаем превью только для изображений
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        previewImage.src = e.target.result;
                        imagePreview.classList.remove('hidden');
                        // Добавляем класс visible после небольшой задержки для анимации
                        requestAnimationFrame(() => {
                            imagePreview.classList.add('visible');
                        });
                    } catch (error) {
                        console.error('Ошибка при создании превью:', error);
                        alert('Произошла ошибка при загрузке изображения. Пожалуйста, попробуйте другой файл.');
                        removeFile();
                    }
                };

                reader.onerror = function(error) {
                    console.error('Ошибка чтения файла:', error);
                    alert('Произошла ошибка при чтении файла. Пожалуйста, попробуйте другой файл.');
                    removeFile();
                };

                reader.readAsDataURL(file);
            } else {
                // Для не-изображений показываем иконку типа файла
                imagePreview.classList.remove('hidden');
                previewImage.src = getFileTypeIcon(file.type);
                requestAnimationFrame(() => {
                    imagePreview.classList.add('visible');
                });
            }
            // Показываем уведомление
            showNotification('Файл успешно загружен!');
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
    if (fileUploadLabel) fileUploadLabel.classList.remove('file-selected');
    if (imagePreview) {
        imagePreview.classList.remove('visible');
        setTimeout(() => {
            imagePreview.classList.add('hidden');
            if (previewImage) previewImage.src = '#';
        }, 300);
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

// Генерация уникального ID для пользователя
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функции для работы с регистрациями
async function findRegistrationByPhone(phone) {
    try {
        const database = getDatabase();
        const snapshot = await database.collection('registrations')
            .where('phone', '==', phone)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    } catch (error) {
        console.error('Ошибка поиска регистрации:', error);
        return null;
    }
}

async function findRegistrationByTelegram(telegram) {
    try {
        const database = getDatabase();
        const snapshot = await database.collection('registrations')
            .where('telegram', '==', telegram)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    } catch (error) {
        console.error('Ошибка поиска регистрации:', error);
        return null;
    }
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

// Анимация отправки формы
function animateSubmitButton(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner"></span> Отправка...';
    } else {
        button.disabled = false;
        button.textContent = 'Отправить';
    }
}

// Добавляем обработчик для добавления новых полей для музыкальных ссылок

const container = document.getElementById('musicLinks');

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
    container.removeChild(inputContainer); // Удаляем контейнер при нажатии
};

// Добавляем поле ввода и кнопку в контейнер
inputContainer.appendChild(input);
inputContainer.appendChild(deleteBtn);

// Добавляем контейнер в основной блок
container.appendChild(inputContainer);

document.querySelector('.music-links').appendChild(container);

// Анимация появления
requestAnimationFrame(() => {
    container.style.transition = 'all 0.3s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
});

input.focus();


// Инициализация первого поля при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    addMusicLink(true); // true указывает, что это первое поле
});

// Обновляем обработчик отправки формы
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
            const phone = formData.get('phone');
            const telegram = formData.get('telegram');

            // Проверяем, существует ли уже регистрация
            let existingRegistration = await findRegistrationByPhone(phone) || 
                                     await findRegistrationByTelegram(telegram);

            const userId = existingRegistration ? existingRegistration.id : generateUserId();
            
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

            // Сохраняем ID регистрации в localStorage для возможности редактирования
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

    // Добавляем обработчик события reset для формы
    form.addEventListener('reset', () => {
        resetFileInput();
    });
}

// Функция для загрузки существующей регистрации
async function loadExistingRegistration() {
    if (!form) return;
    
    const registrationId = localStorage.getItem('registrationId');
    if (!registrationId) return;

    try {
        const database = getDatabase();
        const doc = await database.collection('registrations').doc(registrationId).get();
        if (doc.exists) {
            const data = doc.data();
            // Заполняем форму данными
            form.elements['fullName'].value = data.fullName || '';
            form.elements['phone'].value = data.phone || '';
            form.elements['telegram'].value = data.telegram || '';
            form.elements['paymentDone'].checked = data.paymentDone || false;
            form.elements['transport'].value = data.transport || '';
            form.elements['hasLicense'].checked = data.hasLicense || false;
            form.elements['relationship'].value = data.relationship || '';
            form.elements['foodPreferences'].value = data.foodPreferences || '';
            form.elements['camera'].value = data.camera || '';
            
            // Отмечаем выбранные активности
            if (data.activities) {
                data.activities.forEach(activity => {
                    const checkbox = form.querySelector(`input[name="activities"][value="${activity}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            // Показываем сохраненное фото оплаты
            if (data.paymentProofBase64 && previewImage && imagePreview && fileNameSpan && deleteFileBtn && fileUploadLabel) {
                previewImage.src = data.paymentProofBase64;
                imagePreview.classList.remove('hidden');
                imagePreview.classList.add('visible');
                fileNameSpan.textContent = data.paymentProofFilename || 'Фото оплаты загружено';
                deleteFileBtn.classList.remove('hidden');
                fileUploadLabel.classList.add('file-selected');
            }

            // Загружаем музыкальные ссылки
            if (data.musicLinks && data.musicLinks.length > 0) {
                // Удаляем пустое поле по умолчанию
                musicLinks.innerHTML = '';
                
                data.musicLinks.forEach(link => {
                    const container = document.createElement('div');
                    container.className = 'music-link-container';
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'music-input';
                    input.name = 'music[]';
                    input.value = link;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-music-btn';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = function() {
                        container.remove();
                    };
                    
                    container.appendChild(input);
                    container.appendChild(removeBtn);
                    musicLinks.appendChild(container);
                });
                
                // Добавляем кнопку для добавления новых ссылок
                const addContainer = document.createElement('div');
                addContainer.className = 'music-link-container';
                
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-music-btn';
                addBtn.textContent = '+';
                addBtn.onclick = addMusicLink;
                
                addContainer.appendChild(addBtn);
                musicLinks.appendChild(addContainer);
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Функция для получения иконки типа файла
function getFileTypeIcon(fileType) {
    switch(fileType) {
        case 'application/pdf':
            return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMzIgMGgzMjB2MTI4aDEyOHYzODRIMzJWMHptMzg0IDEyOEwzMjAgMzJWMTI4aDk2eiIgZmlsbD0iI2U2NTEwMCIvPjwvc3ZnPg==';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMzIgMGgzMjB2MTI4aDEyOHYzODRIMzJWMHptMzg0IDEyOEwzMjAgMzJWMTI4aDk2eiIgZmlsbD0iIzAwNzJjNiIvPjwvc3ZnPg==';
        default:
            return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMzIgMGgzMjB2MTI4aDEyOHYzODRIMzJWMHptMzg0IDEyOEwzMjAgMzJWMTI4aDk2eiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==';
    }
}

// Обработка открытия/закрытия реквизитов
const paymentToggle = document.querySelector('.payment-toggle');
const paymentInfo = document.querySelector('.payment-info');

if (paymentToggle && paymentInfo) {
    paymentToggle.addEventListener('click', () => {
        const isExpanded = paymentToggle.getAttribute('aria-expanded') === 'true';
        paymentToggle.setAttribute('aria-expanded', !isExpanded);
        
        paymentInfo.classList.toggle('visible');
        paymentToggle.classList.toggle('active');
        
        // Обновляем текст кнопки
        const buttonText = paymentToggle.querySelector('.button-text');
        buttonText.textContent = isExpanded ? 'Показать реквизиты для оплаты' : 'Скрыть реквизиты';
    });

    // Добавляем обработку клавиатуры для карты
    const paymentCard = document.querySelector('.payment-card');
    if (paymentCard) {
        paymentCard.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyCardNumber();
            }
        });
    }
}

// Функция для копирования номера карты
async function copyCardNumber() {
    const cardNumber = document.querySelector('.card-number').textContent;
    const button = document.querySelector('.copy-button');
    
    try {
        await navigator.clipboard.writeText(cardNumber);
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

document.querySelector('.payment-toggle').addEventListener('click', function() {
    const paymentInfo = document.getElementById('paymentInfo');
    this.classList.toggle('active');
    paymentInfo.classList.toggle('visible');

    // Обновляем иконку
    const icon = this.querySelector('.icon');
    icon.style.transform = paymentInfo.classList.contains('visible')
        ? 'rotate(180deg)'
        : 'rotate(0deg)';
});

// Обновляем обработчик для DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    const musicLinks = document.getElementById('musicLinks');
    if (musicLinks) {
        // Удаляем кнопку удаления с первого трека
        const firstContainer = musicLinks.querySelector('.music-link-container');
        if (firstContainer) {
            const removeBtn = firstContainer.querySelector('.remove-music-btn');
            if (removeBtn) {
                removeBtn.remove();
            }
        }
    }
});

// Функции для работы с модальным окном оплаты
function showPaymentModal() {
    document.querySelector('.modal-overlay').classList.add('show');
    document.querySelector('.payment-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hidePaymentModal() {
    document.querySelector('.modal-overlay').classList.remove('show');
    document.querySelector('.payment-modal').classList.remove('show');
    document.body.style.overflow = '';
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    const paymentToggle = document.querySelector('.payment-toggle');
    const closeModal = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const copyButton = document.querySelector('.copy-button');
    
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
    
    // Добавляем обработчик клавиши Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePaymentModal();
        }
    });
}); 