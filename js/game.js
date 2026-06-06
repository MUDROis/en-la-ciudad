// ===== GAME STATE =====
const gameState = {
    currentStage: 1,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    stage1Completed: false,
    stage2Completed: false,
    stage3Completed: false,
    currentDialogueIndex: 0
};

// ===== STAGE 1: SPANISH VOCABULARY (13 places) =====
const vocabularyStage1 = [
    { spanish: "El parque", building: "parque", icon: "🌳", label: "Park" },
    { spanish: "El parque infantil", building: "parque_infantil", icon: "🎠", label: "Playground" },
    { spanish: "La comisaría", building: "comisaria", icon: "🚓", label: "Police Station" },
    { spanish: "La casa", building: "casa", icon: "🏠", label: "House" },
    { spanish: "El supermercado", building: "supermercado", icon: "🛒", label: "Supermarket" },
    { spanish: "El restaurante", building: "restaurante", icon: "🍽️", label: "Restaurant" },
    { spanish: "La escuela", building: "escuela", icon: "🏫", label: "School" },
    { spanish: "La biblioteca", building: "biblioteca", icon: "📚", label: "Library" },
    { spanish: "La panadería", building: "panaderia", icon: "🥖", label: "Bakery" },
    { spanish: "La carnicería", building: "carniceria", icon: "🥩", label: "Butcher's Shop" },
    { spanish: "La frutería", building: "fruteria", icon: "🍎", label: "Greengrocer's" },
    { spanish: "La heladería", building: "heladeria", icon: "🍦", label: "Ice Cream Shop" },
    { spanish: "El estadio", building: "estadio", icon: "🏟️", label: "Stadium" }
];

// ===== STAGE 2: DIALOGUES IN SPANISH =====
const dialogues = [
    {
        lines: [
            { spanish: "— Disculpe, ¿dónde está la heladería?", english: "Excuse me, where is the ice cream shop?" },
            { spanish: "— Siga todo recto. La heladería está al lado del parque del Sol.", english: "Go straight. The ice cream shop is next to Sol Park." },
            { spanish: "— ¡Gracias!", english: "Thank you!" }
        ]
    },
    {
        lines: [
            { spanish: "— ¿Dónde está la escuela, por favor?", english: "Where is the school, please?" },
            { spanish: "— Gire a la derecha. La escuela está enfrente del estadio.", english: "Turn right. The school is opposite the stadium." },
            { spanish: "— ¡Muchas gracias!", english: "Thank you very much!" }
        ]
    },
    {
        lines: [
            { spanish: "— Disculpe, busco la casa de Simón.", english: "Excuse me, I'm looking for Simon's house." },
            { spanish: "— Siga todo recto. Está entre la panadería y el estadio.", english: "Go straight. It's between the bakery and the stadium." },
            { spanish: "— ¡Gracias!", english: "Thank you!" }
        ]
    },
    {
        lines: [
            { spanish: "— ¿Dónde está el supermercado?", english: "Where is the supermarket?" },
            { spanish: "— Gire a la izquierda. El supermercado está en la esquina.", english: "Turn left. The supermarket is on the corner." },
            { spanish: "— ¡Gracias!", english: "Thank you!" }
        ]
    },
    {
        lines: [
            { spanish: "— Disculpe, ¿dónde está la biblioteca?", english: "Excuse me, where is the library?" },
            { spanish: "— Siga todo recto. Gire a la derecha. Está al lado de la comisaría.", english: "Go straight. Turn right. It's next to the police station." },
            { spanish: "— ¡Muchas gracias!", english: "Thank you very much!" }
        ]
    }
];

// ===== STAGE 3: MADRID LANDMARK (Puerta del Sol) =====
const madridLocation = { name: "Puerta del Sol", spanish: "la Puerta del Sol", lat: 40.4168, lng: -3.7038 };
let map;
let marker;

// ===== SPANISH SPEECH =====
function speakSpanish(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('stage1')) {
        initStage1();
        initStage2();
        updateScore(0);
        attachStageClickHandlers();
        goToStage(1);
    }
});

// ===== CLICK HANDLERS =====
function attachStageClickHandlers() {
    const dots = document.querySelectorAll('.stage-dot');
    dots.forEach((dot, idx) => {
        const stageNum = idx + 1;
        dot.addEventListener('click', () => goToStage(stageNum));
    });
}

