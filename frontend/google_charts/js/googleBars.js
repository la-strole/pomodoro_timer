import * as api from './api.js'

// eslint-disable-next-line no-undef
google.charts.load('current', { packages: ['corechart', 'bar', 'calendar', 'gauge'] })
// eslint-disable-next-line no-undef
google.charts.setOnLoadCallback(drawCharts)

function drawCharts () {
  // Daily activities.
  api.getDailyData(new Date()).then((dailyDataJson) => {
    if (dailyDataJson !== -1) {
      // Day activity donation chart.
      drawDonateChart(dailyDataJson.donateChart, 'Day activity', document.querySelector('#chart_today_tasks'))
      // Daily average activity chart.
      drawDayActivityGauge(
        document.querySelector('#chart_today_gauge1'),
        'Pomo',
        dailyDataJson.pomoGauge[0],
        dailyDataJson.pomoGauge[1],
        dailyDataJson.pomoGauge[2]
      )
      drawDayActivityGauge(
        document.querySelector('#chart_today_gauge2'),
        'Time',
        dailyDataJson.timeGauge[0],
        dailyDataJson.timeGauge[1],
        dailyDataJson.timeGauge[2]
      )
      drawDayActivityGauge(
        document.querySelector('#chart_today_gauge3'),
        'In row',
        dailyDataJson.pomoInRowGauge[0],
        dailyDataJson.pomoInRowGauge[1],
        dailyDataJson.pomoInRowGauge[2]
      )
    }
  })

  // Yearly activities.
  api.getYearlyData().then((yearlyDataJson) => {
    if (yearlyDataJson !== -1) {
      // Calendar chart depicting time spent.
      const calendarChartData = []
      const columnChartData = []
      for (const dateStr in yearlyDataJson) {
        calendarChartData.push([new Date(dateStr.split('-')), yearlyDataJson[dateStr].time])
      }
      drawYearChart(calendarChartData, 'Productivity per year', document.querySelector('#chart_year_productivity'))
      // Column chart displaying Pomodoro sessions and time spent.
      for (const dateStr in yearlyDataJson) {
        columnChartData.push([{ v: new Date(dateStr.split('-')) }, yearlyDataJson[dateStr].pomo, yearlyDataJson[dateStr].time])
      }
      drawColumnChart(columnChartData, 'Pomodoro count and total time spent', document.querySelector('#chart_pomo_time_bar'))
    }
  })
}

function drawDayActivityGauge (DomElement, title, value, meanValue, maxValue) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable()
  data.addColumn('string')
  data.addColumn('number')
  data.addRows([[title, value]])
  const options = {
    min: 0,
    max: maxValue,
    width: 400,
    height: 120,
    redFrom: 0,
    redTo: Math.round(meanValue - (meanValue * 0.4)),
    yellowFrom: Math.round(meanValue - (meanValue * 0.4)),
    yellowTo: Math.round(meanValue + (meanValue * 0.4)),
    greenFrom: Math.round(meanValue + (meanValue * 0.4)),
    greenTo: maxValue,
    minorTicks: 5
  }
  // eslint-disable-next-line no-undef
  const chart = new google.visualization.Gauge(DomElement)
  chart.draw(data, options)
}

function drawColumnChart (dataSet, titleName, DomElement) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable()
  data.addColumn('date')
  data.addColumn('number', 'Pomodoro')
  data.addColumn('number', 'Time (minutes)')

  /*
  data.addRows([
    [{ v: new Date(2024, 0, 1) }, 1, 100],
    [{ v: new Date(2024, 0, 2) }, 2, 500],
    [{ v: new Date(2024, 0, 3) }, 3, 100],
    [{ v: new Date(2024, 0, 4) }, 4, 200],
    [{ v: new Date(2024, 0, 5) }, 5, 200],
    [{ v: new Date(2024, 0, 6) }, 6, 300],
    [{ v: new Date(2024, 0, 7) }, 7, 400],
    [{ v: new Date(2024, 0, 8) }, 8, 500],
    [{ v: new Date(2024, 0, 9) }, 9, 700],
    [{ v: new Date(2024, 0, 10) }, 10, 1000]
  ])
  */

  data.addRows(dataSet)
  // const dateRange = data.getColumnRange(0)
  // const mindate = dateRange.min
  const options = {
    responsive: true,
    // title: titleName,
    chartArea: {
      width: '90%'
    },
    series: {
      0: { targetAxisIndex: 0 }, // Bind series 0 to an axis named 'pomodoro'.
      1: { targetAxisIndex: 1 } // Bind series 1 to an axis named 'time'.
    },
    bar: {
      groupWidth: '20%'
    },
    hAxis: {
      format: 'dd.MM.yy',
      /*
      viewWindow: {
        min: mindate
      },
      */
      ticks: data.getDistinctValues(0)
    },
    vAxis: {
      format: 'short',
      0: {
        title: 'Pomodoro'
      },
      1: {
        title: 'Time (minutes)'
      }
    },
    explorer: {
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomOut: 1,
      maxZoomIn: 0.1
    }
  }
  // eslint-disable-next-line no-undef
  const chart = new google.visualization.ColumnChart(DomElement)
  chart.draw(data, options)
}

