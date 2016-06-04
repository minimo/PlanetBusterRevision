/*
 *  SoundSet.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//サウンド管理
phina.define("phina.extension.SoundSet", {
    _member: {
        elements: null,
        bgm: null,
        bgmIsPlay: false,
        volumeBGM: 0.5,
        volumeSE: 0.5,
    },

    init: function() {
        this.$extend(this._member);
        this.elements = [];
    },

    readAsset: function() {
        for (var key in phina.asset.AssetManager.assets.sound) {
            var obj = phina.asset.AssetManager.get("sound", key);
            if (obj instanceof phina.asset.Sound) this.add(key);
        }
    },

    add: function(name, url) {
        if (name === undefined) return null;
        url = url || null;
        if (this.find(name)) return true;

        var e = phina.extension.SoundElement(name);
        if (!e.media) return false;
        this.elements.push(e);
        return true;
    },

    find: function(name) {
        if (!this.elements) return null;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].name == name) return this.elements[i];
        }
        return null;
    },

    playBGM: function(name, loop, callback) {
        if (loop === undefined) loop = true;
        if (this.bgm) {
            this.bgm.stop();
            this.bgmIsPlay = false;
        }
        var media = this.find(name);
        if (media) {
            var vol = this.volumeBGM * media.volume;
            media.setVolume(vol);
            media.play(loop, callback);
            this.bgm = media;
            this.bgmIsPlay = true;
        } else {
            if (this.add(name)) this.playBGM(name);
        }
        return this;
    },

    stopBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.stop();
                this.bgmIsPlay = false;
            }
            this.bgm = null;
        }
        return this;
    },

    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    resumeBGM: function() {
        if (this.bgm) {
            if (!this.bgmIsPlay) {
                this.bgm.volume = this.volumeBGM;
                this.bgm.resume();
                this.bgmIsPlay = true;
            }
        }
        return this;
    },

    setVolumeBGM: function(vol) {
        this.volumeBGM = vol;
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.setVolume(this.volumeBGM);
            this.bgm.resume();
        }
        return this;
    },

    playSE: function(name) {
        var media = this.find(name);
        if (media) {
            var vol = this.volumeSE;
            media.setVolume(vol);
            media.play(false);
        } else {
            if (this.add(name)) this.playSE(name);
        }
        return this;
    },

    setVolumeSE: function(vol) {
        this.volumeSE = vol;
        return this;
    },
});

//SoundElement Basic
phina.define("phina.extension.SoundElement", {
    _member: {
        name: null,
        url: null,
        media: null,
        _volume: 1,
        status: null,
        message: null,
        callback: null,
    },

    init: function(name) {
        this.$extend(this._member);
        this.name = name;
        this.media = phina.asset.AssetManager.get("sound", name);
        if (this.media) {
            this.media.volume = 1;
            this.media.on('ended', function() {
                if (this.callback) this.callback();
            }.bind(this))
        } else {
            console.warn("asset not found. "+name);
        }
    },

    play: function(loop, callback) {
        if (loop === undefined) loop = false
        if (!this.media) return this;
        this.media.loop = loop;
        this.media.play();
        this.callback = callback;
        return this;
    },

    resume: function() {
        if (!this.media) return this;
        this.media.resume();
        return this;
    },

    pause: function () {
        if (!this.media) return this;
        this.media.pause();
    },

    stop: function() {
        if (!this.media) return this;
        this.media.stop();
        return this;
    },
    
    setMasterVolume: function(vol) {
    },

    setVolume: function(vol) {
        if (!this.media) return this;
        if (vol === undefined) vol = 0;
        this._volume = vol;
        this.media.volume = this._volume;
        return this;
    },

    _accessor: {
        volume: {
            "get": function() { return this._volume; },
            "set": function(vol) { this.setVolume(vol); }
        },
    }
});
