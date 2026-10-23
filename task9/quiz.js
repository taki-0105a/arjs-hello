// 問いに挑戦する：本文の一節や模型を手がかりに答え、答えたあとに模型で確かめ、本文に戻る問いを返す。
// 答えは xAPI の形の記録（statement）として、この端末のブラウザに残す（LRS への送信は未実装）。
// ページの側は window.HEIAN_UI = { select(id), showUi(bool) } を用意する。
(function () {
  const ERA = ['平安末〜鎌倉', '南北朝〜室町', '室町後期〜戦国', '戦国〜江戸初期'];
  const QUESTIONS = [
    {
      id: 'kurai-yugiri', title: '位当て：夕霧の袍の色',
      ask: '『源氏物語』少女の巻。元服した夕霧は、四位ではなく六位とされ、本文には「浅葱にて殿上に帰りたまふ」とあります。夕霧が着ている袍の色は、どの位の色でしょう。',
      before: 'sokutai:四位以上（黒）', beforeOpts: { ho: '#c4c2bc' },   // 答えの色は伏せて、灰色の袍で出す
      choices: ['四位以上（黒）', '五位（緋）', '六位（浅葱）'], answer: 2,
      show: (i) => 'sokutai:' + ['四位以上（黒）', '五位（緋）', '六位（浅葱）'][i],   // 選んだ位の袍を出してから正解を示す
      after: 'sokutai:六位（浅葱）',
      why: '平安時代中期には、四位以上の袍は黒、五位は緋、六位は浅葱（緑系）でした。浅葱の袍は、夕霧の身分の家柄から見れば低い位を示す色です。',
      back: '本文に戻ろう：夕霧は浅葱の袍を「いとからし」と思います。なぜつらいのか、まわりの人の位と比べて本文で確かめよう。',
    },
    {
      id: 'jidai-ooyoroi', title: 'どの時代の武士か（1）', ask: 'この武士の鎧は、どの時代のものでしょう。兜、肩、腰まわりをよく見て選ぼう。',
      before: 'bushi:ooyoroi', choices: ERA, answer: 0,
      why: '大鎧です。星兜に鍬形、肩には左右の大きな大袖、腰の草摺は4間、正面に弦走。馬に乗って弓を射る上級の武士の鎧で、平安時代の終わりから鎌倉時代のものです。',
      back: '本文に戻ろう：『平家物語』の敦盛や那須与一の場面で、鎧や弓がどう書かれているか確かめよう。',
    },
    {
      id: 'jidai-doumaru', title: 'どの時代の武士か（2）', ask: 'この武士の鎧は、どの時代のものでしょう。腰まわりの分かれ方に注目しよう。',
      before: 'bushi:doumaru', choices: ERA, answer: 1,
      why: '胴丸です。腰の草摺が8間に細かく分かれていて、歩いて戦いやすい作りです。肩には杏葉。南北朝から室町時代に、徒歩の武士から武将まで広く使われました。',
      back: '大鎧と見比べよう：草摺の数と大袖の有無が、馬の上で戦うか、歩いて戦うかとどう関係するだろう。',
    },
    {
      id: 'jidai-tousei', title: 'どの時代の武士か（3）', ask: 'この武士の鎧は、どの時代のものでしょう。胴の作りと、手足の守りに注目しよう。',
      before: 'bushi:tousei', choices: ERA, answer: 3,
      why: '当世具足です。鉄の板を矧いだ胴に、籠手・佩楯・臑当で手足まで覆い、顔には面頬、背には旗指物。戦国時代から江戸時代の初めの武将の鎧です。',
      back: '大鎧と見比べよう：糸で綴った小札から鉄の板へ。何が変わり、なぜ変わったのだろう。',
    },
    {
      id: 'jidai-ashigaru', title: 'どの時代の武士か（4）', ask: 'この兵は、どの時代の人でしょう。かぶっているものと、持っているものに注目しよう。',
      before: 'bushi:ashigaru', choices: ERA, answer: 2,
      why: '足軽です。兜の代わりに陣笠をかぶり、貸し出しの簡素な具足に長柄の槍。室町時代の後半から戦国時代に、集団で戦う兵として増えました。',
      back: '比べよう：同じ時代の武将（当世具足）と、身なりがどう違うだろう。',
    },
    {
      id: 'nyobo-kouchiki', title: '仕える女房はどちらか', ask: '唐衣と裳を着けた女性と、小袿を着た女性。主人の前に仕える女房の正装は、どちらでしょう。',
      before: 'nyobo', compare: [['唐衣と裳の女性を見る', 'nyobo'], ['小袿の女性を見る', 'kouchiki']],
      choices: ['唐衣と裳を着けた女性', '小袿を着た女性'], answer: 0,
      show: (i) => ['nyobo', 'kouchiki'][i], after: 'nyobo',
      why: '唐衣と裳を着けた「女房装束（唐衣裳）」が、女房が主人の前に出るときの正装です。小袿は、高い身分の女性の準正装で、唐衣と裳は着けません。',
      back: '本文に戻ろう：物語の中で、女房と女主人の身なりがどう書き分けられているか探してみよう。',
    },
    {
      id: 'sou-kosou', title: '位の高い僧はどちらか', ask: '首の後ろに三角の襟が立ち、錦の袈裟を掛けた僧と、墨染の衣の僧。位の高い僧はどちらでしょう。',
      before: 'sou:kosou', compare: [['三角の襟の僧を見る', 'sou:kosou'], ['墨染の衣の僧を見る', 'sou:hoshi']],
      choices: ['三角の襟が立つ僧', '墨染の衣の僧'], answer: 0,
      show: (i) => ['sou:kosou', 'sou:hoshi'][i], after: 'sou:kosou',
      why: '首の後ろに立つ三角の襟は「僧綱襟」で、位の高い僧の目印です。錦の七条袈裟は儀式の正装。墨染の衣に五条袈裟は、ふだんの僧の姿です。',
      back: '本文に戻ろう：『徒然草』の仁和寺の法師は、どちらの姿で思い浮かべるのがよいだろう。',
    },
  ];

  // 物差しの問い：模型を見て、その姿がよく見られた年に物差しのつまみを合わせる（lo〜hi に入れば正解）
  const ERAS = [['平安', 1000, 1185, '#c9b8d8'], ['鎌倉', 1185, 1333, '#b9d3c4'], ['南北朝', 1336, 1392, '#e3cfa6'],
                ['室町', 1392, 1467, '#a9c4dd'], ['戦国', 1467, 1573, '#e2b2a8'], ['安土桃山', 1573, 1600, '#e8d79a']];
  const RULER = [
    { id: 'nen-sohei', title: '物差し：僧兵', before: 'sou:sohei', at: 1100, lo: 1000, hi: 1200,
      why: '僧兵が寺の力を背に強訴をくり返したのは、平安時代の後半（11〜12世紀）。『平家物語』にも山法師が出てきます。' },
    { id: 'nen-ooyoroi', title: '物差し：大鎧', before: 'bushi:ooyoroi', at: 1185, lo: 1100, hi: 1350,
      why: '大鎧は平安時代の後半から鎌倉時代の、馬上で弓を射る武士の鎧。源平の合戦（1180〜1185年）のころが代表です。' },
    { id: 'nen-doumaru', title: '物差し：胴丸', before: 'bushi:doumaru', at: 1400, lo: 1330, hi: 1550,
      why: '胴丸は、南北朝から室町時代に、徒歩で戦う武士から武将まで広く使われました。' },
    { id: 'nen-ashigaru', title: '物差し：足軽', before: 'bushi:ashigaru', at: 1500, lo: 1460, hi: 1600,
      why: '足軽が大きな働きをするようになったのは、応仁の乱（1467年〜）のころから戦国時代にかけてです。' },
    { id: 'nen-tousei', title: '物差し：当世具足', before: 'bushi:tousei', at: 1575, lo: 1530, hi: 1600,
      why: '当世具足は、鉄砲が広まった戦国時代の後半から江戸時代の初めの鎧です。' },
  ];

  // ---- 学習の記録（xAPI の形） ----
  const KEY = 'koten-ar-xapi';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 記録できなくても続ける */ } }
  function learner() {
    try {
      let id = localStorage.getItem(KEY + '-id');
      if (!id) { id = 'learner-' + Math.random().toString(36).slice(2, 8); localStorage.setItem(KEY + '-id', id); }
      return id;
    } catch (e) { return 'learner-anon'; }
  }
  function record(q, choice, success, response) {
    const list = load();
    list.push({
      actor: { objectType: 'Agent', account: { homePage: location.origin, name: learner() } },
      verb: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { ja: '答えた' } },
      object: { objectType: 'Activity', id: location.origin + location.pathname + '#q-' + q.id,
                definition: { name: { ja: q.title }, type: 'http://adlnet.gov/expapi/activities/cmi.interaction', interactionType: q.at ? 'numeric' : 'choice' } },
      result: { response: response !== undefined ? String(response) : q.choices[choice], success: success },
      timestamp: new Date().toISOString(),
    });
    save(list);
  }

  // ---- 画面 ----
  const css = document.createElement('style');
  css.textContent = `
    #quizBtn { position: fixed; right: 10px; bottom: 120px; z-index: 1001; background: #8c2f39; color: #fff; border: none;
               border-radius: 20px; padding: 9px 14px; font-size: 14px; font-weight: bold; font-family: inherit; }
    #quiz { position: fixed; left: 8px; right: 8px; bottom: 8px; z-index: 1002; display: none; background: rgba(250, 247, 240, 0.97);
            color: #2a2522; border-radius: 12px; padding: 12px 14px; font-size: 14px; line-height: 1.65; max-height: 58vh; overflow-y: auto;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3); font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; }
    #quiz h3 { margin: 0 0 6px; font-size: 15px; color: #8c2f39; }
    #quiz .choices { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
    #quiz .compare button.cmp { margin: 4px 6px 0 0; border: 1px dashed #8a7a5a; background: #f6f1e6; color: #2a2522; border-radius: 14px; padding: 6px 10px; font-size: 13px; font-family: inherit; }
    #quiz .choices button, #quiz .nav button { border: 1px solid #8a7a5a; background: #fff; color: #2a2522; border-radius: 10px;
            padding: 8px 10px; font-size: 14px; text-align: left; font-family: inherit; }
    #quiz .choices button.ok { background: #e3efe3; border-color: #3d7a46; }
    #quiz .choices button.ng { background: #f6e1e1; border-color: #a33; }
    #quiz .fb { margin-top: 6px; padding: 8px 10px; border-radius: 8px; background: #f0ebe0; }
    #quiz .back { margin-top: 6px; color: #5a3d1e; font-weight: bold; }
    #quiz .nav { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; margin-top: 8px; }
    #quiz .ruler { position: relative; margin: 10px 4px 2px; }
    #quiz .bands { display: flex; height: 22px; border-radius: 4px; overflow: hidden; font-size: 10px; }
    #quiz .bands div { display: flex; align-items: center; justify-content: center; color: #3a332b; white-space: nowrap; overflow: hidden; }
    #quiz .ruler input { width: 100%; margin: 6px 0 0; }
    #quiz .ticks { display: flex; justify-content: space-between; font-size: 11px; color: #5a5048; }
    #quiz .mark { position: absolute; top: -4px; height: 30px; border-left: 3px solid #3d7a46; }
    #quiz .range { position: absolute; top: 0; height: 22px; background: rgba(61,122,70,0.25); border: 2px solid #3d7a46; border-radius: 4px; box-sizing: border-box; }
    #quiz .year { text-align: center; font-weight: bold; font-size: 16px; margin-top: 4px; }
    #quiz .menu button { display: block; width: 100%; margin: 6px 0; border: 1px solid #8a7a5a; background: #fff; border-radius: 10px; padding: 10px; font-size: 15px; font-family: inherit; text-align: left; }
    #quiz pre { white-space: pre-wrap; font-size: 11px; background: #fff; padding: 6px; border-radius: 6px; max-height: 30vh; overflow: auto; }`;
  document.head.appendChild(css);
  const btn = document.createElement('button'); btn.id = 'quizBtn'; btn.textContent = '問いに挑戦';
  const box = document.createElement('div'); box.id = 'quiz';
  document.addEventListener('DOMContentLoaded', () => { document.body.appendChild(btn); document.body.appendChild(box); });
  if (document.readyState !== 'loading') { document.body.appendChild(btn); document.body.appendChild(box); }

  let order = [], pos = 0, score = 0, set = QUESTIONS;
  const ui = () => window.HEIAN_UI;
  let last = null;
  function sel(id, opts) { last = id; ui().select(id, opts); }   // 最後に出した模型を覚えておく
  function open() {
    btn.style.display = 'none'; box.style.display = 'block'; ui().showUi(false);
    box.innerHTML = `<h3>問いに挑戦</h3><div class="menu">
        <button data-m="mi">身なりの問い（7問）<br><small>位当て、どの時代の武士か、女房と女主人、僧の位</small></button>
        <button data-m="nen">物差しの問い（5問）<br><small>模型を見て、その姿がよく見られた年に物差しを合わせる</small></button></div>
      <div class="nav"><button data-a="log">記録を見る</button><button data-a="end">やめる</button></div>`;
    box.querySelectorAll('.menu button').forEach(b => b.onclick = () => start(b.dataset.m));
    nav();
  }
  function start(kind) {
    pos = 0; score = 0;
    if (kind === 'nen') { set = RULER; order = RULER.map((q, i) => i).sort(() => Math.random() - 0.5); }
    else {
      set = QUESTIONS; order = QUESTIONS.map((q, i) => i);
      const mid = order.slice(1, 5).sort(() => Math.random() - 0.5); order = [0, ...mid, 5, 6];   // 武士の4問だけ順番をまぜる
    }
    ask();
  }
  function close() { box.style.display = 'none'; btn.style.display = ''; ui().showUi(true); if (last) ui().select(last); }   // 伏せた色を元に戻す
  function ask() {
    const q = set[order[pos]];
    if (q.at) return askRuler(q);
    sel(q.before, q.beforeOpts);
    box.innerHTML = `<h3>問い ${pos + 1} / ${order.length}　${q.title}</h3><div>${q.ask}</div><div class="compare"></div><div class="choices"></div>
                     <div class="nav"><button data-a="log">記録を見る</button><button data-a="end">やめる</button></div>`;
    if (q.compare) {   // 答える前に、模型を切り替えて見比べる
      const cp = box.querySelector('.compare'); cp.innerHTML = '<div style="margin-top:6px;color:#5a3d1e">見比べてから答えよう：</div>';
      q.compare.forEach(([label, id]) => { const b = document.createElement('button'); b.textContent = label; b.className = 'cmp'; b.onclick = () => sel(id); cp.appendChild(b); });
    }
    const ch = box.querySelector('.choices');
    q.choices.forEach((c, i) => { const b = document.createElement('button'); b.textContent = c; b.onclick = () => answer(q, i); ch.appendChild(b); });
    nav();
  }
  function answer(q, i) {
    const ok = i === q.answer; if (ok) score++;
    record(q, i, ok);
    if (q.show) sel(ok ? q.after : q.show(i));          // 位当てなどは、まず自分の選んだものを見せる（違っていれば「正解の模型を見る」で出せる）
    else sel(q.before);                                    // 武士の問いは、答えたあとも同じ模型を（色も戻して）出しておく
    box.querySelectorAll('.compare button').forEach(b => b.disabled = true);
    box.querySelectorAll('.choices button').forEach((b, k) => { b.disabled = true; if (k === q.answer) b.classList.add('ok'); else if (k === i) b.classList.add('ng'); });
    const fb = document.createElement('div'); fb.className = 'fb';
    fb.innerHTML = `<b>${ok ? 'そのとおり。' : 'ちがいます。正解は「' + q.choices[q.answer] + '」。'}</b>${q.why}<div class="back">${q.back}</div>`;
    box.querySelector('.choices').after(fb);
    const navEl = box.querySelector('.nav'); navEl.innerHTML = '';
    if (!ok && q.show) { const s = document.createElement('button'); s.textContent = '正解の模型を見る'; s.onclick = () => sel(q.after); navEl.appendChild(s); }
    const n = document.createElement('button'); n.textContent = pos + 1 < order.length ? '次の問い' : '結果を見る';
    n.onclick = () => { pos++; pos < order.length ? ask() : finish(); }; navEl.appendChild(n);
    const lg = document.createElement('button'); lg.textContent = '記録を見る'; lg.onclick = showLog; navEl.appendChild(lg);
  }
  // ---- 物差しの問い ----
  const pct = (y) => (y - 1000) / 600 * 100;
  function rulerHtml() {
    const bands = ERAS.map(([n, a, b, c]) => `<div style="width:${(Math.min(b, 1600) - a) / 6}%;background:${c}">${b - a > 60 ? n : ''}</div>`).join('');
    return `<div class="ruler"><div class="bands">${bands}</div><input type="range" min="1000" max="1600" step="10" value="1300">
      <div class="ticks"><span>1000</span><span>1200</span><span>1400</span><span>1600</span></div></div>
      <div class="year">1300 年ごろ</div>`;
  }
  function askRuler(q) {
    sel(q.before);
    box.innerHTML = `<h3>問い ${pos + 1} / ${order.length}　${q.title}</h3>
      <div>この姿がよく見られたのは、何年ごろでしょう。模型を回して手がかりを探し、物差しのつまみを動かして答えよう。</div>
      ${rulerHtml()}<div class="nav"><button data-x="ans">この年に立たせる</button><button data-a="log">記録を見る</button><button data-a="end">やめる</button></div>`;
    const inp = box.querySelector('.ruler input'), yr = box.querySelector('.year');
    inp.oninput = () => yr.textContent = inp.value + ' 年ごろ';
    box.querySelector('[data-x="ans"]').onclick = () => answerRuler(q, +inp.value);
    nav();
  }
  function answerRuler(q, y) {
    const ok = y >= q.lo && y <= q.hi; if (ok) score++;
    record(q, null, ok, y);
    const inp = box.querySelector('.ruler input'); inp.disabled = true;
    const r = box.querySelector('.ruler');
    r.insertAdjacentHTML('beforeend', `<div class="range" style="left:${pct(q.lo)}%;width:${pct(q.hi) - pct(q.lo)}%"></div><div class="mark" style="left:${pct(q.at)}%"></div>`);
    const fb = document.createElement('div'); fb.className = 'fb';
    fb.innerHTML = `<b>${ok ? 'そのとおり。' : 'ちがいます。'}</b>あなたの答え：${y} 年ごろ。目安は ${q.lo}〜${q.hi} 年（緑の枠）、物差しの模型では ${q.at} 年の位置に立っています。${q.why}
      <div class="back">年代の物差しの模型に切り替えました。ほかの姿と並べて、何が変わっていったかを確かめよう。</div>`;
    box.querySelector('.year').after(fb);
    sel('nenpyo');
    const navEl = box.querySelector('.nav'); navEl.innerHTML = '';
    const back = document.createElement('button'); back.textContent = 'もう一度この姿を見る'; back.onclick = () => sel(q.before); navEl.appendChild(back);
    const n = document.createElement('button'); n.textContent = pos + 1 < order.length ? '次の問い' : '結果を見る';
    n.onclick = () => { pos++; pos < order.length ? ask() : finish(); }; navEl.appendChild(n);
  }

  function finish() {
    box.innerHTML = `<h3>結果</h3><div>${order.length} 問中 ${score} 問 正解。</div>
      <div class="back">模型を自由に回して、答えの手がかりになったところをもう一度確かめよう。</div>
      <div class="nav"><button data-a="log">記録を見る</button><button data-a="again">もう一度</button><button data-a="end">おわる</button></div>`;
    nav();
  }
  function showLog() {
    const list = load();
    const ok = list.filter(s => s.result.success).length;
    box.innerHTML = `<h3>学習の記録（xAPI の形）</h3>
      <div>この端末に ${list.length} 件（正解 ${ok} 件）。先生の LRS に送る部分は未実装です。</div>
      <pre>${JSON.stringify(list.slice(-3), null, 1).replace(/</g, '&lt;')}</pre>
      <div class="nav"><button data-a="dl">記録を保存（JSON）</button><button data-a="clear">記録を消す</button><button data-a="again">問いに戻る</button><button data-a="end">おわる</button></div>`;
    nav();
  }
  function nav() {
    box.querySelectorAll('.nav button[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'end') close();
      else if (a === 'log') showLog();
      else if (a === 'again') open();   // 問いの種類を選び直す
      else if (a === 'clear') { save([]); showLog(); }
      else if (a === 'dl') {
        const url = URL.createObjectURL(new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' }));
        const el = document.createElement('a'); el.href = url; el.download = 'koten-ar-xapi.json'; el.click(); URL.revokeObjectURL(url);
      }
    });
  }
  btn.onclick = open;
  window.HEIAN_QUIZ = { open };
})();
