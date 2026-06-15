const checklistItems = [
  "発電機外観確認",
  "エンジン外観確認",
  "冷却水量確認",
  "潤滑油量確認",
  "燃料漏れ確認",
  "冷却水漏れ確認",
  "潤滑油漏れ確認",
  "バッテリー確認",
  "端子緩み確認",
  "ベルト確認",
  "排気漏れ確認",
  "DPF確認",
  "始動確認",
  "無負荷運転確認",
  "負荷試験確認",
  "停止確認"
];

const loadColumns = [
  "time","loadRate","loadKw","voltage","rPhase","sPhase","tPhase","waterTemp","oilTemp","oilPressure","frequency"
];

const defaultRows = [
  {loadRate:"0%"},
  {loadRate:"10%"},
  {loadRate:"20%"},
  {loadRate:"30%"},
  {loadRate:"40%"},
  {loadRate:"50%"},
  {loadRate:"75%"},
  {loadRate:"100%"}
];

let photos = [];

document.addEventListener("DOMContentLoaded", () => {
  renderChecklist();
  renderDefaultLoadRows();
  loadDraft();
  document.addEventListener("input", debounce(saveDraft, 700));
});

function renderChecklist(){
  const box = document.getElementById("checklist");
  box.innerHTML = checklistItems.map((name, i) => `
    <label class="check-item">
      <input type="checkbox" id="check_${i}">
      <span>${name}</span>
    </label>
  `).join("");
}

function renderDefaultLoadRows(){
  const tbody = document.getElementById("loadRows");
  tbody.innerHTML = "";
  defaultRows.forEach(row => addLoadRow(row));
}

function addLoadRow(values = {}){
  const tbody = document.getElementById("loadRows");
  const tr = document.createElement("tr");
  tr.innerHTML = loadColumns.map(col => {
    const cls = col === "time" ? "time-input" : "";
    const type = col === "time" ? "text" : "text";
    const placeholderMap = {
      time:"10:00", loadRate:"30%", loadKw:"96", voltage:"200",
      rPhase:"120", sPhase:"120", tPhase:"120",
      waterTemp:"82", oilTemp:"95", oilPressure:"0.45", frequency:"50.0"
    };
    return `<td><input class="${cls}" data-load-col="${col}" type="${type}" inputmode="decimal" placeholder="${placeholderMap[col] || ""}" value="${values[col] || ""}"></td>`;
  }).join("");
  tbody.appendChild(tr);
}

function removeLoadRow(){
  const tbody = document.getElementById("loadRows");
  if(tbody.children.length > 1) tbody.lastElementChild.remove();
  saveDraft();
}

