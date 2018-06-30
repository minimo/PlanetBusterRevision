/*
 *  settingscene.js
 *  2016/04/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("SettingScene", {
    superClass: "phina.display.DisplayScene",

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

    init: function(menu) {
        this.superInit();

        var menuParam = {
            title: "SETTING",
            item: ["GAME", "SYSTEM", "test", "EXIT"],
            description: ["menu1", "menu2", "test", "exit"],
        };
        menuParam.item[2] = Selector();

        this.menu = MenuDialog(menuParam).addChildTo(this);
        this.menu.on('decision', function(e) {
            var sel = e.target.select;
            if (sel == 3) {
                this.menu.closeMenu();
                this.tweener.clear()
                    .wait(600)
                    .call(function(){
                        app.popScene();
                    });
            }
        }.bind(this));
        this.menu.on('cancel', function(e) {
            this.menu.closeMenu();
            this.tweener.clear()
                .wait(600)
                .call(function(){
                    app.popScene();
                });
        }.bind(this));
    },
});

