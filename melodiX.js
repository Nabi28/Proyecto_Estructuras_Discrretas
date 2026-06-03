const ALGOS = [
  {id:'bubble', name:'Bubble Sort', color:'#4a9eff'},
  {id:'selection', name:'Selection Sort', color:'#3dd68c'},
  {id:'insertion', name:'Insertion Sort', color:'#ff6b6b'},
  {id:'merge', name:'Merge Sort', color:'#a78bfa'},
  {id:'quick', name:'Quick Sort', color:'#ffaa40'},
  {id:'heap', name:'Heap Sort', color:'#f472b6'},
  {id:'counting', name:'Counting Sort', color:'#2dd4bf'}
];

const COMPLEXITY = [
  {name:'Bubble Sort', best:'O(n)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:true, bc:'green', ac:'red', wc:'red'},
  {name:'Selection Sort', best:'O(n²)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:false, bc:'red', ac:'red', wc:'red'},
  {name:'Insertion Sort', best:'O(n)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:true, bc:'green', ac:'yellow', wc:'red'},
  {name:'Merge Sort', best:'O(n log n)', avg:'O(n log n)', worst:'O(n log n)', space:'O(n)', stable:true, bc:'green', ac:'green', wc:'green'},
  {name:'Quick Sort', best:'O(n log n)', avg:'O(n log n)', worst:'O(n²)', space:'O(log n)', stable:false, bc:'green', ac:'green', wc:'red'},
  {name:'Heap Sort', best:'O(n log n)', avg:'O(n log n)', worst:'O(n log n)', space:'O(1)', stable:false, bc:'green', ac:'green', wc:'green'},
  {name:'Counting Sort', best:'O(n+k)', avg:'O(n+k)', worst:'O(n+k)', space:'O(k)', stable:true, bc:'blue', ac:'blue', wc:'blue'}
];

const WHEN = [
  {name:'Bubble Sort', color:'#4a9eff', desc:'Ideal para fines educativos y listas muy pequeñas. Ineficiente en la práctica por su O(n²) consistente.'},
  {name:'Selection Sort', color:'#3dd68c', desc:'Útil cuando los intercambios físicos son costosos. Hace el mínimo de swaps (O(n)), aunque las comparaciones siguen siendo O(n²).'},
  {name:'Insertion Sort', color:'#ff6b6b', desc:'Muy eficiente en listas pequeñas (n < 50) o casi ordenadas. O(n) en mejor caso. Base de otros algoritmos híbridos como Timsort.'},
  {name:'Merge Sort', color:'#a78bfa', desc:'Preferido cuando se necesita estabilidad y O(n log n) garantizado. Ideal para listas enlazadas y datos externos en disco.'},
  {name:'Quick Sort', color:'#ffaa40', desc:'Generalmente el más rápido en la práctica. Excelente localidad de caché. Peor caso O(n²) evitable con pivote aleatorio o median-of-3.'},
  {name:'Heap Sort', color:'#f472b6', desc:'Garantiza O(n log n) con O(1) espacio extra. Útil en sistemas embebidos con memoria limitada. Menos amigable con la caché que Quick Sort.'},
  {name:'Counting Sort', color:'#2dd4bf', desc:'Lineal O(n+k) cuando el rango k es pequeño y conocido. Solo funciona con enteros. No apto si los valores tienen rango muy amplio.'}
];

let selectedAlgos = new Set(ALGOS.map(a => a.id));
let chartTime = null, chartComp = null, chartMulti = null;
let visSteps = [], visIdx = 0, visPlaying = false, visTimer = null;

function showTab(id) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', ['benchmark', 'visual', 'csv', 'info'][i] === id);
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (id === 'info') buildComplexityChart();
}

function buildToggles() {
  const c = document.getElementById('algoToggles');
  ALGOS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'algo-btn sel';
    b.style.background = a.color + '33';
    b.style.borderColor = a.color + '66';
    b.style.color = a.color;
    b.textContent = a.name;
    b.onclick = () => {
      if (selectedAlgos.has(a.id)) { if (selectedAlgos.size > 1) selectedAlgos.delete(a.id); }
      else selectedAlgos.add(a.id);
      if (selectedAlgos.has(a.id)) { b.style.background = a.color + '33'; b.style.borderColor = a.color + '66'; b.style.color = a.color; }
      else { b.style.background = ''; b.style.borderColor = ''; b.style.color = ''; }
    };
    c.appendChild(b);
  });
}

