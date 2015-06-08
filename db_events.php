<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
header('Content-type: text/html');

session_start();

// hash code taken from security lecture slides
// minimum length of 8 required on passwords for this hash to work
$encryptKey = 'minotaur75zodiac!brave';
$iv = '82439527';

$encryptionCipher = mcrypt_module_open(MCRYPT_BLOWFISH,'','cbc','');

// default response object in case database is unable to respond
$responsetxt = "no response";
$responseobj = array(
    'username' => "",
    'login' => false,
    'errorMsg' => ""
);

include 'local_settings.php';
$mysqli = new mysqli("oniddb.cws.oregonstate.edu", "moorjona-db", $dbpw, "moorjona-db");
if (!$mysqli || $mysqli->connect_errno) {
    echo "Connection error " . $mysqli->connect_errno . " " . $mysqli->connect_error;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

// LOG IN USER
    if ($_POST['action'] === 'login') {
    
        // $successfullogin will switch to true if username and password match
        $successfullogin = false;
        
        // query database for password
        if (!($stmt = $mysqli->prepare("SELECT U.user_id, U.password FROM cs290sp15_fp_users U WHERE U.username = ?"))) {
            $responseobj['servermsg'] = "Error with prepare statement";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!($stmt->bind_param("s", $_POST['un']))) {
            $responseobj['servermsg'] = "Error binding parameters";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!$stmt->execute()) {
            $responseobj['servermsg'] = "Error executing prepared statement";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!$stmt->bind_result($id, $pw)) {
            $responseobj['servermsg'] = "Error binding result";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        while ($stmt->fetch()) {
            
            // hash code taken from security lecture slides
            mcrypt_generic_init($encryptionCipher, $encryptKey, $iv);
            $afterDecryption = mdecrypt_generic($encryptionCipher, base64_decode($pw));
            mcrypt_generic_deinit($encryptionCipher);
            
            if ($afterDecryption == htmlspecialchars($_POST['pw'])) {
                $_SESSION['login_user'] = $id;
                $_SESSION['username'] = $_POST['un'];
                $successfullogin = true;
            }
        }
        $stmt->close();
        
        $responseobj['username'] = $_POST['un'];
        $responseobj['login'] = $successfullogin;
        $responsetxt = array(
            'callType' => 'login',
            'content' => $responseobj
        );
        $responsetxt = json_encode($responsetxt);
    }
    
    
    // NEW USER SIGN UP
    
    if ($_POST['action'] === 'register') {

        // 1. CHECK THAT USERNAME IS NOT TAKEN
        if (!($stmt = $mysqli->prepare("SELECT * FROM cs290sp15_fp_users U WHERE U.username = ?"))) {
            $responseobj['servermsg'] = "Error with prepare statement";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!($stmt->bind_param("s", $_POST['un']))) {
            $responseobj['servermsg'] = "Error binding parameters";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!$stmt->execute()) {
            $responseobj['servermsg'] = "Error executing prepared statement";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        $stmt->store_result();
        $row_count = $stmt->num_rows;
        
        $stmt->close();
        
        if ($row_count > 0) {
            $responseobj['username'] = $_POST['un'];
            $responseobj['register'] = false;
            $responsetxt = array(
                'callType' => 'register',
                'content' => $responseobj
            );
            $responsetxt = json_encode($responsetxt);
        } else {

            // 2. Create Password Hash
            // hash code taken from security lecture slides
            $pw = htmlspecialchars($_POST['pw']);
            mcrypt_generic_init($encryptionCipher, $encryptKey, $iv);
            $asEncrypted = base64_encode(mcrypt_generic($encryptionCipher, $pw));
            mcrypt_generic_deinit($encryptionCipher);
        
            // 3. Add Username and Password to cs290sp15_fp_users table
            $un = htmlspecialchars($_POST['un']);
            
            if (!($stmt = $mysqli->prepare("INSERT INTO cs290sp15_fp_users (username, password) VALUES (?, ?)"))) {
                $responseobj['servermsg'] = "Error with prepare statement to insert new user";
                $repsonseobj['errno'] = $stmt->errno;
                $repsonseobj['error'] = $stmt->error;
            }

            if (!($stmt->bind_param("ss", $un, $asEncrypted))) {
                $responseobj['servermsg'] = "Error with bind statement to insert new user";
                $repsonseobj['errno'] = $stmt->errno;
                $repsonseobj['error'] = $stmt->error;
            }

            if (!$stmt->execute()) {
                $responseobj['servermsg'] = "Error with execute statement to insert new user";
                $repsonseobj['errno'] = $stmt->errno;
                $repsonseobj['error'] = $stmt->error;
            } else {
            
             // SUCCESSFUL REGISTRATION, START SESSION
                $succesfullogin = true;
                $_SESSION['login_user'] = $mysqli->insert_id;
                $_SESSION['username'] = $un;

                $responseobj['username'] = $un;
                $responseobj['login'] = $succesfullogin;
                $responsetxt = array(
                    'callType' => 'login',
                    'content' => $responseobj
                );
                $responsetxt = json_encode($responsetxt);
            }

            $stmt->close();
        }
    }


    // ADD NEW TIMELINE TO LOGGED IN USER
    
    if (($_POST['action'] === 'addTimeline') && (isset($_SESSION['login_user'])))  {
    
        $timeName = htmlspecialchars($_POST['tName']);
        $timeStart = htmlspecialchars($_POST['tStart']);
        $timeEnd = htmlspecialchars($_POST['tEnd']);
        
        $responseobj['success'] = false;
        $responseobj['timeline_name'] = $_POST['tName'];
        $responseobj['timeline_start'] = $_POST['tStart'];
        $responseobj['timeline_start'] = $_POST['tEnd'];
        $responsetxt = array(
            'callType' => 'addTimeline',
            'content' => $responseobj
        );
        
        if (!($stmt = $mysqli->prepare("INSERT INTO cs290sp15_fp_timelines (fk_user_id, name, start, end) VALUES (?, ?, ?, ?)"))) {
            $responseobj['servermsg'] = "Add Timeline Error: Prepare failed";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }
        
        if (!($stmt->bind_param("isss", $_SESSION['login_user'], $timeName, $timeStart, $timeEnd))) {
            $responseobj['servermsg'] = "Add Timeline Error: Parameter bind failed";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        }

        if (!$stmt->execute()) {
            $responseobj['servermsg'] = "Add Timeline Error: Execute failed";
            $repsonseobj['errno'] = $stmt->errno;
            $repsonseobj['error'] = $stmt->error;
        } else {
            $responseobj['success'] = true;
            $responseobj['timeline_id'] = $stmt->insert_id;
            $responsetxt = array(
                'callType' => 'addTimeline',
                'content' => $responseobj
            );
        }
        $responsetxt = json_encode($responsetxt);
            
        $stmt->close();
        
    }

// CREATE NEW EVENT FOR TIMELINE
    if ($_POST['action'] === 'addEvent') {
    
        $successfulsave = false;
        
        if ($_SESSION['active_timeline'] != $_POST['timeline_id']) {
          // If this triggers then somehow the timeline ID has changed without the session being updated.
          // Do not add the event in this case but instead send an error to the client
          $responseobj['errorMsg'] = "Warning: Timeline id conflict.  Active session timeline does not match ajax call.";
        }
        
            if (!($stmt = $mysqli->prepare("INSERT INTO cs290sp15_fp_events
                                            (fk_timeline_id, start_time, end_time, event_name)
                                            VALUES (?, ?, ?, ?)")
            )) {
                $responseobj['errorMsg'] = "Error with prepare statement" . $stmt->errno . " " . $stmt->error;
            }
        
            if (!($stmt->bind_param("isss", $_POST['timeline_id'], $_POST['start_time'], $_POST['end_time'], $_POST['name']))) {
                $responseobj['errorMsg'] = "Error binding parameters" . $stmt->errno . " " . $stmt->error;
            }

            if (!$stmt->execute()) {
                $responseobj['errorMsg'] = "Error executing prepared statement" . $stmt->errno . " " . $stmt->error;
            } else {
                $successfulsave = true;
                $responseobj['event_id'] = $mysqli->insert_id;
            }

            $stmt->close();
        
            $responseobj['timeline_id'] = $_POST['timeline_id'];
            $responseobj['success'] = $successfulsave;
            $responseobj['start_time'] = $_POST['start_time'];
            $responseobj['end_time'] = $_POST['end_time'];
            $responseobj['name'] = $_POST['name'];
            $responsetxt = array(
                'callType' => 'addEvent',
                'content' => $responseobj
            );
            $responsetxt = json_encode($responsetxt);
    }
 
// SAVE EXISTING EVENT
    if ($_POST['action'] === 'saveEvent') {
    
        $successfulsave = false;
        
        if ($_SESSION['active_timeline'] != $_POST['timeline_id']) {
          // If this triggers then somehow the timeline ID has changed without the session being updated.
          // Do not update the event in this case but instead send an error to the client
          $responseobj['errorMsg'] = "Warning: Timeline conflict.  Active session timeline does not match ajax call.";
        }

        if (!($stmt = $mysqli->prepare("UPDATE cs290sp15_fp_events SET
                                        start_time = ?,
                                        end_time=?,
                                        event_name=?,
                                        lat=?,
                                        lng=?
                                        WHERE event_id = ?")
        )) {
            $responseobj['errorMsg'] = "Error with prepare statement" . $stmt->errno . " " . $stmt->error;
        }

        if (!($stmt->bind_param("sssddi", $_POST['start_time'], $_POST['end_time'], $_POST['name'], $_POST['lat'], $_POST['lng'], $_POST['event_id']))) {
            $responseobj['errorMsg'] = "Error binding parameters" . $stmt->errno . " " . $stmt->error;
        }

        if (!$stmt->execute()) {
            $responseobj['errorMsg'] = "Error executing prepared statement" . $stmt->errno . " " . $stmt->error;
        } else {
            $successfulsave = true;
        }
        $stmt->close();

        $responseobj['timeline_id'] = $_POST['timeline_id'];
        $responseobj['event_id'] = $_POST['event_id'];
        $responseobj['success'] = $successfulsave;
        $responsetxt = array(
            'callType' => 'saveEvent',
            'content' => $responseobj
        );
        $responsetxt = json_encode($responsetxt);
    }
    
// DELETE EXISTING EVENT
    if ($_POST['action'] === 'deleteEvent') {
    
        $successful = false;
        
        if ($_SESSION['active_timeline'] != $_POST['timeline_id']) {
          // If this triggers then somehow the timeline ID has changed without the session being updated.
          // Do not update the event in this case but instead send an error to the client
          $responseobj['errorMsg'] = "Warning: Timeline conflict.  Active session timeline does not match ajax call.";
        }
        
            // check that row actually exists before deleting
            if (!($stmt = $mysqli->prepare("SELECT * FROM cs290sp15_fp_events WHERE event_id = ?"))) {
                $responseobj['errorMsg'] = "Error with prepare statement" . $stmt->errno . " " . $stmt->error;
            }
        
            if (!($stmt->bind_param("i", $_POST['event_id']))) {
                $responseobj['errorMsg'] = "Error binding parameters" . $stmt->errno . " " . $stmt->error;
            }

            if (!$stmt->execute()) {
                $responseobj['errorMsg'] = "Error executing prepared statement" . $stmt->errno . " " . $stmt->error;
            }
            $stmt->store_result();
            $row_count = $stmt->num_rows;
        
            $stmt->close();
            
            if ($row_count == 0) {
                $responseobj['errorMsg'] = "Event #" . $_POST['event_id'] . " not found.  Unable to delete.";
            } else {
            
            
                if (!($stmt = $mysqli->prepare("DELETE FROM cs290sp15_fp_events WHERE event_id = ?"))) {
                    $responseobj['errorMsg'] = "Error with prepare statement" . $stmt->errno . " " . $stmt->error;
                }
        
                if (!($stmt->bind_param("i", $_POST['event_id']))) {
                    $responseobj['errorMsg'] = "Error binding parameters" . $stmt->errno . " " . $stmt->error;
                }

                if (!$stmt->execute()) {
                    $responseobj['errorMsg'] = "Error executing prepared statement" . $stmt->errno . " " . $stmt->error;
                } else {
                    $successful = true;
                }
                
                $stmt->close();
            }
            
            $responseobj['timeline_id'] = $_POST['timeline_id'];
            $responseobj['deleted_id'] = $_POST['event_id'];
            $responseobj['success'] = $successful;
            $responsetxt = array(
                'callType' => 'deleteEvent',
                'content' => $responseobj
            );
            
            $responsetxt = json_encode($responsetxt);
    }
 
// GET EVENT DATA FOR TIMELINE
    if ($_POST['action'] === 'getEventData') {
    
        $successful = false;
        
        if ($_SESSION['active_timeline'] != $_POST['timeline_id']) {
          // If this triggers then somehow the timeline ID has changed without the session being updated.
          // Do not add the event in this case but instead send an error to the client
          $responseobj['errorMsg'] = "Warning: Timeline conflict.  Active session timeline does not match ajax call.";
        }
        
            if (!($stmt = $mysqli->prepare("SELECT event_id, start_time, end_time, event_name, lat, lng
                                            FROM cs290sp15_fp_events
                                            WHERE fk_timeline_id = ?")
            )) {
                $responseobj['errorMsg'] = "Error with prepare statement" . $stmt->errno . " " . $stmt->error;
            }
        
            if (!($stmt->bind_param("i", $_POST['timeline_id']))) {
                $responseobj['errorMsg'] = "Error binding parameters" . $stmt->errno . " " . $stmt->error;
            }

            if (!$stmt->execute()) {
                $responseobj['errorMsg'] = "Error executing prepared statement" . $stmt->errno . " " . $stmt->error;
            }

            if (!$stmt->bind_result($eid, $stime, $etime, $ename, $lat, $lng)) {
                $responseobj['servermsg'] = "Error binding result";
                $repsonseobj['errno'] = $stmt->errno;
                $repsonseobj['error'] = $stmt->error;
            }
            
            $i = 0;
            while ($stmt->fetch()) {
                $eventObj = array(
                    'id'         => $eid,
                    'name'       => $ename,
                    'start_time' => $stime,
                    'end_time'   => $etime,
                    'lat'        => $lat,
                    'lng'        => $lng
                );
                $responseobj[$i] = $eventObj;
                $i = $i + 1;
            }
            $stmt->close();
        
            $responseobj['timeline_id'] = $_POST['timeline_id'];
            $responseobj['success'] = $successful;
            $responseobj['num_events'] = $i;
            $responsetxt = array(
                'callType' => 'getEventData',
                'content' => $responseobj
            );
            $responsetxt = json_encode($responsetxt);
    }
 
}

echo $responsetxt;

?>