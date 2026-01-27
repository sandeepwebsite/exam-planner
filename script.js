/* ---------- VERSION & SETTINGS ---------- */
import './version.js';

document.getElementById('appVersion').textContent =
  `Version: ${APP_VERSION}`;



const syllabus = {
    "Arithmetic": ["Number System", "Percentage", "Ratio & Proportion", "Profit & Loss", "Simple Interest", "Compound Interest", "Speed, Time & Distance", "Time & Work", "Averages", "Mensuration", "Partnership & Mixtures"],
    "Reasoning": ["Series (Number & Letter)", "Analogies", "Classification", "Coding-Decoding", "Directions", "Blood Relation", "Seating Arrangement", "Syllogism"],
    "Data Interpretation": ["Tables", "Bar Graphs", "Pie Charts", "Line Graphs", "Data Sufficiency"],
    "Computer": ["MS Office (Word, Excel, PPT)", "OS & Software Basics", "Internet & Networking", "Keyboard Shortcuts"],
    "Current Affairs": ["October CA", "November CA", "December CA", "January CA"],
    "Odisha History": [
    "Ancient History of Odisha",
    "Medieval History of Odisha",
    "Modern History of Odisha",
    "Freedom Struggle in Odisha"
  ],
  "Odisha Geography": [
    "Geographical Features of Odisha",
    "Climate of Odisha",
    "Soils of Odisha",
    "Drainage System of Odisha",
    "Agriculture and Irrigation in Odisha",
    "Animal Husbandry and Fishery in Odisha",
    "Forests of Odisha",
    "National Parks and Wildlife Sanctuaries in Odisha",
    "Caste and Tribes of Odisha",
    "Demographic Profile of Odisha"
  ],
  "Odisha Economy": [
    "Mineral Resources of Odisha",
    "Industries of Odisha",
    "Energy Sector of Odisha",
    "Transport in Odisha",
    "Communication and Cinema in Odisha",
    "Tourism in Odisha",
    "Education and Health in Odisha",
    "Social Welfare Schemes of Odisha"
  ],
  "Odisha Polity": [
    "Formation of Odisha",
    "Administrative Set-up of Odisha",
    "Odisha Judiciary",
    "Local Self-Government and Panchayati Raj in Odisha",
    "District Profile of Odisha"
  ],
  "Odisha Static GK": [
    "Language and Literature of Odisha",
    "Folk Art, Craft and Culture of Odisha",
    "Music and Dance of Odisha",
    "Fairs, Festivals and Cuisines of Odisha",
    "Sports in Odisha",
    "Awards and Honours of Odisha",
    "Historical and Other Famous Personalities of Odisha"
  ]
};

let data = JSON.parse(localStorage.getItem("syllabus")) || {};
const timeSlots = [
    { start: "06:00", end: "07:00" }, { start: "07:15", end: "08:15" },
    { start: "08:30", end: "09:30" }, { start: "09:30", end: "10:30" },
    { start: "10:30", end: "12:00" }, { start: "12:00", end: "13:00" },
    { start: "14:30", end: "15:30" }, { start: "15:30", end: "16:30" },
    { start: "16:30", end: "17:30" }, { start: "17:30", end: "18:30" },
    { start: "19:00", end: "20:00" }, { start: "20:00", end: "21:00" }
];

const subjectSelect = document.getElementById("subjectSelect");

/* ---------- INITIALIZATION ---------- */
Object.keys(syllabus).forEach(sub => {
    if (!data[sub]) {
        data[sub] = syllabus[sub].map(ch => ({ name: ch, rev: 0, last: null, done: false }));
    }
});
save();
function resetProgress() {
    // 1. Ask for confirmation
    if (!confirm("⚠️ Are you sure you want to reset all progress? This cannot be undone.")) return;

    // 2. Clear the master data object
    Object.keys(data).forEach(sub => {
        if (Array.isArray(data[sub])) {
            data[sub].forEach(ch => {
                ch.done = false;
                ch.rev = 0;
                ch.last = null;
            });
        }
    });

    // 3. Clear the daily plan and storage keys
    localStorage.removeItem("todayPlan");
    localStorage.removeItem("todayPlanDate");
    localStorage.removeItem("examDate"); // Optional: remove if you want to reset the date too
    
    // 4. Save the empty state
    save();

    // 5. Force a refresh to show the clean state
    alert("🔄 Progress has been reset.");
    location.reload(); 
}
/* ---------- EXAM COUNTDOWN ---------- */
const examDate = document.getElementById("examDate");
const countdown = document.getElementById("countdown");
examDate.value = localStorage.getItem("examDate") || "";
examDate.onchange = () => localStorage.setItem("examDate", examDate.value);

