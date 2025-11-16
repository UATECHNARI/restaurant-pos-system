/**
 * Голосове сповіщення з використанням Web Speech API
 */

export function speakNotification(text: string, lang: string = 'uk-UA'): void {
  // Перевірка підтримки браузером
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API не підтримується цим браузером');
    return;
  }

  // Зупинити попередні сповіщення
  window.speechSynthesis.cancel();

  // Створити нове повідомлення
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Швидкість мови (0.1 - 10)
  utterance.pitch = 1; // Висота голосу (0 - 2)
  utterance.volume = 1; // Гучність (0 - 1)

  // Відтворити
  window.speechSynthesis.speak(utterance);
}

/**
 * Звуковий сигнал для сповіщення
 */
export function playNotificationSound(): void {
  try {
    // Створити звуковий контекст
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Створити осцилятор для звукового сигналу
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Налаштування звуку
    oscillator.frequency.value = 800; // Частота в герцах
    oscillator.type = 'sine'; // Тип хвилі: 'sine', 'square', 'sawtooth', 'triangle'
    
    // Envelope для плавного згасання
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Запустити та зупинити
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Помилка відтворення звуку:', error);
  }
}

/**
 * Комбінація голосового та звукового сповіщення
 */
export function notifyWithVoiceAndSound(text: string): void {
  playNotificationSound();
  setTimeout(() => {
    speakNotification(text);
  }, 300); // Невелика затримка після звукового сигналу
}
