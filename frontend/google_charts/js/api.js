export { getDailyData, getYearlyData, getTaskData, getTaskList }

const BASEURL = 'https://SERVERNAME/backend/api/details/'

async function getDailyData (d = new Date()) {
  // Get the data from the backend server.
  const url = BASEURL + 'dailyActivities' + `?date=${d.toISOString().split('T')[0]}`
  try {
    const response = await fetch(url, {
      credentials: 'same-origin'
    })
    if (!response.ok) {
      console.log('Error with getting daily data for charts. Response: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('getting daily data for charts error: ' + error)
    return -1
  }
}

async function getYearlyData () {
  // Get the data from the backend server.
  const url = BASEURL + 'yearlyActivities'
  try {
    const response = await fetch(url, {
      credentials: 'same-origin'
    })
    if (!response.ok) {
      console.log('Error with getting yearly data for charts. Response: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('getting yearly data for charts error: ' + error)
    return -1
  }
}

async function getTaskData (gid) {
  // Get the data from the backend server.
  const url = BASEURL + `taskActivities?gid=${gid}`
  try {
    const response = await fetch(url, {
      credentials: 'same-origin'
    })
    if (!response.ok) {
      console.log('Error with getting task data for charts. Response: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('getting task data for charts error: ' + error)
    return -1
  }
}

async function getTaskList () {
  // Get the data from the backend server.
  const url = BASEURL + 'taskList'
  try {
    const response = await fetch(url, {
      credentials: 'same-origin'
    })
    if (!response.ok) {
      console.log('Error with getting task list for task select button. Response: ' + response.status)
      return -1
    }
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.log('getting task data for task list error: ' + error)
    return -1
  }
}
