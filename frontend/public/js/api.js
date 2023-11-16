// eslint-disable-next-line no-use-before-define
export { login, signin, logout, getCsrfToken, isAuthenificated, setAsanaToken, BASE_URL }

// Set the real path in production
const BASE_URL = 'http://127.0.0.1:8888/backend/api/'
const LOGIN_URL = BASE_URL + 'auth/login'
const LOGOUT_URL = BASE_URL + 'auth/logout'
const SIGNIN_URL = BASE_URL + 'auth/signin'
const WHOAMI_URL = BASE_URL + 'auth/whoami'
const GETCSRFTOKEN_URL = BASE_URL + 'auth/get_csrf_token'
const ASANATOKEN_URL = BASE_URL + 'asana'

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
