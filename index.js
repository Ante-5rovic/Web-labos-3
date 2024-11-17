//================================================================================================
//Varijable
//Neke važne varijable za prilagodbu igrice
//Mogu pomoći za testiranje pozitivnog ishoda igrice smanjenjem brojRedovaBlokova i brojBlokovaPoRedu
const brojRedovaBlokova = 5;
const brojBlokovaPoRedu = 7;
const visina_bloka = 30;
const brzina_loptice = -7;
const duzina_plstforme = 180;
var blockId = 1;
//================================================================================================

//Setup
/** @type {HTMLCanvasElement} */
var kanves = document.getElementById("main-canves");
var ctx = kanves.getContext("2d");

kanves.width = window.innerWidth - 20;
kanves.height = window.innerHeight - 20;
kanves.style.border = "10px solid black";

var innerWidth2 = window.innerWidth - 20;
var innerHeight2 = window.innerHeight - 20;
//Omogućuje dinamičko sučelje
window.addEventListener("resize", function () {
  console.log("hey");
  kanves.width = window.innerWidth - 20;
  kanves.height = window.innerHeight - 20;
  innerWidth2 = window.innerWidth - 20;
  innerHeight2 = window.innerHeight - 20;
});
//Omogućuje dinamičko sučelje
window.addEventListener("resize", function () {
  init();
});
//Detekcija pritiska tipki
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

//Pomoćne varijable
var radius = 12;
var x = innerWidth2 / 2;
var y = innerHeight2 - 45 - radius;
var dx = (Math.random() - 0.5) * 14;
var dy = brzina_loptice;
var blokList = [];
var block_color = ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"];
var duzina_bloka;
var gameOver = false;
var gameWon = false;
var trenutniBodovi = 0;
var maksimalniBodovi = brojRedovaBlokova * brojBlokovaPoRedu;
var najboljiRezultat = 0;

//Blok
function Squere(position_x, position_y, duzina, visina, block_id, block_color) {
  //Skoro isto kao i Platforma, vjerojatno se moglo iskoristiti u svrhu smanjenja redundantnosti koda, ali radi ispita samo sam kopirao i izmijenio funkciju
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

    const closestX = Math.max(rectLeft, Math.min(circle_x, rectRight));
    const closestY = Math.max(rectTop, Math.min(circle_y, rectBottom));

    const distanceX = circle_x - closestX;
    const distanceY = circle_y - closestY;

    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < circle_radius * circle_radius) {
      const overlapX = circle_radius - Math.abs(distanceX);
      const overlapY = circle_radius - Math.abs(distanceY);

      if (overlapX < overlapY) {
        return { collided: true, side: "horizontal", overlap: overlapX };
      } else {
        return { collided: true, side: "vertical", overlap: overlapY };
      }
    } else {
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

  // Iscrtava krug
  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "#A6AEBF";
    ctx.stroke();
    ctx.fill();
  };
  //Provjerava je li došlo do udarca kuglice o neku stijenku
  this.update = function () {
    if (this.x + this.radius > innerWidth2 || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.radius > innerHeight2 || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }
    if (this.y + this.radius > innerHeight2) {
      //GAME OVER
      //Kada loptica udari u donju stjenku završava igra
      //alert(brojBlokovaPoRedu * brojRedovaBlokova - blokList.length);
      gameOver = true;
    }
    this.x += this.dx;
    this.y += this.dy;
    this.draw();
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

  //Crta platformu
  this.draw = function () {
    ctx.fillStyle = "#3C3D37F";
    ctx.fillRect(this.position_x, this.position_y, this.duzina, this.visina);
  };
  //Ažurira platformu (pomiče lijevo-desno uz pomoć eventListenera)
  this.update = function () {
    if (this.lijevoPritisnuto && this.position_x > 0) {
      this.position_x -= this.brzina;
    }
    if (this.desnoPritisnuto && this.position_x + this.duzina < innerWidth2) {
      this.position_x += this.brzina;
    }
    //Nakon pomicanja iscrtava novu poziciju
    this.draw();
  };
  this.collisionAcured = function (circle_x, circle_y, circle_radius) {
    //Funkcija koja na temelju udaljenosti kruga (loptice) i pravokutnika (bloka) daje informacije o presjeku i vrsti (je li bočni ili gornji odnosno donji)
    const rectTop = this.position_y;
    const rectBottom = this.position_y + this.visina;
    const rectLeft = this.position_x;
    const rectRight = this.position_x + this.duzina;

    const closestX = Math.max(rectLeft, Math.min(circle_x, rectRight));
    const closestY = Math.max(rectTop, Math.min(circle_y, rectBottom));

    const distanceX = circle_x - closestX;
    const distanceY = circle_y - closestY;

    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < circle_radius * circle_radius) {
      const overlapX = circle_radius - Math.abs(distanceX);
      const overlapY = circle_radius - Math.abs(distanceY);

      if (overlapX < overlapY) {
        return { collided: true, side: "horizontal", overlap: overlapX };
      } else {
        return { collided: true, side: "vertical", overlap: overlapY };
      }
    } else {
      return { collided: false };
    }
  };
}

