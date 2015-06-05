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
    'login' => false
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
}

echo $responsetxt;

?>