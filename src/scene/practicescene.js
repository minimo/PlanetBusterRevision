/*
 *  practicescene.js
 *  2016/08/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.PracticeScene", {
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
            title: "STAGE SELECT",
            item: ["", "test", "EXIT"],
            description: ["STAGE", "test", "EXIT"],
        };
        var selectorParam = {
            title: {
                x: -80,
                text: "",
            },
            x: 0,
            initial: 0,
            width: SC_W*0.3,
            item: ["1", "2", "3", "4", "5"],
            description: ["1", "2", "3", "4", "5"],
        };
        menuParam.item[0] = pbr.Selector(selectorParam);

        this.menu = pbr.MenuDialog(menuParam).addChildTo(this);
        this.menu.on('menuselect', function(e) {
            var sel = e.target.select;
            if (sel == 2) {
                this.menu.closeMenu();
                this.tweener.clear()
                    .wait(600)
                    .call(function(){
                        app.popScene();
                    });
            }
        }.bind(this));
    },
});

