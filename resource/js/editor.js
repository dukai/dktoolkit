/**
 *@Author Dukai
 *@Email dukai86@gmail.com
 *@CreateTime 2013/1/15
 */
var Editor = function(textareaId, options){
	var self = this;
	self.dom = {};
	self.textarea = dk.$(textareaId);
	self.designMode = true;
	
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
	
	self.setDesignMode = function(modeStat){
		self.designMode = modeStat;
	}
	
	self.syncContent = function(){
		setInterval(function(){
			if(self.designMode){
				self.textarea.value = self.doc.body.innerHTML;
			}else{
				self.doc.body.innerHTML = self.textarea.value;
			}
			
		}, 100);
	}
	
	self.init =function(){
		self.initOptions();
		self.initUI();
		self.initIframe();
		self.initEvents();
		self.syncContent();
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
				var tp = pm.get(btn);
				tp.setEditor(self);
				
				
				groupDom.appendChild(tp.dom.main);
			}
			
			self.dom.toolbar.appendChild(groupDom);
		}
		
		self.dom.toolbar.appendChild(dk.$c('div', null, 'clear'));
		//设置按钮无法获取焦点
		self.dom.toolbar.unselectable = 'on';
		self.dom.toolbar.onselectstart = function(){
			return false;
		}
		self.dom.toolbar.style.cssText = '-moz-user-select: none;';
		
		//初始化编辑框容器
		self.dom.editorBox = dk.$c('div', null, 'editor_box');
		self.dom.editorBox.style.cssText = 'overflow:hidden;height:300px;position:relative;padding-left:4px;'
		self.dom.iframe = dk.$c('iframe', null, 'editor_frame');
		self.dom.iframe.setAttribute('frameborder', 0);
		self.dom.iframe.setAttribute('designMode','on');
		self.dom.iframe.setAttribute('scroll', 'no');
		self.dom.iframe.setAttribute('width', '100%');
		self.dom.iframe.setAttribute('height', '100%');
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
	//设置状态栏内容
	self.setStatusBar = function(){
		var tagList = self.findPath();
		var pathString = '';
		for(var i = tagList.length - 1; i >= 0; i--){
			if(i != tagList.length - 1){
				pathString += ' ';
			}
			pathString += '<a>' + tagList[i] + '</a> '; 
			
			if(i > 0){
				pathString += '&gt;';
			}
		}
		
		self.dom.statusbar.innerHTML = pathString;
	};
	
	self.initIframe =function(){
		var iframe = self.dom.iframe;
		var doc = iframe.currentDocument || iframe.contentWindow.document;
		var win = iframe.contentWindow;
		doc.designMode = 'on';
		doc.contentEditable = true;
		doc.charset = "utf-8";
		doc.open();
		doc.write('<!DOCTYPE html><html class="view"><head><meta charset="utf-8" /><style>.view{padding:0;word-wrap:break-word;cursor:text;width:100%;height:100%;overflow:hidden;}.viewbody{margin:0;padding:0;width:100%;height:100%;overflow:auto;}p{margin:10px 0;}</style></head><body class="viewbody"></body></html>')
		doc.write(self.textarea.value);
		doc.close();
		self.win = win;
		self.doc = doc;
	}
	
	self.initEvents = function(){
		//add editor keyboard events
		dk.addEvent(self.doc.body, 'keypress', function(e){
			if(e.which == 13){
				self.doc.execCommand('formatblock', false, '<p>');
			}
		});
		//add editor click events
		dk.addEvent(self.doc.body, 'click', function(e){
			self.setStatusBar();
		});
		
		dk.addEvent(self.win, 'beforedeactivate', function(e){
			//console.log('before deactivate');
			self.rangeBackup = self.doc.selection.createRange().duplicate();
			//console.log(self.rangeBackup.text);
		});
		dk.addEvent(self.win, 'activate', function(e){
			//console.log('activate');
			if(self.rangeBackup){
				self.rangeBackup.select();
			}
		});
	}
	
	self.findPath = function(){
		//get start node and node path
		var startNode = null;
		if(self.doc.selection){
			startNode = self.doc.selection.createRange().parentElement()
		}else{
			startNode = self.doc.getSelection().focusNode;
			if(startNode.nodeType == 3){
				startNode = startNode.parentElement;
			}
		}
		var tagList = [];
		while(startNode.tagName.toUpperCase() != 'BODY' && startNode.tagName.toUpperCase() != 'HTML'){
			tagList.push(startNode.tagName.toLowerCase());
			startNode = startNode.parentNode;
		}
		tagList.push('body');
		
		return tagList;
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
	self.eidtor = null;
	self.dom = {
		main: null
	};
	
	self.options = {
		list: [],
		onclick: function(){},
		onpulldown: function(){},
		onpullup: function(){}
	};
	//初始化Dom
	self.initUI = function(){};
	self.initEvents = function(){
		
	};
	self.afterEvent = function(){
		self.editor.win.focus();
	};
	self.initOptions = function(){
		for(var key in options){
			self.options[key] = options[key];
		}
	}
	
	self.init = function(){
		self.initOptions();
		self.initUI();
		self.initEvents();
	}
	
	self.setEditor = function(editor){
		self.editor = editor;
	};
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
	
	self.initEvents = function(){
		dk.addEvent(self.dom.main, 'change', function(e){
			var text = this.options[this.selectedIndex].text;
			var value = this.options[this.selectedIndex].value;
			self.options.onchange.call(self, {editor: self.editor, value: value, text: text});
			
			self.afterEvent();
		});
		
	}
	
	self.init();
}

