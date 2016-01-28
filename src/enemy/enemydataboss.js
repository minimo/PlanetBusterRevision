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
    def: 1000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_MBOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;
        this.stopDanmaku();

//        this.turret = pbr.Enemy("ThorHammerTurret").addChildTo(this);
    },

    algorithm: function() {
        if (this.phase == 0) {
            this.y -= 8;
            if (this.y < -SC_H*0.5) {
                this.phase++;
                this.isCollision = true;
/*
                this.tweener.clear()
                    .to({x:SC_W*0.5, y: SC_H*0.2}, 3000)
                    .call(function(){
                        this.phase++;
                        this.resumeDanmaku();
                    }.bind(this));
*/
            }
        }
        if (this.phase == 1) {
            this.y -= this.parentScene.ground.deltaY;
            this.y += 2;
            if (this.y > SC_H*0.2) {
                this.phase++;
            }
        }
        if (this.phase == 2) {
            this.y -= this.parentScene.ground.deltaY;
        }
    },
};

//砲台
pbr.enemyData['ThorHammerTurret'] = {
    //使用弾幕パターン
    bulletPattern: "ThorHammerTurret",

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
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_MBOSS,

    //機体用テクスチャ情報
    texName: "boss1",
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
    width:  64,
    height: 64,

    //耐久力
    def: 1000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_MBOSS,

    //機体用テクスチャ情報
    texName: "boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 192,
    texTrimY: 0,
    texTrimWidth: 184,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;

        //ボディカバー
        this.cover = phina.display.Sprite("boss1", 32, 32)
            .addChildTo(this)
            .setPosition(0, 0)
            .setFrameTrimming(382, 0, 32, 32);

        this.core = phina.display.Sprite("boss1", 32, 32)
            .addChildTo(this)
            .setPosition(0, 0)
            .setFrameTrimming(0, 0, 32, 32);

        //登場パターン
        this.tweener.clear()
            .move(SC_W*0.5, SC_H*-0.5, 3000, "easeOutSine")
            .call(function(){this.phase++;}.bind(this));
    },

    algorithm: function() {
        if (this.phase == 2) {
            this.isCollision = true;
            this.phase++;
        }
    },
};

//アーム
pbr.enemyData['GolyatArm'] = {
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
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_MBOSS,

    //機体用テクスチャ情報
    texName: "boss1",
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
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_MBOSS,

    //機体用テクスチャ情報
    texName: "boss1",
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

