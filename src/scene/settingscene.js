/*
 *  settingscene.js
 *  2016/04/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("pbr.SettingScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //ラベル用パラメータ
        labelParam: {
            text: "",
            fill: "white",
            stroke: false,
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

        var option = {
            title: "notitle",
            menu: ["menu1", "menu2"],
            description: ["menu1", "menu2"],
        };

        //メニュー項目数
        var numMenuItem = option.menu.length;

        //バックグラウンド
        var paramBG = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0, 0, 0, 1)",
            stroke: "rgba(0, 0, 0, 1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(paramBG)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.alpha = 0;
        this.bg.tweener.to({alpha: 0.8}, 2000, "easeOutCubic");

        //バックグラウンド
        var paramFR = {
            width:SC_W*0.8,
            height:SC_H*(numMenuItem*0.1),
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };
        this.frame = phina.display.RectangleShape(paramFR)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.frame.tweener.to({scaleY: 1}, 1000, "easeOutCubic");

        //初期位置
        var posY = SC_H*0.5-(numMenuItem*0.1);

        //メニュータイトル
        phina.display.Label({text: "SETTING"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, posY);

        //メニュー項目
        for (var i = 0; i < numMenuItem; i++) {
        }

        //注釈
        var param2 = {
            width:SC_W,
            height:SC_H*0.15,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(0, 0, 0, 0.7)",
            backgroundColor: 'transparent',
        };
        phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.8)

        this.time = 0;        
    },

    update: function() {
        //キーボード操作
        var kb = app.keyboard;
        if (kb.getKey("up")) {
            if (!this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                this.yes = true;
                app.playSE("select");
            }
        }
        if (kb.getKey("down")) {
            if (this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                this.yes = false;
                app.playSE("select");
            }
        }
        if (this.time > 30) {
            if (kb.getKey("Z") || kb.getKey("space")) {
            }
        }
        this.time++;
    },
});

