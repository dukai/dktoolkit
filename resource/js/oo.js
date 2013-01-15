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
})(window);

