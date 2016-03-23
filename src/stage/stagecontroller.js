/*
 *  StageController.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ制御
phina.define("pbr.StageController", {

    _member: {
        parentScene: null,
        player: null,
        time: 0,

        seq: null,
        index: 0,
    },

    init: function(scene, player) {
        this.$safe(this._member);

        this.parentScene = scene;
        this.seq = [];

        this.player = player;
    },

    add: function(time, value, option) {
        this.index += time;
        this.seq[this.index] = {
            value: value,
            option: option,
        }
    },

    get: function(time) {
        var data = this.seq[time];
        if (data === undefined) return null;
        return data;
    },

    getNextTime: function(time) {
        var data = this.seq[time];
        if (data === undefined) {
            var t = time+1;
            var rt = -1;
            this.seq.some(function(val, index){
                if (index > t) {
                    rt = index;
                    return true;
                }
            },this.seq);
            return rt;
        } else {
            return time;
        }
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },
});

})();
