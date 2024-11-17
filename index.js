//Setup
/** @type {HTMLCanvasElement} */
var kanves = document.getElementById("main-canves");
var ctx = kanves.getContext("2d");

kanves.width = window.innerWidth - 20;
kanves.height = window.innerHeight - 20;
kanves.style.border = "10px solid black";

var innerWidth2 = window.innerWidth - 20;
var innerHeight2 = window.innerHeight - 20;

window.addEventListener("resize", function () {
  console.log("hey");
  kanves.width = window.innerWidth - 20;
  kanves.height = window.innerHeight - 20;
  innerWidth2 = window.innerWidth - 20;
  innerHeight2 = window.innerHeight - 20;
});
window.addEventListener("resize", function () {
  init();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" || e.key === "Left") {
    platforma.lijevoPritisnuto = true;
  }
  if (e.key === "ArrowRight" || e.key === "Right") {
    platforma.desnoPritisnuto = true;
  }
});

// Detekcija otpuštanja tipki
document.addEventListener("keyup", function (e) {
  if (e.key === "ArrowLeft" || e.key === "Left") {
    platforma.lijevoPritisnuto = false;
  }
  if (e.key === "ArrowRight" || e.key === "Right") {
    platforma.desnoPritisnuto = false;
  }
});

//Varijable
const brojRedovaBlokova = 5;
const brojBlokovaPoRedu = 10;
const visina_bloka = 30;
var blockId = 1;

//Blok
function Squere(position_x, position_y, duzina, visina, block_id, block_color) {
  this.position_x = position_x;
  this.position_y = position_y;
  this.duzina = duzina;
  this.visina = visina;
  this.Id = block_id;
  this.color = block_color;

  this.lastHit = 2;

  this.draw = function () {
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position_x, this.position_y, this.duzina, this.visina);
  };
  this.collisionAcured = function (circle_x, circle_y, circle_radius) {
    const rectTop = this.position_y;
    const rectBottom = this.position_y + this.visina;
    const rectLeft = this.position_x;
    const rectRight = this.position_x + this.duzina;

    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rectLeft, Math.min(circle_x, rectRight));
    const closestY = Math.max(rectTop, Math.min(circle_y, rectBottom));

    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle_x - closestX;
    const distanceY = circle_y - closestY;

    // Calculate the distance squared and compare with the circle's radius squared
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < circle_radius * circle_radius) {
      // Collision occurred
      // Determine collision side based on the circle's movement direction
      const overlapX = circle_radius - Math.abs(distanceX);
      const overlapY = circle_radius - Math.abs(distanceY);

      if (overlapX < overlapY) {
        // Collided horizontally
        return { collided: true, side: "horizontal", overlap: overlapX };
      } else {
        // Collided vertically
        return { collided: true, side: "vertical", overlap: overlapY };
      }
    } else {
      // No collision
      return { collided: false };
    }
  };
}

//Loptica
function Circle(x, y, dx, dy, radius) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.radius = radius;

  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.fill();
  };

  this.update = function () {
    if (this.x + this.radius > innerWidth2 || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.radius > innerHeight2 || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }
    this.x += this.dx;
    this.y += this.dy;
    this.draw();
  };
  this.updateX = function () {
    this.dx = -this.dx;
  };
  this.updateY = function () {
    this.dy = -this.dy;
  };
}

// Platforma
function Platforma(x, y, duzina, visina) {
  this.position_x = x;
  this.position_y = y;
  this.duzina = duzina;
  this.visina = visina;
  this.brzina = 8; // Brzina pomicanja platforme
  this.lijevoPritisnuto = false;
  this.desnoPritisnuto = false;

  this.draw = function () {
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(this.position_x, this.position_y, this.duzina, this.visina);
  };

  this.update = function () {
    if (this.lijevoPritisnuto && this.position_x > 0) {
      this.position_x -= this.brzina;
    }
    if (this.desnoPritisnuto && this.position_x + this.duzina < innerWidth2) {
      this.position_x += this.brzina;
    }
    this.draw();
  };
  this.collisionAcured = function (circle_x, circle_y, circle_radius) {
    const rectTop = this.position_y;
    const rectBottom = this.position_y + this.visina;
    const rectLeft = this.position_x;
    const rectRight = this.position_x + this.duzina;

    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rectLeft, Math.min(circle_x, rectRight));
    const closestY = Math.max(rectTop, Math.min(circle_y, rectBottom));

    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle_x - closestX;
    const distanceY = circle_y - closestY;

    // Calculate the distance squared and compare with the circle's radius squared
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < circle_radius * circle_radius) {
      // Collision occurred
      // Determine collision side based on the circle's movement direction
      const overlapX = circle_radius - Math.abs(distanceX);
      const overlapY = circle_radius - Math.abs(distanceY);

      if (overlapX < overlapY) {
        // Collided horizontally
        return { collided: true, side: "horizontal", overlap: overlapX };
      } else {
        // Collided vertically
        return { collided: true, side: "vertical", overlap: overlapY };
      }
    } else {
      // No collision
      return { collided: false };
    }
  };
}

//Stvaranje loptice
var radius = 15;
var x = innerWidth2 / 2;
var y = innerHeight2 - 45 - radius ;
var dx = (Math.random() - 0.5) * 14;
var dy = -Math.sqrt(50 - Math.pow(dx,2));


var loptica = new Circle(x, y, dx, dy, radius);

//Stvaranje Blokova

var blokList = [];
var block_color = ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"];
var duzina_bloka;
function init() {
  blokList = [];
  duzina_bloka = innerWidth2 / brojBlokovaPoRedu;
  for (var i = 0; i < brojRedovaBlokova; i++) {
    for (var j = 0; j < brojBlokovaPoRedu; j++) {
      blokList.push(
        new Squere(
          j * duzina_bloka,
          i * visina_bloka,
          duzina_bloka,
          visina_bloka,
          blockId++,
          block_color[i % block_color.length]
        )
      );
    }
  }
}
init();

// Stvaranje platforme
var platforma = new Platforma(
  innerWidth2 / 2 - 75, 
  innerHeight2 - 40,
  150, 
  20 
);

//Animiranje
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth2, innerHeight2);

  for (var i = 0; i < blokList.length; i++) {
    blokList[i].draw();
  }
  platforma.update();
  for (var j = 0; j < blokList.length; j++) {
    const collision = blokList[j].collisionAcured(
      loptica.x,
      loptica.y,
      loptica.radius,
    );

    if (collision.collided) {
      if (collision.side === "horizontal") {
        loptica.x += loptica.dx > 0 ? -collision.overlap : collision.overlap;
        loptica.dx = -loptica.dx;
      } else if (collision.side === "vertical") {
        loptica.y += loptica.dy > 0 ? -collision.overlap : collision.overlap;
        loptica.dy = -loptica.dy;
      }

      blokList.splice(j, 1);
      j--;
    }
  }
  var platformCollision=platforma.collisionAcured(
    loptica.x,
    loptica.y,
    loptica.radius
  );

  if (platformCollision.collided) {
    console.log("sudar")
    loptica.dy = -Math.abs(loptica.dy); 
    var relativeHitPosition = (loptica.x - (platforma.position_x + platforma.duzina / 2)) / (platforma.duzina / 2);
    loptica.dx = relativeHitPosition * 3;
    
    
  }
  // Prilagodite faktor za željenu osjetljivost
  

  // Update and draw the circle
  loptica.update();
}

animate();
