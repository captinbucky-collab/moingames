import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91a9bf);
scene.fog = new THREE.Fog(0x91a9bf, 100, 520);
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, .1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.domElement.id='world'; renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9e1ff,0x554637,2.0));
const sun=new THREE.DirectionalLight(0xffe0b0,3.2); sun.position.set(-100,160,80); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-180;sun.shadow.camera.right=180;sun.shadow.camera.top=180;sun.shadow.camera.bottom=-180;scene.add(sun);

const mat=(c,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});
const groundMat=mat(0x69776c), roadMat=mat(0x252a31), lineMat=mat(0xd9d0ad), sidewalkMat=mat(0x9b9a91);
const buildingMats=[0xb8b3a8,0x9dabb5,0xd0c4ad,0x858f98,0xb8a58d,0x7d8790].map(c=>mat(c));
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.15;ground.receiveShadow=true;scene.add(ground);

// road grid
for(let i=-5;i<=5;i++){
  let z=i*48, x=i*48;
  let r1=new THREE.Mesh(new THREE.PlaneGeometry(1200,15),roadMat);r1.rotation.x=-Math.PI/2;r1.position.set(0,.01,z);scene.add(r1);
  let r2=new THREE.Mesh(new THREE.PlaneGeometry(15,1200),roadMat);r2.rotation.x=-Math.PI/2;r2.position.set(x,.012,0);scene.add(r2);
  for(let k=-11;k<=11;k++){
    const dash=new THREE.Mesh(new THREE.BoxGeometry(3,.025,.22),lineMat);dash.position.set(k*48,.04,z);scene.add(dash);
    const dash2=new THREE.Mesh(new THREE.BoxGeometry(.22,.025,3),lineMat);dash2.position.set(x,.04,k*48);scene.add(dash2);
  }
}
// sidewalks
for(let i=-5;i<=5;i++){for(let j=-5;j<=5;j++){
  const x=i*48,z=j*48;
  for(const [ox,oz,w,d] of [[0,11.3,45,7],[0,-11.3,45,7],[11.3,0,7,45],[-11.3,0,7,45]]){
    const s=new THREE.Mesh(new THREE.BoxGeometry(w,.25,d),sidewalkMat);s.position.set(x+ox,.03,z+oz);s.receiveShadow=true;scene.add(s);
  }
}}

// procedural buildings, gardens and landmarks
const buildings=[];
for(let gx=-5;gx<=5;gx++)for(let gz=-5;gz<=5;gz++){
 if(Math.abs(gx)<=0&&Math.abs(gz)<=0) continue;
 const cx=gx*48,cz=gz*48;
 for(let n=0;n<3;n++){
   const bx=cx+(n-1)*11+(Math.random()-.5)*3;
   const bz=cz+(Math.random()-.5)*13;
   const w=6+Math.random()*5,d=7+Math.random()*6,h=8+Math.random()*30;
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMats[Math.floor(Math.random()*buildingMats.length)]);
   b.position.set(bx,h/2,bz);b.castShadow=true;b.receiveShadow=true;scene.add(b);buildings.push(b);
   const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.8,.5,d*.8),mat(0x626b73));roof.position.set(bx,h+.25,bz);scene.add(roof);
   // dark window strips on street-facing wall
   for(let yy=3;yy<h-1;yy+=3.2)for(let xx=-w/2+1;xx<w/2-0.5;xx+=1.8){
    const win=new THREE.Mesh(new THREE.BoxGeometry(.9,1.1,.06),mat(0x263c50,.3,.2));
    win.position.set(bx+xx,yy,bz+d/2+.04);scene.add(win);
   }
 }
 // park trees
 if(Math.random()>.4){
   for(let t=0;t<3;t++){const tx=cx+(Math.random()-.5)*27,tz=cz+(Math.random()-.5)*25;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,2.5,7),mat(0x65432a));trunk.position.set(tx,1.2,tz);scene.add(trunk);
    const crown=new THREE.Mesh(new THREE.SphereGeometry(2.1,8,7),mat(0x315d3b));crown.position.set(tx,3.5,tz);crown.castShadow=true;scene.add(crown);
   }
 }
}
// distant green hills
for(let i=0;i<18;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),mat(0x526d59));hill.scale.set(35+Math.random()*35,10+Math.random()*18,24+Math.random()*25);hill.position.set((i-9)*65,-5,-360-Math.random()*50);scene.add(hill);}

