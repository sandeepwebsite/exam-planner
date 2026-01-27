/* ---------- SETTINGS & VERSION ---------- */
const APP_VERSION = '1.0.1'; // Update this whenever you change code
const versionElement = document.getElementById("appVersion");
if (versionElement) {
    versionElement.textContent = `Version: ${APP_VERSION}`;
}

/* ---------- SYLLABUS DATA ---------- */
const syllabus = {
    "Arithmetic": ["Number System",
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
    "Reasoning": ["Series (Number & Letter)",
                  "Analogies",
                  "Classification",
                  "Coding-Decoding",
                  "Directions",
                  "Blood Relation",
                  "Seating Arrangement",
                  "Syllogism"],
    "Data Interpretation": ["Tables", "Bar Graphs", "Pie Charts", "Line Graphs", "Data Sufficiency"],
    "Computer": ["MS Office (Word, Excel, PPT)", "OS & Software Basics", "Internet & Networking", "Keyboard Shortcuts"],
    "Current Affairs": ["October CA", "November CA", "December CA", "January CA"],
    "Odisha GK": ["Odisha History", "Odisha Geography", "Odisha Polity", "Odisha Economy", "Odisha Static GK"]
};

let data = JSON.parse(localStorage.getItem("syllabus")) || {};
const subjectSelect = document.getElementById("subjectSelect");
const timeSlots = [
    { start: "06:00", end: "07:00" }, { start: "07:15", end: "08:15" },
    { start: "08:30", end: "09:30" }, { start: "09:30", end: "10:30" },
    { start: "10:30", end: "12:00" }, { start: "12:00", end: "13:00" },
    { start: "14:30", end: "15:30" }, { start: "15:30", end: "16:30" },
    { start: "16:30", end: "17:30" }, { start: "17:30", end: "18:30" },
    { start: "19:00", end: "20:00" }, { start: "20:00", end: "21:00" }
];

/* ---------- INITIALIZE DATA ---------- */
Object.keys(syllabus).forEach(sub => {
    if (!data[sub]) {
        data[sub] = syllabus[sub].map(ch => ({ name: ch, rev: 0, last: null, done: false }));
    }
});
save();

/* ---------- EXAM COUNTDOWN ---------- */
const examDateInput = document.getElementById("examDate");
const countdownDisplay = document.getElementById("countdown");

if (examDateInput) {
    examDateInput.value = localStorage.getItem("examDate") || "";
    examDateInput.onchange = () => localStorage.setItem("examDate", examDateInput.value);
}

setInterval(() => {
    if (!examDateInput || !examDateInput.value) {
        if (countdownDisplay) countdownDisplay.textContent = "Set exam date";
        return;
    }
    const d = Math.floor((new Date(examDateInput.value) - new Date()) / 86400000);
    countdownDisplay.textContent = d <= 0 ? "🎉 Exam Day" : `⏳ ${d} Days Left`;
    countdownDisplay.className = "countdown" + (d <= 7 ? " danger" : "");
}, 1000);

/* ---------- CORE FUNCTIONS ---------- */
function save() { localStorage.setItem("syllabus", JSON.stringify(data)); }

function generateTodayPlan() {
    const today = new Date().toDateString();
    if (localStorage.todayPlanDate === today) {
        renderTodayPlan();
        return;
    }

    let pool = [];
    Object.keys(data).forEach(sub => {
        const incomplete = data[sub].filter(ch => !ch.done);
        let chapter = incomplete.length > 0 ? 
            incomplete[Math.floor(Math.random() * incomplete.length)] : 
            data[sub][Math.floor(Math.random() * data[sub].length)];
        
        if (chapter) {
            pool.push({ subject: sub, index: data[sub].indexOf(chapter), time: "" });
        }
    });

    let planToday = pool.slice(0, timeSlots.length).map((item, i) => ({
        ...item,
        time: `${timeSlots[i].start} – ${timeSlots[i].end}`,
        done: false
    }));

    localStorage.todayPlan = JSON.stringify(planToday);
    localStorage.todayPlanDate = today;
    renderTodayPlan();
}

function renderTodayPlan() {
    const body = document.getElementById("todayBody");
    if (!body) return;
    body.innerHTML = "";
    let plan = JSON.parse(localStorage.todayPlan || "[]");
    let doneCount = 0;

    plan.forEach((p, i) => {
        if (p.done) doneCount++;
        body.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${p.subject}</td>
                <td>${data[p.subject][p.index].name}</td>
                <td>${p.time}</td>
                <td><input type="checkbox" ${p.done ? "checked" : ""} onchange="completeToday(${i})"></td>
            </tr>`;
    });
    document.getElementById("tDone").textContent = doneCount;
    document.getElementById("tPending").textContent = plan.length - doneCount;
}

function completeToday(i) {
    let plan = JSON.parse(localStorage.todayPlan);
    plan[i].done = !plan[i].done;
    const p = plan[i];
    data[p.subject][p.index].done = plan[i].done;
    if (plan[i].done) data[p.subject][p.index].rev++;
    
    localStorage.todayPlan = JSON.stringify(plan);
    save();
    render();
}

function render() {
    renderTodayPlan();
    updateOverallSummary();
    const s = subjectSelect.value;
    const chapterList = document.getElementById("chapterList");
    if (!chapterList) return;
    chapterList.innerHTML = "";

    if (data[s]) {
        data[s].forEach((ch, i) => {
            chapterList.innerHTML += `
                <div class="chapter">
                    <div class="row"><b>${ch.name}</b><small>Rev: ${ch.rev}</small></div>
                    <div class="row">
                        <button onclick="incRevision('${s}', ${i})">🔁 Rev +</button>
                        <button onclick="toggleChapter('${s}', ${i})">${ch.done ? "Completed" : "Pending"}</button>
                    </div>
                </div>`;
        });
    }
}

function incRevision(s, i) { data[s][i].rev++; save(); render(); }
function toggleChapter(s, i) { data[s][i].done = !data[s][i].done; save(); render(); }

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

function resetProgress() {
    if (confirm("Reset everything?")) {
        localStorage.clear();
        location.reload();
    }
}

/* ---------- SERVICE WORKER ---------- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.onupdatefound = () => {
                const newWorker = reg.installing;
                newWorker.onstatechange = () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        alert("🔔 New update available! Please refresh.");
                        location.reload();
                    }
                };
            };
        });
    });
}

/* ---------- START ---------- */
subjectSelect.onchange = render;
generateTodayPlan();
render();
