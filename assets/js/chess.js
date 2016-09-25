var rotates = [60, 0, 0];
var lastPosition = [null, null];
var board = document.querySelector('.board');
var buttonDown = false;
document.querySelector('body').addEventListener('mousemove', function(evt){
  if(!buttonDown){
    return false;
  }
  var changeX = 0, 
      changeY = 0;
  if(lastPosition[0]){
    changeX = (lastPosition[0] - evt.screenX)/2;
    if(Math.abs(changeX) > 20){
      changeX = 0;
    }
  }
  if(lastPosition[1]){
    changeY = (lastPosition[1] - evt.screenY)/2;
    if(Math.abs(changeY) > 20){
      changeY = 0;
    }
  }
  
  lastPosition = [evt.screenX, evt.screenY];
  rotates[0] += changeY;
  rotates[1] -= changeX;
  
  var transform = "translateZ(200px) rotateX("+rotates[0]+"deg) rotateZ("+rotates[1]+"deg)";
  
  board.style.transform = transform;
  board.style.webkitTransform = transform;
});
document.querySelector('body').addEventListener('mousedown', function(evt){
  buttonDown = true;
});
document.querySelector('body').addEventListener('mouseup', function(evt){
  buttonDown = false;
})