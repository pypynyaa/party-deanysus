// Ждем, пока DOM будет полностью загружен
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('background-music');
    const musicBtn = document.querySelector('.music-control');
    let isPlaying = localStorage.getItem('musicPlaying') === 'true';

    // Устанавливаем начальное состояние кнопки
    updateButtonState();

    // Восстанавливаем время воспроизведения при загрузке
    const savedTime = localStorage.getItem('musicTime');
    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    // Если музыка должна играть, пытаемся воспроизвести
    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Автовоспроизведение заблокировано:', error);
                isPlaying = false;
                updateButtonState();
            });
        }
    }

    // Обновляем состояние кнопки
    function updateButtonState() {
        musicBtn.textContent = isPlaying ? '🎵 Выключить музыку' : '🎵 Включить музыку';
        localStorage.setItem('musicPlaying', isPlaying);
    }

    // Функция переключения музыки
    window.toggleMusic = function() {
        if (isPlaying) {
            audio.pause();
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Ошибка воспроизведения:', error);
                });
            }
        }
        isPlaying = !isPlaying;
        updateButtonState();
    };

    // Сохраняем текущее время воспроизведения каждую секунду
    setInterval(() => {
        if (isPlaying) {
            localStorage.setItem('musicTime', audio.currentTime);
        }
    }, 1000);

    // Обработка события окончания трека
    audio.addEventListener('ended', function() {
        if (isPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
        }
    });

    // Устанавливаем громкость
    audio.volume = 0.7;
}); 