var SCPhotoAlbum = function(containerId, thumbsId, showContainerId, configs){
	this.configs = {
		thumbWidth: 68,//单个图片算上padding,margin,border和图片本身宽度的总值
		thumbsWidth: 680,//可显示范围内的总宽度
		showWidth: 718,//显示的最大宽度
		showHeight: 800,//显示的最大高度
		thumbPrefix: 'img_',//缩略图中li的id的前缀名称
		selectedClass: 'selected',//选中的高亮class名称
		middleurl: 'middleurl',//中型图片地址
		bigurl: 'bigurl',//原图地址
		photoGallaryPre: 'pg_pre',//缩略图行的左向滚动的标签class名称
		photoGallaryNext: 'pg_next',//缩略图行的右向滚动的标签class名称
		photoShowPre: 'ps_pre',//大图行的左向滚动的标签class名称
		photoShowNext: 'ps_next',//大图行的右向滚动的标签class名称
		thumb: 'thumb',//缩略图片的容器li的class名称
		photoGallaryBtnDisable: 'disable',//当前不可点击的上一屏下一屏的class名称
		imgInfo: 'img_info'
	}
	this.cursor = 0;
	this.containerId = containerId;
	this.thumbsId = thumbsId;
	this.showContainerId = showContainerId;
	this.total = $('#' + thumbsId + ' li').length;
	this.isRunning = false;
	this.initialize(configs);
};

