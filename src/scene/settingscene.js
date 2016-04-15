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
        defaultMenu: {
            title: "SETTING",
            item: ["menu1", "menu2"],
            description: ["menu1", "menu2"],
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
        this.bg.tweener.clear().to({alpha: 0.8}, 500, "easeOutCubic");

        this.frameBase = phina.display.DisplayElement().addChildTo(this);

        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.alpha = 0;
        this.base.tweener.wait(400).fadeIn(100);

        //注釈
        var param2 = {
            width:SC_W,
            height:SC_H*0.15,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(0, 0, 0, 0.7)",
            backgroundColor: 'transparent',
        };
        phina.display.RectangleShape(param2)
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, SC_H*0.8)

        this.time = 0;

        this.openMenu();
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
                this.closeMenu();
                this.bg.tweener.clear().to({alpha: 0.0}, 500, "easeOutCubic");
                this.tweener.clear()
                    .wait(600)
                    .call(function(){
                        app.popScene();
                    });
            }
        }
        this.time++;
    },

    openMenu: function(menu) {
        menu = (menu||{}).$safe(this.defaultMenu);

        //メニュー項目数
        var numMenuItem = menu.item.length;

        //フレーム
        var paramFR = {
            width:SC_W*0.8,
            height:SC_H*(numMenuItem*0.15),
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };
        this.frame = phina.display.RectangleShape(paramFR)
            .addChildTo(this.frameBase)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.frame.tweener.to({scaleY: 1}, 500, "easeOutCubic");

        //初期位置
        var posY = SC_H*0.5-SC_H*(numMenuItem*0.05);

        //メニュータイトル
        phina.display.Label({text: menu.title}.$safe(this.labelParam))
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, posY);

        //メニュー項目
        for (var i = 0; i < numMenuItem; i++) {
        }
    },

    closeMenu: function() {
        this.base.tweener.clear().fadeOut(100);
        this.frame.tweener.clear().wait(100).to({scaleY: 0}, 500, "easeOutCubic")
    },
});

