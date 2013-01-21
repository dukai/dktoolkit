/**
 * Author:	DK
 * Email:	dukai86@gmail.com
 * Blog:	http://www.dklogs.net
 */

var BasePopBox = function(options){
	this.title = "Message";
	
	this.isShow = false;
	this.options = {
		custombtns: [],
		title: '提示:',
		width: 800,
		height: 0,
		dragable: true,
		isBlock: true
	};
	if(options){
		for(var key in options){
			this.options[key] = options[key];
		}
	}
	this.customEvents = {};
	this.model = null;
	this.isBlock = true;
	//dom fields
	this.container_dom = null;
	this.content_dom = null;
	this.title_dom = null;
	this.header_dom = null;
	this.ctrlbtns_dom = null;
	this.coverLayer_dom = null;
	this.funcbtns_dom = null;
	this.funcBtns = {};
	
	
	var self = this;
	
	self.initialize = function(){
		if(!self.container_dom){
			self.initializeUI();
			self.initializeEvents();
		}
	};
	
	self.initializeUI = function(){
		self.funcBtns.confirm = dk.$c('a', null, 'dkit-popbox-btn-confirm');
		self.funcBtns.confirm.innerHTML = "确定";
		self.funcBtns.confirm.btntype = 'confirm';
		self.funcBtns.cancel = dk.$c('a', null, 'dkit-popbox-btn-cancel');
		self.funcBtns.cancel.innerHTML = '取消';
		self.funcBtns.cancel.btntype = 'cancel';
		self.funcBtns.custom = dk.$c('a', null, 'dkit-popbox-btn-custom');
		self.funcBtns.custom.btntype = 'custom';
		//获取浏览器窗口尺寸
		var browserSize = dk.getBrowserSize();
		var docSize = dk.getDocSize();
		
		//判断是否显示遮罩层
		if(self.options.isBlock){
			self.coverLayer_dom = dk.$c('div');
			var coverHeight = docSize.height >browserSize.height ? docSize.height : browserSize.height;
			dk.$$(self.coverLayer_dom).css({display:'none', position: 'absolute', background: '#000', opacity: '.5', top: 0, left: 0, width: '100%', height: coverHeight});
			document.body.appendChild(self.coverLayer_dom);
		}
		//生成popbox容器层
		self.container_dom = dk.$c('div', null, 'dkit-popbox');
		
		dk.$$(self.container_dom).css({'zIndex': 1001, 'display': 'none', 'width': self.options.width});
		document.body.appendChild(self.container_dom);
		//生成头部
		self.header_dom = dk.$c('div', null, 'dkit-popbox-header');
		self.title_dom = dk.$c('span');
		if(self.options.title){
			self.title = self.options.title;
		}
		self.title_dom.innerHTML = self.title;
		//控制按钮容器
		self.ctrlbtns_dom = dk.$c('div', null, 'dkit-popbox-ctrlbtns');
		self.close_ctrlbtn = dk.$c('a', null, 'dkit-popbox-ctrlbtns-close');
		self.close_ctrlbtn.btntype = 'close';
		self.ctrlbtns_dom.appendChild(self.close_ctrlbtn);
		self.header_dom.appendChild(self.title_dom);
		self.header_dom.appendChild(self.ctrlbtns_dom);
		//内容容器
		self.content_dom = dk.$c('div', null, 'dkit-popbox-content');
				
		//功能按钮容器
		self.funcbtns_dom = dk.$c('div', null, 'dkit-popbox-btnbox');
		self.renderBtns();
		
		var height = self.options.height;
		if(height == 'fill_parent'){
			height = dk.getBrowserSize().height;
			height -= 100;
		}else if(height == 0){
			height = '';
		}else{
			height -= 50;
			if(self.funcbtns_dom.style.display != 'none'){
				height -= 38;
			}
		}
		
		dk.$$(self.content_dom).css({height: height});
		
		self.container_dom.appendChild(self.header_dom);
		self.container_dom.appendChild(self.content_dom);
		self.container_dom.appendChild(self.funcbtns_dom);
		document.body.appendChild(self.container_dom);
	};
	
	self.initializeEvents = function(){
		dk.addEvent(self.container_dom, 'click', function(e){
			var target = e.target;
			switch(target.btntype){
				case 'min':
					//alert('min');
					break;
				case 'close':
					self.close();
					break;
				case 'confirm':
					self.confirm();
					break;
				case 'cancel':
					self.cancel();
					break;
				case 'custom':
					self.execCustomBtnsEvent(target.funcid);
					break;
				default:
					break;
			}
		});
		dk.addEvent(document, 'keypress', function(e){
			if(e.keyCode == 27){
				self.close();
			}
		});
		//注册拖动事件
		if(self.options.dragable){
			getDragManager().regist(self.header_dom, self.container_dom, {
				onstart: function(){self.dragStart()},
				onmove: function(){self.dragMove()},
				onend: function(){self.dragEnd()}
			});
		}
		dk.addEvent(window, 'resize', function(e){
			if(self.isShow){
				self.setBoxPosition();
			}
		});
		self.header_dom.onselectstart = function(){
			return false;
		}
	};
	
	self.dragStart = function(){};
	self.dragMove = function(){};
	self.dragEnd = function(){};
	self.getPanel = function(){
		return self.content_dom;
	}
	//执行自定义按钮事件
	self.execCustomBtnsEvent = function(btnId){
		var customBtns = self.options.custombtns;
		btnId = parseInt(btnId);
		customBtns[btnId]['func'].call(self);
	};
	//设置主体容器内容，如message
	self.setContent = function(message){
		self.content_dom.innerHTML = message;
	};
	//设置标题
	self.setTitle = function(title){
		self.title_dom.innerHTML = title;
	}
	
	self.setBoxPosition = function(left, top){
		if(arguments.length < 2){
			var browserSize = dk.getBrowserSize();
			var width = dk.$$(self.container_dom).width();
			var height = dk.$$(self.container_dom).height();
			var left = Math.floor((browserSize.width / 2) - (width / 2));
			var top = Math.floor((browserSize.height / 2) - (height / 2));
		}
		
		dk.$$(self.container_dom).css({'left': left, 'top': top});
	};
	
	self.renderBtns = function(){};//AbstractMethod	
	self.onShowEvent = function(){};
	self.onCloseEvent = function(){};
	
	self._show = function(){
		if(self.options.isBlock){
			self.coverLayer_dom.style.display = 'block';
		}
		self.container_dom.style.display = 'block';
		self.setBoxPosition();
		self.isShow = true;
		self.onShowEvent();
	};
	
	self.show = function(){
		self._show();
	};
	
	self.close = function(){
		self.onCloseEvent();
		if(self.options.isBlock)
			self.coverLayer_dom.style.display = 'none';
		self.container_dom.style.display = 'none';
		self.isShow = false;
	};
	self.onConfirmEvent = function(){};
	self.confirm = function(){
		self.onConfirmEvent();
		self.close();
	};
	
	self.onCancelEvent = function(){};
	self.cancel = function(){
		self.onCancelEvent();
		self.close();
	};
};

