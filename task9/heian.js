// 平安の寝殿造と装束を、マーカーの上に立体で出す（A-Frame + AR.js）
// 人物は回転体・箱・球を組み合わせた簡略な表現（絵巻のような人形）。
// 色と説明は PALETTE と INFO にまとめ、資料で確かめた値に差し替える。

const THREE = AFRAME.THREE;

// ---- 色（資料で確かめて差し替える） ----
const PALETTE = {
  // 位袍の色（平安中期、『源氏物語』の頃）。RGB は辞典の色の説明に合わせた目安で、測色値ではない
  hoRank: { '四位以上（黒）': '#1e1a22', '五位（緋）': '#b8322a', '六位（浅葱）': '#5fa8a0', '天皇（黄櫨染）': '#b07a35', '東宮（黄丹）': '#ee7948' },
  sokutai: { hakama: '#f5f2ea', oguchi: '#c8102e', sekitai: '#222222', kanmuri: '#1a1a1a', shaku: '#c8a878', shitagasane: '#f5f2ea', skin: '#f4e9dd' },
  // 女房装束（唐衣裳）：唐衣・表着・打衣・袿・単・裳。配色は一例（決まりはなく、季節の重ねで変わる）
  nyobo: { karaginu: '#b22d35', outer: '#e8899a', lining: '#8e1b2a', inner: '#c8102e', hitoe: '#4c7a5a', mo: '#f5f2ea' },
  // 小袿姿（女主人の準正装）：唐衣と裳はなく、重ね袿の上に小袿。配色は一例
  kouchiki: { kouchiki: '#915c8b', outer: '#c0485a', lining: '#f2a0a1', inner: '#8e1b2a', hitoe: '#4c7a5a' },
  hair: '#0b0b0d',
  wood: '#b48a5a', woodDark: '#5a4330', roof: '#5b4636', sudare: '#c9a96a', sand: '#e8e2d2', lacquer: '#141212',
};

