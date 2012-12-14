var ScrollImage = function(containerId, config){
	this.config = {
		extendWidth: 6, //除图片外所有的额外宽度
		interval: 30, //单位为ms
		step: 1, //每次移动的距离，单位px
		imgWidth: 140
	};
	this.containerId = containerId;
	this.containerDom = null;
	this.itemsCount = -1;
	this.init(containerId, config)
};
ScrollImage.prototype = {
	 init: function(containerId, config){
		if(config){
			for(var key in config){
				this.config[key] = config[key];
			}
		}
		this.containerDom = this.g(containerId);
		this.containerDom.style.position = 'relative';
		this.containerDom.style.overflow = 'hidden';
		imgs = this.containerDom.getElementsByTagName('img');
		this.imgsCount = imgs.length;
		this.initDom(imgs);
		this.initEvents();
		this.play();
	 },
	 initDom: function(imgs){
		var totalWidth = 0;
		for(var i = 0, len = imgs.length; i < len; i++){
			if(this.config.imgWidth){
				totalWidth +=  this.config.imgWidth + this.config.extendWidth;
			}else{
				totalWidth += parseInt(imgs[i].width) + this.config.extendWidth;
			}
		}
		this.totalWidth = totalWidth;
		this.orgiDom = this.containerDom.getElementsByTagName('ul')[0];
		this.copyDom = this.orgiDom.cloneNode(true);
		if(this.orgiDom.id){
			this.copyDom.id += '_copy';
		}
		this.containerDom.appendChild(this.copyDom);
		$(this.orgiDom).css({width: totalWidth, position: 'absolute', top: 0, left: 0});
		$(this.copyDom).css({width: totalWidth, position: 'absolute', top: 0, left: totalWidth});
	 },
	 initEvents: function(){
		$(this.containerDom).hover(this.bind(this, this.pause), this.bind(this, this.play));
	 },
	 play: function(){
		if(!this.timer){
			this.timer = setInterval(this.bind(this, this.animateStep), this.config.interval);
		}
	 },
	 pause: function(){
		clearInterval(this.timer);
		this.timer = null;
	 },
	 animateStep: function(){
		var container = this.containerDom;
		if(container.scrollLeft < this.totalWidth){
			container.scrollLeft += this.config.step;
		}else{
			container.scrollLeft = 0;
		}
	 },
	 g: function(s){
		return document.getElementById(s);
	 },
	 bind: function(targetObj, func) {
		var args = Array.prototype.slice.call(arguments).slice(2);
		return function () {
			return func.apply(targetObj, args.concat(Array.prototype.slice.call(arguments)));
		}
	 }
};
