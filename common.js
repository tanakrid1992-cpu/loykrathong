/* ใช้ร่วมกันทั้งหน้าหลักและหน้าเจ้าหน้าที่ */
const CFG = window.LK_CONFIG;
(() => { const r = document.documentElement.style; r.setProperty('--pri', CFG.colors.primary); r.setProperty('--acc', CFG.colors.accent); })();

/* ประเภทกระทง — ลำดับ (index) ต้องตรงกับ ECO_TYPES ใน supabase/schema.sql */
const TY = [
 {n:'ใบตอง',eco:1,d:'กระทงใบตองพับกลีบแบบดั้งเดิม ย่อยสลายได้',base:'#3f7a2c',side:'#1f4a16',L:[[12,30,13,20,'#2f6b22','#6fb34a'],[10,21,11,17,'#3d8a2c','#8fd162']],fl:['#ffb21f','#fff','#ff5c8a']},
 {n:'ดอกบัว',d:'กลีบบัวชมพูซ้อนชั้น สื่อถึงความบริสุทธิ์',base:'#2f6b22',side:'#173d10',L:[[10,30,16,28,'#e2558c','#ffd1e3'],[8,19,14,24,'#f27aa8','#fff0f6']],fl:['#ffe066']},
 {n:'ขนมปัง',eco:1,d:'ย่อยสลายง่าย เป็นอาหารปลา',base:'#d39a55',side:'#8a5424',bread:1,L:[[10,26,10,14,'#2f6b22','#7cc455']],fl:['#ff8fb1','#fff','#ffb21f']},
 {n:'กาบมะพร้าว',eco:1,d:'วัสดุธรรมชาติ แข็งแรง ลอยได้นาน',base:'#6b4122',side:'#3b2412',coco:1,L:[[9,24,10,15,'#4f8f34','#a7dc7a']],fl:['#ff5c5c','#ffd23f']},
 {n:'ดาวเรือง',d:'ดอกดาวเรืองสีทอง เสริมความรุ่งเรือง',base:'#3f7a2c',side:'#1f4a16',L:[[12,28,12,18,'#2f6b22','#6fb34a']],ring:'#ffa514',fl:['#ffcf33']},
 {n:'หงส์',d:'กระทงรูปหงส์ขาว งามสง่า',base:'#eef2f8',side:'#a9b6c8',swan:1,L:[[9,22,10,15,'#cfd9e6','#ffffff']],fl:['#ff7aa8']},
 {n:'มงกุฎ',d:'กลีบทองซ้อนสามชั้น หรูหราอลังการ',base:'#3f7a2c',side:'#1f4a16',L:[[12,31,12,18,'#b8860b','#ffe48a'],[10,22,11,16,'#2f6b22','#7cc455'],[8,13,9,13,'#c9971c','#fff2b0']],fl:['#ff4d6d']},
 {n:'หยวกกล้วย',eco:1,d:'ฐานหยวกกล้วย ย่อยสลายเร็ว ไม่ทิ้งขยะ',base:'#e6edc4',side:'#9fb06d',L:[[10,27,11,17,'#2f6b22','#7cc455']],fl:['#ffffff','#ff9ec4']}
];

/* คำไม่สุภาพ — ให้ตรงกับตาราง bad_words ใน schema.sql (เพิ่มได้) */
const BAD = ['ควย','เหี้ย','เฮี้ย','สัส','สัด','เย็ด','หน้าหี','หีแตก','อีดอก','ดอกทอง','ไอ้สัตว์','อีสัตว์','ชิบหาย','ฉิบหาย','ระยำ','จัญไร','ส้นตีน','มึง','สันดาน','ไอ้ควาย','fuck','shit','bitch','asshole','cunt','bastard'];
function hasBad(s){ s=(s||'').toLowerCase(); return BAD.some(w=>s.includes(w)); }

