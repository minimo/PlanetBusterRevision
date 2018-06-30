/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//テスト用ステージ
phina.define("Stage9", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage9", true);
        });

//        this.add( 180, "Raven");
        this.add( 180, function() {
//            this.event["boss_shadow"].value.call();
           this.event["Garuda"].value.call();
        }.bind(this));


        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(2.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //ボス登場演出
        this.addEvent("Garuda", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*0.5, SC_H*0.4);
            shadow.layer = LAYER_SHADOW;
            shadow.alpha = 0.0;
            shadow.time = 0;
            shadow.addChildTo(app.currentScene);

            var that = this;
            shadow.tweener.setUpdateType('fps').clear()
                .to({alpha: 0.4, y: SC_H*0.2}, 300, "easeOutSine")
                .wait(120)
                .call(function() {
                    that.parentScene.enterEnemyUnit("Garuda");
                })
                .wait(120)
                .call(function() {
                    this.remove();
                }.bind(shadow));

            shadow.update = function() {
                this.time++;
                if (this.time < 300) return; 

                //煙もくもくー
                var x1 = this.x;
                var y1 = this.y-10;
                var x2 = this.x+148;
                var y2 = this.y+40;
                var vy = this.parentScene.ground.deltaY;
                for (var r = 0; r < 2; r++) {
                    if (r == 1) x2 = this.x-148;
                    for (var i = 0; i < 3; i++) {
                        var p = Math.randfloat(0, 1.0);
                        var px = Math.floor(x1*p+x2*(1-p));
                        var py = Math.floor(y1*p+y2*(1-p))-32;
                        var layer = this.parentScene.effectLayerUpper;
                        layer.enterSmokeLarge({
                            position: {x: px, y: py},
                            velocity: {x: 0, y: vy+Math.randint(0, 3), decay: 1.01},
                            delay: rand(0, 2)
                        });
                    }
                }
            }
        }.bind(this));

        //WARNING
        this.addEvent("warning", function() {
            this.enterWarning();
        });
    },
});

//ステージ１地形管理
phina.define("Stage9Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1",
            type: "tmx",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
//        this.mapBase.x = -w*0.5;
//        this.mapBase.y = -h*0.5;
        this.mapBase.x = 0;
        this.mapBase.y = -2000*32+SC_H;
    },
});

})();
