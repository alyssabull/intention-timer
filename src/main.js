var categoryButton = document.querySelectorAll('.category-button');
var startActivityButton = document.querySelector('.start-activity-button');
var intentionInput = document.querySelector('.intention-input');
var minutesInput = document.querySelector('.minutes-input');
var secondsInput = document.querySelector('.seconds-input');
var newActivityCard = document.querySelector('.new-activity-card');
var timerCard = document.querySelector('.inserted-card');
var inputCard = document.querySelector('.input-card');
var sectionTitle = document.querySelector('.section-title');
var activityLog = document.querySelector('.activity-log');

var currentActivity;
var pastActivities = [];

categoryButton[0].addEventListener('click', handleStudyButton);
categoryButton[1].addEventListener('click', handleMeditateButton);
categoryButton[2].addEventListener('click', handleExerciseButton);
startActivityButton.addEventListener('click', handleActivitySubmit);
timerCard.addEventListener('click', delegateCardResponsibility);
window.addEventListener('load', retrieveFromStorage);

function handleStudyButton() {
  resetButtonColor();
  addButtonColor(categoryButton[0], 'study-green', './assets/study-active.svg')
  enableInputs();
}

function handleMeditateButton() {
  resetButtonColor();
  addButtonColor(categoryButton[1], 'meditate-purple', './assets/meditate-active.svg')
  enableInputs();
}

function handleExerciseButton() {
  resetButtonColor();
  addButtonColor(categoryButton[2], 'exercise-red', './assets/exercise-active.svg')
  enableInputs();
}

function enableInputs() {
  intentionInput.disabled = false;
  minutesInput.disabled = false;
  secondsInput.disabled = false;
}

function resetButtonColor() {
  for (var i = 0; i < categoryButton.length; i++) {
    var defaultImages = ['./assets/study.svg', './assets/meditate.svg', './assets/exercise.svg'];
    categoryButton[i].className = '';
    categoryButton[i].classList.add('category-button');
    categoryButton[i].children[1].className = '';
    categoryButton[i].children[0].src = defaultImages[i];
  }
}

function addButtonColor(selectedButton, selectedColor, selectedIcon) {
  selectedButton.classList.add(selectedColor);
  selectedButton.children[1].classList.add(selectedColor);
  selectedButton.children[0].src = selectedIcon;
}

function handleActivitySubmit() {
  clearErrors();
  if (intentionInput.value === '') {
    showIntentionError();
  } else if (minutesInput.value === '' || secondsInput.value === '') {
    showTimeError();
  } else {
    convertCategory();
  }
}

function clearErrors() {
  for (var i = 0; i < newActivityCard.children.length; i++) {
    if (newActivityCard.children[i].className === 'error-message') {
      newActivityCard.children[i].remove();
      intentionInput.classList.remove('error-pink');
      minutesInput.classList.remove('error-pink');
      secondsInput.classList.remove('error-pink');
    }
  }
}

function showIntentionError() {
  var intentionError =
    `<div class='error-message'>
      <img src='./assets/warning.svg' class='error-icon'>
      <p>A description is required.</p>
    </div>`;
  document.querySelector('.intention-section').insertAdjacentHTML('afterend', intentionError);
  intentionInput.classList.add('error-pink');
}

function showTimeError() {
  var timeError =
    `<div class='error-message'>
      <img src='./assets/warning.svg' class='error-icon'>
      <p>A time value in both fields is required.</p>
    </div>`;
  document.querySelector('.time-section').insertAdjacentHTML('afterend', timeError);
  minutesInput.classList.add('error-pink');
  secondsInput.classList.add('error-pink');
}

function convertCategory() {
  var selectedActivity;
  var selectedColor;
  for (var i=0; i < categoryButton.length; i++) {
    if (categoryButton[i].children[0].src.includes('study-active')){
      selectedActivity = 'Study';
      selectedColor = 'study-color';
    } else if (categoryButton[i].children[0].src.includes('meditate-active')){
      selectedActivity = 'Meditate';
      selectedColor = 'meditate-color';
    } else if (categoryButton[i].children[0].src.includes('exercise-active')){
      selectedActivity = 'Exercise';
      selectedColor = 'exercise-color';
    }
  }
  createNewActivity(selectedActivity, selectedColor, intentionInput.value, minutesInput.value, secondsInput.value);
}

function createNewActivity(activity, color, intention, mins, secs) {
  currentActivity = new Activity (activity, color, intention, mins, secs);
  displayTimer();
}

