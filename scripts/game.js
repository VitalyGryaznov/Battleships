class Game extends EventTarget {
  constructor({ shipsConfig, gridSize }) {
    // Possible improvement: add validation to the ship config and grid size
    super();
    this.sinks = new Map();
    this.ships = [];
    // initialize the grid with zeros
    this.grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    // create the ships and put them on the grid
    shipsConfig.forEach((shipsType) => {
      for (let i = 0; i < shipsType.amount; i++) {
        // finding a suitable place for the ship
        const coordinates = this._getSuitableCoordinates(shipsType.squares);

        // creating the ship with the coordinates
        const ship = new Ship(coordinates);
        this.ships.push(ship);

        // replace the zeros with the ship reference on the grid
        coordinates.forEach((coordinate) => {
          this.grid[coordinate[0]][coordinate[1]] = ship;
        });

        // handle the ship events
        ship.addEventListener("sink", ({ detail }) => {
          // track the sinks amount in format  numberOfSquaresOfTheShipType: amountOfSinksForThisShipType
          this.sinks.set(
            detail.squares,
            (this.sinks.get(detail.squares) ?? 0) + 1
          );

          // calculate the total amount of sinks
          let totalSinksAmount = 0;
          for (let value of this.sinks.values()) {
            totalSinksAmount += value;
          }

          // dispatch the sink event from the game
          this.dispatchEvent(
            new CustomEvent("sink", {
              detail: {
                ...detail,
                index: this.sinks.get(detail.squares) - 1,
              },
            })
          );

          // dispatch the game over event if all ships are sink
          if (totalSinksAmount === this.ships.length) {
            this.dispatchEvent(new CustomEvent("gameOver"));
          }
        });
      }
    });
  }
  _getSuitableCoordinates(squares) {
    // track the coordinates that were already tried to avoid infinite loop and trying the same coordinates multiple times
    const triedCoordinates = [];
    const getRandomCoordinates = () => [
      // Possible improvement: add math utils
      Math.floor(Math.random() * this.grid.length),
      Math.floor(Math.random() * this.grid.length),
    ];

    while (triedCoordinates.length < this.grid.length ** 2) {
      const startingPointCoordinates = getRandomCoordinates();
      if (triedCoordinates.includes(startingPointCoordinates.toString())) {
        continue;
      }
      triedCoordinates.push(startingPointCoordinates.toString());

      /* we are choosing the direction randomly and check 
      if the ship can be placed in this direction from the starting point*/
      const directions = ["right", "down", "left", "up"];

      // loop until we check all directions
      while (directions.length !== 0) {
        // starting with a random direction
        const dir = directions.splice(
          Math.floor(Math.random() * directions.length),
          1
        )[0];

        const shipCoordinatesForDirection = [];

        // check if there are enough cells in the direction
        // and add the coordinates to the shipCoordinatesForDirection
        switch (dir) {
          case "right":
            if (startingPointCoordinates[0] + squares > this.grid.length) {
              continue;
            }
            for (let i = 0; i < squares; i++) {
              shipCoordinatesForDirection.push([
                startingPointCoordinates[0] + i,
                startingPointCoordinates[1],
              ]);
            }
            break;
          case "down":
            if (startingPointCoordinates[1] + squares > this.grid.length) {
              continue;
            }
            for (let i = 0; i < squares; i++) {
              shipCoordinatesForDirection.push([
                startingPointCoordinates[0],
                startingPointCoordinates[1] + i,
              ]);
            }
            break;
          case "left":
            if (startingPointCoordinates[0] - squares + 1 < 0) {
              continue;
            }
            for (let i = 0; i < squares; i++) {
              shipCoordinatesForDirection.push([
                startingPointCoordinates[0] - i,
                startingPointCoordinates[1],
              ]);
            }
            break;
          default:
            if (startingPointCoordinates[1] - squares + 1 < 0) {
              continue;
            }
            for (let i = 0; i < squares; i++) {
              shipCoordinatesForDirection.push([
                startingPointCoordinates[0],
                startingPointCoordinates[1] - i,
              ]);
            }
            break;
        }

        // check if the cells for the chip coordinates are empty
        if (
          shipCoordinatesForDirection.some((coordinates) => {
            return this.grid[coordinates[0]][coordinates[1]] !== 0;
          })
        ) {
          continue;
        }
        // if all the checks passed, return the coordinates
        return shipCoordinatesForDirection;
      }
    }
    // if we tried all the coordinates and didn't find a suitable place for the ship, throw an error
    throw new Error("Couldn't find suitable coordinates for the ship");
  }
  shoot(coordinates) {
    // Possible improvement: add validation of the coordinates

    if (this.grid[coordinates[0]][coordinates[1]] === 0) {
      // if the cell on the grid is empty, dispatch shootResult with "miss"
      this.dispatchEvent(
        new CustomEvent("shootResult", {
          detail: { result: "miss", coordinates },
        })
      );
      return;
    }
    // if the cell on the grid is empty, dispatch shootResult with "hit"
    this.dispatchEvent(
      new CustomEvent("shootResult", { detail: { result: "hit", coordinates } })
    );
    this.grid[coordinates[0]][coordinates[1]].hit(coordinates);
  }
}
