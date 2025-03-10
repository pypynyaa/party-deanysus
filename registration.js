// Объявляем переменную db глобально
let db;

// Получение объекта базы данных после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Firebase уже инициализирован в HTML
        db = firebase.firestore();
        console.log('База данных успешно подключена');
        // Загружаем существующую регистрацию
        loadExistingRegistration();
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
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert('Пожалуйста, выберите изображение в формате JPG, JPEG или PNG');
                removeFile();
                return;
            }
            
            // Проверяем размер файла (не более 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Размер файла не должен превышать 5MB');
                removeFile();
                return;
            }

            console.log('Загружаемый файл:', file.name, 'Тип:', file.type, 'Размер:', file.size);

            // Показываем имя файла и кнопку удаления
            fileNameSpan.textContent = file.name;
            deleteFileBtn.classList.remove('hidden');
            fileUploadLabel.classList.add('file-selected');

            // Создаем превью изображения
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    previewImage.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    // Добавляем класс visible после небольшой задержки для анимации
                    requestAnimationFrame(() => {
                        imagePreview.classList.add('visible');
                    });
                    // Показываем уведомление
                    showNotification('Файл успешно загружен!');
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
    if (fileNameSpan) fileNameSpan.textContent = 'Прикрепить скриншот оплаты';
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
        const snapshot = await db.collection('registrations')
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
        const snapshot = await db.collection('registrations')
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
                music: formData.get('music'),
                lastUpdated: new Date().toISOString()
            };

            // Конвертируем фото в base64, если оно есть
            if (paymentProofInput && paymentProofInput.files[0]) {
                const paymentProof = paymentProofInput.files[0];
                try {
                    // Проверяем размер файла (не более 1MB для base64)
                    if (paymentProof.size > 1024 * 1024) {
                        throw new Error('Размер файла не должен превышать 1MB');
                    }
                    data.paymentProofBase64 = await getBase64(paymentProof);
                    data.paymentProofFilename = paymentProof.name;
                } catch (error) {
                    console.error('Ошибка обработки файла:', error);
                    alert('Произошла ошибка при обработке файла. Убедитесь, что размер файла не превышает 1MB.');
                    animateSubmitButton(submitButton, false);
                    return;
                }
            }

            // Сохраняем или обновляем данные
            if (existingRegistration) {
                await db.collection('registrations').doc(userId).update(data);
                alert('Ваша регистрация успешно обновлена!');
            } else {
                await db.collection('registrations').doc(userId).set(data);
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
        const doc = await db.collection('registrations').doc(registrationId).get();
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
            form.elements['music'].value = data.music || '';
            
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
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
} 