function buildComplexityTable() {
  const colorMap = { green: 'badge-green', yellow: 'badge-yellow', red: 'badge-red', blue: 'badge-blue' };
  document.getElementById('complexityTable').innerHTML = COMPLEXITY.map(r => `
    <tr>
      <td style="font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:var(--text)">${r.name}</td>
      <td><span class="badge ${colorMap[r.bc]}">${r.best}</span></td>
      <td><span class="badge ${colorMap[r.ac]}">${r.avg}</span></td>
      <td><span class="badge ${colorMap[r.wc]}">${r.worst}</span></td>
      <td><span class="badge badge-blue">${r.space}</span></td>
      <td>${r.stable ? '<span class="badge badge-green">Sí</span>' : '<span class="badge" style="background:var(--bg4);color:var(--text2)">No</span>'}</td>
    </tr>`).join('');
}

function buildWhen() {
  document.getElementById('whenToUse').innerHTML = WHEN.map(w => `
    <div class="when-item">
      <div class="when-dot" style="background:${w.color}"></div>
      <div>
        <div class="when-name">${w.name}</div>
        <div class="when-desc">${w.desc}</div>
      </div>
    </div>`).join('');
}

let complexityChartBuilt = false;
function buildComplexityChart() {
  if (complexityChartBuilt) return;
  complexityChartBuilt = true;
  const sizes = [100, 500, 1000, 2000, 5000];
  const datasets = [
    { label: 'O(n²)', data: sizes.map(n => n * n / 1e6), borderColor: '#ff6b6b', borderDash: [], tension: 0.4 },
    { label: 'O(n log n)', data: sizes.map(n => n * Math.log2(n) / 1e4), borderColor: '#3dd68c', borderDash: [], tension: 0.4 },
    { label: 'O(n)', data: sizes.map(n => n / 1e3), borderColor: '#4a9eff', borderDash: [5, 5], tension: 0.4 },
  ];
  new Chart(document.getElementById('complexityChart'), {
    type: 'line',
    data: { labels: sizes.map(n => n.toLocaleString()), datasets: datasets.map(d => ({ ...d, fill: false, pointRadius: 3, borderWidth: 2 })) },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#9095a8', font: { size: 12 } } } },
      scales: {
        x: { ticks: { color: '#9095a8' }, grid: { color: '#2a2f3f' } },
        y: { ticks: { color: '#9095a8' }, grid: { color: '#2a2f3f' }, title: { display: true, text: 'Operaciones (millones)', color: '#9095a8' } }
      }
    }
  });
}

function generateData(type, size) {
  if (type === 'sorted') return Array.from({ length: size }, (_, i) => i + 1);
  if (type === 'reverse') return Array.from({ length: size }, (_, i) => size - i);
  if (type === 'repeated') return Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1);
  return Array.from({ length: size }, () => Math.floor(Math.random() * size * 2) + 1);
}

function measureAlgo(fn, data) {
  const arr = [...data]; let cmps = 0, swaps = 0;
  const t0 = performance.now();
  fn(arr, (a, b) => { cmps++; return a - b; }, (a, i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; swaps++; });
  return { time: parseFloat((performance.now() - t0).toFixed(3)), cmps, swaps };
}

