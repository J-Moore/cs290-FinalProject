<?php

session_start();

if(isset($_SESSION['login_user'])) {
    $_SESSION['login_user']='';
    $_SESSION['username']='';
    $_SESSION['active_timeline']='';
    session_destroy();
}

header("Location: login.php", true);
?>