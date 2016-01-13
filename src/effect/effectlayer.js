/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.EffectLayer", {
    superClass: "phina.display.CanvasElement",

    //エフェクト投入時デフォルトオプション
    defaultOption: {
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        delay: 0
    },

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

    //爆発（標準）
    enterExplode: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "explode",
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            delay: option.delay,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
        });
    },

    //爆発（小）
    enterExplodeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "explodeSmall",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 8,
            maxIndex: 15,
            delay: option.delay,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 256, y: 256, width: 128, height: 32},
        });
    },

    //爆発（極小）
    enterExplodeSmall2: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "explodeSmall2",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            delay: option.delay,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 256, y: 256, width: 128, height: 32},
        });
    },

    //爆発（大）
    enterExplodeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "explodeLarge",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            delay: option.delay,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 0, y: 192, width: 192, height: 96},
        });
    },

    //爆発（地上）
    enterExplodeGround: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "explodeGround",
            assetName: "effect",
            width: 32,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            delay: option.delay,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 256, y: 192, width: 256, height: 48},
        });
/*
        isGround = true;
        this.groundX = this.parentScene.ground.x;
        this.groundY = this.parentScene.ground.y;
*/
    },

    //破片
    enterDebri: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        size = option.size || 0;
        size = Math.clamp(size, 0, 3);
        if (size == 0) {
            this.enter({
                name: "debri",
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                delay: option.delay,
                position: {x: option.position.x, y: option.position.y},
                velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
                trimming: {x: 192, y: 128, width: 64, height: 48},
            });
        } else {
            size--;
            this.enter({
                name: "debri",
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: size*8,
                maxIndex: (size+1)*8-1,
                delay: option.delay,
                position: {x: option.position.x, y: option.position.y},
                velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
                trimming: {x: 384, y: 128, width: 128, height: 48},
            });
        }
    },

    //小破片
    enterDebriSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        num = option.num || 5;
        for (var i = 0; i < num; i++) {
            var rad = rand(0, 359) * toRad;
            var v = rand(5, 10);
            var vx = Math.cos(rad) * v;
            var vy = Math.sin(rad) * v;
            var delay = delay+rand(0, 10);
            this.enter({
                name: "debri",
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                delay: option.delay,
                position: {x: option.position.x, y: option.position.y},
                velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
                trimming: {x: 192, y: 128, width: 64, height: 48},
            });
        }
    },

    //ショット着弾
    enterShotImpact: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "shotImpact",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            delay: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 256, y: 240, width: 128, height: 16},
        });
    },

    //敵弾消失
    enterBulletVanish: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        this.enter({
            name: "bulletVanish",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            delay: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 0, y: 336, width: 128, height: 48},
        });
    },

    //プレイヤー被弾
    enterExplodePlayer: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter({
            name: "explodePlayer",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            delay: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: option.velocity.x, y: option.velocity.y, decay: option.velocity.decay},
            trimming: {x: 0, y: 288, width: 384, height: 48},
        });
    },
});