function runBenchmark() {
  const type = document.getElementById('dsType').value;
  const size = parseInt(document.getElementById('dsSize').value);
  const data = generateData(type, size);
  const active = ALGOS.filter(a => selectedAlgos.has(a.id));
  let results = [], i = 0;
  document.getElementById('bProgress').style.width = '0%';
  function step() {
    if (i >= active.length) {
      document.getElementById('bProgress').style.width = '100%';
      document.getElementById('bStatus').textContent = '✓ Completado — ' + size + ' elementos, dataset: ' + type;
      renderResults(results); renderCharts(results);
      document.getElementById('chartArea').style.display = 'block';
      return;
    }
    const a = active[i];
    document.getElementById('bStatus').textContent = 'Ejecutando ' + a.name + '...';
    document.getElementById('bProgress').style.width = Math.round((i / active.length) * 100) + '%';
    setTimeout(() => { results.push({ ...a, ...measureAlgo(SORT_FNS[a.id], data) }); i++; step(); }, 10);
  }
  step();
}

function runAllDatasets() {
  const size = parseInt(document.getElementById('dsSize').value);
  const types = ['sorted', 'random', 'reverse', 'repeated'];
  const labels = ['Ordenados', 'Aleatorios', 'Inv. orden', 'Repetidos'];
  const active = ALGOS.filter(a => selectedAlgos.has(a.id));
  let allResults = {};
  active.forEach(a => { allResults[a.id] = { name: a.name, color: a.color, times: [] }; });
  let ti = 0;
  function doType() {
    if (ti >= types.length) { renderMultiChart(allResults, labels); return; }
    const data = generateData(types[ti], size);
    active.forEach(a => { allResults[a.id].times.push(measureAlgo(SORT_FNS[a.id], data).time); });
    ti++; setTimeout(doType, 10);
  }
  document.getElementById('bStatus').textContent = 'Comparando todos los datasets...';
  document.getElementById('chartArea').style.display = 'block';
  doType();
}

function renderResults(results) {
  const maxTime = Math.max(...results.map(r => r.time), 0.001);
  let html = '<div class="card"><p class="card-title">Tiempo de ejecución</p>';
  results.forEach(r => {
    const pct = Math.max(4, Math.round((r.time / maxTime) * 100));
    html += `<div class="bar-row">
      <span class="bar-name">${r.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${r.color}44;border:1px solid ${r.color}66"><span style="color:${r.color}">${r.time.toFixed(3)}</span></div></div>
      <span class="bar-val">${r.time.toFixed(3)} ms</span>
    </div>`;
  });
  html += '</div><div class="card"><p class="card-title">Tabla de resultados</p><div class="tbl-wrap"><table><thead><tr><th>Algoritmo</th><th>Tiempo (ms)</th><th>Comparaciones</th><th>Intercambios</th></tr></thead><tbody>';
  results.forEach(r => {
    html += `<tr><td style="display:flex;align-items:center;gap:8px"><span class="color-dot" style="background:${r.color}"></span><span style="font-family:'Space Mono',monospace;font-size:12px">${r.name}</span></td><td class="num">${r.time.toFixed(3)}</td><td class="num">${r.cmps.toLocaleString()}</td><td class="num">${r.swaps.toLocaleString()}</td></tr>`;
  });
  html += '</tbody></table></div></div>';
  document.getElementById('resultsArea').innerHTML = html;
}

function renderCharts(results) {
  if (chartTime) { chartTime.destroy(); chartTime = null; }
  if (chartComp) { chartComp.destroy(); chartComp = null; }
  const labels = results.map(r => r.name);
  const colors = results.map(r => r.color);
  const opts = (label, data, unit) => ({
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: colors.map(c => c + '88'), borderColor: colors, borderWidth: 1 }] },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { ticks: { color: '#9095a8', font: { size: 11 } }, grid: { color: '#2a2f3f' } }, y: { beginAtZero: true, ticks: { color: '#9095a8', callback: v => unit === 'ms' ? v.toFixed(2) : v.toLocaleString() }, grid: { color: '#2a2f3f' } } }
    }
  });
  chartTime = new Chart(document.getElementById('timeChart'), opts('Tiempo (ms)', results.map(r => r.time), 'ms'));
  chartComp = new Chart(document.getElementById('compChart'), opts('Comparaciones', results.map(r => r.cmps), 'n'));
}

