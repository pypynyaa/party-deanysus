// Ждем, пока DOM будет полностью загружен
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('background-music');
    const musicBtn = document.querySelector('.music-control');
    
    // Автоматически запускаем музыку
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Автовоспроизведение заблокировано:', error);
        });
    }

    let isPlaying = true;
    updateButtonState();

    // Обновляем состояние кнопки
    function updateButtonState() {
        musicBtn.textContent = isPlaying ? '🎵 Выключить музыку' : '🎵 Включить музыку';
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