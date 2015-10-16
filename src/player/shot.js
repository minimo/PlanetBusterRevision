/*
 *  shot.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT, LAYER_OBJECT_LOWER];

phina.define("pbr.Shot", {
    superClass: "phina.display.Sprite",

    _member: {
        layer: LAYER_SHOT,
        parentScene: null,
        player: null,

        speed: 15,
        power: 1,
        defaultSpeed: 15,
        defaultPower: 1,
    },

    init: function(rotation, power, type) {
        if (type == 0) {
            this.superInit("shot1", 16, 16);
            this.setScale(2);
        } else {
            this.superInit("shot2", 16, 32);
            this.scaleX = 1.5;
        }
        this.$extend(this._member);

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
            this.removeChildren();
            this.remove();
            return;
        }

        //敵との当り判定チェック
        for (var i = 0; i < 3; i++) {
            var layer = this.parentScene.layers[pbr.checkLayers[i]];
            layer.children.each(function(a) {
                if (a === app.player) return;
                if (this.parent && a.isCollision && a.isHitElement(this)) {
                    a.damage(this.power);
                    this.vanish();
                    this.removeChildren();
                    this.remove();
                    return;
                }
            }.bind(this));
        }
    },

    vanish: function() {
//        pbr.Effect.ShotImpact().addChildTo(this.parentScene).setPosition(this.x, this.y);
        pbr.Effect.enterDebrisSmall(this.parentScene, this.x, this.y, 1);
    },
});
