var currentHeading = {"degrees": 0};
var zoom = 50000;
var watchID;
var geoLoc;
var currentTrip = [];
var currentTripSmooth;
var currentPos = {lat:0, long:0}
var trackingTrip = true;

Compass.watch(function (heading) {
  currentHeading.degrees = 360-heading;
  draw();
});

Compass.init(function (method) {
  console.log('Compass heading by ' + method);
});


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
  var canvas = document.getElementById('mainCanvas');
  var arrowCanvas = document.getElementById('arrowCanvas');
  canvas.width = window.innerWidth*.9;
  canvas.height = window.innerHeight*.5;
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentHeading.degrees/180*Math.PI);
    ctx.beginPath();
    for (var i=0, coord; coord = currentTripSmooth[i]; i++) {
      var xy = getXY(canvas.height, canvas.width, currentPos.lat, currentPos.long, coord.lat, coord.long, zoom);
      if (i==0){
        ctx.moveTo(xy.x+12, xy.y);
        ctx.arc(xy.x, xy.y, 12, 0, Math.PI*2, true);
        ctx.strokeStyle="#009900";
        ctx.lineWidth=20;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xy.x, xy.y);
      }
      else{
        ctx.lineTo(xy.x, xy.y);
      }
    }
    ctx.strokeStyle="#8a130f";
    ctx.lineWidth=8;
    ctx.stroke();
    
    var xy = getXY(canvas.height, canvas.width, currentPos.lat, currentPos.long, currentPos.lat, currentPos.long, zoom);
    ctx.beginPath();
    ctx.lineWidth=20;
    ctx.moveTo(xy.x+40, xy.y);
    ctx.arc(xy.x, xy.y, 40, 0, Math.PI*2, true);
    ctx.stroke();
  }
  if (arrowCanvas.getContext){
    nextNode = getNearest();
    arrowCanvas.width = window.innerWidth*.25;
    arrowCanvas.height = window.innerHeight*.25;
    var arrowCtx = arrowCanvas.getContext('2d');
    var xy = getXY(arrowCanvas.height, arrowCanvas.width, currentPos.lat, currentPos.long, nextNode.lat, nextNode.long, zoom);
    arrowCtx.translate(arrowCanvas.width/2, arrowCanvas.height/2);
    arrowCtx.rotate(currentHeading.degrees/180*Math.PI);
    arrowCtx.moveTo(0,0);
    if (Math.abs(xy.x)+Math.abs(xy.y)>0){
      arrowCtx.lineTo(xy.x/(Math.sqrt((xy.x*xy.x+xy.y*xy.y)))*50, xy.y/(Math.sqrt((xy.x*xy.x+xy.y*xy.y)))*50);
      arrowCtx.lineWidth = 10;
      arrowCtx.arc(xy.x/(Math.sqrt((xy.x*xy.x+xy.y*xy.y)))*50, xy.y/(Math.sqrt((xy.x*xy.x+xy.y*xy.y)))*50, 10,0, Math.PI*2,true);
      arrowCtx.stroke();
    }
  }
}

function showLocation(position) {
  var latitude = position.coords.latitude * 1000000;
  var longitude = position.coords.longitude * 1000000;
  if (trackingTrip) {
    currentTrip.push({ lat: latitude, long : longitude });
    currentTripSmooth = simplify(currentTrip, 50, false);
  }
  currentPos = {lat: latitude, long: longitude};
  if (dLog){
    dLog.insertAdjacentHTML('beforeend', '{"lat":' + latitude + ',"long":' + longitude + "}");
  }
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
  trackingTrip = true;
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

function pauseTrip() {
  trackingTrip = !trackingTrip;
}


function getNearest() {
  recentTrip = currentTripSmooth.slice(- 5);
  var lat = 0;
  var long = 0;
  for (var i=0, coord; coord = recentTrip[i]; i++) {
    lat += coord.lat/recentTrip.length;
    long += coord.long/recentTrip.length;
  }
  return {lat:lat,long:long};
}