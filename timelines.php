<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

$filePath = explode('/', $_SERVER['PHP_SELF'], -1);
$filePath = implode('/', $filePath);
$redirect = "http://" . $_SERVER['HTTP_HOST'] . $filePath;

session_start();
if(isset($_SESSION['login_user'])) {
  header("Location: {$redirect}/running.php", true);
}
?>
<!DOCTYPE html>
<html>
  
  <head>
    <meta charset='utf-8'>
    <title>Final Project CS290</title>
    <link rel="stylesheet" href="style.css">
    <script src='source.js'></script>
  </head>
  
  <body>
  
      <!-- TOP TITLE BAR -->
    <div id='top-bar'>
      <div id='page-title'>Track Your Running Workouts</div>
    </div>
    
    <div class='login' id='login-form'>
      <form autocomplete='off'>
        <div id='uname-pword'>
          <p>Log in as existing user
          <p><label>Username: <input type='text' id='uname' /></label>
          <div class='error-msg' id='uname-error'></div>
          <p><label>Password: <input type='password' id='pword' /></label>
          <div class='error-msg' id='pword-error'></div>
        </div>
        <div class='workout-form-btn' name='login' id='login-btn' onclick='loggingin()'>
          <p><strong>Log In</strong></p>
        </div>
        <div class='dividier'></div>
        <div class='workout-form-btn' name='register-user' id='login-btn' onclick='display_register()'>
          <p><strong>New User Sign Up</strong></p>
        </div>
      </form>
    </div>
    <div class='login' id='new-user-form'>
      <form autocomplete='off'>
        <fieldset>
          <p><label>First Name: <em>Optional</em>
            <input type='text' id='first-name' /></label>
          <div class='error-msg' id='first-name-error'></div>
          <p><label>Last Name: <em>Optional</em>
            <input type='text' id='last-name' /> </label>
          <div class='error-msg' id='last-name-error'></div>
          <p><label>Username: <input type='text' id='register-uname' /></label>
          <div class='error-msg' id='new-uname-error'></div>
          <p><label>Password: <input type='password' id='register-pword' /></label>
          <div class='error-msg' id='new-pword-error'></div>
          <p><label>Re-Enter Password: <input type='password' id='register-pword-confirm' /></label>
          <div class='error-msg' id='new-pword-confirm-error'></div>
          <div class='workout-form-btn' name='login' id='login-btn' onclick='register_new_user()'>
            <p><strong>Register</strong></p>
          </div>
        </fieldset>
      </form>
    </div>
    
  </body>

</html>