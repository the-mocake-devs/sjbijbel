/* SJ = kern van de game: voortgang (enkel in geheugen), geluid, confetti, spelregisterr. */
const SJ = (() => {
  const games = {};
  const state = { xp:0, correct:0, bestCombo:0, medals:[], sound:false };
  const TITLES = [[0,"Bijbelbeginner"],[100,"Sacramentenkenner"],[250,"Feestenexpert"],[500,"Geloofsverkenner"],[900,"Religieuze allesweter"]];
  const $ = s => document.querySelector(s);
  const ico = name => `<i class="lni lni-${name}" aria-hidden="true"></i>`;
  const level = () => Math.floor(state.xp/100)+1;
  const title = () => TITLES.filter(t => state.xp >= t[0]).pop()[1];

  function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.id);toast.id=setTimeout(()=>t.classList.remove("show"),2600);}

  let ctx;
  function beep(freq=660,dur=.12){
    if(!state.sound) return;
    try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;g.gain.value=.06;
      o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);}catch(e){}
  }

  function confetti(){
    const c=$("#confetti"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;
    const cols=["#f4c542","#3f806d","#153c6b","#eaf2fb"];
    const p=Array.from({length:120},()=>({x:Math.random()*c.width,y:-20,vx:Math.random()*4-2,vy:Math.random()*4+2,s:Math.random()*8+4,c:cols[Math.random()*4|0]}));
    let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);
      p.forEach(q=>{q.x+=q.vx;q.y+=q.vy;x.fillStyle=q.c;x.fillRect(q.x,q.y,q.s,q.s);});
      if(++f<140) requestAnimationFrame(tick); else x.clearRect(0,0,c.width,c.height);})();
  }

  function addXp(n,{right=false,combo=0}={}){
    const oldLevel=level();state.xp+=n;if(right)state.correct++;
    state.bestCombo=Math.max(state.bestCombo,combo);
    if(level()>oldLevel){toast("Niveau "+level()+" bereikt!");confetti();}
    if(state.correct>=10&&!state.medals.some(m=>m.key==="correct10"))state.medals.push({key:"correct10", icon:"crown-3", text:"10 juist"});
    if(state.bestCombo>=5&&!state.medals.some(m=>m.key==="combo5"))state.medals.push({key:"combo5", icon:"fireworks", text:"Combo 5"});
    render();
  }

  function render(){
    $("#navLevel").textContent="Niveau "+level();
    const xp=$("#navXp");xp.textContent=state.xp+" XP";xp.classList.remove("pop");void xp.offsetWidth;xp.classList.add("pop");
    $("#sesTitle").textContent=title();$("#sesLevel").textContent="Niveau "+level();
    $("#sesBar").style.width=(state.xp%100)+"%";
    $("#sesText").textContent=`${state.xp} XP · ${state.correct} juiste antwoorden · beste combo ${state.bestCombo}`;
    $("#medals").innerHTML=state.medals.map(m=>`<span class="medal">${ico(m.icon)} ${m.text}</span>`).join("");
  }

  function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));scrollTo(0,0);}
  function home(){const g=games.__current;if(g&&g.stop)g.stop();games.__current=null;show("home");}
  function play(key){const g=games[key];if(!g)return toast("Deze spelmodus komt er snel aan.");
    games.__current=g;show("game");g.start($("#gameRoot"));}

  function registerGame(key,def){games[key]=def;}

  function pick(filter={}){ // helper voor alle spelmodi
    const bank = Array.isArray(questions) ? questions : [];
    let list=bank.filter(q=>(!filter.category||q.category===filter.category)&&(!filter.difficulty||q.difficulty===filter.difficulty));
    return list.map(q=>[Math.random(),q]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]).slice(0,filter.count||list.length);
  }

  function init(){
    // Klikken moet altijd werken, ook als de vragenbank niet geladen is.
    document.addEventListener("click",e=>{const p=e.target.closest("[data-play]");if(p)return play(p.dataset.play);if(e.target.closest("[data-go=home]")){e.preventDefault();home();}});
    const bank = Array.isArray(questions) ? questions : [];
    const cats = Array.isArray(CATEGORIES) ? CATEGORIES : [];
    const modes=[["quiz","target-user","Quiz Arena","Meerkeuze met uitleg per vraag."],["runner","bolt-2","Faith Runner","Ren, spring en kies de juiste baan."],
      ["memory","game-pad-modern-1","Memory Challenge","Koppel begrippen aan hun betekenis."],["daily","star-fat","Daily Challenge","Vijf opdrachten, vijf soorten."],["speed","bolt-3","Speed Quiz","Zoveel mogelijk binnen de tijd."]];
    $("#modeGrid").innerHTML=modes.map(m=>`<button class="mode ${games[m[0]]?"":"soon"}" data-play="${m[0]}"><span class="ico">${ico(m[1])}</span><h3>${m[2]}</h3><p>${m[3]}</p>${games[m[0]]?"":'<span class="tag">Binnenkort</span>'}</button>`).join("");
    $("#topicList").innerHTML=cats.map(c=>`<span class="topic">${c}<small>${bank.filter(q=>q.category===c).length}</small></span>`).join("");
    $("#soundBtn").onclick=function(){state.sound=!state.sound;this.innerHTML=ico(state.sound?"volume-high":"volume-mute");this.setAttribute("aria-pressed",state.sound);beep(880);};
    render();
  }
  return {init,registerGame,addXp,toast,beep,confetti,pick,home,ico,state};
})();
