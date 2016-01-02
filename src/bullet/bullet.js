/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Bullet", {
    superClass: "phina.display.CanvasElement",
    layer: LAYER_BULLET,

    _member: {
        id: -1,

        runner: null,

        vx: 0,
        vy: 1,

        rollAngle: 5,
        rolling: true,
    },

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
        this.$extend(this._member);

        this.boundingType = "circle";
        this.radius = 2;

        this.on("enterframe", function(app){
            if (this.rolling) this.rotation += this.rollAngle;
            var runner = this.runner;
            if (runner) {
                var bx = this.x;
                var by = this.y;
                runner.x = bx;
                runner.y = by;
                runner.update();
                var dx = runner.x - bx;
                var dy = runner.y - by;
                this.x += dx * pbr.Bullet.globalSpeedRate;
                this.y += dy * pbr.Bullet.globalSpeedRate;

                //画面範囲外
                if (this.x<-32 || this.x>SC_W+32 || this.y<-32 || this.y>SC_H+32) {
                    this.remove();
                    return;
                }

                //自機との当り判定チェック
                if (!this.dummy) {
                    var player = this.bulletLayer.parentScene.player;
                    if (player.isCollision) {
                        if (this.isHitElement(player) ) {
                            player.damage();
                            this.remove();
                            return;
                        }
                    }
                }
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

        if (this.sprite) this.sprite.remove();

        if (spec.dummy) {
            this.dummy = true;
        } else {
            //弾種別グラフィック
            var type = 1, size = 1, index = 0;
            switch (spec.type) {
                case "RS":  type = 1; size = 0.6; index = 0; break;
                case "BS":  type = 1; size = 0.6; index = 1; break;
                case "RM":  type = 1; size = 0.8; index = 0; break;
                case "BM":  type = 1; size = 0.8; index = 1; break;
                case "RL":  type = 1; size = 1.0; index = 0; break;
                case "BL":  type = 1; size = 1.0; index = 1; break;
                case "RES": type = 2; size = 0.6; index = 0; break;
                case "BES": type = 2; size = 0.6; index =16; break;
                case "REM": type = 2; size = 1.0; index = 0; break;
                case "BEM": type = 2; size = 1.0; index =16; break;
                case "THIN":
                    type = 2; size = 1.0; index =24; 
                    this.rolling = false;
                    this.rotation = this.angle*toDeg-90;
                    break;
            }
            this.sprite = phina.display.Sprite("bullet"+type, 24, 24)
                .addChildTo(this)
                .setFrameIndex(index)
                .setScale(size);
            this.dummy = false;
        }
        return this;
    },

    erase: function() {
        pbr.Effect.BulletVanish(this)
            .addChildTo(this.bulletLayer)
            .setPosition(this.x, this.y)
            .setVelocity(this.vx, this.vy);
    },
});

