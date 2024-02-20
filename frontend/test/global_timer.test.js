/* eslint-disable no-undef */
import { expect } from 'chai'
import * as timer from '../public/js/timer.js'

describe('TIMER GLOBAL', () => {
  it('1. correct seconds decrement', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.pause_flag = false
    i.timer_control.stop_flag = false
    const before = i.timer_state.seconds = 10
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    expect(i.timer_state.seconds).to.equal(before - 1/* expected result */)
  })

  it('2. should return the correct if minutes are change to zero seconds', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.pause_flag = false
    i.timer_control.stop_flag = false
    i.timer_state.minutes = 1
    i.timer_state.seconds = 0
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    expect(i.timer_state.seconds).to.equal(59/* expected result */)
    expect(i.timer_state.minutes).to.equal(0/* expected result */)
  })

  it('3. should start breaking time then pomo timeout', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.stop_flag = false
    i.timer_state.minutes = 0
    i.timer_state.seconds = 0
    i.timer_control.breaking_flag = true
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    // eslint-disable-next-line no-unused-expressions
    expect(i.timer_control.breaking_flag).to.be.false
    expect(i.timer_state.minutes).to.be.equal(i.timer_init.b_m)
    expect(i.timer_state.seconds).to.be.equal(i.timer_init.b_s)
  })

  it('4. should start long breaking time then pomo timeout and pomo in session equal long break after setting', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.stop_flag = false
    i.timer_state.minutes = 0
    i.timer_state.seconds = 0
    i.timer_control.breaking_flag = true
    i.timer_state.pomo_session_count = i.timer_init.b_after - 1
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    // eslint-disable-next-line no-unused-expressions
    expect(i.timer_control.breaking_flag).to.be.false
    expect(i.timer_state.minutes).to.be.equal(i.timer_init.lb_m)
    expect(i.timer_state.seconds).to.be.equal(i.timer_init.lb_s)
  })

  it('5. should start pomo time after breaking time', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.stop_flag = false
    i.timer_state.minutes = 0
    i.timer_state.seconds = 0
    i.timer_control.breaking_flag = false
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    // eslint-disable-next-line no-unused-expressions
    expect(i.timer_control.breaking_flag).to.be.true
    expect(i.timer_state.minutes).to.be.equal(i.timer_init.m)
    expect(i.timer_state.seconds).to.be.equal(i.timer_init.s)
  })

  it('6. should stop timer after pomo time and not settings pomo session', () => {
    const i = new timer.TimerClass()
    // Arrange.
    i.timer_control.stop_flag = false
    i.timer_state.minutes = 0
    i.timer_state.seconds = 0
    i.timer_init.pomo_session = false
    // Act.
    i.timer(/* test inputs */)
    // Assert.
    expect(i.timer_state.minutes).to.be.equal(i.timer_init.m)
    expect(i.timer_state.seconds).to.be.equal(i.timer_init.s)
    // eslint-disable-next-line no-unused-expressions
    expect(i.timer_control.stop_flag).to.be.true
  })
})
