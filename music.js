// Ждем, пока DOM будет полностью загружен
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('background-music');
    const musicBtn = document.querySelector('.music-control');
    let isPlaying = false;

    // Функция переключения музыки
    window.toggleMusic = function() {
        if (isPlaying) {
            audio.pause();
            musicBtn.classList.remove('playing');
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    musicBtn.classList.add('playing');
                }).catch(error => {
                    console.log('Ошибка воспроизведения:', error);
                });
            }
        }
        isPlaying = !isPlaying;
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