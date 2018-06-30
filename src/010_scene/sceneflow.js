/*
 *  SceneFlow.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//��{�V�[���t���[
phina.define("SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        this.superInit(options.$safe({
            scenes: [{
                label: "splash",
                className: "SplashScene",
                nextLabel: "load",
            },{
                label: "load",
                className: "LoadingScene",
                arguments: {
                    assetType: "common"
                },
                nextLabel: "title",
            },{
                label: "title",
                className: "TitleScene",
            },{
                label: "arcade",
                className: "ArcadeMode",
                nextLabel: "title",
            },{
                label: "practice",
                className: "PracticeMode",
                nextLabel: "title",
            }],
        }));
    }
});

//�A�[�P�[�h���[�h�V�[���t���[
phina.define("ArcadeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "stage1load",
            scenes: [{
                label: "stage1load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage1"
                },
                nextLabel: "stage1",
            },{
                label: "stage1",
                className: "MainScene",
                arguments: {
                    stageId: 1,
                },
            },{
                label: "gameover",
                className: "GameOverScene",
                nextLabel: "toTitle",
            },{
                label: "toTitle",
                className: "SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});

//�v���N�e�B�X���[�h�V�[���t���[
phina.define("PracticeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "menu",
            scenes: [{
                label: "menu",
                className: "PracticeScene",
            },

            //�X�e�[�W�P
            {
                label: "stage1load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage1"
                },
                nextLabel: "stage1",
            },{
                label: "stage1",
                className: "MainScene",
                arguments: {
                    stageId: 1,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 1,
                },
            },

            //�X�e�[�W�Q
            {
                label: "stage2load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage2"
                },
                nextLabel: "stage2",
            },{
                label: "stage2",
                className: "MainScene",
                arguments: {
                    stageId: 2,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 2,
                },
            },

            //�e�X�g�p�X�e�[�W
            {
                label: "stage9load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage9"
                },
                nextLabel: "stage9",
            },{
                label: "stage9",
                className: "MainScene",
                arguments: {
                    stageId: 9,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 9,
                },
            },

            //�^�C�g���ɖ߂�
            {
                label: "toTitle",
                className: "SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});
