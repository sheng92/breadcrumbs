var watchID;
var geoLoc;
var dLog;
var currentTrip = new Array();
var currentLocation = {}

function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  dLog.insertAdjacentHTML('beforeend', "Latitude : " + latitude + " Longitude: " + longitude+"<br />");
  currentTrip.push({ lat: latitude, long : longitude });
  currentLocation = {lat: latitude, long: longitude};
}

function errorHandler(err) {
  if(err.code == 1) {
     alert("Error: Access is denied!");
  }

  else if( err.code == 2) {
     alert("Error: Position is unavailable!");
  }
}

function getLocationUpdate(){
  if(navigator.geolocation){
     // timeout at 60000 milliseconds (60 seconds)
     var options = {timeout:60000};
     dLog = document.getElementById('log')
     geoLoc = navigator.geolocation;
     watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
  }

  else{
     alert("Sorry, browser does not support geolocation!");
  }
}


function stopLocationUpdate(){
  navigator.geolocation.clearWatch(watchID);
}
