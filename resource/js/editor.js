/**
 *@Author Dukai
 *@Email dukai86@gmail.com
 *@CreateTime 2013/1/15
 */
var Editor = function(textareaId, options){
	var self = this;
	self.dom = {};
	self.textarea = dk.$(textareaId);
	
	self.options = {
		toolbar: [
			['font_family', 'font_size'],
			['bold', 'italic', 'underline', 'del'], 
			['font_color', 'bg_color'], 
			['aleft', 'acenter', 'aright'],
			['link', 'unlink', 'image'],
			['source']
		]
	};
	
	self.init =function(){
		self.initOptions();
		self.initUI();
		
		self.initIframe();
	};
	
	self.initOptions = function(){
		for(var key in options){
			self.options[key] = options[key];
		}
	}
	
	self.initUI =function(){
		var options = self.options;
		var toolbarOpt = options.toolbar;
		
		//初始化主容器
		self.dom.mainBox = dk.$c('div', null, 'dk_editor');
		//初始化工具条容器
		self.dom.toolbar = dk.$c('div', null, 'toolbar');
		self.dom.barGroups = [];
		var inArray = Editor.tools.inArray;
		for(var i in toolbarOpt){
			var groupOpt = toolbarOpt[i];
			var groupDom = dk.$c('div', null, 'bar_group');
			self.dom.barGroups.push(groupDom);
			for(var j in groupOpt){
				var btn = groupOpt[j];
				var btnDom;
				/*
				if(inArray(['font_family', 'font_size'], btn)){
					btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}else if(inArray(['font_color', 'bg_color'], btn)){
					btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}else{
					btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}
				*/
				
				var tp = pm.get(btn);
				
				
				groupDom.appendChild(tp.dom.main);
			}
			
			self.dom.toolbar.appendChild(groupDom);
		}
		
		self.dom.toolbar.appendChild(dk.$c('div', null, 'clear'));
		
		
		//初始化编辑框容器
		self.dom.editorBox = dk.$c('div', null, 'editor_box');
		self.dom.iframe = dk.$c('iframe', null, 'editor_frame');
		self.dom.iframe.setAttribute('frameborder', 0);
		self.dom.iframe.setAttribute('designMode','on');
		self.dom.editorBox.appendChild(self.dom.iframe);
		//初始化状态栏容器
		self.dom.statusbar = dk.$c('div', null, 'statusbar');
		self.dom.statusbar.innerHTML = '<a>body</a>';
		//将DOM插入到页面中
		self.dom.mainBox.appendChild(self.dom.toolbar);
		self.dom.mainBox.appendChild(self.dom.editorBox);
		self.dom.mainBox.appendChild(self.dom.statusbar);
		self.textarea.parentNode.insertBefore(self.dom.mainBox, self.textarea);
	}
	
	self.initIframe =function(){
		var iframe = self.dom.iframe;
		var doc = iframe.currentDocument || iframe.contentWindow.document;
		var win = iframe.contentWindow;
		doc.designMode = 'on';
		doc.contentEditable = true;
		doc.charset = "utf-8";
		doc.open();
		doc.write('');
		doc.close();
	}
	
	self.init();
}

Editor.tools = {
	inArray : function(array, item){
		for(var i in array){
			if(item === array[i]){
				return true;
			}
		}
		return false;
	}
}

var PluginManager = function(){
	var self = this;
	var hashTable = {};
	var pluginName = [];
	self.regist = function(name, obj){
		hashTable[name] = obj;
		pluginName.push(name);
		return true;
	}
	
	self.get = function(name){
		return hashTable[name];
	}
	
	self.getNames = function(){
		return pluginName;
	}
}

var pm = new PluginManager();


var Plugin = function(options){
	var self = this;
	
	self.dom = {
		main: null
	};
	
	self.options = {
		list: []
	};
	//初始化Dom
	self.initUI = function(){};
	
	self.initOptions = function(){
		for(var key in options){
			self.options[key] = options[key];
		}
	}
	
	self.init = function(){
		self.initOptions();
		self.initUI();
	}
};

var ListPlugin = function(options){
	var self = this;
	
	this.parent.__constructor(this, arguments);
	
	self.initUI = function(){
		var list = self.options.list;
		self.dom.main = dk.$c('select');
		for(var i = 0, len = list.length; i < len; i++){
			var option = dk.$c('option');
			option.setAttribute('value', list[i].value);
			option.text = list[i].text;
			self.dom.main.add(option, null);
		}
	}
	
	self.init();
}

dk.extend(ListPlugin, Plugin);

var ButtonPlugin = function(options){
	this.parent.__constructor(this, arguments);
	var self = this;
	
	self.initUI = function(){
		self.dom.main = dk.$c('button', null, self.options.className);
		self.dom.main.setAttribute('type', 'button');
	}
	
	self.init();
}

dk.extend(ButtonPlugin, Plugin);

var SplitButtonPlugin = function(){
	this.parent.__constructor(this, arguments);
	var self = this;
	
	self.initUI = function(){
		self.dom.main = dk.$c('div', null, 'splitbtn');
		self.dom.button = dk.$c('button', null, self.options.className);
		self.dom.button.setAttribute('type', 'button');
		self.dom.arrow = dk.$c('div', null, 'arrowdown');
		
		self.dom.main.appendChild(self.dom.button);
		self.dom.main.appendChild(self.dom.arrow);
	}
	
	self.init();
}

dk.extend(SplitButtonPlugin, Plugin);


pm.regist('font_family', new ListPlugin({
	list: [
		{value: '1', text: '微软雅黑'},
		{value: '2', text: '宋体'}
	]
	
}));

pm.regist('font_size', new ListPlugin({
	list: [
		{value: '12px', text: '12px'},
		{value: '14px', text: '14px'}
	]
}));

pm.regist('font_color', new SplitButtonPlugin({
	className: 'font_color'
}));

pm.regist('bg_color', new SplitButtonPlugin({
	className: 'bg_color'
}));

pm.regist('bold', new ButtonPlugin({
	className: 'bold'
}));

pm.regist('italic', new ButtonPlugin({
	className: 'italic'
}));

pm.regist('underline', new ButtonPlugin({
	className: 'underline'
}));

pm.regist('del', new ButtonPlugin({
	className: 'del'
}));

pm.regist('aleft', new ButtonPlugin({
	className: 'aleft'
}));

pm.regist('acenter', new ButtonPlugin({
	className: 'acenter'
}));

pm.regist('aright', new ButtonPlugin({
	className: 'aright'
}));

pm.regist('link', new ButtonPlugin({
	className: 'link'
}));

pm.regist('unlink', new ButtonPlugin({
	className: 'unlink'
}));

pm.regist('image', new ButtonPlugin({
	className: 'image'
}));

pm.regist('source', new ButtonPlugin({
	className: 'source'
}));
