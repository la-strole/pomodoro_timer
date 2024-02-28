import * as helpers from './helpers.js'
import * as timer from './timer.js'
import * as api from './api.js'

class MyTimer extends timer.TimerClass {
  change_display = runningTimerDisplays
  play_sound = helpers.playSound
  add_tree = addTreeToGarden
  task_history = []
  addTaskToHistory = function (taskObject) {
    this.task_history.push(taskObject)
  }
}
const taskOperations = {
  currentTask: null,

  createTask: function (source) {
    if (!this.currentTask) {
      this.currentTask = {
        taskId: asanaDomElements.taskName_tag.dataset.id,
        taskName: asanaDomElements.taskName_tag.innerHTML,
        time: { start: Date.now(), end: null }
      }
      console.log(`Start task from ${source}. Current task: ${JSON.stringify(this.currentTask)}. 
      Task history: ${JSON.stringify(t.task_history)}`)
    } else {
      throw new Error(`taskOperations: Can not create new task. Current task is not null. Source: ${source}`)
    }
  },
  finishTask: function (source) {
    if (this.currentTask !== null) {
      this.currentTask.time.end = Date.now()
      t.addTaskToHistory(this.currentTask)
      console.log(`Finish task from ${source}. Current task: ${JSON.stringify(this.currentTask)}. 
      Task history: ${JSON.stringify(t.task_history)}`)
      this.currentTask = null
    } else {
      throw new Error(`taskOperations: Can not finish task. Current task is null. Source: ${source}`)
    }
  }
}
const t = new MyTimer()
window.current_timer = t // For testing purposes
// Time step in seconds to grow the tree.
let timeStep
let currentDisplay = '' // 'pomo' or 'break'.

let isAuthentificated = false
let logoutOrCloseFlag = false

const navBar = {
  loginLink: document.querySelector('#navLoginLink'),
  logoutLink: document.querySelector('#navLogoutLink'),
  detailsLink: document.querySelector('#navDetails'),
  username: document.querySelector('#navUserName'),

  showLoginLink: function () {
    this.loginLink.style.display = 'block'
  },

  hideLoginLink: function () {
    this.loginLink.style.display = 'none'
  },

  showLogoutLink: function () {
    this.logoutLink.style.display = 'block'
  },

  hideLogoutLink: function () {
    this.logoutLink.style.display = 'none'
  },

  showDetailsLink: function () {
    this.detailsLink.classList.remove('disabled')
  },

  hideDetailsLink: function () {
    this.detailsLink.classList.add('disabled')
  },

  setUsername: function (username) {
    this.username.innerHTML = username
  },

  clearUsername: function () {
    this.username.innerHTML = ''
  }
}

