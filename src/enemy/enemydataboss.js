/*
 *  EnemyDataBoss.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.enemyData = pbr.enemyData || [];

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
pbr.enemyData['ThorHammer'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammer",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.isGround = true;
        this.stopDanmaku();

        //初速
        this.vy = -8;
    },

    epuipment: function() {
        //砲台設置
        this.turret = pbr.Enemy("ThorHammerTurret")
            .addChildTo(this.parentScene)
            .setParentEnemy(this)
            .setPosition(0, 0);
    },

    algorithm: function() {
        if (this.phase == 0) {
            if (this.y < -SC_H*0.5) {
                this.phase++;
                this.vy = -5;
                this.isCollision = true;
                this.isMuteki = false;
                this.tweener.clear()
                    .to({vy: -10}, 240)
                    .call(function(){
                        this.phase++;
                        this.resumeDanmaku();
                    }.bind(this));
            }
        }
        if (this.phase == 2) {
            this.turret.flare('startfire');
            this.phase++;
        }

        //土煙出すよ
        if (!this.isDead) {
            var vy = this.parentScene.ground.deltaY;
            for (var i = 0; i < 3; i++) {
                var layer = this.parentScene.effectLayerLower;
                layer.enterSmoke({
                    position: {x: this.x-32+rand(0,64), y: this.y},
                    velocity: {x: 0, y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //タイムアップで逃走（１７秒）
        if (!this.isDead && this.time == 1020) {
            this.tweener.clear()
                .to({vy: -15}, 120, "easeInSine")
                .call(function(){
                    this.parentScene.flare('end_boss');
                }.bind(this))
                .wait(60)
                .call(function(){
                    this.remove();
                }.bind(this));
        }
        this.y += this.vy;
//        this.y -= this.parentScene.ground.deltaY;
    },

    dead: function() {
        this.turret.dead();
        this.turret.remove();
        this.body.frameIndex++;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();

        //破壊時消去インターバル
        this.tweener.clear()
            .to({vy: -8}, 180, "easeInSine")
            .call(function() {
                this.explode();
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 60)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 60)
            .call(function(){
                this.remove();
            }.bind(this));
    },
};

//砲台
pbr.enemyData['ThorHammerTurret'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammerTurret",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 500,

    //得点
    point: 0,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 416,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 32,
    texIndex: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.isMuteki = true;
        this.stopDanmaku();

        this.on('startfire', function(e) {
            this.resumeDanmaku();
        }.bind(this))
    },

    algorithm: function() {
        this.x = this.parentEnemy.x;
        this.y = this.parentEnemy.y-40;
        this.lookAt();
    },
};

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
//本体
pbr.enemyData['Golyat'] = {
    //使用弾幕パターン
    bulletPattern: "Golyat",

    //当り判定サイズ
    width:  52,
    height: 60,

    //耐久力
    def: 1000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 184,
    texTrimX: 258,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;

        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 64, 80)
            .addChildTo(this)
            .setFrameTrimming(382, 0, 64, 80)
            .setFrameIndex(0)
            .setPosition(-2, -18);

        this.core = phina.display.Sprite("tex_boss1", 32, 32)
            .addChildTo(this)
            .setFrameTrimming(0, 0, 32, 32)
            .setFrameIndex(0)
            .setPosition(-2, -18);

        //登場パターン
        this.tweener.clear()
            .moveTo(SC_W*0.5, SC_H*0.3, 300, "easeOutSine")
            .call(function(){this.phase++;}.bind(this));

        this.vy = 0;
    },

    epuipment: function() {
        //左アーム
        this.armL = pbr.Enemy("GolyatArmL")
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.armL.offsetX = -64;
        this.armL.offsetY = 0;

        //右アーム
        this.armR = pbr.Enemy("GolyatArmR")
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.armR.offsetX = 64;
        this.armR.offsetY = 0;
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.phase++;
            this.vy = 15;
        }
        this.y += this.vy;
    },
};

//アーム左
pbr.enemyData['GolyatArmL'] = {
    //使用弾幕パターン
    bulletPattern: "",

    //当り判定サイズ
    width:  56,
    height: 200,

    //耐久力
    def: 3000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 66,
    texHeight: 184,
    texTrimX: 192,
    texTrimY: 0,
    texTrimWidth: 66,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 52, 200)
            .addChildTo(this)
            .setFrameTrimming(450, 0, 52, 200)
            .setFrameIndex(0)
            .setPosition(7, 8);
    },

    algorithm: function() {
        this.x = this.parentEnemy.x+this.offsetX;
        this.y = this.parentEnemy.y+this.offsetY;
    },
};

//アーム右
pbr.enemyData['GolyatArmR'] = {
    //使用弾幕パターン
    bulletPattern: "",

    //当り判定サイズ
    width:  56,
    height: 200,

    //耐久力
    def: 3000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 66,
    texHeight: 184,
    texTrimX: 310,
    texTrimY: 0,
    texTrimWidth: 66,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 52, 200)
            .addChildTo(this)
            .setFrameTrimming(450, 0, 52, 200)
            .setFrameIndex(0)
            .setPosition(-7, 8);
    },

    algorithm: function() {
        this.x = this.parentEnemy.x+this.offsetX;
        this.y = this.parentEnemy.y+this.offsetY;
    },
};

//砲台
pbr.enemyData['GolyatTurret'] = {
    //使用弾幕パターン
    bulletPattern: "",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 500,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 192,
    texTrimY: 0,
    texTrimWidth: 184,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
    },

    algorithm: function() {
    },
};

/*
 *
 *  ２面中ボス
 *  大型爆撃機「レイブンブランド」
 *
 */

/*
 *
 *  ２面ボス
 *  空中空母「ストームブリンガー」
 *
 */


/*
 *
 *  ３面中ボス  
 *
 */

/*
 *
 *  ３面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */

/*
 *
 *  ４面中ボス
 *
 */

/*
 *
 *  ４面ボス
 *
 */

