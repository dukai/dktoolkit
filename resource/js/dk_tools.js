/*************************************
 author     : DK
 createDate : 2010.1.1
 editDate   : 2010.8.1,2010.8.16,2010.9.3,2010.9.10,2010.9.30, 2010.12.6, 2010.12.14, 2010.12.16, 2010.12.17
 blog       : http://www.dklogs.net
 email      : xiaobaov2@gmail.com
 *************************************/
(

function (win) {
    var dk = {};
    //根据ID获取对象

    var $ = function() {
        if (typeof(arguments[0]) == 'string') {
            if (document.getElementById(arguments[0])) {
                return document.getElementById(arguments[0]);
            } else {
                //throw "unknow element";
                return null;
            }
        } else {
            return arguments[0];
        }
    }

    dk.$ = $;

    //create element by tag name
	var eles = {
		div: document.createElement('div'),
		ul: document.createElement('ul'),
		li: document.createElement('li'),
		span: document.createElement('span'),
		p: document.createElement('p'),
		a: document.createElement('a'),
		fragment: document.createDocumentFragment(),
		input: document.createElement('input')
	}
	var $c = function(tagName, id, className){
		var ele = null;
		if(!eles[tagName]){
			eles[tagName] = document.createElement(tagName);
			ele = eles[tagName].cloneNode(true);
		}else{
			ele = eles[tagName].cloneNode(true);
		}
		if(id){
			ele.id = id;
		}
		if(className){
			ele.className = className;
		}
		return ele;
	};

    dk.$c = $c;
	
	var supportProperty = function(nodeType, property){
		switch(arguments.length){
			case 0:
				return false;
			case 1:
				var property = nodeType, nodeType = 'div';
				property = property.split('.');
				
				if(property.length == 1){
					return typeof eles[nodeType][property[0]] !== 'undefined';
				}else if(property.length == 2){
					return typeof eles[nodeType][property[0]][property[1]] !== 'undefined';
				}
			case 2:
				property = property.split('.');
				
				if(property.length == 1){
					return typeof eles[nodeType][property[0]] !== 'undefined';
				}else if(property.length == 2){
					return typeof eles[nodeType][property[0]][property[1]] !== 'undefined';
				}
				
				return false;
				
				
			default:
				return false;
		}
	};
	
	dk.supportProperty = supportProperty;
	
    var browserMatch = dk.browserMatch = (function (ua) {
        ua = navigator.userAgent.toLowerCase();
        var match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    })();
    dk.browser = {};
    if (browserMatch.browser) {
        dk.browser[browserMatch.browser] = true;
        dk.browser.version = browserMatch.version;
    }
    //根据Class名称获取对象

    var getElementsByClassName = function(className, tag, parent) {
        parent = parent || document;
		if (!(parent = $(parent))) {
            return false;
        }
		tag = tag || '*';
		if(document.getElementsByClassName){
			var nodes = parent.getElementsByClassName(className);
			var matchingNodes = [];
			if(tag !== '*'){
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].tagName == tag.toUpperCase()){
						matchingNodes.push(nodes[i]);
					}
				}
				
				return matchingNodes;
			}
			
			return nodes;
			
		}
		
        
        var allTags = (tag == '*' && parent.all) ? parent.all : parent.getElementsByTagName(tag);
        var matchingElements = new Array();
        className = className.replace(/\-/g, '\\-');
        var regex = new RegExp('(^|\\s)' + className + '(\\s|$)');
        var element;
        for (var i = 0, length = allTags.length; i < length; i++) {
            element = allTags[i];
            if (regex.test(element.className)) {
                matchingElements.push(element);
            }
        }
        return matchingElements;
    }

    dk.getElementsByClassName = getElementsByClassName;
	//绑定事件
    var addEvent = function(node, type, listener) {
		var customEvents = {'fover': 'mouseover', 'fout': 'mouseout'};
        if (typeof(node) == 'string') {
            node = $(node);
        }
        if (!listener.$$guid) {
            listener.$$guid = addEvent.guid++;
        }
        if (!node.events) {
            node.events = {};
        }
        var handlers = node.events[type],
            isRegisted = !! node.events[type];
        if (!handlers) {
            handlers = node.events[type] = {};
        }
        handlers[listener.$$guid] = listener;
        if (!isRegisted) {
            if (node.addEventListener) {
				if(customEvents[type]){
					node.addEventListener(customEvents[type], handleEventFix, false);
				}else{
					node.addEventListener(type, handleEvent, false);
				}
            } else if (node.attachEvent) {
                var tempFunc;
				if(customEvents[type]){
					tempFunc = function () {
						handleEventFix.call(node, window.event);
					};
					type = customEvents[type];
				}else{
					tempFunc = function () {
						handleEvent.call(node, window.event);
					};
					
				}
                node.attachEvent('on' + type, tempFunc);
            } else {
                node['on' + type] = handleEvent;
            }
        }
    }

    addEvent.guid = 1;

    var removeEvent = function(node, type, handler) {
        if (node.events && node.events[type]) {
            delete node.events[type][handler.$$guid];
        }
    }

    var handleEvent = function(event) {
        var returnValue = true;
        event = event || window.event;
        event = fixEvent(event, this);
        var handlers = this.events[event.type];
        for (var i in handlers) {
            this.$$handleEvent = handlers[i];
            if (this.$$handleEvent(event) === false) {
                returnValue = false;
            }
        }
        return returnValue;
    }
	
	var handleEventFix = function(event) {
        var returnValue = true;
        event = event || window.event;
        event = fixEvent(event, this);
		var type = event.type.replace('mouse', 'f');
        var handlers = this.events[type];
        for (var i in handlers) {
            this.$$handleEvent = handlers[i];
			if(checkHover(event, this)){
				if (this.$$handleEvent(event) === false) {
					returnValue = false;
				}
			}
        }
        return returnValue;
    }

    var fixEvent = function(event, currentTarget) {
        event.preventDefault || (event.preventDefault = fixEvent.preventDefault);
        event.stopPropagation || (event.stopPropagation = fixEvent.stopPropagation);
        event.target || (event.target = event.srcElement);
        event.currentTarget || (event.currentTarget = currentTarget);
        //event.x && (event.x = fixEvent.x);
        //event.y && (event.y = fixEvent.y);
        return event;
    }

    fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };
    dk.addEvent = addEvent;
    //移出绑定的事件
    dk.removeEvent = removeEvent;
    //绑定函数的执行对象

    var bind = function(targetObj, func) {
        var args = Array.prototype.slice.call(arguments).slice(2);
        return function () {
            return func.apply(targetObj, args.concat(Array.prototype.slice.call(arguments)));
        }
    }

    dk.bind = bind;
    //检查childNode是被包含在parentNode中

    var contains = function(parentNode, childNode) {
        return parentNode.contains ? parentNode != childNode && parentNode.contains(childNode) : !! (parentNode.compareDocumentPosition(childNode) & 16);
    }

    dk.contains = contains;
    //获取Event对象

    var getEvent = function(e) {
        return e || window.event;
    }

    dk.getEvent = getEvent;
    //停止冒泡

    var stopBubble = function(e) {
        getEvent(e).bubbles ? getEvent(e).stopPropagation() : getEvent(e).cancelBubble = true;
    }

    dk.stopBubble = stopBubble;
    //恢复冒泡

    var startBubble = function(e) {
        getEvent(e).initEvent ? getEvent(e).initEvent() : getEvent(e).cancelBubble = false;
    }

    dk.startBubble = startBubble;
    //检查mouseover和mouseout模式下取消事件派发

    var checkHover = function(e, target) {
        if (dk.getEvent(e).type == "mouseover") {
            return !contains(target, getEvent(e).relatedTarget || getEvent(e).fromElement) && !((getEvent(e).relatedTarget || getEvent(e).fromElement) === target);
        } else {
            return !contains(target, getEvent(e).relatedTarget || getEvent(e).toElement) && !((getEvent(e).relatedTarget || getEvent(e).toElement) === target);
        }
    }

    dk.checkHover = checkHover;
    //获取事件触发的对象

    function getEventTarget(e) {
        return dk.getEvent(e).target || dk.getEvent(e).srcElement;
    }

    dk.getEventTarget = getEventTarget;
    //获取窗口的大小

    var getBrowserSize = function() {
        var de = document.documentElement;
        return {
            width: (window.innerWidth || (de && de.clientWidth) || document.body.clientWidth),
            height: (window.innerHeight || (de && de.clientHeight) || document.body.clientHeight)
        }
    }

    dk.getBrowserSize = getBrowserSize;
    //获取对象在页面中的位置，返回值为值类型

    var getPositionInDoc = function(target, parent) {
        target = $(target)
        if (!target) {
            return null;
        }
        var left = 0,
            top = 0;
        do {
            left += target.offsetLeft || 0;
            top += target.offsetTop || 0;
            target = target.offsetParent;
			if(parent && target == parent){
				break;
			}
        } while (target);
        return {
            left: left,
            top: top
        };
    }
    dk.getPositionInDoc = getPositionInDoc;
    dk.pageDom = getPositionInDoc;
    //获取鼠标在Document中的位置，返回值为值类型

    var getMousePositionInDoc = function(e) {
        var scrollx, scrolly;
        if (typeof(window.pageXOffset) == 'number') {
            scrollx = window.pageXOffset;
            scrolly = window.pageYOffset;
        } else {
            scrollx = document.documentElement.scrollLeft;
            scrolly = document.documentElement.scrollTop;
        }
        return {
            x: e.clientX + scrollx,
            y: e.clientY + scrolly
        }
    }
    dk.getMousePositionInDoc = getMousePositionInDoc;
    dk.pageMouse = getMousePositionInDoc;
    //获取document的宽度和高度

    var getDocSize = function() {
		var body = document.body, docEle = document.documentElement;
		var bW = body.scrollWidth, eW = docEle.scrollWidth, bH = body.scrollHeight, eH = docEle.scrollHeight;
        return {
            width: bW < eW? eW : bW,
            height: bH < eH? eH : bH
        };
    }
    dk.getDocSize = getDocSize;
    //获取滚动条的top 和 left

    var getScroll = function() {
        var scrollx, scrolly;
        if (typeof(window.pageXOffset) == 'number') {
            scrollx = window.pageXOffset;
            scrolly = window.pageYOffset;
        } else {
            scrollx = document.documentElement.scrollLeft;
            scrolly = document.documentElement.scrollTop;
        }
        return {
            left: scrollx,
            top: scrolly
        };
    }

    dk.getScroll = getScroll;

    dk.now = (function () {
        return new Date();
    })();

    var tagName = function(target) {
        return target.tagName.toLowerCase();
    }
    dk.tagName = tagName;
    //根据给定的范围返回随机数

    var rand = function (m, n) {
        return Math.floor((n - m + 1) * Math.random() + m);
    }
    dk.rand = rand;
	
	var removeNode = function(target){
		target.parentNode.removeChild(target);
	}
	
	dk.removeNode = removeNode;
	
    //Dom加载完成事件

    var ready = function(loadEvent) {
        var init = function () {
            if (arguments.callee.done) return;
            arguments.callee.done = true;
            loadEvent.apply(document, arguments);
        };

        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', init, false);
        }

        if (/WebKit/i.test(navigator.userAgent)) {
            var _timer = setInterval(function () {
                if (/loaded|complete/.test(document.readyState)) {
                    clearInterval(_timer);
                    init();
                }
            }, 10)
        }


        /*@if(@_win32)*/
        document.write('<script id=__ie_onload defer src=javascript:void(0)><\/script>');
        var script = document.getElementById('__ie_onload');
        script.onreadystatechange = function () {
            if (this.readyState == 'complete') {
                init();
            }
        }; 
		/*@end @*/
        return true;
    }

    dk.ready = ready;

    var trim = function(str) {
        return (str || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
    }
    dk.trim = trim;
	
	var cookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			// CAUTION: Needed to parenthesize options.path and options.domain
			// in the following expressions, otherwise they evaluate to undefined
			// in the packed version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
	
	dk.cookie = cookie;
	
	var extend = function(subClass, baseClass){
		var parent = subClass.prototype.parent = {
			'__constructor': function(obj, args){
				baseClass.apply(obj, args);
			}
		};
		
		baseClass.call(parent);


		for(var method in baseClass.prototype){
			subClass.prototype[method] = parent[method] = baseClass.prototype[method];
		}
	};
	
	dk.extend = extend;
	
	var _$ = function (node) {
		if (typeof(node) == 'string') {
			node = dk.$(node);
		}
		this.node = node;
	};
	_$.prototype = {
		fixover: function (func) {
			dk.addEvent(this.node, 'mouseover', function (e) {
				if (dk.checkHover(e, this)) {
					func(e);
				}
			});
			return this;
		},
		fixout: function (func) {
			dk.addEvent(this.node, 'mouseout', function (e) {
				if (dk.checkHover(e, this)) {
					func(e);
				}
			});
			return this;
		},
		css: function (style, value) { //三个重载方法
			var argNum = arguments.length;
			if (argNum == 1 && typeof(arguments[0]) == 'string') { //按照参数中的样式表的样式名称获取样式的值
				return this.getCss(arguments[0]);
			} else if (argNum == 1 && typeof(arguments[0]) == 'object') { //按照参数中的Json对象设置样式
				var styles = arguments[0];
				for (var i in styles) {
					this.setCss(i, styles[i]);
				}
			} else if (argNum == 2) { //按照参数中的样式名称和值对指定样式进行设置
				this.setCss(arguments[0], arguments[1]);
			}
			return this;
		},
		getCss: function (styleName) {
			var value;
			if (this.node.currentStyle) {
				value = this.node.currentStyle[styleName];
				if (value == 'auto' && styleName == 'width') {
					value = this.node.clientWidth;
				}
				if (value == 'auto' && styleName == 'height') {
					value = this.node.clientHeight;
				}
				if (styleName == 'opacity' && this.supportFilter() && !this.supportOpacity()) {
					var opactiyRex = /opacity=(\d{1,3})/;
					var filterString = this.node.currentStyle['filter'];
					if (opactiyRex.test(filterString)) {
						value = parseFloat(RegExp.$1) / 100;
					}
				}
				return value;
			} else if (window.getComputedStyle) {
				value = window.getComputedStyle(this.node, null).getPropertyValue(this.getSplitName(styleName));
				return value;
			}
		},
		width: function () {
			return this.node.offsetWidth;
		},
		height: function () {
			return this.node.offsetHeight;
		},
		setCss: function (styleName, value) {
			//alert(!!document.body.filters);
			if (styleName == 'opacity') {
				if (this.supportOpacity()) {
					this.node.style.opacity = value;
				} else if (this.supportFilter()) {
					this.node.style.zoom = 1;
					this.node.style.filter = 'alpha(opacity=' + (parseFloat(value) * 100) + ')';
				}
				return;
			}
			regExpNoneUnit = /(?:zIndex|opacity|zoom)/i;
			if (!regExpNoneUnit.test(styleName) && typeof value == 'number') {
				this.node.style[this.getCamelName(styleName)] = value + 'px';
				return;
			}

			this.node.style[this.getCamelName(styleName)] = value;
		},
		getSplitName: function (styleName) {
			return styleName.replace(/([A-Z])/g, '-$1').toLowerCase();
		},
		getCamelName: function (style_name) {
			return style_name.replace(/-([a-z])/g, function (targetStr) {
				return targetStr.slice(1).toUpperCase();
			});
		},
		addClass: function (value) {
			var classNames = (value || '').split(/\s+/);
			if (this.node.className) {
				var className = ' ' + this.node.className + ' ',
					setClass = this.node.className;
				for (var i = 0, len = classNames.length; i < len; i++) {
					if (className.indexOf(' ' + classNames[i] + ' ') < 0) {
						setClass += ' ' + classNames[i];
					}
				}
				this.node.className = dk.trim(setClass);
			} else {
				this.node.className = value;
			}
			
			return this;
		},
		removeClass: function (value) {
			var classNames = (value || '').split(/\s+/);
			if (this.node.className) {
				if (value) {
					var className = (' ' + this.node.className + ' ').replace(/[\n\t]/g, ' ');
					for (var i = 0, len = classNames.length; i < len; i++) {
						className = className.replace(' ' + classNames[i] + ' ', ' ');
					}
					this.node.className = dk.trim(className);
				} else {
					this.node.className = '';
				}
			}
			
			return this;
		},
		hasClass: function (value) {
			return this.node.className.indexOf(value) > -1;
		},
		supportOpacity: function () {
			return typeof document.createElement("div").style.opacity != 'undefined';
		},
		supportFilter: function () {
			return typeof document.createElement('div').style.filter != 'undefined';
		},
		hide: function(){
			this.css('display', 'none');
			return this;
		},
		show: function(){
			if(this.css('display') == 'none'){
				this.css('display', 'block');
			}
			return this;
		}
	};
	var $$ = function (node) {
		return new _$(node);
	};
	dk.$$ = $$;
	if (!win.dk) {
        win.dk = dk;
    }
})(window);