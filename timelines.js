/*
Overlay code adapted from:
http://stackoverflow.com/questions/23956701/how-do-i-use-jquery-to-create-an-overlay-contact-form
*/

/*
Loading content overlay adapted from:
http://stackoverflow.com/questions/1964839/jquery-please-wait-loading-animation
*/

$(document).ready(function() {
    
});

$(function() {
  $("#new-timeline").click(function() {
    $(".create-popup").fadeIn(300);
    
    $("body").append("<div id='mask'></div>");
    $("#mask").fadeIn(300);
  });
    
  $('body').on('click', 'a.close, #mask, #cancel-new-timeline', function () {
    $(".create-popup").fadeOut(300);
    $('#mask , .login-popup').fadeOut(300, function () {
      $('#mask').remove();
    });
    $.datepicker._clearDate( "#datepicker-start" );
    $.datepicker._clearDate( "#datepicker-end" );
    $( "#timeline-name" ).val('');
    $( "#error-msg" ).html('');
        
    return false;
  });

  $( "#datepicker-start" ).datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    onClose: function( selectedDate ) {
      $( "#datepicker-end" ).datepicker( "option", "minDate", selectedDate );
    }
  });
  
  $( "#datepicker-end" ).datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    changeYear: true,
    onClose: function( selectedDate ) {
      $( "datepicker-start" ).datepicker( "option", "maxDate", selectedDate );
    }
  });
});


function openTimeline(tid) {
  var newURL = "events.php?timeline=" + tid;
  window.location = newURL;
}

function convertDate(datestring) {

  console.log(datestring);

  var month = datestring.substr(0,2);
  var day = datestring.substr(3,2);
  var year = datestring.substr(6,4);
  
  updatedString = year + "/" + month + "/" + day;
  console.log(month);
  console.log(day);
  console.log(year);
  console.log(updatedString);

  return updatedString; // !!!PUNS!!!
}


function createNewTimeline() {

  // validate input section
  
  var timeName = document.getElementById('timeline-name').value;
  var timeStart = document.getElementById('datepicker-start').value;
  var timeEnd = document.getElementById('datepicker-end').value;
  var errorDiv = document.getElementById('error-msg');
  var dateStartVal = Date.parse(timeStart);
  var dateEndVal = Date.parse(timeEnd);
  var no_errors = true;
  
  errorDiv.innerHTML = "";
  
  if (timeName == "") {
    var errorNameMsg = document.createTextNode('Please enter a name.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorNameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (timeStart == "") {
    var errorStartMsg = document.createTextNode('Please enter a starting date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorStartMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (isNaN(dateStartVal) == true) {
    var errorStartMsg = document.createTextNode('Starting date is not a valid date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorStartMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (timeEnd == "") {
    var errorEndMsg = document.createTextNode('Please enter an ending date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorEndMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }

  if (isNaN(dateEndVal) == true) {
    var errorEndMsg = document.createTextNode('Ending date is not a valid date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorEndMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (dateEndVal < dateStartVal) {
    var errorMsg = document.createTextNode('Ending date is earlier than Starting Date.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  }
  
  if (no_errors == true) {
    callType = 'addTimeline';
    parameters = {
      tName: timeName,
      tStart: convertDate(timeStart),
      tEnd: convertDate(timeEnd)
    };
    ajaxRequest(callType, parameters);
    console.log(parameters);
  }
}


function gotoTimeline(respObj) {
  if (respObj['success'] == true) {
    var timeID = respObj['timeline_id'];
    var newURL = "events.php?timeline=" + timeID;
    console.log(newURL);
    window.location = newURL;
  }
}


function ajaxRequest(callType, parameters) {

  var url =
      'http://www.jonathonwmoore.com/jonwmoore/SchoolProjects/CS290/FinalProject/';
  var phpFile = 'db_events.php';

  var paraString = 'action=' + callType + '&' + getParaString(parameters);
  var urlString = url + phpFile;

  var req = new XMLHttpRequest();
  if (!req) {
    throw 'Unable to create Http request';
  }

  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);

      console.log(response);
      
      /* Responses:
       *  1. added successfully
       *  2. unable to add
       */
       
       if (response['callType'] === 'addTimeline') {
         gotoTimeline(response['content']);
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