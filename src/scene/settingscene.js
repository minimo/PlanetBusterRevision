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
            item: ["GAME", "SYSTEM", "test", "EXIT"],
            description: ["menu1", "menu2", "test", "exit"],
        },
    },

    init: function(menu) {
        this.superInit();
        this.$extend(this._member);

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
        this.cursolBase.tweener.wait(300).fadeIn(100);

        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.alpha = 0;

        //選択カーソル
        var paramCursol = {
            width:SC_W*0.85-10,
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
//            .addChildTo(this.base)
            .setPosition(SC_W*0.5, SC_H*0.9)

        this.time = 0;

        this.openMenu(menu);
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
            var sel = this.cursol.sel;
            if (this.item[sel] instanceof pbr.Selector) {
                var item = this.item[sel];
                if (kb.getKey("left")) {
                    item.dec();
                    this.time = 0;
                }
                if (kb.getKey("right")) {
                    item.inc();
                    this.time = 0;
                }
            }
        }
        if (this.time > 10) {
            if (kb.getKey("Z") || kb.getKey("space")) {
                this.selectMenu();
            }
        }
        this.time++;
    },

    openMenu: function(menu) {
        menu = (menu||{}).$safe(this.defaultMenu);
        this.menu = menu;
        menu.item[2] = pbr.Selector({width:SC_W*0.8});

        //既存メニュー項目クリア
        this.clearMenu();

        //メニュー項目数
        var numMenuItem = menu.item.length;

        //フレーム
        var paramFR = {
            width:SC_W*0.87,
            height:SC_H*(numMenuItem*0.15)+SC_H*0.1,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };
        this.frame = phina.display.RectangleShape(paramFR)
            .addChildTo(this.frameBase)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.frame.tweener.to({scaleY: 1}, 250, "easeOutCubic");
        this.base.tweener.wait(150).fadeIn(100);

        //初期位置
        var posY = SC_H*0.5-SC_H*(numMenuItem*0.05);

        //メニュータイトル
        this.title = phina.display.Label({text: menu.title}.$safe(this.labelParam))
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, posY);

        //クリック用
        var paramCL = {
            width:SC_W*0.8,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        //メニュー項目
        var that = this;
        this.item = [];
        this.click = [];
        for (var i = 0; i < numMenuItem; i++) {
            var y = posY+SC_H*0.1*i+SC_H*0.1;
            var item = menu.item[i];
            if (typeof item == 'string') {
                this.item[i] = phina.display.Label({text: menu.item[i]}.$safe(this.labelParam))
                    .addChildTo(this.base)
                    .setPosition(SC_W*0.5, y);
            }
            if (item instanceof pbr.Selector) {
                this.item[i] = item;
                item.addChildTo(this.base).setPosition(SC_W*0.5, y);
            }
            this.click[i] = phina.display.RectangleShape(paramCL)
                .addChildTo(this.base)
                .setPosition(SC_W*0.5, y)
                .setInteractive(true);
            this.click[i].$extend({alpha: 0, selY: y, sel: i});
            this.click[i].onpointstart = function() {
                if (that.cursol.sel == this.sel) {
                    that.selectMenu();
                } else {
                    app.playSE("select");
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, this.selY, 200, "easeOutCubic");
                    that.cursol.sel = this.sel;
                }
            }
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
                this.click[i].remove();
                delete this.click[i];
            }
            delete this.item;
            delete this.click;
        }
    },

    closeMenu: function() {
        this.base.tweener.clear().fadeOut(100);
        this.cursolBase.tweener.clear().fadeOut(100);
        this.frame.tweener.clear().wait(100).to({scaleY: 0}, 250, "easeOutCubic")
    },

    selectMenu: function() {
        if (this.cursol.sel == this.menu.item.length-1) {
            this.closeMenu();
            this.bg.tweener.clear().to({alpha: 0.0}, 500, "easeOutCubic");
            this.tweener.clear()
                .wait(600)
                .call(function(){
                    app.popScene();
                });
        }
    },
});

phina.define("pbr.Selector", {
    superClass: "phina.display.DisplayElement",

    //選択中アイテム
    selectItem: 0,

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
    defaultOption: {
        width: 640,
        title: "SELECT",
        initial: 0,
        item: ["aaaaa", "2", "3", "4", "5"],
        description: ["1", "2", "3", "4", "5"],
        vertical: false,
    },

    init: function(option) {
        this.superInit();
        this.option = (option||{}).$safe(this.defaultOption);

        var width = this.option.width;

        //タイトル   
        this.title = phina.display.Label({text: this.option.title}.$safe(this.labelParam))
        this.title.addChildTo(this)
            .setPosition(-width*0.3, 0);

        //選択初期位置
        this.selectItem = this.option.initial;
        if (this.selectItem < 0) this.selectItem = 0;

        //アイテムセット
        this.itemBase = phina.display.DisplayElement().addChildTo(this);
        this.items = [];
        for (var i = 0; i < this.option.item.length; i++) {
            this.items[i] = phina.display.Label({text: this.option.item[i]}.$safe(this.labelParam))
                .addChildTo(this.itemBase)
                .setPosition(width*0.2+i*100, 0);
            if (i != this.option.initial) this.items[i].alpha = 0;
        }

        var that = this;
        //Shape用パラメータ
        var paramShp = {
            backgroundColor: 'transparent',
            fill: 'black',
            stroke: '#aaa',
            strokeWidth: 0,

            radius: 7,
            sides: 5,
            sideIndent: 0.38,
        };
        //操作ボタン
        var paramBT = {
            width: 15,
            height:SC_H*0.05,
            fill: "rgba(255, 255, 255, 0.7)",
            stroke: null,
            backgroundColor: 'transparent',
        };
        this.btnL = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(-width*0.05, 0)
            .setInteractive(true);
        this.btnL.onpointstart = function() {
            that.dec();
        }
        this.btnL2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnL)
            .setPosition(1, 0);
        this.btnL2.rotation = 30;
        
        this.btnR = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(width*0.45, 0)
            .setInteractive(true);
        this.btnR.onpointstart = function() {
            that.inc();
        }
        this.btnR2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnR)
            .setPosition(-1, 0);
        this.btnR2.rotation = -30;
    },

    inc: function() {
        this.selectItem++;
        if (this.selectItem > this.option.item.length-1) {
            this.selectItem = this.option.item.length-1;
            return this;
        }
        this.items[this.selectItem-1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },

    dec: function() {
        this.selectItem--;
        if (this.selectItem < 0) {
            this.selectItem = 0;
            return this;
        }
        this.items[this.selectItem+1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },
});