// ---- 説明（画面の上に出す日本語） ----
const NOTE = '<br><small>色は辞典の説明に合わせた目安です。五位・六位の色は、資料や時代によって違いがあります。</small>';
const INFO = {
  'shinden': '<b>寝殿造</b>　母屋（濃い床）を廂が四方から囲み、その外に一段低い簀子と高欄。南の正面に階。昼は蔀を上げ、御簾を下ろす。「屋根を外す」で間取りを見られます。',
  'sokutai:四位以上（黒）': '<b>束帯・四位以上（黒）</b>　平安中期には、四位以上の袍は黒になっていた。光源氏や公卿の正装の色。冠、縫腋の袍、石帯、笏、後ろに引く下襲の裾。' + NOTE,
  'sokutai:五位（緋）': '<b>束帯・五位（緋）</b>　五位の袍は緋（赤）。五位以上が「貴族」とされる境目。' + NOTE,
  'sokutai:六位（浅葱）': '<b>束帯・六位（浅葱）</b>　『源氏物語』少女の巻で、元服した夕霧は四位ではなく六位とされ、「浅葱にて殿上に帰りたまふ」。夕霧は浅葱の袍を「いとからし」と思う。' + NOTE,
  'sokutai:天皇（黄櫨染）': '<b>束帯・天皇（黄櫨染）</b>　天皇だけが着る色（禁色）。茶色がかった黄。' + NOTE,
  'sokutai:東宮（黄丹）': '<b>束帯・東宮（黄丹）</b>　皇太子の色（禁色）。橙に近い黄赤。' + NOTE,
  'nyobo': '<b>女房装束（唐衣裳）</b>　いちばん外の短い唐衣、表着、打衣、重ねた袿、単、紅の長袴。腰から後ろに白い裳を引く。いわゆる「十二単」は俗称で、枚数のことではない。手には檜扇。',
  'kouchiki': '<b>小袿</b>　高い身分の女性の準正装。唐衣と裳を着けず、重ねた袿の上に、丈の短い小袿を着る。仕える女房の唐衣裳と見比べられます。',
  'nenpyo': '<b>年代の物差し（1000〜1600年）</b>　床の物差しの上に、時代ごとの姿を立たせた。左から、束帯（1000年ごろ、『源氏物語』の頃）、僧兵（1100年ごろ）、大鎧（1185年ごろ、源平の合戦）、胴丸（1400年ごろ）、足軽（1500年ごろ）、当世具足（1575年ごろ）。奥の帯は時代の区分。' +
    '<br><small>立たせた位置は、その姿がよく見られた時期の目安です。前後の時代にも使われました。</small>',
  'sou:hoshi': '<b>一般の僧</b>　墨染の衣に五条袈裟。袈裟は左肩から右脇へ斜めに掛ける。『徒然草』の仁和寺の法師（第52・53段）を思い浮かべる姿。' +
    '<br><small>平安時代の僧の位と衣の色の対応は、資料で確かめきれていないため一例です。</small>',
  'sou:kosou': '<b>高僧</b>　白い絹の鈍色（法衣）に、首の後ろに立つ僧綱襟、錦の七条袈裟。儀式のときの正装。僧綱襟は位の高い僧の目印。',
  'sou:sohei': '<b>僧兵（山法師）</b>　袈裟で頭と顔を包み目だけを出す「裹頭」、手には薙刀。『平家物語』で強訴する延暦寺の大衆の姿。' +
    '<br><small>高足駄の姿は、後の時代の絵によるところが大きいとされます。</small>',
  'bushi:ooyoroi': '<b>大鎧（平安末〜鎌倉）</b>　騎馬で弓を射る上級の武士の鎧。星兜に鍬形、左右の大袖、胸の栴檀板・鳩尾板、4間の草摺、正面の弦走。ここでは赤糸威。' +
    '『平家物語』の敦盛は「萌黄匂の鎧」、那須与一の場面も大鎧の時代。左手に弓、右腰に箙、左腰に太刀。',
  'bushi:doumaru': '<b>胴丸（南北朝〜室町）</b>　徒歩で戦う武士の鎧。右脇で合わせ、草摺は8間に分かれて歩きやすい。肩には杏葉。' +
    '縅の色は、東京国立博物館の色々威胴丸（胸は紅・白・紅、腰は紫、裾は白）にならった。頭は烏帽子に鉢巻、手には薙刀。',
  'bushi:tousei': '<b>当世具足（戦国〜江戸初期）</b>　鉄の板を矧いだ胴、7間の草摺、籠手・佩楯・臑当で手足まで覆う。筋兜に三日月の前立、顔の下半分に面頬、背に旗指物。',
  'bushi:ashigaru': '<b>足軽（室町後期〜戦国）</b>　陣笠と、貸し出しの簡素な具足（御貸具足）に、長柄の槍。胴や陣笠の正面には、所属を示す目印（合印）を描いた。' +
    '<br><small>御貸具足の形や合印の描き方は、資料で確かめきれていないため一例です。</small>',
};

// ---------------- 形の部品 ----------------
function mat(color, rough = 0.75, metal = 0) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: metal });
}
function mesh(geo, color, rough) { const m = new THREE.Mesh(geo, mat(color, rough)); m.castShadow = true; return m; }
function box(w, h, d, color, x = 0, y = 0, z = 0, rough) { const m = mesh(new THREE.BoxGeometry(w, h, d), color, rough); m.position.set(x, y, z); return m; }
function sphere(r, color, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) { const m = mesh(new THREE.SphereGeometry(r, 20, 14), color); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m; }
function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 18) { const m = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color); m.position.set(x, y + h / 2, z); return m; }
// 回転体：prof は [半径, 高さ] の列（下から上へ）。squash で奥行きをつぶす
function lathe(prof, color, squash = 1, rough = 0.6) {
  const pts = prof.map(p => new THREE.Vector2(p[0], p[1]));
  const m = mesh(new THREE.LatheGeometry(pts, 32), color, rough);
  m.material.side = THREE.DoubleSide; m.scale.z = squash; return m;
}
function group(...children) { const g = new THREE.Group(); children.forEach(c => c && g.add(c)); return g; }

