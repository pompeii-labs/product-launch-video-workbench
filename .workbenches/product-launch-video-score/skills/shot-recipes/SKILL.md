---
name: shot-recipes
description: Shot recipe cards for cutting picture to the score - rhythm cards (where cuts fall, beat-cut strings, speed ramps, trailer grammar) and transition cards (how one beat hands to the next), plus how to place cuts on beats. Load after the score and its analysis arrive, when timing beats to bars and choosing how each cut lands.
---

# Shot recipes

Recipe cards from video-shotcraft (Apache-2.0; provenance in `NOTICE.md`). Each card names an
intent, a choice table, a parameter table with typical values and how they feel, and known
pitfalls. The cards are written in Chinese; read them as they are.

How to use them in this bench:

- **Implement from the parameter table.** Each card's "参考实现" section points at demo source
  files that are not included. Build the move yourself in Remotion from the card's parameters.
- **There are no sound effects.** Cards that say a move depends on a sound (a shutter click on
  each flash) land that move on a beat or hit of the score instead, from `music/analysis.json`.
- **Beat analysis is given.** `references/music-beat-sync.md` describes measuring beats with
  librosa; that is not installed and not needed: `video/music/analysis.json` already lists the
  tempo, every beat with its bar position, and the sections. Use its rules for where cuts fall,
  not its scripts.
- **Bench rules win.** No `fade()` between beats, every line on screen is declared, and the
  gate's checks hold. A card that needs a technique the bench forbids is out.
- **Restraint.** One loud rhythm move per video at most (the cards say so too); vary the
  transitions across the video instead of repeating one.

