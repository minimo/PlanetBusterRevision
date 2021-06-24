/*
 *  Benri.js
 *  2014/12/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
var toRad = 3.14159/180;    //弧度法toラジアン変換
var toDeg = 180/3.14159;    //ラジアンto弧度法変換

//距離計算
var distance = function(from, to) {
    var x = from.x-to.x;
    var y = from.y-to.y;
    return Math.sqrt(x*x+y*y);
}

//距離計算（ルート無し版）
var distanceSq = function(from, to) {
    var x = from.x - to.x;
    var y = from.y - to.y;
    return x*x+y*y;
}

//数値の制限
var clamp = function(x, min, max) {
    return (x<min)?min:((x>max)?max:x);
};

//乱数生成
var prand = phina.util.Random();
var rand = function(min, max) {
    return prand.randint(min, max);
}

//タイトル無しダイアログ
var AdvanceAlert = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    window.frames[0].window.alert(str);
    tmpFrame.parentNode.removeChild(tmpFrame);
};
var AdvanceConfirm = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    var result = window.frames[0].window.confirm(str);
    tmpFrame.parentNode.removeChild(tmpFrame);

    return result;
};

//数値をカンマ編集して文字列として出力
Number.prototype.$method("comma",  function() {
    var str = this+'';
    var len = str.length;
    var out = '';
    for (var i = len-1; i > -1; i--) {
        out = str[i]+out;
        if (i != 0 && (len-i)%3 == 0) out = ','+out;
    }
    return out;
});

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
        strokeColor: 'rgba(200, 200, 200, 0.5)',
        strokeWidth: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: false,
    },

    DEFAULT_STYLE_FLAT: {
        buttonColor: 'rgba(150, 150, 250, 1.0)',
        strokeColor: 'rgba(0, 0, 0, 0.5)',
        strokeWidth: 3,
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
                fill: style.shadowColor,
                stroke: style.shadowColor,
                strokeWidth: style.strokeWidth
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
            fill: style.buttonColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth
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
            fill: style.shadowColor,
            stroke: style.shadowColor,
            strokeWidth: style.strokeWidth,
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
            fill: style.buttonColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth,
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
                fill: style.shadowColor,
                stroke: style.shadowColor,
                strokeWidth: style.strokeWidth
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
            fill: style.buttonColor,
            stroke: style.lineColor,
            strokeWidth: style.strokeWidth
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
            fill: style.offColor,
            stroke: style.offColor,
            strokeWidth:  style.strokeWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);

        //ボタン本体
        var buttonStyle = {
            width: buttonWidth,
            height: buttonHeight,
            fill: style.buttonColor,
            stroke: style.lineColor,
            strokeWidth: style.strokeWidth
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

/*
 * collision.js
 */

phina.collision = phina.collision || {};
 
(function() {

    /**
     * @class phina.collision
     * 衝突判定
     */
    phina.collision;
    
    /**
     * @method testCircleCircle
     * 円同士の衝突判定
     */
    phina.collision.testCircleCircle = function(circle0, circle1) {
        var distanceSquared = phina.geom.Vector2.distanceSquared(circle0, circle1);
        return distanceSquared <= Math.pow(circle0.radius + circle1.radius, 2);
    };
    
    /**
     * @method testRectRect
     * 矩形同士の衝突判定
     */
    phina.collision.testRectRect = function(rect0, rect1) {
        return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
               (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
    };

    phina.collision.testCircleRect = function(circle, rect) {
        // まずは大きな矩形で判定(高速化)
        var bigRect = phina.geom.Rect(rect.left-circle.radius, rect.top-circle.radius, rect.width+circle.radius*2, rect.height+circle.radius*2);
        if (bigRect.contains(circle.x, circle.y) == false) {
            return false;
        }
        
        // 2種類の矩形と衝突判定
        var r = phina.geom.Rect(rect.left-circle.radius, rect.top, rect.width+circle.radius*2, rect.height);
        if (r.contains(circle.x, circle.y)) {
            return true;
        }
        r.set(rect.left, rect.top-circle.radius, rect.width, rect.height+circle.radius*2);
        if (r.contains(circle.x, circle.y)) {
            return true;
        }
        
        // 円と矩形の４点の判定
        var c = phina.geom.Circle(circle.x, circle.y, circle.radius);
        // left top
        if (c.contains(rect.left, rect.top)) {
            return true;
        }
        // right top
        if (c.contains(rect.right, rect.top)) {
            return true;
        }
        // right bottom
        if (c.contains(rect.right, rect.bottom)) {
            return true;
        }
        // left bottom
        if (c.contains(rect.left, rect.bottom)) {
            return true;
        }
        
        return false;
    };

    phina.collision.testRectCircle = function(rect, circle) {
        return this.testCircleRect(circle, rect);
    };
 
})();














/*
 *  extension.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エレメント同士の接触判定
phina.display.DisplayElement.prototype.isHitElement = function(elm) {
    if (this.boundingType == 'rect') {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectRect(this, elm);
        } else {
            return phina.collision.testRectCircle(this, elm);
        }
    } else {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectCircle(elm, this);
        } else {
            return phina.collision.testCircleCircle(this, elm);
        }
    }
}

//子要素全て切り離し
phina.app.Element.prototype.removeChildren = function(beginIndex) {
    beginIndex = beginIndex || 0;
    var tempChildren = this.children.slice();
    var len = tempChildren.length;
    for (var i = beginIndex; i < len; ++i) {
        tempChildren[i].remove();
    }
    this.children = [];
}

//ターゲット方向を向く
phina.display.DisplayElement.prototype.lookAt = function(target) {
    target = target || {x: 0, y: 0};

    var ax = this.x - target.x;
    var ay = this.y - target.y;
    var rad = Math.atan2(ay, ax);
    var deg = ~~(rad * toDeg);
    this.rotation = deg + 90;
    return this;
}


/*
 *  frame.js
 *  2016/10/13
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phina.extension.Frame", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit(options);
        this.backgroundColor = "transparent";
        this.strokeWidth = 2;

        var x = this.width / 2;
        var y = this.height / 2;

        //タイトル表示
        if (options.title) {
            phina.display.Label(options.title)
                .addChildTo(this)
                .setPosition(-x, -y)
                .setOrigin(0, 0);
        }

        //フレームの描画パス
        this.drawPath = [
            //上辺
            {x: -x+ 20, y: -y   , side: 0},
            {x: -x+150, y: -y   , side: 0},
            {x: -x+160, y: -y+20, side: 0},
            {x:  x-  5, y: -y+20, side: 0},
            {x:  x    , y: -y+25, side: 0},
/*
            {x: -x+10, y: -y   , side: 0},
            {x:  x- 5, y: -y   , side: 0},
            {x:  x   , y: -y+ 5, side: 0},
*/
            //右辺
            {x:  x   , y:  y-10, side: 1},
            {x:  x-10, y:  y   , side: 1},

            //下辺
            {x: -x+35, y:  y   , side: 2},
            {x: -x+30, y:  y- 5, side: 2},
            {x: -x   , y:  y- 5, side: 2},

            //左辺
            {x: -x   , y: -y+20, side: 3},
        ];

        //外側フレームのオフセット幅
        this.drawPathOffset = 3;
    },

    prerender: function(canvas) {
        var c = canvas.context;

        var x = this.width / 2;
        var y = this.height / 2;

        var p = this.drawPath;
        c.beginPath();
        c.moveTo(p[0].x, p[0].y);
        for (var i = 1; i < p.length; i++) {
            c.lineTo(p[i].x, p[i].y);
        }
        c.closePath();

        var sg = c.createLinearGradient(y, -x, -y, x);
        sg.addColorStop(0.00, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(0.38, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(0.48, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.52, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.62, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(1.00, "hsla(230, 100%, 40%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 5;

        var fg = c.createLinearGradient(y, -x, -y, x);
        fg.addColorStop(0.00, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(0.38, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(0.48, "hsla(250, 100%, 60%, 0.2)");
        fg.addColorStop(0.52, "hsla(250, 100%, 60%, 0.2)");
        fg.addColorStop(0.62, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(1.00, "hsla(250, 100%, 40%, 0.2)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var c = canvas.context;

        var x = this.width / 2;
        var y = this.height / 2;

        var p = this.drawPath;
        var off = this.drawPathOffset;

        c.beginPath();
        c.moveTo(p[0].x-off, p[0].y-off);
        for (var i = 1; i < p.length; i++) {
            var px = p[i].x;
            var py = p[i].y;
            switch (p[i].side) {
                case 0:
                    px += off; py -= off;
                    break;
                case 1:
                    px += off; py += off;
                    break;
                case 2:
                    px -= off; py += off;
                    break;
                case 3:
                    px -= off; py -= off;
                    break;
            }
            c.lineTo(px, py);
        }
        c.closePath();

        c.lineWidth = 2;
        c.stroke();
    },
});

phina.define("phina.extension.CursolFrame", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit(options);
        this.boundingType = "rect";
        this.backgroundColor = "transparent";
        this.strokeWidth = 2;
    },

    prerender: function(canvas) {
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;

        c.beginPath();

        //上辺
        c.moveTo(-x + 10, -y     );
        c.lineTo( x - 10, -y     );

        //右辺
        c.lineTo( x     , -y + 10);
        c.lineTo( x     ,  y - 10);

        //下辺
        c.lineTo( x - 10,  y     );
        c.lineTo(-x + 10,  y     );

        //右辺
        c.lineTo(-x     ,  y - 10);
        c.lineTo(-x     , -y + 10);

        c.closePath();

        var sg = c.createLinearGradient(0, -y,  0, y);
        sg.addColorStop(0.00, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.38, "hsla(230, 100%, 95%, 0.8)");
        sg.addColorStop(0.48, "hsla(230, 100%, 90%, 0.8)");
        sg.addColorStop(0.52, "hsla(230, 100%, 70%, 0.8)");
        sg.addColorStop(0.62, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(1.00, "hsla(230, 100%, 60%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 3;

        var fg = c.createLinearGradient(0, -y, 0, y);
        fg.addColorStop(0.00, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(0.38, "hsla(230, 100%, 80%, 0.8)");
        fg.addColorStop(0.48, "hsla(230, 100%, 60%, 0.8)");
        fg.addColorStop(0.52, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(0.62, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(1.00, "hsla(230, 100%, 50%, 0.8)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;
        c.lineWidth = 3;

        c.moveTo(-x + 10 - 5, -y     );
        c.lineTo(-x      - 5, -y + 10);
        c.lineTo(-x      - 5,  y - 10);
        c.lineTo(-x + 10 - 5,  y     );

        c.moveTo( x - 10 + 5, -y     );
        c.lineTo( x      + 5, -y + 10);
        c.lineTo( x      + 5,  y - 10);
        c.lineTo( x - 10 + 5,  y     );

        this.renderStroke(canvas);
    },
});

phina.define("phina.extension.CircleButton", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit({}.$extend(options, {
            width: options.radius * 2,
            height: options.radius * 2,
        }));

        this.interactive = true;
        this.boundingType = "circle";
        this.radius = options.radius;
        this.backgroundColor = "transparent";
        this.fill = "hsla(230, 100%, 60%, 0.4)";
        this.stroke = "hsla(230, 100%, 60%, 0.9)";
        this.strokeWidth = 2;

        this.active = true;

        this.on('enterframe', function() {
            if (this.active) {
                this.inner.rotation+=0.5;
                this.outer.rotation-=0.5;
            }
        });

        var that = this;
        var options = {
            width: options.radius * 2,
            height: options.radius * 2,
            backgroundColor: "transparent",
            fill: "hsla(230, 100%, 60%, 0.4)",
            stroke: "hsla(230, 100%, 60%, 0.9)",
            strokeWidth: 2
        };
        this.inner = phina.display.Shape(options).addChildTo(this);
        this.inner.postrender = function(canvas) {
            var c = canvas.context;
            c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";
            for (var a = 0, b; a < Math.PI * 2;) {
                b = Math.randfloat(1.0, 2.0);
                c.beginPath();
                c.arc(0, 0, that.radius * 0.90, a, a + b, false);
                c.lineWidth = Math.floor(that.radius*0.2);
                c.stroke();
                a += b * 1.5;
            }
        }
        this.outer = phina.display.Shape(options).addChildTo(this);
        this.outer.postrender = function(canvas) {
            var c = canvas.context;
            c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";
            for (var a = 0, b; a < Math.PI * 2;) {
                b = Math.randfloat(1.0, 2.0);
                c.beginPath();
                c.arc(0, 0, that.radius * 1.00, a, a + b, false);
                c.lineWidth = Math.floor(that.radius*0.2);
                c.stroke();
                a += b * 1.5;
            }
        }
    },

    postrender: function(canvas) {
        var c = canvas.context;

        c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";

        //ボタン本体
        c.beginPath();
        c.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2, false);
        c.lineWidth = 1;
        c.fill();
        c.stroke();

        //ボタン外縁
        c.beginPath();
        c.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2, false);
        c.lineWidth = Math.floor(this.radius*0.1);
        c.stroke();
    },

    onpointstart: function(e) {
        this.scaleX = 1.2;
        this.scaleY = 1.2;
    },

    onpointend: function(e) {
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        if (this.hitTest(e.pointer.x, e.pointer.y)) {
            this.flare("clicked");
        }
    },
});

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


/*
 *  phina.extension.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//スプライト機能拡張
phina.display.Sprite.prototype.setFrameTrimming = function(x, y, width, height) {
  this._frameTrimX = x || 0;
  this._frameTrimY = y || 0;
  this._frameTrimWidth = width || this.image.domElement.width - this._frameTrimX;
  this._frameTrimHeight = height || this.image.domElement.height - this._frameTrimY;
  return this;
}

phina.display.Sprite.prototype.setFrameIndex = function(index, width, height) {
  var sx = this._frameTrimX || 0;
  var sy = this._frameTrimY || 0;
  var sw = this._frameTrimWidth  || (this.image.domElement.width-sx);
  var sh = this._frameTrimHeight || (this.image.domElement.height-sy);

  var tw  = width || this.width;      // tw
  var th  = height || this.height;    // th
  var row = ~~(sw / tw);
  var col = ~~(sh / th);
  var maxIndex = row*col;
  index = index%maxIndex;

  var x   = index%row;
  var y   = ~~(index/row);
  this.srcRect.x = sx+x*tw;
  this.srcRect.y = sy+y*th;
  this.srcRect.width  = tw;
  this.srcRect.height = th;

  this._frameIndex = index;

  return this;
}

/*
 *  SliceSprite.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("phina.display.SliceSprite", {
    superClass: "phina.display.CanvasElement",

    init: function(image, width, height, option) {
        this.superInit();
        this.option = option.$safe({
            sliceX: 2,  //��������
            sliceY: 2,  //�c������
            trimming: { //�g���~���O���
                x: 0,
                y: 0,
                width: width,
                height: height,
            },
        });

        this.image = image;
        this.width = width;
        this.height = height;

        this.sprites = [];
        var i = 0;
        var cw = ~(width/option.sliceX);
        var ch = ~(height/option.sliceY);
        for (var y = 0; y < option.sliceY; y++) {
            for (var x = 0; x < option.sliceX; x++) {
                var s = phina.display.Sprite(image, cw, ch).addChildTo(this);
                s.setFrameIndex(i).setPosition(x*cw-width/2, y*ch-height/2);
                this.sprites.push(s);
                i++;
            }
        }
    },

    //�o���o��
    fallApart: function(func) {
        func = func || function(e) {
            var sx = (e.x==0?0:(e.x>0?1:-1));
            var sy = (e.y==0?0:(e.y>0?1:-1));
            e.tweener.clear()
                .to({x: e.x*10, y:e.y*10, alpha: 0}, 1000, "easeOutSine");
        }
        this.sprites.each(func);
        return this;
    },

    //���ɖ߂�
    reinstate: function() {
        var i = 0;
        var cw = ~(this.width/this.option.sliceX);
        var ch = ~(this.height/this.option.sliceY);
        for (var y = 0; y < this.option.sliceY; y++) {
            for (var x = 0; x < this.option.sliceX; x++) {
                s.rotation = 0;
                s.setPosition(x*cw-this.width/2, y*ch-this.height/2);
                i++;
            }
        }
        return this;
    },
});


/*
 *  SoundSet.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//サウンド管理
phina.define("phina.extension.SoundSet", {

    //サウンドが格納される配列
    elements: null,

    //再生中ＢＧＭ
    bgm: null,
    bgmIsPlay: false,

    //マスターボリューム
    volumeBGM: 0.5,
    volumeSE: 0.5,

    init: function() {
        this.elements = [];
    },

    //登録済みアセット読み込み
    readAsset: function() {
        for (var key in phina.asset.AssetManager.assets.sound) {
            var obj = phina.asset.AssetManager.get("sound", key);
            if (obj instanceof phina.asset.Sound) this.add(key);
        }
    },

    //サウンド追加
    add: function(name, url) {
        if (name === undefined) return null;
        url = url || null;
        if (this.find(name)) return true;

        var e = phina.extension.SoundElement(name);
        if (!e.media) return false;
        this.elements.push(e);
        return true;
    },

    //サウンド検索
    find: function(name) {
        if (!this.elements) return null;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].name == name) return this.elements[i];
        }
        return null;
    },

    //サウンドをＢＧＭとして再生
    playBGM: function(name, loop, callback) {
        if (loop === undefined) loop = true;
        if (this.bgm) {
            this.bgm.stop();
            this.bgmIsPlay = false;
        }
        var media = this.find(name);
        if (media) {
            var vol = this.volumeBGM * media.volume;
            media.setVolume(vol);
            media.play(loop, callback);
            this.bgm = media;
            this.bgmIsPlay = true;
        } else {
            if (this.add(name)) this.playBGM(name);
        }
        return this;
    },

    //ＢＧＭ停止
    stopBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.stop();
                this.bgmIsPlay = false;
            }
            this.bgm = null;
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＢＧＭ再開
    resumeBGM: function() {
        if (this.bgm) {
            if (!this.bgmIsPlay) {
                this.bgm.volume = this.volumeBGM;
                this.bgm.resume();
                this.bgmIsPlay = true;
            }
        }
        return this;
    },

    //ＢＧＭマスターボリューム設定
    setVolumeBGM: function(vol) {
        this.volumeBGM = vol;
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.setVolume(this.volumeBGM);
            this.bgm.resume();
        }
        return this;
    },

    //サウンドをサウンドエフェクトとして再生
    playSE: function(name, loop, callback) {
        var media = this.find(name);
        if (media) {
            var vol = this.volumeSE;
            media.setVolume(vol);
            media.play(loop, callback);
        } else {
            if (this.add(name)) this.playSE(name);
        }
        return this;
    },

    //ループ再生しているSEを停止
    stopSE: function(name) {
        var media = this.find(name);
        if (media) {
            media.stop();
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＳＥマスターボリューム設定
    setVolumeSE: function(vol) {
        this.volumeSE = vol;
        return this;
    },
});

//SoundElement Basic
phina.define("phina.extension.SoundElement", {
    //サウンド名
    name: null,

    //ＵＲＬ
    url: null,

    //サウンド本体
    media: null,

    //ボリューム
    _volume: 1,

    //再生終了時のコールバック関数
    callback: null,

    //再生中フラグ
    playing: false,

    init: function(name) {
        this.name = name;
        this.media = phina.asset.AssetManager.get("sound", name);
        if (this.media) {
            this.media.volume = 1;
            this.media.on('ended', function() {
                if (this.media.loop) this.playing = false;
                if (this.callback) this.callback();
            }.bind(this))
        } else {
            console.warn("asset not found. "+name);
        }
    },

    //サウンドの再生
    play: function(loop, callback) {
        if (loop === undefined) loop = false
        if (!this.media) return this;

        //ループ再生の場合多重再生を禁止
        if (loop && this.playing) return;

        this.media.loop = loop;
        this.media.play();
        this.callback = callback;
        this.playing = true;
        return this;
    },

    //サウンド再生再開
    resume: function() {
        if (!this.media) return this;
        this.media.resume();
        this.playing = true;
        return this;
    },

    //サウンド一時停止
    pause: function () {
        if (!this.media) return this;
        this.media.pause();
        this.playing = false;
    },

    //サウンド停止
    stop: function() {
        if (!this.media) return this;
        this.media.stop();
        this.playing = false;
        return this;
    },

    //ボリューム設定
    setVolume: function(vol) {
        if (!this.media) return this;
        if (vol === undefined) vol = 0;
        this._volume = vol;
        this.media.volume = this._volume;
        return this;
    },

    _accessor: {
        volume: {
            "get": function() { return this._volume; },
            "set": function(vol) { this.setVolume(vol); }
        },
        loop: {
            "get": function() { return this.media.loop; },
            "set": function(f) { this.media.loop = f; }
        },
    }
});

/*
 *  tiledmap.js
 *  2016/9/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phina.asset.TiledMap", {
    superClass: "phina.asset.Asset",

    image: null,

    tilesets: null,
    layers: null,

    init: function() {
        this.superInit();
    },

    _load: function(resolve) {
        //パス抜き出し
        this.path = "";
        var last = this.src.lastIndexOf("/");
        if (last > 0) {
            this.path = this.src.substring(0, last+1);
        }

        //終了関数保存
        this._resolve = resolve;

        // load
        var self = this;
        var xml = new XMLHttpRequest();
        xml.open('GET', this.src);
        xml.onreadystatechange = function() {
            if (xml.readyState === 4) {
                if ([200, 201, 0].indexOf(xml.status) !== -1) {
                    var data = xml.responseText;
                    data = (new DOMParser()).parseFromString(data, "text/xml");
                    self.dataType = "xml";
                    self.data = data;
                    self._parse(data);
//                    resolve(self);
                }
            }
        };
        xml.send(null);
    },

    //マップイメージ取得
    getImage: function() {
        return this.image;
    },

    //オブジェクトグループを配列にして取得
    getObjectGroup: function(groupName) {
        groupName = groupName || null;
        var ls = [];
        var len = this.layers.length;
        for (var i = 0; i < len; i++) {
            if (this.layers[i].type == "objectgroup") {
                if (groupName == null || groupName == this.layers[i].name) {
                    //ディープコピー
                    var obj = {}.$safe(this.layers[i]);
                    obj.objects = [];
                    var len2 = this.layers[i].objects.length;
                    for (var r = 0; r < len2; r++) {
                        var obj2 = {
                            properties: {}.$safe(this.layers[i].objects[r].properties),
                            executed: false,
                        }.$safe(this.layers[i].objects[r]);
                        obj.objects[r] = obj2;
                    }
                }
                ls.push(obj);
            }
        }
        return ls;
    },

    _parse: function(data) {
        //タイル属性情報取得
        var map = data.getElementsByTagName('map')[0];
        var attr = this._attrToJSON(map);
        this.$extend(attr);

        //タイルセット取得
        this.tilesets = this._parseTilesets(data);

        //タイルセット情報補完
        var defaultAttr = {
            tilewidth: 32,
            tileheight: 32,
            spacing: 0,
            margin: 0,
        };
        this.tilesets.chips = [];
        for (var i = 0; i < this.tilesets.length; i++) {
            //タイルセット属性情報取得
            var attr = this._attrToJSON(data.getElementsByTagName('tileset')[i]);
            attr.$safe(defaultAttr);
            attr.firstgid--;
            this.tilesets[i].$extend(attr);

            //マップチップリスト作成
            var t = this.tilesets[i];
            this.tilesets[i].mapChip = [];
            for (var r = attr.firstgid; r < attr.firstgid+attr.tilecount; r++) {
                var chip = {
                    image: t.image,
                    x: ((r - attr.firstgid) % t.columns) * (t.tilewidth + t.spacing) + t.margin,
                    y: Math.floor((r - attr.firstgid) / t.columns) * (t.tileheight + t.spacing) + t.margin,
                }.$safe(attr);
                this.tilesets.chips[r] = chip;
            }
        }

        //レイヤー取得
        this.layers = this._parseLayers(data);

        //イメージデータ読み込み
        this._checkImage();
    },

    //アセットに無いイメージデータを読み込み
    _checkImage: function() {
        var that = this;
        var imageSource = [];
        var loadImage = [];

        //一覧作成
        for (var i = 0; i < this.tilesets.length; i++) {
            var obj = {
                image: this.tilesets[i].image,
                transR: this.tilesets[i].transR,
                transG: this.tilesets[i].transG,
                transB: this.tilesets[i].transB,
            };
            imageSource.push(obj);
        }
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].image) {
                var obj = {
                    image: this.layers[i].image.source
                };
                imageSource.push(obj);
            }
        }

        //アセットにあるか確認
        for (var i = 0; i < imageSource.length; i++) {
            var image = phina.asset.AssetManager.get('image', imageSource[i].image);
            if (image) {
                //アセットにある
            } else {
                //なかったのでロードリストに追加
                loadImage.push(imageSource[i]);
            }
        }

        //一括ロード
        //ロードリスト作成
        var assets = {
            image: []
        };
        for (var i = 0; i < loadImage.length; i++) {
            //イメージのパスをマップと同じにする
            assets.image[imageSource[i].image] = this.path+imageSource[i].image;
        }
        if (loadImage.length) {
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                //透過色設定反映
                loadImage.forEach(function(elm) {
                    var image = phina.asset.AssetManager.get('image', elm.image);
                    if (elm.transR !== undefined) {
                        var r = elm.transR, g = elm.transG, b = elm.transB;
                        image.filter(function(pixel, index, x, y, bitmap) {
                            var data = bitmap.data;
                            if (pixel[0] == r && pixel[1] == g && pixel[2] == b) {
                                data[index+3] = 0;
                            }
                        });
                    }
                });
                //マップイメージ生成
                that.image = that._generateImage();
                //読み込み終了
                that._resolve(that);
            }.bind(this));
        } else {
            //マップイメージ生成
            this.image = that._generateImage();
            //読み込み終了
            this._resolve(that);
        }
    },

    //マップイメージ作成
    _generateImage: function() {
        var numLayer = 0;
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
        }
        if (numLayer == 0) return null;

        var width = this.width * this.tilewidth;
        var height = this.height * this.tileheight;
        var canvas = phina.graphics.Canvas().setSize(width, height);

        for (var i = 0; i < this.layers.length; i++) {
            //マップレイヤー
            if (this.layers[i].type == "layer") {
                var layer = this.layers[i];
                var mapdata = layer.data;
                var width = layer.width;
                var height = layer.height;
                var count = 0;
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var index = mapdata[count];
                        if (index !== -1) {
                            //マップチップを配置
                            this._setMapChip(canvas, index, x * this.tilewidth, y * this.tileheight);
                        }
                        count++;
                    }
                }
            }
            //イメージレイヤー
            if (this.layers[i].type == "imagelayer") {
                var len = this.layers[i];
                var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
                canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
            }
        }

        var texture = phina.asset.Texture();
        texture.domElement = canvas.domElement;
        return texture;
    },

    //キャンバスの指定した座標にマップチップのイメージをコピーする
    _setMapChip: function(canvas, index, x, y) {
        //タイルセットからマップチップを取得
        var chip = this.tilesets.chips[index];
        var image = phina.asset.AssetManager.get('image', chip.image);
        canvas.context.drawImage(
            image.domElement,
            chip.x + chip.margin, chip.y + chip.margin,
            chip.tilewidth, chip.tileheight,
            x, y,
            chip.tilewidth, chip.tileheight);
    },

    //XMLプロパティをJSONに変換
    _propertiesToJSON: function(elm) {
        var properties = elm.getElementsByTagName("properties")[0];
        var obj = {};
        if (properties === undefined) {
            return obj;
        }
        for (var k = 0; k < properties.childNodes.length; k++) {
            var p = properties.childNodes[k];
            if (p.tagName === "property") {
                //propertyにtype指定があったら変換
                var type = p.getAttribute('type');
                var value = p.getAttribute('value');
                if (type == "int") {
                    obj[p.getAttribute('name')] = parseInt(value, 10);
                } else if (type == "float") {
                    obj[p.getAttribute('name')] = parseFloat(value);
                } else {
                    obj[p.getAttribute('name')] = value;
                }
            }
        }
        return obj;
    },

    //XML属性をJSONに変換
    _attrToJSON: function(source) {
        var obj = {};
        for (var i = 0; i < source.attributes.length; i++) {
            var val = source.attributes[i].value;
            val = isNaN(parseFloat(val))? val: parseFloat(val);
            obj[source.attributes[i].name] = val;
        }
        return obj;
    },

    //タイルセットのパース
    _parseTilesets: function(xml) {
        var each = Array.prototype.forEach;
        var self = this;
        var data = [];
        var tilesets = xml.getElementsByTagName('tileset');
        each.call(tilesets, function(tileset) {
            var t = {};
            var props = self._propertiesToJSON(tileset);
            if (props.src) {
                t.image = props.src;
            } else {
                t.image = tileset.getElementsByTagName('image')[0].getAttribute('source');
            }
            //透過色設定取得
            t.trans = tileset.getElementsByTagName('image')[0].getAttribute('trans');
            t.transR = parseInt(t.trans.substring(0, 2), 16);
            t.transG = parseInt(t.trans.substring(2, 4), 16);
            t.transB = parseInt(t.trans.substring(4, 6), 16);

            data.push(t);
        });
        return data;
    },

    //レイヤー情報のパース
    _parseLayers: function(xml) {
        var each = Array.prototype.forEach;
        var data = [];

        var map = xml.getElementsByTagName("map")[0];
        var layers = [];
        each.call(map.childNodes, function(elm) {
            if (elm.tagName == "layer" || elm.tagName == "objectgroup" || elm.tagName == "imagelayer") {
                layers.push(elm);
            }
        });

        layers.each(function(layer) {
            switch (layer.tagName) {
                case "layer":
                    //通常レイヤー
                    var d = layer.getElementsByTagName('data')[0];
                    var encoding = d.getAttribute("encoding");
                    var l = {
                        type: "layer",
                        name: layer.getAttribute("name"),
                    };

                    if (encoding == "csv") {
                        l.data = this._parseCSV(d.textContent);
                    } else if (encoding == "base64") {
                        l.data = this._parseBase64(d.textContent);
                    }

                    var attr = this._attrToJSON(layer);
                    l.$extend(attr);

                    data.push(l);
                    break;

                //オブジェクトレイヤー
                case "objectgroup":
                    var l = {
                        type: "objectgroup",
                        objects: [],
                        name: layer.getAttribute("name"),
                    };
                    each.call(layer.childNodes, function(elm) {
                        if (elm.nodeType == 3) return;
                        var d = this._attrToJSON(elm);
                        d.properties = this._propertiesToJSON(elm);
                        l.objects.push(d);
                    }.bind(this));

                    data.push(l);
                    break;

                //イメージレイヤー
                case "imagelayer":
                    var l = {
                        type: "imagelayer",
                        name: layer.getAttribute("name"),
                        x: parseFloat(layer.getAttribute("offsetx")) || 0,
                        y: parseFloat(layer.getAttribute("offsety")) || 0,
                        alpha: layer.getAttribute("opacity") || 1,
                        visible: (layer.getAttribute("visible") === undefined || layer.getAttribute("visible") != 0),
                    };
                    var imageElm = layer.getElementsByTagName("image")[0];
                    l.image = {source: imageElm.getAttribute("source")};

                    data.push(l);
                    break;
            }
        }.bind(this));
        return data;
    },

    //CSVパース
    _parseCSV: function(data) {
        var dataList = data.split(',');
        var layer = [];

        dataList.each(function(elm, i) {
            var num = parseInt(elm, 10) - 1;
            layer.push(num);
        });

        return layer;
    },

    /**
     * BASE64パース
     * http://thekannon-server.appspot.com/herpity-derpity.appspot.com/pastebin.com/75Kks0WH
     * @private
     */
    _parseBase64: function(data) {
        var dataList = atob(data.trim());
        var rst = [];

        dataList = dataList.split('').map(function(e) {
            return e.charCodeAt(0);
        });

        for (var i=0,len=dataList.length/4; i<len; ++i) {
            var n = dataList[i*4];
            rst[i] = parseInt(n, 10) - 1;
        }

        return rst;
    },
});

//ローダーに追加
phina.asset.AssetLoader.assetLoadFunctions.tmx = function(key, path) {
    var tmx = phina.asset.TiledMap();
    return tmx.load(path);
};

/*
 *  Application.js
 *  2015/09/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespace pbr(PlanetBusterRevision)
let pbr = {};

phina.define("Application", {
    superClass: "phina.display.CanvasApp",

	_static: {
        version: "0.0.1",
        stageName: {
            1: "Operation PLANET_BUSTER",
            2: "Dance in the Sky",
        },
        assets: {
            "preload": {
                sound: {
                    "start":         "assets/sounds/soundlogo40.mp3",
                    "setting":       "assets/sounds/receipt05.mp3",
                    "warning":       "assets/sounds/bgm_warning.mp3",
                    "powerup":       "assets/sounds/ta_ta_suraido01.mp3",
                    "explodeSmall":  "assets/sounds/sen_ge_taihou03.mp3", 
                    "explodeLarge":  "assets/sounds/sen_ge_hasai01.mp3", 
                    "explodeBoss":   "assets/sounds/se_maoudamashii_explosion02.mp3",
                    "explodePlayer": "assets/sounds/ta_ta_zuban_d01.mp3", 
                    "bomb":          "assets/sounds/bomb.mp3",
                    "playermiss":    "assets/sounds/ta_ta_zuban_d01.mp3",
                    "stageclear":    "assets/sounds/bgm_stageclear.mp3",
                    "gameover":      "assets/sounds/soundlogo9.mp3",
                    "cancel":        "assets/sounds/se_maoudamashii_system20.mp3",
                    "select":        "assets/sounds/se_maoudamashii_system36.mp3",
                    "click":         "assets/sounds/se_maoudamashii_system26.mp3",
                    "click2":        "assets/sounds/click2.mp3",
                    "boss":          "assets/sounds/bgm_maoudamashii_neorock10.mp3",
                },
                font: {
                    "UbuntuMono":   "fonts/UbuntuMono-Bold.ttf",
                    "Orbitron":     "fonts/Orbitron-Regular.ttf",
                }
            },
            "common": {
                image: {
                    "tex1":     "assets/images/tex1.png",
                    "tex2":     "assets/images/tex2.png",
                    "tex_boss1":"assets/images/tex_boss1.png",
                    "bullet":   "assets/images/bullet.png",
                    "gunship":  "assets/images/gunship1.png",
                    "bit":      "assets/images/bit1.png",                    
                    "shot":     "assets/images/shot.png",
                    "effect":   "assets/images/effect.png",
                    "bomb":     "assets/images/bomb.png",
                    "particle": "assets/images/particle.png",
                    "map1g":    "assets/maps/map1.png",
                },
            },
            "stage1": {
                sound: {
                    "stage1":        "assets/sounds/expsy.mp3",
                },
            },
            "stage2": {
                sound: {
                    "stage2":        "assets/sounds/dance_in_the_sky.mp3",
                },
            },
            "stage9": {
                sound: {
                    "stage9":        "assets/sounds/departure.mp3",
                },
                tmx: {
                    "map1":          "assets/maps/map1.tmx",
                    "map1_enemy":    "assets/maps/map1_enemy.tmx",
                },
            },
        },
    },

    _member: {
        //ゲーム内情報
        difficulty: 1,  //難易度
        score: 0,       //スコア
        rank: 1,        //難易度ランク
        numContinue: 0, //コンティニュー回数

        //エクステンド設定
        extendScore: [500000, 2000000, 5000000],
        extendAdvance: 0,
        isExtendEvery: false,
        extendEveryScore: 500000,

        //プレイヤー設定
        setting: {
            zanki: 3,       //残機
            bombStock: 2,   //ボム残数
            bombStockMax: 2,//ボム最大数
            autoBomb: false,//オートボムフラグ
        },

        //デフォルト設定
        _defaultSetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,

            //エクステンド設定
            extendScore: [500000, 2000000, 5000000],
            isExtendEvery: false,
            extendEveryScore: 500000,
        },

        //現在設定
        currentrySetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,
        },

        //ＢＧＭ＆効果音
        soundset: null,

        //バックグラウンドカラー
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
        });
        this.$extend(this._member);

        this.fps = 60;
/*
        this.canvas.context.imageSmoothingEnabled = true;
        this.domElement.style.imageRendering = "pixelated";
*/
        //設定情報の読み込み
        this.loadConfig();

        //ＢＧＭ＆ＳＥ
        this.soundset = phina.extension.SoundSet();

        //ゲームパッドを使用する
        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.updateController();
        });

        this.replaceScene(SceneFlow());
    },

    //コントローラー情報の更新
    updateController: function() {
        var gp = this.gamepad;
        var kb = this.keyboard;
        var angle1 = gp.getKeyAngle();
        var angle2 = kb.getKeyAngle();
        this.controller = {
            angle: angle1 !== null? angle1: angle2,

            up: gp.getKey("up") || kb.getKey("up"),
            down: gp.getKey("down") || kb.getKey("down"),
            left: gp.getKey("left") || kb.getKey("left"),
            right: gp.getKey("right") || kb.getKey("right"),

            shot: gp.getKey("A") || kb.getKey("Z"),
            bomb: gp.getKey("B") || kb.getKey("X"),
            special1: gp.getKey("X") || kb.getKey("C"),
            special2: gp.getKey("Y") || kb.getKey("V"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space"),
            cancel: gp.getKey("B") || kb.getKey("X"),

            start: gp.getKey("start"),
            select: gp.getKey("select"),

            analog1: gp.getStickDirection(0),
            analog2: gp.getStickDirection(1),
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();

        //特殊効果用ビットマップ作成
        [
            "tex1",
            "tex2",
            "tex_boss1",
            "gunship",
            "bit",
        ].forEach(function(name) {
            //ダメージ用
            if (!phina.asset.AssetManager.get("image", name+"White")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = (pixel[0] == 0? 0: 128); //r
                    data[index+1] = (pixel[1] == 0? 0: 128); //g
                    data[index+2] = (pixel[2] == 0? 0: 128); //b
                });
                phina.asset.AssetManager.set("image", name+"White", tex);
            }
            //瀕死用
            if (!phina.asset.AssetManager.get("image", name+"Red")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = pixel[0];
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Red", tex);
            }
            //影用
            if (!phina.asset.AssetManager.get("image", name+"Black")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Black", tex);
            }
        });
    },

    //設定データの保存
    saveConfig: function() {
        return this;
    },

    //設定データの読み込み
    loadConfig: function() {
        return this;
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset, loop) {
        this.soundset.playSE(asset, loop);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});

/*
 *  main.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
//バージョンナンバー
const _VERSION_ = "0.1.0";

//デバッグフラグ
const DEBUG = false;
const MUTEKI = false;
const VIEW_COLLISION = false;

//スクリーンサイズ
const SC_W = 320;
const SC_H = 480;
const SC_OFFSET_X = 0;
const SC_OFFSET_Y = 0;
const SC_W_C = SC_W*0.5;   //CENTER
const SC_H_C = SC_H*0.5;

//レイヤー区分
const LAYER_SYSTEM = 12;          //システム表示
const LAYER_FOREGROUND = 11;      //フォアグラウンド
const LAYER_EFFECT_UPPER = 10;    //エフェクト上位
const LAYER_PLAYER = 9;           //プレイヤー
const LAYER_BULLET = 8;           //弾
const LAYER_SHOT = 7;             //ショット
const LAYER_OBJECT_UPPER = 6;     //オブジェクト上位
const LAYER_OBJECT_MIDDLE = 5;    //オブジェクト中間
const LAYER_EFFECT_MIDDLE = 4;    //エフェクト中間
const LAYER_OBJECT_LOWER = 3;     //オブジェクト下位
const LAYER_EFFECT_LOWER = 2;     //エフェクト下位
const LAYER_SHADOW = 1;           //影
const LAYER_BACKGROUND = 0;       //バックグラウンド

//敵タイプ定数
const ENEMY_SMALL = 0;
const ENEMY_MIDDLE = 1;
const ENEMY_LARGE = 2;
const ENEMY_MBOSS = 3;
const ENEMY_BOSS = 4;
const ENEMY_BOSS_EQUIP = 5; //ボス装備
const ENEMY_ITEM = 9;

//爆発タイプ定数
const EXPLODE_NOTHING = -1;
const EXPLODE_SMALL = 0;
const EXPLODE_MIDDLE = 1;
const EXPLODE_LARGE = 2;
const EXPLODE_GROUND = 3;
const EXPLODE_MBOSS = 4;
const EXPLODE_BOSS = 5;

//アイテム種類
const ITEM_POWER = 0;
const ITEM_BOMB = 1;
const ITEM_1UP = 0;

var KEYBOARD_MOVE = {
      0: { x:  1.0, y:  0.0 },
     45: { x:  0.7, y: -0.7 },
     90: { x:  0.0, y: -1.0 },
    135: { x: -0.7, y: -0.7 },
    180: { x: -1.0, y:  0.0 },
    225: { x: -0.7, y:  0.7 },
    270: { x:  0.0, y:  1.0 },
    315: { x:  0.7, y:  0.7 },
};

//インスタンス
var app;

window.onload = function() {
    app = Application();
    app.domElement.addEventListener('click', function dummy() {
        var context = phina.asset.Sound.getAudioContext();
        context.resume();
    });
    app.run();
    app.enableStats();
};

/*
 *  danmaku.utility.js
 *  2015/12/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {
    var action = bulletml.dsl.action;
    var actionRef = bulletml.dsl.actionRef;
    var bullet = bulletml.dsl.bullet;
    var bulletRef = bulletml.dsl.bulletRef;
    var fire = bulletml.dsl.fire;
    var fireRef = bulletml.dsl.fireRef;
    var changeDirection = bulletml.dsl.changeDirection;
    var changeSpeed = bulletml.dsl.changeSpeed;
    var accel = bulletml.dsl.accel;
    var wait = bulletml.dsl.wait;
    var vanish = bulletml.dsl.vanish;
    var repeat = bulletml.dsl.repeat;
    var bindVar = bulletml.dsl.bindVar;
    var notify = bulletml.dsl.notify;
    var direction = bulletml.dsl.direction;
    var speed = bulletml.dsl.speed;
    var horizontal = bulletml.dsl.horizontal;
    var vertical = bulletml.dsl.vertical;
    var fireOption = bulletml.dsl.fireOption;
    var offsetX = bulletml.dsl.offsetX;
    var offsetY = bulletml.dsl.offsetY;
    var autonomy = bulletml.dsl.autonomy;

    //弾種
    var RS  = bullet({type: "normal", color: "red", size: 0.6});
    var RM  = bullet({type: "normal", color: "red", size: 0.8});
    var RL  = bullet({type: "normal", color: "red", size: 1.0});
    var RES = bullet({type: "roll", color: "red", size: 0.6});
    var REM = bullet({type: "roll", color: "red", size: 1.0});

    var BS  = bullet({type: "normal", color: "blue", size: 0.6});
    var BM  = bullet({type: "normal", color: "blue", size: 0.8});
    var BL  = bullet({type: "normal", color: "blue", size: 1.0});
    var BES = bullet({type: "roll", color: "blue", size: 0.6});
    var BEM = bullet({type: "roll", color: "blue", size: 1.0});

    var THIN = bullet({ type: "THIN" });

    var DM  = bullet({ dummy: true });

    var wait = bulletml.dsl.wait;
    var speed = bulletml.dsl.speed;

    bulletml.dsl.interval = function(v) {
        return wait("{0} * (0.3 + (1.0 - $densityRank) * 0.7)".format(v));
    };
    bulletml.dsl.spd = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v));
    };
    bulletml.dsl.spdSeq = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v), "sequence");
    };

    bulletml.dsl.rank = function() {
        return "$difficulty + ($rank*0.01)-1";
    };

    /*自機弾
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.bullet} bullet 弾種
     */
    bulletml.dsl.fireAim0 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(0)) };
    bulletml.dsl.fireAim1 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-2, 2))) };
    bulletml.dsl.fireAim2 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-4, 4))) };
    //ウィップ用
    bulletml.dsl.fireAim0Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim0(bullet, speed);
        };
    };
    bulletml.dsl.fireAim1Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim1(bullet, speed);
        };
    };
    bulletml.dsl.fireAim2Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim2(bullet, speed);
        };
    };

    /*自機狙いNway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 自機を０とした開始角度
     * @param {number} rangeTo 自機を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.nway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(rangeFrom), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.nwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy);
        };
    };

    /**
     * 絶対Nway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 真上を０とした開始角度
     * @param {number} rangeTo 真上を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteNway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY) {
        return action([
            fire(bullet || RS, speed, $direction(rangeFrom, "absolute"), offsetX, offsetY),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.absoluteNwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY);
        };
    };

    /**
     * 自機狙いサークル弾
     * @param {number} way 一度に射出する弾数
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.circle = function(way, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(0), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.circleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
    };

    /**
     * 絶対サークル弾
     * @param {number} way 一度に射出する弾数
     * @param {number} dir 真上を０とした基準角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteCircle = function(way, dir, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(dir, "absolute"), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.absoluteCircleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
    };

    /**
     * ウィップ
     * @param {bulletml.Speed} baseSpeed 初回のスピード
     * @param {number} delta 2回目以降のスピード増分
     * @param {number} count 回数
     * @param {function(bulletml.Speed):bulletml.Action} スピードを受け取りActionを返す関数
     */
    bulletml.dsl.whip = function(baseSpeed, delta, count, actionFunc) {
        return action([
            actionFunc(baseSpeed),
            repeat(count + "-1", [
                actionFunc(bulletml.dsl.spdSeq(delta)),
            ]),
        ]);
    };
});


/*
 *  dialog.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("ConfirmDialog", {
    superClass: phina.app.DisplayScene,

    answer: null,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:3 },

    init: function(caption, button, fontSize) {
        this.superInit();
        
        button = button || ["OK", "CANCEL"];
        fontSize = fontSize || 50;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var that = this;
        var width = SC_W-28, height = 90;
        var param = {fillStyle:'rgba(0,80,0,1)', lineWidth:4};

        //キャプション
        if (caption instanceof Array) {
            phina.display.Label(caption[0], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.39);
            phina.display.Label(caption[1], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.43);
        } else {
            phina.display.Label(caption, fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.42);
        }

        //ＹＥＳ
        phina.extension.Button(width, height, button[0], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addEventListener("pushed", function() {
                that.answer = true;
                appMain.popScene();
            });

        //ＮＯ
        phina.extension.Button(width, height, button[1], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.58)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});

var DEFALT_ALERTPARAM = {
    height: SC_H*0.35,
    text1: "text",
    text2: null,
    text3: null,
    fontSize: 32,
    button: "OK",
}

phina.define("shotgun.AlertDialog", {
    superClass: phina.app.DisplayScene,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:2 },

    init: function(param) {
        this.superInit();
        param = {}.$extend(DEFALT_ALERTPARAM, param);

        //バックグラウンド
        phina.display.RoundRectangleShape({width: SC_W-20, height: param.height, fillStyle: appMain.bgColor, lineWidth: 4})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        var that = this;
        var width = SC_W-28, height = 90;

        //キャプション
        var pos = SC_H*0.47;
        if (param.text2) pos -= SC_H*0.05;
        if (param.text3) pos -= SC_H*0.05;

        var lb = phina.display.Label(param.text1, param.fontSize).addChildTo(this);
        lb.setParam(this.labelParam);
        lb.setPosition(SC_W*0.5, pos);

        if (param.text2) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text2, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }
        if (param.text3) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text3, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }

        //ボタン
        phina.extension.Button(width, height, param.button, {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});

/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Bullet", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BULLET,

    //射出した敵のID
    id: -1,

    //BulletML Runnner
    runner: null,

    //移動係数
    vx: 0,
    vy: 1,

    //加速度
    accel: 1.0,

    //回転
    rollAngle: 5,
    rolling: true,

    //経過時間
    time: 0,

    DEFAULT_PARAM: {
        id: -1,
        type: "RS",
        x: SC_W*0.5,
        y: SC_H*0.5,
        vx: 0,
        vy: 1,
    },

    _static: {
        globalSpeedRate: 1.0,
    },

    init: function() {
        this.superInit();

        this.boundingType = "circle";
        this.radius = 2;

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        //弾画像
        this.sprite = phina.display.Sprite("bullet", 24, 24).addChildTo(this);

        this.on("enterframe", function(app){
            if (this.rolling) this.rotation += this.rollAngle;
            var runner = this.runner;
            if (runner) {
                var bx = this.x;
                var by = this.y;
                runner.x = bx;
                runner.y = by;
                runner.update();
                var acc = Bullet.globalSpeedRate * this.wait;
                this.vx = (runner.x - bx);
                this.vy = (runner.y - by);
                this.x += this.vx * acc;
                this.y += this.vy * acc;

                //画面範囲外
                if (this.x < -16 || this.x > SC_W+16 || this.y < -16 || this.y > SC_H+16) {
                    this.remove();
                    return;
                }

                //自機との当り判定チェック
                if (!this.dummy && this.time % 2) {
                    var player = this.bulletLayer.parentScene.player;
                    if (player.isCollision) {
                        if (this.isHitElement(player) ) {
                            if (player.damage()) this.remove();
                            return;
                        }
                    }
                }
                this.time++;
            }
        }.bind(this));

        //リムーブ時
        this.on("removed", function(){
            this.bulletLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(runner, spec) {
        this.id = 0;
        this.x = runner.x;
        this.y = runner.y;
        this.runner = runner;

        this.sprite.setOrigin(0.5, 0.5);

        if (spec.dummy) {
            this.dummy = true;
            this.sprite.visible = false;
        } else {
            //弾種別グラフィック
            var size = spec.size || 1.0, index = 0;
            switch (spec.type) {
                case "normal":
                    this.rolling = true;
                    index = 0;
                    if (spec.color == "blue") index = 1;
                    break;
                case "roll":
                    this.rolling = true;
                    index = 8;
                    if (spec.color == "blue") index = 24;
                    break;
                case "THIN":
                    this.rolling = false;
                    index = 3;
                    this.rotation = this.runner.direction*toDeg-90;
                    this.sprite.setOrigin(0.5, 0.0);
                    break;
            }
            this.sprite.setFrameIndex(index).setScale(size);
            this.dummy = false;
            this.sprite.visible = true;

            //弾に発射時ウェイトが掛るフレーム数
            var pauseFrame = 45;
            this.wait = 0.3;
            this.setScale(0.1);
            this.tweener.clear().to({scaleX: 1.0, scaleY:1.0, wait: 1.0}, pauseFrame, "easeInOutSine");

            this.time = 0;
        }
        return this;
    },

    erase: function() {
        if (!this.dummy) {
            var layer = this.bulletLayer.parentScene.effectLayerUpper;
            layer.enterBulletVanish({
                position: {x: this.x, y: this.y},
                velocity: {x: this.vx, y: this.vy, decay: 0.99},
            });
        }
    },
});


/*
 *  bulletconfig.js
 *  2015/11/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

    phina.define("BulletConfig", {
        init: function() {},
        _static: {
            speedRate: 3,
            target: null,
            bulletLayer: null,

            setup: function(target, bulletLayer) {
                this.target = target;
                this.bulletLayer = bulletLayer;

                //難易度(int)(0:easy 1:normal 2:hard 3:death)
                this.put("difficulty", 1);

                //ゲーム難易度ランク(int)
                this.put("rank", 1);

                //弾速(float)
                this.put("speedBase", 1.00);
                this.put("speedRank", 0.00);

                //弾密度(float 0.00-1.00)
                this.put("densityRank", 0.00);

                //弾数増加数(int)
                this.put("burst", 0);
            },

            createNewBullet: function(runner, spec) {
                if (spec.option) {
                    this.bulletLayer.enterBullet(runner, spec.option);
                } else {
                    this.bulletLayer.enterBullet(runner, spec);
                }
            },

            put: function(name, value) {
                bulletml.Walker.globalScope["$" + name] = value;
            },
        }
    });

});

/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("BulletLayer", {
    superClass: "phina.display.DisplayElement",

    _member: {
        max: 256,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = Bullet();
            b.bulletLayer = self;
            b.parentScene = app.currentScene;
            return b;
        });
    },

    //弾投入
    enterBullet: function(runner, spec) {
        //ボス以外の地上物の場合、プレイヤーに近接してたら弾を撃たない
        var host = runner.host;
        if (host.isGround && !host.isBoss) {
            var dis = distanceSq(runner, this.parentScene.player);
            if (dis < 4096) return;
        }
        var b = this.pool.shift();
        if (!b) {
            console.warn("Bullet empty!!");
            return null;
        }
        b.setup(runner, spec).addChildTo(this);
        return b;
    },

    //射出IDに合致する弾を消去（未指定時全消去）
    erase: function(id) {
        var all = (id === undefined? true: false);
        var list = this.children.slice();
        var len = list.length;
        var b;
        if (all) {
            for (var i = 0; i < len; i++) {
                b = list[i];
                if (b instanceof Bullet) {
                    b.erase();
                    b.remove();
                }
            }
        } else {
            for (var i = 0; i < len; i++) {
                b = list[i];
                if (b instanceof Bullet && id == b.id) {
                    b.erase();
                    b.remove();
                }
            }
        }
    },
});

/*
 *  Effect.js
 *  2014/07/10
 *  @auther minimo  
 *  This Program is MIT license.
 */
Effect = [];

//汎用エフェクト
phina.define("Effect.EffectBase", {
    superClass: "phina.display.Sprite",

    _member: {
        //インデックス更新間隔
        interval: 2,

        //開始インデックス
        startIndex: 0,

        //最大インデックス
        maxIndex: 8,

        //現在インデックス
        index: 0,

        //遅延表示フレーム数
        delay: 0,

        //ループフラグ
        loop: false,

        //シーンから削除フラグ
        isRemove: false,

        //加速度
        velocity: {},

        //地上エフェクトフラグ
        ifGround: false,

        time: 0,
    },

    defaultOption: {
        name: "noname",
        assetName: "effect",
        width: 64,
        height: 64,
        interval: 2,
        startIndex: 0,
        maxIndex: 17,
        sequence: null,
        delay: 0,
        loop: false,
        enterframe: null,
        isGround: false,
        trimming: null,
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        rotation: 0,
        alpha: 1.0,
        scale: {x: 1.0, y: 1.0},
        blendMode: "source-over",
    },

    init: function() {
        this.superInit("effect");
        this.$extend(this._member);

        this.tweener.setUpdateType('fps');

        this.velocity = {
            x: 0,       //Ｘ座標方向
            y: 0,       //Ｙ座標方向
            decay: 1.0  //減衰率
        };

        this.on("enterframe", this.defaultEnterframe);

        //リムーブ時
        this.on("removed", function(){
            this.effectLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        if (this.assetName != option.assetName) {
            this.image = phina.asset.AssetManager.get('image', option.assetName);
            this.assetName = option.assetName;
        }
        this.width = option.width;
        this.height = option.height;

        //初期値セット
        this.name = option.name;
        this.interval = option.interval;
        this.startIndex = option.startIndex;
        this.maxIndex = option.maxIndex;
        this.sequence = option.sequence;
        this.seqIndex = 0;
        this.delay = option.delay;
        if (this.delay < 0) this.delay *= -1;
        this.loop = option.loop;
        this.time = -this.delay;

        //αブレンド設定
        this.alpha = option.alpha;
        this.blendMode = option.blendMode;

        //トリミング設定
        var tr = option.trimming || {x:0, y: 0, width: this.image.width, height: this.image.height};
        this.setFrameTrimming(tr.x, tr.y, tr.width, tr.height);

        this.index = this.startIndex;
        if (this.sequence) this.index = this.sequence[0];
        this.setFrameIndex(this.index);

        this.setPosition(option.position.x, option.position.y);
        this.setVelocity(option.velocity.x, option.velocity.y, option.velocity.decay);
        this.rotation = option.rotation;
        this.scaleX = option.scale.x;
        this.scaleY = option.scale.y;

        this.isRemove = false;
        this.visible = false;

        //Tweenerリセット
        this.tweener.clear();

        return this;
    },

    defaultEnterframe: function() {
        if (this.time < 0) {
            this.visible = false;
            this.time++;
            return;
        }
        if (this.time == 0) this.visible = true;

        //地上物現座標調整
        if (this.isGround) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        if (this.time % this.interval == 0) {
            this.setFrameIndex(this.index);
            if (this.sequence) {
                this.index = this.sequence[this.seqIndex];
                this.seqIndex++;
                if (this.seqIndex == this.sequence.length) {
                    if (this.loop) {
                        this.seqIndex = 0;
                    } else {
                        this.isRemove = true;
                    }
                }
            } else {
                this.index++;
                if (this.index > this.maxIndex) {
                    if (this.loop) {
                        this.index = this.startIndex;
                    } else {
                        this.isRemove = true;
                    }
                }
            }
        }
        //画面範囲外
        if (this.x < -32 || this.x > SC_W+32 || this.y < -32 || this.y > SC_H+32) {
            this.isRemove = true;
        }

        this.addVelocity();
        this.time++;
        if (this.isRemove) {
            this.removeChildren();
            this.remove();
        }
    },

    //現在の座標に加速度を加算
    addVelocity: function() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= this.velocity.decay;
        this.velocity.y *= this.velocity.decay;
        return this;
    },

    //加速度の設定
    setVelocity: function(x, y, decay) {
        decay = decay || 1;
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.decay = decay;
        return this;        
    },

    //ループ設定
    setLoop: function(b) {
        this.loop = b;
        return this;
    }
});

/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("EffectPool", {
    init: function(size, parentScene) {
        this.pool = null;
        this.max = size || 256;

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var e = Effect.EffectBase();
            e.effectLayer = self;
            e.parentScene = parentScene;
            return e;
        });
    },

    //取得
    shift: function() {
        var e = this.pool.shift();
        return e;
    },

    //戻し
    push: function(e) {
        this.pool.push(e);
        return this;
    },
});

phina.define("EffectLayer", {
    superClass: "phina.display.DisplayElement",

    //エフェクト投入時デフォルトオプション
    defaultOption: {
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        delay: 0
    },

    init: function(pool) {
        this.superInit();
        this.pool = pool;
    },

    //エフェクト投入
    enter: function(option) {
        var e = this.pool.shift();
        if (!e) {
            console.warn("Effect empty!!");
            return null;
        }
        e.setup(option).addChildTo(this);
        return e;
    },

    //爆発（標準）
    enterExplode: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explode",
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            rotation: option.rotation
        }));
        return e;
    },

    //爆発（小）
    enterExplodeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 8,
            maxIndex: 15,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（極小）
    enterExplodeSmall2: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall2",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（大）
    enterExplodeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeLarge",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 192, width: 192, height: 96},
        }));
        return e;
    },

    //爆発（地上）
    enterExplodeGround: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeGround",
            assetName: "effect",
            width: 32,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 192, width: 256, height: 48},
        }));
        e.isGround = true;
        e.groundX = this.parentScene.ground.x;
        e.groundY = this.parentScene.ground.y;
        return e;
    },

    //破片
    enterDebri: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        size = option.size || 0;
        size = Math.clamp(size, 0, 3);
        if (size == 0) {
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                trimming: {x: 192, y: 128, width: 64, height: 48},
            }));
            return e;
        } else {
            size--;
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: size*8,
                maxIndex: (size+1)*8-1,
                trimming: {x: 384, y: 128, width: 128, height: 48},
            }));
            return e;
        }
    },

    //小破片
    enterDebriSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "debri",
            assetName: "effect",
            width: 8,
            height: 8,
            interval: 2,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 192, y: 128, width: 64, height: 48},
        }));
        return e;
    },

    //ショット着弾
    enterShotImpact: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "shotImpact",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 240, width: 128, height: 16},
        }));
        return e;
    },

    //敵弾消失
    enterBulletVanish: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bulletVanish",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 336, width: 128, height: 48},
        }));
        return e;
    },

    //プレイヤー被弾
    enterExplodePlayer: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodePlayer",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 288, width: 384, height: 48},
        }));
        return e;
    },

    //アフターバーナー
    enterAfterburner: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "afterburner",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            sequence: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 
        }));
        if (e) e.tweener.clear().to({alpha:0}, 60, "easeInOutSine");
        return e;
    },

    //スパーク
    enterSpark: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "spark",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 4,
            startIndex: 0,
            maxIndex: 2,
            trimming: {x: 0, y: 384, width: 64, height: 32},
        }));
        return e;
    },

    //ボム
    enterBomb: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bomb",
            assetName: "bomb",
            width: 96,
            height: 96,
            interval: 3,
            startIndex: 0,
            maxIndex: 16,
        }));
        return e;
    },

    //スモーク(小）
    enterSmokeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 5,
            startIndex: 0,
            maxIndex: 4,
            trimming: {x: 128, y: 128, width: 64, height: 16},
        }));
        return e;
    },

    //スモーク(中）
    enterSmoke: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 24,
            height: 24,
            interval: 5,
            startIndex: 0,
            maxIndex: 5,
            trimming: {x: 128, y: 160, width: 120, height: 24},
        }));
        return e;
    },

    //スモーク(大）
    enterSmokeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 5,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 256, y: 128, width: 128, height: 64},
        }));
        return e;
    },

    //パーティクル
    enterParticle: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var trim = {x: 0, y: 0, width: 256, height: 16};
        switch (option.color) {
            case 'red':
                trim = {x: 0, y: 16, width: 256, height: 16};
                break;
            case 'green':
                trim = {x: 0, y: 32, width: 256, height: 16};
                break;
             default:
                trim = {x: 0, y: 0, width: 256, height: 16};
        }
        var e = this.enter(option.$extend({
            name: "particle",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 16,
            trimming: trim,
        }));
        return e;
    },
});

/*
 *  EffectUtility.js
 *  2014/08/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

Effect.defaultOption = {
    position: {x: SC_W*0.5, y: SC_H*0.5},
    velocity: {x: 0, y: 0, decay: 0},
    rotation: 0,
    delay: 0
};

//爆発エフェクト投入（標準）
Effect.enterExplode = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplode(option);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（小）
Effect.enterExplodeSmall = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplode(option);

    var val = rand(3, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（大）
Effect.enterExplodeLarge = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplodeLarge(option);

    var val = rand(10, 20);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（地上）
Effect.enterExplodeGround = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    option.rotation = 0;
    layer.enterExplodeGround(option);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//破片投入
Effect.enterDebris = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    num = option.num || 5;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        layer.enterDebri({
            size: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//小破片投入
Effect.enterDebrisSmall = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
    num = option.num || 5;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(3, 5);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        layer.enterDebri({
            size: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//ボムエフェクト投入
Effect.enterBomb = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);

    var x = option.position.x;
    var y = option.position.y;
    layer.enterBomb({
        position: {x: x, y: y},
        velocity: {x: 0, y: 0, decay: 1},
        scale: {x: 3.0, y: 3.0},
    });
    layer.enterBomb({
        position: {x: x, y: y},
        velocity: {x: 0, y: 0, decay: 1},
        scale: {x: 3.0, y: 3.0},
        delay: 40,
    });
	var rad = 0;
	for( var i = 0; i < 40; i++ ){
		var rad2 = rad;
		var r = 7;
		var bx = Math.sin(rad2)*i*r;
		var by = Math.cos(rad2)*i*r;
		var delay = 2*i;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad+=0.3;
	}
}


/*
 *  patticle.js
 *  2016/04/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

var PARTICLE_VELOCITY_RANGE_X = 8;    // 速度の初期値の範囲 x
var PARTICLE_VELOCITY_RANGE_Y = 6;    // 速度の初期値の範囲 y
var PARTICLE_ACCELERATION_Y   = -0.5; // 加速度 y
var PARTICLE_SCALE            = 1;    // 初期スケール
var PARTICLE_SCALE_DOWN_SPEED = 0.025;// スケールダウンのスピード

phina.define("Effect.Particle", {
    superClass: 'phina.display.CircleShape',

    _static: {
        defaultColor: {
            start: 10, // color angle の開始値
            end: 30,   // color angle の終了値
        },
    },

    init: function(option) {
        this.superInit({
            stroke: false,
            radius: 64,
        });

        this.blendMode = 'lighter';

        var color = option.color || Effect.Particle.defaultColor;
        var grad = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        grad.addColorStop(0, 'hsla({0}, 75%, 50%, 1.0)'.format(Math.randint(color.start, color.end)));
        grad.addColorStop(1, 'hsla({0}, 75%, 50%, 0.0)'.format(Math.randint(color.start, color.end)));

        this.fill = grad;
    
        this.beginPosition = Vector2();
        this.velocity = Vector2();
        this.reset(x, y);
    },

    reset: function(x, y) {
        this.beginPosition.set(x, y);
        this.position.set(this.beginPosition.x, this.beginPosition.y);
        this.velocity.set(
            Math.randint(-PARTICLE_VELOCITY_RANGE_X, PARTICLE_VELOCITY_RANGE_X),
            Math.randint(-PARTICLE_VELOCITY_RANGE_Y, PARTICLE_VELOCITY_RANGE_Y)
        );
        this.scaleX = this.scaleY = Math.randfloat(PARTICLE_SCALE*0.8, PARTICLE_SCALE*1.2);
    },

    update: function() {
        this.position.add(this.velocity);
        this.velocity.x += (this.beginPosition.x-this.x)/(this.radius/2);
        this.velocity.y += PARTICLE_ACCELERATION_Y;
        this.scaleX -= PARTICLE_SCALE_DOWN_SPEED;
        this.scaleY -= PARTICLE_SCALE_DOWN_SPEED;

        if (this.scaleX < 0) {
            this.flare('disappear');
        }
    },
});

/*
 *  danmaku.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

const danmaku = {};

phina.namespace(function() {

var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM  = bullet({ dummy: true });

//攻撃ヘリ「ホーネット」
danmaku.Hornet1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet3 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            notify('missile'),
            interval(240),
        ]),
    ]),
});

//中型攻撃ヘリ MudDauber
danmaku.MudDauber = new bulletml.Root({
    top0: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.6), direction(0), offsetY(30)),
            repeat("$burst + 3", [
                fire(THIN, spdSeq(0), direction(0, "sequence"), offsetY(30)),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
    top1: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(180, "absolute"), offsetX(-32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
    top2: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(140, "absolute"), offsetX(32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
});

//中型爆撃機「ビッグウィング」
danmaku.BigWing = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            repeat(4, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                ]),
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(160, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                ]),
                interval(10),
            ]),
            repeat(3, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX( 16), offsetY(16)),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX(-16), offsetY(16)),
                ]),
                interval(20),
            ]),
            interval(60),
        ]),
    ]),
});

//飛空艇「スカイブレード」
danmaku.SkyBlade = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.7), direction(0), offsetY(-32)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(DM, spdSeq(0.05), direction(-20, "sequence")),
            ]),
            interval(90),
        ]),
    ]),
});


//中型戦車「フラガラッハ」
danmaku.Fragarach = new bulletml.Root({
    top: action([
        interval(60),
        repeat(Infinity, [
            fire(RS, spd(0.5), direction(0)),
            repeat("$burst", [
                fire(RS, spdSeq(0.15), direction(-5, "sequence")),
                fire(RS, spdSeq(0.15), direction(10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置１）
danmaku.Brionac1_1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(2), direction(0, "absolute")),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0.15), direction( 0, "sequence")),
                fire(RM, spdSeq(0), direction( 1, "sequence")),
                fire(RM, spdSeq(0), direction(-2, "sequence")),
                interval(2),
                fire(RM, spdSeq(0.15), direction( 3, "sequence")),
                fire(RM, spdSeq(0), direction( 5, "sequence")),
                fire(RM, spdSeq(0), direction(-7, "sequence")),
                interval(2),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置２）
danmaku.Brionac1_2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0), direction(0, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(DM, spdSeq(0.05), direction(-10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置３）
danmaku.Brionac1_3 = new bulletml.Root({
    top1: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(90, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(180, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(270, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//中型輸送機「トイボックス」
danmaku.ToyBox = new bulletml.Root({
    top: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 1", [
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

});


/*
 *  danmakuBasic.js
 *  2016/04/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

//�e��
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM  = bullet({ dummy: true });

//���@�_���e
var basic = function(s, dir) {
  return new bulletml.Root({
    top: action([
      interval(60),
      repeat(Infinity, [
        fire(DM, spd(s), direction(dir)),
        repeat("$burst + 1", [
          fire(RS, spdSeq(0.15), direction(0, "sequence")),
        ]),
        interval(60),
      ]),
    ]),
  });
};
danmaku.basic = basic(1, 0);
danmaku.basicR1 = basic(1, -5);
danmaku.basicL1 = basic(1, +5);
danmaku.basicR2 = basic(1, -15);
danmaku.basicL2 = basic(1, +15);
danmaku.basicF = basic(1.2, 0);
danmaku.basicFR1 = basic(1.2, -5);
danmaku.basicFL1 = basic(1.2, +5);
danmaku.basicFR2 = basic(1.2, -15);
danmaku.basicFL2 = basic(1.2, +15);

//N-Way(���@�_��)
var basicNway = function(n, dir, s) {
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(-dir*rn)),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
danmaku.basic3way = basicNway(3, 10, 0.7);
danmaku.basic4way = basicNway(4, 10, 0.7);
danmaku.basic5way = basicNway(5, 10, 0.7);
danmaku.basic6way = basicNway(6, 10, 0.7);
danmaku.basic7way = basicNway(7, 10, 0.7);

//��e
var basicNwayCircle = function(n, s) {
    var dir = ~~(360/n);
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(0, "absolute")),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
danmaku.basic8wayCircle = basicNwayCircle(8, 0.7);
danmaku.basic16wayCircle = basicNwayCircle(16, 0.7);

});


/*
 *  danmakuBoss_1.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

//ショートハンド
var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

//マクロ
var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var nwayVs = bulletml.dsl.nwayVs;
var absoluteNway = bulletml.dsl.absoluteNway;
var absoluteNwayVs = bulletml.dsl.absoluteNwayVs;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM = bullet({ dummy: true });

//１面中ボス
danmaku.ThorHammer = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(20, "absolute"), offsetX(-32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(340, "absolute"), offsetX(32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(20),

            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(40, "absolute"), offsetX(-32), offsetY(16)),
                repeat(6, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(320, "absolute"), offsetX(32), offsetY(16)),
                repeat(6, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(30),
        ]),
    ]),
});

//１面中ボス（砲台）
danmaku.ThorHammerTurret = new bulletml.Root({
    top0: action([
        interval(30),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-15)),
            repeat("$burst + 2", [
                fire(BEM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0.05), direction(-30, "sequence")),
                interval(10),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（パターン１）
danmaku.Golyat1_1 = new bulletml.Root({
    top0: action([
        wait(30),
        repeat(5, [
            notify("start"),
            interval(30),
            fire(DM, spd(0.5), direction(0, "absolute"), offsetY(-8)),
            repeat("$burst + 1", [
                fire(BEM, spdSeq(0), direction(0, "sequence"), offsetY(-8)),
                repeat(30, [
                    fire(BEM, spdSeq(0.01), direction(12, "sequence"), offsetY(-8)),
                    interval(1),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "sequence"), offsetY(-8)),
                interval(10),
            ]),
            interval(30),
            notify("end"),
            interval(120),
        ]),
        notify("finish"),
    ]),
});

//１面ボス（パターン２）
danmaku.Golyat1_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(BEM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（パターン３）
danmaku.Golyat1_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),

        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（発狂パターン）
danmaku.Golyat2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(60),
        repeat(Infinity, [
            repeat(3, [
                fire(THIN, spd(0.6), direction(0)),
                repeat(3, [
                    fire(THIN, spdSeq(0.1), direction(0, "sequence")),
                ]),
                fire(THIN, spdSeq(0.1), direction(-20, "sequence")),
                repeat(4, [
                    fire(THIN, spdSeq(0), direction(10, "sequence")),
                ]),
                interval(60),
            ]),
            interval(120),
        ]),
    ]),

    top1: action([
        wait(60),
        repeat(Infinity, [
            interval(30),
            repeat(5, [
                fire(DM, spd(0.5), direction(0, "absolute")),
                repeat("$burst + 5", [
                    repeat(10, [
                        fire(REM, spdSeq(0), direction(36, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(0, "absolute")),
                ]),
                interval(120),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン１）
danmaku.GolyatArm1 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
            fire(DM, spd(1.0), direction(-10), offsetX(0), offsetY(-40)),
            repeat("$burst + 3", [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(DM, spdSeq(0.1), direction(-20, "sequence")),
                interval(10),
            ]),
            notify("end1"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(0.8), direction(-5), offsetX(0), offsetY(20)),
            repeat("$burst + 3", [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(20)),
                fire(DM, spdSeq(0.1), direction(-10, "sequence")),
                interval(10),
            ]),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン２）
danmaku.GolyatArm2 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン３）
danmaku.GolyatArm3 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(30),
            notify("end1"),
            interval(180),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(30),
            notify("end2"),
            interval(180),
        ]),
    ]),
});

});


/*
 *  danmakuBoss_2.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

//ショートハンド
var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

//マクロ
var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var nwayVs = bulletml.dsl.nwayVs;
var absoluteNway = bulletml.dsl.absoluteNway;
var absoluteNwayVs = bulletml.dsl.absoluteNwayVs;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN   = bullet({type: "THIN", size: 1.0});
var THIN_L = bullet({type: "THIN", size: 1.5});

var DM = bullet({dummy: true});

//２面中ボス
danmaku.Raven = new bulletml.Root({
    top0: action([
        wait(120),
        repeat(Infinity, [
            fire(DM, spd(0.8)),
            repeat(3, [
                nway(3, -15, 15, THIN, spd(0.08)),
                interval(5),
            ]),
            interval(165),
        ]),
    ]),
    top1: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(-20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(-30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
});


//２面ボス　パターン１
danmaku.Garuda_1 = new bulletml.Root({
    top0: action([
        interval(90),
        repeat(4, [
            repeat("$rank/10+3", [
                nway(5, -20, 20, RL, spd(0.8), offsetX(0), offsetY(0), autonomy(true)),
                interval(2),
            ]),
            interval(180),
        ]),
        notify("finish"),
    ]),
    top1: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(-148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
    top2: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
});

//２面ボス　パターン２
danmaku.Garuda_2 = new bulletml.Root({
    top0: action([
        wait(90),
        repeat(10, [
            notify('bomb'),
            interval(60),
        ]),
        notify("finish"),
    ]),
});

//２面ボス　パターン３
danmaku.Garuda_3 = new bulletml.Root({
    top0: action([
        interval(90),
        notify("finish"),
    ]),
});

//２面ボス　パターン４（発狂）
danmaku.Garuda_4 = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(bullet(DM, actionRef("inv1")), spd(3), direction("$loop.index * 5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv1")), spdSeq(0), direction(360 / 16, "sequence")),
                interval(1),
            ]),
            interval(10),
            fire(bullet(DM, actionRef("inv2")), spd(3), direction("$loop.index * -5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv2")), spdSeq(0), direction(-360 / 16, "sequence")),
                interval(1),
            ]),
            interval(120),
        ]),
    ]),
    inv1: action([
        wait(1),
        fire(RL, spd(1.2), direction(90, "relative")),
        vanish(),
    ]),
    inv2: action([
        wait(1),
        fire(RL, spd(1.2), direction(-90, "relative")),
        vanish(),
    ]),
});

//２面ボス砲台
danmaku.Garuda_hatch_1 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(REM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_4 = new bulletml.Root({
    top0: action([
        notify("start"),
        interval(120),
        repeat(Infinity, [
            interval(120),
        ]),
    ]),
});

//２面ボスオプション武器
danmaku.GarudaBomb = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(THIN, spd(0.5), direction( 90, "absolute")),
            fire(THIN, spd(0.5), direction(270, "absolute")),
            interval(30),
        ]),
    ]),
});

});


/*
 *  Item.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテム
phina.define("Item", {
    superClass: "phina.display.Sprite",
    layer: LAYER_PLAYER,

    //アイテム種類
    //0: パワーアップ
    //1: ボム
    //2: １ＵＰ
    //3: 得点
    id: 0,

    //パワーアップタイプ
    type: 0,

    active: false,

    init: function(id) {
        this.superInit("tex1", 32, 32);
        this.id = id;
        this.setFrameTrimming(0, 97, 96, 32);
        this.setFrameIndex(id);
        this.setScale(2.0);

        //当り判定設定
        this.boundingType = "rect";

        this.phase = 0;
        this.count = 0;
        this.time = 1;
    },

    update: function(app) {
        //自機との当り判定チェック
        var player = app.currentScene.player;
        if (this.isHitElement(player)) {
            player.getItem(this.id, this.type);
            this.remove();
            return;
        }

        //移動パターン
        if (this.phase == 0) {
            this.y++;
            if (this.y > SC_H-32) {
                this.phase++;
            }
        } else if (this.phase == 1) {
            var x = rand(SC_W*0.2, SC_W*0.8);
            var y = rand(SC_H*0.2, SC_W*0.9);
            this.tweener.clear()
                .move(x, y, 3000, "easeInOutSine")
                .call(function() {
                    this.count++;
                    if (this.count < 3) {
                        this.phase = 1;
                    } else {
                        this.phase = 3;
                    }
                }.bind(this));
            this.phase++;
        } else if (this.phase == 3) {
            this.y += 2;
        }

        this.time++;
    },
});

/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Player", {
    superClass: "phina.display.DisplayElement",
    _member: {
        layer: LAYER_PLAYER,

        //当り判定サイズ
        width: 2,
        height: 2,

        isControl: true,    //操作可能フラグ
        isShotOK: true,     //ショット可能フラグ
        isDead: false,      //死亡フラグ
        shotON: true,       //ショットフラグ
        mouseON: false,     //マウス操作中フラグ

        isCollision: false,     //当り判定有効フラグ
        isAfterburner: false,   //アフターバーナー中
        isAfterburnerBefore: false,

        timeMuteki: 0, //無敵フレーム残り時間

        speed: 4,       //移動係数
        touchSpeed: 4,  //タッチ操作時移動係数
        type: 0,        //自機タイプ(0:赤 1:緑 2:青)
        power: 0,       //パワーアップ段階
        powerMax: 5,    //パワーアップ最大

        shotPower: 10,      //ショット威力
        shotInterval: 6,    //ショット間隔

        rollcount: 50,
        pitchcount: 50,

        parentScene: null,
        indecies: [0,1,2,3,4,4,4,5,6,7,8],
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        this.tweener.setUpdateType('fps');

        this.sprite = phina.display.Sprite("gunship", 48, 48)
            .addChildTo(this)
            .setFrameIndex(4)
            .setScale(0.66);

        //ビット
        this.bits = [];
        for (var i = 0; i < 4; i++) {
            this.bits[i] = PlayerBit(i).addChildTo(this);
            this.bits[i].tweener.setUpdateType('fps');
        }
        this.openBit(0);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function(app) {
        if (this.isControl) {
            //マウス操作
            var p = app.mouse;
            if (p.getPointing()) {
/*
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;
*/
                var pt = p.deltaPosition;
                this.x += ~~(pt.x*1.8);
                this.y += ~~(pt.y*1.8);

                this.mouseON = true;
                this.shotON = true;
            } else {
                this.mouseON = false;
                this.shotON = false;
            }

            //コントローラー操作
            var ct = app.controller;
            if (ct.angle !== null) {
                var m = KEYBOARD_MOVE[ct.angle];
                this.x += m.x*this.speed;
                this.y += m.y*this.speed;
            }
            if (ct.analog1.x > 0.3 || -0.3 > ct.analog1.x) this.x += ct.analog1.x * this.speed;
            if (ct.analog1.y > 0.3 || -0.3 > ct.analog1.y) this.y += ct.analog1.y * this.speed;
            if (!this.mouseON) this.shotON = app.controller.shot;

            //コントロール不可状態
            if (!this.isControl || !this.isShotOK || this.isDead) {
                this.shotON = false;
            }

            //コントロール可能状態
            if (this.isControl && this.isShotOK && !this.isDead) {
                //ボム投下
                if (ct.bomb) {
                    this.parentScene.enterBomb();
                }

                //ショットタイプ変更（テスト用）
                if (ct.special1 && this.time > this.changeInterval) {
                    this.type = (this.type+1)%3;
                    this.openBit(this.type);
                    this.changeInterval = this.time+30;
                }
            }

            //移動範囲の制限
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);

            //ショット投入
            if (this.shotON && app.ticker.frame % this.shotInterval == 0) this.enterShot();
        }

        //機体ロール
        var x = ~~this.x;
        var bx = ~~this.bx;
        if (bx > x) {
            this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
        }
        if (bx < x) {
            this.rollcount+=2;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        var vx = Math.abs(bx - x);
        if (vx < 2) {
            if (this.rollcount < 50) this.rollcount+=2; else this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        this.sprite.setFrameIndex(this.indecies[Math.clamp(~~(this.rollcount/10),0, 9)]);

        //アフターバーナー描写
        if (this.isAfterburner) {
            var ground = this.parentScene.ground;
            var layer = this.parentScene.effectLayerUpper;
            //着火
            if (!this.isAfterburnerBefore) {
                for (var i = 0; i < 50; i++) {
                    var vx = Math.randint(-5, 5);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
            if (!this.isDead) {
                var e = layer.enterAfterburner({
                    position: {x: this.x, y: this.y+26},
                    velocity: {x: 0, y: ground.deltaY, decay: 0.99},
                    alpha: 0.7,
                    blendMode: "lighter",
                });
                if (e) e.setScale(1.0, 3.0);
            }
        } else {
            //消火
            if (this.isAfterburnerBefore) {
                var ground = this.parentScene.ground;
                var layer = this.parentScene.effectLayerUpper;
                for (var i = 0; i < 10; i++) {
                    var vx = Math.randint(-2, 2);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
        }

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
        this.isAfterburnerBefore = this.isAfterburner;
    },

    //被弾処理
    damage: function() {
        //無敵時間中はスルー
        if (this.timeMuteki > 0 || this.parentScene.bombTime > 0 || this.parentScene.timeVanish > 0) return false;

        //オートボム発動
        if (app.setting.autoBomb && app.setting.bombStock > 0) {
            this.parentScene.enterBomb();
            return true;
        }

        //被弾エフェクト表示
        var layer = this.parentScene.effectLayerUpper;
        layer.enterExplodePlayer({position: {x: this.x, y: this.y}});

        app.playSE("playermiss");
        this.parentScene.missCount++;
        this.parentScene.stageMissCount++;

        this.isDead = true;
        app.setting.zanki--;
        if (app.setting.zanki > 0) {
            this.startup();
        } else {
            this.shotON = false;
            this.visible = false;
            this.isCollision = false;
            this.isControl = false;
            this.parentScene.isGameOver = true;
        }

        return true;
    },

    //ショット発射
    enterShot: function() {
        //自機から
        var ly = this.parentScene.shotLayer;
        ly.enterShot(this.x+10, this.y-8, {type: 0, rotation: 1, power: this.shotPower});
        ly.enterShot(this.x   , this.y-16,{type: 0, rotation: 0, power: this.shotPower});
        ly.enterShot(this.x-10, this.y-8, {type: 0, rotation:-1, power: this.shotPower});
        return this;
    },

    //ビット展開
    openBit: function(type) {
        var color = 0;
        switch (type) {
            case 0:
                //赤（前方集中型）
                this.bits[0].tweener.clear().to({ x:  5, y:-32, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-30,0,30,"easeInOutSine").moveBy( 30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[0]));
                this.bits[1].tweener.clear().to({ x: -5, y:-32, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 30,0,30,"easeInOutSine").moveBy(-30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[1]));
                this.bits[2].tweener.clear().to({ x: 15, y:-24, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-40,0,30,"easeInOutSine").moveBy( 40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[2]));
                this.bits[3].tweener.clear().to({ x:-15, y:-24, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 40,0,30,"easeInOutSine").moveBy(-40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[3]));
                color = 0;
                break;
            case 1:
                //緑（方向変更型）
                this.bits[0].tweener.clear().to({ x: 35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                color = 80;
                break;
            case 2:
                //青（広範囲型）
                this.bits[0].tweener.clear().to({ x: 30, y:16, rotation:  5, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-30, y:16, rotation: -5, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 50, y:24, rotation: 10, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-50, y:24, rotation:-10, alpha:1}, 15).setLoop(false);
                color = 200;
                break;
            default:
                //クローズ
                this.bits[0].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[1].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[2].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[3].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                color = 60;
                break;
        }
        return this;
    },

    //プレイヤー投入時演出
    startup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .wait(120)
            .call(function(){
                this.parentScene.timeVanish = 180;
                app.setting.bombStock = app.setting.bombStockMax;
            }.bind(this))
            .to({x: SC_W*0.5, y: SC_H*0.8}, 120, "easeOutQuint")
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //ステージ開始時演出
    stageStartup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .to({x: SC_W/2, y: SC_H/2+32}, 90, "easeOutCubic")
            .to({x: SC_W/2, y: SC_H-64  }, 120)
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //機影追加
    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("gunshipBlack", 48, 48);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(4).setScale(0.66);
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            if (!ground.isShadow) {
                this.visible = false;
                return;
            } else {
                this.visible = true;
            }

            this.rotation = that.rotation;
            this.x = that.x + ground.shadowX;
            this.y = that.y + ground.shadowY;
            this.scaleX = ground.scaleX*0.66;
            this.scaleY = ground.scaleY*0.66;
            this.frameIndex = that.sprite.frameIndex;
            this.visible = that.visible;
        }

        //ビットの影
        for (var i = 0; i < 4; i++) {
            var b = this.bits[i];
            b.parentScene = this.parentScene;
            b.addShadow();
        }
        return this;
    },

    //アイテム取得
    getItem: function(kind) {
        switch(kind) {
            case ITEM_POWER:
                app.playSE("powerup");
                break;
            case ITEM_BOMB:
                app.playSE("powerup");
                app.setting.bombStock++;
                if (app.setting.bombStock > app.setting.bombStockMax) app.setting.bombStockMax = app.setting.bombStock;
                break;
            case ITEM_1UP:
                app.playSE("powerup");
                app.setting.zanki++;
                if (app.setting.zanki > 9) app.setting.zanki = 9;
                break;
        }
    },
});

/*
 *  playerbit.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("PlayerBit", {
    superClass: "phina.display.Sprite",

    _member: {
        layer: LAYER_PLAYER,
        id: 0,
        active: false,
    },

    init: function(id) {
        this.superInit("bit", 32, 32);
        this.$extend(this._member);

        this.setScale(0.5);
        this.index = 0;
        this.id = id;

        this.alpha = 1;

        this.beforeX = 0;
        this.beforeY = 0;

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

        this.time = 0;
    },

    update: function(app) {
        if (this.time % 2 == 0) {
            if (this.id % 2 == 0) {
                this.index--;
                if (this.index < 0) this.index = 8;
            } else {
                this.index = (this.index+1)%9;
            }
            this.setFrameIndex(this.index);
        }
        var player = this.parent;
        if (player.shotON) {
            if (this.time % player.shotInterval == 0) {
                var x = this.x + player.x;
                var y = this.y + player.y;
                var sl = player.parentScene.shotLayer;
                sl.enterShot(x, y-4, {type: 1, rotation: this.rotation, power: player.shotPower});
            }
        }

        if (player.type == 1) {
            this.rotation = Math.clamp(player.rollcount-50, -25, 25);
            if (-4 < this.rotation && this.rotation < 4) this.rotation = 0;
        }
        this.time++;
    },

    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("bitBlack", 32, 32);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(0).setScale(0.5);
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            if (!ground.isShadow) {
                this.visible = false;
                return;
            } else {
                this.visible = true;
            }

            this.rotation = that.rotation;
            this.x = that.x + that.parent.x + ground.shadowX;
            this.y = that.y + that.parent.y + ground.shadowY;
            this.scaleX = ground.scaleX*0.5;
            this.scaleY = ground.scaleY*0.5;
            this.frameIndex = that.frameIndex;
            this.visible = that.parent.visible;
        }
        return this;
    },
});

/*
 *  playerpointer.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//プレイヤー操作用ポインタ
phina.define("PlayerPointer", {
    superClass: "phina.display.Shape",
    layer: LAYER_OBJECT_LOWER,

    init: function() {
        this.superInit({width:32, height:32});
        this.canvas.lineWidth = 3;
        this.canvas.globalCompositeOperation = "lighter";
        this.canvas.strokeStyle = "rgb(255, 255, 255)";
        this.canvas.strokeArc(16, 16, 8, Math.PI*2, 0, true);
    },

    update: function(app) {
        var p = app.mouse;
        if (this.player.isControl && p.getPointing()) {
            if (~~(this.x) == ~~(this.player.x) && ~~(this.y) == ~~(this.player.y)) {
                this.alpha = 0;
            } else {
                this.alpha = 0.5;
            }
            this.x += (p.position.x - p.prevPosition.x);
            this.y += (p.position.y - p.prevPosition.y);
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);
        } else {
            this.x = this.player.x;
            this.y = this.player.y;
            this.alpha = 0;
        }
    },
});

/*
 *  shot.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT_MIDDLE, LAYER_OBJECT_LOWER];

phina.define("Shot", {
    superClass: "phina.display.DisplayElement",

    DEFAULT_PARAM: {
        type: 0,
        rotation: 0,
        power: 10,
        velocity: 15,
    },

    time: 0,

    init: function() {
        this.superInit();
        this.boundingType = "circle";
        this.radius = 6

        this.sprite = phina.display.Sprite("shot", 16, 32).addChildTo(this);
        this.sprite.frameIndex = 0;
        this.sprite.alpha = 0.8;
        this.sprite.blendMode = "lighter";

        this.on("enterframe", function(){
            this.x += this.vx;
            this.y += this.vy;

            if (this.x<-16 || this.x>SC_W+16 || this.y<-16 || this.y>SC_H+16) {
                this.remove();
                return;
            }

            //敵との当り判定チェック
            if (this.time % 2) {
                var parentScene = this.shotLayer.parentScene;
                for (var i = 0; i < 3; i++) {
                    var layer = parentScene.layers[checkLayers[i]];
                    layer.children.each(function(a) {
                        if (a === app.player) return;
                        if (this.parent && a.isCollision && a.isHitElement(this)) {
                            a.damage(this.power);
                            this.vanish();
                            this.remove();
                            return;
                        }
                    }.bind(this));
                }
            }
            this.time++;
        });

        //リムーブ時
        this.on("removed", function(){
            this.shotLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(param) {
        param.$safe(this.DEFAULT_PARAM);
        if (param.type == 0) {
            this.sprite.frameIndex = 0;
            this.sprite.setScale(2);
        } else {
            this.sprite.frameIndex = 1;
            this.sprite.setScale(1.5, 1.0);
        }

        this.rotation = param.rotation;
        this.velocity = param.velocity;
        this.power = param.power;

        var rot = param.rotation-90;
        this.vx = Math.cos(rot*toRad)*this.velocity;
        this.vy = Math.sin(rot*toRad)*this.velocity;

        //当り判定設定
        if (param.type == 0) {
            this.radius = 8;
        } else {
            this.radius = 16;
        }

        this.beforeX = this.x;
        this.beforeY = this.y;

        return this;
    },

    vanish: function() {
        var ground = this.shotLayer.parentScene.ground;
        var layer = this.shotLayer.parentScene.effectLayerUpper;
        layer.enterShotImpact({
            position:{x: this.x, y: this.y},
        });
        Effect.enterDebris(layer, {
            num: 2,
            position:{x: this.x, y: this.y},
            velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
        });
    },
});

});

/*
 *  shotlayer.js
 *  2015/11/17
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("ShotLayer", {
    superClass: "phina.display.DisplayElement",

    _member: {
        max: 64,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = Shot();
            b.shotLayer = self;
            return b;
        });
    },

    //弾投入
    enterShot: function(x, y, option) {
        var b = this.pool.shift();
        if (!b) {
            console.warn("Shot empty!!");
            return null;
        }
        b.setup(option).addChildTo(this).setPosition(x, y);
        return b;
    },

    //弾を消去
    erace: function() {
        for (var i = 0; i < len; i++) {
            b = list[i];
            b.erase();
            b.remove();
        }
    },
});

/*
 *  continuescene.js
 *  2016/03/29
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("ContinueScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        labelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "center",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(currentScene) {
        this.superInit();
        this.$extend(this._member);

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W*0.6,
            height:SC_H*0.3,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //選択カーソル
        var param2 = {
            width:SC_W*0.15,
            height:SC_H*0.1,
            fill: "rgba(0,200,200,0.5)",
            stroke: "rgba(0,200,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)

        //タッチ用カーソル
        var that = this;
        this.cursol1 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)
            .setInteractive(true);
        this.cursol1.alpha = 0;
        this.cursol1.onpointend = function() {
            if (that.yes) {
                that.gotoContinue();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                that.yes = true;
                app.playSE("select");
            }
        }
        this.cursol2 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55)
            .setInteractive(true);
        this.cursol2.alpha = 0;
        this.cursol2.onpointend = function() {
            if (!that.yes) {
                that.gotoGameover();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                that.yes = false;
                app.playSE("select");
            }
        }

        //コンティニュー表示
        phina.display.Label({text: "CONTINUE?"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.40);

        this.lyes = phina.display.Label({text: "YES"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55);
        this.lyes.blink = false;
        this.lyes.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
        }

        this.lno = phina.display.Label({text: "NO"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55);
        this.lno.blink = false;
        this.lno.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
        }

        //カウンタ表示
        this.counter = phina.display.Label({text: "9", fontSize: 30}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.45);
        this.counter.count = 9;
        this.counter.tweener.clear().wait(1000).call(function() {this.count--;}.bind(this.counter)).setLoop(true);
        this.counter.update = function() {
            this.text = ""+this.count;
            if (this.count < 0) {
                that.currentScene.flare("gameover");
                app.popScene();
            }
        }

        this.isSelected = false;
        this.time = 0;        
    },

    update: function() {
        if (this.isSelected) return;

        //キーボード操作
        var ct = app.controller;
        if (ct.left) {
            if (!this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                this.yes = true;
                app.playSE("select");
            }
        }
        if (ct.right) {
            if (this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                this.yes = false;
                app.playSE("select");
            }
        }
        if (this.time > 30) {
            if (ct.ok) {
                this.isSelected = true;
                app.playSE("click");
                if (this.yes) { 
                    this.gotoContinue();
                } else {
                    this.gotoGameover();
                }
            }
        }
        this.time++;
    },

    gotoContinue: function() {
        this.lyes.blink = true;
        this.currentScene.flare("continue");
        this.tweener.clear().wait(1000).call(function() {
            app.popScene();
        });
    },
    gotoGameover: function() {
        this.lno.blink = true;
        this.currentScene.flare("gameover");
        app.popScene();
    },
});


/*
 *  GameOverScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("GameOverScene", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: false,
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        phina.display.Label({text: "GAME OVER"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(30);

        //ＢＧＭ終了時にシーンを抜ける
        app.playBGM("gameover", false, function() {
            this.exit();
        }.bind(this));

        this.time = 0;
    },

    update: function(app) {
        //キーボード操作
        var ct = app.controller;
        if (this.time > 30) {
            if (ct.ok || ct.cancel) {
                app.stopBGM();
                this.exit();
            }
        }
        this.time++;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        if (this.time > 30) {
            app.stopBGM();
            this.exit();
        }
    },
});

/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("LoadingScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        options.assetType = options.assetType || "common";
        options = (options||{}).$safe({
            asset: Application.assets[options.assetType],
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        });
        this.superInit(options);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //ロードする物が無い場合スキップ
        this.forceExit = false;
        var asset = options.asset;
        if (!asset.$has("sound") && !asset.$has("image") && !asset.$has("font") && !asset.$has("spritesheet") && !asset.$has("script")) {
            this.forceExit = true;
            return;
        }

        var labelParam = {
            text: "Loading",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 30
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
                        width: this.width*0.5,
                        height: 5,
                        color: 'black',
                        stroke: false,
                        gaugeColor: 'blue',
                        padding: 0,
                    },
                    x: this.gridX.center(),
                    y: SC_H*0.5+20,
                    originY: 0,
                }
            }
        });
        this.gauge.update = function(e) {
            this.gaugeColor = 'hsla({0}, 100%, 50%, 0.8)'.format(e.ticker.frame*3);
        }

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
                this.app._onLoadAssets();
                this.exit();
            }
        }.bind(this);

        loader.load(options.asset);
    },
    update: function() {
        if (this.forceExit) this.exit();
    },    
});

/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("MainScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //シーン内設定
        bombTime: 0,    //ボム効果継続残りフレーム数
        timeVanish: 0,  //弾消し時間

        //現在ステージＩＤ
        stageId: 1,
        maxStageId: 2,

        //プラクティスモードフラグ
        isPractice: false,

        //ステージクリアフラグ
        isStageClear: false,

        //ゲームオーバーフラグ
        isGameOver: false,

        //ボス戦闘中フラグ
        isBossBattle: false,
        bossObject: null,

        //各種判定用
        missCount: 0,       //プレイヤー総ミス回数
        stageMissCount: 0,  //プレイヤーステージ内ミス回数

        //敵関連        
        enemyCount: 0,  //敵総数
        enemyKill: 0,   //敵破壊数
        enemyID: 0,     //敵識別子

        //ラベル用パラメータ
        labelParam: {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        },
        scorelabelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(option) {
        this.superInit();
        this.$extend(this._member);

        option = (option || {}).$safe({stageId: 1});
        this.stageId = option.stageId;
        this.isPractice = (option.isPractice == undefined)? false: option.isPractice;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //エフェクトプール
        var effectPool = EffectPool(2048, this);

        //プレイヤー情報初期化
        app.score = 0;
        app.rank = 1
        app.numContinue = 0;
        app.setting.$extend(app.currentrySetting);

        //レイヤー準備
        this.base = phina.display.DisplayElement().addChildTo(this).setPosition(SC_OFFSET_X, 0);
        this.layers = [];
        for (var i = 0; i < LAYER_SYSTEM+1; i++) {
            switch (i) {
                case LAYER_BULLET:
                    this.layers[i] = BulletLayer().addChildTo(this.base);
                    this.bulletLayer = this.layers[i];
                    break;
                case LAYER_SHOT:
                    this.layers[i] = ShotLayer().addChildTo(this.base);
                    this.shotLayer = this.layers[i];
                    break;
                case LAYER_EFFECT_UPPER:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerUpper = this.layers[i];
                    break;
                case LAYER_EFFECT_MIDDLE:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerMiddle = this.layers[i];
                    break;
                case LAYER_EFFECT_LOWER:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerLower = this.layers[i];
                    break;
                case LAYER_SHADOW:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
                    //地形と影レイヤーのみ目隠し
                    this.groundMask = phina.display.RectangleShape(param)
                        .addChildTo(this.base)
                        .setPosition(SC_W*0.5, SC_H*0.5);
                    this.groundMask.tweener.setUpdateType('fps');
                    this.groundMask.tweener.clear().fadeOut(20);
                    break;
                default:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
            }
            this.layers[i].parentScene = this;
        }

        //プレイヤー準備
        var player = this.player = Player()
            .addChildTo(this)
            .addShadow()
            .setPosition(SC_W*0.5, SC_H*0.5)
            .stageStartup();
        player.shotLayer = this.shotLayer;
        app.player = this.player;

//        this.pointer = PlayerPointer().addChildTo(this);
//        this.pointer.player = this.player;

        //弾幕設定クラス
        BulletConfig.setup(player, this.bulletLayer);

        //システム表示ベース
        this.systemBase = phina.display.DisplayElement().addChildTo(this.base);

        //ボス耐久力ゲージ
        var gaugeStyle = {
            width: SC_W*0.9,
            height: 10,
            style: {
                fill: 'rgba(0, 0, 200, 1.0)',
                empty: 'rgba(0, 0, 0, 0.0)',
                stroke: 'rgba(255, 255, 255, 1.0)',
                strokeWidth: 1,
            },
        }
        this.bossGauge = phina.extension.Gauge(gaugeStyle)
            .setPosition(SC_W*0.5, -10)
            .addChildTo(this.systemBase);

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame%10 == 0) {
                this.s = ~~((app.score-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > app.score) this.score = app.score;

            this.text = "SCORE "+this.score.comma();
        }

        //ランク表示
        this.rankLabel = phina.display.Label({text:"RANK:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 30);
        this.rankLabel.update = function() {
            this.text = "RANK "+app.rank;
        };

        //残機表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("gunship", 48, 48)
                .addChildTo(this.systemBase)
                .setFrameIndex(4)
                .setScale(0.3)
                .setPosition(i*16+16, 48);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.setting.zanki-1 > this.num) this.visible = true; else this.visible = false;
            }
        }

        //残ボム表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("bomb", 96, 96)
                .addChildTo(this.systemBase)
                .setFrameIndex(0)
                .setScale(0.16)
                .setPosition(i*16+16, 64);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.setting.bombStockMax > this.num) {
                    this.visible = true;
                    if (app.setting.bombStock > this.num) {
                        this.alpha = 1.0;
                    } else {
                        this.alpha = 0.4;
                    }
                } else {
                    this.visible = false;
                }
            }
            var lparam = {
                text: "B",
                fill: "blue",
                stroke: "black",
                strokeWidth: 2,
                fontFamily: "Orbitron",
                align: "center",
                baseline: "middle",
                fontSize: 32,
                fontWeight: ''
            };
            phina.display.Label(lparam).addChildTo(s).setScale(2.5);
        }

        //ボムボタン
        this.buttonBomb = phina.extension.CircleButton({radius: 16})
            .addChildTo(this.systemBase)
            .setPosition(20, SC_H*0.9);

        //目隠し（黒）
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(20);

        //目隠し（白）
        this.maskWhite = phina.display.RectangleShape(param.$extend({fill: "white"}))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.maskWhite.tweener.setUpdateType('fps');
        this.maskWhite.alpha = 0.0;

        //ステージ初期化
        this.initStage();

        //イベント処理
        //ボス戦開始
        this.on('start_boss', function() {
            this.isBossBattle = true;
            this.systemBase.tweener.clear().to({y: 20}, 1000);
        }.bind(this));

        //ボス撃破
        this.on('end_boss', function() {
            this.isBossBattle = false;
            this.systemBase.tweener.clear().to({y: 0}, 1000);

            //ボスタイプ判定
            if (this.bossObject.type == ENEMY_MBOSS) {
                //中ボスの場合早回し
                var time = this.stage.getNextEventTime(this.time);
                if (time > 0) this.time = time-1;
            } else {
                //ステージボスの場合ステージクリア
                this.flare('stageclear');
            }
            this.bossObject = null;
        }.bind(this));

        //ステージクリア
        this.on('stageclear', function() {
            //プレイヤショットオフ・当たり判定無し
            this.player.isShotOK  = false;
            this.player.isCollision  = false;

            //１０秒後にリザルト処理
            phina.app.Object2D().addChildTo(this)
                .tweener.clear()
                .wait(10000)
                .call(function() {
                    this.result();
                }.bind(this));
        }.bind(this));

        //コンティニュー時
        this.on("continue", function() {
            app.numContinue++;

            //初期状態へ戻す
            app.score = 0;
            app.rank = 1;
            app.setting.zanki = app.currentrySetting.zanki;
            app.setting.bombStock = app.setting.bombStockMax;

            this.player.visible = true;
            this.player.startup();
            this.scoreLabel.score = 0;
        }.bind(this));

        //ゲームオーバー時
        this.on("gameover", function() {
            app.stopBGM();
            if (this.isPractice) {
                this.exit("menu");
            } else {
                this.exit("gameover");
            }
        }.bind(this));
    },
    
    update: function(app) {
        //ステージ進行
        var event = this.stage.get(this.time);
        if (event) {
            if (typeof(event.value) === 'function') {
                event.value.call(this, event.option);
            } else {
                this.enterEnemyUnit(event.value);
            }
        }

        //マップオブジェクト判定
        if (this.mapObject) {
            var sx = SC_W*0.5;
            var sy = SC_H*0.2;
            var x = this.ground.mapBase.x;
            var y = this.ground.mapBase.y;
            var len = this.mapObject.objects.length;
            for (var i = 0; i < len; i++) {
                var obj = this.mapObject.objects[i];
                if (!obj.executed) {
                    //範囲内にあるか判定
                    var dx = x + obj.x;
                    var dy = y + obj.y;
                    if (-sx < dx && dx < SC_W+sx && -sy < dy && dy < SC_H+sy) {
                        //敵キャラクタ投入
                        if (obj.type == "enemy") {
                            if (enemyUnit[obj.name]) {
                                //小隊投入
                                this.enterEnemyUnit(obj.name, obj.properties);
                            } else {
                                //単体投入
                                if (obj.properties.$has("offsetx")) dx += obj.properties.offsetx;
                                if (obj.properties.$has("offsety")) dy += obj.properties.offsety;
                                this.enterEnemy(obj.name, dx, dy, obj.properties);
                            }
                        }
                        //イベント処理
                        if (obj.type == "event") {
                            var event = this.stage.getEvent(obj.name);
                            if (typeof(event.value) === 'function') {
                                event.value.call(this, obj.properties);
                            }
                        }
                        obj.executed = true;
                    }
                }
            }
        }

        //ボム効果
        if (this.bombTime > 0) {
            this.bombTime--;
            this.eraseBullet();
            this.addEnemyDamage(10);
        }

        //弾消し
        if (this.timeVanish > 0) {
            this.timeVanish--;
            this.eraseBullet();
        }

        //ゲームオーバー処理
        if (this.isGameOver) {
            this.isGameOver = false;
            this.player.isControl = false;
            var cos = ContinueScene(this);
            phina.app.Object2D().addChildTo(this).tweener.clear()
                .wait(2000)
                .call( function() {
                    app.pushScene(cos);
                });
        }

        //ボス体力ゲージ設定
        if (this.bossObject) {
            this.bossGauge.setValue(this.bossObject.def);
        }

        //エクステンドチェック
        var extendScore = app.extendScore[app.extendAdvance];
        if (app.isExtendEvery) {
            extendScore = app.extendEveryScore * (app.extendAdvance + 1);
        }
        if (extendScore != undefined) {
            if (app.score > extendScore) {
                app.extendAdvance++;
                app.setting.zanki++;
            }
        }

        var ct = app.controller;
        var kb = app.keyboard;
        if (app.keyboard.getKey("V")) {
            this.eraseBullet();
        }
        if (app.keyboard.getKey("D")) {
            this.bulletDomination();
        }

        if (app.keyboard.getKeyUp("P") || app.keyboard.getKey("escape") || ct.start) {
            app.pushScene(PauseScene());
        }

        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.ground) {
            this.ground.remove();
            this.ground = null;
        }
        if (this.stage) this.stage = null;
        if (this.mapObject) this.mapObject = null;

        //ステージ進行と背景追加
        switch (this.stageId) {
            case 1:
                this.stage = Stage1(this, this.player);
                this.ground = Stage1Ground().addChildTo(this);
                break;
            case 2:
                this.stage = Stage2(this, this.player);
                this.ground = Stage2Ground().addChildTo(this);
                break;
            case 3:
                this.stage = Stage3(this, this.player);
                this.ground = Stage3Ground().addChildTo(this);
                break;
            case 9:
                //テスト用ステージ
                this.stage = Stage9(this, this.player);
//                this.mapObject = phina.asset.AssetManager.get('tmx', "map1_enemy").getObjectGroup("EnemyLayer")[0];
                this.ground = Stage9Ground().addChildTo(this);
                break;
        }

        this.time = 0;
        this.timeVanish = 0;
        this.enemyCount = 0;
        this.enemyKill = 0;
        this.enemyID = 0;
        this.stageMissCount = 0;

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeOut(20);

        //ステージ番号表示
        var param = {text: "STAGE "+this.stageId, fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontWeight: 600, outlineWidth: 2};
        var m1 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        m1.alpha = 0;
        m1.tweener.setUpdateType('fps');
        m1.tweener.wait(30).fadeIn(15).wait(171).fadeOut(15).call(function(){this.remove()}.bind(m1));

        //ステージ名表示
        var name = Application.stageName[this.stageId] || "Practice";
        var param = {text: "_", fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontSize: 16, fontWeight: 200, outlineWidth: 2};
        var m2 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
        m2.alpha = 0;
        m2.col = 0;
        m2.max = name.length;
        m2.tweener.setUpdateType('fps');
        m2.tweener
            .wait(30)
            .fadeIn(6)
            .to({col: m2.max}, 60)
            .wait(120)
            .fadeOut(15)
            .call(function(){this.remove()}.bind(m2));
        m2.update = function() {
            this.text = name.substring(0, ~~this.col)+"_";
        }
    },

    result: function() {
        var endResult = false;
        var loadcomplete = false;
        var loadprogress = 0;

        //次ステージのアセットをバックグラウンドで読み込み
        if (!this.isPractice && this.stageId < this.maxStageId) {
            var assetName = "stage"+(this.stageId+1);
            var assets = Application.assets[assetName];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                loadcomplete = true;
                app._onLoadAssets();
            }.bind(this));
            loader.onprogress = function(e) {
                loadprogress = e.progress;
            }.bind(this);
        } else {
            loadcomplete = true;
            loadprogress = 1;
        }

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "left",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        };

        //クリア時ＢＧＭ
        app.playBGM("stageclear");

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeIn(300);

        var that = this;

        var base = phina.display.DisplayElement()
            .addChildTo(this)
            .setPosition(SC_W*1.5, 0);
        base.update = function() {
        };
        base.tweener.clear()
            .to({x: 0}, 500,"easeOutSine")
            .wait(5000)
            .call(function() {
                endResult = true;
            }.bind(base));
        base.ok = false;
        base.update = function() {
            //入力を待って次ステージに移行
            if (endResult && loadcomplete) {
                var ct = app.controller;
                if (ct.ok || ct.cancel) this.ok = true;

                var p = app.mouse;
                if (p.getPointing()) this.ok = true;
            }

            if (this.ok) {
                that.stageClear();
                this.remove();
            }
        }

        //ステージ番号表示
        var text1 = "STAGE "+this.stageId+" CLEAR";
        var res1 = phina.display.Label({text: text1, align: "center", fontSize: 25}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.5, SC_H*0.25);

        //ステージクリアボーナス表示
        var bonusClear = this.stageId*100000;
        var res2 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.4);
        res2.score = 0;
        res2.scorePlus = Math.floor(bonusClear/60);
        res2.time = 0;
        res2.update = function() {
            this.text = "CLEAR BONUS: "+this.score.comma();
            if (this.time == 60) app.score += bonusClear;
            if (this.time > 60) {
                this.score += this.scorePlus;
                if (this.score > bonusClear) this.score = bonusClear;
            }
            this.time++;
        }

        //ヒット数ボーナス表示
        var bonusHit = this.enemyKill*100;
        var res3 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.5);
        res3.score = 0;
        res3.scorePlus = Math.floor(bonusHit/60);
        res3.time = 0;
        res3.update = function() {
            this.text = "HIT BONUS: "+this.score.comma();
            if (this.time == 90) app.score += bonusHit;
            if (this.time > 90) {
                this.score += this.scorePlus;
                if (this.score > bonusHit) this.score = bonusHit;
            }
            this.time++;
        }

        //ノーミスクリアボーナス表示
        if (this.stageMissCount == 0) {
            var bonusNomiss = 100000;
            var res4 = phina.display.Label({text: ""}.$safe(labelParam))
                .addChildTo(base)
                .setPosition(SC_W*0.1, SC_H*0.6);
            res4.score = 0;
            res4.scorePlus = Math.floor(bonusNomiss/60);
            res4.time = 0;
            res4.update = function() {
                this.text = "NO MISS BONUS: "+this.score.comma();
                if (this.time == 120) app.score += bonusNomiss;
                if (this.time > 120) {
                    this.score += this.scorePlus;
                    if (this.score > bonusNomiss) this.score = bonusNomiss;
                }
                this.time++;
            }
        }

        //ロード進捗表示
        var progress = phina.display.Label({text: "", align: "right", fontSize: 10}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.95, SC_H*0.95);
        progress.time = 0;
        progress.update = function() {
            this.text = "Loading... "+Math.floor(loadprogress*100)+"%";
            if (loadprogress == 1) {
                if (endResult) {
                    this.text = "TAP or TRIGGER to next stage";
                } else {
                    this.text = "Please wait...";
                }
            }
            if (this.time % 30 == 0) this.visible = !this.visible;
            this.time++;
        }
    },

    //ステージクリア処理
    stageClear: function() {
        //プラクティス時タイトルへ戻る
        if (this.isPractice) {
            app.stopBGM();
            this.exit("menu");
        }
        if (this.stageId < this.maxStageId) {
            //次のステージへ
            this.stageId++;
            this.initStage();
        } else {
            //オールクリア
            this.mask.tweener.clear()
                .fadeIn(60)
                .wait(60)
                .call(function() {
                    this.flare('gameover');
                }.bind(this));
        }
    },

    //敵ユニット単位の投入
    enterEnemyUnit: function(name, option) {
        var unit = enemyUnit[name];
        if (unit === undefined){
            console.warn("Undefined unit: "+name);
            return false;
        }

        var len = unit.length;
        for (var i = 0; i < len; i++) {
            var e = unit[i];
            var en = Enemy(e.name, e.x, e.y, this.enemyID, e.param).addChildTo(this);
            if (en.data.type == ENEMY_BOSS || en.data.type == ENEMY_MBOSS) {
                this.bossGauge.setMax(en.defMax).setValue(en.defMax);
                this.bossObject = en;
                this.flare('start_boss');
            }
            this.enemyID++;
            this.enemyCount++;
        }
        return true;
    },

    //敵単体の投入
    enterEnemy: function(name, x, y, param) {
        this.enemyID++;
        this.enemyCount++;
        return Enemy(name, x, y, this.enemyID-1, param).addChildTo(this);
    },

    //ボム投入
    enterBomb: function() {
        if (this.bombTime > 0 || app.setting.bombStock < 1) return;
        this.bombTime = 90;
        app.setting.bombStock--;

        this.eraseBullet();
        var layer = this.effectLayerMiddle;
        var x = this.player.x;
        var y = this.player.y;
        Effect.enterBomb(layer, {position: {x: x, y: y}});

        this.addEnemyDamage(1000);
        app.playSE("bomb");
    },

    //敵に一律ダメージ付加
    addEnemyDamage: function(power) {
        var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT_MIDDLE, LAYER_OBJECT_LOWER];

        //敵との当り判定チェック
        for (var i = 0; i < 3; i++) {
            var layer = this.layers[checkLayers[i]];
            layer.children.each(function(a) {
                if (a instanceof Enemy && a.isOnScreen) a.damage(power);
            }.bind(this));
        }
    },

    //敵弾一括消去
    eraseBullet: function() {
        this.bulletLayer.erase();
    },

    //弾幕撃ち返し
    bulletDomination: function() {
        var sl = this.shotLayer;
        this.bulletLayer.children.each(function(a) {
            var rot = Math.atan2(-a.vy, -a.vx)*toDeg+90;
            sl.enterShot(a.x, a.y, {type: 1, rotation: rot, power: 20, velocity: 5});
        });
        this.bulletLayer.erase();
    },

    //Warning表示
    enterWarning: function() {

        //警告音
        app.playBGM("warning", false);

        var style = {
            width: SC_W,
            height: SC_H*0.1,
            fill: "red",
            stroke: "red",
            strokeWidth: 1
        }
        var belt = phina.display.RectangleShape(style)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addChildTo(this);
        var text = phina.display.Label({text: "WARNING", align: "center", fontFamily: "Orbitron"})
            .setPosition(0, 3)
            .addChildTo(belt);

        var param = {
            fill: "red",
            stroke: "red",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            fontSize: 16,
            fontWeight: ''
        };
        var text = "CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION";
        caution1 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*-0.05-8)
            .addChildTo(belt);
        caution1.update = function() {
            this.x -= 1;
        }
        caution2 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*0.05+12)
            .addChildTo(belt);
        caution2.update = function() {
            this.x += 1;
        }

        belt.tweener.setUpdateType('fps');
        belt.tweener.clear()
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24)
            .call(function(){
                caution1.x = 0;
                caution2.x = 0;
            })
            .call(function(){
                app.playBGM("boss", true);
                this.remove();
            }.bind(belt));
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },

    //addChildオーバーライド
    addChild: function(child) {
        if (child.layer === undefined) {
            return this.superClass.prototype.addChild.apply(this, arguments);
        }
        child.parentScene = this;
        return this.layers[child.layer].addChild(child);
    },
});

/*
 *  MenuDialog.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("MenuDialog", {
    superClass: "phina.display.DisplayElement",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },
    defaultMenu: {
        x: SC_W*0.5,
        y: SC_H*0.5,
        width: SC_W,
        height: SC_H,
        title: "SETTING",
        item: ["GAME", "SYSTEM", "test", "EXIT"],
        description: ["menu1", "menu2", "test", "exit"],
    },

    //フォーカス
    isFocus: true,

    //選択メニューアイテム番号
    select: 0,

    init: function(menu) {
        this.superInit();
        menu = (menu||{}).$safe(this.defaultMenu);

        //バックグラウンド
        var paramBG = {
            width: menu.width,
            height: menu.height,
            fill: "rgba(0, 0, 0, 1)",
            stroke: "rgba(0, 0, 0, 1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(paramBG)
            .addChildTo(this)
            .setPosition(menu.x, menu.y);
        this.bg.alpha = 0;
        this.bg.tweener.clear().to({alpha: 0.8}, 500, "easeOutCubic");

        this.frameBase = phina.display.DisplayElement().addChildTo(this);

        this.cursolBase = phina.display.DisplayElement().addChildTo(this);
        this.cursolBase.alpha = 0;
        this.cursolBase.tweener.wait(300).fadeIn(100);

        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.alpha = 0;

        //選択カーソル
        var paramCursol = {
            width:SC_W*0.85-10,
            height:SC_H*0.08,
            fill: "rgba(100,100,100,0.5)",
            stroke: "rgba(100,100,100,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(paramCursol)
            .addChildTo(this.cursolBase)
            .setPosition(SC_W*0.5, SC_H*0.6-3);

        this.time = 0;
        this.cursolTime = 0;

        this.openMenu(menu);
    },

    update: function() {
        if (!this.isFocus) {
            this.time++;
            return;
        }

        //キーボード操作
        var ct = app.controller;
        if (this.time > 30 && this.cursolTime > 10) {
            if (ct.up) {
                this.cursol.sel--;
                if (this.cursol.sel < 0) {
                    this.cursol.sel = 0;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.cursolTime = 0;
                    app.playSE("select");
                }
            }
            if (ct.down) {
                this.cursol.sel++;
                if (this.cursol.sel > this.menu.item.length-1) {
                    this.cursol.sel = this.menu.item.length-1;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.cursolTime = 0;
                    app.playSE("select");
                }
            }
            var sel = this.cursol.sel;
            if (this.item[sel] instanceof Selector) {
                var item = this.item[sel];
                if (ct.left) {
                    item.dec();
                    this.cursolTime = 0;
                }
                if (ct.right) {
                    item.inc();
                    this.cursolTime = 0;
                }
            }
        }
        if (this.time > 60) {
            if (ct.ok) {
                this.decision(this.cursol.sel);
            }
            if (ct.cancel) {
                this.cancel();
            }
        }
        this.time++;
        this.cursolTime++;
    },

    openMenu: function(menu) {
        menu = (menu||{}).$safe(this.defaultMenu);
        this.menu = menu;

        //既存メニュー項目クリア
        this.clearMenu();

        //メニュー項目数
        var numMenuItem = menu.item.length;

        //フレーム
        var paramFR = {
            width:SC_W*0.87,
            height:SC_H*(numMenuItem*0.15)+SC_H*0.1,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };

        this.frame = phina.extension.Frame(paramFR)
            .addChildTo(this.frameBase)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.frame.tweener.to({scaleY: 1}, 250, "easeOutCubic");
        this.base.tweener.wait(150).fadeIn(100);

        //初期位置
        var posY = SC_H*0.5-SC_H*(numMenuItem*0.05);

        //メニュータイトル
        this.title = phina.display.Label({text: menu.title}.$safe(this.labelParam))
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, posY);

        //クリック用
        var paramCL = {
            width:SC_W*0.8,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };

        //メニュー項目
        var that = this;
        this.item = [];
        this.click = [];
        for (var i = 0; i < numMenuItem; i++) {
            var y = posY+SC_H*0.1*i+SC_H*0.1;
            var item = menu.item[i];

            //通常メニュー項目
            if (typeof item == 'string') {
                this.item[i] = phina.display.Label({text: menu.item[i]}.$safe(this.labelParam))
                    .addChildTo(this.base)
                    .setPosition(SC_W*0.5, y);
            }
            //セレクタの場合
            if (item instanceof Selector) {
                this.item[i] = item;
                item.addChildTo(this.base).setPosition(SC_W*0.5, y);
            }

            //クリック判定用矩形
            this.click[i] = phina.display.RectangleShape(paramCL)
                .addChildTo(this.base)
                .setPosition(SC_W*0.5, y)
                .setInteractive(true);
            this.click[i].$extend({alpha: 0, selY: y, sel: i});
            this.click[i].onpointstart = function() {
                if (that.cursol.sel == this.sel) {
                    if (that.item[this.sel] instanceof Selector) {
                    } else {
                        that.decision(that.cursol.sel);
                    }
                } else {
                    app.playSE("select");
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, this.selY, 200, "easeOutCubic");
                    that.cursol.sel = this.sel;
                }
            }
        }
        this.cursol.y = this.item[0].y;
        this.cursol.sel = 0;
    },

    //既存メニュー項目クリア
    clearMenu: function() {
        if (this.frame) {
            this.frame.remove();
            delete this.frame;
        }
        if (this.title) {
            this.title.remove();
            delete this.title;
        }
        if (this.item) {
            for (var i = 0; i < this.item.length; i++) {
                this.item[i].remove();
                delete this.item[i];
                this.click[i].remove();
                delete this.click[i];
            }
            delete this.item;
            delete this.click;
        }
    },

    closeMenu: function() {
        this.base.tweener.clear().fadeOut(100);
        this.cursolBase.tweener.clear().fadeOut(100);
        this.frame.tweener.clear().wait(100).to({scaleY: 0}, 250, "easeOutCubic")
        this.bg.tweener.clear().to({alpha: 0.0}, 500, "easeOutCubic");
    },

    //メニュー項目選択決定
    decision: function(sel) {
        this.select = sel;
        this.flare('decision');
    },
    //メニューキャンセル
    cancel: function(sel) {
        this.flare('cancel');
    },
});

phina.define("Selector", {
    superClass: "phina.display.DisplayElement",

    //選択中アイテム
    selectItem: 0,

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },
    defaultOption: {
        title: {
            x: -60,
            text: "SELECT",
        },
        x: 60,
        width: 100,
        initial: 0,
        item: ["aaaaa", "2", "3", "4", "5"],
        description: ["1", "2", "3", "4", "5"],
        vertical: false,
    },

    init: function(option) {
        this.superInit();
        this.option = (option||{}).$safe(this.defaultOption);

        var width = this.option.width;

        //タイトル
        var titleParam = {text: this.option.title.text}.$safe(this.labelParam);
        this.title = phina.display.Label(titleParam)
            .addChildTo(this)
            .setPosition(this.option.title.x, 0);

        //選択初期位置
        this.selectItem = this.option.initial;
        if (this.selectItem < 0) this.selectItem = 0;

        //アイテムセット
        this.itemBase = phina.display.DisplayElement().addChildTo(this);
        this.items = [];
        for (var i = 0; i < this.option.item.length; i++) {
            this.items[i] = phina.display.Label({text: this.option.item[i]}.$safe(this.labelParam))
                .addChildTo(this.itemBase)
                .setPosition(this.option.x+i*100, 0);
            if (i != this.option.initial) this.items[i].alpha = 0;
        }

        var that = this;

        //選択操作用
        var paramC = {
            width: this.option.width*0.6,
            height: SC_H*0.05,
            fill: "rgba(255, 255, 255, 0.0)",
            stroke: null,
            backgroundColor: 'transparent',
        };
        this.btnC = phina.display.RectangleShape(paramC)
            .addChildTo(this)
            .setPosition(this.option.x, 0)
            .setInteractive(true);
        this.btnC.onpointstart = function() {
            //決定操作時、イベント発火
            that.flare('decision');
        }

        //操作ボタン
        //Shape用パラメータ
        var paramShp = {
            backgroundColor: 'transparent',
            fill: 'black',
            stroke: '#aaa',
            strokeWidth: 0,

            radius: 7,
            sides: 5,
            sideIndent: 0.38,
        };
        var paramBT = {
            width: 15,
            height:SC_H*0.05,
            fill: "rgba(255, 255, 255, 0.7)",
            stroke: null,
            backgroundColor: 'transparent',
        };
        this.btnL = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(-width*0.5+this.option.x, 0)
            .setInteractive(true);
        this.btnL.onpointstart = function() {
            this.tweener.clear().scaleTo(1.2, 100);
            that.dec();
        }
        this.btnL.onpointend = function() {
            this.tweener.clear().scaleTo(1.0, 100);
        }
        this.btnL2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnL)
            .setPosition(1, 0);
        this.btnL2.rotation = 30;
        
        this.btnR = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(width*0.5+this.option.x, 0)
            .setInteractive(true);
        this.btnR.onpointstart = function() {
            this.tweener.clear().scaleTo(1.2, 100);
            that.inc();
        }
        this.btnR.onpointend = function() {
            this.tweener.clear().scaleTo(1.0, 100);
        }
        this.btnR2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnR)
            .setPosition(-1, 0);
        this.btnR2.rotation = -30;
    },

    //項目インクリメント
    inc: function() {
        this.selectItem++;
        if (this.selectItem > this.option.item.length-1) {
            this.selectItem = this.option.item.length-1;
            return this;
        }
        this.items[this.selectItem-1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },

    //項目デクリメント
    dec: function() {
        this.selectItem--;
        if (this.selectItem < 0) {
            this.selectItem = 0;
            return this;
        }
        this.items[this.selectItem+1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },
});

phina.define("QueryDialog", {
    superClass: "phina.display.DisplayElement",

    //選択中アイテム
    selectItem: 0,

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    defaultOption: {
    },

    init: function(option) {
        this.superInit();
        option = (option||{}).$safe(this.defaultOption);
    },
});

/*
 *  pausescene.js
 *  2016/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("PauseScene", {
    superClass: "phina.display.DisplayScene",

    labelParam: {
        fill: "white",
        stroke: "black",
        strokeWidth: 1,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 35,
        fontWeight: ''
    },

    init: function(currentScene) {
        this.superInit();

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //ポーズ表示
        this.pause1 = phina.display.Label({text: "PAUSE"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.pause2 = phina.display.Label({text: "Press ESC or Space or Tap to exit", fontSize: 15}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6);

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        if (this.time > 30 && !this.isExit) {
            var ct = app.controller;
            var kb = app.keyboard;
            if (kb.getKey("escape") || kb.getKey("space") || ct.start) {
                this.pause1.tweener.clear()
                    .fadeOut(100)
                    .call(function() {
                        app.popScene();
                    });
                this.pause2.tweener.clear()
                    .fadeOut(100);
            }
        }
        this.time++;
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        if (this.time > 30) {
            app.popScene();
        }
    },
});


/*
 *  practicescene.js
 *  2016/08/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("PracticeScene", {
    superClass: "phina.display.DisplayScene",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    init: function(option) {
        this.superInit();
        option = (option||{}).$safe({
            selectStage: 1,
        });

        if (option.selectStage > 5) option.selectStage = 1;

        var menuParam = {
            title: "STAGE SELECT",
            item: ["", "START", "TEST", "EXIT"],
            description: ["ステージ選択", "指定したステージを開始", "TEST MODE","EXIT"],
        };
        var selectorParam = {
            title: {
                x: -80,
                text: "",
            },
            x: 0,
            initial: option.selectStage-1,
            width: SC_W*0.3,
            item: ["1", "2", "3", "4", "5"],
            description: ["1", "2", "3", "4", "5"],
        };
        menuParam.item[0] = Selector(selectorParam);
        menuParam.item[0].on('decision', function() {
            this.menu.flare('decision');
        }.bind(this));

        this.menu = MenuDialog(menuParam).addChildTo(this);
        this.menu.on('decision', function(e) {
            var sel = e.target.select;
            switch (sel) {
                case 0:
                case 1:
                    {
                        var stage = e.target.menu.item[0].selectItem;
                        var next = "stage"+(stage+1)+"load";
                        this.exit(next);
                    }
                    break;
                case 2:
                    this.exit("stage9load");
                    break;
                case 3:
                    this.menu.closeMenu();
                    this.tweener.clear()
                        .wait(600)
                        .call(function(){
                            this.exit("toTitle");
                        }.bind(this));
                    break;
            }
        }.bind(this));
    },
});

/*
 *  resultscene.js
 *  2016/04/05
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("ResultScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //ラベル用パラメータ
        labelParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: false,
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function(options) {
        this.superInit();
        this.$extend(this._member);
        options = (options||{}).$safe({
            stageId: 0,
        });

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        phina.display.Label({text: "STAGE "+options.stageId+" CLEAR"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.2);

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        this.time = 0;
    },
    
    update: function(app) {
        this.time++;
    },
});

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

/*
 *  settingscene.js
 *  2016/04/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("SettingScene", {
    superClass: "phina.display.DisplayScene",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    init: function(menu) {
        this.superInit();

        var menuParam = {
            title: "SETTING",
            item: ["GAME", "SYSTEM", "test", "EXIT"],
            description: ["menu1", "menu2", "test", "exit"],
        };
        menuParam.item[2] = Selector();

        this.menu = MenuDialog(menuParam).addChildTo(this);
        this.menu.on('decision', function(e) {
            var sel = e.target.select;
            if (sel == 3) {
                this.menu.closeMenu();
                this.tweener.clear()
                    .wait(600)
                    .call(function(){
                        app.popScene();
                    });
            }
        }.bind(this));
        this.menu.on('cancel', function(e) {
            this.menu.closeMenu();
            this.tweener.clear()
                .wait(600)
                .call(function(){
                    app.popScene();
                });
        }.bind(this));
    },
});


/*
 *  splashscene.js
 *  2015/12/02
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.namespace(function() {
    phina.define('SplashScene', {
        superClass: 'phina.display.DisplayScene',

        init: function() {
            this.superInit({width: SC_W, height: SC_H});

            this.unlock = false;
            this.loadcomplete = false;

            //preload asset
            var assets = Application.assets["preload"];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                this.loadcomplete = true;
            }.bind(this));

            //logo
            var texture = phina.asset.Texture();
            texture.load(SplashScene.logo).then(function() {
                this._init();
            }.bind(this));
            this.texture = texture;
        },

        _init: function() {
            this.sprite = phina.display.Sprite(this.texture)
                .addChildTo(this)
                .setPosition(this.gridX.center(), this.gridY.center())
                .setScale(0.3);
            this.sprite.alpha = 0;

            this.sprite.tweener
                .clear()
                .to({alpha:1}, 500, 'easeOutCubic')
                .call(function() {
                    this.unlock = true;
                }, this)
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic')
                .wait(250)
                .call(function() {
                    this.exit();
                }, this);
        },

        update: function() {
            var ct = app.controller;
            if (ct.ok || ct.cancel) {
                if (this.unlock && this.loadcomplete) this.exit();
            }
        },

        onpointstart: function() {
            if (this.unlock && this.loadcomplete) this.exit();
        },

        _static: {
            logo: "assets/images/logo.png",
        },
    });
});

/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("TitleScene", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //バージョン番号
        phina.display.Label({
            text: "ver "+_VERSION_,
            align: "left",
            baseline: "top",
            fontSize: 8,
            stroke: "black",
            fill: "white",
        }.$safe(this.titleParam)).addChildTo(this).setPosition(2, 2);

            //かっこよさげなオブジェ
        this.acc = phina.extension.CircleButton({radius: 64})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.3)
            .setScale(0.0, 0.0);
        this.acc.interactive = false;
        this.acc.tweener.clear().to({ scaleX: 2.0, scaleY: 1 }, 150);

        //タイトル
        phina.display.Label({text: "Planet"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.3-5, SC_H*0.3);
        phina.display.Label({text: "Buster"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.7+5, SC_H*0.3);
        phina.display.Label({text: "REVISION", fontSize:16, stroke: "red"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.35);

        var that = this;
        //選択カーソル
        var param2 = {
            width:SC_W,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.extension.CursolFrame({width: SC_W*0.7, height: SC_H*0.06})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6-3)

        phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.6);
        phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.7);
        this.label3 = phina.display.Label({text: "SETTING"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.label3.blink = false;
        this.label3.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
            if (!this.blink) this.visible = true;
        }

        //タッチ用
        for (var i = 0; i < 3; i++) {
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*SC_H*0.1)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected) return;

                if (that.select != this.select) {
                    that.select = this.select;
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(that.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                } else {
                    that.menuSelect();
                }
            }
        }

        //選択中メニュー番号
        this.select = 0;
        this.isSelected = false;

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        //戻ってきた場合に選択状態を解除
        this.on('enter', function() {
            this.time = 0;
            this.isSelected = false;
        }.bind(this));

        this.time = 0;
    },
    
    update: function(app) {
        //キーボード操作
        if (this.time > 10 && !this.isSelected) {
            var ct = app.controller;
            if (ct.up) {
                this.select--;
                if (this.select < 0) {
                    this.select = 0;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.down) {
                this.select++;
                if (this.select > 2) {
                    this.select = 2;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.ok) {
                this.menuSelect();
            }
        }
        this.time++;
    },

    menuSelect: function() {
        switch (this.select) {
            case 0:
            //ARCADE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.arcadeMode();
                }.bind(this));
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 1:
            //PRACTICE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.practiceMode();
                    this.isSelected = false;
                }.bind(this));
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 2:
            //SETTING
                app.playSE("setting");
                this.isSelected = true;
                this.tweener.clear().wait(700)
                    .call(function() {
                        this.label3.blink = false;
                        this.time = 0;
                        this.isSelected = false;
                        this.settingMode();
                    }.bind(this));
                this.label3.blink = true;
                break;
        }
    },

    arcadeMode: function() {
        this.exit("arcade");
    },

    practiceMode: function() {
        this.exit("practice");
    },

    settingMode: function() {
        app.pushScene(SettingScene(this));
    },
});

/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Ground", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        map: null,
        belt: false,    //繰り返し地形フラグ

        direction: 0,   //スクロール方向
        speed: 1,       //スクロール速度

        altitudeBasic: 20,  //基本高度
        altitude: 1,        //現在高度（基本高度に対する割合：１を１００％とする)
        isShadow: true,     //影有りフラグ

        deltaX : 0,        
        deltaY : 0,        
    },

    init: function(option) {
        this.superInit();
        this.$safe(this._member);
        option = (option || {}).$safe({
            asset: null,
            type: "image",
            belt: false,
            x: SC_W*0.5,
            y: SC_H*0.5
        });
        this.asset = option.asset;
        this.type = option.type;
        this.belt = option.belt;

        this.position.x = option.x;
        this.position.y = option.y;

        this.tweener.setUpdateType('fps');

        this.mapBase = phina.display.DisplayElement().setPosition(0, 0).addChildTo(this);
        this.mapBase.tweener.setUpdateType('fps');

        if (this.asset) {
            this.setupMap();
        }

        this.on("enterframe", this.defaultEnterframe);
    },

    defaultEnterframe: function() {
        var rad = (this.direction+90)*toRad;
        this.deltaX = Math.cos(rad)*this.speed;
        this.deltaY = Math.sin(rad)*this.speed;

        this.mapBase.x += this.deltaX;
        this.mapBase.y += this.deltaY;

        if (this.belt) {
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var m = this.map[x][y];
                    var sx = Math.floor((this.mapBase.x + m.x)/this.map.width);
                    if (sx >  0) m.x -= this.map.width*3;
                    if (sx < -2) m.x += this.map.width*3;
                    var sy = Math.floor((this.mapBase.y + m.y)/this.map.height);
                    if (sy >  0) m.y -= this.map.height*3;
                    if (sy < -2) m.y += this.map.height*3;
                }
            }
        }
    },

    setupMap: function() {
        if (!this.belt) {
            if (this.type == "image") {
                this.map = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                this.map = phina.display.Sprite(tmx.image).addChildTo(this.mapBase);
            }
            var w = this.map.width;
            var h = this.map.height;
            this.map.setPosition(0, 0);
            this.map.setOrigin(0, 0);
        } else {
            if (this.type == "image") {
                var image = phina.asset.AssetManager.get('image', this.asset);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                var image = tmx.image;
            }
            this.map = [];
            this.map.width = image.domElement.width;
            this.map.height = image.domElement.height;
            for (var x = 0; x < 3; x++) {
                this.map[x] = [];
                for (var y = 0; y < 3; y++) {
                    var mx = (x-1) * this.map.width;
                    var my = (y-1) * this.map.height;
                    this.map[x][y] = phina.display.Sprite(image)
                        .addChildTo(this.mapBase)
                        .setPosition(mx, my)
                        .setOrigin(0, 0);
                    this.map[x][y].mapX = Math.floor(mx / this.map.width);
                    this.map[x][y].mapY = Math.floor(my / this.map.height);
                }
            }
        }
    },

    addLayer: function(name) {
    },

    setDirection: function(dir) {
        this.direction = dir;
        return this;
    },

    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    },

    setPosition: function(x, y) {
        this.mapBase.x = x;
        this.mapBase.y = y;
        return this;
    },

    _accessor: {
        x: {
            "get": function() { return this.mapBase.x; },
            "set": function(x) { this.mapBase.x = x;}
        },
        y: {
            "get": function() { return this.mapBase.y; },
            "set": function(y) { this.mapBase.x = y;}
        },

        shadowX: {
            "get": function() {
                return (this.altitudeBasic * this.altitude)*0.5;
            },
            "set": function(y) {}
        },
        shadowY: {
            "get": function() {
                return this.altitudeBasic * this.altitude;
            },
            "set": function(y) {}
        },
/*
        scaleX: {
            "get": function() { return this.mapBase.scaleX; },
            "set": function(x) { this.mapBase.scaleX = x;}
        },
        scaleY: {
            "get": function() { return this.mapBase.scaleY; },
            "set": function(y) { this.mapBase.scaleY = y;}
        },
*/
    }
});

/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("Stage1", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage1", true);
            this.player.isAfterburner = true;
        });
        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        //Stage data
        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });

        this.add(  90, "Hornet1-left");
        this.add(  20, "Hornet1-right");
        this.add( 120, "Hornet1-center");

        this.add( 120, "ToyBox-p-right");

        this.add( 120, "Fragarach-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add( 180, "Hornet1-center");

        this.add( 120, "Fragarach-left");
        this.add(  60, "Fragarach-right");

        this.add( 120, "Hornet3-center");

        this.add( 120, "Fragarach-left2");
        this.add(   1, "Fragarach-right2");

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });

        this.add(  60, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");
        this.add( 120, "Hornet3-center");

        //中ボス
        this.add( 360, "ThorHammer", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.add( 1800, function() {});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add(120, function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });

        this.add(  30, "BigWing-left");
        this.add( 180, "BigWing-right");

        this.add( 120, "Hornet2-left");
        this.add(  20, "Hornet2-right");
        this.add( 120, "Hornet2-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add( 120, "ToyBox-p-center");

        //WARNING
        this.add( 360, function() {
            this.enterWarning();
        });

        //ステージボス
        this.add( 300, function() {
            this.ground.tweener.clear().to({speed:0.0}, 180, "easeInOutCubic");
        });
        this.add( 120, "Golyat", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:-7.0}, 180, "easeInOutCubic");
        });
        this.add( 1800, function() {});


        //イベント登録
        this.addEvent("scroll_1", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_2", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_3", function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.addEvent("scroll_4", function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });
        this.addEvent("scroll_5", function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });
        this.addEvent("warning", function() {
            this.enterWarning();
        });

    },
});

//ステージ１地形管理
phina.define("Stage1Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;

        this.setScale(0.2, 0.2);
        this.speed = 1.0;
    },
});

})();

/*
 *  Stage2.js
 *  2016/08/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("Stage2", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:1.0, alpha:1}, 1, "easeInOutQuad");
            app.playBGM("stage2", true);
        });

        this.add( 180, function() {
            this.event["boss_shadow"].value.call();
        }.bind(this));
        //WARNING
        this.add( 360, function() {
            this.enterWarning();
        });
        this.add( 240, function() {
            this.event["Garuda"].value.call();
        }.bind(this));

        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(2.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //ボス登場演出
        this.addEvent("Garuda", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*0.5, SC_H*0.4);
            shadow.layer = LAYER_SHADOW;
            shadow.alpha = 0.0;
            shadow.time = 0;
            shadow.addChildTo(app.currentScene);

            var that = this;
            shadow.tweener.setUpdateType('fps').clear()
                .to({alpha: 0.4, y: SC_H*0.2}, 300, "easeOutSine")
                .wait(120)
                .call(function() {
                    that.parentScene.enterEnemyUnit("Garuda");
                })
                .wait(120)
                .call(function() {
                    this.remove();
                }.bind(shadow));

            shadow.update = function() {
                this.time++;
                if (this.time < 300) return; 

                //煙もくもくー
                var x1 = this.x;
                var y1 = this.y-10;
                var x2 = this.x+148;
                var y2 = this.y+40;
                var vy = this.parentScene.ground.deltaY;
                for (var r = 0; r < 2; r++) {
                    if (r == 1) x2 = this.x-148;
                    for (var i = 0; i < 3; i++) {
                        var p = Math.randfloat(0, 1.0);
                        var px = Math.floor(x1*p+x2*(1-p));
                        var py = Math.floor(y1*p+y2*(1-p))-32;
                        var layer = this.parentScene.effectLayerUpper;
                        layer.enterSmokeLarge({
                            position: {x: px, y: py},
                            velocity: {x: 0, y: vy+Math.randint(0, 3), decay: 1.01},
                            delay: rand(0, 2)
                        });
                    }
                }
            }
        }.bind(this));
    },
});

//ステージ１地形管理
phina.define("Stage2Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;
    },
});

})();

/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//テスト用ステージ
phina.define("Stage9", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage9", true);
        });

//        this.add( 180, "Raven");
        this.add( 180, function() {
//            this.event["boss_shadow"].value.call();
           this.event["Garuda"].value.call();
        }.bind(this));


        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(2.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //ボス登場演出
        this.addEvent("Garuda", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*0.5, SC_H*0.4);
            shadow.layer = LAYER_SHADOW;
            shadow.alpha = 0.0;
            shadow.time = 0;
            shadow.addChildTo(app.currentScene);

            var that = this;
            shadow.tweener.setUpdateType('fps').clear()
                .to({alpha: 0.4, y: SC_H*0.2}, 300, "easeOutSine")
                .wait(120)
                .call(function() {
                    that.parentScene.enterEnemyUnit("Garuda");
                })
                .wait(120)
                .call(function() {
                    this.remove();
                }.bind(shadow));

            shadow.update = function() {
                this.time++;
                if (this.time < 300) return; 

                //煙もくもくー
                var x1 = this.x;
                var y1 = this.y-10;
                var x2 = this.x+148;
                var y2 = this.y+40;
                var vy = this.parentScene.ground.deltaY;
                for (var r = 0; r < 2; r++) {
                    if (r == 1) x2 = this.x-148;
                    for (var i = 0; i < 3; i++) {
                        var p = Math.randfloat(0, 1.0);
                        var px = Math.floor(x1*p+x2*(1-p));
                        var py = Math.floor(y1*p+y2*(1-p))-32;
                        var layer = this.parentScene.effectLayerUpper;
                        layer.enterSmokeLarge({
                            position: {x: px, y: py},
                            velocity: {x: 0, y: vy+Math.randint(0, 3), decay: 1.01},
                            delay: rand(0, 2)
                        });
                    }
                }
            }
        }.bind(this));

        //WARNING
        this.addEvent("warning", function() {
            this.enterWarning();
        });
    },
});

//ステージ１地形管理
phina.define("Stage9Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1",
            type: "tmx",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
//        this.mapBase.x = -w*0.5;
//        this.mapBase.y = -h*0.5;
        this.mapBase.x = 0;
        this.mapBase.y = -2000*32+SC_H;
    },
});

})();

/*
 *  StageController.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ制御
phina.define("StageController", {
    superClass: "phina.app.Object2D",

    parentScene: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: null,
    index: 0,

    //マップトリガイベント
    event: null,

    altitude: 100,

    init: function(scene, player, tmx, layer) {
        this.superInit();

        this.parentScene = scene;
        this.seq = [];

        this.event = [];

        this.player = player;
    },

    //時間イベント追加
    add: function(time, value, option) {
        this.index += time;
        this.seq[this.index] = {
            value: value,
            option: option,
        };
    },

    //時間イベント取得
    get: function(time) {
        var data = this.seq[time];
        if (data === undefined) return null;
        return data;
    },

    //マップイベント追加
    addEvent: function(id, value, option) {
        this.event[id] = {
            value: value,
            option: option,
            executed: false,
        };
    },

    //マップイベント取得
    getEvent: function(id) {
        var data = this.event[id];
        if (data === undefined) return null;
        return data;
    },

    //次にイベントが発生する時間を取得
    getNextEventTime: function(time) {
        var data = this.seq[time];
        if (data === undefined) {
            var t = time+1;
            var rt = -1;
            this.seq.some(function(val, index){
                if (index > t) {
                    rt = index;
                    return true;
                }
            },this.seq);
            return rt;
        } else {
            return time;
        }
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },
});

})();

/*
 *  Enemy.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Enemy", {
    superClass: "phina.display.DisplayElement",

    _member: {
        layer: LAYER_OBJECT_MIDDLE,    //所属レイヤー
        parentEnemy: null,      //親となる敵キャラ

        //各種フラグ
        isCollision: true,  //当り判定
        isDead: false,      //死亡
        isSelfCrash: false, //自爆
        isMuteki: false,    //無敵
        isBoss: false,      //ボス
        isOnScreen: false,  //画面内に入った
        isGround: false,    //地上フラグ
        isHover: false,     //マップスクロールの影響無視
        isEnemy: true,      //敵機判別
        isAttack: true,     //攻撃フラグ
        isCrashDown: false, //墜落フラグ

        //キャラクタ情報
        name: null,
        type: -1,
        def: 0,
        defMax: 0,
        danmakuName: null,
        id: -1,
        enterParam: null,
        altitude: 1,

        //機体用テクスチャ情報
        body: null,
        texName: null,
        texIndex: 0,
        texWidth: 32,
        texHeight: 32,
        texColor: "",

        //基本情報
        data: null,
        player: null,

        //前フレーム座標
        beforeX: 0,
        beforeY: 0,

        //実行タスクキュー
        task: null,
    },

    init: function(name, x, y, id, param) {
        this.superInit();
        this.$extend(this._member);

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        x = x || 0;
        y = y || 0;
        this.setPosition(x, y);
        this.id = id || -1;
        this.enterParam = param; //EnemyUnitからの投入時パラメータ

        this.name = name;
        var d = this.data = enemyData[name];
        if (!d) {
            console.warn("Enemy data not found.: '"+name+"'");
            return false;
        }

        //弾幕定義
        if (d.danmakuName) {
            this.danmakuName = d.danmakuName
            if (d.danmakuName instanceof Array) {
                this.startDanmaku(this.danmakuName[0]);
            } else {
                this.startDanmaku(this.danmakuName);
            }
        }

        //基本仕様コピー
        this.type = d.type || ENEMY_SMALL;
        this.def = this.defMax = d.def;
        this.width = d.width || 32;
        this.height = d.height || 32;
        this.layer = d.layer || LAYER_OBJECT_MIDDLE;
        this.point = d.point || 0;

        this.setup = d.setup || this.setup;
        this.equipment = d.epuipment || this.equipment;
        this.algorithm = d.algorithm || this.algorithm;
        this.deadChild = d.deadChild || this.deadChild;
        this.changeColor = d.changeColor || this.changeColor;

        //破壊パターン
        if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS ){
            this.dead = d.dead || this.defaultDeadBoss;
        } else {
            this.dead = d.dead || this.defaultDead;
        }

        //機体用スプライト
        if (d.texName) {
            this.texName = d.texName;
            this.texIndex = d.texIndex || 0;
            this.texWidth = d.texWidth;
            this.texHeight = d.texHeight;
            this.body = phina.display.Sprite(d.texName, d.texWidth, d.texHeight).addChildTo(this);
            this.body.tweener.setUpdateType('fps');

            this.texTrimX = d.texTrimX || 0;
            this.texTrimY = d.texTrimY || 0;
            this.texTrimWidth = d.texTrimWidth || this.body.image.width;
            this.texTrimHeight = d.texTrimHeight || this.body.image.height;

            this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
            this.body.setFrameIndex(this.texIndex);
        } else {
            //当り判定ダミー表示
            var that = this;
            this.texName = null;
            this.texWidth = this.width;
            this.texHeight = this.height;
            this.body = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.body.tweener.setUpdateType('fps');
            this.body.renderRectangle({fillStyle: "rgba(255,255,0,1.0)", strokeStyle: "rgba(255,255,0,1.0)"});
            this.body.update = function() {this.rotation = -that.rotation;};
        }
        this.body.alpha = 1.0;
        this.body.blendMode = "source-over";

        if (VIEW_COLLISION) {
            this.col = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.col.renderRectangle({fillStyle: "rgba(255,255,0,0.5)", strokeStyle: "rgba(255,255,0,0.5)"});
            this.col.update = function() {this.rotation = -that.rotation;};
        }

        if (DEBUG) {
            //耐久力表示
            var df = this.defDisp = phina.display.Label({text: "[0/0]"}).addChildTo(this);
            var that = this;
            df.update = function() {
                this.rotation = -that.rotation;
                this.text = "["+that.def+"/"+that.defMax+"]";
            }
        }

        //フラグセット
        this.isCollision = d.isCollision || this.isCollision;
        this.isDead      = d.isDead      || this.isDead;
        this.isSelfCrash = d.isSelfCrash || this.isSelfCrash;
        this.isMuteki    = d.isMuteki    || this.isMuteki
        this.isOnScreen  = d.isOnScreen  || this.isOnScreen;
        this.isGround    = d.isGround    || this.isGround;
        this.isHover     = d.isHover     || this.isHover;
        this.isEnemy     = d.isEnemy     || this.isEnemy;
        this.isAttack    = d.isAttack    || this.isAttack;
        this.isCrashDown = d.isCrashDown || this.isCrashDown;
        if (this.type == ENEMY_MBOSS
            || this.type == ENEMY_BOSS
            || this.type == ENEMY_BOSS_EQUIP) this.isBoss = true;

        //それ以外の固有変数をコピー
        this.$safe(d);

        //パラメータセットアップ
        this.parentScene = app.currentScene;
        this.player = this.parentScene.player;
        this.setup(param);

        //機影追加
        this.addShadow();

        //当り判定設定
        this.boundingType = "rect";

        //add時
        this.on('added', this.equipment);

        //remove時
        this.on('removed', this.release);

        this.time = 0;
    },

    setup: function(enterParam) {
    },

    equipment: function(enterParam) {
    },

    update: function(app) {
        //bulletML.runner更新処理
        if (!this.isDead && this.runner) {
            this.runner.x = this.position.x;
            this.runner.y = this.position.y;
            this.runner.update();
        }

        //地上物現座標調整
        if (this.isGround && !this.isHover) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        //ボス系破壊時弾消去
        if (this.isDead) {
            if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS) this.parentScene.eraseBullet();
        }

        //タスク処理
        if (this.task) {
            this.execTask(this.time);
        }

        //行動アルゴリズム
        this.algorithm(app);

        //スクリーン内入った判定
        if (this.isOnScreen) {
            if (!this.isBoss) {
                var w = this.body.width/2;
                var h = this.body.height/2;
                if (this.x < -w || this.x > SC_W+w || this.y < -h || this.y > SC_H+h) {
                    this.remove();
                    this.isCollision = false;
                }
            }
        } else {
            //中心が画面内に入った時点を画面内と判定する
            if (0 < this.x && this.x < SC_W && 0 < this.y && this.y < SC_H) this.isOnScreen = true;
        }

        //自機との当り判定チェック
        var player = this.player;
        if (this.type == ENEMY_ITEM) {
            //アイテムの場合
            if (this.isHitElement(player)) {
                this.remove();
                player.getItem(this.kind);
            }
        } else {
            //アイテム以外の場合
            if (this.isCollision && !this.isGround && !this.isDead && player.isCollision && this.isHitElement(player)) {
                player.damage();
            }
        }

        //親機が破壊された場合、自分も破壊
        if (!this.isDead && this.parentEnemy && this.parentEnemy.isDead) {
            this.isSelfCrash = true;
            this.dead();
        }

        //瀕死
        if (this.def < this.defMax*0.2) this.nearDeath();

        //地上敵で自機に近い場合は弾を撃たない
        if (this.isGround && !this.isBoss) {
            if (distanceSq(this, this.parentScene.player) < 4096)
                this.isAttack = false;
            else
                this.isAttack = true;
        }

        this.body.frameIndex = this.texIndex;

        this.beforeX = this.x;
        this.beforeY = this.y;
        this.time++;
    },

    //アルゴリズム
    algorithm: function() {
    },

    damage: function(power, force) {
        if (this.isMuteki || this.isDead || !this.isCollision) return false;

        this.def -= power;
        if (force) this.def = -1;
        if (this.def < 1) {
            this.def = 0;

            //破壊パターン投入
            this.flare('dead');
            this.dead();

            //親機に破壊を通知
            if (this.parentEnemy) {
                this.parentEnemy.deadChild(this);
            }

            //スコア加算
            if (!this.isSelfCrash) app.score += this.point;

            //ボス撃破をシーンに通知
            if (this.data.type == ENEMY_BOSS || this.data.type == ENEMY_MBOSS) {
                this.parentScene.flare('end_boss');
            }

            this.parentScene.enemyKill++;
            return true;
        }

        //被ダメージ演出
        this.changeColor("White", true);
        this.body.tweener.clear().wait(1).call(function(){this.changeColor()}.bind(this));

        return false;
    },

    //瀕死状態
    nearDeath: function() {
        if (this.time % 30 == 0) {
            this.changeColor("Red");
        } else if (this.time % 30 == 5) {
            this.changeColor();
        }

        if (this.time % 35 == 0) {
            var ground = this.parentScene.ground;
            var w = this.width/2;
            var h = this.height/2;
            var num = this.type == ENEMY_BOSS || this.type == ENEMY_MBOSS? 3: 1;
            for (var i = 0; i < num; i++) {
                var x = this.x+rand(-w, w);
                var y = this.y+rand(-h, h);
                var layer = this.parentScene.effectLayerUpper;
                var delay = i == 0? 0: rand(0, 15);
                Effect.enterExplode(layer, {
                    position: {x: x, y: y},
                    velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
                    delay: delay,
                });
            }
            app.playSE("explodeSmall");
        }
        return this;
    },

    //色を赤or白くする
    changeColor: function(color, reverse) {
        if (!this.texName) return;
 
        //指定色によって画像名が変わる
        if (reverse && this.texColor != "") {
            this.texColor = "";
        } else {
            if (color === undefined) {
                this.texColor = "";
            } else {
                if (color != "Red" && color != "White" && color != "Black") color = "Red";
                this.texColor = color;
            }
        }

        //画像の再設定
        this.body.setImage(this.texName+this.texColor, this.texWidth, this.texHeight);
        this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.body.setFrameIndex(this.texIndex);
    },

    //通常破壊パターン
    defaultDead: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);        

        //弾消し
        if (this.data.type == ENEMY_MIDDLE) {
            this.parentScene.eraseBullet(this);
        } else if (this.data.type == ENEMY_LARGE) {
            this.parentScene.eraseBullet();
            this.parentScene.timeVanish = 60;
        }


        if (this.isCrashDown) {
            var grY = this.y + 80;
            this.tweener.clear()
                .to({y: grY, altitude: 0.1}, 120, "easeSineOut")
                .call(function(){
                    this.explode();
                    this.remove();
                }.bind(this));
        } else {
            //破壊時消去インターバル
            if (this.data.explodeType == EXPLODE_SMALL) {
                this.remove();
            } else {
                this.tweener.clear()
                    .to({alpha: 0}, 15)
                    .call(function(){
                        this.remove();
                    }.bind(this));
                if (this.shadow) {
                    this.shadow.tweener.clear()
                       .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }
        }

        return this;
    },

    defaultDeadBoss: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 80, 300)
            .call(function() {
                this.explode(width, height);
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },

    explode: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        //爆発無し
        if (this.data.explodeType == EXPLODE_NOTHING) return;

        var ground = this.parentScene.ground;
        var upper = this.parentScene.effectLayerUpper;
        var lower = this.parentScene.effectLayerLower;
        var vx = this.x-this.beforeX+ground.deltaX;
        var vy = this.y-this.beforeY+ground.deltaY;

        switch (this.data.explodeType) {
            case EXPLODE_SMALL:
                Effect.enterExplode(upper, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_MIDDLE:
            case EXPLODE_LARGE:
                var num = rand(20, 30)*this.data.explodeType;
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width, width);
                    var y = this.y+rand(-height, height);
                    var delay = rand(0, 30);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                app.playSE("explodeLarge");
                break;
            case EXPLODE_GROUND:
                Effect.enterExplodeGround(lower, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_BOSS:
                var num = rand(100, 150);
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width*0.7, width*0.7);
                    var y = this.y+rand(-height*0.7, height*0.7);
                    var delay = rand(0, 15);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                break;
        }
    },

    //BulletML起動
    startDanmaku: function(danmakuName) {
        if (this.runner) {
            this.runner.stop = true;
            this.runner = null;
        }
        this.runner = danmaku[danmakuName].createRunner(BulletConfig);
        this.runner.host = this;
        this.runner.onNotify = function(eventType, event) {
            this.flare("bullet" + eventType, event);
        }.bind(this);
        return this;
    },

    //BulletML停止
    stopDanmaku: function() {
        if (this.runner) {
            this.runner.stop = true;
        }
        return this;
    },

    //BulletML再開
    resumeDanmaku: function() {
        if (this.runner) {
            this.runner.stop = false;
        }
        return this;
    },

    //親機のセット
    setParentEnemy: function(parent) {
        this.parentEnemy = parent;
        return this;
    },

    //子機が破壊された場合に呼ばれるコールバック
    deadChild: function(child) {
    },

    //指定ターゲットの方向を向く
    lookAt: function(target) {
        target = target || this.player;

        //ターゲットの方向を向く
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.rotation = deg + 90;
        return this;
    },

    //指定ターゲットの方向に進む
    moveTo: function(target, speed, look) {
        target = target || this.player;
        speed = speed || 5;

        //ターゲットの方向を計算
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);

        if (look || look === undefined) this.rotation = deg + 90;

        this.vx = Math.cos(rad+Math.PI)*speed;
        this.vy = Math.sin(rad+Math.PI)*speed;
        this.x += this.vx;
        this.y += this.vy;
        return this;
    },

    release: function() {
        if (this.shadow) this.shadow.remove();
        this.removeChildren();
        return this;
    },

    //処理タスクの追加
    addTask: function(time, task) {
        if (!this.task) this.task = [];
        this.task[time] = task;
    },

    //処理タスクの実行
    execTask: function(time) {
        var t = this.task[time];
        if (t) {
            if (typeof(t) === 'function') {
                t.call(this, app);
            } else {
                this.fire(t);
            }
        }
    },

    //機影追加
    addShadow: function() {
        this.shadow = phina.display.Sprite(this.texName+"Black", this.texWidth, this.texHeight);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.shadow.setFrameIndex(this.texIndex);

        var that = this;
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            this.visible = ground.isShadow;

            this.rotation = that.rotation;
            if (that.isGround) {
                this.x = that.x + 10;
                this.y = that.y + 10;
            } else {
                this.x = that.x + ground.shadowX * that.altitude;
                this.y = that.y + ground.shadowY * that.altitude;
                this.scaleX = ground.scaleX;
                this.scaleY = ground.scaleY;
            }
        }
    },

    //土煙追加
    addSmoke: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmoke({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
    //土煙追加（小）
    addSmokeSmall: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmokeSmall({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
});

/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

const enemyData = [];

/*
 *  攻撃ヘリ「ホーネット」
 */
enemyData['Hornet'] = {
    //使用弾幕名
    danmakuName: ["Hornet1", "Hornet2", "Hornet3"],

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 30,

    //得点
    point: 300,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.roter = phina.display.Sprite("tex1", 32, 32).addChildTo(this);
        this.roter.index = 32;
        this.roter.setFrameIndex(32);

        this.vx = 0;
        this.vy = 0;

        //行動パターン分岐
        this.pattern = enterParam.pattern;
        switch (this.pattern) {
            case 1:
                this.tweener.moveBy(0, 300, 120, "easeOutQuart")
                    .wait(60)
                    .moveBy(0, -300, 120)
                    .call(function(){this.remove();}.bind(this));
                break;
            case 2:
                this.moveTo(this.player, 5, true);
                break;
            case 3:
                this.tweener.moveBy(0, 200, 120, "easeOutQuart")
                    .wait(600)
                    .moveBy(0, -300, 120)
                    .call(function(){this.phase++;}.bind(this));
                this.startDanmaku(this.danmakuName[2]);
                break;
            case 4:
                this.tweener.clear().moveBy(0, SC_H*0.5, 300).wait(480).moveBy(0, -SC_H, 600);
                break;
            default:
                this.tweener.moveBy(0, 200, 120, "easeOutQuart")
                    .wait(60)
                    .moveBy(0, -250, 120)
                    .call(function(){this.remove();}.bind(this));
                break;
        }

        //ミサイル発射
        this.on('bulletmissile', function(e) {
            this.parentScene.enterEnemy("Medusa", this.x, this.y).setHoming(true).setVelocity(-0.5, -2.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y).setHoming(true).setVelocity( 0.5, -2.0);
        }.bind(this));
    },

    algorithm: function() {
        this.lookAt();
        if (this.time % 2 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }

        if (this.pattern == 2) {
            this.x += this.vx;
            this.y += this.vy;
        }

        if (this.pattern == 3) {
            if (this.phase == 1) {
                this.moveTo(this.parentScene.player, 5, true);
                this.phase++;
            }
            if (this.phase == 2) {
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        //画面下部では弾を出さない
        if (this.y > SC_H*0.7) this.stopDanmaku();

    },
};

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
enemyData['MudDauber'] = {
    //使用弾幕名
    danmakuName: "MudDauber",

    //当り判定サイズ
    width:  60,
    height: 26,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 64,
    texIndex: 6,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 114, 48).addChildTo(this);
        this.roter.setFrameTrimming(288, 128, 228, 96);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        this.vy = 5;
        this.tweener.to({vy: 0.5}, 120, "easeOutCubic").call(function(){this.phase++;}.bind(this));
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+6;
            this.body.setFrameIndex(this.index);
        }

        this.y+=this.vy;
        if (this.phase == 1) {
        }
    },
};

/*
 *  中型爆撃機「ビッグウィング」
 */
enemyData['BigWing'] = {
    //使用弾幕名
    danmakuName: "BigWing",

    //当り判定サイズ
    width:  80,
    height: 26,

    //耐久力
    def: 1000,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 48,
    texIndex: 2,

    setup: function() {
        this.index = this.texIndex;
        this.isCrashDown = true;
    },

    algorithm: function() {
        if (this.time % 2 == 0) this.y++;
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+2;
            this.body.setFrameIndex(this.index);
        }
    },
};

/*
 *  中型攻撃機「デルタ」
 */
enemyData['Delta'] = {
    //使用弾幕名
    danmakuName: "BigWing",

    //当り判定サイズ
    width:  80,
    height: 26,

    //耐久力
    def: 1000,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 256,
    texTrimWidth: 192,
    texTrimHeight: 96,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
    },

    algorithm: function() {
        if (this.time % 2 == 0) this.y++;
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+2;
            this.body.setFrameIndex(this.index);
        }
    },
};

/*
 *  飛空挺「スカイブレード」
 */
enemyData['SkyBlade'] = {
    //使用弾幕名
    danmakuName: "SkyBlade",

    //当り判定サイズ
    width:  40,
    height: 96,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 48, 104).addChildTo(this);
        this.roter.setFrameTrimming(96, 128, 192, 104);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        if (this.x < SC_W*0.5) {
            this.px = 1;
            this.tweener.moveBy( SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        } else {
            this.px = -1;
            this.tweener.moveBy(-SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        }
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2;
            this.body.setFrameIndex(this.index);
        }
        if (this.phase == 1) {
            this.y--;
            this.x+=this.px;
        }
    },
};

/*
 *  中型戦車「フラガラッハ」
 */
enemyData['Fragarach'] = {
    //使用弾幕名
    danmakuName: "Fragarach",

    //当り判定サイズ
    width:  48,
    height: 48,

    //耐久力
    def: 100,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_GROUND,

    //各種フラグ
    isGround: true,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.index = this.texIndex;
        this.phase = 0;

        //パラメータにより進行方向を決定
        this.pattern = param.pattern;
        this.speed = 0.5;
        this.direction = 0;
        switch (this.pattern) {
            case "c":
                this.direction = 0;
                break;
            case "b":
                this.direction = 180;
                break;
            case "l":
                this.direction = 90;
                break;
            case "r":
                this.direction = 270;
                break;
        }

        this.turret = phina.display.Sprite("tex1", 24, 24).addChildTo(this);
        this.turret.setFrameTrimming(192, 32, 24, 24);
        this.turret.setFrameIndex(0);
    },

    algorithm: function() {
        //砲台をターゲットの方向に向ける
        var ax = this.x - this.parentScene.player.x;
        var ay = this.y - this.parentScene.player.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.turret.rotation = deg + 90;

        if (this.time % 4 == 0) {
            this.index = (this.index+1)%4;
            this.body.setFrameIndex(this.index);
        }
        if (this.vx != 0 || this.vy != 0) {
            this.addSmokeSmall(1);
        }

        if (this.pattern == "l" && this.x > SC_W*0.4) {
            this.direction = 180;
        }
        if (this.pattern == "r" && this.x < SC_W*0.6) {
            this.direction = 180;
        }

        //移動処理
        this.rotation = this.direction;
        var rad = this.direction * toRad;
        this.vx = Math.sin(rad) * this.speed;
        this.vy = Math.cos(rad) * this.speed;
        this.x += this.vx;
        this.y += this.vy;
    },
};

/*
 *  浮遊砲台「ブリュナーク」（設置）
 */
enemyData['Brionac1'] = {
    //使用弾幕名
    danmakuName: ["Brionac1_1", "Brionac1_2", "Brionac_ground1_3"],

    //当り判定サイズ
    width:  40,
    height: 40,

    //耐久力
    def: 400,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 64,
    texTrimWidth: 48,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.isGround = true;

        this.vx = 0;
        this.vy = 0;

        //パラメータにより行動パターンを決定
        switch (param.pos) {
            case "center":
                break;
            case "left":
                this.vx = 4;
                break;
            case "right":
                this.vx = -4;
                break;
        }

        this.turret = phina.display.Sprite("tex2", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(64, 64, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, 0);
    },

    algorithm: function() {
        this.x += this.vx;
        this.y += this.vy;

        this.turret.rotation++;

        this.addSmokeSmall(1);
    },
};

/*
 *  大型ミサイル「ミスティルテイン」
 */
enemyData['Mistilteinn'] = {
    //使用弾幕名
    danmakuName: "basic",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;
        this.setFrameTrimming(0, 128, 96, 104);
    },

    algorithm: function() {
    },
};

/*
 *  中型輸送機「トイボックス」
 */
enemyData['ToyBox'] = {
    //使用弾幕名
    danmakuName: "ToyBox",

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 500,

    //得点
    point: 5000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 64,
    texHeight: 128,
    texIndex: 2,

    //投下アイテム種類
    kind: 0,

    setup: function(enterParam) {
        if (enterParam.drop == "power") this.kind = ITEM_POWER;
        if (enterParam.drop == "bomb") this.kind = ITEM_BOMB;
        if (enterParam.drop == "1UP") this.kind = ITEM_1UP;
        this.tweener.clear().moveBy(0, SC_H*0.5, 300).wait(480).moveBy(0, -SC_H, 600);

        var that = this;
        this.turret = phina.display.Sprite("tex1", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(196, 32, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, -36);
        this.turret.update = function() {
            this.lookAt({
                x: that.x-that.player.x,
                y: that.y-that.player.y,
            });
        }
    },

    epuipment: function() {
    },

    algorithm: function() {
    },

    dead: function() {
        //破壊時アイテムをシーンに投入
        this.turret = Enemy("Item", this.x, this.y, 0, {kind: 0}).addChildTo(this.parentScene);

        //通常の破壊処理
        this.defaultDead();
    },
}

/*
 *  アイテム
 */
enemyData['Item'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 1,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_ITEM,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,
    texTrimX: 0,
    texTrimY: 96,
    texTrimWidth: 96,
    texTrimHeight: 32,

    //投下アイテム区分
    kind: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.reset = true;
        this.count = 0;

        this.kind = enterParam.kind;
        this.frameIndex = this.kind;

        this.setScale(1.5);
     },

    epuipment: function() {
    },

    algorithm: function() {
        if (this.reset) {
            this.reset = false;
            this.count++;
            if (this.count < 5) {
                var px = Math.randint(0, SC_W);
                var py = Math.randint(SC_H*0.3, SC_W*0.9);
                this.tweener.clear()
                    .to({x: px, y: py}, 180, "easeInOutSine")
                    .wait(30)
                    .call(function() {
                        this.reset = true;
                    }.bind(this));
            } else {
                this.tweener.clear().to({x: this.x, y: SC_H*1.1}, 180, "easeInOutSine");
            }
       }
    },
}

/*
 *  誘導弾「メドゥーサ」
 */
enemyData['Medusa'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  8,
    height: 8,

    //耐久力
    def: 10,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 8,
    texHeight: 24,
    texIndex: 0,
    texTrimX: 192,
    texTrimY: 64,
    texTrimWidth: 8,
    texTrimHeight: 24,

    setup: function(enterParam) {
        this.body.setOrigin(0.5, 0.0);

        //一定時間ごとに煙だすよ
        this.tweener.clear()
            .wait(5)
            .call(function() {
                this.parentScene.effectLayerMiddle.enterSmokeSmall({
                    position: {x: this.x, y: this.y},
                    velocity: {x: 0, y: 0, decay: 1},
                    delay: 0
                });
            }.bind(this))
            .setLoop(true);

        //自動追尾設定
        this.isHoming = false;

        //移動情報
        this.vx = 0;
        this.vy = 3;
        this.spd = 0.05;
        this.maxSpeed = 3;
    },

    algorithm: function() {

        if (this.isHoming) {
            this.lookAt();
            var vx = this.player.x-this.x;
            var vy = this.player.y-this.y;
            var d = Math.sqrt(vx*vx+vy*vy);
            this.vx += vx/d*this.spd;
            this.vy += vy/d*this.spd;
            if (d < 16) this.isHoming = false;
        } else {
            this.lookAt({x: this.x+this.vx, y: this.y+this.vy});
        }
        this.x += this.vx;
        this.y += this.vy;
    },

    setHoming: function(f) {
        if (f && !this.isHoming) {
            this.vx = 0;
            this.vy = 0;
        }
        this.isHoming = f;
        return this;
    },

    setVelocity: function(x, y) {
        this.vx = x;
        this.vy = y;
        return this;
    },

    setAngle: function(degree, speed) {
        var rad = degree * toRad;
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
    },
}

/*
 *  EnemyDataBoss_1.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
enemyData['ThorHammer'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammer",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.isGround = true;
        this.stopDanmaku();

        //初速
        this.vy = -8;
    },

    epuipment: function() {
        //砲台設置
        this.turret = Enemy("ThorHammerTurret")
            .addChildTo(this.parentScene)
            .setParentEnemy(this)
            .setPosition(0, 0);
    },

    algorithm: function() {
        if (this.phase == 0) {
            if (this.y < -SC_H*0.5) {
                this.phase++;
                this.vy = -5;
                this.isCollision = true;
                this.isMuteki = false;
                this.tweener.clear()
                    .to({vy: -10}, 240)
                    .call(function(){
                        this.phase++;
                        this.resumeDanmaku();
                    }.bind(this));
            }
        }
        if (this.phase == 2) {
            this.turret.flare('startfire');
            this.phase++;
        }

        //土煙出すよ
        if (!this.isDead) {
            var vy = this.parentScene.ground.deltaY;
            for (var i = 0; i < 3; i++) {
                var layer = this.parentScene.effectLayerLower;
                layer.enterSmoke({
                    position: {x: this.x-32+rand(0,64), y: this.y},
                    velocity: {x: 0, y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //タイムアップで逃走（１７秒）
        if (!this.isDead && this.time == 1020) {
            this.tweener.clear()
                .to({vy: -15}, 120, "easeInSine")
                .call(function(){
                    this.parentScene.flare('end_boss');
                }.bind(this))
                .wait(60)
                .call(function(){
                    this.remove();
                }.bind(this));
        }
        this.y += this.vy;
//        this.y -= this.parentScene.ground.deltaY;
    },

    dead: function() {
        this.turret.dead();
        this.turret.remove();
        this.texIndex++;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .to({vy: -8}, 180, "easeInSine")
            .call(function() {
                this.explode();
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
    },
};

//砲台
enemyData['ThorHammerTurret'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammerTurret",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 500,

    //得点
    point: 0,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 416,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 32,
    texIndex: 0,

    setup: function() {
        this.isCollision = false;
        this.isMuteki = true;
        this.stopDanmaku();

        this.on('startfire', function(e) {
            this.resumeDanmaku();
        }.bind(this))
    },

    algorithm: function() {
        this.x = this.parentEnemy.x;
        this.y = this.parentEnemy.y-40;
        this.lookAt();
    },
};

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
//本体
enemyData['Golyat'] = {
    //使用弾幕パターン
    danmakuName: ["Golyat1_1", "Golyat1_2", "Golyat1_3", "Golyat2"],

    //当り判定サイズ
    width:  52,
    height: 60,

    //耐久力
    def: 5000,

    //得点
    point: 300000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 184,
    texTrimX: 258,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;
        this.isHover = true;
        this.isSmoke = true;

        //発狂モードフラグ
        this.isStampede = false;

        this.stopDanmaku();

        var that = this;

        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 64, 80)
            .addChildTo(this)
            .setFrameTrimming(382, 0, 64, 80)
            .setFrameIndex(0)
            .setPosition(-2, -18);
        this.cover.texColor = "";
        this.cover.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 64, 80);
                this.setFrameTrimming(382, 0, 64, 80).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };

        //中心部
        this.core = phina.display.Sprite("tex_boss1", 16, 16)
            .addChildTo(this)
            .setFrameTrimming(384, 96, 64, 16)
            .setFrameIndex(0)
            .setPosition(0, -8);
        this.core.texColor = "";
        this.core.idx = 0;
        this.core.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 16, 16);
                this.setFrameTrimming(384, 96, 64, 16).setFrameIndex(0);
                this.texColor = that.texColor;
            }
            this.frameIndex = this.idx | 0;
        };
        this.core.tweener.clear().setUpdateType("fps");

        this.on('dead', function() {
            this.cover.remove();
            this.core.remove();
            this.phase++;
        }.bind(this));

        this.on('bulletstart', function(e) {
            this.core.tweener.clear().to({idx: 3}, 15);
        }.bind(this));
        this.on('bulletend', function(e) {
            this.core.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //発狂モード
        this.on('stampede', function(e) {
            this.isStampede = true;
            this.startDanmaku(this.danmakuName[3]);
        }.bind(this));

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            //アーム側弾幕設定切替
            this.armL.startDanmaku(this.armL.danmakuName[this.danmakuNumber]);
            this.armR.startDanmaku(this.armR.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //アームベース左
        this.armbaseL = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(192, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(-59, 0);
        this.armbaseL.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 66, 184);
                this.setFrameTrimming(192, 0, 66, 184).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };
        //アームベース右
        this.armbaseR = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(310, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(59, 0);
        this.armbaseR.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 66, 184);
                this.setFrameTrimming(310, 0, 66, 184).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };

        //登場パターン
        this.tweener.clear()
            .moveTo(SC_W*0.5, SC_H*0.3, 300, "easeOutSine")
            .call(function(){
                this.phase++;
                this.resumeDanmaku();
            }.bind(this));
    },

    epuipment: function() {
        var ps = this.parentScene;
        //アーム左
        this.armL = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armL.$extend({
            offsetX: -52,
            offsetY: 8,
        });
        //アーム右
        this.armR = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armR.$extend({
            offsetX: 52,
            offsetY: 8,
        });

        //アーム差動用
        this.armL.vibX = 0;
        this.armL.vibY = 0
        this.armR.vibX = 0;
        this.armR.vibY = 0;

        //ウィング左
        this.wingL = ps.enterEnemy("GolyatWing", 0, 0).setParentEnemy(this.armL);
        this.wingL.$extend({
            offsetX: -31,
            offsetY: 3,
        });
        //ウィング右
        this.wingR = ps.enterEnemy("GolyatWing", 0, 0).setParentEnemy(this.armR);
        this.wingR.texIndex = 1;
        this.wingR.$extend({
            offsetX: 31,
            offsetY: 3,
        });

        this.rad = Math.PI*0.5;
    },

    algorithm: function() {
        //行動開始
        if (this.phase == 1) {
            this.isCollision = true;

            this.phase++;
            this.resumeDanmaku();

            this.armL.flare('startfire');
            this.armR.flare('startfire');
        }

        //左右に動く
        if (this.phase == 2) {
            this.x = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
//            this.y = Math.sin(this.rad*2)/2;
            this.rad -= 0.01
        }

        //画面中央に戻る
        if (this.phase == 3) {
            this.tweener.to({x: SC_W*0.5}, 180, "easeInOutSine");
            this.phase++;
        }

        //土煙出すよ
        if (this.isSmoke) {
            var vy = this.parentScene.ground.deltaY;
            var rad = this.rotation*toRad;
            for (var i = 0; i < 5; i++) {
                var layer = this.parentScene.effectLayerLower;

                var x = -76+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });

                var x = 40+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //アーム破壊時爆発
        if (this.time % 60 == 0) {
            var ground = this.parentScene.ground;
            var vx = this.x-this.beforeX+ground.deltaX;
            var vy = this.y-this.beforeY+ground.deltaY;
            if (this.armL.def == 0) {
                var x = this.x+rand(-33, 33)-64;
                var y = this.y+rand(-92, 92);
                var delay = rand(0, 30);
                Effect.enterExplode(this.parentScene.effectLayerUpper, {
                    position: {x: x, y: y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
            }
            if (this.armR.def == 0) {
                var x = this.x+rand(-33, 33)+64;
                var y = this.y+rand(-92, 92);
                var delay = rand(0, 30);
                Effect.enterExplode(this.parentScene.effectLayerUpper, {
                    position: {x: x, y: y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
            }
        }
    },

    //アーム破壊
    deadChild: function(child) {
        this.phase = 9;
        this.isCollision = false;

        this.stopDanmaku();
        this.armL.stopDanmaku();
        this.armR.stopDanmaku();

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 60;

        //アーム破壊時アクション
        var bx = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
        var by = this.y;
        var rot = child == this.armL? 20: -20;
        var ax = child == this.armL? 30: -30;
        this.tweener.clear()
            .to({x: this.x+ax, rotation: rot}, 30, "easeInOutSine")
            .wait(60)
            .to({x: bx, y: by, rotation: 0}, 180, "easeInOutSine")
            .call(function() {
                this.phase = 2;
                this.isCollision = true;

                this.resumeDanmaku();
                this.armL.resumeDanmaku();
                this.armR.resumeDanmaku();
            }.bind(this));

        //背景スクロール制御
        this.parentScene.ground.tweener.clear()
            .to({speed: -1.0}, 30, "easeInOutCubic")
            .wait(90)
            .to({speed: -7.0}, 60, "easeInOutCubic");

        //両方のアームが破壊された場合、発狂モードへ移行
        if (!this.isStampede && this.armL.def == 0 && this.armR.def == 0) {
            this.flare('stampede');
        }
    },

    dead: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, -50, 300)
            .call(function() {
                this.explode();
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },
};

//アーム
enemyData['GolyatArm'] = {
    //使用弾幕パターン
    danmakuName: ["GolyatArm1", "GolyatArm2", "GolyatArm3"],

    //当り判定サイズ
    width:  56,
    height: 200,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 200,
    texTrimX: 450,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 200,
    texIndex: 0,

    setup: function() {
        this.isCollision = false;
        this.isGround = true;
        this.stopDanmaku();

        //砲台１
        this.turret1 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.turret1.idx = 0;
        this.turret1.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret1.tweener.clear().setUpdateType("fps");

        //砲台２
        this.turret2 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, -32);
        this.turret2.idx = 0;
        this.turret2.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret2.tweener.clear().setUpdateType("fps");

        //砲台１開閉
        this.on('bulletstart1', function(e) {
            this.turret1.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend1', function(e) {
            this.turret1.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //砲台２開閉
        this.on('bulletstart2', function(e) {
            this.turret2.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend2', function(e) {
            this.turret2.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //BulletML始動
        this.on('startfire', function() {
            this.resumeDanmaku();
        }.bind(this));

        //誘導弾発射
        this.on('bulletmissile1', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity(-0.5, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.0, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.5, -1.0);
        }.bind(this));
        this.on('bulletmissile2', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity(-0.5, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.0, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.5, -1.0);
        }.bind(this));
    },

    algorithm: function() {
        //親オブジェクトの回転による位置補正
        this.rotation = this.parentEnemy.rotation;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        if (this.rotation != 0) {
            var rad = this.rotation*toRad;
            offsetX = Math.cos(rad)*this.offsetX-Math.sin(rad)*this.offsetY;
            offsetY = Math.sin(rad)*this.offsetX+Math.cos(rad)*this.offsetY;
        }
        this.x = this.parentEnemy.x+offsetX;
        this.y = this.parentEnemy.y+offsetY;

        //判定有無は親にあわせる
        if (this.def > 0) this.isCollision = this.parentEnemy.isCollision;
    },
};

//ウィング
enemyData['GolyatWing'] = {
    //使用弾幕パターン
    danmakuName: "",

    //当り判定サイズ
    width:  16,
    height: 112,

    //耐久力
    def: 500,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 16,
    texHeight: 112,
    texTrimX: 384,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 112,
    texIndex: 0,

    setup: function() {
        this.offsetX = 0;
        this.offsetY = 0;
    },

    algorithm: function() {
        //親オブジェクトの回転による位置補正
        this.rotation = this.parentEnemy.rotation;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        if (this.rotation != 0) {
            var rad = this.rotation*toRad;
            offsetX = Math.cos(rad)*this.offsetX-Math.sin(rad)*this.offsetY;
            offsetY = Math.sin(rad)*this.offsetX+Math.cos(rad)*this.offsetY;
        }
        this.x = this.parentEnemy.x+offsetX;
        this.y = this.parentEnemy.y+offsetY;

        //親の耐久度が０で除去
        if (this.parentEnemy.def == 0) this.remove();

        //判定有無は親にあわせる
        this.isCollision = this.parentEnemy.isCollision;
    },
};


/*
 *  EnemyDataBoss_2.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
enemyData['Raven'] = {
    //使用弾幕パターン
    danmakuName: "Raven",

    //当り判定サイズ
    width:  96,
    height: 40,

    //耐久力
    def: 5000,

    //得点
    point: 200000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 144,
    texHeight: 64,
    texTrimX: 0,
    texTrimY: 256,
    texTrimWidth: 144,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;

        this.stopDanmaku();

        var that = this;

        //砲台
        this.turret = phina.display.Sprite("tex_boss1", 32, 32)
            .addChildTo(this)
            .setFrameTrimming(160, 192, 32, 32)
            .setFrameIndex(0)
            .setPosition(0, 0);
        this.turret.update = function() {
            target = that.player;

            //ターゲットの方向を向く
            var ax = that.x - target.x;
            var ay = that.y - target.y;
            var rad = Math.atan2(ay, ax);
            var deg = ~~(rad * toDeg);
            this.rotation = deg-90;
        };

/*
        //アフターバーナー
        this.burner = phina.display.Sprite("tex_boss1", 112, 32)
            .addChildTo(this)
            .setFrameTrimming(0, 320, 112, 64)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.burner.update = function() {
            this.frameIndex++;
        };
*/
        this.phase = 0;
        this.tweener.clear()
            .to({x: SC_W*0.5, y: SC_H*0.25}, 120, "easeOutCubic")
            .call(function() {
                this.phase++;
            }.bind(this));
    },

    epuipment: function() {
        //翼
        this.wingL = Enemy("Raven_wing", -48, 0, 0, {frameIndex: 0})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.wingR = Enemy("Raven_wing", 48, 0, 0, {frameIndex: 1})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.isMuteki = false;
            this.phase++;
            this.startDanmaku(this.danmakuName);

            //移動パターン
            this.tweener.clear()
                .to({x: SC_W*0.8}, 240, "easeInOutSine")
                .to({x: SC_W*0.2}, 240, "easeInOutSine")
                .setLoop(true);
            this.tweener2 = phina.accessory.Tweener().clear().setUpdateType('fps')
                .to({y: SC_H*0.2}, 180, "easeInOutSine")
                .to({y: SC_H*0.3}, 180, "easeInOutSine")
                .setLoop(true)
                .attachTo(this);
        }
    },

    dead: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        this.tweener2.remove();
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .to({rotation: 30}, 300)
            .attachTo(this);
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .by({x: 2}, 3)
            .by({x: -2}, 3)
            .setLoop(true)
            .attachTo(this);

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 100, 300)
            .call(function() {
                this.explode();
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },
};

enemyData['Raven_wing'] = {
    //使用弾幕パターン
    danmakuName: null,

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 64,
    texHeight: 64,
    texTrimX: 160,
    texTrimY: 256,
    texTrimWidth: 128,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = param.frameIndex;
        this.offsetX = this.x;
        this.offsetY = this.y;
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
    },
};

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
enemyData['Garuda'] = {
    //使用弾幕パターン
    danmakuName: ["Garuda_1", "Garuda_2", "Garuda_3", "Garuda_4"],

    //当り判定サイズ
    width:  64,
    height: 70,

    //耐久力
    def: 8000,

    //得点
    point: 400000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_UPPER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 296,
    texHeight: 80,
    texTrimX: 128,
    texTrimY: 320,
    texTrimWidth: 296,
    texTrimHeight: 160,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.alpha = 0;
        this.tweener.clear()
            .fadeIn(60)
            .wait(120)
            .call(function() {
                this.phase++;
            }.bind(this));

        //発狂モードフラグ
        this.isStampede = false;

        this.stopDanmaku();

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //発狂モード
        this.on('stampede', function(e) {
            this.isStampede = true;
            this.startDanmaku(this.danmakuName[3]);
            //ハッチ側弾幕設定切替
            this.hatchL.startDanmaku(this.hatchL.danmakuName[this.danmakuNumber]);
            this.hatchR.startDanmaku(this.hatchR.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //オプション武器投下
        this.on('bulletbomb', function(e) {
            this.parentScene.enterEnemy("GarudaBomb", this.x+100, this.y+32);
            this.parentScene.enterEnemy("GarudaBomb", this.x-100, this.y+32);
        }.bind(this));

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            //ハッチ側弾幕設定切替
            this.hatchL.startDanmaku(this.hatchL.danmakuName[this.danmakuNumber]);
            this.hatchR.startDanmaku(this.hatchR.danmakuName[this.danmakuNumber]);
        }.bind(this));
    },

    epuipment: function() {
        //ハッチ
        this.hatchL = Enemy("Garuda_hatch", -61, 2, 0)
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.hatchR = Enemy("Garuda_hatch",  62, 2, 0)
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.isMuteki = false;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            this.hatchL.isCollision = true;
            this.hatchR.isCollision = true;

            //移動パターン
            this.tweener.clear()
                .to({y: SC_H*0.2}, 120, "easeInOutSine")
                .to({y: SC_H*0.3}, 120, "easeInOutSine")
                .setLoop(true);

            this.phase++;
        }

        //耐久力残り２割切ったらテクスチャを切替
        if (this.texIndex == 0 && this.def < this.defMax*0.2) {
            this.texIndex = 1;
            this.shadow.frameIndex = 1;
            this.explode(296, 80);
            //発狂モード移行
            if (!this.stampede) {
                this.flare("stampede");
            }
        }
    },

    deadChild: function(child) {
        //砲台両方とも死んだら発狂モード移行
        if (!this.stampede && this.hatchL.def == 0 && this.hatchR.def == 0) {
            this.flare("stampede");
        }
    },

    dead: function() {
        this.defaultDeadBoss(296, 80);
    },
};

enemyData['Garuda_hatch'] = {
    //使用弾幕パターン
    danmakuName: ["Garuda_hatch_1", "Garuda_hatch_2", "Garuda_hatch_3", "Garuda_hatch_4"],

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 1500,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_UPPER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 16,
    texHeight: 16,
    texTrimX: 0,
    texTrimY: 384,
    texTrimWidth: 64,
    texTrimHeight: 16,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = 0;
        this.offsetX = this.x;
        this.offsetY = this.y;

        this.isCollision = false;

        this.stopDanmaku();

        //開閉
        this.idx = 0;
        this.on('bulletstart', function(e) {
            this.tweener.clear().to({idx: 3}, 15);
        }.bind(this));
        this.on('bulletend', function(e) {
            this.tweener.clear().to({idx: 0}, 15);
        }.bind(this));
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
        this.texIndex = Math.floor(this.idx);
    },
};

/*
 *  ボスオプション「GarudaBomb」
 */
enemyData['GarudaBomb'] = {
    //使用弾幕名
    danmakuName: "GarudaBomb",

    //当り判定サイズ
    width:  20,
    height: 30,

    //耐久力
    def: 300,

    //得点
    point: 2000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 48,
    texIndex: 0,
    texTrimX: 192,
    texTrimY: 256,
    texTrimWidth: 64,
    texTrimHeight: 48,

    setup: function(enterParam) {
        this.vy = 0;
        this.tweener.clear().to({vy: 3}, 180, "easeOutSine");
    },

    algorithm: function(e) {
        this.y += this.vy;
    },
};

/*
 *  EnemyDataBoss_3.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ３面中ボス
 *  「モーンブレイド」
 *
 */
enemyData['MournBlade'] = {
    //使用弾幕パターン
    danmakuName: "MournBlade",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};

/*
 *
 *  ３面ボス
 *  空中空母「ストームブリンガー」
 *
 */
enemyData['StormBringer'] = {
    //使用弾幕パターン
    danmakuName: ["StormBringer1_1", "StormBringer1_2", "StormBringer1_3", "StormBringer2"],

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};

/*
 *  EnemyDataBoss_4.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ４面中ボス
 *
 */

/*
 *
 *  ４面ボス
 *
 */


/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵小隊単位定義
enemyUnit = {

/*
 * 突撃ヘリ「ホーネット」（パターン１）
 */
"Hornet1-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-150, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:1} },
],
"Hornet1-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-150, param:{pattern:1} },
],
"Hornet1-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:1} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン２）
 */
"Hornet2-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:2} },
],
"Hornet2-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:2} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン３）
 */
"Hornet3-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:3} },
],
"Hornet3-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:3} },
],
"Hornet3-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:3} },
],

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
"MudDauber-left": [
    { "name": "MudDauber", "x": SC_W*0.3, "y":-SC_H*0.1 },
],

"MudDauber-center": [
    { "name": "MudDauber", "x": SC_W*0.5, "y":-SC_H*0.1 },
],

"MudDauber-right": [
    { "name": "MudDauber", "x": SC_W*0.7, "y":-SC_H*0.1 },
],

/*
 *  中型爆撃機「ビッグウィング」
 */
"BigWing-left": [
    { "name": "BigWing", "x":SC_W*0.2, "y":-SC_H*0.1 },
],

"BigWing-right": [
    { "name": "BigWing", "x":SC_W*0.8, "y":-SC_H*0.1 },
],

/*
 *  飛空艇「スカイブレード」
 */
"SkyBlade-left": [
    { "name": "SkyBlade", "x":-SC_W*0.2, "y": SC_H*0.4 },
],

"SkyBlade-right": [
    { "name": "SkyBlade", "x": SC_W*1.2, "y": SC_H*0.4 },
],

/*
 *  砲台「ブリュナーク」
 */
"Brionac1-left": [
    { "name": "Brionac1", "x": SC_W*0.3, "y":-SC_H*0.1, param:{pos:"left"}},
],

"Brionac1-center": [
    { "name": "Brionac1", "x": SC_W*0.5, "y":-SC_H*0.1, param:{pos:"center"}},
],

"Brionac1-right": [
    { "name": "Brionac1", "x": SC_W*0.7, "y":-SC_H*0.1, param:{pos:"right"}},
],

/*
 *  中型戦車「フラガラッハ」
 */
"Fragarach-center": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.35, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.25, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
],
"Fragarach-left": [
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.1, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.2, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.3, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.4, param:{pattern:"l"} },
],
"Fragarach-right": [
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.1, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.2, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.3, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.4, param:{pattern:"r"} },
],
"Fragarach-left2": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.4, param:{pattern:"c"} },
],
"Fragarach-right2": [
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.4, param:{pattern:"c"} },
],


/*
 *  中型輸送機「トイボックス」
 */
//パワーアップ
"ToyBox-p-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"power"} },],

//ボム
"ToyBox-b-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"bomb"} },],

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
"ThorHammer": [
    { "name": "ThorHammer", "x":SC_W*0.5, "y": SC_H*1.3 },
],

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
"Golyat": [
    { "name": "Golyat", "x":SC_W*0.5, "y": SC_H*-0.2 },
],

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
"Raven": [
    { "name": "Raven", "x": SC_W*1.2, "y": SC_H*0.7 },
],

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
"Garuda": [
    { "name": "Garuda", "x": SC_W*0.5, "y": SC_H*0.2 },
],

}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAwMF9wbHVnaW5zL2JlbnJpLmpzIiwiMDAwX3BsdWdpbnMvYnV0dG9uLmpzIiwiMDAwX3BsdWdpbnMvY29sbGlzaW9uLmpzIiwiMDAwX3BsdWdpbnMvZXh0ZW5zaW9uLmpzIiwiMDAwX3BsdWdpbnMvZnJhbWUuanMiLCIwMDBfcGx1Z2lucy9nYXVnZS5qcyIsIjAwMF9wbHVnaW5zL3BoaW5hLmV4dGVuc2lvbi5qcyIsIjAwMF9wbHVnaW5zL3NsaWNlc3ByaXRlLmpzIiwiMDAwX3BsdWdpbnMvc291bmRzZXQuanMiLCIwMDBfcGx1Z2lucy90aWxlZG1hcC5qcyIsIjAwMl9hcHAvYXBwbGljYXRpb24uanMiLCIwMDNfbWFpbi9tYWluLmpzIiwiMDA0X3V0aWwvZGFubWFrdS51dGlsaXR5LmpzIiwiMDA0X3V0aWwvZGlhbG9nLmpzIiwiMDA1X2J1bGxldC9idWxsZXQuanMiLCIwMDVfYnVsbGV0L2J1bGxldGNvbmZpZy5qcyIsIjAwNV9idWxsZXQvYnVsbGV0bGF5ZXIuanMiLCIwMDdfZWZmZWN0L2VmZmVjdC5qcyIsIjAwN19lZmZlY3QvZWZmZWN0bGF5ZXIuanMiLCIwMDdfZWZmZWN0L2VmZmVjdHV0aWxpdHkuanMiLCIwMDdfZWZmZWN0L3BhcnRpY2xlLmpzIiwiMDA2X2Rhbm1ha3UvZGFubWFrdS5qcyIsIjAwNl9kYW5tYWt1L2Rhbm1ha3VCYXNpYy5qcyIsIjAwNl9kYW5tYWt1L2Rhbm1ha3VCb3NzXzEuanMiLCIwMDZfZGFubWFrdS9kYW5tYWt1Qm9zc18yLmpzIiwiMDA5X3BsYXllci9pdGVtLmpzIiwiMDA5X3BsYXllci9wbGF5ZXIuanMiLCIwMDlfcGxheWVyL3BsYXllcmJpdC5qcyIsIjAwOV9wbGF5ZXIvcGxheWVycG9pbnRlci5qcyIsIjAwOV9wbGF5ZXIvc2hvdC5qcyIsIjAwOV9wbGF5ZXIvc2hvdGxheWVyLmpzIiwiMDEwX3NjZW5lL2NvbnRpbnVlc2NlbmUuanMiLCIwMTBfc2NlbmUvZ2FtZW92ZXJzY2VuZS5qcyIsIjAxMF9zY2VuZS9sb2FkaW5nc2NlbmUuanMiLCIwMTBfc2NlbmUvbWFpbnNjZW5lLmpzIiwiMDEwX3NjZW5lL21lbnVkaWFsb2cuanMiLCIwMTBfc2NlbmUvcGF1c2VzY2VuZS5qcyIsIjAxMF9zY2VuZS9wcmFjdGljZXNjZW5lLmpzIiwiMDEwX3NjZW5lL3Jlc3VsdHNjZW5lLmpzIiwiMDEwX3NjZW5lL3NjZW5lZmxvdy5qcyIsIjAxMF9zY2VuZS9zZXR0aW5nc2NlbmUuanMiLCIwMTBfc2NlbmUvc3BsYXNoc2NlbmUuanMiLCIwMTBfc2NlbmUvdGl0bGVzY2VuZS5qcyIsIjAxMV9zdGFnZS9ncm91bmQuanMiLCIwMTFfc3RhZ2Uvc3RhZ2UxLmpzIiwiMDExX3N0YWdlL3N0YWdlMi5qcyIsIjAxMV9zdGFnZS9zdGFnZTkuanMiLCIwMTFfc3RhZ2Uvc3RhZ2Vjb250cm9sbGVyLmpzIiwiMDA4X2VuZW15L2VuZW15LmpzIiwiMDA4X2VuZW15L2VuZW15ZGF0YS5qcyIsIjAwOF9lbmVteS9lbmVteWRhdGFib3NzXzEuanMiLCIwMDhfZW5lbXkvZW5lbXlkYXRhYm9zc18yLmpzIiwiMDA4X2VuZW15L2VuZW15ZGF0YWJvc3NfMy5qcyIsIjAwOF9lbmVteS9lbmVteWRhdGFib3NzXzQuanMiLCIwMDhfZW5lbXkvZW5lbXl1bml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9hQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdjBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcnJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNueUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbHVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBicmV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqICBCZW5yaS5qc1xuICogIDIwMTQvMTIvMThcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4gXG52YXIgdG9SYWQgPSAzLjE0MTU5LzE4MDsgICAgLy/lvKfluqbms5V0b+ODqeOCuOOCouODs+WkieaPm1xudmFyIHRvRGVnID0gMTgwLzMuMTQxNTk7ICAgIC8v44Op44K444Ki44OzdG/lvKfluqbms5XlpInmj5tcblxuLy/ot53pm6LoqIjnrpdcbnZhciBkaXN0YW5jZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgdmFyIHggPSBmcm9tLngtdG8ueDtcbiAgICB2YXIgeSA9IGZyb20ueS10by55O1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4K3kqeSk7XG59XG5cbi8v6Led6Zui6KiI566X77yI44Or44O844OI54Sh44GX54mI77yJXG52YXIgZGlzdGFuY2VTcSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgdmFyIHggPSBmcm9tLnggLSB0by54O1xuICAgIHZhciB5ID0gZnJvbS55IC0gdG8ueTtcbiAgICByZXR1cm4geCp4K3kqeTtcbn1cblxuLy/mlbDlgKTjga7liLbpmZBcbnZhciBjbGFtcCA9IGZ1bmN0aW9uKHgsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuICh4PG1pbik/bWluOigoeD5tYXgpP21heDp4KTtcbn07XG5cbi8v5Lmx5pWw55Sf5oiQXG52YXIgcHJhbmQgPSBwaGluYS51dGlsLlJhbmRvbSgpO1xudmFyIHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBwcmFuZC5yYW5kaW50KG1pbiwgbWF4KTtcbn1cblxuLy/jgr/jgqTjg4jjg6vnhKHjgZfjg4DjgqTjgqLjg63jgrBcbnZhciBBZHZhbmNlQWxlcnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgdG1wRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHRtcEZyYW1lKTtcblxuICAgIHdpbmRvdy5mcmFtZXNbMF0ud2luZG93LmFsZXJ0KHN0cik7XG4gICAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG59O1xudmFyIEFkdmFuY2VDb25maXJtID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgdmFyIHRtcEZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgdG1wRnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCAnZGF0YTp0ZXh0L3BsYWluLCcpO1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0bXBGcmFtZSk7XG5cbiAgICB2YXIgcmVzdWx0ID0gd2luZG93LmZyYW1lc1swXS53aW5kb3cuY29uZmlybShzdHIpO1xuICAgIHRtcEZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodG1wRnJhbWUpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8v5pWw5YCk44KS44Kr44Oz44Oe57eo6ZuG44GX44Gm5paH5a2X5YiX44Go44GX44Gm5Ye65YqbXG5OdW1iZXIucHJvdG90eXBlLiRtZXRob2QoXCJjb21tYVwiLCAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0ciA9IHRoaXMrJyc7XG4gICAgdmFyIGxlbiA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIG91dCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSBsZW4tMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgb3V0ID0gc3RyW2ldK291dDtcbiAgICAgICAgaWYgKGkgIT0gMCAmJiAobGVuLWkpJTMgPT0gMCkgb3V0ID0gJywnK291dDtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn0pO1xuIiwiLypcbiAqICBCdXR0b24uanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL+mAmuW4uOOBruODnOOCv+ODs1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLkJ1dHRvblwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICAvL+aPj+eUu+OCueOCv+OCpOODq+ioreWumlxuICAgIERFRkFVTFRfU1RZTEU6IHtcbiAgICAgICAgYnV0dG9uQ29sb3I6ICdyZ2JhKDUwLCAxNTAsIDI1NSwgMC44KScsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgyMDAsIDIwMCwgMjAwLCAwLjUpJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgICAgIHNoYWRvd0NvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJyxcbiAgICAgICAgZm9udEZhbWlseTogXCJVYnVudHVNb25vXCIsXG4gICAgICAgIGZvbnRTaXplOiA1MCxcbiAgICAgICAgZmxhdDogZmFsc2UsXG4gICAgfSxcblxuICAgIERFRkFVTFRfU1RZTEVfRkxBVDoge1xuICAgICAgICBidXR0b25Db2xvcjogJ3JnYmEoMTUwLCAxNTAsIDI1MCwgMS4wKScsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDMsXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiVWJ1bnR1TW9ub1wiLFxuICAgICAgICBmb250U2l6ZTogNTAsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgfSxcblxuICAgIGxhYmVsUGFyYW06IHthbGlnbjogXCJjZW50ZXJcIiwgYmFzZWxpbmU6XCJtaWRkbGVcIiwgb3V0bGluZVdpZHRoOjN9LFxuXG4gICAgdGV4dDogXCJcIixcbiAgICBwdXNoOiBmYWxzZSxcbiAgICBsb2NrOiBmYWxzZSxcblxuICAgIC8v44Oc44K/44Oz5oq85LiL5pmC44Gu56e75YuV6YePXG4gICAgZG93blg6IDAsXG4gICAgZG93blk6IDEwLFxuXG4gICAgLy/jg5Xjg6njg4Pjg4jmmYLpgI/mmI7luqZcbiAgICBhbHBoYU9OOiAwLjksXG4gICAgYWxwaGFPRkY6IDAuNCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgb3B0aW9ucyA9IChvcHRpb25zfHx7fSkuJHNhZmUoe1xuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICAgIGhlaWdodDogODAsXG4gICAgICAgICAgICB0ZXh0OiBcInVuZGVmaW5lZFwiLFxuICAgICAgICAgICAgc3R5bGU6IG51bGxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMudGV4dDtcblxuICAgICAgICAvL+OCu+ODg+ODiOOCouODg+ODl1xuICAgICAgICB0aGlzLnNldHVwKG9wdGlvbnMuc3R5bGUpO1xuXG4gICAgICAgIC8v5Yik5a6a5Yem55CG6Kit5a6aXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwicmVjdFwiO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oc3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSBzdHlsZSB8fCB7fTtcbiAgICAgICAgaWYgKHN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgIHN0eWxlLiRzYWZlKHRoaXMuREVGQVVMVF9TVFlMRV9GTEFUKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlLiRzYWZlKHRoaXMuREVGQVVMVF9TVFlMRSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdHlsZSA9IHN0eWxlO1xuXG4gICAgICAgIC8v55m76Yyy5riI44G/44Gu5aC05ZCI56C05qOE44GZ44KLXG4gICAgICAgIGlmICh0aGlzLnNoYWRvdykge1xuICAgICAgICAgICAgaWYgKCFzdHlsZS5mbGF0KSB0aGlzLnNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMubGFiZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGgsIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIGlmICghc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgLy/jg5zjgr/jg7PlvbFcbiAgICAgICAgICAgIHZhciBzaGFkb3dTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICAgICAgZmlsbDogc3R5bGUuc2hhZG93Q29sb3IsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoc2hhZG93U3R5bGUpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5kb3duWCwgdGhpcy5kb3duWSk7XG4gICAgICAgICAgICB0aGlzLnNoYWRvdy5ibGVuZE1vZGUgPSBcInNvdXJjZS1vdmVyXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy/jg5zjgr/jg7PmnKzkvZNcbiAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5idXR0b25Db2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUuc3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKGJ1dHRvblN0eWxlKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIGlmIChzdHlsZS5mbGF0KSB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcblxuICAgICAgICAvL+ODnOOCv+ODs+ODqeODmeODq1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5idXR0b247XG4gICAgICAgIGlmIChzdHlsZS5mbGF0KSBwYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmxhYmVsUGFyYW0uZm9udEZhbWlseSA9IHN0eWxlLmZvbnRGYW1pbHk7XG4gICAgICAgIHRoaXMubGFiZWwgPSBwaGluYS5kaXNwbGF5Lk91dGxpbmVMYWJlbCh0aGlzLnRleHQsIHN0eWxlLmZvbnRTaXplKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8ocGFyZW50KVxuICAgICAgICAgICAgLnNldFBhcmFtKHRoaXMubGFiZWxQYXJhbSk7XG4gICAgfSxcbiAgICBidXR0b25QdXNoU3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9OKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggKz0gdGhpcy5kb3duWDtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgKz0gdGhpcy5kb3duWTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYnV0dG9uUHVzaE1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHB0ID0gZS5wb2ludGluZztcbiAgICAgICAgaWYgKHRoaXMuaXNIaXRQb2ludChwdC54LCBwdC55KSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnB1c2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9OKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54ICs9IHRoaXMuZG93blg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgKz0gdGhpcy5kb3duWTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wdXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54IC09IHRoaXMuZG93blg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgLT0gdGhpcy5kb3duWTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJ1dHRvblB1c2hFbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9GRik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi54IC09IHRoaXMuZG93blg7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi55IC09IHRoaXMuZG93blk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0VmlzaWJsZTogZnVuY3Rpb24oYikge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHRoaXMuc2hhZG93LnZpc2libGUgPSBiO1xuICAgICAgICB0aGlzLmJ1dHRvbi52aXNpYmxlID0gYjtcbiAgICAgICAgdGhpcy5sYWJlbC52aXNpYmxlID0gYjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHNldExvY2s6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgdGhpcy5sb2NrID0gYjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIG9udG91Y2hzdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5wdXNoID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5idXR0b25QdXNoU3RhcnQoZSk7XG4gICAgICAgIHZhciBlID0gcGhpbmEuZXZlbnQuRXZlbnQoXCJwdXNoXCIpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICBvbnRvdWNobW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XG4gICAgICAgIHRoaXMuYnV0dG9uUHVzaE1vdmUoZSk7XG4gICAgfSxcbiAgICBvbnRvdWNoZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcblxuICAgICAgICB2YXIgcHQgPSBlLnBvaW50aW5nO1xuICAgICAgICBpZiAodGhpcy5pc0hpdFBvaW50KHB0LngsIHB0LnkpKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2ggPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uUHVzaEVuZChlKTtcblxuICAgICAgICAgICAgdmFyIGUgPSBwaGluYS5ldmVudC5FdmVudChcInB1c2hlZFwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuLy/op5LkuLjjg5zjgr/jg7NcbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5Sb3VuZEJ1dHRvblwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5leHRlbnNpb24uQnV0dG9uXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oc3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSBzdHlsZSB8fCB7fTtcbiAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFKTtcblxuICAgICAgICAvL+eZu+mMsua4iOOBv+OBruWgtOWQiOegtOajhOOBmeOCi1xuICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5sYWJlbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgLy/jg5zjgr/jg7PlvbFcbiAgICAgICAgdmFyIHNoYWRvd1N0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUuc2hhZG93Q29sb3IsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGgsXG4gICAgICAgICAgICByYWRpdXM6IHN0eWxlLnJhZGl1cyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zaGFkb3cgPSBwaGluYS5kaXNwbGF5LlJvdW5kUmVjdGFuZ2xlU2hhcGUoc2hhZG93U3R5bGUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuZG93blgsIHRoaXMuZG93blkpO1xuICAgICAgICB0aGlzLnNoYWRvdy5ibGVuZE1vZGUgPSBcInNvdXJjZS1vdmVyXCI7XG5cbiAgICAgICAgLy/jg5zjgr/jg7PmnKzkvZNcbiAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5idXR0b25Db2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUuc3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGgsXG4gICAgICAgICAgICByYWRpdXM6IHN0eWxlLnJhZGl1cyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBwaGluYS5kaXNwbGF5LlJvdW5kUmVjdGFuZ2xlU2hhcGUoYnV0dG9uU3R5bGUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgICAvL+ODnOOCv+ODs+ODqeODmeODq1xuICAgICAgICB0aGlzLmxhYmVsUGFyYW0uZm9udEZhbWlseSA9IHN0eWxlLmZvbnRGYW1pbHk7XG4gICAgICAgIHRoaXMubGFiZWwgPSBwaGluYS5kaXNwbGF5Lk91dGxpbmVMYWJlbCh0aGlzLnRleHQsIHN0eWxlLmZvbnRTaXplKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5idXR0b24pXG4gICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICB9LFxufSk7XG5cbi8v44OI44Kw44Or44Oc44K/44OzXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uVG9nZ2xlQnV0dG9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIC8v5o+P55S744K544K/44Kk44Or6Kit5a6aXG4gICAgREVGQVVMVF9TVFlMRToge1xuICAgICAgICBidXR0b25Db2xvcjogJ3JnYmEoNTAsIDE1MCwgMjU1LCAwLjgpJyxcbiAgICAgICAgbGluZUNvbG9yOiAncmdiYSgyMDAsIDIwMCwgMjAwLCAwLjUpJyxcbiAgICAgICAgbGluZVdpZHRoOiA0LFxuICAgICAgICBzaGFkb3dDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KScsXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiVWJ1bnR1TW9ub1wiLFxuICAgICAgICBmb250U2l6ZTogNTAsXG4gICAgICAgIGZhbHQ6IGZhbHNlLFxuICAgIH0sXG5cbiAgICBERUZBVUxUX1NUWUxFX0ZMQVQ6IHtcbiAgICAgICAgYnV0dG9uQ29sb3I6ICdyZ2JhKDE1MCwgMTUwLCAyNTAsIDEuMCknLFxuICAgICAgICBsaW5lQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknLFxuICAgICAgICBsaW5lV2lkdGg6IDMsXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiVWJ1bnR1TW9ub1wiLFxuICAgICAgICBmb250U2l6ZTogNTAsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgfSxcblxuICAgIGxhYmVsUGFyYW06IHthbGlnbjogXCJjZW50ZXJcIiwgYmFzZWxpbmU6XCJtaWRkbGVcIiwgb3V0bGluZVdpZHRoOjMgfSxcblxuICAgIG9uVGV4dDogXCJcIixcbiAgICBvZmZUZXh0OiBcIlwiLFxuICAgIHB1c2g6IGZhbHNlLFxuICAgIGxvY2s6IGZhbHNlLFxuICAgIF90b2dnbGVPTjogZmFsc2UsXG5cbiAgICAvL+ODnOOCv+ODs+aKvOS4i+aZguOBruenu+WLlemHj1xuICAgIGRvd25YOiAwLFxuICAgIGRvd25ZOiAxMCxcblxuICAgIC8v44OV44Op44OD44OI5pmC6YCP5piO5bqmXG4gICAgYWxwaGFPTjogMC45LFxuICAgIGFscGhhT0ZGOiAwLjQsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSAob3B0aW9uc3x8e30pLiRzYWZlKHtcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDgwLFxuICAgICAgICAgICAgb25UZXh0OiBcIk9OXCIsXG4gICAgICAgICAgICBvZmZUZXh0OiBcIk9GRlwiLFxuICAgICAgICAgICAgc3R5bGU6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gXG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuICAgICAgICB0aGlzLm9uVGV4dCA9IG9wdGlvbnMub25UZXh0O1xuICAgICAgICB0aGlzLm9mZlRleHQgPSBvcHRpb25zLm9mZlRleHQ7XG5cbiAgICAgICAgLy/jgrvjg4Pjg4jjgqLjg4Pjg5dcbiAgICAgICAgdGhpcy5zZXR1cChzdHlsZSk7XG5cbiAgICAgICAgLy/liKTlrprlh6bnkIboqK3lrppcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJyZWN0XCI7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICAgICAgICBpZiAoc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFX0ZMQVQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG5cbiAgICAgICAgLy/nmbvpjLLmuIjjgb/jga7loLTlkIjnoLTmo4TjgZnjgotcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICBpZiAoIXN0eWxlLmZsYXQpIHRoaXMuc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5sYWJlbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFzdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAvL+ODnOOCv+ODs+W9sVxuICAgICAgICAgICAgdmFyIHNoYWRvd1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgICAgICBmaWxsOiBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgICAgICAgICAgICBzdHJva2U6IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93ID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShzaGFkb3dTdHlsZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLmRvd25YLCB0aGlzLmRvd25ZKTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93LmJsZW5kTW9kZSA9IFwic291cmNlLW92ZXJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Oc44K/44Oz5pys5L2TXG4gICAgICAgIHZhciBidXR0b25TdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbDogc3R5bGUuYnV0dG9uQ29sb3IsXG4gICAgICAgICAgICBzdHJva2U6IHN0eWxlLmxpbmVDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoYnV0dG9uU3R5bGUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgaWYgKHN0eWxlLmZsYXQpIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuXG4gICAgICAgIC8v44Oc44K/44Oz44Op44OZ44OrXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmJ1dHRvbjtcbiAgICAgICAgaWYgKHN0eWxlLmZsYXQpIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMubGFiZWxQYXJhbS5mb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgICAgICAgdGhpcy5sYWJlbCA9IHBoaW5hLmRpc3BsYXkuT3V0bGluZUxhYmVsKHRoaXMudGV4dCwgc3R5bGUuZm9udFNpemUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhwYXJlbnQpXG4gICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICB9LFxuICAgIHNldExvY2s6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgdGhpcy5sb2NrID0gYjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGJ1dHRvblB1c2hTdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnB1c2ggPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fdG9nZ2xlT04pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT04pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54ICs9IHRoaXMuZG93blgqMC41O1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgKz0gdGhpcy5kb3duWSowLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9GRik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggKz0gdGhpcy5kb3duWCoxLjU7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSArPSB0aGlzLmRvd25ZKjEuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgYnV0dG9uUHVzaE1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHB0ID0gZS5wb2ludGluZztcbiAgICAgICAgaWYgKHRoaXMuaXNIaXRQb2ludChwdC54LCBwdC55KSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnB1c2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl90b2dnbGVPTikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT04pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCArPSB0aGlzLmRvd25YKjAuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgKz0gdGhpcy5kb3duWSowLjU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggKz0gdGhpcy5kb3duWCoxLjU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi55ICs9IHRoaXMuZG93blkqMS41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMucHVzaCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl90b2dnbGVPTikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT04pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCAtPSB0aGlzLmRvd25YKjAuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgLT0gdGhpcy5kb3duWSowLjU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggLT0gdGhpcy5kb3duWCoxLjU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi55IC09IHRoaXMuZG93blkqMS41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBidXR0b25QdXNoRW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBwdCA9IGUucG9pbnRpbmc7XG4gICAgICAgIGlmICh0aGlzLmlzSGl0UG9pbnQocHQueCwgcHQueSkpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fdG9nZ2xlT04gPSAhdGhpcy5fdG9nZ2xlT047XG4gICAgICAgICAgICBpZiAodGhpcy5fdG9nZ2xlT04pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQgPSB0aGlzLm9uVGV4dDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPTik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCAtPSB0aGlzLmRvd25YKjAuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSAtPSB0aGlzLmRvd25ZKjAuNTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dCA9IHRoaXMub2ZmVGV4dDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggLT0gdGhpcy5kb3duWCoxLjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgLT0gdGhpcy5kb3duWSoxLjU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYWJlbC50ZXh0ID0gdGhpcy50ZXh0O1xuICAgICAgICAgICAgdmFyIGUgPSBwaGluYS5ldmVudC5FdmVudChcInB1c2hlZFwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucHVzaCA9IHRydWU7XG4gICAgICAgIHRoaXMuYnV0dG9uUHVzaFN0YXJ0KGUpO1xuICAgICAgICB2YXIgZSA9IHBoaW5hLmV2ZW50LkV2ZW50KFwicHVzaFwiKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgb250b3VjaG1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xuICAgICAgICB0aGlzLmJ1dHRvblB1c2hNb3ZlKGUpO1xuICAgIH0sXG4gICAgb250b3VjaGVuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XG5cbiAgICAgICAgdmFyIHB0ID0gZS5wb2ludGluZztcbiAgICAgICAgaWYgKHRoaXMuaXNIaXRQb2ludChwdC54LCBwdC55KSkge1xuICAgICAgICAgICAgdGhpcy5wdXNoID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvblB1c2hFbmQoZSk7XG5cbiAgICAgICAgICAgIHZhciBlID0gcGhpbmEuZXZlbnQuRXZlbnQoXCJwdXNoZWRcIik7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG5waGluYS5leHRlbnNpb24uVG9nZ2xlQnV0dG9uLnByb3RvdHlwZS5hY2Nlc3NvcihcInRvZ2dsZU9OXCIsIHtcbiAgICBcInNldFwiOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZU9OID0gYjtcblxuICAgICAgICBpZiAodGhpcy5fdG9nZ2xlT04pIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IHRoaXMub25UZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPTik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggPSB0aGlzLmRvd25YO1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgPSB0aGlzLmRvd25ZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gdGhpcy5vZmZUZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi55ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhYmVsLnRleHQgPSB0aGlzLnRleHQ7XG4gICAgfSxcblxuICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdG9nZ2xlT047XG4gICAgfSxcbn0pO1xuXG4vL+OCueODqeOCpOODieODnOOCv+ODs1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlNsaWRlQnV0dG9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIC8v5o+P55S744K544K/44Kk44Or6Kit5a6aXG4gICAgREVGQVVMVF9TVFlMRToge1xuICAgICAgICB3aWR0aDogMTYwLFxuICAgICAgICBoZWlnaHQ6IDgwLFxuXG4gICAgICAgIGJ1dHRvbldpdGRoOiA4MCxcbiAgICAgICAgYnV0dG9uSGVpZ2h0OiA4MCxcblxuICAgICAgICAvL+ODnOOCv+ODs+iJslxuICAgICAgICBidXR0b25Db2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMS4wKScsXG4gICAgICAgIGJ1dHRvbkxpbmU6ICAncmdiYSgyMDAsIDIwMCwgMjAwLCAxLjApJyxcbiAgICAgICAgbGluZVdpZHRoOiAyLFxuXG4gICAgICAgIC8v44OZ44O844K5KG9uL29mZinoibJcbiAgICAgICAgb25Db2xvcjogJ3JnYmEoMCwgMjU1LCAwLCAxLjApJyxcbiAgICAgICAgb2ZmQ29sb3I6ICdyZ2JhKDIwMCwgMjAwLCAyMDAsIDEuMCknLFxuICAgIH0sXG5cbiAgICBfc2xpZGVPTjogZmFsc2UsXG5cbiAgICBpbml0OiBmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZSB8fCB7fTtcbiAgICAgICAgdGhpcy5zdHlsZS4kc2FmZSh0aGlzLkRFRkFVTFRfU1RZTEUpXG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHN0eWxlLndpZHRoIHx8IDE2MDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBzdHlsZS5oZWlnaHQgfHwgODA7XG5cbiAgICAgICAgdGhpcy50ZXh0ID0gdGhpcy5vZmZUZXh0O1xuXG4gICAgICAgIC8v44K744OD44OI44Ki44OD44OXXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcblxuICAgICAgICAvL+WIpOWumuWHpueQhuioreWumlxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcInJlY3RcIjtcbi8vICAgICAgICB0aGlzLmNoZWNrSGllcmFyY2h5ID0gdHJ1ZTtcblxuICAgICAgICAvL+OCpOODmeODs+ODiOODquOCueODiueZu+mMslxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3NsaWRlT04pIHtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZSA9IHBoaW5hLmV2ZW50LkV2ZW50KFwic2xpZGVcIik7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v55m76Yyy5riI44G/44Gu5aC05ZCI56C05qOE44GZ44KLXG4gICAgICAgIGlmICh0aGlzLnNoYWRvdykge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmxhYmVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5idXR0b24ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLnN0eWxlO1xuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgdmFyIGJ1dHRvbldpZHRoID0gdGhpcy5idXR0b24sIGhlaWdodEJ1dHRvbiA9IHRoaXMuaGVpZ2h0QnV0dG9uO1xuXG4gICAgICAgIC8v44Oc44K/44Oz44OZ44O844K5XG4gICAgICAgIHZhciBiYXNlU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLm9mZkNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5vZmZDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAgc3R5bGUuc3Ryb2tlV2lkdGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKGJ1dHRvblN0eWxlKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgICAgLy/jg5zjgr/jg7PmnKzkvZNcbiAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IGJ1dHRvbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBidXR0b25IZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5idXR0b25Db2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUubGluZUNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IHN0eWxlLnN0cm9rZVdpZHRoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYnV0dG9uID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShidXR0b25TdHlsZSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgIH0sXG59KTtcblxucGhpbmEuZXh0ZW5zaW9uLlNsaWRlQnV0dG9uLnByb3RvdHlwZS5hY2Nlc3NvcihcInNsaWRlT05cIiwge1xuICAgIFwic2V0XCI6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgdGhpcy5fc2xpZGVPTiA9IGI7XG5cbiAgICAgICAgaWYgKHRoaXMuX3NsaWRlT04pIHtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBcImdldFwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NsaWRlT047XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqIGNvbGxpc2lvbi5qc1xuICovXG5cbnBoaW5hLmNvbGxpc2lvbiA9IHBoaW5hLmNvbGxpc2lvbiB8fCB7fTtcbiBcbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBwaGluYS5jb2xsaXNpb25cbiAgICAgKiDooZ3nqoHliKTlrppcbiAgICAgKi9cbiAgICBwaGluYS5jb2xsaXNpb247XG4gICAgXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0ZXN0Q2lyY2xlQ2lyY2xlXG4gICAgICog5YaG5ZCM5aOr44Gu6KGd56qB5Yik5a6aXG4gICAgICovXG4gICAgcGhpbmEuY29sbGlzaW9uLnRlc3RDaXJjbGVDaXJjbGUgPSBmdW5jdGlvbihjaXJjbGUwLCBjaXJjbGUxKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZVNxdWFyZWQgPSBwaGluYS5nZW9tLlZlY3RvcjIuZGlzdGFuY2VTcXVhcmVkKGNpcmNsZTAsIGNpcmNsZTEpO1xuICAgICAgICByZXR1cm4gZGlzdGFuY2VTcXVhcmVkIDw9IE1hdGgucG93KGNpcmNsZTAucmFkaXVzICsgY2lyY2xlMS5yYWRpdXMsIDIpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0ZXN0UmVjdFJlY3RcbiAgICAgKiDnn6nlvaLlkIzlo6vjga7ooZ3nqoHliKTlrppcbiAgICAgKi9cbiAgICBwaGluYS5jb2xsaXNpb24udGVzdFJlY3RSZWN0ID0gZnVuY3Rpb24ocmVjdDAsIHJlY3QxKSB7XG4gICAgICAgIHJldHVybiAocmVjdDAubGVmdCA8IHJlY3QxLnJpZ2h0KSAmJiAocmVjdDAucmlnaHQgPiByZWN0MS5sZWZ0KSAmJlxuICAgICAgICAgICAgICAgKHJlY3QwLnRvcCA8IHJlY3QxLmJvdHRvbSkgJiYgKHJlY3QwLmJvdHRvbSA+IHJlY3QxLnRvcCk7XG4gICAgfTtcblxuICAgIHBoaW5hLmNvbGxpc2lvbi50ZXN0Q2lyY2xlUmVjdCA9IGZ1bmN0aW9uKGNpcmNsZSwgcmVjdCkge1xuICAgICAgICAvLyDjgb7jgZrjga/lpKfjgY3jgarnn6nlvaLjgafliKTlrpoo6auY6YCf5YyWKVxuICAgICAgICB2YXIgYmlnUmVjdCA9IHBoaW5hLmdlb20uUmVjdChyZWN0LmxlZnQtY2lyY2xlLnJhZGl1cywgcmVjdC50b3AtY2lyY2xlLnJhZGl1cywgcmVjdC53aWR0aCtjaXJjbGUucmFkaXVzKjIsIHJlY3QuaGVpZ2h0K2NpcmNsZS5yYWRpdXMqMik7XG4gICAgICAgIGlmIChiaWdSZWN0LmNvbnRhaW5zKGNpcmNsZS54LCBjaXJjbGUueSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gMueorumhnuOBruefqeW9ouOBqOihneeqgeWIpOWumlxuICAgICAgICB2YXIgciA9IHBoaW5hLmdlb20uUmVjdChyZWN0LmxlZnQtY2lyY2xlLnJhZGl1cywgcmVjdC50b3AsIHJlY3Qud2lkdGgrY2lyY2xlLnJhZGl1cyoyLCByZWN0LmhlaWdodCk7XG4gICAgICAgIGlmIChyLmNvbnRhaW5zKGNpcmNsZS54LCBjaXJjbGUueSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHIuc2V0KHJlY3QubGVmdCwgcmVjdC50b3AtY2lyY2xlLnJhZGl1cywgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQrY2lyY2xlLnJhZGl1cyoyKTtcbiAgICAgICAgaWYgKHIuY29udGFpbnMoY2lyY2xlLngsIGNpcmNsZS55KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWGhuOBqOefqeW9ouOBru+8lOeCueOBruWIpOWumlxuICAgICAgICB2YXIgYyA9IHBoaW5hLmdlb20uQ2lyY2xlKGNpcmNsZS54LCBjaXJjbGUueSwgY2lyY2xlLnJhZGl1cyk7XG4gICAgICAgIC8vIGxlZnQgdG9wXG4gICAgICAgIGlmIChjLmNvbnRhaW5zKHJlY3QubGVmdCwgcmVjdC50b3ApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyByaWdodCB0b3BcbiAgICAgICAgaWYgKGMuY29udGFpbnMocmVjdC5yaWdodCwgcmVjdC50b3ApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyByaWdodCBib3R0b21cbiAgICAgICAgaWYgKGMuY29udGFpbnMocmVjdC5yaWdodCwgcmVjdC5ib3R0b20pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBsZWZ0IGJvdHRvbVxuICAgICAgICBpZiAoYy5jb250YWlucyhyZWN0LmxlZnQsIHJlY3QuYm90dG9tKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcGhpbmEuY29sbGlzaW9uLnRlc3RSZWN0Q2lyY2xlID0gZnVuY3Rpb24ocmVjdCwgY2lyY2xlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RDaXJjbGVSZWN0KGNpcmNsZSwgcmVjdCk7XG4gICAgfTtcbiBcbn0pKCk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIi8qXG4gKiAgZXh0ZW5zaW9uLmpzXG4gKiAgMjAxNS8wOS8wOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLy/jgqjjg6zjg6Hjg7Pjg4jlkIzlo6vjga7mjqXop6bliKTlrppcbnBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQucHJvdG90eXBlLmlzSGl0RWxlbWVudCA9IGZ1bmN0aW9uKGVsbSkge1xuICAgIGlmICh0aGlzLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgICAgaWYgKGVsbS5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gcGhpbmEuY29sbGlzaW9uLnRlc3RSZWN0UmVjdCh0aGlzLCBlbG0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBoaW5hLmNvbGxpc2lvbi50ZXN0UmVjdENpcmNsZSh0aGlzLCBlbG0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVsbS5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gcGhpbmEuY29sbGlzaW9uLnRlc3RSZWN0Q2lyY2xlKGVsbSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGhpbmEuY29sbGlzaW9uLnRlc3RDaXJjbGVDaXJjbGUodGhpcywgZWxtKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy/lrZDopoHntKDlhajjgabliIfjgorpm6LjgZdcbnBoaW5hLmFwcC5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZHJlbiA9IGZ1bmN0aW9uKGJlZ2luSW5kZXgpIHtcbiAgICBiZWdpbkluZGV4ID0gYmVnaW5JbmRleCB8fCAwO1xuICAgIHZhciB0ZW1wQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLnNsaWNlKCk7XG4gICAgdmFyIGxlbiA9IHRlbXBDaGlsZHJlbi5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IGJlZ2luSW5kZXg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB0ZW1wQ2hpbGRyZW5baV0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbn1cblxuLy/jgr/jg7zjgrLjg4Pjg4jmlrnlkJHjgpLlkJHjgY9cbnBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQucHJvdG90eXBlLmxvb2tBdCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRhcmdldCA9IHRhcmdldCB8fCB7eDogMCwgeTogMH07XG5cbiAgICB2YXIgYXggPSB0aGlzLnggLSB0YXJnZXQueDtcbiAgICB2YXIgYXkgPSB0aGlzLnkgLSB0YXJnZXQueTtcbiAgICB2YXIgcmFkID0gTWF0aC5hdGFuMihheSwgYXgpO1xuICAgIHZhciBkZWcgPSB+fihyYWQgKiB0b0RlZyk7XG4gICAgdGhpcy5yb3RhdGlvbiA9IGRlZyArIDkwO1xuICAgIHJldHVybiB0aGlzO1xufVxuXG4iLCIvKlxuICogIGZyYW1lLmpzXG4gKiAgMjAxNi8xMC8xM1xuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5GcmFtZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LlNoYXBlXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IDI7XG5cbiAgICAgICAgdmFyIHggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgLy/jgr/jgqTjg4jjg6vooajnpLpcbiAgICAgICAgaWYgKG9wdGlvbnMudGl0bGUpIHtcbiAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwob3B0aW9ucy50aXRsZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbigteCwgLXkpXG4gICAgICAgICAgICAgICAgLnNldE9yaWdpbigwLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44OV44Os44O844Og44Gu5o+P55S744OR44K5XG4gICAgICAgIHRoaXMuZHJhd1BhdGggPSBbXG4gICAgICAgICAgICAvL+S4iui+ulxuICAgICAgICAgICAge3g6IC14KyAyMCwgeTogLXkgICAsIHNpZGU6IDB9LFxuICAgICAgICAgICAge3g6IC14KzE1MCwgeTogLXkgICAsIHNpZGU6IDB9LFxuICAgICAgICAgICAge3g6IC14KzE2MCwgeTogLXkrMjAsIHNpZGU6IDB9LFxuICAgICAgICAgICAge3g6ICB4LSAgNSwgeTogLXkrMjAsIHNpZGU6IDB9LFxuICAgICAgICAgICAge3g6ICB4ICAgICwgeTogLXkrMjUsIHNpZGU6IDB9LFxuLypcbiAgICAgICAgICAgIHt4OiAteCsxMCwgeTogLXkgICAsIHNpZGU6IDB9LFxuICAgICAgICAgICAge3g6ICB4LSA1LCB5OiAteSAgICwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogIHggICAsIHk6IC15KyA1LCBzaWRlOiAwfSxcbiovXG4gICAgICAgICAgICAvL+WPs+i+ulxuICAgICAgICAgICAge3g6ICB4ICAgLCB5OiAgeS0xMCwgc2lkZTogMX0sXG4gICAgICAgICAgICB7eDogIHgtMTAsIHk6ICB5ICAgLCBzaWRlOiAxfSxcblxuICAgICAgICAgICAgLy/kuIvovrpcbiAgICAgICAgICAgIHt4OiAteCszNSwgeTogIHkgICAsIHNpZGU6IDJ9LFxuICAgICAgICAgICAge3g6IC14KzMwLCB5OiAgeS0gNSwgc2lkZTogMn0sXG4gICAgICAgICAgICB7eDogLXggICAsIHk6ICB5LSA1LCBzaWRlOiAyfSxcblxuICAgICAgICAgICAgLy/lt6bovrpcbiAgICAgICAgICAgIHt4OiAteCAgICwgeTogLXkrMjAsIHNpZGU6IDN9LFxuICAgICAgICBdO1xuXG4gICAgICAgIC8v5aSW5YG044OV44Os44O844Og44Gu44Kq44OV44K744OD44OI5bmFXG4gICAgICAgIHRoaXMuZHJhd1BhdGhPZmZzZXQgPSAzO1xuICAgIH0sXG5cbiAgICBwcmVyZW5kZXI6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgICB2YXIgYyA9IGNhbnZhcy5jb250ZXh0O1xuXG4gICAgICAgIHZhciB4ID0gdGhpcy53aWR0aCAvIDI7XG4gICAgICAgIHZhciB5ID0gdGhpcy5oZWlnaHQgLyAyO1xuXG4gICAgICAgIHZhciBwID0gdGhpcy5kcmF3UGF0aDtcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgYy5tb3ZlVG8ocFswXS54LCBwWzBdLnkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGMubGluZVRvKHBbaV0ueCwgcFtpXS55KTtcbiAgICAgICAgfVxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIHZhciBzZyA9IGMuY3JlYXRlTGluZWFyR3JhZGllbnQoeSwgLXgsIC15LCB4KTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuMDAsIFwiaHNsYSgyMzAsIDEwMCUsIDQwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuMzgsIFwiaHNsYSgyMzAsIDEwMCUsIDQwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNDgsIFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNTIsIFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNjIsIFwiaHNsYSgyMzAsIDEwMCUsIDQwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDEuMDAsIFwiaHNsYSgyMzAsIDEwMCUsIDQwJSwgMC44KVwiKTtcbiAgICAgICAgdGhpcy5zdHJva2UgPSBzZztcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IDU7XG5cbiAgICAgICAgdmFyIGZnID0gYy5jcmVhdGVMaW5lYXJHcmFkaWVudCh5LCAteCwgLXksIHgpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC4wMCwgXCJoc2xhKDI1MCwgMTAwJSwgNDAlLCAwLjIpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC4zOCwgXCJoc2xhKDI1MCwgMTAwJSwgNDAlLCAwLjIpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC40OCwgXCJoc2xhKDI1MCwgMTAwJSwgNjAlLCAwLjIpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC41MiwgXCJoc2xhKDI1MCwgMTAwJSwgNjAlLCAwLjIpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC42MiwgXCJoc2xhKDI1MCwgMTAwJSwgNDAlLCAwLjIpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMS4wMCwgXCJoc2xhKDI1MCwgMTAwJSwgNDAlLCAwLjIpXCIpO1xuICAgICAgICB0aGlzLmZpbGwgPSBmZztcbiAgICB9LFxuXG4gICAgcG9zdHJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG5cbiAgICAgICAgdmFyIHggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdmFyIHAgPSB0aGlzLmRyYXdQYXRoO1xuICAgICAgICB2YXIgb2ZmID0gdGhpcy5kcmF3UGF0aE9mZnNldDtcblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICBjLm1vdmVUbyhwWzBdLngtb2ZmLCBwWzBdLnktb2ZmKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcHggPSBwW2ldLng7XG4gICAgICAgICAgICB2YXIgcHkgPSBwW2ldLnk7XG4gICAgICAgICAgICBzd2l0Y2ggKHBbaV0uc2lkZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgcHggKz0gb2ZmOyBweSAtPSBvZmY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgcHggKz0gb2ZmOyBweSArPSBvZmY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcHggLT0gb2ZmOyBweSArPSBvZmY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcHggLT0gb2ZmOyBweSAtPSBvZmY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYy5saW5lVG8ocHgsIHB5KTtcbiAgICAgICAgfVxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGMubGluZVdpZHRoID0gMjtcbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9LFxufSk7XG5cbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5DdXJzb2xGcmFtZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LlNoYXBlXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwicmVjdFwiO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IDI7XG4gICAgfSxcblxuICAgIHByZXJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy53aWR0aCAvIDI7XG4gICAgICAgIHZhciB5ID0gdGhpcy5oZWlnaHQgLyAyO1xuXG4gICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG5cbiAgICAgICAgYy5iZWdpblBhdGgoKTtcblxuICAgICAgICAvL+S4iui+ulxuICAgICAgICBjLm1vdmVUbygteCArIDEwLCAteSAgICAgKTtcbiAgICAgICAgYy5saW5lVG8oIHggLSAxMCwgLXkgICAgICk7XG5cbiAgICAgICAgLy/lj7PovrpcbiAgICAgICAgYy5saW5lVG8oIHggICAgICwgLXkgKyAxMCk7XG4gICAgICAgIGMubGluZVRvKCB4ICAgICAsICB5IC0gMTApO1xuXG4gICAgICAgIC8v5LiL6L66XG4gICAgICAgIGMubGluZVRvKCB4IC0gMTAsICB5ICAgICApO1xuICAgICAgICBjLmxpbmVUbygteCArIDEwLCAgeSAgICAgKTtcblxuICAgICAgICAvL+WPs+i+ulxuICAgICAgICBjLmxpbmVUbygteCAgICAgLCAgeSAtIDEwKTtcbiAgICAgICAgYy5saW5lVG8oLXggICAgICwgLXkgKyAxMCk7XG5cbiAgICAgICAgYy5jbG9zZVBhdGgoKTtcblxuICAgICAgICB2YXIgc2cgPSBjLmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIC15LCAgMCwgeSk7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgwLjAwLCBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIik7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgwLjM4LCBcImhzbGEoMjMwLCAxMDAlLCA5NSUsIDAuOClcIik7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgwLjQ4LCBcImhzbGEoMjMwLCAxMDAlLCA5MCUsIDAuOClcIik7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgwLjUyLCBcImhzbGEoMjMwLCAxMDAlLCA3MCUsIDAuOClcIik7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgwLjYyLCBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIik7XG4gICAgICAgIHNnLmFkZENvbG9yU3RvcCgxLjAwLCBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIik7XG4gICAgICAgIHRoaXMuc3Ryb2tlID0gc2c7XG4gICAgICAgIHRoaXMuc3Ryb2tlV2lkdGggPSAzO1xuXG4gICAgICAgIHZhciBmZyA9IGMuY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgLXksIDAsIHkpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC4wMCwgXCJoc2xhKDIzMCwgMTAwJSwgNTAlLCAwLjgpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC4zOCwgXCJoc2xhKDIzMCwgMTAwJSwgODAlLCAwLjgpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC40OCwgXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjgpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC41MiwgXCJoc2xhKDIzMCwgMTAwJSwgNTAlLCAwLjgpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMC42MiwgXCJoc2xhKDIzMCwgMTAwJSwgNTAlLCAwLjgpXCIpO1xuICAgICAgICBmZy5hZGRDb2xvclN0b3AoMS4wMCwgXCJoc2xhKDIzMCwgMTAwJSwgNTAlLCAwLjgpXCIpO1xuICAgICAgICB0aGlzLmZpbGwgPSBmZztcbiAgICB9LFxuXG4gICAgcG9zdHJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy53aWR0aCAvIDI7XG4gICAgICAgIHZhciB5ID0gdGhpcy5oZWlnaHQgLyAyO1xuXG4gICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG4gICAgICAgIGMubGluZVdpZHRoID0gMztcblxuICAgICAgICBjLm1vdmVUbygteCArIDEwIC0gNSwgLXkgICAgICk7XG4gICAgICAgIGMubGluZVRvKC14ICAgICAgLSA1LCAteSArIDEwKTtcbiAgICAgICAgYy5saW5lVG8oLXggICAgICAtIDUsICB5IC0gMTApO1xuICAgICAgICBjLmxpbmVUbygteCArIDEwIC0gNSwgIHkgICAgICk7XG5cbiAgICAgICAgYy5tb3ZlVG8oIHggLSAxMCArIDUsIC15ICAgICApO1xuICAgICAgICBjLmxpbmVUbyggeCAgICAgICsgNSwgLXkgKyAxMCk7XG4gICAgICAgIGMubGluZVRvKCB4ICAgICAgKyA1LCAgeSAtIDEwKTtcbiAgICAgICAgYy5saW5lVG8oIHggLSAxMCArIDUsICB5ICAgICApO1xuXG4gICAgICAgIHRoaXMucmVuZGVyU3Ryb2tlKGNhbnZhcyk7XG4gICAgfSxcbn0pO1xuXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uQ2lyY2xlQnV0dG9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuU2hhcGVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoe30uJGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgICAgICB3aWR0aDogb3B0aW9ucy5yYWRpdXMgKiAyLFxuICAgICAgICAgICAgaGVpZ2h0OiBvcHRpb25zLnJhZGl1cyAqIDIsXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcImNpcmNsZVwiO1xuICAgICAgICB0aGlzLnJhZGl1cyA9IG9wdGlvbnMucmFkaXVzO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICAgICAgdGhpcy5maWxsID0gXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjQpXCI7XG4gICAgICAgIHRoaXMuc3Ryb2tlID0gXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjkpXCI7XG4gICAgICAgIHRoaXMuc3Ryb2tlV2lkdGggPSAyO1xuXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLm9uKCdlbnRlcmZyYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyLnJvdGF0aW9uKz0wLjU7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXRlci5yb3RhdGlvbi09MC41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IG9wdGlvbnMucmFkaXVzICogMixcbiAgICAgICAgICAgIGhlaWdodDogb3B0aW9ucy5yYWRpdXMgKiAyLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCIsXG4gICAgICAgICAgICBmaWxsOiBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuNClcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjkpXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMlxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmlubmVyID0gcGhpbmEuZGlzcGxheS5TaGFwZShvcHRpb25zKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLmlubmVyLnBvc3RyZW5kZXIgPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjgpXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gMCwgYjsgYSA8IE1hdGguUEkgKiAyOykge1xuICAgICAgICAgICAgICAgIGIgPSBNYXRoLnJhbmRmbG9hdCgxLjAsIDIuMCk7XG4gICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLmFyYygwLCAwLCB0aGF0LnJhZGl1cyAqIDAuOTAsIGEsIGEgKyBiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYy5saW5lV2lkdGggPSBNYXRoLmZsb29yKHRoYXQucmFkaXVzKjAuMik7XG4gICAgICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBhICs9IGIgKiAxLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vdXRlciA9IHBoaW5hLmRpc3BsYXkuU2hhcGUob3B0aW9ucykuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5vdXRlci5wb3N0cmVuZGVyID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgICAgICB2YXIgYyA9IGNhbnZhcy5jb250ZXh0O1xuICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9IFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiO1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IDAsIGI7IGEgPCBNYXRoLlBJICogMjspIHtcbiAgICAgICAgICAgICAgICBiID0gTWF0aC5yYW5kZmxvYXQoMS4wLCAyLjApO1xuICAgICAgICAgICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgYy5hcmMoMCwgMCwgdGhhdC5yYWRpdXMgKiAxLjAwLCBhLCBhICsgYiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGMubGluZVdpZHRoID0gTWF0aC5mbG9vcih0aGF0LnJhZGl1cyowLjIpO1xuICAgICAgICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgYSArPSBiICogMS41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHBvc3RyZW5kZXI6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgICB2YXIgYyA9IGNhbnZhcy5jb250ZXh0O1xuXG4gICAgICAgIGMuc3Ryb2tlU3R5bGUgPSBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIjtcblxuICAgICAgICAvL+ODnOOCv+ODs+acrOS9k1xuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICBjLmFyYygwLCAwLCB0aGlzLnJhZGl1cyAqIDAuNjUsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIGMubGluZVdpZHRoID0gMTtcbiAgICAgICAgYy5maWxsKCk7XG4gICAgICAgIGMuc3Ryb2tlKCk7XG5cbiAgICAgICAgLy/jg5zjgr/jg7PlpJbnuIFcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgYy5hcmMoMCwgMCwgdGhpcy5yYWRpdXMgKiAwLjc1LCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICBjLmxpbmVXaWR0aCA9IE1hdGguZmxvb3IodGhpcy5yYWRpdXMqMC4xKTtcbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9LFxuXG4gICAgb25wb2ludHN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuc2NhbGVYID0gMS4yO1xuICAgICAgICB0aGlzLnNjYWxlWSA9IDEuMjtcbiAgICB9LFxuXG4gICAgb25wb2ludGVuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNjYWxlWCA9IDEuMDtcbiAgICAgICAgdGhpcy5zY2FsZVkgPSAxLjA7XG4gICAgICAgIGlmICh0aGlzLmhpdFRlc3QoZS5wb2ludGVyLngsIGUucG9pbnRlci55KSkge1xuICAgICAgICAgICAgdGhpcy5mbGFyZShcImNsaWNrZWRcIik7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIGdhdWdlLmpzXG4gKiAgMjAxNi8wNy8xOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmV4dGVuc2lvbiA9IHBoaW5hLmV4dGVuc2lvbiB8fCB7fTtcblxucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLkdhdWdlXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIC8v5o+P55S744K544K/44Kk44Or6Kit5a6aXG4gICAgREVGQVVMVF9TVFlMRToge1xuICAgICAgICBmaWxsOiAncmdiYSgwLCAwLCAyMDAsIDEuMCknLFxuICAgICAgICBlbXB0eTogJ3JnYmEoMCwgMCwgMCwgMC4wKScsXG4gICAgICAgIHN0cm9rZTogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMS4wKScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiA0LFxuICAgIH0sXG5cbiAgICBtaW46IDAsXG4gICAgbWF4OiAxMDAsXG4gICAgdmFsdWU6IDEwMCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgb3B0aW9ucyA9IChvcHRpb25zfHx7fSkuJHNhZmUoe1xuICAgICAgICAgICAgd2lkdGg6IDY0MCxcbiAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICBzdHlsZTogbnVsbFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcblxuICAgICAgICAvL+OCu+ODg+ODiOOCouODg+ODl1xuICAgICAgICB0aGlzLnNldHVwKG9wdGlvbnMuc3R5bGUpO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oc3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSBzdHlsZSB8fCB7fTtcbiAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFKTtcbiAgICAgICAgdGhpcy5zdHlsZSA9IHN0eWxlO1xuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICB2YXIgZ2F1Z2VTdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbDogc3R5bGUuZmlsbCxcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUuZmlsbCxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAxXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nYXVnZSA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoZ2F1Z2VTdHlsZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih3aWR0aCotMC41LCAwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuZ2F1Z2Uub3JpZ2luWCA9IDA7XG5cbiAgICAgICAgdmFyIGZyYW1lU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLmVtcHR5LFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5zdHJva2UsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGhcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhdWdlRnJhbWUgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKGZyYW1lU3R5bGUpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24od2lkdGgqLTAuNSwgMClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLmdhdWdlRnJhbWUub3JpZ2luWCA9IDA7XG4gICAgICAgIFxuLy8gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHt2YWx1ZTogMH0sIDIwMDApLnRvKHt2YWx1ZTogMTAwfSwgMjAwMCkuc2V0TG9vcCh0cnVlKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nYXVnZS53aWR0aCA9IHRoaXMud2lkdGgqKHRoaXMudmFsdWUvKHRoaXMubWF4LXRoaXMubWluKSk7XG4gICAgfSxcblxuICAgIHNldFZhbHVlOiBmdW5jdGlvbih2KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHNldE1heDogZnVuY3Rpb24odikge1xuICAgICAgICB0aGlzLm1heCA9IHY7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc2V0TWluOiBmdW5jdGlvbih2KSB7XG4gICAgICAgIHRoaXMubWluID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuXG4iLCIvKlxuICogIHBoaW5hLmV4dGVuc2lvbi5qc1xuICogIDIwMTYvMTEvMjVcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8v44K544OX44Op44Kk44OI5qmf6IO95ouh5by1XG5waGluYS5kaXNwbGF5LlNwcml0ZS5wcm90b3R5cGUuc2V0RnJhbWVUcmltbWluZyA9IGZ1bmN0aW9uKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgdGhpcy5fZnJhbWVUcmltWCA9IHggfHwgMDtcbiAgdGhpcy5fZnJhbWVUcmltWSA9IHkgfHwgMDtcbiAgdGhpcy5fZnJhbWVUcmltV2lkdGggPSB3aWR0aCB8fCB0aGlzLmltYWdlLmRvbUVsZW1lbnQud2lkdGggLSB0aGlzLl9mcmFtZVRyaW1YO1xuICB0aGlzLl9mcmFtZVRyaW1IZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5pbWFnZS5kb21FbGVtZW50LmhlaWdodCAtIHRoaXMuX2ZyYW1lVHJpbVk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5waGluYS5kaXNwbGF5LlNwcml0ZS5wcm90b3R5cGUuc2V0RnJhbWVJbmRleCA9IGZ1bmN0aW9uKGluZGV4LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBzeCA9IHRoaXMuX2ZyYW1lVHJpbVggfHwgMDtcbiAgdmFyIHN5ID0gdGhpcy5fZnJhbWVUcmltWSB8fCAwO1xuICB2YXIgc3cgPSB0aGlzLl9mcmFtZVRyaW1XaWR0aCAgfHwgKHRoaXMuaW1hZ2UuZG9tRWxlbWVudC53aWR0aC1zeCk7XG4gIHZhciBzaCA9IHRoaXMuX2ZyYW1lVHJpbUhlaWdodCB8fCAodGhpcy5pbWFnZS5kb21FbGVtZW50LmhlaWdodC1zeSk7XG5cbiAgdmFyIHR3ICA9IHdpZHRoIHx8IHRoaXMud2lkdGg7ICAgICAgLy8gdHdcbiAgdmFyIHRoICA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDsgICAgLy8gdGhcbiAgdmFyIHJvdyA9IH5+KHN3IC8gdHcpO1xuICB2YXIgY29sID0gfn4oc2ggLyB0aCk7XG4gIHZhciBtYXhJbmRleCA9IHJvdypjb2w7XG4gIGluZGV4ID0gaW5kZXglbWF4SW5kZXg7XG5cbiAgdmFyIHggICA9IGluZGV4JXJvdztcbiAgdmFyIHkgICA9IH5+KGluZGV4L3Jvdyk7XG4gIHRoaXMuc3JjUmVjdC54ID0gc3greCp0dztcbiAgdGhpcy5zcmNSZWN0LnkgPSBzeSt5KnRoO1xuICB0aGlzLnNyY1JlY3Qud2lkdGggID0gdHc7XG4gIHRoaXMuc3JjUmVjdC5oZWlnaHQgPSB0aDtcblxuICB0aGlzLl9mcmFtZUluZGV4ID0gaW5kZXg7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCIvKlxuICogIFNsaWNlU3ByaXRlLmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwicGhpbmEuZGlzcGxheS5TbGljZVNwcml0ZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkNhbnZhc0VsZW1lbnRcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGltYWdlLCB3aWR0aCwgaGVpZ2h0LCBvcHRpb24pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb24uJHNhZmUoe1xuICAgICAgICAgICAgc2xpY2VYOiAyLCAgLy/vv73vv73vv73vv73vv73vv73vv73vv71cbiAgICAgICAgICAgIHNsaWNlWTogMiwgIC8v77+9Y++/ve+/ve+/ve+/ve+/ve+/vVxuICAgICAgICAgICAgdHJpbW1pbmc6IHsgLy/vv71n77+977+977+9fu+/ve+/ve+/vU/vv73vv73vv71cbiAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuc3ByaXRlcyA9IFtdO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBjdyA9IH4od2lkdGgvb3B0aW9uLnNsaWNlWCk7XG4gICAgICAgIHZhciBjaCA9IH4oaGVpZ2h0L29wdGlvbi5zbGljZVkpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG9wdGlvbi5zbGljZVk7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBvcHRpb24uc2xpY2VYOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKGltYWdlLCBjdywgY2gpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICAgICAgcy5zZXRGcmFtZUluZGV4KGkpLnNldFBvc2l0aW9uKHgqY3ctd2lkdGgvMiwgeSpjaC1oZWlnaHQvMik7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzLnB1c2gocyk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v77+9b++/ve+/ve+/vW/vv73vv71cbiAgICBmYWxsQXBhcnQ6IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgZnVuYyA9IGZ1bmMgfHwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHN4ID0gKGUueD09MD8wOihlLng+MD8xOi0xKSk7XG4gICAgICAgICAgICB2YXIgc3kgPSAoZS55PT0wPzA6KGUueT4wPzE6LTEpKTtcbiAgICAgICAgICAgIGUudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgLnRvKHt4OiBlLngqMTAsIHk6ZS55KjEwLCBhbHBoYTogMH0sIDEwMDAsIFwiZWFzZU91dFNpbmVcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zcHJpdGVzLmVhY2goZnVuYyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL++/ve+/ve+/vcmW34Lvv71cbiAgICByZWluc3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBjdyA9IH4odGhpcy53aWR0aC90aGlzLm9wdGlvbi5zbGljZVgpO1xuICAgICAgICB2YXIgY2ggPSB+KHRoaXMuaGVpZ2h0L3RoaXMub3B0aW9uLnNsaWNlWSk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5vcHRpb24uc2xpY2VZOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5vcHRpb24uc2xpY2VYOyB4KyspIHtcbiAgICAgICAgICAgICAgICBzLnJvdGF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBzLnNldFBvc2l0aW9uKHgqY3ctdGhpcy53aWR0aC8yLCB5KmNoLXRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufSk7XG5cbiIsIi8qXG4gKiAgU291bmRTZXQuanNcbiAqICAyMDE0LzExLzI4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL+OCteOCpuODs+ODieeuoeeQhlxucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlNvdW5kU2V0XCIsIHtcblxuICAgIC8v44K144Km44Oz44OJ44GM5qC857SN44GV44KM44KL6YWN5YiXXG4gICAgZWxlbWVudHM6IG51bGwsXG5cbiAgICAvL+WGjeeUn+S4re+8ou+8p++8rVxuICAgIGJnbTogbnVsbCxcbiAgICBiZ21Jc1BsYXk6IGZhbHNlLFxuXG4gICAgLy/jg57jgrnjgr/jg7zjg5zjg6rjg6Xjg7zjg6BcbiAgICB2b2x1bWVCR006IDAuNSxcbiAgICB2b2x1bWVTRTogMC41LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB9LFxuXG4gICAgLy/nmbvpjLLmuIjjgb/jgqLjgrvjg4Pjg4joqq3jgb/ovrzjgb9cbiAgICByZWFkQXNzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmFzc2V0cy5zb3VuZCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJzb3VuZFwiLCBrZXkpO1xuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIHBoaW5hLmFzc2V0LlNvdW5kKSB0aGlzLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ6L+95YqgXG4gICAgYWRkOiBmdW5jdGlvbihuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gICAgICAgIHVybCA9IHVybCB8fCBudWxsO1xuICAgICAgICBpZiAodGhpcy5maW5kKG5hbWUpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICB2YXIgZSA9IHBoaW5hLmV4dGVuc2lvbi5Tb3VuZEVsZW1lbnQobmFtZSk7XG4gICAgICAgIGlmICghZS5tZWRpYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieaknOe0olxuICAgIGZpbmQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50c1tpXS5uYW1lID09IG5hbWUpIHJldHVybiB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieOCku+8ou+8p++8reOBqOOBl+OBpuWGjeeUn1xuICAgIHBsYXlCR006IGZ1bmN0aW9uKG5hbWUsIGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChsb29wID09PSB1bmRlZmluZWQpIGxvb3AgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgICAgICAgIHRoaXMuYmdtLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1lZGlhID0gdGhpcy5maW5kKG5hbWUpO1xuICAgICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgICAgIHZhciB2b2wgPSB0aGlzLnZvbHVtZUJHTSAqIG1lZGlhLnZvbHVtZTtcbiAgICAgICAgICAgIG1lZGlhLnNldFZvbHVtZSh2b2wpO1xuICAgICAgICAgICAgbWVkaWEucGxheShsb29wLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB0aGlzLmJnbSA9IG1lZGlhO1xuICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkKG5hbWUpKSB0aGlzLnBsYXlCR00obmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77yi77yn77yt5YGc5q2iXG4gICAgc3RvcEJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmdtSXNQbGF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ20uc3RvcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJnbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77yi77yn77yt5LiA5pmC5YGc5q2iXG4gICAgcGF1c2VCR006IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJnbUlzUGxheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3lho3plotcbiAgICByZXN1bWVCR006IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbS52b2x1bWUgPSB0aGlzLnZvbHVtZUJHTTtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbS5yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77yi77yn77yt44Oe44K544K/44O844Oc44Oq44Ol44O844Og6Kit5a6aXG4gICAgc2V0Vm9sdW1lQkdNOiBmdW5jdGlvbih2b2wpIHtcbiAgICAgICAgdGhpcy52b2x1bWVCR00gPSB2b2w7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgdGhpcy5iZ20ucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuYmdtLnNldFZvbHVtZSh0aGlzLnZvbHVtZUJHTSk7XG4gICAgICAgICAgICB0aGlzLmJnbS5yZXN1bWUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4njgpLjgrXjgqbjg7Pjg4njgqjjg5Xjgqfjgq/jg4jjgajjgZfjgablho3nlJ9cbiAgICBwbGF5U0U6IGZ1bmN0aW9uKG5hbWUsIGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBtZWRpYSA9IHRoaXMuZmluZChuYW1lKTtcbiAgICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgICAgICB2YXIgdm9sID0gdGhpcy52b2x1bWVTRTtcbiAgICAgICAgICAgIG1lZGlhLnNldFZvbHVtZSh2b2wpO1xuICAgICAgICAgICAgbWVkaWEucGxheShsb29wLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGQobmFtZSkpIHRoaXMucGxheVNFKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+ODq+ODvOODl+WGjeeUn+OBl+OBpuOBhOOCi1NF44KS5YGc5q2iXG4gICAgc3RvcFNFOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHZhciBtZWRpYSA9IHRoaXMuZmluZChuYW1lKTtcbiAgICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgICAgICBtZWRpYS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77yi77yn77yt5LiA5pmC5YGc5q2iXG4gICAgcGF1c2VCR006IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJnbUlzUGxheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvLPvvKXjg57jgrnjgr/jg7zjg5zjg6rjg6Xjg7zjg6DoqK3lrppcbiAgICBzZXRWb2x1bWVTRTogZnVuY3Rpb24odm9sKSB7XG4gICAgICAgIHRoaXMudm9sdW1lU0UgPSB2b2w7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG59KTtcblxuLy9Tb3VuZEVsZW1lbnQgQmFzaWNcbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5Tb3VuZEVsZW1lbnRcIiwge1xuICAgIC8v44K144Km44Oz44OJ5ZCNXG4gICAgbmFtZTogbnVsbCxcblxuICAgIC8v77y177yy77ysXG4gICAgdXJsOiBudWxsLFxuXG4gICAgLy/jgrXjgqbjg7Pjg4nmnKzkvZNcbiAgICBtZWRpYTogbnVsbCxcblxuICAgIC8v44Oc44Oq44Ol44O844OgXG4gICAgX3ZvbHVtZTogMSxcblxuICAgIC8v5YaN55Sf57WC5LqG5pmC44Gu44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgY2FsbGJhY2s6IG51bGwsXG5cbiAgICAvL+WGjeeUn+S4reODleODqeOCsFxuICAgIHBsYXlpbmc6IGZhbHNlLFxuXG4gICAgaW5pdDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1lZGlhID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcInNvdW5kXCIsIG5hbWUpO1xuICAgICAgICBpZiAodGhpcy5tZWRpYSkge1xuICAgICAgICAgICAgdGhpcy5tZWRpYS52b2x1bWUgPSAxO1xuICAgICAgICAgICAgdGhpcy5tZWRpYS5vbignZW5kZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZWRpYS5sb29wKSB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjaygpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXNzZXQgbm90IGZvdW5kLiBcIituYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieOBruWGjeeUn1xuICAgIHBsYXk6IGZ1bmN0aW9uKGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChsb29wID09PSB1bmRlZmluZWQpIGxvb3AgPSBmYWxzZVxuICAgICAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuXG4gICAgICAgIC8v44Or44O844OX5YaN55Sf44Gu5aC05ZCI5aSa6YeN5YaN55Sf44KS56aB5q2iXG4gICAgICAgIGlmIChsb29wICYmIHRoaXMucGxheWluZykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubWVkaWEubG9vcCA9IGxvb3A7XG4gICAgICAgIHRoaXMubWVkaWEucGxheSgpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieWGjeeUn+WGjemWi1xuICAgIHJlc3VtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5tZWRpYSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIHRoaXMubWVkaWEucmVzdW1lKCk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieS4gOaZguWBnOatolxuICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5tZWRpYSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIHRoaXMubWVkaWEucGF1c2UoKTtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ5YGc5q2iXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5tZWRpYSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIHRoaXMubWVkaWEuc3RvcCgpO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44Oc44Oq44Ol44O844Og6Kit5a6aXG4gICAgc2V0Vm9sdW1lOiBmdW5jdGlvbih2b2wpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKHZvbCA9PT0gdW5kZWZpbmVkKSB2b2wgPSAwO1xuICAgICAgICB0aGlzLl92b2x1bWUgPSB2b2w7XG4gICAgICAgIHRoaXMubWVkaWEudm9sdW1lID0gdGhpcy5fdm9sdW1lO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2FjY2Vzc29yOiB7XG4gICAgICAgIHZvbHVtZToge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl92b2x1bWU7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih2b2wpIHsgdGhpcy5zZXRWb2x1bWUodm9sKTsgfVxuICAgICAgICB9LFxuICAgICAgICBsb29wOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubWVkaWEubG9vcDsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKGYpIHsgdGhpcy5tZWRpYS5sb29wID0gZjsgfVxuICAgICAgICB9LFxuICAgIH1cbn0pO1xuIiwiLypcbiAqICB0aWxlZG1hcC5qc1xuICogIDIwMTYvOS8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcInBoaW5hLmFzc2V0LlRpbGVkTWFwXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmFzc2V0LkFzc2V0XCIsXG5cbiAgICBpbWFnZTogbnVsbCxcblxuICAgIHRpbGVzZXRzOiBudWxsLFxuICAgIGxheWVyczogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgIH0sXG5cbiAgICBfbG9hZDogZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAvL+ODkeOCueaKnOOBjeWHuuOBl1xuICAgICAgICB0aGlzLnBhdGggPSBcIlwiO1xuICAgICAgICB2YXIgbGFzdCA9IHRoaXMuc3JjLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgICAgaWYgKGxhc3QgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGggPSB0aGlzLnNyYy5zdWJzdHJpbmcoMCwgbGFzdCsxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v57WC5LqG6Zai5pWw5L+d5a2YXG4gICAgICAgIHRoaXMuX3Jlc29sdmUgPSByZXNvbHZlO1xuXG4gICAgICAgIC8vIGxvYWRcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgeG1sID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHhtbC5vcGVuKCdHRVQnLCB0aGlzLnNyYyk7XG4gICAgICAgIHhtbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh4bWwucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGlmIChbMjAwLCAyMDEsIDBdLmluZGV4T2YoeG1sLnN0YXR1cykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0geG1sLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IChuZXcgRE9NUGFyc2VyKCkpLnBhcnNlRnJvbVN0cmluZyhkYXRhLCBcInRleHQveG1sXCIpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFUeXBlID0gXCJ4bWxcIjtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcGFyc2UoZGF0YSk7XG4vLyAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzZWxmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHhtbC5zZW5kKG51bGwpO1xuICAgIH0sXG5cbiAgICAvL+ODnuODg+ODl+OCpOODoeODvOOCuOWPluW+l1xuICAgIGdldEltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2U7XG4gICAgfSxcblxuICAgIC8v44Kq44OW44K444Kn44Kv44OI44Kw44Or44O844OX44KS6YWN5YiX44Gr44GX44Gm5Y+W5b6XXG4gICAgZ2V0T2JqZWN0R3JvdXA6IGZ1bmN0aW9uKGdyb3VwTmFtZSkge1xuICAgICAgICBncm91cE5hbWUgPSBncm91cE5hbWUgfHwgbnVsbDtcbiAgICAgICAgdmFyIGxzID0gW107XG4gICAgICAgIHZhciBsZW4gPSB0aGlzLmxheWVycy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwib2JqZWN0Z3JvdXBcIikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cE5hbWUgPT0gbnVsbCB8fCBncm91cE5hbWUgPT0gdGhpcy5sYXllcnNbaV0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAvL+ODh+OCo+ODvOODl+OCs+ODlOODvFxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0ge30uJHNhZmUodGhpcy5sYXllcnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBvYmoub2JqZWN0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuMiA9IHRoaXMubGF5ZXJzW2ldLm9iamVjdHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IGxlbjI7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iajIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30uJHNhZmUodGhpcy5sYXllcnNbaV0ub2JqZWN0c1tyXS5wcm9wZXJ0aWVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LiRzYWZlKHRoaXMubGF5ZXJzW2ldLm9iamVjdHNbcl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm9iamVjdHNbcl0gPSBvYmoyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxzLnB1c2gob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbHM7XG4gICAgfSxcblxuICAgIF9wYXJzZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvL+OCv+OCpOODq+WxnuaAp+aDheWgseWPluW+l1xuICAgICAgICB2YXIgbWFwID0gZGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFwJylbMF07XG4gICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTihtYXApO1xuICAgICAgICB0aGlzLiRleHRlbmQoYXR0cik7XG5cbiAgICAgICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jlj5blvpdcbiAgICAgICAgdGhpcy50aWxlc2V0cyA9IHRoaXMuX3BhcnNlVGlsZXNldHMoZGF0YSk7XG5cbiAgICAgICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jmg4XloLHoo5zlroxcbiAgICAgICAgdmFyIGRlZmF1bHRBdHRyID0ge1xuICAgICAgICAgICAgdGlsZXdpZHRoOiAzMixcbiAgICAgICAgICAgIHRpbGVoZWlnaHQ6IDMyLFxuICAgICAgICAgICAgc3BhY2luZzogMCxcbiAgICAgICAgICAgIG1hcmdpbjogMCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50aWxlc2V0cy5jaGlwcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlsZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8v44K/44Kk44Or44K744OD44OI5bGe5oCn5oOF5aCx5Y+W5b6XXG4gICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT04oZGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGlsZXNldCcpW2ldKTtcbiAgICAgICAgICAgIGF0dHIuJHNhZmUoZGVmYXVsdEF0dHIpO1xuICAgICAgICAgICAgYXR0ci5maXJzdGdpZC0tO1xuICAgICAgICAgICAgdGhpcy50aWxlc2V0c1tpXS4kZXh0ZW5kKGF0dHIpO1xuXG4gICAgICAgICAgICAvL+ODnuODg+ODl+ODgeODg+ODl+ODquOCueODiOS9nOaIkFxuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLnRpbGVzZXRzW2ldO1xuICAgICAgICAgICAgdGhpcy50aWxlc2V0c1tpXS5tYXBDaGlwID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciByID0gYXR0ci5maXJzdGdpZDsgciA8IGF0dHIuZmlyc3RnaWQrYXR0ci50aWxlY291bnQ7IHIrKykge1xuICAgICAgICAgICAgICAgIHZhciBjaGlwID0ge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZTogdC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgeDogKChyIC0gYXR0ci5maXJzdGdpZCkgJSB0LmNvbHVtbnMpICogKHQudGlsZXdpZHRoICsgdC5zcGFjaW5nKSArIHQubWFyZ2luLFxuICAgICAgICAgICAgICAgICAgICB5OiBNYXRoLmZsb29yKChyIC0gYXR0ci5maXJzdGdpZCkgLyB0LmNvbHVtbnMpICogKHQudGlsZWhlaWdodCArIHQuc3BhY2luZykgKyB0Lm1hcmdpbixcbiAgICAgICAgICAgICAgICB9LiRzYWZlKGF0dHIpO1xuICAgICAgICAgICAgICAgIHRoaXMudGlsZXNldHMuY2hpcHNbcl0gPSBjaGlwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jg6zjgqTjg6Tjg7zlj5blvpdcbiAgICAgICAgdGhpcy5sYXllcnMgPSB0aGlzLl9wYXJzZUxheWVycyhkYXRhKTtcblxuICAgICAgICAvL+OCpOODoeODvOOCuOODh+ODvOOCv+iqreOBv+i+vOOBv1xuICAgICAgICB0aGlzLl9jaGVja0ltYWdlKCk7XG4gICAgfSxcblxuICAgIC8v44Ki44K744OD44OI44Gr54Sh44GE44Kk44Oh44O844K444OH44O844K/44KS6Kqt44G/6L6844G/XG4gICAgX2NoZWNrSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBpbWFnZVNvdXJjZSA9IFtdO1xuICAgICAgICB2YXIgbG9hZEltYWdlID0gW107XG5cbiAgICAgICAgLy/kuIDopqfkvZzmiJBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpbGVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgIGltYWdlOiB0aGlzLnRpbGVzZXRzW2ldLmltYWdlLFxuICAgICAgICAgICAgICAgIHRyYW5zUjogdGhpcy50aWxlc2V0c1tpXS50cmFuc1IsXG4gICAgICAgICAgICAgICAgdHJhbnNHOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zRyxcbiAgICAgICAgICAgICAgICB0cmFuc0I6IHRoaXMudGlsZXNldHNbaV0udHJhbnNCLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltYWdlU291cmNlLnB1c2gob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0uaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZTogdGhpcy5sYXllcnNbaV0uaW1hZ2Uuc291cmNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZS5wdXNoKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCouOCu+ODg+ODiOOBq+OBguOCi+OBi+eiuuiqjVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlU291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGltYWdlU291cmNlW2ldLmltYWdlKTtcbiAgICAgICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgICAgICAgIC8v44Ki44K744OD44OI44Gr44GC44KLXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v44Gq44GL44Gj44Gf44Gu44Gn44Ot44O844OJ44Oq44K544OI44Gr6L+95YqgXG4gICAgICAgICAgICAgICAgbG9hZEltYWdlLnB1c2goaW1hZ2VTb3VyY2VbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/kuIDmi6zjg63jg7zjg4lcbiAgICAgICAgLy/jg63jg7zjg4njg6rjgrnjg4jkvZzmiJBcbiAgICAgICAgdmFyIGFzc2V0cyA9IHtcbiAgICAgICAgICAgIGltYWdlOiBbXVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvYWRJbWFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy/jgqTjg6Hjg7zjgrjjga7jg5HjgrnjgpLjg57jg4Pjg5fjgajlkIzjgZjjgavjgZnjgotcbiAgICAgICAgICAgIGFzc2V0cy5pbWFnZVtpbWFnZVNvdXJjZVtpXS5pbWFnZV0gPSB0aGlzLnBhdGgraW1hZ2VTb3VyY2VbaV0uaW1hZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvYWRJbWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICAgICAgbG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgICAgICAgIGxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAvL+mAj+mBjuiJsuioreWumuWPjeaYoFxuICAgICAgICAgICAgICAgIGxvYWRJbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGVsbS5pbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbG0udHJhbnNSICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByID0gZWxtLnRyYW5zUiwgZyA9IGVsbS50cmFuc0csIGIgPSBlbG0udHJhbnNCO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZmlsdGVyKGZ1bmN0aW9uKHBpeGVsLCBpbmRleCwgeCwgeSwgYml0bWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBiaXRtYXAuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGl4ZWxbMF0gPT0gciAmJiBwaXhlbFsxXSA9PSBnICYmIHBpeGVsWzJdID09IGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCszXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL+ODnuODg+ODl+OCpOODoeODvOOCuOeUn+aIkFxuICAgICAgICAgICAgICAgIHRoYXQuaW1hZ2UgPSB0aGF0Ll9nZW5lcmF0ZUltYWdlKCk7XG4gICAgICAgICAgICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgICAgICAgICAgICB0aGF0Ll9yZXNvbHZlKHRoYXQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v44Oe44OD44OX44Kk44Oh44O844K455Sf5oiQXG4gICAgICAgICAgICB0aGlzLmltYWdlID0gdGhhdC5fZ2VuZXJhdGVJbWFnZSgpO1xuICAgICAgICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmUodGhhdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/jg57jg4Pjg5fjgqTjg6Hjg7zjgrjkvZzmiJBcbiAgICBfZ2VuZXJhdGVJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBudW1MYXllciA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwibGF5ZXJcIiB8fCB0aGlzLmxheWVyc1tpXS50eXBlID09IFwiaW1hZ2VsYXllclwiKSBudW1MYXllcisrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1MYXllciA9PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoICogdGhpcy50aWxld2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMudGlsZWhlaWdodDtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHBoaW5hLmdyYXBoaWNzLkNhbnZhcygpLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy/jg57jg4Pjg5fjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwibGF5ZXJcIikge1xuICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBtYXBkYXRhID0gbGF5ZXIuZGF0YTtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSBsYXllci53aWR0aDtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gbGF5ZXIuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IG1hcGRhdGFbY291bnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44OB44OD44OX44KS6YWN572uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGluZGV4LCB4ICogdGhpcy50aWxld2lkdGgsIHkgKiB0aGlzLnRpbGVoZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImltYWdlbGF5ZXJcIikge1xuICAgICAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmxheWVyc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIHRoaXMubGF5ZXJzW2ldLmltYWdlLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKGltYWdlLmRvbUVsZW1lbnQsIHRoaXMubGF5ZXJzW2ldLngsIHRoaXMubGF5ZXJzW2ldLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRleHR1cmUgPSBwaGluYS5hc3NldC5UZXh0dXJlKCk7XG4gICAgICAgIHRleHR1cmUuZG9tRWxlbWVudCA9IGNhbnZhcy5kb21FbGVtZW50O1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9LFxuXG4gICAgLy/jgq3jg6Pjg7Pjg5Djgrnjga7mjIflrprjgZfjgZ/luqfmqJnjgavjg57jg4Pjg5fjg4Hjg4Pjg5fjga7jgqTjg6Hjg7zjgrjjgpLjgrPjg5Tjg7zjgZnjgotcbiAgICBfc2V0TWFwQ2hpcDogZnVuY3Rpb24oY2FudmFzLCBpbmRleCwgeCwgeSkge1xuICAgICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOOBi+OCieODnuODg+ODl+ODgeODg+ODl+OCkuWPluW+l1xuICAgICAgICB2YXIgY2hpcCA9IHRoaXMudGlsZXNldHMuY2hpcHNbaW5kZXhdO1xuICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGNoaXAuaW1hZ2UpO1xuICAgICAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICBpbWFnZS5kb21FbGVtZW50LFxuICAgICAgICAgICAgY2hpcC54ICsgY2hpcC5tYXJnaW4sIGNoaXAueSArIGNoaXAubWFyZ2luLFxuICAgICAgICAgICAgY2hpcC50aWxld2lkdGgsIGNoaXAudGlsZWhlaWdodCxcbiAgICAgICAgICAgIHgsIHksXG4gICAgICAgICAgICBjaGlwLnRpbGV3aWR0aCwgY2hpcC50aWxlaGVpZ2h0KTtcbiAgICB9LFxuXG4gICAgLy9YTUzjg5fjg63jg5Hjg4bjgqPjgpJKU09O44Gr5aSJ5o+bXG4gICAgX3Byb3BlcnRpZXNUb0pTT046IGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IGVsbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInByb3BlcnRpZXNcIilbMF07XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHByb3BlcnRpZXMuY2hpbGROb2Rlcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgdmFyIHAgPSBwcm9wZXJ0aWVzLmNoaWxkTm9kZXNba107XG4gICAgICAgICAgICBpZiAocC50YWdOYW1lID09PSBcInByb3BlcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAvL3Byb3BlcnR544GrdHlwZeaMh+WumuOBjOOBguOBo+OBn+OCieWkieaPm1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gcC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwLmdldEF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImludFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiZmxvYXRcIikge1xuICAgICAgICAgICAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgLy9YTUzlsZ7mgKfjgpJKU09O44Gr5aSJ5o+bXG4gICAgX2F0dHJUb0pTT046IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICB2YXIgb2JqID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBzb3VyY2UuYXR0cmlidXRlc1tpXS52YWx1ZTtcbiAgICAgICAgICAgIHZhbCA9IGlzTmFOKHBhcnNlRmxvYXQodmFsKSk/IHZhbDogcGFyc2VGbG9hdCh2YWwpO1xuICAgICAgICAgICAgb2JqW3NvdXJjZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIC8v44K/44Kk44Or44K744OD44OI44Gu44OR44O844K5XG4gICAgX3BhcnNlVGlsZXNldHM6IGZ1bmN0aW9uKHhtbCkge1xuICAgICAgICB2YXIgZWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIHZhciB0aWxlc2V0cyA9IHhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGlsZXNldCcpO1xuICAgICAgICBlYWNoLmNhbGwodGlsZXNldHMsIGZ1bmN0aW9uKHRpbGVzZXQpIHtcbiAgICAgICAgICAgIHZhciB0ID0ge307XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBzZWxmLl9wcm9wZXJ0aWVzVG9KU09OKHRpbGVzZXQpO1xuICAgICAgICAgICAgaWYgKHByb3BzLnNyYykge1xuICAgICAgICAgICAgICAgIHQuaW1hZ2UgPSBwcm9wcy5zcmM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHQuaW1hZ2UgPSB0aWxlc2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWFnZScpWzBdLmdldEF0dHJpYnV0ZSgnc291cmNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+mAj+mBjuiJsuioreWumuWPluW+l1xuICAgICAgICAgICAgdC50cmFucyA9IHRpbGVzZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJylbMF0uZ2V0QXR0cmlidXRlKCd0cmFucycpO1xuICAgICAgICAgICAgdC50cmFuc1IgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZygwLCAyKSwgMTYpO1xuICAgICAgICAgICAgdC50cmFuc0cgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZygyLCA0KSwgMTYpO1xuICAgICAgICAgICAgdC50cmFuc0IgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZyg0LCA2KSwgMTYpO1xuXG4gICAgICAgICAgICBkYXRhLnB1c2godCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLy/jg6zjgqTjg6Tjg7zmg4XloLHjga7jg5Hjg7zjgrlcbiAgICBfcGFyc2VMYXllcnM6IGZ1bmN0aW9uKHhtbCkge1xuICAgICAgICB2YXIgZWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuXG4gICAgICAgIHZhciBtYXAgPSB4bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtYXBcIilbMF07XG4gICAgICAgIHZhciBsYXllcnMgPSBbXTtcbiAgICAgICAgZWFjaC5jYWxsKG1hcC5jaGlsZE5vZGVzLCBmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgICAgIGlmIChlbG0udGFnTmFtZSA9PSBcImxheWVyXCIgfHwgZWxtLnRhZ05hbWUgPT0gXCJvYmplY3Rncm91cFwiIHx8IGVsbS50YWdOYW1lID09IFwiaW1hZ2VsYXllclwiKSB7XG4gICAgICAgICAgICAgICAgbGF5ZXJzLnB1c2goZWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXJzLmVhY2goZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgICAgIHN3aXRjaCAobGF5ZXIudGFnTmFtZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsYXllclwiOlxuICAgICAgICAgICAgICAgICAgICAvL+mAmuW4uOODrOOCpOODpOODvFxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IGxheWVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkYXRhJylbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmNvZGluZyA9IGQuZ2V0QXR0cmlidXRlKFwiZW5jb2RpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJsYXllclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5jb2RpbmcgPT0gXCJjc3ZcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbC5kYXRhID0gdGhpcy5fcGFyc2VDU1YoZC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW5jb2RpbmcgPT0gXCJiYXNlNjRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbC5kYXRhID0gdGhpcy5fcGFyc2VCYXNlNjQoZC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT04obGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICBsLiRleHRlbmQoYXR0cik7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIC8v44Kq44OW44K444Kn44Kv44OI44Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9iamVjdGdyb3VwXCI6XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3Rncm91cFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBlYWNoLmNhbGwobGF5ZXIuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxtLm5vZGVUeXBlID09IDMpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5fYXR0clRvSlNPTihlbG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihlbG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbC5vYmplY3RzLnB1c2goZCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgY2FzZSBcImltYWdlbGF5ZXJcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlbGF5ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHhcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHlcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoYTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwib3BhY2l0eVwiKSB8fCAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogKGxheWVyLmdldEF0dHJpYnV0ZShcInZpc2libGVcIikgPT09IHVuZGVmaW5lZCB8fCBsYXllci5nZXRBdHRyaWJ1dGUoXCJ2aXNpYmxlXCIpICE9IDApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VFbG0gPSBsYXllci5nZXRFbGVtZW50c0J5VGFnTmFtZShcImltYWdlXCIpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsLmltYWdlID0ge3NvdXJjZTogaW1hZ2VFbG0uZ2V0QXR0cmlidXRlKFwic291cmNlXCIpfTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLy9DU1bjg5Hjg7zjgrlcbiAgICBfcGFyc2VDU1Y6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gZGF0YS5zcGxpdCgnLCcpO1xuICAgICAgICB2YXIgbGF5ZXIgPSBbXTtcblxuICAgICAgICBkYXRhTGlzdC5lYWNoKGZ1bmN0aW9uKGVsbSwgaSkge1xuICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGVsbSwgMTApIC0gMTtcbiAgICAgICAgICAgIGxheWVyLnB1c2gobnVtKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCQVNFNjTjg5Hjg7zjgrlcbiAgICAgKiBodHRwOi8vdGhla2Fubm9uLXNlcnZlci5hcHBzcG90LmNvbS9oZXJwaXR5LWRlcnBpdHkuYXBwc3BvdC5jb20vcGFzdGViaW4uY29tLzc1S2tzMFdIXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGFyc2VCYXNlNjQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gYXRvYihkYXRhLnRyaW0oKSk7XG4gICAgICAgIHZhciByc3QgPSBbXTtcblxuICAgICAgICBkYXRhTGlzdCA9IGRhdGFMaXN0LnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGUuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgaT0wLGxlbj1kYXRhTGlzdC5sZW5ndGgvNDsgaTxsZW47ICsraSkge1xuICAgICAgICAgICAgdmFyIG4gPSBkYXRhTGlzdFtpKjRdO1xuICAgICAgICAgICAgcnN0W2ldID0gcGFyc2VJbnQobiwgMTApIC0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByc3Q7XG4gICAgfSxcbn0pO1xuXG4vL+ODreODvOODgOODvOOBq+i/veWKoFxucGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIuYXNzZXRMb2FkRnVuY3Rpb25zLnRteCA9IGZ1bmN0aW9uKGtleSwgcGF0aCkge1xuICAgIHZhciB0bXggPSBwaGluYS5hc3NldC5UaWxlZE1hcCgpO1xuICAgIHJldHVybiB0bXgubG9hZChwYXRoKTtcbn07XG4iLCIvKlxuICogIEFwcGxpY2F0aW9uLmpzXG4gKiAgMjAxNS8wOS8wOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLy9uYW1lc3BhY2UgcGJyKFBsYW5ldEJ1c3RlclJldmlzaW9uKVxubGV0IHBiciA9IHt9O1xuXG5waGluYS5kZWZpbmUoXCJBcHBsaWNhdGlvblwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkNhbnZhc0FwcFwiLFxuXG5cdF9zdGF0aWM6IHtcbiAgICAgICAgdmVyc2lvbjogXCIwLjAuMVwiLFxuICAgICAgICBzdGFnZU5hbWU6IHtcbiAgICAgICAgICAgIDE6IFwiT3BlcmF0aW9uIFBMQU5FVF9CVVNURVJcIixcbiAgICAgICAgICAgIDI6IFwiRGFuY2UgaW4gdGhlIFNreVwiLFxuICAgICAgICB9LFxuICAgICAgICBhc3NldHM6IHtcbiAgICAgICAgICAgIFwicHJlbG9hZFwiOiB7XG4gICAgICAgICAgICAgICAgc291bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFydFwiOiAgICAgICAgIFwiYXNzZXRzL3NvdW5kcy9zb3VuZGxvZ280MC5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzZXR0aW5nXCI6ICAgICAgIFwiYXNzZXRzL3NvdW5kcy9yZWNlaXB0MDUubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwid2FybmluZ1wiOiAgICAgICBcImFzc2V0cy9zb3VuZHMvYmdtX3dhcm5pbmcubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicG93ZXJ1cFwiOiAgICAgICBcImFzc2V0cy9zb3VuZHMvdGFfdGFfc3VyYWlkbzAxLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImV4cGxvZGVTbWFsbFwiOiAgXCJhc3NldHMvc291bmRzL3Nlbl9nZV90YWlob3UwMy5tcDNcIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiZXhwbG9kZUxhcmdlXCI6ICBcImFzc2V0cy9zb3VuZHMvc2VuX2dlX2hhc2FpMDEubXAzXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImV4cGxvZGVCb3NzXCI6ICAgXCJhc3NldHMvc291bmRzL3NlX21hb3VkYW1hc2hpaV9leHBsb3Npb24wMi5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJleHBsb2RlUGxheWVyXCI6IFwiYXNzZXRzL3NvdW5kcy90YV90YV96dWJhbl9kMDEubXAzXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImJvbWJcIjogICAgICAgICAgXCJhc3NldHMvc291bmRzL2JvbWIubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGxheWVybWlzc1wiOiAgICBcImFzc2V0cy9zb3VuZHMvdGFfdGFfenViYW5fZDAxLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInN0YWdlY2xlYXJcIjogICAgXCJhc3NldHMvc291bmRzL2JnbV9zdGFnZWNsZWFyLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImdhbWVvdmVyXCI6ICAgICAgXCJhc3NldHMvc291bmRzL3NvdW5kbG9nbzkubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY2FuY2VsXCI6ICAgICAgICBcImFzc2V0cy9zb3VuZHMvc2VfbWFvdWRhbWFzaGlpX3N5c3RlbTIwLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInNlbGVjdFwiOiAgICAgICAgXCJhc3NldHMvc291bmRzL3NlX21hb3VkYW1hc2hpaV9zeXN0ZW0zNi5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjbGlja1wiOiAgICAgICAgIFwiYXNzZXRzL3NvdW5kcy9zZV9tYW91ZGFtYXNoaWlfc3lzdGVtMjYubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY2xpY2syXCI6ICAgICAgICBcImFzc2V0cy9zb3VuZHMvY2xpY2syLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImJvc3NcIjogICAgICAgICAgXCJhc3NldHMvc291bmRzL2JnbV9tYW91ZGFtYXNoaWlfbmVvcm9jazEwLm1wM1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZm9udDoge1xuICAgICAgICAgICAgICAgICAgICBcIlVidW50dU1vbm9cIjogICBcImZvbnRzL1VidW50dU1vbm8tQm9sZC50dGZcIixcbiAgICAgICAgICAgICAgICAgICAgXCJPcmJpdHJvblwiOiAgICAgXCJmb250cy9PcmJpdHJvbi1SZWd1bGFyLnR0ZlwiLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImNvbW1vblwiOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZXgxXCI6ICAgICBcImFzc2V0cy9pbWFnZXMvdGV4MS5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZXgyXCI6ICAgICBcImFzc2V0cy9pbWFnZXMvdGV4Mi5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZXhfYm9zczFcIjpcImFzc2V0cy9pbWFnZXMvdGV4X2Jvc3MxLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImJ1bGxldFwiOiAgIFwiYXNzZXRzL2ltYWdlcy9idWxsZXQucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZ3Vuc2hpcFwiOiAgXCJhc3NldHMvaW1hZ2VzL2d1bnNoaXAxLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImJpdFwiOiAgICAgIFwiYXNzZXRzL2ltYWdlcy9iaXQxLnBuZ1wiLCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFwic2hvdFwiOiAgICAgXCJhc3NldHMvaW1hZ2VzL3Nob3QucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWZmZWN0XCI6ICAgXCJhc3NldHMvaW1hZ2VzL2VmZmVjdC5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJib21iXCI6ICAgICBcImFzc2V0cy9pbWFnZXMvYm9tYi5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwYXJ0aWNsZVwiOiBcImFzc2V0cy9pbWFnZXMvcGFydGljbGUucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibWFwMWdcIjogICAgXCJhc3NldHMvbWFwcy9tYXAxLnBuZ1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGFnZTFcIjoge1xuICAgICAgICAgICAgICAgIHNvdW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIFwic3RhZ2UxXCI6ICAgICAgICBcImFzc2V0cy9zb3VuZHMvZXhwc3kubXAzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YWdlMlwiOiB7XG4gICAgICAgICAgICAgICAgc291bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFnZTJcIjogICAgICAgIFwiYXNzZXRzL3NvdW5kcy9kYW5jZV9pbl90aGVfc2t5Lm1wM1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGFnZTlcIjoge1xuICAgICAgICAgICAgICAgIHNvdW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIFwic3RhZ2U5XCI6ICAgICAgICBcImFzc2V0cy9zb3VuZHMvZGVwYXJ0dXJlLm1wM1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG14OiB7XG4gICAgICAgICAgICAgICAgICAgIFwibWFwMVwiOiAgICAgICAgICBcImFzc2V0cy9tYXBzL21hcDEudG14XCIsXG4gICAgICAgICAgICAgICAgICAgIFwibWFwMV9lbmVteVwiOiAgICBcImFzc2V0cy9tYXBzL21hcDFfZW5lbXkudG14XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgLy/jgrLjg7zjg6DlhoXmg4XloLFcbiAgICAgICAgZGlmZmljdWx0eTogMSwgIC8v6Zuj5piT5bqmXG4gICAgICAgIHNjb3JlOiAwLCAgICAgICAvL+OCueOCs+OColxuICAgICAgICByYW5rOiAxLCAgICAgICAgLy/pm6PmmJPluqbjg6njg7Pjgq9cbiAgICAgICAgbnVtQ29udGludWU6IDAsIC8v44Kz44Oz44OG44Kj44OL44Ol44O85Zue5pWwXG5cbiAgICAgICAgLy/jgqjjgq/jgrnjg4bjg7Pjg4noqK3lrppcbiAgICAgICAgZXh0ZW5kU2NvcmU6IFs1MDAwMDAsIDIwMDAwMDAsIDUwMDAwMDBdLFxuICAgICAgICBleHRlbmRBZHZhbmNlOiAwLFxuICAgICAgICBpc0V4dGVuZEV2ZXJ5OiBmYWxzZSxcbiAgICAgICAgZXh0ZW5kRXZlcnlTY29yZTogNTAwMDAwLFxuXG4gICAgICAgIC8v44OX44Os44Kk44Ok44O86Kit5a6aXG4gICAgICAgIHNldHRpbmc6IHtcbiAgICAgICAgICAgIHphbmtpOiAzLCAgICAgICAvL+aui+apn1xuICAgICAgICAgICAgYm9tYlN0b2NrOiAyLCAgIC8v44Oc44Og5q6L5pWwXG4gICAgICAgICAgICBib21iU3RvY2tNYXg6IDIsLy/jg5zjg6DmnIDlpKfmlbBcbiAgICAgICAgICAgIGF1dG9Cb21iOiBmYWxzZSwvL+OCquODvOODiOODnOODoOODleODqeOCsFxuICAgICAgICB9LFxuXG4gICAgICAgIC8v44OH44OV44Kp44Or44OI6Kit5a6aXG4gICAgICAgIF9kZWZhdWx0U2V0dGluZzoge1xuICAgICAgICAgICAgZGlmZmljdWx0eTogMSxcbiAgICAgICAgICAgIHphbmtpOiAzLFxuICAgICAgICAgICAgYm9tYlN0b2NrOiAyLFxuICAgICAgICAgICAgYm9tYlN0b2NrTWF4OiAyLFxuICAgICAgICAgICAgYXV0b0JvbWI6IGZhbHNlLFxuXG4gICAgICAgICAgICAvL+OCqOOCr+OCueODhuODs+ODieioreWumlxuICAgICAgICAgICAgZXh0ZW5kU2NvcmU6IFs1MDAwMDAsIDIwMDAwMDAsIDUwMDAwMDBdLFxuICAgICAgICAgICAgaXNFeHRlbmRFdmVyeTogZmFsc2UsXG4gICAgICAgICAgICBleHRlbmRFdmVyeVNjb3JlOiA1MDAwMDAsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy/nj77lnKjoqK3lrppcbiAgICAgICAgY3VycmVudHJ5U2V0dGluZzoge1xuICAgICAgICAgICAgZGlmZmljdWx0eTogMSxcbiAgICAgICAgICAgIHphbmtpOiAzLFxuICAgICAgICAgICAgYm9tYlN0b2NrOiAyLFxuICAgICAgICAgICAgYm9tYlN0b2NrTWF4OiAyLFxuICAgICAgICAgICAgYXV0b0JvbWI6IGZhbHNlLFxuICAgICAgICB9LFxuXG4gICAgICAgIC8v77yi77yn77yt77yG5Yq55p6c6Z+zXG4gICAgICAgIHNvdW5kc2V0OiBudWxsLFxuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJ44Kr44Op44O8XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMSknLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICAgICAgcXVlcnk6ICcjd29ybGQnLFxuICAgICAgICAgICAgd2lkdGg6IFNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6IFNDX0gsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB0aGlzLmZwcyA9IDYwO1xuLypcbiAgICAgICAgdGhpcy5jYW52YXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUuaW1hZ2VSZW5kZXJpbmcgPSBcInBpeGVsYXRlZFwiO1xuKi9cbiAgICAgICAgLy/oqK3lrprmg4XloLHjga7oqq3jgb/ovrzjgb9cbiAgICAgICAgdGhpcy5sb2FkQ29uZmlnKCk7XG5cbiAgICAgICAgLy/vvKLvvKfvvK3vvIbvvLPvvKVcbiAgICAgICAgdGhpcy5zb3VuZHNldCA9IHBoaW5hLmV4dGVuc2lvbi5Tb3VuZFNldCgpO1xuXG4gICAgICAgIC8v44Ky44O844Og44OR44OD44OJ44KS5L2/55So44GZ44KLXG4gICAgICAgIHRoaXMuZ2FtZXBhZE1hbmFnZXIgPSBwaGluYS5pbnB1dC5HYW1lcGFkTWFuYWdlcigpO1xuICAgICAgICB0aGlzLmdhbWVwYWQgPSB0aGlzLmdhbWVwYWRNYW5hZ2VyLmdldCgwKTtcbiAgICAgICAgdGhpcy5vbignZW50ZXJmcmFtZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5nYW1lcGFkTWFuYWdlci51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udHJvbGxlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlcGxhY2VTY2VuZShTY2VuZUZsb3coKSk7XG4gICAgfSxcblxuICAgIC8v44Kz44Oz44OI44Ot44O844Op44O85oOF5aCx44Gu5pu05pawXG4gICAgdXBkYXRlQ29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncCA9IHRoaXMuZ2FtZXBhZDtcbiAgICAgICAgdmFyIGtiID0gdGhpcy5rZXlib2FyZDtcbiAgICAgICAgdmFyIGFuZ2xlMSA9IGdwLmdldEtleUFuZ2xlKCk7XG4gICAgICAgIHZhciBhbmdsZTIgPSBrYi5nZXRLZXlBbmdsZSgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSB7XG4gICAgICAgICAgICBhbmdsZTogYW5nbGUxICE9PSBudWxsPyBhbmdsZTE6IGFuZ2xlMixcblxuICAgICAgICAgICAgdXA6IGdwLmdldEtleShcInVwXCIpIHx8IGtiLmdldEtleShcInVwXCIpLFxuICAgICAgICAgICAgZG93bjogZ3AuZ2V0S2V5KFwiZG93blwiKSB8fCBrYi5nZXRLZXkoXCJkb3duXCIpLFxuICAgICAgICAgICAgbGVmdDogZ3AuZ2V0S2V5KFwibGVmdFwiKSB8fCBrYi5nZXRLZXkoXCJsZWZ0XCIpLFxuICAgICAgICAgICAgcmlnaHQ6IGdwLmdldEtleShcInJpZ2h0XCIpIHx8IGtiLmdldEtleShcInJpZ2h0XCIpLFxuXG4gICAgICAgICAgICBzaG90OiBncC5nZXRLZXkoXCJBXCIpIHx8IGtiLmdldEtleShcIlpcIiksXG4gICAgICAgICAgICBib21iOiBncC5nZXRLZXkoXCJCXCIpIHx8IGtiLmdldEtleShcIlhcIiksXG4gICAgICAgICAgICBzcGVjaWFsMTogZ3AuZ2V0S2V5KFwiWFwiKSB8fCBrYi5nZXRLZXkoXCJDXCIpLFxuICAgICAgICAgICAgc3BlY2lhbDI6IGdwLmdldEtleShcIllcIikgfHwga2IuZ2V0S2V5KFwiVlwiKSxcblxuICAgICAgICAgICAgb2s6IGdwLmdldEtleShcIkFcIikgfHwga2IuZ2V0S2V5KFwiWlwiKSB8fCBrYi5nZXRLZXkoXCJzcGFjZVwiKSxcbiAgICAgICAgICAgIGNhbmNlbDogZ3AuZ2V0S2V5KFwiQlwiKSB8fCBrYi5nZXRLZXkoXCJYXCIpLFxuXG4gICAgICAgICAgICBzdGFydDogZ3AuZ2V0S2V5KFwic3RhcnRcIiksXG4gICAgICAgICAgICBzZWxlY3Q6IGdwLmdldEtleShcInNlbGVjdFwiKSxcblxuICAgICAgICAgICAgYW5hbG9nMTogZ3AuZ2V0U3RpY2tEaXJlY3Rpb24oMCksXG4gICAgICAgICAgICBhbmFsb2cyOiBncC5nZXRTdGlja0RpcmVjdGlvbigxKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX29uTG9hZEFzc2V0czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc291bmRzZXQucmVhZEFzc2V0KCk7XG5cbiAgICAgICAgLy/nibnmrorlirnmnpznlKjjg5Pjg4Pjg4jjg57jg4Pjg5fkvZzmiJBcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0ZXgxXCIsXG4gICAgICAgICAgICBcInRleDJcIixcbiAgICAgICAgICAgIFwidGV4X2Jvc3MxXCIsXG4gICAgICAgICAgICBcImd1bnNoaXBcIixcbiAgICAgICAgICAgIFwiYml0XCIsXG4gICAgICAgIF0uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAvL+ODgOODoeODvOOCuOeUqFxuICAgICAgICAgICAgaWYgKCFwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KFwiaW1hZ2VcIiwgbmFtZStcIldoaXRlXCIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleCA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJpbWFnZVwiLCBuYW1lKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIHRleC5maWx0ZXIoIGZ1bmN0aW9uKHBpeGVsLCBpbmRleCwgeCwgeSwgYml0bWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYml0bWFwLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMF0gPSAocGl4ZWxbMF0gPT0gMD8gMDogMTI4KTsgLy9yXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMV0gPSAocGl4ZWxbMV0gPT0gMD8gMDogMTI4KTsgLy9nXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMl0gPSAocGl4ZWxbMl0gPT0gMD8gMDogMTI4KTsgLy9iXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLnNldChcImltYWdlXCIsIG5hbWUrXCJXaGl0ZVwiLCB0ZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/ngJXmrbvnlKhcbiAgICAgICAgICAgIGlmICghcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcImltYWdlXCIsIG5hbWUrXCJSZWRcIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4ID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcImltYWdlXCIsIG5hbWUpLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgdGV4LmZpbHRlciggZnVuY3Rpb24ocGl4ZWwsIGluZGV4LCB4LCB5LCBiaXRtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBiaXRtYXAuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCswXSA9IHBpeGVsWzBdO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzFdID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCsyXSA9IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLnNldChcImltYWdlXCIsIG5hbWUrXCJSZWRcIiwgdGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v5b2x55SoXG4gICAgICAgICAgICBpZiAoIXBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJpbWFnZVwiLCBuYW1lK1wiQmxhY2tcIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4ID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcImltYWdlXCIsIG5hbWUpLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgdGV4LmZpbHRlciggZnVuY3Rpb24ocGl4ZWwsIGluZGV4LCB4LCB5LCBiaXRtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBiaXRtYXAuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCswXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzJdID0gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuc2V0KFwiaW1hZ2VcIiwgbmFtZStcIkJsYWNrXCIsIHRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+ioreWumuODh+ODvOOCv+OBruS/neWtmFxuICAgIHNhdmVDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/oqK3lrprjg4fjg7zjgr/jga7oqq3jgb/ovrzjgb9cbiAgICBsb2FkQ29uZmlnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHBsYXlCR006IGZ1bmN0aW9uKGFzc2V0LCBsb29wLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAobG9vcCA9PT0gdW5kZWZpbmVkKSBsb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5wbGF5QkdNKGFzc2V0LCBsb29wLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHN0b3BCR006IGZ1bmN0aW9uKGFzc2V0KSB7XG4gICAgICAgIHRoaXMuc291bmRzZXQuc3RvcEJHTSgpO1xuICAgIH0sXG5cbiAgICBzZXRWb2x1bWVCR006IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgICBpZiAodm9sID4gMSkgdm9sID0gMTtcbiAgICAgICAgaWYgKHZvbCA8IDApIHZvbCA9IDA7XG4gICAgICAgIHRoaXMuc291bmRzZXQuc2V0Vm9sdW1lQkdNKHZvbCk7XG4gICAgfSxcblxuICAgIHBsYXlTRTogZnVuY3Rpb24oYXNzZXQsIGxvb3ApIHtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5wbGF5U0UoYXNzZXQsIGxvb3ApO1xuICAgIH0sXG5cbiAgICBzZXRWb2x1bWVTRTogZnVuY3Rpb24odm9sKSB7XG4gICAgICAgIGlmICh2b2wgPiAxKSB2b2wgPSAxO1xuICAgICAgICBpZiAodm9sIDwgMCkgdm9sID0gMDtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5zZXRWb2x1bWVTRSh2b2wpO1xuICAgIH0sXG5cbiAgICBfYWNjZXNzb3I6IHtcbiAgICAgICAgdm9sdW1lQkdNOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuc291bmRzLnZvbHVtZUJHTTsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHZvbCkgeyB0aGlzLnNldFZvbHVtZUJHTSh2b2wpOyB9XG4gICAgICAgIH0sXG4gICAgICAgIHZvbHVtZVNFOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuc291bmRzLnZvbHVtZVNFOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24odm9sKSB7IHRoaXMuc2V0Vm9sdW1lU0Uodm9sKTsgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCIvKlxuICogIG1haW4uanNcbiAqICAyMDE1LzA5LzA4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL3BoaW5hLmdsb2JhbGl6ZSgpO1xuXG4vL+WumuaVsFxuLy/jg5Djg7zjgrjjg6fjg7Pjg4rjg7Pjg5Djg7xcbmNvbnN0IF9WRVJTSU9OXyA9IFwiMC4xLjBcIjtcblxuLy/jg4fjg5Djg4PjgrDjg5Xjg6njgrBcbmNvbnN0IERFQlVHID0gZmFsc2U7XG5jb25zdCBNVVRFS0kgPSBmYWxzZTtcbmNvbnN0IFZJRVdfQ09MTElTSU9OID0gZmFsc2U7XG5cbi8v44K544Kv44Oq44O844Oz44K144Kk44K6XG5jb25zdCBTQ19XID0gMzIwO1xuY29uc3QgU0NfSCA9IDQ4MDtcbmNvbnN0IFNDX09GRlNFVF9YID0gMDtcbmNvbnN0IFNDX09GRlNFVF9ZID0gMDtcbmNvbnN0IFNDX1dfQyA9IFNDX1cqMC41OyAgIC8vQ0VOVEVSXG5jb25zdCBTQ19IX0MgPSBTQ19IKjAuNTtcblxuLy/jg6zjgqTjg6Tjg7zljLrliIZcbmNvbnN0IExBWUVSX1NZU1RFTSA9IDEyOyAgICAgICAgICAvL+OCt+OCueODhuODoOihqOekulxuY29uc3QgTEFZRVJfRk9SRUdST1VORCA9IDExOyAgICAgIC8v44OV44Kp44Ki44Kw44Op44Km44Oz44OJXG5jb25zdCBMQVlFUl9FRkZFQ1RfVVBQRVIgPSAxMDsgICAgLy/jgqjjg5Xjgqfjgq/jg4jkuIrkvY1cbmNvbnN0IExBWUVSX1BMQVlFUiA9IDk7ICAgICAgICAgICAvL+ODl+ODrOOCpOODpOODvFxuY29uc3QgTEFZRVJfQlVMTEVUID0gODsgICAgICAgICAgIC8v5by+XG5jb25zdCBMQVlFUl9TSE9UID0gNzsgICAgICAgICAgICAgLy/jgrfjg6fjg4Pjg4hcbmNvbnN0IExBWUVSX09CSkVDVF9VUFBFUiA9IDY7ICAgICAvL+OCquODluOCuOOCp+OCr+ODiOS4iuS9jVxuY29uc3QgTEFZRVJfT0JKRUNUX01JRERMRSA9IDU7ICAgIC8v44Kq44OW44K444Kn44Kv44OI5Lit6ZaTXG5jb25zdCBMQVlFUl9FRkZFQ1RfTUlERExFID0gNDsgICAgLy/jgqjjg5Xjgqfjgq/jg4jkuK3plpNcbmNvbnN0IExBWUVSX09CSkVDVF9MT1dFUiA9IDM7ICAgICAvL+OCquODluOCuOOCp+OCr+ODiOS4i+S9jVxuY29uc3QgTEFZRVJfRUZGRUNUX0xPV0VSID0gMjsgICAgIC8v44Ko44OV44Kn44Kv44OI5LiL5L2NXG5jb25zdCBMQVlFUl9TSEFET1cgPSAxOyAgICAgICAgICAgLy/lvbFcbmNvbnN0IExBWUVSX0JBQ0tHUk9VTkQgPSAwOyAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuXG4vL+aVteOCv+OCpOODl+WumuaVsFxuY29uc3QgRU5FTVlfU01BTEwgPSAwO1xuY29uc3QgRU5FTVlfTUlERExFID0gMTtcbmNvbnN0IEVORU1ZX0xBUkdFID0gMjtcbmNvbnN0IEVORU1ZX01CT1NTID0gMztcbmNvbnN0IEVORU1ZX0JPU1MgPSA0O1xuY29uc3QgRU5FTVlfQk9TU19FUVVJUCA9IDU7IC8v44Oc44K56KOF5YKZXG5jb25zdCBFTkVNWV9JVEVNID0gOTtcblxuLy/niIbnmbrjgr/jgqTjg5flrprmlbBcbmNvbnN0IEVYUExPREVfTk9USElORyA9IC0xO1xuY29uc3QgRVhQTE9ERV9TTUFMTCA9IDA7XG5jb25zdCBFWFBMT0RFX01JRERMRSA9IDE7XG5jb25zdCBFWFBMT0RFX0xBUkdFID0gMjtcbmNvbnN0IEVYUExPREVfR1JPVU5EID0gMztcbmNvbnN0IEVYUExPREVfTUJPU1MgPSA0O1xuY29uc3QgRVhQTE9ERV9CT1NTID0gNTtcblxuLy/jgqLjgqTjg4bjg6DnqK7poZ5cbmNvbnN0IElURU1fUE9XRVIgPSAwO1xuY29uc3QgSVRFTV9CT01CID0gMTtcbmNvbnN0IElURU1fMVVQID0gMDtcblxudmFyIEtFWUJPQVJEX01PVkUgPSB7XG4gICAgICAwOiB7IHg6ICAxLjAsIHk6ICAwLjAgfSxcbiAgICAgNDU6IHsgeDogIDAuNywgeTogLTAuNyB9LFxuICAgICA5MDogeyB4OiAgMC4wLCB5OiAtMS4wIH0sXG4gICAgMTM1OiB7IHg6IC0wLjcsIHk6IC0wLjcgfSxcbiAgICAxODA6IHsgeDogLTEuMCwgeTogIDAuMCB9LFxuICAgIDIyNTogeyB4OiAtMC43LCB5OiAgMC43IH0sXG4gICAgMjcwOiB7IHg6ICAwLjAsIHk6ICAxLjAgfSxcbiAgICAzMTU6IHsgeDogIDAuNywgeTogIDAuNyB9LFxufTtcblxuLy/jgqTjg7Pjgrnjgr/jg7PjgrlcbnZhciBhcHA7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBhcHAgPSBBcHBsaWNhdGlvbigpO1xuICAgIGFwcC5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gZHVtbXkoKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gcGhpbmEuYXNzZXQuU291bmQuZ2V0QXVkaW9Db250ZXh0KCk7XG4gICAgICAgIGNvbnRleHQucmVzdW1lKCk7XG4gICAgfSk7XG4gICAgYXBwLnJ1bigpO1xuICAgIGFwcC5lbmFibGVTdGF0cygpO1xufTtcbiIsIi8qXG4gKiAgZGFubWFrdS51dGlsaXR5LmpzXG4gKiAgMjAxNS8xMi8wMVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb24gPSBidWxsZXRtbC5kc2wuYWN0aW9uO1xuICAgIHZhciBhY3Rpb25SZWYgPSBidWxsZXRtbC5kc2wuYWN0aW9uUmVmO1xuICAgIHZhciBidWxsZXQgPSBidWxsZXRtbC5kc2wuYnVsbGV0O1xuICAgIHZhciBidWxsZXRSZWYgPSBidWxsZXRtbC5kc2wuYnVsbGV0UmVmO1xuICAgIHZhciBmaXJlID0gYnVsbGV0bWwuZHNsLmZpcmU7XG4gICAgdmFyIGZpcmVSZWYgPSBidWxsZXRtbC5kc2wuZmlyZVJlZjtcbiAgICB2YXIgY2hhbmdlRGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmNoYW5nZURpcmVjdGlvbjtcbiAgICB2YXIgY2hhbmdlU3BlZWQgPSBidWxsZXRtbC5kc2wuY2hhbmdlU3BlZWQ7XG4gICAgdmFyIGFjY2VsID0gYnVsbGV0bWwuZHNsLmFjY2VsO1xuICAgIHZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG4gICAgdmFyIHZhbmlzaCA9IGJ1bGxldG1sLmRzbC52YW5pc2g7XG4gICAgdmFyIHJlcGVhdCA9IGJ1bGxldG1sLmRzbC5yZXBlYXQ7XG4gICAgdmFyIGJpbmRWYXIgPSBidWxsZXRtbC5kc2wuYmluZFZhcjtcbiAgICB2YXIgbm90aWZ5ID0gYnVsbGV0bWwuZHNsLm5vdGlmeTtcbiAgICB2YXIgZGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmRpcmVjdGlvbjtcbiAgICB2YXIgc3BlZWQgPSBidWxsZXRtbC5kc2wuc3BlZWQ7XG4gICAgdmFyIGhvcml6b250YWwgPSBidWxsZXRtbC5kc2wuaG9yaXpvbnRhbDtcbiAgICB2YXIgdmVydGljYWwgPSBidWxsZXRtbC5kc2wudmVydGljYWw7XG4gICAgdmFyIGZpcmVPcHRpb24gPSBidWxsZXRtbC5kc2wuZmlyZU9wdGlvbjtcbiAgICB2YXIgb2Zmc2V0WCA9IGJ1bGxldG1sLmRzbC5vZmZzZXRYO1xuICAgIHZhciBvZmZzZXRZID0gYnVsbGV0bWwuZHNsLm9mZnNldFk7XG4gICAgdmFyIGF1dG9ub215ID0gYnVsbGV0bWwuZHNsLmF1dG9ub215O1xuXG4gICAgLy/lvL7nqK5cbiAgICB2YXIgUlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG4gICAgdmFyIFJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuOH0pO1xuICAgIHZhciBSTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcbiAgICB2YXIgUkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xuICAgIHZhciBSRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG5cbiAgICB2YXIgQlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xuICAgIHZhciBCTSAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC44fSk7XG4gICAgdmFyIEJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcbiAgICB2YXIgQkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjZ9KTtcbiAgICB2YXIgQkVNID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcblxuICAgIHZhciBUSElOID0gYnVsbGV0KHsgdHlwZTogXCJUSElOXCIgfSk7XG5cbiAgICB2YXIgRE0gID0gYnVsbGV0KHsgZHVtbXk6IHRydWUgfSk7XG5cbiAgICB2YXIgd2FpdCA9IGJ1bGxldG1sLmRzbC53YWl0O1xuICAgIHZhciBzcGVlZCA9IGJ1bGxldG1sLmRzbC5zcGVlZDtcblxuICAgIGJ1bGxldG1sLmRzbC5pbnRlcnZhbCA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgcmV0dXJuIHdhaXQoXCJ7MH0gKiAoMC4zICsgKDEuMCAtICRkZW5zaXR5UmFuaykgKiAwLjcpXCIuZm9ybWF0KHYpKTtcbiAgICB9O1xuICAgIGJ1bGxldG1sLmRzbC5zcGQgPSBmdW5jdGlvbih2KSB7XG4gICAgICAgIHJldHVybiBzcGVlZChcInswfSAqICgxLjAgKyAkc3BlZWRSYW5rICogMi4wKSAqICRzcGVlZEJhc2VcIi5mb3JtYXQodikpO1xuICAgIH07XG4gICAgYnVsbGV0bWwuZHNsLnNwZFNlcSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgcmV0dXJuIHNwZWVkKFwiezB9ICogKDEuMCArICRzcGVlZFJhbmsgKiAyLjApICogJHNwZWVkQmFzZVwiLmZvcm1hdCh2KSwgXCJzZXF1ZW5jZVwiKTtcbiAgICB9O1xuXG4gICAgYnVsbGV0bWwuZHNsLnJhbmsgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFwiJGRpZmZpY3VsdHkgKyAoJHJhbmsqMC4wMSktMVwiO1xuICAgIH07XG5cbiAgICAvKuiHquapn+W8vlxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuU3BlZWR9IHNwZWVkIOW8vumAn1xuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuYnVsbGV0fSBidWxsZXQg5by+56iuXG4gICAgICovXG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0wID0gZnVuY3Rpb24oYnVsbGV0LCBzcGVlZCkgeyByZXR1cm4gZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkIHx8IHNwZCgwLjgpLCBkaXJlY3Rpb24oMCkpIH07XG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0xID0gZnVuY3Rpb24oYnVsbGV0LCBzcGVlZCkgeyByZXR1cm4gZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkIHx8IHNwZCgwLjgpLCBkaXJlY3Rpb24oTWF0aC5yYW5kZigtMiwgMikpKSB9O1xuICAgIGJ1bGxldG1sLmRzbC5maXJlQWltMiA9IGZ1bmN0aW9uKGJ1bGxldCwgc3BlZWQpIHsgcmV0dXJuIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCB8fCBzcGQoMC44KSwgZGlyZWN0aW9uKE1hdGgucmFuZGYoLTQsIDQpKSkgfTtcbiAgICAvL+OCpuOCo+ODg+ODl+eUqFxuICAgIGJ1bGxldG1sLmRzbC5maXJlQWltMFZzID0gZnVuY3Rpb24oYnVsbGV0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1bGxldG1sLmRzbC5maXJlQWltMChidWxsZXQsIHNwZWVkKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGJ1bGxldG1sLmRzbC5maXJlQWltMVZzID0gZnVuY3Rpb24oYnVsbGV0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1bGxldG1sLmRzbC5maXJlQWltMShidWxsZXQsIHNwZWVkKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGJ1bGxldG1sLmRzbC5maXJlQWltMlZzID0gZnVuY3Rpb24oYnVsbGV0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1bGxldG1sLmRzbC5maXJlQWltMihidWxsZXQsIHNwZWVkKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyroh6rmqZ/ni5njgYROd2F55by+XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdheSDkuIDluqbjgavlsITlh7rjgZnjgovlvL7mlbBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFuZ2VGcm9tIOiHquapn+OCku+8kOOBqOOBl+OBn+mWi+Wni+inkuW6plxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5nZVRvIOiHquapn+OCku+8kOOBqOOBl+OBn+e1guS6huinkuW6plxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuYnVsbGV0fSBidWxsZXQg5by+56iuXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5TcGVlZH0gc3BlZWQg5by+6YCfXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRYfSBvZmZzZXRYIOWwhOWHuljluqfmqJlcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLm9mZnNldFl9IG9mZnNldFkg5bCE5Ye6WeW6p+aomVxuICAgICAqL1xuICAgIGJ1bGxldG1sLmRzbC5ud2F5ID0gZnVuY3Rpb24od2F5LCByYW5nZUZyb20sIHJhbmdlVG8sIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSB7XG4gICAgICAgIHJldHVybiBhY3Rpb24oW1xuICAgICAgICAgICAgZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkLCBkaXJlY3Rpb24ocmFuZ2VGcm9tKSwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpLFxuICAgICAgICAgICAgYmluZFZhcihcIndheVwiLCBcIk1hdGgubWF4KDIsIFwiICsgd2F5ICsgXCIpXCIpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJHdheS0xXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsIGRpcmVjdGlvbihcIigoXCIgKyByYW5nZVRvICsgXCIpLShcIiArIHJhbmdlRnJvbSArIFwiKSkvKCR3YXktMSlcIiwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH07XG4gICAgLy/jgqbjgqPjg4Pjg5fnlKhcbiAgICBidWxsZXRtbC5kc2wubndheVZzID0gZnVuY3Rpb24od2F5LCByYW5nZUZyb20sIHJhbmdlVG8sIGJ1bGxldCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLm53YXkod2F5LCByYW5nZUZyb20sIHJhbmdlVG8sIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog57W25a++TndheeW8vlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3YXkg5LiA5bqm44Gr5bCE5Ye644GZ44KL5by+5pWwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJhbmdlRnJvbSDnnJ/kuIrjgpLvvJDjgajjgZfjgZ/plovlp4vop5LluqZcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFuZ2VUbyDnnJ/kuIrjgpLvvJDjgajjgZfjgZ/ntYLkuobop5LluqZcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLmJ1bGxldH0gYnVsbGV0IOW8vueorlxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuU3BlZWR9IHNwZWVkIOW8vumAn1xuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwub2Zmc2V0WH0gb2Zmc2V0WCDlsITlh7pY5bqn5qiZXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRZfSBvZmZzZXRZIOWwhOWHulnluqfmqJlcbiAgICAgKi9cbiAgICBidWxsZXRtbC5kc2wuYWJzb2x1dGVOd2F5ID0gZnVuY3Rpb24od2F5LCByYW5nZUZyb20sIHJhbmdlVG8sIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbihbXG4gICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsICRkaXJlY3Rpb24ocmFuZ2VGcm9tLCBcImFic29sdXRlXCIpLCBvZmZzZXRYLCBvZmZzZXRZKSxcbiAgICAgICAgICAgIGJpbmRWYXIoXCJ3YXlcIiwgXCJNYXRoLm1heCgyLCBcIiArIHdheSArIFwiKVwiKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiR3YXktMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkLCBkaXJlY3Rpb24oXCIoKFwiICsgcmFuZ2VUbyArIFwiKS0oXCIgKyByYW5nZUZyb20gKyBcIikpLygkd2F5LTEpXCIsIFwic2VxdWVuY2VcIiksIG9mZnNldFgsIG9mZnNldFkpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH07XG4gICAgLy/jgqbjgqPjg4Pjg5fnlKhcbiAgICBidWxsZXRtbC5kc2wuYWJzb2x1dGVOd2F5VnMgPSBmdW5jdGlvbih3YXksIHJhbmdlRnJvbSwgcmFuZ2VUbywgYnVsbGV0LCBvZmZzZXRYLCBvZmZzZXRZKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1bGxldG1sLmRzbC5ud2F5KHdheSwgcmFuZ2VGcm9tLCByYW5nZVRvLCBidWxsZXQsIHNwZWVkLCBvZmZzZXRYLCBvZmZzZXRZKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog6Ieq5qmf54uZ44GE44K144O844Kv44Or5by+XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdheSDkuIDluqbjgavlsITlh7rjgZnjgovlvL7mlbBcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLmJ1bGxldH0gYnVsbGV0IOW8vueorlxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuU3BlZWR9IHNwZWVkIOW8vumAn1xuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwub2Zmc2V0WH0gb2Zmc2V0WCDlsITlh7pY5bqn5qiZXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRZfSBvZmZzZXRZIOWwhOWHulnluqfmqJlcbiAgICAgKi9cbiAgICBidWxsZXRtbC5kc2wuY2lyY2xlID0gZnVuY3Rpb24od2F5LCBidWxsZXQsIHNwZWVkLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSkge1xuICAgICAgICByZXR1cm4gYWN0aW9uKFtcbiAgICAgICAgICAgIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCwgZGlyZWN0aW9uKDApLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSksXG4gICAgICAgICAgICBiaW5kVmFyKFwid2F5XCIsIFwiTWF0aC5tYXgoMiwgXCIgKyB3YXkgKyBcIilcIiksXG4gICAgICAgICAgICBiaW5kVmFyKFwiZGlyXCIsIFwiTWF0aC5mbG9vcigzNjAvJHdheSlcIiksXG4gICAgICAgICAgICByZXBlYXQoXCIkd2F5LTFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCwgZGlyZWN0aW9uKFwiJGRpclwiLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICAvL+OCpuOCo+ODg+ODl+eUqFxuICAgIGJ1bGxldG1sLmRzbC5jaXJjbGVWcyA9IGZ1bmN0aW9uKHdheSwgYnVsbGV0LCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBidWxsZXRtbC5kc2wuY2lyY2xlKHdheSwgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOe1tuWvvuOCteODvOOCr+ODq+W8vlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3YXkg5LiA5bqm44Gr5bCE5Ye644GZ44KL5by+5pWwXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpciDnnJ/kuIrjgpLvvJDjgajjgZfjgZ/ln7rmupbop5LluqZcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLmJ1bGxldH0gYnVsbGV0IOW8vueorlxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuU3BlZWR9IHNwZWVkIOW8vumAn1xuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwub2Zmc2V0WH0gb2Zmc2V0WCDlsITlh7pY5bqn5qiZXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRZfSBvZmZzZXRZIOWwhOWHulnluqfmqJlcbiAgICAgKi9cbiAgICBidWxsZXRtbC5kc2wuYWJzb2x1dGVDaXJjbGUgPSBmdW5jdGlvbih3YXksIGRpciwgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbihbXG4gICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsIGRpcmVjdGlvbihkaXIsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSxcbiAgICAgICAgICAgIGJpbmRWYXIoXCJ3YXlcIiwgXCJNYXRoLm1heCgyLCBcIiArIHdheSArIFwiKVwiKSxcbiAgICAgICAgICAgIGJpbmRWYXIoXCJkaXJcIiwgXCJNYXRoLmZsb29yKDM2MC8kd2F5KVwiKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiR3YXktMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkLCBkaXJlY3Rpb24oXCIkZGlyXCIsIFwic2VxdWVuY2VcIiksIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIC8v44Km44Kj44OD44OX55SoXG4gICAgYnVsbGV0bWwuZHNsLmFic29sdXRlQ2lyY2xlVnMgPSBmdW5jdGlvbih3YXksIGJ1bGxldCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLmNpcmNsZSh3YXksIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDjgqbjgqPjg4Pjg5dcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLlNwZWVkfSBiYXNlU3BlZWQg5Yid5Zue44Gu44K544OU44O844OJXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhIDLlm57nm67ku6XpmY3jga7jgrnjg5Tjg7zjg4nlopfliIZcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQg5Zue5pWwXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihidWxsZXRtbC5TcGVlZCk6YnVsbGV0bWwuQWN0aW9ufSDjgrnjg5Tjg7zjg4njgpLlj5fjgZHlj5bjgopBY3Rpb27jgpLov5TjgZnplqLmlbBcbiAgICAgKi9cbiAgICBidWxsZXRtbC5kc2wud2hpcCA9IGZ1bmN0aW9uKGJhc2VTcGVlZCwgZGVsdGEsIGNvdW50LCBhY3Rpb25GdW5jKSB7XG4gICAgICAgIHJldHVybiBhY3Rpb24oW1xuICAgICAgICAgICAgYWN0aW9uRnVuYyhiYXNlU3BlZWQpLFxuICAgICAgICAgICAgcmVwZWF0KGNvdW50ICsgXCItMVwiLCBbXG4gICAgICAgICAgICAgICAgYWN0aW9uRnVuYyhidWxsZXRtbC5kc2wuc3BkU2VxKGRlbHRhKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSk7XG4gICAgfTtcbn0pO1xuXG4iLCIvKlxuICogIGRpYWxvZy5qc1xuICogIDIwMTUvMTAvMTlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5kZWZpbmUoXCJDb25maXJtRGlhbG9nXCIsIHtcbiAgICBzdXBlckNsYXNzOiBwaGluYS5hcHAuRGlzcGxheVNjZW5lLFxuXG4gICAgYW5zd2VyOiBudWxsLFxuXG4gICAgLy/jg6njg5njg6vnlKjjg5Xjgqnjg7Pjg4jjg5Hjg6njg6Hjg7zjgr9cbiAgICBsYWJlbFBhcmFtOiB7Zm9udEZhbWlseTpcIllhc2FzaGlzYVwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFzZWxpbmU6XCJtaWRkbGVcIiwgb3V0bGluZVdpZHRoOjMgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhcHRpb24sIGJ1dHRvbiwgZm9udFNpemUpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvbiA9IGJ1dHRvbiB8fCBbXCJPS1wiLCBcIkNBTkNFTFwiXTtcbiAgICAgICAgZm9udFNpemUgPSBmb250U2l6ZSB8fCA1MDtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gsXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciB3aWR0aCA9IFNDX1ctMjgsIGhlaWdodCA9IDkwO1xuICAgICAgICB2YXIgcGFyYW0gPSB7ZmlsbFN0eWxlOidyZ2JhKDAsODAsMCwxKScsIGxpbmVXaWR0aDo0fTtcblxuICAgICAgICAvL+OCreODo+ODl+OCt+ODp+ODs1xuICAgICAgICBpZiAoY2FwdGlvbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKGNhcHRpb25bMF0sIGZvbnRTaXplKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBhcmFtKHRoaXMubGFiZWxQYXJhbSlcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC4zOSk7XG4gICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKGNhcHRpb25bMV0sIGZvbnRTaXplKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBhcmFtKHRoaXMubGFiZWxQYXJhbSlcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC40Myk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKGNhcHRpb24sIGZvbnRTaXplKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBhcmFtKHRoaXMubGFiZWxQYXJhbSlcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC40Mik7XG4gICAgICAgIH1cblxuICAgICAgICAvL++8ue+8pe+8s1xuICAgICAgICBwaGluYS5leHRlbnNpb24uQnV0dG9uKHdpZHRoLCBoZWlnaHQsIGJ1dHRvblswXSwge2ZsYXQ6IGFwcE1haW4uYnV0dG9uRmxhdH0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwicHVzaGVkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYW5zd2VyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcHBNYWluLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvL++8ru+8r1xuICAgICAgICBwaGluYS5leHRlbnNpb24uQnV0dG9uKHdpZHRoLCBoZWlnaHQsIGJ1dHRvblsxXSwge2ZsYXQ6IGFwcE1haW4uYnV0dG9uRmxhdH0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNTgpXG4gICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInB1c2hlZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFuc3dlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGFwcE1haW4ucG9wU2NlbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sXG59KTtcblxudmFyIERFRkFMVF9BTEVSVFBBUkFNID0ge1xuICAgIGhlaWdodDogU0NfSCowLjM1LFxuICAgIHRleHQxOiBcInRleHRcIixcbiAgICB0ZXh0MjogbnVsbCxcbiAgICB0ZXh0MzogbnVsbCxcbiAgICBmb250U2l6ZTogMzIsXG4gICAgYnV0dG9uOiBcIk9LXCIsXG59XG5cbnBoaW5hLmRlZmluZShcInNob3RndW4uQWxlcnREaWFsb2dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IHBoaW5hLmFwcC5EaXNwbGF5U2NlbmUsXG5cbiAgICAvL+ODqeODmeODq+eUqOODleOCqeODs+ODiOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtmb250RmFtaWx5OlwiWWFzYXNoaXNhXCIsIGFsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTpcIm1pZGRsZVwiLCBvdXRsaW5lV2lkdGg6MiB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgcGFyYW0gPSB7fS4kZXh0ZW5kKERFRkFMVF9BTEVSVFBBUkFNLCBwYXJhbSk7XG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4lcbiAgICAgICAgcGhpbmEuZGlzcGxheS5Sb3VuZFJlY3RhbmdsZVNoYXBlKHt3aWR0aDogU0NfVy0yMCwgaGVpZ2h0OiBwYXJhbS5oZWlnaHQsIGZpbGxTdHlsZTogYXBwTWFpbi5iZ0NvbG9yLCBsaW5lV2lkdGg6IDR9KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIHdpZHRoID0gU0NfVy0yOCwgaGVpZ2h0ID0gOTA7XG5cbiAgICAgICAgLy/jgq3jg6Pjg5fjgrfjg6fjg7NcbiAgICAgICAgdmFyIHBvcyA9IFNDX0gqMC40NztcbiAgICAgICAgaWYgKHBhcmFtLnRleHQyKSBwb3MgLT0gU0NfSCowLjA1O1xuICAgICAgICBpZiAocGFyYW0udGV4dDMpIHBvcyAtPSBTQ19IKjAuMDU7XG5cbiAgICAgICAgdmFyIGxiID0gcGhpbmEuZGlzcGxheS5MYWJlbChwYXJhbS50ZXh0MSwgcGFyYW0uZm9udFNpemUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIGxiLnNldFBhcmFtKHRoaXMubGFiZWxQYXJhbSk7XG4gICAgICAgIGxiLnNldFBvc2l0aW9uKFNDX1cqMC41LCBwb3MpO1xuXG4gICAgICAgIGlmIChwYXJhbS50ZXh0Mikge1xuICAgICAgICAgICAgcG9zICs9IFNDX0gqMC4wNTtcbiAgICAgICAgICAgIHZhciBsYiA9IHBoaW5hLmRpc3BsYXkuTGFiZWwocGFyYW0udGV4dDIsIHBhcmFtLmZvbnRTaXplKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgbGIuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICAgICAgICAgIGxiLnNldFBvc2l0aW9uKFNDX1cqMC41LCBwb3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbS50ZXh0Mykge1xuICAgICAgICAgICAgcG9zICs9IFNDX0gqMC4wNTtcbiAgICAgICAgICAgIHZhciBsYiA9IHBoaW5hLmRpc3BsYXkuTGFiZWwocGFyYW0udGV4dDMsIHBhcmFtLmZvbnRTaXplKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgbGIuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICAgICAgICAgIGxiLnNldFBvc2l0aW9uKFNDX1cqMC41LCBwb3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5zjgr/jg7NcbiAgICAgICAgcGhpbmEuZXh0ZW5zaW9uLkJ1dHRvbih3aWR0aCwgaGVpZ2h0LCBwYXJhbS5idXR0b24sIHtmbGF0OiBhcHBNYWluLmJ1dHRvbkZsYXR9KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjU1KVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJwdXNoZWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hbnN3ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBhcHBNYWluLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIEJ1bGxldC5qc1xuICogIDIwMTQvMDcvMTZcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIkJ1bGxldFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG4gICAgbGF5ZXI6IExBWUVSX0JVTExFVCxcblxuICAgIC8v5bCE5Ye644GX44Gf5pW144GuSURcbiAgICBpZDogLTEsXG5cbiAgICAvL0J1bGxldE1MIFJ1bm5uZXJcbiAgICBydW5uZXI6IG51bGwsXG5cbiAgICAvL+enu+WLleS/guaVsFxuICAgIHZ4OiAwLFxuICAgIHZ5OiAxLFxuXG4gICAgLy/liqDpgJ/luqZcbiAgICBhY2NlbDogMS4wLFxuXG4gICAgLy/lm57ou6JcbiAgICByb2xsQW5nbGU6IDUsXG4gICAgcm9sbGluZzogdHJ1ZSxcblxuICAgIC8v57WM6YGO5pmC6ZaTXG4gICAgdGltZTogMCxcblxuICAgIERFRkFVTFRfUEFSQU06IHtcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICB0eXBlOiBcIlJTXCIsXG4gICAgICAgIHg6IFNDX1cqMC41LFxuICAgICAgICB5OiBTQ19IKjAuNSxcbiAgICAgICAgdng6IDAsXG4gICAgICAgIHZ5OiAxLFxuICAgIH0sXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICAgIGdsb2JhbFNwZWVkUmF0ZTogMS4wLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgIHRoaXMucmFkaXVzID0gMjtcblxuICAgICAgICAvL1R3ZWVuZXLjgpJGUFPjg5njg7zjgrnjgavjgZnjgotcbiAgICAgICAgdGhpcy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIC8v5by+55S75YOPXG4gICAgICAgIHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJidWxsZXRcIiwgMjQsIDI0KS5hZGRDaGlsZFRvKHRoaXMpO1xuXG4gICAgICAgIHRoaXMub24oXCJlbnRlcmZyYW1lXCIsIGZ1bmN0aW9uKGFwcCl7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsaW5nKSB0aGlzLnJvdGF0aW9uICs9IHRoaXMucm9sbEFuZ2xlO1xuICAgICAgICAgICAgdmFyIHJ1bm5lciA9IHRoaXMucnVubmVyO1xuICAgICAgICAgICAgaWYgKHJ1bm5lcikge1xuICAgICAgICAgICAgICAgIHZhciBieCA9IHRoaXMueDtcbiAgICAgICAgICAgICAgICB2YXIgYnkgPSB0aGlzLnk7XG4gICAgICAgICAgICAgICAgcnVubmVyLnggPSBieDtcbiAgICAgICAgICAgICAgICBydW5uZXIueSA9IGJ5O1xuICAgICAgICAgICAgICAgIHJ1bm5lci51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB2YXIgYWNjID0gQnVsbGV0Lmdsb2JhbFNwZWVkUmF0ZSAqIHRoaXMud2FpdDtcbiAgICAgICAgICAgICAgICB0aGlzLnZ4ID0gKHJ1bm5lci54IC0gYngpO1xuICAgICAgICAgICAgICAgIHRoaXMudnkgPSAocnVubmVyLnkgLSBieSk7XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMudnggKiBhY2M7XG4gICAgICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMudnkgKiBhY2M7XG5cbiAgICAgICAgICAgICAgICAvL+eUu+mdouevhOWbsuWkllxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnggPCAtMTYgfHwgdGhpcy54ID4gU0NfVysxNiB8fCB0aGlzLnkgPCAtMTYgfHwgdGhpcy55ID4gU0NfSCsxNikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy/oh6rmqZ/jgajjga7lvZPjgorliKTlrprjg4Hjgqfjg4Pjgq9cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZHVtbXkgJiYgdGhpcy50aW1lICUgMikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVyID0gdGhpcy5idWxsZXRMYXllci5wYXJlbnRTY2VuZS5wbGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDb2xsaXNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzSGl0RWxlbWVudChwbGF5ZXIpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZGFtYWdlKCkpIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v44Oq44Og44O844OW5pmCXG4gICAgICAgIHRoaXMub24oXCJyZW1vdmVkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldExheWVyLnBvb2wucHVzaCh0aGlzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKHJ1bm5lciwgc3BlYykge1xuICAgICAgICB0aGlzLmlkID0gMDtcbiAgICAgICAgdGhpcy54ID0gcnVubmVyLng7XG4gICAgICAgIHRoaXMueSA9IHJ1bm5lci55O1xuICAgICAgICB0aGlzLnJ1bm5lciA9IHJ1bm5lcjtcblxuICAgICAgICB0aGlzLnNwcml0ZS5zZXRPcmlnaW4oMC41LCAwLjUpO1xuXG4gICAgICAgIGlmIChzcGVjLmR1bW15KSB7XG4gICAgICAgICAgICB0aGlzLmR1bW15ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5by+56iu5Yil44Kw44Op44OV44Kj44OD44KvXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHNwZWMuc2l6ZSB8fCAxLjAsIGluZGV4ID0gMDtcbiAgICAgICAgICAgIHN3aXRjaCAoc3BlYy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm5vcm1hbFwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGVjLmNvbG9yID09IFwiYmx1ZVwiKSBpbmRleCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyb2xsXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gODtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMuY29sb3IgPT0gXCJibHVlXCIpIGluZGV4ID0gMjQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJUSElOXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9sbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IDM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLnJ1bm5lci5kaXJlY3Rpb24qdG9EZWctOTA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLnNldE9yaWdpbigwLjUsIDAuMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuc2V0RnJhbWVJbmRleChpbmRleCkuc2V0U2NhbGUoc2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmR1bW15ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy/lvL7jgavnmbrlsITmmYLjgqbjgqfjgqTjg4jjgYzmjpvjgovjg5Xjg6zjg7zjg6DmlbBcbiAgICAgICAgICAgIHZhciBwYXVzZUZyYW1lID0gNDU7XG4gICAgICAgICAgICB0aGlzLndhaXQgPSAwLjM7XG4gICAgICAgICAgICB0aGlzLnNldFNjYWxlKDAuMSk7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS50byh7c2NhbGVYOiAxLjAsIHNjYWxlWToxLjAsIHdhaXQ6IDEuMH0sIHBhdXNlRnJhbWUsIFwiZWFzZUluT3V0U2luZVwiKTtcblxuICAgICAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZXJhc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuZHVtbXkpIHtcbiAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMuYnVsbGV0TGF5ZXIucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgIGxheWVyLmVudGVyQnVsbGV0VmFuaXNoKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHRoaXMudngsIHk6IHRoaXMudnksIGRlY2F5OiAwLjk5fSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuXG4iLCIvKlxuICogIGJ1bGxldGNvbmZpZy5qc1xuICogIDIwMTUvMTEvMTlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICAgIHBoaW5hLmRlZmluZShcIkJ1bGxldENvbmZpZ1wiLCB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIF9zdGF0aWM6IHtcbiAgICAgICAgICAgIHNwZWVkUmF0ZTogMyxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgICAgIGJ1bGxldExheWVyOiBudWxsLFxuXG4gICAgICAgICAgICBzZXR1cDogZnVuY3Rpb24odGFyZ2V0LCBidWxsZXRMYXllcikge1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0TGF5ZXIgPSBidWxsZXRMYXllcjtcblxuICAgICAgICAgICAgICAgIC8v6Zuj5piT5bqmKGludCkoMDplYXN5IDE6bm9ybWFsIDI6aGFyZCAzOmRlYXRoKVxuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwiZGlmZmljdWx0eVwiLCAxKTtcblxuICAgICAgICAgICAgICAgIC8v44Ky44O844Og6Zuj5piT5bqm44Op44Oz44KvKGludClcbiAgICAgICAgICAgICAgICB0aGlzLnB1dChcInJhbmtcIiwgMSk7XG5cbiAgICAgICAgICAgICAgICAvL+W8vumAnyhmbG9hdClcbiAgICAgICAgICAgICAgICB0aGlzLnB1dChcInNwZWVkQmFzZVwiLCAxLjAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnB1dChcInNwZWVkUmFua1wiLCAwLjAwKTtcblxuICAgICAgICAgICAgICAgIC8v5by+5a+G5bqmKGZsb2F0IDAuMDAtMS4wMClcbiAgICAgICAgICAgICAgICB0aGlzLnB1dChcImRlbnNpdHlSYW5rXCIsIDAuMDApO1xuXG4gICAgICAgICAgICAgICAgLy/lvL7mlbDlopfliqDmlbAoaW50KVxuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwiYnVyc3RcIiwgMCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjcmVhdGVOZXdCdWxsZXQ6IGZ1bmN0aW9uKHJ1bm5lciwgc3BlYykge1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLm9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldExheWVyLmVudGVyQnVsbGV0KHJ1bm5lciwgc3BlYy5vcHRpb24pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0TGF5ZXIuZW50ZXJCdWxsZXQocnVubmVyLCBzcGVjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBwdXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0bWwuV2Fsa2VyLmdsb2JhbFNjb3BlW1wiJFwiICsgbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG4iLCIvKlxuICogIGJ1bGxldGxheWVyLmpzXG4gKiAgMjAxNS8xMS8xMlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiQnVsbGV0TGF5ZXJcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICBtYXg6IDI1NixcbiAgICAgICAgcG9vbCA6IG51bGwsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMucG9vbCA9IEFycmF5LnJhbmdlKDAsIHRoaXMubWF4KS5tYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYiA9IEJ1bGxldCgpO1xuICAgICAgICAgICAgYi5idWxsZXRMYXllciA9IHNlbGY7XG4gICAgICAgICAgICBiLnBhcmVudFNjZW5lID0gYXBwLmN1cnJlbnRTY2VuZTtcbiAgICAgICAgICAgIHJldHVybiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/lvL7mipXlhaVcbiAgICBlbnRlckJ1bGxldDogZnVuY3Rpb24ocnVubmVyLCBzcGVjKSB7XG4gICAgICAgIC8v44Oc44K55Lul5aSW44Gu5Zyw5LiK54mp44Gu5aC05ZCI44CB44OX44Os44Kk44Ok44O844Gr6L+R5o6l44GX44Gm44Gf44KJ5by+44KS5pKD44Gf44Gq44GEXG4gICAgICAgIHZhciBob3N0ID0gcnVubmVyLmhvc3Q7XG4gICAgICAgIGlmIChob3N0LmlzR3JvdW5kICYmICFob3N0LmlzQm9zcykge1xuICAgICAgICAgICAgdmFyIGRpcyA9IGRpc3RhbmNlU3EocnVubmVyLCB0aGlzLnBhcmVudFNjZW5lLnBsYXllcik7XG4gICAgICAgICAgICBpZiAoZGlzIDwgNDA5NikgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiID0gdGhpcy5wb29sLnNoaWZ0KCk7XG4gICAgICAgIGlmICghYikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQnVsbGV0IGVtcHR5ISFcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBiLnNldHVwKHJ1bm5lciwgc3BlYykuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgfSxcblxuICAgIC8v5bCE5Ye6SUTjgavlkIjoh7TjgZnjgovlvL7jgpLmtojljrvvvIjmnKrmjIflrprmmYLlhajmtojljrvvvIlcbiAgICBlcmFzZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGFsbCA9IChpZCA9PT0gdW5kZWZpbmVkPyB0cnVlOiBmYWxzZSk7XG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5jaGlsZHJlbi5zbGljZSgpO1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHZhciBiO1xuICAgICAgICBpZiAoYWxsKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYiA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgaWYgKGIgaW5zdGFuY2VvZiBCdWxsZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgYi5lcmFzZSgpO1xuICAgICAgICAgICAgICAgICAgICBiLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBiID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoYiBpbnN0YW5jZW9mIEJ1bGxldCAmJiBpZCA9PSBiLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGIuZXJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIEVmZmVjdC5qc1xuICogIDIwMTQvMDcvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5FZmZlY3QgPSBbXTtcblxuLy/msY7nlKjjgqjjg5Xjgqfjgq/jg4hcbnBoaW5hLmRlZmluZShcIkVmZmVjdC5FZmZlY3RCYXNlXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuU3ByaXRlXCIsXG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIC8v44Kk44Oz44OH44OD44Kv44K55pu05paw6ZaT6ZqUXG4gICAgICAgIGludGVydmFsOiAyLFxuXG4gICAgICAgIC8v6ZaL5aeL44Kk44Oz44OH44OD44Kv44K5XG4gICAgICAgIHN0YXJ0SW5kZXg6IDAsXG5cbiAgICAgICAgLy/mnIDlpKfjgqTjg7Pjg4fjg4Pjgq/jgrlcbiAgICAgICAgbWF4SW5kZXg6IDgsXG5cbiAgICAgICAgLy/nj77lnKjjgqTjg7Pjg4fjg4Pjgq/jgrlcbiAgICAgICAgaW5kZXg6IDAsXG5cbiAgICAgICAgLy/pgYXlu7booajnpLrjg5Xjg6zjg7zjg6DmlbBcbiAgICAgICAgZGVsYXk6IDAsXG5cbiAgICAgICAgLy/jg6vjg7zjg5fjg5Xjg6njgrBcbiAgICAgICAgbG9vcDogZmFsc2UsXG5cbiAgICAgICAgLy/jgrfjg7zjg7PjgYvjgonliYrpmaTjg5Xjg6njgrBcbiAgICAgICAgaXNSZW1vdmU6IGZhbHNlLFxuXG4gICAgICAgIC8v5Yqg6YCf5bqmXG4gICAgICAgIHZlbG9jaXR5OiB7fSxcblxuICAgICAgICAvL+WcsOS4iuOCqOODleOCp+OCr+ODiOODleODqeOCsFxuICAgICAgICBpZkdyb3VuZDogZmFsc2UsXG5cbiAgICAgICAgdGltZTogMCxcbiAgICB9LFxuXG4gICAgZGVmYXVsdE9wdGlvbjoge1xuICAgICAgICBuYW1lOiBcIm5vbmFtZVwiLFxuICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgIHdpZHRoOiA2NCxcbiAgICAgICAgaGVpZ2h0OiA2NCxcbiAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgIG1heEluZGV4OiAxNyxcbiAgICAgICAgc2VxdWVuY2U6IG51bGwsXG4gICAgICAgIGRlbGF5OiAwLFxuICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgZW50ZXJmcmFtZTogbnVsbCxcbiAgICAgICAgaXNHcm91bmQ6IGZhbHNlLFxuICAgICAgICB0cmltbWluZzogbnVsbCxcbiAgICAgICAgcG9zaXRpb246IHt4OiBTQ19XKjAuNSwgeTogU0NfSCowLjV9LFxuICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IDAsIGRlY2F5OiAwfSxcbiAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgIGFscGhhOiAxLjAsXG4gICAgICAgIHNjYWxlOiB7eDogMS4wLCB5OiAxLjB9LFxuICAgICAgICBibGVuZE1vZGU6IFwic291cmNlLW92ZXJcIixcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KFwiZWZmZWN0XCIpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB0aGlzLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHtcbiAgICAgICAgICAgIHg6IDAsICAgICAgIC8v77y45bqn5qiZ5pa55ZCRXG4gICAgICAgICAgICB5OiAwLCAgICAgICAvL++8ueW6p+aomeaWueWQkVxuICAgICAgICAgICAgZGVjYXk6IDEuMCAgLy/muJvoobDnjodcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uKFwiZW50ZXJmcmFtZVwiLCB0aGlzLmRlZmF1bHRFbnRlcmZyYW1lKTtcblxuICAgICAgICAvL+ODquODoOODvOODluaZglxuICAgICAgICB0aGlzLm9uKFwicmVtb3ZlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy5lZmZlY3RMYXllci5wb29sLnB1c2godGhpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgaWYgKHRoaXMuYXNzZXROYW1lICE9IG9wdGlvbi5hc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIG9wdGlvbi5hc3NldE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5hc3NldE5hbWUgPSBvcHRpb24uYXNzZXROYW1lO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb24ud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9uLmhlaWdodDtcblxuICAgICAgICAvL+WIneacn+WApOOCu+ODg+ODiFxuICAgICAgICB0aGlzLm5hbWUgPSBvcHRpb24ubmFtZTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG9wdGlvbi5pbnRlcnZhbDtcbiAgICAgICAgdGhpcy5zdGFydEluZGV4ID0gb3B0aW9uLnN0YXJ0SW5kZXg7XG4gICAgICAgIHRoaXMubWF4SW5kZXggPSBvcHRpb24ubWF4SW5kZXg7XG4gICAgICAgIHRoaXMuc2VxdWVuY2UgPSBvcHRpb24uc2VxdWVuY2U7XG4gICAgICAgIHRoaXMuc2VxSW5kZXggPSAwO1xuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9uLmRlbGF5O1xuICAgICAgICBpZiAodGhpcy5kZWxheSA8IDApIHRoaXMuZGVsYXkgKj0gLTE7XG4gICAgICAgIHRoaXMubG9vcCA9IG9wdGlvbi5sb29wO1xuICAgICAgICB0aGlzLnRpbWUgPSAtdGhpcy5kZWxheTtcblxuICAgICAgICAvL86x44OW44Os44Oz44OJ6Kit5a6aXG4gICAgICAgIHRoaXMuYWxwaGEgPSBvcHRpb24uYWxwaGE7XG4gICAgICAgIHRoaXMuYmxlbmRNb2RlID0gb3B0aW9uLmJsZW5kTW9kZTtcblxuICAgICAgICAvL+ODiOODquODn+ODs+OCsOioreWumlxuICAgICAgICB2YXIgdHIgPSBvcHRpb24udHJpbW1pbmcgfHwge3g6MCwgeTogMCwgd2lkdGg6IHRoaXMuaW1hZ2Uud2lkdGgsIGhlaWdodDogdGhpcy5pbWFnZS5oZWlnaHR9O1xuICAgICAgICB0aGlzLnNldEZyYW1lVHJpbW1pbmcodHIueCwgdHIueSwgdHIud2lkdGgsIHRyLmhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMuc3RhcnRJbmRleDtcbiAgICAgICAgaWYgKHRoaXMuc2VxdWVuY2UpIHRoaXMuaW5kZXggPSB0aGlzLnNlcXVlbmNlWzBdO1xuICAgICAgICB0aGlzLnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihvcHRpb24ucG9zaXRpb24ueCwgb3B0aW9uLnBvc2l0aW9uLnkpO1xuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KG9wdGlvbi52ZWxvY2l0eS54LCBvcHRpb24udmVsb2NpdHkueSwgb3B0aW9uLnZlbG9jaXR5LmRlY2F5KTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IG9wdGlvbi5yb3RhdGlvbjtcbiAgICAgICAgdGhpcy5zY2FsZVggPSBvcHRpb24uc2NhbGUueDtcbiAgICAgICAgdGhpcy5zY2FsZVkgPSBvcHRpb24uc2NhbGUueTtcblxuICAgICAgICB0aGlzLmlzUmVtb3ZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vVHdlZW5lcuODquOCu+ODg+ODiFxuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZGVmYXVsdEVudGVyZnJhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lIDwgMCkge1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aW1lID09IDApIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgLy/lnLDkuIrniannj77luqfmqJnoqr/mlbRcbiAgICAgICAgaWYgKHRoaXMuaXNHcm91bmQpIHtcbiAgICAgICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgICAgIHRoaXMueCArPSBncm91bmQuZGVsdGFYO1xuICAgICAgICAgICAgdGhpcy55ICs9IGdyb3VuZC5kZWx0YVk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50aW1lICUgdGhpcy5pbnRlcnZhbCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnNlcXVlbmNlW3RoaXMuc2VxSW5kZXhdO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VxSW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXFJbmRleCA9PSB0aGlzLnNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sb29wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcUluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNSZW1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXggPiB0aGlzLm1heEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnN0YXJ0SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzUmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL+eUu+mdouevhOWbsuWkllxuICAgICAgICBpZiAodGhpcy54IDwgLTMyIHx8IHRoaXMueCA+IFNDX1crMzIgfHwgdGhpcy55IDwgLTMyIHx8IHRoaXMueSA+IFNDX0grMzIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZW1vdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRWZWxvY2l0eSgpO1xuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgaWYgKHRoaXMuaXNSZW1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/nj77lnKjjga7luqfmqJnjgavliqDpgJ/luqbjgpLliqDnrpdcbiAgICBhZGRWZWxvY2l0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCArPSB0aGlzLnZlbG9jaXR5Lng7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLnZlbG9jaXR5Lnk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkueCAqPSB0aGlzLnZlbG9jaXR5LmRlY2F5O1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gdGhpcy52ZWxvY2l0eS5kZWNheTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v5Yqg6YCf5bqm44Gu6Kit5a6aXG4gICAgc2V0VmVsb2NpdHk6IGZ1bmN0aW9uKHgsIHksIGRlY2F5KSB7XG4gICAgICAgIGRlY2F5ID0gZGVjYXkgfHwgMTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS54ID0geDtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS55ID0geTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5kZWNheSA9IGRlY2F5O1xuICAgICAgICByZXR1cm4gdGhpczsgICAgICAgIFxuICAgIH0sXG5cbiAgICAvL+ODq+ODvOODl+ioreWumlxuICAgIHNldExvb3A6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgdGhpcy5sb29wID0gYjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSk7XG4iLCIvKlxuICogIGJ1bGxldGxheWVyLmpzXG4gKiAgMjAxNS8xMS8xMlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiRWZmZWN0UG9vbFwiLCB7XG4gICAgaW5pdDogZnVuY3Rpb24oc2l6ZSwgcGFyZW50U2NlbmUpIHtcbiAgICAgICAgdGhpcy5wb29sID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXggPSBzaXplIHx8IDI1NjtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMucG9vbCA9IEFycmF5LnJhbmdlKDAsIHRoaXMubWF4KS5tYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZSA9IEVmZmVjdC5FZmZlY3RCYXNlKCk7XG4gICAgICAgICAgICBlLmVmZmVjdExheWVyID0gc2VsZjtcbiAgICAgICAgICAgIGUucGFyZW50U2NlbmUgPSBwYXJlbnRTY2VuZTtcbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/lj5blvpdcbiAgICBzaGlmdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wb29sLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+aIu+OBl1xuICAgIHB1c2g6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wb29sLnB1c2goZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG59KTtcblxucGhpbmEuZGVmaW5lKFwiRWZmZWN0TGF5ZXJcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/jgqjjg5Xjgqfjgq/jg4jmipXlhaXmmYLjg4fjg5Xjgqnjg6vjg4jjgqrjg5fjgrfjg6fjg7NcbiAgICBkZWZhdWx0T3B0aW9uOiB7XG4gICAgICAgIHBvc2l0aW9uOiB7eDogU0NfVyowLjUsIHk6IFNDX0gqMC41fSxcbiAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiAwLCBkZWNheTogMH0sXG4gICAgICAgIGRlbGF5OiAwXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBvb2wpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy5wb29sID0gcG9vbDtcbiAgICB9LFxuXG4gICAgLy/jgqjjg5Xjgqfjgq/jg4jmipXlhaVcbiAgICBlbnRlcjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wb29sLnNoaWZ0KCk7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRWZmZWN0IGVtcHR5ISFcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlLnNldHVwKG9wdGlvbikuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v54iG55m677yI5qiZ5rqW77yJXG4gICAgZW50ZXJFeHBsb2RlOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZVwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDY0LFxuICAgICAgICAgICAgaGVpZ2h0OiA2NCxcbiAgICAgICAgICAgIGludGVydmFsOiAyLFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiAxNyxcbiAgICAgICAgICAgIHJvdGF0aW9uOiBvcHRpb24ucm90YXRpb25cbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/niIbnmbrvvIjlsI/vvIlcbiAgICBlbnRlckV4cGxvZGVTbWFsbDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImV4cGxvZGVTbWFsbFwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIGludGVydmFsOiA0LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogOCxcbiAgICAgICAgICAgIG1heEluZGV4OiAxNSxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMjU2LCB5OiAyNTYsIHdpZHRoOiAxMjgsIGhlaWdodDogMzJ9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+eIhueZuu+8iOalteWwj++8iVxuICAgIGVudGVyRXhwbG9kZVNtYWxsMjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImV4cGxvZGVTbWFsbDJcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICBpbnRlcnZhbDogNCxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogNyxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMjU2LCB5OiAyNTYsIHdpZHRoOiAxMjgsIGhlaWdodDogMzJ9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+eIhueZuu+8iOWkp++8iVxuICAgIGVudGVyRXhwbG9kZUxhcmdlOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZUxhcmdlXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogNDgsXG4gICAgICAgICAgICBoZWlnaHQ6IDQ4LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDcsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDAsIHk6IDE5Miwgd2lkdGg6IDE5MiwgaGVpZ2h0OiA5Nn0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v54iG55m677yI5Zyw5LiK77yJXG4gICAgZW50ZXJFeHBsb2RlR3JvdW5kOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZUdyb3VuZFwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICAgICAgaGVpZ2h0OiA0OCxcbiAgICAgICAgICAgIGludGVydmFsOiA0LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA3LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAyNTYsIHk6IDE5Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA0OH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgZS5pc0dyb3VuZCA9IHRydWU7XG4gICAgICAgIGUuZ3JvdW5kWCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLng7XG4gICAgICAgIGUuZ3JvdW5kWSA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLnk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+egtOeJh1xuICAgIGVudGVyRGVicmk6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICBzaXplID0gb3B0aW9uLnNpemUgfHwgMDtcbiAgICAgICAgc2l6ZSA9IE1hdGguY2xhbXAoc2l6ZSwgMCwgMyk7XG4gICAgICAgIGlmIChzaXplID09IDApIHtcbiAgICAgICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJkZWJyaVwiLFxuICAgICAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDgsXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgICAgICBtYXhJbmRleDogOCxcbiAgICAgICAgICAgICAgICB0cmltbWluZzoge3g6IDE5MiwgeTogMTI4LCB3aWR0aDogNjQsIGhlaWdodDogNDh9LFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaXplLS07XG4gICAgICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZGVicmlcIixcbiAgICAgICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleDogc2l6ZSo4LFxuICAgICAgICAgICAgICAgIG1heEluZGV4OiAoc2l6ZSsxKSo4LTEsXG4gICAgICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAzODQsIHk6IDEyOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA0OH0sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+Wwj+egtOeJh1xuICAgIGVudGVyRGVicmlTbWFsbDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImRlYnJpXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgIGhlaWdodDogOCxcbiAgICAgICAgICAgIGludGVydmFsOiAyLFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA4LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAxOTIsIHk6IDEyOCwgd2lkdGg6IDY0LCBoZWlnaHQ6IDQ4fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgrfjg6fjg4Pjg4jnnYDlvL5cbiAgICBlbnRlclNob3RJbXBhY3Q6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJzaG90SW1wYWN0XCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDcsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDI1NiwgeTogMjQwLCB3aWR0aDogMTI4LCBoZWlnaHQ6IDE2fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/mlbXlvL7mtojlpLFcbiAgICBlbnRlckJ1bGxldFZhbmlzaDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImJ1bGxldFZhbmlzaFwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIGludGVydmFsOiA0LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA3LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAwLCB5OiAzMzYsIHdpZHRoOiAxMjgsIGhlaWdodDogNDh9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+ODl+ODrOOCpOODpOODvOiiq+W8vlxuICAgIGVudGVyRXhwbG9kZVBsYXllcjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImV4cGxvZGVQbGF5ZXJcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiA0OCxcbiAgICAgICAgICAgIGhlaWdodDogNDgsXG4gICAgICAgICAgICBpbnRlcnZhbDogNCxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogNyxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMCwgeTogMjg4LCB3aWR0aDogMzg0LCBoZWlnaHQ6IDQ4fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgqLjg5Xjgr/jg7zjg5Djg7zjg4rjg7xcbiAgICBlbnRlckFmdGVyYnVybmVyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiYWZ0ZXJidXJuZXJcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJwYXJ0aWNsZVwiLFxuICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIGludGVydmFsOiAyLFxuICAgICAgICAgICAgc2VxdWVuY2U6IFswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1XSwgXG4gICAgICAgIH0pKTtcbiAgICAgICAgaWYgKGUpIGUudHdlZW5lci5jbGVhcigpLnRvKHthbHBoYTowfSwgNjAsIFwiZWFzZUluT3V0U2luZVwiKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v44K544OR44O844KvXG4gICAgZW50ZXJTcGFyazogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcInNwYXJrXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMzIsXG4gICAgICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDIsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDAsIHk6IDM4NCwgd2lkdGg6IDY0LCBoZWlnaHQ6IDMyfSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jg5zjg6BcbiAgICBlbnRlckJvbWI6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJib21iXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiYm9tYlwiLFxuICAgICAgICAgICAgd2lkdGg6IDk2LFxuICAgICAgICAgICAgaGVpZ2h0OiA5NixcbiAgICAgICAgICAgIGludGVydmFsOiAzLFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiAxNixcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgrnjg6Ljg7zjgq8o5bCP77yJXG4gICAgZW50ZXJTbW9rZVNtYWxsOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwic21va2VcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICBpbnRlcnZhbDogNSxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogNCxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMTI4LCB5OiAxMjgsIHdpZHRoOiA2NCwgaGVpZ2h0OiAxNn0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v44K544Oi44O844KvKOS4re+8iVxuICAgIGVudGVyU21va2U6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJzbW9rZVwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgaGVpZ2h0OiAyNCxcbiAgICAgICAgICAgIGludGVydmFsOiA1LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA1LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAxMjgsIHk6IDE2MCwgd2lkdGg6IDEyMCwgaGVpZ2h0OiAyNH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v44K544Oi44O844KvKOWkp++8iVxuICAgIGVudGVyU21va2VMYXJnZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcInNtb2tlXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMzIsXG4gICAgICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDUsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDgsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDI1NiwgeTogMTI4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDY0fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jg5Hjg7zjg4bjgqPjgq/jg6tcbiAgICBlbnRlclBhcnRpY2xlOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIHRyaW0gPSB7eDogMCwgeTogMCwgd2lkdGg6IDI1NiwgaGVpZ2h0OiAxNn07XG4gICAgICAgIHN3aXRjaCAob3B0aW9uLmNvbG9yKSB7XG4gICAgICAgICAgICBjYXNlICdyZWQnOlxuICAgICAgICAgICAgICAgIHRyaW0gPSB7eDogMCwgeTogMTYsIHdpZHRoOiAyNTYsIGhlaWdodDogMTZ9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ3JlZW4nOlxuICAgICAgICAgICAgICAgIHRyaW0gPSB7eDogMCwgeTogMzIsIHdpZHRoOiAyNTYsIGhlaWdodDogMTZ9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdHJpbSA9IHt4OiAwLCB5OiAwLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDE2fTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJwYXJ0aWNsZVwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcInBhcnRpY2xlXCIsXG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDE2LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHRyaW0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBFZmZlY3RVdGlsaXR5LmpzXG4gKiAgMjAxNC8wOC8wOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuRWZmZWN0LmRlZmF1bHRPcHRpb24gPSB7XG4gICAgcG9zaXRpb246IHt4OiBTQ19XKjAuNSwgeTogU0NfSCowLjV9LFxuICAgIHZlbG9jaXR5OiB7eDogMCwgeTogMCwgZGVjYXk6IDB9LFxuICAgIHJvdGF0aW9uOiAwLFxuICAgIGRlbGF5OiAwXG59O1xuXG4vL+eIhueZuuOCqOODleOCp+OCr+ODiOaKleWFpe+8iOaomea6lu+8iVxuRWZmZWN0LmVudGVyRXhwbG9kZSA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZShFZmZlY3QuZGVmYXVsdE9wdGlvbik7XG4gICAgb3B0aW9uLnJvdGF0aW9uID0gcmFuZCgwLCAzNTkpO1xuICAgIGxheWVyLmVudGVyRXhwbG9kZShvcHRpb24pO1xuXG4gICAgdmFyIHZhbCA9IHJhbmQoNSwgMTApO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsOyBpKyspIHtcbiAgICAgICAgdmFyIHJhZCA9IHJhbmQoMCwgMzU5KSAqIHRvUmFkO1xuICAgICAgICB2YXIgdiA9IHJhbmQoNSwgMTApO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgdmFyIHNpemUgPSAwO1xuICAgICAgICBpZiAoaSA+IHZhbC0yKSBzaXplID0gcmFuZCgxLCAzKTtcbiAgICAgICAgbGF5ZXIuZW50ZXJEZWJyaSh7XG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgcG9zaXRpb246IHt4OiBvcHRpb24ucG9zaXRpb24ueCwgeTogb3B0aW9uLnBvc2l0aW9uLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eDIsIHk6IHZ5MiwgZGVjYXk6MC45fSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3QsXG4gICAgICAgICAgICBkZWxheTogZGVsYXkyXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy/niIbnmbrjgqjjg5Xjgqfjgq/jg4jmipXlhaXvvIjlsI/vvIlcbkVmZmVjdC5lbnRlckV4cGxvZGVTbWFsbCA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZShFZmZlY3QuZGVmYXVsdE9wdGlvbik7XG4gICAgb3B0aW9uLnJvdGF0aW9uID0gcmFuZCgwLCAzNTkpO1xuICAgIGxheWVyLmVudGVyRXhwbG9kZShvcHRpb24pO1xuXG4gICAgdmFyIHZhbCA9IHJhbmQoMywgMTApO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsOyBpKyspIHtcbiAgICAgICAgdmFyIHJhZCA9IHJhbmQoMCwgMzU5KSAqIHRvUmFkO1xuICAgICAgICB2YXIgdiA9IHJhbmQoNSwgMTApO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgdmFyIHNpemUgPSAwO1xuICAgICAgICBpZiAoaSA+IHZhbC0yKSBzaXplID0gcmFuZCgxLCAzKTtcbiAgICAgICAgbGF5ZXIuZW50ZXJEZWJyaSh7XG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgcG9zaXRpb246IHt4OiBvcHRpb24ucG9zaXRpb24ueCwgeTogb3B0aW9uLnBvc2l0aW9uLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eDIsIHk6IHZ5MiwgZGVjYXk6MC45fSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3QsXG4gICAgICAgICAgICBkZWxheTogZGVsYXkyXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy/niIbnmbrjgqjjg5Xjgqfjgq/jg4jmipXlhaXvvIjlpKfvvIlcbkVmZmVjdC5lbnRlckV4cGxvZGVMYXJnZSA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZShFZmZlY3QuZGVmYXVsdE9wdGlvbik7XG4gICAgb3B0aW9uLnJvdGF0aW9uID0gcmFuZCgwLCAzNTkpO1xuICAgIGxheWVyLmVudGVyRXhwbG9kZUxhcmdlKG9wdGlvbik7XG5cbiAgICB2YXIgdmFsID0gcmFuZCgxMCwgMjApO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsOyBpKyspIHtcbiAgICAgICAgdmFyIHJhZCA9IHJhbmQoMCwgMzU5KSAqIHRvUmFkO1xuICAgICAgICB2YXIgdiA9IHJhbmQoNSwgMTApO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgdmFyIHNpemUgPSByYW5kKDAsIDMpO1xuICAgICAgICBsYXllci5lbnRlckRlYnJpKHtcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBwb3NpdGlvbjoge3g6IG9wdGlvbi5wb3NpdGlvbi54LCB5OiBvcHRpb24ucG9zaXRpb24ueX0sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4MiwgeTogdnkyLCBkZWNheTowLjl9LFxuICAgICAgICAgICAgcm90YXRpb246IHJvdCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheTJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL+eIhueZuuOCqOODleOCp+OCr+ODiOaKleWFpe+8iOWcsOS4iu+8iVxuRWZmZWN0LmVudGVyRXhwbG9kZUdyb3VuZCA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZShFZmZlY3QuZGVmYXVsdE9wdGlvbik7XG4gICAgb3B0aW9uLnJvdGF0aW9uID0gMDtcbiAgICBsYXllci5lbnRlckV4cGxvZGVHcm91bmQob3B0aW9uKTtcblxuICAgIHZhciB2YWwgPSByYW5kKDUsIDEwKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbDsgaSsrKSB7XG4gICAgICAgIHZhciByYWQgPSByYW5kKDAsIDM1OSkgKiB0b1JhZDtcbiAgICAgICAgdmFyIHYgPSByYW5kKDUsIDEwKTtcbiAgICAgICAgdmFyIHZ4MiA9IE1hdGguY29zKHJhZCkgKiB2O1xuICAgICAgICB2YXIgdnkyID0gTWF0aC5zaW4ocmFkKSAqIHY7XG4gICAgICAgIHZhciByb3QgPSByYW5kKDAsIDM1OSk7XG4gICAgICAgIHZhciBkZWxheTIgPSBvcHRpb24uZGVsYXkrcmFuZCgwLCAxMCk7XG4gICAgICAgIHZhciBzaXplID0gcmFuZCgwLCAzKTtcbiAgICAgICAgbGF5ZXIuZW50ZXJEZWJyaSh7XG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgcG9zaXRpb246IHt4OiBvcHRpb24ucG9zaXRpb24ueCwgeTogb3B0aW9uLnBvc2l0aW9uLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eDIsIHk6IHZ5MiwgZGVjYXk6MC45fSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3QsXG4gICAgICAgICAgICBkZWxheTogZGVsYXkyXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy/noLTniYfmipXlhaVcbkVmZmVjdC5lbnRlckRlYnJpcyA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZShFZmZlY3QuZGVmYXVsdE9wdGlvbik7XG4gICAgbnVtID0gb3B0aW9uLm51bSB8fCA1O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgdmFyIHJhZCA9IHJhbmQoMCwgMzU5KSAqIHRvUmFkO1xuICAgICAgICB2YXIgdiA9IHJhbmQoNSwgMTApO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgbGF5ZXIuZW50ZXJEZWJyaSh7XG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICAgICAgcG9zaXRpb246IHt4OiBvcHRpb24ucG9zaXRpb24ueCwgeTogb3B0aW9uLnBvc2l0aW9uLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eDIsIHk6IHZ5MiwgZGVjYXk6MC45fSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3QsXG4gICAgICAgICAgICBkZWxheTogZGVsYXkyXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy/lsI/noLTniYfmipXlhaVcbkVmZmVjdC5lbnRlckRlYnJpc1NtYWxsID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBudW0gPSBvcHRpb24ubnVtIHx8IDU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICB2YXIgcmFkID0gcmFuZCgwLCAzNTkpICogdG9SYWQ7XG4gICAgICAgIHZhciB2ID0gcmFuZCgzLCA1KTtcbiAgICAgICAgdmFyIHZ4MiA9IE1hdGguY29zKHJhZCkgKiB2O1xuICAgICAgICB2YXIgdnkyID0gTWF0aC5zaW4ocmFkKSAqIHY7XG4gICAgICAgIHZhciByb3QgPSByYW5kKDAsIDM1OSk7XG4gICAgICAgIHZhciBkZWxheTIgPSBvcHRpb24uZGVsYXkrcmFuZCgwLCAxMCk7XG4gICAgICAgIGxheWVyLmVudGVyRGVicmkoe1xuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogb3B0aW9uLnBvc2l0aW9uLngsIHk6IG9wdGlvbi5wb3NpdGlvbi55fSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngyLCB5OiB2eTIsIGRlY2F5OjAuOX0sXG4gICAgICAgICAgICByb3RhdGlvbjogcm90LFxuICAgICAgICAgICAgZGVsYXk6IGRlbGF5MlxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8v44Oc44Og44Ko44OV44Kn44Kv44OI5oqV5YWlXG5FZmZlY3QuZW50ZXJCb21iID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcblxuICAgIHZhciB4ID0gb3B0aW9uLnBvc2l0aW9uLng7XG4gICAgdmFyIHkgPSBvcHRpb24ucG9zaXRpb24ueTtcbiAgICBsYXllci5lbnRlckJvbWIoe1xuICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IDAsIGRlY2F5OiAxfSxcbiAgICAgICAgc2NhbGU6IHt4OiAzLjAsIHk6IDMuMH0sXG4gICAgfSk7XG4gICAgbGF5ZXIuZW50ZXJCb21iKHtcbiAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiAwLCBkZWNheTogMX0sXG4gICAgICAgIHNjYWxlOiB7eDogMy4wLCB5OiAzLjB9LFxuICAgICAgICBkZWxheTogNDAsXG4gICAgfSk7XG5cdHZhciByYWQgPSAwO1xuXHRmb3IoIHZhciBpID0gMDsgaSA8IDQwOyBpKysgKXtcblx0XHR2YXIgcmFkMiA9IHJhZDtcblx0XHR2YXIgciA9IDc7XG5cdFx0dmFyIGJ4ID0gTWF0aC5zaW4ocmFkMikqaSpyO1xuXHRcdHZhciBieSA9IE1hdGguY29zKHJhZDIpKmkqcjtcblx0XHR2YXIgZGVsYXkgPSAyKmk7XG4gICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGVTbWFsbChsYXllciwge3Bvc2l0aW9uOiB7eDogeCtieCwgeTogeStieX0sIGRlbGF5OiBkZWxheX0pO1xuXHRcdHJhZDIrPTEuNTc7XG5cdFx0YnggPSBNYXRoLnNpbihyYWQyKSppKnI7XG5cdFx0YnkgPSBNYXRoLmNvcyhyYWQyKSppKnI7XG4gICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGVTbWFsbChsYXllciwge3Bvc2l0aW9uOiB7eDogeCtieCwgeTogeStieX0sIGRlbGF5OiBkZWxheX0pO1xuXHRcdHJhZDIrPTEuNTc7XG5cdFx0YnggPSBNYXRoLnNpbihyYWQyKSppKnI7XG5cdFx0YnkgPSBNYXRoLmNvcyhyYWQyKSppKnI7XG4gICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGVTbWFsbChsYXllciwge3Bvc2l0aW9uOiB7eDogeCtieCwgeTogeStieX0sIGRlbGF5OiBkZWxheX0pO1xuXHRcdHJhZDIrPTEuNTc7XG5cdFx0YnggPSBNYXRoLnNpbihyYWQyKSppKnI7XG5cdFx0YnkgPSBNYXRoLmNvcyhyYWQyKSppKnI7XG4gICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGVTbWFsbChsYXllciwge3Bvc2l0aW9uOiB7eDogeCtieCwgeTogeStieX0sIGRlbGF5OiBkZWxheX0pO1xuXHRcdHJhZCs9MC4zO1xuXHR9XG59XG5cbiIsIi8qXG4gKiAgcGF0dGljbGUuanNcbiAqICAyMDE2LzA0LzE5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG52YXIgUEFSVElDTEVfVkVMT0NJVFlfUkFOR0VfWCA9IDg7ICAgIC8vIOmAn+W6puOBruWIneacn+WApOOBruevhOWbsiB4XG52YXIgUEFSVElDTEVfVkVMT0NJVFlfUkFOR0VfWSA9IDY7ICAgIC8vIOmAn+W6puOBruWIneacn+WApOOBruevhOWbsiB5XG52YXIgUEFSVElDTEVfQUNDRUxFUkFUSU9OX1kgICA9IC0wLjU7IC8vIOWKoOmAn+W6piB5XG52YXIgUEFSVElDTEVfU0NBTEUgICAgICAgICAgICA9IDE7ICAgIC8vIOWIneacn+OCueOCseODvOODq1xudmFyIFBBUlRJQ0xFX1NDQUxFX0RPV05fU1BFRUQgPSAwLjAyNTsvLyDjgrnjgrHjg7zjg6vjg4Djgqbjg7Pjga7jgrnjg5Tjg7zjg4lcblxucGhpbmEuZGVmaW5lKFwiRWZmZWN0LlBhcnRpY2xlXCIsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5DaXJjbGVTaGFwZScsXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICAgIGRlZmF1bHRDb2xvcjoge1xuICAgICAgICAgICAgc3RhcnQ6IDEwLCAvLyBjb2xvciBhbmdsZSDjga7plovlp4vlgKRcbiAgICAgICAgICAgIGVuZDogMzAsICAgLy8gY29sb3IgYW5nbGUg44Gu57WC5LqG5YCkXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgcmFkaXVzOiA2NCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ibGVuZE1vZGUgPSAnbGlnaHRlcic7XG5cbiAgICAgICAgdmFyIGNvbG9yID0gb3B0aW9uLmNvbG9yIHx8IEVmZmVjdC5QYXJ0aWNsZS5kZWZhdWx0Q29sb3I7XG4gICAgICAgIHZhciBncmFkID0gdGhpcy5jYW52YXMuY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCgwLCAwLCAwLCAwLCAwLCB0aGlzLnJhZGl1cyk7XG4gICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsICdoc2xhKHswfSwgNzUlLCA1MCUsIDEuMCknLmZvcm1hdChNYXRoLnJhbmRpbnQoY29sb3Iuc3RhcnQsIGNvbG9yLmVuZCkpKTtcbiAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgJ2hzbGEoezB9LCA3NSUsIDUwJSwgMC4wKScuZm9ybWF0KE1hdGgucmFuZGludChjb2xvci5zdGFydCwgY29sb3IuZW5kKSkpO1xuXG4gICAgICAgIHRoaXMuZmlsbCA9IGdyYWQ7XG4gICAgXG4gICAgICAgIHRoaXMuYmVnaW5Qb3NpdGlvbiA9IFZlY3RvcjIoKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IFZlY3RvcjIoKTtcbiAgICAgICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICB9LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdGhpcy5iZWdpblBvc2l0aW9uLnNldCh4LCB5KTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQodGhpcy5iZWdpblBvc2l0aW9uLngsIHRoaXMuYmVnaW5Qb3NpdGlvbi55KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXQoXG4gICAgICAgICAgICBNYXRoLnJhbmRpbnQoLVBBUlRJQ0xFX1ZFTE9DSVRZX1JBTkdFX1gsIFBBUlRJQ0xFX1ZFTE9DSVRZX1JBTkdFX1gpLFxuICAgICAgICAgICAgTWF0aC5yYW5kaW50KC1QQVJUSUNMRV9WRUxPQ0lUWV9SQU5HRV9ZLCBQQVJUSUNMRV9WRUxPQ0lUWV9SQU5HRV9ZKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnNjYWxlWCA9IHRoaXMuc2NhbGVZID0gTWF0aC5yYW5kZmxvYXQoUEFSVElDTEVfU0NBTEUqMC44LCBQQVJUSUNMRV9TQ0FMRSoxLjIpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS54ICs9ICh0aGlzLmJlZ2luUG9zaXRpb24ueC10aGlzLngpLyh0aGlzLnJhZGl1cy8yKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS55ICs9IFBBUlRJQ0xFX0FDQ0VMRVJBVElPTl9ZO1xuICAgICAgICB0aGlzLnNjYWxlWCAtPSBQQVJUSUNMRV9TQ0FMRV9ET1dOX1NQRUVEO1xuICAgICAgICB0aGlzLnNjYWxlWSAtPSBQQVJUSUNMRV9TQ0FMRV9ET1dOX1NQRUVEO1xuXG4gICAgICAgIGlmICh0aGlzLnNjYWxlWCA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZmxhcmUoJ2Rpc2FwcGVhcicpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBkYW5tYWt1LmpzXG4gKiAgMjAxNS8xMC8xMVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuY29uc3QgZGFubWFrdSA9IHt9O1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbnZhciBhY3Rpb24gPSBidWxsZXRtbC5kc2wuYWN0aW9uO1xudmFyIGFjdGlvblJlZiA9IGJ1bGxldG1sLmRzbC5hY3Rpb25SZWY7XG52YXIgYnVsbGV0ID0gYnVsbGV0bWwuZHNsLmJ1bGxldDtcbnZhciBidWxsZXRSZWYgPSBidWxsZXRtbC5kc2wuYnVsbGV0UmVmO1xudmFyIGZpcmUgPSBidWxsZXRtbC5kc2wuZmlyZTtcbnZhciBmaXJlUmVmID0gYnVsbGV0bWwuZHNsLmZpcmVSZWY7XG52YXIgY2hhbmdlRGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmNoYW5nZURpcmVjdGlvbjtcbnZhciBjaGFuZ2VTcGVlZCA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VTcGVlZDtcbnZhciBhY2NlbCA9IGJ1bGxldG1sLmRzbC5hY2NlbDtcbnZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG52YXIgdmFuaXNoID0gYnVsbGV0bWwuZHNsLnZhbmlzaDtcbnZhciByZXBlYXQgPSBidWxsZXRtbC5kc2wucmVwZWF0O1xudmFyIGJpbmRWYXIgPSBidWxsZXRtbC5kc2wuYmluZFZhcjtcbnZhciBub3RpZnkgPSBidWxsZXRtbC5kc2wubm90aWZ5O1xudmFyIGRpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5kaXJlY3Rpb247XG52YXIgc3BlZWQgPSBidWxsZXRtbC5kc2wuc3BlZWQ7XG52YXIgaG9yaXpvbnRhbCA9IGJ1bGxldG1sLmRzbC5ob3Jpem9udGFsO1xudmFyIHZlcnRpY2FsID0gYnVsbGV0bWwuZHNsLnZlcnRpY2FsO1xudmFyIGZpcmVPcHRpb24gPSBidWxsZXRtbC5kc2wuZmlyZU9wdGlvbjtcbnZhciBvZmZzZXRYID0gYnVsbGV0bWwuZHNsLm9mZnNldFg7XG52YXIgb2Zmc2V0WSA9IGJ1bGxldG1sLmRzbC5vZmZzZXRZO1xudmFyIGF1dG9ub215ID0gYnVsbGV0bWwuZHNsLmF1dG9ub215O1xuXG52YXIgaW50ZXJ2YWwgPSBidWxsZXRtbC5kc2wuaW50ZXJ2YWw7XG52YXIgc3BkID0gYnVsbGV0bWwuZHNsLnNwZDtcbnZhciBzcGRTZXEgPSBidWxsZXRtbC5kc2wuc3BkU2VxO1xuXG4vL+W8vueorlxudmFyIFJTICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xudmFyIFJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuOH0pO1xudmFyIFJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xudmFyIFJFUyA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBCUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG52YXIgQk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuOH0pO1xudmFyIEJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcbnZhciBCRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBUSElOID0gYnVsbGV0KHsgdHlwZTogXCJUSElOXCIgfSk7XG5cbnZhciBETSAgPSBidWxsZXQoeyBkdW1teTogdHJ1ZSB9KTtcblxuLy/mlLvmkoPjg5jjg6rjgIzjg5vjg7zjg43jg4Pjg4jjgI1cbmRhbm1ha3UuSG9ybmV0MSA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbigwKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5pS75pKD44OY44Oq44CM44Ob44O844ON44OD44OI44CNXG5kYW5tYWt1Lkhvcm5ldDIgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpLCBkaXJlY3Rpb24oMCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL+aUu+aSg+ODmOODquOAjOODm+ODvOODjeODg+ODiOOAjVxuZGFubWFrdS5Ib3JuZXQzID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBub3RpZnkoJ21pc3NpbGUnKSxcbiAgICAgICAgICAgIGludGVydmFsKDI0MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5Lit5Z6L5pS75pKD44OY44OqIE11ZERhdWJlclxuZGFubWFrdS5NdWREYXViZXIgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC42KSwgZGlyZWN0aW9uKDApLCBvZmZzZXRZKDMwKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAzXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFRISU4sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoMzApKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDE6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNSksIGRpcmVjdGlvbigxODAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoLTMyKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAzXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbiggMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigyMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigyMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtNDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDE1KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTYwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMjogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDE0MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgzMikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgM1wiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigyMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgzMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oLTQwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxNSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE2MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5Lit5Z6L54iG5pKD5qmf44CM44OT44OD44Kw44Km44Kj44Oz44Kw44CNXG5kYW5tYWt1LkJpZ1dpbmcgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIHJlcGVhdCg0LCBbXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCAgZGlyZWN0aW9uKDIwMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAgMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAyMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAyMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCAgZGlyZWN0aW9uKDE2MCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAgMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgzMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oLTIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtMjAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICByZXBlYXQoMywgW1xuICAgICAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgIGRpcmVjdGlvbigyMDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKEJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxODAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoIDE2KSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKEJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxODAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoLTE2KSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDIwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL+mjm+epuuiJh+OAjOOCueOCq+OCpOODluODrOODvOODieOAjVxuZGFubWFrdS5Ta3lCbGFkZSA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNyksIGRpcmVjdGlvbigwKSwgb2Zmc2V0WSgtMzIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKC0yMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDkwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuXG4vL+S4reWei+aIpui7iuOAjOODleODqeOCrOODqeODg+ODj+OAjVxuZGFubWFrdS5GcmFnYXJhY2ggPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShSUywgc3BkKDAuNSksIGRpcmVjdGlvbigwKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3RcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwLjE1KSwgZGlyZWN0aW9uKC01LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMC4xNSksIGRpcmVjdGlvbigxMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5rWu6YGK56Cy5Y+w44CM44OW44Oq44Ol44OK44O844Kv44CN77yI6Kit572u77yR77yJXG5kYW5tYWt1LkJyaW9uYWMxXzEgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgyKSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMlwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDAuMTUpLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAxLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtMiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMiksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDAuMTUpLCBkaXJlY3Rpb24oIDMsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCA1LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtNywgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMiksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5rWu6YGK56Cy5Y+w44CM44OW44Oq44Ol44OK44O844Kv44CN77yI6Kit572u77yS77yJXG5kYW5tYWt1LkJyaW9uYWMxXzIgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgxKSwgZGlyZWN0aW9uKDApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDJcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDUsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDUsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKC0xMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5rWu6YGK56Cy5Y+w44CM44OW44Oq44Ol44OK44O844Kv44CN77yI6Kit572u77yT77yJXG5kYW5tYWt1LkJyaW9uYWMxXzMgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoMzAsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTIsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCgxKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMjogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpLCBkaXJlY3Rpb24oOTAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDMwLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEyLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwoMSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDM6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC44KSwgZGlyZWN0aW9uKDE4MCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoMzAsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTIsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCgxKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMzogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpLCBkaXJlY3Rpb24oMjcwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCgzMCwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxMiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsKDEpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL+S4reWei+i8uOmAgeapn+OAjOODiOOCpOODnOODg+OCr+OCueOAjVxuZGFubWFrdS5Ub3lCb3ggPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgxKSwgZGlyZWN0aW9uKDApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkKDEpLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkKDEpLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkKDEpLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG59KTtcblxuIiwiLypcbiAqICBkYW5tYWt1QmFzaWMuanNcbiAqICAyMDE2LzA0LzExXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbnZhciBhY3Rpb24gPSBidWxsZXRtbC5kc2wuYWN0aW9uO1xudmFyIGFjdGlvblJlZiA9IGJ1bGxldG1sLmRzbC5hY3Rpb25SZWY7XG52YXIgYnVsbGV0ID0gYnVsbGV0bWwuZHNsLmJ1bGxldDtcbnZhciBidWxsZXRSZWYgPSBidWxsZXRtbC5kc2wuYnVsbGV0UmVmO1xudmFyIGZpcmUgPSBidWxsZXRtbC5kc2wuZmlyZTtcbnZhciBmaXJlUmVmID0gYnVsbGV0bWwuZHNsLmZpcmVSZWY7XG52YXIgY2hhbmdlRGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmNoYW5nZURpcmVjdGlvbjtcbnZhciBjaGFuZ2VTcGVlZCA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VTcGVlZDtcbnZhciBhY2NlbCA9IGJ1bGxldG1sLmRzbC5hY2NlbDtcbnZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG52YXIgdmFuaXNoID0gYnVsbGV0bWwuZHNsLnZhbmlzaDtcbnZhciByZXBlYXQgPSBidWxsZXRtbC5kc2wucmVwZWF0O1xudmFyIGJpbmRWYXIgPSBidWxsZXRtbC5kc2wuYmluZFZhcjtcbnZhciBub3RpZnkgPSBidWxsZXRtbC5kc2wubm90aWZ5O1xudmFyIGRpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5kaXJlY3Rpb247XG52YXIgc3BlZWQgPSBidWxsZXRtbC5kc2wuc3BlZWQ7XG52YXIgaG9yaXpvbnRhbCA9IGJ1bGxldG1sLmRzbC5ob3Jpem9udGFsO1xudmFyIHZlcnRpY2FsID0gYnVsbGV0bWwuZHNsLnZlcnRpY2FsO1xudmFyIGZpcmVPcHRpb24gPSBidWxsZXRtbC5kc2wuZmlyZU9wdGlvbjtcbnZhciBvZmZzZXRYID0gYnVsbGV0bWwuZHNsLm9mZnNldFg7XG52YXIgb2Zmc2V0WSA9IGJ1bGxldG1sLmRzbC5vZmZzZXRZO1xudmFyIGF1dG9ub215ID0gYnVsbGV0bWwuZHNsLmF1dG9ub215O1xuXG52YXIgaW50ZXJ2YWwgPSBidWxsZXRtbC5kc2wuaW50ZXJ2YWw7XG52YXIgc3BkID0gYnVsbGV0bWwuZHNsLnNwZDtcbnZhciBzcGRTZXEgPSBidWxsZXRtbC5kc2wuc3BkU2VxO1xuXG4vL++/vWXvv73vv71cbnZhciBSUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSTSAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjh9KTtcbnZhciBSTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcbnZhciBSRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG52YXIgUkVNID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgQlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjh9KTtcbnZhciBCTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG52YXIgQkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjZ9KTtcbnZhciBCRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgVEhJTiA9IGJ1bGxldCh7IHR5cGU6IFwiVEhJTlwiIH0pO1xuXG52YXIgRE0gID0gYnVsbGV0KHsgZHVtbXk6IHRydWUgfSk7XG5cbi8v77+977+977+9QO+/vV/vv73vv73vv71lXG52YXIgYmFzaWMgPSBmdW5jdGlvbihzLCBkaXIpIHtcbiAgcmV0dXJuIG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3A6IGFjdGlvbihbXG4gICAgICBpbnRlcnZhbCg2MCksXG4gICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgZmlyZShETSwgc3BkKHMpLCBkaXJlY3Rpb24oZGlyKSksXG4gICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwLjE1KSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICBdKSxcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgXSksXG4gICAgXSksXG4gIH0pO1xufTtcbmRhbm1ha3UuYmFzaWMgPSBiYXNpYygxLCAwKTtcbmRhbm1ha3UuYmFzaWNSMSA9IGJhc2ljKDEsIC01KTtcbmRhbm1ha3UuYmFzaWNMMSA9IGJhc2ljKDEsICs1KTtcbmRhbm1ha3UuYmFzaWNSMiA9IGJhc2ljKDEsIC0xNSk7XG5kYW5tYWt1LmJhc2ljTDIgPSBiYXNpYygxLCArMTUpO1xuZGFubWFrdS5iYXNpY0YgPSBiYXNpYygxLjIsIDApO1xuZGFubWFrdS5iYXNpY0ZSMSA9IGJhc2ljKDEuMiwgLTUpO1xuZGFubWFrdS5iYXNpY0ZMMSA9IGJhc2ljKDEuMiwgKzUpO1xuZGFubWFrdS5iYXNpY0ZSMiA9IGJhc2ljKDEuMiwgLTE1KTtcbmRhbm1ha3UuYmFzaWNGTDIgPSBiYXNpYygxLjIsICsxNSk7XG5cbi8vTi1XYXko77+977+977+9QO+/vV/vv73vv70pXG52YXIgYmFzaWNOd2F5ID0gZnVuY3Rpb24obiwgZGlyLCBzKSB7XG4gICAgdmFyIHJuID0gKG4tMSkvMjtcbiAgICByZXR1cm4gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgICAgICB0b3A6IGFjdGlvbihbXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGQocyksIGRpcmVjdGlvbigtZGlyKnJuKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICByZXBlYXQobi0xLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbihkaXIsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oLWRpcipuLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgfSk7XG59O1xuZGFubWFrdS5iYXNpYzN3YXkgPSBiYXNpY053YXkoMywgMTAsIDAuNyk7XG5kYW5tYWt1LmJhc2ljNHdheSA9IGJhc2ljTndheSg0LCAxMCwgMC43KTtcbmRhbm1ha3UuYmFzaWM1d2F5ID0gYmFzaWNOd2F5KDUsIDEwLCAwLjcpO1xuZGFubWFrdS5iYXNpYzZ3YXkgPSBiYXNpY053YXkoNiwgMTAsIDAuNyk7XG5kYW5tYWt1LmJhc2ljN3dheSA9IGJhc2ljTndheSg3LCAxMCwgMC43KTtcblxuLy/vv73Cj++/vWVcbnZhciBiYXNpY053YXlDaXJjbGUgPSBmdW5jdGlvbihuLCBzKSB7XG4gICAgdmFyIGRpciA9IH5+KDM2MC9uKTtcbiAgICB2YXIgcm4gPSAobi0xKS8yO1xuICAgIHJldHVybiBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgICAgIHRvcDogYWN0aW9uKFtcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZChzKSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0KG4tMSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oZGlyLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKC1kaXIqbiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pLFxuICAgIH0pO1xufTtcbmRhbm1ha3UuYmFzaWM4d2F5Q2lyY2xlID0gYmFzaWNOd2F5Q2lyY2xlKDgsIDAuNyk7XG5kYW5tYWt1LmJhc2ljMTZ3YXlDaXJjbGUgPSBiYXNpY053YXlDaXJjbGUoMTYsIDAuNyk7XG5cbn0pO1xuXG4iLCIvKlxuICogIGRhbm1ha3VCb3NzXzEuanNcbiAqICAyMDE1LzEwLzExXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbi8v44K344On44O844OI44OP44Oz44OJXG52YXIgYWN0aW9uID0gYnVsbGV0bWwuZHNsLmFjdGlvbjtcbnZhciBhY3Rpb25SZWYgPSBidWxsZXRtbC5kc2wuYWN0aW9uUmVmO1xudmFyIGJ1bGxldCA9IGJ1bGxldG1sLmRzbC5idWxsZXQ7XG52YXIgYnVsbGV0UmVmID0gYnVsbGV0bWwuZHNsLmJ1bGxldFJlZjtcbnZhciBmaXJlID0gYnVsbGV0bWwuZHNsLmZpcmU7XG52YXIgZmlyZVJlZiA9IGJ1bGxldG1sLmRzbC5maXJlUmVmO1xudmFyIGNoYW5nZURpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VEaXJlY3Rpb247XG52YXIgY2hhbmdlU3BlZWQgPSBidWxsZXRtbC5kc2wuY2hhbmdlU3BlZWQ7XG52YXIgYWNjZWwgPSBidWxsZXRtbC5kc2wuYWNjZWw7XG52YXIgd2FpdCA9IGJ1bGxldG1sLmRzbC53YWl0O1xudmFyIHZhbmlzaCA9IGJ1bGxldG1sLmRzbC52YW5pc2g7XG52YXIgcmVwZWF0ID0gYnVsbGV0bWwuZHNsLnJlcGVhdDtcbnZhciBiaW5kVmFyID0gYnVsbGV0bWwuZHNsLmJpbmRWYXI7XG52YXIgbm90aWZ5ID0gYnVsbGV0bWwuZHNsLm5vdGlmeTtcbnZhciBkaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuZGlyZWN0aW9uO1xudmFyIHNwZWVkID0gYnVsbGV0bWwuZHNsLnNwZWVkO1xudmFyIGhvcml6b250YWwgPSBidWxsZXRtbC5kc2wuaG9yaXpvbnRhbDtcbnZhciB2ZXJ0aWNhbCA9IGJ1bGxldG1sLmRzbC52ZXJ0aWNhbDtcbnZhciBmaXJlT3B0aW9uID0gYnVsbGV0bWwuZHNsLmZpcmVPcHRpb247XG52YXIgb2Zmc2V0WCA9IGJ1bGxldG1sLmRzbC5vZmZzZXRYO1xudmFyIG9mZnNldFkgPSBidWxsZXRtbC5kc2wub2Zmc2V0WTtcbnZhciBhdXRvbm9teSA9IGJ1bGxldG1sLmRzbC5hdXRvbm9teTtcblxuLy/jg57jgq/jg61cbnZhciBpbnRlcnZhbCA9IGJ1bGxldG1sLmRzbC5pbnRlcnZhbDtcbnZhciBzcGQgPSBidWxsZXRtbC5kc2wuc3BkO1xudmFyIHNwZFNlcSA9IGJ1bGxldG1sLmRzbC5zcGRTZXE7XG52YXIgZmlyZUFpbTAgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTA7XG52YXIgZmlyZUFpbTEgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTE7XG52YXIgZmlyZUFpbTIgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTI7XG52YXIgbndheSA9IGJ1bGxldG1sLmRzbC5ud2F5O1xudmFyIG53YXlWcyA9IGJ1bGxldG1sLmRzbC5ud2F5VnM7XG52YXIgYWJzb2x1dGVOd2F5ID0gYnVsbGV0bWwuZHNsLmFic29sdXRlTndheTtcbnZhciBhYnNvbHV0ZU53YXlWcyA9IGJ1bGxldG1sLmRzbC5hYnNvbHV0ZU53YXlWcztcbnZhciBjaXJjbGUgPSBidWxsZXRtbC5kc2wuY2lyY2xlO1xudmFyIGFic29sdXRlQ2lyY2xlID0gYnVsbGV0bWwuZHNsLmFic29sdXRlQ2lyY2xlO1xudmFyIHdoaXAgPSBidWxsZXRtbC5kc2wud2hpcDtcblxuLy/lvL7nqK5cbnZhciBSUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSTSAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjh9KTtcbnZhciBSTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcbnZhciBSRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG52YXIgUkVNID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgQlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjh9KTtcbnZhciBCTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG52YXIgQkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjZ9KTtcbnZhciBCRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgVEhJTiA9IGJ1bGxldCh7IHR5cGU6IFwiVEhJTlwiIH0pO1xuXG52YXIgRE0gPSBidWxsZXQoeyBkdW1teTogdHJ1ZSB9KTtcblxuLy/vvJHpnaLkuK3jg5zjgrlcbmRhbm1ha3UuVGhvckhhbW1lciA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMjAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoLTMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC0zMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMzQwLCBcImFic29sdXRlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDMwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgyMCksXG5cbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oNDAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoLTMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg2LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC0zMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMzIwLCBcImFic29sdXRlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg2LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDMwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v77yR6Z2i5Lit44Oc44K577yI56Cy5Y+w77yJXG5kYW5tYWt1LlRob3JIYW1tZXJUdXJyZXQgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoMzApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgxKSwgZGlyZWN0aW9uKC0xNSkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMlwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShCRU0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDApKSxcbiAgICAgICAgICAgICAgICBmaXJlKEJFTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTUsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoQkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxNSwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgwKSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oLTMwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjg5Hjgr/jg7zjg7PvvJHvvIlcbmRhbm1ha3UuR29seWF0MV8xID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIHdhaXQoMzApLFxuICAgICAgICByZXBlYXQoNSwgW1xuICAgICAgICAgICAgbm90aWZ5KFwic3RhcnRcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFkoLTgpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC04KSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDMwLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQkVNLCBzcGRTZXEoMC4wMSksIGRpcmVjdGlvbigxMiwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WSgtOCkpLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCgxKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4wNSksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC04KSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgICAgICBub3RpZnkoXCJlbmRcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICAgICAgbm90aWZ5KFwiZmluaXNoXCIpLFxuICAgIF0pLFxufSk7XG5cbi8v77yR6Z2i44Oc44K577yI44OR44K/44O844Oz77yS77yJXG5kYW5tYWt1LkdvbHlhdDFfMiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgd2FpdCgzMCksXG4gICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC40KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgNVwiLCBbXG4gICAgICAgICAgICAgICAgcmVwZWF0KDEwLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigzOCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE1MCksXG4gICAgICAgIF0pLFxuICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIG5vdGlmeShcImVuZFwiKSxcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjg5Hjgr/jg7zjg7PvvJPvvIlcbmRhbm1ha3UuR29seWF0MV8zID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDMwKSxcblxuICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIG5vdGlmeShcImVuZFwiKSxcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjnmbrni4Ljg5Hjgr/jg7zjg7PvvIlcbmRhbm1ha3UuR29seWF0MiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgd2FpdCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgcmVwZWF0KDMsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFRISU4sIHNwZCgwLjYpLCBkaXJlY3Rpb24oMCkpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCgzLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkU2VxKDAuMSksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKFRISU4sIHNwZFNlcSgwLjEpLCBkaXJlY3Rpb24oLTIwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoNCwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKFRISU4sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuXG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgd2FpdCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgaW50ZXJ2YWwoMzApLFxuICAgICAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDVcIiwgW1xuICAgICAgICAgICAgICAgICAgICByZXBlYXQoMTAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUoUkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigzNiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4wNSksIGRpcmVjdGlvbigwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v77yR6Z2i44Oc44K577yI44Ki44O844Og56Cy5Y+w44OR44K/44O844Oz77yR77yJXG5kYW5tYWt1LkdvbHlhdEFybTEgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBub3RpZnkoXCJzdGFydDFcIiksXG4gICAgICAgICAgICB3YWl0KDMwKSxcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgxLjApLCBkaXJlY3Rpb24oLTEwKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgtNDApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDNcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKC00MCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKC00MCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKC00MCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjEpLCBkaXJlY3Rpb24oLTIwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG5vdGlmeShcImVuZDFcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MlwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbigtNSksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDNcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDIwKSksXG4gICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4xKSwgZGlyZWN0aW9uKC0xMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBub3RpZnkoXCJlbmQyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjgqLjg7zjg6DnoLLlj7Djg5Hjgr/jg7zjg7PvvJLvvIlcbmRhbm1ha3UuR29seWF0QXJtMiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MlwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEuMCksIGRpcmVjdGlvbigxODAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgIHJlcGVhdCgxMCwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDIwKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTUpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBub3RpZnkoXCJlbmQyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMjogYWN0aW9uKFtcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBub3RpZnkoXCJzdGFydDJcIiksXG4gICAgICAgICAgICB3YWl0KDMwKSxcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgxLjApLCBkaXJlY3Rpb24oMTgwLCBcImFic29sdXRlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDIwKSksXG4gICAgICAgICAgICByZXBlYXQoMTAsIFtcbiAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbiggMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgyMCkpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDE1KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICAgICAgbm90aWZ5KFwiZW5kMlwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v77yR6Z2i44Oc44K577yI44Ki44O844Og56Cy5Y+w44OR44K/44O844Oz77yT77yJXG5kYW5tYWt1LkdvbHlhdEFybTMgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBub3RpZnkoXCJzdGFydDFcIiksXG4gICAgICAgICAgICB3YWl0KDMwKSxcbiAgICAgICAgICAgIG5vdGlmeShcIm1pc3NpbGUxXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICAgICAgbm90aWZ5KFwibWlzc2lsZTFcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBub3RpZnkoXCJtaXNzaWxlMVwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgICAgIG5vdGlmeShcImVuZDFcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgxODApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MlwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgbm90aWZ5KFwibWlzc2lsZTJcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBub3RpZnkoXCJtaXNzaWxlMlwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIG5vdGlmeShcIm1pc3NpbGUyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMzApLFxuICAgICAgICAgICAgbm90aWZ5KFwiZW5kMlwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDE4MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbn0pO1xuXG4iLCIvKlxuICogIGRhbm1ha3VCb3NzXzIuanNcbiAqICAyMDE1LzEwLzExXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbi8v44K344On44O844OI44OP44Oz44OJXG52YXIgYWN0aW9uID0gYnVsbGV0bWwuZHNsLmFjdGlvbjtcbnZhciBhY3Rpb25SZWYgPSBidWxsZXRtbC5kc2wuYWN0aW9uUmVmO1xudmFyIGJ1bGxldCA9IGJ1bGxldG1sLmRzbC5idWxsZXQ7XG52YXIgYnVsbGV0UmVmID0gYnVsbGV0bWwuZHNsLmJ1bGxldFJlZjtcbnZhciBmaXJlID0gYnVsbGV0bWwuZHNsLmZpcmU7XG52YXIgZmlyZVJlZiA9IGJ1bGxldG1sLmRzbC5maXJlUmVmO1xudmFyIGNoYW5nZURpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VEaXJlY3Rpb247XG52YXIgY2hhbmdlU3BlZWQgPSBidWxsZXRtbC5kc2wuY2hhbmdlU3BlZWQ7XG52YXIgYWNjZWwgPSBidWxsZXRtbC5kc2wuYWNjZWw7XG52YXIgd2FpdCA9IGJ1bGxldG1sLmRzbC53YWl0O1xudmFyIHZhbmlzaCA9IGJ1bGxldG1sLmRzbC52YW5pc2g7XG52YXIgcmVwZWF0ID0gYnVsbGV0bWwuZHNsLnJlcGVhdDtcbnZhciBiaW5kVmFyID0gYnVsbGV0bWwuZHNsLmJpbmRWYXI7XG52YXIgbm90aWZ5ID0gYnVsbGV0bWwuZHNsLm5vdGlmeTtcbnZhciBkaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuZGlyZWN0aW9uO1xudmFyIHNwZWVkID0gYnVsbGV0bWwuZHNsLnNwZWVkO1xudmFyIGhvcml6b250YWwgPSBidWxsZXRtbC5kc2wuaG9yaXpvbnRhbDtcbnZhciB2ZXJ0aWNhbCA9IGJ1bGxldG1sLmRzbC52ZXJ0aWNhbDtcbnZhciBmaXJlT3B0aW9uID0gYnVsbGV0bWwuZHNsLmZpcmVPcHRpb247XG52YXIgb2Zmc2V0WCA9IGJ1bGxldG1sLmRzbC5vZmZzZXRYO1xudmFyIG9mZnNldFkgPSBidWxsZXRtbC5kc2wub2Zmc2V0WTtcbnZhciBhdXRvbm9teSA9IGJ1bGxldG1sLmRzbC5hdXRvbm9teTtcblxuLy/jg57jgq/jg61cbnZhciBpbnRlcnZhbCA9IGJ1bGxldG1sLmRzbC5pbnRlcnZhbDtcbnZhciBzcGQgPSBidWxsZXRtbC5kc2wuc3BkO1xudmFyIHNwZFNlcSA9IGJ1bGxldG1sLmRzbC5zcGRTZXE7XG52YXIgZmlyZUFpbTAgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTA7XG52YXIgZmlyZUFpbTEgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTE7XG52YXIgZmlyZUFpbTIgPSBidWxsZXRtbC5kc2wuZmlyZUFpbTI7XG52YXIgbndheSA9IGJ1bGxldG1sLmRzbC5ud2F5O1xudmFyIG53YXlWcyA9IGJ1bGxldG1sLmRzbC5ud2F5VnM7XG52YXIgYWJzb2x1dGVOd2F5ID0gYnVsbGV0bWwuZHNsLmFic29sdXRlTndheTtcbnZhciBhYnNvbHV0ZU53YXlWcyA9IGJ1bGxldG1sLmRzbC5hYnNvbHV0ZU53YXlWcztcbnZhciBjaXJjbGUgPSBidWxsZXRtbC5kc2wuY2lyY2xlO1xudmFyIGFic29sdXRlQ2lyY2xlID0gYnVsbGV0bWwuZHNsLmFic29sdXRlQ2lyY2xlO1xudmFyIHdoaXAgPSBidWxsZXRtbC5kc2wud2hpcDtcblxuLy/lvL7nqK5cbnZhciBSUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSTSAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjh9KTtcbnZhciBSTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcbnZhciBSRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG52YXIgUkVNID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgQlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjh9KTtcbnZhciBCTCAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG52YXIgQkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjZ9KTtcbnZhciBCRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xuXG52YXIgVEhJTiAgID0gYnVsbGV0KHt0eXBlOiBcIlRISU5cIiwgc2l6ZTogMS4wfSk7XG52YXIgVEhJTl9MID0gYnVsbGV0KHt0eXBlOiBcIlRISU5cIiwgc2l6ZTogMS41fSk7XG5cbnZhciBETSA9IGJ1bGxldCh7ZHVtbXk6IHRydWV9KTtcblxuLy/vvJLpnaLkuK3jg5zjgrlcbmRhbm1ha3UuUmF2ZW4gPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgd2FpdCgxMjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpKSxcbiAgICAgICAgICAgIHJlcGVhdCgzLCBbXG4gICAgICAgICAgICAgICAgbndheSgzLCAtMTUsIDE1LCBUSElOLCBzcGQoMC4wOCkpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDUpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxNjUpLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oLTIwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoNiwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGQoMC41KSwgZGlyZWN0aW9uKC0zMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGRTZXEoMC4wOCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMjogYWN0aW9uKFtcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDIwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoNiwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDMwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwLjA4KSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG5cbi8v77yS6Z2i44Oc44K544CA44OR44K/44O844Oz77yRXG5kYW5tYWt1LkdhcnVkYV8xID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDkwKSxcbiAgICAgICAgcmVwZWF0KDQsIFtcbiAgICAgICAgICAgIHJlcGVhdChcIiRyYW5rLzEwKzNcIiwgW1xuICAgICAgICAgICAgICAgIG53YXkoNSwgLTIwLCAyMCwgUkwsIHNwZCgwLjgpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDApLCBhdXRvbm9teSh0cnVlKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMiksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE4MCksXG4gICAgICAgIF0pLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgd2FpdCgxMjApLFxuICAgICAgICByZXBlYXQoNCwgW1xuICAgICAgICAgICAgcmVwZWF0KFwiJHJhbmsvMTBcIiwgW1xuICAgICAgICAgICAgICAgIG53YXkoNSwgLTIwLCAyMCwgQkVNLCBzcGQoMC44KSwgb2Zmc2V0WCgtMTQ4KSwgb2Zmc2V0WSgwKSwgYXV0b25vbXkodHJ1ZSkpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDYpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxODApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIHJlcGVhdCg0LCBbXG4gICAgICAgICAgICByZXBlYXQoXCIkcmFuay8xMFwiLCBbXG4gICAgICAgICAgICAgICAgbndheSg1LCAtMjAsIDIwLCBCRU0sIHNwZCgwLjgpLCBvZmZzZXRYKDE0OCksIG9mZnNldFkoMCksIGF1dG9ub215KHRydWUpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCg2KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTgwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJLpnaLjg5zjgrnjgIDjg5Hjgr/jg7zjg7PvvJJcbmRhbm1ha3UuR2FydWRhXzIgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgd2FpdCg5MCksXG4gICAgICAgIHJlcGVhdCgxMCwgW1xuICAgICAgICAgICAgbm90aWZ5KCdib21iJyksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIF0pLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG59KTtcblxuLy/vvJLpnaLjg5zjgrnjgIDjg5Hjgr/jg7zjg7PvvJNcbmRhbm1ha3UuR2FydWRhXzMgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoOTApLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG59KTtcblxuLy/vvJLpnaLjg5zjgrnjgIDjg5Hjgr/jg7zjg7PvvJTvvIjnmbrni4LvvIlcbmRhbm1ha3UuR2FydWRhXzQgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKGJ1bGxldChETSwgYWN0aW9uUmVmKFwiaW52MVwiKSksIHNwZCgzKSwgZGlyZWN0aW9uKFwiJGxvb3AuaW5kZXggKiA1XCIsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KDE2LCBbXG4gICAgICAgICAgICAgICAgZmlyZShidWxsZXQoRE0sIGFjdGlvblJlZihcImludjFcIikpLCBzcGRTZXEoMCksIGRpcmVjdGlvbigzNjAgLyAxNiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgIGZpcmUoYnVsbGV0KERNLCBhY3Rpb25SZWYoXCJpbnYyXCIpKSwgc3BkKDMpLCBkaXJlY3Rpb24oXCIkbG9vcC5pbmRleCAqIC01XCIsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KDE2LCBbXG4gICAgICAgICAgICAgICAgZmlyZShidWxsZXQoRE0sIGFjdGlvblJlZihcImludjJcIikpLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtMzYwIC8gMTYsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICBpbnYxOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDEpLFxuICAgICAgICBmaXJlKFJMLCBzcGQoMS4yKSwgZGlyZWN0aW9uKDkwLCBcInJlbGF0aXZlXCIpKSxcbiAgICAgICAgdmFuaXNoKCksXG4gICAgXSksXG4gICAgaW52MjogYWN0aW9uKFtcbiAgICAgICAgd2FpdCgxKSxcbiAgICAgICAgZmlyZShSTCwgc3BkKDEuMiksIGRpcmVjdGlvbigtOTAsIFwicmVsYXRpdmVcIikpLFxuICAgICAgICB2YW5pc2goKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kumdouODnOOCueegsuWPsFxuZGFubWFrdS5HYXJ1ZGFfaGF0Y2hfMSA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgd2FpdCgxMjApLFxuICAgICAgICByZXBlYXQoNSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNCksIGRpcmVjdGlvbigwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDVcIiwgW1xuICAgICAgICAgICAgICAgIHJlcGVhdCgxMCwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKFJFTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMzgsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxNTApLFxuICAgICAgICBdKSxcbiAgICAgICAgbm90aWZ5KFwiZW5kXCIpLFxuICAgIF0pLFxufSk7XG5kYW5tYWt1LkdhcnVkYV9oYXRjaF8yID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIG5vdGlmeShcImVuZFwiKSxcbiAgICBdKSxcbn0pO1xuZGFubWFrdS5HYXJ1ZGFfaGF0Y2hfMyA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgd2FpdCgxMjApLFxuICAgICAgICBub3RpZnkoXCJlbmRcIiksXG4gICAgXSksXG59KTtcbmRhbm1ha3UuR2FydWRhX2hhdGNoXzQgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgbm90aWZ5KFwic3RhcnRcIiksXG4gICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJLpnaLjg5zjgrnjgqrjg5fjgrfjg6fjg7PmrablmahcbmRhbm1ha3UuR2FydWRhQm9tYiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkKDAuNSksIGRpcmVjdGlvbiggOTAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgZmlyZShUSElOLCBzcGQoMC41KSwgZGlyZWN0aW9uKDI3MCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbn0pO1xuXG4iLCIvKlxuICogIEl0ZW0uanNcbiAqICAyMDE1LzEwLzE5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL+OCouOCpOODhuODoFxucGhpbmEuZGVmaW5lKFwiSXRlbVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LlNwcml0ZVwiLFxuICAgIGxheWVyOiBMQVlFUl9QTEFZRVIsXG5cbiAgICAvL+OCouOCpOODhuODoOeorumhnlxuICAgIC8vMDog44OR44Ov44O844Ki44OD44OXXG4gICAgLy8xOiDjg5zjg6BcbiAgICAvLzI6IO+8ke+8te+8sFxuICAgIC8vMzog5b6X54K5XG4gICAgaWQ6IDAsXG5cbiAgICAvL+ODkeODr+ODvOOCouODg+ODl+OCv+OCpOODl1xuICAgIHR5cGU6IDAsXG5cbiAgICBhY3RpdmU6IGZhbHNlLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoXCJ0ZXgxXCIsIDMyLCAzMik7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5zZXRGcmFtZVRyaW1taW5nKDAsIDk3LCA5NiwgMzIpO1xuICAgICAgICB0aGlzLnNldEZyYW1lSW5kZXgoaWQpO1xuICAgICAgICB0aGlzLnNldFNjYWxlKDIuMCk7XG5cbiAgICAgICAgLy/lvZPjgorliKTlrproqK3lrppcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcInJlY3RcIjtcblxuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XG4gICAgICAgIHRoaXMudGltZSA9IDE7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIC8v6Ieq5qmf44Go44Gu5b2T44KK5Yik5a6a44OB44Kn44OD44KvXG4gICAgICAgIHZhciBwbGF5ZXIgPSBhcHAuY3VycmVudFNjZW5lLnBsYXllcjtcbiAgICAgICAgaWYgKHRoaXMuaXNIaXRFbGVtZW50KHBsYXllcikpIHtcbiAgICAgICAgICAgIHBsYXllci5nZXRJdGVtKHRoaXMuaWQsIHRoaXMudHlwZSk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/np7vli5Xjg5Hjgr/jg7zjg7NcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy55Kys7XG4gICAgICAgICAgICBpZiAodGhpcy55ID4gU0NfSC0zMikge1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgIHZhciB4ID0gcmFuZChTQ19XKjAuMiwgU0NfVyowLjgpO1xuICAgICAgICAgICAgdmFyIHkgPSByYW5kKFNDX0gqMC4yLCBTQ19XKjAuOSk7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC5tb3ZlKHgsIHksIDMwMDAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvdW50IDwgMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waGFzZSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBoYXNlID0gMztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5waGFzZSA9PSAzKSB7XG4gICAgICAgICAgICB0aGlzLnkgKz0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgcGxheWVyLmpzXG4gKiAgMjAxNC8wOS8wNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiUGxheWVyXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIGxheWVyOiBMQVlFUl9QTEFZRVIsXG5cbiAgICAgICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgIGhlaWdodDogMixcblxuICAgICAgICBpc0NvbnRyb2w6IHRydWUsICAgIC8v5pON5L2c5Y+v6IO944OV44Op44KwXG4gICAgICAgIGlzU2hvdE9LOiB0cnVlLCAgICAgLy/jgrfjg6fjg4Pjg4jlj6/og73jg5Xjg6njgrBcbiAgICAgICAgaXNEZWFkOiBmYWxzZSwgICAgICAvL+atu+S6oeODleODqeOCsFxuICAgICAgICBzaG90T046IHRydWUsICAgICAgIC8v44K344On44OD44OI44OV44Op44KwXG4gICAgICAgIG1vdXNlT046IGZhbHNlLCAgICAgLy/jg57jgqbjgrnmk43kvZzkuK3jg5Xjg6njgrBcblxuICAgICAgICBpc0NvbGxpc2lvbjogZmFsc2UsICAgICAvL+W9k+OCiuWIpOWumuacieWKueODleODqeOCsFxuICAgICAgICBpc0FmdGVyYnVybmVyOiBmYWxzZSwgICAvL+OCouODleOCv+ODvOODkOODvOODiuODvOS4rVxuICAgICAgICBpc0FmdGVyYnVybmVyQmVmb3JlOiBmYWxzZSxcblxuICAgICAgICB0aW1lTXV0ZWtpOiAwLCAvL+eEoeaVteODleODrOODvOODoOaui+OCiuaZgumWk1xuXG4gICAgICAgIHNwZWVkOiA0LCAgICAgICAvL+enu+WLleS/guaVsFxuICAgICAgICB0b3VjaFNwZWVkOiA0LCAgLy/jgr/jg4Pjg4Hmk43kvZzmmYLnp7vli5Xkv4LmlbBcbiAgICAgICAgdHlwZTogMCwgICAgICAgIC8v6Ieq5qmf44K/44Kk44OXKDA66LWkIDE657eRIDI66Z2SKVxuICAgICAgICBwb3dlcjogMCwgICAgICAgLy/jg5Hjg6/jg7zjgqLjg4Pjg5fmrrXpmo5cbiAgICAgICAgcG93ZXJNYXg6IDUsICAgIC8v44OR44Ov44O844Ki44OD44OX5pyA5aSnXG5cbiAgICAgICAgc2hvdFBvd2VyOiAxMCwgICAgICAvL+OCt+ODp+ODg+ODiOWogeWKm1xuICAgICAgICBzaG90SW50ZXJ2YWw6IDYsICAgIC8v44K344On44OD44OI6ZaT6ZqUXG5cbiAgICAgICAgcm9sbGNvdW50OiA1MCxcbiAgICAgICAgcGl0Y2hjb3VudDogNTAsXG5cbiAgICAgICAgcGFyZW50U2NlbmU6IG51bGwsXG4gICAgICAgIGluZGVjaWVzOiBbMCwxLDIsMyw0LDQsNCw1LDYsNyw4XSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIHRoaXMudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICB0aGlzLnNwcml0ZSA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwiZ3Vuc2hpcFwiLCA0OCwgNDgpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoNClcbiAgICAgICAgICAgIC5zZXRTY2FsZSgwLjY2KTtcblxuICAgICAgICAvL+ODk+ODg+ODiFxuICAgICAgICB0aGlzLmJpdHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYml0c1tpXSA9IFBsYXllckJpdChpKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5iaXRzW2ldLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcGVuQml0KDApO1xuXG4gICAgICAgIC8v5b2T44KK5Yik5a6a6Kit5a6aXG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJjaXJjbGVcIjtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyO1xuXG4gICAgICAgIHRoaXMub24oJ3JlbW92ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvdykgdGhpcy5zaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgdGhpcy5jaGFuZ2VJbnRlcnZhbCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAodGhpcy5pc0NvbnRyb2wpIHtcbiAgICAgICAgICAgIC8v44Oe44Km44K55pON5L2cXG4gICAgICAgICAgICB2YXIgcCA9IGFwcC5tb3VzZTtcbiAgICAgICAgICAgIGlmIChwLmdldFBvaW50aW5nKCkpIHtcbi8qXG4gICAgICAgICAgICAgICAgdmFyIHB0ID0gdGhpcy5wYXJlbnRTY2VuZS5wb2ludGVyO1xuICAgICAgICAgICAgICAgIHRoaXMueCArPSAocHQueCAtIHRoaXMueCkvdGhpcy50b3VjaFNwZWVkO1xuICAgICAgICAgICAgICAgIHRoaXMueSArPSAocHQueSAtIHRoaXMueSkvdGhpcy50b3VjaFNwZWVkO1xuKi9cbiAgICAgICAgICAgICAgICB2YXIgcHQgPSBwLmRlbHRhUG9zaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IH5+KHB0LngqMS44KTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gfn4ocHQueSoxLjgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZU9OID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3RPTiA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VPTiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdE9OID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v44Kz44Oz44OI44Ot44O844Op44O85pON5L2cXG4gICAgICAgICAgICB2YXIgY3QgPSBhcHAuY29udHJvbGxlcjtcbiAgICAgICAgICAgIGlmIChjdC5hbmdsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBtID0gS0VZQk9BUkRfTU9WRVtjdC5hbmdsZV07XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IG0ueCp0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgIHRoaXMueSArPSBtLnkqdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdC5hbmFsb2cxLnggPiAwLjMgfHwgLTAuMyA+IGN0LmFuYWxvZzEueCkgdGhpcy54ICs9IGN0LmFuYWxvZzEueCAqIHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICBpZiAoY3QuYW5hbG9nMS55ID4gMC4zIHx8IC0wLjMgPiBjdC5hbmFsb2cxLnkpIHRoaXMueSArPSBjdC5hbmFsb2cxLnkgKiB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1vdXNlT04pIHRoaXMuc2hvdE9OID0gYXBwLmNvbnRyb2xsZXIuc2hvdDtcblxuICAgICAgICAgICAgLy/jgrPjg7Pjg4jjg63jg7zjg6vkuI3lj6/nirbmhYtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0NvbnRyb2wgfHwgIXRoaXMuaXNTaG90T0sgfHwgdGhpcy5pc0RlYWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3RPTiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+OCs+ODs+ODiOODreODvOODq+WPr+iDveeKtuaFi1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDb250cm9sICYmIHRoaXMuaXNTaG90T0sgJiYgIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgICAgICAgICAgLy/jg5zjg6DmipXkuItcbiAgICAgICAgICAgICAgICBpZiAoY3QuYm9tYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyQm9tYigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8v44K344On44OD44OI44K/44Kk44OX5aSJ5pu077yI44OG44K544OI55So77yJXG4gICAgICAgICAgICAgICAgaWYgKGN0LnNwZWNpYWwxICYmIHRoaXMudGltZSA+IHRoaXMuY2hhbmdlSW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlID0gKHRoaXMudHlwZSsxKSUzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5CaXQodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VJbnRlcnZhbCA9IHRoaXMudGltZSszMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56e75YuV56+E5Zuy44Gu5Yi26ZmQXG4gICAgICAgICAgICB0aGlzLnggPSBNYXRoLmNsYW1wKHRoaXMueCwgMTYsIFNDX1ctMTYpO1xuICAgICAgICAgICAgdGhpcy55ID0gTWF0aC5jbGFtcCh0aGlzLnksIDE2LCBTQ19ILTE2KTtcblxuICAgICAgICAgICAgLy/jgrfjg6fjg4Pjg4jmipXlhaVcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3RPTiAmJiBhcHAudGlja2VyLmZyYW1lICUgdGhpcy5zaG90SW50ZXJ2YWwgPT0gMCkgdGhpcy5lbnRlclNob3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5qmf5L2T44Ot44O844OrXG4gICAgICAgIHZhciB4ID0gfn50aGlzLng7XG4gICAgICAgIHZhciBieCA9IH5+dGhpcy5ieDtcbiAgICAgICAgaWYgKGJ4ID4geCkge1xuICAgICAgICAgICAgdGhpcy5yb2xsY291bnQtPTI7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsY291bnQgPCAwKSB0aGlzLnJvbGxjb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ4IDwgeCkge1xuICAgICAgICAgICAgdGhpcy5yb2xsY291bnQrPTI7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsY291bnQgPiAxMDApIHRoaXMucm9sbGNvdW50ID0gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2eCA9IE1hdGguYWJzKGJ4IC0geCk7XG4gICAgICAgIGlmICh2eCA8IDIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvbGxjb3VudCA8IDUwKSB0aGlzLnJvbGxjb3VudCs9MjsgZWxzZSB0aGlzLnJvbGxjb3VudC09MjtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvbGxjb3VudCA8IDApIHRoaXMucm9sbGNvdW50ID0gMDtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvbGxjb3VudCA+IDEwMCkgdGhpcy5yb2xsY291bnQgPSAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zcHJpdGUuc2V0RnJhbWVJbmRleCh0aGlzLmluZGVjaWVzW01hdGguY2xhbXAofn4odGhpcy5yb2xsY291bnQvMTApLDAsIDkpXSk7XG5cbiAgICAgICAgLy/jgqLjg5Xjgr/jg7zjg5Djg7zjg4rjg7zmj4/lhplcbiAgICAgICAgaWYgKHRoaXMuaXNBZnRlcmJ1cm5lcikge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICAgICAgLy/nnYDngatcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0FmdGVyYnVybmVyQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2eCA9IE1hdGgucmFuZGludCgtNSwgNSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2eSA9IE1hdGgucmFuZGludCgxLCA1KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSAgTWF0aC5yYW5kZmxvYXQoMC45LCAwLjk5KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGUgPSBsYXllci5lbnRlckFmdGVyYnVybmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogdGhpcy54LCB5OiB0aGlzLnkrMTZ9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnkrZ3JvdW5kLmRlbHRhWSwgZGVjYXk6IGR9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxwaGE6IDAuNyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsZW5kTW9kZTogXCJsaWdodGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5pc0RlYWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IGxheWVyLmVudGVyQWZ0ZXJidXJuZXIoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55KzI2fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiBncm91bmQuZGVsdGFZLCBkZWNheTogMC45OX0sXG4gICAgICAgICAgICAgICAgICAgIGFscGhhOiAwLjcsXG4gICAgICAgICAgICAgICAgICAgIGJsZW5kTW9kZTogXCJsaWdodGVyXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGUpIGUuc2V0U2NhbGUoMS4wLCAzLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/mtojngatcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWZ0ZXJidXJuZXJCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdnggPSBNYXRoLnJhbmRpbnQoLTIsIDIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdnkgPSBNYXRoLnJhbmRpbnQoMSwgNSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gIE1hdGgucmFuZGZsb2F0KDAuOSwgMC45OSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlID0gbGF5ZXIuZW50ZXJBZnRlcmJ1cm5lcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55KzE2fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5K2dyb3VuZC5kZWx0YVksIGRlY2F5OiBkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGhhOiAwLjcsXG4gICAgICAgICAgICAgICAgICAgICAgICBibGVuZE1vZGU6IFwibGlnaHRlclwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJ4ID0gdGhpcy54O1xuICAgICAgICB0aGlzLmJ5ID0gdGhpcy55O1xuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgdGhpcy50aW1lTXV0ZWtpLS07XG4gICAgICAgIHRoaXMuaXNBZnRlcmJ1cm5lckJlZm9yZSA9IHRoaXMuaXNBZnRlcmJ1cm5lcjtcbiAgICB9LFxuXG4gICAgLy/ooqvlvL7lh6bnkIZcbiAgICBkYW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+eEoeaVteaZgumWk+S4reOBr+OCueODq+ODvFxuICAgICAgICBpZiAodGhpcy50aW1lTXV0ZWtpID4gMCB8fCB0aGlzLnBhcmVudFNjZW5lLmJvbWJUaW1lID4gMCB8fCB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPiAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy/jgqrjg7zjg4jjg5zjg6Dnmbrli5VcbiAgICAgICAgaWYgKGFwcC5zZXR0aW5nLmF1dG9Cb21iICYmIGFwcC5zZXR0aW5nLmJvbWJTdG9jayA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJCb21iKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v6KKr5by+44Ko44OV44Kn44Kv44OI6KGo56S6XG4gICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgbGF5ZXIuZW50ZXJFeHBsb2RlUGxheWVyKHtwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55fX0pO1xuXG4gICAgICAgIGFwcC5wbGF5U0UoXCJwbGF5ZXJtaXNzXCIpO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLm1pc3NDb3VudCsrO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnN0YWdlTWlzc0NvdW50Kys7XG5cbiAgICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgICBhcHAuc2V0dGluZy56YW5raS0tO1xuICAgICAgICBpZiAoYXBwLnNldHRpbmcuemFua2kgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0dXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvdE9OID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNDb250cm9sID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmlzR2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8v44K344On44OD44OI55m65bCEXG4gICAgZW50ZXJTaG90OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/oh6rmqZ/jgYvjgolcbiAgICAgICAgdmFyIGx5ID0gdGhpcy5wYXJlbnRTY2VuZS5zaG90TGF5ZXI7XG4gICAgICAgIGx5LmVudGVyU2hvdCh0aGlzLngrMTAsIHRoaXMueS04LCB7dHlwZTogMCwgcm90YXRpb246IDEsIHBvd2VyOiB0aGlzLnNob3RQb3dlcn0pO1xuICAgICAgICBseS5lbnRlclNob3QodGhpcy54ICAgLCB0aGlzLnktMTYse3R5cGU6IDAsIHJvdGF0aW9uOiAwLCBwb3dlcjogdGhpcy5zaG90UG93ZXJ9KTtcbiAgICAgICAgbHkuZW50ZXJTaG90KHRoaXMueC0xMCwgdGhpcy55LTgsIHt0eXBlOiAwLCByb3RhdGlvbjotMSwgcG93ZXI6IHRoaXMuc2hvdFBvd2VyfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+ODk+ODg+ODiOWxlemWi1xuICAgIG9wZW5CaXQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gMDtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgLy/otaTvvIjliY3mlrnpm4bkuK3lnovvvIlcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMF0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogIDUsIHk6LTMyLCByb3RhdGlvbjogMiwgYWxwaGE6MX0sIDE1KS5jYWxsKGZ1bmN0aW9uKCl7dGhpcy50d2VlbmVyLmNsZWFyKCkubW92ZUJ5KC0zMCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5tb3ZlQnkoIDMwLDAsMzAsXCJlYXNlSW5PdXRTaW5lXCIpLnNldExvb3AodHJ1ZSk7fS5iaW5kKHRoaXMuYml0c1swXSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1sxXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiAtNSwgeTotMzIsIHJvdGF0aW9uOi0yLCBhbHBoYToxfSwgMTUpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlQnkoIDMwLDAsMzAsXCJlYXNlSW5PdXRTaW5lXCIpLm1vdmVCeSgtMzAsMCwzMCxcImVhc2VJbk91dFNpbmVcIikuc2V0TG9vcCh0cnVlKTt9LmJpbmQodGhpcy5iaXRzWzFdKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzJdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6IDE1LCB5Oi0yNCwgcm90YXRpb246IDIsIGFscGhhOjF9LCAxNSkuY2FsbChmdW5jdGlvbigpe3RoaXMudHdlZW5lci5jbGVhcigpLm1vdmVCeSgtNDAsMCwzMCxcImVhc2VJbk91dFNpbmVcIikubW92ZUJ5KCA0MCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5zZXRMb29wKHRydWUpO30uYmluZCh0aGlzLmJpdHNbMl0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbM10udHdlZW5lci5jbGVhcigpLnRvKHsgeDotMTUsIHk6LTI0LCByb3RhdGlvbjotMiwgYWxwaGE6MX0sIDE1KS5jYWxsKGZ1bmN0aW9uKCl7dGhpcy50d2VlbmVyLmNsZWFyKCkubW92ZUJ5KCA0MCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5tb3ZlQnkoLTQwLDAsMzAsXCJlYXNlSW5PdXRTaW5lXCIpLnNldExvb3AodHJ1ZSk7fS5iaW5kKHRoaXMuYml0c1szXSkpO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAvL+e3ke+8iOaWueWQkeWkieabtOWei++8iVxuICAgICAgICAgICAgICAgIHRoaXMuYml0c1swXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiAzNSwgeTowLCByb3RhdGlvbjowLCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1sxXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4Oi0zNSwgeTowLCByb3RhdGlvbjowLCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1syXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiAxMCwgeTozMCwgcm90YXRpb246MCwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbM10udHdlZW5lci5jbGVhcigpLnRvKHsgeDotMTAsIHk6MzAsIHJvdGF0aW9uOjAsIGFscGhhOjF9LCAxNSkuc2V0TG9vcChmYWxzZSk7XG4gICAgICAgICAgICAgICAgY29sb3IgPSA4MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAvL+mdku+8iOW6g+evhOWbsuWei++8iVxuICAgICAgICAgICAgICAgIHRoaXMuYml0c1swXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiAzMCwgeToxNiwgcm90YXRpb246ICA1LCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1sxXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4Oi0zMCwgeToxNiwgcm90YXRpb246IC01LCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1syXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiA1MCwgeToyNCwgcm90YXRpb246IDEwLCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1szXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4Oi01MCwgeToyNCwgcm90YXRpb246LTEwLCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gMjAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvL+OCr+ODreODvOOCulxuICAgICAgICAgICAgICAgIHRoaXMuYml0c1swXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OjAsIHk6IDAsIGFscGhhOjB9LCAxNSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzFdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6MCwgeTogMCwgYWxwaGE6MH0sIDE1KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMl0udHdlZW5lci5jbGVhcigpLnRvKHsgeDowLCB5OiAwLCBhbHBoYTowfSwgMTUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1szXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OjAsIHk6IDAsIGFscGhhOjB9LCAxNSk7XG4gICAgICAgICAgICAgICAgY29sb3IgPSA2MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jg5fjg6zjgqTjg6Tjg7zmipXlhaXmmYLmvJTlh7pcbiAgICBzdGFydHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gU0NfVy8yO1xuICAgICAgICB0aGlzLnkgPSBTQ19IKzEyODtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID0gMTgwO1xuICAgICAgICAgICAgICAgIGFwcC5zZXR0aW5nLmJvbWJTdG9jayA9IGFwcC5zZXR0aW5nLmJvbWJTdG9ja01heDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50byh7eDogU0NfVyowLjUsIHk6IFNDX0gqMC44fSwgMTIwLCBcImVhc2VPdXRRdWludFwiKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3RPTiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbnRyb2wgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTaG90T0sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGltZU11dGVraSA9IDEyMDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaG90T04gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0NvbnRyb2wgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgrnjg4bjg7zjgrjplovlp4vmmYLmvJTlh7pcbiAgICBzdGFnZVN0YXJ0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnggPSBTQ19XLzI7XG4gICAgICAgIHRoaXMueSA9IFNDX0grMTI4O1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLnRvKHt4OiBTQ19XLzIsIHk6IFNDX0gvMiszMn0sIDkwLCBcImVhc2VPdXRDdWJpY1wiKVxuICAgICAgICAgICAgLnRvKHt4OiBTQ19XLzIsIHk6IFNDX0gtNjQgIH0sIDEyMClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG90T04gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDb250cm9sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvdE9LID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVNdXRla2kgPSAxMjA7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2hvdE9OID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNDb250cm9sID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v5qmf5b2x6L+95YqgXG4gICAgYWRkU2hhZG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGlzLnNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwiZ3Vuc2hpcEJsYWNrXCIsIDQ4LCA0OCk7XG4gICAgICAgIHRoaXMuc2hhZG93LmxheWVyID0gTEFZRVJfU0hBRE9XO1xuICAgICAgICB0aGlzLnNoYWRvdy5hbHBoYSA9IDAuNTtcbiAgICAgICAgdGhpcy5zaGFkb3cuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKTtcbiAgICAgICAgdGhpcy5zaGFkb3cuc2V0RnJhbWVJbmRleCg0KS5zZXRTY2FsZSgwLjY2KTtcbiAgICAgICAgdGhpcy5zaGFkb3cudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoYXQucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgaWYgKCFncm91bmQuaXNTaGFkb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGF0LnJvdGF0aW9uO1xuICAgICAgICAgICAgdGhpcy54ID0gdGhhdC54ICsgZ3JvdW5kLnNoYWRvd1g7XG4gICAgICAgICAgICB0aGlzLnkgPSB0aGF0LnkgKyBncm91bmQuc2hhZG93WTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGVYID0gZ3JvdW5kLnNjYWxlWCowLjY2O1xuICAgICAgICAgICAgdGhpcy5zY2FsZVkgPSBncm91bmQuc2NhbGVZKjAuNjY7XG4gICAgICAgICAgICB0aGlzLmZyYW1lSW5kZXggPSB0aGF0LnNwcml0ZS5mcmFtZUluZGV4O1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gdGhhdC52aXNpYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5Pjg4Pjg4jjga7lvbFcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBiID0gdGhpcy5iaXRzW2ldO1xuICAgICAgICAgICAgYi5wYXJlbnRTY2VuZSA9IHRoaXMucGFyZW50U2NlbmU7XG4gICAgICAgICAgICBiLmFkZFNoYWRvdygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+OCouOCpOODhuODoOWPluW+l1xuICAgIGdldEl0ZW06IGZ1bmN0aW9uKGtpbmQpIHtcbiAgICAgICAgc3dpdGNoKGtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgSVRFTV9QT1dFUjpcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwicG93ZXJ1cFwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgSVRFTV9CT01COlxuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJwb3dlcnVwXCIpO1xuICAgICAgICAgICAgICAgIGFwcC5zZXR0aW5nLmJvbWJTdG9jaysrO1xuICAgICAgICAgICAgICAgIGlmIChhcHAuc2V0dGluZy5ib21iU3RvY2sgPiBhcHAuc2V0dGluZy5ib21iU3RvY2tNYXgpIGFwcC5zZXR0aW5nLmJvbWJTdG9ja01heCA9IGFwcC5zZXR0aW5nLmJvbWJTdG9jaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgSVRFTV8xVVA6XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInBvd2VydXBcIik7XG4gICAgICAgICAgICAgICAgYXBwLnNldHRpbmcuemFua2krKztcbiAgICAgICAgICAgICAgICBpZiAoYXBwLnNldHRpbmcuemFua2kgPiA5KSBhcHAuc2V0dGluZy56YW5raSA9IDk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIHBsYXllcmJpdC5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIlBsYXllckJpdFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LlNwcml0ZVwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICBsYXllcjogTEFZRVJfUExBWUVSLFxuICAgICAgICBpZDogMCxcbiAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoXCJiaXRcIiwgMzIsIDMyKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgdGhpcy5zZXRTY2FsZSgwLjUpO1xuICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuXG4gICAgICAgIHRoaXMuYmVmb3JlWCA9IDA7XG4gICAgICAgIHRoaXMuYmVmb3JlWSA9IDA7XG5cbiAgICAgICAgdGhpcy5vbigncmVtb3ZlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB0aGlzLnNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAodGhpcy50aW1lICUgMiA9PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pZCAlIDIgPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXgtLTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleCA8IDApIHRoaXMuaW5kZXggPSA4O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXgrMSklOTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGxheWVyID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIGlmIChwbGF5ZXIuc2hvdE9OKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lICUgcGxheWVyLnNob3RJbnRlcnZhbCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLnggKyBwbGF5ZXIueDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMueSArIHBsYXllci55O1xuICAgICAgICAgICAgICAgIHZhciBzbCA9IHBsYXllci5wYXJlbnRTY2VuZS5zaG90TGF5ZXI7XG4gICAgICAgICAgICAgICAgc2wuZW50ZXJTaG90KHgsIHktNCwge3R5cGU6IDEsIHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLCBwb3dlcjogcGxheWVyLnNob3RQb3dlcn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBsYXllci50eXBlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmNsYW1wKHBsYXllci5yb2xsY291bnQtNTAsIC0yNSwgMjUpO1xuICAgICAgICAgICAgaWYgKC00IDwgdGhpcy5yb3RhdGlvbiAmJiB0aGlzLnJvdGF0aW9uIDwgNCkgdGhpcy5yb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgfSxcblxuICAgIGFkZFNoYWRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5zaGFkb3cgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImJpdEJsYWNrXCIsIDMyLCAzMik7XG4gICAgICAgIHRoaXMuc2hhZG93LmxheWVyID0gTEFZRVJfU0hBRE9XO1xuICAgICAgICB0aGlzLnNoYWRvdy5hbHBoYSA9IDAuNTtcbiAgICAgICAgdGhpcy5zaGFkb3cuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKTtcbiAgICAgICAgdGhpcy5zaGFkb3cuc2V0RnJhbWVJbmRleCgwKS5zZXRTY2FsZSgwLjUpO1xuICAgICAgICB0aGlzLnNoYWRvdy51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdW5kID0gdGhhdC5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgICAgICBpZiAoIWdyb3VuZC5pc1NoYWRvdykge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoYXQucm90YXRpb247XG4gICAgICAgICAgICB0aGlzLnggPSB0aGF0LnggKyB0aGF0LnBhcmVudC54ICsgZ3JvdW5kLnNoYWRvd1g7XG4gICAgICAgICAgICB0aGlzLnkgPSB0aGF0LnkgKyB0aGF0LnBhcmVudC55ICsgZ3JvdW5kLnNoYWRvd1k7XG4gICAgICAgICAgICB0aGlzLnNjYWxlWCA9IGdyb3VuZC5zY2FsZVgqMC41O1xuICAgICAgICAgICAgdGhpcy5zY2FsZVkgPSBncm91bmQuc2NhbGVZKjAuNTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVJbmRleCA9IHRoYXQuZnJhbWVJbmRleDtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRoYXQucGFyZW50LnZpc2libGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBwbGF5ZXJwb2ludGVyLmpzXG4gKiAgMjAxNS8xMC8wOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLy/jg5fjg6zjgqTjg6Tjg7zmk43kvZznlKjjg53jgqTjg7Pjgr9cbnBoaW5hLmRlZmluZShcIlBsYXllclBvaW50ZXJcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5TaGFwZVwiLFxuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoe3dpZHRoOjMyLCBoZWlnaHQ6MzJ9KTtcbiAgICAgICAgdGhpcy5jYW52YXMubGluZVdpZHRoID0gMztcbiAgICAgICAgdGhpcy5jYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJsaWdodGVyXCI7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0cm9rZVN0eWxlID0gXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuc3Ryb2tlQXJjKDE2LCAxNiwgOCwgTWF0aC5QSSoyLCAwLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgdmFyIHAgPSBhcHAubW91c2U7XG4gICAgICAgIGlmICh0aGlzLnBsYXllci5pc0NvbnRyb2wgJiYgcC5nZXRQb2ludGluZygpKSB7XG4gICAgICAgICAgICBpZiAofn4odGhpcy54KSA9PSB+fih0aGlzLnBsYXllci54KSAmJiB+fih0aGlzLnkpID09IH5+KHRoaXMucGxheWVyLnkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnggKz0gKHAucG9zaXRpb24ueCAtIHAucHJldlBvc2l0aW9uLngpO1xuICAgICAgICAgICAgdGhpcy55ICs9IChwLnBvc2l0aW9uLnkgLSBwLnByZXZQb3NpdGlvbi55KTtcbiAgICAgICAgICAgIHRoaXMueCA9IE1hdGguY2xhbXAodGhpcy54LCAxNiwgU0NfVy0xNik7XG4gICAgICAgICAgICB0aGlzLnkgPSBNYXRoLmNsYW1wKHRoaXMueSwgMTYsIFNDX0gtMTYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy54ID0gdGhpcy5wbGF5ZXIueDtcbiAgICAgICAgICAgIHRoaXMueSA9IHRoaXMucGxheWVyLnk7XG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMDtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgc2hvdC5qc1xuICogIDIwMTUvMTAvMDlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxudmFyIGNoZWNrTGF5ZXJzID0gW0xBWUVSX09CSkVDVF9VUFBFUiwgTEFZRVJfT0JKRUNUX01JRERMRSwgTEFZRVJfT0JKRUNUX0xPV0VSXTtcblxucGhpbmEuZGVmaW5lKFwiU2hvdFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICBERUZBVUxUX1BBUkFNOiB7XG4gICAgICAgIHR5cGU6IDAsXG4gICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICBwb3dlcjogMTAsXG4gICAgICAgIHZlbG9jaXR5OiAxNSxcbiAgICB9LFxuXG4gICAgdGltZTogMCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgIHRoaXMucmFkaXVzID0gNlxuXG4gICAgICAgIHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJzaG90XCIsIDE2LCAzMikuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWVJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuc3ByaXRlLmFscGhhID0gMC44O1xuICAgICAgICB0aGlzLnNwcml0ZS5ibGVuZE1vZGUgPSBcImxpZ2h0ZXJcIjtcblxuICAgICAgICB0aGlzLm9uKFwiZW50ZXJmcmFtZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMudng7XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcblxuICAgICAgICAgICAgaWYgKHRoaXMueDwtMTYgfHwgdGhpcy54PlNDX1crMTYgfHwgdGhpcy55PC0xNiB8fCB0aGlzLnk+U0NfSCsxNikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+aVteOBqOOBruW9k+OCiuWIpOWumuODgeOCp+ODg+OCr1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZSAlIDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50U2NlbmUgPSB0aGlzLnNob3RMYXllci5wYXJlbnRTY2VuZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGF5ZXIgPSBwYXJlbnRTY2VuZS5sYXllcnNbY2hlY2tMYXllcnNbaV1dO1xuICAgICAgICAgICAgICAgICAgICBsYXllci5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhID09PSBhcHAucGxheWVyKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQgJiYgYS5pc0NvbGxpc2lvbiAmJiBhLmlzSGl0RWxlbWVudCh0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEuZGFtYWdlKHRoaXMucG93ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8v44Oq44Og44O844OW5pmCXG4gICAgICAgIHRoaXMub24oXCJyZW1vdmVkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLnNob3RMYXllci5wb29sLnB1c2godGhpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICBwYXJhbS4kc2FmZSh0aGlzLkRFRkFVTFRfUEFSQU0pO1xuICAgICAgICBpZiAocGFyYW0udHlwZSA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5mcmFtZUluZGV4ID0gMDtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnNldFNjYWxlKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWVJbmRleCA9IDE7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zZXRTY2FsZSgxLjUsIDEuMCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcGFyYW0ucm90YXRpb247XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwYXJhbS52ZWxvY2l0eTtcbiAgICAgICAgdGhpcy5wb3dlciA9IHBhcmFtLnBvd2VyO1xuXG4gICAgICAgIHZhciByb3QgPSBwYXJhbS5yb3RhdGlvbi05MDtcbiAgICAgICAgdGhpcy52eCA9IE1hdGguY29zKHJvdCp0b1JhZCkqdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgdGhpcy52eSA9IE1hdGguc2luKHJvdCp0b1JhZCkqdGhpcy52ZWxvY2l0eTtcblxuICAgICAgICAvL+W9k+OCiuWIpOWumuioreWumlxuICAgICAgICBpZiAocGFyYW0udHlwZSA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJhZGl1cyA9IDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJhZGl1cyA9IDE2O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iZWZvcmVYID0gdGhpcy54O1xuICAgICAgICB0aGlzLmJlZm9yZVkgPSB0aGlzLnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHZhbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncm91bmQgPSB0aGlzLnNob3RMYXllci5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgIHZhciBsYXllciA9IHRoaXMuc2hvdExheWVyLnBhcmVudFNjZW5lLmVmZmVjdExheWVyVXBwZXI7XG4gICAgICAgIGxheWVyLmVudGVyU2hvdEltcGFjdCh7XG4gICAgICAgICAgICBwb3NpdGlvbjp7eDogdGhpcy54LCB5OiB0aGlzLnl9LFxuICAgICAgICB9KTtcbiAgICAgICAgRWZmZWN0LmVudGVyRGVicmlzKGxheWVyLCB7XG4gICAgICAgICAgICBudW06IDIsXG4gICAgICAgICAgICBwb3NpdGlvbjp7eDogdGhpcy54LCB5OiB0aGlzLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiBncm91bmQuZGVsdGFYLCB5OiBncm91bmQuZGVsdGFZLCBkZWNheTogMC45fSxcbiAgICAgICAgfSk7XG4gICAgfSxcbn0pO1xuXG59KTtcbiIsIi8qXG4gKiAgc2hvdGxheWVyLmpzXG4gKiAgMjAxNS8xMS8xN1xuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiU2hvdExheWVyXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgbWF4OiA2NCxcbiAgICAgICAgcG9vbCA6IG51bGwsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMucG9vbCA9IEFycmF5LnJhbmdlKDAsIHRoaXMubWF4KS5tYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYiA9IFNob3QoKTtcbiAgICAgICAgICAgIGIuc2hvdExheWVyID0gc2VsZjtcbiAgICAgICAgICAgIHJldHVybiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/lvL7mipXlhaVcbiAgICBlbnRlclNob3Q6IGZ1bmN0aW9uKHgsIHksIG9wdGlvbikge1xuICAgICAgICB2YXIgYiA9IHRoaXMucG9vbC5zaGlmdCgpO1xuICAgICAgICBpZiAoIWIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlNob3QgZW1wdHkhIVwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGIuc2V0dXAob3B0aW9uKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICByZXR1cm4gYjtcbiAgICB9LFxuXG4gICAgLy/lvL7jgpLmtojljrtcbiAgICBlcmFjZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGIgPSBsaXN0W2ldO1xuICAgICAgICAgICAgYi5lcmFzZSgpO1xuICAgICAgICAgICAgYi5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgY29udGludWVzY2VuZS5qc1xuICogIDIwMTYvMDMvMjlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4gXG5waGluYS5kZWZpbmUoXCJDb250aW51ZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiVWJ1bnR1TW9ub1wiLFxuICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGN1cnJlbnRTY2VuZSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IGN1cnJlbnRTY2VuZTtcbiAgICAgICAgdGhpcy55ZXMgPSB0cnVlO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1cqMC42LFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gqMC4zLFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsMCwwLDAuNylcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDAsMCwwLDAuNylcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcblxuICAgICAgICAvL+mBuOaKnuOCq+ODvOOCveODq1xuICAgICAgICB2YXIgcGFyYW0yID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyowLjE1LFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gqMC4xLFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsMjAwLDIwMCwwLjUpXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmdiYSgwLDIwMCwyMDAsMC41KVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmN1cnNvbCA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0yKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNCwgU0NfSCowLjU1KVxuXG4gICAgICAgIC8v44K/44OD44OB55So44Kr44O844K944OrXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5jdXJzb2wxID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbTIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC40LCBTQ19IKjAuNTUpXG4gICAgICAgICAgICAuc2V0SW50ZXJhY3RpdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMuY3Vyc29sMS5hbHBoYSA9IDA7XG4gICAgICAgIHRoaXMuY3Vyc29sMS5vbnBvaW50ZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhhdC55ZXMpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdvdG9Db250aW51ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnNvbC50d2VlbmVyLmNsZWFyKCkubW92ZVRvKFNDX1cqMC40LCBTQ19IKjAuNTUsIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgdGhhdC55ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJzb2wyID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbTIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC42LCBTQ19IKjAuNTUpXG4gICAgICAgICAgICAuc2V0SW50ZXJhY3RpdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMuY3Vyc29sMi5hbHBoYSA9IDA7XG4gICAgICAgIHRoaXMuY3Vyc29sMi5vbnBvaW50ZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIXRoYXQueWVzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nb3RvR2FtZW92ZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJzb2wudHdlZW5lci5jbGVhcigpLm1vdmVUbyhTQ19XKjAuNiwgU0NfSCowLjU1LCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIHRoYXQueWVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Kz44Oz44OG44Kj44OL44Ol44O86KGo56S6XG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiQ09OVElOVUU/XCJ9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNDApO1xuXG4gICAgICAgIHRoaXMubHllcyA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiWUVTXCJ9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC40LCBTQ19IKjAuNTUpO1xuICAgICAgICB0aGlzLmx5ZXMuYmxpbmsgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5seWVzLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsaW5rICYmIGUudGlja2VyLmZyYW1lICUgMTAgPT0gMCkgdGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG5vID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJOT1wifS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNiwgU0NfSCowLjU1KTtcbiAgICAgICAgdGhpcy5sbm8uYmxpbmsgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sbm8udXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxpbmsgJiYgZS50aWNrZXIuZnJhbWUgJSAxMCA9PSAwKSB0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jgqvjgqbjg7Pjgr/ooajnpLpcbiAgICAgICAgdGhpcy5jb3VudGVyID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCI5XCIsIGZvbnRTaXplOiAzMH0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC40NSk7XG4gICAgICAgIHRoaXMuY291bnRlci5jb3VudCA9IDk7XG4gICAgICAgIHRoaXMuY291bnRlci50d2VlbmVyLmNsZWFyKCkud2FpdCgxMDAwKS5jYWxsKGZ1bmN0aW9uKCkge3RoaXMuY291bnQtLTt9LmJpbmQodGhpcy5jb3VudGVyKSkuc2V0TG9vcCh0cnVlKTtcbiAgICAgICAgdGhpcy5jb3VudGVyLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJcIit0aGlzLmNvdW50O1xuICAgICAgICAgICAgaWYgKHRoaXMuY291bnQgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50U2NlbmUuZmxhcmUoXCJnYW1lb3ZlclwiKTtcbiAgICAgICAgICAgICAgICBhcHAucG9wU2NlbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWUgPSAwOyAgICAgICAgXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQpIHJldHVybjtcblxuICAgICAgICAvL+OCreODvOODnOODvOODieaTjeS9nFxuICAgICAgICB2YXIgY3QgPSBhcHAuY29udHJvbGxlcjtcbiAgICAgICAgaWYgKGN0LmxlZnQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy55ZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbC50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLm1vdmVUbyhTQ19XKjAuNCwgU0NfSCowLjU1LCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMueWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjdC5yaWdodCkge1xuICAgICAgICAgICAgaWYgKHRoaXMueWVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIC5tb3ZlVG8oU0NfVyowLjYsIFNDX0gqMC41NSwgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnllcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGltZSA+IDMwKSB7XG4gICAgICAgICAgICBpZiAoY3Qub2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJjbGlja1wiKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy55ZXMpIHsgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ290b0NvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb3RvR2FtZW92ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgfSxcblxuICAgIGdvdG9Db250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubHllcy5ibGluayA9IHRydWU7XG4gICAgICAgIHRoaXMuY3VycmVudFNjZW5lLmZsYXJlKFwiY29udGludWVcIik7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLndhaXQoMTAwMCkuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFwcC5wb3BTY2VuZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdvdG9HYW1lb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubG5vLmJsaW5rID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUuZmxhcmUoXCJnYW1lb3ZlclwiKTtcbiAgICAgICAgYXBwLnBvcFNjZW5lKCk7XG4gICAgfSxcbn0pO1xuXG4iLCIvKlxuICogIEdhbWVPdmVyU2NlbmUuanNcbiAqICAyMDE0LzA2LzA0XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiR2FtZU92ZXJTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuICAgIFxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgLy/jg6njg5njg6vnlKjjg5Hjg6njg6Hjg7zjgr9cbiAgICAgICAgdGl0bGVQYXJhbToge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibHVlXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAzMixcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgICAgIG1zZ1BhcmFtOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCxcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJnID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLmJnLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJHQU1FIE9WRVJcIn0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KTtcblxuICAgICAgICB0aGlzLm1hc2sgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMubWFzay50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpLmZhZGVPdXQoMzApO1xuXG4gICAgICAgIC8v77yi77yn77yt57WC5LqG5pmC44Gr44K344O844Oz44KS5oqc44GR44KLXG4gICAgICAgIGFwcC5wbGF5QkdNKFwiZ2FtZW92ZXJcIiwgZmFsc2UsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5leGl0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgLy/jgq3jg7zjg5zjg7zjg4nmk43kvZxcbiAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAzMCkge1xuICAgICAgICAgICAgaWYgKGN0Lm9rIHx8IGN0LmNhbmNlbCkge1xuICAgICAgICAgICAgICAgIGFwcC5zdG9wQkdNKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5leGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/plovlp4vlh6bnkIZcbiAgICBvbnBvaW50c3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB9LFxuXG4gICAgLy/jgr/jg4Pjg4FvcuOCr+ODquODg+OCr+enu+WLleWHpueQhlxuICAgIG9ucG9pbnRtb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/ntYLkuoblh6bnkIZcbiAgICBvbnBvaW50ZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAzMCkge1xuICAgICAgICAgICAgYXBwLnN0b3BCR00oKTtcbiAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBMb2FkaW5nU2NlbmUuanNcbiAqICAyMDE1LzA5LzA4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL+OCouOCu+ODg+ODiOODreODvOODieeUqOOCt+ODvOODs1xucGhpbmEuZGVmaW5lKFwiTG9hZGluZ1NjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMuYXNzZXRUeXBlID0gb3B0aW9ucy5hc3NldFR5cGUgfHwgXCJjb21tb25cIjtcbiAgICAgICAgb3B0aW9ucyA9IChvcHRpb25zfHx7fSkuJHNhZmUoe1xuICAgICAgICAgICAgYXNzZXQ6IEFwcGxpY2F0aW9uLmFzc2V0c1tvcHRpb25zLmFzc2V0VHlwZV0sXG4gICAgICAgICAgICB3aWR0aDogU0NfVyxcbiAgICAgICAgICAgIGhlaWdodDogU0NfSCxcbiAgICAgICAgICAgIGxpZTogZmFsc2UsXG4gICAgICAgICAgICBleGl0VHlwZTogXCJhdXRvXCIsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gsXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIC8v44Ot44O844OJ44GZ44KL54mp44GM54Sh44GE5aC05ZCI44K544Kt44OD44OXXG4gICAgICAgIHRoaXMuZm9yY2VFeGl0ID0gZmFsc2U7XG4gICAgICAgIHZhciBhc3NldCA9IG9wdGlvbnMuYXNzZXQ7XG4gICAgICAgIGlmICghYXNzZXQuJGhhcyhcInNvdW5kXCIpICYmICFhc3NldC4kaGFzKFwiaW1hZ2VcIikgJiYgIWFzc2V0LiRoYXMoXCJmb250XCIpICYmICFhc3NldC4kaGFzKFwic3ByaXRlc2hlZXRcIikgJiYgIWFzc2V0LiRoYXMoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VFeGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYWJlbFBhcmFtID0ge1xuICAgICAgICAgICAgdGV4dDogXCJMb2FkaW5nXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMzBcbiAgICAgICAgfTtcbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbChsYWJlbFBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpO1xuXG4gICAgICAgIHRoaXMuZnJvbUpTT04oe1xuICAgICAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICAgICAgICBnYXVnZToge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdwaGluYS51aS5HYXVnZScsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCowLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBnYXVnZUNvbG9yOiAnYmx1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmdyaWRYLmNlbnRlcigpLFxuICAgICAgICAgICAgICAgICAgICB5OiBTQ19IKjAuNSsyMCxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luWTogMCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdhdWdlLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2F1Z2VDb2xvciA9ICdoc2xhKHswfSwgMTAwJSwgNTAlLCAwLjgpJy5mb3JtYXQoZS50aWNrZXIuZnJhbWUqMyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgICAgaWYgKG9wdGlvbnMubGllKSB7XG4gICAgICAgICAgICB0aGlzLmdhdWdlLmFuaW1hdGlvblRpbWUgPSAxMCoxMDAwO1xuICAgICAgICAgICAgdGhpcy5nYXVnZS52YWx1ZSA9IDkwO1xuICAgICAgICAgICAgbG9hZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2F1Z2UuYW5pbWF0aW9uVGltZSA9IDEqMTAwMDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhdWdlLnZhbHVlID0gMTAwO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9hZGVyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXVnZS52YWx1ZSA9IGUucHJvZ3Jlc3MqMTAwO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2F1Z2Uub25mdWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5leGl0VHlwZSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAuX29uTG9hZEFzc2V0cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgbG9hZGVyLmxvYWQob3B0aW9ucy5hc3NldCk7XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5mb3JjZUV4aXQpIHRoaXMuZXhpdCgpO1xuICAgIH0sICAgIFxufSk7XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTUvMDkvMDhcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIk1haW5TY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICAvL+OCt+ODvOODs+WGheioreWumlxuICAgICAgICBib21iVGltZTogMCwgICAgLy/jg5zjg6Dlirnmnpzntpnntprmrovjgorjg5Xjg6zjg7zjg6DmlbBcbiAgICAgICAgdGltZVZhbmlzaDogMCwgIC8v5by+5raI44GX5pmC6ZaTXG5cbiAgICAgICAgLy/nj77lnKjjgrnjg4bjg7zjgrjvvKnvvKRcbiAgICAgICAgc3RhZ2VJZDogMSxcbiAgICAgICAgbWF4U3RhZ2VJZDogMixcblxuICAgICAgICAvL+ODl+ODqeOCr+ODhuOCo+OCueODouODvOODieODleODqeOCsFxuICAgICAgICBpc1ByYWN0aWNlOiBmYWxzZSxcblxuICAgICAgICAvL+OCueODhuODvOOCuOOCr+ODquOCouODleODqeOCsFxuICAgICAgICBpc1N0YWdlQ2xlYXI6IGZhbHNlLFxuXG4gICAgICAgIC8v44Ky44O844Og44Kq44O844OQ44O844OV44Op44KwXG4gICAgICAgIGlzR2FtZU92ZXI6IGZhbHNlLFxuXG4gICAgICAgIC8v44Oc44K55oim6ZeY5Lit44OV44Op44KwXG4gICAgICAgIGlzQm9zc0JhdHRsZTogZmFsc2UsXG4gICAgICAgIGJvc3NPYmplY3Q6IG51bGwsXG5cbiAgICAgICAgLy/lkITnqK7liKTlrprnlKhcbiAgICAgICAgbWlzc0NvdW50OiAwLCAgICAgICAvL+ODl+ODrOOCpOODpOODvOe3j+ODn+OCueWbnuaVsFxuICAgICAgICBzdGFnZU1pc3NDb3VudDogMCwgIC8v44OX44Os44Kk44Ok44O844K544OG44O844K45YaF44Of44K55Zue5pWwXG5cbiAgICAgICAgLy/mlbXplqLpgKMgICAgICAgIFxuICAgICAgICBlbmVteUNvdW50OiAwLCAgLy/mlbXnt4/mlbBcbiAgICAgICAgZW5lbXlLaWxsOiAwLCAgIC8v5pW156C05aOK5pWwXG4gICAgICAgIGVuZW15SUQ6IDAsICAgICAvL+aVteitmOWIpeWtkFxuXG4gICAgICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibHVlXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAzMixcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlbGFiZWxQYXJhbToge1xuICAgICAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcImJsYWNrXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMSxcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJVYnVudHVNb25vXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh7c3RhZ2VJZDogMX0pO1xuICAgICAgICB0aGlzLnN0YWdlSWQgPSBvcHRpb24uc3RhZ2VJZDtcbiAgICAgICAgdGhpcy5pc1ByYWN0aWNlID0gKG9wdGlvbi5pc1ByYWN0aWNlID09IHVuZGVmaW5lZCk/IGZhbHNlOiBvcHRpb24uaXNQcmFjdGljZTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gsXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIC8v44Ko44OV44Kn44Kv44OI44OX44O844OrXG4gICAgICAgIHZhciBlZmZlY3RQb29sID0gRWZmZWN0UG9vbCgyMDQ4LCB0aGlzKTtcblxuICAgICAgICAvL+ODl+ODrOOCpOODpOODvOaDheWgseWIneacn+WMllxuICAgICAgICBhcHAuc2NvcmUgPSAwO1xuICAgICAgICBhcHAucmFuayA9IDFcbiAgICAgICAgYXBwLm51bUNvbnRpbnVlID0gMDtcbiAgICAgICAgYXBwLnNldHRpbmcuJGV4dGVuZChhcHAuY3VycmVudHJ5U2V0dGluZyk7XG5cbiAgICAgICAgLy/jg6zjgqTjg6Tjg7zmupblgplcbiAgICAgICAgdGhpcy5iYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcykuc2V0UG9zaXRpb24oU0NfT0ZGU0VUX1gsIDApO1xuICAgICAgICB0aGlzLmxheWVycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IExBWUVSX1NZU1RFTSsxOyBpKyspIHtcbiAgICAgICAgICAgIHN3aXRjaCAoaSkge1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfQlVMTEVUOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVyc1tpXSA9IEJ1bGxldExheWVyKCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldExheWVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfU0hPVDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSBTaG90TGF5ZXIoKS5hZGRDaGlsZFRvKHRoaXMuYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvdExheWVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfRUZGRUNUX1VQUEVSOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVyc1tpXSA9IEVmZmVjdExheWVyKGVmZmVjdFBvb2wpLmFkZENoaWxkVG8odGhpcy5iYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RMYXllclVwcGVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfRUZGRUNUX01JRERMRTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSBFZmZlY3RMYXllcihlZmZlY3RQb29sKS5hZGRDaGlsZFRvKHRoaXMuYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0TGF5ZXJNaWRkbGUgPSB0aGlzLmxheWVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBMQVlFUl9FRkZFQ1RfTE9XRVI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldID0gRWZmZWN0TGF5ZXIoZWZmZWN0UG9vbCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdExheWVyTG93ZXIgPSB0aGlzLmxheWVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBMQVlFUl9TSEFET1c6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcy5iYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgLy/lnLDlvaLjgajlvbHjg6zjgqTjg6Tjg7zjga7jgb/nm67pmqDjgZdcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91bmRNYXNrID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYmFzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VuZE1hc2sudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91bmRNYXNrLnR3ZWVuZXIuY2xlYXIoKS5mYWRlT3V0KDIwKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0ucGFyZW50U2NlbmUgPSB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5fjg6zjgqTjg6Tjg7zmupblgplcbiAgICAgICAgdmFyIHBsYXllciA9IHRoaXMucGxheWVyID0gUGxheWVyKClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuYWRkU2hhZG93KClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgICAgICAuc3RhZ2VTdGFydHVwKCk7XG4gICAgICAgIHBsYXllci5zaG90TGF5ZXIgPSB0aGlzLnNob3RMYXllcjtcbiAgICAgICAgYXBwLnBsYXllciA9IHRoaXMucGxheWVyO1xuXG4vLyAgICAgICAgdGhpcy5wb2ludGVyID0gUGxheWVyUG9pbnRlcigpLmFkZENoaWxkVG8odGhpcyk7XG4vLyAgICAgICAgdGhpcy5wb2ludGVyLnBsYXllciA9IHRoaXMucGxheWVyO1xuXG4gICAgICAgIC8v5by+5bmV6Kit5a6a44Kv44Op44K5XG4gICAgICAgIEJ1bGxldENvbmZpZy5zZXR1cChwbGF5ZXIsIHRoaXMuYnVsbGV0TGF5ZXIpO1xuXG4gICAgICAgIC8v44K344K544OG44Og6KGo56S644OZ44O844K5XG4gICAgICAgIHRoaXMuc3lzdGVtQmFzZSA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoKS5hZGRDaGlsZFRvKHRoaXMuYmFzZSk7XG5cbiAgICAgICAgLy/jg5zjgrnogJDkuYXlipvjgrLjg7zjgrhcbiAgICAgICAgdmFyIGdhdWdlU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogU0NfVyowLjksXG4gICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiAncmdiYSgwLCAwLCAyMDAsIDEuMCknLFxuICAgICAgICAgICAgICAgIGVtcHR5OiAncmdiYSgwLCAwLCAwLCAwLjApJyxcbiAgICAgICAgICAgICAgICBzdHJva2U6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvc3NHYXVnZSA9IHBoaW5hLmV4dGVuc2lvbi5HYXVnZShnYXVnZVN0eWxlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCAtMTApXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpO1xuXG4gICAgICAgIC8v44K544Kz44Ki6KGo56S6XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDpcIlNDT1JFOlwifS4kc2FmZSh0aGlzLnNjb3JlbGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMTAsIDEwKTtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsLnMgPSAwO1xuICAgICAgICB0aGlzLnNjb3JlTGFiZWwudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKGUudGlja2VyLmZyYW1lJTEwID09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnMgPSB+figoYXBwLnNjb3JlLXRoaXMuc2NvcmUpLzcpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnMgPCAzKSB0aGlzLnMgPSAzO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnMgPiA3Nzc3KSB0aGlzLnMgPSA3Nzc3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zY29yZSArPSB0aGlzLnM7XG4gICAgICAgICAgICBpZiAodGhpcy5zY29yZSA+IGFwcC5zY29yZSkgdGhpcy5zY29yZSA9IGFwcC5zY29yZTtcblxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJTQ09SRSBcIit0aGlzLnNjb3JlLmNvbW1hKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODqeODs+OCr+ihqOekulxuICAgICAgICB0aGlzLnJhbmtMYWJlbCA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6XCJSQU5LOlwifS4kc2FmZSh0aGlzLnNjb3JlbGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMTAsIDMwKTtcbiAgICAgICAgdGhpcy5yYW5rTGFiZWwudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRleHQgPSBcIlJBTksgXCIrYXBwLnJhbms7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy/mrovmqZ/ooajnpLpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zcHJpdGUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImd1bnNoaXBcIiwgNDgsIDQ4KVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuc3lzdGVtQmFzZSlcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVJbmRleCg0KVxuICAgICAgICAgICAgICAgIC5zZXRTY2FsZSgwLjMpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKGkqMTYrMTYsIDQ4KTtcbiAgICAgICAgICAgIHMubnVtID0gaTtcbiAgICAgICAgICAgIHMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgcy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXBwLnNldHRpbmcuemFua2ktMSA+IHRoaXMubnVtKSB0aGlzLnZpc2libGUgPSB0cnVlOyBlbHNlIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/mrovjg5zjg6DooajnpLpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zcHJpdGUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImJvbWJcIiwgOTYsIDk2KVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuc3lzdGVtQmFzZSlcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgICAgIC5zZXRTY2FsZSgwLjE2KVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihpKjE2KzE2LCA2NCk7XG4gICAgICAgICAgICBzLm51bSA9IGk7XG4gICAgICAgICAgICBzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFwcC5zZXR0aW5nLmJvbWJTdG9ja01heCA+IHRoaXMubnVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcHAuc2V0dGluZy5ib21iU3RvY2sgPiB0aGlzLm51bSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDEuMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAwLjQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbHBhcmFtID0ge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiQlwiLFxuICAgICAgICAgICAgICAgIGZpbGw6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMzIsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKGxwYXJhbSkuYWRkQ2hpbGRUbyhzKS5zZXRTY2FsZSgyLjUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5zjg6Djg5zjgr/jg7NcbiAgICAgICAgdGhpcy5idXR0b25Cb21iID0gcGhpbmEuZXh0ZW5zaW9uLkNpcmNsZUJ1dHRvbih7cmFkaXVzOiAxNn0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMjAsIFNDX0gqMC45KTtcblxuICAgICAgICAvL+ebrumaoOOBl++8iOm7ku+8iVxuICAgICAgICB0aGlzLm1hc2sgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpO1xuICAgICAgICB0aGlzLm1hc2sudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcbiAgICAgICAgdGhpcy5tYXNrLnR3ZWVuZXIuY2xlYXIoKS5mYWRlT3V0KDIwKTtcblxuICAgICAgICAvL+ebrumaoOOBl++8iOeZve+8iVxuICAgICAgICB0aGlzLm1hc2tXaGl0ZSA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0uJGV4dGVuZCh7ZmlsbDogXCJ3aGl0ZVwifSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSk7XG4gICAgICAgIHRoaXMubWFza1doaXRlLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgIHRoaXMubWFza1doaXRlLmFscGhhID0gMC4wO1xuXG4gICAgICAgIC8v44K544OG44O844K45Yid5pyf5YyWXG4gICAgICAgIHRoaXMuaW5pdFN0YWdlKCk7XG5cbiAgICAgICAgLy/jgqTjg5njg7Pjg4jlh6bnkIZcbiAgICAgICAgLy/jg5zjgrnmiKbplovlp4tcbiAgICAgICAgdGhpcy5vbignc3RhcnRfYm9zcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pc0Jvc3NCYXR0bGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zeXN0ZW1CYXNlLnR3ZWVuZXIuY2xlYXIoKS50byh7eTogMjB9LCAxMDAwKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+ODnOOCueaSg+egtFxuICAgICAgICB0aGlzLm9uKCdlbmRfYm9zcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pc0Jvc3NCYXR0bGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3lzdGVtQmFzZS50d2VlbmVyLmNsZWFyKCkudG8oe3k6IDB9LCAxMDAwKTtcblxuICAgICAgICAgICAgLy/jg5zjgrnjgr/jgqTjg5fliKTlrppcbiAgICAgICAgICAgIGlmICh0aGlzLmJvc3NPYmplY3QudHlwZSA9PSBFTkVNWV9NQk9TUykge1xuICAgICAgICAgICAgICAgIC8v5Lit44Oc44K544Gu5aC05ZCI5pep5Zue44GXXG4gICAgICAgICAgICAgICAgdmFyIHRpbWUgPSB0aGlzLnN0YWdlLmdldE5leHRFdmVudFRpbWUodGhpcy50aW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodGltZSA+IDApIHRoaXMudGltZSA9IHRpbWUtMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy/jgrnjg4bjg7zjgrjjg5zjgrnjga7loLTlkIjjgrnjg4bjg7zjgrjjgq/jg6rjgqJcbiAgICAgICAgICAgICAgICB0aGlzLmZsYXJlKCdzdGFnZWNsZWFyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJvc3NPYmplY3QgPSBudWxsO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v44K544OG44O844K444Kv44Oq44KiXG4gICAgICAgIHRoaXMub24oJ3N0YWdlY2xlYXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8v44OX44Os44Kk44Ok44K344On44OD44OI44Kq44OV44O75b2T44Gf44KK5Yik5a6a54Sh44GXXG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc1Nob3RPSyAgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQ29sbGlzaW9uICA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvL++8ke+8kOenkuW+jOOBq+ODquOCtuODq+ODiOWHpueQhlxuICAgICAgICAgICAgcGhpbmEuYXBwLk9iamVjdDJEKCkuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgIC50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAud2FpdCgxMDAwMClcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v44Kz44Oz44OG44Kj44OL44Ol44O85pmCXG4gICAgICAgIHRoaXMub24oXCJjb250aW51ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFwcC5udW1Db250aW51ZSsrO1xuXG4gICAgICAgICAgICAvL+WIneacn+eKtuaFi+OBuOaIu+OBmVxuICAgICAgICAgICAgYXBwLnNjb3JlID0gMDtcbiAgICAgICAgICAgIGFwcC5yYW5rID0gMTtcbiAgICAgICAgICAgIGFwcC5zZXR0aW5nLnphbmtpID0gYXBwLmN1cnJlbnRyeVNldHRpbmcuemFua2k7XG4gICAgICAgICAgICBhcHAuc2V0dGluZy5ib21iU3RvY2sgPSBhcHAuc2V0dGluZy5ib21iU3RvY2tNYXg7XG5cbiAgICAgICAgICAgIHRoaXMucGxheWVyLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc3RhcnR1cCgpO1xuICAgICAgICAgICAgdGhpcy5zY29yZUxhYmVsLnNjb3JlID0gMDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+OCsuODvOODoOOCquODvOODkOODvOaZglxuICAgICAgICB0aGlzLm9uKFwiZ2FtZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAuc3RvcEJHTSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNQcmFjdGljZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdChcIm1lbnVcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdChcImdhbWVvdmVyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgLy/jgrnjg4bjg7zjgrjpgLLooYxcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5zdGFnZS5nZXQodGhpcy50aW1lKTtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mKGV2ZW50LnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnZhbHVlLmNhbGwodGhpcywgZXZlbnQub3B0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRlckVuZW15VW5pdChldmVudC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODnuODg+ODl+OCquODluOCuOOCp+OCr+ODiOWIpOWumlxuICAgICAgICBpZiAodGhpcy5tYXBPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciBzeCA9IFNDX1cqMC41O1xuICAgICAgICAgICAgdmFyIHN5ID0gU0NfSCowLjI7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuZ3JvdW5kLm1hcEJhc2UueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5ncm91bmQubWFwQmFzZS55O1xuICAgICAgICAgICAgdmFyIGxlbiA9IHRoaXMubWFwT2JqZWN0Lm9iamVjdHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSB0aGlzLm1hcE9iamVjdC5vYmplY3RzW2ldO1xuICAgICAgICAgICAgICAgIGlmICghb2JqLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v56+E5Zuy5YaF44Gr44GC44KL44GL5Yik5a6aXG4gICAgICAgICAgICAgICAgICAgIHZhciBkeCA9IHggKyBvYmoueDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR5ID0geSArIG9iai55O1xuICAgICAgICAgICAgICAgICAgICBpZiAoLXN4IDwgZHggJiYgZHggPCBTQ19XK3N4ICYmIC1zeSA8IGR5ICYmIGR5IDwgU0NfSCtzeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/mlbXjgq3jg6Pjg6njgq/jgr/mipXlhaVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoudHlwZSA9PSBcImVuZW15XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbXlVbml0W29iai5uYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL+Wwj+maiuaKleWFpVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGVyRW5lbXlVbml0KG9iai5uYW1lLCBvYmoucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/ljZjkvZPmipXlhaVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5wcm9wZXJ0aWVzLiRoYXMoXCJvZmZzZXR4XCIpKSBkeCArPSBvYmoucHJvcGVydGllcy5vZmZzZXR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnByb3BlcnRpZXMuJGhhcyhcIm9mZnNldHlcIikpIGR5ICs9IG9iai5wcm9wZXJ0aWVzLm9mZnNldHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50ZXJFbmVteShvYmoubmFtZSwgZHgsIGR5LCBvYmoucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy/jgqTjg5njg7Pjg4jlh6bnkIZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoudHlwZSA9PSBcImV2ZW50XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSB0aGlzLnN0YWdlLmdldEV2ZW50KG9iai5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGV2ZW50LnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC52YWx1ZS5jYWxsKHRoaXMsIG9iai5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmouZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5zjg6DlirnmnpxcbiAgICAgICAgaWYgKHRoaXMuYm9tYlRpbWUgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvbWJUaW1lLS07XG4gICAgICAgICAgICB0aGlzLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgICAgICB0aGlzLmFkZEVuZW15RGFtYWdlKDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5by+5raI44GXXG4gICAgICAgIGlmICh0aGlzLnRpbWVWYW5pc2ggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVWYW5pc2gtLTtcbiAgICAgICAgICAgIHRoaXMuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Ky44O844Og44Kq44O844OQ44O85Yem55CGXG4gICAgICAgIGlmICh0aGlzLmlzR2FtZU92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNHYW1lT3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuaXNDb250cm9sID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgY29zID0gQ29udGludWVTY2VuZSh0aGlzKTtcbiAgICAgICAgICAgIHBoaW5hLmFwcC5PYmplY3QyRCgpLmFkZENoaWxkVG8odGhpcykudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgLndhaXQoMjAwMClcbiAgICAgICAgICAgICAgICAuY2FsbCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5wdXNoU2NlbmUoY29zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Oc44K55L2T5Yqb44Ky44O844K46Kit5a6aXG4gICAgICAgIGlmICh0aGlzLmJvc3NPYmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuYm9zc0dhdWdlLnNldFZhbHVlKHRoaXMuYm9zc09iamVjdC5kZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jgqjjgq/jgrnjg4bjg7Pjg4njg4Hjgqfjg4Pjgq9cbiAgICAgICAgdmFyIGV4dGVuZFNjb3JlID0gYXBwLmV4dGVuZFNjb3JlW2FwcC5leHRlbmRBZHZhbmNlXTtcbiAgICAgICAgaWYgKGFwcC5pc0V4dGVuZEV2ZXJ5KSB7XG4gICAgICAgICAgICBleHRlbmRTY29yZSA9IGFwcC5leHRlbmRFdmVyeVNjb3JlICogKGFwcC5leHRlbmRBZHZhbmNlICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dGVuZFNjb3JlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGFwcC5zY29yZSA+IGV4dGVuZFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgYXBwLmV4dGVuZEFkdmFuY2UrKztcbiAgICAgICAgICAgICAgICBhcHAuc2V0dGluZy56YW5raSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgIHZhciBrYiA9IGFwcC5rZXlib2FyZDtcbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZC5nZXRLZXkoXCJWXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZC5nZXRLZXkoXCJEXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldERvbWluYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQuZ2V0S2V5VXAoXCJQXCIpIHx8IGFwcC5rZXlib2FyZC5nZXRLZXkoXCJlc2NhcGVcIikgfHwgY3Quc3RhcnQpIHtcbiAgICAgICAgICAgIGFwcC5wdXNoU2NlbmUoUGF1c2VTY2VuZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICAvL+OCueODhuODvOOCuOWIneacn+WMllxuICAgIGluaXRTdGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhZ2UpIHRoaXMuc3RhZ2UgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5tYXBPYmplY3QpIHRoaXMubWFwT2JqZWN0ID0gbnVsbDtcblxuICAgICAgICAvL+OCueODhuODvOOCuOmAsuihjOOBqOiDjOaZr+i/veWKoFxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhZ2VJZCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UgPSBTdGFnZTEodGhpcywgdGhpcy5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdW5kID0gU3RhZ2UxR3JvdW5kKCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlID0gU3RhZ2UyKHRoaXMsIHRoaXMucGxheWVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VuZCA9IFN0YWdlMkdyb3VuZCgpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZSA9IFN0YWdlMyh0aGlzLCB0aGlzLnBsYXllcik7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91bmQgPSBTdGFnZTNHcm91bmQoKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgIC8v44OG44K544OI55So44K544OG44O844K4XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZSA9IFN0YWdlOSh0aGlzLCB0aGlzLnBsYXllcik7XG4vLyAgICAgICAgICAgICAgICB0aGlzLm1hcE9iamVjdCA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RteCcsIFwibWFwMV9lbmVteVwiKS5nZXRPYmplY3RHcm91cChcIkVuZW15TGF5ZXJcIilbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91bmQgPSBTdGFnZTlHcm91bmQoKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgdGhpcy50aW1lVmFuaXNoID0gMDtcbiAgICAgICAgdGhpcy5lbmVteUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5lbmVteUtpbGwgPSAwO1xuICAgICAgICB0aGlzLmVuZW15SUQgPSAwO1xuICAgICAgICB0aGlzLnN0YWdlTWlzc0NvdW50ID0gMDtcblxuICAgICAgICAvL+WcsOW9oua2iOWOu+eUqOODnuOCueOCr1xuICAgICAgICB0aGlzLmdyb3VuZE1hc2sudHdlZW5lci5jbGVhcigpLmZhZGVPdXQoMjApO1xuXG4gICAgICAgIC8v44K544OG44O844K455Wq5Y+36KGo56S6XG4gICAgICAgIHZhciBwYXJhbSA9IHt0ZXh0OiBcIlNUQUdFIFwiK3RoaXMuc3RhZ2VJZCwgZmlsbDpcIndoaXRlXCIsIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhc2VsaW5lOiBcIm1pZGRsZVwiLCBmb250V2VpZ2h0OiA2MDAsIG91dGxpbmVXaWR0aDogMn07XG4gICAgICAgIHZhciBtMSA9IHBoaW5hLmRpc3BsYXkuTGFiZWwocGFyYW0sIDUwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIG0xLmFscGhhID0gMDtcbiAgICAgICAgbTEudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcbiAgICAgICAgbTEudHdlZW5lci53YWl0KDMwKS5mYWRlSW4oMTUpLndhaXQoMTcxKS5mYWRlT3V0KDE1KS5jYWxsKGZ1bmN0aW9uKCl7dGhpcy5yZW1vdmUoKX0uYmluZChtMSkpO1xuXG4gICAgICAgIC8v44K544OG44O844K45ZCN6KGo56S6XG4gICAgICAgIHZhciBuYW1lID0gQXBwbGljYXRpb24uc3RhZ2VOYW1lW3RoaXMuc3RhZ2VJZF0gfHwgXCJQcmFjdGljZVwiO1xuICAgICAgICB2YXIgcGFyYW0gPSB7dGV4dDogXCJfXCIsIGZpbGw6XCJ3aGl0ZVwiLCBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsIGFsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTogXCJtaWRkbGVcIiwgZm9udFNpemU6IDE2LCBmb250V2VpZ2h0OiAyMDAsIG91dGxpbmVXaWR0aDogMn07XG4gICAgICAgIHZhciBtMiA9IHBoaW5hLmRpc3BsYXkuTGFiZWwocGFyYW0sIDUwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjU1KVxuICAgICAgICBtMi5hbHBoYSA9IDA7XG4gICAgICAgIG0yLmNvbCA9IDA7XG4gICAgICAgIG0yLm1heCA9IG5hbWUubGVuZ3RoO1xuICAgICAgICBtMi50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuICAgICAgICBtMi50d2VlbmVyXG4gICAgICAgICAgICAud2FpdCgzMClcbiAgICAgICAgICAgIC5mYWRlSW4oNilcbiAgICAgICAgICAgIC50byh7Y29sOiBtMi5tYXh9LCA2MClcbiAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgIC5mYWRlT3V0KDE1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnJlbW92ZSgpfS5iaW5kKG0yKSk7XG4gICAgICAgIG0yLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gbmFtZS5zdWJzdHJpbmcoMCwgfn50aGlzLmNvbCkrXCJfXCI7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVuZFJlc3VsdCA9IGZhbHNlO1xuICAgICAgICB2YXIgbG9hZGNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBsb2FkcHJvZ3Jlc3MgPSAwO1xuXG4gICAgICAgIC8v5qyh44K544OG44O844K444Gu44Ki44K744OD44OI44KS44OQ44OD44Kv44Kw44Op44Km44Oz44OJ44Gn6Kqt44G/6L6844G/XG4gICAgICAgIGlmICghdGhpcy5pc1ByYWN0aWNlICYmIHRoaXMuc3RhZ2VJZCA8IHRoaXMubWF4U3RhZ2VJZCkge1xuICAgICAgICAgICAgdmFyIGFzc2V0TmFtZSA9IFwic3RhZ2VcIisodGhpcy5zdGFnZUlkKzEpO1xuICAgICAgICAgICAgdmFyIGFzc2V0cyA9IEFwcGxpY2F0aW9uLmFzc2V0c1thc3NldE5hbWVdO1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgICAgICAgICBsb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICAgICAgbG9hZGVyLm9uKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGxvYWRjb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBwLl9vbkxvYWRBc3NldHMoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBsb2FkZXIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBsb2FkcHJvZ3Jlc3MgPSBlLnByb2dyZXNzO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9hZGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGxvYWRwcm9ncmVzcyA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGFiZWxQYXJhbSA9IHtcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfTtcblxuICAgICAgICAvL+OCr+ODquOCouaZgu+8ou+8p++8rVxuICAgICAgICBhcHAucGxheUJHTShcInN0YWdlY2xlYXJcIik7XG5cbiAgICAgICAgLy/lnLDlvaLmtojljrvnlKjjg57jgrnjgq9cbiAgICAgICAgdGhpcy5ncm91bmRNYXNrLnR3ZWVuZXIuY2xlYXIoKS5mYWRlSW4oMzAwKTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyoxLjUsIDApO1xuICAgICAgICBiYXNlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB9O1xuICAgICAgICBiYXNlLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLnRvKHt4OiAwfSwgNTAwLFwiZWFzZU91dFNpbmVcIilcbiAgICAgICAgICAgIC53YWl0KDUwMDApXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBlbmRSZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgfS5iaW5kKGJhc2UpKTtcbiAgICAgICAgYmFzZS5vayA9IGZhbHNlO1xuICAgICAgICBiYXNlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy/lhaXlipvjgpLlvoXjgaPjgabmrKHjgrnjg4bjg7zjgrjjgavnp7vooYxcbiAgICAgICAgICAgIGlmIChlbmRSZXN1bHQgJiYgbG9hZGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgICAgICAgICAgaWYgKGN0Lm9rIHx8IGN0LmNhbmNlbCkgdGhpcy5vayA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGFwcC5tb3VzZTtcbiAgICAgICAgICAgICAgICBpZiAocC5nZXRQb2ludGluZygpKSB0aGlzLm9rID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub2spIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN0YWdlQ2xlYXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jgrnjg4bjg7zjgrjnlarlj7fooajnpLpcbiAgICAgICAgdmFyIHRleHQxID0gXCJTVEFHRSBcIit0aGlzLnN0YWdlSWQrXCIgQ0xFQVJcIjtcbiAgICAgICAgdmFyIHJlczEgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiB0ZXh0MSwgYWxpZ246IFwiY2VudGVyXCIsIGZvbnRTaXplOiAyNX0uJHNhZmUobGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuMjUpO1xuXG4gICAgICAgIC8v44K544OG44O844K444Kv44Oq44Ki44Oc44O844OK44K56KGo56S6XG4gICAgICAgIHZhciBib251c0NsZWFyID0gdGhpcy5zdGFnZUlkKjEwMDAwMDtcbiAgICAgICAgdmFyIHJlczIgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlwifS4kc2FmZShsYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKGJhc2UpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjEsIFNDX0gqMC40KTtcbiAgICAgICAgcmVzMi5zY29yZSA9IDA7XG4gICAgICAgIHJlczIuc2NvcmVQbHVzID0gTWF0aC5mbG9vcihib251c0NsZWFyLzYwKTtcbiAgICAgICAgcmVzMi50aW1lID0gMDtcbiAgICAgICAgcmVzMi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiQ0xFQVIgQk9OVVM6IFwiK3RoaXMuc2NvcmUuY29tbWEoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPT0gNjApIGFwcC5zY29yZSArPSBib251c0NsZWFyO1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZSA+IDYwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZSArPSB0aGlzLnNjb3JlUGx1cztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29yZSA+IGJvbnVzQ2xlYXIpIHRoaXMuc2NvcmUgPSBib251c0NsZWFyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODkuODg+ODiOaVsOODnOODvOODiuOCueihqOekulxuICAgICAgICB2YXIgYm9udXNIaXQgPSB0aGlzLmVuZW15S2lsbCoxMDA7XG4gICAgICAgIHZhciByZXMzID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJcIn0uJHNhZmUobGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC4xLCBTQ19IKjAuNSk7XG4gICAgICAgIHJlczMuc2NvcmUgPSAwO1xuICAgICAgICByZXMzLnNjb3JlUGx1cyA9IE1hdGguZmxvb3IoYm9udXNIaXQvNjApO1xuICAgICAgICByZXMzLnRpbWUgPSAwO1xuICAgICAgICByZXMzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJISVQgQk9OVVM6IFwiK3RoaXMuc2NvcmUuY29tbWEoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPT0gOTApIGFwcC5zY29yZSArPSBib251c0hpdDtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPiA5MCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gdGhpcy5zY29yZVBsdXM7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmUgPiBib251c0hpdCkgdGhpcy5zY29yZSA9IGJvbnVzSGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODjuODvOODn+OCueOCr+ODquOCouODnOODvOODiuOCueihqOekulxuICAgICAgICBpZiAodGhpcy5zdGFnZU1pc3NDb3VudCA9PSAwKSB7XG4gICAgICAgICAgICB2YXIgYm9udXNOb21pc3MgPSAxMDAwMDA7XG4gICAgICAgICAgICB2YXIgcmVzNCA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiXCJ9LiRzYWZlKGxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKGJhc2UpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC4xLCBTQ19IKjAuNik7XG4gICAgICAgICAgICByZXM0LnNjb3JlID0gMDtcbiAgICAgICAgICAgIHJlczQuc2NvcmVQbHVzID0gTWF0aC5mbG9vcihib251c05vbWlzcy82MCk7XG4gICAgICAgICAgICByZXM0LnRpbWUgPSAwO1xuICAgICAgICAgICAgcmVzNC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQgPSBcIk5PIE1JU1MgQk9OVVM6IFwiK3RoaXMuc2NvcmUuY29tbWEoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lID09IDEyMCkgYXBwLnNjb3JlICs9IGJvbnVzTm9taXNzO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPiAxMjApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZSArPSB0aGlzLnNjb3JlUGx1cztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmUgPiBib251c05vbWlzcykgdGhpcy5zY29yZSA9IGJvbnVzTm9taXNzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Ot44O844OJ6YCy5o2X6KGo56S6XG4gICAgICAgIHZhciBwcm9ncmVzcyA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiXCIsIGFsaWduOiBcInJpZ2h0XCIsIGZvbnRTaXplOiAxMH0uJHNhZmUobGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC45NSwgU0NfSCowLjk1KTtcbiAgICAgICAgcHJvZ3Jlc3MudGltZSA9IDA7XG4gICAgICAgIHByb2dyZXNzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJMb2FkaW5nLi4uIFwiK01hdGguZmxvb3IobG9hZHByb2dyZXNzKjEwMCkrXCIlXCI7XG4gICAgICAgICAgICBpZiAobG9hZHByb2dyZXNzID09IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW5kUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiVEFQIG9yIFRSSUdHRVIgdG8gbmV4dCBzdGFnZVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiUGxlYXNlIHdhaXQuLi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lICUgMzAgPT0gMCkgdGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v44K544OG44O844K444Kv44Oq44Ki5Yem55CGXG4gICAgc3RhZ2VDbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v44OX44Op44Kv44OG44Kj44K55pmC44K/44Kk44OI44Or44G45oi744KLXG4gICAgICAgIGlmICh0aGlzLmlzUHJhY3RpY2UpIHtcbiAgICAgICAgICAgIGFwcC5zdG9wQkdNKCk7XG4gICAgICAgICAgICB0aGlzLmV4aXQoXCJtZW51XCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YWdlSWQgPCB0aGlzLm1heFN0YWdlSWQpIHtcbiAgICAgICAgICAgIC8v5qyh44Gu44K544OG44O844K444G4XG4gICAgICAgICAgICB0aGlzLnN0YWdlSWQrKztcbiAgICAgICAgICAgIHRoaXMuaW5pdFN0YWdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+OCquODvOODq+OCr+ODquOColxuICAgICAgICAgICAgdGhpcy5tYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC5mYWRlSW4oNjApXG4gICAgICAgICAgICAgICAgLndhaXQoNjApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhcmUoJ2dhbWVvdmVyJyk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+aVteODpuODi+ODg+ODiOWNmOS9jeOBruaKleWFpVxuICAgIGVudGVyRW5lbXlVbml0OiBmdW5jdGlvbihuYW1lLCBvcHRpb24pIHtcbiAgICAgICAgdmFyIHVuaXQgPSBlbmVteVVuaXRbbmFtZV07XG4gICAgICAgIGlmICh1bml0ID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVW5kZWZpbmVkIHVuaXQ6IFwiK25hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbiA9IHVuaXQubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZSA9IHVuaXRbaV07XG4gICAgICAgICAgICB2YXIgZW4gPSBFbmVteShlLm5hbWUsIGUueCwgZS55LCB0aGlzLmVuZW15SUQsIGUucGFyYW0pLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICBpZiAoZW4uZGF0YS50eXBlID09IEVORU1ZX0JPU1MgfHwgZW4uZGF0YS50eXBlID09IEVORU1ZX01CT1NTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib3NzR2F1Z2Uuc2V0TWF4KGVuLmRlZk1heCkuc2V0VmFsdWUoZW4uZGVmTWF4KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJvc3NPYmplY3QgPSBlbjtcbiAgICAgICAgICAgICAgICB0aGlzLmZsYXJlKCdzdGFydF9ib3NzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVuZW15SUQrKztcbiAgICAgICAgICAgIHRoaXMuZW5lbXlDb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvL+aVteWNmOS9k+OBruaKleWFpVxuICAgIGVudGVyRW5lbXk6IGZ1bmN0aW9uKG5hbWUsIHgsIHksIHBhcmFtKSB7XG4gICAgICAgIHRoaXMuZW5lbXlJRCsrO1xuICAgICAgICB0aGlzLmVuZW15Q291bnQrKztcbiAgICAgICAgcmV0dXJuIEVuZW15KG5hbWUsIHgsIHksIHRoaXMuZW5lbXlJRC0xLCBwYXJhbSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICB9LFxuXG4gICAgLy/jg5zjg6DmipXlhaVcbiAgICBlbnRlckJvbWI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5ib21iVGltZSA+IDAgfHwgYXBwLnNldHRpbmcuYm9tYlN0b2NrIDwgMSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmJvbWJUaW1lID0gOTA7XG4gICAgICAgIGFwcC5zZXR0aW5nLmJvbWJTdG9jay0tO1xuXG4gICAgICAgIHRoaXMuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcy5lZmZlY3RMYXllck1pZGRsZTtcbiAgICAgICAgdmFyIHggPSB0aGlzLnBsYXllci54O1xuICAgICAgICB2YXIgeSA9IHRoaXMucGxheWVyLnk7XG4gICAgICAgIEVmZmVjdC5lbnRlckJvbWIobGF5ZXIsIHtwb3NpdGlvbjoge3g6IHgsIHk6IHl9fSk7XG5cbiAgICAgICAgdGhpcy5hZGRFbmVteURhbWFnZSgxMDAwKTtcbiAgICAgICAgYXBwLnBsYXlTRShcImJvbWJcIik7XG4gICAgfSxcblxuICAgIC8v5pW144Gr5LiA5b6L44OA44Oh44O844K45LuY5YqgXG4gICAgYWRkRW5lbXlEYW1hZ2U6IGZ1bmN0aW9uKHBvd2VyKSB7XG4gICAgICAgIHZhciBjaGVja0xheWVycyA9IFtMQVlFUl9PQkpFQ1RfVVBQRVIsIExBWUVSX09CSkVDVF9NSURETEUsIExBWUVSX09CSkVDVF9MT1dFUl07XG5cbiAgICAgICAgLy/mlbXjgajjga7lvZPjgorliKTlrprjg4Hjgqfjg4Pjgq9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2NoZWNrTGF5ZXJzW2ldXTtcbiAgICAgICAgICAgIGxheWVyLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgICAgIGlmIChhIGluc3RhbmNlb2YgRW5lbXkgJiYgYS5pc09uU2NyZWVuKSBhLmRhbWFnZShwb3dlcik7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v5pW15by+5LiA5ous5raI5Y67XG4gICAgZXJhc2VCdWxsZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmJ1bGxldExheWVyLmVyYXNlKCk7XG4gICAgfSxcblxuICAgIC8v5by+5bmV5pKD44Gh6L+U44GXXG4gICAgYnVsbGV0RG9taW5hdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzbCA9IHRoaXMuc2hvdExheWVyO1xuICAgICAgICB0aGlzLmJ1bGxldExheWVyLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgdmFyIHJvdCA9IE1hdGguYXRhbjIoLWEudnksIC1hLnZ4KSp0b0RlZys5MDtcbiAgICAgICAgICAgIHNsLmVudGVyU2hvdChhLngsIGEueSwge3R5cGU6IDEsIHJvdGF0aW9uOiByb3QsIHBvd2VyOiAyMCwgdmVsb2NpdHk6IDV9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYnVsbGV0TGF5ZXIuZXJhc2UoKTtcbiAgICB9LFxuXG4gICAgLy9XYXJuaW5n6KGo56S6XG4gICAgZW50ZXJXYXJuaW5nOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAvL+itpuWRiumfs1xuICAgICAgICBhcHAucGxheUJHTShcIndhcm5pbmdcIiwgZmFsc2UpO1xuXG4gICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiBTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OiBTQ19IKjAuMSxcbiAgICAgICAgICAgIGZpbGw6IFwicmVkXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmVkXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMVxuICAgICAgICB9XG4gICAgICAgIHZhciBiZWx0ID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShzdHlsZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdmFyIHRleHQgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIldBUk5JTkdcIiwgYWxpZ246IFwiY2VudGVyXCIsIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIn0pXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgMylcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKGJlbHQpO1xuXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIGZpbGw6IFwicmVkXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmVkXCIsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDE2LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRleHQgPSBcIkNBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OXCI7XG4gICAgICAgIGNhdXRpb24xID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogdGV4dH0uJHNhZmUocGFyYW0pKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKi0wLjA1LTgpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiZWx0KTtcbiAgICAgICAgY2F1dGlvbjEudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnggLT0gMTtcbiAgICAgICAgfVxuICAgICAgICBjYXV0aW9uMiA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IHRleHR9LiRzYWZlKHBhcmFtKSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjA1KzEyKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8oYmVsdCk7XG4gICAgICAgIGNhdXRpb24yLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy54ICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBiZWx0LnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgIGJlbHQudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAud2FpdCg5MCkuZmFkZU91dCg1KS53YWl0KDI0KS5mYWRlSW4oMSlcbiAgICAgICAgICAgIC53YWl0KDkwKS5mYWRlT3V0KDUpLndhaXQoMjQpLmZhZGVJbigxKVxuICAgICAgICAgICAgLndhaXQoOTApLmZhZGVPdXQoNSkud2FpdCgyNClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY2F1dGlvbjEueCA9IDA7XG4gICAgICAgICAgICAgICAgY2F1dGlvbjIueCA9IDA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBhcHAucGxheUJHTShcImJvc3NcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0uYmluZChiZWx0KSk7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/plovlp4vlh6bnkIZcbiAgICBvbnBvaW50c3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB9LFxuXG4gICAgLy/jgr/jg4Pjg4FvcuOCr+ODquODg+OCr+enu+WLleWHpueQhlxuICAgIG9ucG9pbnRtb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/ntYLkuoblh6bnkIZcbiAgICBvbnBvaW50ZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgfSxcblxuICAgIC8vYWRkQ2hpbGTjgqrjg7zjg5Djg7zjg6njgqTjg4lcbiAgICBhZGRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkLmxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1cGVyQ2xhc3MucHJvdG90eXBlLmFkZENoaWxkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGQucGFyZW50U2NlbmUgPSB0aGlzO1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcnNbY2hpbGQubGF5ZXJdLmFkZENoaWxkKGNoaWxkKTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIE1lbnVEaWFsb2cuanNcbiAqICAyMDE0LzA2LzA0XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiTWVudURpYWxvZ1wiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG4gICAgZGVmYXVsdE1lbnU6IHtcbiAgICAgICAgeDogU0NfVyowLjUsXG4gICAgICAgIHk6IFNDX0gqMC41LFxuICAgICAgICB3aWR0aDogU0NfVyxcbiAgICAgICAgaGVpZ2h0OiBTQ19ILFxuICAgICAgICB0aXRsZTogXCJTRVRUSU5HXCIsXG4gICAgICAgIGl0ZW06IFtcIkdBTUVcIiwgXCJTWVNURU1cIiwgXCJ0ZXN0XCIsIFwiRVhJVFwiXSxcbiAgICAgICAgZGVzY3JpcHRpb246IFtcIm1lbnUxXCIsIFwibWVudTJcIiwgXCJ0ZXN0XCIsIFwiZXhpdFwiXSxcbiAgICB9LFxuXG4gICAgLy/jg5Xjgqnjg7zjgqvjgrlcbiAgICBpc0ZvY3VzOiB0cnVlLFxuXG4gICAgLy/pgbjmip7jg6Hjg4vjg6Xjg7zjgqLjgqTjg4bjg6Dnlarlj7dcbiAgICBzZWxlY3Q6IDAsXG5cbiAgICBpbml0OiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIG1lbnUgPSAobWVudXx8e30pLiRzYWZlKHRoaXMuZGVmYXVsdE1lbnUpO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbUJHID0ge1xuICAgICAgICAgICAgd2lkdGg6IG1lbnUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG1lbnUuaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsIDAsIDAsIDEpXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmdiYSgwLCAwLCAwLCAxKVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJnID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbUJHKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihtZW51LngsIG1lbnUueSk7XG4gICAgICAgIHRoaXMuYmcuYWxwaGEgPSAwO1xuICAgICAgICB0aGlzLmJnLnR3ZWVuZXIuY2xlYXIoKS50byh7YWxwaGE6IDAuOH0sIDUwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG5cbiAgICAgICAgdGhpcy5mcmFtZUJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgICB0aGlzLmN1cnNvbEJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5jdXJzb2xCYXNlLmFscGhhID0gMDtcbiAgICAgICAgdGhpcy5jdXJzb2xCYXNlLnR3ZWVuZXIud2FpdCgzMDApLmZhZGVJbigxMDApO1xuXG4gICAgICAgIHRoaXMuYmFzZSA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLmJhc2UuYWxwaGEgPSAwO1xuXG4gICAgICAgIC8v6YG45oqe44Kr44O844K944OrXG4gICAgICAgIHZhciBwYXJhbUN1cnNvbCA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1cqMC44NS0xMCxcbiAgICAgICAgICAgIGhlaWdodDpTQ19IKjAuMDgsXG4gICAgICAgICAgICBmaWxsOiBcInJnYmEoMTAwLDEwMCwxMDAsMC41KVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJnYmEoMTAwLDEwMCwxMDAsMC41KVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmN1cnNvbCA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW1DdXJzb2wpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLmN1cnNvbEJhc2UpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42LTMpO1xuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMuY3Vyc29sVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5vcGVuTWVudShtZW51KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRm9jdXMpIHtcbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jgq3jg7zjg5zjg7zjg4nmk43kvZxcbiAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAzMCAmJiB0aGlzLmN1cnNvbFRpbWUgPiAxMCkge1xuICAgICAgICAgICAgaWYgKGN0LnVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wuc2VsLS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3Vyc29sLnNlbCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wuc2VsID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsID0gdGhpcy5jdXJzb2wuc2VsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbC50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tb3ZlVG8oU0NfVyowLjUsIHRoaXMuaXRlbVtzZWxdLnksIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0LmRvd24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbC5zZWwrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJzb2wuc2VsID4gdGhpcy5tZW51Lml0ZW0ubGVuZ3RoLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wuc2VsID0gdGhpcy5tZW51Lml0ZW0ubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbCA9IHRoaXMuY3Vyc29sLnNlbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAubW92ZVRvKFNDX1cqMC41LCB0aGlzLml0ZW1bc2VsXS55LCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZWwgPSB0aGlzLmN1cnNvbC5zZWw7XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtW3NlbF0gaW5zdGFuY2VvZiBTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtW3NlbF07XG4gICAgICAgICAgICAgICAgaWYgKGN0LmxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2xUaW1lID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGN0LnJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaW5jKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiA2MCkge1xuICAgICAgICAgICAgaWYgKGN0Lm9rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNpc2lvbih0aGlzLmN1cnNvbC5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0LmNhbmNlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgIHRoaXMuY3Vyc29sVGltZSsrO1xuICAgIH0sXG5cbiAgICBvcGVuTWVudTogZnVuY3Rpb24obWVudSkge1xuICAgICAgICBtZW51ID0gKG1lbnV8fHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRNZW51KTtcbiAgICAgICAgdGhpcy5tZW51ID0gbWVudTtcblxuICAgICAgICAvL+aXouWtmOODoeODi+ODpeODvOmgheebruOCr+ODquOColxuICAgICAgICB0aGlzLmNsZWFyTWVudSgpO1xuXG4gICAgICAgIC8v44Oh44OL44Ol44O86aCF55uu5pWwXG4gICAgICAgIHZhciBudW1NZW51SXRlbSA9IG1lbnUuaXRlbS5sZW5ndGg7XG5cbiAgICAgICAgLy/jg5Xjg6zjg7zjg6BcbiAgICAgICAgdmFyIHBhcmFtRlIgPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XKjAuODcsXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCoobnVtTWVudUl0ZW0qMC4xNSkrU0NfSCowLjEsXG4gICAgICAgICAgICBmaWxsOiBcInJnYmEoMCwgMCwgMCwgMC43KVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZnJhbWUgPSBwaGluYS5leHRlbnNpb24uRnJhbWUocGFyYW1GUilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuZnJhbWVCYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgICAgIC5zZXRTY2FsZSgxLjAsIDApO1xuICAgICAgICB0aGlzLmZyYW1lLnR3ZWVuZXIudG8oe3NjYWxlWTogMX0sIDI1MCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgIHRoaXMuYmFzZS50d2VlbmVyLndhaXQoMTUwKS5mYWRlSW4oMTAwKTtcblxuICAgICAgICAvL+WIneacn+S9jee9rlxuICAgICAgICB2YXIgcG9zWSA9IFNDX0gqMC41LVNDX0gqKG51bU1lbnVJdGVtKjAuMDUpO1xuXG4gICAgICAgIC8v44Oh44OL44Ol44O844K/44Kk44OI44OrXG4gICAgICAgIHRoaXMudGl0bGUgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBtZW51LnRpdGxlfS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5iYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBwb3NZKTtcblxuICAgICAgICAvL+OCr+ODquODg+OCr+eUqFxuICAgICAgICB2YXIgcGFyYW1DTCA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1cqMC44LFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gqMC4wOCxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgwLDEwMCwyMDAsMC41KVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJnYmEoMCwxMDAsMjAwLDAuNSlcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcblxuICAgICAgICAvL+ODoeODi+ODpeODvOmgheebrlxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuaXRlbSA9IFtdO1xuICAgICAgICB0aGlzLmNsaWNrID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtTWVudUl0ZW07IGkrKykge1xuICAgICAgICAgICAgdmFyIHkgPSBwb3NZK1NDX0gqMC4xKmkrU0NfSCowLjE7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IG1lbnUuaXRlbVtpXTtcblxuICAgICAgICAgICAgLy/pgJrluLjjg6Hjg4vjg6Xjg7zpoIXnm65cbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbVtpXSA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IG1lbnUuaXRlbVtpXX0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5iYXNlKVxuICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/jgrvjg6zjgq/jgr/jga7loLTlkIhcbiAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgU2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1baV0gPSBpdGVtO1xuICAgICAgICAgICAgICAgIGl0ZW0uYWRkQ2hpbGRUbyh0aGlzLmJhc2UpLnNldFBvc2l0aW9uKFNDX1cqMC41LCB5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/jgq/jg6rjg4Pjgq/liKTlrprnlKjnn6nlvaJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tbaV0gPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtQ0wpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5iYXNlKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgeSlcbiAgICAgICAgICAgICAgICAuc2V0SW50ZXJhY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmNsaWNrW2ldLiRleHRlbmQoe2FscGhhOiAwLCBzZWxZOiB5LCBzZWw6IGl9KTtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tbaV0ub25wb2ludHN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuY3Vyc29sLnNlbCA9PSB0aGlzLnNlbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5pdGVtW3RoaXMuc2VsXSBpbnN0YW5jZW9mIFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmRlY2lzaW9uKHRoYXQuY3Vyc29sLnNlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnNvbC50d2VlbmVyLmNsZWFyKCkubW92ZVRvKFNDX1cqMC41LCB0aGlzLnNlbFksIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3Vyc29sLnNlbCA9IHRoaXMuc2VsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnNvbC55ID0gdGhpcy5pdGVtWzBdLnk7XG4gICAgICAgIHRoaXMuY3Vyc29sLnNlbCA9IDA7XG4gICAgfSxcblxuICAgIC8v5pei5a2Y44Oh44OL44Ol44O86aCF55uu44Kv44Oq44KiXG4gICAgY2xlYXJNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUucmVtb3ZlKCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5mcmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aXRsZSkge1xuICAgICAgICAgICAgdGhpcy50aXRsZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLml0ZW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLml0ZW1baV07XG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1tpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jbGlja1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLml0ZW07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5jbGljaztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmJhc2UudHdlZW5lci5jbGVhcigpLmZhZGVPdXQoMTAwKTtcbiAgICAgICAgdGhpcy5jdXJzb2xCYXNlLnR3ZWVuZXIuY2xlYXIoKS5mYWRlT3V0KDEwMCk7XG4gICAgICAgIHRoaXMuZnJhbWUudHdlZW5lci5jbGVhcigpLndhaXQoMTAwKS50byh7c2NhbGVZOiAwfSwgMjUwLCBcImVhc2VPdXRDdWJpY1wiKVxuICAgICAgICB0aGlzLmJnLnR3ZWVuZXIuY2xlYXIoKS50byh7YWxwaGE6IDAuMH0sIDUwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgfSxcblxuICAgIC8v44Oh44OL44Ol44O86aCF55uu6YG45oqe5rG65a6aXG4gICAgZGVjaXNpb246IGZ1bmN0aW9uKHNlbCkge1xuICAgICAgICB0aGlzLnNlbGVjdCA9IHNlbDtcbiAgICAgICAgdGhpcy5mbGFyZSgnZGVjaXNpb24nKTtcbiAgICB9LFxuICAgIC8v44Oh44OL44Ol44O844Kt44Oj44Oz44K744OrXG4gICAgY2FuY2VsOiBmdW5jdGlvbihzZWwpIHtcbiAgICAgICAgdGhpcy5mbGFyZSgnY2FuY2VsJyk7XG4gICAgfSxcbn0pO1xuXG5waGluYS5kZWZpbmUoXCJTZWxlY3RvclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICAvL+mBuOaKnuS4reOCouOCpOODhuODoFxuICAgIHNlbGVjdEl0ZW06IDAsXG5cbiAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG4gICAgZGVmYXVsdE9wdGlvbjoge1xuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgeDogLTYwLFxuICAgICAgICAgICAgdGV4dDogXCJTRUxFQ1RcIixcbiAgICAgICAgfSxcbiAgICAgICAgeDogNjAsXG4gICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIGluaXRpYWw6IDAsXG4gICAgICAgIGl0ZW06IFtcImFhYWFhXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiXSxcbiAgICAgICAgZGVzY3JpcHRpb246IFtcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCJdLFxuICAgICAgICB2ZXJ0aWNhbDogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLm9wdGlvbiA9IChvcHRpb258fHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMub3B0aW9uLndpZHRoO1xuXG4gICAgICAgIC8v44K/44Kk44OI44OrXG4gICAgICAgIHZhciB0aXRsZVBhcmFtID0ge3RleHQ6IHRoaXMub3B0aW9uLnRpdGxlLnRleHR9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSk7XG4gICAgICAgIHRoaXMudGl0bGUgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHRpdGxlUGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMub3B0aW9uLnRpdGxlLngsIDApO1xuXG4gICAgICAgIC8v6YG45oqe5Yid5pyf5L2N572uXG4gICAgICAgIHRoaXMuc2VsZWN0SXRlbSA9IHRoaXMub3B0aW9uLmluaXRpYWw7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdEl0ZW0gPCAwKSB0aGlzLnNlbGVjdEl0ZW0gPSAwO1xuXG4gICAgICAgIC8v44Ki44Kk44OG44Og44K744OD44OIXG4gICAgICAgIHRoaXMuaXRlbUJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9uLml0ZW0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0gPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiB0aGlzLm9wdGlvbi5pdGVtW2ldfS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuaXRlbUJhc2UpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMub3B0aW9uLngraSoxMDAsIDApO1xuICAgICAgICAgICAgaWYgKGkgIT0gdGhpcy5vcHRpb24uaW5pdGlhbCkgdGhpcy5pdGVtc1tpXS5hbHBoYSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgLy/pgbjmip7mk43kvZznlKhcbiAgICAgICAgdmFyIHBhcmFtQyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9wdGlvbi53aWR0aCowLjYsXG4gICAgICAgICAgICBoZWlnaHQ6IFNDX0gqMC4wNSxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjApXCIsXG4gICAgICAgICAgICBzdHJva2U6IG51bGwsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYnRuQyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW1DKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLm9wdGlvbi54LCAwKVxuICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICB0aGlzLmJ0bkMub25wb2ludHN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL+axuuWumuaTjeS9nOaZguOAgeOCpOODmeODs+ODiOeZuueBq1xuICAgICAgICAgICAgdGhhdC5mbGFyZSgnZGVjaXNpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5pON5L2c44Oc44K/44OzXG4gICAgICAgIC8vU2hhcGXnlKjjg5Hjg6njg6Hjg7zjgr9cbiAgICAgICAgdmFyIHBhcmFtU2hwID0ge1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgICAgICAgIHN0cm9rZTogJyNhYWEnLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG5cbiAgICAgICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgICAgIHNpZGVzOiA1LFxuICAgICAgICAgICAgc2lkZUluZGVudDogMC4zOCxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHBhcmFtQlQgPSB7XG4gICAgICAgICAgICB3aWR0aDogMTUsXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCowLjA1LFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNylcIixcbiAgICAgICAgICAgIHN0cm9rZTogbnVsbCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5idG5MID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbUJUKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigtd2lkdGgqMC41K3RoaXMub3B0aW9uLngsIDApXG4gICAgICAgICAgICAuc2V0SW50ZXJhY3RpdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMuYnRuTC5vbnBvaW50c3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnNjYWxlVG8oMS4yLCAxMDApO1xuICAgICAgICAgICAgdGhhdC5kZWMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ0bkwub25wb2ludGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkuc2NhbGVUbygxLjAsIDEwMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5MMiA9IHBoaW5hLmRpc3BsYXkuVHJpYW5nbGVTaGFwZShwYXJhbVNocClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYnRuTClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigxLCAwKTtcbiAgICAgICAgdGhpcy5idG5MMi5yb3RhdGlvbiA9IDMwO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5idG5SID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbUJUKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih3aWR0aCowLjUrdGhpcy5vcHRpb24ueCwgMClcbiAgICAgICAgICAgIC5zZXRJbnRlcmFjdGl2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5idG5SLm9ucG9pbnRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkuc2NhbGVUbygxLjIsIDEwMCk7XG4gICAgICAgICAgICB0aGF0LmluYygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnRuUi5vbnBvaW50ZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS5zY2FsZVRvKDEuMCwgMTAwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ0blIyID0gcGhpbmEuZGlzcGxheS5UcmlhbmdsZVNoYXBlKHBhcmFtU2hwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5idG5SKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKC0xLCAwKTtcbiAgICAgICAgdGhpcy5idG5SMi5yb3RhdGlvbiA9IC0zMDtcbiAgICB9LFxuXG4gICAgLy/poIXnm67jgqTjg7Pjgq/jg6rjg6Hjg7Pjg4hcbiAgICBpbmM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNlbGVjdEl0ZW0rKztcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0SXRlbSA+IHRoaXMub3B0aW9uLml0ZW0ubGVuZ3RoLTEpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbSA9IHRoaXMub3B0aW9uLml0ZW0ubGVuZ3RoLTE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuc2VsZWN0SXRlbS0xXS50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOiAwfSwgMzAwLCBcImVhc2VPdXRTaW5lXCIpO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuc2VsZWN0SXRlbV0udHdlZW5lci5jbGVhcigpLnRvKHthbHBoYTogMX0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICAgICAgdGhpcy5pdGVtQmFzZS50d2VlbmVyLmNsZWFyKCkudG8oe3g6IC10aGlzLnNlbGVjdEl0ZW0qMTAwfSwgODAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgYXBwLnBsYXlTRShcImNsaWNrXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/poIXnm67jg4fjgq/jg6rjg6Hjg7Pjg4hcbiAgICBkZWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNlbGVjdEl0ZW0tLTtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0SXRlbSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbSA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuc2VsZWN0SXRlbSsxXS50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOiAwfSwgMzAwLCBcImVhc2VPdXRTaW5lXCIpO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuc2VsZWN0SXRlbV0udHdlZW5lci5jbGVhcigpLnRvKHthbHBoYTogMX0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICAgICAgdGhpcy5pdGVtQmFzZS50d2VlbmVyLmNsZWFyKCkudG8oe3g6IC10aGlzLnNlbGVjdEl0ZW0qMTAwfSwgODAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgYXBwLnBsYXlTRShcImNsaWNrXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufSk7XG5cbnBoaW5hLmRlZmluZShcIlF1ZXJ5RGlhbG9nXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIC8v6YG45oqe5Lit44Ki44Kk44OG44OgXG4gICAgc2VsZWN0SXRlbTogMCxcblxuICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgbGFiZWxQYXJhbToge1xuICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgfSxcblxuICAgIGRlZmF1bHRPcHRpb246IHtcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb258fHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgcGF1c2VzY2VuZS5qc1xuICogIDIwMTYvMDgvMTdcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4gXG5waGluYS5kZWZpbmUoXCJQYXVzZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgc3Ryb2tlOiBcImJsYWNrXCIsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICBmb250U2l6ZTogMzUsXG4gICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGN1cnJlbnRTY2VuZSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICAgIHRoaXMuY3VycmVudFNjZW5lID0gY3VycmVudFNjZW5lO1xuICAgICAgICB0aGlzLnllcyA9IHRydWU7XG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4lcbiAgICAgICAgdmFyIHBhcmFtID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyxcbiAgICAgICAgICAgIGhlaWdodDpTQ19ILFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsMCwwLDAuNylcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDAsMCwwLDAuNylcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcblxuICAgICAgICAvL+ODneODvOOCuuihqOekulxuICAgICAgICB0aGlzLnBhdXNlMSA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUEFVU0VcIn0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KTtcblxuICAgICAgICB0aGlzLnBhdXNlMiA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUHJlc3MgRVNDIG9yIFNwYWNlIG9yIFRhcCB0byBleGl0XCIsIGZvbnRTaXplOiAxNX0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42KTtcblxuICAgICAgICB0aGlzLmlzRXhpdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWUgPSAwOyAgICAgICAgXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAzMCAmJiAhdGhpcy5pc0V4aXQpIHtcbiAgICAgICAgICAgIHZhciBjdCA9IGFwcC5jb250cm9sbGVyO1xuICAgICAgICAgICAgdmFyIGtiID0gYXBwLmtleWJvYXJkO1xuICAgICAgICAgICAgaWYgKGtiLmdldEtleShcImVzY2FwZVwiKSB8fCBrYi5nZXRLZXkoXCJzcGFjZVwiKSB8fCBjdC5zdGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UxLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAuZmFkZU91dCgxMDApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UyLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAuZmFkZU91dCgxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICAvL+OCv+ODg+ODgW9y44Kv44Oq44OD44Kv57WC5LqG5Yem55CGXG4gICAgb25wb2ludGVuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy50aW1lID4gMzApIHtcbiAgICAgICAgICAgIGFwcC5wb3BTY2VuZSgpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuXG4iLCIvKlxuICogIHByYWN0aWNlc2NlbmUuanNcbiAqICAyMDE2LzA4LzMxXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJQcmFjdGljZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbnx8e30pLiRzYWZlKHtcbiAgICAgICAgICAgIHNlbGVjdFN0YWdlOiAxLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAob3B0aW9uLnNlbGVjdFN0YWdlID4gNSkgb3B0aW9uLnNlbGVjdFN0YWdlID0gMTtcblxuICAgICAgICB2YXIgbWVudVBhcmFtID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiU1RBR0UgU0VMRUNUXCIsXG4gICAgICAgICAgICBpdGVtOiBbXCJcIiwgXCJTVEFSVFwiLCBcIlRFU1RcIiwgXCJFWElUXCJdLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFtcIuOCueODhuODvOOCuOmBuOaKnlwiLCBcIuaMh+WumuOBl+OBn+OCueODhuODvOOCuOOCkumWi+Wni1wiLCBcIlRFU1QgTU9ERVwiLFwiRVhJVFwiXSxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbGVjdG9yUGFyYW0gPSB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHg6IC04MCxcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICBpbml0aWFsOiBvcHRpb24uc2VsZWN0U3RhZ2UtMSxcbiAgICAgICAgICAgIHdpZHRoOiBTQ19XKjAuMyxcbiAgICAgICAgICAgIGl0ZW06IFtcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCJdLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFtcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCJdLFxuICAgICAgICB9O1xuICAgICAgICBtZW51UGFyYW0uaXRlbVswXSA9IFNlbGVjdG9yKHNlbGVjdG9yUGFyYW0pO1xuICAgICAgICBtZW51UGFyYW0uaXRlbVswXS5vbignZGVjaXNpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWVudS5mbGFyZSgnZGVjaXNpb24nKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm1lbnUgPSBNZW51RGlhbG9nKG1lbnVQYXJhbSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCdkZWNpc2lvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBzZWwgPSBlLnRhcmdldC5zZWxlY3Q7XG4gICAgICAgICAgICBzd2l0Y2ggKHNlbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFnZSA9IGUudGFyZ2V0Lm1lbnUuaXRlbVswXS5zZWxlY3RJdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBcInN0YWdlXCIrKHN0YWdlKzEpK1wibG9hZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGl0KG5leHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGl0KFwic3RhZ2U5bG9hZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnUuY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAud2FpdCg2MDApXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpdChcInRvVGl0bGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIHJlc3VsdHNjZW5lLmpzXG4gKiAgMjAxNi8wNC8wNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIlJlc3VsdFNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMzYsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgICAgICBtc2dQYXJhbToge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG4gICAgICAgIG9wdGlvbnMgPSAob3B0aW9uc3x8e30pLiRzYWZlKHtcbiAgICAgICAgICAgIHN0YWdlSWQ6IDAsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCxcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJnID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLmJnLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJTVEFHRSBcIitvcHRpb25zLnN0YWdlSWQrXCIgQ0xFQVJcIn0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC4yKTtcblxuICAgICAgICB0aGlzLm1hc2sgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMubWFzay50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpLmZhZGVPdXQoMjApO1xuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgfSxcbiAgICBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIFNjZW5lRmxvdy5qc1xuICogIDIwMTQvMTEvMjhcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG4vL++/ve+/vXvvv71W77+9W++/ve+/ve+/vXTvv73vv73vv71bXG5waGluYS5kZWZpbmUoXCJTY2VuZUZsb3dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZ2FtZS5NYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMuJHNhZmUoe1xuICAgICAgICAgICAgc2NlbmVzOiBbe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInNwbGFzaFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJTcGxhc2hTY2VuZVwiLFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJsb2FkXCIsXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJsb2FkXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIkxvYWRpbmdTY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGU6IFwiY29tbW9uXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJ0aXRsZVwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiVGl0bGVTY2VuZVwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiYXJjYWRlXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIkFyY2FkZU1vZGVcIixcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInByYWN0aWNlXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlByYWN0aWNlTW9kZVwiLFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJ0aXRsZVwiLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgIH0pKTtcbiAgICB9XG59KTtcblxuLy/vv71B77+9W++/vVDvv71b77+9aO+/ve+/ve+/vVvvv71o77+9Vu+/vVvvv73vv73vv71077+977+977+9W1xucGhpbmEuZGVmaW5lKFwiQXJjYWRlTW9kZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5nYW1lLk1hbmFnZXJTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgICAgIHN0YXJ0TGFiZWw6IFwic3RhZ2UxbG9hZFwiLFxuICAgICAgICAgICAgc2NlbmVzOiBbe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlMWxvYWRcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiTG9hZGluZ1NjZW5lXCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZTogXCJzdGFnZTFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcInN0YWdlMVwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwic3RhZ2UxXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIk1haW5TY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzdGFnZUlkOiAxLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJnYW1lb3ZlclwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJHYW1lT3ZlclNjZW5lXCIsXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcInRvVGl0bGVcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInRvVGl0bGVcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiU2NlbmVGbG93XCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vL++/vXbvv73vv73vv71O77+9Ze+/vULvv71Y77+977+977+9W++/vWjvv71W77+9W++/ve+/ve+/vXTvv73vv73vv71bXG5waGluYS5kZWZpbmUoXCJQcmFjdGljZU1vZGVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZ2FtZS5NYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBzdGFydExhYmVsOiBcIm1lbnVcIixcbiAgICAgICAgICAgIHNjZW5lczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJtZW51XCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlByYWN0aWNlU2NlbmVcIixcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8v77+9WO+/vWXvv71b77+9V++/vVBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzdGFnZTFsb2FkXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIkxvYWRpbmdTY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGU6IFwic3RhZ2UxXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJzdGFnZTFcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlMVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2VJZDogMSxcbiAgICAgICAgICAgICAgICAgICAgaXNQcmFjdGljZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJtZW51XCIsXG4gICAgICAgICAgICAgICAgbmV4dEFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RTdGFnZTogMSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy/vv71Y77+9Ze+/vVvvv71X77+9UVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlMmxvYWRcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiTG9hZGluZ1NjZW5lXCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZTogXCJzdGFnZTJcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcInN0YWdlMlwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwic3RhZ2UyXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIk1haW5TY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzdGFnZUlkOiAyLFxuICAgICAgICAgICAgICAgICAgICBpc1ByYWN0aWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcIm1lbnVcIixcbiAgICAgICAgICAgICAgICBuZXh0QXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFN0YWdlOiAyLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvL++/vWXvv71Y77+9Z++/vXDvv71Y77+9Ze+/vVvvv71XXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwic3RhZ2U5bG9hZFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJMb2FkaW5nU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlOiBcInN0YWdlOVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwic3RhZ2U5XCIsXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzdGFnZTlcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWdlSWQ6IDksXG4gICAgICAgICAgICAgICAgICAgIGlzUHJhY3RpY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwibWVudVwiLFxuICAgICAgICAgICAgICAgIG5leHRBcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0U3RhZ2U6IDksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8v77+9Xu+/vUPvv71n77+977+977+9yZbfgu+/vVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInRvVGl0bGVcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiU2NlbmVGbG93XCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuIiwiLypcbiAqICBzZXR0aW5nc2NlbmUuanNcbiAqICAyMDE2LzA0LzA2XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJTZXR0aW5nU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmVcIixcblxuICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgbGFiZWxQYXJhbToge1xuICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG1lbnUpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgICB2YXIgbWVudVBhcmFtID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiU0VUVElOR1wiLFxuICAgICAgICAgICAgaXRlbTogW1wiR0FNRVwiLCBcIlNZU1RFTVwiLCBcInRlc3RcIiwgXCJFWElUXCJdLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFtcIm1lbnUxXCIsIFwibWVudTJcIiwgXCJ0ZXN0XCIsIFwiZXhpdFwiXSxcbiAgICAgICAgfTtcbiAgICAgICAgbWVudVBhcmFtLml0ZW1bMl0gPSBTZWxlY3RvcigpO1xuXG4gICAgICAgIHRoaXMubWVudSA9IE1lbnVEaWFsb2cobWVudVBhcmFtKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ2RlY2lzaW9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHNlbCA9IGUudGFyZ2V0LnNlbGVjdDtcbiAgICAgICAgICAgIGlmIChzZWwgPT0gMykge1xuICAgICAgICAgICAgICAgIHRoaXMubWVudS5jbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAud2FpdCg2MDApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAucG9wU2NlbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVudS5vbignY2FuY2VsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5tZW51LmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAud2FpdCg2MDApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbn0pO1xuXG4iLCIvKlxuICogIHNwbGFzaHNjZW5lLmpzXG4gKiAgMjAxNS8xMi8wMlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcbiAgICBwaGluYS5kZWZpbmUoJ1NwbGFzaFNjZW5lJywge1xuICAgICAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmUnLFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdXBlckluaXQoe3dpZHRoOiBTQ19XLCBoZWlnaHQ6IFNDX0h9KTtcblxuICAgICAgICAgICAgdGhpcy51bmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9hZGNvbXBsZXRlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vcHJlbG9hZCBhc3NldFxuICAgICAgICAgICAgdmFyIGFzc2V0cyA9IEFwcGxpY2F0aW9uLmFzc2V0c1tcInByZWxvYWRcIl07XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgICAgICAgIGxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICAgICAgICBsb2FkZXIub24oJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgLy9sb2dvXG4gICAgICAgICAgICB2YXIgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICAgICAgICAgIHRleHR1cmUubG9hZChTcGxhc2hTY2VuZS5sb2dvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUodGhpcy50ZXh0dXJlKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuZ3JpZFguY2VudGVyKCksIHRoaXMuZ3JpZFkuY2VudGVyKCkpXG4gICAgICAgICAgICAgICAgLnNldFNjYWxlKDAuMyk7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5hbHBoYSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnR3ZWVuZXJcbiAgICAgICAgICAgICAgICAuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7YWxwaGE6MX0sIDUwMCwgJ2Vhc2VPdXRDdWJpYycpXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICAgICAgICAgIC53YWl0KDEwMDApXG4gICAgICAgICAgICAgICAgLnRvKHthbHBoYTowfSwgNTAwLCAnZWFzZU91dEN1YmljJylcbiAgICAgICAgICAgICAgICAud2FpdCgyNTApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgY3QgPSBhcHAuY29udHJvbGxlcjtcbiAgICAgICAgICAgIGlmIChjdC5vayB8fCBjdC5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51bmxvY2sgJiYgdGhpcy5sb2FkY29tcGxldGUpIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9ucG9pbnRzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy51bmxvY2sgJiYgdGhpcy5sb2FkY29tcGxldGUpIHRoaXMuZXhpdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zdGF0aWM6IHtcbiAgICAgICAgICAgIGxvZ286IFwiYXNzZXRzL2ltYWdlcy9sb2dvLnBuZ1wiLFxuICAgICAgICB9LFxuICAgIH0pO1xufSk7XG4iLCIvKlxuICogIFRpdGlsZVNjZW5lLmpzXG4gKiAgMjAxNC8wNi8wNFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIlRpdGxlU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmVcIixcbiAgICBcbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgICAgIHRpdGxlUGFyYW06IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMzYsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgICAgICBtc2dQYXJhbToge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4lcbiAgICAgICAgdmFyIHBhcmFtID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyxcbiAgICAgICAgICAgIGhlaWdodDpTQ19ILFxuICAgICAgICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmcgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMuYmcudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICAvL+ODkOODvOOCuOODp+ODs+eVquWPt1xuICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHtcbiAgICAgICAgICAgIHRleHQ6IFwidmVyIFwiK19WRVJTSU9OXyxcbiAgICAgICAgICAgIGFsaWduOiBcImxlZnRcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcInRvcFwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDgsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgfS4kc2FmZSh0aGlzLnRpdGxlUGFyYW0pKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKDIsIDIpO1xuXG4gICAgICAgICAgICAvL+OBi+OBo+OBk+OCiOOBleOBkuOBquOCquODluOCuOOCp1xuICAgICAgICB0aGlzLmFjYyA9IHBoaW5hLmV4dGVuc2lvbi5DaXJjbGVCdXR0b24oe3JhZGl1czogNjR9KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjMpXG4gICAgICAgICAgICAuc2V0U2NhbGUoMC4wLCAwLjApO1xuICAgICAgICB0aGlzLmFjYy5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjYy50d2VlbmVyLmNsZWFyKCkudG8oeyBzY2FsZVg6IDIuMCwgc2NhbGVZOiAxIH0sIDE1MCk7XG5cbiAgICAgICAgLy/jgr/jgqTjg4jjg6tcbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJQbGFuZXRcIn0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjMtNSwgU0NfSCowLjMpO1xuICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIkJ1c3RlclwifS4kc2FmZSh0aGlzLnRpdGxlUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNys1LCBTQ19IKjAuMyk7XG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUkVWSVNJT05cIiwgZm9udFNpemU6MTYsIHN0cm9rZTogXCJyZWRcIn0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC4zNSk7XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAvL+mBuOaKnuOCq+ODvOOCveODq1xuICAgICAgICB2YXIgcGFyYW0yID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyxcbiAgICAgICAgICAgIGhlaWdodDpTQ19IKjAuMDgsXG4gICAgICAgICAgICBmaWxsOiBcInJnYmEoMCwxMDAsMjAwLDAuNSlcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDAsMTAwLDIwMCwwLjUpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY3Vyc29sID0gcGhpbmEuZXh0ZW5zaW9uLkN1cnNvbEZyYW1lKHt3aWR0aDogU0NfVyowLjcsIGhlaWdodDogU0NfSCowLjA2fSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42LTMpXG5cbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJBUkNBREUgTU9ERVwifS4kc2FmZSh0aGlzLm1zZ1BhcmFtKSkuYWRkQ2hpbGRUbyh0aGlzKS5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjYpO1xuICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlBSQUNUSUNFIE1PREVcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpLmFkZENoaWxkVG8odGhpcykuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC43KTtcbiAgICAgICAgdGhpcy5sYWJlbDMgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlNFVFRJTkdcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpLmFkZENoaWxkVG8odGhpcykuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC44KTtcbiAgICAgICAgdGhpcy5sYWJlbDMuYmxpbmsgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYWJlbDMudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxpbmsgJiYgZS50aWNrZXIuZnJhbWUgJSAxMCA9PSAwKSB0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmJsaW5rKSB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jgr/jg4Pjg4HnlKhcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbTIpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42K2kqU0NfSCowLjEpXG4gICAgICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgYy5hbHBoYSA9IDA7XG4gICAgICAgICAgICBjLnNlbGVjdCA9IGk7XG4gICAgICAgICAgICBjLm9ucG9pbnRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmlzU2VsZWN0ZWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdCAhPSB0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCA9IHRoaXMuc2VsZWN0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnNvbC50d2VlbmVyLmNsZWFyKCkubW92ZVRvKFNDX1cqMC41LCBTQ19IKjAuNisodGhhdC5zZWxlY3QqU0NfSCowLjEpLTMsIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tZW51U2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/pgbjmip7kuK3jg6Hjg4vjg6Xjg7znlarlj7dcbiAgICAgICAgdGhpcy5zZWxlY3QgPSAwO1xuICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLm1hc2sgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMubWFzay50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpLmZhZGVPdXQoMjApO1xuXG4gICAgICAgIC8v5oi744Gj44Gm44GN44Gf5aC05ZCI44Gr6YG45oqe54q25oWL44KS6Kej6ZmkXG4gICAgICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICB9LFxuICAgIFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIC8v44Kt44O844Oc44O844OJ5pON5L2cXG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAxMCAmJiAhdGhpcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICB2YXIgY3QgPSBhcHAuY29udHJvbGxlcjtcbiAgICAgICAgICAgIGlmIChjdC51cCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdCA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wudHdlZW5lci5jbGVhcigpLm1vdmVUbyhTQ19XKjAuNSwgU0NfSCowLjYrKHRoaXMuc2VsZWN0KlNDX0gqMC4xKS0zLCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0LmRvd24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3QgPSAyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlVG8oU0NfVyowLjUsIFNDX0gqMC42Kyh0aGlzLnNlbGVjdCpTQ19IKjAuMSktMywgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdC5vaykge1xuICAgICAgICAgICAgICAgIHRoaXMubWVudVNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICBtZW51U2VsZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgLy9BUkNBREUgTU9ERVxuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzdGFydFwiKTtcbiAgICAgICAgICAgICAgICBhcHAuc2NvcmUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkud2FpdCgyNTAwKS5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFyY2FkZU1vZGUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiQVJDQURFIE1PREVcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjYpXG4gICAgICAgICAgICAgICAgICAgIC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjUsIHNjYWxlWTogMS41LCBhbHBoYTogMH0sIDIwMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiQVJDQURFIE1PREVcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjYpXG4gICAgICAgICAgICAgICAgICAgIC50d2VlbmVyLmNsZWFyKCkud2FpdCgxMDApLnRvKHtzY2FsZVg6MS41LCBzY2FsZVk6IDEuNSwgYWxwaGE6IDB9LCAyMDAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIC8vUFJBQ1RJQ0UgTU9ERVxuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzdGFydFwiKTtcbiAgICAgICAgICAgICAgICBhcHAuc2NvcmUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkud2FpdCgyNTAwKS5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByYWN0aWNlTW9kZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUFJBQ1RJQ0UgTU9ERVwifS4kc2FmZSh0aGlzLm1zZ1BhcmFtKSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNylcbiAgICAgICAgICAgICAgICAgICAgLnR3ZWVuZXIuY2xlYXIoKS50byh7c2NhbGVYOjEuNSwgc2NhbGVZOiAxLjUsIGFscGhhOiAwfSwgMjAwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJQUkFDVElDRSBNT0RFXCJ9LiRzYWZlKHRoaXMubXNnUGFyYW0pKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC43KVxuICAgICAgICAgICAgICAgICAgICAudHdlZW5lci5jbGVhcigpLndhaXQoMTAwKS50byh7c2NhbGVYOjEuNSwgc2NhbGVZOiAxLjUsIGFscGhhOiAwfSwgMjAwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAvL1NFVFRJTkdcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2V0dGluZ1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLndhaXQoNzAwKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFiZWwzLmJsaW5rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdNb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbDMuYmxpbmsgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFyY2FkZU1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV4aXQoXCJhcmNhZGVcIik7XG4gICAgfSxcblxuICAgIHByYWN0aWNlTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZXhpdChcInByYWN0aWNlXCIpO1xuICAgIH0sXG5cbiAgICBzZXR0aW5nTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcC5wdXNoU2NlbmUoU2V0dGluZ1NjZW5lKHRoaXMpKTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIEdyb3VuZC5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIkdyb3VuZFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG4gICAgbGF5ZXI6IExBWUVSX0JBQ0tHUk9VTkQsICAgIC8v5omA5bGe44Os44Kk44Ok44O8XG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgYmVsdDogZmFsc2UsICAgIC8v57mw44KK6L+U44GX5Zyw5b2i44OV44Op44KwXG5cbiAgICAgICAgZGlyZWN0aW9uOiAwLCAgIC8v44K544Kv44Ot44O844Or5pa55ZCRXG4gICAgICAgIHNwZWVkOiAxLCAgICAgICAvL+OCueOCr+ODreODvOODq+mAn+W6plxuXG4gICAgICAgIGFsdGl0dWRlQmFzaWM6IDIwLCAgLy/ln7rmnKzpq5jluqZcbiAgICAgICAgYWx0aXR1ZGU6IDEsICAgICAgICAvL+ePvuWcqOmrmOW6pu+8iOWfuuacrOmrmOW6puOBq+WvvuOBmeOCi+WJsuWQiO+8mu+8keOCku+8ke+8kO+8kO+8heOBqOOBmeOCiylcbiAgICAgICAgaXNTaGFkb3c6IHRydWUsICAgICAvL+W9seacieOCiuODleODqeOCsFxuXG4gICAgICAgIGRlbHRhWCA6IDAsICAgICAgICBcbiAgICAgICAgZGVsdGFZIDogMCwgICAgICAgIFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kc2FmZSh0aGlzLl9tZW1iZXIpO1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgICAgICBhc3NldDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2VcIixcbiAgICAgICAgICAgIGJlbHQ6IGZhbHNlLFxuICAgICAgICAgICAgeDogU0NfVyowLjUsXG4gICAgICAgICAgICB5OiBTQ19IKjAuNVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hc3NldCA9IG9wdGlvbi5hc3NldDtcbiAgICAgICAgdGhpcy50eXBlID0gb3B0aW9uLnR5cGU7XG4gICAgICAgIHRoaXMuYmVsdCA9IG9wdGlvbi5iZWx0O1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCA9IG9wdGlvbi54O1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBvcHRpb24ueTtcblxuICAgICAgICB0aGlzLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgdGhpcy5tYXBCYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLnNldFBvc2l0aW9uKDAsIDApLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMubWFwQmFzZS50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIGlmICh0aGlzLmFzc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwTWFwKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9uKFwiZW50ZXJmcmFtZVwiLCB0aGlzLmRlZmF1bHRFbnRlcmZyYW1lKTtcbiAgICB9LFxuXG4gICAgZGVmYXVsdEVudGVyZnJhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkID0gKHRoaXMuZGlyZWN0aW9uKzkwKSp0b1JhZDtcbiAgICAgICAgdGhpcy5kZWx0YVggPSBNYXRoLmNvcyhyYWQpKnRoaXMuc3BlZWQ7XG4gICAgICAgIHRoaXMuZGVsdGFZID0gTWF0aC5zaW4ocmFkKSp0aGlzLnNwZWVkO1xuXG4gICAgICAgIHRoaXMubWFwQmFzZS54ICs9IHRoaXMuZGVsdGFYO1xuICAgICAgICB0aGlzLm1hcEJhc2UueSArPSB0aGlzLmRlbHRhWTtcblxuICAgICAgICBpZiAodGhpcy5iZWx0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDM7IHkrKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgMzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gdGhpcy5tYXBbeF1beV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBzeCA9IE1hdGguZmxvb3IoKHRoaXMubWFwQmFzZS54ICsgbS54KS90aGlzLm1hcC53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeCA+ICAwKSBtLnggLT0gdGhpcy5tYXAud2lkdGgqMztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN4IDwgLTIpIG0ueCArPSB0aGlzLm1hcC53aWR0aCozO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3kgPSBNYXRoLmZsb29yKCh0aGlzLm1hcEJhc2UueSArIG0ueSkvdGhpcy5tYXAuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN5ID4gIDApIG0ueSAtPSB0aGlzLm1hcC5oZWlnaHQqMztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN5IDwgLTIpIG0ueSArPSB0aGlzLm1hcC5oZWlnaHQqMztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0dXBNYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYmVsdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBcImltYWdlXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcCA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKHRoaXMuYXNzZXQpLmFkZENoaWxkVG8odGhpcy5tYXBCYXNlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09IFwidG14XCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG14ID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndG14JywgdGhpcy5hc3NldCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAgPSBwaGluYS5kaXNwbGF5LlNwcml0ZSh0bXguaW1hZ2UpLmFkZENoaWxkVG8odGhpcy5tYXBCYXNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5tYXAud2lkdGg7XG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMubWFwLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0T3JpZ2luKDAsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBcImltYWdlXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIHRoaXMuYXNzZXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT0gXCJ0bXhcIikge1xuICAgICAgICAgICAgICAgIHZhciB0bXggPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0bXgnLCB0aGlzLmFzc2V0KTtcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSB0bXguaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1hcCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5tYXAud2lkdGggPSBpbWFnZS5kb21FbGVtZW50LndpZHRoO1xuICAgICAgICAgICAgdGhpcy5tYXAuaGVpZ2h0ID0gaW1hZ2UuZG9tRWxlbWVudC5oZWlnaHQ7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDM7IHgrKykge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwW3hdID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCAzOyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG14ID0gKHgtMSkgKiB0aGlzLm1hcC53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG15ID0gKHktMSkgKiB0aGlzLm1hcC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwW3hdW3ldID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoaW1hZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLm1hcEJhc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24obXgsIG15KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldE9yaWdpbigwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBbeF1beV0ubWFwWCA9IE1hdGguZmxvb3IobXggLyB0aGlzLm1hcC53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwW3hdW3ldLm1hcFkgPSBNYXRoLmZsb29yKG15IC8gdGhpcy5tYXAuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkTGF5ZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB9LFxuXG4gICAgc2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBzZXRTcGVlZDogZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnggPSB4O1xuICAgICAgICB0aGlzLm1hcEJhc2UueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYWNjZXNzb3I6IHtcbiAgICAgICAgeDoge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLm1hcEJhc2UueDsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHgpIHsgdGhpcy5tYXBCYXNlLnggPSB4O31cbiAgICAgICAgfSxcbiAgICAgICAgeToge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLm1hcEJhc2UueTsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHkpIHsgdGhpcy5tYXBCYXNlLnggPSB5O31cbiAgICAgICAgfSxcblxuICAgICAgICBzaGFkb3dYOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuYWx0aXR1ZGVCYXNpYyAqIHRoaXMuYWx0aXR1ZGUpKjAuNTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih5KSB7fVxuICAgICAgICB9LFxuICAgICAgICBzaGFkb3dZOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hbHRpdHVkZUJhc2ljICogdGhpcy5hbHRpdHVkZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih5KSB7fVxuICAgICAgICB9LFxuLypcbiAgICAgICAgc2NhbGVYOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubWFwQmFzZS5zY2FsZVg7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih4KSB7IHRoaXMubWFwQmFzZS5zY2FsZVggPSB4O31cbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGVZOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubWFwQmFzZS5zY2FsZVk7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih5KSB7IHRoaXMubWFwQmFzZS5zY2FsZVkgPSB5O31cbiAgICAgICAgfSxcbiovXG4gICAgfVxufSk7XG4iLCIvKlxuICogIFN0YWdlRGF0YS5qc1xuICogIDIwMTQvMDgvMDZcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbi8v44K544OG44O844K477yRXG5waGluYS5kZWZpbmUoXCJTdGFnZTFcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiU3RhZ2VDb250cm9sbGVyXCIsXG5cbiAgICBhbHRpdHVkZUJhc2ljOiA0MCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCwgcGxheWVyKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHBhcmVudCwgcGxheWVyKTtcblxuICAgICAgICAvL+WIneacn+WMluWHpueQhlxuICAgICAgICB0aGlzLmFkZCgxLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFwcC5wbGF5QkdNKFwic3RhZ2UxXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuaXNBZnRlcmJ1cm5lciA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZCg2MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjAsIHNjYWxlWToxLjAsIHNwZWVkOjMuMH0sIDMwMCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQWZ0ZXJidXJuZXIgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9TdGFnZSBkYXRhXG4gICAgICAgIHRoaXMuYWRkKCAxODAsIFwiSG9ybmV0MS1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkhvcm5ldDEtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQxLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgIDEsIFwiSG9ybmV0MS1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQxLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIk11ZERhdWJlci1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIk11ZERhdWJlci1yaWdodFwiKTtcblxuICAgICAgICB0aGlzLmFkZCg2MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjAsIHNjYWxlWToxLjAsIHNwZWVkOjEuMH0sIDMwMCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGQoICA5MCwgXCJIb3JuZXQxLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgMjAsIFwiSG9ybmV0MS1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQxLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIlRveUJveC1wLXJpZ2h0XCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiRnJhZ2FyYWNoLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkhvcm5ldDEtbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICAgMSwgXCJIb3JuZXQxLXJpZ2h0XCIpO1xuICAgICAgICB0aGlzLmFkZCggMTgwLCBcIkhvcm5ldDEtY2VudGVyXCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiRnJhZ2FyYWNoLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiRnJhZ2FyYWNoLXJpZ2h0XCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0My1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJGcmFnYXJhY2gtbGVmdDJcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgIDEsIFwiRnJhZ2FyYWNoLXJpZ2h0MlwiKTtcblxuICAgICAgICB0aGlzLmFkZCg2MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjAsIHNjYWxlWToxLjAsIHNwZWVkOjMuMH0sIDMwMCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQxLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQxLWNlbnRlclwiKTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQzLWNlbnRlclwiKTtcblxuICAgICAgICAvL+S4reODnOOCuVxuICAgICAgICB0aGlzLmFkZCggMzYwLCBcIlRob3JIYW1tZXJcIiwge2Jvc3M6IHRydWV9KTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NwZWVkOjEwLjB9LCAxODAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc0FmdGVyYnVybmVyID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkKCAxODAwLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NwZWVkOjUuMH0sIDE4MCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQWZ0ZXJidXJuZXIgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGQoIDE4MCwgXCJIb3JuZXQxLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQxLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkhvcm5ldDMtbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICAgMSwgXCJIb3JuZXQzLXJpZ2h0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkhvcm5ldDMtY2VudGVyXCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKDEyMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDowLjUsIHNjYWxlWTowLjUsIHNwZWVkOjIuMH0sIDYwMCwgXCJlYXNlSW5PdXRTaW5lXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZCggIDMwLCBcIkJpZ1dpbmctbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoIDE4MCwgXCJCaWdXaW5nLXJpZ2h0XCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0Mi1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDIwLCBcIkhvcm5ldDItcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0Mi1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQzLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgIDEsIFwiSG9ybmV0My1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQzLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIk11ZERhdWJlci1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIk11ZERhdWJlci1yaWdodFwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIlRveUJveC1wLWNlbnRlclwiKTtcblxuICAgICAgICAvL1dBUk5JTkdcbiAgICAgICAgdGhpcy5hZGQoIDM2MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVudGVyV2FybmluZygpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL+OCueODhuODvOOCuOODnOOCuVxuICAgICAgICB0aGlzLmFkZCggMzAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKS50byh7c3BlZWQ6MC4wfSwgMTgwLCBcImVhc2VJbk91dEN1YmljXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJHb2x5YXRcIiwge2Jvc3M6IHRydWV9KTtcbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NwZWVkOi03LjB9LCAxODAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZCggMTgwMCwgZnVuY3Rpb24oKSB7fSk7XG5cblxuICAgICAgICAvL+OCpOODmeODs+ODiOeZu+mMslxuICAgICAgICB0aGlzLmFkZEV2ZW50KFwic2Nyb2xsXzFcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjAsIHNjYWxlWToxLjAsIHNwZWVkOjEuMH0sIDMwMCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQoXCJzY3JvbGxfMlwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKS50byh7c2NhbGVYOjEuMCwgc2NhbGVZOjEuMCwgc3BlZWQ6My4wfSwgMzAwLCBcImVhc2VJbk91dEN1YmljXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRFdmVudChcInNjcm9sbF8zXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzcGVlZDoxMC4wfSwgMTgwLCBcImVhc2VJbk91dEN1YmljXCIpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuaXNBZnRlcmJ1cm5lciA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZEV2ZW50KFwic2Nyb2xsXzRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NwZWVkOjUuMH0sIDE4MCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQWZ0ZXJidXJuZXIgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQoXCJzY3JvbGxfNVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKS50byh7c2NhbGVYOjAuNSwgc2NhbGVZOjAuNSwgc3BlZWQ6Mi4wfSwgNjAwLCBcImVhc2VJbk91dFNpbmVcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZEV2ZW50KFwid2FybmluZ1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZW50ZXJXYXJuaW5nKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfSxcbn0pO1xuXG4vL+OCueODhuODvOOCuO+8keWcsOW9oueuoeeQhlxucGhpbmEuZGVmaW5lKFwiU3RhZ2UxR3JvdW5kXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIkdyb3VuZFwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgICAgIGFzc2V0OiBcIm1hcDFnXCIsXG4gICAgICAgICAgICBiZWx0OiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdyA9IHRoaXMubWFwLndpZHRoO1xuICAgICAgICB2YXIgaCA9IHRoaXMubWFwLmhlaWdodDtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnggPSAtdyowLjU7XG4gICAgICAgIHRoaXMubWFwQmFzZS55ID0gLWgqMC41O1xuXG4gICAgICAgIHRoaXMuc2V0U2NhbGUoMC4yLCAwLjIpO1xuICAgICAgICB0aGlzLnNwZWVkID0gMS4wO1xuICAgIH0sXG59KTtcblxufSkoKTtcbiIsIi8qXG4gKiAgU3RhZ2UyLmpzXG4gKiAgMjAxNi8wOC8xOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbigpIHtcblxuLy/jgrnjg4bjg7zjgrjvvJFcbnBoaW5hLmRlZmluZShcIlN0YWdlMlwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJTdGFnZUNvbnRyb2xsZXJcIixcblxuICAgIGFsdGl0dWRlQmFzaWM6IDQwLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50LCBwbGF5ZXIpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQocGFyZW50LCBwbGF5ZXIpO1xuXG4gICAgICAgIC8v5Yid5pyf5YyW5Yem55CGXG4gICAgICAgIHRoaXMuYWRkKDEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MC41LCBzY2FsZVk6MC41LCBzcGVlZDoxLjAsIGFscGhhOjF9LCAxLCBcImVhc2VJbk91dFF1YWRcIik7XG4gICAgICAgICAgICBhcHAucGxheUJHTShcInN0YWdlMlwiLCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGQoIDE4MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50W1wiYm9zc19zaGFkb3dcIl0udmFsdWUuY2FsbCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAvL1dBUk5JTkdcbiAgICAgICAgdGhpcy5hZGQoIDM2MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVudGVyV2FybmluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGQoIDI0MCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50W1wiR2FydWRhXCJdLnZhbHVlLmNhbGwoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+OCrOODq+ODvOODgOapn+W9sVxuICAgICAgICB0aGlzLmFkZEV2ZW50KFwiYm9zc19zaGFkb3dcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2hhZG93ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFCbGFja1wiLCAyOTYsIDgwKTtcbiAgICAgICAgICAgIHNoYWRvdy5sYXllciA9IExBWUVSX0ZPUkVHUk9VTkQ7XG4gICAgICAgICAgICBzaGFkb3cuYWxwaGEgPSAwLjU7XG4gICAgICAgICAgICBzaGFkb3cuYWRkQ2hpbGRUbyhhcHAuY3VycmVudFNjZW5lKVxuICAgICAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDEyOCwgMzIwLCAyOTYsIDE2MClcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjEuMSwgU0NfSCoxLjIpXG4gICAgICAgICAgICAgICAgLnNldFNjYWxlKDIuMCk7XG4gICAgICAgICAgICBzaGFkb3cudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy55IC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMueSA8IC04MCkgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8v44Oc44K555m75aC05ryU5Ye6XG4gICAgICAgIHRoaXMuYWRkRXZlbnQoXCJHYXJ1ZGFcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2hhZG93ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFCbGFja1wiLCAyOTYsIDgwKVxuICAgICAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDEyOCwgMzIwLCAyOTYsIDE2MClcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjQpO1xuICAgICAgICAgICAgc2hhZG93LmxheWVyID0gTEFZRVJfU0hBRE9XO1xuICAgICAgICAgICAgc2hhZG93LmFscGhhID0gMC4wO1xuICAgICAgICAgICAgc2hhZG93LnRpbWUgPSAwO1xuICAgICAgICAgICAgc2hhZG93LmFkZENoaWxkVG8oYXBwLmN1cnJlbnRTY2VuZSk7XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHNoYWRvdy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwLjQsIHk6IFNDX0gqMC4yfSwgMzAwLCBcImVhc2VPdXRTaW5lXCIpXG4gICAgICAgICAgICAgICAgLndhaXQoMTIwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnBhcmVudFNjZW5lLmVudGVyRW5lbXlVbml0KFwiR2FydWRhXCIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLndhaXQoMTIwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0uYmluZChzaGFkb3cpKTtcblxuICAgICAgICAgICAgc2hhZG93LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPCAzMDApIHJldHVybjsgXG5cbiAgICAgICAgICAgICAgICAvL+eFmeOCguOBj+OCguOBj+ODvFxuICAgICAgICAgICAgICAgIHZhciB4MSA9IHRoaXMueDtcbiAgICAgICAgICAgICAgICB2YXIgeTEgPSB0aGlzLnktMTA7XG4gICAgICAgICAgICAgICAgdmFyIHgyID0gdGhpcy54KzE0ODtcbiAgICAgICAgICAgICAgICB2YXIgeTIgPSB0aGlzLnkrNDA7XG4gICAgICAgICAgICAgICAgdmFyIHZ5ID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQuZGVsdGFZO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgMjsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyID09IDEpIHgyID0gdGhpcy54LTE0ODtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwID0gTWF0aC5yYW5kZmxvYXQoMCwgMS4wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBweCA9IE1hdGguZmxvb3IoeDEqcCt4MiooMS1wKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHkgPSBNYXRoLmZsb29yKHkxKnAreTIqKDEtcCkpLTMyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuZW50ZXJTbW9rZUxhcmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHB4LCB5OiBweX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiB2eStNYXRoLnJhbmRpbnQoMCwgMyksIGRlY2F5OiAxLjAxfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxheTogcmFuZCgwLCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbn0pO1xuXG4vL+OCueODhuODvOOCuO+8keWcsOW9oueuoeeQhlxucGhpbmEuZGVmaW5lKFwiU3RhZ2UyR3JvdW5kXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIkdyb3VuZFwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgICAgIGFzc2V0OiBcIm1hcDFnXCIsXG4gICAgICAgICAgICBiZWx0OiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdyA9IHRoaXMubWFwLndpZHRoO1xuICAgICAgICB2YXIgaCA9IHRoaXMubWFwLmhlaWdodDtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnggPSAtdyowLjU7XG4gICAgICAgIHRoaXMubWFwQmFzZS55ID0gLWgqMC41O1xuICAgIH0sXG59KTtcblxufSkoKTtcbiIsIi8qXG4gKiAgU3RhZ2VEYXRhLmpzXG4gKiAgMjAxNC8wOC8wNlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbigpIHtcblxuLy/jg4bjgrnjg4jnlKjjgrnjg4bjg7zjgrhcbnBoaW5hLmRlZmluZShcIlN0YWdlOVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJTdGFnZUNvbnRyb2xsZXJcIixcblxuICAgIGFsdGl0dWRlQmFzaWM6IDQwLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50LCBwbGF5ZXIpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQocGFyZW50LCBwbGF5ZXIpO1xuXG4gICAgICAgIC8v5Yid5pyf5YyW5Yem55CGXG4gICAgICAgIHRoaXMuYWRkKDEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXBwLnBsYXlCR00oXCJzdGFnZTlcIiwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4vLyAgICAgICAgdGhpcy5hZGQoIDE4MCwgXCJSYXZlblwiKTtcbiAgICAgICAgdGhpcy5hZGQoIDE4MCwgZnVuY3Rpb24oKSB7XG4vLyAgICAgICAgICAgIHRoaXMuZXZlbnRbXCJib3NzX3NoYWRvd1wiXS52YWx1ZS5jYWxsKCk7XG4gICAgICAgICAgIHRoaXMuZXZlbnRbXCJHYXJ1ZGFcIl0udmFsdWUuY2FsbCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG5cbiAgICAgICAgLy/jgqzjg6vjg7zjg4DmqZ/lvbFcbiAgICAgICAgdGhpcy5hZGRFdmVudChcImJvc3Nfc2hhZG93XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxQmxhY2tcIiwgMjk2LCA4MCk7XG4gICAgICAgICAgICBzaGFkb3cubGF5ZXIgPSBMQVlFUl9GT1JFR1JPVU5EO1xuICAgICAgICAgICAgc2hhZG93LmFscGhhID0gMC41O1xuICAgICAgICAgICAgc2hhZG93LmFkZENoaWxkVG8oYXBwLmN1cnJlbnRTY2VuZSlcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxMjgsIDMyMCwgMjk2LCAxNjApXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyoxLjEsIFNDX0gqMS4yKVxuICAgICAgICAgICAgICAgIC5zZXRTY2FsZSgyLjApO1xuICAgICAgICAgICAgc2hhZG93LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMueSAtPSAxO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnkgPCAtODApIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICAvL+ODnOOCueeZu+WgtOa8lOWHulxuICAgICAgICB0aGlzLmFkZEV2ZW50KFwiR2FydWRhXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxQmxhY2tcIiwgMjk2LCA4MClcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxMjgsIDMyMCwgMjk2LCAxNjApXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC40KTtcbiAgICAgICAgICAgIHNoYWRvdy5sYXllciA9IExBWUVSX1NIQURPVztcbiAgICAgICAgICAgIHNoYWRvdy5hbHBoYSA9IDAuMDtcbiAgICAgICAgICAgIHNoYWRvdy50aW1lID0gMDtcbiAgICAgICAgICAgIHNoYWRvdy5hZGRDaGlsZFRvKGFwcC5jdXJyZW50U2NlbmUpO1xuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBzaGFkb3cudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKS5jbGVhcigpXG4gICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMC40LCB5OiBTQ19IKjAuMn0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wYXJlbnRTY2VuZS5lbnRlckVuZW15VW5pdChcIkdhcnVkYVwiKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQoc2hhZG93KSk7XG5cbiAgICAgICAgICAgIHNoYWRvdy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lIDwgMzAwKSByZXR1cm47IFxuXG4gICAgICAgICAgICAgICAgLy/nhZnjgoLjgY/jgoLjgY/jg7xcbiAgICAgICAgICAgICAgICB2YXIgeDEgPSB0aGlzLng7XG4gICAgICAgICAgICAgICAgdmFyIHkxID0gdGhpcy55LTEwO1xuICAgICAgICAgICAgICAgIHZhciB4MiA9IHRoaXMueCsxNDg7XG4gICAgICAgICAgICAgICAgdmFyIHkyID0gdGhpcy55KzQwO1xuICAgICAgICAgICAgICAgIHZhciB2eSA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IDI7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAociA9PSAxKSB4MiA9IHRoaXMueC0xNDg7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcCA9IE1hdGgucmFuZGZsb2F0KDAsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHggPSBNYXRoLmZsb29yKHgxKnAreDIqKDEtcCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB5ID0gTWF0aC5mbG9vcih5MSpwK3kyKigxLXApKS0zMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmVudGVyU21va2VMYXJnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiBweCwgeTogcHl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogdnkrTWF0aC5yYW5kaW50KDAsIDMpLCBkZWNheTogMS4wMX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IHJhbmQoMCwgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vV0FSTklOR1xuICAgICAgICB0aGlzLmFkZEV2ZW50KFwid2FybmluZ1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZW50ZXJXYXJuaW5nKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG59KTtcblxuLy/jgrnjg4bjg7zjgrjvvJHlnLDlvaLnrqHnkIZcbnBoaW5hLmRlZmluZShcIlN0YWdlOUdyb3VuZFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJHcm91bmRcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBhc3NldDogXCJtYXAxXCIsXG4gICAgICAgICAgICB0eXBlOiBcInRteFwiLFxuICAgICAgICAgICAgYmVsdDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHcgPSB0aGlzLm1hcC53aWR0aDtcbiAgICAgICAgdmFyIGggPSB0aGlzLm1hcC5oZWlnaHQ7XG4vLyAgICAgICAgdGhpcy5tYXBCYXNlLnggPSAtdyowLjU7XG4vLyAgICAgICAgdGhpcy5tYXBCYXNlLnkgPSAtaCowLjU7XG4gICAgICAgIHRoaXMubWFwQmFzZS54ID0gMDtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnkgPSAtMjAwMCozMitTQ19IO1xuICAgIH0sXG59KTtcblxufSkoKTtcbiIsIi8qXG4gKiAgU3RhZ2VDb250cm9sbGVyLmpzXG4gKiAgMjAxNC8wOC8wNlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbigpIHtcblxuLy/jgrnjg4bjg7zjgrjliLblvqFcbnBoaW5hLmRlZmluZShcIlN0YWdlQ29udHJvbGxlclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5hcHAuT2JqZWN0MkRcIixcblxuICAgIHBhcmVudFNjZW5lOiBudWxsLFxuICAgIHBsYXllcjogbnVsbCxcbiAgICB0aW1lOiAwLFxuXG4gICAgLy/ntYzpgY7mmYLplpPjg4jjg6rjgqzjgqTjg5njg7Pjg4hcbiAgICBzZXE6IG51bGwsXG4gICAgaW5kZXg6IDAsXG5cbiAgICAvL+ODnuODg+ODl+ODiOODquOCrOOCpOODmeODs+ODiFxuICAgIGV2ZW50OiBudWxsLFxuXG4gICAgYWx0aXR1ZGU6IDEwMCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBwbGF5ZXIsIHRteCwgbGF5ZXIpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgICB0aGlzLnBhcmVudFNjZW5lID0gc2NlbmU7XG4gICAgICAgIHRoaXMuc2VxID0gW107XG5cbiAgICAgICAgdGhpcy5ldmVudCA9IFtdO1xuXG4gICAgICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIH0sXG5cbiAgICAvL+aZgumWk+OCpOODmeODs+ODiOi/veWKoFxuICAgIGFkZDogZnVuY3Rpb24odGltZSwgdmFsdWUsIG9wdGlvbikge1xuICAgICAgICB0aGlzLmluZGV4ICs9IHRpbWU7XG4gICAgICAgIHRoaXMuc2VxW3RoaXMuaW5kZXhdID0ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8v5pmC6ZaT44Kk44OZ44Oz44OI5Y+W5b6XXG4gICAgZ2V0OiBmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5zZXFbdGltZV07XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLy/jg57jg4Pjg5fjgqTjg5njg7Pjg4jov73liqBcbiAgICBhZGRFdmVudDogZnVuY3Rpb24oaWQsIHZhbHVlLCBvcHRpb24pIHtcbiAgICAgICAgdGhpcy5ldmVudFtpZF0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBvcHRpb246IG9wdGlvbixcbiAgICAgICAgICAgIGV4ZWN1dGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLy/jg57jg4Pjg5fjgqTjg5njg7Pjg4jlj5blvpdcbiAgICBnZXRFdmVudDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmV2ZW50W2lkXTtcbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvL+asoeOBq+OCpOODmeODs+ODiOOBjOeZuueUn+OBmeOCi+aZgumWk+OCkuWPluW+l1xuICAgIGdldE5leHRFdmVudFRpbWU6IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnNlcVt0aW1lXTtcbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aW1lKzE7XG4gICAgICAgICAgICB2YXIgcnQgPSAtMTtcbiAgICAgICAgICAgIHRoaXMuc2VxLnNvbWUoZnVuY3Rpb24odmFsLCBpbmRleCl7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gdCkge1xuICAgICAgICAgICAgICAgICAgICBydCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LHRoaXMuc2VxKTtcbiAgICAgICAgICAgIHJldHVybiBydDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXEgPSBbXTtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgfSxcbn0pO1xuXG59KSgpO1xuIiwiLypcbiAqICBFbmVteS5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIkVuZW15XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsICAgIC8v5omA5bGe44Os44Kk44Ok44O8XG4gICAgICAgIHBhcmVudEVuZW15OiBudWxsLCAgICAgIC8v6Kaq44Go44Gq44KL5pW144Kt44Oj44OpXG5cbiAgICAgICAgLy/lkITnqK7jg5Xjg6njgrBcbiAgICAgICAgaXNDb2xsaXNpb246IHRydWUsICAvL+W9k+OCiuWIpOWumlxuICAgICAgICBpc0RlYWQ6IGZhbHNlLCAgICAgIC8v5q275LqhXG4gICAgICAgIGlzU2VsZkNyYXNoOiBmYWxzZSwgLy/oh6rniIZcbiAgICAgICAgaXNNdXRla2k6IGZhbHNlLCAgICAvL+eEoeaVtVxuICAgICAgICBpc0Jvc3M6IGZhbHNlLCAgICAgIC8v44Oc44K5XG4gICAgICAgIGlzT25TY3JlZW46IGZhbHNlLCAgLy/nlLvpnaLlhoXjgavlhaXjgaPjgZ9cbiAgICAgICAgaXNHcm91bmQ6IGZhbHNlLCAgICAvL+WcsOS4iuODleODqeOCsFxuICAgICAgICBpc0hvdmVyOiBmYWxzZSwgICAgIC8v44Oe44OD44OX44K544Kv44Ot44O844Or44Gu5b2x6Z+/54Sh6KaWXG4gICAgICAgIGlzRW5lbXk6IHRydWUsICAgICAgLy/mlbXmqZ/liKTliKVcbiAgICAgICAgaXNBdHRhY2s6IHRydWUsICAgICAvL+aUu+aSg+ODleODqeOCsFxuICAgICAgICBpc0NyYXNoRG93bjogZmFsc2UsIC8v5aKc6JC944OV44Op44KwXG5cbiAgICAgICAgLy/jgq3jg6Pjg6njgq/jgr/mg4XloLFcbiAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgdHlwZTogLTEsXG4gICAgICAgIGRlZjogMCxcbiAgICAgICAgZGVmTWF4OiAwLFxuICAgICAgICBkYW5tYWt1TmFtZTogbnVsbCxcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICBlbnRlclBhcmFtOiBudWxsLFxuICAgICAgICBhbHRpdHVkZTogMSxcblxuICAgICAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgICAgICBib2R5OiBudWxsLFxuICAgICAgICB0ZXhOYW1lOiBudWxsLFxuICAgICAgICB0ZXhJbmRleDogMCxcbiAgICAgICAgdGV4V2lkdGg6IDMyLFxuICAgICAgICB0ZXhIZWlnaHQ6IDMyLFxuICAgICAgICB0ZXhDb2xvcjogXCJcIixcblxuICAgICAgICAvL+WfuuacrOaDheWgsVxuICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICBwbGF5ZXI6IG51bGwsXG5cbiAgICAgICAgLy/liY3jg5Xjg6zjg7zjg6DluqfmqJlcbiAgICAgICAgYmVmb3JlWDogMCxcbiAgICAgICAgYmVmb3JlWTogMCxcblxuICAgICAgICAvL+Wun+ihjOOCv+OCueOCr+OCreODpeODvFxuICAgICAgICB0YXNrOiBudWxsLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihuYW1lLCB4LCB5LCBpZCwgcGFyYW0pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgLy9Ud2VlbmVy44KSRlBT44OZ44O844K544Gr44GZ44KLXG4gICAgICAgIHRoaXMudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmlkID0gaWQgfHwgLTE7XG4gICAgICAgIHRoaXMuZW50ZXJQYXJhbSA9IHBhcmFtOyAvL0VuZW15VW5pdOOBi+OCieOBruaKleWFpeaZguODkeODqeODoeODvOOCv1xuXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHZhciBkID0gdGhpcy5kYXRhID0gZW5lbXlEYXRhW25hbWVdO1xuICAgICAgICBpZiAoIWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkVuZW15IGRhdGEgbm90IGZvdW5kLjogJ1wiK25hbWUrXCInXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/lvL7luZXlrprnvqlcbiAgICAgICAgaWYgKGQuZGFubWFrdU5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuZGFubWFrdU5hbWUgPSBkLmRhbm1ha3VOYW1lXG4gICAgICAgICAgICBpZiAoZC5kYW5tYWt1TmFtZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVswXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/ln7rmnKzku5Xmp5jjgrPjg5Tjg7xcbiAgICAgICAgdGhpcy50eXBlID0gZC50eXBlIHx8IEVORU1ZX1NNQUxMO1xuICAgICAgICB0aGlzLmRlZiA9IHRoaXMuZGVmTWF4ID0gZC5kZWY7XG4gICAgICAgIHRoaXMud2lkdGggPSBkLndpZHRoIHx8IDMyO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGQuaGVpZ2h0IHx8IDMyO1xuICAgICAgICB0aGlzLmxheWVyID0gZC5sYXllciB8fCBMQVlFUl9PQkpFQ1RfTUlERExFO1xuICAgICAgICB0aGlzLnBvaW50ID0gZC5wb2ludCB8fCAwO1xuXG4gICAgICAgIHRoaXMuc2V0dXAgPSBkLnNldHVwIHx8IHRoaXMuc2V0dXA7XG4gICAgICAgIHRoaXMuZXF1aXBtZW50ID0gZC5lcHVpcG1lbnQgfHwgdGhpcy5lcXVpcG1lbnQ7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtID0gZC5hbGdvcml0aG0gfHwgdGhpcy5hbGdvcml0aG07XG4gICAgICAgIHRoaXMuZGVhZENoaWxkID0gZC5kZWFkQ2hpbGQgfHwgdGhpcy5kZWFkQ2hpbGQ7XG4gICAgICAgIHRoaXMuY2hhbmdlQ29sb3IgPSBkLmNoYW5nZUNvbG9yIHx8IHRoaXMuY2hhbmdlQ29sb3I7XG5cbiAgICAgICAgLy/noLTlo4rjg5Hjgr/jg7zjg7NcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFTkVNWV9NQk9TUyB8fCB0aGlzLnR5cGUgPT0gRU5FTVlfQk9TUyApe1xuICAgICAgICAgICAgdGhpcy5kZWFkID0gZC5kZWFkIHx8IHRoaXMuZGVmYXVsdERlYWRCb3NzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWFkID0gZC5kZWFkIHx8IHRoaXMuZGVmYXVsdERlYWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvL+apn+S9k+eUqOOCueODl+ODqeOCpOODiFxuICAgICAgICBpZiAoZC50ZXhOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnRleE5hbWUgPSBkLnRleE5hbWU7XG4gICAgICAgICAgICB0aGlzLnRleEluZGV4ID0gZC50ZXhJbmRleCB8fCAwO1xuICAgICAgICAgICAgdGhpcy50ZXhXaWR0aCA9IGQudGV4V2lkdGg7XG4gICAgICAgICAgICB0aGlzLnRleEhlaWdodCA9IGQudGV4SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5ib2R5ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoZC50ZXhOYW1lLCBkLnRleFdpZHRoLCBkLnRleEhlaWdodCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgICAgICB0aGlzLnRleFRyaW1YID0gZC50ZXhUcmltWCB8fCAwO1xuICAgICAgICAgICAgdGhpcy50ZXhUcmltWSA9IGQudGV4VHJpbVkgfHwgMDtcbiAgICAgICAgICAgIHRoaXMudGV4VHJpbVdpZHRoID0gZC50ZXhUcmltV2lkdGggfHwgdGhpcy5ib2R5LmltYWdlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy50ZXhUcmltSGVpZ2h0ID0gZC50ZXhUcmltSGVpZ2h0IHx8IHRoaXMuYm9keS5pbWFnZS5oZWlnaHQ7XG5cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZVRyaW1taW5nKHRoaXMudGV4VHJpbVgsIHRoaXMudGV4VHJpbVksIHRoaXMudGV4VHJpbVdpZHRoLCB0aGlzLnRleFRyaW1IZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lSW5kZXgodGhpcy50ZXhJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+W9k+OCiuWIpOWumuODgOODn+ODvOihqOekulxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy50ZXhOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudGV4V2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgdGhpcy50ZXhIZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuYm9keSA9IHBoaW5hLmRpc3BsYXkuU2hhcGUoe3dpZHRoOnRoaXMud2lkdGgsIGhlaWdodDp0aGlzLmhlaWdodH0pLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmJvZHkudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5yZW5kZXJSZWN0YW5nbGUoe2ZpbGxTdHlsZTogXCJyZ2JhKDI1NSwyNTUsMCwxLjApXCIsIHN0cm9rZVN0eWxlOiBcInJnYmEoMjU1LDI1NSwwLDEuMClcIn0pO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge3RoaXMucm90YXRpb24gPSAtdGhhdC5yb3RhdGlvbjt9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm9keS5hbHBoYSA9IDEuMDtcbiAgICAgICAgdGhpcy5ib2R5LmJsZW5kTW9kZSA9IFwic291cmNlLW92ZXJcIjtcblxuICAgICAgICBpZiAoVklFV19DT0xMSVNJT04pIHtcbiAgICAgICAgICAgIHRoaXMuY29sID0gcGhpbmEuZGlzcGxheS5TaGFwZSh7d2lkdGg6dGhpcy53aWR0aCwgaGVpZ2h0OnRoaXMuaGVpZ2h0fSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuY29sLnJlbmRlclJlY3RhbmdsZSh7ZmlsbFN0eWxlOiBcInJnYmEoMjU1LDI1NSwwLDAuNSlcIiwgc3Ryb2tlU3R5bGU6IFwicmdiYSgyNTUsMjU1LDAsMC41KVwifSk7XG4gICAgICAgICAgICB0aGlzLmNvbC51cGRhdGUgPSBmdW5jdGlvbigpIHt0aGlzLnJvdGF0aW9uID0gLXRoYXQucm90YXRpb247fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgLy/ogJDkuYXlipvooajnpLpcbiAgICAgICAgICAgIHZhciBkZiA9IHRoaXMuZGVmRGlzcCA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiWzAvMF1cIn0pLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBkZi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gLXRoYXQucm90YXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJbXCIrdGhhdC5kZWYrXCIvXCIrdGhhdC5kZWZNYXgrXCJdXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODleODqeOCsOOCu+ODg+ODiFxuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZC5pc0NvbGxpc2lvbiB8fCB0aGlzLmlzQ29sbGlzaW9uO1xuICAgICAgICB0aGlzLmlzRGVhZCAgICAgID0gZC5pc0RlYWQgICAgICB8fCB0aGlzLmlzRGVhZDtcbiAgICAgICAgdGhpcy5pc1NlbGZDcmFzaCA9IGQuaXNTZWxmQ3Jhc2ggfHwgdGhpcy5pc1NlbGZDcmFzaDtcbiAgICAgICAgdGhpcy5pc011dGVraSAgICA9IGQuaXNNdXRla2kgICAgfHwgdGhpcy5pc011dGVraVxuICAgICAgICB0aGlzLmlzT25TY3JlZW4gID0gZC5pc09uU2NyZWVuICB8fCB0aGlzLmlzT25TY3JlZW47XG4gICAgICAgIHRoaXMuaXNHcm91bmQgICAgPSBkLmlzR3JvdW5kICAgIHx8IHRoaXMuaXNHcm91bmQ7XG4gICAgICAgIHRoaXMuaXNIb3ZlciAgICAgPSBkLmlzSG92ZXIgICAgIHx8IHRoaXMuaXNIb3ZlcjtcbiAgICAgICAgdGhpcy5pc0VuZW15ICAgICA9IGQuaXNFbmVteSAgICAgfHwgdGhpcy5pc0VuZW15O1xuICAgICAgICB0aGlzLmlzQXR0YWNrICAgID0gZC5pc0F0dGFjayAgICB8fCB0aGlzLmlzQXR0YWNrO1xuICAgICAgICB0aGlzLmlzQ3Jhc2hEb3duID0gZC5pc0NyYXNoRG93biB8fCB0aGlzLmlzQ3Jhc2hEb3duO1xuICAgICAgICBpZiAodGhpcy50eXBlID09IEVORU1ZX01CT1NTXG4gICAgICAgICAgICB8fCB0aGlzLnR5cGUgPT0gRU5FTVlfQk9TU1xuICAgICAgICAgICAgfHwgdGhpcy50eXBlID09IEVORU1ZX0JPU1NfRVFVSVApIHRoaXMuaXNCb3NzID0gdHJ1ZTtcblxuICAgICAgICAvL+OBneOCjOS7peWkluOBruWbuuacieWkieaVsOOCkuOCs+ODlOODvFxuICAgICAgICB0aGlzLiRzYWZlKGQpO1xuXG4gICAgICAgIC8v44OR44Op44Oh44O844K/44K744OD44OI44Ki44OD44OXXG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUgPSBhcHAuY3VycmVudFNjZW5lO1xuICAgICAgICB0aGlzLnBsYXllciA9IHRoaXMucGFyZW50U2NlbmUucGxheWVyO1xuICAgICAgICB0aGlzLnNldHVwKHBhcmFtKTtcblxuICAgICAgICAvL+apn+W9sei/veWKoFxuICAgICAgICB0aGlzLmFkZFNoYWRvdygpO1xuXG4gICAgICAgIC8v5b2T44KK5Yik5a6a6Kit5a6aXG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJyZWN0XCI7XG5cbiAgICAgICAgLy9hZGTmmYJcbiAgICAgICAgdGhpcy5vbignYWRkZWQnLCB0aGlzLmVxdWlwbWVudCk7XG5cbiAgICAgICAgLy9yZW1vdmXmmYJcbiAgICAgICAgdGhpcy5vbigncmVtb3ZlZCcsIHRoaXMucmVsZWFzZSk7XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKGVudGVyUGFyYW0pIHtcbiAgICB9LFxuXG4gICAgZXF1aXBtZW50OiBmdW5jdGlvbihlbnRlclBhcmFtKSB7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIC8vYnVsbGV0TUwucnVubmVy5pu05paw5Yem55CGXG4gICAgICAgIGlmICghdGhpcy5pc0RlYWQgJiYgdGhpcy5ydW5uZXIpIHtcbiAgICAgICAgICAgIHRoaXMucnVubmVyLnggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB0aGlzLnJ1bm5lci55ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIudXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+WcsOS4iueJqeePvuW6p+aomeiqv+aVtFxuICAgICAgICBpZiAodGhpcy5pc0dyb3VuZCAmJiAhdGhpcy5pc0hvdmVyKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgICAgICB0aGlzLnggKz0gZ3JvdW5kLmRlbHRhWDtcbiAgICAgICAgICAgIHRoaXMueSArPSBncm91bmQuZGVsdGFZO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5zjgrnns7vnoLTlo4rmmYLlvL7mtojljrtcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09IEVORU1ZX01CT1NTIHx8IHRoaXMudHlwZSA9PSBFTkVNWV9CT1NTKSB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCv+OCueOCr+WHpueQhlxuICAgICAgICBpZiAodGhpcy50YXNrKSB7XG4gICAgICAgICAgICB0aGlzLmV4ZWNUYXNrKHRoaXMudGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ihjOWLleOCouODq+OCtOODquOCuuODoFxuICAgICAgICB0aGlzLmFsZ29yaXRobShhcHApO1xuXG4gICAgICAgIC8v44K544Kv44Oq44O844Oz5YaF5YWl44Gj44Gf5Yik5a6aXG4gICAgICAgIGlmICh0aGlzLmlzT25TY3JlZW4pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0Jvc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHRoaXMuYm9keS53aWR0aC8yO1xuICAgICAgICAgICAgICAgIHZhciBoID0gdGhpcy5ib2R5LmhlaWdodC8yO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnggPCAtdyB8fCB0aGlzLnggPiBTQ19XK3cgfHwgdGhpcy55IDwgLWggfHwgdGhpcy55ID4gU0NfSCtoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+S4reW/g+OBjOeUu+mdouWGheOBq+WFpeOBo+OBn+aZgueCueOCkueUu+mdouWGheOBqOWIpOWumuOBmeOCi1xuICAgICAgICAgICAgaWYgKDAgPCB0aGlzLnggJiYgdGhpcy54IDwgU0NfVyAmJiAwIDwgdGhpcy55ICYmIHRoaXMueSA8IFNDX0gpIHRoaXMuaXNPblNjcmVlbiA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL+iHquapn+OBqOOBruW9k+OCiuWIpOWumuODgeOCp+ODg+OCr1xuICAgICAgICB2YXIgcGxheWVyID0gdGhpcy5wbGF5ZXI7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRU5FTVlfSVRFTSkge1xuICAgICAgICAgICAgLy/jgqLjgqTjg4bjg6Djga7loLTlkIhcbiAgICAgICAgICAgIGlmICh0aGlzLmlzSGl0RWxlbWVudChwbGF5ZXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2V0SXRlbSh0aGlzLmtpbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/jgqLjgqTjg4bjg6Dku6XlpJbjga7loLTlkIhcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ29sbGlzaW9uICYmICF0aGlzLmlzR3JvdW5kICYmICF0aGlzLmlzRGVhZCAmJiBwbGF5ZXIuaXNDb2xsaXNpb24gJiYgdGhpcy5pc0hpdEVsZW1lbnQocGxheWVyKSkge1xuICAgICAgICAgICAgICAgIHBsYXllci5kYW1hZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v6Kaq5qmf44GM56C05aOK44GV44KM44Gf5aC05ZCI44CB6Ieq5YiG44KC56C05aOKXG4gICAgICAgIGlmICghdGhpcy5pc0RlYWQgJiYgdGhpcy5wYXJlbnRFbmVteSAmJiB0aGlzLnBhcmVudEVuZW15LmlzRGVhZCkge1xuICAgICAgICAgICAgdGhpcy5pc1NlbGZDcmFzaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRlYWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v54CV5q27XG4gICAgICAgIGlmICh0aGlzLmRlZiA8IHRoaXMuZGVmTWF4KjAuMikgdGhpcy5uZWFyRGVhdGgoKTtcblxuICAgICAgICAvL+WcsOS4iuaVteOBp+iHquapn+OBq+i/keOBhOWgtOWQiOOBr+W8vuOCkuaSg+OBn+OBquOBhFxuICAgICAgICBpZiAodGhpcy5pc0dyb3VuZCAmJiAhdGhpcy5pc0Jvc3MpIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZVNxKHRoaXMsIHRoaXMucGFyZW50U2NlbmUucGxheWVyKSA8IDQwOTYpXG4gICAgICAgICAgICAgICAgdGhpcy5pc0F0dGFjayA9IGZhbHNlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuaXNBdHRhY2sgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ib2R5LmZyYW1lSW5kZXggPSB0aGlzLnRleEluZGV4O1xuXG4gICAgICAgIHRoaXMuYmVmb3JlWCA9IHRoaXMueDtcbiAgICAgICAgdGhpcy5iZWZvcmVZID0gdGhpcy55O1xuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxuXG4gICAgLy/jgqLjg6vjgrTjg6rjgrrjg6BcbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBkYW1hZ2U6IGZ1bmN0aW9uKHBvd2VyLCBmb3JjZSkge1xuICAgICAgICBpZiAodGhpcy5pc011dGVraSB8fCB0aGlzLmlzRGVhZCB8fCAhdGhpcy5pc0NvbGxpc2lvbikgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZGVmIC09IHBvd2VyO1xuICAgICAgICBpZiAoZm9yY2UpIHRoaXMuZGVmID0gLTE7XG4gICAgICAgIGlmICh0aGlzLmRlZiA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuZGVmID0gMDtcblxuICAgICAgICAgICAgLy/noLTlo4rjg5Hjgr/jg7zjg7PmipXlhaVcbiAgICAgICAgICAgIHRoaXMuZmxhcmUoJ2RlYWQnKTtcbiAgICAgICAgICAgIHRoaXMuZGVhZCgpO1xuXG4gICAgICAgICAgICAvL+imquapn+OBq+egtOWjiuOCkumAmuefpVxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50RW5lbXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudEVuZW15LmRlYWRDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/jgrnjgrPjgqLliqDnrpdcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGZDcmFzaCkgYXBwLnNjb3JlICs9IHRoaXMucG9pbnQ7XG5cbiAgICAgICAgICAgIC8v44Oc44K55pKD56C044KS44K344O844Oz44Gr6YCa55+lXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLnR5cGUgPT0gRU5FTVlfQk9TUyB8fCB0aGlzLmRhdGEudHlwZSA9PSBFTkVNWV9NQk9TUykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZmxhcmUoJ2VuZF9ib3NzJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW5lbXlLaWxsKys7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v6KKr44OA44Oh44O844K45ryU5Ye6XG4gICAgICAgIHRoaXMuY2hhbmdlQ29sb3IoXCJXaGl0ZVwiLCB0cnVlKTtcbiAgICAgICAgdGhpcy5ib2R5LnR3ZWVuZXIuY2xlYXIoKS53YWl0KDEpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLmNoYW5nZUNvbG9yKCl9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy/ngJXmrbvnirbmhYtcbiAgICBuZWFyRGVhdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lICUgMzAgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDb2xvcihcIlJlZFwiKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRpbWUgJSAzMCA9PSA1KSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNvbG9yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50aW1lICUgMzUgPT0gMCkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLndpZHRoLzI7XG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuaGVpZ2h0LzI7XG4gICAgICAgICAgICB2YXIgbnVtID0gdGhpcy50eXBlID09IEVORU1ZX0JPU1MgfHwgdGhpcy50eXBlID09IEVORU1ZX01CT1NTPyAzOiAxO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLXcsIHcpO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLWgsIGgpO1xuICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBpID09IDA/IDA6IHJhbmQoMCwgMTUpO1xuICAgICAgICAgICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGUobGF5ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiBncm91bmQuZGVsdGFYLCB5OiBncm91bmQuZGVsdGFZLCBkZWNheTogMC45fSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVTbWFsbFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/oibLjgpLotaRvcueZveOBj+OBmeOCi1xuICAgIGNoYW5nZUNvbG9yOiBmdW5jdGlvbihjb2xvciwgcmV2ZXJzZSkge1xuICAgICAgICBpZiAoIXRoaXMudGV4TmFtZSkgcmV0dXJuO1xuIFxuICAgICAgICAvL+aMh+WumuiJsuOBq+OCiOOBo+OBpueUu+WDj+WQjeOBjOWkieOCj+OCi1xuICAgICAgICBpZiAocmV2ZXJzZSAmJiB0aGlzLnRleENvbG9yICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSBcIlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleENvbG9yID0gXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbG9yICE9IFwiUmVkXCIgJiYgY29sb3IgIT0gXCJXaGl0ZVwiICYmIGNvbG9yICE9IFwiQmxhY2tcIikgY29sb3IgPSBcIlJlZFwiO1xuICAgICAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v55S75YOP44Gu5YaN6Kit5a6aXG4gICAgICAgIHRoaXMuYm9keS5zZXRJbWFnZSh0aGlzLnRleE5hbWUrdGhpcy50ZXhDb2xvciwgdGhpcy50ZXhXaWR0aCwgdGhpcy50ZXhIZWlnaHQpO1xuICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVUcmltbWluZyh0aGlzLnRleFRyaW1YLCB0aGlzLnRleFRyaW1ZLCB0aGlzLnRleFRyaW1XaWR0aCwgdGhpcy50ZXhUcmltSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lSW5kZXgodGhpcy50ZXhJbmRleCk7XG4gICAgfSxcblxuICAgIC8v6YCa5bi456C05aOK44OR44K/44O844OzXG4gICAgZGVmYXVsdERlYWQ6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgdGhpcy5leHBsb2RlKHdpZHRoLCBoZWlnaHQpOyAgICAgICAgXG5cbiAgICAgICAgLy/lvL7mtojjgZdcbiAgICAgICAgaWYgKHRoaXMuZGF0YS50eXBlID09IEVORU1ZX01JRERMRSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRhdGEudHlwZSA9PSBFTkVNWV9MQVJHRSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCgpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID0gNjA7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0aGlzLmlzQ3Jhc2hEb3duKSB7XG4gICAgICAgICAgICB2YXIgZ3JZID0gdGhpcy55ICsgODA7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7eTogZ3JZLCBhbHRpdHVkZTogMC4xfSwgMTIwLCBcImVhc2VTaW5lT3V0XCIpXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v56C05aOK5pmC5raI5Y6744Kk44Oz44K/44O844OQ44OrXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmV4cGxvZGVUeXBlID09IEVYUExPREVfU01BTEwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoYWRvdy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMuc2hhZG93KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGRlZmF1bHREZWFkQm9zczogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB0aGlzLmV4cGxvZGUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlTGFyZ2VcIik7XG5cbiAgICAgICAgLy/lvL7mtojjgZdcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCgpO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPSAxODA7XG5cbiAgICAgICAgLy/noLTlo4rmmYLmtojljrvjgqTjg7Pjgr/jg7zjg5Djg6tcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC5tb3ZlQnkoMCwgODAsIDMwMClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9kZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLm1hc2tXaGl0ZS50d2VlbmVyLmNsZWFyKCkuZmFkZUluKDQ1KS5mYWRlT3V0KDQ1KTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUJvc3NcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMuc2hhZG93KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGV4cGxvZGU6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgLy/niIbnmbrnhKHjgZdcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5leHBsb2RlVHlwZSA9PSBFWFBMT0RFX05PVEhJTkcpIHJldHVybjtcblxuICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgIHZhciB1cHBlciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgdmFyIGxvd2VyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllckxvd2VyO1xuICAgICAgICB2YXIgdnggPSB0aGlzLngtdGhpcy5iZWZvcmVYK2dyb3VuZC5kZWx0YVg7XG4gICAgICAgIHZhciB2eSA9IHRoaXMueS10aGlzLmJlZm9yZVkrZ3JvdW5kLmRlbHRhWTtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuZGF0YS5leHBsb2RlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBFWFBMT0RFX1NNQUxMOlxuICAgICAgICAgICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGUodXBwZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB0aGlzLngsIHk6IHRoaXMueX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMC45NX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZVNtYWxsXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFWFBMT0RFX01JRERMRTpcbiAgICAgICAgICAgIGNhc2UgRVhQTE9ERV9MQVJHRTpcbiAgICAgICAgICAgICAgICB2YXIgbnVtID0gcmFuZCgyMCwgMzApKnRoaXMuZGF0YS5leHBsb2RlVHlwZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLXdpZHRoLCB3aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLWhlaWdodCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gcmFuZCgwLCAzMCk7XG4gICAgICAgICAgICAgICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGUodXBwZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogeCwgeTogeX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4LCB5OiB2eSwgZGVjYXk6IDAuOTV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVMYXJnZVwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRVhQTE9ERV9HUk9VTkQ6XG4gICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZUdyb3VuZChsb3dlciwge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnksIGRlY2F5OiAwLjk1fSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlU21hbGxcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEVYUExPREVfQk9TUzpcbiAgICAgICAgICAgICAgICB2YXIgbnVtID0gcmFuZCgxMDAsIDE1MCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMueCtyYW5kKC13aWR0aCowLjcsIHdpZHRoKjAuNyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLWhlaWdodCowLjcsIGhlaWdodCowLjcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSByYW5kKDAsIDE1KTtcbiAgICAgICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZSh1cHBlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMC45NX0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL0J1bGxldE1M6LW35YuVXG4gICAgc3RhcnREYW5tYWt1OiBmdW5jdGlvbihkYW5tYWt1TmFtZSkge1xuICAgICAgICBpZiAodGhpcy5ydW5uZXIpIHtcbiAgICAgICAgICAgIHRoaXMucnVubmVyLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucnVubmVyID0gZGFubWFrdVtkYW5tYWt1TmFtZV0uY3JlYXRlUnVubmVyKEJ1bGxldENvbmZpZyk7XG4gICAgICAgIHRoaXMucnVubmVyLmhvc3QgPSB0aGlzO1xuICAgICAgICB0aGlzLnJ1bm5lci5vbk5vdGlmeSA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZmxhcmUoXCJidWxsZXRcIiArIGV2ZW50VHlwZSwgZXZlbnQpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL0J1bGxldE1M5YGc5q2iXG4gICAgc3RvcERhbm1ha3U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uZXIpIHtcbiAgICAgICAgICAgIHRoaXMucnVubmVyLnN0b3AgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL0J1bGxldE1M5YaN6ZaLXG4gICAgcmVzdW1lRGFubWFrdTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5lcikge1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIuc3RvcCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+imquapn+OBruOCu+ODg+ODiFxuICAgIHNldFBhcmVudEVuZW15OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnRFbmVteSA9IHBhcmVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v5a2Q5qmf44GM56C05aOK44GV44KM44Gf5aC05ZCI44Gr5ZG844Gw44KM44KL44Kz44O844Or44OQ44OD44KvXG4gICAgZGVhZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgIH0sXG5cbiAgICAvL+aMh+WumuOCv+ODvOOCsuODg+ODiOOBruaWueWQkeOCkuWQkeOBj1xuICAgIGxvb2tBdDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB0aGlzLnBsYXllcjtcblxuICAgICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruaWueWQkeOCkuWQkeOBj1xuICAgICAgICB2YXIgYXggPSB0aGlzLnggLSB0YXJnZXQueDtcbiAgICAgICAgdmFyIGF5ID0gdGhpcy55IC0gdGFyZ2V0Lnk7XG4gICAgICAgIHZhciByYWQgPSBNYXRoLmF0YW4yKGF5LCBheCk7XG4gICAgICAgIHZhciBkZWcgPSB+fihyYWQgKiB0b0RlZyk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBkZWcgKyA5MDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v5oyH5a6a44K/44O844Ky44OD44OI44Gu5pa55ZCR44Gr6YCy44KAXG4gICAgbW92ZVRvOiBmdW5jdGlvbih0YXJnZXQsIHNwZWVkLCBsb29rKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB0aGlzLnBsYXllcjtcbiAgICAgICAgc3BlZWQgPSBzcGVlZCB8fCA1O1xuXG4gICAgICAgIC8v44K/44O844Ky44OD44OI44Gu5pa55ZCR44KS6KiI566XXG4gICAgICAgIHZhciBheCA9IHRoaXMueCAtIHRhcmdldC54O1xuICAgICAgICB2YXIgYXkgPSB0aGlzLnkgLSB0YXJnZXQueTtcbiAgICAgICAgdmFyIHJhZCA9IE1hdGguYXRhbjIoYXksIGF4KTtcbiAgICAgICAgdmFyIGRlZyA9IH5+KHJhZCAqIHRvRGVnKTtcblxuICAgICAgICBpZiAobG9vayB8fCBsb29rID09PSB1bmRlZmluZWQpIHRoaXMucm90YXRpb24gPSBkZWcgKyA5MDtcblxuICAgICAgICB0aGlzLnZ4ID0gTWF0aC5jb3MocmFkK01hdGguUEkpKnNwZWVkO1xuICAgICAgICB0aGlzLnZ5ID0gTWF0aC5zaW4ocmFkK01hdGguUEkpKnNwZWVkO1xuICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICByZWxlYXNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB0aGlzLnNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/lh6bnkIbjgr/jgrnjgq/jga7ov73liqBcbiAgICBhZGRUYXNrOiBmdW5jdGlvbih0aW1lLCB0YXNrKSB7XG4gICAgICAgIGlmICghdGhpcy50YXNrKSB0aGlzLnRhc2sgPSBbXTtcbiAgICAgICAgdGhpcy50YXNrW3RpbWVdID0gdGFzaztcbiAgICB9LFxuXG4gICAgLy/lh6bnkIbjgr/jgrnjgq/jga7lrp/ooYxcbiAgICBleGVjVGFzazogZnVuY3Rpb24odGltZSkge1xuICAgICAgICB2YXIgdCA9IHRoaXMudGFza1t0aW1lXTtcbiAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YodCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0LmNhbGwodGhpcywgYXBwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v5qmf5b2x6L+95YqgXG4gICAgYWRkU2hhZG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zaGFkb3cgPSBwaGluYS5kaXNwbGF5LlNwcml0ZSh0aGlzLnRleE5hbWUrXCJCbGFja1wiLCB0aGlzLnRleFdpZHRoLCB0aGlzLnRleEhlaWdodCk7XG4gICAgICAgIHRoaXMuc2hhZG93LmxheWVyID0gTEFZRVJfU0hBRE9XO1xuICAgICAgICB0aGlzLnNoYWRvdy5hbHBoYSA9IDAuNTtcbiAgICAgICAgdGhpcy5zaGFkb3cuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKTtcbiAgICAgICAgdGhpcy5zaGFkb3cuc2V0RnJhbWVUcmltbWluZyh0aGlzLnRleFRyaW1YLCB0aGlzLnRleFRyaW1ZLCB0aGlzLnRleFRyaW1XaWR0aCwgdGhpcy50ZXhUcmltSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFkb3cuc2V0RnJhbWVJbmRleCh0aGlzLnRleEluZGV4KTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2hhZG93LnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBncm91bmQgPSB0aGF0LnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGdyb3VuZC5pc1NoYWRvdztcblxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoYXQucm90YXRpb247XG4gICAgICAgICAgICBpZiAodGhhdC5pc0dyb3VuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHRoYXQueCArIDEwO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoYXQueSArIDEwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSB0aGF0LnggKyBncm91bmQuc2hhZG93WCAqIHRoYXQuYWx0aXR1ZGU7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdGhhdC55ICsgZ3JvdW5kLnNoYWRvd1kgKiB0aGF0LmFsdGl0dWRlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGVYID0gZ3JvdW5kLnNjYWxlWDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlWSA9IGdyb3VuZC5zY2FsZVk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/lnJ/nhZnov73liqBcbiAgICBhZGRTbW9rZTogZnVuY3Rpb24odm9sdW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGVhZCkgcmV0dXJuIHRoaXM7XG4gICAgICAgIHZvbHVtZSA9IHZvbHVtZSB8fCA1O1xuICAgICAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQpIGhlaWdodCA9IHRoaXMud2lkdGg7XG5cbiAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllckxvd2VyO1xuICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgIHZhciB2eCA9IGdyb3VuZC5kZWx0YVg7XG4gICAgICAgIHZhciB2eSA9IGdyb3VuZC5kZWx0YVk7XG4gICAgICAgIHZhciB3ID0gd2lkdGgvMjtcbiAgICAgICAgdmFyIGggPSBoZWlnaHQvMjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZvbHVtZTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMueCtyYW5kKC13LCB3KTtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLWgsIGgpO1xuICAgICAgICAgICAgbGF5ZXIuZW50ZXJTbW9rZSh7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4LCB5OiB2eSwgZGVjYXk6IDF9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5Zyf54WZ6L+95Yqg77yI5bCP77yJXG4gICAgYWRkU21va2VTbWFsbDogZnVuY3Rpb24odm9sdW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGVhZCkgcmV0dXJuIHRoaXM7XG4gICAgICAgIHZvbHVtZSA9IHZvbHVtZSB8fCA1O1xuICAgICAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQpIGhlaWdodCA9IHRoaXMud2lkdGg7XG5cbiAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllckxvd2VyO1xuICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgIHZhciB2eCA9IGdyb3VuZC5kZWx0YVg7XG4gICAgICAgIHZhciB2eSA9IGdyb3VuZC5kZWx0YVk7XG4gICAgICAgIHZhciB3ID0gd2lkdGgvMjtcbiAgICAgICAgdmFyIGggPSBoZWlnaHQvMjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZvbHVtZTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMueCtyYW5kKC13LCB3KTtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLWgsIGgpO1xuICAgICAgICAgICAgbGF5ZXIuZW50ZXJTbW9rZVNtYWxsKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMX0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgRW5lbXlEYXRhLmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuY29uc3QgZW5lbXlEYXRhID0gW107XG5cbi8qXG4gKiAg5pS75pKD44OY44Oq44CM44Ob44O844ON44OD44OI44CNXG4gKi9cbmVuZW15RGF0YVsnSG9ybmV0J10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogW1wiSG9ybmV0MVwiLCBcIkhvcm5ldDJcIiwgXCJIb3JuZXQzXCJdLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDE2LFxuICAgIGhlaWdodDogMTYsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogMzAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAzMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9TTUFMTCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfU01BTEwsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiAzMixcbiAgICB0ZXhIZWlnaHQ6IDMyLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKGVudGVyUGFyYW0pIHtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMucm90ZXIgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleDFcIiwgMzIsIDMyKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLnJvdGVyLmluZGV4ID0gMzI7XG4gICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVJbmRleCgzMik7XG5cbiAgICAgICAgdGhpcy52eCA9IDA7XG4gICAgICAgIHRoaXMudnkgPSAwO1xuXG4gICAgICAgIC8v6KGM5YuV44OR44K/44O844Oz5YiG5bKQXG4gICAgICAgIHRoaXMucGF0dGVybiA9IGVudGVyUGFyYW0ucGF0dGVybjtcbiAgICAgICAgc3dpdGNoICh0aGlzLnBhdHRlcm4pIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIubW92ZUJ5KDAsIDMwMCwgMTIwLCBcImVhc2VPdXRRdWFydFwiKVxuICAgICAgICAgICAgICAgICAgICAud2FpdCg2MClcbiAgICAgICAgICAgICAgICAgICAgLm1vdmVCeSgwLCAtMzAwLCAxMjApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7dGhpcy5yZW1vdmUoKTt9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvKHRoaXMucGxheWVyLCA1LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIubW92ZUJ5KDAsIDIwMCwgMTIwLCBcImVhc2VPdXRRdWFydFwiKVxuICAgICAgICAgICAgICAgICAgICAud2FpdCg2MDApXG4gICAgICAgICAgICAgICAgICAgIC5tb3ZlQnkoMCwgLTMwMCwgMTIwKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe3RoaXMucGhhc2UrKzt9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWVbMl0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLm1vdmVCeSgwLCBTQ19IKjAuNSwgMzAwKS53YWl0KDQ4MCkubW92ZUJ5KDAsIC1TQ19ILCA2MDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIubW92ZUJ5KDAsIDIwMCwgMTIwLCBcImVhc2VPdXRRdWFydFwiKVxuICAgICAgICAgICAgICAgICAgICAud2FpdCg2MClcbiAgICAgICAgICAgICAgICAgICAgLm1vdmVCeSgwLCAtMjUwLCAxMjApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7dGhpcy5yZW1vdmUoKTt9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5/jgrXjgqTjg6vnmbrlsIRcbiAgICAgICAgdGhpcy5vbignYnVsbGV0bWlzc2lsZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIk1lZHVzYVwiLCB0aGlzLngsIHRoaXMueSkuc2V0SG9taW5nKHRydWUpLnNldFZlbG9jaXR5KC0wLjUsIC0yLjApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55KS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoIDAuNSwgLTIuMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubG9va0F0KCk7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSAyID09IDApIHtcbiAgICAgICAgICAgIHRoaXMucm90ZXIuaW5kZXggPSAodGhpcy5yb3Rlci5pbmRleCsxKSU0KzMyO1xuICAgICAgICAgICAgdGhpcy5yb3Rlci5zZXRGcmFtZUluZGV4KHRoaXMucm90ZXIuaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGF0dGVybiA9PSAyKSB7XG4gICAgICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGF0dGVybiA9PSAzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG8odGhpcy5wYXJlbnRTY2VuZS5wbGF5ZXIsIDUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBoYXNlID09IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v55S76Z2i5LiL6YOo44Gn44Gv5by+44KS5Ye644GV44Gq44GEXG4gICAgICAgIGlmICh0aGlzLnkgPiBTQ19IKjAuNykgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5Lit5Z6L5pS75pKD44OY44Oq44CM44K444Ks44OQ44OB44CNXG4gKi9cbmVuZW15RGF0YVsnTXVkRGF1YmVyJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJNdWREYXViZXJcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA2MCxcbiAgICBoZWlnaHQ6IDI2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDgwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NSURETEUsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX01JRERMRSxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDEyOCxcbiAgICB0ZXhIZWlnaHQ6IDY0LFxuICAgIHRleEluZGV4OiA2LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmluZGV4ID0gdGhpcy50ZXhJbmRleDtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG5cbiAgICAgICAgdGhpcy5yb3RlciA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4MVwiLCAxMTQsIDQ4KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLnJvdGVyLnNldEZyYW1lVHJpbW1pbmcoMjg4LCAxMjgsIDIyOCwgOTYpO1xuICAgICAgICB0aGlzLnJvdGVyLnNldEZyYW1lSW5kZXgoMCk7XG4gICAgICAgIHRoaXMucm90ZXIuaW5kZXggPSAwO1xuXG4gICAgICAgIC8v6KGM5YuV6Kit5a6aXG4gICAgICAgIHRoaXMudnkgPSA1O1xuICAgICAgICB0aGlzLnR3ZWVuZXIudG8oe3Z5OiAwLjV9LCAxMjAsIFwiZWFzZU91dEN1YmljXCIpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnBoYXNlKys7fS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDQgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5yb3Rlci5pbmRleCA9ICh0aGlzLnJvdGVyLmluZGV4KzEpJTQrMzI7XG4gICAgICAgICAgICB0aGlzLnJvdGVyLnNldEZyYW1lSW5kZXgodGhpcy5yb3Rlci5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDQgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4KzEpJTIrNjtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZUluZGV4KHRoaXMuaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy55Kz10aGlzLnZ5O1xuICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAxKSB7XG4gICAgICAgIH1cbiAgICB9LFxufTtcblxuLypcbiAqICDkuK3lnovniIbmkoPmqZ/jgIzjg5Pjg4PjgrDjgqbjgqPjg7PjgrDjgI1cbiAqL1xuZW5lbXlEYXRhWydCaWdXaW5nJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJCaWdXaW5nXCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgODAsXG4gICAgaGVpZ2h0OiAyNixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01JRERMRSxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogMTI4LFxuICAgIHRleEhlaWdodDogNDgsXG4gICAgdGV4SW5kZXg6IDIsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnRleEluZGV4O1xuICAgICAgICB0aGlzLmlzQ3Jhc2hEb3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDIgPT0gMCkgdGhpcy55Kys7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSA0ID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCsxKSUyKzI7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG4vKlxuICogIOS4reWei+aUu+aSg+apn+OAjOODh+ODq+OCv+OAjVxuICovXG5lbmVteURhdGFbJ0RlbHRhJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJCaWdXaW5nXCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgODAsXG4gICAgaGVpZ2h0OiAyNixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01JRERMRSxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogNDgsXG4gICAgdGV4SGVpZ2h0OiAxMDQsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDI1NixcbiAgICB0ZXhUcmltV2lkdGg6IDE5MixcbiAgICB0ZXhUcmltSGVpZ2h0OiA5NixcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMudGV4SW5kZXg7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSAyID09IDApIHRoaXMueSsrO1xuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXgrMSklMisyO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG4gICAgICAgIH1cbiAgICB9LFxufTtcblxuLypcbiAqICDpo5vnqbrmjLrjgIzjgrnjgqvjgqTjg5bjg6zjg7zjg4njgI1cbiAqL1xuZW5lbXlEYXRhWydTa3lCbGFkZSddID0ge1xuICAgIC8v5L2/55So5by+5bmV5ZCNXG4gICAgZGFubWFrdU5hbWU6IFwiU2t5QmxhZGVcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA0MCxcbiAgICBoZWlnaHQ6IDk2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDgwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NSURETEUsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX01JRERMRSxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDQ4LFxuICAgIHRleEhlaWdodDogMTA0LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAxMjgsXG4gICAgdGV4VHJpbVdpZHRoOiA5NixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxMDQsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnRleEluZGV4O1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcblxuICAgICAgICB0aGlzLnJvdGVyID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXgxXCIsIDQ4LCAxMDQpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVUcmltbWluZyg5NiwgMTI4LCAxOTIsIDEwNCk7XG4gICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgdGhpcy5yb3Rlci5pbmRleCA9IDA7XG5cbiAgICAgICAgLy/ooYzli5XoqK3lrppcbiAgICAgICAgaWYgKHRoaXMueCA8IFNDX1cqMC41KSB7XG4gICAgICAgICAgICB0aGlzLnB4ID0gMTtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5tb3ZlQnkoIFNDX1cqMC42LCAwLCAxODAsIFwiZWFzZU91dEN1YmljXCIpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnBoYXNlKys7fS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHggPSAtMTtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5tb3ZlQnkoLVNDX1cqMC42LCAwLCAxODAsIFwiZWFzZU91dEN1YmljXCIpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnBoYXNlKys7fS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGVyLmluZGV4ID0gKHRoaXMucm90ZXIuaW5kZXgrMSklNDtcbiAgICAgICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVJbmRleCh0aGlzLnJvdGVyLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXgrMSklMjtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZUluZGV4KHRoaXMuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMueS0tO1xuICAgICAgICAgICAgdGhpcy54Kz10aGlzLnB4O1xuICAgICAgICB9XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5Lit5Z6L5oim6LuK44CM44OV44Op44Ks44Op44OD44OP44CNXG4gKi9cbmVuZW15RGF0YVsnRnJhZ2FyYWNoJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJGcmFnYXJhY2hcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA0OCxcbiAgICBoZWlnaHQ6IDQ4LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDUwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9MT1dFUixcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfU01BTEwsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0dST1VORCxcblxuICAgIC8v5ZCE56iu44OV44Op44KwXG4gICAgaXNHcm91bmQ6IHRydWUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MlwiLFxuICAgIHRleFdpZHRoOiA0OCxcbiAgICB0ZXhIZWlnaHQ6IDQ4LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAwLFxuICAgIHRleFRyaW1XaWR0aDogMTkyLFxuICAgIHRleFRyaW1IZWlnaHQ6IDQ4LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnRleEluZGV4O1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcblxuICAgICAgICAvL+ODkeODqeODoeODvOOCv+OBq+OCiOOCiumAsuihjOaWueWQkeOCkuaxuuWumlxuICAgICAgICB0aGlzLnBhdHRlcm4gPSBwYXJhbS5wYXR0ZXJuO1xuICAgICAgICB0aGlzLnNwZWVkID0gMC41O1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIHN3aXRjaCAodGhpcy5wYXR0ZXJuKSB7XG4gICAgICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAxODA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gOTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiclwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMjcwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50dXJyZXQgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleDFcIiwgMjQsIDI0KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLnR1cnJldC5zZXRGcmFtZVRyaW1taW5nKDE5MiwgMzIsIDI0LCAyNCk7XG4gICAgICAgIHRoaXMudHVycmV0LnNldEZyYW1lSW5kZXgoMCk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v56Cy5Y+w44KS44K/44O844Ky44OD44OI44Gu5pa55ZCR44Gr5ZCR44GR44KLXG4gICAgICAgIHZhciBheCA9IHRoaXMueCAtIHRoaXMucGFyZW50U2NlbmUucGxheWVyLng7XG4gICAgICAgIHZhciBheSA9IHRoaXMueSAtIHRoaXMucGFyZW50U2NlbmUucGxheWVyLnk7XG4gICAgICAgIHZhciByYWQgPSBNYXRoLmF0YW4yKGF5LCBheCk7XG4gICAgICAgIHZhciBkZWcgPSB+fihyYWQgKiB0b0RlZyk7XG4gICAgICAgIHRoaXMudHVycmV0LnJvdGF0aW9uID0gZGVnICsgOTA7XG5cbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDQgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4KzEpJTQ7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52eCAhPSAwIHx8IHRoaXMudnkgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5hZGRTbW9rZVNtYWxsKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGF0dGVybiA9PSBcImxcIiAmJiB0aGlzLnggPiBTQ19XKjAuNCkge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAxODA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGF0dGVybiA9PSBcInJcIiAmJiB0aGlzLnggPCBTQ19XKjAuNikge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAxODA7XG4gICAgICAgIH1cblxuICAgICAgICAvL+enu+WLleWHpueQhlxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5kaXJlY3Rpb247XG4gICAgICAgIHZhciByYWQgPSB0aGlzLmRpcmVjdGlvbiAqIHRvUmFkO1xuICAgICAgICB0aGlzLnZ4ID0gTWF0aC5zaW4ocmFkKSAqIHRoaXMuc3BlZWQ7XG4gICAgICAgIHRoaXMudnkgPSBNYXRoLmNvcyhyYWQpICogdGhpcy5zcGVlZDtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMudng7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgIH0sXG59O1xuXG4vKlxuICogIOa1rumBiuegsuWPsOOAjOODluODquODpeODiuODvOOCr+OAje+8iOioree9ru+8iVxuICovXG5lbmVteURhdGFbJ0JyaW9uYWMxJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogW1wiQnJpb25hYzFfMVwiLCBcIkJyaW9uYWMxXzJcIiwgXCJCcmlvbmFjX2dyb3VuZDFfM1wiXSxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA0MCxcbiAgICBoZWlnaHQ6IDQwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDQwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01JRERMRSxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDJcIixcbiAgICB0ZXhXaWR0aDogNDgsXG4gICAgdGV4SGVpZ2h0OiA0OCxcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogNjQsXG4gICAgdGV4VHJpbVdpZHRoOiA0OCxcbiAgICB0ZXhUcmltSGVpZ2h0OiA0OCxcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICB0aGlzLmlzR3JvdW5kID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnZ4ID0gMDtcbiAgICAgICAgdGhpcy52eSA9IDA7XG5cbiAgICAgICAgLy/jg5Hjg6njg6Hjg7zjgr/jgavjgojjgorooYzli5Xjg5Hjgr/jg7zjg7PjgpLmsbrlrppcbiAgICAgICAgc3dpdGNoIChwYXJhbS5wb3MpIHtcbiAgICAgICAgICAgIGNhc2UgXCJjZW50ZXJcIjpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy52eCA9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnZ4ID0gLTQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnR1cnJldCA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4MlwiLCAyNCwgMjQpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoNjQsIDY0LCAyNCwgMjQpXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDAsIDApO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG5cbiAgICAgICAgdGhpcy50dXJyZXQucm90YXRpb24rKztcblxuICAgICAgICB0aGlzLmFkZFNtb2tlU21hbGwoMSk7XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5aSn5Z6L44Of44K144Kk44Or44CM44Of44K544OG44Kj44Or44OG44Kk44Oz44CNXG4gKi9cbmVuZW15RGF0YVsnTWlzdGlsdGVpbm4nXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcImJhc2ljXCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgNjQsXG4gICAgaGVpZ2h0OiA2NCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA4MDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAzMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfTUlERExFLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiA0OCxcbiAgICB0ZXhIZWlnaHQ6IDEwNCxcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMTI4LFxuICAgIHRleFRyaW1XaWR0aDogOTYsXG4gICAgdGV4VHJpbUhlaWdodDogMTA0LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmluZGV4ID0gdGhpcy50ZXhJbmRleDtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMuc2V0RnJhbWVUcmltbWluZygwLCAxMjgsIDk2LCAxMDQpO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgIH0sXG59O1xuXG4vKlxuICogIOS4reWei+i8uOmAgeapn+OAjOODiOOCpOODnOODg+OCr+OCueOAjVxuICovXG5lbmVteURhdGFbJ1RveUJveCddID0ge1xuICAgIC8v5L2/55So5by+5bmV5ZCNXG4gICAgZGFubWFrdU5hbWU6IFwiVG95Qm94XCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgMzAsXG4gICAgaGVpZ2h0OiA5MCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA1MDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiA1MDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfU01BTEwsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0xBUkdFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogNjQsXG4gICAgdGV4SGVpZ2h0OiAxMjgsXG4gICAgdGV4SW5kZXg6IDIsXG5cbiAgICAvL+aKleS4i+OCouOCpOODhuODoOeorumhnlxuICAgIGtpbmQ6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgICAgICBpZiAoZW50ZXJQYXJhbS5kcm9wID09IFwicG93ZXJcIikgdGhpcy5raW5kID0gSVRFTV9QT1dFUjtcbiAgICAgICAgaWYgKGVudGVyUGFyYW0uZHJvcCA9PSBcImJvbWJcIikgdGhpcy5raW5kID0gSVRFTV9CT01CO1xuICAgICAgICBpZiAoZW50ZXJQYXJhbS5kcm9wID09IFwiMVVQXCIpIHRoaXMua2luZCA9IElURU1fMVVQO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlQnkoMCwgU0NfSCowLjUsIDMwMCkud2FpdCg0ODApLm1vdmVCeSgwLCAtU0NfSCwgNjAwKTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMudHVycmV0ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXgxXCIsIDI0LCAyNClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxOTYsIDMyLCAyNCwgMjQpXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDAsIC0zNik7XG4gICAgICAgIHRoaXMudHVycmV0LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5sb29rQXQoe1xuICAgICAgICAgICAgICAgIHg6IHRoYXQueC10aGF0LnBsYXllci54LFxuICAgICAgICAgICAgICAgIHk6IHRoYXQueS10aGF0LnBsYXllci55LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZXB1aXBtZW50OiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgZGVhZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v56C05aOK5pmC44Ki44Kk44OG44Og44KS44K344O844Oz44Gr5oqV5YWlXG4gICAgICAgIHRoaXMudHVycmV0ID0gRW5lbXkoXCJJdGVtXCIsIHRoaXMueCwgdGhpcy55LCAwLCB7a2luZDogMH0pLmFkZENoaWxkVG8odGhpcy5wYXJlbnRTY2VuZSk7XG5cbiAgICAgICAgLy/pgJrluLjjga7noLTlo4rlh6bnkIZcbiAgICAgICAgdGhpcy5kZWZhdWx0RGVhZCgpO1xuICAgIH0sXG59XG5cbi8qXG4gKiAg44Ki44Kk44OG44OgXG4gKi9cbmVuZW15RGF0YVsnSXRlbSddID0ge1xuICAgIC8v5L2/55So5by+5bmV5ZCNXG4gICAgZGFubWFrdU5hbWU6IG51bGwsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgMzAsXG4gICAgaGVpZ2h0OiA5MCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9JVEVNLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9TTUFMTCxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDMyLFxuICAgIHRleEhlaWdodDogMzIsXG4gICAgdGV4SW5kZXg6IDAsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDk2LFxuICAgIHRleFRyaW1XaWR0aDogOTYsXG4gICAgdGV4VHJpbUhlaWdodDogMzIsXG5cbiAgICAvL+aKleS4i+OCouOCpOODhuODoOWMuuWIhlxuICAgIGtpbmQ6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzZXQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcblxuICAgICAgICB0aGlzLmtpbmQgPSBlbnRlclBhcmFtLmtpbmQ7XG4gICAgICAgIHRoaXMuZnJhbWVJbmRleCA9IHRoaXMua2luZDtcblxuICAgICAgICB0aGlzLnNldFNjYWxlKDEuNSk7XG4gICAgIH0sXG5cbiAgICBlcHVpcG1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5yZXNldCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgICAgICAgaWYgKHRoaXMuY291bnQgPCA1KSB7XG4gICAgICAgICAgICAgICAgdmFyIHB4ID0gTWF0aC5yYW5kaW50KDAsIFNDX1cpO1xuICAgICAgICAgICAgICAgIHZhciBweSA9IE1hdGgucmFuZGludChTQ19IKjAuMywgU0NfVyowLjkpO1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIC50byh7eDogcHgsIHk6IHB5fSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLndhaXQoMzApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHt4OiB0aGlzLngsIHk6IFNDX0gqMS4xfSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgfVxuICAgIH0sXG59XG5cbi8qXG4gKiAg6KqY5bCO5by+44CM44Oh44OJ44Kl44O844K144CNXG4gKi9cbmVuZW15RGF0YVsnTWVkdXNhJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogbnVsbCxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA4LFxuICAgIGhlaWdodDogOCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDUwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX1NNQUxMLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9TTUFMTCxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDgsXG4gICAgdGV4SGVpZ2h0OiAyNCxcbiAgICB0ZXhJbmRleDogMCxcbiAgICB0ZXhUcmltWDogMTkyLFxuICAgIHRleFRyaW1ZOiA2NCxcbiAgICB0ZXhUcmltV2lkdGg6IDgsXG4gICAgdGV4VHJpbUhlaWdodDogMjQsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgICAgICB0aGlzLmJvZHkuc2V0T3JpZ2luKDAuNSwgMC4wKTtcblxuICAgICAgICAvL+S4gOWumuaZgumWk+OBlOOBqOOBq+eFmeOBoOOBmeOCiFxuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLndhaXQoNSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJNaWRkbGUuZW50ZXJTbW9rZVNtYWxsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB0aGlzLngsIHk6IHRoaXMueX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogMCwgZGVjYXk6IDF9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnNldExvb3AodHJ1ZSk7XG5cbiAgICAgICAgLy/oh6rli5Xov73lsL7oqK3lrppcbiAgICAgICAgdGhpcy5pc0hvbWluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8v56e75YuV5oOF5aCxXG4gICAgICAgIHRoaXMudnggPSAwO1xuICAgICAgICB0aGlzLnZ5ID0gMztcbiAgICAgICAgdGhpcy5zcGQgPSAwLjA1O1xuICAgICAgICB0aGlzLm1heFNwZWVkID0gMztcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5pc0hvbWluZykge1xuICAgICAgICAgICAgdGhpcy5sb29rQXQoKTtcbiAgICAgICAgICAgIHZhciB2eCA9IHRoaXMucGxheWVyLngtdGhpcy54O1xuICAgICAgICAgICAgdmFyIHZ5ID0gdGhpcy5wbGF5ZXIueS10aGlzLnk7XG4gICAgICAgICAgICB2YXIgZCA9IE1hdGguc3FydCh2eCp2eCt2eSp2eSk7XG4gICAgICAgICAgICB0aGlzLnZ4ICs9IHZ4L2QqdGhpcy5zcGQ7XG4gICAgICAgICAgICB0aGlzLnZ5ICs9IHZ5L2QqdGhpcy5zcGQ7XG4gICAgICAgICAgICBpZiAoZCA8IDE2KSB0aGlzLmlzSG9taW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvb2tBdCh7eDogdGhpcy54K3RoaXMudngsIHk6IHRoaXMueSt0aGlzLnZ5fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ICs9IHRoaXMudng7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgIH0sXG5cbiAgICBzZXRIb21pbmc6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgaWYgKGYgJiYgIXRoaXMuaXNIb21pbmcpIHtcbiAgICAgICAgICAgIHRoaXMudnggPSAwO1xuICAgICAgICAgICAgdGhpcy52eSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0hvbWluZyA9IGY7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBzZXRWZWxvY2l0eTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB0aGlzLnZ4ID0geDtcbiAgICAgICAgdGhpcy52eSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBzZXRBbmdsZTogZnVuY3Rpb24oZGVncmVlLCBzcGVlZCkge1xuICAgICAgICB2YXIgcmFkID0gZGVncmVlICogdG9SYWQ7XG4gICAgICAgIHRoaXMudnggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XG4gICAgICAgIHRoaXMudnkgPSBNYXRoLnNpbihyYWQpICogc3BlZWQ7XG4gICAgfSxcbn1cbiIsIi8qXG4gKiAgRW5lbXlEYXRhQm9zc18xLmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLypcbiAqXG4gKiAg77yR6Z2i5Lit44Oc44K5XG4gKiAg6KOF55Sy6Ly46YCB5YiX6LuK44CM44OI44O844Or44OP44Oz44Oe44O844CNXG4gKlxuICovXG5lbmVteURhdGFbJ1Rob3JIYW1tZXInXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBcIlRob3JIYW1tZXJcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA5OCxcbiAgICBoZWlnaHQ6IDE5NixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAzMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NQk9TUyxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfQk9TUyxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogOTYsXG4gICAgdGV4SGVpZ2h0OiAxOTIsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDAsXG4gICAgdGV4VHJpbVdpZHRoOiAxOTIsXG4gICAgdGV4VHJpbUhlaWdodDogMTkyLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzTXV0ZWtpID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0dyb3VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICAvL+WInemAn1xuICAgICAgICB0aGlzLnZ5ID0gLTg7XG4gICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v56Cy5Y+w6Kit572uXG4gICAgICAgIHRoaXMudHVycmV0ID0gRW5lbXkoXCJUaG9ySGFtbWVyVHVycmV0XCIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKVxuICAgICAgICAgICAgLnNldFBhcmVudEVuZW15KHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnkgPCAtU0NfSCowLjUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgICAgICAgICAgdGhpcy52eSA9IC01O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNNdXRla2kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAudG8oe3Z5OiAtMTB9LCAyNDApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VtZURhbm1ha3UoKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAyKSB7XG4gICAgICAgICAgICB0aGlzLnR1cnJldC5mbGFyZSgnc3RhcnRmaXJlJyk7XG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgIH1cblxuICAgICAgICAvL+Wcn+eFmeWHuuOBmeOCiFxuICAgICAgICBpZiAoIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgICAgICB2YXIgdnkgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZC5kZWx0YVk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJMb3dlcjtcbiAgICAgICAgICAgICAgICBsYXllci5lbnRlclNtb2tlKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB0aGlzLngtMzIrcmFuZCgwLDY0KSwgeTogdGhpcy55fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiB2eSwgZGVjYXk6IDF9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogcmFuZCgwLCAyKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jgr/jgqTjg6DjgqLjg4Pjg5fjgafpgIPotbDvvIjvvJHvvJfnp5LvvIlcbiAgICAgICAgaWYgKCF0aGlzLmlzRGVhZCAmJiB0aGlzLnRpbWUgPT0gMTAyMCkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe3Z5OiAtMTV9LCAxMjAsIFwiZWFzZUluU2luZVwiKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZmxhcmUoJ2VuZF9ib3NzJyk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgICAgIC53YWl0KDYwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcbi8vICAgICAgICB0aGlzLnkgLT0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQuZGVsdGFZO1xuICAgIH0sXG5cbiAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy50dXJyZXQuZGVhZCgpO1xuICAgICAgICB0aGlzLnR1cnJldC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy50ZXhJbmRleCsrO1xuXG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUxhcmdlXCIpO1xuXG4gICAgICAgIC8v5by+5raI44GXXG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID0gMTgwO1xuXG4gICAgICAgIC8v56C05aOK5pmC5raI5Y6744Kk44Oz44K/44O844OQ44OrXG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAudG8oe3Z5OiAtOH0sIDE4MCwgXCJlYXNlSW5TaW5lXCIpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUJvc3NcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMuc2hhZG93KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxufTtcblxuLy/noLLlj7BcbmVuZW15RGF0YVsnVGhvckhhbW1lclR1cnJldCddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFwiVGhvckhhbW1lclR1cnJldFwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDY0LFxuICAgIGhlaWdodDogNjQsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogNTAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9MT1dFUixcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfQk9TU19FUVVJUCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfU01BTEwsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDMyLFxuICAgIHRleEhlaWdodDogMzIsXG4gICAgdGV4VHJpbVg6IDQxNixcbiAgICB0ZXhUcmltWTogMTI4LFxuICAgIHRleFRyaW1XaWR0aDogMzIsXG4gICAgdGV4VHJpbUhlaWdodDogMzIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc011dGVraSA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB0aGlzLm9uKCdzdGFydGZpcmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VtZURhbm1ha3UoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnggPSB0aGlzLnBhcmVudEVuZW15Lng7XG4gICAgICAgIHRoaXMueSA9IHRoaXMucGFyZW50RW5lbXkueS00MDtcbiAgICAgICAgdGhpcy5sb29rQXQoKTtcbiAgICB9LFxufTtcblxuLypcbiAqXG4gKiAg77yR6Z2i44Oc44K5XG4gKiAg5bGA5Zyw5Yi25Zyn5Z6L5beo5aSn5oim6LuK44CM44K044Oq44Ki44OG44CNXG4gKlxuICovXG4vL+acrOS9k1xuZW5lbXlEYXRhWydHb2x5YXQnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBbXCJHb2x5YXQxXzFcIiwgXCJHb2x5YXQxXzJcIiwgXCJHb2x5YXQxXzNcIiwgXCJHb2x5YXQyXCJdLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDUyLFxuICAgIGhlaWdodDogNjAsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogNTAwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMDAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9MT1dFUixcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfQk9TUyxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfQk9TUyxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogNTIsXG4gICAgdGV4SGVpZ2h0OiAxODQsXG4gICAgdGV4VHJpbVg6IDI1OCxcbiAgICB0ZXhUcmltWTogMCxcbiAgICB0ZXhUcmltV2lkdGg6IDUyLFxuICAgIHRleFRyaW1IZWlnaHQ6IDE4NCxcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0dyb3VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNIb3ZlciA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNTbW9rZSA9IHRydWU7XG5cbiAgICAgICAgLy/nmbrni4Ljg6Ljg7zjg4njg5Xjg6njgrBcbiAgICAgICAgdGhpcy5pc1N0YW1wZWRlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAvL+ODnOODh+OCo+OCq+ODkOODvFxuICAgICAgICB0aGlzLmNvdmVyID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgNjQsIDgwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDM4MiwgMCwgNjQsIDgwKVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigtMiwgLTE4KTtcbiAgICAgICAgdGhpcy5jb3Zlci50ZXhDb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMuY292ZXIudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGV4Q29sb3IgIT09IHRoYXQudGV4Q29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEltYWdlKFwidGV4X2Jvc3MxXCIrdGhhdC50ZXhDb2xvciwgNjQsIDgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZyYW1lVHJpbW1pbmcoMzgyLCAwLCA2NCwgODApLnNldEZyYW1lSW5kZXgoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXhDb2xvciA9IHRoYXQudGV4Q29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy/kuK3lv4Ppg6hcbiAgICAgICAgdGhpcy5jb3JlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgMTYsIDE2KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDM4NCwgOTYsIDY0LCAxNilcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgLTgpO1xuICAgICAgICB0aGlzLmNvcmUudGV4Q29sb3IgPSBcIlwiO1xuICAgICAgICB0aGlzLmNvcmUuaWR4ID0gMDtcbiAgICAgICAgdGhpcy5jb3JlLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRleENvbG9yICE9PSB0aGF0LnRleENvbG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbWFnZShcInRleF9ib3NzMVwiK3RoYXQudGV4Q29sb3IsIDE2LCAxNik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGcmFtZVRyaW1taW5nKDM4NCwgOTYsIDY0LCAxNikuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRleENvbG9yID0gdGhhdC50ZXhDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZnJhbWVJbmRleCA9IHRoaXMuaWR4IHwgMDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb3JlLnR3ZWVuZXIuY2xlYXIoKS5zZXRVcGRhdGVUeXBlKFwiZnBzXCIpO1xuXG4gICAgICAgIHRoaXMub24oJ2RlYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY292ZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmNvcmUucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5vbignYnVsbGV0c3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmNvcmUudHdlZW5lci5jbGVhcigpLnRvKHtpZHg6IDN9LCAxNSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29yZS50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMH0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+eZuueLguODouODvOODiVxuICAgICAgICB0aGlzLm9uKCdzdGFtcGVkZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdGFtcGVkZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lWzNdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+W8vuW5le+8keOCu+ODg+ODiOe1guS6hlxuICAgICAgICB0aGlzLmRhbm1ha3VOdW1iZXIgPSAwO1xuICAgICAgICB0aGlzLm9uKCdidWxsZXRmaW5pc2gnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmRhbm1ha3VOdW1iZXIgPSAodGhpcy5kYW5tYWt1TnVtYmVyKzEpJTM7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuXG4gICAgICAgICAgICAvL+OCouODvOODoOWBtOW8vuW5leioreWumuWIh+abv1xuICAgICAgICAgICAgdGhpcy5hcm1MLnN0YXJ0RGFubWFrdSh0aGlzLmFybUwuZGFubWFrdU5hbWVbdGhpcy5kYW5tYWt1TnVtYmVyXSk7XG4gICAgICAgICAgICB0aGlzLmFybVIuc3RhcnREYW5tYWt1KHRoaXMuYXJtUi5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+OCouODvOODoOODmeODvOOCueW3plxuICAgICAgICB0aGlzLmFybWJhc2VMID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgNjYsIDE4NClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxOTIsIDAsIDY2LCAxODQpXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKC01OSwgMCk7XG4gICAgICAgIHRoaXMuYXJtYmFzZUwudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGV4Q29sb3IgIT09IHRoYXQudGV4Q29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEltYWdlKFwidGV4X2Jvc3MxXCIrdGhhdC50ZXhDb2xvciwgNjYsIDE4NCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGcmFtZVRyaW1taW5nKDE5MiwgMCwgNjYsIDE4NCkuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRleENvbG9yID0gdGhhdC50ZXhDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy/jgqLjg7zjg6Djg5njg7zjgrnlj7NcbiAgICAgICAgdGhpcy5hcm1iYXNlUiA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxXCIsIDY2LCAxODQpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMzEwLCAwLCA2NiwgMTg0KVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbig1OSwgMCk7XG4gICAgICAgIHRoaXMuYXJtYmFzZVIudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGV4Q29sb3IgIT09IHRoYXQudGV4Q29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEltYWdlKFwidGV4X2Jvc3MxXCIrdGhhdC50ZXhDb2xvciwgNjYsIDE4NCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGcmFtZVRyaW1taW5nKDMxMCwgMCwgNjYsIDE4NCkuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRleENvbG9yID0gdGhhdC50ZXhDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvL+eZu+WgtOODkeOCv+ODvOODs1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLm1vdmVUbyhTQ19XKjAuNSwgU0NfSCowLjMsIDMwMCwgXCJlYXNlT3V0U2luZVwiKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bWVEYW5tYWt1KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBlcHVpcG1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHMgPSB0aGlzLnBhcmVudFNjZW5lO1xuICAgICAgICAvL+OCouODvOODoOW3plxuICAgICAgICB0aGlzLmFybUwgPSBwcy5lbnRlckVuZW15KFwiR29seWF0QXJtXCIsIDAsIDApLnNldFBhcmVudEVuZW15KHRoaXMpO1xuICAgICAgICB0aGlzLmFybUwuJGV4dGVuZCh7XG4gICAgICAgICAgICBvZmZzZXRYOiAtNTIsXG4gICAgICAgICAgICBvZmZzZXRZOiA4LFxuICAgICAgICB9KTtcbiAgICAgICAgLy/jgqLjg7zjg6Dlj7NcbiAgICAgICAgdGhpcy5hcm1SID0gcHMuZW50ZXJFbmVteShcIkdvbHlhdEFybVwiLCAwLCAwKS5zZXRQYXJlbnRFbmVteSh0aGlzKTtcbiAgICAgICAgdGhpcy5hcm1SLiRleHRlbmQoe1xuICAgICAgICAgICAgb2Zmc2V0WDogNTIsXG4gICAgICAgICAgICBvZmZzZXRZOiA4LFxuICAgICAgICB9KTtcblxuICAgICAgICAvL+OCouODvOODoOW3ruWLleeUqFxuICAgICAgICB0aGlzLmFybUwudmliWCA9IDA7XG4gICAgICAgIHRoaXMuYXJtTC52aWJZID0gMFxuICAgICAgICB0aGlzLmFybVIudmliWCA9IDA7XG4gICAgICAgIHRoaXMuYXJtUi52aWJZID0gMDtcblxuICAgICAgICAvL+OCpuOCo+ODs+OCsOW3plxuICAgICAgICB0aGlzLndpbmdMID0gcHMuZW50ZXJFbmVteShcIkdvbHlhdFdpbmdcIiwgMCwgMCkuc2V0UGFyZW50RW5lbXkodGhpcy5hcm1MKTtcbiAgICAgICAgdGhpcy53aW5nTC4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG9mZnNldFg6IC0zMSxcbiAgICAgICAgICAgIG9mZnNldFk6IDMsXG4gICAgICAgIH0pO1xuICAgICAgICAvL+OCpuOCo+ODs+OCsOWPs1xuICAgICAgICB0aGlzLndpbmdSID0gcHMuZW50ZXJFbmVteShcIkdvbHlhdFdpbmdcIiwgMCwgMCkuc2V0UGFyZW50RW5lbXkodGhpcy5hcm1SKTtcbiAgICAgICAgdGhpcy53aW5nUi50ZXhJbmRleCA9IDE7XG4gICAgICAgIHRoaXMud2luZ1IuJGV4dGVuZCh7XG4gICAgICAgICAgICBvZmZzZXRYOiAzMSxcbiAgICAgICAgICAgIG9mZnNldFk6IDMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmFkID0gTWF0aC5QSSowLjU7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v6KGM5YuV6ZaL5aeLXG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgICAgICB0aGlzLnJlc3VtZURhbm1ha3UoKTtcblxuICAgICAgICAgICAgdGhpcy5hcm1MLmZsYXJlKCdzdGFydGZpcmUnKTtcbiAgICAgICAgICAgIHRoaXMuYXJtUi5mbGFyZSgnc3RhcnRmaXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+W3puWPs+OBq+WLleOBj1xuICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAyKSB7XG4gICAgICAgICAgICB0aGlzLnggPSBNYXRoLmNvcyh0aGlzLnJhZCkqU0NfVyowLjIrU0NfVyowLjU7XG4vLyAgICAgICAgICAgIHRoaXMueSA9IE1hdGguc2luKHRoaXMucmFkKjIpLzI7XG4gICAgICAgICAgICB0aGlzLnJhZCAtPSAwLjAxXG4gICAgICAgIH1cblxuICAgICAgICAvL+eUu+mdouS4reWkruOBq+aIu+OCi1xuICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAzKSB7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIudG8oe3g6IFNDX1cqMC41fSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIik7XG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgIH1cblxuICAgICAgICAvL+Wcn+eFmeWHuuOBmeOCiFxuICAgICAgICBpZiAodGhpcy5pc1Ntb2tlKSB7XG4gICAgICAgICAgICB2YXIgdnkgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZC5kZWx0YVk7XG4gICAgICAgICAgICB2YXIgcmFkID0gdGhpcy5yb3RhdGlvbip0b1JhZDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllckxvd2VyO1xuXG4gICAgICAgICAgICAgICAgdmFyIHggPSAtNzYrcmFuZCgwLCA0MCk7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSA4MC1yYW5kKDAsIDEwMCk7XG4gICAgICAgICAgICAgICAgdmFyIHJ4ID0gdGhpcy54ICsgeDtcbiAgICAgICAgICAgICAgICB2YXIgcnkgPSB0aGlzLnkgKyB5O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJvdGF0aW9uICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcnggPSB0aGlzLnggKyBNYXRoLmNvcyhyYWQpKnggLSBNYXRoLnNpbihyYWQpKnk7XG4gICAgICAgICAgICAgICAgICAgIHJ5ID0gdGhpcy55ICsgTWF0aC5zaW4ocmFkKSp4ICsgTWF0aC5jb3MocmFkKSp5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXllci5lbnRlclNtb2tlKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiByeCwgeTogcnl9LFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHJhbmQoLTEsIDEpLCB5OiB2eSwgZGVjYXk6IDF9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogcmFuZCgwLCAyKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmFyIHggPSA0MCtyYW5kKDAsIDQwKTtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IDgwLXJhbmQoMCwgMTAwKTtcbiAgICAgICAgICAgICAgICB2YXIgcnggPSB0aGlzLnggKyB4O1xuICAgICAgICAgICAgICAgIHZhciByeSA9IHRoaXMueSArIHk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucm90YXRpb24gIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByeCA9IHRoaXMueCArIE1hdGguY29zKHJhZCkqeCAtIE1hdGguc2luKHJhZCkqeTtcbiAgICAgICAgICAgICAgICAgICAgcnkgPSB0aGlzLnkgKyBNYXRoLnNpbihyYWQpKnggKyBNYXRoLmNvcyhyYWQpKnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxheWVyLmVudGVyU21va2Uoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHJ4LCB5OiByeX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogcmFuZCgtMSwgMSksIHk6IHZ5LCBkZWNheTogMX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiByYW5kKDAsIDIpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCouODvOODoOegtOWjiuaZgueIhueZulxuICAgICAgICBpZiAodGhpcy50aW1lICUgNjAgPT0gMCkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgdmFyIHZ4ID0gdGhpcy54LXRoaXMuYmVmb3JlWCtncm91bmQuZGVsdGFYO1xuICAgICAgICAgICAgdmFyIHZ5ID0gdGhpcy55LXRoaXMuYmVmb3JlWStncm91bmQuZGVsdGFZO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXJtTC5kZWYgPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLTMzLCAzMyktNjQ7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtOTIsIDkyKTtcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSByYW5kKDAsIDMwKTtcbiAgICAgICAgICAgICAgICBFZmZlY3QuZW50ZXJFeHBsb2RlKHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlciwge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4LCB5OiB2eSwgZGVjYXk6IDAuOTV9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5hcm1SLmRlZiA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLngrcmFuZCgtMzMsIDMzKSs2NDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMueStyYW5kKC05MiwgOTIpO1xuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IHJhbmQoMCwgMzApO1xuICAgICAgICAgICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGUodGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogeCwgeTogeX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMC45NX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+OCouODvOODoOegtOWjilxuICAgIGRlYWRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgdGhpcy5waGFzZSA9IDk7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG4gICAgICAgIHRoaXMuYXJtTC5zdG9wRGFubWFrdSgpO1xuICAgICAgICB0aGlzLmFybVIuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICAvL+W8vua2iOOBl1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUudGltZVZhbmlzaCA9IDYwO1xuXG4gICAgICAgIC8v44Ki44O844Og56C05aOK5pmC44Ki44Kv44K344On44OzXG4gICAgICAgIHZhciBieCA9IE1hdGguY29zKHRoaXMucmFkKSpTQ19XKjAuMitTQ19XKjAuNTtcbiAgICAgICAgdmFyIGJ5ID0gdGhpcy55O1xuICAgICAgICB2YXIgcm90ID0gY2hpbGQgPT0gdGhpcy5hcm1MPyAyMDogLTIwO1xuICAgICAgICB2YXIgYXggPSBjaGlsZCA9PSB0aGlzLmFybUw/IDMwOiAtMzA7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAudG8oe3g6IHRoaXMueCtheCwgcm90YXRpb246IHJvdH0sIDMwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgIC53YWl0KDYwKVxuICAgICAgICAgICAgLnRvKHt4OiBieCwgeTogYnksIHJvdGF0aW9uOiAwfSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UgPSAyO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bWVEYW5tYWt1KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcm1MLnJlc3VtZURhbm1ha3UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFybVIucmVzdW1lRGFubWFrdSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+iDjOaZr+OCueOCr+ODreODvOODq+WItuW+oVxuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZC50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7c3BlZWQ6IC0xLjB9LCAzMCwgXCJlYXNlSW5PdXRDdWJpY1wiKVxuICAgICAgICAgICAgLndhaXQoOTApXG4gICAgICAgICAgICAudG8oe3NwZWVkOiAtNy4wfSwgNjAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG5cbiAgICAgICAgLy/kuKHmlrnjga7jgqLjg7zjg6DjgYznoLTlo4rjgZXjgozjgZ/loLTlkIjjgIHnmbrni4Ljg6Ljg7zjg4njgbjnp7vooYxcbiAgICAgICAgaWYgKCF0aGlzLmlzU3RhbXBlZGUgJiYgdGhpcy5hcm1MLmRlZiA9PSAwICYmIHRoaXMuYXJtUi5kZWYgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5mbGFyZSgnc3RhbXBlZGUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlTGFyZ2VcIik7XG5cbiAgICAgICAgLy/lvL7mtojjgZdcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCgpO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPSAxODA7XG5cbiAgICAgICAgLy/noLTlo4rmmYLmtojljrvjgqTjg7Pjgr/jg7zjg5Djg6tcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC5tb3ZlQnkoMCwgLTUwLCAzMDApXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLm1hc2tXaGl0ZS50d2VlbmVyLmNsZWFyKCkuZmFkZUluKDQ1KS5mYWRlT3V0KDQ1KTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUJvc3NcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMuc2hhZG93KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn07XG5cbi8v44Ki44O844OgXG5lbmVteURhdGFbJ0dvbHlhdEFybSddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFtcIkdvbHlhdEFybTFcIiwgXCJHb2x5YXRBcm0yXCIsIFwiR29seWF0QXJtM1wiXSxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA1NixcbiAgICBoZWlnaHQ6IDIwMCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogNTAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0JPU1NfRVFVSVAsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0xBUkdFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA1MixcbiAgICB0ZXhIZWlnaHQ6IDIwMCxcbiAgICB0ZXhUcmltWDogNDUwLFxuICAgIHRleFRyaW1ZOiAwLFxuICAgIHRleFRyaW1XaWR0aDogNTIsXG4gICAgdGV4VHJpbUhlaWdodDogMjAwLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNHcm91bmQgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgLy/noLLlj7DvvJFcbiAgICAgICAgdGhpcy50dXJyZXQxID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgNDgsIDQ4KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDAsIDE5MiwgMTQ0LCA0OClcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgMzIpO1xuICAgICAgICB0aGlzLnR1cnJldDEuaWR4ID0gMDtcbiAgICAgICAgdGhpcy50dXJyZXQxLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5pZHggfCAwO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnR1cnJldDEudHdlZW5lci5jbGVhcigpLnNldFVwZGF0ZVR5cGUoXCJmcHNcIik7XG5cbiAgICAgICAgLy/noLLlj7DvvJJcbiAgICAgICAgdGhpcy50dXJyZXQyID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgNDgsIDQ4KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDAsIDE5MiwgMTQ0LCA0OClcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgLTMyKTtcbiAgICAgICAgdGhpcy50dXJyZXQyLmlkeCA9IDA7XG4gICAgICAgIHRoaXMudHVycmV0Mi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVJbmRleCA9IHRoaXMuaWR4IHwgMDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50dXJyZXQyLnR3ZWVuZXIuY2xlYXIoKS5zZXRVcGRhdGVUeXBlKFwiZnBzXCIpO1xuXG4gICAgICAgIC8v56Cy5Y+w77yR6ZaL6ZaJXG4gICAgICAgIHRoaXMub24oJ2J1bGxldHN0YXJ0MScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHVycmV0MS50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMn0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZW5kMScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHVycmV0MS50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMH0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+egsuWPsO+8kumWi+mWiVxuICAgICAgICB0aGlzLm9uKCdidWxsZXRzdGFydDInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLnR1cnJldDIudHdlZW5lci5jbGVhcigpLnRvKHtpZHg6IDJ9LCAxNSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldGVuZDInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLnR1cnJldDIudHdlZW5lci5jbGVhcigpLnRvKHtpZHg6IDB9LCAxNSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy9CdWxsZXRNTOWni+WLlVxuICAgICAgICB0aGlzLm9uKCdzdGFydGZpcmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdW1lRGFubWFrdSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v6KqY5bCO5by+55m65bCEXG4gICAgICAgIHRoaXMub24oJ2J1bGxldG1pc3NpbGUxJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJNZWR1c2FcIiwgdGhpcy54LCB0aGlzLnktNDApLnNldEhvbWluZyh0cnVlKS5zZXRWZWxvY2l0eSgtMC41LCAtMS4wKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIk1lZHVzYVwiLCB0aGlzLngsIHRoaXMueS00MCkuc2V0SG9taW5nKHRydWUpLnNldFZlbG9jaXR5KCAwLjAsIC0xLjApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55LTQwKS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoIDAuNSwgLTEuMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldG1pc3NpbGUyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJNZWR1c2FcIiwgdGhpcy54LCB0aGlzLnkrMjApLnNldEhvbWluZyh0cnVlKS5zZXRWZWxvY2l0eSgtMC41LCAtMS4wKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIk1lZHVzYVwiLCB0aGlzLngsIHRoaXMueSsyMCkuc2V0SG9taW5nKHRydWUpLnNldFZlbG9jaXR5KCAwLjAsIC0xLjApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55KzIwKS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoIDAuNSwgLTEuMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v6Kaq44Kq44OW44K444Kn44Kv44OI44Gu5Zue6Lui44Gr44KI44KL5L2N572u6KOc5q2jXG4gICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLnBhcmVudEVuZW15LnJvdGF0aW9uO1xuICAgICAgICB2YXIgb2Zmc2V0WCA9IHRoaXMub2Zmc2V0WDtcbiAgICAgICAgdmFyIG9mZnNldFkgPSB0aGlzLm9mZnNldFk7XG4gICAgICAgIGlmICh0aGlzLnJvdGF0aW9uICE9IDApIHtcbiAgICAgICAgICAgIHZhciByYWQgPSB0aGlzLnJvdGF0aW9uKnRvUmFkO1xuICAgICAgICAgICAgb2Zmc2V0WCA9IE1hdGguY29zKHJhZCkqdGhpcy5vZmZzZXRYLU1hdGguc2luKHJhZCkqdGhpcy5vZmZzZXRZO1xuICAgICAgICAgICAgb2Zmc2V0WSA9IE1hdGguc2luKHJhZCkqdGhpcy5vZmZzZXRYK01hdGguY29zKHJhZCkqdGhpcy5vZmZzZXRZO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50RW5lbXkueCtvZmZzZXRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnBhcmVudEVuZW15Lnkrb2Zmc2V0WTtcblxuICAgICAgICAvL+WIpOWumuacieeEoeOBr+imquOBq+OBguOCj+OBm+OCi1xuICAgICAgICBpZiAodGhpcy5kZWYgPiAwKSB0aGlzLmlzQ29sbGlzaW9uID0gdGhpcy5wYXJlbnRFbmVteS5pc0NvbGxpc2lvbjtcbiAgICB9LFxufTtcblxuLy/jgqbjgqPjg7PjgrBcbmVuZW15RGF0YVsnR29seWF0V2luZyddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFwiXCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgMTYsXG4gICAgaGVpZ2h0OiAxMTIsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogNTAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTX0VRVUlQLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9MQVJHRSxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogMTYsXG4gICAgdGV4SGVpZ2h0OiAxMTIsXG4gICAgdGV4VHJpbVg6IDM4NCxcbiAgICB0ZXhUcmltWTogMTI4LFxuICAgIHRleFRyaW1XaWR0aDogMzIsXG4gICAgdGV4VHJpbUhlaWdodDogMTEyLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm9mZnNldFggPSAwO1xuICAgICAgICB0aGlzLm9mZnNldFkgPSAwO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+imquOCquODluOCuOOCp+OCr+ODiOOBruWbnui7ouOBq+OCiOOCi+S9jee9ruijnOato1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5wYXJlbnRFbmVteS5yb3RhdGlvbjtcbiAgICAgICAgdmFyIG9mZnNldFggPSB0aGlzLm9mZnNldFg7XG4gICAgICAgIHZhciBvZmZzZXRZID0gdGhpcy5vZmZzZXRZO1xuICAgICAgICBpZiAodGhpcy5yb3RhdGlvbiAhPSAwKSB7XG4gICAgICAgICAgICB2YXIgcmFkID0gdGhpcy5yb3RhdGlvbip0b1JhZDtcbiAgICAgICAgICAgIG9mZnNldFggPSBNYXRoLmNvcyhyYWQpKnRoaXMub2Zmc2V0WC1NYXRoLnNpbihyYWQpKnRoaXMub2Zmc2V0WTtcbiAgICAgICAgICAgIG9mZnNldFkgPSBNYXRoLnNpbihyYWQpKnRoaXMub2Zmc2V0WCtNYXRoLmNvcyhyYWQpKnRoaXMub2Zmc2V0WTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnggPSB0aGlzLnBhcmVudEVuZW15Lngrb2Zmc2V0WDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wYXJlbnRFbmVteS55K29mZnNldFk7XG5cbiAgICAgICAgLy/opqrjga7ogJDkuYXluqbjgYzvvJDjgafpmaTljrtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50RW5lbXkuZGVmID09IDApIHRoaXMucmVtb3ZlKCk7XG5cbiAgICAgICAgLy/liKTlrprmnInnhKHjga/opqrjgavjgYLjgo/jgZvjgotcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRoaXMucGFyZW50RW5lbXkuaXNDb2xsaXNpb247XG4gICAgfSxcbn07XG5cbiIsIi8qXG4gKiAgRW5lbXlEYXRhQm9zc18yLmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLypcbiAqXG4gKiAg77yS6Z2i5Lit44Oc44K5ICBcbiAqICDlpKflnovniIbmkoPmqZ/jgIzjg6zjgqTjg5bjg7PjgI1cbiAqXG4gKi9cbmVuZW15RGF0YVsnUmF2ZW4nXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBcIlJhdmVuXCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgOTYsXG4gICAgaGVpZ2h0OiA0MCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA1MDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMjAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfTUJPU1MsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0JPU1MsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDE0NCxcbiAgICB0ZXhIZWlnaHQ6IDY0LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAyNTYsXG4gICAgdGV4VHJpbVdpZHRoOiAxNDQsXG4gICAgdGV4VHJpbUhlaWdodDogNjQsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGhhc2UgPSAwO1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNNdXRla2kgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgLy/noLLlj7BcbiAgICAgICAgdGhpcy50dXJyZXQgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCAzMiwgMzIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMTYwLCAxOTIsIDMyLCAzMilcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHRoaXMudHVycmV0LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGhhdC5wbGF5ZXI7XG5cbiAgICAgICAgICAgIC8v44K/44O844Ky44OD44OI44Gu5pa55ZCR44KS5ZCR44GPXG4gICAgICAgICAgICB2YXIgYXggPSB0aGF0LnggLSB0YXJnZXQueDtcbiAgICAgICAgICAgIHZhciBheSA9IHRoYXQueSAtIHRhcmdldC55O1xuICAgICAgICAgICAgdmFyIHJhZCA9IE1hdGguYXRhbjIoYXksIGF4KTtcbiAgICAgICAgICAgIHZhciBkZWcgPSB+fihyYWQgKiB0b0RlZyk7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gZGVnLTkwO1xuICAgICAgICB9O1xuXG4vKlxuICAgICAgICAvL+OCouODleOCv+ODvOODkOODvOODiuODvFxuICAgICAgICB0aGlzLmJ1cm5lciA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxXCIsIDExMiwgMzIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMCwgMzIwLCAxMTIsIDY0KVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAzMik7XG4gICAgICAgIHRoaXMuYnVybmVyLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4Kys7XG4gICAgICAgIH07XG4qL1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7eDogU0NfVyowLjUsIHk6IFNDX0gqMC4yNX0sIDEyMCwgXCJlYXNlT3V0Q3ViaWNcIilcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v57+8XG4gICAgICAgIHRoaXMud2luZ0wgPSBFbmVteShcIlJhdmVuX3dpbmdcIiwgLTQ4LCAwLCAwLCB7ZnJhbWVJbmRleDogMH0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKVxuICAgICAgICAgICAgLnNldFBhcmVudEVuZW15KHRoaXMpO1xuICAgICAgICB0aGlzLndpbmdSID0gRW5lbXkoXCJSYXZlbl93aW5nXCIsIDQ4LCAwLCAwLCB7ZnJhbWVJbmRleDogMX0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKVxuICAgICAgICAgICAgLnNldFBhcmVudEVuZW15KHRoaXMpO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5waGFzZSA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNNdXRla2kgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWUpO1xuXG4gICAgICAgICAgICAvL+enu+WLleODkeOCv+ODvOODs1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe3g6IFNDX1cqMC44fSwgMjQwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAudG8oe3g6IFNDX1cqMC4yfSwgMjQwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAuc2V0TG9vcCh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lcjIgPSBwaGluYS5hY2Nlc3NvcnkuVHdlZW5lcigpLmNsZWFyKCkuc2V0VXBkYXRlVHlwZSgnZnBzJylcbiAgICAgICAgICAgICAgICAudG8oe3k6IFNDX0gqMC4yfSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAudG8oe3k6IFNDX0gqMC4zfSwgMTgwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAuc2V0TG9vcCh0cnVlKVxuICAgICAgICAgICAgICAgIC5hdHRhY2hUbyh0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlTGFyZ2VcIik7XG5cbiAgICAgICAgdGhpcy50d2VlbmVyMi5yZW1vdmUoKTtcbiAgICAgICAgcGhpbmEuYWNjZXNzb3J5LlR3ZWVuZXIoKS5jbGVhcigpLnNldFVwZGF0ZVR5cGUoJ2ZwcycpXG4gICAgICAgICAgICAudG8oe3JvdGF0aW9uOiAzMH0sIDMwMClcbiAgICAgICAgICAgIC5hdHRhY2hUbyh0aGlzKTtcbiAgICAgICAgcGhpbmEuYWNjZXNzb3J5LlR3ZWVuZXIoKS5jbGVhcigpLnNldFVwZGF0ZVR5cGUoJ2ZwcycpXG4gICAgICAgICAgICAuYnkoe3g6IDJ9LCAzKVxuICAgICAgICAgICAgLmJ5KHt4OiAtMn0sIDMpXG4gICAgICAgICAgICAuc2V0TG9vcCh0cnVlKVxuICAgICAgICAgICAgLmF0dGFjaFRvKHRoaXMpO1xuXG4gICAgICAgIC8v5by+5raI44GXXG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID0gMTgwO1xuXG4gICAgICAgIC8v56C05aOK5pmC5raI5Y6744Kk44Oz44K/44O844OQ44OrXG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAubW92ZUJ5KDAsIDEwMCwgMzAwKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5tYXNrV2hpdGUudHdlZW5lci5jbGVhcigpLmZhZGVJbig0NSkuZmFkZU91dCg0NSk7XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVCb3NzXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoYWRvdy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50byh7YWxwaGE6IDB9LCAxNSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLnNoYWRvdykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50byh7YWxwaGE6IDB9LCAxNSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG59O1xuXG5lbmVteURhdGFbJ1JhdmVuX3dpbmcnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBudWxsLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDY0LFxuICAgIGhlaWdodDogNjQsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogMTAwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDUwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfQk9TU19FUVVJUCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA2NCxcbiAgICB0ZXhIZWlnaHQ6IDY0LFxuICAgIHRleFRyaW1YOiAxNjAsXG4gICAgdGV4VHJpbVk6IDI1NixcbiAgICB0ZXhUcmltV2lkdGg6IDEyOCxcbiAgICB0ZXhUcmltSGVpZ2h0OiA2NCxcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICB0aGlzLnRleEluZGV4ID0gcGFyYW0uZnJhbWVJbmRleDtcbiAgICAgICAgdGhpcy5vZmZzZXRYID0gdGhpcy54O1xuICAgICAgICB0aGlzLm9mZnNldFkgPSB0aGlzLnk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50RW5lbXkueCArIHRoaXMub2Zmc2V0WDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wYXJlbnRFbmVteS55ICsgdGhpcy5vZmZzZXRZO1xuICAgIH0sXG59O1xuXG4vKlxuICpcbiAqICDvvJLpnaLjg5zjgrlcbiAqICDlpKflnovotoXpq5jpq5jluqbniIbmkoPmqZ/jgIzjgqzjg6vjg7zjg4DjgI1cbiAqXG4gKi9cbmVuZW15RGF0YVsnR2FydWRhJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogW1wiR2FydWRhXzFcIiwgXCJHYXJ1ZGFfMlwiLCBcIkdhcnVkYV8zXCIsIFwiR2FydWRhXzRcIl0sXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgNjQsXG4gICAgaGVpZ2h0OiA3MCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA4MDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogNDAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX1VQUEVSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9CT1NTLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiAyOTYsXG4gICAgdGV4SGVpZ2h0OiA4MCxcbiAgICB0ZXhUcmltWDogMTI4LFxuICAgIHRleFRyaW1ZOiAzMjAsXG4gICAgdGV4VHJpbVdpZHRoOiAyOTYsXG4gICAgdGV4VHJpbUhlaWdodDogMTYwLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKGVudGVyUGFyYW0pIHtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc011dGVraSA9IHRydWU7XG4gICAgICAgIHRoaXMuYWxwaGEgPSAwO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLmZhZGVJbig2MClcbiAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/nmbrni4Ljg6Ljg7zjg4njg5Xjg6njgrBcbiAgICAgICAgdGhpcy5pc1N0YW1wZWRlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIC8v5by+5bmV77yR44K744OD44OI57WC5LqGXG4gICAgICAgIHRoaXMuZGFubWFrdU51bWJlciA9IDA7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldGZpbmlzaCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGFubWFrdU51bWJlciA9ICh0aGlzLmRhbm1ha3VOdW1iZXIrMSklMztcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWVbdGhpcy5kYW5tYWt1TnVtYmVyXSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/nmbrni4Ljg6Ljg7zjg4lcbiAgICAgICAgdGhpcy5vbignc3RhbXBlZGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmlzU3RhbXBlZGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVszXSk7XG4gICAgICAgICAgICAvL+ODj+ODg+ODgeWBtOW8vuW5leioreWumuWIh+abv1xuICAgICAgICAgICAgdGhpcy5oYXRjaEwuc3RhcnREYW5tYWt1KHRoaXMuaGF0Y2hMLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuICAgICAgICAgICAgdGhpcy5oYXRjaFIuc3RhcnREYW5tYWt1KHRoaXMuaGF0Y2hSLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v44Kq44OX44K344On44Oz5q2m5Zmo5oqV5LiLXG4gICAgICAgIHRoaXMub24oJ2J1bGxldGJvbWInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJHYXJ1ZGFCb21iXCIsIHRoaXMueCsxMDAsIHRoaXMueSszMik7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJHYXJ1ZGFCb21iXCIsIHRoaXMueC0xMDAsIHRoaXMueSszMik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/lvL7luZXvvJHjgrvjg4Pjg4jntYLkuoZcbiAgICAgICAgdGhpcy5kYW5tYWt1TnVtYmVyID0gMDtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZmluaXNoJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5kYW5tYWt1TnVtYmVyID0gKHRoaXMuZGFubWFrdU51bWJlcisxKSUzO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcblxuICAgICAgICAgICAgLy/jg4/jg4Pjg4HlgbTlvL7luZXoqK3lrprliIfmm79cbiAgICAgICAgICAgIHRoaXMuaGF0Y2hMLnN0YXJ0RGFubWFrdSh0aGlzLmhhdGNoTC5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcbiAgICAgICAgICAgIHRoaXMuaGF0Y2hSLnN0YXJ0RGFubWFrdSh0aGlzLmhhdGNoUi5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZXB1aXBtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/jg4/jg4Pjg4FcbiAgICAgICAgdGhpcy5oYXRjaEwgPSBFbmVteShcIkdhcnVkYV9oYXRjaFwiLCAtNjEsIDIsIDApXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKVxuICAgICAgICAgICAgLnNldFBhcmVudEVuZW15KHRoaXMpO1xuICAgICAgICB0aGlzLmhhdGNoUiA9IEVuZW15KFwiR2FydWRhX2hhdGNoXCIsICA2MiwgMiwgMClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpXG4gICAgICAgICAgICAuc2V0UGFyZW50RW5lbXkodGhpcyk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc011dGVraSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcblxuICAgICAgICAgICAgdGhpcy5oYXRjaEwuaXNDb2xsaXNpb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5oYXRjaFIuaXNDb2xsaXNpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICAvL+enu+WLleODkeOCv+ODvOODs1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe3k6IFNDX0gqMC4yfSwgMTIwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAudG8oe3k6IFNDX0gqMC4zfSwgMTIwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAuc2V0TG9vcCh0cnVlKTtcblxuICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/ogJDkuYXlipvmrovjgorvvJLlibLliIfjgaPjgZ/jgonjg4bjgq/jgrnjg4Hjg6PjgpLliIfmm79cbiAgICAgICAgaWYgKHRoaXMudGV4SW5kZXggPT0gMCAmJiB0aGlzLmRlZiA8IHRoaXMuZGVmTWF4KjAuMikge1xuICAgICAgICAgICAgdGhpcy50ZXhJbmRleCA9IDE7XG4gICAgICAgICAgICB0aGlzLnNoYWRvdy5mcmFtZUluZGV4ID0gMTtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9kZSgyOTYsIDgwKTtcbiAgICAgICAgICAgIC8v55m654uC44Oi44O844OJ56e76KGMXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhbXBlZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZsYXJlKFwic3RhbXBlZGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVhZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAvL+egsuWPsOS4oeaWueOBqOOCguatu+OCk+OBoOOCieeZuueLguODouODvOODieenu+ihjFxuICAgICAgICBpZiAoIXRoaXMuc3RhbXBlZGUgJiYgdGhpcy5oYXRjaEwuZGVmID09IDAgJiYgdGhpcy5oYXRjaFIuZGVmID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZmxhcmUoXCJzdGFtcGVkZVwiKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0RGVhZEJvc3MoMjk2LCA4MCk7XG4gICAgfSxcbn07XG5cbmVuZW15RGF0YVsnR2FydWRhX2hhdGNoJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogW1wiR2FydWRhX2hhdGNoXzFcIiwgXCJHYXJ1ZGFfaGF0Y2hfMlwiLCBcIkdhcnVkYV9oYXRjaF8zXCIsIFwiR2FydWRhX2hhdGNoXzRcIl0sXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgMTYsXG4gICAgaGVpZ2h0OiAxNixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxNTAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX1VQUEVSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTX0VRVUlQLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9TTUFMTCxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogMTYsXG4gICAgdGV4SGVpZ2h0OiAxNixcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMzg0LFxuICAgIHRleFRyaW1XaWR0aDogNjQsXG4gICAgdGV4VHJpbUhlaWdodDogMTYsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgdGhpcy50ZXhJbmRleCA9IDA7XG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IHRoaXMueDtcbiAgICAgICAgdGhpcy5vZmZzZXRZID0gdGhpcy55O1xuXG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgLy/plovplolcbiAgICAgICAgdGhpcy5pZHggPSAwO1xuICAgICAgICB0aGlzLm9uKCdidWxsZXRzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHtpZHg6IDN9LCAxNSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHtpZHg6IDB9LCAxNSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50RW5lbXkueCArIHRoaXMub2Zmc2V0WDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wYXJlbnRFbmVteS55ICsgdGhpcy5vZmZzZXRZO1xuICAgICAgICB0aGlzLnRleEluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmlkeCk7XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg44Oc44K544Kq44OX44K344On44Oz44CMR2FydWRhQm9tYuOAjVxuICovXG5lbmVteURhdGFbJ0dhcnVkYUJvbWInXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcIkdhcnVkYUJvbWJcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICAyMCxcbiAgICBoZWlnaHQ6IDMwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDMwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDIwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9TTUFMTCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogMzIsXG4gICAgdGV4SGVpZ2h0OiA0OCxcbiAgICB0ZXhJbmRleDogMCxcbiAgICB0ZXhUcmltWDogMTkyLFxuICAgIHRleFRyaW1ZOiAyNTYsXG4gICAgdGV4VHJpbVdpZHRoOiA2NCxcbiAgICB0ZXhUcmltSGVpZ2h0OiA0OCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihlbnRlclBhcmFtKSB7XG4gICAgICAgIHRoaXMudnkgPSAwO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS50byh7dnk6IDN9LCAxODAsIFwiZWFzZU91dFNpbmVcIik7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcbiAgICB9LFxufTtcbiIsIi8qXG4gKiAgRW5lbXlEYXRhQm9zc18zLmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLypcbiAqXG4gKiAg77yT6Z2i5Lit44Oc44K5XG4gKiAg44CM44Oi44O844Oz44OW44Os44Kk44OJ44CNXG4gKlxuICovXG5lbmVteURhdGFbJ01vdXJuQmxhZGUnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBcIk1vdXJuQmxhZGVcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA5OCxcbiAgICBoZWlnaHQ6IDE5NixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAzMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NQk9TUyxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfQk9TUyxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogOTYsXG4gICAgdGV4SGVpZ2h0OiAxOTIsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDAsXG4gICAgdGV4VHJpbVdpZHRoOiAxOTIsXG4gICAgdGV4VHJpbUhlaWdodDogMTkyLFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBlcHVpcG1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgIH0sXG59O1xuXG4vKlxuICpcbiAqICDvvJPpnaLjg5zjgrlcbiAqICDnqbrkuK3nqbrmr43jgIzjgrnjg4jjg7zjg6Djg5bjg6rjg7Pjgqzjg7zjgI1cbiAqXG4gKi9cbmVuZW15RGF0YVsnU3Rvcm1CcmluZ2VyJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogW1wiU3Rvcm1CcmluZ2VyMV8xXCIsIFwiU3Rvcm1CcmluZ2VyMV8yXCIsIFwiU3Rvcm1CcmluZ2VyMV8zXCIsIFwiU3Rvcm1CcmluZ2VyMlwiXSxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA5OCxcbiAgICBoZWlnaHQ6IDE5NixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAzMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMTAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9CT1NTLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA5NixcbiAgICB0ZXhIZWlnaHQ6IDE5MixcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMCxcbiAgICB0ZXhUcmltV2lkdGg6IDE5MixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxOTIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgfSxcbn07XG4iLCIvKlxuICogIEVuZW15RGF0YUJvc3NfNC5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbi8qXG4gKlxuICogIO+8lOmdouS4reODnOOCuVxuICpcbiAqL1xuXG4vKlxuICpcbiAqICDvvJTpnaLjg5zjgrlcbiAqXG4gKi9cblxuIiwiLypcbiAqICBFbmVteURhdGEuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL+aVteWwj+maiuWNmOS9jeWumue+qVxuZW5lbXlVbml0ID0ge1xuXG4vKlxuICog56qB5pKD44OY44Oq44CM44Ob44O844ON44OD44OI44CN77yI44OR44K/44O844Oz77yR77yJXG4gKi9cblwiSG9ybmV0MS1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMSwgXCJ5XCI6LTE1MCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMiwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMywgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNCwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbl0sXG5cIkhvcm5ldDEtcmlnaHRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC42LCBcInlcIjotMTEwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC43LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC44LCBcInlcIjotMTAwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC45LCBcInlcIjotMTUwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuXSxcblwiSG9ybmV0MS1jZW50ZXJcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4yNSwgXCJ5XCI6LTE2MCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMzUsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjQwLCBcInlcIjotMTAwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC41MCwgXCJ5XCI6LTExMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNzAsIFwieVwiOi0xMzAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjg1LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuXSxcblxuLypcbiAqIOeqgeaSg+ODmOODquOAjOODm+ODvOODjeODg+ODiOOAje+8iOODkeOCv+ODvOODs++8ku+8iVxuICovXG5cIkhvcm5ldDItbGVmdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjEsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjIsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjMsIFwieVwiOi0xMzAsIHBhcmFtOntwYXR0ZXJuOjJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjQsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjJ9IH0sXG5dLFxuXCJIb3JuZXQyLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNiwgXCJ5XCI6LTEwMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNywgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuOCwgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuOSwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbl0sXG5cbi8qXG4gKiDnqoHmkoPjg5jjg6rjgIzjg5vjg7zjg43jg4Pjg4jjgI3vvIjjg5Hjgr/jg7zjg7PvvJPvvIlcbiAqL1xuXCJIb3JuZXQzLWxlZnRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4xLCBcInlcIjotMTAwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4yLCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4zLCBcInlcIjotMTMwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC40LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuXSxcblwiSG9ybmV0My1yaWdodFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjYsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjcsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjgsIFwieVwiOi0xMzAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjksIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG5dLFxuXCJIb3JuZXQzLWNlbnRlclwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjI1LCBcInlcIjotMTYwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4zNSwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNDAsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjUwLCBcInlcIjotMTEwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC43MCwgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuODUsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG5dLFxuXG4vKlxuICogIOS4reWei+aUu+aSg+ODmOODquOAjOOCuOOCrOODkOODgeOAjVxuICovXG5cIk11ZERhdWJlci1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIk11ZERhdWJlclwiLCBcInhcIjogU0NfVyowLjMsIFwieVwiOi1TQ19IKjAuMSB9LFxuXSxcblxuXCJNdWREYXViZXItY2VudGVyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIk11ZERhdWJlclwiLCBcInhcIjogU0NfVyowLjUsIFwieVwiOi1TQ19IKjAuMSB9LFxuXSxcblxuXCJNdWREYXViZXItcmlnaHRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiTXVkRGF1YmVyXCIsIFwieFwiOiBTQ19XKjAuNywgXCJ5XCI6LVNDX0gqMC4xIH0sXG5dLFxuXG4vKlxuICogIOS4reWei+eIhuaSg+apn+OAjOODk+ODg+OCsOOCpuOCo+ODs+OCsOOAjVxuICovXG5cIkJpZ1dpbmctbGVmdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJCaWdXaW5nXCIsIFwieFwiOlNDX1cqMC4yLCBcInlcIjotU0NfSCowLjEgfSxcbl0sXG5cblwiQmlnV2luZy1yaWdodFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJCaWdXaW5nXCIsIFwieFwiOlNDX1cqMC44LCBcInlcIjotU0NfSCowLjEgfSxcbl0sXG5cbi8qXG4gKiAg6aOb56m66ImH44CM44K544Kr44Kk44OW44Os44O844OJ44CNXG4gKi9cblwiU2t5QmxhZGUtbGVmdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJTa3lCbGFkZVwiLCBcInhcIjotU0NfVyowLjIsIFwieVwiOiBTQ19IKjAuNCB9LFxuXSxcblxuXCJTa3lCbGFkZS1yaWdodFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJTa3lCbGFkZVwiLCBcInhcIjogU0NfVyoxLjIsIFwieVwiOiBTQ19IKjAuNCB9LFxuXSxcblxuLypcbiAqICDnoLLlj7DjgIzjg5bjg6rjg6Xjg4rjg7zjgq/jgI1cbiAqL1xuXCJCcmlvbmFjMS1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkJyaW9uYWMxXCIsIFwieFwiOiBTQ19XKjAuMywgXCJ5XCI6LVNDX0gqMC4xLCBwYXJhbTp7cG9zOlwibGVmdFwifX0sXG5dLFxuXG5cIkJyaW9uYWMxLWNlbnRlclwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJCcmlvbmFjMVwiLCBcInhcIjogU0NfVyowLjUsIFwieVwiOi1TQ19IKjAuMSwgcGFyYW06e3BvczpcImNlbnRlclwifX0sXG5dLFxuXG5cIkJyaW9uYWMxLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkJyaW9uYWMxXCIsIFwieFwiOiBTQ19XKjAuNywgXCJ5XCI6LVNDX0gqMC4xLCBwYXJhbTp7cG9zOlwicmlnaHRcIn19LFxuXSxcblxuLypcbiAqICDkuK3lnovmiKbou4rjgIzjg5Xjg6njgqzjg6njg4Pjg4/jgI1cbiAqL1xuXCJGcmFnYXJhY2gtY2VudGVyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjIsIFwieVwiOi1TQ19IKjAuMSwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC4zLCBcInlcIjotU0NfSCowLjIsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuMiwgXCJ5XCI6LVNDX0gqMC4zLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcblxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuNSwgXCJ5XCI6LVNDX0gqMC4zNSwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC41LCBcInlcIjotU0NfSCowLjI1LCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcblxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuOCwgXCJ5XCI6LVNDX0gqMC4xLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjcsIFwieVwiOi1TQ19IKjAuMiwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC44LCBcInlcIjotU0NfSCowLjMsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuXSxcblwiRnJhZ2FyYWNoLWxlZnRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOi1TQ19XKjAuMDUsIFwieVwiOiAtU0NfSCowLjEsIHBhcmFtOntwYXR0ZXJuOlwibFwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOi1TQ19XKjAuMDUsIFwieVwiOiAtU0NfSCowLjIsIHBhcmFtOntwYXR0ZXJuOlwibFwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOi1TQ19XKjAuMSwgIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntwYXR0ZXJuOlwibFwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOi1TQ19XKjAuMSwgIFwieVwiOiAtU0NfSCowLjQsIHBhcmFtOntwYXR0ZXJuOlwibFwifSB9LFxuXSxcblwiRnJhZ2FyYWNoLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyoxLjA1LCBcInlcIjogLVNDX0gqMC4xLCBwYXJhbTp7cGF0dGVybjpcInJcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyoxLjA1LCBcInlcIjogLVNDX0gqMC4yLCBwYXJhbTp7cGF0dGVybjpcInJcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyoxLjEsICBcInlcIjogLVNDX0gqMC4zLCBwYXJhbTp7cGF0dGVybjpcInJcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyoxLjEsICBcInlcIjogLVNDX0gqMC40LCBwYXJhbTp7cGF0dGVybjpcInJcIn0gfSxcbl0sXG5cIkZyYWdhcmFjaC1sZWZ0MlwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC4yLCBcInlcIjotU0NfSCowLjEsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuMywgXCJ5XCI6LVNDX0gqMC4yLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjIsIFwieVwiOi1TQ19IKjAuMywgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC4zLCBcInlcIjotU0NfSCowLjQsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuXSxcblwiRnJhZ2FyYWNoLXJpZ2h0MlwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC44LCBcInlcIjotU0NfSCowLjEsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuNywgXCJ5XCI6LVNDX0gqMC4yLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjgsIFwieVwiOi1TQ19IKjAuMywgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC43LCBcInlcIjotU0NfSCowLjQsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuXSxcblxuXG4vKlxuICogIOS4reWei+i8uOmAgeapn+OAjOODiOOCpOODnOODg+OCr+OCueOAjVxuICovXG4vL+ODkeODr+ODvOOCouODg+ODl1xuXCJUb3lCb3gtcC1sZWZ0XCI6ICAgIFt7IFwibmFtZVwiOiBcIlRveUJveFwiLCBcInhcIjogU0NfVyowLjIsIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntkcm9wOlwicG93ZXJcIn0gfSxdLFxuXCJUb3lCb3gtcC1jZW50ZXJcIjogIFt7IFwibmFtZVwiOiBcIlRveUJveFwiLCBcInhcIjogU0NfVyowLjUsIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntkcm9wOlwicG93ZXJcIn0gfSxdLFxuXCJUb3lCb3gtcC1yaWdodFwiOiAgIFt7IFwibmFtZVwiOiBcIlRveUJveFwiLCBcInhcIjogU0NfVyowLjgsIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntkcm9wOlwicG93ZXJcIn0gfSxdLFxuXG4vL+ODnOODoFxuXCJUb3lCb3gtYi1sZWZ0XCI6ICAgIFt7IFwibmFtZVwiOiBcIlRveUJveFwiLCBcInhcIjogU0NfVyowLjIsIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntkcm9wOlwiYm9tYlwifSB9LF0sXG5cIlRveUJveC1iLWNlbnRlclwiOiAgW3sgXCJuYW1lXCI6IFwiVG95Qm94XCIsIFwieFwiOiBTQ19XKjAuNSwgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e2Ryb3A6XCJib21iXCJ9IH0sXSxcblwiVG95Qm94LWItcmlnaHRcIjogICBbeyBcIm5hbWVcIjogXCJUb3lCb3hcIiwgXCJ4XCI6IFNDX1cqMC44LCBcInlcIjogLVNDX0gqMC4zLCBwYXJhbTp7ZHJvcDpcImJvbWJcIn0gfSxdLFxuXG4vKlxuICpcbiAqICDvvJHpnaLkuK3jg5zjgrlcbiAqICDoo4XnlLLovLjpgIHliJfou4rjgIzjg4jjg7zjg6vjg4/jg7Pjg57jg7zjgI1cbiAqXG4gKi9cblwiVGhvckhhbW1lclwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJUaG9ySGFtbWVyXCIsIFwieFwiOlNDX1cqMC41LCBcInlcIjogU0NfSCoxLjMgfSxcbl0sXG5cbi8qXG4gKlxuICogIO+8kemdouODnOOCuVxuICogIOWxgOWcsOWItuWcp+Wei+W3qOWkp+aIpui7iuOAjOOCtOODquOCouODhuOAjVxuICpcbiAqL1xuXCJHb2x5YXRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiR29seWF0XCIsIFwieFwiOlNDX1cqMC41LCBcInlcIjogU0NfSCotMC4yIH0sXG5dLFxuXG4vKlxuICpcbiAqICDvvJLpnaLkuK3jg5zjgrkgIFxuICogIOWkp+Wei+eIhuaSg+apn+OAjOODrOOCpOODluODs+OAjVxuICpcbiAqL1xuXCJSYXZlblwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJSYXZlblwiLCBcInhcIjogU0NfVyoxLjIsIFwieVwiOiBTQ19IKjAuNyB9LFxuXSxcblxuLypcbiAqXG4gKiAg77yS6Z2i44Oc44K5XG4gKiAg5aSn5Z6L6LaF6auY6auY5bqm54iG5pKD5qmf44CM44Ks44Or44O844OA44CNXG4gKlxuICovXG5cIkdhcnVkYVwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJHYXJ1ZGFcIiwgXCJ4XCI6IFNDX1cqMC41LCBcInlcIjogU0NfSCowLjIgfSxcbl0sXG5cbn1cbiJdfQ==
