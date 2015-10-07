/*
 *  item.js
 *  2015/09/20
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムパターン用配列
phinaApp.itemPattern = [0,0,2,5,7,19];

phina.define("phinaApp.Item", {
    superClass: "phina.display.CanvasElement",

    //アイテム種別
    _pattern: 0,

    //所属パネル
    panel: null,
    
    //アイテム種別
    kind: 0,

    ok: false,
    rad: 0, 

    time: 0,

    init: function(panel, kind) {
        //親クラスの初期化
        this.superInit();
        kind = kind || 1;
        
        this.panel = panel;

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 32, 32).addChildTo(this);
        this.sprite.x = this.panel.x;
        this.sprite.y = this.panel.y-SC_H*0.7;
        this.sprite.setScale(0.7);
        var that = this;
        this.sprite.tweener.clear().wait(rand(0,300)).move(this.panel.x, this.panel.y-20, 1000, "easeOutBounce").call(function(){that.ok = true;});

        this.kind = kind;
        this.pattern = phinaApp.itemPattern[kind];
    },

    update: function() {
        if (this.ok && this.time % 2 == 0) {
            this.sprite.y = Math.sin(this.rad*0.1)*-10+this.panel.y-20;
            this.rad+=1;
        }
        this.time++;
    },
    _access: {
        pattern: {
            "get": function() { return this._pattern; },
            "set": function(ptn) {
                this._pattern = ptn;
                this.sprite.setFrameIndex(ptn);
            }
        }
    }
});

