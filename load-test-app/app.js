import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

if (window.firebaseConfig) {
  const app = initializeApp(window.firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, user => { if (!user) location.href = '../login.html'; });
  document.getElementById('logoutBtn').onclick = () => signOut(auth).then(()=>location.href='../login.html');
}

const checkItems = [
'空気吸気口付近に吸気可能性の有る建物等無し','排気出口付近に可燃物等無し','排風筒付近に可燃物等無し','発電機装置外観に著しい損傷無し','発電機装置周辺の異臭無し','発電装置表示灯が以下の点灯状態確認','試験モード切替確認','発電装置に浸水・漏水・ひび割れ無し','発電装置に発錆無し','発電装置に油漏れ無し','冷却水漏れ無し','燃料油量確認','冷却水確認','ベルト張り損傷及び緩み無し','自動始動発電盤の計器・表示灯割れ無し','オイル量確認','発電機を始動できるか','故障項目の表示確認','交流電圧計表示','直流電圧計表示','油圧計表示','液晶表示の周波数表示','電流計の動作確認','油温計表示','水温計表示','負荷異常確認','停止ボタン確認','自動モードへの変更','発電装置扉閉止確認','発電装置周囲に異常無し','燃料油量確認（終了時）'
];
const checklist = document.getElementById('checklist');
checkItems.forEach((t,i)=>{ checklist.insertAdjacentHTML('beforeend',`<div class="check-item"><span>${i+1}</span><span>${t}</span><input type="checkbox" class="chk" checked></div>`)});
const loadRows = document.getElementById('loadRows');
window.addLoadRow = function(vals=['','','','','','','']){ const tr=document.createElement('tr'); tr.innerHTML=vals.map(v=>`<td><input value="${v}"></td>`).join(''); loadRows.appendChild(tr); };
addLoadRow(['10時20分〜','10%以上','32.3','201','93.3','93.7','92.9']);
addLoadRow(['10時25分〜','20%以上','6.6','200','185.4','19.0','185.5']);
addLoadRow(['10時30分〜','30%以上','63.4','200','277.9','183.1','277.8']);
window.addPhoto = function(){ const id=Date.now(); const box=document.createElement('div'); box.className='photo-card'; box.innerHTML=`<div><input type="file" accept="image/*" capture="environment"><img></div><div><label>写真タイトル<input class="ptitle" placeholder="発電機外観写真"></label><label>写真備考<textarea class="pnote" placeholder="設置場所：地上"></textarea></label><button type="button" onclick="this.closest('.photo-card').remove()">削除</button></div>`; const file=box.querySelector('input[type=file]'); const img=box.querySelector('img'); file.onchange=e=>{const r=new FileReader();r.onload=()=>img.src=r.result;r.readAsDataURL(e.target.files[0]);}; document.getElementById('photos').appendChild(box); };
window.saveDraft = function(){ const data={}; document.querySelectorAll('input,textarea').forEach((el,i)=>{ if(el.type!=='file') data[i]=el.value; }); localStorage.setItem('loadTestDraft',JSON.stringify(data)); alert('下書き保存しました'); };
function val(id){return document.getElementById(id)?.value||''}
window.onbeforeprint = function(){ const rows=[...loadRows.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('input')].map(i=>i.value)); const checks=[...document.querySelectorAll('.check-item')].map((r,i)=>[i+1,r.children[1].textContent,r.querySelector('input').checked?'✓':'']); const photos=[...document.querySelectorAll('.photo-card')].map((p,i)=>({no:i+1,src:p.querySelector('img').src,title:p.querySelector('.ptitle').value,note:p.querySelector('.pnote').value})).filter(p=>p.src);
let html=`<section class="page"><div>${val('client')} 御中</div><div class="title">負荷試験機による<br>発電機の出力及び電流値測定報告書</div><p>件名：${val('project')}</p><p>発電機出力：${val('capacity')}　${val('ratedVoltage')}</p><p>測定日：${val('date')}</p></section>`;
html+=`<section class="page"><h2>非常用発電機確認表</h2><table class="print-table"><tr><th>No.</th><th>点検項目</th><th>チェック</th></tr>${checks.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></section>`;
html+=`<section class="page"><h2>負荷試験測定データ表</h2><table class="print-table"><tr><th>施設名</th><td colspan="6">${val('facility')}</td></tr><tr><th>住所</th><td colspan="6">${val('address')}</td></tr><tr><th>発電機出力容量</th><td colspan="6">${val('capacity')}</td></tr><tr><th>時分</th><th>負荷率</th><th>負荷</th><th>電圧</th><th>R相(A)</th><th>S相(A)</th><th>T相(A)</th></tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table><h3>運転値</h3><p>直流電圧：${val('dcVoltage')}　油圧：${val('oilPressure')}　油温：${val('oilTemp')}　水温：${val('waterTemp')}　周波数：${val('frequency')}　回転数：${val('rpm')}</p><h3>備考</h3><p>${val('remarks')}</p></section>`;
photos.forEach(p=>{html+=`<section class="page"><div class="photo-print"><img src="${p.src}"><div class="photo-info"><div>No. ${p.no}</div><div><b>写真タイトル</b><br>${p.title}</div><div><b>写真備考</b><br>${p.note}</div></div></div></section>`});
document.getElementById('printArea').innerHTML=html; };