// ===== STAGE 1 =====
function initStage1() {
    const wordBank = document.getElementById('wordBank');
    const cityMap = document.getElementById('cityMap');
    if (!wordBank || !cityMap) return;
    wordBank.innerHTML = '';
    cityMap.innerHTML = '';
    
    const shuffled = [...vocabularyStage1].sort(() => Math.random() - 0.5);
    shuffled.forEach((item) => {
        const wordEl = document.createElement('div');
        wordEl.className = 'word-item';
        wordEl.draggable = true;
        wordEl.textContent = item.spanish;
        wordEl.dataset.word = item.building;
        wordEl.addEventListener('dragstart', handleDragStart);
        wordEl.addEventListener('dragend', handleDragEnd);
        wordBank.appendChild(wordEl);
    });
    
    const slotOrder = [
        'parque', 'parque_infantil', 'comisaria', 'casa', 'supermercado',
        'restaurante', 'escuela', 'biblioteca', 'panaderia', 'carniceria',
        'fruteria', 'heladeria', 'estadio'
    ];
    slotOrder.forEach(buildingKey => {
        const building = vocabularyStage1.find(b => b.building === buildingKey);
        const slot = document.createElement('div');
        slot.className = 'building-slot';
        slot.dataset.building = building.building;
        slot.innerHTML = `<div class="building-icon">${building.icon}</div><div class="building-label">${building.label}</div>`;
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
        cityMap.appendChild(slot);
    });
}

let draggedElement = null;
function handleDragStart(e) { draggedElement = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
function handleDragEnd(e) { this.classList.remove('dragging'); }
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drag-over'); }
function handleDragLeave(e) { this.classList.remove('drag-over'); }
function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (draggedElement && !this.classList.contains('filled')) {
        if (draggedElement.dataset.word === this.dataset.building) {
            this.classList.add('correct', 'filled');
            const matchedWord = draggedElement.textContent;
            this.innerHTML += `<div style="margin-top:0.5rem;font-weight:bold;color:#06d6a0;">${matchedWord}</div>`;
            draggedElement.classList.add('matched');
            draggedElement.draggable = false;
            updateScore(10);
            gameState.correctAnswers++;
            speakSpanish(matchedWord);
            showFeedback('stage1Feedback', '¡Bravo! ¡Correcto! 🎉', 'success');
            checkStage1Completion();
        } else {
            showFeedback('stage1Feedback', 'Inténtalo de nuevo. ¡Mira los iconos! 🤔', 'error');
            setTimeout(() => document.getElementById('stage1Feedback')?.classList.remove('show'), 2000);
        }
    }
}
function checkStage1Completion() {
    const filled = document.querySelectorAll('.building-slot.filled').length;
    if (filled >= 10 && !gameState.stage1Completed) {
        gameState.stage1Completed = true;
        document.getElementById('stage1Next').style.display = 'inline-flex';
        showFeedback('stage1Feedback', '¡Excelente! Stage 1 completado. 🚀', 'success');
    }
}

// ===== STAGE 2 =====
function initStage2() {
    createDialogueLayout();
}

function createDialogueLayout() {
    const container = document.getElementById('stage2-content');
    if (!container) return;
    container.innerHTML = `
        <div class="dialogue-layout">
            <div class="dialogue-left">
                <div class="dialogue-card">
                    <div class="dialogue-header">
                        <span class="dialogue-title">💬 Conversación</span>
                        <div class="dialogue-nav">
                            <button id="prevDialogue" class="nav-arrow" disabled>◀</button>
                            <span id="dialogueCounter">1 / 5</span>
                            <button id="nextDialogue" class="nav-arrow">▶</button>
                        </div>
                    </div>
                    <div id="dialogueLines" class="dialogue-lines"></div>
                </div>
            </div>
            <div class="dialogue-right">
                <div class="mini-map-container">
                    <h3>🗺️ Madrid Map</h3>
                    <div class="map-image-wrapper">
                        <img id="mapImage" src="assets/map_madrid.png" alt="Madrid Map" class="clickable-map">
                    </div>
                    <p class="map-legend"><small>Haz clic en el mapa para ampliarlo.</small></p>
                </div>
            </div>
        </div>
        <div id="mapModal" class="modal">
            <span class="close-modal">&times;</span>
            <img class="modal-content" id="modalImage">
        </div>
    `;
    
    document.getElementById('prevDialogue').addEventListener('click', () => changeDialogue(-1));
    document.getElementById('nextDialogue').addEventListener('click', () => changeDialogue(1));
    
    const mapImg = document.getElementById('mapImage');
    const modal = document.getElementById('mapModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    mapImg.onclick = () => { modal.style.display = "flex"; modalImg.src = mapImg.src; };
    closeModal.onclick = () => { modal.style.display = "none"; };
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    
    showDialogueAtIndex(gameState.currentDialogueIndex);
}

function changeDialogue(delta) {
    const newIndex = gameState.currentDialogueIndex + delta;
    if (newIndex >= 0 && newIndex < dialogues.length) {
        gameState.currentDialogueIndex = newIndex;
        showDialogueAtIndex(newIndex);
    }
}

function showDialogueAtIndex(index) {
    const dialogue = dialogues[index];
    const linesContainer = document.getElementById('dialogueLines');
    if (!linesContainer) return;
    linesContainer.innerHTML = '';
    dialogue.lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'dialogue-line';
        lineDiv.innerHTML = `<div class="spanish-line">${line.spanish}</div><div class="english-line">📖 ${line.english}</div>`;
        linesContainer.appendChild(lineDiv);
    });
    document.getElementById('dialogueCounter').textContent = `${index+1} / ${dialogues.length}`;
    const prevBtn = document.getElementById('prevDialogue');
    const nextBtn = document.getElementById('nextDialogue');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.disabled = (index === dialogues.length - 1);
}

