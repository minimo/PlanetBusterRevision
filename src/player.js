/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

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

tm.define("pbr.Player", {
    superClass: "phina.display.Sprite",
    layer: LAYER_PLAYER,

    //当り判定サイズ
    width: 2,
    height: 2,

    control: true,  //操作可能フラグ
    shotON: false,  //ショットフラグ
    mouseON: false, //マウス操作中フラグ

    isCollision: false, //当り判定有効フラグ

    timeMuteki: 0, //無敵フレーム残り時間

    speed: 4,       //移動係数
    touchSpeed: 4,  //タッチ操作時移動係数
    type: 0,        //自機タイプ(0:赤 1:緑 2:青)
    power: 0,       //パワーアップ段階
    powerMax: 5,    //パワーアップ最大

    shotPower: 10,      //ショット威力
    shotInterval: 6,    //ショット間隔

    rollcount: 50,
    pitchcount: 50,

    parentScene: null,
    indecies: [0,1,2,3,4,4,4,5,6,7,8],

    init: function() {
        this.superInit("gunship", 48, 48);
        this.setFrameIndex(4);

        //コア
        this.core = tm.display.Shape({width:16, height:16}).addChildTo(this);
        this.core.canvas.setFillStyle(
            tm.graphics.RadialGradient(8, 8, 0, 8, 8, 8)
                .addColorStopList([
                    {offset:0.0, color: "hsla(200, 60%, 70%, 1.0)"},
                    {offset:0.5, color: "hsla(240, 60%, 70%, 1.0)"},
                    {offset:1.0, color: "hsla(240, 60%, 50%, 0.0)"},
                ]).toStyle()
            ).fillRect(0, 0, 16, 16);
        this.core.tweener.clear();
        this.core.tweener.scale(1.0, 100, "easeInOutQuad").scale(0.5, 150, "easeInOutQuad").setLoop(true);

        //ビット
        this.bits = [];
        this.bits[0] = pb3.PlayerBit(0).addChildTo(this);
        this.bits[1] = pb3.PlayerBit(1).addChildTo(this);
        this.bits[2] = pb3.PlayerBit(2).addChildTo(this);
        this.bits[3] = pb3.PlayerBit(3).addChildTo(this);

        this.openBit(0);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;
        this.checkHierarchy = true;

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function() {
        //操作系
        if (this.control) {
            //マウス操作
            var p = app.pointing;
            if (p.getPointing()) {
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;

                this.mouseON = true;
                this.shotON = true;
            } else {
                this.mouseON = false;
                this.shotON = false;
            }

            //キーボード操作
            var kb = app.keyboard;
            var angle = kb.getKeyAngle();
            if (angle !== null) {
                var m = KEYBOARD_MOVE[angle];
                this.x += m.x*this.speed;
                this.y += m.y*this.speed;
            }
            if (!this.mouseON) this.shotON = app.keyboard.getKey("Z");

            //ショットタイプ変更（テスト用）
            if (app.keyboard.getKey("X") && this.time > this.changeInterval) {
                this.type = (this.type+1)%3;
                this.openBit(this.type);
                this.changeInterval = this.time+30;
            }

            //移動範囲の制限
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);

            //ショット
            if (this.shotON && this.time % this.shotInterval == 0) this.enterShot();
        }

        //機体ロール
        var x = ~~this.x;
        var bx = ~~this.bx;
        if (bx > x) {
            this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
        }
        if (bx < x) {
            this.rollcount+=2;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        var vx = Math.abs(bx - x);
        if (vx < 2) {
            if (this.rollcount < 50) this.rollcount+=2; else this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        this.setFrameIndex(this.indecies[Math.clamp(~~(this.rollcount/10),0, 9)]);

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
    },

    //被弾処理
    damage: function() {
        if (this.timeMuteki>0 || MUTEKI) return;

        pb3.Effect.ExplodePlayer().setPosition(this.x, this.y).addChildTo(this.parentScene);
        app.playSE("explodePlayer");

        this.parentScene.stageMiss++;
        this.parentScene.life--;
        this.parentScene.dispLife.dec();
        if (this.parentScene.life > -1) {
            this.startup();
            this.parentScene.eraseBullet();
            this.parentScene.eraseBulletTime = 60;
        } else {
            this.setPosition(SC_W*0.5, SC_H*3);
            this.control = false;
        }
    },

    //アイテム取得
    getItem: function(id, type) {
        switch (id) {
            case 0: //パワーアップ
                if (this.type == type) {
                    if (this.power < this.powerMax) {
                        this.power++;
                    } else {
                    }
                }
                this.type = type;
                this.openBit(type);
                app.playSE("powerup", 1);
                break;
            case 1: //ボム
                app.playSE("powerup", 1);
                break;
            case 2: //１ＵＰ
                break;
        }
    },

    //ショット発射
    enterShot: function() {
        var shotPower = this.shotPower;
        //自機から
        pb3.ShotBullet(0, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x   , this.y-16);
        pb3.ShotBullet(0, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x+16, this.y-8);
        pb3.ShotBullet(0, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x-16, this.y-8);
    },

    //ビット展開
    openBit: function(type) {
        var color = 0;
        switch (type) {
            case 0:
                //赤（前方集中型）
                this.bits[0].tweener.clear().to({ x:  5, y:-32, rotation: 2, alpha:1}, 300).call(function(){this.tweener.clear().moveBy(-40,0,500,"easeInOutSine").moveBy( 40,0,500,"easeInOutSine").setLoop(true);}.bind(this.bits[0]));
                this.bits[1].tweener.clear().to({ x: -5, y:-32, rotation:-2, alpha:1}, 300).call(function(){this.tweener.clear().moveBy( 40,0,500,"easeInOutSine").moveBy(-40,0,500,"easeInOutSine").setLoop(true);}.bind(this.bits[1]));
                this.bits[2].tweener.clear().to({ x: 20, y:-24, rotation: 2, alpha:1}, 300).call(function(){this.tweener.clear().moveBy(-50,0,500,"easeInOutSine").moveBy( 50,0,500,"easeInOutSine").setLoop(true);}.bind(this.bits[2]));
                this.bits[3].tweener.clear().to({ x:-20, y:-24, rotation:-2, alpha:1}, 300).call(function(){this.tweener.clear().moveBy( 50,0,500,"easeInOutSine").moveBy(-50,0,500,"easeInOutSine").setLoop(true);}.bind(this.bits[3]));
                color = 0;
                break;
            case 1:
                //緑（方向変更型）
                this.bits[0].tweener.clear().to({ x: 48, y:0, rotation:0, alpha:1}, 300).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-48, y:0, rotation:0, alpha:1}, 300).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 12, y:40, rotation:0, alpha:1}, 300).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-12, y:40, rotation:0, alpha:1}, 300).setLoop(false);
                color = 80;
                break;
            case 2:
                //青（広範囲型）
                this.bits[0].tweener.clear().to({ x: 36, y:16, rotation:  5, alpha:1}, 300).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-36, y:16, rotation: -5, alpha:1}, 300).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 60, y:24, rotation: 10, alpha:1}, 300).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-60, y:24, rotation:-10, alpha:1}, 300).setLoop(false);
                color = 200;
                break;
            default:
                //クローズ
                this.bits[0].tweener.clear().to({ x:0, y: 0, alpha:0}, 300);
                this.bits[1].tweener.clear().to({ x:0, y: 0, alpha:0}, 300);
                this.bits[2].tweener.clear().to({ x:0, y: 0, alpha:0}, 300);
                this.bits[3].tweener.clear().to({ x:0, y: 0, alpha:0}, 300);
                color = 60;
                break;
        }

        //武装によってコアの色替え
        this.core.canvas.setFillStyle(
            tm.graphics.RadialGradient(8, 8, 0, 8, 8, 8)
                .addColorStopList([
                    {offset:0.0, color: "hsla({0}, 60%, 70%, 1.0)".format(color)},
                    {offset:0.5, color: "hsla({0}, 60%, 70%, 1.0)".format(color+40)},
                    {offset:1.0, color: "hsla({0}, 60%, 50%, 0.0)".format(color+40)},
                ]).toStyle()
            ).fillRect(0, 0, 16, 16);
    },

    //プレイヤー投入時演出
    startup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .wait(2000)
            .to({x: SC_W/2, y: SC_H-128}, 2000, "easeOutQuint")
            .call(function(){
                this.shotON = true;
                this.control = true;
                this.isCollision = true;
                this.timeMuteki = 180;
            }.bind(this));
        this.shotON = false;
        this.control = false;
        this.isCollision = false;
        this.parentScene.timeVanish = 300;
    },

    //ステージ開始時演出
    stageStartup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .to({x: SC_W/2, y: SC_H/2+32}, 1000, "easeOutCubic")
            .to({x: SC_W/2, y: SC_H-64  }, 1000)
            .call(function(){
                this.shotON = true;
                this.control = true;
                this.isCollision = true;
                this.timeMuteki = 180;
            }.bind(this));
        this.shotON = false;
        this.control = false;
        this.isCollision = false;
    },
});

