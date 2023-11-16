export { anonimousState, userState }

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

function anonimousState () {
  navBar.showLoginLink()
  navBar.hideLogoutLink()
  navBar.hideDetailsLink()
  navBar.clearUsername()
}

function userState (username) {
  navBar.hideLoginLink()
  navBar.showLogoutLink()
  navBar.setUsername(username)
  navBar.showDetailsLink()
}
