/*
About halfway into the event slider part of the project I came across 
http://marcneuwirth.com/blog/2010/02/21/using-a-jquery-ui-slider-to-select-a-time-range/
and used this heavily in getting my sliders to work with a time range
*/

// data stored for current timeline
var timelineEvents = [];
var timelineID = 0;
var timelineStartDate;
var timelineEndDate;
  
  // handler for displaying slider values
var sliderToolTip = function(event, ui) {
    var target = $(event.target).attr("id");
    var target_idnum = target.slice(6);     // slider + #
    var startDisplay = "#startdisplay" + target_idnum;
    var endDisplay = "#enddisplay" + target_idnum;

    var val0 = $( "#"+target ).slider("values", 0);
    var val1 = $( "#"+target ).slider("values", 1);
    var curValue1 = convertTimeToString(val0, timelineStartDate.getTime());
    var curValue2 = convertTimeToString(val1, timelineStartDate.getTime());    
    
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
  maxTimeStr += " 23:59:00";
  
  // convert to a numeric value for the slider max value
  timelineStartDate = new Date(minTimeStr);
  timelineEndDate = new Date(maxTimeStr);
  
  var timeDiff = Math.round(Math.abs(timelineEndDate.getTime() - timelineStartDate.getTime()) / 60000);

  console.log('time difference of timeline upon load:');
  console.log(timelineStartDate);
  console.log(timelineEndDate);
  console.log(timeDiff);
  
  // store start and end times of event attributes into 
  // REWORK THIS: instead have page do AJAX call to get Event data after loading so we
  // can pass the values directly into javascript variables
  for (var i = 1; i < sliders.length; i++) {
    var eventObj = {};
    
    
    // start and stop times from database are stored in the name values of the description
    
    var eventID = sliders[i].parentNode.children[1].children[0].lastChild.children[0].children[0].getAttribute("name");
    var eventName = sliders[i].parentNode.children[1].children[0].lastChild.children[0].children[0].innerText;
    var min = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[1].children[0].getAttribute("name"));
    var max = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[2].children[0].getAttribute("name"));
    
    var current = "#slider" + eventID;
    console.log(current);
    
    eventObj['id'] = eventID;
    eventObj['name'] = eventName;
    eventObj['start_time'] = min;
    eventObj['end_time'] = max;
    timelineEvents[eventID] = eventObj;
  }
  
  //console.log(timelineEvents);

  
  
  // initialize default timeline slider  (maybe remove this as a slider in the future and display it statically)
  $( "#slider0" ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ 0, timeToValue(timelineEndDate, timelineStartDate) ],
      create: sliderToolTip
  }); 
  
  $( "#slider0" ).slider( "disable" );
  
  // initialize event sliders
  for (var i = 1; i < sliders.length; i++) {
    var eventID = sliders[i].parentNode.children[1].children[0].lastChild.children[0].children[0].getAttribute("name");
    var current = "#slider" + eventID;
    var startDisplay = "#startdisplay" + eventID;
    var endDisplay = "#enddisplay" + eventID;
    
    console.log('initializing slider variables:');
    console.log(current);
    console.log(startDisplay);
    console.log(endDisplay);
    
    // start and stop times from database are stored in the name values of the description

    var min = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[1].children[0].getAttribute("name"));
    var max = new Date(sliders[i].parentNode.children[1].children[0].lastChild.children[2].children[0].getAttribute("name"));

    $( current ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ timeToValue(min, timelineStartDate), timeToValue(max, timelineStartDate) ],
      create: sliderToolTip,
      slide: sliderToolTip
    });
  }
  
  // CREATING NEW EVENTS
  $("#add-event").click(function() {
    $(".create-popup").fadeIn(300);
    
    $("body").append("<div id='mask'></div>");
    $("#mask").fadeIn(300);
  });
    
  $('body').on('click', 'a.close, #mask, #cancel-new-event', function () {
    $(".create-popup").fadeOut(300);
    $('#mask , .login-popup').fadeOut(300, function () {
      $('#mask').remove();
    });
    $( "#datepicker-start" ).datepicker( "setDate", timelineStartDate);
    $( "#datepicker-end" ).datepicker( "setDate", timelineStartDate);
    $( "#event-name" ).val('New Event');
    $( "#error-msg" ).html('');
    $( "#time-hour-start" ).val('0');
    $( "#time-min-start" ).val('0');
    $( "#time-hour-end" ).val('0');
    $( "#time-min-end" ).val('0');
        
    return false;
  });
  
  // DATEPICKERS FOR CREATING EVENTS
  $( "#datepicker-start" ).datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    defaultDate: timelineStartDate,
    minDate: timelineStartDate,
    maxDate: timelineEndDate,
    onClose: function( selectedDate ) {
      $( "#datepicker-end" ).datepicker( "option", "minDate", selectedDate );
    }
  });
  
  
  $( "#datepicker-end" ).datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    defaultDate: timelineStartDate,
    minDate: timelineStartDate,
    maxDate: timelineEndDate,
    onClose: function( selectedDate ) {
      $( "datepicker-start" ).datepicker( "option", "maxDate", selectedDate );
    }
  });

  var sMonth = timelineStartDate.getMonth() + 1;
  var sYear = timelineStartDate.getFullYear();
  var sDay = timelineStartDate.getDate();
  if (sDay < 10) {
    sDay = "0" + sDay;
  }
  if (sMonth < 10) {
    sMonth = "0" + sMonth;
  }
  var defaultTime = sMonth + "/" + sDay + "/" + sYear;
  $( "#datepicker-start" ).val(defaultTime);
  $( "#datepicker-end" ).val(defaultTime);
  
});