const asanaDomElements = {
  asanaDropdownButton: document.querySelector('#asana_task_dropdown'),
  asanaTasksNumberBadge: document.querySelector('#asana_task_number'),
  asanaList: document.querySelector('#asana_tasks_list'),
  taskName_tag: document.querySelector('#taskNameHeader'),
  taskNameCompleteButton: document.querySelector('#taskCompleteButton'),

  addAsanaTaskToList: function (number, taskGid, taskName) {
    if (isAuthentificated) {
      const rowNumber = document.createElement('td')
      rowNumber.innerHTML = number
      const taskListItem = document.createElement('td')
      taskListItem.classList.add('task-item')
      taskListItem.dataset.id = taskGid
      taskListItem.innerHTML = taskName
      const listItem = document.createElement('tr')
      listItem.classList.add('row-task')
      listItem.dataset.id = taskGid

      listItem.appendChild(rowNumber)
      listItem.appendChild(taskListItem)
      this.asanaList.appendChild(listItem)
    }
  },

  clearAsanaTaskList: function () {
    this.asanaList.innerHTML = ''
  },

  showAsanaDropdownButton: function () {
    if (isAuthentificated) {
      this.asanaDropdownButton.style.display = 'inline'
    }
  },

  hideAsanaDropdownButton: function () {
    this.asanaDropdownButton.style.display = 'none'
  },

  changeAsanaTaskNumber: function (taskNumber) {
    if (isAuthentificated) {
      this.asanaTasksNumberBadge.innerHTML = taskNumber
    }
  },

  showtaskTag: function () {
    if (isAuthentificated) {
      this.taskName_tag.style.display = 'inline-block'
    }
  },

  hideTaskTag: function () {
    this.taskName_tag.style.display = 'none'
    this.taskNameCompleteButton.style.display = 'none'
  },

  deleteTaskTag: function () {
    this.taskName_tag.innerHTML = ''
    this.taskName_tag.dataset.id = 'null'
    this.taskNameCompleteButton.style.display = 'none'
  },

  updateTaskTag: function (taskId, taskName) {
    if (isAuthentificated) {
      this.taskName_tag.innerHTML = taskName
      this.taskName_tag.dataset.id = taskId
    }
  },

  updateTasksListDropdownMenu: function (asanaTasksList) {
    if (isAuthentificated) {
      asanaDomElements.showAsanaDropdownButton()
      asanaDomElements.changeAsanaTaskNumber(asanaTasksList.length)
      // Empty the dropdown tasks list.
      asanaDomElements.clearAsanaTaskList()
      // Include the initial empty task.
      asanaDomElements.addAsanaTaskToList(0, 'null', '--------')
      // Incorporate tasks from the Asana server.
      for (let i = 0; i < asanaTasksList.length; i++) {
        asanaDomElements.addAsanaTaskToList(i + 1, asanaTasksList[i].gid, asanaTasksList[i].name)
      }
      // Attach event listeners for the dropdown Asana tasks.
      const asanaTasks = document.querySelectorAll('.row-task')
      asanaTasks.forEach(rowtask => {
        rowtask.addEventListener('click', () => {
          const taskData = rowtask.querySelector('.task-item')
          // Update the task Tag.
          asanaDomElements.updateTaskTag(taskData.dataset.id, taskData.innerHTML)
          // Show the task tag if it is not empty.
          if (taskData.dataset.id !== 'null') {
            asanaDomElements.showtaskTag()
            asanaDomElements.taskNameCompleteButton.style.display = 'block'
          } else {
            asanaDomElements.hideTaskTag()
          }

          // Include the task's start time in the task history list if the timer is in the running Pomodoro state.
          if (!t.timer_control.stop_flag && t.timer_control.breaking_flag && !t.timer_control.pause_flag) {
            // Finish the task.
            taskOperations.finishTask('Task is clicked from the dropdown Asana tasks list')
            // Create the task.
            taskOperations.createTask('Task is clicked from the dropdown Asana tasks list')
          }
        })
      })
    }
  }
}

const displayElements = {
  minute_tag: document.querySelector('#minute'),
  second_tag: document.querySelector('#second'),
  tree_tag: document.querySelector('#current_tree'),
  breaking_image_tag: document.querySelector('#breaking_time'),
  pause_button_tag: document.querySelector('#btn_pause'),
  stop_button_tag: document.querySelector('#btn_stop'),
  pomo_in_row_count_tag: document.querySelector('#row_pomo_number'),
  hidePomoInRowCount: function () {
    displayElements.pomo_in_row_count_tag.style.display = 'none'
  },
  showPomoInRowCount: function () {
    displayElements.pomo_in_row_count_tag.style.display = 'block'
  }

}

function sendPomoRecord () {
  // Transmit the Pomodoro record to the backend server.
  // Generate a JSON body.
  if (isAuthentificated) {
    const jsonBody = {
      pomo: { isFullPomo: false, pomoInRow: 0 },
      tasksList: []
    }
    t.task_history.forEach(taskRecord => {
      const jsonRecord = {
        taskId: taskRecord.taskId,
        taskName: taskRecord.taskName,
        timeSpent: Math.round((taskRecord.time.end - taskRecord.time.start) / 1000) // seconds from milliseconds
      }
      jsonBody.tasksList.push(jsonRecord)
    })
    t.task_history = []
    // Set the task name tag to its default value.
    console.log('Clear the task history when pomodoro data sent to the backend server.')
    jsonBody.pomo.isFullPomo = t.timer_history.at(-1).isFullPomo
    jsonBody.pomo.pomoInRow = t.timer_state.pomo_session_count
    api.sendPomoRecord(jsonBody)
    // Refresh/update the task list from the Asana server.
    // 1 Retrieve Asana tasks.
    if (!logoutOrCloseFlag) {
      console.log('Refresh/update the task list from the Asana server.')
      api.getAsanaTasksforUser().then((tasks) => {
        // 2 Modify the DOM.
        if (tasks !== -1) {
          asanaDomElements.updateTasksListDropdownMenu(tasks)
        }
      })
    }
  }
}

