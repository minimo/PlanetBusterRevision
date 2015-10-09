/*
 *  main.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
//デバッグフラグ
DEBUG = false;
MUTEKI = false;
VIEW_COLLISION = false;

//スクリーンサイズ
SC_W = 480;
SC_H = 480;
SC_OFFSET_X = 0;
SC_OFFSET_Y = 0;

//レイヤー区分
LAYER_SYSTEM = 10;          //システム表示
LAYER_FOREGROUND = 9;       //フォアグラウンド
LAYER_EFFECT_UPPER = 8;     //エフェクト上位
LAYER_PLAYER = 8;           //プレイヤー
LAYER_OBJECT_UPPER = 6;     //オブジェクト上位
LAYER_BULLET = 5;           //弾    
LAYER_SHOT = 4;             //ショット
LAYER_OBJECT = 3;           //オブジェクト中間
LAYER_OBJECT_LOWER = 2;     //オブジェクト下位
LAYER_EFFECT_LOWER = 1;     //エフェクト下位
LAYER_BACKGROUND = 0;       //バックグラウンド

var KEYBOARD_MOVE = {
      0: { x:  1.0, y:  0.0 },
     45: { x:  0.7, y: -0.7 },
     90: { x:  0.0, y: -1.0 },
    135: { x: -0.7, y: -0.7 },
    180: { x: -1.0, y:  0.0 },
    225: { x: -0.7, y:  0.7 },
    270: { x:  0.0, y:  1.0 },
    315: { x:  0.7, y:  0.7 },
};

window.onload = function() {
    var app = pbr.Application();
    app.run();
    app.enableStats();
};
