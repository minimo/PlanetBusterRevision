/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.enemyData = pbr.enemyData || [];

/*
 *  攻撃ヘリ「ホーネット」
 */
pbr.enemyData['Hornet'] = {
    //使用弾幕名
    danmakuName: ["Hornet1", "Hornet2", "Hornet3"],

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 30,

    //得点
    point: 300,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.roter = phina.display.Sprite("tex1", 32, 32).addChildTo(this);
        this.roter.index = 32;
        this.roter.setFrameIndex(32);

        this.vx = 0;
        this.vy = 0;

        //行動パターン分岐
        this.pattern = enterParam;
        switch (enterParam) {
            case 1:
                this.tweener.moveBy(0, 300, 120, "easeOutQuart")
                    .wait(60)
                    .moveBy(0, -300, 120)
                    .call(function(){this.remove();}.bind(this));
                break;
            case 2:
                this.moveTo(this.player, 5, true);
                break;
            case 3:
                this.tweener.moveBy(0, 200, 120, "easeOutQuart")
                    .wait(600)
                    .moveBy(0, -300, 120)
                    .call(function(){this.phase++;}.bind(this));
                this.startDanmaku(this.danmakuName[2]);
                break;
        }

        //ミサイル発射
        this.on('bulletmissile', function(e) {
            var en = this.parentScene.enterEnemy("Medusa", this.x, this.y); en.vx = -0.5; en.vy = -2.0;
            var en = this.parentScene.enterEnemy("Medusa", this.x, this.y); en.vx =  0.5; en.vy = -2.0;
        }.bind(this));
    },

    algorithm: function() {
        this.lookAt();
        if (this.time % 2 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }

        if (this.pattern == 2) {
            this.x += this.vx;
            this.y += this.vy;
        }

        if (this.pattern == 3) {
            if (this.phase == 1) {
                this.moveTo(this.parentScene.player, 5, true);
                this.phase++;
            }
            if (this.phase == 2) {
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        //画面下部では弾を出さない
        if (this.y > SC_H*0.7) this.stopDanmaku();

    },
};

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
pbr.enemyData['MudDauber'] = {
    //使用弾幕名
    danmakuName: "MudDauber",

    //当り判定サイズ
    width:  60,
    height: 26,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 64,
    texIndex: 6,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 114, 48).addChildTo(this);
        this.roter.setFrameTrimming(288, 128, 228, 96);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        this.vy = 5;
        this.tweener.to({vy: 0.5}, 120, "easeOutCubic").call(function(){this.phase++;}.bind(this));
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+6;
            this.body.setFrameIndex(this.index);
        }

        this.y+=this.vy;
        if (this.phase == 1) {
        }
    },
};

/*
 *  中型爆撃機「ビッグウィング」
 */
pbr.enemyData['BigWing'] = {
    //使用弾幕名
    danmakuName: "BigWing",

    //当り判定サイズ
    width:  80,
    height: 26,

    //耐久力
    def: 1000,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 48,
    texIndex: 2,

    setup: function() {
        this.index = this.texIndex;
        this.isCrashDown = true;
    },

    algorithm: function() {
        if (this.time % 2 == 0) this.y++;
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+2;
            this.body.setFrameIndex(this.index);
        }
    },
};

/*
 *  飛空挺「モーンブレイド」
 */
pbr.enemyData['MournBlade'] = {
    //使用弾幕名
    danmakuName: "MournBlade",

    //当り判定サイズ
    width:  128,
    height: 20,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 48, 104).addChildTo(this);
        this.roter.setFrameTrimming(96, 128, 192, 104);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        if (this.x < SC_W*0.5) {
            this.px = 1;
            this.tweener.moveBy( SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        } else {
            this.px = -1;
            this.tweener.moveBy(-SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        }
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2;
            this.body.setFrameIndex(this.index);
        }
        if (this.phase == 1) {
            this.y--;
            this.x+=this.px;
        }
    },
};

/*
 *  中型戦車「フラガラッハ」
 */
pbr.enemyData['Fragarach'] = {
    //使用弾幕名
    danmakuName: "Fragarach",

    //当り判定サイズ
    width:  48,
    height: 48,

    //耐久力
    def: 50,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_GROUND,

    //各種フラグ
    isGround: true,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.index = this.texIndex;
        this.phase = 0;

        //パラメータにより進行方向を決定
        this.param = param;
        this.speed = 0.5;
        this.direction = 0;
        switch (param) {
            case "c":
                this.direction = 0;
                break;
            case "b":
                this.direction = 180;
                break;
            case "l":
                this.direction = 90;
                break;
            case "r":
                this.direction = 270;
                break;
        }

        this.turret = phina.display.Sprite("tex1", 32, 32).addChildTo(this);
        this.turret.setFrameTrimming(192, 32, 32, 32);
        this.turret.setFrameIndex(0);
    },

    algorithm: function() {
        //砲台をターゲットの方向に向ける
        var ax = this.x - this.parentScene.player.x;
        var ay = this.y - this.parentScene.player.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.turret.rotation = deg + 90;

        if (this.time % 4 == 0) {
            this.index = (this.index+1)%4;
            this.body.setFrameIndex(this.index);
        }
        if (this.vx != 0 || this.vy != 0) {
            this.addSmokeSmall(1);
        }

        if (this.param == "l" && this.x > SC_W*0.4) {
            this.direction = 180;
        }
        if (this.param == "r" && this.x > SC_W*0.6) {
            this.direction = 180;
        }

        //移動処理
        this.rotation = this.direction;
        var rad = this.direction * toRad;
        this.vx = Math.sin(rad) * this.speed;
        this.vy = Math.cos(rad) * this.speed;
        this.x += this.vx;
        this.y += this.vy;
    },
};

