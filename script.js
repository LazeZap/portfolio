(() => {
  const titleScreen = document.getElementById('titleScreen');
  const gameScreen = document.getElementById('gameScreen');
  const startButton = document.getElementById('startButton');
  const navItems = [...document.querySelectorAll('.nav-item')];
  const sections = [...document.querySelectorAll('.content-section')];
  const crumb = document.getElementById('crumb');
  const footerStatus = document.getElementById('footerStatus');
  const soundToggle = document.getElementById('soundToggle');
  const secretMessage = document.getElementById('secretMessage');
  let selectedIndex = 0;
  let soundOn = false;
  let audioContext = null;
  let konami = [];

  document.getElementById('year').textContent = new Date().getFullYear();

  function beep(freq = 520, duration = 0.045) {
    if (!soundOn) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = freq;
      gain.gain.value = 0.025;
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Audio is optional; site still works without it. */ }
  }

  function showTitle() {
    gameScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
    startButton.focus();
    footerStatus.textContent = 'TITLE SCREEN';
    beep(300);
  }

  function openMenu() {
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    openSection('about');
    navItems[0].focus();
    footerStatus.textContent = 'READY';
    beep(640);
  }

  function openSection(name) {
    const index = navItems.findIndex(item => item.dataset.screen === name);
    if (index < 0) return;
    selectedIndex = index;
    navItems.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle('selected', active);
      item.setAttribute('aria-current', active ? 'page' : 'false');
    });
    sections.forEach(section => section.classList.toggle('active', section.id === `section-${name}`));
    const title = navItems[index].querySelector('span:nth-child(2)').textContent;
    crumb.textContent = `MENU / ${title}`;
    footerStatus.textContent = `${String(index + 1).padStart(2, '0')} / ${String(navItems.length).padStart(2, '0')} SELECTED`;
    beep(460 + index * 35);
    const activeSection = document.getElementById(`section-${name}`);
    if (activeSection) activeSection.focus({preventScroll:true});
  }

  startButton.addEventListener('click', openMenu);
  document.getElementById('backToTitle').addEventListener('click', showTitle);
  navItems.forEach(item => item.addEventListener('click', () => openSection(item.dataset.screen)));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => openSection(button.dataset.go)));

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = `♪ SOUND: ${soundOn ? 'ON' : 'OFF'}`;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    if (soundOn) beep(700);
  });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const inGame = !gameScreen.classList.contains('hidden');
    if (!inGame) {
      if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement === startButton || document.activeElement === document.body) {
          event.preventDefault(); openMenu();
        }
      }
      return;
    }
    if (event.key === 'Escape' || event.key === 'Backspace') {
      event.preventDefault(); showTitle(); return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault(); selectedIndex = (selectedIndex + 1) % navItems.length; navItems[selectedIndex].focus(); beep(390);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault(); selectedIndex = (selectedIndex - 1 + navItems.length) % navItems.length; navItems[selectedIndex].focus(); beep(390);
    } else if (event.key === 'Enter' && navItems.includes(document.activeElement)) {
      event.preventDefault(); openSection(document.activeElement.dataset.screen);
    } else if (/^[1-7]$/.test(event.key)) {
      openSection(navItems[Number(event.key) - 1].dataset.screen);
    }
  });

  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
  document.addEventListener('keydown', event => {
    konami.push(event.key);
    konami = konami.slice(-sequence.length);
    if (sequence.every((key, index) => key === konami[index])) {
      secretMessage.classList.remove('hidden');
      beep(880, 0.12);
    }
  });
})();