dk.extend(ListPlugin, Plugin);

var ButtonPlugin = function(options){
	this.parent.__constructor(this, arguments);
	var self = this;
	
	self.isSelected = false;
	
	self.select = function(){
		dk.$$(self.dom.main).addClass('select');
	}
	
	self.unSelect = function(){
		dk.$$(self.dom.main).removeClass('select');
	}
	
	self.updateStat = function(){
		if(self.isSelected){
			self.unSelect();
		}else{
			self.select();
		}
		
		self.isSelected = !self.isSelected;
	}
	
	self.initUI = function(){
		self.dom.main = dk.$c('button', null, self.options.className);
		self.dom.main.setAttribute('type', 'button');
	}
	
	self.initEvents = function(){
		dk.addEvent(this.dom.main, 'click', function(e){
			self.options.onclick.call(self, self.editor);
			self.afterEvent();
		});
	};
	
	self.init();
}

dk.extend(ButtonPlugin, Plugin);
/**
options = {
	className: string,
	onclick: function,
	onpulldown: function
}
*/
var SplitButtonPlugin = function(options){
	this.parent.__constructor(this, arguments);
	var self = this;
	self.isOpen = false;
	
	self.initUI = function(){
		self.dom.main = dk.$c('div', null, 'splitbtn');
		self.dom.button = dk.$c('button', null, self.options.className);
		self.dom.button.setAttribute('type', 'button');
		self.dom.arrow = dk.$c('div', null, 'arrowdown');
		
		self.dom.main.appendChild(self.dom.button);
		self.dom.main.appendChild(self.dom.arrow);
	}
	self.initEvents = function(){
		dk.addEvent(this.dom.button, 'click', function(e){
			self.options.onclick.call(self, {
				editor: self.editor, 
				currentTarget: this
			});
		});
		
		dk.addEvent(this.dom.arrow, 'click', function(e){
			
			if(!self.isOpen){
				dk.$$(self.dom.main).addClass('open');
				
				self.options.onpulldown.call(self, {
					editor: self.editor,
					currentTarget: this,
					isOpen: self.isOpen
				});
			}else{
				dk.$$(self.dom.main).removeClass('open');
				
				self.options.onpullup.call(self, {
					editor: self.editor,
					currentTarget: this,
					isOpen: self.isOpen
				});
			}
			self.isOpen = !self.isOpen;
		});
		
	};
	
	self.close = function(){
		self.isOpen = false;
		dk.$$(self.dom.main).removeClass('open');
	};
	
	self.init();
	
}

dk.extend(SplitButtonPlugin, Plugin);


pm.regist('font_family', new ListPlugin({
	list: [
		{value: '1', text: '微软雅黑'},
		{value: '2', text: '宋体'}
	],
	onchange: function(e){
		e.editor.doc.execCommand('fontname', false, e.text);
	}
	
}));

