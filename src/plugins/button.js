/*
 *  Button.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//通常のボタン
phina.define("phina.extension.Button", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        buttonColor: 'rgba(50, 150, 255, 0.8)',
        lineColor: 'rgba(200, 200, 200, 0.5)',
        lineWidth: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: false,
    },

    DEFAULT_STYLE_FLAT: {
        buttonColor: 'rgba(150, 150, 250, 1.0)',
        lineColor: 'rgba(0, 0, 0, 0.5)',
        lineWidth: 3,
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: true,
    },

    labelParam: {align: "center", baseline:"middle", outlineWidth:3},

    text: "",
    push: false,
    lock: false,

    //ボタン押下時の移動量
    downX: 0,
    downY: 10,

    //フラット時透明度
    alphaON: 0.9,
    alphaOFF: 0.4,

    init: function(options) {
        this.superInit();
        options = (options||{}).$safe({
            width: 200,
            height: 80,
            text: "undefined",
            style: null
        });

        this.width = options.width;
        this.height = options.height;
        this.text = options.text;

        //セットアップ
        this.setup(options.style);

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
    },

    setup: function(style) {
        style = style || {};
        if (style.flat) {
            style.$safe(this.DEFAULT_STYLE_FLAT);
        } else {
            style.$safe(this.DEFAULT_STYLE);
        }
        this.style = style;

        //登録済みの場合破棄する
        if (this.shadow) {
            if (!style.flat) this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        if (!style.flat) {
            //ボタン影
            var shadowStyle = {
                width: width,
                height: height,
                fillStyle: style.shadowColor,
                strokeStyle: style.shadowColor,
                lineWidth: style.lineWidth
            };
            this.shadow = phina.display.RectangleShape(shadowStyle)
                .addChildTo(this)
                .setPosition(this.downX, this.downY);
            this.shadow.blendMode = "source-over";
        }
        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fillStyle: style.buttonColor,
            strokeStyle: style.lineColor,
            lineWidth: style.lineWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
        if (style.flat) this.button.setAlpha(this.alphaOFF);

        //ボタンラベル
        var parent = this.button;
        if (style.flat) parent = this;
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(parent)
            .setParam(this.labelParam);
    },
    buttonPushStart: function(e) {
        if (this.style.flat) {
            this.button.setAlpha(this.alphaON);
        } else {
            this.button.x += this.downX;
            this.button.y += this.downY;
        }
    },
    buttonPushMove: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            if (!this.push) {
                this.push = true;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaON);
                } else {
                    this.button.x += this.downX;
                    this.button.y += this.downY;
                }
            }
        } else {
            if (this.push) {
                this.push = false;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaOFF);
                } else {
                    this.button.x -= this.downX;
                    this.button.y -= this.downY;
                }
            }
        }
    },
    buttonPushEnd: function(e) {
        if (this.style.flat) {
            this.button.setAlpha(this.alphaOFF);
        } else {
            this.button.x -= this.downX;
            this.button.y -= this.downY;
        }
    },

    setVisible: function(b) {
        if (this.shadow) this.shadow.visible = b;
        this.button.visible = b;
        this.label.visible = b;
        return this;
    },

    setLock: function(b) {
        this.lock = b;
        return this;
    },

    ontouchstart: function(e) {
        if (this.lock) return;

        this.push = true;
        this.buttonPushStart(e);
        var e = phina.event.Event("push");
        this.dispatchEvent(e);
    },
    ontouchmove: function(e) {
        if (this.lock) return;
        this.buttonPushMove(e);
    },
    ontouchend: function(e) {
        if (this.lock) return;

        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this.buttonPushEnd(e);

            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },
});

//角丸ボタン
phina.define("phina.extension.RoundButton", {
    superClass: "phina.extension.Button",

    init: function(options) {
        this.superInit(options);
    },

    setup: function(style) {
        style = style || {};
        style.$safe(this.DEFAULT_STYLE);

        //登録済みの場合破棄する
        if (this.shadow) {
            this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        //ボタン影
        var shadowStyle = {
            width: width,
            height: height,
            fillStyle: style.shadowColor,
            strokeStyle: style.shadowColor,
            lineWidth: style.lineWidth,
            radius: style.radius,
        };
        this.shadow = phina.display.RoundRectangleShape(shadowStyle)
            .addChildTo(this)
            .setPosition(this.downX, this.downY);
        this.shadow.blendMode = "source-over";

        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fillStyle: style.buttonColor,
            strokeStyle: style.lineColor,
            lineWidth: style.lineWidth,
            radius: style.radius,
        };
        this.button = phina.display.RoundRectangleShape(buttonStyle)
            .addChildTo(this);

        //ボタンラベル
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(this.button)
            .setParam(this.labelParam);
    },
});

//トグルボタン
phina.define("phina.extension.ToggleButton", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        buttonColor: 'rgba(50, 150, 255, 0.8)',
        lineColor: 'rgba(200, 200, 200, 0.5)',
        lineWidth: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: "UbuntuMono",
        fontSize: 50,
        falt: false,
    },

    DEFAULT_STYLE_FLAT: {
        buttonColor: 'rgba(150, 150, 250, 1.0)',
        lineColor: 'rgba(0, 0, 0, 0.5)',
        lineWidth: 3,
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: true,
    },

    labelParam: {align: "center", baseline:"middle", outlineWidth:3 },

    onText: "",
    offText: "",
    push: false,
    lock: false,
    _toggleON: false,

    //ボタン押下時の移動量
    downX: 0,
    downY: 10,

    //フラット時透明度
    alphaON: 0.9,
    alphaOFF: 0.4,

    init: function(options) {
        options = (options||{}).$safe({
            width: 200,
            height: 80,
            onText: "ON",
            offText: "OFF",
            style: null
        });
        this.superInit();
 
        this.width = options.width;
        this.height = options.height;
        this.onText = options.onText;
        this.offText = options.offText;

        //セットアップ
        this.setup(style);

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
    },

    setup: function(style) {
        style = style || {};
        if (style.flat) {
            style.$safe(this.DEFAULT_STYLE_FLAT);
        } else {
            style.$safe(this.DEFAULT_STYLE);
        }
        this.style = style;

        //登録済みの場合破棄する
        if (this.shadow) {
            if (!style.flat) this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        if (!style.flat) {
            //ボタン影
            var shadowStyle = {
                width: width,
                height: height,
                fillStyle: style.shadowColor,
                strokeStyle: style.shadowColor,
                lineWidth: style.lineWidth
            };
            this.shadow = phina.display.RectangleShape(shadowStyle)
                .addChildTo(this)
                .setPosition(this.downX, this.downY);
            this.shadow.blendMode = "source-over";
        }

        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fillStyle: style.buttonColor,
            strokeStyle: style.lineColor,
            lineWidth: style.lineWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
        if (style.flat) this.button.setAlpha(this.alphaOFF);

        //ボタンラベル
        var parent = this.button;
        if (style.flat) parent = this;
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(parent)
            .setParam(this.labelParam);
    },
    setLock: function(b) {
        this.lock = b;
        return this;
    },

    buttonPushStart: function(e) {
        this.push = true;
        if (this._toggleON) {
            if (this.style.flat) {
                this.button.setAlpha(this.alphaON);
            } else {
                this.button.x += this.downX*0.5;
                this.button.y += this.downY*0.5;
            }
        } else {
            if (this.style.flat) {
                this.button.setAlpha(this.alphaOFF);
            } else {
                this.button.x += this.downX*1.5;
                this.button.y += this.downY*1.5;
            }
        }
    },
    buttonPushMove: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            if (!this.push) {
                this.push = true;
                if (this._toggleON) {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaON);
                    } else {
                        this.button.x += this.downX*0.5;
                        this.button.y += this.downY*0.5;
                    }
                } else {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaOFF);
                    } else {
                        this.button.x += this.downX*1.5;
                        this.button.y += this.downY*1.5;
                    }
                }
            }
        } else {
            if (this.push) {
                this.push = false;
                if (this._toggleON) {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaON);
                    } else {
                        this.button.x -= this.downX*0.5;
                        this.button.y -= this.downY*0.5;
                    }
                } else {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaOFF);
                    } else {
                        this.button.x -= this.downX*1.5;
                        this.button.y -= this.downY*1.5;
                    }
                }
            }
        }
    },
    buttonPushEnd: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this._toggleON = !this._toggleON;
            if (this._toggleON) {
                this.text = this.onText;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaON);
                } else {
                    this.button.x -= this.downX*0.5;
                    this.button.y -= this.downY*0.5;
                }
            } else {
                this.text = this.offText;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaOFF);
                } else {
                    this.button.x -= this.downX*1.5;
                    this.button.y -= this.downY*1.5;
                }
            }
            this.label.text = this.text;
            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },

    ontouchstart: function(e) {
        if (this.lock) return;

        this.push = true;
        this.buttonPushStart(e);
        var e = phina.event.Event("push");
        this.dispatchEvent(e);
    },
    ontouchmove: function(e) {
        if (this.lock) return;
        this.buttonPushMove(e);
    },
    ontouchend: function(e) {
        if (this.lock) return;

        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this.buttonPushEnd(e);

            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },
});
phina.extension.ToggleButton.prototype.accessor("toggleON", {
    "set": function(b) {
        this._toggleON = b;

        if (this._toggleON) {
            this.text = this.onText;
            if (this.style.flat) {
                this.button.setAlpha(this.alphaON);
            } else {
                this.button.x = this.downX;
                this.button.y = this.downY;
            }
        } else {
            this.text = this.offText;
            if (this.style.flat) {
                this.button.setAlpha(this.alphaOFF);
            } else {
                this.button.x = 0;
                this.button.y = 0;
            }
        }
        this.label.text = this.text;
    },

    "get": function() {
        return this._toggleON;
    },
});

//スライドボタン
phina.define("phina.extension.SlideButton", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        width: 160,
        height: 80,

        buttonWitdh: 80,
        buttonHeight: 80,

        //ボタン色
        buttonColor: 'rgba(255, 255, 255, 1.0)',
        buttonLine:  'rgba(200, 200, 200, 1.0)',
        lineWidth: 2,

        //ベース(on/off)色
        onColor: 'rgba(0, 255, 0, 1.0)',
        offColor: 'rgba(200, 200, 200, 1.0)',
    },

    _slideON: false,

    init: function(style) {
        this.superInit();

        this.style = style || {};
        this.style.$safe(this.DEFAULT_STYLE)

        this.width = style.width || 160;
        this.height = style.height || 80;

        this.text = this.offText;

        //セットアップ
        this.setup();

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
//        this.checkHierarchy = true;

        //イベントリスナ登録
        this.addEventListener("touchstart", function() {
            if (this._slideON) {
            } else {
            }
            var e = phina.event.Event("slide");
            this.dispatchEvent(e);
        });
    },

    setup: function() {
        //登録済みの場合破棄する
        if (this.shadow) {
            this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var style = this.style;
        var width = this.width, height = this.height;
        var buttonWidth = this.button, heightButton = this.heightButton;

        //ボタンベース
        var baseStyle = {
            width: width,
            height: height,
            fillStyle: style.offColor,
            strokeStyle: style.offColor,
            lineWidth:  style.lineWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);

        //ボタン本体
        var buttonStyle = {
            width: buttonWidth,
            height: buttonHeight,
            fillStyle: style.buttonColor,
            strokeStyle: style.lineColor,
            lineWidth: style.lineWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
    },
});

phina.extension.SlideButton.prototype.accessor("slideON", {
    "set": function(b) {
        this._slideON = b;

        if (this._slideON) {
        } else {
        }
    },

    "get": function() {
        return this._slideON;
    },
});
