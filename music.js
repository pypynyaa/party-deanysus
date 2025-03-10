let isPlaying = localStorage.getItem('musicPlaying') === 'true';
const audio = document.getElementById('background-music');
const musicBtn = document.querySelector('.music-control');

// Устанавливаем начальное состояние кнопки
if (isPlaying) {
    musicBtn.textContent = '🎵 Выключить музыку';
    audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
}

function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        musicBtn.textContent = '🎵 Включить музыку';
        localStorage.setItem('musicPlaying', 'false');
    } else {
        audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
        musicBtn.textContent = '🎵 Выключить музыку';
        localStorage.setItem('musicPlaying', 'true');
    }
    isPlaying = !isPlaying;
}

// Устанавливаем громкость
audio.volume = 0.7;

// Сохраняем текущее время воспроизведения
setInterval(() => {
    if (isPlaying) {
        localStorage.setItem('musicTime', audio.currentTime);
    }
}, 1000);

// Восстанавливаем время воспроизведения при загрузке
const savedTime = localStorage.getItem('musicTime');
if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
} 