BasePopBox.Model = {
	'dialog':	0,
	'alert':	1,
	'confirm':	2,
	'toast': 	3
};

var DialogBox = function(id, options){ //extends BasePopBox
	BasePopBox.call(this, options);
	this.model = BasePopBox.Model.dialog;
	var node;
	if(typeof id == 'string'){
		var type = /<[^>]+?>/.test(id);
		if(!type){
			node = dk.$(id);
			node.style.display = '';
			this.title = node.getAttribute('boxtitle');
		}
	}else{
		type = false;
		node = id;
	}
	
	this.renderBtns = function(){
		if(this.options && this.options.custombtns.length > 0){
			this.funcbtns_dom.style.display = 'block';
			var custombtns = this.options.custombtns;
			for(var i = 0, len = custombtns.length; i < len; i ++){
				var btn = this.funcBtns.custom.cloneNode(true);
				btn.btntype = 'custom';
				btn.innerHTML = custombtns[i]['name'];
				btn.funcid = i;
				btn.custombtn = 'custombtn';
				if(custombtns[i]['style']){
					btn.className = custombtns[i]['style'];
				}
				
				this.funcbtns_dom.appendChild(btn);
			}
		}else{
			this.funcbtns_dom.style.display = 'none';
		}
		
	};
	this.initializeUI();
	this.initializeEvents();
	if(!type){
		this.content_dom.appendChild(node);
	}else{
		this.content_dom.innerHTML = id;
	}
};