//Stvaranje loptice
var loptica = new Circle(x, y, dx, dy, radius);

function init() {
  //Funkcija koja inicijalizira blokove
  //Stavljeno je u funkciju da omogući responzivnost, odnosno povećanje i smanjivanje ekrana uz očuvanu funkcionalnost
  //Resize resetira igricu, ostavio sam tako jer ne piše drugačije
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
  innerWidth2 / 2 - duzina_plstforme / 2,
  innerHeight2 - 40,
  duzina_plstforme,
  20
);

//Spremanje u LocalStorage
function saveToLocalStorage() {
  //Spremam na način da za maksimalnu količinu bodova spremim najbolji rezultat
  //Ostavio sam podatke u LocalStorage jer ne piše nigdje da ih se treba prikazati
  var inLocalStorage = localStorage.getItem(
    "best score for " + maksimalniBodovi + " blocks"
  );
  if (inLocalStorage !== null) {
    if (parseInt(inLocalStorage) < trenutniBodovi) {
      localStorage.setItem(
        "best score for " + maksimalniBodovi + " blocks",
        trenutniBodovi
      );
    }
  }else{
    localStorage.setItem(
        "best score for " + maksimalniBodovi + " blocks",
        trenutniBodovi
      );
  }
}

//Animiranje
function animate() {
  if (gameOver) {
    // Prikaži poruku "GAME OVER"
    saveToLocalStorage()
    ctx.clearRect(0, 0, innerWidth2, innerHeight2);
    ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.font = "bold 72px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", innerWidth2 / 2, innerHeight2 / 2);

    return; // Zaustavite animaciju
  }
  if (gameWon) {
    // Prikaži poruku "GAME WON"
    saveToLocalStorage()
    ctx.clearRect(0, 0, innerWidth2, innerHeight2);
    ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.font = "bold 72px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME WON", innerWidth2 / 2, innerHeight2 / 2);

    return;
  }

  //Obriši canvas
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth2, innerHeight2);

  for (var i = 0; i < blokList.length; i++) {
    blokList[i].draw();
  }

  //Prikazuje bodove
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(trenutniBodovi + " / " + maksimalniBodovi, innerWidth2 - 20, 30);

  //Poziva funkciju za ažuriranje platforme
  platforma.update();

  //Poziva ažuriranje svih blokova
  for (var j = 0; j < blokList.length; j++) {
    //Provjera kolizije
    const collision = blokList[j].collisionAcured(
      loptica.x,
      loptica.y,
      loptica.radius
    );

    //Preusmjeravanje loptice nakon detektirane kolizije
    if (collision.collided) {
      if (collision.side === "horizontal") {
        loptica.x += loptica.dx > 0 ? -collision.overlap : collision.overlap;
        loptica.dx = -loptica.dx;
      } else if (collision.side === "vertical") {
        loptica.y += loptica.dy > 0 ? -collision.overlap : collision.overlap;
        loptica.dy = -loptica.dy;
      }
      //Micanje bloka iz liste i ažuriranje bodova
      blokList.splice(j, 1);
      j--;
      trenutniBodovi = maksimalniBodovi - blokList.length;
    }
    //Uvjet za pobjedu
    if (blokList.length <= 0) {
      gameWon = true;
    }
  }
  //Provjera kolizije s platformom
  var platformCollision = platforma.collisionAcured(
    loptica.x,
    loptica.y,
    loptica.radius
  );
  //Mijenjanje smjera loptice nakon kolizije s platformom
  if (platformCollision.collided) {
    console.log("sudar");
    loptica.dy = -Math.abs(loptica.dy);
    //Na temelju omjera (koliko daleko od sredine) mijenjam dx (komponentu brzine u x smjeru) da dodam realističnost
    var relativeHitPosition =
      (loptica.x - (platforma.position_x + platforma.duzina / 2)) /
      (platforma.duzina / 2);
    loptica.dx = relativeHitPosition * 3;
  }

  //Ažuriranje loptice
  loptica.update();
}

animate();
