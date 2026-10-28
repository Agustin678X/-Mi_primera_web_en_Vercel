// Estado del juego
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' o 'pve'
let scores = { X: 0, O: 0, draws: 0 };

// Elementos del DOM
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const btnPvp = document.getElementById('btn-pvp');
const btnPve = document.getElementById('btn-pve');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraws = document.getElementById('score-draws');

// Combinaciones ganadoras
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6]              // Diagonales
];

// Inicializar evento de clic en cada celda
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartBtn.addEventListener('click', restartGame);
btnPvp.addEventListener('click', () => setGameMode('pvp'));
btnPve.addEventListener('click', () => setGameMode('pve'));

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (board[index] !== '' || !gameActive) return;

    makeMove(index);

    if (gameActive && gameMode === 'pve' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

function makeMove(index) {
    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    cells[index].classList.add('taken', currentPlayer.toLowerCase());

    if (checkWinner()) {
        endGame(false);
    } else if (board.every(cell => cell !== '')) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(condition);
            return true;
        }
    }
    return false;
}

function highlightWinningCells(cells) {
    cells.forEach(index => {
        document.querySelector(`[data-index="${index}"]`).classList.add('winning');
    });
}

function endGame(isDraw) {
    gameActive = false;
    if (isDraw) {
        statusDisplay.innerHTML = '🤝 ¡Empate!';
        scores.draws++;
    } else {
        statusDisplay.innerHTML = `🎉 ¡Jugador ${currentPlayer} gana!`;
        scores[currentPlayer]++;
    }
    updateScoreboard();
}

function updateStatus() {
    statusDisplay.innerHTML = `Turno de <span class="current-player">${currentPlayer}</span>`;
}

function updateScoreboard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraws.textContent = scores.draws;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
    updateStatus();

    // Si es modo computadora y es turno de la computadora
    if (gameMode === 'pve' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

function setGameMode(mode) {
    gameMode = mode;
    btnPvp.classList.toggle('active', mode === 'pvp');
    btnPve.classList.toggle('active', mode === 'pve');
    restartGame();
}

// Lógica de la computadora
function computerMove() {
    if (!gameActive) return;

    // 1. Intentar ganar
    let move = findBestMove('O');
    // 2. Bloquear al jugador
    if (move === -1) move = findBestMove('X');
    // 3. Tomar el centro si está libre
    if (move === -1 && board[4] === '') move = 4;
    // 4. Tomar una esquina
    if (move === -1) {
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length > 0) move = corners[Math.floor(Math.random() * corners.length)];
    }
    // 5. Cualquier movimiento válido
    if (move === -1) {
        const available = board.map((v, i) => v === '' ? i : -1).filter(i => i !== -1);
        if (available.length > 0) move = available[Math.floor(Math.random() * available.length)];
    }

    if (move !== -1) makeMove(move);
}

function findBestMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const values = [board[a], board[b], board[c]];
        const playerCount = values.filter(v => v === player).length;
        const emptyCount = values.filter(v => v === '').length;

        if (playerCount === 2 && emptyCount === 1) {
            return condition[values.indexOf('')];
        }
    }
    return -1;
}

// Inicializar
updateStatus();