function renderMultiChart(allResults, labels) {
  const area = document.getElementById('multiChartArea');
  area.innerHTML = `<div class="card"><p class="card-title">Comparativa por tipo de dataset (tiempo ms)</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px" id="mLegend"></div>
    <div class="chart-wrap" style="height:300px"><canvas id="multiChart" role="img" aria-label="Comparativa multi-dataset"></canvas></div></div>`;
  const leg = document.getElementById('mLegend');
  Object.values(allResults).forEach(a => {
    leg.innerHTML += `<div class="legend-item"><div class="legend-dot" style="background:${a.color}"></div>${a.name}</div>`;
  });
  if (chartMulti) { chartMulti.destroy(); }
  chartMulti = new Chart(document.getElementById('multiChart'), {
    type: 'bar',
    data: { labels, datasets: Object.values(allResults).map(a => ({ label: a.name, data: a.times, backgroundColor: a.color + '88', borderColor: a.color, borderWidth: 1 })) },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { ticks: { color: '#9095a8' }, grid: { color: '#2a2f3f' } }, y: { beginAtZero: true, ticks: { color: '#9095a8', callback: v => v.toFixed(1) }, grid: { color: '#2a2f3f' } } }
    }
  });
  document.getElementById('bStatus').textContent = '✓ Comparativa multi-dataset lista.';
}

// ══════════════════════════ SORT FUNCTIONS ══════════════════════════
const SORT_FNS = {
  bubble: (arr, cmp, swap) => {
    for (let i = 0; i < arr.length - 1; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (cmp(arr[j], arr[j + 1]) > 0) swap(arr, j, j + 1);
  },
  selection: (arr, cmp, swap) => {
    for (let i = 0; i < arr.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < arr.length; j++) if (cmp(arr[j], arr[m]) < 0) m = j;
      if (m !== i) swap(arr, i, m);
    }
  },
  insertion: (arr, cmp, swap) => {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && cmp(arr[j - 1], arr[j]) > 0) { swap(arr, j - 1, j); j--; }
    }
  },
  merge: (arr, cmp, swap) => {
    function ms(a, l, r) {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2); ms(a, l, m); ms(a, m + 1, r);
      const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) { cmp(L[i], R[j]); a[k++] = cmp(L[i], R[j]) <= 0 ? L[i++] : R[j++]; }
      while (i < L.length) a[k++] = L[i++];
      while (j < R.length) a[k++] = R[j++];
    }
    ms(arr, 0, arr.length - 1);
  },
  quick: (arr, cmp, swap) => {
    function qs(a, l, r) {
      if (l >= r) return;
      let p = l;
      for (let i = l; i < r; i++) { cmp(a[i], a[r]); if (cmp(a[i], a[r]) < 0) { swap(a, i, p); p++; } }
      swap(a, p, r); qs(a, l, p - 1); qs(a, p + 1, r);
    }
    qs(arr, 0, arr.length - 1);
  },
  heap: (arr, cmp, swap) => {
    function h(a, n, i) { let l = 2 * i + 1, r = 2 * i + 2, m = i; if (l < n && cmp(a[l], a[m]) > 0) m = l; if (r < n && cmp(a[r], a[m]) > 0) m = r; if (m !== i) { swap(a, i, m); h(a, n, m); } }
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) h(arr, arr.length, i);
    for (let i = arr.length - 1; i > 0; i--) { swap(arr, 0, i); h(arr, i, 0); }
  },
  counting: (arr, cmp, swap) => {
    if (!arr.length) return;
    const mn = Math.min(...arr), mx = Math.max(...arr);
    const cnt = new Array(mx - mn + 1).fill(0);
    arr.forEach(v => { cmp(v, mn); cnt[v - mn]++; });
    let k = 0; cnt.forEach((c, i) => { while (c-- > 0) arr[k++] = i + mn; });
  }
};

