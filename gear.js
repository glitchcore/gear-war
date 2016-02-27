// Copyright (C) Ken Fyrstenberg / Epistemex
// MIT license (header required)

function Gear (painter, ctx, i,j, convCb) {
  
  var observers = Array();
  var lastPush = "undefined";
  
  var currentAngle = 0;
  
  var pi2 = 2 * Math.PI;
  var notches = 9,    // num. of notches
      taperO = 50,    // outer taper %
      taperI = 30;    // inner taper %
  var angle = pi2 / (notches * 2);      // angle between notches

  function draw(x,y,radius,StartAngle) {
    
    StartAngle = StartAngle * pi2;
    
    var toggle = false;                   // notch radis (i/o)
    
    var radiusO = radius,  // outer radius
	  radiusI = radius * 0.65,  // inner radius
	  radiusH = radius * 0.20,   // hole radius
	  taperAI = angle * taperI * 0.006, // inner taper offset
	  taperAO = angle * taperO * 0.006; // outer taper offset
      
    // starting point
    var a = 0;
    painter.moveTo(x + radiusI * Math.cos(a + StartAngle - taperAI), y + radiusI * Math.sin(a + StartAngle - taperAI));

    // loop
    for (a = angle; a <= pi2; a += angle) {
	
	// draw inner part
	if (toggle) {
	    painter.lineTo(x + radiusI * Math.cos(a + StartAngle - taperAI), y + radiusI * Math.sin(a + StartAngle - taperAI));
	    painter.lineTo(x + radiusO * Math.cos(a + StartAngle + taperAO), y + radiusO * Math.sin(a + StartAngle + taperAO));
	}
	// draw outer part
	else {
	    painter.lineTo(x + radiusO * Math.cos(a + StartAngle - taperAO), y + radiusO * Math.sin(a + StartAngle - taperAO));
	    painter.lineTo(x + radiusI * Math.cos(a + StartAngle + taperAI), y + radiusI * Math.sin(a + StartAngle + taperAI));
	}

	// switch
	toggle = !toggle;
    }

    // painter.lineTo(x + radiusI * Math.cos(a + StartAngle - taperAI), y + radiusI * Math.sin(a + StartAngle - taperAI));
    
    // close the final line
    ctx.closePath();

    ctx.fillStyle = '#aaa';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Punch hole in gear
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-out';
    painter.moveTo(x + radiusH, y);
    painter.arc(x, y, radiusH, 0, pi2);
    ctx.closePath();

    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.stroke();
  }
    
  
  
  return {
    push: function(dAngle) {
      // console.log("push[",i,":",j,"]: ", dAngle, "last: ", lastPush);
      if(lastPush != "undefined" && lastPush != dAngle) {
	// console.log("push fail");
	return false;
      }
      
      currentAngle += dAngle;
      lastPush = dAngle;
      // console.log("push ok");
      
      var result = true;
      observers.forEach(function(item, k, arr) { 
	//console.log("[",i,":",j,"] push to ", k);
	result &= item.push(-dAngle);
      });
      return result;
    },
    clear: function() { 
      convCb(i,j, currentAngle % 1,draw); 
      lastPush = "undefined";
    },
    observe: function(observable) { observers.push(observable); }
    i: i,
    j: j
  }
    
}