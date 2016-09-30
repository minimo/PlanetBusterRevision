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
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 200000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

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

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;

        this.phase = 0;
        this.tweener.clear().to({x: SC_W*0.5, y: SC_H*0.2}, 120, "easeOutCubic");
    },

    epuipment: function() {
    },

    algorithm: function() {
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
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 400000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

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

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};
