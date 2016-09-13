/*
 *  tiledmap.js
 *  2016/9/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

phina.define("phina.asset.TiledMapData", {
  superClass: "phina.asset.Asset",

  init: function(options) {
      this.superInit();
  },

  _load: function(resolve) {

    var params = {};

    if (typeof this.src === 'string') {
      params.$extend({
        path: this.src,
      });
    }
    else if (typeof this.src === 'object') {
      params.$extend(this.src);
    }

    params.$safe({
      path: '',
      dataType: 'text',
    });

    // load
    var self = this;
    var xml = new XMLHttpRequest();
    xml.open('GET', params.path);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {
          var data = xml.responseText;

          if (params.dataType === 'json') {
            data = JSON.parse(data);
          } else if (params.dataType === 'xml') {
            data = (new DOMParser()).parseFromString(data, "text/xml");
          }
          self.dataType = params.dataType;

          self.data = data;
          resolve(self);
        }
      }
    };

    xml.send(null);
  },
});

