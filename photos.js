document.addEventListener('DOMContentLoaded', function() {
    const photos = document.querySelectorAll('.photo-item');
    const clickCounts = new Map();
    const targetUrl = 'https://vkvideo.ru/video-83304459_456239101';

    photos.forEach(photo => {
        clickCounts.set(photo, 0);
        
        photo.addEventListener('click', function() {
            const currentCount = clickCounts.get(photo) + 1;
            clickCounts.set(photo, currentCount);
            
            // Создаем эффект пульсации при клике
            photo.style.transform = 'scale(0.95)';
            setTimeout(() => {
                photo.style.transform = '';
            }, 150);

            if (currentCount === 5) {
                window.open(targetUrl, '_blank');
                clickCounts.set(photo, 0); // Сбрасываем счетчик
            }
        });
    });
}); 