var FrameBox = function(url, options){
	if(!options){
		options = {};
		options.dragable = false;
	}else if(options.dragable === undefined){
		
	}
	BasePopBox.call(this, options);
	
	this.renderBtns = function(){
		this.funcbtns_dom.style.display = 'none';
	};
	
	this.onShowEvent = function(){
		dk.$$(this.iframeCover).css({width: dk.$$(this.content_dom).css('width'), height: dk.$$(this.content_dom).css('height')});
	};
	
	this.dragStart = function(){
		this.iframeCover.style.display = 'block';
	};
	
	this.dragEnd = function(){
		this.iframeCover.style.display = 'none';
	}
	
	this.initializeUI();
	this.initializeEvents();
	var height = dk.getBrowserSize().height;
	height -= 100;
	
	this.iframeCover = dk.$c('div');
	dk.$$(this.iframeCover).css({position: 'absolute', left: 10, top: 10, background: '#fff', display: 'none', opacity: .1});
	var iframe = document.createElement('iframe');
	iframe.setAttribute('frameborder', 0);
	iframe.width = '100%';
	iframe.height = height;
	iframe.src = url;
	this.content_dom.appendChild(this.iframeCover);
	this.content_dom.appendChild(iframe);
	this.content_dom.style.position = 'relative';
	//this.content_dom.innerHTML = '<iframe src="' + url + '" frameborder="0" width="100%" height="' + height + '"></iframe>';
}

var AlertBox = function(message, options){
	if(options && !options.width){
		options.width = 500;
	}
	if(options && !options.height){
		options.height = 160;
	}
	BasePopBox.call(this, options);
	this.model = BasePopBox.Model.alert;
	this.renderBtns = function(){
		this.funcbtns_dom.style.display = "block";
		this.funcbtns_dom.appendChild(this.funcBtns.confirm);
	};
	
	this.show = function(message){
		if(message && message != ''){
			this.setContent(message);
		}
		this._show();
	}
	
	this.initializeUI();
	this.initializeEvents();
	this.setContent(message);
	
};

var ConfirmBox = function(message, options){
	BasePopBox.call(this, options);
	
	this.renderBtns = function(){
		this.funcbtns_dom.appendChild(this.funcBtns.confirm);
		this.funcbtns_dom.appendChild(this.funcBtns.cancel);
	};
	
	this.show = function(positiveEvent, negativeEvent){
		if(positiveEvent)
			this.onConfirmEvent = positiveEvent;
		if(negativeEvent)
			this.onCancelEvent = negativeEvent;
		this._show();
	};
	
	this.initializeUI();
	this.initializeEvents();
	this.setContent(message);
};

var ToastBox = function(message, duration, options){ 
	if(!duration){
		duration = 3000;
	}
	BasePopBox.call(this, options);
	this.options.isBlock = false;
	var self = this;
	this.renderBtns = function(){
		this.funcbtns_dom.style.display = "none";
	};
	
	this.onShowEvent = function(){ 
		setTimeout(self.close, duration);
	};
	
	this.show = function(message){
		if(message)
			this.setContent(message);
		this._show();
	}
	this.initializeUI();
	this.initializeEvents();
	this.header_dom.style.display = 'none';
	this.setContent(message);
};
//Toast Box 持续时间
ToastBox.slow = 6000;
ToastBox.noraml = 3000;
ToastBox.fast = 1000;