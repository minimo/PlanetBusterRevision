/*
 *  splashscene.js
 *  2015/12/02
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.namespace(function() {
    phina.define('pbr.SplashScene', {
        superClass: 'phina.display.CanvasScene',

        init: function() {
            this.superInit({width: SC_W, height: SC_H});

            var defaults = phina.game.SplashScene.defaults;

            this.lock = true;

            var texture = phina.asset.Texture();
            texture.load(defaults.imageURL).then(function() {
                this._init();
            }.bind(this));
            this.texture = texture;
        },

        _init: function() {
            this.sprite = phina.display.Sprite(this.texture).addChildTo(this).setScale(0.3);

            this.sprite.setPosition(this.gridX.center(), this.gridY.center());
            this.sprite.alpha = 0;

            this.sprite.tweener
                .clear()
                .to({alpha:1}, 500, 'easeOutCubic')
                .call(function() {
                    this.lock = false;
                }, this)
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic')
                .wait(250)
                .call(function() {
                    this.exit();
                }, this);
        },

        onpointstart: function() {
            if (!this.lock) this.exit();
        },

        _static: {
            defaults: {
                imageURL: 'assets/images/logo.png',
            },
        },
    });
});
