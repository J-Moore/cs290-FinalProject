/**
 * fade-in and fade-out functions
 *
 * code source:
 * http://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
 */
  
function fade_out(element) {
  
  var op = 1;  // initial opacity
  var timer = setInterval(function () {
    if (op <= 0.1){
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.1;
  }, 50);
}

function fade_in(element) {

  if (element.style.display != 'block') {
    var op = 0.1;
    element.style.display = 'block';
    var timer = setInterval(function () {
      if (op >= 1){
        clearInterval(timer);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op += op * 0.1;
    }, 10);
  }
}


/*
About halfway into the event slider part of the project I came across 
http://marcneuwirth.com/blog/2010/02/21/using-a-jquery-ui-slider-to-select-a-time-range/
and used this heavily in getting my sliders to work with a time range
*/

var timelineEvents = [];
var timelineID = 0;

$(function() {
  $( "#event-display" ).sortable();
  $( "#event-display" ).disableSelection();
  $( "#event-display" ).selectable();
  

  var sliders = document.getElementsByClassName("timeline-half");
  var timeIDname = document.getElementsByClassName("descriptor-half");
  // get the start and end dates of the timeline selected
  var minTimeStr = sliders[0].parentNode.children[2].children[0].lastChild.children[1].children[0].getAttribute("name");
  var maxTimeStr = sliders[0].parentNode.children[2].children[0].lastChild.children[2].children[0].getAttribute("name");
  timelineID = timeIDname[0].children[0].lastChild.children[0].children[0].getAttribute("name");
  
  // add time to date strings
  minTimeStr += " 00:00:00";
  maxTimeStr += " 23:59:59";
  
  // convert to a numeric value for the slider max value
  var minTime = new Date(minTimeStr);
  var maxTime = new Date(maxTimeStr);
  var timeDiff = Math.round(Math.abs(maxTime.getTime() - minTime.getTime()) / 60000);

  for (var i = 1; i < sliders.length; i++) {
    var eventObj = {};
    var current = "#slider" + i;
    
    // start and stop times from database are stored in the name values of the description
    
    var eventID = sliders[i].parentNode.children[1].children[0].lastChild.children[0].children[0].getAttribute("name");
    var eventName = sliders[i].parentNode.children[1].children[0].lastChild.children[0].children[0].innerText;
    var min = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[1].children[0].getAttribute("name"));
    var max = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[2].children[0].getAttribute("name"));
    
    eventObj['id'] = eventID;
    eventObj['name'] = eventName;
    eventObj['start_time'] = min;
    eventObj['end_time'] = max;
    timelineEvents[eventID] = eventObj;
  }
  
  //console.log(timelineEvents);
  
  // handler for displaying slider values
  var sliderToolTip = function(event, ui) {
    var target = $(event.target).attr("id");
    var target_idnum = target.slice(6);     // slider + #
    var startDisplay = "#startdisplay" + target_idnum;
    var endDisplay = "#enddisplay" + target_idnum;

    var val0 = $( "#"+target ).slider("values", 0);
    var val1 = $( "#"+target ).slider("values", 1);
    var curValue1 = convertTimeToString(val0, minTime.getTime());
    var curValue2 = convertTimeToString(val1, minTime.getTime());
    
    
    var tooltip1 = '<div class="slidertooltip"><div class="slidertooltip-inner">'
        + curValue1 + '</div><div class="slidertooltip-arrow"></div></div>';
    var tooltip2 = '<div class="slidertooltip"><div class="slidertooltip-inner">'
        + curValue2 + '</div><div class="slidertooltip-arrow"></div></div>';
    
    $("#"+target).children(' .ui-slider-handle').first().html(tooltip1);
    $("#"+target).children(' .ui-slider-handle').last().html(tooltip2);

    $( startDisplay ).text('Start: ' + curValue1);
    $( endDisplay ).text('End: ' + curValue2);
    
    
    // 0 will be the slider representing the whole timeline
    if (target_idnum > 0) {
      timelineEvents[target_idnum]['start_time'] = curValue1;
      timelineEvents[target_idnum]['end_time'] = curValue2;
    }
  }
  
  
  // initialize default timeline slider  (maybe remove this as a slider in the future???)
  $( "#slider0" ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ 0, timeToValue(maxTime, minTime) ],
      create: sliderToolTip
  }); 
  
  $( "#slider0" ).slider( "disable" );
  
  // initialize event sliders
  for (var i = 1; i < sliders.length; i++) {
    var eventObj = {};
    var current = "#slider" + i;
    var startDisplay = "#startdisplay" + i;
    var endDisplay = "#enddisplay" + i;
    
    // start and stop times from database are stored in the name values of the description

    var min = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[1].children[0].getAttribute("name"));
    var max = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[2].children[0].getAttribute("name"));

    $( current ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ timeToValue(min, minTime), timeToValue(max, minTime) ],
      create: sliderToolTip,
      slide: sliderToolTip
    });
  }
  
});

function timeToValue(time, base) {
  return Math.round(Math.abs(time.getTime() - base.getTime()) / 60000);
}

