var PhotoExplorer = function(options){
	var self = this;
	
	self.options = {
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
	};
	
	
	self.init = function(){
		
	};
	
	self.initUI = function(){
		
	};
};