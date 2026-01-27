const APP_VERSION = '1.0.0'; // Update this when releasing new version
document.getElementById("appVersion").textContent = `Version: ${APP_VERSION}`;

/* ---------- DATA ---------- */
const syllabus = {
  "Arithmetic": [
    "Number System",
    "Percentage",
    "Ratio & Proportion",
    "Profit & Loss",
    "Simple Interest",
    "Compound Interest",
    "Speed, Time & Distance",
    "Time & Work",
    "Averages",
    "Mensuration",
    "Partnership & Mixtures"
  ],

  "Reasoning": [
    "Series (Number & Letter)",
    "Analogies",
    "Classification",
    "Coding-Decoding",
    "Directions",
    "Blood Relation",
    "Seating Arrangement",
    "Syllogism"
  ],

  "Data Interpretation": [
    "Tables",
    "Bar Graphs",
    "Pie Charts",
    "Line Graphs",
    "Data Sufficiency"
  ],

  "Computer": [
    "MS Office (Word, Excel, PPT)",
    "OS & Software Basics",
    "Internet & Networking",
    "Keyboard Shortcuts"
  ],

  "Current Affairs": [
    "October CA",
    "November CA",
    "December CA",
    "January CA"
  ],

  "Odisha GK": [
    "Odisha History",
    "Odisha Geography",
    "Odisha Polity",
    "Odisha Economy",
    "Odisha Static GK"
  ]
};


