function Painter(canvas, ctx) {
  function fill(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  
    
  return {
    fill:fill,
    rect:rect,
    line:line,
    lineTo: lineTo,
    moveTo: moveTo,
    arc: arc
  };
  
}

var sizeX = 10;
var sizeY = 10;
  
var offsetX = 0.05;
var offsetY = 0.08;


function affine(i,j,func) {
  var matrix = [[1,0.5],[0,1]];
  var x = i/(sizeX + 6*offsetX);
  var y = j/(sizeY + 6*offsetY);
  
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
	  console.log(x,y);
	  points.push({x:x,y:y,i:i,j:j});
	});
      }
    }
  }

  painter = Painter(canvasMain, ctxMain);
  var gears = Array();
  
  function addGear(i,j, gears) {
    var gear = Gear(painter, ctxMain, i, j, function(i,j, angle, draw) {
					    affine(i, j, function(x,y){
					      draw(x,y, 0.06, angle);
					    });
					  });
    gears.forEach(function(item,k,arr) {
      // console.log(i,j, "gear", item.i, item.j);
      if((Math.abs(item.i - i) == 1 && item.j == j) ||
	 (Math.abs(item.j - j) == 1 && item.i == i) ||
	 (item.i - i)*(item.j - j) == -1) {
	// console.log("neighbour", k, "found");
	item.observe(gear);
	gear.observe(item);
      }
    });
      
    gears.push(gear);
    return gear;
  }
  

  addGear(0,0,gears);
  /*
  addGear(2,2,gears);
  addGear(2,3,gears);
  addGear(2,4,gears);
  addGear(2,5,gears);
  addGear(3,0,gears);
  addGear(4,0,gears);
  addGear(5,0,gears);
  addGear(6,0,gears);
  addGear(6,1,gears);
  addGear(6,2,gears);
  addGear(5,3,gears);
  addGear(4,4,gears);
  addGear(3,5,gears);
  addGear(1,6,gears);
  // addGear(3,4,gears);
  */
  
  // gears[0].observe(gears[2]);
   
  function filedUpdate() {
    painter.fill("#EEEEEE");
    //painter.line(0.2,0.2,0.6,0.6, "#000000");
    //painter.rect(0.5,0.5,0.1,0.1, "#00F700");
    
    for(var i = 0; i < sizeX;i++) {
      for(var j = 0; j < sizeY;j++) {
	if(i + j < (sizeX + sizeY)/2) {
	  affine(i, j, function(x,y){painter.rect(x - 0.02/2,y - 0.02/2,0.02,0.02, "#00F700")});
	}
      }
    }
  }
  
  // affine(2, 1, function(x,y){painter.rect(x - 0.05/2,y - 0.05/2,0.05,0.05, "#FFFFFF")});
  
  //affine(3, 3, function(x,y){gear(x,y, 0.05, 0)});
  //affine(4, 3, function(x,y){gear(x,y, 0.05, 0)});
  
  
  // gear(0.5,0.2, 0.1, 0);
  // gear(0.1,0.5, 0.05, 0);
  // gear(0.5,0.7, 0.2, 0);
  
  /*
  field = Field(painter, 200, 200);
  field.setColor("#AAAAFF", "#669966", "#444433");
  field.clear(0.4);
  */
  
  // field.setColor("#AAAAFF", "#669966", "#FF0000");
  // setTimeout(function() { field.update(); }, 1000);
  filedUpdate(); 
  
  var refreshIntervalId;
  
  function update() { 
    filedUpdate(); 
    gears.forEach(function(item,i,arr){item.clear()});
    if(!gears[0].push(-0.02)) {
      alert ("ГУМАНИТАРИЙ ШТОЛЕ?");
      clearInterval(refreshIntervalId);
    }
    // console.log("round clear");
  }
  
  refreshIntervalId = setInterval(update, 100);
  
  canvasMain.addEventListener('click', function(event) {
    
    var x = (event.pageX - canvasMain.offsetLeft - canvasMain.scrollLeft)/canvasMain.width,
        y = (event.pageY - canvasMain.offsetTop - canvasMain.scrollTop)/canvasMain.height;
    console.log("click",x,y);
    
    points.forEach(function(iter,k,arr) {
      if((Math.abs(x - iter.x) < 0.05) && (Math.abs(y - iter.y) < 0.05)) {
	console.log("at",iter.i,iter.j);
	addGear(iter.i,iter.j,gears);
      }
    });
    
  }, false);
  
  // update();

}
