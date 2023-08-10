import * as helpers from './helpers.js'
import * as timer from './timer.js'

class MyTimer extends timer.TimerClass {
  change_display = runningTimerDisplays // Function to update displayed information during timer
  play_sound = helpers.playSound // Function to play sound
  add_tree = addTreeToGarden // Function to add a tree to the garden
}

const t = new MyTimer() // Create a new timer instance

// Time step in seconds to grow tree
let timeStep

let currentDisplay = '' // Current display mode: 'pomo' or 'break'

window.current_timer = t // Reference to the current timer instance

const displayElements = {
  minute_tag: document.querySelector('#minute'),
  second_tag: document.querySelector('#second'),
  tree_tag: document.querySelector('#current_tree'),
  breaking_image_tag: document.querySelector('#breaking_time'),
  pause_button_tag: document.querySelector('#btn_pause'),
  stop_button_tag: document.querySelector('#btn_stop'),
  pomo_in_row_count_tag: document.querySelector('#row_pomo_number'),
  pomo_row_card: document.querySelector('#row_pomo_card')
}

function runningTimerDisplays () {
  // Update title and displayed pomodoro time
  document.title = `${helpers.formatedTime(t.timer_state.minutes)}:${helpers.formatedTime(t.timer_state.seconds)}`
  displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_state.minutes) + ':'
  displayElements.second_tag.innerHTML = helpers.formatedTime(t.timer_state.seconds)

  // Handle different display scenarios when the timer is stopped or running
  if (t.timer_control.stop_flag) { // Timer is stopped
    // Hide the breaking image
    displayElements.breaking_image_tag.style.display = 'none'
    // Show the initial tree image
    displayElements.tree_tag.src = '../assets/images/1.jpg'
    displayElements.tree_tag.style.display = 'block'
    // Adjust button states and pomo session count display
    displayElements.stop_button_tag.value = 'start'
    displayElements.stop_button_tag.innerHTML = 'Start'
    displayElements.pause_button_tag.value = 'pause'
    displayElements.pause_button_tag.innerHTML = 'Pause'
    displayElements.pause_button_tag.disabled = true
    displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
  } else { // Timer is running
    if (!t.timer_control.breaking_flag) { // It is a break time
      if (currentDisplay !== 'break') {
        // Hide the tree image
        displayElements.tree_tag.style.display = 'none'
        // Show the breaking image
        displayElements.breaking_image_tag.style.display = 'block'
        // Update pomo session count
        displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
        // Update the current display mode
        currentDisplay = 'break'
      }
    } else { // It is a pomo time
      if (currentDisplay !== 'pomo') {
        // Hide the breaking image
        displayElements.breaking_image_tag.style.display = 'none'
        // Show the initial tree image
        displayElements.tree_tag.src = '../assets/images/1.jpg'
        displayElements.tree_tag.style.display = 'block'
        currentDisplay = 'pomo'
      } else {
        // Change tree image if it is time for a tree growth step
        const time = t.timer_state.minutes * 60 + t.timer_state.seconds
        if (time % timeStep === 0) {
          let treeImageNumber
          if (time === 0) {
            treeImageNumber = 25
          } else {
            treeImageNumber = 26 - (time / timeStep)
            if (treeImageNumber > 25) { treeImageNumber = 25 } else if (treeImageNumber < 2) { treeImageNumber = 2 }
          }
          displayElements.tree_tag.src = `../assets/images/${treeImageNumber}.jpg`
        }
      }
    }
  }
}

function addTreeToGarden () {
  // Get dimensions and current date
  const gardenTreeWidth = Math.floor(displayElements.tree_tag.clientWidth / 2)
  const gardenTreeHeight = Math.floor(displayElements.tree_tag.clientHeight / 2)
  const currentDate = new Date()

  // Create and append a new tree to the garden
  const times = t.timer_history.at(-1)
  const gardenTree = document.createElement('div')
  gardenTree.setAttribute('class', 'col d-flex justify-content-center text-center')
  gardenTree.innerHTML = `
    <div class="card shadow-lg">
      <img src="${displayElements.tree_tag.src}" alt="growing tree" class="img-fluid garden_tree" width="${gardenTreeWidth}px" height="${gardenTreeHeight}px">
      <div class="card-body p-0 mb-1">
        <p class="card-text">
          <div id="garden_tree_date">
            ${currentDate.toDateString()}
          </div>
          <div id="garden_tree_time">
            <span id="garden_tree_time_start">${helpers.formatedTime(times.start.getHours())}:${helpers.formatedTime(times.start.getMinutes())} - </span>
            <span id="garden_tree_time_end">${helpers.formatedTime(times.end.getHours())}:${helpers.formatedTime(times.end.getMinutes())}</span>
          </div>      
        </p>
      </div>
    </div>
  `
  document.getElementById('garden').appendChild(gardenTree)
  console.log('Added tree to the garden')
}

document.addEventListener('DOMContentLoaded', function () {
  // Create a Bootstrap offcanvas instance
  const myOffcanvas = document.querySelector('#myOffcanvas')
  // eslint-disable-next-line no-undef
  const offcanvas = new bootstrap.Offcanvas(myOffcanvas)
  offcanvas.backdrop = false
  offcanvas.keyboard = false
  offcanvas.scroll = false
  // Display the offcanvas at the top of the screen
  offcanvas.show()
  // Get settings from the offcanvas form
  document.getElementById('settings_form').addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior

    const formData = new FormData(this) // Create a FormData object from the form
    // Access form data and store it in local JavaScript variables
    t.timer_init.m = parseInt(formData.get('pomo_set_minutes'))
    t.timer_init.b_m = parseInt(formData.get('br_set_minutes'))
    t.timer_init.lb_m = parseInt(formData.get('lbr_set_minutes'))
    t.timer_init.b_after = parseInt(formData.get('lbr_after'))
    const switchState = document.getElementById('breaks')
    t.timer_init.pomo_session = !!switchState.checked
    // Hide pomo session section if using it as a simple timer
    if (!t.timer_init.pomo_session) {
      displayElements.pomo_row_card.style.display = 'none'
    }
    timeStep = Math.floor((t.timer_init.m * 60) / 25)
    console.log('Updated settings')
    offcanvas.hide()
    displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_init.m) + ':'
    displayElements.second_tag.innerHTML = '00'
    console.log('Confirmed offcanvas')
  })

  // Add event listeners for buttons
  // Start button
  displayElements.stop_button_tag.addEventListener('click', () => {
    if (displayElements.stop_button_tag.value === 'start') {
      t.start_timer()
      displayElements.stop_button_tag.value = 'stop'
      displayElements.stop_button_tag.innerHTML = 'Stop'
      displayElements.pause_button_tag.disabled = false
    } else {
      t.stop_timer()
      displayElements.stop_button_tag.value = 'start'
      displayElements.stop_button_tag.innerHTML = 'Start'
      displayElements.pause_button_tag.disabled = true
      displayElements.pause_button_tag.value = 'pause'
      displayElements.pause_button_tag.innerHTML = 'Pause'
    }
  })

  // Pause button
  displayElements.pause_button_tag.addEventListener('click', () => {
    if (displayElements.pause_button_tag.value === 'pause') {
      t.pause_timer()
      displayElements.pause_button_tag.value = 'resume'
      displayElements.pause_button_tag.innerHTML = 'Resume'
    } else {
      t.resume_timer()
      displayElements.pause_button_tag.value = 'pause'
      displayElements.pause_button_tag.innerHTML = 'Pause'
    }
  })
})
