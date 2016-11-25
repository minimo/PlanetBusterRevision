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
SC_W = 320;
SC_H = 480;
SC_OFFSET_X = 0;
SC_OFFSET_Y = 0;
SC_W_C = SC_W*0.5;   //CENTER
SC_H_C = SC_H*0.5;

//レイヤー区分
LAYER_SYSTEM = 12;          //システム表示
LAYER_FOREGROUND = 11;      //フォアグラウンド
LAYER_EFFECT_UPPER = 10;    //エフェクト上位
LAYER_PLAYER = 9;           //プレイヤー
LAYER_OBJECT_UPPER = 8;     //オブジェクト上位
LAYER_BULLET = 7;           //弾
LAYER_SHOT = 6;             //ショット
LAYER_OBJECT_MIDDLE = 5;    //オブジェクト中間
LAYER_EFFECT_MIDDLE = 4;    //エフェクト中間
LAYER_OBJECT_LOWER = 3;     //オブジェクト下位
LAYER_EFFECT_LOWER = 2;     //エフェクト下位
LAYER_SHADOW = 1;           //影
LAYER_BACKGROUND = 0;       //バックグラウンド

//敵タイプ定数
ENEMY_SMALL = 0;
ENEMY_MIDDLE = 1;
ENEMY_LARGE = 2;
ENEMY_MBOSS = 3;
ENEMY_BOSS = 4;
ENEMY_BOSS_EQUIP = 5; //ボス装備
ENEMY_ITEM = 9;

//爆発タイプ定数
EXPLODE_NOTHING = -1;
EXPLODE_SMALL = 0;
EXPLODE_MIDDLE = 1;
EXPLODE_LARGE = 2;
EXPLODE_GROUND = 3;
EXPLODE_MBOSS = 4;
EXPLODE_BOSS = 5;

//アイテム種類
ITEM_POWER = 0;
ITEM_BOMB = 1;
ITEM_1UP = 0;

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

//インスタンス
var app;

window.onload = function() {
    app = pbr.Application();
    app.run();
    app.enableStats();
};
