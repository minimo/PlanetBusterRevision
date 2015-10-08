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
SC_W = 480;
SC_H = 320;

window.onload = function() {
    var app = pbr.Application();
    app.run();
    app.enableStats();
};
