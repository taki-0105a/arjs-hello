# arjs-hello

AR.js（A-Frame 版）で作った、ブラウザだけで動く WebAR です。アプリのインストールは要りません。

| | ページ | 内容 |
|---|---|---|
| 1 | [Hello World](https://taki-0105a.github.io/arjs-hello/) | 「AR.js」マーカーを写すと、マーカーの上に「Hello World」が出る |
| 2 | [古典の身なり AR](https://taki-0105a.github.io/arjs-hello/task9/) | 束帯の影絵マーカーを写すと、寝殿造や、束帯・女房装束・僧侶・武士の人物が立体で出る。「問いに挑戦」で、位当てや「どの時代の武士か」に答えて模型で確かめられる |
| 2' | [古典の身なり AR（マーカーなし）](https://taki-0105a.github.io/arjs-hello/task9/markerless.html) | 机や床の平面を写して置く。二本指で回し、つまんで大きさを変えられる |

どのページも、URL の末尾に `?preview=1` を付けると、カメラを使わずに中身だけを確かめられます（マーカーなし版は、そのままパソコンで回して見られます）。

## 使い方

1. マーカー画像を、白い余白ごと画面に大きく表示するか、印刷します。
   - Hello World：[marker-arjs.png](marker-arjs.png)
   - 古典の身なり AR：[task9/marker-sokutai.png](task9/marker-sokutai.png)
2. スマホのブラウザ（iPhone は Safari）でページを開き、カメラの使用を許可します。
3. マーカーにカメラを向けます。30〜50cm ほど離し、マーカー全体が画面に入るようにすると認識しやすくなります。

## しくみ

- [A-Frame](https://aframe.io/) 1.3.0 と [AR.js](https://github.com/AR-js-org/AR.js) 3.4.5 を CDN から読み込むだけで、ビルドの工程はありません。
- マーカーは、白い余白の中の黒い枠と、その内側の絵柄でできています。AR.js は黒い枠で四角を見つけ、内側の絵柄（16×16 に縮めた明るさ）を `.patt` ファイルと照らし合わせて、どのマーカーかを判別します。`.patt` は、マーカー画像の内側から作っています。
- 古典の身なり AR の人物は、[MakeHuman](http://www.makehumancommunity.org/)（CC0）の人体に Blender で装束を着せ、絵巻・人形風に仕上げた模型（glTF）です。A-Frame の `gltf-model` で読み込みます。マーカーなし版は [model-viewer](https://modelviewer.dev/) で表示します。

## ファイル

```
index.html            Hello World（マーカー型）
marker-arjs.png       「AR.js」マーカーの画像
marker-arjs.patt      その画像から作ったパターンファイル
task9/index.html      平安の装束 AR（マーカー型）
task9/markerless.html 平安の装束 AR（マーカーなし）
task9/heian.js        寝殿造の模型の組み立て、色と説明文
task9/quiz.js         問い（位当て・どの時代の武士か など）と、答えの記録（xAPI の形、端末の中だけ）
task9/models/*.glb    人物の模型（10 体）
task9/marker-sokutai.png / .patt   束帯の影絵マーカー
```

## 問いと学習の記録

「問いに挑戦」を押すと、7つの問いに答えられます（位当て、どの時代の武士か×4、女房と女主人、僧の位）。答えたあとに模型で確かめ、本文に戻る問いが出ます。答えは xAPI の形の記録（statement）として、その端末のブラウザの中にだけ残ります。どこかに送ることはしません（LRS への送信は未実装）。

## ライセンス

- コード：[MIT License](LICENSE)
- 人物の模型（`task9/models/`）とマーカー画像：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)。使うときは「taki-0105a / arjs-hello」と出典を示してください。
- 人体の元は MakeHuman の CC0 の素材です。
- 装束の色や形は辞典や博物館の資料をもとにした目安で、時代や資料によって違いがあります。
