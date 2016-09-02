/*
 *  EnemyDataBoss.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.enemyData = pbr.enemyData || [];

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
pbr.enemyData['ThorHammer'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammer",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.isGround = true;
        this.stopDanmaku();

        //初速
        this.vy = -8;
    },

    epuipment: function() {
        //砲台設置
        this.turret = pbr.Enemy("ThorHammerTurret")
            .addChildTo(this.parentScene)
            .setParentEnemy(this)
            .setPosition(0, 0);
    },

    algorithm: function() {
        if (this.phase == 0) {
            if (this.y < -SC_H*0.5) {
                this.phase++;
                this.vy = -5;
                this.isCollision = true;
                this.isMuteki = false;
                this.tweener.clear()
                    .to({vy: -10}, 240)
                    .call(function(){
                        this.phase++;
                        this.resumeDanmaku();
                    }.bind(this));
            }
        }
        if (this.phase == 2) {
            this.turret.flare('startfire');
            this.phase++;
        }

        //土煙出すよ
        if (!this.isDead) {
            var vy = this.parentScene.ground.deltaY;
            for (var i = 0; i < 3; i++) {
                var layer = this.parentScene.effectLayerLower;
                layer.enterSmoke({
                    position: {x: this.x-32+rand(0,64), y: this.y},
                    velocity: {x: 0, y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //タイムアップで逃走（１７秒）
        if (!this.isDead && this.time == 1020) {
            this.tweener.clear()
                .to({vy: -15}, 120, "easeInSine")
                .call(function(){
                    this.parentScene.flare('end_boss');
                }.bind(this))
                .wait(60)
                .call(function(){
                    this.remove();
                }.bind(this));
        }
        this.y += this.vy;
//        this.y -= this.parentScene.ground.deltaY;
    },

    dead: function() {
        this.turret.dead();
        this.turret.remove();
        this.texIndex++;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .to({vy: -8}, 180, "easeInSine")
            .call(function() {
                this.explode();
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
    },
};

//砲台
pbr.enemyData['ThorHammerTurret'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammerTurret",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 500,

    //得点
    point: 0,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 416,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 32,
    texIndex: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.isMuteki = true;
        this.stopDanmaku();

        this.on('startfire', function(e) {
            this.resumeDanmaku();
        }.bind(this))
    },

    algorithm: function() {
        this.x = this.parentEnemy.x;
        this.y = this.parentEnemy.y-40;
        this.lookAt();
    },
};

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
//本体
pbr.enemyData['Golyat'] = {
    //使用弾幕パターン
    danmakuName: ["Golyat1_1", "Golyat1_2", "Golyat1_3", "Golyat2"],

    //当り判定サイズ
    width:  52,
    height: 60,

    //耐久力
    def: 5000,

    //得点
    point: 300000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 184,
    texTrimX: 258,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;
        this.isHover = true;
        this.isSmoke = true;

        //発狂モードフラグ
        this.isStampede = false;

        this.stopDanmaku();

        var that = this;

        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 64, 80)
            .addChildTo(this)
            .setFrameTrimming(382, 0, 64, 80)
            .setFrameIndex(0)
            .setPosition(-2, -18);
        this.cover.texColor = "";
        this.cover.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.image = phina.asset.AssetManager.get("image", "tex_boss1"+that.texColor);
                this.texColor = that.texColor;
            }
        };

        this.core = phina.display.Sprite("tex_boss1", 16, 16)
            .addChildTo(this)
            .setFrameTrimming(384, 96, 64, 16)
            .setFrameIndex(0)
            .setPosition(0, -8);
        this.core.texColor = "";
        this.core.idx = 0;
        this.core.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.image = phina.asset.AssetManager.get("image", "tex_boss1"+that.texColor);
                this.texColor = that.texColor;
            }
            this.frameIndex = this.idx | 0;
        };
        this.core.tweener.clear().setUpdateType("fps");

        this.on('bulletstart', function(e) {
            this.core.tweener.clear().to({idx: 3}, 15);
        }.bind(this));
        this.on('bulletend', function(e) {
            this.core.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            //アーム側弾幕設定切替
            this.armL.startDanmaku(this.armL.danmakuName[this.danmakuNumber]);
            this.armR.startDanmaku(this.armR.danmakuName[this.danmakuNumber]);
        });

        //アームベース左
        this.armbaseL = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(192, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(-64, 0);

        //アームベース右
        this.armbaseR = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(310, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(64, 0);

        //登場パターン
        this.tweener.clear()
            .moveTo(SC_W*0.5, SC_H*0.3, 300, "easeOutSine")
            .call(function(){
                this.phase++;
                this.resumeDanmaku();
            }.bind(this));
    },

    epuipment: function() {
        var ps = this.parentScene;
        //アーム左
        this.armL = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armL.$extend({
            base: this.armbaseL,
            offsetX: -57,
            offsetY: 0,
        });
        //アーム右
        this.armR = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armR.$extend({
            base: this.armbaseR,
            offsetX: 57,
            offsetY: 0,
        });

        //アーム差動用
        this.armL.vibX = 0;
        this.armL.vibY = 0;
        this.armR.vibX = 0;
        this.armR.vibY = 0;

        this.rad = Math.PI*0.5;
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;

            this.phase++;
            this.resumeDanmaku();

            this.armL.flare('startfire');
            this.armR.flare('startfire');
        }

        if (this.phase == 2) {
            this.x = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
//            this.y = Math.sin(this.rad*2)/2;
            this.rad -= 0.01
        }

        if (this.phase == 3) {
            this.tweener.to({x: SC_W*0.5}, 180, "easeInOutSine");
            this.phase++;
        }

        //土煙出すよ
        if (!this.isDead && this.isSmoke) {
            var vy = this.parentScene.ground.deltaY;
            var rad = this.rotation*toRad;
            for (var i = 0; i < 5; i++) {
                var layer = this.parentScene.effectLayerLower;

                var x = -76+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });

                var x = 40+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }
    },

    //アーム破壊
    deadChild: function(child) {
        this.phase = 9;
        this.isCollision = false;

        this.stopDanmaku();
        this.armL.stopDanmaku();
        this.armR.stopDanmaku();

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 60;

        var bx = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
        var by = this.y;
        var rot = child == this.armL? 20: -20;
        var ax = child == this.armL? 30: -30;
        this.tweener.clear()
            .to({x: this.x+ax, rotation: rot}, 30, "easeInOutSine")
            .wait(60)
            .to({x: bx, y: by, rotation: 0}, 180, "easeInOutSine")
            .call(function() {
                this.phase = 2;
                this.isCollision = true;

                this.resumeDanmaku();
                this.armL.resumeDanmaku();
                this.armR.resumeDanmaku();
            }.bind(this));

        this.parentScene.ground.tweener.clear()
            .to({speed: -1.0}, 30, "easeInOutCubic")
            .wait(90)
            .to({speed: -7.0}, 60, "easeInOutCubic");

        //発狂モード移行
        if (this.armL.def == 0 && this.armR.def == 0) {
            this.isStampede = true;
            this.startDanmaku[this.danmakuName[3]];
            this.phase++;
        }
    },
};

//アーム
pbr.enemyData['GolyatArm'] = {
    //使用弾幕パターン
    danmakuName: ["GolyatArm1", "GolyatArm2", "GolyatArm3"],

    //当り判定サイズ
    width:  56,
    height: 200,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 200,
    texTrimX: 450,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 200,
    texIndex: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.isGround = true;
        this.stopDanmaku();

        this.turret1 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.turret1.idx = 0;
        this.turret1.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret1.tweener.clear().setUpdateType("fps");

        this.turret2 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, -32);
        this.turret2.idx = 0;
        this.turret2.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret2.tweener.clear().setUpdateType("fps");

        //砲台の開閉
        this.on('bulletstart1', function(e) {
            this.turret1.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend1', function(e) {
            this.turret1.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        this.on('bulletstart2', function(e) {
            this.turret2.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend2', function(e) {
            this.turret2.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //BulletML始動
        this.on('startfire', function() {
            this.resumeDanmaku();
        }.bind(this));

        //誘導弾発射
        this.on('bulletmissile1', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity(-0.5,  -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity(-0.25, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.25, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.5,  -1.0);
        }.bind(this));
        this.on('bulletmissile2', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity(-0.5,  -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity(-0.25, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.25, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.5,  -1.0);
        }.bind(this));
    },

    algorithm: function() {
        this.rotation = this.parentEnemy.rotation;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        if (this.rotation != 0) {
            var rad = this.rotation*toRad;
            offsetX = Math.cos(rad)*this.offsetX-Math.sin(rad)*this.offsetY;
            offsetY = Math.sin(rad)*this.offsetX+Math.cos(rad)*this.offsetY;
        }
        this.x = this.parentEnemy.x+offsetX;
        this.y = this.parentEnemy.y+offsetY;

        //判定有無は親にあわせる
        this.isCollision = this.parentEnemy.isCollision;
    },
};

/*
 *
 *  ２面中ボス
 *  「モーンブレイド」
 *
 */

/*
 *
 *  ２面ボス
 *  空中空母「ストームブリンガー」
 *
 */


/*
 *
 *  ３面中ボス  
 *  大型爆撃機「レイブン」
 *
 */

/*
 *
 *  ３面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */

/*
 *
 *  ４面中ボス
 *
 */

/*
 *
 *  ４面ボス
 *
 */