// ══════════════════════════ VISUALIZACIÓN ══════════════════════════
function generateVisSteps(algo, data) {
  const steps = [], arr = [...data], sorted = new Set();
  let cmps = 0, swaps = 0;
  const rec = (type, a, i1, i2, info, pivot = -1) =>
    steps.push({ arr: [...a], type, idx1: i1, idx2: i2, info, pivot, cmps, swaps, sorted: new Set(sorted) });

  if (algo === 'bubble') {
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        cmps++; rec('compare', arr, j, j + 1, `Comparando posición ${j} (${arr[j]}) y ${j + 1} (${arr[j + 1]})`);
        if (arr[j] > arr[j + 1]) { swaps++; [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; rec('swap', arr, j, j + 1, `↔ Intercambiando: ${arr[j + 1]} > ${arr[j]}`); }
      }
      sorted.add(arr.length - 1 - i);
      rec('sorted', arr, -1, -1, `Posición ${arr.length - 1 - i} quedó ordenada`);
    }
    sorted.add(0);
  } else if (algo === 'selection') {
    for (let i = 0; i < arr.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < arr.length; j++) { cmps++; rec('compare', arr, m, j, `Buscando mínimo desde pos ${i}: comparando ${arr[m]} y ${arr[j]}`); if (arr[j] < arr[m]) m = j; }
      if (m !== i) { swaps++; [arr[i], arr[m]] = [arr[m], arr[i]]; rec('swap', arr, i, m, `Mínimo ${arr[i]} colocado en posición ${i}`); }
      sorted.add(i); rec('sorted', arr, -1, -1, `Posición ${i} ordenada`);
    }
    sorted.add(arr.length - 1);
  } else if (algo === 'insertion') {
    sorted.add(0);
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      rec('compare', arr, j, -1, `Insertando ${arr[j]} en la posición correcta`);
      while (j > 0) { cmps++; rec('compare', arr, j - 1, j, `Comparando ${arr[j - 1]} y ${arr[j]}`); if (arr[j - 1] > arr[j]) { swaps++; [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; rec('swap', arr, j - 1, j, `Moviendo ${arr[j - 1]} a la izquierda`); j--; } else break; }
      sorted.add(i);
    }
  } else if (algo === 'merge') {
    function ms(a, l, r) {
      if (l >= r) return;
      const mid = Math.floor((l + r) / 2); ms(a, l, mid); ms(a, mid + 1, r);
      const L = a.slice(l, mid + 1), R = a.slice(mid + 1, r + 1);
      let i = 0, j = 0, k = l;
      rec('compare', a, l, mid + 1, `Mezclando [${l}..${mid}] y [${mid + 1}..${r}]`);
      while (i < L.length && j < R.length) { cmps++; if (L[i] <= R[j]) { a[k++] = L[i++]; } else { swaps++; a[k++] = R[j++]; } rec('compare', a, k - 1, -1, `Elemento colocado: ${a[k - 1]}`); }
      while (i < L.length) a[k++] = L[i++];
      while (j < R.length) a[k++] = R[j++];
      for (let x = l; x <= r; x++) sorted.add(x);
      rec('sorted', a, -1, -1, `Subsección [${l}..${r}] ordenada`);
    }
    ms(arr, 0, arr.length - 1);
  } else if (algo === 'quick') {
    function qs(a, l, r) {
      if (l >= r) { if (l === r) sorted.add(l); return; }
      const pv = a[r]; let p = l;
      rec('compare', a, r, -1, `Pivote seleccionado: ${pv}`, r);
      for (let i = l; i < r; i++) { cmps++; rec('compare', a, i, r, `${a[i]} vs pivote ${pv}`, r); if (a[i] < pv) { [a[i], a[p]] = [a[p], a[i]]; swaps++; rec('swap', a, i, p, `${a[i]} va al lado izquierdo`, r); p++; } }
      [a[p], a[r]] = [a[r], a[p]]; sorted.add(p);
      rec('sorted', a, p, -1, `Pivote ${a[p]} en posición final ${p}`);
      qs(a, l, p - 1); qs(a, p + 1, r);
    }
    qs(arr, 0, arr.length - 1);
  } else if (algo === 'heap') {
    function heapify(a, n, i) { let l = 2 * i + 1, r = 2 * i + 2, m = i; cmps += 2; if (l < n && a[l] > a[m]) m = l; if (r < n && a[r] > a[m]) m = r; if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; swaps++; rec('swap', a, i, m, `Heapify: ${a[i]} sube, ${a[m]} baja`); heapify(a, n, m); } }
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr, arr.length, i);
    rec('compare', arr, -1, -1, 'Max-Heap construido correctamente');
    for (let i = arr.length - 1; i > 0; i--) { [arr[0], arr[i]] = [arr[i], arr[0]]; swaps++; sorted.add(i); rec('swap', arr, 0, i, `Raíz ${arr[i]} en posición final ${i}`); heapify(arr, i, 0); }
    sorted.add(0);
  } else if (algo === 'counting') {
    const mn = Math.min(...arr), mx = Math.max(...arr);
    rec('compare', arr, -1, -1, `Rango detectado: [${mn}, ${mx}] → ${mx - mn + 1} cubetas`);
    const cnt = new Array(mx - mn + 1).fill(0);
    arr.forEach(v => { cnt[v - mn]++; cmps++; });
    rec('compare', arr, -1, -1, `Conteo completado. Reconstruyendo...`);
    let k = 0; cnt.forEach((c, i) => { while (c-- > 0) { arr[k++] = i + mn; swaps++; } });
    arr.forEach((_, i) => sorted.add(i));
    rec('sorted', arr, -1, -1, 'Arreglo completamente ordenado (sin comparaciones directas)');
  }

  arr.forEach((_, i) => sorted.add(i));
  rec('sorted', arr, -1, -1, '✓ Ordenamiento completado');
  return steps;
}

