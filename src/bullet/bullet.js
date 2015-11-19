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
        param: null,
        id: -1,

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

    init: function() {
        this.superInit();
        this.$extend(this._member);

        this.boundingType = "circle";
        this.radius = 2;

        this.on("enterframe", function(){
            if (this.rolling) this.rotation += this.rollAngle;

            this.x += this.vx;
            this.y += this.vy;

            //自機との当り判定チェック
            var player = this.bulletLayer.parentScene.player;
            if (player.isCollision) {
                if (this.isHitElement(player) ) {
                    player.damage();
                    this.remove();
                    return;
                }
            }

            //画面範囲外
            if (this.x<-32 || this.x>SC_W+32 || this.y<-32 || this.y>SC_H+32) {
                this.remove();
                return;
            }
        }.bind(this));

        //リムーブ時
        this.on("removed", function(){
            this.bulletLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(param) {
        param.$safe(this.DEFAULT_PARAM);

        this.id = param.id;
        this.x = param.x;
        this.y = param.y;
        this.vx = param.vx;
        this.vy = param.vy;

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;

        //弾種別グラフィック
        var type = 1, size = 1, index = 0;
        switch (param.type) {
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
        if (this.sprite) this.sprite.remove();
        this.sprite = phina.display.Sprite("bullet"+type, 24, 24)
            .addChildTo(this)
            .setFrameIndex(index)
            .setScale(size);
        return this;
    },

    erace: function() {
        pbr.Effect.BulletVanish(this).addChildTo(this.parentScene);
    },
});