function convertTimeToString(offset, base) {
  var datetime = new Date(offset * 60000 + base);
  var options = {
    year: "numeric", month: "numeric", hour12: false,
    day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  return datetime.toLocaleTimeString("en-us", options);
}

function convertToSQLDatestring(datestring) {
  var year = "";
  var month = "";
  var day = "";
  var time = "";
  
  for (var i = 0; i < datestring.length; i++) {
    if (datestring[i] == '/') {
      i += 1;
      break;
    }
    month += datestring[i];
  }
  
  for ( ; i < datestring.length; i++) {
    if (datestring[i] == '/') {
      i += 1;
      break;
    }
    day += datestring[i];
  }
  
  for ( ; i < datestring.length; i++) {
    if (datestring[i] == ',') {
      i += 2;
      break;
    }
    year += datestring[i];
  }
  
  if (month.length < 2) {
    month = "0" + month;
  }
  
  if (day.length < 2) {
    day = "0" + day;
  }
  
  time = datestring.slice(i) + ":00";
  
  var combined = year + "-" + month + "-" + day + " " + time;
  
  return combined;
}

function addEvent() {
  console.log('create new event');
  console.log(timelineEvents);
}

function delete_event(num) {
  if (confirm('Are you sure you want to delete?')) {
    alert('DELETING!');
  } else {
    alert('aborting');
  }
}

function edit_event_details(num) {
  console.log('editing event');
  
}

function save_event_details(num) {
  var saveBool = true;

    

  var callType = 'saveEvent';
  var parameters = {
    event_id: num,
    name: timelineEvents[num]['name'],
    timeline_id: timelineID,
    start_time: convertToSQLDatestring(timelineEvents[num]['start_time']),
    end_time: convertToSQLDatestring(timelineEvents[num]['end_time'])
  }

  // Checking that values are defined for variables we need to save to the database
  if (typeof parameters['name'] === 'undefined') {
    alert('Error: Event Name is Undefined.  Unable to save.');
    saveBool = false;
  }
  
  if (parameters['timeline_id'] == 0) {
    alert('Error: Timeline ID is Undefined.  Unable to save.');
    saveBool = false;
  }
  
  if (parameters['event_id'] == 0) {
    alert('Error: Event ID is Undefined.  Unable to save.');
    saveBool = false;
  }
  
  if (typeof parameters['start_time'] === 'undefined') {
    alert('Error: Event Starting Time is Undefined.  Unable to save.');
    saveBool = false;
  }
  
  if (typeof parameters['end_time'] === 'undefined') {
    alert('Error: Event Ending Time is Undefined.  Unable to save.');
    saveBool = false;
  }
  
  console.log(parameters);
  
  if (saveBool == true) {
    ajaxRequest(callType, parameters);
  }
}

function edit_timeline_details() {

}

function getTimeFromLI(liElement) {
  
}


/* The following functions handle AJAX responses from db_events.php
 *
 * displayServerMessage(msg, errorMsg)
 *   -  msg  -  Displays this message on a div that fades out after 2 sec
 *   -  errorMsg  -  Also displays an error statement.  -1 indicates no error msg
 *
 * responseSaveEvent(responseObj)
 *
 */
 
function displayServerMessage(msg, errorMsg) {
  var msgDiv = document.getElementById('server-message-div');
  msgDiv.style.backgroundColor = '#FF8700';
  msgDiv.innerHTML = msg;
  
  if (errorMsg != -1) {
    var errorP = document.createElement('p');
    var errorTxt = document.createTextNode(errorMsg);
    errorP.appendChild(errorTxt);
    msgDiv.appendChild(errorP);
  }
  fade_in(msgDiv);
  
  window.setInterval(function() {
    fade_out(msgDiv);
  }, 2000);
}

function responseSaveEvent(responseObj) {
  var msg ;
  if (responseObj['success'] === true) {
    msg = 'Event #' + responseObj['event_id'] + ' saved to timeline #' + responseObj['timeline_id'];
    displayServerMessage(msg, -1)
    console.log('save successful');
  } else {
    msg = 'Unable to Save Event #' + responseObj['event_id'] + ' to timeline #' + responseObj['timeline_id'];
    displayServerMessage(msg, responseObj['errorMsg']);
    console.log('save unsuccessful');
  }
}


function ajaxRequest(callType, parameters) {

  var url =
      'http://web.engr.oregonstate.edu/~moorjona/cs290/FinalProject/';
  var phpFile = 'db_events.php';

  var paraString = 'action=' + callType + '&' + getParaString(parameters);
  var urlString = url + phpFile;
  
  console.log(paraString);

  var req = new XMLHttpRequest();
  if (!req) {
    throw 'Unable to create Http request';
  }

  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);

      console.log('JSON RESPONSE OBJECT:');
      console.log(response);
      
      /* Responses:
       *  1. event saved successfully
       *  2. event saved unsuccessfully
       */
    
      if (response['callType'] === 'saveEvent') {
        responseSaveEvent(response['content']);
      }
    }
  };

  req.open('POST', urlString);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(paraString);

}

function getParaString(obj) {
  var str = [];
  for (var key in obj) {
    var s = encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    str.push(s);
  }
  return str.join('&');
}