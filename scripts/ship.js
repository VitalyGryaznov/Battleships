class Ship extends EventTarget {
  constructor(coordinatesList) {
    // Possible improvement: add validation to the coordinates
    super();
    this.squares = coordinatesList.length;
    this.coordinatesList = coordinatesList;
    this.stringCoordinatesList = coordinatesList.map((coordinates) =>
      coordinates.toString()
    );
    this.hitCoordinates = [];
  }
  hit(coordinates) {
    // Possible improvement: add validation to the coordinates
    const coordinatesString = coordinates.toString();
    if (
      this.hitCoordinates.includes(coordinatesString) ||
      !this.coordinatesList.some(
        (coordinates) => coordinates.toString() === coordinatesString
      )
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
          coordinates: this.coordinatesList,
        },
      })
    );
  }
}
