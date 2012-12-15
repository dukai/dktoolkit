validate = {
	types: {
		notEmpty : {regExp : /.+/, message :  '请检查确认填写的项目不为空'},
		email : {regExp : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ ,message:'请检查电子邮件的格式'},
		cellphone: {regExp: /\d{11}/, message: '请检查手机号码'},
		date: {regExp: /^\d{4}-\d{1,2}-\d{1,2}$/, message: '请检查日期'},
		number: {regExp: /^\d+$/, message: '请检查是否为数字'}
	},//regexp
	config: {
		trigger: 'blur',
		reset: 'focus',
		icons: {
			success: 'http://www.dklogs.net/lib/images/success.png',
			falid: 'http://www.dklogs.net/lib/images/faild.png',
			loading: 'http://img.scimg.cn/images/common/loader.gif'
		},
		properties: [
			'id', //dom id
			'type', //common regexp type
			'regexp', //custom regexp
			'message', //custom error hint message
			'url', //ajax url
			'nullable', //是否可为空
			'customeValue', //自定义value值
			'valid', //custom valid function
			'reset', //自定义重置方法
			'trigger', //trigger valid function
			'offsetX', //hint message offsetx
			'offsetY', //nint messsage offsety
			'length', //content length limit, + 大于等于1， {n} 长度为n， {n,m} 长度大于n小于m， {n,} 长度大于n
			'onReset', //重置时触发事件
			'onValid' //验证时触发事件
		],
		parentContainer: document.body
		//length: {max: 16, min:8}
	},
	vNodes: [],
	init: function(rules, config){
		this.vNodes = [];
		for(var i in config){
			this.config[i] = config[i];
		}
		if(this.messageContainer){
			this.messageContainer.innerHTML = '';
		}else{
			this.messageContainer = document.createElement('div');
		}
		
		this.rules = rules;
		for(var i = 0, len = rules.length; i < len; i++){
			var currentRule = rules[i];
			this.vNodes.push(new VNode(currentRule));
		}
		if(!this.config.parentContainer){
			this.config.parentContainer = document.body;
		}else{
			this.config.parentContainer = this.g(this.config.parentContainer);
		}
		this.config.parentContainer.appendChild(this.messageContainer);
	},
	getGuid: function(){
		return 'v' + Math.random().toString().slice(2,5) + (new Date()).getTime();
	},
	check: function(callback){
		var ajaxCheckNodes = [];
		var execAjaxCheckQueue = function(status){
			if(!status){
				return false;
			}
			
			if(ajaxCheckNodes.length == 0){
				callback && callback();
			}
			
			var currentVNode = ajaxCheckNodes.shift()
			
			currentVNode && currentVNode.checkAjax(execAjaxCheckQueue);
		};
		for(var i = 0, len = this.vNodes.length; i < len; i++){
			var vNode = this.vNodes[i];
			if(!vNode.isValid){
				vNode.checkManul(true);
				if(!vNode.status){
					return false;
				}
				if(vNode.isAjaxCheck){
					ajaxCheckNodes.push(vNode);
				}
			}else if(!vNode.status){
				return false;
			}
		}
		
		if(ajaxCheckNodes.length > 0){
			execAjaxCheckQueue(true);
			return false;
		}
		
		return true;
		
	},
	getPositionInDoc: function(target, referNode){
		target = validate.g(target)
		
        if (!target) {
            return null;
        }
        var left = 0,
            top = 0;
		if(referNode){
			referNode = validate.g(referNode);
			do {
				left += target.offsetLeft || 0;
				top += target.offsetTop || 0;
				target = target.offsetParent;
			} while (target != referNode && $.contains(referNode, target));
		}else{
			do {
				left += target.offsetLeft || 0;
				top += target.offsetTop || 0;
				target = target.offsetParent;
			} while (target);
		}
        return {
            left: left,
            top: top
        };
	},
	g: function(){
		if (typeof(arguments[0]) == 'string') {
            if (document.getElementById(arguments[0])) {
                return document.getElementById(arguments[0]);
            } else {
                //throw "unknow element";
                return null;
            }
        } else {
            return arguments[0];
        }
	},
	dispose: function(){
		if(this.messageContainer){
			this.messageContainer.parentNode.removeChild(this.messageContainer);
		}
		
		this.vNodes = [];
	},
	reset: function(){
		for(var i = 0, len = this.vNodes.length; i < len; i++){
			this.vNodes[i].reset();
		}
	}
};