// player avatar
const player=new THREE.Group();scene.add(player);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,.9,4,8),mat(0x4b287e));body.position.y=1.25;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),mat(0xc58c64));head.position.y=2.25;player.add(head);
const legMat=mat(0x252b38);
for(let x of [-.23,.23]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.75,.25),legMat);leg.position.set(x,.42,0);player.add(leg);}
player.position.set(2,0,2);

// player car
function makeCar(color=0x6d32ad){
 const g=new THREE.Group(), paint=mat(color,.3,.45), glass=mat(0x182b3b,.2,.2), tire=mat(0x111216);
 const base=new THREE.Mesh(new THREE.BoxGeometry(2.2,.65,4.2),paint);base.position.y=.75;base.castShadow=true;g.add(base);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.65,.8,2.1),glass);cabin.position.set(0,1.42,-.25);g.add(cabin);
 for(let x of [-1,1])for(let z of [-1.35,1.35]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.25,16),tire);wh.rotation.z=Math.PI/2;wh.position.set(x,.43,z);g.add(wh);}
 const lamp=mat(0xffe9a6,.2);for(let x of [-.72,.72]){const l=new THREE.Mesh(new THREE.BoxGeometry(.38,.18,.08),lamp);l.position.set(x,.86,2.12);g.add(l);}
 return g;
}
const car=makeCar();car.position.set(5,0,9);scene.add(car);
const traffic=[];
for(let i=0;i<16;i++){
 const c=makeCar([0xd6d6d6,0x245c8b,0xb43b35,0x22252b,0xd0b36a][i%5]);
 const axis=i%2, lane=(Math.floor(i/2)%3-1)*3.5, pos=-230+Math.random()*460;
 c.rotation.y=axis?Math.PI/2:0;
 if(axis)c.position.set(lane,0,pos);else c.position.set(pos,0,lane);
 scene.add(c);traffic.push({mesh:c,axis,lane,speed:7+Math.random()*9,dir:i%3===0?-1:1});
}

let driving=false,paused=false,cash=2500,health=100,speed=0,mission=0,missionTarget=new THREE.Vector3(90,0,90),missionActive=true;
const keys={};let yaw=0,pitch=.16,mouseDown=false,lastX=0,lastY=0;
document.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Escape')togglePause();if(e.key.toLowerCase()==='e')toggleVehicle();if(e.key.toLowerCase()==='m')document.getElementById('map').classList.toggle('hidden');});
document.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener('click',()=>{if(!paused)renderer.domElement.requestPointerLock?.();});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement&&!paused){yaw-=e.movementX*.0025;pitch=Math.max(-.2,Math.min(.65,pitch+e.movementY*.0018));}});
function toggleVehicle(){if(driving){driving=false;player.position.copy(car.position);player.position.x+=3;player.rotation.y=car.rotation.y;document.getElementById('mode').textContent='ON FOOT';}
 else if(player.position.distanceTo(car.position)<7){driving=true;document.getElementById('mode').textContent='DRIVING';showToast('VEHICLE ENTERED');}}
function togglePause(){paused=!paused;document.getElementById('pause').classList.toggle('hidden',!paused);if(paused)document.exitPointerLock?.();}
document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('continueBtn').onclick=()=>{document.getElementById('missionDone').classList.add('hidden');mission++;missionTarget.set((Math.random()-.5)*350,0,(Math.random()-.5)*350);missionActive=true;updateMission();};
function showToast(t){const el=document.getElementById('missionToast');el.textContent=t;el.style.opacity=1;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.style.opacity=0,2800);}
function updateMission(){document.getElementById('mission').textContent=String(mission+1).padStart(2,'0')+' / '+['CITY EXPLORER','MARKET DELIVERY','MARGALLA RUN','NIGHT RIDER'][mission%4];}
updateMission();showToast('MISSION 01: REACH THE PURPLE CHECKPOINT');

