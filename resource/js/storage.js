(
function(w){
	var isSupportLocalStorage = !!window.localStorage, isSupportBehavior = false;
	if(!isSupportLocalStorage){
		var dataObj = document.createElement('input');
		dataObj.type = 'hidden';
		document.body.appendChild(dataObj);
		isSupportBehavior = !! dataObj.addBehavior;
		isSupportBehavior && dataObj.addBehavior('#default#userData');
		
	}
	var configs = {
		storeName: 'editorContent'
	};
	
	Array.prototype.removeByValue = function(value){
		for(var i = 0, len = this.length; i < len; i ++){
			if(this[i] == value){
				this[i] = this[len - 1];
				this.pop();
			}
		}
		
	};
	
	var allAttribute = [];
	w.storage = {
		retrieve: function(name){
			if(!isSupportLocalStorage && isSupportBehavior){
				dataObj.load(configs.storeName);
				return dataObj.getAttribute(name);
			}else{
				return w.localStorage.getItem(name);
			}
			return null;
		},
		save: function(name, value){
			allAttribute.push(name);
			if(!isSupportLocalStorage && isSupportBehavior){
				dataObj.setAttribute(name, value);
				dataObj.save(configs.storeName);
				return true;
			}else{
				w.localStorage.setItem(name, value);
				return true;
			}
			return false;
		},
		remove: function(name){
			allAttribute.removeByValue(name);
			if(!isSupportLocalStorage && isSupportBehavior){
				dataObj.removeAttribute(name);
				dataObj.save(configs.storeName);
				return true;
			}else{
				w.localStorage.removeItem(name);
				return true;
			}
			return false;
		},
		clear: function(){
			if(!isSupportLocalStorage && isSupportBehavior){
				for(var i = 0, len = allAttribute.length; i < len; i ++){
					dataObj.removeAttribute(allAttribute[i]);
				}
				dataObj.save(configs.storeName);
				return true;
			}else{
				w.localStorage.clear();
				return true;
			}
			return false;
		}
	};
})(window);