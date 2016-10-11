/*
 *  EnemyDataBoss_2.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.enemyData = pbr.enemyData || [];

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
pbr.enemyData['Raven'] = {
    //使用弾幕パターン
    danmakuName: "Raven",

    //当り判定サイズ
    width:  96,
    height: 40,

    //耐久力
    def: 3000,

    //得点
    point: 200000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 144,
    texHeight: 64,
    texTrimX: 0,
    texTrimY: 256,
    texTrimWidth: 144,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;

        this.stopDanmaku();

        var that = this;

        //砲台
        this.turret = phina.display.Sprite("tex_boss1", 32, 32)
            .addChildTo(this)
            .setFrameTrimming(160, 192, 32, 32)
            .setFrameIndex(0)
            .setPosition(0, 0);
        this.turret.update = function() {
            target = that.player;

            //ターゲットの方向を向く
            var ax = that.x - target.x;
            var ay = that.y - target.y;
            var rad = Math.atan2(ay, ax);
            var deg = ~~(rad * toDeg);
            this.rotation = deg-90;
        };

/*
        //アフターバーナー
        this.burner = phina.display.Sprite("tex_boss1", 112, 32)
            .addChildTo(this)
            .setFrameTrimming(0, 320, 112, 64)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.burner.update = function() {
            this.frameIndex++;
        };
*/
        this.phase = 0;
        this.tweener.clear()
            .to({x: SC_W*0.5, y: SC_H*0.25}, 120, "easeOutCubic")
            .call(function() {
                this.phase++;
            }.bind(this));
    },

    epuipment: function() {
        //翼
        this.wingL = pbr.Enemy("Raven_wing", -48, 0, 0, {frameIndex: 0})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.wingR = pbr.Enemy("Raven_wing", 48, 0, 0, {frameIndex: 1})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.isMuteki = false;
            this.phase++;
            this.startDanmaku(this.danmakuName);

            //移動パターン
            this.tweener.clear()
                .to({x: SC_W*0.8}, 240, "easeInOutSine")
                .to({x: SC_W*0.2}, 240, "easeInOutSine")
                .setLoop(true);
            this.tweener2 = phina.accessory.Tweener().clear().setUpdateType('fps')
                .to({y: SC_H*0.2}, 180, "easeInOutSine")
                .to({y: SC_H*0.3}, 180, "easeInOutSine")
                .setLoop(true)
                .attachTo(this);
        }
    },

    dead: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        this.tweener2.remove();
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .to({rotation: 30}, 300)
            .attachTo(this);
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .by({x: 2}, 3)
            .by({x: -2}, 3)
            .setLoop(true)
            .attachTo(this);

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 100, 300)
            .call(function() {
                this.explode();
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },
};

pbr.enemyData['Raven_wing'] = {
    //使用弾幕パターン
    danmakuName: null,

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 64,
    texHeight: 64,
    texTrimX: 160,
    texTrimY: 256,
    texTrimWidth: 128,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = param.frameIndex;
        this.offsetX = this.x;
        this.offsetY = this.y;
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
    },
};

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
pbr.enemyData['Garuda'] = {
    //使用弾幕パターン
    danmakuName: ["Garuda_1","Garuda_2","Garuda_3"],

    //当り判定サイズ
    width:  296,
    height: 80,

    //耐久力
    def: 3000,

    //得点
    point: 400000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 296,
    texHeight: 80,
    texTrimX: 112,
    texTrimY: 320,
    texTrimWidth: 296,
    texTrimHeight: 160,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
    },

    epuipment: function() {
        //ハッチ
        this.hatchL = pbr.Enemy("Garuda_hatch", -48, 0, 0)
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.phase++;

            //移動パターン
            this.tweener.clear()
                .to({y: SC_H*0.2}, 120, "easeInOutSine")
                .to({y: SC_H*0.3}, 120, "easeInOutSine")
                .setLoop(true);
        }
    },
};

pbr.enemyData['Garuda_hatch'] = {
    //使用弾幕パターン
    danmakuName: null,

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 1500,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 16,
    texHeight: 16,
    texTrimX: 160,
    texTrimY: 256,
    texTrimWidth: 64,
    texTrimHeight: 16,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = param.frameIndex;
        this.offsetX = this.x;
        this.offsetY = this.y;
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
    },
};
