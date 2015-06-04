<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

$filePath = explode('/', $_SERVER['PHP_SELF'], -1);
$filePath = implode('/', $filePath);
$redirect = "http://" . $_SERVER['HTTP_HOST'] . $filePath;

session_start();
if(!isset($_SESSION['login_user'])) {
  header("Location: {$redirect}/login.php", true);
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
    <div id='topbar'>
      <div id='page-title'>Timeline / Itinerary Creator</div>
      <div id='log-in-greeting'>Welcome, 
<?php echo $_SESSION['username']?></div>

      <div id='log-out-btn'><a href="logout.php" class='logout-btn'>Log out</a></div>
    </div>
    
    
    
  </body>

</html>