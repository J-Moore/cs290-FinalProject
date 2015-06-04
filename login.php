<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

$filePath = explode('/', $_SERVER['PHP_SELF'], -1);
$filePath = implode('/', $filePath);
$redirect = "http://" . $_SERVER['HTTP_HOST'] . $filePath;

session_start();
if(isset($_SESSION['login_user'])) {
  header("Location: {$redirect}/timelines.php", true);
}
?>
<!DOCTYPE html>
<html>
  
  <head>
    <meta charset='utf-8'>
    <title>Final Project CS290</title>
    <link rel="stylesheet" href="style.css">
    <script src='jquery-2.1.4.min.js'></script>
    <script src='login.js'></script>
  </head>
  
  <body>
  
    <!-- TOP TITLE BAR -->
    <div id='topbar'>
    </div>
    
    <!-- MAIN CONTENT FRAME -->
    <div id='content'>
    
      <!-- LOG IN FORM -->
      <div id='login-form'>
        <form autocomplete='off'>
          <p><label>Username: 
             <input type='text' id='username' /></label>
          <p><label>Password: 
             <input type='password' id='password' /></label>
        </form>
        <div class='error-msg' id='error-msg'>
        </div>
        
        <div class='div-button' id='login-btn' onclick='loginUser()'>
          Log In
        </div>
        
        <div class='div-button' id='show-register-btn' onclick='registerUser()'>
          Register as New User
      </div>
  </body>

</html>