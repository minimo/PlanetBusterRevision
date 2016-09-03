/*
 *  Stage2.js
 *  2016/08/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("pbr.Stage2", {
    superClass: "pbr.StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function(app) {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:1.0, alpha:1}, 1, "easeInOutQuad");
            app.playBGM("stage2", true);
        });
    },
});

//ステージ１地形管理
phina.define("pbr.Stage2Ground", {
    superClass: "pbr.Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;
    },
});

})();
