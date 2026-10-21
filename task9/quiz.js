// 問いに挑戦する：本文の一節や模型を手がかりに答え、答えたあとに模型で確かめ、本文に戻る問いを返す。
// 答えは xAPI の形の記録（statement）として、この端末のブラウザに残す（LRS への送信は未実装）。
// ページの側は window.HEIAN_UI = { select(id), showUi(bool) } を用意する。
(function () {
  const ERA = ['平安末〜鎌倉', '南北朝〜室町', '室町後期〜戦国', '戦国〜江戸初期'];
  const QUESTIONS = [
    {
      id: 'kurai-yugiri', title: '位当て：夕霧の袍の色',
      ask: '『源氏物語』少女の巻。元服した夕霧は、四位ではなく六位とされ、本文には「浅葱にて殿上に帰りたまふ」とあります。夕霧が着ている袍の色は、どの位の色でしょう。',
      before: null,
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
      before: null, choices: ['唐衣と裳を着けた女性', '小袿を着た女性'], answer: 0,
      show: (i) => ['nyobo', 'kouchiki'][i], after: 'nyobo',
      why: '唐衣と裳を着けた「女房装束（唐衣裳）」が、女房が主人の前に出るときの正装です。小袿は、高い身分の女性の準正装で、唐衣と裳は着けません。',
      back: '本文に戻ろう：物語の中で、女房と女主人の身なりがどう書き分けられているか探してみよう。',
    },
    {
      id: 'sou-kosou', title: '位の高い僧はどちらか', ask: '首の後ろに三角の襟が立ち、錦の袈裟を掛けた僧と、墨染の衣の僧。位の高い僧はどちらでしょう。',
      before: null, choices: ['三角の襟が立つ僧', '墨染の衣の僧'], answer: 0,
      show: (i) => ['sou:kosou', 'sou:hoshi'][i], after: 'sou:kosou',
      why: '首の後ろに立つ三角の襟は「僧綱襟」で、位の高い僧の目印です。錦の七条袈裟は儀式の正装。墨染の衣に五条袈裟は、ふだんの僧の姿です。',
      back: '本文に戻ろう：『徒然草』の仁和寺の法師は、どちらの姿で思い浮かべるのがよいだろう。',
    },
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
  function record(q, choice, success) {
    const list = load();
    list.push({
      actor: { objectType: 'Agent', account: { homePage: location.origin, name: learner() } },
      verb: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { ja: '答えた' } },
      object: { objectType: 'Activity', id: location.origin + location.pathname + '#q-' + q.id,
                definition: { name: { ja: q.title }, type: 'http://adlnet.gov/expapi/activities/cmi.interaction', interactionType: 'choice' } },
      result: { response: q.choices[choice], success: success },
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
    #quiz .choices button, #quiz .nav button { border: 1px solid #8a7a5a; background: #fff; color: #2a2522; border-radius: 10px;
            padding: 8px 10px; font-size: 14px; text-align: left; font-family: inherit; }
    #quiz .choices button.ok { background: #e3efe3; border-color: #3d7a46; }
    #quiz .choices button.ng { background: #f6e1e1; border-color: #a33; }
    #quiz .fb { margin-top: 6px; padding: 8px 10px; border-radius: 8px; background: #f0ebe0; }
    #quiz .back { margin-top: 6px; color: #5a3d1e; font-weight: bold; }
    #quiz .nav { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; margin-top: 8px; }
    #quiz pre { white-space: pre-wrap; font-size: 11px; background: #fff; padding: 6px; border-radius: 6px; max-height: 30vh; overflow: auto; }`;
  document.head.appendChild(css);
  const btn = document.createElement('button'); btn.id = 'quizBtn'; btn.textContent = '問いに挑戦';
  const box = document.createElement('div'); box.id = 'quiz';
  document.addEventListener('DOMContentLoaded', () => { document.body.appendChild(btn); document.body.appendChild(box); });
  if (document.readyState !== 'loading') { document.body.appendChild(btn); document.body.appendChild(box); }

  let order = [], pos = 0, score = 0;
  const ui = () => window.HEIAN_UI;
  function open() {
    order = QUESTIONS.map((q, i) => i); pos = 0; score = 0;
    // 武士の4問は順番をまぜる（最初の位当てと最後の2問は固定）
    const mid = order.slice(1, 5).sort(() => Math.random() - 0.5); order = [0, ...mid, 5, 6];
    btn.style.display = 'none'; box.style.display = 'block'; ui().showUi(false); ask();
  }
  function close() { box.style.display = 'none'; btn.style.display = ''; ui().showUi(true); }
  function ask() {
    const q = QUESTIONS[order[pos]];
    if (q.before) ui().select(q.before);
    box.innerHTML = `<h3>問い ${pos + 1} / ${order.length}　${q.title}</h3><div>${q.ask}</div><div class="choices"></div>
                     <div class="nav"><button data-a="log">記録を見る</button><button data-a="end">やめる</button></div>`;
    const ch = box.querySelector('.choices');
    q.choices.forEach((c, i) => { const b = document.createElement('button'); b.textContent = c; b.onclick = () => answer(q, i); ch.appendChild(b); });
    nav();
  }
  function answer(q, i) {
    const ok = i === q.answer; if (ok) score++;
    record(q, i, ok);
    if (q.show) ui().select(ok ? q.after : q.show(i));          // まず自分の選んだものを見せる（違っていれば、あとで正解を出せる）
    box.querySelectorAll('.choices button').forEach((b, k) => { b.disabled = true; if (k === q.answer) b.classList.add('ok'); else if (k === i) b.classList.add('ng'); });
    const fb = document.createElement('div'); fb.className = 'fb';
    fb.innerHTML = `<b>${ok ? 'そのとおり。' : 'ちがいます。正解は「' + q.choices[q.answer] + '」。'}</b>${q.why}<div class="back">${q.back}</div>`;
    box.querySelector('.choices').after(fb);
    const navEl = box.querySelector('.nav'); navEl.innerHTML = '';
    if (!ok && q.show) { const s = document.createElement('button'); s.textContent = '正解の模型を見る'; s.onclick = () => ui().select(q.after); navEl.appendChild(s); }
    const n = document.createElement('button'); n.textContent = pos + 1 < order.length ? '次の問い' : '結果を見る';
    n.onclick = () => { pos++; pos < order.length ? ask() : finish(); }; navEl.appendChild(n);
    const lg = document.createElement('button'); lg.textContent = '記録を見る'; lg.onclick = showLog; navEl.appendChild(lg);
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
      else if (a === 'again') open();
      else if (a === 'clear') { save([]); showLog(); }
      else if (a === 'dl') {
        const url = URL.createObjectURL(new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' }));
        const el = document.createElement('a'); el.href = url; el.download = 'koten-ar-xapi.json'; el.click(); URL.revokeObjectURL(url);
      }
    });
  }
  btn.onclick = open;
})();
