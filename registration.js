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
const sections = document.querySelectorAll('.form-section');
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
const paymentCheckbox = document.getElementById('paymentDone');
const paymentProofDiv = document.querySelector('.payment-proof');

// Обработка переключения секций
let currentSection = 0;

function showSection(index) {
    sections.forEach(section => {
        section.classList.remove('active', 'slide-in', 'slide-out');
    });
    sections[index].classList.add('active', 'slide-in');
    updateProgressBar();
}

function updateProgressBar() {
    const progress = ((currentSection + 1) / sections.length) * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
}

// Обработчики для кнопок навигации
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (validateSection(currentSection)) {
            currentSection = Math.min(currentSection + 1, sections.length - 1);
            showSection(currentSection);
        }
    });
});

prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentSection = Math.max(currentSection - 1, 0);
        showSection(currentSection);
    });
});

// Валидация секций
function validateSection(sectionIndex) {
    const section = sections[sectionIndex];
    const inputs = section.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

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

// Обработка отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateSection(currentSection)) {
        return;
    }

    const submitButton = form.querySelector('.submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

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
            currentSection = 0;
            showSection(0);
        } else {
            throw new Error('Ошибка при сохранении данных');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Отправить';
    }
}); 