// 顔：引目鉤鼻のような細い目と小さな口、高い位置の眉
function face(skin, y, z = 0) {
  const g = group();
  g.add(sphere(0.085, skin, 0, 0, 0, 1, 1.18, 1.05));
  [-1, 1].forEach(s => {
    g.add(box(0.026, 0.004, 0.004, '#222', s * 0.028, 0.008, 0.084));
    g.add(box(0.014, 0.009, 0.004, '#333', s * 0.03, 0.056, 0.078));
  });
  g.add(box(0.012, 0.006, 0.004, '#b3262b', 0, -0.042, 0.083));
  g.position.set(0, y, z); return g;
}

// ---------------- 束帯（位で袍の色が変わる） ----------------
function sokutai(hoColor) {
  const C = PALETTE.sokutai, g = group();
  // 表袴（白）と、裾からのぞく大口（紅）
  [-1, 1].forEach(s => {
    g.add(cyl(0.075, 0.09, 0.42, C.hakama, s * 0.085, 0, 0));
    g.add(cyl(0.092, 0.095, 0.05, C.oguchi, s * 0.085, 0, 0));
    g.add(box(0.1, 0.05, 0.2, '#111', s * 0.085, 0.025, 0.03));   // 浅沓
  });
  // 袍（縫腋袍）：広い肩から裾へ、裾に襴（横に縫い付けた布）
  g.add(lathe([[0.2, 0.3], [0.235, 0.36], [0.24, 0.5], [0.22, 0.7], [0.2, 0.86], [0.21, 0.98], [0.17, 1.06], [0.07, 1.11]], hoColor, 0.72));
  g.add(lathe([[0.245, 0.3], [0.25, 0.36], [0.235, 0.37]], hoColor, 0.74));     // 襴の縁
  // 袖：肩から大きく垂れ、袖口は広い（回転体を縦長につぶして作る）
  [-1, 1].forEach(s => {
    const sl = lathe([[0.02, 0.0], [0.13, 0.04], [0.16, 0.2], [0.15, 0.36], [0.09, 0.44], [0.02, 0.46]], hoColor, 1.0);
    sl.scale.set(0.55, 1, 1.15); sl.position.set(s * 0.27, 0.56, 0.03); sl.rotation.z = s * 0.1; g.add(sl);
  });
  // 襟（盤領：丸い襟）
  const eri = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), mat(hoColor, 0.6)); eri.rotation.x = Math.PI / 2; eri.position.set(0, 1.1, 0.005); g.add(eri);
  g.add(lathe([[0.215, 0.66], [0.215, 0.7]], C.sekitai, 0.74));           // 石帯（黒い革の帯）
  // 下襲の裾：後ろへ長く引く
  const kyo = box(0.26, 0.015, 1.1, C.shitagasane, 0, 0.012, -0.62); g.add(kyo);
  const kyoUp = box(0.24, 0.5, 0.015, C.shitagasane, 0, 0.36, -0.14); kyoUp.rotation.x = -0.2; g.add(kyoUp);
  // 笏
  const shaku = box(0.05, 0.2, 0.012, C.shaku, 0.02, 0.86, 0.2); shaku.rotation.x = -0.25; g.add(shaku);
  // 顔と冠（巾子と、後ろへ垂れる纓）
  g.add(face(C.skin, 1.2, 0.01));
  g.add(cyl(0.088, 0.09, 0.07, C.kanmuri, 0, 1.24, -0.01));
  g.add(cyl(0.045, 0.05, 0.1, C.kanmuri, 0, 1.3, -0.04));
  const ei = box(0.05, 0.36, 0.008, C.kanmuri, 0, 1.15, -0.13); ei.rotation.x = 0.35; g.add(ei);
  return g;
}