setInterval(() => {
    if (!examDate.value) { countdown.textContent = "Set exam date"; return; }
    const d = Math.floor((new Date(examDate.value) - new Date()) / 86400000);
    countdown.textContent = d <= 0 ? "🎉 Exam Day" : `⏳ ${d} Days Left`;
    countdown.className = "countdown" + (d <= 7 ? " danger" : "");
}, 1000);



// ----- Completed and Pending Modal ----- //

function showCompletedModal() {
    const modal = document.getElementById("pendingModal");
    const list = document.getElementById("modalList");
    const title = document.getElementById("modalTitle");

    // Check if elements exist before using them to prevent the "null" error
    if (!modal || !list || !title) {
        console.error("Modal elements missing in HTML!");
        return;
    }

    title.innerText = "✅ Completed Chapters";
    title.style.color = "var(--done)";
    list.innerHTML = ""; 

    let foundAny = false;
    Object.keys(data).forEach(sub => {
        const completedInSub = data[sub].filter(ch => ch.done);
        if (completedInSub.length > 0) {
            foundAny = true;
            list.innerHTML += `<h3 style="color:var(--text-dim); margin-top:15px; font-size:0.9rem; border-left: 3px solid var(--done); padding-left: 8px;">${sub}</h3>`;
            completedInSub.forEach(ch => {
                list.innerHTML += `
                    <div class="pending-item">
                        <span>${ch.name}</span>
                        <b style="color:var(--done)">Rev: ${ch.rev}</b>
                    </div>`;
            });
        }
    });

    if (!foundAny) list.innerHTML = "<p style='text-align:center; padding:20px;'>No chapters completed yet.</p>";
    modal.style.display = "block";
}

function showPendingModal() {
    const modal = document.getElementById("pendingModal");
    const list = document.getElementById("modalList");
    const title = document.getElementById("modalTitle");

    if (!modal || !list || !title) return;

    title.innerText = "📚 All Pending Chapters";
    title.style.color = "var(--pending)";
    list.innerHTML = ""; 

    let foundAny = false;
    Object.keys(data).forEach(sub => {
        const pendingInSub = data[sub].filter(ch => !ch.done);
        if (pendingInSub.length > 0) {
            foundAny = true;
            list.innerHTML += `<h3 style="color:var(--text-dim); margin-top:15px; font-size:0.9rem; border-left: 3px solid var(--pending); padding-left: 8px;">${sub}</h3>`;
            pendingInSub.forEach(ch => {
                list.innerHTML += `
                    <div class="pending-item">
                        <span>${ch.name}</span>
                        <b style="color:var(--accent)">Rev: ${ch.rev}</b>
                    </div>`;
            });
        }
    });

    if (!foundAny) list.innerHTML = "<p style='text-align:center; padding:20px;'>🎉 All chapters completed!</p>";
    modal.style.display = "block";
}


