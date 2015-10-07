/*
 *  TutorialScene.js
 *  2014/06/17
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phinaApp.TutorialScene", {
    superClass: phina.app.Scene,
    
    _member: {
        page: 0,
        maxPage: 1,

        //ラベル用パラメータ
        labelParam: {fontFamily: "KS-Kohichi", align: "left", baseline: "middle", fontSize: 20},
    },

    init: function(stageNumber) {
        this.superInit();
        this.$extend(this._member);

        this.background = "rgba(0, 0, 0, 0.0)";

        //バックグラウンド
        this.bg = phina.display.Sprite("bg", SC_W*2, SC_H*2).addChildTo(this);

        var that = this;
        var lb = this.skip = phina.display.Label("SKIP", this.labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.1, SC_H*0.9-SC_H);
        lb.tweener.wait(2000).to({x: SC_W*0.1, y: SC_H*0.9}, 1500,"easeOutElastic");

        var lb = this.next = phina.display.Label("NEXT>", this.labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.7, SC_H*0.9-SC_H);
        lb.tweener.wait(2000).to({x:SC_W*0.7, y: SC_H*0.9}, 1500,"easeOutElastic");

        var lb = this.scoreLabel = phina.display.Label("STAGE "+stageNumber, this.labelParam)
            .addChildTo(this)
            .setPosition(SC_W/2, SC_H/2);
        lb.alpha = 0;
        lb.tweener.to({alpha:0},300);

        //説明パネル
        switch (stageNumber) {
            case 1:
            case 2:
            case 3:
                this.maxPage = 2;
                break;
        }
        this.panels = [];
        for (var i = 0; i < this.maxPage; i++) {
            var pn = phina.display.Sprite("tutorial"+stageNumber+"_"+(i+1), 300, 300).addChildTo(this);
            pn.setPosition(SC_W/2, -SC_H/2);
            this.panels.push(pn);
        }
        this.panels[0].tweener.wait(2000).to({x: SC_W/2, y: SC_H/2}, 1500,"easeOutElastic");

        //目隠し
        this.mask = phina.display.Sprite("bg", SC_W*2, SC_H*2).addChildTo(this);
        this.mask.tweener.clear().to({alpha: 0}, 500);
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
        this.page++;
        if (this.page == this.maxPage) {
            app.popScene();
        } else {
            this.panels[this.page].tweener.to({x: SC_W/2, y: SC_H/2}, 1000,"easeOutElastic");
        }
    },

});


