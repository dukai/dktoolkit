(function(win){
var $$ = dk.$$;
var tween = {
	liner: function(t, begin, end, duration){
		begin = tween.getNum(begin); 
		end = tween.getNum(end);
		return (end - begin) * t / duration + begin;
	},
	Quad: {
        easeIn: function(t, b, c, d){
			b = tween.getNum(b), c = tween.getNum(c);
			c = c - b;
            return c * (t /= d) * t + b;
        },
        easeOut: function(t, b, c, d){
			b = tween.getNum(b), c = tween.getNum(c);
			c = c - b;
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut: function(t, b, c, d){
			b = tween.getNum(b), c = tween.getNum(c);
			c = c - b;
            if ((t /= d / 2) < 1) 
                return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
	getNum: function(value){
		var num = parseFloat(value);
		if(isNaN(num)){
			num = 0;
		}
		return num;
	}
};
var cache = {};
cache.STYLECACHE = {};
colorAnimate = ['backgroundColor', 'borderColor', 'color'];
function Motion(ele){
	var _duration, 
		begin, 
		end, 
		now = 0, 
		_styles = null,
		_callback = null,
		guid = ele.guid;
	var originalStyle = [], 
		endStyle = [],
		isPaused = false;
	
	this.getGuid = function(){
		return guid;
	};
	
	this.ele = ele, this.queue;
	
	this.start = function(){
		MotionMgr.add(guid, this);
	};
	
	this.pause = function(){
		this.isPaused = true;
	};
	
	this.resume = function(){
		this.isPaused = false;
		MotionMgr.add(this);
	};
	
	this.stop = function(){
		now = _duration;
		nextStep();
		now ++;
		return false;
	};
	
	this.step = function(){
		if(now == 0){
			this.before();
		}
		if(this.isPaused){
			return true;
		}
		if(now > _duration){
			this.after();
			return true;
		}
		nextStep();
		now ++;
		return false;
	}
	
	this.isStoped = function(){
		return now > _duration;
	}
	
	function nextStep(){ //动画执行函数
		var tweenFunc = tween.Quad.easeOut;
		if(Motion.tween){
			tweenFunc = Motion.tween;
		}
		for(var i = 0, len = endStyle.length; i < len; i++){
			if(Motion.inArray(endStyle[i][0], colorAnimate)){
				var origColor = Motion.getColorData(originalStyle[i][1]);
				var endColor = Motion.getColorData(endStyle[i][1]);
				
				var stepColor = {};
				
				stepColor.r = Math.ceil(tweenFunc(now, origColor.r, endColor.r, _duration));
				stepColor.g = Math.ceil(tweenFunc(now, origColor.g, endColor.g, _duration));
				stepColor.b = Math.ceil(tweenFunc(now, origColor.b, endColor.b, _duration));
				
				$$(ele).css(endStyle[i][0], "rgb(" + stepColor.r + "," + stepColor.g + "," + stepColor.b + ")");
			}else{
				$$(ele).css(endStyle[i][0], tweenFunc(now, originalStyle[i][1], endStyle[i][1], _duration));
			}
			
		}
	}
	this.init = function(styles, duration, callback){
		_duration = duration;
		_styles = styles;
		_callback = callback;
		this.start();
	};
	this.before = function(){
		if($$(ele).css('display') == 'none'){
			if(cache.getValue(guid, 'display'))
				$$(ele).css('display', cache.getValue(guid, 'display'));
			else
				$$(ele).css('display', 'block');
		}
		for(var styleName in _styles){
			originalStyle.push([styleName, $$(ele).css(styleName)]);
			endStyle.push([styleName, _styles[styleName]]);
		}
	};
	this.after = function(){
		if(parseInt($$(ele).css('height')) == 0 ||	parseInt($$(ele).css('width')) == 0 || $$(ele).css('opacity') == 0){
			cache.setValue(guid, 'display', $$(ele).css('display'));
			$$(ele).css('display', 'none');
		}
		if(_callback){
			_callback();
		}
	};
}

Motion.inArray = function(value, arr){
	for(var i = 0, len = arr.length; i < len; i++){
		if(arr[i] == value){
			return true;
		}
	}
	
	return false;
};

Motion.tween = null;

Motion.prototype = {
	animate: function(styles, duration, callback){
		this.init(styles, duration, callback);
	},
	hide: function(duration, callback){
		if($$(this.ele).css('display') == 'none'){//如果当前对象display为none则直接返回
			return;
		}
		var guid = this.ele.guid;
		if(arguments.length == 0){
			cache.setValue(guid, 'show', {display: $$(this.ele).css('display')});
			
			$$(this.ele).css('display', 'none');
		}else{
			cache.setValue(guid, 'show', {width: $$(this.ele).css('width'), height: $$(this.ele).css('height'), opacity: $$(this.ele).css('opacity')});
			
			this.init({width: 0,height: 0, opacity: 0}, duration, callback);
		}
	},
	show: function(duration, callback){
		var guid = this.ele.guid,
			display = $$(this.ele).css('display'),
			opacity = $$(this.ele).css('opacity');
		var exstyles = cache.getValue(guid, 'show');
		if(!exstyles && display != 'none'){
			return;
		}
		
		
		var _callback = function(){
			if(callback){
				callback();
			}
			cache.deleteKey(guid, 'show');
		};
		
		if(arguments.length == 0){
			$$(this.ele).css(exstyles);
		}else{
			if(exstyles){
				this.init(exstyles, duration, _callback);
			}else if(display == 'none'){
				this.init({opacity: 1}, duration, _callback);
			}
		}
	},
	slideDown: function(duration, callback){
		var guid = this.ele.guid;
		var exstyles = cache.getValue(guid, 'slide');
		if(!exstyles){
			return;
		}
		
		
		var _callback = function(){
			if(callback){
				callback();
			}
			cache.deleteKey(guid, 'slide');
		};
		
		if(arguments.length == 0){
			$$(this.ele).css(exstyles);
		}else{
			if(exstyles){
				this.init(exstyles, duration, _callback);
			}
		}
	},
	slideUp: function(duration, callback){
		if($$(this.ele).css('display') == 'none'){//如果当前对象display为none则直接返回
			return;
		}
		var guid = this.ele.guid;
		if(arguments.length == 0){
			duration = 40;
		}else{
			cache.setValue(guid, 'slide', { height: $$(this.ele).css('height')});
			this.init({height: 0}, duration, callback);
		}
	},
	fadeIn: function(duration, callback){
		var guid = this.ele.guid,
			display = $$(this.ele).css('display'),
			opacity = $$(this.ele).css('opacity');
		var exstyles = cache.getValue(guid, 'fade');
		if(!exstyles && display == 'block' && opacity == 1){
			return;
		}
		
		
		var _callback = function(){
			if(callback){
				callback();
			}
			cache.deleteKey(guid, 'fade');
		};
		
		if(arguments.length == 0){
			$$(this.ele).css(exstyles);
		}else{
			if(exstyles){
				this.init(exstyles, duration, _callback);
			}else if(display == 'none' && opacity == 1){
				$$(this.ele).css('opacity', 0);
				this.init({'opacity': 1}, duration, _callback);
			}
		}
	},
	fadeOut: function(duration, callback){
		if($$(this.ele).css('display') == 'none'){
			return;
		}
		
		var guid = this.ele.guid;
		
		if(arguments.length == 0){
			duration = 40;
		}else{
			cache.setValue(guid, 'fade', { opacity: $$(this.ele).css('opacity')});
			this.init({opacity: 0}, duration, callback);
		}
	},
	color: function(begincolor, endcolor, duration, callback){
		$$(this.ele).css('backgroundColor', begincolor);
		this.init({'backgroundColor': endcolor}, duration, callback);
	}
};

function mo(node){
	node = dk.$(node);
	if(!node.guid){
		node.guid = mo.getMotionGuid();
	}
	return new Motion(node);
}

win.mo = mo;

mo.getMotionGuid = function(){
	return 'mo' + Math.random().toString().slice(2,5) + (new Date()).getTime();
}

mo.setup = function(t){
	var tArr = t.split('.');
	if(tArr.length == 1){
		Motion.tween = tween[t];
	}else{
		Motion.tween = tween[tArr[0]][tArr[1]];
	}
};
//获取颜色的值对象结构为{r, g, b}
Motion.getColorData = function(colorString){
	var colorData = {}
	var rexColor_FF = /rgb\(.{1,}?,.{1,}?,.{1,}?\)/;
	var rexColor_FF_each = /\d{1,3}/g;
	var rexColor_IE = /#(.{3}|.{6})/;
	var rexColor = /((#(.{3}|.{6}))|(rgb\(.{1,}?,.{1,}?,.{1,}?\)))/;
	if (rexColor_FF.test(colorString)) {
		var colorDataArr = colorString.match(rexColor_FF_each);
		colorData.r = parseInt(colorDataArr[0]);
		colorData.g = parseInt(colorDataArr[1]);
		colorData.b = parseInt(colorDataArr[2]);
		return colorData;
	}
	
	if (rexColor_IE.test(colorString)) {
		var r, g, b;
		if (colorString.length == 4) {
			r = colorString.slice(1, 2);
			r += r;
			g = colorString.slice(2, 3);
			g += g;
			b = colorString.slice(3);
			b += b;
		}
		else if (colorString.length == 7) {
			r = colorString.slice(1, 3);
			g = colorString.slice(3, 5);
			b = colorString.slice(5);
		}
		colorData.r = parseInt(r, 16);
		colorData.g = parseInt(g, 16);
		colorData.b = parseInt(b, 16);
		return colorData;
	}
	return false;
};

cache.setValue = function(guid, type, value){
	if(!cache.STYLECACHE[guid]){
		cache.STYLECACHE[guid] = {};
	}
	
	cache.STYLECACHE[guid][type] = value;
};

cache.getValue = function(guid, type){
	if(cache.STYLECACHE[guid] && cache.STYLECACHE[guid][type]){
		return cache.STYLECACHE[guid][type];
	}else{
		return null;
	}
};

cache.deleteKey = function(guid, type){
	if(cache.STYLECACHE[guid] && cache.STYLECACHE[guid][type]){
		delete cache.STYLECACHE[guid][type];
		return true;
	}
	
	return false;
};

var MotionMgr = {
	timer: null,
	queue: null,
	execQueue: function(){
		if(!this.queue){
			this.queue = MotionQueue.getInstance();
		}
		var queue = this.queue;
		if(queue.getLength() > 0){
			var hashTable = queue.getQueue();
			for(var guid in hashTable){
				if(hashTable[guid][0].step()){
					queue.remove(hashTable[guid][0].getGuid());
				}
			}
		}else{
			clearInterval(MotionMgr.timer);
			MotionMgr.timer = null;
		}
	},
	add: function(guid, motion){
		if(!this.queue){
			this.queue = MotionQueue.getInstance();
		}
		var queue = this.queue;
		queue.add(guid, motion);
		
		//queue.push(motion);
		if(!this.timer){
			this.start();
		}
	},
	start: function(){  
		this.timer = setInterval(dk.bind(this, this.execQueue), 20);
	}
}

//queue = {id: [m1, m2], id2: [m1]}

var MotionQueue = (function(){
	var length = 0;
	var hashTable = {};
	var instance = null;
	var constructor = function(){
		return {
			add: function(guid, motion){
				if(hashTable[guid]){
					hashTable[guid].push(motion);
				}else{
					hashTable[guid] = [motion];
					length ++;
				}
			},
			remove: function(guid){
				if(hashTable[guid] && hashTable[guid].length > 0){
					hashTable[guid].shift();
					if(hashTable[guid].length == 0){
						delete hashTable[guid];
						length -- ;
					}
				}
			},
			getQueue: function(){
				return hashTable;
			},
			getLength: function(){
				return length;
			}
		};
	};

	return { 
		getInstance: function(){
			if(instance == null){
				instance = constructor();
			}
			return instance;
		}
	};
})();

})(window);