function alignClock() {
  currentActivity.countdownMinutes = parseInt(currentActivity.countdownMinutes);
  currentActivity.countdownSeconds = parseInt(currentActivity.countdownSeconds);
  if (currentActivity.countdownMinutes < 10) {
    currentActivity.countdownMinutes = '0' + currentActivity.countdownMinutes;
  }
  if (currentActivity.countdownSeconds < 10) {
    currentActivity.countdownSeconds = '0' + currentActivity.countdownSeconds;
  }
}

function displayTimer() {
  timerCard.innerHTML = '';
  inputCard.classList.add('hidden');
  sectionTitle.innerText = 'Current Activity';
  alignClock();
  var timerContent =
  `<article class='light-grey first-card current-activity-card'>
    <div class='timer-card'>
      <p class='timer-description'>${currentActivity.description}</p>
      <h1 class='timer-time'>${currentActivity.countdownMinutes}:${currentActivity.countdownSeconds}</h1>
      <button class='start-timer-button ${currentActivity.categoryColor}'>START</button>
    </div>
  </article>`
  timerCard.insertAdjacentHTML('beforeend', timerContent);
}

function showFinished() {
  timerCard.innerHTML = '';
  var finishedCard =
  `<article class='light-grey first-card current-activity-card'>
    <div class='timer-card'>
      <p class='timer-description'>${currentActivity.description}</p>
      <h1 class='timer-time'>00:00</h1>
      <button class='start-timer-button ${currentActivity.categoryColor}'>COMPLETE!</button>
      <button class='log-activity-button'>LOG ACTIVITY</button>
    </div>
  </article>`
  timerCard.insertAdjacentHTML('beforeend', finishedCard);
}

function delegateCardResponsibility(event) {
  if (event.target.classList.contains('start-timer-button')){
    handleTimer(event);
    event.target.disabled = true;
  } else if (event.target.classList.contains('log-activity-button')){
    updatePastActivities();
  } else if (event.target.classList.contains('create-new-activity-button')){
    returnToMain();
  }
}

function handleTimer(event) {
  var timer = setInterval(updateTime, 1000);

  function updateTime() {
    currentActivity.startTimer();
    displayTimer();
    currentActivity.countdownMinutes = parseInt(currentActivity.countdownMinutes);
    currentActivity.countdownSeconds = parseInt(currentActivity.countdownSeconds);
    if (currentActivity.countdownSeconds === 0 && currentActivity.countdownMinutes === 0) {
      clearInterval(timer);
      showFinished();
      currentActivity.markComplete();
    }
  }
}

function updatePastActivities() {
  pastActivities.push(currentActivity);
  currentActivity.saveToStorage();
  logActivity();
}

function logActivity() {
  timerCard.innerHTML = '';
  var logActivity =
  `<article class='light-grey first-card current-activity-card'>
    <div class='timer-card'>
      <button class='create-new-activity-button'>CREATE A NEW ACTIVITY</button>
    </div>
  </article>`
  timerCard.insertAdjacentHTML('beforeend', logActivity);
  displayActivityCard();
 }

 function displayActivityCard() {
   activityLog.innerHTML = '';
   for (var i = 0; i < pastActivities.length; i++) {
     var activityCard =
     `<div class='past-activity-card light-grey'>
       <div class='past-activity-border ${pastActivities[i].categoryColor}'></div>
       <h4 class='past-activity-category'>${pastActivities[i].categoryName}</h4>
       <h5 class='past-activity-time'>${pastActivities[i].minutes} MINS ${pastActivities[i].seconds} SECONDS</h5>
       <p class='past-activity-description'>${pastActivities[i].description}</p>
     </div>`
    activityLog.insertAdjacentHTML('afterbegin', activityCard);
   }
 }

function returnToMain() {
  clearInputs();
  timerCard.innerHTML = '';
  inputCard.classList.remove('hidden');
  resetButtonColor();
  disableInputs();
}

function clearInputs() {
  timerCard.value = '';
  intentionInput.value = '';
  minutesInput.value = '';
  secondsInput.value = '';
}

function disableInputs() {
  intentionInput.disabled = true;
  minutesInput.disabled = true;
  secondsInput.disabled = true;
}

function retrieveFromStorage() {
  var storedActivities = localStorage.getItem('storedActivities');
  var parsedActivities = JSON.parse(storedActivities);
  if (parsedActivities) {
    pastActivities = pastActivities.concat(parsedActivities);
    displayActivityCard();
  }
}
