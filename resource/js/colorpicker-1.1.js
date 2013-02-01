/*************************************
 作者：DK
 时间：2013年1月27日
 网址：http://www.dklogs.net
 电子邮箱：dukai86@gmail.com
 *************************************/

(function(window){




var AbstractColorPikcer = function(options){
	var self = this;
	self.currentTarget = null;
	self.colorCode = null;
	self.dom = {};

	self.options = {
		showNoColor: false,
		onshow: function(){},
		onclose: function(){},
		onconfirm: function(){},
		oncancel: function(){},
		onnocolor: function(){}
	};
	/**
	 * set color picker current target
	 * @param target
	 */
	self.setTarget = function(target){
		self.currentTarget = target;
	}
	/**
	 * initialize color picker
	 */
	self.init = function(){
		self.initOptions(options);
		self.currentTarget = null;
		self.colorCode = null;
		self.initUI();
		self.initEvents();
	};
	self.initOptions = function(options){
		self.options.showNoColor = false;
		self.options.onshow = function(){};
		self.options.onclose = function(){};
		self.options.onconfirm = function(){};
		self.options.oncancel = function(){};
		self.options.onnocolor = function(){};

		for(var key in options){
			self.options[key] = options[key];
		}
	};
	/**
	 * abstract method for UI init
	 */
	self.initUI = function(){
	};

	self.initEvents = function(){};

	self.show = function(){
		self.options.onshow();
	};

	self.close = function(){
		self.options.onclose();
	};
};
	/**
	 * ColorPicker Constructor
	 * @param options
	 * @constructor
	 */
var ColorPicker = function(options){
	var self = this;
	self.currentTarget = null;
	self.colorCode = null;
	self.hsv = {h: 0, s: 0, v: 1};
	self.rgb = {r: 255, g: 255, b: 255};
	self.dom = {};

	self.options = {
		showNoColor: false,
		onshow: function(){},
		onclose: function(){},
		onconfirm: function(){},
		oncancel: function(){},
		onnocolor: function(){}
	};
	self.setTarget = function(target){
		self.currentTarget = target;
	}
	self.init = function(){
		self.initOptions(options);
		self.currentTarget = null;
		self.colorCode = null;
		self.initUI();
		self.initEvents();
	};

	self.initOptions = function(options){
		self.options = {
			showNoColor: false,
			onshow: function(){},
			onclose: function(){},
			onconfirm: function(){},
			oncancel: function(){},
			onnocolor: function(){}
		};
		for(var key in options){
			self.options[key] = options[key];
		}
	};

	self.initUI = function(){
		//main box
		self.dom.main = dk.$c('div', null, 'dk_color_picker');
		self.dom.main.style.display = 'none';
		//header
		self.dom.header = dk.$c('h2');
		//color picker box
		self.dom.cpBox = dk.$c('div', null, 'c_p_c clearfix');
		self.dom.cpSV = dk.$c('div', null, 'c_p_sv');
		self.dom.cpSVPointer = dk.$c('span', null, 'c_p_pointer');
		self.dom.cpH = dk.$c('div', null, 'c_p_h');
		self.dom.cpHPointer = dk.$c('span', null, 'c_p_h_pointer');

		self.dom.cpSV.appendChild(self.dom.cpSVPointer);
		self.dom.cpH.appendChild(self.dom.cpHPointer);
		self.dom.cpBox.appendChild(self.dom.cpSV);
		self.dom.cpBox.appendChild(self.dom.cpH);

		self.dom.statusBox = dk.$c('div', null, 'c_p_status');
		self.dom.colorCode = dk.$c('span');
		self.dom.bgColor = dk.$c('span');
		self.dom.bgColor.innerHTML = '&nbsp;';
		self.dom.fontColor = dk.$c('span');
		self.dom.fontColor.innerHTML = '文字';

		self.dom.statusBox.appendChild(self.dom.colorCode);
		self.dom.statusBox.appendChild(self.dom.bgColor);
		self.dom.statusBox.appendChild(self.dom.fontColor);

		self.dom.btnBox = dk.$c('div', null, 'cp_btn_box');
		self.dom.btnNoColor = dk.$c('button', null, 'btn');
		self.dom.btnNoColor.setAttribute('type', 'button');
		self.dom.btnNoColor.innerHTML = '无颜色';

		self.dom.btnConfirm = dk.$c('button', null, 'btn');
		self.dom.btnConfirm.setAttribute('type', 'button');
		self.dom.btnConfirm.innerHTML = '确定';
		self.dom.btnCancel = dk.$c('button', null, 'btn_gray');
		self.dom.btnCancel.setAttribute('type', 'button');
		self.dom.btnCancel.innerHTML = '取消';

		self.dom.btnBox.appendChild(self.dom.btnNoColor);
		self.dom.btnBox.appendChild(self.dom.btnConfirm);
		self.dom.btnBox.appendChild(self.dom.btnCancel);

		self.dom.main.appendChild(self.dom.header);
		self.dom.main.appendChild(self.dom.cpBox);
		self.dom.main.appendChild(self.dom.statusBox);
		self.dom.main.appendChild(self.dom.btnBox);
		window.document.body.appendChild(self.dom.main);
	};

	self.initEvents = function(){
		dk.addEvent(self.dom.cpSV, 'click', function(e){
			self.setSVPointer(e);
		});

		dk.addEvent(self.dom.cpH, 'click', function(e){
			self.setHPointer(e);
		});

		dk.addEvent(self.dom.btnNoColor, 'click', function(e){
			self.options.onnocolor();
			if(self.currentTarget.tagName.toLowerCase() == 'input' && self.currentTarget.type == 'text'){
				self.currentTarget.value = '';
			}
			self.close();
		});

		dk.addEvent(self.dom.btnConfirm, 'click', function(e){
			self.options.onconfirm();
			if(self.currentTarget.tagName.toLowerCase() == 'input' && self.currentTarget.type == 'text'){
				self.currentTarget.value = self.getColorCode(self.hsv);
			}
			self.close();
		});

		dk.addEvent(self.dom.btnCancel, 'click', function(e){
			self.options.oncancel();
			self.close();
		});

		dk.addEvent(window.document, 'click', function(e){
			if(e.target != self.dom.main && !dk.contains(self.dom.main, e.target) && e.target != self.currentTarget){
				self.close();
			}
		});
	};

	self.show = function(left, top){
		self.options.onshow();
		if(self.options.showNoColor){
			self.dom.btnNoColor.style.display = 'inline-block';
		}else{
			self.dom.btnNoColor.style.display = 'none';
		}
		dk.$$(self.dom.main).css({left:left+'px',top: top + 'px',display:'block'});
	};

	self.close = function(){
		self.options.onclose();
		self.dom.main.style.display = 'none';
	};

	self.getColorCode = function(hsv){
		var rgb = utils.hsv2rgb(hsv.h, hsv.s, hsv.v);
		return '#' + utils.convert2Hexa(rgb.r) + utils.convert2Hexa(rgb.g) + utils.convert2Hexa(rgb.b);
	};

	self.setStatus = function(colorCode){
		self.dom.colorCode.innerHTML = colorCode;
		self.dom.bgColor.style.backgroundColor = colorCode;
		self.dom.fontColor.style.color = colorCode;
	};

	self.setSVPointer = function(e){
		var relativeX = dk.pageMouse(e).x - dk.pageDom(self.dom.cpSV).left;
		var relativeY = dk.pageMouse(e).y - dk.pageDom(self.dom.cpSV).top;
		self.hsv.s = relativeX / 255;
		self.hsv.v = (255 - relativeY) / 255;
		var colorCode = self.getColorCode(self.hsv);

		self.dom.cpSVPointer.style.left = (relativeX - 8) + 'px';
		self.dom.cpSVPointer.style.top = (relativeY - 8) + 'px';

		self.setStatus(colorCode);
	};

	self.setHPointer = function(e){
		var relativeX = dk.pageMouse(e).x - dk.pageDom(self.dom.cpH).left;
		var relativeY = dk.pageMouse(e).y - dk.pageDom(self.dom.cpH).top;
		self.hsv.h = (255 - relativeY) / 255;
		self.dom.cpHPointer.style.top = (relativeY - 4) + 'px';
		self.dom.cpSV.style.backgroundColor = self.getColorCode({h:self.hsv.h, s:1, v:1});
		var colorCode = self.getColorCode(self.hsv);
		self.setStatus(colorCode);
	};

	self.init();
};


var utils = ColorPicker.utils = {
	//h:色相，s:饱和度，v:亮度 http://www.easyrgb.com/
	hsv2rgb: function(h, s, v){
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
	//转换成16进制，如果不足两位则补零
	convert2Hexa: function(num){
		var num16 = num.toString(16);
		if(num16.length == 1){
			return '0' + num16;
		}else{
			return num16;
		}
	}
};

var SimpleColorPicker = function(options){
	var self = this;
	self.parent.__constructor(this, options);

	self.options.colors = [
		['#fff', '#eee', '#ddd', '#ccc', '#bbb', '#aaa'],
		['#000', '#666', '#444', '#333', '#222', '#111'],
		['#fcc', '#f99', '#f66', '#f33', '#f00', '#c00'],
		['#f90', '#fc9', '#f96', '#f93', '#c60', '#930'],
		['#ff0', '#ffc', '#ff9', '#ff6', '#ff3', '#cc0'],
		['#0f0', '#cfc', '#9f9', '#6f6', '#0c0', '#090'],
		['#00f', '#cff', '#9cf', '#39f', '#06f', '#06c'],
		['#60f', '#ccf', '#c9f', '#96f', '#93f', '#60c'],
		['#f0f', '#fcf', '#f9f', '#f6f', '#f3f', '#c0c']
	];

	self.initUI = function(){
		self.dom.main = dk.$c('div', null, 'simple_color_picker');
		self.dom.main.style.display = 'none';
		self.dom.header = dk.$c('div', null, 'cp_header');
		self.dom.header.innerHTML = '选择颜色';
		self.dom.box = dk.$c('div', null, 'cp_box');
		for(var i = 0, iLen = self.options.colors.length; i < iLen; i++){
			var ul = dk.$c('ul');
			for(var j = 0, jLen = self.options.colors[i].length; j < jLen; j++){
				var li = dk.$c('li');
				li.style.backgroundColor = self.options.colors[i][j];
				ul.appendChild(li);
			}
			self.dom.box.appendChild(ul);
		}

		self.dom.footer = dk.$c('div', null, 'cp_footer');
		self.dom.btnNoColor = dk.$c('button', null, 'btn');
		self.dom.btnNoColor.setAttribute('type', 'button');
		self.dom.btnNoColor.innerHTML = '无颜色';
		self.dom.footer.appendChild(self.dom.btnNoColor);

		self.dom.main.appendChild(self.dom.header);
		self.dom.main.appendChild(self.dom.box);
		self.dom.main.appendChild(self.dom.footer);
		window.document.body.appendChild(self.dom.main);
	};

	self.initEvents = function(){};

	self.show = function(left, top){
		self.parent.show();
		if(self.options.showNoColor){
			self.dom.btnNoColor.style.display = 'inline-block';
		}else{
			self.dom.btnNoColor.style.display = 'none';
		}
		dk.$$(self.dom.main).css({left:left+'px',top: top + 'px',display:'block'});
	};

	self.close = function(){
		self.parent.close();
		self.dom.main.style.display = 'none';
	};

	self.init();
	self.options.showNoColor = true;
};

dk.extend(SimpleColorPicker, AbstractColorPikcer);

window.ColorPicker = ColorPicker;
window.SimpleColorPicker = SimpleColorPicker;
!dk && (dk = {});
var cp = null;
var inputOptions = {};
dk.colorpicker = function(input, options){
	var guid = dk.$$(input).getGuid();
	inputOptions[guid] = options;


	dk.addEvent(input, 'click', function(e){
		var options = inputOptions[dk.$$(this).getGuid()];
		dk.getColorPicker(options).setTarget(this);
		var position = dk.pageDom(this);
		cp.show(position.left, position.top + dk.$$(this).height());
	});
};
dk.getColorPicker = function(options){
	if(cp == null){
		cp = new ColorPicker(options);
	}else{
		cp.initOptions(options);
	}

	return cp;
};
})(window);