/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.EffectLayer", {
    superClass: "phina.display.CanvasElement",

    init: function(option) {
        option = (option || {}).$safe({size: 64});
        this.superInit();
        this.pool = null;
        this.max = option.size;

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var e = pbr.Effect.EffectBase();
            e.effectLayer = self;
            return e;
        });
    },

    //エフェクト投入
    enter: function(option) {
        var e = this.pool.shift();
        if (!e) {
            console.warn("Effect empty!!");
            return null;
        }
        e.setup(option).addChildTo(this);
        return e;
    },


    //爆発エフェクト投入（標準）
    enterExplode: function(x, y, vx, vy, delay) {
        vx = vx || 0;
        vy = vy || 0;
        delay = delay || 0;

        this.enter({
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            delay: delay,
            position: {x: x, y: y},
            velocity: {x: vx, y: vy, decay: 0.9},
        });

        var val = rand(5, 10);
        for (var i = 0; i < val; i++) {
            var rad = rand(0, 359) * toRad;
            var v = rand(5, 10);
            var vx2 = Math.cos(rad) * v;
            var vy2 = Math.sin(rad) * v;
            var delay2 = delay+rand(0, 10);
            var size = 0;
            if (i > val-2) size = rand(1, 3);
            this.enterDebri(size, x, y, vx2, vy2, delay2);
        }
    },

    //破片
    enterDebri: function(size, x, y, vx, vy, delay) {
        size = size || 0;
        size = Math.clamp(size, 0, 3);
        delay = delay || 0;
        if (size == 0) {
            this.enter({
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                delay: delay,
                trimming: {x: 192, y: 128, width: 64, height: 48},
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 0.9},
            });
        } else {
            size--;
            this.enter({
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: size*8,
                maxIndex: (size+1)*8-1,
                delay: delay,
                trimming: {x: 384, y: 128, width: 128, height: 48},
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 0.9},
            });
        }
    },

    //小破片
    enterDebriSmall: function(x, y, num, delay) {
        num = num || 5;
        delay = delay || 0;
        for (var i = 0; i < num; i++) {
            var rad = Math.randint(0, 359) * toRad;
            var v = Math.randint(5, 10);
            var vx = Math.cos(rad) * v;
            var vy = Math.sin(rad) * v;
            var delay = delay+rand(0, 10);
            this.enter({
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                delay: delay,
                trimming: {x: 192, y: 128, width: 64, height: 48},
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 0.9},
            });
        }
    },

    //ショット着弾
    enterShotImpact: function(x, y, vx, vy) {
        vx = vx || 0;
        vy = vy || 0;
        this.enter({
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 240, width: 128, height: 16},
            position: {x: x, y: y},
            velocity: {x: vx, y: vy, decay: 0.9},
        });
    },

    //敵弾消失
    enterBulletVanish: function(x, y, vx, vy) {
        vx = vx || 0;
        vy = vy || 0;
        this.enter({
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 336, width: 128, height: 48},
            position: {x: x, y: y},
            velocity: {x: vx, y: vy, decay: 0.95},
        });
    },
});
