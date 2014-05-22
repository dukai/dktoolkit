(function(win, undefined){

var extend = function(subClass, baseClass){
	subClass.parentConstructor = baseClass;
	subClass.parent = {};

	baseClass.call(subClass.parent);


	for(var method in baseClass.prototype){
		subClass.prototype[method] = subClass.parent[method] = baseClass.prototype[method];
	}
};

window.extend = extend;

var mix = function(base, child, deep){
    var o = new Object();
    for(var key in base){
        o[key] = base[key];
    }
    for(var key in child){
		if(deep && isPlainObject(o[key])){
			o[key] = mix(o[key], child[key]);
		}else{
			o[key] = child[key];
		}
    }
    return o;
};

window.mix = mix;
})(window);