pm.regist('font_size', new ListPlugin({
	list: [
		{value: '1', text: '1'},
		{value: '2', text: '2'},
		{value: '3', text: '3'},
		{value: '4', text: '4'},
		{value: '5', text: '5'},
		{value: '6', text: '6'},
		{value: '7', text: '7'},
	],
	onchange: function(e){
		e.editor.doc.execCommand('fontsize', false, e.text);
	}
}));

pm.regist('font_color', new SplitButtonPlugin({
	className: 'font_color',
	onclick: function(e){
		
	},
	onpulldown: function(e){
		var self = this;
		var position = dk.pageDom(e.currentTarget);
		self.cp = dk.getColorPicker({
			simple: true,
			onconfirm: function(event){
				e.editor.doc.execCommand('ForeColor', false, event.color);
			},
			onclose: function(){
				self.close();
			}
		});
		self.cp.setTarget(self.dom.arrow);
		self.cp.show(position.left - 26, position.top + 25);
	},
	onpullup: function(e){
		self.cp.close();
	}
}));

pm.regist('bg_color', new SplitButtonPlugin({
	className: 'bg_color',
	onclick: function(e){
		
	},
	onpulldown: function(e){
		var self = this;
		var position = dk.pageDom(e.currentTarget);
		self.cp = dk.getColorPicker({
			simple: true,
			onconfirm: function(event){
				e.editor.doc.execCommand('BackColor', false, event.color);
			},
			onclose: function(){
				self.close();
			}
		});
		self.cp.setTarget(self.dom.arrow);
		self.cp.show(position.left - 26, position.top + 25);
	},
	onpullup: function(e){
		self.cp.close();
	}
}));

pm.regist('bold', new ButtonPlugin({
	className: 'bold',
	onclick: function(editor){
		editor.doc.execCommand('bold', false, null);
	}
}));

pm.regist('italic', new ButtonPlugin({
	className: 'italic',
	onclick: function(editor){
		editor.doc.execCommand('italic', false, null);
	}
}));

pm.regist('underline', new ButtonPlugin({
	className: 'underline',
	onclick: function(editor){
		editor.doc.execCommand('underline', false, null);
	}
}));

pm.regist('del', new ButtonPlugin({
	className: 'del',
	onclick: function(editor){
		editor.doc.execCommand('strikethrough', false, null);
	}
}));

pm.regist('aleft', new ButtonPlugin({
	className: 'aleft',
	onclick: function(editor){
		editor.doc.execCommand('justifyleft', false, null);
	}
}));

pm.regist('acenter', new ButtonPlugin({
	className: 'acenter',
	onclick: function(editor){
		editor.doc.execCommand('justifycenter', false, null);
	}
}));

pm.regist('aright', new ButtonPlugin({
	className: 'aright',
	onclick: function(editor){
		editor.doc.execCommand('justifyright', false, null);
	}
}));

pm.regist('link', new ButtonPlugin({
	className: 'link',
	onclick: function(eidtor){
		
		var dialog = new DialogBox('<div class="fields_box"><div class="cline"><label>链接地址: </label><input type="text" class="link_url" /></div></div>', {
			title: '插入链接',
			width: 500,
			height: 200,
			custombtns: [
				{
					name: '创建',
					func: function(){
						var linkUrl = dk.getElementsByClassName('link_url', 'input', this.getPanel())[0];
						editor.win.focus();
						
						if(editor.rangeBackup && !editor.rangeBackup.text){
							editor.rangeBackup.pasteHTML('<a href="' + linkUrl.value + '">' + linkUrl.value + '</a>');
							console.log(editor.rangeBackup.htmlText);
						}else{
							editor.doc.execCommand('CreateLink', false, linkUrl.value);
						}
						this.close();
					},
					style: 'dkit-btn-positive'
				}
			]
		});
		dialog.show();
	}
}));

pm.regist('unlink', new ButtonPlugin({
	className: 'unlink',
	onclick: function(editor){
		editor.doc.execCommand('Unlink', false);
	}
}));

pm.regist('image', new ButtonPlugin({
	className: 'image',
	onclick: function(editor){
		
	}
}));

pm.regist('source', new ButtonPlugin({
	className: 'source',
	onclick: function(editor){
		if(this.isSelected){
			editor.setDesignMode(true);
		}else{
			editor.setDesignMode(false);
		}
		
		this.updateStat();
	}
}));