// TIME CONVERSION FUNCTIONS -- massaging time data for SQL storage and displaying in forms

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

function massageDate(datetimeobj) {

    var mMnth = datetimeobj.getMonth() + 1;
    var mDate = datetimeobj.getDate();
    var mHour = datetimeobj.getHours();
    var mMins = datetimeobj.getMinutes();
    
    if (mMnth < 10)
      mMnth = "0" + mMnth;
    if (mDate < 10)
      mDate = "0" + mDate;
    if (mHour < 10)
      mHour = "0" + mHour;
    if (mMins < 10)
      mMins = "0" + mMins;
    
    var massagedDate = datetimeobj.getFullYear() + "-"
                 + mMnth + "-"
                 + mDate + " "
                 + mHour + ":"
                 + mMins + ":00";
                 
    return massagedDate;
}


// CREATE A NEW EVENT FROM OVERLAY FORM

function createNewEvent() {
  console.log('create new event');
  console.log(timelineEvents);

  // validate input section
  var eName = document.getElementById('event-name').value;
  var startDate = document.getElementById('datepicker-start').value;
  var startHour = document.getElementById('time-hour-start').value;
  var startMin = document.getElementById('time-min-start').value;
  var startAMPM = document.getElementById('select-ampm-start').value;
  var endDate = document.getElementById('datepicker-end').value;
  var endHour = document.getElementById('time-hour-end').value;
  var endMin = document.getElementById('time-min-end').value;
  var endAMPM = document.getElementById('select-ampm-end').value;
  
  var errorDiv = document.getElementById('error-msg');
  var no_errors = true;
  
  errorDiv.innerHTML = "";
  
  // create starting and ending date strings
  if (startAMPM === 'PM' && parseInt(startHour, 10) < 12) {
    startHour = parseInt(startHour, 10) + 12;
    startHour += "";
  }
  if (startAMPM === 'AM' && parseInt(startHour, 10) === 12) {
    startHour = "00";
  }
  
  if (endAMPM === 'PM' && parseInt(endHour, 10) < 12) {
    endHour = parseInt(endHour, 10) + 12;
    endHour += "";
  }
  if (endAMPM === 'AM' && parseInt(endHour, 10) === 12) {
    endHour = "00";
  }
  
  var startDateTimeStr = startDate + " " + startHour + ":" + startMin + ":00";
  var endDateTimeStr = endDate + " " + endHour + ":" + endMin + ":00";
  var eventStartDate = new Date(startDateTimeStr);
  var eventEndDate = new Date(endDateTimeStr);

    
  if (eName == "") {
    var errorNameMsg = document.createTextNode('Please enter a name.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  /*
  if (isNaN(startDate) || isNaN(startHour) || isNaN(startMin)) {
    var errorNameMsg = document.createTextNode('Invalid Starting Date, please check the date and time entered.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (isNaN(endDate) || isNaN(endHour) || isNaN(endMin)) {
    var errorNameMsg = document.createTextNode('Invalid Ending Date, please check the date and time entered.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  */
  if (eventStartDate == 'Invalid Date') {
    var errorNameMsg = document.createTextNode('Invalid Starting Date, please check the date and time entered.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
    if (eventEndDate == 'Invalid Date') {
    var errorNameMsg = document.createTextNode('Invalid Ending Date, please check the date and time entered.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  /*
  console.log("STARTING EVENT DATE:");
  console.log(eventStartDate);
  
  console.log("ENDING EVENT DATE:");
  console.log(eventEndDate);
  */
  if (eventStartDate > eventEndDate) {
    var errorNameMsg = document.createTextNode('Ending Date must come after Starting Date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (startDate == "" || endDate == "") {
    var errorStartMsg = document.createTextNode('Please enter starting & ending dates.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorStartMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (eventStartDate < timelineStartDate || eventEndDate > timelineEndDate) {
    var errorNameMsg = document.createTextNode('Event must fall within Timeline date range.');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (no_errors == true) {
    var callType = 'addEvent';
    
    var parameters = {
      name: eName,
      timeline_id: timelineID,
      start_time: massageDate(eventStartDate),
      end_time: massageDate(eventEndDate)
    }
    
    console.log(parameters);
    ajaxRequest(callType, parameters);
  }
  
  $(".create-popup").fadeOut(300);
  $('#mask , .login-popup').fadeOut(300, function () {
    $('#mask').remove();
  });
}

function delete_event(num) {
  if (confirm('Are you sure you want to delete this event?')) {
    var callType = 'deleteEvent';
    var parameters = {
      event_id: num,
      timeline_id: timelineID
    }
    ajaxRequest(callType, parameters);
  } else {
    // any code for aborting delete attempt goes here
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


/* The following functions handle AJAX responses from db_events.php
 *
 * displayServerMessage(msg, errorMsg)
 *   -  msg  -  Displays this message on a div that fades out after 2 sec
 *   -  errorMsg  -  Also displays an error statement.  -1 indicates no error msg
 *
 * responseSaveEvent(responseObj)
 * responseAddEvent(responseObj)
 * responseDeleteEvent(responseObj)
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
  //fade_in(msgDiv);
  $( "#server-message-div" ).fadeIn(300);
  
  window.setInterval(function() {
    //fade_out(msgDiv);
    $( "#server-message-div" ).fadeOut(300);
  }, 2000);
}

function responseSaveEvent(responseObj) {
  var msg;
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

function responseAddEvent(responseObj) {
  console.log('responseAddEvent() entered');
  var msg;
  if (responseObj['success'] == true) {
    console.log('Add Event Success = True');
    msg = 'Event #' + responseObj['event_id'] + ' saved to timeline #' + responseObj['timeline_id'];
    displayServerMessage(msg, -1)
    
    // Add Event to LI
    
    var liParent = document.getElementById('event-display');     // <ul> that we attach to
    
    // NEW LI ELEMENT
    var newLI = document.createElement('li');
    newLI.setAttribute('class', 'ui-state-default');
    
    // 1.
    // NEW SLIDER DIV WITHIN LI ELEMENT
    var newSlider = document.createElement('div');
    newSlider.setAttribute('class', 'timeline-half');
    var idName = 'slider' + responseObj['event_id'];
    newSlider.setAttribute('id', idName);
    
    // 2.
    // DIV WHERE NAME AND TIME IS DISPLAYED
    var newDescr = document.createElement('div');
    newDescr.setAttribute('class', 'descriptor-half');
    var idName = 'descriptor' + responseObj['event_id'];
    newDescr.setAttribute('id', idName);
    
    // TABLE WITHIN DESCRIPTOR DIV
    var newTable = document.createElement('table');
    var newTHead = document.createElement('thead');
    var newTBody = document.createElement('tbody');
    
    // Top Row:  Name of Event
    var nameTR = document.createElement('tr');
    var newTH = document.createElement('th');
    newTH.setAttribute('name', responseObj['event_id']);
    newTH.innerText = responseObj['name'];
    
    // append to event name row
    nameTR.appendChild(newTH);
    
    // Second Row: Starting Time of Event, located within a <span></span>
    var startTR = document.createElement('tr');
    var startTD = document.createElement('td');
    var startSpan = document.createElement('span');
    var idName = 'startdisplay' + responseObj['event_id'];
    startSpan.setAttribute('id', idName);
    startSpan.innerText = 'start: ' + responseObj['start_time'];
    
    // append to start row
    startTD.appendChild(startSpan);
    startTR.appendChild(startTD);
    
    // Third Row: Ending Time of Event, located within a <span></span>
    var endTR = document.createElement('tr');
    var endTD = document.createElement('td');
    var endSpan = document.createElement('span');
    var idName = 'enddisplay'+ responseObj['event_id'];
    endSpan.setAttribute('id', idName);
    endSpan.innerText = 'end: ' + responseObj['end_time'];
    
    // append to end row
    endTD.appendChild(endSpan);
    endTR.appendChild(endTD);
    
    // append rows to table body
    newTBody.appendChild(nameTR);
    newTBody.appendChild(startTR);
    newTBody.appendChild(endTR);
    
    // append table body & head to table element
    newTable.appendChild(newTHead);
    newTable.appendChild(newTBody);
    
    // append table to descriptor div
    newDescr.appendChild(newTable);
    
    // 3.
    // ADD EDIT, SAVE, AND DELETE BUTTONS
    var newButtonDiv = document.createElement('div');
    
    // EDIT BUTTON
    var newA = document.createElement('a');
    newA.setAttribute('class', 'button-img');
    var newImg = document.createElement('img');
    newImg.setAttribute('src', 'resources/images/edit-icon.png');
    newImg.setAttribute('class', 'btn_edit');
    var idName = 'edit-event' + responseObj['event_id'];
    newImg.setAttribute('id', idName);
    var onClickCmd = 'edit_event_details(' + responseObj['event_id'] + ')';
    newImg.setAttribute('onclick', onClickCmd);
    newImg.setAttribute('title', 'Edit Event Details');
    
    newA.appendChild(newImg);
    newButtonDiv.appendChild(newA);
    
    // SAVE BUTTON
    var newA = document.createElement('a');
    newA.setAttribute('class', 'button-img');
    var newImg = document.createElement('img');
    newImg.setAttribute('src', 'resources/images/save-icon.png');
    newImg.setAttribute('class', 'btn_save');
    var idName = 'save-event' + responseObj['event_id'];
    newImg.setAttribute('id', idName);
    var onClickCmd = 'save_event_details(' + responseObj['event_id'] + ')';
    newImg.setAttribute('onclick', onClickCmd);
    newImg.setAttribute('title', 'Save Event Details');
    
    newA.appendChild(newImg);
    newButtonDiv.appendChild(newA);
    
    // DELETE BUTTON
    var newA = document.createElement('a');
    newA.setAttribute('class', 'button-img');
    var newImg = document.createElement('img');
    newImg.setAttribute('src', 'resources/images/delete-icon.png');
    newImg.setAttribute('class', 'btn_delete');
    var idName = 'delete-event' + responseObj['event_id'];
    newImg.setAttribute('id', idName);
    var onClickCmd = 'delete_event(' + responseObj['event_id'] + ')';
    newImg.setAttribute('onclick', onClickCmd);
    newImg.setAttribute('title', 'Delete Event');
    
    newA.appendChild(newImg);
    newButtonDiv.appendChild(newA);
    
    
    // APPEND DIVS TO LI
    
    newLI.appendChild(newSlider);
    newLI.appendChild(newDescr);
    newLI.appendChild(newButtonDiv);
    
    // APPEND LI TO PARENT
    
    liParent.appendChild(newLI);
    
    // CREATE Event Object
    var eventObj = {};
    eventObj['id'] = responseObj['event_id'];
    eventObj['name'] = responseObj['name'];
    eventObj['start_time'] = new Date(responseObj['start_time']);
    eventObj['end_time'] = new Date(responseObj['end_time']);
    timelineEvents[responseObj['event_id']] = eventObj;
    
    // INITIALIZE SLIDER FOR NEW LI ROW
    var current = "#slider" + responseObj['event_id'];
    var startDisplay = "#startdisplay" + responseObj['event_id'];
    var endDisplay = "#enddisplay" + responseObj['event_id'];
    
    // start and stop times from database are stored in the name values of the description

    var min = eventObj['start_time'];
    var max = eventObj['end_time'];
    var timeDiff = Math.round(Math.abs(timelineEndDate.getTime() - timelineStartDate.getTime()) / 60000);

    
    console.log('min', min);
    console.log('max', max);
    console.log('timeToValue(min)', timeToValue(min, timelineStartDate));
    console.log('timeToValue(min)', timeToValue(max, timelineStartDate));
    console.log('timeDiff', timeDiff);
    
    $( current ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ timeToValue(min, timelineStartDate), timeToValue(max, timelineStartDate) ],
      create: sliderToolTip,
      slide: sliderToolTip
    });
    
    
    console.log('save successful');
  } else {
    msg = 'Unable to Save Event #' + responseObj['event_id'] + ' to timeline #' + responseObj['timeline_id'];
    displayServerMessage(msg, responseObj['errorMsg']);
    console.log('save unsuccessful');
  }
}

function responseDeleteEvent(responseObj) {
  var msg;
  if (responseObj['success'] === true) {
    msg = 'Event #' + responseObj['event_id'] + ' deleted from timeline';
    displayServerMessage(msg, -1)
    
    // remove event from local array
    console.log('DELETING');
    console.log(timelineEvents[responseObj['event_id']])
    timelineEvents[responseObj['event_id']] = {};
    timelineEvents.splice(responseObj['event_id'], 1);
    
    // remove element from DOM
    var ulParent = document.getElementById('event-display');
    var deletedID = 'slider' + responseObj['deleted_id'];
    var deletedElementSlider = document.getElementById(deletedID);
    var deletedElementLI = deletedElementSlider.parentNode;
    ulParent.removeChild(deletedElementLI);
    
    console.log('delete successful');
  } else {
    msg = 'Unable to Delete Event #' + responseObj['event_id'];
    displayServerMessage(msg, responseObj['errorMsg']);
    console.log('delete unsuccessful');
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
       *  2. event not saved, unsuccessful
       *  3. new event added successfully
       *  4. new event not added, unsuccessful
       */
    
      if (response['callType'] === 'saveEvent') {
        responseSaveEvent(response['content']);
      }
      
      if (response['callType'] === 'addEvent') {
        responseAddEvent(response['content']);
      }
      
      if (response['callType'] === 'deleteEvent') {
        responseDeleteEvent(response['content']);
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