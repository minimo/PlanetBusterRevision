/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("phinaApp.MainScene", {
    superClass: 'phina.display.CanvasScene',

    _member: {
        //エンドレスモード
        endless: false,
    
        //ゲーム内情報
        score: 0,   //スコア
        life: 3,    //ライフ
        passPanel: 0,       //ステージ内通過パネル
        passPanelTotal: 0,  //通過パネル総計
    
        //現在ステージデータ
        stageNumber: 1,
        stageData: null,
        retryStage: false,

        //スタート＆ゴールパネル座標
        startX: 0,
        startY: 0,
        goalX: 0,
        goalY: 0,
        startPattern: 0,

        //状態フラグ
        ready: true,   //準備ＯＫ
        start: false,   //ゲームスタート
        stop: false,

        //１つのパネルを通る時間（milli second)
        speed: 2000,

        //パネル配列
        panels: null,
    
        //選択中パネル
        selectPanel: null,
    
        //タッチ情報
        moveX: 0,
        moveY: 0,
        beforeX: 0,
        beforeY: 0,
        offsetX: 0,
        offsetY: 0,

        //再生中BGM
        bgm: null,

        //経過時間
        time: 0,

        labelParam: {
            fill: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 3,

            fontFamily: "KS-Kohichi",
            align: "center",
            baseline: "middle",
            fontSize: 20
        },
        scorelabelParam: {
            fill: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 3,

            fontFamily: "KS-Kohichi",
            align: "center",
            baseline: "middle",
            fontSize: 20,
            align: "left",
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //レイヤー準備
        this.lowerLayer = phina.display.CanvasElement().addChildTo(this);
        this.panelLayer = phina.display.CanvasElement().addChildTo(this);
        this.playerLayer = phina.display.CanvasElement().addChildTo(this);
        this.itemLayer = phina.display.CanvasElement().addChildTo(this);

        //プレイヤー準備        
        this.player = phinaApp.Player()
            .addChildTo(this.playerLayer)
            .setPosition(PN_OFFX, PN_OFFY);
        this.player.visible = false;

        //スコア表示
        var that = this;
        var lb = this.scoreLabel = phina.display.Label("得点:", this.scorelabelParam)
            .addChildTo(this)
            .setPosition(8, 32);
        lb.update = function() {
            this.text = "得点:"+that.score;
        }

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
    },
    
    update: function(app) {
        if (this.ready) {
            //パネル初期化
            this.initStage();
            this.ready = false;
            this.start = false;
            this.stop = false;

            this.mask.tweener.clear().to({alpha: 0},300);
        }
        if (!this.start || this.stop) return;

        this.tickPlayer();
        this.tickPanel();

        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.selectPanel) {
            var p = this.selectPanel;
            p.select = false;
            p.reverse();
            this.selectPanel = null;
        }

        //ステージデータコピー
        this.stageData = phinaApp.stageData[this.stageNumber-1];

        if (!this.retryStage) {
            app.playBGM("bgm"+this.stageNumber);
//            app.pushScene(phinaApp.TutorialScene(this.stageNumber));
        }

        //通過パネル数初期化
        this.passPanel = 0;

        //パネル全消去
        if (this.panels) {
            for (var i in this.panels) {
                if (this.panels[i].item) this.panels[i].item.remove();
                this.panels[i].remove();
            }
        }

        //マップ構築
        this.panels = [];
        for (var y = 0; y < MAP_H; y++){
            for (var x = 0; x < MAP_W; x++){
                var ptn = this.stageData.map[y][x];
                var p = this.addPanel(x, y, ptn);
                //スタート位置
                if (7 < ptn && ptn < 12) {
                    this.startX = x;
                    this.startY = y;
                    this.startPattern = p.pattern;
                }
                //ゴール位置
                if (11 < ptn && ptn < 16) {
                    this.goalX = x;
                    this.goalY = y;
                }
                this.panels.push(p);

                //アイテム追加
                var item = this.stageData.item[y][x];
                if (item != 0) p.shuffle = false;
                if (item > 0) {
                    this.addItem(x, y, item);
                    p.onItem = true;
                }
            }
        }

        //パネルシャッフル
        for (var i = 0; i < rand(15, 20); i++){
            var a = rand(0, this.panels.length-1);
            var b = rand(0, this.panels.length-1);
            var p1 = this.panels[a];
            var p2 = this.panels[b];
            if (a == b || !p1.shuffle || !p2.shuffle) {i--; continue;}
            var tx = p1.mapX, ty = p1.mapY;
            p1.move(p2.mapX, p2.mapY);
            p2.move(tx, ty);
        }

        //プレイヤー初期化
        var sx = PN_OFFX+this.startX*PN_W;
        var sy = PN_OFFY+this.startY*PN_H;
        if (this.startPattern == 10) {
            this.player.scaleX = 1;
        } else {
            this.player.scaleX = -1;
        }
        this.player.setPosition(sx, sy);
        this.player.bx = this.player.x;
        this.player.by = this.player.y;
        this.player.startup();

        //スタート演出初期化
        //ステージ開始時演出用
        this.egg = phinaApp.Egg()
            .setPosition(sx, sy)
            .addChildTo(this.playerLayer);
        this.egg.player = this.player;
        this.egg.scaleX = -1;

        //ゴール準備
        if (!this.endless) {
            var gx = PN_OFFX+this.goalX*PN_W;
            var gy = PN_OFFY+this.goalY*PN_H;
        }

        //スタートメッセージ
        var that = this;
        var param = {
            color: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 5,

            fontFamily: "KS-Kohichi",
            align: "center",
            baseline: "middle",
            fontSize: 60,
        };
        var lb = phina.display.Label("３", param).addChildTo(this);
        lb.setPosition(SC_W/2, -SC_H/2);
        lb.tweener.clear().wait(600)
            .call(function(){lb.text = "３";}).to({x: SC_W/2, y: -SC_H/2, alpha:1}, 1).to({x: SC_W/2, y: SC_H/2}, 600, "easeOutBounce").wait(100).to({alpha:0}, 100)
            .call(function(){lb.text = "２";}).to({x: SC_W/2, y: -SC_H/2, alpha:1}, 1).to({x: SC_W/2, y: SC_H/2}, 600, "easeOutBounce").wait(100).to({alpha:0}, 100)
            .call(function(){lb.text = "１";}).to({x: SC_W/2, y: -SC_H/2, alpha:1}, 1).to({x: SC_W/2, y: SC_H/2}, 600, "easeOutBounce").wait(100).to({alpha:0}, 100)
            .call(function(){lb.text = "スタート！";}).to({x: SC_W/2, y: -SC_H/2, alpha:1}, 1).to({x: SC_W/2, y: SC_H/2}, 600, "easeOutBounce").wait(100).to({alpha:0}, 100)
            .call(function(){that.start = true;})
            .wait(200)
            .to({x: SC_W/2, y: SC_H/2}, 500, "easeOutQuint").to({alpha:0}, 200).call(function(){lb.remove();});
    },

    //ステージ再スタート
    restartStage: function() {
        //フラグ初期化
        this.ready = true;
        this.start = false;
    },

    //パネル追加
    addPanel: function(x, y, ptn) {
        if (this.checkMapPanel(x, y)) return null;

        var p = phinaApp.Panel().addChildTo(this.panelLayer);
        p.x = x*PN_W+PN_OFFX;
        p.y = y*PN_H+PN_OFFY;
        p.mapX = x;
        p.mapY = y;
        p.scene = this;
        p.pattern = ptn;

        return p;
    },

    //アイテム追加
    addItem: function(x, y, ptn) {
        ptn = ptn | 0;
        var p = this.checkMapPanel(x, y);
        if (p == null || p.item != null) return null;
        p.item = phinaApp.Item(p, ptn).addChildTo(this.itemLayer);
    },

    //スクリーン座標上のパネル判定
    checkScreenPanel: function(x, y) {
        var len = this.panels.length;
        for (var i = 0; i< len; i++) {
            var p = this.panels[i];
            if (p.disable)continue;
            var px = p.x-PN_W_HALF;
            var py = p.y-PN_H_HALF;
            if (px < x && x < px+PN_W && py < y && y < py+PN_H) return p;
        }
        return null;
    },

    //マップ座標上のパネル判定
    checkMapPanel: function(x, y) {
        var len = this.panels.length;
        for (var i = 0; i< len; i++) {
            var p = this.panels[i];
            if (p.select)continue;
            if (p.mapX == x && p.mapY == y) return p;
        }
        return null;
    },

    //マップ座標上のパネル取得
    getMapPanel: function(x, y) {
        var len = this.panels.length;
        for (var i = 0; i< len; i++) {
            var p = this.panels[i];
            if (p.mapX == x && p.mapY == y) return p;
        }
        return null;
    },

    //マップ上イベントチェック（アイテム取得等）
    checkMapEvent: function(x, y) {
        var p = this.getMapPanel(x, y);
        if (p == null) return;
        if (p.item == null)return;

        var kind = p.item.kind;
        var point = 0;
        switch (kind) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                point = 500;
                break;
            case 6:
                point = 1000;
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
            default:
                point = 0;
                break;
        }

        if (point > 0) {
            this.score += point;
            var lb = phina.display.Label(""+point, this.labelParam).addChildTo(this.itemLayer);
            lb.setPosition(p.x, p.y-30);
            lb.fontFamily = "KS-Kohichi";
            lb.align     = "center";
            lb.baseline  = "middle";
            lb.fontSize = 20;
            lb.outlineWidth = 2;
            lb.tweener.moveBy(0,-30, 1500,"easeOutQuad").fadeOut(500).call(function(){lb.remove();});
        }

        //パネル上アイテム削除
        p.onItem = false;
        p.item.ok = false;
        p.item.remove();
        p.item = null;
    },

    //プレイヤー処理（パネル＆アイテム）
    tickPlayer: function() {
        var miss = false, goal = false;
        var that = this;
        var player = this.player;
        var passPanel = null;
        var px = ~~((player.x-PN_OFFX+PN_W/2)/PN_W), py = ~~((player.y-PN_OFFY+PN_H/2)/PN_H);
        if (player.x-PN_OFFX+PN_W/2 < 0 || player.y-PN_OFFY+PN_H/2 < 0)miss = true;
        if (player.mapX != px || player.mapY != py) {
            var p = this.checkMapPanel(px, py);
            if (p) {
                passPanel = player.onPanel;
                p.onPlayer = true;
                p.inX = vx;
                p.inY = vy;
                player.onPanel = p;
                var vx = px-player.mapX;
                var vy = py-player.mapY;
                var dis = PN_SIZE;
                var spd = this.speed;
                player.tweener.call(function(){that.checkMapEvent(px, py);});
                switch (p.pattern) {
                    case 1: //横
                        if (vx != 0) {
                            player.tweener.moveBy(dis*vx, 0, spd);
                        } else {
                            miss = true;
                        }
                        break;
                    case 2: //縦
                        if (vy != 0) {
                            player.tweener.moveBy(0, dis*vy, spd);
                        } else {
                            miss = true;
                        }
                        break;
                    case 3: //十字
                        if (vx != 0) {
                            player.tweener.moveBy(dis*vx, 0, spd);
                        } else {
                            player.tweener.moveBy(0, dis*vy, spd);
                        }
                        break;
                    case 4: //右－下
                        if (vx == -1) {
                            //右から進入
                            player.tweener.moveBy(0, dis, spd);
                        } else if (vy == -1) {
                            //下から進入
                            player.tweener.moveBy(dis, 0, spd);
                        } else {
                            miss = true;
                        }
                        break;
                    case 5: //左－下
                        if (vx == 1) {
                            //左から進入
                            player.tweener.moveBy(0, dis, spd);
                        } else if (vy == -1) {
                            //下から進入
                            player.tweener.moveBy(-dis, 0, spd);
                        } else {
                            miss = true;
                        }
                        break;
                    case 6: //右－上
                        if (vx == -1) {
                            //右から進入
                            player.tweener.moveBy(0, -dis, spd);
                        } else if (vy == 1) {
                            //上から進入
                            player.tweener.moveBy(dis, 0, spd);
                        } else {
                            miss = true;
                        }
                        break;
                    case 7: //左－下
                        if (vx == 1) {
                            //左から進入
                            player.tweener.moveBy(0, -dis, spd);
                        } else if (vy == 1) {
                            //上から進入
                            player.tweener.moveBy(-dis, 0, spd);
                        } else {
                            miss = true;
                        }
                        break;

                    //スタート地点用パネル
                    case 8:
                        player.tweener.clear().moveBy(dis, 0, spd)
                        break;
                    case 9:
                        player.tweener.clear().moveBy(0, dis, spd);
                        break;
                    case 10:
                        player.tweener.clear().moveBy(-dis, 0, spd);
                        break;
                    case 11:
                        player.tweener.clear().moveBy(0, -dis, spd);
                        break;

                    //ゴール地点用パネル
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        goal = true;
                        break;
                }
                player.mapX = px;
                player.mapY = py;
            } else {
                miss = true;
            }
        }

        //ミス！！
        if (miss) {
            player.action("miss");
            this.stop = true;
            var that = this;
            var lb = phina.display.Label("ミス！！", this.labelParam)
                .addChildTo(this)
                .setPosition(SC_W/2, -SC_H/2);
            lb.tweener.clear()
                .moveTo(SC_W/2, SC_H/2, 1000, "easeOutBounce")
                .wait(1000)
                .fadeOut(100)
                .call(function(){lb.remove();});
            this.mask.tweener.clear()
                .wait(3000)
                .fadeIn(500)
                .wait(1000)
                .call(function(){that.restartStage();});
            app.playSE("miss");
            this.retryStage = true;
        } else {
            if (passPanel) passPanel.onPlayer = false;
        }

        //ゴール！
        if (goal) {
            player.action("goal");
            this.stop = true;
            var that = this;
            var lb = phina.display.Label("ゴール！！", this.labelParam)
                .addChildTo(this)
                .setPosition(SC_W/2, -SC_H/2);
            lb.tweener.clear()
                .move(SC_W/2, SC_H/2, 4000, "easeOutBounce")
                .wait(1000)
                .fadeOut(100)
                .call(function(){lb.remove();});
            this.mask.tweener.clear()
                .wait(7000)
                .fadeIn(500)
                .wait(1000)
                .call(function(){that.restartStage();});
            this.stageNumber++;
            this.retryStage = false;
        }
    },

    //パネル処理
    tickPanel: function() {
        for (var i = 0; i< this.panels.length; i++) {
            var p = this.panels[i];
            if (p.dropped) {
                this.panels.splice(i,1);
            }
        }
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
        var sx = this.moveX = this.beforeX = e.pointer.x;
        var sy = this.moveY = this.beforeY = e.pointer.y;

        var p = this.checkScreenPanel(sx, sy);
        if (p) {
            p.select = true;
            p.tweener.clear().to({scaleX: 0.9, scaleY: 0.9}, 100);
            p.remove().addChildTo(this.panelLayer); //一番手前に持ってくる
            this.selectPanel = p;
            
            //パネルの座標とタッチ座標のオフセットを計算
            this.offsetX = sx-p.x;
            this.offsetY = sy-p.y;
        }
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
        var sx = this.moveX = e.pointer.x;
        var sy = this.moveY = e.pointer.y;
        if (this.selectPanel) {
            var p = this.selectPanel;
            //パネルが領域外に行かない様に制限
            p.x = clamp(sx-this.offsetX, PN_OFFX, PN_OFFX+PN_W*(MAP_W-1));
            p.y = clamp(sy-this.offsetY, PN_OFFY, PN_OFFY+PN_H*(MAP_H-1));

            //選択中パネルの位置に他のパネルが合ったら場所を交換
            var mx = clamp(~~((p.x-PN_OFFX+PN_W_HALF)/PN_W), 0, MAP_W-1);
            var my = clamp(~~((p.y-PN_OFFY+PN_H_HALF)/PN_H), 0, MAP_H-1);
            if (p.mapX != mx || p.mapY != my) {
                var mp = this.checkMapPanel(mx, my);
                if (mp && !mp.disable) {
                    //行き先にパネルが無ければ移動
                    var fp = this.checkMapPanel(p.mapX, p.MapY);
                    if (!fp) mp.move(p.mapX, p.mapY);
                    p.mapX = mx;
                    p.mapY = my;
                }
                if (mp == null) {
                    p.mapX = mx;
                    p.mapY = my;
                }
            }
        }
        this.beforeX = sx;
        this.beforeY = sy;
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        if (this.selectPanel) {
            var p = this.selectPanel;
            p.select = false;
            p.reverse();
            this.selectPanel = null;
        }
    },
});
