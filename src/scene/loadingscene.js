/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("pbr.LoadingScene", {
    superClass: 'phina.display.CanvasScene',

    init: function(options) {
        var _default = {
            asset: pbr.Application.assets[options.assetType],
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        };
        options = (options||{}).$safe(_default);
        this.superInit(options);
        var labelParam = {
            text: "Loading",
            fill: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 3,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 20
        };
        phina.display.Label(labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.fromJSON({
            children: {
                gauge: {
                    className: 'phina.ui.Gauge',
                    arguments: {
                        value: 0,
                        width: this.width,
                        height: 12,
                        color: '#aaa',
                        stroke: false,
                        gaugeColor: 'hsla(200, 100%, 80%, 0.8)',
                        padding: 0,
                    },
                    x: this.gridX.center(),
                    y: 0,
                    originY: 0,
                }
            }
        });

        var loader = phina.asset.AssetLoader();
        if (options.lie) {
            this.gauge.animationTime = 10*1000;
            this.gauge.value = 90;
            loader.onload = function() {
                this.gauge.animationTime = 1*1000;
                this.gauge.value = 100;
            }.bind(this);
        } else {
            loader.onprogress = function(e) {
                this.gauge.value = e.progress*100;
            }.bind(this);
        }
        this.gauge.onfull = function() {
            if (options.exitType === 'auto') {
                this.app.popScene();
            }
        }.bind(this);

        loader.load(options.asset);
    },
});