// This function overrides the timer class's changeDisplay function and runs every second.
// It is also executed when the timer is initiated.
function runningTimerDisplays () {
  // Always modify the document title and adjust the Pomodoro time.
  document.title = `${helpers.formatedTime(t.timer_state.minutes)}:${helpers.formatedTime(t.timer_state.seconds)}`
  displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_state.minutes) + ':'
  displayElements.second_tag.innerHTML = helpers.formatedTime(t.timer_state.seconds)

  // If the timer is stopped due to stop button clicked or the timer running out without a Pomodoro session.
  // then initialize the tree and update the buttons accordingly.
  if (t.timer_control.stop_flag) {
    if (isAuthentificated && (t.timer_control.breaking_flag || !t.timer_init.pomo_session)) {
      if (!t.timer_control.pause_flag) {
        taskOperations.finishTask('Stop event (stop button clicked or timer running out (if no pomodoro session)).')
      }
      sendPomoRecord()
    }
    // Conceal the image for the breaking time.
    displayElements.breaking_image_tag.style.display = 'none'
    // Display the original current tree image.
    displayElements.tree_tag.src = '../assets/images/1.jpg'
    displayElements.tree_tag.style.display = 'block'
    // Modify the state of the buttons if the timer stops due to time elapsing and there is no ongoing Pomodoro session.
    displayElements.stop_button_tag.value = 'start'
    displayElements.stop_button_tag.innerHTML = 'Start'
    displayElements.pause_button_tag.value = 'pause'
    displayElements.pause_button_tag.innerHTML = 'Pause'
    displayElements.pause_button_tag.disabled = true
    // Modify pomo in raw state.
    displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
  } else { // If the timer is running.
    // If it is breaking time.
    if (!t.timer_control.breaking_flag) {
      if (currentDisplay !== 'break') {
        if (isAuthentificated) {
          // Finish current task.
          taskOperations.finishTask('Breaking time of display function')
          // Send the Pomodoro record to the backend server.
          sendPomoRecord()
        }
        // Conceal the tree image.
        displayElements.tree_tag.style.display = 'none'
        // Show breaking image.
        displayElements.breaking_image_tag.style.display = 'block'
        // Update pomo in raw state.
        displayElements.pomo_in_row_count_tag.innerHTML = `${t.timer_state.pomo_session_count} pomodoro in a row`
        // Modify the breaking display flag to prevent overwriting DOM elements every second.
        currentDisplay = 'break'
      }
    } else { // If it is pomo time.
      // If the timer is currently active during a Pomodoro session.
      // If it's the initial Pomodoro session.
      if (currentDisplay !== 'pomo') {
        if (isAuthentificated) {
          // Append the current task to the task history and include the task start time.
          taskOperations.createTask('Pomo time Runningdisplay function')
        }
        // Conceal the image for the breaking time.
        displayElements.breaking_image_tag.style.display = 'none'
        // Display the original current tree image.
        displayElements.tree_tag.src = '../assets/images/1.jpg'
        displayElements.tree_tag.style.display = 'block'
        currentDisplay = 'pomo'
      } else {
        // Update the tree image if the time step is reached.
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
  // Retrieve the current tree image.

  const gardenTreeWidth = Math.floor(displayElements.tree_tag.clientWidth / 2)
  const gardenTreeHeight = Math.floor(displayElements.tree_tag.clientHeight / 2)
  const currentDate = new Date()

  // Include a new tree in the garden.
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
  console.log('Add tree to the garden.')
}

function anonimousState () {
  // Retrieve the state of the navbar and Asana elements as anonymous state.
  isAuthentificated = false
  navBar.showLoginLink()
  navBar.hideLogoutLink()
  navBar.hideDetailsLink()
  navBar.clearUsername()
  asanaDomElements.clearAsanaTaskList()
  asanaDomElements.hideAsanaDropdownButton()
  asanaDomElements.changeAsanaTaskNumber('')
  asanaDomElements.deleteTaskTag()
}

function userState (username, asanaTasksList) {
  // Establish the navbar and Asana DOM elements as user state.
  // username - the username.
  // asanaTasksList - a list containing objects with properties task.gid and task.name.
  isAuthentificated = true
  navBar.hideLoginLink()
  navBar.showLogoutLink()
  navBar.setUsername(username)
  navBar.showDetailsLink()
  document.getElementById('garden').innerHTML = ''
  if (asanaTasksList !== -1 && asanaTasksList.length !== 0) {
    // Incorporate Asana tasks into the dropdown list of tasks.
    asanaDomElements.updateTasksListDropdownMenu(asanaTasksList)
  } else console.log('dom_manipulation.userState(): asanaTasksList length === 0')
}

async function completeTaskButtonClick () {
  console.log('Task completed.')

  // 0. Save information about the task to send it to servers.
  const taskGID = asanaDomElements.taskName_tag.dataset.id
  const taskName = asanaDomElements.taskName_tag.innerHTML
  // Assign the task tag to the default task value.
  asanaDomElements.deleteTaskTag()
  // If the "Complete Task" button is clicked during running time,
  // assign the end time to the current task in the task history list.
  if ((t.timer_control.breaking_flag && !t.timer_control.stop_flag && !t.timer_control.pause_flag)) {
    taskOperations.finishTask('The task complete button is clicked')
    // Temporarily select the default task before the user chooses another.
    taskOperations.createTask('Temporarily add a null task when the complete button is clicked')
  }
  // 1 Send information to the Asana server.
  await api.markTaskCompletedAsanaServer(taskGID)
  // 2 Transmit information to the backend server.
  await api.markTaskCompletedBackend(taskGID, taskName)
  // 3 Refresh/update the task list.
  // 3.1 Retrieve Asana tasks.
  const tasks = await api.getAsanaTasksforUser()
  console.log('Tasks updated.')
  // 3.2 Modify the DOM.
  asanaDomElements.updateTasksListDropdownMenu(tasks)
  // 4 Display the task table for reviewing new tasks.
  // eslint-disable-next-line no-undef
  const dropDownTasks = new bootstrap.Dropdown(asanaDomElements.asanaDropdownButton)
  dropDownTasks.toggle()
}

document.addEventListener('DOMContentLoaded', function () {
  currentDisplay = '' // 'pomo' or 'break'.
  // Send the task to the backend server when the tab or window is closed.

  window.addEventListener('beforeunload', function (e) {
    // If the "Close" button is clicked during running time,
    // assign the end time to the current task in the task history list.
    if ((t.timer_control.breaking_flag && !t.timer_control.stop_flag && !t.timer_control.pause_flag && isAuthentificated)) {
      logoutOrCloseFlag = true
      displayElements.stop_button_tag.click()
    }
  })

  // Create a Bootstrap offcanvas component for timer settings.
  const myOffcanvas = document.querySelector('#myOffcanvas')
  // eslint-disable-next-line no-undef
  const settingsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)
  settingsOffcanvas.backdrop = false
  settingsOffcanvas.keyboard = false
  settingsOffcanvas.scroll = false
  // Run settings offcanvas on the top of the screen.
  settingsOffcanvas.show()
  // Retrieve settings from the offcanvas form.
  document.getElementById('settings_form').addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior.

    const formData = new FormData(this) // Create a FormData object from the form
    // Retrieve the data from the form and save it in local JavaScript variables.
    t.timer_init.m = parseInt(formData.get('pomo_set_minutes'))
    t.timer_init.b_m = parseInt(formData.get('br_set_minutes'))
    t.timer_init.lb_m = parseInt(formData.get('lbr_set_minutes'))
    t.timer_init.b_after = parseInt(formData.get('lbr_after'))
    const swichState = document.getElementById('breaks')
    t.timer_init.pomo_session = swichState.checked
    timeStep = Math.floor((t.timer_init.m * 60) / 25)
    console.log('Settings updated.')
    settingsOffcanvas.hide()
    if (swichState.checked) {
      displayElements.showPomoInRowCount()
    } else {
      displayElements.hidePomoInRowCount()
    }
    displayElements.minute_tag.innerHTML = helpers.formatedTime(t.timer_init.m) + ':'
    displayElements.second_tag.innerHTML = '00'
    console.log('Offcanvas confirmed.')
  })

  // 1. Verify whether the user is already signed in.
  api.isAuthenificated()
    .then((username) => {
      if (username !== 0 && username !== -1) { // If the user is already signed in.
        console.log('User is already signed in as ' + username)
        // Retrieve Asana tasks.
        api.getAsanaTasksforUser()
          .then((tasks) => {
            // Modify the DOM.
            userState(username, tasks)
          })
      } else {
        anonimousState()
      }
    })

  // 2. Configure the offcanvas for login and sign-in forms.
  const offacnvasLogin = document.querySelector('#offcanvasLogin')
  const offcanvasSignin = document.querySelector('#offcanvasSignIn')
  // eslint-disable-next-line no-undef
  const loginOffcanvas = new bootstrap.Offcanvas(offacnvasLogin)
  // eslint-disable-next-line no-undef
  const signinOffcanvas = new bootstrap.Offcanvas(offcanvasSignin)
  loginOffcanvas.backdrop = false
  loginOffcanvas.keyboard = false
  loginOffcanvas.scroll = false
  signinOffcanvas.backdrop = false
  signinOffcanvas.keyboard = false
  signinOffcanvas.scroll = false

  // 3. Establish functionality for the Navbar and authentication elements on the main page.
  // 3.1 Login link
  navBar.loginLink.addEventListener('click', () => {
    // Display the Login offcanvas.
    loginOffcanvas.show()
  })
  // 3.2 Logout Link
  navBar.logoutLink.addEventListener('click', async function () {
    logoutOrCloseFlag = true
    // Transmit the Pomodoro record to the backend server.
    // If the "Logout" link is clicked during running time,
    if ((t.timer_control.breaking_flag && !t.timer_control.stop_flag && !t.timer_control.pause_flag)) {
      console.log('Simulate Stop button clicking when the "logout" event occurs. ' + JSON.stringify(t.task_history))
      // Send the Pomodoro record to the backend server.
      displayElements.stop_button_tag.click()
    }
    // Log out the user on the server using the API.
    const reslult = await api.logout()
    if (reslult !== -1) {
      // Modify the DOM nav menu.
      anonimousState()
      document.getElementById('garden').innerHTML = ''
      alert('Logged out successfully')
    } else {
      alert('Can not logout. Please connect to site administrator.')
    }
  })
  // 3.3 Implement functionality for the sign-in link.
  document.querySelector('#signInLink').addEventListener('click', () => {
    loginOffcanvas.hide()
    signinOffcanvas.show()
  })
  // 3.4 Provide the option to return to the Login view from the Sign-in view.
  document.querySelector('#backToLoginPage').addEventListener('click', () => {
    signinOffcanvas.hide()
    loginOffcanvas.show()
  })
  // 3.5 Toggle the visibility of passwords in input fields.
  const showPasswordButtons = document.querySelectorAll('.showPasswordButton')
  showPasswordButtons.forEach(element => {
    element.addEventListener('click', function () {
      const passwordInput = this.parentElement.querySelector('input')
      helpers.changePasswordVisability(passwordInput)
    })
  })

  // 4. Implement the Sign-in functionality, sign in a new user, and update the DOM accordingly.
  document.querySelector('#signInForm').addEventListener('submit', async function (event) {
    // 4.1 Prevent the default form submission behavior.
    event.preventDefault()

    // 4.2 Retrieve user credentials.
    const formData = new FormData(this) // Create a FormData object from the form.
    const authJsonData = { username: formData.get('username'), password: formData.get('password') }
    const asanaPatData = formData.get('asanaAPI')

    // 4.3 Authenticate and sign in a new user on the backend server.
    const result = await api.signin(authJsonData)
    if (result === 0) {
      currentDisplay = ''
      // Transmit the Asana Personal Access Token (PAT) to the server.
      const asanaResponse = await api.setAsanaToken(asanaPatData)
      if (asanaResponse === 0) {
        console.log('Successfully sent Asana PAT.')
        // 4.4 Update the DOM with Asana tasks.
        // Retrieve Asana tasks.
        const asanaTasks = await api.getAsanaTasks(formData.get('asanaAPI'))
        userState(formData.get('username'), asanaTasks)
      } else { userState(formData.get('username'), []) } // Update the DOM without including Asana tasks.
      signinOffcanvas.hide()
    } else {
      if (result === -1) {
        alert('Can not sign in. Try to connect with site administrator')
      } else {
        alert(`Can not sign in. ${result}`)
      }
    }
  })

  // 5. Implement the login functionality, log in the user, and update the DOM accordingly.
  document.querySelector('#logInForm').addEventListener('submit', async function (event) {
    // 5.1 Prevent the default form submission behavior
    event.preventDefault()

    // 5.2 Retrieve user credentials.
    const formData = new FormData(this) // Create a FormData object from the form
    const jsonData = { username: formData.get('username'), password: formData.get('password') }

    // 5.3 Authenticate and log in the user on the backend server.
    const result = await api.login(jsonData)

    if (result !== -1) {
      currentDisplay = ''
      logoutOrCloseFlag = false
      // 5.4 Retrieve Asana tasks.
      const tasks = await api.getAsanaTasksforUser()
      // 5.5 Modify the DOM.
      userState(formData.get('username'), tasks)
      loginOffcanvas.hide()
    } else {
      alert('Can not log in. Try to connect with site administrator')
    }
  })

  // 6. Conceal the current task tag.
  asanaDomElements.deleteTaskTag()

  // 7. Establish the functionality for the task completion button.
  asanaDomElements.taskNameCompleteButton.addEventListener('click', completeTaskButtonClick)

  // Incorporate timer event listeners.
  // Start button functionality.
  displayElements.stop_button_tag.addEventListener('click', () => {
    // If the button is the start button.
    if (displayElements.stop_button_tag.value === 'start') {
      t.start_timer()
      displayElements.stop_button_tag.value = 'stop'
      displayElements.stop_button_tag.innerHTML = 'Stop'
      displayElements.pause_button_tag.disabled = false
    } else {
      t.stop_timer()
      currentDisplay = ''
      displayElements.stop_button_tag.value = 'start'
      displayElements.stop_button_tag.innerHTML = 'Start'
      displayElements.pause_button_tag.disabled = true
      displayElements.pause_button_tag.value = 'pause'
      displayElements.pause_button_tag.innerHTML = 'Pause'
    }
  })

  // Pause button functionality.
  displayElements.pause_button_tag.addEventListener('click', () => {
    // If the button is the pause button.
    if (displayElements.pause_button_tag.value === 'pause') {
      t.pause_timer()
      if (t.timer_control.breaking_flag && isAuthentificated) {
        // Assign the end time to the current task.
        taskOperations.finishTask('Pause button is clicked while pomodoro is running')
      }
      displayElements.pause_button_tag.value = 'resume'
      displayElements.pause_button_tag.innerHTML = 'Resume'
    } else {
      t.resume_timer()
      if (t.timer_control.breaking_flag && isAuthentificated) {
      // Append the current task to the task history and include the task start time.
        taskOperations.createTask('Resume button is clicked while pomodoro time')
      }
      displayElements.pause_button_tag.value = 'pause'
      displayElements.pause_button_tag.innerHTML = 'Pause'
    }
  })
})
