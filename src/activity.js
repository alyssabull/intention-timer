class Activity {
  constructor(categoryName, categoryColor, description, minutes, seconds) {
    this.categoryName = categoryName;
    this.categoryColor = categoryColor;
    this.description = description;
    this.minutes = minutes;
    this.seconds = seconds;
    this.completed = false;
    this.id = Date.now();
  }

  startTimer() {
    var totalSeconds = (this.minutes * 60) + this.seconds;
    var counter = 0;
    counter++;
    totalSeconds -= counter;
    this.seconds = totalSeconds % 60;

    if (this.seconds === 59) {
      this.minutes--;
    }

    console.log(this.seconds);

    return `${this.minutes}:${this.seconds}`;
  }

  markComplete() {

  }

  saveToStorage() {

  }
}
