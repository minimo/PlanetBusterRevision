/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Player", {
    superClass: "phina.display.CanvasElement",
    _member: {
        layer: LAYER_PLAYER,

        //当り判定サイズ
        width: 2,
        height: 2,

        control: true,  //操作可能フラグ
        shotON: true,  //ショットフラグ
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
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        this.sprite = phina.display.Sprite("gunship", 48, 48)
            .addChildTo(this)
            .setFrameIndex(4);

        //ビット
        this.bits = [];
        this.bits[0] = pbr.PlayerBit(0).addChildTo(this);
        this.bits[1] = pbr.PlayerBit(1).addChildTo(this);
        this.bits[2] = pbr.PlayerBit(2).addChildTo(this);
        this.bits[3] = pbr.PlayerBit(3).addChildTo(this);

        this.openBit(0);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;
        this.checkHierarchy = true;

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function(app) {
        if (this.control) {
            //マウス操作
            var p = app.mouse;
            if (p.getPointing()) {
/*
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;
*/
                var pt = p.deltaPosition;
                this.x += pt.x;
                this.y += pt.y;

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

            //ショット投入
            if (this.shotON && app.ticker.frame % this.shotInterval == 0) this.enterShot();
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
        this.sprite.setFrameIndex(this.indecies[Math.clamp(~~(this.rollcount/10),0, 9)]);

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
    },

    //被弾処理
    damage: function() {
    },

    //ショット発射
    enterShot: function() {
        var shotPower = this.shotPower;
        //自機から
        pbr.Shot( 1, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x+10, this.y-8);
        pbr.Shot( 0, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x   , this.y-16);
        pbr.Shot(-1, shotPower, 0).addChildTo(this.parentScene).setPosition(this.x-10, this.y-8);
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
