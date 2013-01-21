var LazyLoad = {
	'options': {
		range: 20,
		elements: window.document.images,
		replaceImg: 'http://img.scimg.cn/images/common/lzimg.gif',
		laodingBg: 'http://img.scimg.cn/images/common/loader.gif',
		container: window,
		loadQueue: [],
		isStatic: true,
		onImageLoad: function(){}
	},
	pageDom: function(target){
		if(typeof target == 'string'){
			target = document.getElementById(target);
		}
		if (!target) {
			return null;
		}
		var left = 0, top = 0;
		do {
			left += target.offsetLeft || 0;
			top += target.offsetTop || 0;
			target = target.offsetParent;
		} while (target);
		return {
			left: left,
			top: top
		};
	},
	getScroll: function(){
		var scrollx, scrolly;
		if (typeof(window.pageXOffset) == 'number') {
			scrollx = window.pageXOffset;
			scrolly = window.pageYOffset;
		} else {
			scrollx = document.documentElement.scrollLeft;
			scrolly = document.documentElement.scrollTop;
		}
		return {left: scrollx, top: scrolly};
	},
	isResizing : false,
	init: function(option){
		var self =  this;
		for(var key in option){
			this.options[key] = option[key];
		}
		var elements = LazyLoad.options.elements;
		var visiableHeight = jQuery(window).height() + this.options.range;
		for(var i = 0, len = elements.length; i < len; i++){
			var img = elements[i];
			var pagedom = LazyLoad.pageDom(img);
			if(!img.getAttribute('realsrc'))
				continue;
			jQuery(img).load(function(e){
				self.options.onImageLoad({img: this});
			});
			if(pagedom.top > visiableHeight || !jQuery(img).is(':visible')){
				img.ly = pagedom.top;
				//if(pagedom.top > visiableHeight)
					this.options.loadQueue.push(img);
			}else{
				img.src = img.getAttribute('realsrc');
				img.removeAttribute('realsrc');
			}
		}
		
		setTimeout(function(){self.doload();}, 10);
		jQuery(this.options.container).bind('scroll', function(e){self.doload(e)});
		jQuery(this.options.container).bind('resize', function(e){self.resizeEvent(e)});
	},
	resizeEvent: function(){
		if(!LazyLoad.isResizing){
			LazyLoad.doload();
			LazyLoad.isResizing == true;
			LazyLoad.resizeTimer = setTimeout(function(){LazyLoad.isResizing = false;}, 500);
		}
	},
	doload: function(){
		var images = LazyLoad.options.loadQueue;
		var picCount = images.length;
		if(picCount > 0){
			var scrollY = LazyLoad.getScroll().top;
			var visibleHeight = scrollY + jQuery(window).height() + LazyLoad.options.range;
			for(var i = 0; i < picCount; i++){
				var img = images[i];
				if(!img) {
					continue;
				}
				var picCount = images.length;
				if(!this.options.isStatic){
					var pagedom = this.pageDom(img);
					img.ly = pagedom.top;
				}
				if(img.ly < visibleHeight && jQuery(img).is(':visible')){
					if(img.getAttribute('realsrc')){
						img.src = img.getAttribute('realsrc');
						img.removeAttribute('realsrc');
					}
					
					images.splice(i, 1);
				}
			}
		}else{
			jQuery(LazyLoad.options.container).unbind('scroll', this.doload);
			jQuery(LazyLoad.options.container).unbind('resize', this.resizeEvent);
		}
	},
	loadImages: function(images){
		for(var i = 0, len = images.length; i < len; i++){
			var img = images[i];
			if(!img.getAttribute('realsrc')){
				continue;
			}
			img.src = img.getAttribute('realsrc');
			img.removeAttribute('realsrc');
		}
	}
}