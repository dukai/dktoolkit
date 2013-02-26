(function(){

var scripts = document.getElementsByTagName('script');
var currentPath = scripts[scripts.length - 1].src;
window.navbar = function(item){
	new Request({
		url: currentPath.replace('navbar', 'navbar_tmpl'),
		dataType: 'html',
		success: function(text){
			dk.$('sub').innerHTML = tmpl(text).render({item: item});
		},
		error: function(statusText, xhr){
			console.log(xhr);
		}
		
	}).send();
}

})();