/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */
pbr.checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT, LAYER_OBJECT_LOWER];

phina.define("pbr.Bullet", {
    superClass: "phina.display.Sprite",
    layer: LAYER_BULLET,

    _member: {
        param: null,
        id: -1,

        isVanish: false,
        isVanishEffect: true,

        rollAngle: 5,
        rolling: true,

        player: null,
    },

    init: function(runner, param, id) {
        this.superInit(runner);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;

        this.param = param;
        this.id = id || -1;

        //弾種別グラフィック
//        this.removeChildren();
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
            case "THIN":type = 2; size = 1.0; index =24; this.rolling = false; this.rotation = this.runner.direction*toDeg-90; break;
        }
        phina.display.Sprite("bullet"+type, 24, 24).addChildTo(this).setFrameIndex(index).setScale(size);

        this.on("enterframe", function(){
            if (this.rolling) this.rotation += this.rollAngle;

            //自機との当り判定チェック
            if (app.player.isCollision) {
                if (this.isHitElement(app.player) ) {
                    app.player.damage();
                    this.isVanish = true;
                }
            }

            //画面範囲外
            if (this.x<-32 || this.x>SC_W+32 || this.y<-32 || this.y>SC_H+32) {
                this.isVanish = true;
                this.isVanishEffect = false;
            }

            if (this.isVanish) this.remove();
        }.bind(this) );

        //リムーブ時
        this.on("removed", function(){
            if (this.isVanishEffect) pb3.Effect.BulletVanish(this).addChildTo(app.currentScene);
            this.removeChildren();
        }.bind(this));

        this.beforeX = this.x;
        this.beforeY = this.y;
    },
});

phina.define("pb3.ShotBullet", {
    superClass: "phina.display.Sprite",
    layer: LAYER_SHOT,
    parentScene: null,
    player: null,

    speed: 15,
    power: 1,
    defaultSpeed: 15,
    defaultPower: 1,

    init: function(rotation, power, type) {
        if (type == 0) {
            this.superInit("shot1", 16, 16);
            this.setScale(2);
        } else {
            this.superInit("shot2", 16, 32);
            this.scaleX = 1.5;
        }

        this.rotation = rotation || 0;
        this.speed = this.defaultSpeed;
        this.power = power || this.defaultPower;

        this.alpha = 0.8;
        this.blendMode = "lighter";

        rotation-=90;
        this.vx = Math.cos(rotation*toRad) * this.speed;
        this.vy = Math.sin(rotation*toRad) * this.speed;

        //当り判定設定
        this.boundingType = "circle";
        if (type == 0) {
            this.radius = 6;
        } else {
            this.radius = 12;
        }

        this.beforeX = this.x;
        this.beforeY = this.y;
    },
    update: function() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x<-20 || this.x>SC_W+20 || this.y<-20 || this.y>SC_H+20) {
            this.remove();
        }

        //敵との当り判定チェック
        for (var i = 0; i < 3; i++) {
            var layer = this.parentScene.layers[pb3.checkLayers[i]];
            layer.children.each(function(a) {
                if (a === app.player) return;
                if (this.parent && a.isCollision && a.isHitElement(this)) {
                    a.damage(this.power);
                    this.vanish();
                    this.remove();
                    return;
                }
            }.bind(this));
        }
    },

    vanish: function() {
        pb3.Effect.ShotImpact().addChildTo(this.parentScene).setPosition(this.x, this.y);
        pb3.Effect.enterDebrisSmall(this.parentScene, this.x, this.y, 1);
        this.removeChildren();
    },
});