let data=JSON.parse(localStorage.getItem("syllabus"))||{};
const todayKey=new Date().toDateString();
const timeSlots = [
  { start: "06:00", end: "07:00" },
  { start: "07:15", end: "08:15" },
  { start: "08:30", end: "09:30" },
  { start: "09:30", end: "10:30" },
  { start: "10:30", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "14:30", end: "15:30" },
  { start: "15:30", end: "16:30" },
  { start: "16:30", end: "17:30" },
  { start: "17:30", end: "18:30" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" }
];


/* ---------- EXAM COUNTDOWN ---------- */
const examDate = document.getElementById("examDate");
const countdown = document.getElementById("countdown");

examDate.value = localStorage.getItem("examDate")||"";
examDate.onchange = () => {
  localStorage.setItem("examDate",examDate.value);
};

setInterval(()=>{
 if(!examDate.value){countdown.textContent="Set exam date"; return;}
 const d = Math.floor((new Date(examDate.value) - new Date())/86400000);
 countdown.textContent = d<=0 ? "🎉 Exam Day" : `⏳ ${d} Days Left`;
 countdown.className="countdown"+(d<=7?" danger":"");

 // Notification if exam < 7 days
 if(d > 0 && d <= 7){notify(`⏳ Exam in ${d} days!`, "Get ready for OSSC CGL");}
},1000);


//-----------Reset------------ //

function resetProgress(){
  if(!confirm("⚠️ Are you sure you want to reset all progress?")) return;

  // Reset every chapter
  Object.keys(data).forEach(sub=>{
    data[sub].forEach(ch=>{
      ch.done = false;
      ch.rev = 0;
      ch.last = null;
    });
  });

  // Clear today plan
  localStorage.removeItem("todayPlan");
  localStorage.removeItem("todayPlanDate");
  localStorage.warned = "";

  save();
  generateTodayPlan();
  render();
}


//---------Subject Input----------- //

function addChapter(){
  const s = subjectSelect.value;
  const input = document.getElementById("newChapterInput");
  const chapterName = input.value.trim();

  if(!s){
    alert("Please select a subject first!");
    return;
  }
  if(!chapterName){
    alert("Please enter chapter name!");
    return;
  }

  // Initialize subject data if not exists
  if(!data[s]){
    data[s] = [];
  }

  // Add new chapter
  data[s].push({name: chapterName, rev: 0, last: null, done: false});

  save();
  input.value = ""; // clear input
  render(); // update UI
}

// Initialize all subjects and chapters if not already in localStorage
Object.keys(syllabus).forEach(sub => {
  if(!data[sub] || !Array.isArray(data[sub])){
    data[sub] = syllabus[sub].map(ch => ({name:ch, rev:0, last:null, done:false}));
  }
});
save();


subjectSelect.onchange = () => {
  render(); // just render the selected subject's chapters
};


/* ---------- SUBJECT INIT ---------- */
function generateTodayPlan(){
  const today = new Date().toDateString();
  if(localStorage.todayPlanDate === today){
    renderTodayPlan();
    return;
  }

  const subjects = ["Arithmetic","Reasoning","Data Interpretation","Computer","Current Affairs","Odisha GK"];
  let pool = [];

  // Step 1: Take one chapter per subject (incomplete first)
  subjects.forEach(sub=>{
    if(data[sub]){
      const incomplete = data[sub].filter(ch=>!ch.done);
      let chapter;
      if(incomplete.length>0){
        // pick a random incomplete chapter
        chapter = incomplete[Math.floor(Math.random()*incomplete.length)];
      } else {
        // pick random chapter for revision
        chapter = data[sub][Math.floor(Math.random()*data[sub].length)];
      }
      const idx = data[sub].indexOf(chapter);
      pool.push({subject: sub, index: idx, rev: chapter.rev || 0});
    }
  });

  // Step 2: Fill remaining time slots with other incomplete chapters
  let allIncomplete = [];
  Object.keys(data).forEach(sub=>{
    data[sub].forEach((ch,i)=>{
      if(!ch.done && !pool.some(p=>p.subject===sub && p.index===i)){
        allIncomplete.push({subject: sub, index:i, rev: ch.rev||0});
      }
    });
  });

  allIncomplete.sort(()=>Math.random()-0.5);
  pool = pool.concat(allIncomplete);

  // Step 3: Fill only up to available time slots
  const totalSlots = Math.min(timeSlots.length, pool.length);
  let planToday = [];
  for(let i=0;i<totalSlots;i++){
    planToday.push({
      subject: pool[i].subject,
      index: pool[i].index,
      time: `${timeSlots[i].start} – ${timeSlots[i].end}`,
      done:false
    });
  }

  localStorage.todayPlan = JSON.stringify(planToday);
  localStorage.todayPlanDate = today;
  localStorage.warned = "";

  renderTodayPlan();
}



/* ---------- COMPLETE TODAY ---------- */
function completeToday(i){
  let plan = JSON.parse(localStorage.todayPlan);
  plan[i].done = !plan[i].done;
  if(plan[i].done){
    const p = plan[i];
    data[p.subject][p.index].rev++;
    data[p.subject][p.index].last = Date.now();
  }
  localStorage.todayPlan = JSON.stringify(plan);
  save();
  renderTodayPlan();
  updateOverallSummary();
}

/* ---------- DAILY WARNING ---------- */
function checkDailyWarning(){
  const hour = new Date().getHours();
  const box = document.getElementById("dailyWarning");

  if(hour < 20){ box.style.display="none"; return; }

  let plan = JSON.parse(localStorage.todayPlan || "[]");
  let incomplete = plan.some(p=>!p.done);
  box.style.display = incomplete ? "block" : "none";

  if(incomplete){
    box.style.display = "block";
    if(localStorage.warned !== "true"){   // check string explicitly
      alert("⚠️ Your today's study plan is still incomplete!");
      localStorage.warned = "true";
      notify("⚠️ Today's study plan incomplete", "Complete your schedule today!");
    }
  } else {
    box.style.display = "none";
  }

}

if(localStorage.todayPlanDate !== new Date().toDateString()) localStorage.warned="";

/* ---------- RENDER FUNCTIONS ---------- */
function renderTodayPlan(){
  const body = document.getElementById("todayBody");
  body.innerHTML = "";

  let plan = JSON.parse(localStorage.todayPlan || "[]");
  let done=0, pending=0;

  const now = new Date();
  const currentMinutes = now.getHours()*60 + now.getMinutes();

  plan.forEach((p,i)=>{
    if(p.done) done++; else pending++;

    const [startH, startM] = p.time.split("–")[0].trim().split(":").map(Number);
    const [endH, endM] = p.time.split("–")[1].trim().split(":").map(Number);
    const startMinutes = startH*60 + startM;
    const endMinutes = endH*60 + endM;

    const isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;

    body.innerHTML += `
      <tr style="background:${isActive ? '#38bdf880' : 'transparent'}">
        <td>${i+1}</td>
        <td>${p.subject}</td>
        <td>${data[p.subject][p.index].name}</td>
        <td>${p.time}</td>
        <td><input type="checkbox" ${p.done?"checked":""} onchange="completeToday(${i})"></td>
      </tr>
    `;
  });

  document.getElementById("tDone").textContent = done;
  document.getElementById("tPending").textContent = pending;
}


setInterval(renderTodayPlan, 60000); // refresh active row highlight every minute


function render(){
  renderTodayPlan();
  updateOverallSummary();
  const s = subjectSelect.value;
  if(!data[s]) return;

  const chapterList = document.getElementById("chapterList");
  chapterList.innerHTML="";
  let p=0,c=0;

  data[s].forEach((ch,i)=>{
    ch.done ? c++ : p++;
    chapterList.innerHTML += `
      <div class="chapter">
        <div class="row"><b>${i+1}. ${ch.name}</b><small>Rev: ${ch.rev}</small></div>
        <div class="row">
          <button onclick="incRevision(${i})">🔁 Rev +</button>
          <button onclick="toggleChapter(${i})">${ch.done ? "Completed" : "Pending"}</button>
        </div>
      </div>
    `;
  });

  document.getElementById("pCount").textContent = p;
  document.getElementById("cCount").textContent = c;
}

function incRevision(i){
  const s = subjectSelect.value;
  data[s][i].rev++;
  data[s][i].last = Date.now();
  save();
  render();
}

function toggleChapter(i){
  const s = subjectSelect.value;
  data[s][i].done = !data[s][i].done;
  save();
  render();
}

function updateOverallSummary(){
  const comp = document.getElementById("overallCompleted");
  const pend = document.getElementById("overallPending");

  if(!comp || !pend) return;

  let total = 0, done = 0;

  // Count all chapters in all subjects
  Object.keys(data).forEach(sub => {
    if(Array.isArray(data[sub])){
      total += data[sub].length;
      done += data[sub].filter(ch => ch.done).length;
    }
  });

  let pending = total - done;
  let donePct = total ? Math.round((done/total)*100) : 0;
  let pendPct = 100 - donePct;

  comp.innerText = `✔ Completed: ${done} (${donePct}%)`;
  pend.innerText = `⏳ Pending: ${pending} (${pendPct}%)`;
}



/* ---------- SAVE ---------- */
function save(){localStorage.setItem("syllabus",JSON.stringify(data))}

/* ---------- NOTIFICATION FUNCTION ---------- */
function notify(title, body){
  if(!("Notification" in window)) return;
  if(Notification.permission === "granted"){
    new Notification(title,{body});
  }else if(Notification.permission !== "denied"){
    Notification.requestPermission().then(permission=>{
      if(permission==="granted") new Notification(title,{body});
    });
  }
}

/* ---------- INIT ---------- */
generateTodayPlan();
checkDailyWarning();
render();

setInterval(checkDailyWarning, 60000); // check every minute

// -----code for SW.JS------ //
/* ---------- SERVICE WORKER REGISTRATION ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              alert("🔔 New version available! Refresh to update.");
            }
          }
        };
      };
    }).catch(err => console.log("SW registration failed:", err));
  }); // Added missing closing ) for addEventListener
}