function startVis() {
  const algo = document.getElementById('visAlgo').value;
  const raw = document.getElementById('visData').value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
  if (raw.length < 2) { alert('Ingresá al menos 2 números'); return; }
  if (raw.length > 20) { alert('Para la visualización usá máximo 20 elementos'); return; }
  if (visPlaying) { clearInterval(visTimer); visPlaying = false; }
  visSteps = generateVisSteps(algo, raw);
  visIdx = 0; renderStep(0);
  document.getElementById('btnPrev').disabled = false;
  document.getElementById('btnNext').disabled = false;
  document.getElementById('stepTitle').textContent = ALGOS.find(a => a.id === algo).name;
}

function renderStep(idx) {
  if (!visSteps.length) return;
  const s = visSteps[Math.min(idx, visSteps.length - 1)];
  document.getElementById('stepInfo').textContent = s.info || '';
  document.getElementById('stepCounter').textContent = `${idx + 1} / ${visSteps.length}`;
  document.getElementById('visCmps').textContent = s.cmps.toLocaleString();
  document.getElementById('visSwaps').textContent = s.swaps.toLocaleString();
  document.getElementById('visStep').textContent = idx + 1;
  const c = document.getElementById('stepArr');
  c.innerHTML = '';
  s.arr.forEach((v, i) => {
    const d = document.createElement('div');
    d.className = 'step-cell';
    d.textContent = v;
    if (s.sorted && s.sorted.has(i)) d.classList.add('sorted');
    if (i === s.pivot) d.classList.add('pivot');
    else if (i === s.idx1 || i === s.idx2) d.classList.add(s.type === 'swap' ? 'swapping' : 'comparing');
    c.appendChild(d);
  });
}

