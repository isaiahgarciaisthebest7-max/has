const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const ui = document.getElementById("ui");
const levelButtons = document.getElementById("levelButtons");
const attemptText = document.getElementById("attemptText");
const progressBar = document.getElementById("progressBar");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const GRAVITY = 0.8;
const JUMP = -15;
const ROBOT_JUMP = -20;
const SPEEDS = [4,6,8,10];

let attempt = 1;
let speedIndex = 1;
let levelLength = 6000;
let currentLevel = 0;
let objects = [];

class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 150;
    this.y = 380;
    this.width = 40;
    this.height = 40;
    this.dy = 0;
    this.gravity = 1;
    this.mode = "cube";
  }

  update() {

    if (this.mode === "cube") {
      if ((keys["Space"] || keys["ArrowUp"]) && this.onGround()) {
        this.dy = JUMP;
      }
      this.dy += GRAVITY * this.gravity;
      this.y += this.dy;
    }

    if (this.mode === "ship") {
      if (keys["Space"] || keys["ArrowUp"]) {
        this.dy -= 0.7;
      } else {
        this.dy += 0.7;
      }
      this.y += this.dy;
    }

    if (this.mode === "ball") {
      if ((keys["Space"] || keys["ArrowUp"]) && this.onGround()) {
        this.gravity *= -1;
      }
      this.dy += GRAVITY * this.gravity;
      this.y += this.dy;
    }

    if (this.mode === "ufo") {
      if (keys["Space"]) this.dy = -12;
      this.dy += GRAVITY * this.gravity;
      this.y += this.dy;
    }

    if (this.mode === "wave") {
      if (keys["Space"] || keys["ArrowUp"]) this.y -= 7;
      else this.y += 7;
    }

    if (this.mode === "robot") {
      if (keys["Space"] && this.onGround()) {
        this.dy = ROBOT_JUMP;
      }
      this.dy += GRAVITY * this.gravity;
      this.y += this.dy;
    }

    if (this.mode === "spider") {
      if (keys["Space"]) {
        this.y = this.gravity > 0 ? 100 : 380;
        this.gravity *= -1;
      }
    }

    if (this.y > 380) {
      this.y = 380;
      this.dy = 0;
    }
  }

  onGround() {
    return this.y >= 380;
  }

  draw() {
    ctx.fillStyle = this.getColor();
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  getColor() {
    return {
      cube:"cyan",
      ship:"red",
      ball:"yellow",
      ufo:"magenta",
      wave:"lime",
      robot:"orange",
      spider:"purple"
    }[this.mode];
  }
}

class Object {
  constructor(x,y,w,h,type,data=null) {
    this.x=x; this.y=y;
    this.w=w; this.h=h;
    this.type=type;
    this.data=data;
  }

  update() {
    this.x -= SPEEDS[speedIndex];
  }

  draw() {
    if (this.type==="block") ctx.fillStyle="white";
    if (this.type==="portal") ctx.fillStyle="blue";
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
}

let player = new Player();

function collision(a,b) {
  return a.x < b.x + b.w &&
         a.x + a.width > b.x &&
         a.y < b.y + b.h &&
         a.y + a.height > b.y;
}

function reset() {
  attempt++;
  attemptText.innerText="Attempt "+attempt;
  player.reset();
  generateLevel(currentLevel);
}

function generateLevel(id) {
  objects=[];
  levelLength=6000;

  for (let i=800;i<6000;i+=400)
    objects.push(new Object(i,380,60,100,"block"));

  if (id===1)
    objects.push(new Object(1200,300,50,80,"portal",{mode:"ship"}));

  if (id===2)
    objects.push(new Object(1500,300,50,80,"portal",{mode:"ball"}));

  if (id===3)
    objects.push(new Object(2000,300,50,80,"portal",{mode:"wave"}));

  if (id===4)
    objects.push(new Object(2500,300,50,80,"portal",{mode:"robot"}));

  objects.push(new Object(3000,300,50,80,"portal",{mode:"spider"}));
  objects.push(new Object(3500,300,50,80,"portal",{gravity:-1}));
  objects.push(new Object(4000,300,50,80,"portal",{speed:3}));
}

function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  player.update();
  player.draw();

  objects.forEach(obj=>{
    obj.update();
    obj.draw();

    if (collision(player,obj)) {
      if (obj.type==="block") reset();

      if (obj.type==="portal") {
        if (obj.data.mode) player.mode=obj.data.mode;
        if (obj.data.gravity) player.gravity=obj.data.gravity;
        if (obj.data.speed) speedIndex=obj.data.speed;
        obj.x=-100;
      }
    }
  });

  let progress = Math.min(100,((6000-objects[0]?.x)/6000)*100);
  progressBar.style.width=progress+"%";

  requestAnimationFrame(update);
}

["Level 1","Level 2","Level 3","Level 4","Level 5"]
.forEach((name,i)=>{
  let btn=document.createElement("button");
  btn.innerText=name;
  btn.onclick=()=>{
    currentLevel=i;
    attempt=1;
    player.reset();
    generateLevel(i);
    menu.classList.add("hidden");
    ui.classList.remove("hidden");
  };
  levelButtons.appendChild(btn);
});

update();
