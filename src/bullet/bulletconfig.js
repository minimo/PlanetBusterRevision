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

                //難易度(int)(0:easy 1:normal 2:hard 3:death)
                this.put("difficulty", 1);

                //ゲーム難易度ランク(int)
                this.put("rank", 1);

                //弾速(float)
                this.put("speedBase", 1.00);
                this.put("speedRank", 0.00);

                //弾密度(float 0.00-1.00)
                this.put("densityRank", 0.00);

                //弾数増加数(int)
                this.put("burst", 0);
            },

            createNewBullet: function(runner, spec) {
                if (spec.option) {
                    this.bulletLayer.enterBullet(runner, spec.option);
                } else {
                    this.bulletLayer.enterBullet(runner, spec);
                }
            },

            put: function(name, value) {
                bulletml.Walker.globalScope["$" + name] = value;
            },
        }
    });

});
