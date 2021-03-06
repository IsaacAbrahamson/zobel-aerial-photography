'use strict'

import Promise from 'promise-polyfill'
import 'whatwg-fetch'

if (!window.Promise) window.Promise = Promise

// Init sugar to manage dates
Sugar.extend()

// Init smooth scrolling
smoothScroll.init()

const WEATHER_LINK = 'http://api.openweathermap.org/data/2.5/forecast?q=IowaCity&appid=a485e3192628137c8f5dc1bad085bf56'

// // stateless protocol required for OpenWeatherMap API
// $(document).ready(function changeProtocol() {
//   if (location.protocol !== 'http:') location.protocol = 'http:'
// })

const convertKelvinToFaren = temp => Math.round(temp * 9 / 5 - 459.67)

function getIcon(weatherID) {
  if (weatherID > 800) return 'cloudy'
  else if (weatherID == 800) return 'sunny'
  else if (weatherID >= 700) return 'flurries'
  else if (weatherID >= 600) return 'cloudy'
  else if (weatherID >= 500) return 'sun-shower'
  else if (weatherID >= 300) return 'rainy'
  else if (weatherID >= 200) return 'thunder-storm'
}

function checkSafety(weatherID, windSpeed) {
  if (windSpeed >= 20) return '<p class="bad"><i class="fa fa-times-circle"></i>not available</p>'
  else if (windSpeed >= 15) return '<p class="okay"><i class="fa fa-exclamation-triangle"></i>slight winds</p>'
  else if (weatherID > 800) return '<p class="okay"><i class="fa fa-exclamation-triangle"></i>low visibility</p>'
  else if (weatherID == 800) return '<p class="good"><i class="fa fa-check"></i>clear skies</p>'
  else if (weatherID >= 700) return '<p class="bad"><i class="fa fa-times-circle"></i>not available</p>'
  else if (weatherID >= 600) return '<p class="okay"><i class="fa fa-exclamation-triangle"></i>low visibility</p>'
  else if (weatherID >= 500) return '<p class="bad"><i class="fa fa-times-circle"></i>not available</p>'
  else if (weatherID >= 300) return '<p class="bad"><i class="fa fa-times-circle"></i>not available</p>'
  else if (weatherID >= 200) return '<p class="bad"><i class="fa fa-times-circle"></i>not available</p>'
}

// This function will add all the child elements needed for each weather icon
function updateWeatherIcons() {
  const cloud = '<div class="cloud"></div>'
  const rain = '<div class="cloud"></div><div class="rain"></div>'
  const sun = '<div class="sun"><div class="rays"></div></div>'
  const snow = '<div class="snow"><div class="flake"></div><div class="flake"></div></div>'
  const lightning = '<div class="lightning"><div class="bolt"></div><div class="bolt"></div></div>'

  $('.cloudy').append(cloud + cloud)
  $('.sunny').append(sun)
  $('.flurries').append(cloud + snow)
  $('.rainy').append(cloud + rain)
  $('.sun-shower').append(cloud + sun + rain)
  $('.thunder-storm').append(cloud + lightning)
}

function parseDate(date) {
  let parsedDate = Sugar.Date.create(date)
  if (parsedDate.isTomorrow()) return 'Tomorrow';else return parsedDate.format('{Mon} {do}')
}

// https://stackoverflow.com/a/25867068
function degToCompass(num) {
  var val = Math.floor(num / 22.5 + 0.5)
  var arr = ["north", "north", "north-east", "east", "east", "east", "south-east", "south", "south", "south", "south-west", "west", "west", "west", "north-west", "north"]
  return arr[val % 16]
}

async function getWeather() {
  if (self.fetch) {
    let response = await fetch(WEATHER_LINK)
    let data = await response.json()
    // weather data at 12:00 P.M. for each day in 5 day forecast
    let forecast = []
    for (let item of data.list) {
      if (item.dt_txt.split(' ').pop().slice(0, 2) == 12) forecast.push(item)
    }
    return forecast
  } else {
      return undefined
  }
}

async function updatePage() {
  let week = await getWeather()
  if (week) {
    let counter = 1;
    for (let day of week) {
      $('#weatherWeek').append(`
        <div class="col-5 weatherDay wow fadeInUp" data-wow-duration='.75s' data-wow-delay="${.15 * counter}s" data-wow-offset="12">
          <div class="weatherDate">${parseDate(day.dt_txt)}</div>
          <div class="weatherSafety">${checkSafety(day.weather[0].id, Math.round(day.wind.speed))}</div>
          <div class="weatherIcon ${getIcon(day.weather[0].id)}"></div>
          <div class="weatherDesc">${Math.round(day.wind.speed)} mph, ${degToCompass(day.wind.deg)}</div>
        </div>
      `)
      counter++
    }
    updateWeatherIcons()
  } else {
    // browser does not support fetch data or an error occured
    $('#weather').remove()
  }

}

updatePage()

// Mobile Menu
$(document).ready(() => {
  $('.mobile-menu').click(() => {
    $('main').addClass('noscroll')
    $('#mobile-dropdown').css('top', '0vh')
    document.ontouchmove = (e) => e.preventDefault()
  })

  $('.exit, .dropdown-links li:nth-child(3)').click(() => {
    $('main').removeClass('noscroll')
    $('#mobile-dropdown').css('top', '-100vh')
    document.ontouchmove = () => true
  })
})
