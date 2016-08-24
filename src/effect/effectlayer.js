/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.EffectPool", {
    init: function(size, parentScene) {
        this.pool = null;
        this.max = size || 256;

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var e = pbr.Effect.EffectBase();
            e.effectLayer = self;
            e.parentScene = parentScene;
            return e;
        });
    },

    //取得
    shift: function() {
        var e = this.pool.shift();
        return e;
    },

    //戻し
    push: function(e) {
        this.pool.push(e);
        return this;
    },
});

phina.define("pbr.EffectLayer", {
    superClass: "phina.display.DisplayElement",

    //エフェクト投入時デフォルトオプション
    defaultOption: {
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        delay: 0
    },

    init: function(pool) {
        this.superInit();
        this.pool = pool;
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
        var e = this.enter(option.$extend({
            name: "explode",
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            rotation: option.rotation
        }));
        return e;
    },

    //爆発（小）
    enterExplodeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 8,
            maxIndex: 15,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（極小）
    enterExplodeSmall2: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall2",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（大）
    enterExplodeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeLarge",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 192, width: 192, height: 96},
        }));
        return e;
    },

    //爆発（地上）
    enterExplodeGround: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeGround",
            assetName: "effect",
            width: 32,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 192, width: 256, height: 48},
        }));
        e.isGround = true;
        e.groundX = this.parentScene.ground.x;
        e.groundY = this.parentScene.ground.y;
        return e;
    },

    //破片
    enterDebri: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        size = option.size || 0;
        size = Math.clamp(size, 0, 3);
        if (size == 0) {
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                trimming: {x: 192, y: 128, width: 64, height: 48},
            }));
            return e;
        } else {
            size--;
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: size*8,
                maxIndex: (size+1)*8-1,
                trimming: {x: 384, y: 128, width: 128, height: 48},
            }));
            return e;
        }
    },

    //小破片
    enterDebriSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "debri",
            assetName: "effect",
            width: 8,
            height: 8,
            interval: 2,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 192, y: 128, width: 64, height: 48},
        }));
        return e;
    },

    //ショット着弾
    enterShotImpact: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "shotImpact",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 240, width: 128, height: 16},
        }));
        return e;
    },

    //敵弾消失
    enterBulletVanish: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bulletVanish",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 336, width: 128, height: 48},
        }));
        return e;
    },

    //プレイヤー被弾
    enterExplodePlayer: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodePlayer",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 288, width: 384, height: 48},
        }));
        return e;
    },

    //アフターバーナー
    enterAfterburner: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "afterburner",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            sequence: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 
        }));
        if (e) e.tweener.clear().to({alpha:0}, 60, "easeInOutSine");
        return e;
    },

    //スパーク
    enterSpark: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "spark",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 4,
            startIndex: 0,
            maxIndex: 2,
            trimming: {x: 0, y: 384, width: 64, height: 32},
        }));
        return e;
    },

    //ボム
    enterBomb: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bomb",
            assetName: "bomb",
            width: 96,
            height: 96,
            interval: 3,
            startIndex: 0,
            maxIndex: 16,
        }));
        return e;
    },

    //スモーク(小）
    enterSmokeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 5,
            startIndex: 0,
            maxIndex: 4,
            trimming: {x: 128, y: 128, width: 64, height: 16},
        }));
        return e;
    },

    //スモーク(中）
    enterSmoke: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 24,
            height: 24,
            interval: 5,
            startIndex: 0,
            maxIndex: 5,
            trimming: {x: 128, y: 160, width: 120, height: 24},
        }));
        return e;
    },

    //スモーク(大）
    enterSmokeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 5,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 256, y: 128, width: 128, height: 64},
        }));
        return e;
    },

    //パーティクル
    enterParticle: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var trim = {x: 0, y: 0, width: 256, height: 16};
        switch (option.color) {
            case 'red':
                trim = {x: 0, y: 16, width: 256, height: 16};
                break;
            case 'green':
                trim = {x: 0, y: 32, width: 256, height: 16};
                break;
             default:
                trim = {x: 0, y: 0, width: 256, height: 16};
        }
        var e = this.enter(option.$extend({
            name: "particle",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 16,
            trimming: trim,
        }));
        return e;
    },
});
