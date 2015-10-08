/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("pbr.LoadingScene", {
    superClass: 'phina.game.LoadingScene',

    init: function(param) {
        this.superInit({
            assets: pbr.Application.assets[param.assetType],
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        });
    },

    update: function(app) {
    },
});