// ---------------- 女性（座り姿）：女房装束・小袿 ----------------
function seatedLady(c, opts) {
  // c：{ outer, lining, inner, hitoe, karaginu?, mo? }
  const g = group(), skin = '#f6ece2';
  g.add(lathe([[0.62, 0], [0.6, 0.025], [0.01, 0.04]], c.hitoe, 1.3));
  g.add(lathe([[0.58, 0.015], [0.55, 0.05], [0.01, 0.07]], c.inner, 1.3));
  g.add(lathe([[0.54, 0.03], [0.51, 0.08], [0.01, 0.09]], c.lining, 1.3));
  g.add(lathe([[0.52, 0.05], [0.46, 0.1], [0.35, 0.17], [0.26, 0.26], [0.21, 0.36], [0.18, 0.46], [0.14, 0.55], [0.1, 0.61], [0.04, 0.63]], c.outer, 1.2));
  if (opts.karaginu) g.add(lathe([[0.23, 0.36], [0.2, 0.46], [0.16, 0.55], [0.11, 0.61], [0.04, 0.635]], c.karaginu, 1.15));
  if (opts.kouchiki) g.add(lathe([[0.3, 0.2], [0.24, 0.32], [0.19, 0.44], [0.15, 0.54], [0.1, 0.6], [0.04, 0.625]], c.kouchiki, 1.18));
  // 袖
  [-1, 1].forEach(s => {
    const sl = sphere(0.14, c.outer, s * 0.22, 0.3, 0.05, 1, 1.25, 1.6); g.add(sl);
    g.add(sphere(0.142, c.lining, s * 0.235, 0.22, 0.09, 1, 0.6, 1.45));
  });
  // 裳：腰から後ろへ長く引く
  if (opts.mo) {
    for (let k = 0; k < 6; k++) {
      const x = -0.2 + k * 0.08;
      const p = box(0.075, 0.012, 0.95, c.mo, x * 1.2, 0.015, -0.72); g.add(p);
    }
    const koshi = box(0.4, 0.04, 0.04, c.mo, 0, 0.36, -0.22); g.add(koshi);
  }
  // 檜扇
  if (opts.ogi) { const f = box(0.012, 0.15, 0.11, '#e8d3a0', 0.12, 0.42, 0.22); f.rotation.y = 0.5; g.add(f); }
  // 顔と髪
  g.add(face(skin, 0.73, -0.06));
  g.add(sphere(0.092, PALETTE.hair, 0, 0.765, -0.085, 1, 1.05, 1));
  [-1, 1].forEach(s => g.add(box(0.025, 0.22, 0.06, PALETTE.hair, s * 0.075, 0.64, -0.03)));
  const back = box(0.2, 0.72, 0.03, PALETTE.hair, 0, 0.4, -0.27); back.rotation.x = 0.12; g.add(back);
  g.add(box(0.22, 0.012, 0.75, PALETTE.hair, 0, 0.012, -0.68));
  return g;
}

