/*
 *  SceneFlow.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */
phina.define("pbr.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "splash",
            scenes: [{
                label: "splash",
                className: "pbr.SplashScene",
                nextLabel: "load",
            },{
                label: "load",
                className: "pbr.LoadingScene",
                arguments: {
                    assetType: "common"
                },
                nextLabel: "main",
            },{
                label: "title",
                className: "pbr.TitleScene",
                nextLabel: "main",
            },{
                label: "main",
                className: "pbr.MainScene",
                nextLabel: "title",
            }],
        });
    }
});
