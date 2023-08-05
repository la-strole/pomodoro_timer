export { playSound, getCurrentTime, formatedTime }

function playSound () {
  const audio = new Audio('../assets/audio/bell.wav')
  audio.play()
  console.log('play sound')
}

function formatedTime (t) {
  return `${('0' + t).slice(-2)}`
}

function getCurrentTime () {
  const d = new Date()
  return `${formatedTime(d.getHours())}:${formatedTime(d.getMinutes())}`
}

/*
module.exports = {
    play_sound,
    get_current_time,
    formated_time
}
*/
