document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const difficultySelect = document.getElementById('difficulty');
    const bombProbabilityInput = document.getElementById('bombProbability');
    const startGameButton = document.getElementById('startGame');
    const tipsButton = document.getElementById('tipsButton');
    let revealedCount = 0;
    let totalNonBombCells = 0;
    let gamesWon = 0;
    let gamesLost = 0;

    const difficulties = {
        easy: { rows: 8, cols: 8, bombProbability: 0.1 },
        medium: { rows: 12, cols: 12, bombProbability: 0.15 },
        hard: { rows: 16, cols: 16, bombProbability: 0.2 },
    };

    let board = [];
    let rows, cols, bombProbability;

    startGameButton.addEventListener('click', () => {
        const difficulty = difficultySelect.value;
        rows = difficulties[difficulty].rows;
        cols = difficulties[difficulty].cols;
        bombProbability = parseFloat(bombProbabilityInput.value) / 10; // we convert it from 1-10 values to 0.1-1 percantages

        revealedCount = 0; // Reset revealed cell count
        noMoreTips = false; // Reset tips
        // reset bomb image
        document.getElementById('bomb-img').src = 'bomb-3-01.png';

        generateBoard(rows, cols);
    });

    tipsButton.addEventListener('click', revealRandomBomb);

    function generateBoard(rows, cols) {
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateRows = `repeat(${rows}, 11.5%)`;
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 11.5%)`;
        board = [];
        totalNonBombCells = 0;

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                cell.addEventListener('click', () => revealCell(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // to not show the context menu-ul
                    toggleFlag(i, j);  // change the status of the cell
                });

                const isBomb = Math.random() < bombProbability;
                if (!isBomb) {
                    // compute the number of non-bomb cells to help us 
                    // later calculate if the pplayer have won
                    totalNonBombCells++;
                }
    
                row.push({ element: cell, revealed: false, bomb: isBomb, flagged: false });
                boardElement.appendChild(cell);
            }
            board.push(row);
        }
    }

    // most of the game logic is here
    function revealCell(row, col, fromTip = false) {
        const cell = board[row][col];
    
        if (cell.revealed || cell.flagged) return;
    
        cell.revealed = true;
        cell.element.classList.add('revealed');
    
        if (cell.bomb) {
            cell.element.classList.add('bomb');
            
            if (!fromTip) {
                // if the function was triggered by the player clicking on a bomb 
                // and not from a pressing the tip button
                
                // update image of the bomb
                document.getElementById('bomb-img').src = 'bomb-1-01.png';

                alert('Game Over!');

                gamesLost++;
                revealAllBombs();

                // update the status of player's info
                document.getElementById('gamesLost').innerHTML = gamesLost;
            }
        } else {
            revealedCount++;
    
            const bombsAround = countBombsAround(row, col);
            if (bombsAround > 0) {
                cell.element.textContent = bombsAround;
            } else {
                revealNeighbors(row, col);
            }
    
            // check if all non-bomb cells have been revealed
            if (revealedCount === totalNonBombCells) {
                alert('Congratulations! You won!');
                gamesWon++;
                revealAllBombs();

                // update the status of player's info
                document.getElementById('gamesWon').innerHTML = gamesWon;
            }
        }
    }
    

    function toggleFlag(row, col) {
        const cell = board[row][col];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;

        // change the color of the cell to yellow
        cell.element.classList.toggle('flag');
    }

    function countBombsAround(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newRow = row + i;
                let newCol = col + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    if (board[newRow][newCol].bomb) count++;
                }
            }
        }
        return count;
    }

    function revealNeighbors(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newRow = row + i;
                let newCol = col + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }

    function revealAllBombs() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j].bomb) {
                    board[i][j].element.classList.add('bomb');
                    board[i][j].element.classList.add('revealed');
                }
            }
        }
    }

    let noMoreTips = false;
    function revealRandomBomb() {
        const bombCells = [];

        if (noMoreTips) {
            alert('No more tips for you!');
            return;
        }
        // see which bomb cells have not been revealed
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j].bomb && !board[i][j].revealed) {
                    bombCells.push({ row: i, col: j });
                }
            }
        }

        // pick random bomb cell to show
        if (bombCells.length > 1) {
            let randomIndex = Math.floor(Math.random() * bombCells.length);
            let randomBombCell = bombCells[randomIndex];

            revealCell(randomBombCell.row, randomBombCell.col, true);
        } else {
            // alert('No more bombs to reveal!');
            noMoreTips = true;
        }
    }


});
