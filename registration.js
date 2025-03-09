// Инициализация Firebase
const firebaseConfig = {
    // Здесь нужно будет вставить ваши данные конфигурации Firebase
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Получение элементов формы
const form = document.getElementById('registrationForm');
const paymentCheckbox = document.getElementById('paymentDone');
const paymentProofDiv = document.querySelector('.payment-proof');

// Обработка показа/скрытия поля для загрузки скриншота
paymentCheckbox.addEventListener('change', () => {
    paymentProofDiv.classList.toggle('hidden', !paymentCheckbox.checked);
});

// Генерация уникального ID для пользователя
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Загрузка изображения в Storage
async function uploadImage(file, userId) {
    if (!file) return null;
    const fileRef = storage.ref().child(`payment_proofs/${userId}_${file.name}`);
    await fileRef.put(file);
    return await fileRef.getDownloadURL();
}

// Сохранение данных в Firestore
async function saveToFirestore(formData, userId) {
    try {
        await db.collection('registrations').doc(userId).set(formData);
        return true;
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        return false;
    }
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

// Обработка отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('.submit-btn');
    animateSubmitButton(submitButton, true);

    try {
        const userId = generateUserId();
        const formData = new FormData(form);
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
            music: formData.get('music')
        };

        // Загрузка скриншота, если он есть
        const paymentProof = formData.get('paymentProof');
        if (paymentProof && paymentProof.size > 0) {
            data.paymentProofUrl = await uploadImage(paymentProof, userId);
        }

        // Сохранение в Firestore
        const saved = await saveToFirestore(data, userId);

        if (saved) {
            alert('Регистрация успешно завершена! Мы свяжемся с вами в ближайшее время.');
            form.reset();
        } else {
            throw new Error('Ошибка при сохранении данных');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    } finally {
        animateSubmitButton(submitButton, false);
    }
}); 