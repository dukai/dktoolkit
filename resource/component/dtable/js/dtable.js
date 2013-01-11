// Create By   : DK
// Create Time : 2010.05.24
// Edit Time   : 2010.08.25,2010.08.26,10.09.07
// Blog        : http://www.dklogs.net

/*
 * Interfaces
 * toolBar = ['tool_query','tool_new','tool_edit','tool_copy','tool_delete','tool_refresh','tool_save','tool_return']
 */
var dkGrid = function(tableID, toolBar, contextMenuItem){
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
        this.table.style.width = parseInt($$(dk.$('table_container')).width());
        //为IE下取消鼠标选择事件
        dk.$('table_container').onselectstart = function(){
            return false;
        }
        //初始化行事件
        this.initRowsEvent();
        //初始化表头
        this.initTableHeader();
        //初始化功能按钮对象
        this.funcMenu = new FuncMenu(this.toolBar);
        //初始化上下文菜单对象
        if (this.contextMenuItem) {
            this.contextMenu = new cstmContextMenu(this.contextMenuItem);
        }
    },
    initDoms: function(){
        var dkGridDom = document.createElement('DIV');
        dkGridDom.setAttribute('id', 'dk_grid');
        var utilMenuDom = document.createElement('UL');
        utilMenuDom.setAttribute('id', 'uitl_menu');
        var tableContainerDom = document.createElement('DIV');
        tableContainerDom.setAttribute('id', 'table_container');
        this.tableContainer = tableContainerDom;
        dkGridDom.appendChild(utilMenuDom);
        dkGridDom.appendChild(tableContainerDom);
        
        var table = this.table;
        var tableParent = table.parentNode;
        tableParent.insertBefore(dkGridDom, table);
        tableContainerDom.appendChild(table);
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
        /*
         var tds = rowObj.cells;
         for (var i = 0, leng = tds.length; i < leng; i++) {
         tds[i].style.background = bgColor;
         tds[i].style.borderBottomColor = borderColor;
         tds[i].style.borderRightColor = borderColor;
         }*/
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
            /*
             var tds = target.getElementsByTagName('td');
             for (var i = 0; i < tds.length; i++) {
             tds[i].style.background = this.tableStyle.mouseOver;
             }
             */
        }
    },
    //鼠标移出行事件
    rowOut: function(target){
        if (!this.isSelected(target)) {
            this.setTdsStyle(target, '');
            /*
             var tds = target.getElementsByTagName('td');
             for (var i = 0; i < tds.length; i++) {
             tds[i].style.background = '#fff';
             }*/
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
    }
}
//功能菜单事件
var funcBtnsEvent = {
    tool_query: function(){
        alert('The \"Query Function Button\" event function has not been defineded!');
    },
    tool_new: function(){
        alert('The \"New Function Button\" event function has not been defineded!');
    },
    tool_edit: function(){
        alert('The \"Edit Function Button\" event function has not been defineded!');
    },
    tool_copy: function(){
        alert('The \"Copy Function Button\" event function has not been defineded!');
    },
    tool_delete: function(){
        alert('The \"Delete Function Button\" event function has not been defineded!');
    },
    tool_refresh: function(){
        window.location.reload();
    },
    tool_save: function(){
        alert('The \"Save Function Button\" event function has not been defineded!');
    },
    tool_return: function(){
        alert('The \"Return Function Button\" event function has not been defineded!');
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

//Func Menu
var FuncMenu = function(btns){
    this.activedBtns = btns;
    this.prefixUrl = 'resource/componet/dTable/images/funcbtns/';
    this.funcBtns = {
        'tool_query': {
            name: '查询',
            id: 'tool_query',
            img: 'query.png',
            disImg: 'query_dis.png',
            disabled: false
        },
        'tool_new': {
            name: '新建',
            id: 'tool_new',
            img: 'new.png',
            disImg: 'new_dis.png',
            disabled: false
        },
        'tool_edit': {
            name: '编辑',
            id: 'tool_edit',
            img: 'edit.png',
            disImg: 'edit_dis.png',
            disabled: true
        },
        'tool_copy': {
            name: '复制',
            id: 'tool_copy',
            img: 'copy.png',
            disImg: 'copy_dis.png',
            disabled: true
        },
        'tool_delete': {
            name: '删除',
            id: 'tool_delete',
            img: 'delete.png',
            disImg: 'delete_dis.png',
            disabled: true
        },
        'tool_refresh': {
            name: '刷新',
            id: 'tool_refresh',
            img: 'refresh.png',
            disImg: 'refresh_dis.png',
            disabled: false
        },
        'tool_save': {
            name: '保存',
            id: 'tool_save',
            img: 'save.png',
            disImg: 'save_dis.png',
            disabled: false
        },
        'tool_return': {
            name: '返回',
            id: 'tool_return',
            img: 'return.png',
            disImg: 'return_dis.png',
            disabled: false
        }
    };
    this.btnsContainer;
    //{li:liDom,img:imgDom}
    this.btnsDom = {};
    this.init();
}

FuncMenu.prototype = {
    init: function(){
        if (dk.$('uitl_menu')) {
            this.btnsContainer = dk.$('uitl_menu');
            this.createBtns();
        }
        else {
            alert('功能菜单容器未定义，请检查HTML代码！');
        }
    },
    createBtns: function(){
        for (var btnName in this.activedBtns) {
            var btnName = this.activedBtns[btnName];
            this.btnsDom[btnName] = this.createPerBtn(this.funcBtns[btnName]);
            this.btnsContainer.appendChild(this.btnsDom[btnName].li);
            if (this.funcBtns[btnName].disabled) {
                //this.btnsDom[btnName].li.setAttribute('class','disabled');
                this.btnsDom[btnName].li.className = 'disabled';
            }
            //add event to the dom
            if (!this.funcBtns[btnName].disabled) 
                dk.addEvent(this.btnsDom[btnName].li, 'click', funcBtnsEvent[btnName]);
        }
    },
    //btnInfo = {name:'返回',id:'tool_return',img:'return.png',disImg:'return_dis.png',disabled:false}
    //创建每个按钮的DOM，返回创建的Li和Img对象
    createPerBtn: function(btnInfo){
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
        return {
            li: btnLi,
            img: btnImg
        };
    },
    //根据当期表格选中的条目，检查功能按钮的状态
    checkBtnsStatus: function(selectedNum){
        if (selectedNum == 1) {
            this.setBtnStatus('tool_edit', false);
        }
        else {
            this.setBtnStatus('tool_edit', true);
        }
        if (selectedNum != 0) {
            this.setBtnStatus('tool_copy', false);
            this.setBtnStatus('tool_delete', false);
        }
        else {
            this.setBtnStatus('tool_copy', true);
            this.setBtnStatus('tool_delete', true);
        }
    },
    //设置功能按钮的状态
    setBtnStatus: function(btnName, disabled){
        if (this.btnsDom[btnName]) {
            if (this.funcBtns[btnName].disabled != disabled) {
                if (disabled) {
                
                    this.btnsDom[btnName].li.className = 'disabled';
                    this.btnsDom[btnName].img.src = this.prefixUrl + this.funcBtns[btnName].disImg;
                    dk.removeEvent(this.btnsDom[btnName].li, 'click', funcBtnsEvent[btnName]);
                }
                else {
                    this.btnsDom[btnName].li.className = '';
                    this.btnsDom[btnName].img.src = this.prefixUrl + this.funcBtns[btnName].img;
                    dk.addEvent(this.btnsDom[btnName].li, 'click', funcBtnsEvent[btnName]);
                }
                this.funcBtns[btnName].disabled = disabled;
            }
        }
    }
}

var contextMenuItem = {
    context_new: {
        name: '新建',
        type: 'splitTop',
        func: function(){
            alert('The \"Context Menu New\" event function has not been defineded!');
        }
    },
    context_edit: {
        name: '编辑',
        type: 'splitBottom',
        func: function(){
            alert('The \"Context Edit New\" event function has not been defineded!');
        }
    },
    context_delete: {
        name: '删除',
        func: function(){
            alert('The \"Context Edit Delete\" event function has not been defineded!');
        }
    }
}
//上下文菜单选项枚举
var contextMenuType = {
    'new': 'context_new',
    'edit': 'context_edit',
    'delete': 'context_delete'
}
//items = ['context_new','context_edit','context_delete'];
var cstmContextMenu = function(items){
    this.items = items;
    this.contextMenuDom;
    this.itemType = {
        splitTop: 'splitTop',
        splitBottom: 'splitBottom'
    };
    this.init();
}

cstmContextMenu.prototype = {
    init: function(){
        this.contextMenuDom = document.createElement('ul');
        this.contextMenuDom.setAttribute('id', 'cstCM');
        for (var i in this.items) {
            this.addContextItem(contextMenuItem[this.items[i]]);
        }
        document.body.appendChild(this.contextMenuDom);
    },
    addContextItem: function(itemInfo){
        var menuItem = document.createElement('li');
        itemInfo.type && menuItem.setAttribute('class', itemInfo.type);
        var itemText = document.createTextNode(itemInfo.name);
        menuItem.appendChild(itemText);
        dk.addEvent(menuItem, 'click', itemInfo.func);
        dk.addEvent(menuItem, 'click', dk.bind(this, this.dispose));
        this.contextMenuDom.appendChild(menuItem);
    },
    show: function(left, top){
        this.contextMenuDom.style.left = left + 'px';
        this.contextMenuDom.style.top = top + 'px';
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
