/*
 *  bulletmlrunner.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

phina.define('phina.accessory.BullerMLRunner', {
    superClass: 'phina.accessory.Accessory',

    init: function(config) {
        config = (config || {}).$safe(bulletml.runner.DEFAULT_CONFIG);
        this.runner = bulletml.Root.createRunner(config);
        this.runner.x = this.x;
        this.runner.y = this.y;
    },

    update: function(app) {
        this.runner.x = this.x;
        this.runner.y = this.y;
        this.setPosition(this.runner.x, this.runner.y);
    },
};

});

