// set the type and amount of ships
const shipsConfig = [
  { squares: 5, amount: 1 },
  { squares: 4, amount: 2 },
];

// set the grid size
const gridSize = 10;

document.addEventListener("DOMContentLoaded", initializeGame);

function initializeGame() {
  // initialize the game
  const game = new Game({ shipsConfig, gridSize });
  // make it accessible outside of the current scope
  document.game = game;

  // handle game events
  game.addEventListener("shootResult", ({ detail }) => {
    const { coordinates, result } = detail;
    const cell = document.getElementById(
      `cell-${coordinates[0]}-${coordinates[1]}`
    );
    cell.classList.add(`game-container__grid-cell_${result}`);
  });
  game.addEventListener("sink", ({ detail }) => {
    // mark it as sink on the right side
    const ship = document.getElementById(
      `ship-${detail.squares}-${detail.index}`
    );
    ship.classList.add("game-container__ship_sink");

    // Mark the ship as sink on the grid
    detail.coordinates.forEach((coordinate) => {
      const cell = document.getElementById(
        `cell-${coordinate[0]}-${coordinate[1]}`
      );
      cell.classList.add("game-container__grid-ship-sink");
    });

    /* TODO: 
      - add coordinates of the ship to the sink event
      - create a grid item with grid-column and grid-row based in coordinates
      - add a class to the grid item with the red border color
      */
  });
  game.addEventListener("gameOver", () => {
    const gameOver = document.getElementById("game-over");
    gameOver.classList.remove("hidden");
  });

  // Initialize the game grid
  const grid = document.getElementById("grid");

  const addGridCell = () => {
    const cell = document.createElement("div");
    cell.className = "game-container__grid-cell";
    grid.appendChild(cell);
    return cell;
  };

  // Add column names
  addGridCell();
  for (
    let letterUnicode = "A".charCodeAt(0);
    letterUnicode < "A".charCodeAt(0) + gridSize;
    letterUnicode++
  ) {
    addGridCell().textContent = String.fromCharCode(letterUnicode);
  }

  // Add row names and cells
  for (let row = 0; row < gridSize; row++) {
    addGridCell().textContent = row + 1;
    for (let col = 0; col < gridSize; col++) {
      const cell = addGridCell();
      cell.setAttribute("role", "button");
      // each cell has an id with the coordinates
      cell.id = `cell-${col}-${row}`;
      cell.addEventListener("click", () => {
        hideValidationMessage();
        clearInput();
        game.shoot([col, row]);
      });
    }
  }

  // Add ships view on the right
  const shipsElement = document.getElementById("ships");

  shipsConfig.forEach((shipConfig) => {
    for (let i = 0; i < shipConfig.amount; i++) {
      const ship = document.createElement("div");
      ship.className = "game-container__ship";
      ship.style["width"] = `${shipConfig.squares}rem`;
      // each ship has an id with the type and order index of a ship type
      ship.id = `ship-${shipConfig.squares}-${i}`;
      shipsElement.appendChild(ship);
      for (let square = 0; square < shipConfig.squares; square++) {
        const shipCell = document.createElement("div");
        shipCell.className = "game-container__ship-cell";
        ship.appendChild(shipCell);
      }
    }
  });
}

function hideValidationMessage() {
  document.getElementById("validation-error").classList.add("hidden");
}

function clearInput() {
  document.getElementById("coordinateInput").value = "";
}

function resetGame() {
  window.location.reload();
}

function isValidCoordinates(stringCoordinate) {
  if (!stringCoordinate || typeof stringCoordinate !== "string") {
    return false;
  }

  const pattern = new RegExp(`^[A-${String.fromCharCode(64 + gridSize)}]\\d*$`);

  if (!pattern.test(stringCoordinate)) {
    return false;
  }

  const row = parseInt(stringCoordinate.substring(1));

  return row <= gridSize && row > 0;
}

function enterCoordinates() {
  // Potential improvement: check if the cell was already shot and display a message
  // For that could be used an array of already shot coordinates
  const input = document.getElementById("coordinateInput");
  const coordinates = input.value.trim().toUpperCase();

  if (!isValidCoordinates(coordinates)) {
    document.getElementById("validation-error").classList.remove("hidden");
    return;
  }

  hideValidationMessage();
  clearInput();

  // convert coordinates to the format used in the game
  const col = coordinates.charCodeAt(0) - "A".charCodeAt(0);
  const row = parseInt(coordinates.substring(1)) - 1;

  document.game.shoot([col, row]);
}

// handle key down for the input
function handleKeyDown(event) {
  if (event.key === "Enter") {
    enterCoordinates();
  }
}
