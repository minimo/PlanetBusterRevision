/*
 *  EnemyDataBoss_3.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.enemyData = pbr.enemyData || [];

/*
 *
 *  ３面中ボス
 *  「モーンブレイド」
 *
 */
pbr.enemyData['MournBlade'] = {
    //使用弾幕パターン
    danmakuName: "MournBlade",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

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
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};

/*
 *
 *  ３面ボス
 *  空中空母「ストームブリンガー」
 *
 */
pbr.enemyData['StormBringer'] = {
    //使用弾幕パターン
    danmakuName: ["StormBringer1_1", "StormBringer1_2", "StormBringer1_3", "StormBringer2"],

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};