var VNode = function(rule){
	var self = this;
	self.node = validate.g(rule.id);
	self.guid = validate.getGuid();
	self.isValid = false;
	self.status = false;
	self.validEvent = {status: false};
	self.isValid = false;
	self.hintMessage = new HintMessage(self.node, rule.offsetX, rule.offsetY);
	self.isAjaxCheck = !!rule.url;
	
	self.check = function(isLocal){
		self.isValid = true;
		var message;
		if(rule.customValue){
			self.value = rule.customValue(); 
		}else{
			if(self.node.tagName == 'INPUT' && (self.node.type == 'text' || self.node.type == 'password') || self.node.tagName == 'TEXTAREA'){
				self.value = $.trim(self.node.value);
			}else if(self.node.tagName == 'SELECT'){
				self.value = self.node.options[self.node.selectedIndex].value;
			}else{
				self.validEvent.message = '请注意，所选对象无法验证,ID为' + rule.id;
				self.validEvent.status = self.status = true;
				return self.validEvent;
			}
		}
		//local check
		
		if(rule.nullable && self.value == ''){
			self.status = self.validEvent.status = true;
			return self.validEvent;
		}
		
		if(rule.valid && !rule.valid.call(self)){
			self.validEvent.message = '内容不符合规则';
			return self.validEvent;
		}
		
		if(rule.length){
			var valueLength = self.value.length;
			if(/^\+$/.test(rule.length)){
				if(valueLength = 0){
					message = "长度不符合要求!";
					self.validEvent.message = message;
					return self.validEvent;
				}
			}
			var range = /^\{(\d+)(\,(\d+)*)*\}$/,
				result;
			if(result = range.exec(rule.length)){
				var min = result[1],
					comma = result[2],
					max = result[3];
				if((comma == undefined || comma == '') && (max == undefined || max == '')){
					if(valueLength != min){
						message = "长度不符合要求!";
						self.validEvent.message = message;
						return self.validEvent;
					}
				}else if(comma && (max == undefined || max == '')){
					if(valueLength < min){
						message = "长度不符合要求!";
						self.validEvent.message = message;
						return self.validEvent;
					}
				}else {
					if(valueLength < min || valueLength > max){
						message = "长度不符合要求!";
						self.validEvent.message = message;
						return self.validEvent;
					}
				}
			}
		}
		
		if(rule.regexp){
			if(!rule.regexp.test(self.value)){
				message = '不符合格式';
				self.validEvent.message = message;
				return self.validEvent;
			}
		}
		
		if(rule.type){
			var officialRegExp = validate.types[rule.type];
			if(!officialRegExp.regExp.test(self.value)){
				message = officialRegExp.message;
				self.validEvent.message = message;
				return self.validEvent;
			}
		}
		
		if(rule.url && !isLocal){
			self.checkAjax();			
		}
		self.status = true;
		self.validEvent.status = true;
		return self.validEvent;
	};
	
	self.checkAjax = function(fn){
		$.ajax({
			url: rule.url + '?term=' + self.value ,
			dataType: 'json',
			success: function(data, textstatus, xhr){
				if(!data){
					self.validEvent.message = '由于网络问题无法验证';
					if(self.status){
						self.validEvent.stauts = true;
						self.status = true;
						self.hintMessage.show(self.validEvent.message, HintMessage.WARNING);
					}
				}else{
					self.status = data.status;
					validEvent.status = data.status;
					if(!self.status){
						self.validEvent.message = data.message;
						self.hintMessage.show(self.validEvent.message, HintMessage.ERROR);
					}else{
						self.hintMessage.hide();
					}
				}
				fn && fn(self.status);
			},
			error: function(){
				self.validEvent.message = '由于网络问题无法验证';
				
				if(self.status){
					self.validEvent.stauts = true;
					self.status = true;
					self.hintMessage.show(self.validEvent.message, HintMessage.WARNING);
				}
				fn && fn(self.status);
			},
			beforeSend: function(){
				self.validEvent.message = "正在验证...";
				self.hintMessage.show(self.validEvent.message, HintMessage.MESSAGE);
			}
		});
	};
	
	self.reset = function(){
		rule.onReset && rule.onReset.call(self);
		self.hintMessage.hide();
		self.status = false;
		self.isValid = false;
		self.validEvent.status = false;
		self.validEvent.message = '';
	};
	
	self.checkManul = function(isLocal){
		rule.onValid && rule.onValid.call(self);
		var validEvent = self.check(isLocal);
		if(!validEvent.status){
			if(rule.message){
				self.hintMessage.show(rule.message, HintMessage.ERROR);
			}else{
				self.hintMessage.show(validEvent.message, HintMessage.ERROR);
			}
		}
	};
	
	self.checkEvent = function(e){
		self.checkManul();
	};
	
	self.resetEvent = function(){
		self.reset();
	};
	
	if(rule.trigger){
		rule.trigger.call(self);
	}else{
		$(self.node).bind(validate.config.trigger, self.checkEvent);
	}
	
	if(rule.reset){
		rule.reset.call(self);
	}else{
		$(self.node).bind(validate.config.reset, self.resetEvent);
	}
};

var HintMessage = function(referNode, offsetX, offsetY){
	var self = this;
	self.referNode = referNode;
	self.node = document.createElement('span');
	self.node.style.display = 'none';
	self.node.style.position = 'absolute';
	self.node.style.zIndex = '9999';
	validate.messageContainer.appendChild(self.node);
	self.showStatus = false;
	
	var messageStyle = {
		'0': 'error',
		'1': 'warning',
		'2': 'message',
		'3': 'success'
	}
	
	self.show = function(message, messageType){
		self.showStatus = true;
		self.node.innerHTML = message;
		self.node.className = messageStyle[messageType];
		self.render();
	}
	
	self.hide = function(){
		self.showStatus = false;
		self.node.style.display = 'none';
	}
	
	self.render = function(){
		var position = validate.getPositionInDoc(referNode, validate.config.parentContainer);
		var left = position.left,
			top = position.top;
		if(offsetX){
			left += offsetX;
		}
		if(offsetY){
			top += offsetY;
		}
		self.node.style.left = left + 'px';
		self.node.style.top = top + 'px';
		self.node.style.display = 'inline';
	}
	
	self.rerender = function(){
		self.render();
	};
	
	$(window).resize(function(){
		self.showStatus && self.rerender();
	});
};

HintMessage.ERROR = 0;
HintMessage.WARNING = 1;
HintMessage.MESSAGE = 2;
HintMessage.SUCCESS = 3;