const DB = (CFG.supabaseUrl && window.supabase) ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;
const esc = s => (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* วาดกระทง (พิกัดกลางฐาน = 0,0) */
const PI2 = Math.PI*2;
function petal(c,x,y,w,h,a,b){const g=c.createLinearGradient(0,y,0,y-h);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.beginPath();c.moveTo(x-w/2,y);c.quadraticCurveTo(x-w/2,y-h*.6,x,y-h);c.quadraticCurveTo(x+w/2,y-h*.6,x+w/2,y);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=.6;c.stroke()}
function ring(n,R0,f){const a=[];for(let i=0;i<n;i++){const t=i/n*PI2+.2;a.push([Math.cos(t)*R0,Math.sin(t)*R0*.32])}a.sort((p,q)=>p[1]-q[1]).forEach(p=>f(p[0],p[1]))}
function ball(c,x,y,r,col){const g=c.createRadialGradient(x-r*.3,y-r*.3,r*.2,x,y,r);g.addColorStop(0,'#fff3b0');g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,PI2);c.fill()}
function flower(c,x,y,col){c.fillStyle=col;for(let i=0;i<5;i++){const a=i/5*PI2;c.beginPath();c.arc(x+Math.cos(a)*2.6,y+Math.sin(a)*2.6,2.4,0,PI2);c.fill()}c.fillStyle='#ffd23f';c.beginPath();c.arc(x,y,1.6,0,PI2);c.fill()}
function el(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,PI2);c.fill()}
function drawK(c,k,t,ph){
 if(k.swan){c.fillStyle='#f4f7fb';c.beginPath();c.moveTo(-30,-2);c.quadraticCurveTo(-48,-18,-38,-30);c.quadraticCurveTo(-32,-12,-18,-6);c.fill()}
 el(c,0,k.coco?7:4,k.coco?36:38,k.coco?14:11,k.side);el(c,0,0,38,11,k.base);
 if(k.bread){c.fillStyle='#f0c88a';for(let i=0;i<14;i++){const a=i*2.4;c.fillRect(Math.cos(a)*(10+i*1.6),Math.sin(a)*(3+i*.4),2,2)}}
 if(k.coco){c.strokeStyle='rgba(255,220,170,.25)';c.lineWidth=1;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*10,-8);c.quadraticCurveTo(i*12,4,i*9,12);c.stroke()}}
 k.L.forEach((L,i)=>ring(L[0],L[1],(x,y)=>petal(c,x,y-2-i*7,L[2],L[3],L[4],L[5])));
 if(k.ring)ring(11,15,(x,y)=>ball(c,x,y-16,4.6,k.ring));
 if(k.swan){c.strokeStyle='#fff';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(22,-6);c.bezierCurveTo(36,-20,14,-34,26,-46);c.stroke();el(c,28,-47,5.5,5,'#fff');c.fillStyle='#ff9a2e';c.beginPath();c.moveTo(32,-49);c.lineTo(39,-46);c.lineTo(32,-44);c.fill();el(c,28,-48,1.1,1.1,'#222')}
 const cy=k.L.length>2?-6:0;
 k.fl.forEach((col,i)=>flower(c,(i-(k.fl.length-1)/2)*9,-24-(i%2)*3+cy,col));
 c.strokeStyle='#9b4a2a';c.lineWidth=1.2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(5,-24+cy);c.lineTo(8+i*3,-50+i*2+cy);c.stroke();el(c,8+i*3,-50+i*2+cy,1.2,1.2,'#ff4d2e')}
 c.fillStyle='#fff2d0';c.fillRect(-2.5,-42+cy,5,17);
 const f=Math.sin(t*18+ph)*1.2+Math.sin(t*7+ph*2),fy=-44+cy;
 let g=c.createRadialGradient(0,fy,1,0,fy,30);g.addColorStop(0,'rgba(255,190,90,.5)');g.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=g;c.fillRect(-30,fy-30,60,60);
 g=c.createLinearGradient(0,fy-12,0,fy+2);g.addColorStop(0,'#ff9a2e');g.addColorStop(1,'#fff7c2');c.fillStyle=g;c.beginPath();c.moveTo(Math.sin(t*9+ph),fy-12-f);c.quadraticCurveTo(4.5,fy-3,0,fy+2);c.quadraticCurveTo(-4.5,fy-3,Math.sin(t*9+ph),fy-12-f);c.fill();
}
