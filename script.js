const Player = (name, token, AI) => {
  const getName = () => name;
  const setName = (newname) => (name = newname);
  const getToken = () => token;
  const isAI = () => AI;
  const setisAI = (newisAI) => (AI = newisAI);

  return { getName, setName, getToken, isAI, setisAI };
};

const p1 = Player("Player 1", "X", false);
const p2 = Player("Player 2", "O", true);

const gameBoard = (() => {
  let board = [
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "],
  ];
  let currentPlayer = p1;
  let nextPlayer = p2;
  let winner = null;
  let gameOver = false;

  const isGameOver = () => gameOver;
  const getWinner = () => winner;
  const getBoard = (i, j) => board[i][j];

  const initGame = () => {
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
    currentPlayer = p1;
    nextPlayer = p2;
    winner = null;
    gameOver = false;
    if (currentPlayer.isAI() && nextPlayer.isAI()) {
      while (!gameOver) {
        AIMove(nextPlayer, currentPlayer);
        swapPlayers();
      }
    } else if (currentPlayer.isAI() && !nextPlayer.isAI()) {
      AIMove(nextPlayer, currentPlayer);
      swapPlayers();
    }
  };

  const swapPlayers = () => {
    let temp = currentPlayer;
    currentPlayer = nextPlayer;
    nextPlayer = temp;
  };

  const placeToken = (row, col, token) => {
    if (board[row][col] != " ") {
      return false;
    }
    board[row][col] = token;
    return true;
  };

  const playerMove = (row, col) => {
    if (gameOver) {
      return null;
    }
    if (!placeToken(row, col, currentPlayer.getToken())) {
      return null;
    }

    if (checkWin(currentPlayer)) {
      gameOver = true;
      return winner;
    }

    if (checkTie()) {
      gameOver = true;
    }

    if (!gameOver && nextPlayer.isAI()) {
      AIMove(currentPlayer, nextPlayer);
      if (checkWin(nextPlayer)) {
        gameOver = true;
      }
      return currentPlayer;
    }

    swapPlayers();

    return nextPlayer; 
  };

  const checkWin = (player) => {
    for (let i = 0; i < 3; i++) {
      if (board[i].every((element) => element == player.getToken())) {
        gameOver = true;
        winner = player;
        return winner;
      }
    }

    for (let i = 0; i < 3; i++) {
      let subarray = [board[0][i], board[1][i], board[2][i]];
      if (subarray.every((element) => element == player.getToken())) {
        gameOver = true;
        winner = player;
        return winner;
      }
    }

    let subarray = [board[0][0], board[1][1], board[2][2]];
    if (subarray.every((element) => element == player.getToken())) {
      gameOver = true;
      winner = player;
      return winner;
    }
    subarray = [board[0][2], board[1][1], board[2][0]];
    if (subarray.every((element) => element == player.getToken())) {
      gameOver = true;
      winner = player;
      return winner;
    }

    return null;
  };

  const checkTie = () => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] == " ") return false;
      }
    }
    return checkWin(currentPlayer) == null && checkWin(nextPlayer) == null;
  };

  const AIMove = (human, ai) => {
    let maxScore = -1;
    let bestMove = { row: -1, col: -1 };
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (placeToken(i, j, ai.getToken())) {
          let score = minimax(human, ai, human);
          board[i][j] = " ";
          if (score > maxScore) {
            maxScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }

    placeToken(bestMove.row, bestMove.col, ai.getToken());

    if (checkWin(currentPlayer)) {
      gameOver = true;
      return winner;
    }

    if (checkTie()) {
      gameOver = true;
    }
  };

  const minimax = (human, ai, next) => {
    if (checkWin(ai)) {
      gameOver = false;
      winner = null;
      return 1;
    } else if (checkWin(human)) {
      gameOver = false;
      winner = null;
      return -1;
    } else if (checkTie()) {
      gameOver = false;
      winner = null;
      return 0;
    }

    if (next == ai) {
      let maxScore = -1;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (placeToken(i, j, next.getToken())) {
            let score = minimax(human, ai, human);
            board[i][j] = " ";
            if (score > maxScore) {
              maxScore = score;
            }
          }
        }
      }
      return maxScore;
    } else {
      let minScore = 1;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (placeToken(i, j, next.getToken())) {
            let score = minimax(human, ai, ai);
            board[i][j] = " ";
            if (score < minScore) {
              minScore = score;
            }
          }
        }
      }
      return minScore;
    }
  };

  const printBoard = () => {
    console.log(
      board[0].join(" ") + "\n" + board[1].join(" ") + "\n" + board[2].join(" ")
    );
  };

  return { getBoard, initGame, isGameOver, getWinner, playerMove, printBoard };
})();

