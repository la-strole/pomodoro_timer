class TimerClass {
  constructor () {
    this.timer_init = {
      m: 25,
      s: 0,
      pomo_session: true,
      lb_m: 30,
      lb_s: 0,
      b_m: 5,
      b_s: 0,
      b_after: 4
    }

    this.timer_control = {
      stop_flag: true,
      pause_flag: false,
      breaking_flag: false
    }

    this.timer_state = {
      minutes: 25,
      seconds: 0,
      timer_id: false,
      pomo_session_count: 0,
      pomo_time_start: false,
      pomo_time_end: true
    }

    this.timer_history = []
  }

  timer () {
    if (!this.timer_control.pause_flag && !this.timer_control.stop_flag) {
      // Timer stopped by time
      if (this.timer_state.minutes === 0 && this.timer_state.seconds === 0) {
        if (!this.timer_init.pomo_session) {
          this.stop_timer()
        } else {
          console.log('Timer stopped by time and autorun by pomo_session')
          // It was pomo time
          if (this.timer_control.breaking_flag) {
            this.timer_state.pomo_session_count++
            const LongBreak = this.timer_state.pomo_session_count % this.timer_init.b_after
            if (LongBreak === 0 && this.timer_state.pomo_session_count > 0) {
              this.initiate_timer(this.timer_init.lb_m, this.timer_init.lb_s, this.timer_init.pomo_session)
            } else {
              this.initiate_timer(this.timer_init.b_m, this.timer_init.b_s, this.timer_init.pomo_session)
            }
            this.timer_control.breaking_flag = false
          } else { // It was breaking time
            this.initiate_timer(this.timer_init.m, this.timer_init.s, this.timer_init.pomo_session)
            this.timer_state.pomo_time_start = new Date()
            this.timer_control.breaking_flag = true
          }
        }
        return true
      } else {
        if (this.timer_state.seconds === 0) {
          this.timer_state.minutes--
          this.timer_state.seconds = 60
        }
        this.timer_state.seconds--
        this.change_display()
      }
    }
  }

  start_timer () {
    console.log('Start timer')
    this.timer_control.stop_flag = false
    this.timer_control.breaking_flag = true
    this.timer_state.pomo_time_start = new Date()
    this.timer_state.minutes = this.timer_init.m
    this.timer_state.seconds = this.timer_init.s
    this.timer_state.timer_id = setInterval(() => { this.timer() }, 1000)
    return true
  }

  stop_timer () {
    clearInterval(this.timer_state.timer_id)
    this.timer_state.timer_id = false
    this.timer_state.pomo_session_count = 0
    this.timer_control.stop_flag = true
    this.timer_control.pause_flag = false
    this.initiate_timer(this.timer_init.m, this.timer_init.s, this.timer_init.pomo_session)
    console.log('Timer stopped')
    return true
  }

  pause_timer () {
    this.timer_control.pause_flag = true
    clearInterval(this.timer_state.timer_id)
    this.timer_state.timer_id = false
    console.log('Timer paused')
    return true
  }

  resume_timer () {
    console.log('Timer resumed')
    this.timer_control.pause_flag = false
    const TimerId = setInterval(() => { this.timer() }, 1000)
    this.timer_state.timer_id = TimerId
    return true
  }

  initiate_timer (minutes, seconds, pomoSession) {
    // If it was pomo time
    if (this.timer_control.breaking_flag) {
      this.timer_state.pomo_time_end = new Date()
      this.timer_history.push({ start: this.timer_state.pomo_time_start, end: this.timer_state.pomo_time_end })
      this.add_tree()
    }
    this.timer_state.pomo_time_start = false
    this.timer_state.pomo_time_end = false
    this.timer_state.minutes = minutes
    this.timer_state.seconds = seconds
    this.timer_init.pomo_session = pomoSession
    this.play_sound()
    this.change_display()
    // Run time stop - time begin
    return true
  }

  change_display () {}
  play_sound () {}
  add_tree () {}
}

/*
module.exports =  timer_class;
*/
// Delete for mocha testing
export { TimerClass }