SCPhotoAlbum.prototype = {
	initialize: function(configs){
		if(configs){
			for(var i in configs){
				this.configs[i] = configs[i];
			}
		}
		this.showThumbCount = parseInt(this.configs.thumbsWidth / this.configs.thumbWidth);
		this.maxOffset = (this.total - this.showThumbCount) * this.configs.thumbWidth;
		//$('.' + this.configs.photoShowNext).hide();
		//$('.' + this.configs.photoShowPre).hide();
		this.checkGallaryBtnsStatus();
		this.initDom();
		this.initEvent();
	},
	initDom: function(){
		$('#' + this.configs.imgInfo).css('display', 'none');
		this.show(0);
		$('#' + this.thumbsId).css({'width': this.configs.thumbWidth * this.total, left: 0});
		
	},
	initEvent: function(){
		$('#' + this.containerId).click(dk.bind(this,this.eventDelegate));
		/*
		*/
	},
	eventDelegate: function(e){
		if(this.isRunning){
			return;
		}
		var target = e.target;
		if(target.className == this.configs.photoGallaryPre){
			this.gallaryPre(5);
		}else if(target.className == this.configs.photoGallaryNext){
			this.gallaryNext(5);
		}else if(target.className == this.configs.photoShowPre){
			this.preview();
		}else if(target.className == this.configs.photoShowNext){
			this.next();
		}else if(dk.tagName(target) == 'img' && $(target.parentNode).hasClass(this.configs.thumb) || dk.tagName(target) == 'li' && $(target).hasClass(this.configs.thumb)){
			if(dk.tagName(target) == 'img'){
				target = target.parentNode;
			}
			var currId = target.id;
			currId = parseInt(currId.replace(this.configs.thumbPrefix, ''));
			if(currId == this.cursor){
				return;
			}
			$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
			//dk.logs.write('#' + this.configs.thumbPrefix + this.cursor + "'s selected class name has been removed and next " + currId + ' will be displayed');
			this.show(currId);
			this.cursor = currId;
		}
		this.isRunning = false;
	},
	gallaryPre: function(step){
		var value,
			thumbWidth = this.configs.thumbWidth, 
			thumbsId = this.thumbsId, 
			currOffset = Math.abs(parseInt($('#' + thumbsId).css('left')));
		if(step){
			var moveOffset = thumbWidth * step;
			if(currOffset > moveOffset){
				value = '+=' + moveOffset + 'px';
			}else{
				value = '+=' + currOffset + 'px';
			}
			
		}else{
			value = '+=' + this.configs.thumbWidth + 'px';
		}
		
		if(parseInt($('#' + this.thumbsId).css('left')) >= 0)
			return;
		$('#' + this.thumbsId).animate({'left': value},'fast', 'linear', dk.bind(this, function(){
			this.isRunning = false;
			this.checkGallaryBtnsStatus();
		}));
		
	},
	gallaryNext: function(step){
		var value, 
			thumbWidth = this.configs.thumbWidth, 
			thumbsId = this.thumbsId, 
			currOffset = Math.abs(parseInt($('#' + thumbsId).css('left')));
		if(step){
			var moveOffset = thumbWidth * step;
			
			if(this.maxOffset - currOffset > moveOffset)
				value = '-=' + moveOffset + 'px';
			else{
				value = '-=' + (this.maxOffset - currOffset) + 'px';
			}
		}else{
			value = '-=' + thumbWidth + 'px';
		}
		if(parseInt($('#' + thumbsId).css('left')) <= -(thumbWidth * this.total - this.configs.thumbsWidth)){
			return;
		}
		$('#' + thumbsId).animate({'left': value}, 'fast', "linear", dk.bind(this, function(){
			this.isRunning  =false;
			this.checkGallaryBtnsStatus();
		}));
		
	},
	checkGallaryBtnsStatus: function(){
		var left = parseInt($('#' + this.thumbsId).css('left'));
		if(this.total <= this.showThumbCount){
			$('#' + this.configs.photoGallaryPre).addClass(this.configs.photoGallaryBtnDisable);
			$('#' + this.configs.photoGallaryNext).addClass(this.configs.photoGallaryBtnDisable);
			return;
		}
		if(left >= 0){
			$('#' + this.configs.photoGallaryPre).addClass(this.configs.photoGallaryBtnDisable);
		}else{
			$('#' + this.configs.photoGallaryPre).removeClass(this.configs.photoGallaryBtnDisable);
		}
		
		if(this.configs.thumbWidth * this.total - Math.abs(left) <= this.configs.thumbsWidth){
			$('#' + this.configs.photoGallaryNext).addClass(this.configs.photoGallaryBtnDisable);
		}else{
			$('#' + this.configs.photoGallaryNext).removeClass(this.configs.photoGallaryBtnDisable);
		}
	},
	next: function(){
		$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
		var left = $('#' + this.configs.thumbPrefix + this.cursor)[0].offsetLeft + parseInt($('#' + this.thumbsId).css('left'));
		if(left >= this.configs.thumbWidth * (this.showThumbCount - 1)){
			if(this.cursor != this.total - 1){
				this.gallaryNext();
			}else{
				this.gallaryPre(this.total - this.showThumbCount);
			}
		}
		if(this.cursor >= this.total - 1){
			this.cursor = 0;
		}else{
			this.cursor ++;
		}
		this.show(this.cursor);
	},
	preview: function(){
		$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
		var left = $('#' + this.configs.thumbPrefix + this.cursor)[0].offsetLeft + parseInt($('#' + this.thumbsId).css('left'));
		if(left <= 0){
			if(this.cursor != 0){
				this.gallaryPre();
			}else{
				this.gallaryNext(this.total - this.showThumbCount);
			}
		}
		if(this.cursor <= 0){
			this.cursor = this.total - 1;
		}else{
			this.cursor --;
		}
		this.show(this.cursor);
	},
	show: function(cursor){
		$('#' + this.configs.thumbPrefix + cursor).addClass(this.configs.selectedClass);
		$('#photo_big_url').attr('href', $('#' + this.configs.thumbPrefix + cursor + ' img').attr('bigurl'));
		
		var info = $('#' + this.configs.thumbPrefix + cursor + ' img').attr('info'),
			exif = $('#' + this.configs.thumbPrefix + cursor + ' img').attr('exif');
			
		if(info || exif){
			$('#' + this.configs.imgInfo).css('display', 'block');
			var infoStr = '';
			if (info) {
				infoStr = info;
			}
			if (exif) {
				infoStr += "<br />" + exif;
			}
			$('#' + this.configs.imgInfo).html(infoStr);
		}else{
			$('#' + this.configs.imgInfo).css('display', 'none');
		}
		
		var tempImg = new Image();
		
		var that = this;
		//dk.logs.write('begin load');
		tempImg.onload = function(){
			//dk.logs.write('complete');
			this.onload = null;
			$('#big_img').css('margin-top', - tempImg.height / 2);
			$('#big_img').attr('src', tempImg.src);
			this.isRunning = false;
			tempImg = null;
		}
		tempImg.src = $('#' + this.configs.thumbPrefix + cursor + ' img').attr('middleurl');
		this.isRunning = false;
	},
	canNext: function(){},
	cantNext: function(){}
};