/*
 *  浮遊砲台「ブリュナーク」（設置）
 */
pbr.enemyData['Brionac1'] = {
    //使用弾幕名
    danmakuName: ["Brionac1_1", "Brionac1_2", "Brionac_ground1_3"],

    //当り判定サイズ
    width:  40,
    height: 40,

    //耐久力
    def: 400,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 64,
    texTrimWidth: 48,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.isGround = true;

        this.vx = 0;
        this.vy = 0;

        //パラメータにより行動パターンを決定
        switch (param.pos) {
            case "center":
                break;
            case "left":
                this.vx = 4;
                break;
            case "right":
                this.vx = -4;
                break;
        }

        this.turret = phina.display.Sprite("tex2", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(64, 64, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, 0);
    },

    algorithm: function() {
        this.x += this.vx;
        this.y += this.vy;

        this.turret.rotation++;

        this.addSmokeSmall(1);
    },
};

/*
 *  大型ミサイル「ミスティルテイン」
 */
pbr.enemyData['Mistilteinn'] = {
    //使用弾幕名
    danmakuName: "basic",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;
        this.setFrameTrimming(0, 128, 96, 104);
    },

    algorithm: function() {
    },
};

/*
 *  中型輸送機「トイボックス」
 */
pbr.enemyData['ToyBox'] = {
    //使用弾幕名
    danmakuName: "ToyBox",

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 500,

    //得点
    point: 5000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 64,
    texHeight: 128,
    texIndex: 2,

    //投下アイテム種類
    kind: 0,

    setup: function(enterParam) {
        if (enterParam == "power") this.kind = ITEM_POWER;
        if (enterParam == "bomb") this.kind = ITEM_BOMB;
        if (enterParam == "1UP") this.kind = ITEM_1UP;
        this.tweener.clear().moveBy(0, SC_H*0.5, 300).wait(480).moveBy(0, -SC_H, 600);

        var that = this;
        this.turret = phina.display.Sprite("tex1", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(196, 32, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, -36);
        this.turret.update = function() {
            this.lookAt({
                x: that.x-that.player.x,
                y: that.y-that.player.y,
            });
        }
    },

    epuipment: function() {
    },

    algorithm: function() {
    },

    dead: function() {
        //破壊時アイテムをシーンに投入
        this.turret = pbr.Enemy("Item", this.x, this.y, 0, {kind: 0}).addChildTo(this.parentScene);

        //通常の破壊処理
        this.defaultDead();
    },
}

/*
 *  アイテム
 */
pbr.enemyData['Item'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 1,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_ITEM,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,
    texTrimX: 0,
    texTrimY: 96,
    texTrimWidth: 96,
    texTrimHeight: 32,

    //投下アイテム区分
    kind: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.reset = true;
        this.count = 0;

        this.kind = enterParam.kind;
        this.frameIndex = this.kind;

        this.setScale(1.5);
     },

    epuipment: function() {
    },

    algorithm: function() {
        if (this.reset) {
            this.reset = false;
            this.count++;
            if (this.count < 5) {
                var px = Math.randint(0, SC_W);
                var py = Math.randint(SC_H*0.3, SC_W*0.9);
                this.tweener.clear()
                    .to({x: px, y: py}, 180, "easeInOutSine")
                    .wait(30)
                    .call(function() {
                        this.reset = true;
                    }.bind(this));
            } else {
                this.tweener.clear().to({x: this.x, y: SC_H*1.1}, 180, "easeInOutSine");
            }
       }
    },
}

/*
 *  誘導弾「メドゥーサ」
 */
pbr.enemyData['Medusa'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  8,
    height: 8,

    //耐久力
    def: 10,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 8,
    texHeight: 24,
    texIndex: 0,
    texTrimX: 192,
    texTrimY: 64,
    texTrimWidth: 8,
    texTrimHeight: 24,

    setup: function(enterParam) {
        this.body.setOrigin(0.5, 0.0);

        //一定時間ごとに煙だすよ
        this.tweener.clear()
            .wait(5)
            .call(function() {
                this.parentScene.effectLayerMiddle.enterSmokeSmall({
                    position: {x: this.x, y: this.y},
                    velocity: {x: 0, y: 0, decay: 1},
                    delay: 0
                });
            }.bind(this))
            .setLoop(true);

        //自動追尾設定
        this.isHoming = true;

        //移動情報
        this.vx = 0;
        this.vy = 0;
        this.spd = 0.05;
        this.maxSpeed = 3;
    },

    algorithm: function() {

        if (this.isHoming) {
            this.lookAt();
            var rad = (this.rotation+90)*toRad
            this.vx += Math.cos(rad)*this.spd;
            this.vy += Math.sin(rad)*this.spd;
        } else {
            this.lookAt({x: this.x+this.vx, y: this.y+this.vy});
        }
        this.x += this.vx;
        this.y += this.vy;
    },
}
