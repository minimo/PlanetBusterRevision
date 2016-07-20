/*
 *  gauge.js
 *  2016/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

phina.define("phina.extension.Gauge", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        fill: 'rgba(0, 0, 200, 1.0)',
        empty: 'rgba(0, 0, 0, 0.0)',
        stroke: 'rgba(255, 255, 255, 1.0)',
        strokeWidth: 4,
    },

    min: 0,
    max: 100,
    value: 100,

    init: function(options) {
        this.superInit();
        options = (options||{}).$safe({
            width: 640,
            height: 10,
            style: null
        });

        this.width = options.width;
        this.height = options.height;

        //セットアップ
        this.setup(options.style);
    },

    setup: function(style) {
        style = style || {};
        style.$safe(this.DEFAULT_STYLE);
        this.style = style;

        var width = this.width;
        var height = this.height;

        var gaugeStyle = {
            width: width,
            height: height,
            fill: style.fill,
            stroke: style.fill,
            strokeWidth: 1
        }
        this.gauge = phina.display.RectangleShape(gaugeStyle)
            .setPosition(width*-0.5, 0)
            .addChildTo(this);
        this.gauge.originX = 0;

        var frameStyle = {
            width: width,
            height: height,
            fill: style.empty,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth
        }
        this.gaugeFrame = phina.display.RectangleShape(frameStyle)
            .setPosition(width*-0.5, 0)
            .addChildTo(this);
        this.gaugeFrame.originX = 0;
        
//        this.tweener.clear().to({value: 0}, 2000).to({value: 100}, 2000).setLoop(true);
    },

    update: function() {
        this.gauge.width = this.width*(this.value/(this.max-this.min));
    },

    setValue: function(v) {
        this.value = v;
        return this;
    },
    setMax: function(v) {
        this.max = v;
        return this;
    },
    setMin: function(v) {
        this.min = v;
        return this;
    },
});