//ビット
tm.define("pb3.PlayerBit", {
    superClass: "tm.display.Sprite",

    id: 0,
    active: false,

    init: function(id) {
        this.superInit("bit", 32, 32);
        this.setScale(0.8);
        this.parentScene = app.currentScene;
        this.index = 0;
        this.id = id;

        this.alpha = 1;

        this.beforeX = 0;
        this.beforeY = 0;

        this.time = 0;
    },

    update: function() {
        if (this.time % 2 == 0) {
            if (this.id % 2 == 0) {
                this.index--;
                if (this.index < 0) this.index = 8;
            } else {
                this.index = (this.index+1)%9;
            }
            this.setFrameIndex(this.index);
        }
        var player = app.player;
        if (player.shotON) {
            if (this.time % player.shotInterval == 0) {
                var x = this.x + player.x;
                var y = this.y + player.y;
                pb3.ShotBullet(this.rotation, player.shotPower).addChildTo(player.parentScene).setPosition(x, y-4);
            }
        }

        if (player.type == 1) {
            this.rotation = Math.clamp(player.rollcount-50, -25, 25);
            if (-4 < this.rotation && this.rotation < 4) this.rotation = 0;
        }
        this.time++;
    },
});

//プレイヤー操作用ポインタ
tm.define("pb3.PlayerPointer", {
    superClass: "tm.display.Shape",
    layer: LAYER_OBJECT_LOWER,

    init: function() {
        this.superInit({width:32, height:32});
        this.canvas.lineWidth = 3;
        this.canvas.globalCompositeOperation = "lighter";
        this.canvas.strokeStyle = "rgb(255, 255, 255)";
        this.canvas.strokeArc(16, 16, 8, Math.PI*2, 0, true);
    },

    update: function() {
        var p = app.pointing;
        if (app.player.control && p.getPointing()) {
            if (~~(this.x) == ~~(app.player.x) && ~~(this.y) == ~~(app.player.y)) {
                this.alpha = 0;
            } else {
                this.alpha = 0.5;
            }
            this.x += (p.position.x - p.prevPosition.x);
            this.y += (p.position.y - p.prevPosition.y);
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);
        } else {
            this.x = app.player.x;
            this.y = app.player.y;
            this.alpha = 0;
        }
    },
});

})();
