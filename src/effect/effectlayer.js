/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.EffectLayer", {
    superClass: "phina.display.CanvasElement",

    init: function(max) {
        this.superInit();
        this.pool = null;
        this.max = max || 256;

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
            var pattern = 0;
            if (i > val-2) pattern = rand(1, 3);
        }
    },

    //破片
    enterDebri: function(num, x, y, vx, vy, delay) {
        num = num || 0;
        delay = delay || 0;
        num = Math.clamp(num, 0, 3);
        if (num == 0) {
            this.enter({
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                delay: delay,
                trimming: {x: 192, y: 128, wisth: 64, height: 48},
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: decay},
            });
        } else {
            num--;
            this.enter({
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: num*8,
                maxIndex: (num+1)*8-1,
                delay: delay,
                trimming: {x: 384, y: 128, wisth: 128, height: 48},
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: decay},
            });
        }
    },

    enterShotImpact: function(x, y, vx, vy) {
        this.enter({
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 240, wisth: 128, height: 16},
            position: {x: x, y: y},
            velocity: {x: vx, y: vy, decay: decay},
        });
    },
});
