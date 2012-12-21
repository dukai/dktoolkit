/*************************************
 作者：DK
 时间：2010年9月11日
 编辑：9.13,9.14
 网址：http://www.dklogs.net
 电子邮箱：xiaobaov2@gmail.com
 *************************************/
var $$ = dk.$$;
var colorPicker = {
	currentInput:null,
	colorCode:null,
	callBackFuncs:[],
	hsv:{h:0,s:0,v:1},
	rgb:{r:255,g:255,b:255},
	setInputs:function(inputs){
		var setInputValue = function(e){
			colorPicker.render(dk.pageDom(this).left, dk.pageDom(this).top + $$(this).height());
			colorPicker.currentInput = this;
			colorPicker.callBackFuncs.length = 0;
			colorPicker.callBackFuncs.push(colorPicker.setColorCode);
		}
		for(var i = 0, len = inputs.length; i < len; i++){
			dk.addEvent(dk.$(inputs[i]),'click',setInputValue);
		}
	},
	init:function(){
		this.currentInput = null;
		this.colorCode = null;
		this.callBackFuncs.length = 0;
	},
	pickerDoms:{
		mainC:null,//color_picker container
		header:null,//header
		cpC:null,//color picker hsv container
		cpSV:null,//color picker sv container
		cpSVP:null,//color picker sv pointer
		cpH:null,//color picker h container
		cpHP:null,//color picker h pointer
		cpStatus:null,// color picker status
		cpColorCode:null,//current selected color code
		cpBgColor:null,//current selected color show as background
		cpFontColor:null,//current selected color show as font color
		cpBtnConfirm:null,// the confirm button
		cpBtnCancel:null//thie cancel button
	},
	eles:{
		div:document.createElement('DIV'),
		h2:document.createElement('H2'),
		span:document.createElement('SPAN'),
		input:document.createElement('INPUT')
	},
	initDom:function(){//initialization the color picker doms
		var mainC = this.pickerDoms.mainC = this.eles.div.cloneNode(true);
		mainC.setAttribute('id', 'dk_color_picker');
		var header = this.pickerDoms.header = this.eles.h2.cloneNode(true);
		var cpC = this.pickerDoms.cpC = this.eles.div.cloneNode(true);
		cpC.className = 'c_p_c clearfix';
		var cpSV = this.pickerDoms.cpSV = this.eles.div.cloneNode(true);
		cpSV.className = 'c_p_sv';
		var cpSVP = this.pickerDoms.cpSVP = this.eles.span.cloneNode(true);
		cpSVP.className = 'c_p_pointer';
		cpSV.appendChild(cpSVP);
		var cpH = this.pickerDoms.cpH = this.eles.div.cloneNode(true);
		cpH.className = 'c_p_h';
		var cpHP = this.pickerDoms.cpHP = this.eles.span.cloneNode(true);
		cpHP.className = 'c_p_h_pointer';
		cpH.appendChild(cpHP);
		cpC.appendChild(cpSV);
		cpC.appendChild(cpH);
		//handle the status doms
		var cpStatus = this.pickerDoms.cpStatus = this.eles.div.cloneNode(true);
		cpStatus.className = 'c_p_status';
		var cpColorCode = this.pickerDoms.cpColorCode = this.eles.span.cloneNode(true);
		var cpBgColor = this.pickerDoms.cpBgColor = this.eles.span.cloneNode(true);
		cpBgColor.innerHTML = '&nbsp;';
		var cpFontColor = this.pickerDoms.cpFontColor = this.eles.span.cloneNode(true);
		cpFontColor.innerHTML = '选定的颜色';
		var cpBtnConfirm = this.pickerDoms.cpBtnConfirm = this.eles.input.cloneNode(true);
		cpBtnConfirm.setAttribute('type','button');
		cpBtnConfirm.setAttribute('value','确定');
		var cpBtnCancel = this.pickerDoms.cpBtnCancel = this.eles.input.cloneNode(true);
		cpBtnCancel.setAttribute('type','button');
		cpBtnCancel.setAttribute('value','取消');
		cpStatus.appendChild(cpColorCode);
		cpStatus.appendChild(cpBgColor);
		cpStatus.appendChild(cpFontColor);
		cpStatus.appendChild(cpBtnConfirm);
		cpStatus.appendChild(cpBtnCancel);
		mainC.appendChild(header);
		mainC.appendChild(cpC);
		mainC.appendChild(cpStatus);
		document.body.appendChild(mainC);
	},
	initEvent:function(){
		dk.addEvent(this.pickerDoms.cpSV, 'click', colorPicker.setSVPointer);
		dk.addEvent(this.pickerDoms.cpH, 'click', colorPicker.setHPointer);
		dk.addEvent(this.pickerDoms.cpBtnConfirm,'click',colorPicker.confirmBtnEvent);
		dk.addEvent(this.pickerDoms.cpBtnCancel,'click',colorPicker.cancelBtnEvent);
	},
	render:function(left, top){
		this.init();
		if(!colorPicker.pickerDoms.mainC ){
			this.initDom();
			this.initEvent();
		}		
		$$(colorPicker.pickerDoms.mainC).css({left:left+'px',top: top + 'px',display:'block'});
	},
	hsv2rgb:function(h, s, v){//h:色相，s:饱和度，v:亮度 http://www.easyrgb.com/
		var r, g, b;
		if (s == 0) {
			r = v * 255;
			g = v * 255;
			b = v * 255;
		}
		else {
			var tempH = h * 6;
			if (tempH == 6) {
				tempH = 0;
			}
			tempI = Math.floor(tempH);
			temp_1 = v * (1 - s);
			temp_2 = v * (1 - s * (tempH - tempI));
			temp_3 = v * (1 - s * (1 - (tempH - tempI)));
			switch (tempI) {
				case 0:
					r = v;
					g = temp_3;
					b = temp_1;
					break;
				case 1:
					r = temp_2;
					g = v;
					b = temp_1;
					break;
				case 2:
					r = temp_1;
					g = v;
					b = temp_3;
					break;
				case 3:
					r = temp_1;
					g = temp_2;
					b = v;
					break;
				case 4:
					r = temp_3;
					g = temp_1;
					b = v;
					break;
				default:
					r = v;
					g = temp_1;
					b = temp_2;
					break;
			}
			r = r * 255;
			b = b * 255;
			g = g * 255;
		}
		return {
			r: Math.ceil(r),
			g: Math.ceil(g),
			b: Math.ceil(b)
		};
	},
	getColorCode:function(hsv){//json格式{h,s,v}
		var rgb = this.hsv2rgb(hsv.h, hsv.s, hsv.v);
		function getPerColor(num){
			var num16 = num.toString(16);
			if(num16.length == 1){
				return '0' + num16;
			}else{
				return num16;
			}
		}
		return '#' + getPerColor(rgb.r) + getPerColor(rgb.g) + getPerColor(rgb.b);
	},
	setColorCode:function(){
		colorPicker.currentInput.value = colorPicker.colorCode;
	},
	execCallBack:function(){
		for(var i = 0, len = colorPicker.callBackFuncs.length; i < len; i++){
			colorPicker.callBackFuncs[i]();
		}
	},
	confirmBtnEvent:function(e){
		colorPicker.colorCode = colorPicker.getColorCode(colorPicker.hsv);
		//colorPicker.currentInput && colorPicker.setColorCode();
		//colorPicker.callBackStatus && colorPicker.excuteCallBack();
		if(colorPicker.callBackFuncs.length > 0){
			colorPicker.execCallBack();
		}
		colorPicker.dispose();
	},
	cancelBtnEvent:function(e){
		colorPicker.dispose(true);
	},
	dispose:function(){//待改进
		if(arguments.length == 1 && arguments[0] == true){
			colorPicker.pickerDoms.mainC.parentNode.removeChild(colorPicker.pickerDoms.mainC);
			colorPicker.disposeDomRef();
		}else{
			colorPicker.pickerDoms.mainC.style.display = 'none';
		}
	},
	disposeDomRef:function(){
		colorPicker.pickerDoms.mainC = null;//color_picker container
		colorPicker.pickerDoms.header = null,//header
		colorPicker.pickerDoms.cpC = null,//color picker hsv container
		colorPicker.pickerDoms.cpSV = null,//color picker sv container
		colorPicker.pickerDoms.cpSVP = null,//color picker sv pointer
		colorPicker.pickerDoms.cpH = null,//color picker h container
		colorPicker.pickerDoms.cpHP = null,//color picker h pointer
		colorPicker.pickerDoms.cpStatus = null,// color picker status
		colorPicker.pickerDoms.cpColorCode = null,//current selected color code
		colorPicker.pickerDoms.cpBgColor = null,//current selected color show as background
		colorPicker.pickerDoms.cpFontColor = null,//current selected color show as font color
		colorPicker.pickerDoms.cpBtnConfirm = null,// the confirm button
		colorPicker.pickerDoms.cpBtnCancel = null//thie cancel button
	},
	setSVPointer:function(e){
		var relativeX = dk.pageMouse(e).x - dk.pageDom(colorPicker.pickerDoms.cpSV).left;
		var relativeY = dk.pageMouse(e).y - dk.pageDom(colorPicker.pickerDoms.cpSV).top;
		colorPicker.hsv.s = relativeX / 255;
		colorPicker.hsv.v = (255 - relativeY) / 255;
		var colorCode = colorPicker.getColorCode(colorPicker.hsv);
		
		colorPicker.pickerDoms.cpSVP.style.left = (relativeX - 8) + 'px';
		colorPicker.pickerDoms.cpSVP.style.top = (relativeY - 8) + 'px';
		
		colorPicker.setStatus(colorCode);
	},
	setHPointer:function(e){
		var relativeX = dk.pageMouse(e).x - dk.pageDom(colorPicker.pickerDoms.cpH).left;
		var relativeY = dk.pageMouse(e).y - dk.pageDom(colorPicker.pickerDoms.cpH).top;
		colorPicker.hsv.h = (255 - relativeY) / 255;
		colorPicker.pickerDoms.cpHP.style.top = (relativeY - 4) + 'px';
		colorPicker.pickerDoms.cpSV.style.backgroundColor = colorPicker.getColorCode({h:colorPicker.hsv.h, s:1, v:1});
		var colorCode = colorPicker.getColorCode(colorPicker.hsv);
		colorPicker.setStatus(colorCode);
	},
	setStatus:function(colorCode){
		colorPicker.pickerDoms.cpColorCode.innerHTML = colorCode;
		colorPicker.pickerDoms.cpBgColor.style.backgroundColor = colorCode;
		colorPicker.pickerDoms.cpFontColor.style.color = colorCode;
	}
}