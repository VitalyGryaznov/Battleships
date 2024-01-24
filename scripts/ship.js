class Ship extends EventTarget {
  constructor(coordinatesList) {
    // Possible improvement: add validation to the coordinates
    super();
    this.squares = coordinatesList.length;
    this.coordinates = coordinatesList.map((coordinates) =>
      coordinates.toString()
    );
    this.columnStart = Math.min(
      coordinatesList[0][0],
      coordinatesList[coordinatesList.length - 1][0]
    );
    this.columnEnd = Math.max(
      coordinatesList[0][0],
      coordinatesList[coordinatesList.length - 1][0]
    );
    this.rowStart = Math.min(
      coordinatesList[1][1],
      coordinatesList[coordinatesList.length - 1][1]
    );
    this.rowEnd = Math.max(
      coordinatesList[1][1],
      coordinatesList[coordinatesList.length - 1][1]
    );
    this.hitCoordinates = [];
  }
  hit(coordinates) {
    // Possible improvement: add validation to the coordinates
    const coordinatesString = coordinates.toString();
    if (
      this.hitCoordinates.includes(coordinatesString) ||
      !this.coordinates.includes(coordinatesString)
    ) {
      return;
    }
    this.hitCoordinates.push(coordinatesString);
    if (this.hitCoordinates.length === this.squares) {
      this._sink();
    }
  }
  _sink() {
    this.dispatchEvent(
      new CustomEvent("sink", {
        detail: {
          squares: this.squares,
          coordinates: {
            columnStart: this.columnStart,
            columnEnd: this.columnEnd,
            rowStart: this.rowStart,
            rowEnd: this.rowEnd,
          },
        },
      })
    );
  }
}
