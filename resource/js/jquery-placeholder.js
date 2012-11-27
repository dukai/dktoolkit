(function($){

var eles = {
	div: document.createElement('div'),
	ul: document.createElement('ul'),
	li: document.createElement('li'),
	span: document.createElement('span'),
	p: document.createElement('p'),
	a: document.createElement('a'),
	fragment: document.createDocumentFragment(),
	input: document.createElement('input')
}
	
var supportProperty = function(nodeType, property){
	switch(arguments.length){
		case 0:
			return false;
		case 1:
			var property = nodeType, nodeType = 'div';
			property = property.split('.');
			
			if(property.length == 1){
				return typeof eles[nodeType][property[0]] !== 'undefined';
			}else if(property.length == 2){
				return typeof eles[nodeType][property[0]][property[1]] !== 'undefined';
			}
		case 2:
			property = property.split('.');
			
			if(property.length == 1){
				return typeof eles[nodeType][property[0]] !== 'undefined';
			}else if(property.length == 2){
				return typeof eles[nodeType][property[0]][property[1]] !== 'undefined';
			}
			
			return false;
			
			
		default:
			return false;
	}
};

var getPositionInDoc = function(target, parent) {
	if (!target) {
		return null;
	}
	var left = 0,
		top = 0;
	do {
		left += target.offsetLeft || 0;
		top += target.offsetTop || 0;
		target = target.offsetParent;
		if(parent && target == parent){
			break;
		}
	} while (target);
	return {
		left: left,
		top: top
	};
}

var $c = function(tagName, id, className){
	var ele = null;
	if(!eles[tagName]){
		ele = eles[tagName] = document.createElement(tagName);
	}else{
		ele = eles[tagName].cloneNode(true);
	}
	if(id){
		ele.id = id;
	}
	if(className){
		ele.className = className;
	}
	return ele;
};
	
var CustomPlaceholder = function(box, input, option){
	var self = this;
	var position = getPositionInDoc(input);
	self.input = input;
	
	self.option = {xOffset:0, yOffset:0};
	for(var item in option){
		self.option[item] = option[item];
	}
	self.hint = self.createHintLabel(input.getAttribute('placeholder'), position);
	box.appendChild(self.hint);
	
	self.initEvents = function(){
		$(self.hint).bind( 'click', function(e){
			self.input.focus();
		});
		
		$(self.input).bind( 'focus', function(e){
			self.hint.style.display = 'none';
		});
		
		$(self.input).bind( 'blur', function(e){
			if(this.value == ''){
				self.hint.style.display = 'inline';
			}
		});
	};
	
	self.initEvents();
};

CustomPlaceholder.prototype = {
	createHintLabel: function(text, position){
		var hint = $c('label');
		hint.style.cusor = 'text';
		hint.style.position = 'absolute';
		hint.style.left = position.left + this.option.xOffset + 'px';
		hint.style.top = position.top + this.option.yOffset + 'px';
		hint.innerHTML = text;
		hint.style.zIndex = '9999';
		return hint;
	},
	position: function(){
		var position = getPositionInDoc(this.input);
		this.hint.style.left = position.left + this.option.xOffset + 'px';
		this.hint.style.top = position.top + this.option.yOffset + 'px';
	}
};

$.fn.placeholder = function(option){
	if(supportProperty('input', 'placeholder')){
		return;
	}
	var customPlaceholders = [];
	if(this.length > 0){
		var box = $c('div', 'dk_placeholderfixed_box');
		for(var i = 0, len = this.length; i < len; i++){
			var input = this[i];
			customPlaceholders.push(new CustomPlaceholder(box, input, option));
		}
		
		document.body.appendChild(box);
	}
	
	$(window).bind( 'resize', function(e){
		for(var i = 0, len = customPlaceholders.length; i < len; i++){
			var customPlaceholder = customPlaceholders[i];
			customPlaceholder.position();
		}
		
	});
};

})(jQuery);