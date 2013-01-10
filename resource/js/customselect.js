(function(dk){

var $$ = dk.$$;
var DSelect = function(referSelect){
	var self = this;
	self.dom = {};
	self._guid = 1;
	self.referSelect = dk.$(referSelect);
	self.mainId = "d_select_" + self._guid++;
	self._status = false;
	self.selectedIndex = self.referSelect.selectedIndex;
	self.length = self.referSelect.length;
	self.initUI = function(){
		var mainBox = self.dom.mainBox = dk.$c('div', self.mainId, 'd_select');
		var caption = self.dom.caption = dk.$c('div', null, 'caption');
		caption.innerHTML = self.referSelect.options[self.selectedIndex].text;
		var list = self.dom.list = dk.$c('div', null, 'd_list');
		list.style.display = "none";
		var itemList = self.dom.itemList = dk.$c('ul', null, 'select-item-list');
		var options = self.referSelect.options;
		for(var i = 0, len = options.length; i < len; i++){
			var option = options[i];
			var item = dk.$c('li');
			if(i == self.selectedIndex){
				item.className = 'select';
			}
			item.index = i;
			item.dvalue = option.value ? option.value : option.text;
			item.innerHTML = option.text;
			itemList.appendChild(item);
			if(!self.dom.items){
				self.dom.items = [];
			}
			
			self.dom.items.push(item);
		}
		
		var extra = dk.$c('div', null, 'extra');
		//extra.innerHTML = '<input id="album_title" type="text" class="common_text" /> <input id="btn_create" type="button" class="btn_white" value="创建" />';
		list.appendChild(itemList);
		//list.appendChild(extra);
		mainBox.appendChild(caption);
		mainBox.appendChild(list);
		self.referSelect.parentNode.insertBefore(mainBox, self.referSelect);
		self.referSelect.style.display = "none";
	};
	
	self.initEvents = function(){
		dk.addEvent(self.dom.caption, 'click', function(e){
			if(!self._status){
				self.open();
			}else{
				self.close();
			}
		});
		
		dk.addEvent(self.dom.list, 'click', function(e){
			var target = e.target;
			if(target.tagName == 'LI' && !$$(target).hasClass('extra')){
				self.dom.caption.innerHTML = target.innerHTML;
				self.close();
				self.select(target.index);
			}
		});
		
		dk.addEvent(window.document, 'click', function(e){
			if(!dk.contains(self.dom.mainBox, e.target) && e.target !== self.dom.mainBox){
				self.close();
			}
		});
	};
	
	self.init = function(){
		self.initUI();
		self.initEvents();
	};
	
	self.open = function(){
		self.dom.list.style.display = "block";
		$$(self.dom.caption).addClass('active');
		self._status = true;
		self.dom.mainBox.style.zIndex = '9999';
	};
	
	self.close = function(){
		self.dom.list.style.display = "none";
		$$(self.dom.caption).removeClass('active');
		self._status = false;
		self.dom.mainBox.style.zIndex = '1';
	};
	
	self.init();
	
	self.addItem = function(text, value){
		var item = dk.$c('li');
		item.innerHTML = text;
		item.dvalue = value ? value : text;
		var option = document.createElement('option');
		option.text = text;
		option.value = value ? value : text;
		self.dom.itemList.appendChild(item);
		try{
			self.referSelect.add(option, null);
		}catch(ex){
			self.referSelect.add(option);
		}
		self.length = self.referSelect.length;
		self.dom.items.push(item);
	};
	
	self.select = function(index){
		$$(self.dom.items[self.selectedIndex]).removeClass('select');
		self.selectedIndex = self.referSelect.selectedIndex = index;
		self.dom.caption.innerHTML = self.dom.items[index].innerHTML;
		$$(self.dom.items[index]).addClass('select');
	};
};
window.DSelect = DSelect;
})(dk);