/*
 *  Effect.js
 *  2014/07/10
 *  @auther minimo  
 *  This Program is MIT license.
 */
Effect = [];

//汎用エフェクト
phina.define("Effect.EffectBase", {
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
        velocity: {},

        //地上エフェクトフラグ
        ifGround: false,

        time: 0,
    },

    defaultOption: {
        name: "noname",
        assetName: "effect",
        width: 64,
        height: 64,
        interval: 2,
        startIndex: 0,
        maxIndex: 17,
        sequence: null,
        delay: 0,
        loop: false,
        enterframe: null,
        isGround: false,
        trimming: null,
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        rotation: 0,
        alpha: 1.0,
        scale: {x: 1.0, y: 1.0},
        blendMode: "source-over",
    },

    init: function() {
        this.superInit("effect");
        this.$extend(this._member);

        this.tweener.setUpdateType('fps');

        this.velocity = {
            x: 0,       //Ｘ座標方向
            y: 0,       //Ｙ座標方向
            decay: 1.0  //減衰率
        };

        this.on("enterframe", this.defaultEnterframe);

        //リムーブ時
        this.on("removed", function(){
            this.effectLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        if (this.assetName != option.assetName) {
            this.image = phina.asset.AssetManager.get('image', option.assetName);
            this.assetName = option.assetName;
        }
        this.width = option.width;
        this.height = option.height;

        //初期値セット
        this.name = option.name;
        this.interval = option.interval;
        this.startIndex = option.startIndex;
        this.maxIndex = option.maxIndex;
        this.sequence = option.sequence;
        this.seqIndex = 0;
        this.delay = option.delay;
        if (this.delay < 0) this.delay *= -1;
        this.loop = option.loop;
        this.time = -this.delay;

        //αブレンド設定
        this.alpha = option.alpha;
        this.blendMode = option.blendMode;

        //トリミング設定
        var tr = option.trimming || {x:0, y: 0, width: this.image.width, height: this.image.height};
        this.setFrameTrimming(tr.x, tr.y, tr.width, tr.height);

        this.index = this.startIndex;
        if (this.sequence) this.index = this.sequence[0];
        this.setFrameIndex(this.index);

        this.setPosition(option.position.x, option.position.y);
        this.setVelocity(option.velocity.x, option.velocity.y, option.velocity.decay);
        this.rotation = option.rotation;
        this.scaleX = option.scale.x;
        this.scaleY = option.scale.y;

        this.isRemove = false;
        this.visible = false;

        //Tweenerリセット
        this.tweener.clear();

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
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        if (this.time % this.interval == 0) {
            this.setFrameIndex(this.index);
            if (this.sequence) {
                this.index = this.sequence[this.seqIndex];
                this.seqIndex++;
                if (this.seqIndex == this.sequence.length) {
                    if (this.loop) {
                        this.seqIndex = 0;
                    } else {
                        this.isRemove = true;
                    }
                }
            } else {
                this.index++;
                if (this.index > this.maxIndex) {
                    if (this.loop) {
                        this.index = this.startIndex;
                    } else {
                        this.isRemove = true;
                    }
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
        this.x += this.velocity.x;
        this.y += this.velocity.y;
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