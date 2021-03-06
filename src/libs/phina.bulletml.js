/**
 * @namespace
 */
phina.bulletml = phina.bulletml || {};

(function() {

phina.define("phina.bulletml.Bullet", {
    superClass: "phina.display.CanvasElement",

    init: function(runner) {
        this.superInit();

        this.runner = runner;

        this.setPosition(this.runner.x, this.runner.y);
        this.runner.onVanish = function() {
            bullet.remove();
        };
        this.on("enterframe", function() {
            this.runner.update();
            this.setPosition(this.runner.x, this.runner.y);
        }.bind(this));
    },

    defaultShape: function() {
        this.fromJSON({
            children: {
                body: {
                    type: "phina.display.CircleShape",
                    init: [{
                        width:10,
                        height:10,
                        fillStyle: "hsl(0, 80%, 80%)",
                        strokeStyle: "hsl(0, 80%, 50%)",
                        lineWidth: 2
                    }]
                }
            }
        });
    }
});

phina.app.Object2D.prototype.startDanmaku = function(root, config) {
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
};

phina.app.Object2D.prototype.stopDanmaku = function() {
    if (this.hasEventListener("enterframe")) {
        var copied = this._listeners["enterframe"].clone();
        for (var i = 0; i < copied.length; i++) {
            if (copied[i].isDanmaku) {
                this.off("enterframe", copied[i]);
            }
        }
    }
};

})();
