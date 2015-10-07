/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

tm.define("tmapp.TitleScene", {
    superClass: tm.app.Scene,

    init: function() {
        this.superInit();
        this.background = "rgba(0, 0, 0, 0.0)";

        //バックグラウンド
        this.bg = tm.display.Sprite("bg", SC_W*2, SC_H*2).addChildTo(this);

        var lb = this.title1 = tm.display.OutlineLabel("PIYOPIYO", 30).addChildTo(this);
        lb.setPosition(SC_W*0.4, SC_H*0.2-SC_H*0.6);
        lb.fontFamily = "azuki";
        lb.align     = "center";
        lb.baseline  = "middle";
        lb.fontSize = 50;
        lb.outlineWidth = 2;
        lb.tweener.wait(500).move(SC_W*0.4, SC_H*0.2, 3000,"easeOutBounce");
        var lb = this.title2 = tm.display.OutlineLabel("BANGBANG", 30).addChildTo(this);
        lb.setPosition(SC_W*0.6, SC_H*0.35-SC_H*0.6);
        lb.fontFamily = "azuki";
        lb.align     = "center";
        lb.baseline  = "middle";
        lb.fontSize = 50;
        lb.outlineWidth = 2;
        lb.tweener.wait(500).move(SC_W*0.6, SC_H*0.35, 3000,"easeOutBounce");
        var lb = this.title3 = tm.display.OutlineLabel("かっこかり", 30).addChildTo(this);
        lb.setPosition(SC_W*0.5, SC_H*0.5-SC_H*0.6);
        lb.fontFamily = "azuki";
        lb.align     = "center";
        lb.baseline  = "middle";
        lb.fontSize = 50;
        lb.outlineWidth = 2;
        lb.tweener.wait(500).move(SC_W*0.5, SC_H*0.5, 3000,"easeOutBounce");

        var lb = this.startLabel = tm.display.OutlineLabel("TOUCH START", 30).addChildTo(this);
        lb.setPosition(SC_W*0.5, SC_H*0.8);
        lb.fontFamily = "KS-Kohichi";
        lb.align     = "center";
        lb.baseline  = "middle";
        lb.fontSize = 20;
        lb.outlineWidth = 2;
        lb.alpha = 0;
        lb.tweener.fadeIn(2000);

        this.mask = tm.display.Sprite("bg", SC_W*2, SC_H*2).addChildTo(this);
        this.mask.tweener.clear().fadeOut(500);
    },

    update: function() {
    },

    //タッチorクリック開始処理
    ontouchstart: function(e) {
    },

    //タッチorクリック移動処理
    ontouchmove: function(e) {
    },

    //タッチorクリック終了処理
    ontouchend: function(e) {
        var x = e.x;
        var y = e.y;
        app.replaceScene(tmapp.MainScene());
    },

});


