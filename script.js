let boardSize = 15;
    let numMines = 30;
    let board;
    let timerInterval;
    let timerValue = 0;
    let isPaused = false;
    let isFirstClick = true;

    document.getElementById("start-button").addEventListener("click", startGame);
    document.getElementById("pause-button").addEventListener("click", togglePause);
    document.getElementById("restart-button").addEventListener("click", restartGame);

    function startGame() {
      if (!board) {
        board = createBoard(boardSize, numMines);
        renderBoard(board);
      }

      if (isFirstClick) {
        startTimer();
        isFirstClick = false;
      }
    }

    function startTimer() {
      timerInterval = setInterval(() => {
        if (!isPaused) {
          timerValue++;
          updateTimerDisplay();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(timerValue / 60);
      const seconds = timerValue % 60;
      document.getElementById("timer").textContent = `Time: ${formatTime(minutes)}:${formatTime(seconds)}`;
    }

    function formatTime(value) {
      return value < 10 ? `0${value}` : value;
    }

    function togglePause() {
      isPaused = !isPaused;
      const pauseButton = document.getElementById("pause-button");

      if (isPaused) {
        clearInterval(timerInterval);
        pauseButton.textContent = "Continue";
      } else {
        startTimer();
        pauseButton.textContent = "Pause";
      }
    }

    function restartGame() {
      clearInterval(timerInterval);
      timerValue = 0;
      updateTimerDisplay();
      isPaused = false;
      isFirstClick = true;
      document.getElementById("pause-button").textContent = "Pause";

      document.getElementById("minesweeper-board").innerHTML = "";
      board = createBoard(boardSize, numMines);
      renderBoard(board);
    }

    function createBoard(size, mines) {
      const board = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
          isMine: false,
          isRevealed: false,
          neighborMines: 0,
        }))
      );

      // Place mines randomly
      for (let i = 0; i < mines; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * size);
          y = Math.floor(Math.random() * size);
        } while (board[x][y].isMine);

        board[x][y].isMine = true;
      }

      // Calculate neighbor mines
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!board[i][j].isMine) {
            board[i][j].neighborMines = countNeighborMines(board, i, j);
          }
        }
      }

      return board;
    }

    function countNeighborMines(board, x, y) {
      const directions = [
        { dx: -1, dy: -1 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 },
        { dx: 0, dy: -1 },                     { dx: 0, dy: 1 },
        { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 },
      ];

      let count = 0;
      for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;

        if (newX >= 0 && newX < board.length && newY >= 0 && newY < board[0].length) {
          count += board[newX][newY].isMine ? 1 : 0;
        }
      }

      return count;
    }

    function renderBoard(board) {
      const minesweeperBoard = document.getElementById("minesweeper-board");

      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.dataset.row = i;
          cell.dataset.col = j;

          cell.addEventListener("click", () => handleCellClick(i, j));
          minesweeperBoard.appendChild(cell);
        }
      }
    }

    function handleCellClick(x, y) {
      if (isPaused) {
        return; // Do nothing if the game is paused
      }

      if (isFirstClick) {
        startTimer();
        isFirstClick = false;
      }

      const cell = board[x][y];

      if (cell.isMine) {
        revealMines();
        setTimeout(() => {
          const restart = confirm("Game Over! You hit a mine. Do you want to play again?");
          if (restart) {
            restartGame();
          }
        }, 100);
      } else {
        revealCell(x, y);
      }
    }

    function revealCell(x, y) {
      const cell = board[x][y];

      if (!cell.isRevealed) {
        cell.isRevealed = true;

        const cellElement = document.querySelector(`.cell[data-row='${x}'][data-col='${y}']`);
        cellElement.classList.add("revealed");
        cellElement.textContent = cell.neighborMines || "";

        // Add color classes based on the number of neighboring mines
        if (cell.neighborMines === 1) {
          cellElement.classList.add("number1");
        } else if (cell.neighborMines === 2) {
          cellElement.classList.add("number2");
        } else if (cell.neighborMines === 3) {
          cellElement.classList.add("number3");
        }

        if (cell.neighborMines === 0) {
          // Auto-reveal neighbors if no mines nearby
          const directions = [
            { dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 },
          ];

          for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;

            if (newX >= 0 && newX < board.length && newY >= 0 && newY < board[0].length) {
              revealCell(newX, newY);
            }
          }
        }
      }
    }

    function revealMines() {
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          const cell = board[i][j];
          if (cell.isMine) {
            const cellElement = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
            cellElement.classList.add("mine");
          }
        }
      }
    }