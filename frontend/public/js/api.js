// eslint-disable-next-line no-use-before-define
export {
  login, signin, logout,
  getCsrfToken, isAuthenificated,
  setAsanaToken, getAsanaToken, getAsanaTasks, getAsanaTasksforUser, BASE_URL
}

// Set the real path in production
const BASE_URL = 'http://127.0.0.1:8888/backend/api/'
const LOGIN_URL = BASE_URL + 'auth/login'
const LOGOUT_URL = BASE_URL + 'auth/logout'
const SIGNIN_URL = BASE_URL + 'auth/signin'
const WHOAMI_URL = BASE_URL + 'auth/whoami'
const GETCSRFTOKEN_URL = BASE_URL + 'auth/get_csrf_token'
const ASANATOKEN_URL = BASE_URL + 'asana'
const ASANABASEURL = 'https://app.asana.com/api/1.0'

function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

async function signin (signinData) {
  // Create the new user account and login the user

  // Get CSRF token
  await getCsrfToken()
  // Create new user account and login with it's credentials
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
  // login user on server with given credentials

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
  // Check if the user is already authenticated

  try {
    const response = await fetch(WHOAMI_URL, {
      credentials: 'same-origin' // to send cookies
    })
    if (!response.ok) {
      console.log('Error with whoami request. Response status: ' + response.status)
      return -1
    }
    console.log('WHOAMI API successfull')
    // Check if user is authenificated
    const responseData = await response.json()
    // Get status
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
  // Get the CSRF token from django server
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
  // Logout the user on server

  try {
    const response = await fetch(LOGOUT_URL, {
      credentials: 'same-origin' // to send cookies
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
  // Save asana PAT to the database on server

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
  // Get Asana PAT from server

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
  // Get list of user's workspaces from Asana API
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
  // Get a user's task list
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
  // Get tasks from a user task list
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
  // Retrurn tasks from asana with user's PAT
  // [{gid: 'task_gid', name: 'task_name'}, ...]
  // Get users workspaces (list of workspaces)
  const workspaces = await getAsanaUserWorkspaces(token)
  console.log(`workspaces: ${workspaces}`)
  if (workspaces !== -1) { // If no errors
    const result = []
    for (const workspace of workspaces) {
      // Get users task lists
      const taskLists = await getAsanaUserTaskList(token, workspace.gid)
      if (taskLists !== -1) { // If no errors
        // Get tasks
        const tasksData = await getAsanaTasksFromTasklist(token, taskLists.data.gid)
        if (tasksData !== -1) { // If no errors
          // Add tasks to returned result
          // const tasks = []
          tasksData.data.forEach((task) => {
            // tasks.push({ gid: task.gid, name: task.name })
            result.push({ gid: task.gid, name: task.name })
          })
          // result.push({ workspaceName: workspace.name, workspaceTasks: tasks })
        }
      }
    }
    console.log(`rsult from get asana tasks = ${result}`)
    return result
  }
  return -1
}

async function getAsanaTasksforUser () {
  // Get Asana PAT for user and get tasks from asana API
  // Get PAT from server
  const token = await getAsanaToken()
  if (token === -1) return -1
  // Get tasks from asana API
  const tasks = await getAsanaTasks(token)
  console.log(`tasks from getasanataskforuser: ${tasks}`)
  if (tasks === -1) return -1
  return tasks
}
