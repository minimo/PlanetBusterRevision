/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Player", {
    superClass: "phina.display.DisplayElement",
    _member: {
        layer: LAYER_PLAYER,

        //当り判定サイズ
        width: 2,
        height: 2,

        isControl: true,    //操作可能フラグ
        isShotOK: true,     //ショット可能フラグ
        isDead: false,      //死亡フラグ
        shotON: true,       //ショットフラグ
        mouseON: false,     //マウス操作中フラグ

        isCollision: false,     //当り判定有効フラグ
        isAfterburner: false,   //アフターバーナー中
        isAfterburnerBefore: false,

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

        this.tweener.setUpdateType('fps');

        this.sprite = phina.display.Sprite("gunship", 48, 48)
            .addChildTo(this)
            .setFrameIndex(4)
            .setScale(0.66);

        //ビット
        this.bits = [];
        for (var i = 0; i < 4; i++) {
            this.bits[i] = pbr.PlayerBit(i).addChildTo(this);
            this.bits[i].tweener.setUpdateType('fps');
        }
        this.openBit(0);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function(app) {
        if (this.isControl) {
            //マウス操作
            var p = app.mouse;
            if (p.getPointing()) {
/*
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;
*/
                var pt = p.deltaPosition;
                this.x += ~~(pt.x*1.8);
                this.y += ~~(pt.y*1.8);

                this.mouseON = true;
                this.shotON = true;
            } else {
                this.mouseON = false;
                this.shotON = false;
            }

            //コントローラー操作
            var ct = app.controller;
            if (ct.angle !== null) {
                var m = KEYBOARD_MOVE[ct.angle];
                this.x += m.x*this.speed;
                this.y += m.y*this.speed;
            }
            if (ct.analog1.x > 0.3 || -0.3 > ct.analog1.x) this.x += ct.analog1.x * this.speed;
            if (ct.analog1.y > 0.3 || -0.3 > ct.analog1.y) this.y += ct.analog1.y * this.speed;
            if (!this.mouseON) this.shotON = app.controller.shot;

            //コントロール不可状態
            if (!this.isControl || !this.isShotOK || this.isDead) {
                this.shotON = false;
            }

            //コントロール可能状態
            if (this.isControl && this.isShotOK && !this.isDead) {
                //ボム投下
                if (ct.bomb) {
                    this.parentScene.enterBomb();
                }

                //ショットタイプ変更（テスト用）
                if (ct.special1 && this.time > this.changeInterval) {
                    this.type = (this.type+1)%3;
                    this.openBit(this.type);
                    this.changeInterval = this.time+30;
                }
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

        //アフターバーナー描写
        if (this.isAfterburner) {
            var ground = this.parentScene.ground;
            var layer = this.parentScene.effectLayerUpper;
            //着火
            if (!this.isAfterburnerBefore) {
                for (var i = 0; i < 50; i++) {
                    var vx = Math.randint(-5, 5);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
            if (!this.isDead) {
                var e = layer.enterAfterburner({
                    position: {x: this.x, y: this.y+16},
                    velocity: {x: 0, y: ground.deltaY, decay: 0.99},
                    alpha: 0.7,
                    blendMode: "lighter",
                });
            }
        } else {
            //消火
            if (this.isAfterburnerBefore) {
                var ground = this.parentScene.ground;
                var layer = this.parentScene.effectLayerUpper;
                for (var i = 0; i < 10; i++) {
                    var vx = Math.randint(-2, 2);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
        }

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
        this.isAfterburnerBefore = this.isAfterburner;
    },

    //被弾処理
    damage: function() {
        //無敵時間中はスルー
        if (this.timeMuteki > 0 || this.parentScene.bombTime > 0 || this.parentScene.timeVanish > 0) return false;

        //オートボム発動
        if (app.setting.autoBomb && app.setting.bombStock > 0) {
            this.parentScene.enterBomb();
            return true;
        }

        //被弾エフェクト表示
        var layer = this.parentScene.effectLayerUpper;
        layer.enterExplodePlayer({position: {x: this.x, y: this.y}});

        app.playSE("playermiss");
        this.parentScene.missCount++;
        this.parentScene.stageMissCount++;

        this.isDead = true;
        app.setting.zanki--;
        if (app.setting.zanki > 0) {
            this.startup();
        } else {
            this.shotON = false;
            this.visible = false;
            this.isCollision = false;
            this.isControl = false;
            this.parentScene.isGameOver = true;
        }

        return true;
    },

    //ショット発射
    enterShot: function() {
        //自機から
        var ly = this.parentScene.shotLayer;
        ly.enterShot(this.x+10, this.y-8, {type: 0, rotation: 1, power: this.shotPower});
        ly.enterShot(this.x   , this.y-16,{type: 0, rotation: 0, power: this.shotPower});
        ly.enterShot(this.x-10, this.y-8, {type: 0, rotation:-1, power: this.shotPower});
        return this;
    },

    //ビット展開
    openBit: function(type) {
        var color = 0;
        switch (type) {
            case 0:
                //赤（前方集中型）
                this.bits[0].tweener.clear().to({ x:  5, y:-32, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-30,0,30,"easeInOutSine").moveBy( 30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[0]));
                this.bits[1].tweener.clear().to({ x: -5, y:-32, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 30,0,30,"easeInOutSine").moveBy(-30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[1]));
                this.bits[2].tweener.clear().to({ x: 15, y:-24, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-40,0,30,"easeInOutSine").moveBy( 40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[2]));
                this.bits[3].tweener.clear().to({ x:-15, y:-24, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 40,0,30,"easeInOutSine").moveBy(-40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[3]));
                color = 0;
                break;
            case 1:
                //緑（方向変更型）
                this.bits[0].tweener.clear().to({ x: 35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                color = 80;
                break;
            case 2:
                //青（広範囲型）
                this.bits[0].tweener.clear().to({ x: 30, y:16, rotation:  5, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-30, y:16, rotation: -5, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 50, y:24, rotation: 10, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-50, y:24, rotation:-10, alpha:1}, 15).setLoop(false);
                color = 200;
                break;
            default:
                //クローズ
                this.bits[0].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[1].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[2].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[3].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                color = 60;
                break;
        }
        return this;
    },

    //プレイヤー投入時演出
    startup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .wait(120)
            .call(function(){
                this.parentScene.timeVanish = 180;
                app.setting.bombStock = app.setting.bombStockMax;
            }.bind(this))
            .to({x: SC_W*0.5, y: SC_H*0.8}, 120, "easeOutQuint")
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //ステージ開始時演出
    stageStartup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .to({x: SC_W/2, y: SC_H/2+32}, 90, "easeOutCubic")
            .to({x: SC_W/2, y: SC_H-64  }, 120)
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //機影追加
    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("gunshipBlack", 48, 48);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(4).setScale(0.66);
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            if (!ground.isShadow) {
                this.visible = false;
                return;
            } else {
                this.visible = true;
            }

            this.rotation = that.rotation;
            this.x = that.x + ground.shadowX;
            this.y = that.y + ground.shadowY;
            this.scaleX = ground.scaleX*0.66;
            this.scaleY = ground.scaleY*0.66;
            this.frameIndex = that.sprite.frameIndex;
            this.visible = that.visible;
        }

        //ビットの影
        for (var i = 0; i < 4; i++) {
            var b = this.bits[i];
            b.parentScene = this.parentScene;
            b.addShadow();
        }
        return this;
    },

    //アイテム取得
    getItem: function(kind) {
        switch(kind) {
            case ITEM_POWER:
                app.playSE("powerup");
                break;
            case ITEM_BOMB:
                app.playSE("powerup");
                app.setting.bombStock++;
                if (app.setting.bombStock > app.setting.bombStockMax) app.setting.bombStockMax = app.setting.bombStock;
                break;
            case ITEM_1UP:
                app.playSE("powerup");
                app.setting.zanki++;
                if (app.setting.zanki > 9) app.setting.zanki = 9;
                break;
        }
    },
});
