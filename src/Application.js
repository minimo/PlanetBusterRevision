/*
 *  Application.js
 *  2015/09/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespace phinaApp
phinaApp = {};

phina.define("phinaApp.Application", {
    superClass: "phina.display.CanvasApp",

	_static: {
        version: "0.0.1",
    },

    _member: {
        //ＢＧＭ＆効果音
        bgm: null,
        bgmIsPlay: false,
        sounds: null,

        //バックグラウンドカラー
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },

    init: function(param) {
        this.superInit(param);
        this.$extend(this._member);

        //設定情報の読み込み
        this.loadConfig();
 
        this.soundset = phina.extension.SoundSet();
        this.volumeBGM = 1;
        this.volumeSE = 1;
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
