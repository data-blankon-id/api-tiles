var request = require("hyperquest");
var fs = require("fs");

var ROOT_URL = "tile.openstreetmap.org"; 
var SECOND = 1000;
var qs = require("querystring");

var Tiles = function(server, options, next) {
  this.server = server;
  this.options = options || {};
  this.registerEndPoints();

  function osmTiles(s, z, x, y, next) {
    var pathName =  s + "." + ROOT_URL + "/" + z + "/" + x + "/" + y + ".png";
    var fileName = pathName.replace(/\//g, "-"); 
    var dirName = __dirname + "/tiles";

    var loadFromFile = true;
    try {
      var stat = fs.accessSync(dirName + "/" + fileName); 
    } catch(e) {
      loadFromFile = false;
    }

    if (loadFromFile) {
      return next(null, dirName + "/" + fileName);
    }

    var r = request("http://" + pathName);
    try {
      fs.mkdirSync(dirName);
    } catch (e) {
    }
    var w = fs.createWriteStream(dirName + "/" + fileName);
    r.on("end", function() {
      next(null, dirName + "/" + fileName);
    });
    r.pipe(w);
  }
  server.method("osmTiles", osmTiles, {
    cache: {
      expiresIn: 60 * SECOND
    },
  }); 

}

Tiles.prototype.registerEndPoints = function() {
  var self = this;
  self.server.route({
    method: "GET",
    path: "/tiles",
    config: {
      handler: function(req, res) {
        self.server.methods.osmTiles(req.query.s, req.query.z, req.query.x, req.query.y, function(err, r) {
          res.file(r);
        });
      },
      query: self.query
    }
  });
}

exports.register = function(server, options, next) {
  new Tiles(server, options, next);
  next();
};

exports.register.attributes = {
  pkg: require(__dirname + "/package.json")
};


