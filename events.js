/*
About halfway into the event slider part of the project I came across 
http://marcneuwirth.com/blog/2010/02/21/using-a-jquery-ui-slider-to-select-a-time-range/
and used this heavily in getting my sliders to work with a time range
*/

$(document).ready(function() {
  
});

$(function() {
  $( "#event-display" ).sortable();
  $( "#event-display" ).disableSelection();
  $( "#event-display" ).selectable();
  
  

  var sliders = document.getElementsByClassName("timeline-half");
  // get the start and end dates of the timeline selected
  var minTimeStr = sliders[0].parentNode.children[2].children[0].lastChild.children[1].children[0].getAttribute("name");
  var maxTimeStr = sliders[0].parentNode.children[2].children[0].lastChild.children[2].children[0].getAttribute("name");
  
  // add time to date strings
  minTimeStr += " 00:00:00";
  maxTimeStr += " 23:59:59";
  
  // convert to a numeric value for the slider max value
  var minTime = new Date(minTimeStr);
  var maxTime = new Date(maxTimeStr);
  var timeDiff = Math.round(Math.abs(maxTime.getTime() - minTime.getTime()) / 60000);
  
  // handler for displaying slider values
  var sliderToolTip = function(event, ui) {
    //var curValue1 = ui.values[0] || minTime;
    //var curValue2 = ui.values[1] || maxTime;
    var target = $(event.target).attr("id");
    var val0 = $( "#"+target ).slider("values", 0),
        val1 = $( "#"+target ).slider("values", 1),
        minutes0 = parseInt(val0 % 60, 10),
        hours0 = parseInt(val0 / 60 % 24, 10),
        minutes1 = parseInt(val1 % 60, 10),
        hours1 = parseInt(val1 / 60 % 24, 10);
    curValue1 = getTime(hours0, minutes0);
    curValue2 = getTime(hours1, minutes1);
    
    var tooltip1 = '<div class="slidertooltip"><div class="slidertooltip-inner">'
        + curValue1 + '</div><div class="slidertooltip-arrow"></div></div>';
    var tooltip2 = '<div class="slidertooltip"><div class="slidertooltip-inner">'
        + curValue2 + '</div><div class="slidertooltip-arrow"></div></div>';
    
    $("#"+target).children(' .ui-slider-handle').first().html(tooltip1);
    $("#"+target).children(' .ui-slider-handle').last().html(tooltip2);
    
    

    //$( startDisplay ).text(startTime + ' - ');
    //$( endDisplay ).text(endTime);*/
  }
  
  
  // initialize default timeline slider  (maybe remove this as a slider in the future???)
  $( "#slider0" ).slider({
      range: true,
      min: 0,
      max: timeDiff,
      values: [ 0, timeToValue(maxTime, minTime) ],
      create: sliderToolTip,
      slide: sliderToolTip
  }); 
  
  // initialize event sliders
  for (var i = 1; i < sliders.length; i++) {
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

function getTime(hours, minutes) {
  var time = null;
  minutes = minutes + "";
  if (hours < 12) {
    time = "AM";
  }
  else {
    time = "PM";
  }
  if (hours == 0) {
    hours = 12;
  }
  if (minutes.length == 1) {
    minutes = "0" + minutes;
  }
  return hours + ":" + minutes + " " + time;
}

function createEvent() {

}

function edit_timeline_details() {

}