| Card | Group | Energy | One line |
|---|---|---|---|
| [beat-cut-moves](references/shots/rhythm/beat-cut-moves.md) | rhythm | 高 | 硬切当节拍乐器——连闪定格：三次白闪各硬切同一画面的一个裁切（全景→卡片→特写），快门余韵沉降后停在特写收束 |
| [beat-step-list-theme-cycle](references/shots/rhythm/beat-step-list-theme-cycle.md) | rhythm | 高（0.6s 一拍三通道齐跳，密度型高能） | 三通道节拍器——深色场形容词列表逐拍上移一行，视口中央固定胶囊"接住"下一个词并换色，整场底色同拍跟换；行、色、场三通道锁死同一拍点 |
| [panel-grid-moves](references/shots/rhythm/panel-grid-moves.md) | rhythm | 中高 | 分格节奏——comic-panel-split 漫画斜格劈出同一主体的三个机位，咔咔咔三格定格后末格斜边吃屏成海报 |
| [quad-split-parallel-scenes](references/shots/rhythm/quad-split-parallel-scenes.md) | rhythm | 高（四线并行 + 错拍冲击，标准的 BGM 副歌位） | 画面硬切 2×2 四宫格，四个象限并行跑各自的微场景（打字、急推、逐词、交互链），关键节拍错开 3–6 帧制造信息轰炸 |
| [rhythm-interrupt-moves](references/shots/rhythm/rhythm-interrupt-moves.md) | rhythm | A 中 | 打断节奏——jump-cut-punch-in 三级跳切推近：同构图三次无补间硬跳放大，逐级逼近目标 |
| [sakuga-timing-shift](references/shots/rhythm/sakuga-timing-shift.md) | rhythm | 中高 | 一拍三转一拍一——元素先以每 3 帧一步的手翻书顿挫移动，高潮瞬间切成逐帧丝滑冲刺，帧率量化的突变本身就是看点 |
| [speed-ramp-freeze](references/shots/rhythm/speed-ramp-freeze.md) | rhythm | 中高（速度反差本身即energy beat） | 帧号非线性 remap 的节奏手法——定格标注（流动→定格圈注→解冻） |
| [trailer-grammar-moves](references/shots/rhythm/trailer-grammar-moves.md) | rhythm | A 高 | 预告片语法一式——trailer-bumper 前置速剪钩子：三镜 9f 速剪 + 黑场静默一拍，再开场标题 |
| [bottom-push-stack-wipe](references/shots/transition/bottom-push-stack-wipe.md) | transition | 中 | 底边上推换章——新场景连底色整屏从底边向上推入，把旧场景物理顶出画外，连推数章各配一种饱和底色，内容钉死在各自色底坐标系里随底色走 |
| [card-flip-reveal](references/shots/transition/card-flip-reveal.md) | transition | 中高 | 功能卡 3D 翻面揭示——卡片沿 Y 轴翻 180°，正面 UI 翻到侧棱最薄处掠过一道随角度移动的受光，背面揭出大号结论数字，逐张错峰扫过整排 |
| [card-flock-tumble](references/shots/transition/card-flock-tumble.md) | transition | 极高（全片能量顶点用） | 三张 UI 页卡从侧棱薄边 3D 翻飞成阶梯站定（全程清晰、样条连续丝滑），站定后保持慢转不停，快速收束吸入中心，炸出单个湍流烟雾环扩散，巨字横贯收场 |
| [circle-match-iris](references/shots/transition/circle-match-iris.md) | transition | 中高 | 圆心匹配光圈切——光圈从页面上圆形元素的圆心炸开，圈内新页的圆形图表接在同一个圆上；匹配剪辑给光圈一个语义锚点 |
| [gradient-transition](references/shots/transition/gradient-transition.md) | transition | 低（纯背景运动，为前景内容让路） | 背景在 linear、radial、conic 三类 CSS 渐变间平滑过渡——角度、色标、中心、半径逐参数插值，段间交叉淡化换类型 |
| [line-carry-transition](references/shots/transition/line-carry-transition.md) | transition | 中 | 线条接力横移转场——场景 A 的进度条延伸出画，镜头跟线横移，线在移动中拐角围出场景 B 的卡框，全程无剪切 |
| [mosaic-reframe](references/shots/transition/mosaic-reframe.md) | transition | 中（连续流动的重排，无爆点，气质从容） | 12 张瓦片在规则网格、feature mosaic、对角瀑布串三种排版间连续变形，位置宽高各自插值、逐片微错峰，段间留 hold |
| [page-turn-transitions](references/shots/transition/page-turn-transitions.md) | transition | 中高 | 整页体块转场——barn-door-split 对开门裂幕（旧页裂两半滑出、新页迎上） |
| [print-texture-transitions](references/shots/transition/print-texture-transitions.md) | transition | 中（渐进显形，无冲击拍） | 印刷质感转场——ink-bleed-reveal 墨渗揭示（须状渗边洇开吃掉旧景） |
| [shot-transitions](references/shots/transition/shot-transitions.md) | transition | n/a（技法卡，不占能量位） | 镜头交棒三式——推进流白、whip-pan 甩镜（急刹款）、mask-wipe 穿窗（纵深款），按能量落差与接缝语义选型 |
| [tear-streak-transitions](references/shots/transition/tear-streak-transitions.md) | transition | 高 | 撕裂转场——glitch-displace 噪声撕裂（16 横条错位抖动中硬切），数字故障语义的条带级撕裂 |
| [transition-hidden-cut](references/shots/transition/transition-hidden-cut.md) | transition | n/a（技法卡，不占能量位） | 藏切点转场三式——前景遮挡隐形切、对撞开屏、暖色漏光，硬切藏进遮挡/撞击/光峰的 1-3 帧里，观众看不见剪刀 |
| [transition-travel](references/shots/transition/transition-travel.md) | transition | n/a（技法卡，不占能量位） | 穿越式转场——字腔穿越：巨型章节标题的字形就是一扇窗，镜头钻进字形笔画完成换景 |
| [white-flash-logo-simplify-cut](references/shots/transition/white-flash-logo-simplify-cut.md) | transition | 中高（一次脉冲式重音，前后都是静场） | 液态金属质感的彩色词标静置流光，蓄力后从字心炸出一记白闪过曝，曝光回落时同一位置已是扁平版字标——一次闪白完成质感降维 |
| [wipe-transitions](references/shots/transition/wipe-transitions.md) | transition | 中 | 几何擦除转场——blinds-slice 百叶窗切条（12 根 3D 叶片错峰翻面成波，波扫过后整页由 A 换成 B） |
