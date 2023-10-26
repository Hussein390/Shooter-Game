const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collidionCanvas = document.getElementById('collidionCanvas');
const collidionCanvasctx = collidionCanvas.getContext('2d');
collidionCanvas.width = window.innerWidth;
collidionCanvas.height = window.innerHeight;


let score = 0;
let gameOver = false;
ctx.font = '50px Impact'

let timeToNextRevan = 0;
let revanInterval = 300;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModiFier = Math.random() * 0.4 + 0.4;
    this.width = this.spriteWidth * this.sizeModiFier;
    this.height = this.spriteHeight * this.sizeModiFier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = 'raven.png';
    this.frame = 0;
    this.maxframe = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)];
    this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')'
    this.hasTrial = Math.random() > 0.5;
  }

  updata(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxframe) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrial) {
      for (let i = 0; i < 5; i++){
          particles.push(new Particles(this.x, this.y, this.width, this.color))
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }

  draw() {
    collidionCanvasctx.fillStyle = this.color;
    collidionCanvasctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
      this.x, this.y, this.width, this.height)
  }
}
let explosions = [];
class Explosions {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = 'boom.png';
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = 'hit.flac';
    this.timeSinceLast = 0;
    this.frameIntrval = 150;
    this.markedForDeletion = false;
  }
  updata(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLast += deltatime;
    if (this.timeSinceLast > this.frameIntrval) {
      this.frame++;
      this.timeSinceLast = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }

  draw() {
    ctx.drawImage(this.image, this.frame * this.spriteWidth,
      0, this.spriteWidth, this.spriteHeight, this.x, this.y - 40, this.size, this.size)
  }
}
let particles = [];
class Particles {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 50 - 25 ;
    this.y = y + this.size / 3;
    this.radius = Math.random() * this.size / 10;
    this.maxradius = Math.random() * 20 + 35 ;
    this.markedForDeletion = false;
    this.speedx = Math.random() * 1 + 0.5;
    this.color = color;
  }

  updata() {
    this.x += this.speedx;
    this.radius += 0.9;
    if (this.radius > this.maxradius) this.markedForDeletion = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxradius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill()
    ctx.restore();
  }
}

function darwScore() {
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 30, 63)
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 30, 60)
}
function darwGameOver() {
  ctx.textAlign = 'center'
  ctx.fillStyle = 'black';
  ctx.fillText('Game Over, Score: ' + score, canvas.width / 2 + 3, canvas.height / 2 + 5)
  ctx.fillStyle = 'white';
  ctx.fillText('Game Over, Score: ' + score, canvas.width / 2, canvas.height / 2)
}

window.addEventListener('click', (e) => {
  const detect = collidionCanvasctx.getImageData(e.x, e.y, 1, 1);
  const pc = detect.data;
  ravens.forEach(obj => {
    if (obj.randomColors[0] === pc[0] && obj.randomColors[1] === pc[1]
      && obj.randomColors[2] === pc[2]) {
      obj.markedForDeletion = true;
      score++;
      explosions.push(new Explosions(obj.x, obj.y, obj.width))
    }
  })
})

function animate(timeStamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collidionCanvasctx.clearRect(0, 0, canvas.width, canvas.height);
  let deltatime = timeStamp - lastTime;
  lastTime = timeStamp;
  timeToNextRevan += deltatime;
  if (timeToNextRevan > revanInterval) {
    ravens.push(new Raven());
    timeToNextRevan = 0;
    ravens.sort(function (a, b) {
      return a.width - b.width;
    })
  }
  darwScore();
  [...particles, ...ravens, ...explosions].forEach(obj => obj.updata(deltatime));
  [...particles, ...ravens, ...explosions].forEach(obj => obj.draw());
  ravens = ravens.filter(obj => !obj.markedForDeletion);
  explosions = explosions.filter(obj => !obj.markedForDeletion);
  particles = particles.filter(obj => !obj.markedForDeletion);
  if (!gameOver) requestAnimationFrame(animate)
  else darwGameOver()
}
animate(0)
