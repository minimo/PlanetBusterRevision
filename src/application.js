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
        assets: {
            "common": {
                image: {
                    "tex1":     "assets/images/tex1.png",
                    "tex2":     "assets/images/tex2.png",
                    "tex_boss1":"assets/images/tex_boss1.png",
                    "bullet1":  "assets/images/bullet1.png",
                    "bullet2":  "assets/images/bullet2.png",
                    "gunship":  "assets/images/gunship1.png",
                    "bit":      "assets/images/bit1.png",                    
                    "shot1":    "assets/images/shot1.png",
                    "shot2":    "assets/images/shot2.png",
                    "effect":   "assets/images/effect.png",
                    "map1g":    "assets/maps/map1.png",
                },
                sound: {
                    "stage1":   "assets/sounds/expsy.mp3", 
                    "warning":  "assets/sounds/bgm_warning.mp3",
                },
                font: {
                    "UbuntuMono":   "fonts/UbuntuMono-Bold.ttf",
                    "Orbitron":     "fonts/Orbitron-Regular.ttf",
                }
            },
            "stage1": {
                image: {
                },
                sound: {
                    "stage1":   "assets/sounds/expsy.mp3",
                },
            },
        },
    },

    _member: {
        //ＢＧＭ＆効果音
        bgm: null,
        bgmIsPlay: false,
        sounds: null,

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
 
        this.soundset = phina.extension.SoundSet();
        this.volumeBGM = 1;
        this.volumeSE = 1;

        this.replaceScene(pbr.SceneFlow());
    },

    update: function() {
        this.mouse.update();
        this.touch.update();
        this.touchList.update();
        this.keyboard.update();
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();
    },

    //設定データの保存
    saveConfig: function() {
        return this;
    },

    //設定データの読み込み
    loadConfig: function() {
        return this;
    },

    playBGM: function(asset) {
        this.soundset.playBGM(asset);
    },

    setVolumeBGM: function(vol) {
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset) {
        this.soundset.playSE(asset);
    },

    setVolumeSE: function(vol) {
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
