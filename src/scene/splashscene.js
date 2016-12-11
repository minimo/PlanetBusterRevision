/*
 *  splashscene.js
 *  2015/12/02
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.namespace(function() {
    phina.define('pbr.SplashScene', {
        superClass: 'phina.display.DisplayScene',

        init: function() {
            this.superInit({width: SC_W, height: SC_H});

            this.unlock = false;
            this.loadcomplete = false;

            //preload asset
            var assets = pbr.Application.assets["preload"];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                this.loadcomplete = true;
            }.bind(this));

            //logo
            var texture = phina.asset.Texture();
            texture.load(pbr.SplashScene.logo).then(function() {
                this._init();
            }.bind(this));
            this.texture = texture;
        },

        _init: function() {
            this.sprite = phina.display.Sprite(this.texture)
                .addChildTo(this)
                .setPosition(this.gridX.center(), this.gridY.center())
                .setScale(0.3);
            this.sprite.alpha = 0;

            this.sprite.tweener
                .clear()
                .to({alpha:1}, 500, 'easeOutCubic')
                .call(function() {
                    this.unlock = true;
                }, this)
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic')
                .wait(250)
                .call(function() {
                    this.exit();
                }, this);
        },

        update: function() {
            var ct = app.controller;
            if (ct.ok || ct.cancel) {
                if (this.unlock && this.loadcomplete) this.exit();
            }
        },

        onpointstart: function() {
            if (this.unlock && this.loadcomplete) this.exit();
        },

        _static: {
            logo: "assets/images/logo.png",
        },
    });
});
