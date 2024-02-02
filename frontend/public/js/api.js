// eslint-disable-next-line no-use-before-define
export {
  login, signin, logout,
  getCsrfToken, isAuthenificated,
  // eslint-disable-next-line no-use-before-define
  setAsanaToken, getAsanaToken, getAsanaTasks, getAsanaTasksforUser, BASE_URL,
  markTaskComplitedAsanaServer, markTaskComplitedBackend, sendPomoRecord
}

// Set the real path in production
const BASE_URL = 'http://127.0.0.1:8888/backend/api/'
const LOGIN_URL = BASE_URL + 'auth/login'
const LOGOUT_URL = BASE_URL + 'auth/logout'
const SIGNIN_URL = BASE_URL + 'auth/signin'
const WHOAMI_URL = BASE_URL + 'auth/whoami'
const GETCSRFTOKEN_URL = BASE_URL + 'auth/get_csrf_token'
const ASANATOKEN_URL = BASE_URL + 'asana'
const POMORECORD_URL = BASE_URL + 'pomo'
const SETTASKCOMPLITED = BASE_URL + 'set_task_complited'
const ASANABASEURL = 'https://app.asana.com/api/1.0'

function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

async function signin (signinData) {
  // Set up the new user account and log in the user.

  // Get CSRF token.
  await getCsrfToken()
  // Establish a new user account and log in using its credentials.
  try {
    const bodyData = JSON.stringify(signinData)
    const response = await fetch(SIGNIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: bodyData
    })
    if (!response.ok) {
      console.log('signin API response error: ' + response.status)
      return -1
    }
    console.log('signin API successfull')
    return 0
  } catch (error) {
    console.error('signin API Error:', error)
    return -1
  }
}

async function login (loginData) {
  // Authenticate the user on the server using the provided credentials.

  // Get CSRF token
  await getCsrfToken()

  try {
    const bodyData = JSON.stringify(loginData)
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: bodyData
    })
    if (!response.ok) {
      console.log('login API response error: ' + response.status)
      return -1
    }
    console.log('login API successfull')
    return 0
  } catch (error) {
    console.error('login API Error:', error)
    return -1
  }
}

async function isAuthenificated () {
  // Verify if the user is already authenticated.

  try {
    const response = await fetch(WHOAMI_URL, {
      credentials: 'same-origin' // To transmit cookies.
    })
    if (!response.ok) {
      console.log('Error with whoami request. Response status: ' + response.status)
      return -1
    }
    console.log('WHOAMI API successfull')
    // Verify if the user is authenticated.
    const responseData = await response.json()
    // Retrieve the status.
    const status = responseData.status
    if (status === 'auth') {
      const username = responseData.username
      console.log('WHOAMI API. User is authenticated as ' + username)
      return username
    }
    console.log('WHOAMI API. User is not authenificated')
    return 0
  } catch (error) {
    console.log('Error in whoami API.' + error)
    return -1
  }
}

async function getCsrfToken () {
  // Retrieve the CSRF token from the Django server.
  try {
    const response = await fetch(GETCSRFTOKEN_URL)
    if (!response.ok) {
      console.log('Could not get CSRF token')
      return -1
    }

    console.log('CSRF token API successfull')
    return 0
  } catch (error) {
    console.log('CSRF token api error')
    return -1
  }
}

async function logout () {
  // Log out the user on the server.

  try {
    const response = await fetch(LOGOUT_URL, {
      credentials: 'same-origin' // To transmit cookies.
    })
    if (!response.ok) {
      console.log('Error with logout request. Response status: ' + response.status)
      return -1
    }
    console.log('Logout API successfull')
    return 0
  } catch (error) {
    console.log('Error in logout API.' + error)
    return -1
  }
}

async function setAsanaToken (token) {
  // Store the Asana Personal Access Token (PAT) in the server database.

  try {
    const response = await fetch(ASANATOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      credentials: 'same-origin',
      body: JSON.stringify(token)
    })
    if (!response.ok) {
      console.log('Error with setAsanaToken response: ' + response.status)
      return -1
    }

    const jsonData = await response.json()
    if (jsonData.success) {
      console.log('ASANA API successfull')
      return 0
    }
    console.log('ASANA API server error: ' + jsonData.error)
    return -1
  } catch (error) {
    console.log('ASANA API error: ' + error)
    return -1
  }
}

async function getAsanaToken () {
  // Retrieve the Asana Personal Access Token (PAT) from the server.
  try {
    const response = await fetch(ASANATOKEN_URL, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      credentials: 'same-origin'
    })
    if (!response.ok) {
      console.log('Asana get token error. Response status: ' + response.status)
      return -1
    }
    const data = await response.json()
    return data.api_key
  } catch (error) {
    console.log('Error in asana get token API. Error: ' + error)
    return -1
  }
}

