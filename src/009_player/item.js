/*
 *  Item.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテム
phina.define("Item", {
    superClass: "phina.display.Sprite",
    layer: LAYER_PLAYER,

    //アイテム種類
    //0: パワーアップ
    //1: ボム
    //2: １ＵＰ
    //3: 得点
    id: 0,

    //パワーアップタイプ
    type: 0,

    active: false,

    init: function(id) {
        this.superInit("tex1", 32, 32);
        this.id = id;
        this.setFrameTrimming(0, 97, 96, 32);
        this.setFrameIndex(id);
        this.setScale(2.0);

        //当り判定設定
        this.boundingType = "rect";

        this.phase = 0;
        this.count = 0;
        this.time = 1;
    },

    update: function(app) {
        //自機との当り判定チェック
        var player = app.currentScene.player;
        if (this.isHitElement(player)) {
            player.getItem(this.id, this.type);
            this.remove();
            return;
        }

        //移動パターン
        if (this.phase == 0) {
            this.y++;
            if (this.y > SC_H-32) {
                this.phase++;
            }
        } else if (this.phase == 1) {
            var x = rand(SC_W*0.2, SC_W*0.8);
            var y = rand(SC_H*0.2, SC_W*0.9);
            this.tweener.clear()
                .move(x, y, 3000, "easeInOutSine")
                .call(function() {
                    this.count++;
                    if (this.count < 3) {
                        this.phase = 1;
                    } else {
                        this.phase = 3;
                    }
                }.bind(this));
            this.phase++;
        } else if (this.phase == 3) {
            this.y += 2;
        }

        this.time++;
    },
});
