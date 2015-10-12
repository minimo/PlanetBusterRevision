/*
 *  bulletmlrunner.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define('phina.accessory.BullerMLRunner', {
    superClass: 'phina.accessory.Accessory',

    init: function() {
    },

    update: function() {
    },

    start: function(root, config) {
        config = (config || {}).$safe(bulletml.runner.DEFAULT_CONFIG);

        var runner = root.createRunner(config);
        runner.x = this.x;
        runner.y = this.y;
        var enterframeListener = function() {
            runner.x = this.x;
            runner.y = this.y;
            runner.update();
            this.setPosition(runner.x, runner.y);
        };
        enterframeListener.isDanmaku = true;
        this.on("enterframe", enterframeListener);
    },

    stop: function() {
        if (this.hasEventListener("enterframe")) {
            var copied = this._listeners["enterframe"].clone();
            for (var i = 0; i < copied.length; i++) {
                if (copied[i].isDanmaku) {
                    this.off("enterframe", copied[i]);
                }
            }
        }
    },
};


