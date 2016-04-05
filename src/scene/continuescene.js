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

    init: function(currentScene) {
        this.superInit();
        this.$extend(this._member);

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W*0.6,
            height:SC_H*0.3,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //選択カーソル
        var param2 = {
            width:SC_W*0.15,
            height:SC_H*0.1,
            fill: "rgba(0,200,200,0.5)",
            stroke: "rgba(0,200,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)

        //タッチ用カーソル
        var that = this;
        this.cursol1 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)
            .setInteractive(true);
        this.cursol1.alpha = 0;
        this.cursol1.onpointend = function() {
            if (that.yes) {
                that.currentScene.flare("continue");
                app.popScene();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                that.yes = true;
            }
        }
        this.cursol2 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55)
            .setInteractive(true);
        this.cursol2.alpha = 0;
        this.cursol2.onpointend = function() {
            if (!that.yes) {
                that.currentScene.flare("gameover");
                app.popScene();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                that.yes = false;
            }
        }

        //コンティニュー表示
        phina.display.Label({text: "CONTINUE?"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.40);

        phina.display.Label({text: "YES"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55);

        phina.display.Label({text: "NO"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55);

        //カウンタ表示
        this.counter = phina.display.Label({text: "9", fontSize: 30}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.45);
        this.counter.count = 9;
        this.counter.tweener.clear().wait(1000).call(function() {this.count--;}.bind(this.counter)).setLoop(true);
        this.counter.update = function() {
            this.text = ""+this.count;
            if (this.count < 0) {
                that.currentScene.flare("gameover");
                app.popScene();
            }
        }

        this.time = 0;        
    },

    update: function() {
        //キーボード操作
        var kb = app.keyboard;
        if (app.keyboard.getKey("left")) {
            this.cursol.tweener.clear()
                .moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
            this.yes = true;
        }
        if (app.keyboard.getKey("right")) {
            this.cursol.tweener.clear()
                .moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
            this.yes = false;
        }
        if (this.time > 30) {
            if (app.keyboard.getKey("Z") || app.keyboard.getKey("space")) {
                if (this.yes) {
                    this.currentScene.flare("continue");
                    app.popScene();
                } else {
                    this.currentScene.flare("gameover");
                    app.popScene();
                }
            }
        }
        this.time++;
    },
});

