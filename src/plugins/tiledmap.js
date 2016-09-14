/*
 *  tiledmap.js
 *  2016/9/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

phina.define("phina.extension.TiledMap", {
    superClass: "phina.display.DisplayElement",

    init: function(tmx) {
        this.superInit();
        if (typeof tmx === 'string') {
            tmx = phina.asset.AssetManager.get('tmx', tmx);
        }
    },
});

//ローダーに追加
phina.asset.AssetLoader.assetLoadFunctions.tmx = function(key, path) {
    var text = phina.asset.File();
    return text.load({
      path: path,
      dataType: "xml",
    });
};
