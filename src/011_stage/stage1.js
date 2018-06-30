/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("Stage1", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage1", true);
            this.player.isAfterburner = true;
        });
        this.add(60, function() {
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

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });

        this.add(  90, "Hornet1-left");
        this.add(  20, "Hornet1-right");
        this.add( 120, "Hornet1-center");

        this.add( 120, "ToyBox-p-right");

        this.add( 120, "Fragarach-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add( 180, "Hornet1-center");

        this.add( 120, "Fragarach-left");
        this.add(  60, "Fragarach-right");

        this.add( 120, "Hornet3-center");

        this.add( 120, "Fragarach-left2");
        this.add(   1, "Fragarach-right2");

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });

        this.add(  60, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");
        this.add( 120, "Hornet3-center");

        //中ボス
        this.add( 360, "ThorHammer", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.add( 1800, function() {});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add(120, function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });

        this.add(  30, "BigWing-left");
        this.add( 180, "BigWing-right");

        this.add( 120, "Hornet2-left");
        this.add(  20, "Hornet2-right");
        this.add( 120, "Hornet2-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add( 120, "ToyBox-p-center");

        //WARNING
        this.add( 360, function() {
            this.enterWarning();
        });

        //ステージボス
        this.add( 300, function() {
            this.ground.tweener.clear().to({speed:0.0}, 180, "easeInOutCubic");
        });
        this.add( 120, "Golyat", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:-7.0}, 180, "easeInOutCubic");
        });
        this.add( 1800, function() {});


        //イベント登録
        this.addEvent("scroll_1", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_2", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_3", function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.addEvent("scroll_4", function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });
        this.addEvent("scroll_5", function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });
        this.addEvent("warning", function() {
            this.enterWarning();
        });

    },
});

//ステージ１地形管理
phina.define("Stage1Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;

        this.setScale(0.2, 0.2);
        this.speed = 1.0;
    },
});

})();