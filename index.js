var request = require("hyperquest");
var joi = require("joi")
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
      description: "Returns a PNG tile on specified coordinates",
      tags: ["api"],
      notes: "Tiles are provided by OpenStreetMap project. " +
        "We can use three map servers: a, b, and c. " +
        "The zoom parameter is an integer between 0 (zoomed out) and 19 (zoomed in). 19 is normally the maximum, but some tile servers might go beyond that." +
        "X goes from 0 (left edge is 180 °W) to 2^zoom − 1 (right edge is 180 °E). " +
        "Y goes from 0 (top edge is 85.0511 °N) to 2^zoom − 1 (bottom edge is 85.0511 °S) in a Mercator projection."
      ,
      validate: {
        query: {
            s: joi.string().required().description("Map server name"),
            z: joi.number().required().description("Zoom level"),
            x: joi.number().required().description("X tile coordinates"),
            y: joi.number().required().description("Y tile coordinates"),
        }
      },
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


