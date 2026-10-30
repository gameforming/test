(() => {

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const W = 960;
const H = 600;

const keys = {};
let mouse = {x: W-20, y:H/2};

let score = [0,0];
let time = 90;
let ended = false;
let last = 0;

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);

const squad = club.players
  .slice()
  .sort((a,b)=>b.rating-a.rating)
  .slice(0,5);

let players = [];
let ball;
let active;

function makePlayer(team,i,stats) {

  const formations = [
    {x:110,y:300},
    {x:260,y:170},
    {x:260,y:430},
    {x:420,y:230},
    {x:420,y:370}
  ];

  const pos = formations[i];

  return {
    team,
    i,

    x: team ? W-pos.x : pos.x,
    y: pos.y,

    homeX: team ? W-pos.x : pos.x,
    homeY: pos.y,

    rating: stats?.rating || 10,
    color: team ? "#ff6675" : stats.color,

    stats: stats || {
      speed:0,
      tackle:0,
      accuracy:0
    },

    angle: team ? Math.PI : 0
  };
}

function reset() {

  players = [];

  for(let i=0;i<5;i++)
    players.push(makePlayer(0,i,squad[i]));

  for(let i=0;i<5;i++)
    players.push(makePlayer(1,i,null));

  ball = {
    x:W/2,
    y:H/2,
    vx:0,
    vy:0,
    owner:null
  };

  active = players[0];
}

function nearest(team) {

  return players
    .filter(p=>p.team===team)
    .sort((a,b)=>dist(a,ball)-dist(b,ball))[0];
}

function control() {

  if(ball.owner && ball.owner.team===0)
    return ball.owner;

  return nearest(0);
}

function take(p) {

  ball.owner = p;
  ball.vx = 0;
  ball.vy = 0;
}

function move(p,dx,dy,dt,mult=1) {

  const n = Math.hypot(dx,dy);

  if(n < 0.01) return;

  dx/=n;
  dy/=n;

  p.angle = Math.atan2(dy,dx);

  const speed =
    2 * (1 + Math.min(2,p.stats.speed*0.1)) * mult;

  p.x=clamp(p.x+dx*speed*dt*60,20,W-20);
  p.y=clamp(p.y+dy*speed*dt*60,20,H-20);
}

// MUISRICHting + accuracy
function shoot(p) {

  if(!p || ball.owner!==p) return;

  const targetX = mouse.x;
  const targetY = mouse.y;

  let angle = Math.atan2(
    targetY-p.y,
    targetX-p.x
  );

  const accuracy = clamp(
    p.stats.accuracy*0.08,
    0,
    0.94
  );

  const deviation =
    (Math.random()-0.5) *
    (1-accuracy) * 1.4;

  angle += deviation;

  ball.owner = null;

  ball.x = p.x;
  ball.y = p.y;

  ball.vx = Math.cos(angle)*11;
  ball.vy = Math.sin(angle)*11;

  document.getElementById("message").textContent =
    "Schot onderweg!";
}

function goal(team) {

  score[team]++;

  document.getElementById("message").textContent =
    team===0 ? "GOAL! Jij scoort!" : "CPU scoort!";

  reset();
  updateHud();
}

function updateHud() {

  document.getElementById("score").textContent =
    `JIJ ${score[0]} — ${score[1]} CPU`;

  document.getElementById("coins").textContent =
    "🪙 "+club.coins;

  document.getElementById("lineup").innerHTML =
    squad.map(p=>`
      <div class="line">
        <span class="circle" style="background:${p.color}">
          ${p.rating}
        </span>
        <span>
          <b>${p.name}</b>
          <small>
            Snel ${p.speed} · Bal ${p.tackle} · Schot ${p.accuracy}
          </small>
        </span>
      </div>
    `).join("");
}

function finish() {

  ended = true;

  const reward =
    score[0]>score[1] ? 200 :
    score[0]===score[1] ? 100 : 50;

  club.coins += reward;

  if(score[0]>score[1])
    club.wins++;

  saveClub();
  updateHud();

  document.getElementById("message").textContent =
    `Wedstrijd afgelopen! +${reward} munten.`;
}

function update(dt) {

  if(ended) return;

  time -= dt;

  if(time<=0) {
    time=0;
    finish();
    return;
  }

  active=control();

  for(const p of players) {

    if(p===active && p.team===0) {

      const dx =
        (keys.d||keys.ArrowRight ? 1:0) -
        (keys.a||keys.ArrowLeft ? 1:0);

      const dy =
        (keys.s||keys.ArrowDown ? 1:0) -
        (keys.w||keys.ArrowUp ? 1:0);

      move(p,dx,dy,dt,keys.Shift?1.45:1);
      continue;
    }

    let target;

    if(p.team===1) {

      target = ball.owner?.team===1
        ? {x:ball.x+(p.i-2)*35,y:ball.y+(p.i-2)*28}
        : {x:p.homeX,y:p.homeY};

      if(p===nearest(1) || ball.owner?.team===0)
        target=ball;

    } else {

      target = ball.owner?.team===0
        ? {x:p.homeX+(ball.x-p.homeX)*0.25,y:p.homeY+(ball.y-p.homeY)*0.25}
        : {x:p.homeX,y:p.homeY};

      if(p===nearest(0) && ball.owner?.team!==0)
        target=ball;
    }

    const dx=target.x-p.x;
    const dy=target.y-p.y;

    if(Math.hypot(dx,dy)>15)
      move(p,dx,dy,dt,0.7);
  }

  // CPU valt aan en schiet richting jouw doel.
  if(ball.owner?.team===1) {

    const p=ball.owner;

    const dx=30-p.x;
    const dy=H/2-p.y;

    if(Math.hypot(dx,dy)>110)
      move(p,dx,dy,dt,0.65);

    if(Math.random()<0.02)
      shoot(p);
  }

  if(ball.owner) {

    ball.x=ball.owner.x+Math.cos(ball.owner.angle)*17;
    ball.y=ball.owner.y+Math.sin(ball.owner.angle)*17;

  } else {

    ball.x+=ball.vx;
    ball.y+=ball.vy;

    ball.vx*=0.992;
    ball.vy*=0.992;

    if(ball.y<25) {
      ball.y=25;
      ball.vy=Math.abs(ball.vy)*0.8;
    }

    if(ball.y>H-25) {
      ball.y=H-25;
      ball.vy=-Math.abs(ball.vy)*0.8;
    }

    if(ball.x>W-10 && Math.abs(ball.y-H/2)<100) {
      goal(0);
      return;
    }

    if(ball.x<10 && Math.abs(ball.y-H/2)<100) {
      goal(1);
      return;
    }

    if(ball.x<20 || ball.x>W-20) {
      ball.x=clamp(ball.x,20,W-20);
      ball.vx*=-0.75;
    }
  }

  // Balverovering: 30% basis + 2% per punt, maximaal 90%.
  if(ball.owner) {

    const holder=ball.owner;

    for(const p of players) {

      if(p.team!==holder.team && dist(p,holder)<29) {

        const chance=clamp(
          0.30+p.stats.tackle*0.02,
          0.30,
          0.90
        );

        if(Math.random()<chance) {
          take(p);
          break;
        }
      }
    }

  } else {

    for(const p of players) {
      if(dist(p,ball)<25) {
        take(p);
        break;
      }
    }
  }
}

function draw() {

  ctx.clearRect(0,0,W,H);

  ctx.fillStyle="#24834d";
  ctx.fillRect(0,0,W,H);

  ctx.strokeStyle="#ffffffb5";
  ctx.lineWidth=3;

  ctx.strokeRect(18,18,W-36,H-36);

  ctx.beginPath();
  ctx.moveTo(W/2,18);
  ctx.lineTo(W/2,H-18);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W/2,H/2,75,0,Math.PI*2);
  ctx.stroke();

  ctx.strokeRect(18,H/2-115,115,230);
  ctx.strokeRect(W-133,H/2-115,115,230);

  ctx.fillStyle="#eee";
  ctx.fillRect(0,H/2-100,18,200);
  ctx.fillRect(W-18,H/2-100,18,200);

  // Richtlijn naar je muis als je balbezit hebt.
  if(ball.owner?.team===0) {
    ctx.setLineDash([7,7]);
    ctx.strokeStyle="#fff9";
    ctx.beginPath();
    ctx.moveTo(ball.owner.x,ball.owner.y);
    ctx.lineTo(mouse.x,mouse.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for(const p of players) {

    ctx.beginPath();
    ctx.fillStyle=p.color;
    ctx.arc(p.x,p.y,17,0,Math.PI*2);
    ctx.fill();

    ctx.lineWidth=p===active?4:2;
    ctx.strokeStyle=p===active?"#fff36b":"#ffffffaa";
    ctx.stroke();

    ctx.fillStyle="#14232b";
    ctx.font="bold 13px system-ui";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(p.rating,p.x,p.y);
  }

  ctx.beginPath();
  ctx.fillStyle="white";
  ctx.arc(ball.x,ball.y,8,0,Math.PI*2);
  ctx.fill();

  if(ended) {
    ctx.fillStyle="#06111ddd";
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle="white";
    ctx.textAlign="center";
    ctx.font="bold 44px system-ui";
    ctx.fillText(
      score[0]>score[1]?"GEWONNEN!":
      score[0]===score[1]?"GELIJKSPEL":"VERLOREN",
      W/2,H/2
    );
  }
}

function frame(t) {

  const dt=Math.min((t-last)/1000||0,0.04);
  last=t;

  update(dt);
  draw();

  document.getElementById("clock").textContent=Math.ceil(time);

  requestAnimationFrame(frame);
}

canvas.addEventListener("mousemove",e=>{
  const r=canvas.getBoundingClientRect();

  mouse.x=(e.clientX-r.left)*W/r.width;
  mouse.y=(e.clientY-r.top)*H/r.height;
});

document.addEventListener("keydown",e=>{

  const k=e.key.length===1?e.key.toLowerCase():e.key;
  keys[k]=true;

  if(e.code==="Space") {
    e.preventDefault();
    shoot(control());
  }
});

document.addEventListener("keyup",e=>{
  keys[e.key.length===1?e.key.toLowerCase():e.key]=false;
});

document.getElementById("restart").onclick=()=>{

  score=[0,0];
  time=90;
  ended=false;

  document.getElementById("message").textContent="Pak de bal en scoor!";

  reset();
  updateHud();
};

reset();
updateHud();
requestAnimationFrame(frame);

})();
