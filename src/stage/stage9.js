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
        this.add(1, function() {
            app.playBGM("stage9", true);
        });

        this.add( 180, "Raven");

        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(112, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(3.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //WARNING
        this.addEvent("warning", function() {
            this.enterWarning();
        });
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
//        this.mapBase.x = -w*0.5;
//        this.mapBase.y = -h*0.5;
        this.mapBase.x = 0;
        this.mapBase.y = -2000*32+SC_H;
    },
});

})();