/* --- Close Modal Controls --- */
function closeModal() {
    const modal = document.getElementById("pendingModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Also, add this to allow clicking outside the box to close it
window.onclick = function(event) {
    const modal = document.getElementById("pendingModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

/* ---------- SYNC LOGIC (The Fix) ---------- */

function completeToday(i) {
    let plan = JSON.parse(localStorage.todayPlan);
    let p = plan[i];
    
    // Toggle plan status
    plan[i].done = !plan[i].done;
    
    // CRITICAL FIX: Sync with master data
    if (data[p.subject] && data[p.subject][p.index]) {
        data[p.subject][p.index].done = plan[i].done; // Update "done" status
        if (plan[i].done) {
            data[p.subject][p.index].rev++;
            data[p.subject][p.index].last = Date.now();
        }
    }
    
    localStorage.todayPlan = JSON.stringify(plan);
    save();
    render(); // This re-renders both sections
}

function toggleChapter(i) {
    const s = subjectSelect.value;
    data[s][i].done = !data[s][i].done;
    save();
    render();
}

function incRevision(i) {
    const s = subjectSelect.value;
    data[s][i].rev++;
    data[s][i].last = Date.now();
    save();
    render();
}

/* ---------- RENDER FUNCTIONS ---------- */

function render() {
    renderTodayPlan();
    updateOverallSummary();
    const s = subjectSelect.value;
    if (!data[s]) return;

    const chapterList = document.getElementById("chapterList");
    chapterList.innerHTML = "";
    let p = 0, c = 0;

    data[s].forEach((ch, i) => {
        ch.done ? c++ : p++;
        const btnClass = ch.done ? "btn-status-completed" : "btn-status-pending";
        chapterList.innerHTML += `
            <div class="chapter">
                <div class="row"><b>${ch.name}</b><small>Rev: ${ch.rev}</small></div>
                <div class="row">
                    <button onclick="incRevision(${i})">🔁 Rev +</button>
                    <button onclick="toggleChapter(${i})" class="${btnClass}">${ch.done ? "✔ Completed" : "⏳ Pending"}</button>
                </div>
            </div>`;
    });
    document.getElementById("pCount").textContent = p;
    document.getElementById("cCount").textContent = c;
}

function renderTodayPlan() {
    const body = document.getElementById("todayBody");
    body.innerHTML = "";
    let plan = JSON.parse(localStorage.todayPlan || "[]");
    let done = 0;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    plan.forEach((p, i) => {
        if (p.done) done++;
        const [startH, startM] = p.time.split("–")[0].trim().split(":").map(Number);
        const [endH, endM] = p.time.split("–")[1].trim().split(":").map(Number);
        const isActive = currentMinutes >= (startH * 60 + startM) && currentMinutes < (endH * 60 + endM);

        body.innerHTML += `
            <tr style="background:${isActive ? 'rgba(125, 211, 252, 0.15)' : 'transparent'}; border-left: 4px solid ${isActive ? '#7dd3fc' : 'transparent'}">
                <td>${i + 1}</td>
                <td>${p.subject}</td>
                <td>${data[p.subject][p.index].name}</td>
                <td>${p.time}</td>
                <td><input type="checkbox" ${p.done ? "checked" : ""} onchange="completeToday(${i})"></td>
            </tr>`;
    });
    document.getElementById("tDone").textContent = done;
    document.getElementById("tPending").textContent = plan.length - done;
}

/* ---------- SYSTEM FUNCTIONS ---------- */

function save() { localStorage.setItem("syllabus", JSON.stringify(data)); }

function generateTodayPlan() {
    const today = new Date().toDateString();
    if (localStorage.todayPlanDate === today) {
        renderTodayPlan();
        return;
    }
    const subjects = Object.keys(syllabus);
    let pool = [];
    subjects.forEach(sub => {
        const incomplete = data[sub].filter(ch => !ch.done);
        let chapter = incomplete.length > 0 ? incomplete[Math.floor(Math.random() * incomplete.length)] : data[sub][0];
        pool.push({ subject: sub, index: data[sub].indexOf(chapter) });
    });
    let planToday = pool.slice(0, timeSlots.length).map((p, i) => ({
        ...p, time: `${timeSlots[i].start} – ${timeSlots[i].end}`, done: false
    }));
    localStorage.todayPlan = JSON.stringify(planToday);
    localStorage.todayPlanDate = today;
    renderTodayPlan();
}

// New Chapter Button

function addChapter() {
    const s = subjectSelect.value;
    const input = document.getElementById("newChapterInput");
    const chapterName = input.value.trim();

    // 1. Validation
    if (!s || s === "") {
        alert("⚠️ Please select a subject from the dropdown first!");
        return;
    }
    if (!chapterName) {
        alert("⚠️ Please enter a chapter name!");
        return;
    }

    // 2. Ensure the subject exists in our data object
    if (!data[s]) {
        data[s] = [];
    }

    // 3. Add the new chapter object
    data[s].push({
        name: chapterName,
        rev: 0,
        last: null,
        done: false
    });

    // 4. Save and Update UI
    save();
    input.value = ""; // Clear the input box
    render(); // Refresh the list to show the new chapter
    alert(`✅ Added "${chapterName}" to ${s}`);
}

function updateOverallSummary() {
    let total = 0, done = 0;
    Object.keys(data).forEach(sub => {
        total += data[sub].length;
        done += data[sub].filter(ch => ch.done).length;
    });
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("overallCompleted").innerText = `✔ Completed: ${done} (${pct}%)`;
    document.getElementById("overallPending").innerText = `⏳ Pending: ${total - done}`;
}


let studyStart = null;
let totalStudyMs = 0;

const todayDate = new Date().toDateString();

if (localStorage.studyDate !== todayDate) {
  localStorage.studyDate = todayDate;
  localStorage.totalStudyMs = 0;
  localStorage.studyStart = "";
}

totalStudyMs = Number(localStorage.totalStudyMs || 0);
studyStart = localStorage.studyStart ? Number(localStorage.studyStart) : null;

function startStudy(){
  if(studyStart) return; // already studying

  studyStart = Date.now();
  localStorage.studyStart = studyStart;

  document.getElementById("studyStatus").textContent = "Studying";
  document.getElementById("studyStatus").style.color = "var(--done)";
}

function takeBreak(){
  if (!studyStart) return;

  totalStudyMs += Date.now() - studyStart;
  studyStart = null;

  localStorage.totalStudyMs = totalStudyMs;
  localStorage.studyStart = "";

  const s = document.getElementById("studyStatus");
  if (s) {
    s.textContent = "Paused";
    s.style.color = "var(--pending)";
  }

  updateStudyTimeUI();
  updateStudyButtons();
}


function updateStudyTimeUI(){
  let ms = totalStudyMs;

  if(studyStart){
    ms += Date.now() - studyStart;
  }

  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);

  document.getElementById("studyTime").textContent =
    `${hrs}h ${mins % 60}m`;
}
setInterval(updateStudyTimeUI, 30000);
updateStudyTimeUI();

function saveDailyStudy(){
  const key = "dailyStudyHours";
  let history = JSON.parse(localStorage.getItem(key) || "{}");

  let ms = totalStudyMs;
  if(studyStart){
    ms += Date.now() - studyStart;
  }

  history[todayDate] = ms;

  // Keep only last 30 days
  const dates = Object.keys(history).sort(
    (a,b)=>new Date(a)-new Date(b)
  );
  while(dates.length > 30){
    delete history[dates.shift()];
  }

  localStorage.setItem(key, JSON.stringify(history));
}


function renderStudySlider(){
  const slider = document.getElementById("studySlider");
  if(!slider) return;

  let history = JSON.parse(localStorage.getItem("dailyStudyHours") || "{}");
  slider.innerHTML = "";

  Object.keys(history).sort(
    (a,b)=>new Date(a)-new Date(b)
  ).forEach(date=>{
    const ms = history[date];
    const mins = Math.floor(ms/60000);
    const hrs = Math.floor(mins/60);

    slider.innerHTML += `
      <div class="study-day ${date===todayDate?'today':''}">
        <div>${new Date(date).toLocaleDateString("en-IN",{day:'numeric',month:'short'})}</div>
        <div class="study-hours">${hrs}h ${mins%60}m</div>
      </div>
    `;
  });
}

function handleMidnightRollover(){
  const now = new Date();
  const today = now.toDateString();

  // If date changed
  if (localStorage.studyDate !== today) {

    // 1. Save yesterday's final study time
    saveDailyStudy();

    // 2. Reset timer for new day
    localStorage.studyDate = today;
    localStorage.totalStudyMs = 0;
    localStorage.studyStart = "";

    totalStudyMs = 0;
    studyStart = null;

    // 3. UI reset
    const status = document.getElementById("studyStatus");
    if (status) {
      status.textContent = "Paused";
      status.style.color = "var(--pending)";
    }

    updateStudyTimeUI();
    renderStudySlider();
  }
}

function restoreStudyState(){
  const status = document.getElementById("studyStatus");

  if (studyStart) {
    if (status) {
      status.textContent = "Studying";
      status.style.color = "var(--done)";
    }
  } else {
    if (status) {
      status.textContent = "Paused";
      status.style.color = "var(--pending)";
    }
  }

  updateStudyTimeUI();
  updateStudyButtons();
}

function updateStudyButtons(){
  const startBtn = document.getElementById("startBtn");
  const breakBtn = document.getElementById("breakBtn");

  if (!startBtn || !breakBtn) return;

  if (studyStart) {
    // Studying mode
    startBtn.disabled = true;
    breakBtn.disabled = false;
  } else {
    // Paused mode
    startBtn.disabled = false;
    breakBtn.disabled = true;
  }
}


restoreStudyState();


setInterval(handleMidnightRollover, 60000);






/* ---------- SERVICE WORKER AUTO-UPDATE ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('./sw.js');

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New version activated. Reloading...');
      window.location.reload();
    });

    reg.update();
  });
}

// Initial calls
subjectSelect.onchange = render;
generateTodayPlan();
render();
// Expose module functions globally so inline onclick works
window.resetProgress = resetProgress;
window.showPendingModal = showPendingModal;
window.showCompletedModal = showCompletedModal;
window.closeModal = closeModal;
window.toggleChapter = toggleChapter;
window.incRevision = incRevision;
window.completeToday = completeToday;
window.addChapter = addChapter;
window.startStudy = startStudy;
window.takeBreak = takeBreak;



