/*
 *  Effect.js
 *  2014/07/10
 *  @auther minimo  
 *  This Program is MIT license.
 */
pbr.Effect = [];

//汎用エフェクト
phina.define("pbr.Effect.EffectBase", {
    superClass: "phina.display.Sprite",
    layer: LAYER_EFFECT_UPPER,

    _member: {
        //インデックス更新間隔
        interval: 2,

        //開始インデックス
        startIndex: 0,

        //最大インデックス
        maxIndex: 8,

        //現在インデックス
        index: 0,

        //遅延表示フレーム数
        delay: 0,

        //ループフラグ
        loop: false,

        //シーンから削除フラグ
        isRemove: false,

        //加速度
        velocityX: 0,   //Ｘ座標方向
        velocityY: 0,   //Ｙ座標方向
        velocityD: 0,   //減衰率

        //相対地上座標
        groundX: 0,
        groundY: 0,

        //地上エフェクトフラグ
        ifGround: false,

        time: 0,
    },

    init: function(tex, width, height, interval, startIndex, maxIndex, delay) {
        this.superInit(tex, width, height);
        this.$safe(this._member);

        //初期値セット
        this.interval = interval || 4;
        this.startIndex = startIndex || 0;
        this.maxIndex = maxIndex || 8;
        this.delay = delay || 0;
        if (this.delay < 0) this.delay *= -1;
        this.time = -this.delay;

        this.index = this.startIndex;
        this.setFrameIndex(this.index);

        this.parentScene = app.currentScene;

        this.on("enterframe", this.defaultEnterFrame);
    },

    defaultEnterFrame: function() {
        if (this.time < 0) {
            this.visible = false;
            this.time++;
            return;
        }
        if (this.time == 0) this.visible = true;

        //地上物現座標調整
        if (this.isGround) {
            var x = this.groundX-this.parentScene.ground.x;
            var y = this.groundY-this.parentScene.ground.y;
            this.x-=x;
            this.y-=y;
            this.groundX = this.parentScene.ground.x;
            this.groundY = this.parentScene.ground.y;
        }

        if (this.time % this.interval == 0) {
            this.setFrameIndex(this.index);
            this.index++;
            if (this.index > this.maxIndex) {
                if (this.loop) {
                    this.index = this.startIndex;
                } else {
                    this.isRemove = true;
                }
            }
        }
        //画面範囲外
        if (this.x<-32 || this.x>SC_W+32 || this.y<-32 || this.y>SC_H+32) {
            this.isRemove = true;
        }

        this.addVelocity();
        this.time++;
        if (this.isRemove) {
            this.removeChildren();
            this.remove();
        }
    },

    //現在の座標に加速度を加算
    addVelocity: function() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityX *= this.velocityD;
        this.velocityY *= this.velocityD;
    },

    //加速度の設定
    setVelocity: function(x, y, decay) {
        this.velocityX = x;
        this.velocityY = y;
        this.velocityD = decay;
        return this;
    },

    //ループ設定
    setLoop: function(b) {
        this.loop = b;
        return this;
    }
});

//爆発エフェクト（標準）
phina.define("pbr.Effect.Explode", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(delay) {
        this.superInit("effect", 64, 64, 2, 0, 17, delay);
    },
});

//爆発エフェクト（小）
phina.define("pbr.Effect.ExplodeSmall", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(delay) {
        this.setFrameTrimming(256, 256, 128, 32);
        this.superInit("effect", 16, 16, 4, 8, 15, delay);
    },
});

//爆発エフェクト（極小）
phina.define("pbr.Effect.ExplodeSmall2", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(delay) {
        this.setFrameTrimming(256, 256, 128, 32);
        this.superInit("effect", 16, 16, 4, 0, 7, delay);
    },
});

//爆発エフェクト（大）
phina.define("pbr.Effect.ExplodeLarge", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(delay) {
        this.setFrameTrimming(0, 192, 192, 96);
        this.superInit("effect", 48, 48, 4, 0, 7, delay);
    },
});

//爆発エフェクト（地上）
phina.define("pbr.Effect.ExplodeGround", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_LOWER,

    init: function(delay) {
        this.setFrameTrimming(256, 192, 256, 48);
        this.superInit("effect", 32, 48, 4, 0, 7, delay);
        isGround = true;

        this.groundX = this.parentScene.ground.x;
        this.groundY = this.parentScene.ground.y;
    },
});

//破片
//num:0=小  1-3=中
phina.define("pbr.Effect.Debri", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(num, delay) {
        num = num || 0;
        num = Math.clamp(num, 0, 3);
        if (num == 0) {
            this.setFrameTrimming(192, 128, 64, 48);
            this.superInit("effect", 8, 8, 2, 0, 8, delay);
        } else {
            num--;
            this.setFrameTrimming(384, 128, 128, 48);
            this.superInit("effect", 16, 16, 4, num*8, (num+1)*8-1, delay);
        }
    },
});

//爆発エフェクト（プレイヤー）
phina.define("pbr.Effect.ExplodePlayer", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function(delay) {
        this.setFrameTrimming(0, 288, 384, 48);
        this.superInit("effect", 48, 48, 4, 0, 7, delay);
    },
});

//ショット着弾エフェクト
phina.define("pbr.Effect.ShotImpact", {
    superClass: "pbr.Effect.EffectBase",
    layer: LAYER_EFFECT_UPPER,

    init: function() {
        this.setFrameTrimming(256, 240, 128, 16);
        this.superInit("effect", 16, 16, 2, 0, 7);
    },
});
