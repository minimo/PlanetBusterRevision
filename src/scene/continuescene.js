/*
 *  continuescene.js
 *  2016/03/29
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("pbr.ContinueScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        labelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "center",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(currentScene, stageNumber, boss, allclear) {
        this.superInit();
        this.$extend(this._member);

        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width:SC_W*0.7,
            height:SC_H*0.5,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //リザルト表示
        this.result1 = "SCORE: "+app.score;
        if (!allclear) {
            this.result2 = "Stage:"+stageNumber+(boss?"-boss":"");
        } else {
            this.result2 = "(ALL CLEAR!!)";
        }

        //ゲームオーバー表示
        phina.display.Label({text: "CONTINUE?"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.4);

        phina.display.Label({text: this.result1}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        phina.display.Label({text: this.result2}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55);

        phina.display.Label({text: "YES     NO"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.60);

        this.time = 0;        
    },

    update: function() {
        //キーボード操作
        var kb = app.keyboard;
        if (this.time > 60 && app.keyboard.getKey("Z")) {
            this.currentScene.flare("gameover");
            app.popScene();
        }
        if (this.time > 60 && app.keyboard.getKey("X")) {
            this.currentScene.flare("continue");
            app.popScene();
        }

        this.time++;
    },

    ontouchstart: function(e) {
        this.exit();
    },

    exit: function() {
        app.replaceScene(pbr.TitleScene());
    },
});

