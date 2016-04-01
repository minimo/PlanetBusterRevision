/*
 *  SceneFlow.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        this.superInit(options.$safe({
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
                nextLabel: "title",
            },{
                label: "title",
                className: "pbr.TitleScene",
            },{
                label: "arcade",
                className: "pbr.ArcadeMode",
                nextLabel: "title",
            }],
        }));
    }
});

phina.define("pbr.ArcadeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "stage1load",
            scenes: [{
                label: "stage1load",
                className: "pbr.LoadingScene",
                arguments: {
                    assetType: "stage1"
                },
                nextLabel: "stage1",
            },{
                label: "stage1",
                className: "pbr.MainScene",
                arguments: {
                    stageId: 1,
                },
            },{
                label: "gameover",
                className: "pbr.GameOverScene",
            }],
        });
    }
});
