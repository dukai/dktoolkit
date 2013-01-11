// Create By   : DK
// Create Time : 2010.05.24
// Edit Time   : 2010.08.25,2010.08.26,10.09.07
// Blog        : http://www.dklogs.net

/*
 * Interfaces
 * toolBar = ['tool_query','tool_new','tool_edit','tool_copy','tool_delete','tool_refresh','tool_save','tool_return']
 */
 
DGridConfig = {
	basicPath: 'resource/component/dtable'
}
var dkGrid = function(tableID, toolBar, contextMenuItem, guidAttrName){
	//当前的ID
	this.currID = -1;
	//当前的行号
	this.currRowIndex = -1;
	//行集合
	this.rowCollection = [];
	//当前右键选中的行
	this.currentRow = null;
	//当前选中的第一行，用于Shift同时多行同时选择
	this.shiftFirstRow = null;
	//每一行的对象id对应的dom attribute的名字
	this.guidAttrName = guidAttrName;
	//表头行数
	this.headNum = 1;
	//表格的Dom对象
	this.table = dk.$(tableID);
	//表格头部
	this.header = this.table.rows[this.headNum - 1];
	//最小的ID
	this.minID = this.table.rows[this.table.rows.length - 1].id;
	//列数目
	this.columnNum = this.table.rows[0].cells.length;
	//删除当前条目
	this.delCurrItem;
	//删除选中条目
	this.delSelectedItem;
	//功能菜单
	this.funcMenu = null;
	this.toolBar = toolBar;
	//表格容器
	this.tableContainer = null;
	//右键菜单
	this.contextMenu = null;
	this.contextMenuItem = contextMenuItem;
	
	//是否为行鼠标移入移出样式改变注册事件
	this.rowMouseOverOutEvent = false;
	//初始化
	this.init();
}

