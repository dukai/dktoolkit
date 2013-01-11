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
	self.total = self.referSelect.options.length;
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
		//self.referSelect.style.display = "none";
		self.referSelect.style.cssText += '/*position:absolute;left:-9999em;*/';
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
				if(e.target !== self.referSelect){
					self.blur();
				}
			}
		});
		
		dk.addEvent(self.referSelect, 'keyup', function(e){
			console.log(e.which);
			if(e.which == 38){
				if(self.selectedIndex > 0){
					self.select(self.selectedIndex - 1);
					
					if(self.selectedIndex * 32 < self.dom.itemList.scrollTop){
						self.dom.itemList.scrollTop -= 32;
					}
				}
			}
			
			if(e.which == 40){
				if(self.selectedIndex < self.total - 1){
					self.select(self.selectedIndex + 1);
					console.log(self.dom.itemList.scrollTop);
					if(self.selectedIndex * 32 > self.dom.itemList.scrollTop - dk.$$(self.dom.itemList).height()){
						self.dom.itemList.scrollTop += 32;
					}
				}
			}
			return false;
		});
		
		dk.addEvent(self.referSelect, 'focus', function(e){
			self.focus();
		});
		
		dk.addEvent(self.referSelect, 'blur', function(e){
			self.blur();
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
		self.referSelect.focus();
		self.focus();
	};
	
	self.close = function(){
		self.dom.list.style.display = "none";
		$$(self.dom.caption).removeClass('active');
		self._status = false;
		self.dom.mainBox.style.zIndex = '1';
	};
	
	self.focus = function(){
		dk.$$(self.dom.mainBox).addClass('ds_focus');
	}
	
	self.blur = function(){
		dk.$$(self.dom.mainBox).removeClass('ds_focus');
	}
	
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
		$$(self.dom.items[self.selectedIndex]).removeClass('select');
		self.selectedIndex = self.referSelect.selectedIndex = index;
		self.dom.caption.innerHTML = self.dom.items[index].innerHTML;
		$$(self.dom.items[index]).addClass('select');
	};
};
window.DSelect = DSelect;
})(dk);