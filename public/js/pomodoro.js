import * as helpers from './helpers.js'
import * as timer from './timer.js'

class MyTimer extends timer.TimerClass {
  change_display = runningTimerDisplays
  play_sound = helpers.playSound
  add_tree = addTreeToGarden
}
const t = new MyTimer()
// Time step in seconds to grow tree
let timeStep
let currentDisplay = '' // 'pomo' or 'break'

window.current_timer = t

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
  // Change title and pomodoro time (do it always)
  document.title = `${helpers.formatedTime(t.timer_state.minutes)}:${helpers.formatedTime(t.timer_state.seconds)}`
  displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_state.minutes) + ':'
  displayElements.second_tag.innerHTML = helpers.formatedTime(t.timer_state.seconds)

  // If timer stopped by button or by time without pomo session - initialize tree and change buttons
  if (t.timer_control.stop_flag) {
    // Hide breaking image
    displayElements.breaking_image_tag.style.display = 'none'
    // Show initial current tree image
    displayElements.tree_tag.src = '../assets/images/1.jpg'
    displayElements.tree_tag.style.display = 'block'
    // Change buttons state if timer stoped by time and thereis no pomo session
    displayElements.stop_button_tag.value = 'start'
    displayElements.stop_button_tag.innerHTML = 'Start'
    displayElements.pause_button_tag.value = 'pause'
    displayElements.pause_button_tag.innerHTML = 'Pause'
    displayElements.pause_button_tag.disabled = true
    // Change pomo in raw state
    displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
  } else { // If timer is running
    // If it is breaking time
    if (!t.timer_control.breaking_flag) {
      if (currentDisplay !== 'break') {
        // Hide tree image
        displayElements.tree_tag.style.display = 'none'
        // Show breaking image
        displayElements.breaking_image_tag.style.display = 'block'
        // Change pomo in raw state
        displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
        // Change Breaking display flag (to not override DOM elements ebery second)
        currentDisplay = 'break'
      }
    } else { // If it is pomo time
      // If timer is running in pomo
      // If it is initial pomo
      if (currentDisplay !== 'pomo') {
        // Hide breaking image
        displayElements.breaking_image_tag.style.display = 'none'
        // Show initial current tree image
        displayElements.tree_tag.src = '../assets/images/1.jpg'
        displayElements.tree_tag.style.display = 'block'
        currentDisplay = 'pomo'
      } else {
        // Change tree image if it is timestep
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
  // Get current tree image

  const gardenTreeWidth = Math.floor(displayElements.tree_tag.clientWidth / 2)
  const gardenTreeHeight = Math.floor(displayElements.tree_tag.clientHeight / 2)
  const currentDate = new Date()

  // Add new tree to the garden
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
              <div id=""garden_tree_time>
                  <span id="garden_tree_time_start">${helpers.formatedTime(times.start.getHours())}:${helpers.formatedTime(times.start.getMinutes())} - </span>
                  <span id="garden_tree_time_end">${helpers.formatedTime(times.end.getHours())}:${helpers.formatedTime(times.end.getMinutes())}</span>
              </div>      
          </div>
          </div>
      `
  document.getElementById('garden').appendChild(gardenTree)
  console.log('Add tree to the garden')
}

document.addEventListener('DOMContentLoaded', function () {
  // Create bootstrap offcanvas instance
  const myOffcanvas = document.querySelector('#myOffcanvas')
  // eslint-disable-next-line no-undef
  const offcanvas = new bootstrap.Offcanvas(myOffcanvas)
  offcanvas.backdrop = false
  offcanvas.keyboard = false
  offcanvas.scroll = false
  // Run offcanvas on the top of the screen
  offcanvas.show()
  // Get settings from offcanvas form
  document.getElementById('settings_form').addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior

    const formData = new FormData(this) // Create a FormData object from the form
    // Access form data and store it in local JavaScript variables
    t.timer_init.m = parseInt(formData.get('pomo_set_minutes'))
    t.timer_init.b_m = parseInt(formData.get('br_set_minutes'))
    t.timer_init.lb_m = parseInt(formData.get('lbr_set_minutes'))
    t.timer_init.b_after = parseInt(formData.get('lbr_after'))
    const swichState = document.getElementById('breaks')
    t.timer_init.pomo_session = !!swichState.checked
    // Delete pomo in line section if use as timer
    if (!t.timer_init.pomo_session) {
      displayElements.pomo_row_card.style.display = 'none'
    }
    timeStep = Math.floor((t.timer_init.m * 60) / 25)
    console.log('Settings updated')
    offcanvas.hide()
    displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_init.m) + ':'
    displayElements.second_tag.innerHTML = '00'
    console.log('Offcanvas confirmed')
  })

  // Add Event listeners
  // Start button
  displayElements.stop_button_tag.addEventListener('click', () => {
    // If it is start button
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
    // If it is pause button
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