const displayController = (() => {
  let p1Name = "Player 1";
  let p2Name = "Player 2";
  const board = gameBoard;
  const table = document.getElementById("board");
  const bg = document.querySelector(".landingBG");

  const initLandingPage = () => {
    initBoard();
    initControls();
    document.getElementById("startGame").addEventListener("click", () => {
      if (document.getElementById("p1initName").value != "") {
        p1Name = document.getElementById("p1initName").value;
        p1.setName(document.getElementById("p1initName").value);
      }
      p1.setisAI(document.getElementById("p1iscpu").checked);

      document.getElementById("p1name").textContent =
        p1.getName() + ": " + p1.getToken();

      if (document.getElementById("p2initName").value != "") {
        p2Name = document.getElementById("p2initName").value;
        p2.setName(document.getElementById("p2initName").value);
      }
      p2.setisAI(document.getElementById("p2iscpu").checked);

      document.getElementById("p2name").textContent =
        p2.getName() + ": " + p2.getToken();

      bg.classList.remove("open");

      board.initGame();
      updateDisplay();
    });
  };

  const updateDisplay = (next) => {
    document.getElementById("p1").setAttribute("data-my-turn", "true");
    document.getElementById("p2").setAttribute("data-my-turn", "false");

    document.getElementById("p1").setAttribute("winner", "false");
    document.getElementById("p2").setAttribute("winner", "false");

    table.childNodes.forEach((row, r) =>
      row.childNodes.forEach(
        (cell, c) => (cell.textContent = gameBoard.getBoard(r, c))
      )
    );
    if (board.getWinner()) {
      if (board.getWinner() == p1) {
        alert(p1Name + " wins the game");
        document.getElementById("p1").setAttribute("winner", "true");
      } else {
        alert(p2Name + " wins the game");
        document.getElementById("p2").setAttribute("winner", "true");
      }
    } else if (board.getWinner() == null && board.isGameOver()) {
      alert("The game becomes tie");
      document.getElementById("p1").setAttribute("winner", "neither");
      document.getElementById("p2").setAttribute("winner", "neither");
    } else {
      if (next == p1 && !p2.isAI()) {
        document.getElementById("p1").setAttribute("data-my-turn", "false");
        document.getElementById("p2").setAttribute("data-my-turn", "true");
      } else if (next == p2 && !p1.isAI()) {
        document.getElementById("p1").setAttribute("data-my-turn", "true");
        document.getElementById("p2").setAttribute("data-my-turn", "false");
      }
    }
  };

  const initBoard = () => {
    for (let i = 0; i < 3; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < 3; j++) {
        const td = document.createElement("td");
        td.classList = "g";
        td.addEventListener("click", () => {
          const next = board.playerMove(i, j);
          if (next != null) {
            updateDisplay(next);
          }
        });
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  };

  const initControls = () => {
    document.getElementById("restart").addEventListener("click", () => {
      table.childNodes.forEach((row) =>
        row.childNodes.forEach((cell) => (cell.textContent = " "))
      );

      document.getElementById("p1").setAttribute("data-my-turn", "true");
      document.getElementById("p2").setAttribute("data-my-turn", "false");

      document.getElementById("p1").setAttribute("winner", "false");
      document.getElementById("p2").setAttribute("winner", "false");
      board.initGame();
      updateDisplay();
    });

    document.getElementById("settings").addEventListener("click", () => {
      if (bg.classList.contains("open")) {
        bg.classList.remove("open");
      } else {
        bg.classList.add("open");
      }
    });

    bg.addEventListener("click", (event) => {
      if (event.target === bg) {
        bg.classList.remove("open");
      }
    });
  };

  return { initLandingPage };
})();

displayController.initLandingPage();
