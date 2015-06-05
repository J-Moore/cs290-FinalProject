<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

session_start();

include '../local_settings.php';
$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "moorjona-db", $dbpw, "moorjona-db");
if (!$mysqli || $mysqli->connect_errno) {
    echo "Connection error " . $mysqli->connect_errno . " " . $mysqli->connect_error . "\n";
    echo "Unable to retrieve data from server.  Please contact the server administartor.";
    // DO NOT LOAD THE REST OF THE PAGE IF CONNECTION DOES NOT HAPPEN
} else {
?>
<!DOCTYPE html>
<html>
  
  <head>
    <meta charset='utf-8'>
    <title>Final Project CS290</title>
    <link rel="stylesheet" href="jquery-ui.min.css">
    <link rel="stylesheet" href="../style.css">
    <script src='jquery-2.1.4.min.js'></script>
    <script src='jquery-ui.min.js'></script>
    <script src='timelines.js'></script>
  </head>
  
  <body>
<?php
// SELECT WORKOUTS FROM DATABASE
$errorMsg = "";
if (!($stmt = $mysqli->prepare("SELECT timeline_id, name, start, end FROM cs290sp15_fp_timelines WHERE fk_user_id = ?"))) {
    $errorMsg = "Prepare failed: " . $stmt->errno . " " . $stmt->error;
} else {
    if (!($stmt->bind_param("s", $_SESSION['login_user']))) {
        $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
    } else {
        if (!$stmt->execute()) {
            $errorMsg = "Execute failed: " . $mysqli->connect_errno . " " . $mysqli->connect_error;
        } else {
            if (!$stmt->bind_result($time_id, $time_name, $time_start, $time_end)) {
                $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
            } else {
                $stmt->store_result();
                // CREATE DIV FOR EACH TIMELINE IN DATABASE
                while ($stmt->fetch()) {
                    echo "<div class='timeline' id='tlid_" . $time_id . "' onclick='openTimeline(" . $time_id . ")'>";
                    echo "<p>";
                    echo $time_name;
                    echo "<p>";
                    echo $time_start . " - " . $time_end;
                    echo "</div>";
                }
            }
        }
    }
}
?>

    <div class='timeline' id='new-timeline'>
      + Create New
    </div>
    
    <div id='overlay' class='create-popup'>
      <a href="#" class="close"><img src="images/close.png" class="btn_close" title="Close Window" alt="Close" /></a>
      <p>Create New Timeline
      <form id='create-timeline'>
        <p><label>Name:
           <input type='text' id='timeline-name' /></label>
        <p><label>Start Date:
           <input type='text' id='datepicker-start' /></label>
        <p><label>End Date:
           <input type='text' id='datepicker-end' /></label>
        <div class='error-msg' id='error-msg'></div>
        <div class='div-button' id='create-new-timeline' onclick='createNewTimeline()'>
          Create!
        </div>
        
        <div class='div-button' id='cancel-new-timeline'>
          Cancel
        </div>
      </form>
    </div>

    <div class='loading-overlay'></div>
    
  </body>

</html>
<?php
}
?>