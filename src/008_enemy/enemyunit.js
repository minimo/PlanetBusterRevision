/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵小隊単位定義
enemyUnit = {

/*
 * 突撃ヘリ「ホーネット」（パターン１）
 */
"Hornet1-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-150, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:1} },
],
"Hornet1-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-150, param:{pattern:1} },
],
"Hornet1-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:1} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン２）
 */
"Hornet2-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:2} },
],
"Hornet2-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:2} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン３）
 */
"Hornet3-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:3} },
],
"Hornet3-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:3} },
],
"Hornet3-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:3} },
],

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
"MudDauber-left": [
    { "name": "MudDauber", "x": SC_W*0.3, "y":-SC_H*0.1 },
],

"MudDauber-center": [
    { "name": "MudDauber", "x": SC_W*0.5, "y":-SC_H*0.1 },
],

"MudDauber-right": [
    { "name": "MudDauber", "x": SC_W*0.7, "y":-SC_H*0.1 },
],

/*
 *  中型爆撃機「ビッグウィング」
 */
"BigWing-left": [
    { "name": "BigWing", "x":SC_W*0.2, "y":-SC_H*0.1 },
],

"BigWing-right": [
    { "name": "BigWing", "x":SC_W*0.8, "y":-SC_H*0.1 },
],

/*
 *  飛空艇「スカイブレード」
 */
"SkyBlade-left": [
    { "name": "SkyBlade", "x":-SC_W*0.2, "y": SC_H*0.4 },
],

"SkyBlade-right": [
    { "name": "SkyBlade", "x": SC_W*1.2, "y": SC_H*0.4 },
],

/*
 *  砲台「ブリュナーク」
 */
"Brionac1-left": [
    { "name": "Brionac1", "x": SC_W*0.3, "y":-SC_H*0.1, param:{pos:"left"}},
],

"Brionac1-center": [
    { "name": "Brionac1", "x": SC_W*0.5, "y":-SC_H*0.1, param:{pos:"center"}},
],

"Brionac1-right": [
    { "name": "Brionac1", "x": SC_W*0.7, "y":-SC_H*0.1, param:{pos:"right"}},
],

/*
 *  中型戦車「フラガラッハ」
 */
"Fragarach-center": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.35, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.25, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
],
"Fragarach-left": [
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.1, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.2, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.3, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.4, param:{pattern:"l"} },
],
"Fragarach-right": [
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.1, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.2, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.3, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.4, param:{pattern:"r"} },
],
"Fragarach-left2": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.4, param:{pattern:"c"} },
],
"Fragarach-right2": [
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.4, param:{pattern:"c"} },
],


/*
 *  中型輸送機「トイボックス」
 */
//パワーアップ
"ToyBox-p-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"power"} },],

//ボム
"ToyBox-b-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"bomb"} },],

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
"ThorHammer": [
    { "name": "ThorHammer", "x":SC_W*0.5, "y": SC_H*1.3 },
],

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
"Golyat": [
    { "name": "Golyat", "x":SC_W*0.5, "y": SC_H*-0.2 },
],

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
"Raven": [
    { "name": "Raven", "x": SC_W*1.2, "y": SC_H*0.7 },
],

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
"Garuda": [
    { "name": "Garuda", "x": SC_W*0.5, "y": SC_H*0.2 },
],

}
