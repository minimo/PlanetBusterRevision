/*
 *  main.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
//デバッグフラグ
DEBUG = false;

//スクリーンサイズ
SC_W = 320;
SC_H = 640;

window.onload = function() {
    var loader = phina.asset.AssetLoader();
    loader.load(assets["IPL"]).then(function() {
        app = phinaApp.Application({
            query: '#world',
            width: SC_W,
            height: SC_H,
        });
        app._onLoadAssets();
        app.replaceScene(phinaApp.MainScene());
        app.enableStats();
        app.run();
    });
};
