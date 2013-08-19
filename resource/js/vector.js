/*
142, 385
142, 460
254, 400
254, 327
**************
114, 425
*/

var Vector2D = function(x, y){
	this._initVector2D(x, y);
};

Vector2D.prototype = {
	_initVector2D: function(x, y){
		this.x = x;
		this.y = y;
	},
	add : function(v){
		this.x += v.x;
		this.y += v.y;
	},
	
	remove : function(v){
		this.x -= v.x;
		this.y -= v.y;
	},
	
	cross: function(v){
		return [0, 0, this.x * v.y - this.y * v.x];
	},
	
	dot: function(v){
		return this.x * v.x + this.y * v.y;
	},
	
	clone : function(){
		return new Vector(this.x, this.y);
	}
};

Array.prototype.clone = function(){
	var t = [];
	for(var i = 0, len = this.length; i < len; i++){
		var tt = this[i].clone ? this[i].clone() : this[i];
		t.push(tt);
	}
	return t;
};
//[[142, 385], [142, 460], [254, 400], [254, 327]]
var Polygon = function(coordinates){
	this._initPolygon(coordinates);
};

Polygon.prototype = {
	_initPolygon: function(coordinates){
		this.origCoordinates = coordinates.clone();
		this.coordinates = coordinates.clone();
		this.vectors = [];
	},
	collision: function(x, y){
		var coordinates = this.coordinates;
		var v = new Vector2D(x, y);
		for(var i = 0, len = coordinates.length; i < len; i++){
			var cur = coordinates[i], next;
			if( i == len - 1){
				next = coordinates[0];
			}else{
				next = coordinates[i + 1];
			}
			var tv = new Vector2D( next[0] - cur[0], next[1] - cur[1]);
			var v = new Vector2D (x - cur[0], y - cur[1]);
			if(tv.cross(v)[2] > 0){
				return false;
			}
		}
		return true;
	},
	
	resize: function(percent){
		for(var i = 0, len = this.coordinates.length; i < len; i++){
			this.coordinates[i][0] = this.origCoordinates[i][0] * percent;
			this.coordinates[i][1] = this.origCoordinates[i][1] * percent;
		}
	},
	
	draw: function(id){
		var canvas = document.getElementById(id);
		var context = canvas.getContext('2d');
		context.clearRect(0,0,1920,1080);
		var coordinates = this.coordinates;
		context.moveTo(coordinates[0][0], coordinates[0][1]);
		for(var i = 0, len = coordinates.length; i < len; i++){
			var cur = coordinates[i];
			context.lineTo(cur[0], cur[1]);
		}
		context.fillStyle = "rgba(255, 0, 0, .5)";
		context.fill();
	}
};