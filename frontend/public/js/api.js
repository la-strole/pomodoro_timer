export { apiRequest, BASE_URL }

async function apiRequest (url, requestMethod, csrfToken, data) {
  try {
    const response = await fetch(url, {
      method: requestMethod,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },

      body: JSON.stringify(data)
    })
    if (!response.ok) {
      console.log('API response error: ' + response.status)
      return -1
    }
    const result = await response.json()

    console.log('Success:', result)
    return result
  } catch (error) {
    console.error('API Error:', error)
    return -1
  }
}

const BASE_URL = 'https://127.0.0.1:8443/api/'
