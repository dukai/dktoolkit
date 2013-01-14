Array.prototype.inArray = function(item){
	for(var i in this){
		if(item === this[i]){
			return true;
		}
	}
	
	return false;
};

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
			['link', 'unlink', 'image']
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
		for(var i in toolbarOpt){
			var groupOpt = toolbarOpt[i];
			var groupDom = dk.$c('div', null, 'bar_group');
			self.dom.barGroups.push(groupDom);
			for(var j in groupOpt){
				var btn = groupOpt[j];
				if(['font_family', 'font_size'].inArray(btn)){
					var btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}else if(['font_color', 'bg_color'].inArray(btn)){
					var btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}else{
					var btnDom = dk.$c('button', null, btn);
					btnDom.setAttribute('type', 'button');
				}
				
				groupDom.appendChild(btnDom);
			}
			
			self.dom.toolbar.appendChild(groupDom);
		}
		
		
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