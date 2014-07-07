var EventEmitter = function(){
	this._initEventEmitter();
};

EventEmitter.prototype = {
	_initEventEmitter: function(){
		this._events = {};
	},
	
	emit: function(type, eventObject){
		if(this._events[type]){
			var events = this._events[type].slice();
			
			for(var i = 0, len = events.length; i < len; i++){
				events[i].listener.call(this, eventObject);
			}
		}
	},
	
	addListener: function(type, listener){
		if(!this._events[type]){
			this._events[type] = [];
		}
		this._events[type].push({
			type: type,
			listener: listener
		});
	},
	
	on: function(type, listener){
		this.addListener(type, listener);
	},
	once: function(type, listener){
		var fired = false;

		function g(eventObject) {
			this.removeListener(type, g);
		
		    if (!fired) {
		    	fired = true;
				listener.apply(this, eventObject);
			}
		}
		
		  g.listener = listener;
		  this.on(type, g);
	},
	removeListener: function(type, listener){
		var events = this._events[type];
		
		for(var i = 0, len = events.length; i < len; i++){
			if(events[i] == listener){
				this._events[type].splice(i, 1);
			}
		}
	},
	removeAllListeners: function(type){
		if(type == undefined){
			this._events = {};
		}else{
			delete this._events[type];
		}
	},
	
};