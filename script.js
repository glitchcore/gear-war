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
var offsetY = 0.04;

function affine(i,j,func) {
  var matrix = [[1,0.5],[0,1]];
  var x = i/sizeX;
  var y = j/sizeY;
  
  var _x = x*matrix[0][0] + y*matrix[0][1] + offsetX;
  var _y = x*matrix[1][0] + y*matrix[1][1] + offsetY;
  return func(_x,_y);
}

function start() {
  console.log( "ready" );
  var canvasMain = document.getElementById("main");
  ctxMain = canvasMain.getContext('2d');
  
  painter = Painter(canvasMain, ctxMain);
  var gears = Array();
  
  function addGear(i,j, gears) {
    var gear = Gear(painter, ctxMain, i, j, function(i,j, angle, draw) {
					    affine(i, j, function(x,y){
					      draw(x,y, 0.1, angle);
					    });
					  });
    gears.push(gear);
    return gear;
  }
  
  addGear(2,2,gears);
  addGear(4,4,gears);
  gears[0].observe(gears[1]);
   
  function filedUpdate() {
    painter.fill("#EEEEEE");
    //painter.line(0.2,0.2,0.6,0.6, "#000000");
    //painter.rect(0.5,0.5,0.1,0.1, "#00F700");
    
    for(var i = 0; i < sizeX;i++) {
      for(var j = 0; j < sizeY;j++) {
	if(i + j < (sizeX + sizeY)/2) {
	  affine(i, j, function(x,y){painter.rect(x - 0.01/2,y - 0.01/2,0.01,0.01, "#00F700")});
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
  
  var angle = 0;
  setInterval(function() { 
    filedUpdate(); 
    gears[0].push(-0.01); 
    gears.forEach(function(item,i,arr){item.clear()});
  }, 100);

}