dkGrid.prototype = {
	//样式
	tableStyle: {
		selected: 'selected',
		mouseOver: 'hover',
		common: 'common'
	},
	init: function(){
		//初始化dkGrid页面Dom对象
		this.initDoms();
		//设置表格宽度
		this.table.style.width = parseInt($$(this.gridDom).width()) + 'px'; //当页面有纵向滚动条时需要减去纵向滚动条的宽度
		//初始化一般事件
		this.initEvent();
		
		//初始化表头
		this.initTableHeader();
		//初始化功能按钮对象
		this.funcMenu = new FuncMenu(this.toolBar, this.utilMenuDom, this.tableContainer);
		//初始化上下文菜单对象
		if (this.contextMenuItem) {
			this.contextMenu = new cstmContextMenu(this.contextMenuItem);
		}
	},
	initDoms: function(){
		var dkGridDom = this.gridDom = document.createElement('DIV');
		dkGridDom.setAttribute('id', 'dk_grid');
		var utilMenuDom = this.utilMenuDom = document.createElement('UL');
		utilMenuDom.setAttribute('id', 'uitl_menu');
		var tableContainerDom = this.tableContainer = document.createElement('DIV');
		tableContainerDom.setAttribute('id', 'table_container');
		dkGridDom.appendChild(utilMenuDom);
		dkGridDom.appendChild(tableContainerDom);
		
		var table = this.table;
		var tableParent = table.parentNode;
		tableParent.insertBefore(dkGridDom, table);
		tableContainerDom.appendChild(table);
	},
	
	initEvent: function(){//初始化事件
		//滚动事件
		//dk.addEvent(window, 'scroll', dk.bind(this, this.scrollEvent));
		//为IE下取消鼠标选择事件
		dk.$('table_container').onselectstart = function(){
			return false;
		}
		//初始化行事件,单击，右键等等
		this.initRowsEvent();
	},
	
	//初始化表头
	initTableHeader: function(){
		var columns = this.header.cells;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			var columnWidth = parseInt($$(column).css('width'));
			column.style.width = columnWidth;
			this.registColumnEvent(column, this.table);
		}
	},
	//注册列宽度改变事件
	registColumnEvent: function(column, table){
		var tableObj = this;
		dk.addEvent(column, 'mousemove', function(e){
			var position = dk.pageDom(column);
			var columnWidth = parseInt($$(column).css('width'));
			if (position.left + columnWidth - dk.pageMouse(e).x < 5) {
				column.style.cursor = 'col-resize';
				column.onmousedown = function(e){
					e || (e = window.event);
					var columnWidth = parseInt($$(column).css('width'));
					startX = dk.pageMouse(e).x;
					var tableWidth = parseInt($$(table).css('width'));
					tableObj.tableContainer.onmousemove = function(e){
						e || (e = window.event);
						column.style.width = (columnWidth + (dk.pageMouse(e).x - startX)) + 'px';
						table.style.width = (tableWidth + (dk.pageMouse(e).x - startX)) + 'px';
					}
					
					tableObj.tableContainer.onmouseup = function(e){
						this.onmousemove = null;
						this.onmouseup = null;
					}
				}
			}
			else {
				column.style.cursor = 'default';
				column.onmousedown = null;
			}
		});
	},
	customContextMenu: function(target, e){
		//设置当前的右键选中的行
		this.currentRow = target;
		if (this.rowCollection.length <= 1) {
			this.resetRows();
			this.shiftFirstRow = target;
			this.rowCollection.push(target);
			this.setTdsStyle(target, this.tableStyle.selected);
		}
		//取消默认右键事件
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		//显示右键菜单
		this.contextMenu.show(dk.pageMouse(e).x, dk.pageMouse(e).y);
	},
	//行选择事件
	rowSelect: function(target, e){
		var id = target.rowIndex;
		var tds = target.cells;
		//按住Ctrl键的情况
		if (e.ctrlKey) {
			if (this.checkStatus(target)) {
				if (target === this.shiftFirstRow) 
					this.shiftFirstRow = null;
				this.rowCollection.splice(parseInt(this.checkStatus(target)) - 1, 1);
				this.setTdsStyle(target, this.tableStyle.common);
			}
			else {
				this.rowCollection.push(target);
				this.setTdsStyle(target, this.tableStyle.selected);
			}
		}
		else if (!e.shiftKey) {
			this.resetRows();
			this.shiftFirstRow = target;
			this.rowCollection.push(target);
			this.setTdsStyle(target, this.tableStyle.selected);
		}
		//按住Shift键的情况
		if (e.shiftKey) {
			if (this.shiftFirstRow == null) {
				this.shiftFirstRow = target;
				this.rowCollection.push(target);
				this.setTdsStyle(target, this.tableStyle.selected);
			}
			else {
				this.shiftRowSelect(this.shiftFirstRow.rowIndex, target.rowIndex);
			}
		}
		this.funcMenu.checkBtnsStatus(this.rowCollection.length);
	},
	//设置当前tr中tds的样式
	setTdsStyle: function(rowObj, className){
		rowObj.className = className;
	},
	//重设当前的行集合，和样式
	resetRows: function(){
		for (var i = 0, len = this.rowCollection.length; i < len; i++) {
			this.setTdsStyle(this.rowCollection[i], '');
		}
		this.rowCollection.length = 0;
	},
	//Shift选中多行
	shiftRowSelect: function(beginIndex, endIndex){
		this.resetRows();
		if (endIndex < beginIndex) {
			var tempIndex = beginIndex;
			beginIndex = endIndex;
			endIndex = tempIndex;
		}
		for (var i = beginIndex; i <= endIndex; i++) {
			this.setTdsStyle(this.table.rows[i], this.tableStyle.selected);
			this.rowCollection.push(this.table.rows[i]);
		}
	},
	//检查当前对象在数组中的位置
	checkStatus: function(row){
		for (var i in this.rowCollection) {
			if (this.rowCollection[i] === row) {
				return parseInt(i) + 1;
			}
		}
		return false;
	},
	//判断目标对象是否选中
	isSelected: function(target){
		for (var i in this.rowCollection) {
			if (this.rowCollection[i] === target) 
				return true;
		}
		return false;
	},
	//注册行事件，包括点击，鼠标移出，鼠标移入，上下文菜单
	initRowsEvent: function(){
		if (this.rowMouseOverOutEvent) {
			for (var i = this.headNum; i < this.table.rows.length; i++) {
				this.registEvent(this.table.rows[i]);
			}
		}
		dk.addEvent(this.table, 'click', dk.bind(this, this.registEventDelegation, this.eventDelegationType.click));
		dk.addEvent(this.table, 'contextmenu', dk.bind(this, this.registEventDelegation, this.eventDelegationType.contextMenu));
	},
	//事件委托的类型
	eventDelegationType: {
		click: 0,
		contextMenu: 1
	},
	//使用事件委托来处理行的点击事件
	registEventDelegation: function(eventType, e){
		var target = e.target || e.srcElement;
		target = this.getDataRowDom(target);
		if (target.rowIndex >= this.headNum) {
			switch (eventType) {
				case this.eventDelegationType.click:
					this.rowSelect(target, e);
					break;
				case this.eventDelegationType.contextMenu:
					this.customContextMenu(target, e);
					break;
				default:
					return false;
			}
		}
	},
	//注册行事件
	registEvent: function(node){
		//当鼠标在行上移入移出时样式改变
		$$(node).fixover(dk.bind(this, this.rowOver, node));
		$$(node).fixout(dk.bind(this, this.rowOut, node));
	},
	//获取数据行的DOM对象
	getDataRowDom: function(ele){
		while (ele.nodeName != 'TR' && ele.parentNode) {
			ele = ele.parentNode;
		}
		if (ele.nodeName != 'TR') {
			return false;
		}
		else {
			return ele;
		}
	},
	//鼠标移入行事件
	rowOver: function(target){
		if (!this.isSelected(target)) {
			this.setTdsStyle(target, this.tableStyle.mouseOver);
		}
	},
	//鼠标移出行事件
	rowOut: function(target){
		if (!this.isSelected(target)) {
			this.setTdsStyle(target, '');
		}
	},
	//添加新的条目
	insertNewItem: function(itemName, func, type){
		var newItem = document.createElement('li');
		newItem.innerHTML = itemName;
		dk.addEvent(newItem, 'click', dk.bind(this, func));
		type && newItem.setAttribute('class', type);
		this.contextMenu.appendChild(newItem);
		return newItem;
	},
	//清除右键菜单
	clearCstMenu: function(e){
		this.contextMenu.style.display = 'none';
		document.onmousedown = null;
	},
	//删除当前行
	delCurrent: function(){
		if (this.rowCollection.length > 0) 
			return;
		var myObj = this;
		this.table.deleteRow(this.currRowIndex);
	},
	//删除选中行
	delSelected: function(){
		if (this.rowCollection.length == 0) 
			return;
		for (var i in this.rowCollection) {
			this.table.deleteRow(this.rowCollection[i].rowIndex);
		}
		this.rowCollection.length = 0;
		dk.logs.write(this.rowCollection.length);
		this.clearCstMenu();
	},
	//处理数据，将数据附加到表格
	processTable: function(data){
		for (var i in data) {
			var row = this.table.insertRow(this.table.rows.length);
			row.setAttribute('id', data[i].id);
			this.registEvent(row);
			var cellNum = 0;
			for (var pName in data[i]) {
				var cell = row.insertCell(cellNum);
				cell.innerHTML = data[i][pName];
				cellNum++;
			}
		}
	},
	//返回选中的数据
	getGuids: function(){
		var attributeName = this.guidAttrName;
		var guids = [], selectedRows = this.rowCollection;
		for(var i = 0, len =  selectedRows.length; i < len; i ++){
			guids.push(selectedRows[i].getAttribute(attributeName));
		}
		return guids;
	},
	//返回选中的GUID的查询字符串
	getGuidsString: function(){
		var attributeName = this.guidAttrName;
		var idsString = '', selectedRows = this.rowCollection;
		for(var i = 0, len = selectedRows.length; i < len; i++){
			idsString += selectedRows[i].getAttribute(attributeName) + ',';
		}
		
		return idsString.substr(0, idsString.length - 1);
	},
	//获取选中的行数
	getSelectedRowCount: function(){
		return this.rowCollection.length;
	} 
}
//功能菜单事件 
var funcBtnItem = {
	tool_query: {
		name: '查询',
		id: 'tool_query',
		img: 'query.png',
		disImg: 'query_dis.png', //disabled image
		disabled: false,
		func: function(){
			alert('The \"Query Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			return false;
		}
	},
	tool_new: {
		name: '新建',
		id: 'tool_edit',
		img: 'new.png',
		disImg: 'new_dis.png',
		disabled: false,
		func: function(){
			alert('The \"New Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			return false;
		}
	},
	tool_edit: {
		name: '编辑',
		id: 'tool_edit',
		img: 'edit.png',
		disImg: 'edit_dis.png',
		disabled: true,
		func: function(){
			alert('The \"Edit Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			if(rowCount == 1){
				return false;
			}else{
				return true;
			}
		}
	},
	tool_copy: {
		name: '复制',
		id: 'tool_copy',
		img: 'copy.png',
		disImg: 'copy_dis.png',
		disabled: true,
		func: function(){
			alert('The \"Copy Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			if(rowCount > 0){
				return false;
			}else{
				return true;
			}
		}
	},
	tool_delete: {
		name: '删除',
		id: 'tool_delete',
		img: 'delete.png',
		disImg: 'delete_dis.png',
		disabled: true,
		func: function(){
			alert('The \"Delete Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			if(rowCount > 0){
				return false;
			}else{
				return true;
			}
		}
	},
	tool_refresh: {
		name: '刷新',
		id: 'tool_refresh',
		img: 'refresh.png',
		disImg: 'refresh_dis.png',
		disabled: false,
		func: function(){
			window.location.reload();
		},
		statusCheck: function(rowCount){
			return false;
		}
	},
	tool_save: {
		name: '保存', 
		id: 'tool_save',
		img: 'save.png',
		disImg: 'save_dis.png',
		disabled: false,
		func: function(){
			alert('The \"Save Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			return false;
		}
	},
	tool_return: {
		name: '返回', 
		id: 'tool_return',
		img: 'return.png',
		disImg: 'return_dis.png',
		disabled: false,
		func: function(){
			alert('The \"Return Function Button\" event function has not been defineded!');
		},
		statusCheck: function(rowCount){
			return false;
		}
	}
}

var funcBtnType = {
	query: 'tool_query',
	'new': 'tool_new',
	edit: 'tool_edit',
	copy: 'tool_copy',
	'delete': 'tool_delete',
	refresh: 'tool_refresh',
	save: 'tool_save',
	'return': 'tool_return'
}

var FuncButton = function(btnInfo, container){
	this.btnInfo = btnInfo;
	this.prefixUrl = DGridConfig.basicPath + '/images/funcbtns/';
	this.init(btnInfo, container);
};

FuncButton.prototype = {
	init: function(btnInfo, container){
		var btnLi = document.createElement('li');
		btnLi.setAttribute('id', btnInfo.id);
		var btnA = document.createElement('a');
		var btnImg = document.createElement('img');
		if (btnInfo.disabled) {
			btnImg.setAttribute('src', this.prefixUrl + btnInfo.disImg);
			btnLi.setAttribute('class', 'disabled');
		}
		else {
			btnImg.setAttribute('src', this.prefixUrl + btnInfo.img);
		}
		var btnText = document.createTextNode(btnInfo.name);
		btnA.appendChild(btnImg);
		btnA.appendChild(btnText);
		btnLi.appendChild(btnA);
		container.appendChild(btnLi);
		this.li = btnLi;
		this.img = btnImg;
		
		if(!btnInfo.disabled){
			dk.addEvent(this.li, 'click', btnInfo.func);
		}
	},
	
	updateStatus: function(selectedRowCount){
		var disabled = this.btnInfo.statusCheck(selectedRowCount);
		if(this.btnInfo.disabled != disabled){
			if(disabled){
				this.li.className = 'disabled';
				this.img.src = this.prefixUrl + this.btnInfo.disImg;
				dk.removeEvent(this.li, 'click', this.btnInfo.func);
			}else{
				this.li.className = '';
				this.img.src = this.prefixUrl + this.btnInfo.img;
				dk.addEvent(this.li, 'click', this.btnInfo.func);
			}
			
			this.btnInfo.disabled = disabled;
		}
	}
};

//Func Menu
var FuncMenu = function(btns, container, relatedDom){
	this.activedBtns = btns;
	this.prefixUrl = DGridConfig.basicPath + '/images/funcbtns/';
	container = typeof container == 'string' ? dk.$(container) : container;
	this.btnsContainer;
	this.tableContainer = typeof relatedDom == 'string' ? dk.$(relatedDom) : relatedDom;
	//{li:liDom,img:imgDom}
	this.btnsDom = {};
	this.btnsRegist = {};
	this.containerTop;
	this.init(container);
}

FuncMenu.prototype = {
	init: function(container){
		if (container) {
			this.btnsContainer = container;
			this.containerTop = dk.pageDom(container).top;
			container.style.width = parseInt($$(this.tableContainer).width()) - 16 + 'px';
			this.registObserver();
			this.initEvent();
		}
		else {
			alert('功能菜单容器未定义，请检查HTML代码！');
		}
	},
	
	registObserver: function(){
		for(var i = 0, len = this.activedBtns.length; i < len; i++){
			var btnInfo = null, btnId = '';
			if(typeof this.activedBtns[i] == 'string'){
				btnInfo = funcBtnItem[this.activedBtns[i]];
				btnId = this.activedBtns[i];
			}else if(typeof this.activedBtns[i] == 'object'){
				btnInfo = this.activedBtns[i];
				btnId = this.activedBtns[i].id;
			}
			this.btnsRegist[btnId] = new FuncButton(btnInfo, this.btnsContainer)
		}
	},
	
	initEvent: function(){
		dk.addEvent(window, 'scroll', dk.bind(this, this.scrollEvent));
		dk.addEvent(window, 'resize', dk.bind(this, this.resizeEvent));
	},
	scrollEvent : function(e){//当滚动的时候触发表头固定事件
		if(this.containerTop < dk.getScroll().top){
			$$(this.btnsContainer).css({position: 'fixed', top: 0});
			$$(this.tableContainer).css('marginTop', 42);
		}else if(this.containerTop >= dk.getScroll().top){
			//dk.logs.write(dk.getScroll().top + ' -- ' + dk.pageDom(this.btnsContainer).top);
			$$(this.btnsContainer).css({position: 'relative'});
			$$(this.tableContainer).css('marginTop', 0);
		}
	},
	resizeEvent: function(e){//触发resize事件的时候重置FuncMenu的宽度
		this.btnsContainer.style.width = parseInt($$(this.tableContainer).width()) - 16 + 'px';
	},
	//根据当期表格选中的条目，检查功能按钮的状态
	checkBtnsStatus: function(selectedNum){
		/*
		for(var i = 0, len = this.activedBtns.length; i < len; i++){
			this.btnsRegist[this.activedBtns[i].id].updateStatus(selectedNum);
		}*/
		
		for(var key in this.btnsRegist){
			this.btnsRegist[key].updateStatus(selectedNum);
		}
	}
}

var contextMenuItem = {
	context_new: {
		name: '新建',
		icon: 'new.png',
		func: function(){
			alert('The "Context Menu New" event function has not been defineded!');
		}
	},
	context_edit: {
		name: '编辑',
		icon: 'edit.png',
		func: function(){
			alert('The \"Context Edit New\" event function has not been defineded!');
		}
	},
	context_delete: {
		name: '删除',
		icon: 'delete.png',
		func: function(){
			alert('The \"Context Edit Delete\" event function has not been defineded!');
		}
	}
}
//上下文菜单选项枚举
var contextMenuType = {
	'new': 'context_new',
	'edit': 'context_edit',
	'delete': 'context_delete',
	'split': 'context_split'
}
//items = ['context_new','context_edit','context_delete'];
var cstmContextMenu = function(items){
	this.items = items;
	this.contextMenuDom;
	this.prefixUrl = DGridConfig.basicPath + '/images/funcbtns/';
	this.init(items);
}

cstmContextMenu.prototype = {
	itemType: {
		splitTop: 'splitTop',
		splitBottom: 'splitBottom'
	},
	init: function(items){
		this.contextMenuDom = document.createElement('ul');
		this.contextMenuDom.onselectstart = function(){
			return false;
		}
		dk.addEvent(this.contextMenuDom, 'contextmenu', function(e){
			e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		});
		this.contextMenuDom.setAttribute('id', 'custom_contextmenu');
		var totalHeight = 0;
		for (var i = 0, len = items.length; i < len; i++) {
		
			if(typeof items[i] == 'string'){
				if(items[i] == 'context_split'){
					this.addContextItem(items[i]);
					totalHeight += 2;
				}else{
					this.addContextItem(contextMenuItem[items[i]]);
					totalHeight += 24;
				}
				
			}else if(typeof items[i] == 'object' && items[i].name && items[i].func){
				this.addContextItem(items[i]);
				totalHeight += 24;
			}
		}
		this.totalHeight = totalHeight;
		document.body.appendChild(this.contextMenuDom);
	},
	addContextItem: function(itemInfo){
		var menuItem = document.createElement('li');
		var aNode = document.createElement('a');
		var spanNode = document.createElement('span');
		
		menuItem.appendChild(spanNode);
		menuItem.appendChild(aNode);
		if(typeof itemInfo == 'string' && itemInfo == 'context_split'){
			menuItem.className = 'split';
		}else{
			//itemInfo.type && menuItem.setAttribute('class', itemInfo.type);
			if(itemInfo.icon){
				var icon = new Image();
				icon.src = this.prefixUrl + itemInfo.icon;
				spanNode.appendChild(icon);
			}
			var itemText = document.createTextNode(itemInfo.name);
			aNode.appendChild(itemText);
			dk.addEvent(menuItem, 'click', itemInfo.func);
			dk.addEvent(menuItem, 'click', dk.bind(this, this.dispose));
		}
		this.contextMenuDom.appendChild(menuItem);
	},
	show: function(left, top){
		var scroll = dk.getScroll();
		var browserSize = dk.getBrowserSize();
		if(top + this.totalHeight > scroll.top + browserSize.height){
			this.contextMenuDom.style.top = top - this.totalHeight + 'px';
		}else{
			this.contextMenuDom.style.top = top + 'px';
		}
		
		if(left + 160 > scroll.left + browserSize.width){
			this.contextMenuDom.style.left = left - 160 + 'px';
		}else{
			this.contextMenuDom.style.left = left + 'px';
		}
		this.contextMenuDom.style.display = 'block';
		this.handleGlobalEvent();
	},
	handleGlobalEvent: function(){
		$$(this.contextMenuDom).fixover(function(e){
			document.onmousedown = null;
		});
		var contextMenuObj = this;
		$$(this.contextMenuDom).fixout(function(e){
			document.onmousedown = dk.bind(contextMenuObj, contextMenuObj.dispose);
		});
	},
	//释放当前的右键菜单
	dispose: function(){
		this.contextMenuDom.style.display = 'none';
	}
}
