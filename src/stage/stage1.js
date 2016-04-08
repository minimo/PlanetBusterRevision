/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("pbr.Stage1", {
    superClass: "pbr.StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function(app) {
            this.ground.tweener.clear().to({scaleX:0.2, scaleY:0.2, speed:1.0, alpha:1}, 1, "easeInOutQuad");
            app.playBGM("stage1", true);
            this.player.isAfterburner = true;
        });
        this.add(60, function(app) {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        //Stage data
        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add(  90, "Hornet1-left");
        this.add(  20, "Hornet1-right");
        this.add( 120, "Hornet1-center");

        this.add(  90, "Hornet2-left");
        this.add( 120, "Hornet2-right");
        this.add( 120, "Hornet2-center");

        this.add(  60, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "ToyBox-p-right");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        //中ボス
        this.add( 360, "ThorHammer", {boss: true});
        this.add( 120, function(app) {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.add( 1800, function() {});
        this.add( 120, function(app) {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add(120, function(app) {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });

        this.add(  30, "BigWing-left");
        this.add( 180, "BigWing-right");

        this.add( 120, "Hornet2-left");
        this.add(  20, "Hornet2-right");
        this.add( 120, "Hornet2-center");

        this.add( 120, "ToyBox-p-right");
    },
});

//ステージ１地形管理
phina.define("pbr.Stage1Ground", {
    superClass: "pbr.Ground",

    init: function() {
        this.superInit({
            asset: null,
            belt: false
        });
        var w = 640;
        var h = 1300;
        for (var i = 0; i < 30; i++) {
            phina.display.Sprite("map1g").addChildTo(this.mapBase).setPosition(0, -h*i);
            phina.display.Sprite("map1g").addChildTo(this.mapBase).setPosition(-w, -h*i);
            phina.display.Sprite("map1g").addChildTo(this.mapBase).setPosition(w, -h*i);
        }
    },
});

})();