function nextStep() { if (visIdx < visSteps.length - 1) { visIdx++; renderStep(visIdx); } }
function prevStep() { if (visIdx > 0) { visIdx--; renderStep(visIdx); } }
function togglePlay() {
  if (visPlaying) {
    clearInterval(visTimer); visPlaying = false;
    document.getElementById('btnPlay').textContent = '▶ Auto';
  } else {
    visPlaying = true; document.getElementById('btnPlay').textContent = '⏸ Pausa';
    const spd = 1000 - parseInt(document.getElementById('visSpeed').value);
    visTimer = setInterval(() => {
      if (visIdx < visSteps.length - 1) { visIdx++; renderStep(visIdx); }
      else { clearInterval(visTimer); visPlaying = false; document.getElementById('btnPlay').textContent = '▶ Auto'; }
    }, Math.max(50, spd));
  }
}
function randomVis() {
  const n = Math.floor(Math.random() * 8) + 5;
  document.getElementById('visData').value = Array.from({ length: n }, () => Math.floor(Math.random() * 99) + 1).join(',');
}

// ══════════════════════════ CSV ══════════════════════════
function parseCSV() {
  const raw = document.getElementById('csvContent').value.trim();
  if (!raw) { document.getElementById('csvResult').innerHTML = '<p style="color:var(--text2);font-size:13px">Pegá contenido CSV primero.</p>'; return; }
  const nums = [];
  raw.split('\n').forEach(l => l.split(',').forEach(v => { const n = parseFloat(v.trim()); if (!isNaN(n)) nums.push(n); }));
  if (nums.length < 2) { document.getElementById('csvResult').innerHTML = '<p style="color:var(--red);font-size:13px">No se encontraron suficientes valores numéricos.</p>'; return; }
  const show = nums.slice(0, 500);
  document.getElementById('csvResult').innerHTML = `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:12px">
      <p style="font-size:13px;color:var(--text2)"><span style="color:var(--green);font-family:'Space Mono',monospace">${nums.length}</span> valores detectados${nums.length > 500 ? ' (usando primeros 500)' : ''}</p>
      <p style="font-size:11px;font-family:'Space Mono',monospace;color:var(--text3);margin-top:6px;word-break:break-all">[${show.slice(0, 30).join(', ')}${nums.length > 30 ? ', ...' : ''}]</p>
    </div>
    <button class="btn btn-primary" onclick="runWithCSV(${JSON.stringify(show)})">⚡ Ejecutar benchmark con estos datos</button>`;
}

function loadFile(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = e => { document.getElementById('csvContent').value = e.target.result; parseCSV(); };
  r.readAsText(f);
}
function loadSampleCSV() {
  document.getElementById('csvContent').value = 'valor\n64\n25\n12\n22\n11\n90\n1\n55\n42\n73\n38\n17\n84\n29\n6\n47\n33\n71\n58\n19\n100\n3\n77\n45\n88\n14\n36\n69\n52\n7';
  parseCSV();
}
function runWithCSV(data) {
  showTab('benchmark');
  setTimeout(() => {
    const active = ALGOS.filter(a => selectedAlgos.has(a.id));
    const results = active.map(a => ({ ...a, ...measureAlgo(SORT_FNS[a.id], data) }));
    document.getElementById('bStatus').textContent = '✓ Dataset CSV — ' + data.length + ' elementos';
    document.getElementById('bProgress').style.width = '100%';
    renderResults(results); renderCharts(results);
    document.getElementById('chartArea').style.display = 'block';
  }, 100);
}

// ══════════════════════════ INIT ══════════════════════════
buildToggles();
buildComplexityTable();
buildWhen();