<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

session_start();
?>
<!DOCTYPE html>
<html>
  
  <head>
    <meta charset='utf-8'>
    <title>Final Project CS290</title>
    <link rel="stylesheet" href="jquery-ui.theme.min.css">
    <link rel="stylesheet" href="../style.css">
    <script src='jquery-2.1.4.min.js'></script>
    <script src='jquery-ui.min.js'></script>
    <script src='events.js'></script>
  </head>
  
  <body>
  
  
    <ul id='event-display'>
      <li class='ui-state-default'>+ Create New</li>
      <li class='ui-state-default'>Dummy Entry</li>
    </ul>
   
    
  </body>

</html>