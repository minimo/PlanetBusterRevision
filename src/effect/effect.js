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
        velocity: {
            x: 0,       //Ｘ座標方向
            y: 0,       //Ｙ座標方向
            decay: 1.0, //減衰率
        },

        //相対地上座標
        groundX: 0,
        groundY: 0,

        //地上エフェクトフラグ
        ifGround: false,

        time: 0,

        defaultOption: {
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            delay: 0,
            loop: false,
            enterframe: null,
            isGround: false,
            trimming: null,
            position: {x: SC_W*0.5, y: SC_H*0.5},
            velocity: {x: 0, y: 0, decay: 0},
        },
    },

    init: function() {
        this.superInit("effect");

        this.on("enterframe", this.defaultEnterframe);

        //リムーブ時
        this.on("removed", function(){
            this.effectLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(option) {
        this.$extend(this._member);
        option = (option || {}).$safe(this.defaultOption);
        if (this.assetName != option.assetName) {
            this.image = phina.asset.AssetManager.get('image', option.assetName);
            this.assetName = option.assetName;
        }
        this.width = option.width;
        this.height = option.height;

        //初期値セット
        this.interval = option.interval;
        this.startIndex = option.startIndex;
        this.maxIndex = option.maxIndex;
        this.delay = option.delay;
        if (this.delay < 0) this.delay *= -1;
        this.loop = option.loop;
        this.time = -this.delay;
        
        //トリミング設定
        var tr = option.trimming || {x:0, y: 0, width: this.image.width, height: this.image.height};
        this.setFrameTrimming(tr.x, tr.y, tr.width, tr.height);

        this.index = this.startIndex;
        this.setFrameIndex(this.index);

        this.setPosition(option.position.x, option.position.y);
        this.setVelocity(option.velocity.x, option.velocity.y, option.velocity.decay);

        return this;
    },

    defaultEnterframe: function() {
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
        if (this.x < -32 || this.x > SC_W+32 || this.y < -32 || this.y > SC_H+32) {
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
        this.x += this.velocity.x*10;
        this.y += this.velocity.y*10;
        this.velocity.x *= this.velocity.decay;
        this.velocity.y *= this.velocity.decay;
        return this;
    },

    //加速度の設定
    setVelocity: function(x, y, decay) {
        decay = decay || 1;
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.decay = decay;
        return this;        
    },

    //ループ設定
    setLoop: function(b) {
        this.loop = b;
        return this;
    }
});
