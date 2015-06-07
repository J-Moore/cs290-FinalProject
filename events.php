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

if (isset($_GET['timeline'])) {
    $_SESSION['active_timeline'] = $_GET['timeline'];
}

include 'local_settings.php';
$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "moorjona-db", $dbpw, "moorjona-db");
if (!$mysqli || $mysqli->connect_errno) {
    echo "Connection error " . $mysqli->connect_errno . " " . $mysqli->connect_error . "\n";
    echo "Unable to retrieve data from server.  Please contact the server administartor.";
    // DO NOT LOAD THE REST OF THE PAGE IF CONNECTION DOES NOT HAPPEN
} else {

$errorMsg = "";
if (!($stmt = $mysqli->prepare("SELECT name, start, end FROM cs290sp15_fp_timelines WHERE timeline_id = ?"))) {
    $errorMsg = "Prepare failed: " . $stmt->errno . " " . $stmt->error;
} else {
    if (!($stmt->bind_param("i", $_SESSION['active_timeline']))) {
        $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
    } else {
        if (!$stmt->execute()) {
            $errorMsg = "Execute failed: " . $mysqli->connect_errno . " " . $mysqli->connect_error;
        } else {
            if (!$stmt->bind_result($tn, $ts, $te)) {
                $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
            } else {
                $stmt->store_result();
                // SAVE TIMELINE DATA
                if ($stmt->num_rows == 1) {
                    while ($stmt->fetch()) {
                        $time_name = $tn;
                        $time_start = $ts;
                        $time_end = $te;
                    }
                }
            }
        }
    }
}
$stmt->close();
?>
<!DOCTYPE html>
<html>
  
  <head>
    <meta charset='utf-8'>
    <title>Final Project CS290</title>
    <link rel="stylesheet" href="resources/jquery-ui.min.css" />
    <link rel="stylesheet" href="style.css" type="text/css" />
    <script src='resources/jquery-2.1.4.min.js'></script>
    <script src='resources/jquery-ui.min.js'></script>
    <script src='events.js'></script>
  </head>
  
  <body>
  
    <!-- TOP TITLE BAR -->
    <div id='topbar'>
      <div class='top-element' id='page-title'>Timeline / Itinerary Creator</div>
      <div class='top-element' id='log-in-greeting'>Welcome, 
<?php echo $_SESSION['username']?></div>

      <div class='top-element' id='log-out-btn'><a href="logout.php" class='logout-btn'>Log out</a></div>
    </div>
    
        
    <!-- DIV FOR DISPLAYING MESSAGES REGARDING DATABASE CHANGES -->
    <div id='server-message-div'></div>
    
    <!-- MAIN DIV -->
    
    <div class='main-screen'>
    
      <div id='map-frame'>
        THE MAP GOES HERE
      </div>
      <div id='event-frame'>
        <div id='timeline-base'>

          <div class='timeline-half' id='slider0'>
          </div>
          <span id='timedisplay0'></span>
          <div class='descriptor-half' id='text-timeline'>
<?php
// DISPLAY TIMELINE DATA
echo "<table><thead></thead><tbody>";
echo "<tr><th name='" . $_SESSION['active_timeline'] . "'>";
echo "Timeline: <strong>" . $time_name . "</strong>";
echo "</th></tr>";
echo "<tr><td name='" . $time_start . "'>start: " . date('M jS, Y', strtotime($time_start)) . "</td></tr>";
echo "<tr><td name='" . $time_end . "'>end: " . date('M jS, Y', strtotime($time_end)) . "</td></tr>";
echo "</tbody></table>";
echo "</div>";

// DISPLAY BUTTONS FOR SAVING DATA AND ADDING EVENTS
echo "<div class='button-half'>";
echo "<a class='button-img'>";
echo "<img src='resources/images/add-icon.png' class='btn_add' id='add-event' onclick='addEvent()' title='Add New Event' />";
echo "</a>";
#echo "<a class='button-img'>";
#echo "<img src='resources/images/save-icon.png' class='btn_edit' id='save-all-events' onclick='save_all_events()' title='Save All Changes' />";
#echo "</a>";
echo "</div>";

#echo "<div class='edit-button-half' id='edit-timeline-details' onclick='createEvent()'><strong>Add Event</strong></div>";
#echo "<span class='edit-button-half' id='edit-timeline-details' onclick='edit_timeline_details(" . $_SESSION['active_timeline'] . ")'><strong>Add Event</strong></span>";

?>
        </div>
        <ul id='event-display'>
<?php
// SHOW EVENTS SAVED IN DATABASE
// START AND END TIME IS EMBEDDED IN WITH THE DOM ELEMENTS
$errorMsg = "";
if (!($stmt = $mysqli->prepare("SELECT event_id, event_name, start_time, end_time FROM cs290sp15_fp_events E WHERE fk_timeline_id = ? ORDER BY E.start_time ASC"))) {
    $errorMsg = "Prepare failed: " . $stmt->errno . " " . $stmt->error;
} else {
    if (!($stmt->bind_param("i", $_SESSION['active_timeline']))) {
        $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
    } else {
        if (!$stmt->execute()) {
            $errorMsg = "Execute failed: " . $mysqli->connect_errno . " " . $mysqli->connect_error;
        } else {
            if (!$stmt->bind_result($event_id, $event_name, $event_start, $event_end)) {
                $errorMsg = "Bind failed: " . $stmt->errno . " " . $stmt->error;
            } else {
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                
                    // BUILD EACH EVENT UI DISPLAY
                    while ($stmt->fetch()) {
                    
                        // LI FOR THE SORTABLE FUNCTIONALITY
                        echo "<li class='ui-state-default'>";
                        
                        // SLIDER FOR CHANGING EVENT TIMES
                        echo "<div class='timeline-half' id='slider" . $event_id . "'></div>";
                        
                        // DIV WHERE NAME AND TIME IS WRITTEN OUT
                        echo "<div class='descriptor-half' id='descriptor" . $event_id . "'>";
                        echo "<table><thead></thead><tbody>";
                        echo "<tr><th name='" . $event_id . "'>" . $event_name . "</th></tr>";
                        echo "<tr><td name='" . $event_start . "'><span id='startdisplay" . $event_id . "'>";
                        echo "start: " . $event_start . "</span></td></tr>";
                        echo "<tr><td name='" . $event_end . "'><span id='enddisplay" . $event_id . "'>";
                        echo "end: " . $event_end . "</span></td></tr>";
                        echo "</tbody></table>";
                        echo "</div>\n";
                        
                        // EDIT & SAVE BUTTONS
                        echo "<div class='button-half'>";
                        echo "<a class='button-img'>";
                        echo "<img src='resources/images/edit-icon.png' class='btn_edit' id='edit-event" . $event_id . "' onclick='edit_event_details(" . $event_id . ")' title='Edit Event Details' />";
                        echo "</a>";
                        echo "<a class='button-img'>";
                        echo "<img src='resources/images/save-icon.png' class='btn_edit' id='save-event" . $event_id . "' onclick='save_event_details(" . $event_id . ")' title='Save Event Details' />";
                        echo "</a>";
                        echo "<a class='button-img'>";
                        echo "<img src='resources/images/delete-icon.png' class='btn_delete' id='delete-event" . $event_id . "' onclick='delete_event(" . $event_id . ")' title='Delete Event' />";
                        echo "</a>";
                        echo "</div>";
                        
                        echo "</li>";
                    }
                }
            }
        }
    }
}
?>

        </ul>
      </div>
    </div>
    
  </body>

</html>
<?php
}
?>