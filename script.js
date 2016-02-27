function Painter(canvas, ctx) {
  function fillAll(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  function fill(color) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  function rect(x1,y1,x,y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x1*canvas.width) + 0.5, Math.round(y1*canvas.height) + 0.5, 
		  Math.round(x*canvas.width) + 0.5, Math.round(y*canvas.height) + 0.5);
  }
  
  function line(x1,y1,x,y, color) {
    ctx.beginPath();
    ctx.moveTo(Math.round(x1*canvas.width) + 0.5, Math.round(y1*canvas.height) + 0.5);
    ctx.lineTo(Math.round((x1+x)*canvas.width) + 0.5, Math.round((y1+y)*canvas.height) + 0.5);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  function moveTo(x,y) {
    ctx.moveTo(Math.round(x*canvas.width) + 0.5, Math.round(y*canvas.height) + 0.5);
  }
  
  function lineTo(x,y) {
    ctx.lineTo(Math.round(x*canvas.width) + 0.5, Math.round(y*canvas.height) + 0.5);
  }
  
  function arc(x,y,radius,start,stop) {
    var J = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    ctx.arc(Math.round(x*canvas.width) + 0.5, Math.round(y*canvas.height) + 0.5, radius * J, start,stop);
  }
  
  function circle(x,y,radius,color) {
    ctx.beginPath();
    // painter.destination();
    
    moveTo(x + radius, y);
    arc(x, y, radius, 0, 2*Math.PI);
    ctx.closePath();

    fill(color);
  }
    
  return {
    fillAll:fillAll,
    rect:rect,
    line:line,
    circle:circle,
    lineTo: lineTo,
    moveTo: moveTo,
    arc: arc,
    closePath: function() {ctx.closePath();},
    stroke: function() {ctx.stroke();},
    fill:fill,
    beginPath: function() {ctx.beginPath();},
    destination: function() {ctx.globalCompositeOperation = 'destination-out';},
    sourceOver: function() {ctx.globalCompositeOperation = 'source-over';}
  };
  
}

var sizeX = 15;
var sizeY = 15;
  
var offsetX = 0.05;
var offsetY = 0.08;

var bgColor = "#FAFFFA";
var gridColor = "#00F700";
var firstColor = "#FF0000";
var secondColor = "#0000FF";

function affine(i,j,func) {
  var matrix = [[1,0.5],[0,1]];
  var x = i/(sizeX + 20*offsetX);
  var y = j/(sizeY + 20*offsetY);
  
  var _x = x*matrix[0][0] + y*matrix[0][1] + offsetX;
  var _y = x*matrix[1][0] + y*matrix[1][1] + offsetY;
  return func(_x,_y);
}

function start() {
  console.log( "ready" );
  var canvasMain = document.getElementById("main");
  ctxMain = canvasMain.getContext('2d');
  
  var points = Array();
  for(var i = 0; i < sizeX;i++) {
    for(var j = 0; j < sizeY;j++) {
      if(i + j < (sizeX + sizeY)/2) {
	affine(i, j, function(x,y){ 
	  // console.log(x,y);
	  points.push({x:x,y:y,i:i,j:j});
	});
      }
    }
  }

  painter = Painter(canvasMain, ctxMain);
  
  var gears = Array();
  gears.neighbour = function(i,j) { 
    var arr = Array();
    // console.log("neighbour", i,j);
    gears.forEach(function(item,k,_){
      // console.log("iterate", item);
      if((Math.abs(item.i - i) == 1 && item.j == j) ||
       (Math.abs(item.j - j) == 1 && item.i == i) ||
       (item.i - i)*(item.j - j) == -1) { 
	// console.log("neighbour", k, "found");
	arr.push(item);
	// console.log("arr", arr);
      }
    });
    // console.log("neighbour", arr);
    return arr;
  }
  
  var color = "#ff0";
  
  function addGear(i,j, gears) {
    
    var gear = Gear(painter, color, gridColor, i, j, function(i,j, angle, draw) {
					    affine(i, j, function(x,y){
					      draw(x,y, 0.55/sizeX, angle);
					    });
					  });
    
    gears.neighbour(i,j).forEach(function(item,k,arr) {
      // console.log(i,j, "gear", item.i, item.j);
      item.observe(gear);
      gear.observe(item);
    });
      
    gears.push(gear);
    
    gears.forEach(function(item,i,arr){item.zero()});
    
    if(color == firstColor) {
      color = secondColor;
      // console.log(color);
    } else {
      color = firstColor;
    }
    return gear;
  }
  
  function removeGear(i,j) {
    var success = false;
    gears.forEach(function(item,k,arr) {
      
      if(item.i == i && item.j == j) {
	// console.log("color", color, item.color);
	if(item.color == color) {
	  gears.neighbour(i,j).forEach(function(item,k,arr) {
	    item.unobserve(i,j);
	  });
	  gears.splice(k,1);
	  // console.log("deleted");
	}
	success = true;
      }
    });
    return success;
  }

  addGear(0,sizeY-1,gears);
  addGear(0,0,gears);
  addGear(sizeX-1,0,gears);
   
  var infoGear = Gear(painter, color, gridColor, 0, 0, function(i,j, angle,draw) {draw(0.1,0.9, 0.55/sizeX, 0);});
  
  function filedUpdate() {
    painter.fillAll(bgColor);
    
    for(var i = 0; i < sizeX;i++) {
      for(var j = 0; j < sizeY;j++) {
	if(i + j < (sizeX + sizeY)/2) {
	  affine(i, j, function(x,y){painter.circle(x,y, 0.007, gridColor)});
	}
      }
    }
    
    infoGear.setColor(color);
    infoGear.clear();
  }
  
  var counter = 0;
  var speed1 = 0.02;
  var speed2 = 0.02;
  
  filedUpdate();
  function update() { 
    filedUpdate(); 
    gears.forEach(function(item,i,arr){item.clear()});
    counter++;
    if(counter % 50 < 25) {
      if(!gears[1].push(speed1)) {
	speed1 = 0.001;
      } else {
	speed1 = 0.02;
      }
    } else {
      if(!gears[2].push(speed2)) {
	speed2 = 0.001;
      } else {
	speed2 = 0.02;
      }
    }
    // console.log("-------------------round clear");
  }
  
  setInterval(update, 30);
  
  canvasMain.addEventListener('click', function(event) {
    
    var x = (event.pageX - canvasMain.offsetLeft - canvasMain.scrollLeft)/canvasMain.width,
        y = (event.pageY - canvasMain.offsetTop - canvasMain.scrollTop)/canvasMain.height;
    // console.log("click",x,y);
    
    points.forEach(function(iter,k,arr) {
      if((Math.abs(x - iter.x) < 0.3/sizeX) && (Math.abs(y - iter.y) < 0.3/sizeY)) {
	console.log("at",iter.i,iter.j);
	if(!removeGear(iter.i,iter.j)) {
	  // console.log("not find");
	  addGear(iter.i,iter.j,gears);
	}
      }
    });
    
  }, false);

}
