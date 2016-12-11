/*
 *  Application.js
 *  2015/09/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespace pbr(PlanetBusterRevision)
pbr = {};

phina.define("pbr.Application", {
    superClass: "phina.display.CanvasApp",

	_static: {
        version: "0.0.1",
        stageName: {
            1: "Operation PLANET_BUSTER",
            2: "Dance in the Sky",
        },
        assets: {
            "preload": {
                sound: {
                    "start":         "assets/sounds/soundlogo40.mp3",
                    "setting":       "assets/sounds/receipt05.mp3",
                    "warning":       "assets/sounds/bgm_warning.mp3",
                    "powerup":       "assets/sounds/ta_ta_suraido01.mp3",
                    "explodeSmall":  "assets/sounds/sen_ge_taihou03.mp3", 
                    "explodeLarge":  "assets/sounds/sen_ge_hasai01.mp3", 
                    "explodeBoss":   "assets/sounds/se_maoudamashii_explosion02.mp3",
                    "explodePlayer": "assets/sounds/ta_ta_zuban_d01.mp3", 
                    "bomb":          "assets/sounds/bomb.mp3",
                    "playermiss":    "assets/sounds/ta_ta_zuban_d01.mp3",
                    "stageclear":    "assets/sounds/bgm_stageclear.mp3",
                    "gameover":      "assets/sounds/soundlogo9.mp3",
                    "cancel":        "assets/sounds/se_maoudamashii_system20.mp3",
                    "select":        "assets/sounds/se_maoudamashii_system36.mp3",
                    "click":         "assets/sounds/se_maoudamashii_system26.mp3",
                    "click2":        "assets/sounds/click2.mp3",
                    "boss":          "assets/sounds/bgm_maoudamashii_neorock10.mp3",
                },
                font: {
                    "UbuntuMono":   "fonts/UbuntuMono-Bold.ttf",
                    "Orbitron":     "fonts/Orbitron-Regular.ttf",
                }
            },
            "common": {
                image: {
                    "tex1":     "assets/images/tex1.png",
                    "tex2":     "assets/images/tex2.png",
                    "tex_boss1":"assets/images/tex_boss1.png",
                    "bullet":   "assets/images/bullet.png",
                    "gunship":  "assets/images/gunship1.png",
                    "bit":      "assets/images/bit1.png",                    
                    "shot":     "assets/images/shot.png",
                    "effect":   "assets/images/effect.png",
                    "bomb":     "assets/images/bomb.png",
                    "particle": "assets/images/particle.png",
                    "map1g":    "assets/maps/map1.png",
                },
            },
            "stage1": {
                sound: {
                    "stage1":        "assets/sounds/expsy.mp3",
                },
            },
            "stage2": {
                sound: {
                    "stage2":        "assets/sounds/dance_in_the_sky.mp3",
                },
            },
            "stage9": {
                sound: {
                    "stage9":        "assets/sounds/departure.mp3",
                },
                tmx: {
                    "map1":          "assets/maps/map1.tmx",
                    "map1_enemy":    "assets/maps/map1_enemy.tmx",
                },
            },
        },
    },

    _member: {
        //ゲーム内情報
        difficulty: 1,  //難易度
        score: 0,       //スコア
        rank: 1,        //難易度ランク
        numContinue: 0, //コンティニュー回数

        //エクステンド設定
        extendScore: [500000, 2000000, 5000000],
        extendAdvance: 0,
        isExtendEvery: false,
        extendEveryScore: 500000,

        //プレイヤー設定
        setting: {
            zanki: 3,       //残機
            bombStock: 2,   //ボム残数
            bombStockMax: 2,//ボム最大数
            autoBomb: false,//オートボムフラグ
        },

        //デフォルト設定
        _defaultSetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,

            //エクステンド設定
            extendScore: [500000, 2000000, 5000000],
            isExtendEvery: false,
            extendEveryScore: 500000,
        },

        //現在設定
        currentrySetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,
        },

        //ＢＧＭ＆効果音
        soundset: null,

        //バックグラウンドカラー
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
        });
        this.$extend(this._member);

        this.fps = 60;
/*
        this.canvas.context.imageSmoothingEnabled = true;
        this.domElement.style.imageRendering = "pixelated";
*/
        //設定情報の読み込み
        this.loadConfig();

        //ＢＧＭ＆ＳＥ
        this.soundset = phina.extension.SoundSet();

        //ゲームパッドを使用する
        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.updateController();
        });

        this.replaceScene(pbr.SceneFlow());
    },

    //コントローラー情報の更新
    updateController: function() {
        var gp = this.gamepad;
        var kb = this.keyboard;
        var angle1 = gp.getKeyAngle();
        var angle2 = kb.getKeyAngle();
        this.controller = {
            angle: angle1 !== null? angle1: angle2,
            up: gp.getKey("up") || kb.getKey("up"),
            down: gp.getKey("down") || kb.getKey("down"),
            left: gp.getKey("left") || kb.getKey("left"),
            right: gp.getKey("right") || kb.getKey("right"),
            shot: gp.getKey("A") || kb.getKey("Z"),
            bomb: gp.getKey("B") || kb.getKey("B"),
            special1: gp.getKey("X") || kb.getKey("X"),
            special2: gp.getKey("Y") || kb.getKey("C"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space"),
            cancel: gp.getKey("B") || kb.getKey("X"),
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();

        //特殊効果用ビットマップ作成
        [
            "tex1",
            "tex2",
            "tex_boss1",
            "gunship",
            "bit",
        ].forEach(function(name) {
            //ダメージ用
            if (!phina.asset.AssetManager.get("image", name+"White")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = (pixel[0] == 0? 0: 128); //r
                    data[index+1] = (pixel[1] == 0? 0: 128); //g
                    data[index+2] = (pixel[2] == 0? 0: 128); //b
                });
                phina.asset.AssetManager.set("image", name+"White", tex);
            }
            //瀕死用
            if (!phina.asset.AssetManager.get("image", name+"Red")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = pixel[0];
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Red", tex);
            }
            //影用
            if (!phina.asset.AssetManager.get("image", name+"Black")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Black", tex);
            }
        });
    },

    //設定データの保存
    saveConfig: function() {
        return this;
    },

    //設定データの読み込み
    loadConfig: function() {
        return this;
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset) {
        this.soundset.playSE(asset);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});
