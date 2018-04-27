/*
 *  shot.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT_MIDDLE, LAYER_OBJECT_LOWER];

phina.define("pbr.Shot", {
    superClass: "phina.display.DisplayElement",

    DEFAULT_PARAM: {
        type: 0,
        rotation: 0,
        power: 10,
        velocity: 15,
    },

    time: 0,

    init: function() {
        this.superInit();
        this.boundingType = "circle";
        this.radius = 6

        this.sprite = phina.display.Sprite("shot", 16, 32).addChildTo(this);
        this.sprite.frameIndex = 0;
        this.sprite.alpha = 0.8;
        this.sprite.blendMode = "lighter";

        this.on("enterframe", function(){
            this.x += this.vx;
            this.y += this.vy;

            if (this.x<-16 || this.x>SC_W+16 || this.y<-16 || this.y>SC_H+16) {
                this.remove();
                return;
            }

            //敵との当り判定チェック
            if (this.time % 2) {
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
            }
            this.time++;
        });

        //リムーブ時
        this.on("removed", function(){
            this.shotLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(param) {
        param.$safe(this.DEFAULT_PARAM);
        if (param.type == 0) {
            this.sprite.frameIndex = 0;
            this.sprite.setScale(2);
        } else {
            this.sprite.frameIndex = 1;
            this.sprite.setScale(1.5, 1.0);
        }

        this.rotation = param.rotation;
        this.velocity = param.velocity;
        this.power = param.power;

        var rot = param.rotation-90;
        this.vx = Math.cos(rot*toRad)*this.velocity;
        this.vy = Math.sin(rot*toRad)*this.velocity;

        //当り判定設定
        if (param.type == 0) {
            this.radius = 8;
        } else {
            this.radius = 16;
        }

        this.beforeX = this.x;
        this.beforeY = this.y;

        return this;
    },

    vanish: function() {
        var ground = this.shotLayer.parentScene.ground;
        var layer = this.shotLayer.parentScene.effectLayerUpper;
        layer.enterShotImpact({
            position:{x: this.x, y: this.y},
        });
        pbr.Effect.enterDebris(layer, {
            num: 2,
            position:{x: this.x, y: this.y},
            velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
        });
    },
});

});
