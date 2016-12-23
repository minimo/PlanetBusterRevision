/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Bullet", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BULLET,

    //射出した敵のID
    id: -1,

    //BulletML Runnner
    runner: null,

    //移動係数
    vx: 0,
    vy: 1,

    //加速度
    accel: 1.0,

    //回転
    rollAngle: 5,
    rolling: true,

    //経過時間
    time: 0,

    DEFAULT_PARAM: {
        id: -1,
        type: "RS",
        x: SC_W*0.5,
        y: SC_H*0.5,
        vx: 0,
        vy: 1,
    },

    _static: {
        globalSpeedRate: 1.0,
    },

    init: function() {
        this.superInit();

        this.boundingType = "circle";
        this.radius = 2;

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        //弾画像
        this.sprite = phina.display.Sprite("bullet", 24, 24).addChildTo(this);

        this.on("enterframe", function(app){
            if (this.rolling) this.rotation += this.rollAngle;
            var runner = this.runner;
            if (runner) {
                var bx = this.x;
                var by = this.y;
                runner.x = bx;
                runner.y = by;
                runner.update();
                var acc = pbr.Bullet.globalSpeedRate * this.wait;
                this.vx = (runner.x - bx);
                this.vy = (runner.y - by);
                this.x += this.vx * acc;
                this.y += this.vy * acc;

                //画面範囲外
                if (this.x<-16 || this.x>SC_W+16 || this.y<-16 || this.y>SC_H+16) {
                    this.remove();
                    return;
                }

                //自機との当り判定チェック
                if (!this.dummy) {
                    var player = this.bulletLayer.parentScene.player;
                    if (player.isCollision) {
                        if (this.isHitElement(player) ) {
                            if (player.damage()) this.remove();
                            return;
                        }
                    }
                }
                this.time++;
            }
        }.bind(this));

        //リムーブ時
        this.on("removed", function(){
            this.bulletLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(runner, spec) {
        this.id = 0;
        this.x = runner.x;
        this.y = runner.y;
        this.runner = runner;

        this.sprite.setOrigin(0.5, 0.5);

        if (spec.dummy) {
            this.dummy = true;
            this.sprite.visible = false;
        } else {
            //弾種別グラフィック
            var size = spec.size || 1.0, index = 0;
            switch (spec.type) {
                case "normal":
                    this.rolling = true;
                    index = 0;
                    if (spec.color == "blue") index = 1;
                    break;
                case "roll":
                    this.rolling = true;
                    index = 8;
                    if (spec.color == "blue") index = 24;
                    break;
                case "THIN":
                    this.rolling = false;
                    index = 3;
                    this.rotation = this.runner.direction*toDeg-90;
                    this.sprite.setOrigin(0.5, 0.0);
                    break;
            }
            this.sprite.setFrameIndex(index).setScale(size);
            this.dummy = false;
            this.sprite.visible = true;

            //弾に発射時ウェイトが掛るフレーム数
            var pauseFrame = 45;
            this.wait = 0.3;
            this.setScale(0.1);
            this.tweener.clear().to({scaleX: 1.0, scaleY:1.0, wait: 1.0}, pauseFrame, "easeInOutSine");

            this.time = 0;
        }
        return this;
    },

    erase: function() {
        if (!this.dummy) {
            var layer = this.bulletLayer.parentScene.effectLayerUpper;
            layer.enterBulletVanish({
                position: {x: this.x, y: this.y},
                velocity: {x: this.vx, y: this.vy, decay: 0.99},
            });
        }
    },
});