function drawColumnChartSimple (dataSet, chartTitle = '', DomElement) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable()
  data.addColumn('date')
  data.addColumn('number', 'Time (minutes)')
  data.addRows(dataSet)
  const options = {
    legend: 'top',
    responsive: true,
    title: chartTitle,
    chartArea: {
      width: '90%'
    },
    bar: {
      groupWidth: '20%'
    },
    hAxis: {
      format: 'dd.MM.yy',
      ticks: data.getDistinctValues(0)
    },
    vAxis: {
      format: 'short',
      viewWindow: { min: 0 },
      minValue: 0
    },
    explorer: {
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomOut: 1,
      maxZoomIn: 0.1
    }
  }
  // eslint-disable-next-line no-undef
  const chart = new google.visualization.ColumnChart(DomElement)
  chart.draw(data, options)
}
function drawYearChart (dataSet, titleName, DomElement) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable()
  data.addColumn({ type: 'date', id: 'Date' })
  data.addColumn({ type: 'number', id: 'Time' })
  data.addRows(dataSet)
  const options = {
    // title: titleName,
    noDataPattern: {
      backgroundColor: '#76a7fa',
      color: '#a0c3ff'
    }
  }
  // eslint-disable-next-line no-undef
  const chart = new google.visualization.Calendar(DomElement)
  chart.draw(data, options)
}

function drawDonateChart (dataSet, titleName, DomElement) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable()
  data.addColumn('string')
  data.addColumn('number')
  data.addRows(dataSet)
  const options = {
    // title: titleName,
    pieHole: 0.4,
    chartArea: {
      width: '100%',
      height: '80%',
      left: 0
    },
    legend: {
      alignment: 'center',
      position: 'right'
    }
  }
  // eslint-disable-next-line no-undef
  const chart = new google.visualization.PieChart(DomElement)
  chart.draw(data, options)
}

document.addEventListener('DOMContentLoaded', () => {
  const dateDaylyInput = document.querySelector('#dateInputDaily')
  const d = new Date()
  const dateString = d.toISOString().split('T')[0]
  dateDaylyInput.value = dateString
  dateDaylyInput.max = dateString
  dateDaylyInput.addEventListener('change', () => {
    // Daily activities.
    api.getDailyData(new Date(dateDaylyInput.value)).then((dailyDataJson) => {
      if (dailyDataJson !== -1) {
        // Day activity donation chart.
        drawDonateChart(dailyDataJson.donateChart, 'Day activity', document.querySelector('#chart_today_tasks'))
        // Daily average activity chart.
        drawDayActivityGauge(
          document.querySelector('#chart_today_gauge1'),
          'Pomo',
          dailyDataJson.pomoGauge[0],
          dailyDataJson.pomoGauge[1],
          dailyDataJson.pomoGauge[2]
        )
        drawDayActivityGauge(
          document.querySelector('#chart_today_gauge2'),
          'Time',
          dailyDataJson.timeGauge[0],
          dailyDataJson.timeGauge[1],
          dailyDataJson.timeGauge[2]
        )
        drawDayActivityGauge(
          document.querySelector('#chart_today_gauge3'),
          'In row',
          dailyDataJson.pomoInRowGauge[0],
          dailyDataJson.pomoInRowGauge[1],
          dailyDataJson.pomoInRowGauge[2]
        )
      }
    })
  })
  api.getTaskList().then((data) => {
    const taskListElement = document.querySelector('#taskList')
    for (const task of data.taskList) {
      const item = document.createElement('span')
      item.classList.add('dropdown-item')
      item.innerHTML = task.name
      const row = document.createElement('li')
      row.classList.add('pseudolink')
      row.dataset.gid = task.gid
      row.appendChild(item)
      taskListElement.appendChild(row)
      row.addEventListener('click', function () {
        api.getTaskData(this.dataset.gid).then((columnChartData) => {
          if (columnChartData !== -1) {
            const dataSet = columnChartData.timeData.map(function (e) {
              e[0] = new Date(e[0])
              return e
            })
            drawColumnChartSimple(dataSet, this.querySelector('span').innerHTML, document.querySelector('#chart_task_data'))
          }
        })
      })
    }
  })
})
