import * as api from './api.js'

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

  addAsanaTaskToList: function (number, taskGid, taskName) {
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
  },

  clearAsanaTaskList: function () {
    this.asanaList.innerHTML = ''
  },

  showAsanaDropdownButton: function () {
    this.asanaDropdownButton.style.display = 'inline'
  },

  hideAsanaDropdownButton: function () {
    this.asanaDropdownButton.style.display = 'none'
  },

  changeAsanaTaskNumber: function (taskNumber) {
    this.asanaTasksNumberBadge.innerHTML = taskNumber
  }

}

function anonimousState () {
  // Set the state of navbar and asana elements as anonimous state
  navBar.showLoginLink()
  navBar.hideLogoutLink()
  navBar.hideDetailsLink()
  navBar.clearUsername()
  asanaDomElements.clearAsanaTaskList()
  asanaDomElements.hideAsanaDropdownButton()
  asanaDomElements.changeAsanaTaskNumber('')
  asanaDomElements.taskName_tag.innerHTML = ''
  asanaDomElements.taskName_tag.dataset.id = ''
}

function userState (username, asanaTasksList) {
  // Set navbar and asana DOM elements as user state
  // username - the username
  // asanaTasksList - the list of objects task.gid, task.name
  navBar.hideLoginLink()
  navBar.showLogoutLink()
  navBar.setUsername(username)
  navBar.showDetailsLink()
  if (asanaTasksList.length !== 0) {
    asanaDomElements.showAsanaDropdownButton()
    asanaDomElements.changeAsanaTaskNumber(asanaTasksList.length)
    asanaDomElements.addAsanaTaskToList(0, 'null', '--------')
    for (let i = 0; i < asanaTasksList.length; i++) {
      asanaDomElements.addAsanaTaskToList(i + 1, asanaTasksList[i].gid, asanaTasksList[i].name)
    }
    // Add event listeners for asana tasks list buttons
    const asanaTasks = document.querySelectorAll('.row-task')
    asanaTasks.forEach(rowtask => {
      rowtask.addEventListener('click', () => {
        const taskData = rowtask.querySelector('.task-item')
        if (taskData.dataset.id !== 'null') {
          asanaDomElements.taskName_tag.innerHTML = taskData.innerHTML
          asanaDomElements.taskName_tag.dataset.id = taskData.dataset.id
        } else {
          asanaDomElements.taskName_tag.innerHTML = ''
          asanaDomElements.taskName_tag.dataset.id = ''
        }
      })
    })
  } else console.log('dom_manipulation.userState(): asanaTasksList length === 0')
}

function changePasswordVisability (passwordInputElement) {
  // Change password visibility for DOM input passwords
  if (passwordInputElement.type === 'password') {
    passwordInputElement.type = 'text'
    passwordInputElement.parentElement.querySelector('span').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
  </svg>`
  } else {
    passwordInputElement.type = 'password'
    passwordInputElement.parentElement.querySelector('span').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
    <path
      d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
    />
  </svg>`
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Pipeline for display DOM elements

  // 1. Check if user is already signed in
  api.isAuthenificated()
    .then((username) => {
      if (username !== 0 && username !== -1) { // If user is already signed in
        console.log('User is already signed in as ' + username)
        // Get Asana tasks
        api.getAsanaTasksforUser()
          .then((tasks) => {
            // Change DOM
            userState(username, tasks)
          })
      } else {
        anonimousState()
      }
    })

  // 2. Set offcanvas for login and signin forms
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

  // 3. Set Nav Bar and main page's auth elements functionality
  // 3.1 Login link
  document.querySelector('#navLoginLink').addEventListener('click', () => {
    // Show Login offcanvas
    loginOffcanvas.show()
  })
  // 3.2 Logout Link
  document.querySelector('#navLogoutLink').addEventListener('click', async function () {
    // Logout user on server with API
    const reslult = await api.logout()
    if (reslult !== -1) {
      // Change DOM nav menu
      anonimousState()
      alert('Logged out successfully')
    } else {
      alert('Can not logout. Please connect to site administrator.')
    }
  })
  // 3.3 Signin link functionality
  document.querySelector('#signInLink').addEventListener('click', () => {
    loginOffcanvas.hide()
    signinOffcanvas.show()
  })
  // 3.4 Return to Login from Signin view
  document.querySelector('#backToLoginPage').addEventListener('click', () => {
    signinOffcanvas.hide()
    loginOffcanvas.show()
  })
  // 3.5 Show - Hide passwords in input fields
  const showPasswordButtons = document.querySelectorAll('.showPasswordButton')
  showPasswordButtons.forEach(element => {
    element.addEventListener('click', function () {
      const passwordInput = this.parentElement.querySelector('input')
      changePasswordVisability(passwordInput)
    })
  })

  // 4. Sigin functionality. Sign in new user and make DOM changes
  document.querySelector('#signInForm').addEventListener('submit', async function (event) {
    // 4.1 Prevent the default form submission behavior
    event.preventDefault()

    // 4.2 Get user credentials
    const formData = new FormData(this) // Create a FormData object from the form
    const authJsonData = { username: formData.get('username'), password: formData.get('password') }
    const asanaPatData = { api_key: formData.get('asanaAPI') }

    // 4.3 Sign in new user on the backend server
    const result = await api.signin(authJsonData)
    if (result !== -1) {
      // Send Asana PAT to the server
      const asanaResponse = await api.setAsanaToken(asanaPatData)
      if (asanaResponse === 0) {
        console.log('Successfully sent Asana PAT')
        // 4.4 Change Dom with Asana tasks
        // Get asana tasks
        const asanaTasks = await api.getAsanaTasks(formData.get('asanaAPI'))
        userState(formData.get('username'), asanaTasks)
      } else { userState(formData.get('username'), []) } // Change DOM without asana tasks
      signinOffcanvas.hide()
    } else {
      alert('Can not sign in. Try to connect with site administrator')
    }
  })

  // 5. Login functionality. Login user and make DOM changes
  document.querySelector('#logInForm').addEventListener('submit', async function (event) {
    // 5.1 Prevent the default form submission behavior
    event.preventDefault()

    // 5.2 Get user credentials
    const formData = new FormData(this) // Create a FormData object from the form
    const jsonData = { username: formData.get('username'), password: formData.get('password') }

    // 5.3 Log in user on the backend server
    const result = await api.login(jsonData)

    if (result !== -1) {
      // 5.4 Get Asana tasks
      const tasks = await api.getAsanaTasksforUser()
      console.log(`tasks from login auth.js: ${tasks}`)
      // 5.5 Change DOM
      userState(formData.get('username'), tasks)
      loginOffcanvas.hide()
    } else {
      alert('Can not log in. Try to connect with site administrator')
    }
  })
})