function addPhoto(){
  const id = `photo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  photos.push({id, src:"", title:"", note:""});
  renderPhotos();
  saveDraft();
}

function removePhoto(id){
  photos = photos.filter(p => p.id !== id);
  renderPhotos();
  saveDraft();
}

function renderPhotos(){
  const box = document.getElementById("photos");
  box.innerHTML = photos.map((p, index) => `
    <div class="photo-row" data-photo-id="${p.id}">
      ${p.src ? `<img class="photo-preview" src="${p.src}" alt="写真${index+1}">` : `<div class="photo-preview"></div>`}
      <div class="photo-meta">
        <strong>No.${index + 1}</strong>
        <label>写真選択<input type="file" accept="image/*" onchange="setPhotoFile('${p.id}', this)"></label>
        <label>タイトル<input value="${escapeHtml(p.title || "")}" oninput="setPhotoText('${p.id}','title',this.value)" placeholder="例）発電機外観"></label>
        <label>写真備考<textarea oninput="setPhotoText('${p.id}','note',this.value)" placeholder="例）負荷試験実施状況">${escapeHtml(p.note || "")}</textarea></label>
        <button type="button" class="photo-remove" onclick="removePhoto('${p.id}')">削除</button>
      </div>
    </div>
  `).join("");
}

function setPhotoFile(id, input){
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const photo = photos.find(p => p.id === id);
    if(photo){
      photo.src = reader.result;
      renderPhotos();
      saveDraft();
    }
  };
  reader.readAsDataURL(file);
}

function setPhotoText(id, key, value){
  const photo = photos.find(p => p.id === id);
  if(photo){
    photo[key] = value;
    saveDraft();
  }
}

function collectData(){
  const ids = [
    "client","project","facility","address","date","capacity","ratedVoltage","maker",
    "generatorModel","engineModel","engineNo","worker",
    "dcVoltage","oilPressure","oilTemp","waterTemp","frequency","rpm","remarks"
  ];
  const data = {};
  ids.forEach(id => data[id] = document.getElementById(id)?.value || "");
  data.checks = checklistItems.map((name, i) => ({
    name,
    checked: !!document.getElementById(`check_${i}`)?.checked
  }));
  data.loads = [...document.querySelectorAll("#loadRows tr")].map(tr => {
    const row = {};
    tr.querySelectorAll("input[data-load-col]").forEach(input => row[input.dataset.loadCol] = input.value);
    return row;
  });
  data.photos = photos;
  return data;
}

function applyData(data){
  if(!data) return;
  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if(el && typeof data[id] === "string") el.value = data[id];
  });
  if(Array.isArray(data.checks)){
    data.checks.forEach((c, i) => {
      const el = document.getElementById(`check_${i}`);
      if(el) el.checked = !!c.checked;
    });
  }
  if(Array.isArray(data.loads) && data.loads.length){
    document.getElementById("loadRows").innerHTML = "";
    data.loads.forEach(row => addLoadRow(row));
  }
  if(Array.isArray(data.photos)){
    photos = data.photos;
    renderPhotos();
  }
}

function saveDraft(){
  localStorage.setItem("hit_load_test_draft_v3", JSON.stringify(collectData()));
}

function loadDraft(){
  try{
    const raw = localStorage.getItem("hit_load_test_draft_v3");
    if(raw) applyData(JSON.parse(raw));
  }catch(e){}
}

function buildPrint(){
  const d = collectData();
  const printArea = document.getElementById("printArea");

  const infoRows = [
    ["宛先", d.client], ["件名", d.project], ["施設名", d.facility], ["住所", d.address],
    ["測定日", d.date], ["担当者", d.worker], ["メーカー", d.maker], ["発電機型式", d.generatorModel],
    ["エンジン型式", d.engineModel], ["機関番号", d.engineNo], ["発電機出力", d.capacity], ["定格電圧", d.ratedVoltage]
  ];

  const checkRows = d.checks.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${c.checked ? "✓" : ""}</td></tr>`).join("");

  const loadHead = `<tr><th>時間</th><th>負荷率</th><th>負荷kW</th><th>電圧</th><th>R相</th><th>S相</th><th>T相</th><th>水温</th><th>油温</th><th>油圧</th><th>周波数</th></tr>`;
  const loadRows = d.loads.map(r => `<tr>${loadColumns.map(c => `<td>${escapeHtml(r[c] || "")}</td>`).join("")}</tr>`).join("");

  const photoRows = d.photos.map((p, i) => `
    <div class="print-photo-row">
      <div>${p.src ? `<img src="${p.src}">` : ""}</div>
      <div>
        <strong>No.${i + 1}</strong><br>
        <strong>${escapeHtml(p.title || "")}</strong>
        <p>${escapeHtml(p.note || "").replace(/\n/g,"<br>")}</p>
      </div>
    </div>
  `).join("");

  printArea.innerHTML = `
    <div class="print-page">
      <h1>負荷試験報告書</h1>
      <table class="print-info">${infoRows.map(r => `<tr><th>${r[0]}</th><td>${escapeHtml(r[1] || "")}</td></tr>`).join("")}</table>
      <h2>運転・測定値</h2>
      <table class="print-info">
        <tr><th>直流電圧</th><td>${escapeHtml(d.dcVoltage)}</td><th>油圧</th><td>${escapeHtml(d.oilPressure)}</td></tr>
        <tr><th>油温</th><td>${escapeHtml(d.oilTemp)}</td><th>水温</th><td>${escapeHtml(d.waterTemp)}</td></tr>
        <tr><th>周波数</th><td>${escapeHtml(d.frequency)}</td><th>回転数</th><td>${escapeHtml(d.rpm)}</td></tr>
      </table>
    </div>
    <div class="print-page">
      <h2>点検チェックリスト</h2>
      <table class="print-table"><tr><th>項目</th><th>確認</th></tr>${checkRows}</table>
    </div>
    <div class="print-page">
      <h2>負荷試験測定データ</h2>
      <table class="print-table">${loadHead}${loadRows}</table>
      <h2>備考</h2>
      <p>${escapeHtml(d.remarks || "").replace(/\n/g,"<br>")}</p>
    </div>
    <div class="print-page">
      <h2>写真帳</h2>
      ${photoRows || "<p>写真なし</p>"}
    </div>
  `;
}

function printReport(){
  buildPrint();
  window.print();
}

function debounce(fn, delay){
  let timer;
  return function(){
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  }
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
