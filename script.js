document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let difficulty = 'medium'; // 'easy', 'medium', 'hard'
    let scores = { X: 0, O: 0, draw: 0 };
    
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const playerTurnDisplay = document.getElementById('player-turn');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const scoreDrawDisplay = document.getElementById('score-draw');
    const resetBtn = document.getElementById('reset-btn');
    const resultModal = document.getElementById('result-modal');
    const resultText = document.getElementById('result-text');
    const playAgainBtn = document.getElementById('play-again-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const difficultyContainer = document.getElementById('difficulty-container');
    const difficultySelect = document.getElementById('difficulty');
    const gameBoard = document.getElementById('game-board');
    
    // Initialize the game board
    function initializeBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
    
    // Handle cell clicks
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell is already filled or game is not active, return
        if (board[clickedCellIndex] !== '' || !gameActive) return;
        
        // Make the move for human player
        makeMove(clickedCell, clickedCellIndex, currentPlayer);
        
        // Check for win or draw
        const win = checkWin();
        const draw = checkDraw();
        
        if (win) {
            handleWin(win);
        } else if (draw) {
            handleDraw();
        } else {
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updatePlayerTurn();
            
            // If it's computer's turn in PVC mode
            if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
                setTimeout(makeComputerMove, 800);
            }
        }
    }
    
    // Make a move on the board
    function makeMove(cellElement, cellIndex, player) {
        board[cellIndex] = player;
        cellElement.classList.add(player.toLowerCase());
        animateMove(cellElement);
    }
    
    // Animate the move
    function animateMove(cell) {
        cell.style.transform = 'scale(0)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Make computer move
    function makeComputerMove() {
        if (!gameActive) return;
        
        let moveIndex;
        
        switch (difficulty) {
            case 'easy':
                moveIndex = getRandomMove();
                break;
            case 'medium':
                // 50% chance to make a winning/blocking move, 50% random
                if (Math.random() < 0.5) {
                    moveIndex = getBestMove();
                } else {
                    moveIndex = getRandomMove();
                }
                break;
            case 'hard':
                // Always make the best possible move
                moveIndex = getBestMove();
                break;
            default:
                moveIndex = getRandomMove();
        }
        
        const cell = document.querySelector(`.cell[data-index="${moveIndex}"]`);
        makeMove(cell, moveIndex, 'O');
        
        // Check for win or draw
        const win = checkWin();
        const draw = checkDraw();
        
        if (win) {
            handleWin(win);
        } else if (draw) {
            handleDraw();
        } else {
            currentPlayer = 'X';
            updatePlayerTurn();
        }
    }
    
    // Get a random available move
    function getRandomMove() {
        const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Get the best move (winning move or blocking move if available)
    function getBestMove() {
        // First check for a winning move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Then check for a blocking move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // If center is available, take it
        if (board[4] === '') return 4;
        
        // Otherwise take a random corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Otherwise take any available move
        return getRandomMove();
    }
    
    // Check for a win
    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return pattern;
            }
        }
        
        return null;
    }
    
    // Check for a draw
    function checkDraw() {
        return !board.includes('') && !checkWin();
    }
    
    // Handle win
    function handleWin(winningCells) {
        gameActive = false;
        
        // Highlight winning cells
        winningCells.forEach(index => {
            document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
        });
        
        // Update scores
        scores[currentPlayer]++;
        updateScores();
        
        // Show result modal
        resultText.textContent = `Player ${currentPlayer} Wins!`;
        resultModal.style.display = 'flex';
    }
    
    // Handle draw
    function handleDraw() {
        gameActive = false;
        scores.draw++;
        updateScores();
        resultText.textContent = 'Game Ended in a Draw!';
        resultModal.style.display = 'flex';
    }
    
    // Update player turn display
    function updatePlayerTurn() {
        if (gameMode === 'pvp') {
            playerTurnDisplay.textContent = `Player ${currentPlayer}'s Turn`;
        } else {
            playerTurnDisplay.textContent = currentPlayer === 'X' ? 'Your Turn (X)' : 'Computer Thinking...';
        }
    }
    
    // Update scores display
    function updateScores() {
        scoreXDisplay.textContent = `X: ${scores.X}`;
        scoreODisplay.textContent = `O: ${scores.O}`;
        scoreDrawDisplay.textContent = `Draws: ${scores.draw}`;
    }
    
    // Reset the game
    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        // Clear cell classes
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell';
            cell.style.transform = '';
        });
        
        updatePlayerTurn();
        resultModal.style.display = 'none';
    }
    
    // Reset scores
    function resetScores() {
        scores = { X: 0, O: 0, draw: 0 };
        updateScores();
    }
    
    // Event listeners
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    pvpBtn.addEventListener('click', () => {
        gameMode = 'pvp';
        pvpBtn.classList.add('active');
        pvcBtn.classList.remove('active');
        difficultyContainer.style.display = 'none';
        resetGame();
    });
    
    pvcBtn.addEventListener('click', () => {
        gameMode = 'pvc';
        pvcBtn.classList.add('active');
        pvpBtn.classList.remove('active');
        difficultyContainer.style.display = 'block';
        resetGame();
    });
    
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
    
    // Initialize the game
    initializeBoard();
    updatePlayerTurn();
    updateScores();
});