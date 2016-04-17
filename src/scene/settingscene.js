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
            item: ["menu1", "menu2","menu3"],
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

        this.cursolBase = phina.display.DisplayElement().addChildTo(this);
        this.cursolBase.alpha = 0;
        this.cursolBase.tweener.wait(400).fadeIn(100);

        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.alpha = 0;
        this.base.tweener.wait(400).fadeIn(100);

        //選択カーソル
        var paramCursol = {
            width:SC_W*0.8-10,
            height:SC_H*0.08,
            fill: "rgba(100,100,100,0.5)",
            stroke: "rgba(100,100,100,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(paramCursol)
            .addChildTo(this.cursolBase)
            .setPosition(SC_W*0.5, SC_H*0.6-3)

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
            .setPosition(SC_W*0.5, SC_H*0.9)

        this.time = 0;

        this.openMenu();
    },

    update: function() {
        //キーボード操作
        var kb = app.keyboard;
        if (this.time > 10) {
            if (kb.getKey("up")) {
                this.cursol.sel--;
                if (this.cursol.sel < 0) {
                    this.cursol.sel = 0;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.time = 0;
                    app.playSE("select");
                }
            }
            if (kb.getKey("down")) {
                this.cursol.sel++;
                if (this.cursol.sel > this.menu.item.length-1) {
                    this.cursol.sel = this.menu.item.length-1;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.time = 0;
                    app.playSE("select");
                }
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
                this.time = 0;
            }
        }
        this.time++;
    },

    openMenu: function(menu) {
        menu = (menu||{}).$safe(this.defaultMenu);
        this.menu = menu;

        //既存メニュー項目クリア
        this.clearMenu();

        //メニュー項目数
        var numMenuItem = menu.item.length;

        //フレーム
        var paramFR = {
            width:SC_W*0.8,
            height:SC_H*(numMenuItem*0.15)+SC_H*0.1,
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
        this.title = phina.display.Label({text: menu.title}.$safe(this.labelParam))
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, posY);

        //メニュー項目
        this.item = [];
        for (var i = 0; i < numMenuItem; i++) {
            var y = posY+SC_H*0.1*i+SC_H*0.1;
            this.item[i] = phina.display.Label({text: menu.item[i]}.$safe(this.labelParam))
                .addChildTo(this.base)
                .setPosition(SC_W*0.5, y);
        }
        this.cursol.y = this.item[0].y;
        this.cursol.sel = 0;
    },

    //既存メニュー項目クリア
    clearMenu: function() {
        if (this.frame) {
            this.frame.remove();
            delete this.frame;
        }
        if (this.title) {
            this.title.remove();
            delete this.title;
        }
        if (this.item) {
            for (var i = 0; i < this.item.length; i++) {
                this.item[i].remove();
                delete this.item[i];
            }
            delete this.item;
        }
    },

    closeMenu: function() {
        this.base.tweener.clear().fadeOut(100);
        this.cursolBase.tweener.clear().fadeOut(100);
        this.frame.tweener.clear().wait(100).to({scaleY: 0}, 500, "easeOutCubic")
    },
});

