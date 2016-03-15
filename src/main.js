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

//敵タイプ定数
ENEMY_SMALL = 0;
ENEMY_MIDDLE = 1;
ENEMY_LARGE = 2;
ENEMY_MBOSS = 3;
ENEMY_BOSS = 4;
ENEMY_ITEM = 9;

//爆発タイプ定数
EXPLODE_NOTHING = -1;
EXPLODE_SMALL = 0;
EXPLODE_MIDDLE = 1;
EXPLODE_LARGE = 2;
EXPLODE_GROUND = 3;
EXPLODE_MBOSS = 4;
EXPLODE_BOSS = 5;

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

//エレメント同士の接触判定
phina.display.DisplayElement.prototype.isHitElement = function(elm) {
    if (this.boundingType == 'rect') {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectRect(this, elm);
        } else {
            return phina.collision.testRectCircle(this, elm);
        }
    } else {
        if (elm.boundingType == 'rect') {
            return phina.collision.testCiecleRect(this, elm);
        } else {
            return phina.collision.testCircleCircle(this, elm);
        }
    }
}

//子要素全て切り離し
phina.app.Element.prototype.removeChildren = function(beginIndex) {
    beginIndex = beginIndex || 0;
    var tempChildren = this.children.slice();
    var len = len = tempChildren.length;
    for (var i = beginIndex; i < len; ++i) {
        tempChildren[i].remove();
    }
    this.children = [];
}

//ターゲット方向を向く
phina.display.DisplayElement.prototype.lookAt = function(target) {
    target = target || {x: 0, y: 0};

    var ax = this.x - target.x;
    var ay = this.y - target.y;
    var rad = Math.atan2(ay, ax);
    var deg = ~~(rad * toDeg);
    this.rotation = deg + 90;
    return this;
}
