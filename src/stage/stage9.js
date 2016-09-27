/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//テスト用ステージ
phina.define("pbr.Stage9", {
    superClass: "pbr.StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function(app) {
            app.playBGM("stage9", true);
        });

//        this.add( 180, "Golyat");
    },
});

//ステージ１地形管理
phina.define("pbr.Stage9Ground", {
    superClass: "pbr.Ground",

    init: function() {
        this.superInit({
            asset: "map1",
            type: "tmx",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;
    },
});

})();
