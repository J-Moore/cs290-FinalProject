function validate_fields() {
  var no_errors = true;
  var errorDiv = document.getElementById('error-msg');
  var uname = document.getElementById('username').value;
  var pword = document.getElementById('password').value;
  
  // clear error messages from previous attempts
  errorDiv.innerHTML = "";
  
  var char_forbidden = /\W/;
  
  if (uname == "") {
    var errorUnameMsg = document.createTextNode('Please enter a username.\n');
    var errorP = document.createElement('p');
    errorP.appendChild(errorUnameMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  } else {
    if (char_forbidden.test(uname)) {
      var errorUnameMsg = document.createTextNode('Username has an invalid character. Only use letters a-z and numbers 0-9');
      var errorP = document.createElement('p');
      errorP.appendChild(errorUnameMsg);
      errorDiv.appendChild(errorP);
      no_errors = false;
    }
    if (uname.length < 8) {
      var errorUlenMsg = document.createTextNode('Username must be at least 8 characters long');
      var errorP = document.createElement('p');
      errorP.appendChild(errorUlenMsg);
      errorDiv.appendChild(errorP);
      no_errors = false;
    }
  }
  
  if (pword == "") {
    var errorPwordMsg = document.createTextNode('Please enter a password');
    var errorP = document.createElement('p');
    errorP.appendChild(errorPwordMsg);
    errorDiv.appendChild(errorP);
    no_errors = false;
  } else {
    if (char_forbidden.test(pword)) {
      var errorPwordMsg = document.createTextNode('Password has an invalid character. Only use letters a-z and numbers 0-9');
      var errorP = document.createElement('p');
      errorP.appendChild(errorPwordMsg);
      errorDiv.appendChild(errorP);
      no_errors = false;
    }
    if (pword.length < 8) {
      var errorPlenMsg = document.createTextNode('Password must be at least 8 characters long');
      var errorP = document.createElement('p');
      errorP.appendChild(errorPlenMsg);
      errorDiv.appendChild(errorP);
      no_errors = false;
    }
  }
  
  return no_errors;
}

function loginUser() {
  if (validate_fields()) {
    var callType = 'login';
    var parameters = {
      un: document.getElementById('username').value,
      pw: document.getElementById('password').value
    };
  
    ajaxRequest(callType, parameters);
  }
  
}

function registerUser() {
  if (validate_fields()) {
    var callType = 'register';
    var parameters = {
      un: document.getElementById('username').value,
      pw: document.getElementById('password').value
    };
  
    ajaxRequest(callType, parameters);
  }
}

function loginresult(isLogin) {
  if (isLogin['login'] === false) {
    var errorDiv = document.getElementById('error-msg');
    errorDiv.innerHTML = "";
    
    var badLoginMsg = document.createTextNode('Invalid username or password');
    errorDiv.appendChild(badLoginMsg);
  }
  
  if (isLogin['login'] === true) {
    location.replace("timelines.php");
  }
}

function invalidusername() {
  var errorDiv = document.getElementById('error-msg');
  var errorMsg = document.createTextNode('This username has already been registered.  Please try another.');
  errorDiv.appendChild(errorMsg);
}

function ajaxRequest(callType, parameters) {

  var url =
      'http://www.jonathonwmoore.com/jonwmoore/SchoolProjects/CS290/FinalProject/';
  var phpFile = 'db_events.php';

  var paraString = 'action=' + callType + '&' + getParaString(parameters);
  var urlString = url + phpFile;

  var req = new XMLHttpRequest();
  if (!req) {
    throw 'Unable to create Http request';
  }

  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);

      console.log(response);
      
      /*
       * Responses still to do:
       *  1. login successful
       *  2. registration successful  <-- differentiate new user experience
       *  3. login/registration invalid - could not connect to server 
       *  4. login invalid - credentials did not match
       *  5. registration invalid - username already taken
      */
      
      // if new user registration attempt but username is already taken
      if (response['callType'] === 'register') {
        invalidusername();
      }
      
      // if user login successful
      if (response['callType'] === 'login') {
        loginresult(response['content']);
      }
    }
  };

  req.open('POST', urlString);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(paraString);

}

function getParaString(obj) {
  var str = [];
  for (var key in obj) {
    var s = encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    str.push(s);
  }
  return str.join('&');
}