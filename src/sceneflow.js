/*
 *  SceneFlowt.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */
phina.define("ps.MainSequence", {
    superClass: "phina.game.ManagerScene",

    init: function() {
      this.superInit({
        scenes: [

          {
            label: "load",
            className: "ps.LoadingScene",
            arguments: {
              assetType: "common"
            },
            nextLabel: "title",
          },

          {
            label: "title",
            className: "ps.TitleScene",
          },

          {
            label: "arcadeMode",
            className: "ps.ArcadeModeSequence",
            nextLabel: "title",
          },
          
        ],

        startLabel: "load",
      });
    }
  });

});
