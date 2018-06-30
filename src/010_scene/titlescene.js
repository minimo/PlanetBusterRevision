/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("TitleScene", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //バージョン番号
        phina.display.Label({
            text: "ver "+_VERSION_,
            align: "left",
            baseline: "top",
            fontSize: 8,
            stroke: "black",
            fill: "white",
        }.$safe(this.titleParam)).addChildTo(this).setPosition(2, 2);

            //かっこよさげなオブジェ
        this.acc = phina.extension.CircleButton({radius: 64})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.3)
            .setScale(0.0, 0.0);
        this.acc.interactive = false;
        this.acc.tweener.clear().to({ scaleX: 2.0, scaleY: 1 }, 150);

        //タイトル
        phina.display.Label({text: "Planet"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.3-5, SC_H*0.3);
        phina.display.Label({text: "Buster"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.7+5, SC_H*0.3);
        phina.display.Label({text: "REVISION", fontSize:16, stroke: "red"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.35);

        var that = this;
        //選択カーソル
        var param2 = {
            width:SC_W,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.extension.CursolFrame({width: SC_W*0.7, height: SC_H*0.06})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6-3)

        phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.6);
        phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.7);
        this.label3 = phina.display.Label({text: "SETTING"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.label3.blink = false;
        this.label3.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
            if (!this.blink) this.visible = true;
        }

        //タッチ用
        for (var i = 0; i < 3; i++) {
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*SC_H*0.1)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected) return;

                if (that.select != this.select) {
                    that.select = this.select;
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(that.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                } else {
                    that.menuSelect();
                }
            }
        }

        //選択中メニュー番号
        this.select = 0;
        this.isSelected = false;

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        //戻ってきた場合に選択状態を解除
        this.on('enter', function() {
            this.time = 0;
            this.isSelected = false;
        }.bind(this));

        this.time = 0;
    },
    
    update: function(app) {
        //キーボード操作
        if (this.time > 10 && !this.isSelected) {
            var ct = app.controller;
            if (ct.up) {
                this.select--;
                if (this.select < 0) {
                    this.select = 0;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.down) {
                this.select++;
                if (this.select > 2) {
                    this.select = 2;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.ok) {
                this.menuSelect();
            }
        }
        this.time++;
    },

    menuSelect: function() {
        switch (this.select) {
            case 0:
            //ARCADE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.arcadeMode();
                }.bind(this));
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 1:
            //PRACTICE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.practiceMode();
                    this.isSelected = false;
                }.bind(this));
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 2:
            //SETTING
                app.playSE("setting");
                this.isSelected = true;
                this.tweener.clear().wait(700)
                    .call(function() {
                        this.label3.blink = false;
                        this.time = 0;
                        this.isSelected = false;
                        this.settingMode();
                    }.bind(this));
                this.label3.blink = true;
                break;
        }
    },

    arcadeMode: function() {
        this.exit("arcade");
    },

    practiceMode: function() {
        this.exit("practice");
    },

    settingMode: function() {
        app.pushScene(SettingScene(this));
    },
});
