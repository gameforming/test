(() => {
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height, keys={}; let coins=250,wins=0,score=[0,0],time=90,ended=false,last=0,matchId=0;
const colors=['#55d6ff','#ff6b6b','#ffd166','#b48cff','#62e6a5','#ff9f5a'];
let squad=[
 {id:1,name:'Starter',rating:8,color:colors[0],speed:0,tackle:0,accuracy:0},
 {id:2,name:'Runner',rating:12,color:colors[2],speed:1,tackle:0,accuracy:0},
 {id:3,name:'Guard',rating:10,color:colors[4],speed:0,tackle:1,accuracy:0},
 {id:4,name:'Striker',rating:15,color:colors[3],speed:0,tackle:0,accuracy:1},
 {id:5,name:'Wing',rating:9,color:colors[5],speed:1,tackle:0,accuracy:0}
];
let players=[],ball={x:W/2,y:H/2,vx:0,vy:0,owner:null},controlled=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function player(team,index,stats){return {team,index,x:team===0?180+index*35:W-180-index*35,y:H/2+(index-2)*85,vx:0,vy:0,r:stats?stats.rating:9,color:team===0?(stats?.color||colors[0]):'#ff6675',stats:stats||{speed:0,tackle:0,accuracy:0},name:stats?.name||'CPU',angle:0};}
function setup(){players=[];for(let i=0;i<5;i++)players.push(player(0,i,squad[i%squad.length]));for(let i=0;i<5;i++)players.push(player(1,i));ball={x:W/2,y:H/2,vx:0,vy:0,owner:null};time=90;ended=false;matchId++;updateHud();}
function nearest(team){return players.filter(p=>p.team===team).sort((a,b)=>dist(a,ball)-dist(b,ball))[0]}
function controller(){let own=players.find(p=>p===ball.owner&&p.team===0);return own||nearest(0)}
function gainBall(p){ball.owner=p;ball.vx=ball.vy=0;}
function movePlayer(p,dx,dy,dt){let mag=Math.hypot(dx,dy)||1;dx/=mag;dy/=mag;let speed=1.7*(1+Math.min(2,p.stats.speed*.1));p.x=clamp(p.x+dx*speed*dt*60,18,W-18);p.y=clamp(p.y+dy*speed*dt*60,18,H-18);if(dx||dy)p.angle=Math.atan2(dy,dx);}
function update(dt){if(ended)return;time-=dt;if(time<=0){time=0;ended=true;if(score[0]>score[1]){wins++;coins+=150;}else coins+=50;updateHud();}
 controlled=controller();
 for(const p of players){if(p.team===0&&p===controlled){let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);let sprint=keys.Shift?1.35:1;let old=p.stats.speed;p.stats.speed+=0;movePlayer(p,dx*sprint,dy*sprint,dt);continue;}
  let target;if(p.team===1){target=ball.owner&&ball.owner.team===1?{x:ball.x+(p.index-2)*38,y:ball.y+(p.index-2)*32}:ball; if(p===nearest(1)||ball.owner?.team===0)target=ball;}
  else {target=ball.owner?.team===0?{x:ball.x+(p.index-2)*42,y:ball.y+(p.index-2)*34}:ball;if(p===nearest(0)&&ball.owner?.team!==0)target=ball;}
  let dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);if(d>12)movePlayer(p,dx,dy,dt*.72);
 }
 // AI with ball heads toward user's goal and occasionally shoots
 if(ball.owner?.team===1){let p=ball.owner;let goal={x:35,y:H/2};let dx=goal.x-p.x,dy=goal.y-p.y;if(Math.hypot(dx,dy)>95){p.x+=dx/Math.hypot(dx,dy)*.65;p.y+=dy/Math.hypot(dx,dy)*.65;}if(Math.random()<.012)shoot(p,goal.x,goal.y);}
 if(ball.owner){ball.x=ball.owner.x+Math.cos(ball.owner.angle||0)*16;ball.y=ball.owner.y+Math.sin(ball.owner.angle||0)*16;}
 else{ball.x+=ball.vx;ball.y+=ball.vy;ball.vx*=.985;ball.vy*=.985;if(ball.y<12||ball.y>H-12)ball.vy*=-.8;
  if(ball.x<0){score[1]++;resetBall();}if(ball.x>W){score[0]++;resetBall();}}
 // player collision, tackle chances based on points: 30% base + 2% per point, max 90%
 if(ball.owner){for(const p of players){if(p.team!==ball.owner.team&&dist(p,ball)<p.r+ball.owner.r+3){let chance=clamp(.30+p.stats.tackle*.02,.30,.90);if(Math.random()<chance)gainBall(p);}}}
 if(!ball.owner){for(const p of players){if(dist(p,ball)<p.r+9)gainBall(p);}}
}
function shoot(p,tx,ty){if(ball.owner!==p)return;let a=Math.atan2(ty-p.y,tx-p.x),accuracy=clamp(p.stats.accuracy*.08,0,.94);a+=(Math.random()-.5)*(1-accuracy)*2.4;ball.owner=null;ball.x=p.x;ball.y=p.y;ball.vx=Math.cos(a)*8.8;ball.vy=Math.sin(a)*8.8;}
function resetBall(){ball={x:W/2,y:H/2,vx:0,vy:0,owner:null};for(let p of players){p.x=p.team===0?160+p.index*30:W-160-p.index*30;p.y=H/2+(p.index-2)*82;}}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#24834c';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#ffffff9c';ctx.lineWidth=3;ctx.strokeRect(18,18,W-36,H-36);ctx.beginPath();ctx.moveTo(W/2,18);ctx.lineTo(W/2,H-18);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,75,0,Math.PI*2);ctx.stroke();ctx.strokeRect(18,H/2-115,115,230);ctx.strokeRect(W-133,H/2-115,115,230);ctx.fillStyle='#fff';ctx.fillRect(0,H/2-65,18,130);ctx.fillRect(W-18,H/2-65,18,130);
 for(const p of players){ctx.beginPath();ctx.fillStyle=p.color;ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();ctx.lineWidth=p===controlled?4:2;ctx.strokeStyle=p===controlled?'#fff36b':'#ffffffaa';ctx.stroke();ctx.fillStyle='#10212a';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(p.r),p.x,p.y);}
 ctx.beginPath();ctx.fillStyle='#f5f2e9';ctx.arc(ball.x,ball.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#263238';ctx.lineWidth=2;ctx.stroke();
 if(ended){ctx.fillStyle='#07131dcc';ctx.fillRect(0,0,W,H);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 42px system-ui';ctx.fillText(score[0]>score[1]?'GEWONNEN!':score[0]===score[1]?'GELIJKSPEL':'WEDSTRIJD VERLOREN',W/2,H/2-8);ctx.font='20px system-ui';ctx.fillText('Start een nieuwe wedstrijd',W/2,H/2+32);}
}
function updateHud(){document.getElementById('score').textContent=`Jij ${score[0]} — ${score[1]} CPU`;document.getElementById('clock').textContent=Math.ceil(time);document.getElementById('coins').textContent=coins;document.getElementById('wins').textContent=wins;renderSquad();}
function renderSquad(){document.getElementById('squad').innerHTML=squad.map((p,i)=>`<div class="player"><span class="dot" style="background:${p.color}">${p.rating}</span><div><strong>${p.name}</strong><small>Snel ${p.speed} · Bal ${p.tackle} · Schot ${p.accuracy}</small></div></div>`).join('');
 document.getElementById('upgradeList').innerHTML=squad.map((p,i)=>`<div class="upgrade"><span>${p.name} <b>${p.rating}</b></span><span><button data-i="${i}" data-s="speed">+ Snel</button> <button data-i="${i}" data-s="tackle">+ Bal</button> <button data-i="${i}" data-s="accuracy">+ Schot</button></span></div>`).join('');
 document.querySelectorAll('.upgrade button').forEach(b=>b.onclick=()=>{let p=squad[+b.dataset.i];if(coins<40)return;coins-=40;p[b.dataset.s]++;p.rating++;updateHud();});
}
function rarity(r){return r>=90?'MYTHISCH':r>=70?'LEGENDE':r>=45?'ELITE':r>=25?'ZELDZAAM':'GEWOON';}
function openPack(){if(coins<100){document.getElementById('pull').textContent='Niet genoeg munten!';return;}coins-=100;let roll=Math.random(),rating=roll<.01?90+Math.floor(Math.random()*11):roll<.08?70+Math.floor(Math.random()*20):roll<.28?45+Math.floor(Math.random()*25):roll<.65?25+Math.floor(Math.random()*20):8+Math.floor(Math.random()*17);let p={id:Date.now(),name:['Nova','Blitz','Comet','Vortex','Echo','Phantom','Raptor','Pixel'][Math.floor(Math.random()*8)],rating,color:colors[Math.floor(Math.random()*colors.length)],speed:0,tackle:0,accuracy:0};squad.push(p);document.getElementById('pull').innerHTML=`<span style="color:${rating>=90?'#ff72e8':rating>=70?'#ffd166':'#8ce4ff'}">${rarity(rating)} · ${p.name} · ${rating}</span><br>Nieuwe speler toegevoegd aan je selectie!`;updateHud();}
document.addEventListener('keydown',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(e.code==='Space'){e.preventDefault();let p=controller();if(p)shoot(p, p.team===0?W:0,H/2);}});
document.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false;});
document.getElementById('pack').onclick=openPack;document.getElementById('restart').onclick=()=>{score=[0,0];setup();};
function frame(t){let dt=Math.min((t-last)/1000||0,.04);last=t;update(dt);draw();document.getElementById('clock').textContent=Math.ceil(time);requestAnimationFrame(frame);}
setup();requestAnimationFrame(frame);
})();
