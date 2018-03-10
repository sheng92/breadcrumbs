currentHeading = {"degrees": 0};
var zoom = .005;
var watchID;
var geoLoc;
var currentTrip = [];
var currentTripSmooth;
var currentPos = {lat:0, long:0}
function getXYMercator(screenWidth, screenHeight, latitude, longitude){
  var x = (longitude+180)*(screenWidth/360)
  var latRad = latitude*Math.PI/180;
  var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
  var y = (screenHeight/2)-(screenWidth*mercN/(2*Math.PI));
  return {x:x, y:y}
}
function getXY(screenHeight, screenWidth, centerLat, centerLong, latitude, longitude, zoom){
  var y = (centerLat - latitude)/zoom * screenWidth;
  var x = (longitude - centerLong)/zoom * screenWidth;
  return {x:x, y:y}
}

function zoomIn(){
  zoom = zoom / 2;
  draw();
}

function zoomOut(){
  zoom = zoom * 2;
  draw();
}

function rotate(degrees){
  currentHeading.degrees += degrees;
  draw();
}

function draw() {
  var canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentHeading.degrees/180*Math.PI);
    ctx.beginPath();
    for (var i=0, coord; coord = currentTrip[i]; i++) {
      var xy = getXY(canvas.height, canvas.width, currentPos.lat, currentPos.long, coord.lat, coord.long, zoom);
      if (i==0){
        ctx.moveTo(xy.x, xy.y);
        ctx.arc(xy.x, xy.y, 3, 0, Math.PI*2, true);
      }
      else{
        ctx.lineTo(xy.x, xy.y);
      }
    }
    ctx.stroke();
    
    var xy = getXY(canvas.height, canvas.width, currentPos.lat, currentPos.long, currentPos.lat, currentPos.long, zoom);
    ctx.moveTo(xy.x, xy.y);
    ctx.arc(xy.x, xy.y, 10, 0, Math.PI*2, true);
    ctx.stroke();
  }
}

function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  currentTrip.push({ lat: latitude, long : longitude });
  currentPos = {lat: latitude, long: longitude};
  dLog.innerHTML = '{"lat":' + latitude + ',"long":' + longitude + "}";
  draw();
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


