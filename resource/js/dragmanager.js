(function(window, dkit){

var DragManager = function(handler, operator){
	this.registedDragElements = [];
	this.activeEle = null;
	this.initEvent();
};

DragManager.prototype = {
	initEvent: function(){
		var dragEles = this.registedDragElements;
		var activeEle = null;		
		
		var clsSelect = 'getSelection' in window ? function () {
			window.getSelection().removeAllRanges();
		} : function () {
			try {
				document.selection.empty();
			} catch (e) {};
		};
		
		var dragStart = function(e){
			var target = e.target;
			for(var i = 0, len = dragEles.length; i < len; i ++){
				var dragEle = dragEles[i];
				//console.log(dragEle.handler);
				if(target == dragEle.handler || dkit.contains(dragEle.handler, target)){
					document.body.focus();
					activeEle = dragEle;
					dragEle.initStartPosition(e.clientX, e.clientY);
					dragEle.startDrag();
					dkit.addEvent(document, 'mousemove', dragMove);
					dkit.addEvent(document, 'mouseup',dragEnd);
					dkit.addEvent(document, 'dblclick',dragEnd);
					dkit.addEvent(dragEle.handler, 'losecapture', dragEnd);
					dkit.addEvent(window, 'blur', dragEnd);
					return false;
				}
			}
		}
		
		var dragMove = function(e){
			if(activeEle){
				activeEle.refreshPosition(e.clientX, e.clientY);
				clsSelect();
				document.body.focus();
				//activeEle.options.onmove();
			}
		}
		
		var dragEnd = function(e){
			if(activeEle){
				dkit.removeEvent(document, 'mousemove', dragMove);
				dkit.removeEvent(document, 'mouseup', dragEnd);
				dkit.removeEvent(document, 'dblclick',dragEnd);
				dkit.removeEvent(activeEle.handler, 'losecapture', dragEnd);
				dkit.removeEvent(window, 'blur', dragEnd);
				activeEle.stopDrag();
				activeEle = null;
				document.body.focus();
			}
		}
		
		dkit.addEvent(document, 'mousedown', dragStart);
	},
	regist: function(handler, operator, options){
		dkit.$$(handler).css('cursor', 'move');
		this.registedDragElements.push(new DragElement(handler, operator, options));
	}
	
};

var DragElement = function(handler, operator, options){
	this.handler = dkit.$(handler);
	this.operator = dkit.$(operator);
	this.startX = NaN;
	this.startY = NaN;
	this.startLeft = NaN;
	this.startTop = NaN;
	this.dragStatus = false;
	this.handler.style['MozUserSelect'] = 'none';
	this.operator.style.position = 'relative';
	var ele = document.documentElement;
	this._isLosecapture = 'onlosecapture' in ele,
	this._isSetCapture = 'setCapture' in ele;
	
	this.options = {
		onstart: function(){},
		onmove: function(){},
		onend: function(){},
		lockX: false,
		lockY: false,
		xRange: null,
		yRange: null
	};
	
	for(var i in options){
		this.options[i] = options[i];
	}
};

DragElement.prototype = {
	initStartPosition: function(_x, _y){
		this.startX = _x;
		this.startY = _y;
		this.startLeft = parseInt(dkit.$$(this.operator).css('left') == 'auto' ? 0 : dkit.$$(this.operator).css('left'));
		this.startTop = parseInt(dkit.$$(this.operator).css('top') == 'auto' ? 0 : dkit.$$(this.operator).css('top'));
	},
	startDrag: function(){
		if(this._isLosecapture)
			this.handler.setCapture();
		this.dragStatus = true;
		this.options.onstart();
	},
	stopDrag: function(){
		if(this._isLosecapture)
			this.handler.releaseCapture();
		this.dragStatus = false;
		this.options.onend();
	},
	refreshPosition: function(_x, _y){
		var options = this.options;
		if(!this.dragStatus){
			return;
		}
		var xPos = 0, yPos = 0;
		if(!options.lockX){
			xPos = this.startLeft + _x - this.startX;
			if(options.xRange){
				var xRange = options.xRange;
				if((xRange.min !== null || xRange.min !== 'undefined') && xPos < xRange.min){
					xPos = xRange.min;
				}
				if(xRange.max && xPos > xRange.max){
					xPos = xRange.max;
				}
			}
			this.operator.style.left = xPos + 'px';
		}
		if(!options.lockY){
			yPos = this.startTop + _y - this.startY;
			if(options.yRange){
				var yRange = options.yRange;
				if(yRange.min && yPos < yRange.min){
					yPos = yRange.min;
				}
				if(yRange.max && yPos > yRange.max){
					yPos = yRange.max;
				}
			}
			this.operator.style.top = yPos + 'px';
		}
		options.onmove({x: xPos, y: yPos});
	}
};

var getDragManager = function(){
	if(window.dragManager === undefined){
		window.dragManager = new DragManager();
	}
	return window.dragManager;
}

window.getDragManager = getDragManager;

})(window, dk);