async function getAsanaUserWorkspaces (token) {
  // Fetch a list of the user's workspaces from the Asana API.
  // https://developers.asana.com/reference/getworkspaces
  const url = ASANABASEURL + '/workspaces?' + new URLSearchParams({ limit: '50' })
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.ok) {
      console.log('Error with asana API get users workspaces. Response status: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData.data
  } catch (error) {
    console.log('Asana getAsanaUserWorkspaces error: ' + error)
    return -1
  }
}

async function getAsanaUserTaskList (token, workspaceId) {
  // Retrieve the task list for a user.
  // https://developers.asana.com/reference/getusertasklistforuser
  const url = ASANABASEURL + '/users/me/user_task_list?' + new URLSearchParams({ workspace: workspaceId })
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.ok) {
      console.log('error with asana API get asana user task list. Response status: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('Error with asana API get user task list. error:' + error)
    return -1
  }
}

async function getAsanaTasksFromTasklist (token, userTaskListGid) {
  // Retrieve tasks from a user's task list.
  // https://developers.asana.com/reference/getusertasklistforuser
  const url = `${ASANABASEURL}/user_task_lists/${userTaskListGid}/tasks?${new URLSearchParams({ completed_since: 'now' })}`
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.ok) {
      console.log('Error with asana API get tasks from tasklist. Response status: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('Error with asana API get asana task from task list. error: ' + error)
    return -1
  }
}

async function getAsanaTasks (token) {
  // Return tasks from Asana using the user's Personal Access Token (PAT).
  // [{gid: 'task_gid', name: 'task_name'}, ...]
  // Retrieve the list of workspaces for a user.
  const workspaces = await getAsanaUserWorkspaces(token)
  if (workspaces !== -1) { // If there are no errors.
    const result = []
    for (const workspace of workspaces) {
      // Retrieve the task lists for a user.
      const taskLists = await getAsanaUserTaskList(token, workspace.gid)
      if (taskLists !== -1) { // If there are no errors.
        // Retrieve tasks.
        const tasksData = await getAsanaTasksFromTasklist(token, taskLists.data.gid)
        if (tasksData !== -1) { // If there are no errors.
          // Include tasks in the returned result.
          // const tasks = []
          tasksData.data.forEach((task) => {
            result.push({ gid: task.gid, name: task.name })
          })
        }
      }
    }
    return result
  }
  return -1
}

async function getAsanaTasksforUser () {
  // Retrieve the Asana Personal Access Token (PAT) for the user and fetch tasks from the Asana API.
  // Retrieve the Personal Access Token (PAT) from the server.
  const token = await getAsanaToken()
  if (token === -1) return -1
  // Fetch tasks from the Asana API.
  const tasks = await getAsanaTasks(token)
  if (tasks === -1) return -1
  return tasks
}

async function markTaskComplitedAsanaServer (taskGID) {
  // Mark a task as completed on the Asana server.
  // https://developers.asana.com/reference/updatetask
  const url = `${ASANABASEURL}/tasks/${taskGID}`
  const token = await getAsanaToken()
  if (token === -1) return -1
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ data: { completed: true } })
    })
    if (!response.ok) {
      console.log('Can not set task as complited with asana server')
      return -1
    }
    console.log('Successfully mark task as complited on asana server')
    return 0
  } catch (error) {
    console.log('Error with asana API - complited task.' + error)
    return -1
  }
}

async function markTaskComplitedBackend (taskGID, taskName) {
  // Mark a task as completed on the backend server.
  try {
    const response = await fetch(SETTASKCOMPLITED, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ task_id: taskGID, task_name: taskName })
    })
    if (!response.ok) {
      console.log('Mark task complited backend failed. Response: ' + response.status)
      return -1
    }
    console.log('Successfully mark task on backend as complited')
    return 0
  } catch (error) {
    console.log('Mark task complited backend api error.' + error)
    return -1
  }
}

async function sendPomoRecord (taskHistoryList) {
// Transmit the Pomodoro record to the backend server.
  try {
    const response = await fetch(POMORECORD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      credentials: 'same-origin',
      body: JSON.stringify(taskHistoryList)
    })
    if (!response.ok) {
      console.log('Error with pomo record response: ' + response.status)
      return -1
    }

    const jsonData = await response.json()
    if (!jsonData.error) {
      console.log(jsonData.message)
      return 0
    }
    console.log('Pomo record server error: ' + jsonData.error)
    return -1
  } catch (error) {
    console.log('Pomo record error: ' + error)
    return -1
  }
}
