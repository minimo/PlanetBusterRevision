/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Bullet", {
    superClass: "phina.display.DisplayElement",
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
                this.vx = (runner.x - bx) * pbr.Bullet.globalSpeedRate;
                this.vy = (runner.y - by) * pbr.Bullet.globalSpeedRate;
                this.x += this.vx;
                this.y += this.vy;

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
                            if (player.damage()) this.remove();
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

        this.rolling = true;

        if (spec.dummy) {
            this.dummy = true;
            this.sprite.visible = false;
        } else {
            //弾種別グラフィック
            var size = 1, index = 0;
            switch (spec.type) {
                case "RS":  size = 0.6; index = 0; break;
                case "BS":  size = 0.6; index = 1; break;
                case "RM":  size = 0.8; index = 0; break;
                case "BM":  size = 0.8; index = 1; break;
                case "RL":  size = 1.0; index = 0; break;
                case "BL":  size = 1.0; index = 1; break;
                case "RES": size = 0.6; index = 8; break;
                case "BES": size = 0.6; index =24; break;
                case "REM": size = 1.0; index = 8; break;
                case "BEM": size = 1.0; index =24; break;
                case "THIN":
                    size = 1.0; index = 3; 
                    this.rolling = false;
                    this.rotation = this.runner.direction*toDeg-90;
                    break;
            }
            this.sprite.setFrameIndex(index).setScale(size);
            this.dummy = false;
            this.sprite.visible = true;
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

