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

    //オブジェクトレイヤーデータ取得
    getObjectData: function() {
    },

    _parse: function(data) {
        //タイル属性情報取得
        var map = data.getElementsByTagName('map')[0];
        var attr = this._attrToJSON(map);
        this.$extend(attr);

        //タイルセット取得
        this.tilesets = this._parseTilesets(data);

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
            var imageURL = this.tilesets[i].image;
            imageSource.push(imageURL);
        }
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].image) imageSource.push(this.layers[i].image.source);
        }
        if (imageSource.length == 0) return;

        //アセットにあるか確認
        for (var i = 0; i < imageSource.length; i++) {
            var image = phina.asset.AssetManager.get('image', imageSource[i]);
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
            assets.image[imageSource[i]] = this.path+imageSource[i];
        }
        if (loadImage.length) {
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                loadImage.forEach(function(name) {
                    var image = phina.asset.AssetManager.get('image', name);
                    image.transparent(0, 0, 255);
                });
                that._generateImage();
                that._resolve(that);
            }.bind(this));
        }
    },

    //マップイメージ作成
    _generateImage: function() {
        var width = this.width * this.tilewidth;
        var height = this.height * this.tileheight;
        var canvas = phina.graphics.Canvas().setSize(width, height);

        // canvas全体のイメージデータ配列をゲット
        var imageData = canvas.context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
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
                obj[p.getAttribute('name')] = p.getAttribute('value');
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
                t.trans = tileset.getElementsByTagName('image')[0].getAttribute('trans');
                t.transR = parseInt(t.trans.substring(0, 2), 16);
                t.transG = parseInt(t.trans.substring(2, 4), 16);
                t.transB = parseInt(t.trans.substring(4, 6), 16);
            }
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
                        x: layer.getAttribute("x") || 0,
                        y: layer.getAttribute("y") || 0,
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

//指定したRGBのピクセルを透過させる
phina.asset.Texture.prototype.transparent = function(r, g, b) {
    this.filter(function(pixel, index, x, y, bitmap) {
        var data = bitmap.data;
        if (pixel[0] == r && pixel[1] == g && pixel[2] == 0) {
            data[index+3] = 0;
        }
    });
}


