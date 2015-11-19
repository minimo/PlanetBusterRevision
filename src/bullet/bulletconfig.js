/*
 *  bulletconfig.js
 *  2015/11/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

    phina.define("pbr.BulletConfig", {
        init: function() {},
        _static: {
            speedRate: 3,
            target: null,
            bulletLayer: null,

            setup: function(target, bulletLayer) {
                this.target = target;
                this.bulletLayer = bulletLayer;

                this.put("densityRank", 0.00);
                this.put("speedRank", 0.00);
                this.put("burst", 0);
            },

            createNewBullet: function(runner, spec) {
                this.bulletLayer.enterBullet(runner, spec);
            },

            put: function(name, value) {
                bulletml.Walker.globalScope["$" + name] = value;
            },
        }
    });

});