// ---------------- 寝殿造（小さな模型） ----------------
// VR と同じ構え：母屋5間×2間に四面の廂（7間×4間）、高い床、簀子と高欄、南の階と階隠、深い軒の屋根、南面の御簾
function shinden() {
  const P = PALETTE, g = group();
  const bay = 0.22, W = bay * 7, D = bay * 4, FY = 0.1, H = 0.22, sun = 0.09;
  g.add(box(W + 1.0, 0.01, D + 1.3, P.sand, 0, 0.005, 0.25));                     // 南庭の白砂
  g.add(box(W, 0.012, D, P.wood, 0, FY, 0));                                       // 廂の床（板敷き）
  g.add(box(bay * 5, 0.013, bay * 2, '#a07a4c', 0, FY + 0.001, 0));                  // 母屋の床（少し濃く塗り分ける）
  for (const z of [-bay, bay]) for (let i = 0; i <= 5; i++) g.add(cyl(0.007, 0.007, FY + H, P.woodDark, -bay * 2.5 + i * bay, 0, z, 8));   // 母屋の柱
  g.add(box(W + sun * 2, 0.01, D + sun * 2, P.wood, 0, FY - 0.012, 0));            // 簀子
  // 柱（廂の外まわりと、母屋の柱）
  for (let i = 0; i <= 7; i++) for (const z of [-D / 2, D / 2]) g.add(cyl(0.008, 0.008, FY + H, P.woodDark, -W / 2 + i * bay, 0, z, 8));
  for (let j = 1; j < 4; j++) for (const x of [-W / 2, W / 2]) g.add(cyl(0.008, 0.008, FY + H, P.woodDark, x, 0, -D / 2 + j * bay, 8));
  // 高欄（簀子の縁）。南の中央は階のためにあける
  const ky = FY + 0.035, ez = D / 2 + sun - 0.005, ex = W / 2 + sun - 0.005;
  [[-ex, -bay / 2], [bay / 2, ex]].forEach(([a, b]) => g.add(box(b - a, 0.004, 0.004, P.woodDark, (a + b) / 2, ky, ez)));
  [-1, 1].forEach(sx => g.add(box(0.004, 0.004, D + sun * 2, P.woodDark, sx * ex, ky, 0)));
  for (let x = -ex; x <= ex + 1e-6; x += 0.05) if (Math.abs(x) > bay / 2) g.add(box(0.004, 0.035, 0.004, P.woodDark, x, FY + 0.017, ez));
  // 南面：上蔀を跳ね上げ、御簾を下ろす（帽額の緑の帯）
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + bay / 2 + i * bay;
    const sh = box(bay - 0.02, 0.006, 0.07, P.lacquer, x, FY + 0.19, D / 2 + 0.035); sh.rotation.x = -0.15; g.add(sh);
    g.add(box(bay - 0.02, i === 4 ? 0.08 : 0.16, 0.003, P.sudare, x, FY + (i === 4 ? 0.13 : 0.09), D / 2 - 0.004));
  }
  g.add(box(W, 0.02, 0.004, '#3f6a3c', 0, FY + 0.165, D / 2 - 0.002));
  // 階と階隠
  for (let k = 0; k < 5; k++) g.add(box(bay - 0.04, 0.008, 0.024, P.wood, 0, FY - 0.02 - k * 0.018, ez + 0.02 + k * 0.024));
  [-1, 1].forEach(sx => g.add(cyl(0.007, 0.007, FY + 0.17, P.woodDark, sx * bay / 2, 0, ez + 0.16, 8)));
  const hk = box(bay + 0.1, 0.008, 0.2, P.roof, 0, FY + 0.19, ez + 0.1); hk.rotation.x = 0.25; g.add(hk);
  // 屋根：深い軒の寄棟形（入母屋の簡略）。上に棟
  const eaveY = FY + H + 0.01, O = 0.12, hx = W / 2 + O, hz = D / 2 + O, ridge = 0.2;
  const shape = new THREE.BufferGeometry();
  const v = [ -hx, eaveY, hz,  hx, eaveY, hz,  hx * 0.45, eaveY + ridge, 0,  -hx * 0.45, eaveY + ridge, 0,
              hx, eaveY, -hz,  -hx, eaveY, -hz ];
  const idx = [0, 1, 2, 0, 2, 3,  4, 5, 3, 4, 3, 2,  1, 4, 2,  5, 0, 3];
  shape.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); shape.setIndex(idx); shape.computeVertexNormals();
  const yane = group(); yane.name = 'yane';
  const roof = new THREE.Mesh(shape, mat(P.roof, 0.9)); roof.material.side = THREE.DoubleSide; roof.castShadow = true; yane.add(roof);
  yane.add(box(hx * 0.9 + 0.02, 0.02, 0.03, P.woodDark, 0, eaveY + ridge + 0.005, 0));
  g.add(yane);
  return g;
}

// ---------------- 表示の切り替え ----------------
AFRAME.registerComponent('heian-stage', {
  init: function () {
    this.holder = new THREE.Group();
    this.el.object3D.add(this.holder);
    this.spin = false;
  },
  show: function (obj, scale) {
    while (this.holder.children.length) this.holder.remove(this.holder.children[0]);
    obj.scale.setScalar(scale); this.holder.add(obj); this.holder.rotation.y = 0;
  },
  tick: function (t, dt) {
    if (!this.spin) return;
    this.holder.rotation.y += dt * 0.0006;
    const fig = this.el.querySelector('#fig'); if (fig) fig.object3D.rotation.y += dt * 0.0006;   // 写実的な人物（GLB）も回す
  }
});

window.HEIAN = { PALETTE, INFO, sokutai, seatedLady, shinden };
