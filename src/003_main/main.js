/*
 *  main.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
//バージョンナンバー
const _VERSION_ = "0.1.0";

//デバッグフラグ
const DEBUG = false;
const MUTEKI = false;
const VIEW_COLLISION = false;

//スクリーンサイズ
const SC_W = 320;
const SC_H = 480;
const SC_OFFSET_X = 0;
const SC_OFFSET_Y = 0;
const SC_W_C = SC_W*0.5;   //CENTER
const SC_H_C = SC_H*0.5;

//レイヤー区分
const LAYER_SYSTEM = 12;          //システム表示
const LAYER_FOREGROUND = 11;      //フォアグラウンド
const LAYER_EFFECT_UPPER = 10;    //エフェクト上位
const LAYER_PLAYER = 9;           //プレイヤー
const LAYER_BULLET = 8;           //弾
const LAYER_SHOT = 7;             //ショット
const LAYER_OBJECT_UPPER = 6;     //オブジェクト上位
const LAYER_OBJECT_MIDDLE = 5;    //オブジェクト中間
const LAYER_EFFECT_MIDDLE = 4;    //エフェクト中間
const LAYER_OBJECT_LOWER = 3;     //オブジェクト下位
const LAYER_EFFECT_LOWER = 2;     //エフェクト下位
const LAYER_SHADOW = 1;           //影
const LAYER_BACKGROUND = 0;       //バックグラウンド

//敵タイプ定数
const ENEMY_SMALL = 0;
const ENEMY_MIDDLE = 1;
const ENEMY_LARGE = 2;
const ENEMY_MBOSS = 3;
const ENEMY_BOSS = 4;
const ENEMY_BOSS_EQUIP = 5; //ボス装備
const ENEMY_ITEM = 9;

//爆発タイプ定数
const EXPLODE_NOTHING = -1;
const EXPLODE_SMALL = 0;
const EXPLODE_MIDDLE = 1;
const EXPLODE_LARGE = 2;
const EXPLODE_GROUND = 3;
const EXPLODE_MBOSS = 4;
const EXPLODE_BOSS = 5;

//アイテム種類
const ITEM_POWER = 0;
const ITEM_BOMB = 1;
const ITEM_1UP = 0;

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
    app = Application();
    app.domElement.addEventListener('click', function dummy() {
        var context = phina.asset.Sound.getAudioContext();
        context.resume();
    });
    app.run();
    app.enableStats();
};