// checkpoint marker
const ring=new THREE.Mesh(new THREE.TorusGeometry(4,.35,10,32),mat(0xb36bff,.3,.3));ring.rotation.x=Math.PI/2;scene.add(ring);
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,12,8),new THREE.MeshBasicMaterial({color:0x9b4dff,transparent:true,opacity:.35}));scene.add(beam);
function placeTarget(){ring.position.set(missionTarget.x,.25,missionTarget.z);beam.position.set(missionTarget.x,6,missionTarget.z);}
placeTarget();

const clock=new THREE.Clock();
function updateMap(){
 const c=document.getElementById('mapCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,170,170);ctx.fillStyle='#111827';ctx.fillRect(0,0,170,170);
 ctx.strokeStyle='#596170';ctx.lineWidth=5;for(let i=0;i<170;i+=48){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,170);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(170,i);ctx.stroke();}
 const p=driving?car.position:player.position;ctx.fillStyle='#bb8aff';ctx.beginPath();ctx.arc(85+(p.x%400)*.18,85+(p.z%400)*.18,4,0,7);ctx.fill();
 ctx.fillStyle='#ffdc74';ctx.beginPath();ctx.arc(85+(missionTarget.x%400)*.18,85+(missionTarget.z%400)*.18,4,0,7);ctx.fill();
}
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
 if(!paused){
  const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
  const side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  if(driving){
   speed+=(forward*24-speed*1.5)*dt;if(keys[' '])speed*=Math.max(0,1-5*dt);speed=Math.max(-18,Math.min(48,speed));
   car.rotation.y+=side*dt*(Math.abs(speed)/18)*.9;
   car.position.x+=Math.sin(car.rotation.y)*speed*dt;car.position.z+=Math.cos(car.rotation.y)*speed*dt;
   player.position.copy(car.position);
  }else{
   const move=new THREE.Vector3(side,0,forward);if(move.length()>0)move.normalize();
   const sp=keys.shift?13:7;const ang=yaw;
   player.position.x+=(move.x*Math.cos(ang)+move.z*Math.sin(ang))*sp*dt;
   player.position.z+=(-move.x*Math.sin(ang)+move.z*Math.cos(ang))*sp*dt;
   if(move.length()>0)player.rotation.y=Math.atan2(move.x,move.z);
   speed=0;
  }
  // traffic motion and simple wrap
  traffic.forEach(t=>{const v=t.speed*t.dir*dt;if(t.axis)t.mesh.position.z+=v;else t.mesh.position.x+=v;
   if(Math.abs(t.axis?t.mesh.position.z:t.mesh.position.x)>270){if(t.axis)t.mesh.position.z=-270;else t.mesh.position.x=-270;}
  });
  // camera follows player/car
  const target=driving?car.position:player.position;
  const dist=driving?11:8, height=driving?5:4.2;
  const desired=new THREE.Vector3(target.x-Math.sin(yaw)*dist,height,target.z-Math.cos(yaw)*dist);
  camera.position.lerp(desired,.12);camera.lookAt(target.x,target.y+(driving?1.1:1.5),target.z);
  ring.rotation.z+=dt*.7;beam.material.opacity=.25+Math.sin(clock.elapsedTime*3)*.12;
  const d=target.distanceTo(missionTarget);
  if(missionActive&&d<7){missionActive=false;cash+=1000;document.getElementById('cash').textContent='₨ '+cash.toLocaleString();document.getElementById('missionDone').classList.remove('hidden');showToast('CHECKPOINT REACHED · +₨ 1,000');}
  document.getElementById('speed').textContent=Math.round(Math.abs(speed)*3.6);
  document.getElementById('health').textContent=health;document.getElementById('healthbar').style.width=health+'%';
  document.getElementById('hint').textContent=driving?'WASD DRIVE · SPACE HANDBRAKE · E EXIT':'WASD MOVE · SHIFT SPRINT · E ENTER CAR';
  updateMap();
 }
 renderer.render(scene,camera);
}
camera.position.set(0,6,-10);animate();
document.getElementById('loading').style.display='none';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
