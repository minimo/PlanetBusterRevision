/*
 *  SceneFlow.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//��{�V�[���t���[
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
            },{
                label: "practice",
                className: "pbr.PracticeMode",
                nextLabel: "title",
            }],
        }));
    }
});

//�A�[�P�[�h���[�h�V�[���t���[
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
                nextLabel: "toTitle",
            },{
                label: "toTitle",
                className: "pbr.SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});

//�v���N�e�B�X���[�h�V�[���t���[
phina.define("pbr.PracticeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "menu",
            scenes: [{
                label: "menu",
                className: "pbr.PracticeScene",
            },

            //�X�e�[�W�P
            {
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
                    isPractice: true,
                },
                nextLabel: "toTitle",
            },

            //�e�X�g�p�X�e�[�W
            {
                label: "stage9load",
                className: "pbr.LoadingScene",
                arguments: {
                    assetType: "stage9"
                },
                nextLabel: "stage9",
            },{
                label: "stage9",
                className: "pbr.MainScene",
                arguments: {
                    stageId: 9,
                    isPractice: true,
                },
                nextLabel: "toTitle",
            },

            //�^�C�g���ɖ߂�
            {
                label: "toTitle",
                className: "pbr.SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});