// ===== STAGE 3 =====
function initStage3() {
    setTimeout(() => {
        if (map) {
            map.remove();
        }
        map = L.map('map', { center: [40.4168, -3.7038], zoom: 14, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors | Madrid Learning',
            maxZoom: 19
        }).addTo(map);
        setTimeout(() => map.invalidateSize(), 100);
        
        if (marker) map.removeLayer(marker);
        marker = L.marker([madridLocation.lat, madridLocation.lng]).addTo(map);
        marker.bindPopup(`<b>${madridLocation.name}</b><br>${madridLocation.spanish}`).openPopup();
        
        const phrasesDiv = document.getElementById('usefulPhrases');
        if (phrasesDiv) {
            phrasesDiv.innerHTML = `
                <div class="phrases-container">
                    <span class="phrase">🚶 Siga todo recto (Go straight)</span>
                    <span class="phrase">👉 Gire a la derecha (Turn right)</span>
                    <span class="phrase">👈 Gire a la izquierda (Turn left)</span>
                    <span class="phrase">📌 al lado de (next to)</span>
                    <span class="phrase">🔄 enfrente de (opposite)</span>
                    <span class="phrase">🔀 entre (between)</span>
                </div>
            `;
        }
        
        setTimeout(() => {
            if (!gameState.stage3Completed) {
                gameState.stage3Completed = true;
                document.getElementById('stage3Complete').style.display = 'inline-flex';
                showFeedback('stage3Feedback', '🎉 ¡Has visto la Puerta del Sol! Listo para tu insignia.', 'success');
            }
        }, 2000);
    }, 300);
}

// ===== NAVIGATION =====
function goToStage(stageNum) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.stage-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx+1 === stageNum);
    });
    const rocket = document.getElementById('rocket');
    const progressFill = document.getElementById('progressFill');
    const percent = ((stageNum-1)/2)*100;
    rocket.style.left = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    document.getElementById(`stage${stageNum}`).classList.add('active');
    gameState.currentStage = stageNum;
    
    if (stageNum === 2) {
        if (!document.getElementById('dialogueLines')) {
            createDialogueLayout();
        } else {
            showDialogueAtIndex(gameState.currentDialogueIndex);
        }
    }
    if (stageNum === 3) {
        initStage3();
    }
}

function showVictory() {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.getElementById('victory').classList.add('active');
    const totalAttempts = 13 + 5;
    const accuracy = Math.round((gameState.correctAnswers / totalAttempts) * 100);
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    createConfetti();
}

function createConfetti() {
    const colors = ['#9d4edd', '#ffd60a', '#06d6a0', '#ff6b35'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);
            const duration = Math.random() * 3 + 2;
            confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], { duration: duration * 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }).onfinish = () => confetti.remove();
        }, i * 50);
    }
}

function restartGame() { location.reload(); }
function updateScore(points) {
    gameState.score += points;
    const scoreEl = document.getElementById('score');
    scoreEl.textContent = gameState.score;
    scoreEl.style.transform = 'scale(1.3)';
    setTimeout(() => scoreEl.style.transform = 'scale(1)', 200);
}
function showFeedback(elementId, message, type) {
    const fb = document.getElementById(elementId);
    if (!fb) return;
    fb.textContent = message;
    fb.className = `feedback show ${type}`;
    if (type === 'error') setTimeout(() => fb.classList.remove('show'), 2500);
}
