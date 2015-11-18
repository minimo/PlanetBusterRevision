/*
 *  shot.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT, LAYER_OBJECT_LOWER];

phina.define("pbr.Shot", {
    superClass: "phina.display.Sprite",

    DEFAULT_PARAM: {
        type: 0,
        rotation: 0,
        power: 10,
        velocity: 15,
    },

    init: function() {
        this.superInit("shot", 16, 32);
        this.setFrameIndex(0);

        this.on("enterframe", function(){
            this.x += this.vx;
            this.y += this.vy;

            if (this.x<-20 || this.x>SC_W+20 || this.y<-20 || this.y>SC_H+20) {
                this.remove();
                return;
            }

            //敵との当り判定チェック
            var parentScene = this.shotLayer.parentScene;
            for (var i = 0; i < 3; i++) {
                var layer = parentScene.layers[checkLayers[i]];
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
        });

        //リムーブ時
        this.on("removed", function(){
            this.shotLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(param) {
        param = param.$safe(this.DEFAULT_PARAM);
        if (param.type == 0) {
            this.frameIndex = 0;
//            this.setScale(2);
        } else {
            this.frameIndex = 1;
//            this.setScale(1.5, 1.0);
        }

        this.rotation = param.rotation;
        this.velocity = param.velocity;
        this.power = param.power;

        this.alpha = 0.8;
        this.blendMode = "lighter";

        var rot = param.rotation-90;
        this.vx = Math.cos(rot*toRad)*this.velocity;
        this.vy = Math.sin(rot*toRad)*this.velocity;

        //当り判定設定
        this.boundingType = "circle";
        if (param.type == 0) {
            this.radius = 6;
        } else {
            this.radius = 12;
        }

        this.beforeX = this.x;
        this.beforeY = this.y;
        return this;
    },

    vanish: function() {
        var parentScene = this.shotLayer.parentScene;
        pbr.Effect.ShotImpact().addChildTo(parentScene).setPosition(this.x, this.y);
        pbr.Effect.enterDebrisSmall(parentScene, this.x, this.y, 1);
    },
});

});
