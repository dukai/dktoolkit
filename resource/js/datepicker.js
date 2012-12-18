/**
 @author     : DK
 @createDate : 2010-10-8
 @createTime : 19:49:57
 @editDate   : 2010-10-8,2010.10.12,2010.12.16
 @blog       : http://www.dklogs.net
 @email      : xiaobaov2@gmail.com
 */
(function(window){

var $$ = dk.$$;
/*
* interface IState{
*   pre();
*   next();
*   selected(e);
*   toUpperState();
*   fillDate();
*   setTitle();
*   hide();
*   show();
*}
* */

var DateState = function() {//implements IState
};
DateState.prototype = {
    pre: function() {
        if (dp.selectedDate.month == 1) {
            dp.selectedDate.month = 12;
            dp.selectedDate.year--;
        } else {
            dp.selectedDate.month--;
        }
        this.fillData();
    },
    next: function() {
        if (dp.selectedDate.month == 12) {
            dp.selectedDate.month = 1;
            dp.selectedDate.year++;
        } else {
            dp.selectedDate.month++;
        }
        this.fillData();
    },
    selected: function(e) {
        if (e.target.tagName.toLowerCase() == 'a') {
            if (e.target.className == 'pre') {
                this.pre();
            } else if (e.target.className == 'next') {
                this.next();
            } else if (!e.target.className || e.target.className == '' || e.target.className == 'curr') {
                dp.selectedDate.date = e.target.innerHTML;
                dp.execCallBack();
                dp.dispose();
            }
        }
        e.preventDefault();
    },
    toUpperState: function() {
        dp.currState = dp.states.month;
    },
    fillData: function() {
        var year = dp.selectedDate.year, month = dp.selectedDate.month;
        var firstWeekday = dp.util.getMonthStartWeekday(year, month);//当月1号是星期几
        var lastDate = dp.util.getMonthLastDate(year, month);//本月最后一天
        var preMonthLastDate = dp.util.getMonthLastDate(year, month - 1);//上月的最后一天
        var currMonthStartDate = 1, nextMonthStartDate = 1;
        var da = dp.dateArray;
        if (firstWeekday == 0) {
            firstWeekday = 7;
        }
        for (var i = 0, len = da.length; i < len; i++) {
            var dateDom = da[i].dom;
            if (i < firstWeekday) {
                da[i].date = preMonthLastDate - firstWeekday + i + 1;
                dateDom.className = 'pre';
            } else if (i >= firstWeekday && i <= lastDate + firstWeekday - 1) {
                dateDom.className = '';
                da[i].date = currMonthStartDate;
                if (currMonthStartDate == dp.now.date && month == dp.now.month && year == dp.now.year) {
                    dateDom.className = 'curr';
                }
                currMonthStartDate++;
            } else {
                da[i].date = nextMonthStartDate;
                nextMonthStartDate++;
                dateDom.className = 'next';
            }
            dateDom.innerHTML = da[i].date;
        }
		this.setTitle();
    },
    setTitle: function() {
        dp.setTitle(dp.selectedDate.year + '年' + dp.selectedDate.month + '月');
    },
    hide: function() {
        dp.doms.dateContainer.style.display = 'none';
    },
    show: function() {
        dp.initModDoms.initDateDoms.execed || dp.initModDoms.initDateDoms();
        this.fillData();
        this.setTitle();
        dp.doms.dateContainer.style.display = 'block';
    }
};
var MonthState = function() {//implements IState
};

MonthState.prototype = {
    pre: function() {
        dp.selectedDate.year--;
        dp.setTitle(dp.selectedDate.year + '年');
    },
    next: function() {
        dp.selectedDate.year++;
        dp.setTitle(dp.selectedDate.year + '年');
    },
    selected: function(e) {
        if (dk.tagName(e.target) == 'a') {
            this.hide();
            dp.currState = dp.states.date;
            dp.selectedDate.month = parseInt(e.target.innerHTML);
            dp.currState.show();
        }

    },
    toUpperState: function() {
        dp.currState = dp.states.decade;
    },
    fillData: function() {
        var month = dp.selectedDate.month;
        for (var i = 0; i < 12; i++) {
            dp.monthArray[i].dom.className = '';
            if (i == month - 1) {
                dp.monthArray[i].dom.className = 'curr';
            }
        }
    },
    setTitle: function() {
        dp.setTitle(dp.selectedDate.year + '年');
    },
    hide: function() {
        dp.doms.monthContainer.style.display = 'none';
    },
    show: function() {
        dp.initModDoms.initMonthDoms.execed || dp.initModDoms.initMonthDoms();
        this.fillData();
        this.setTitle();
        dp.doms.monthContainer.style.display = 'block';
    }
};

var DecadeState = function() {//implements IState
};

DecadeState.prototype = {
    pre: function() {
        dp.yearRange.decade.begin -= 10;
        dp.yearRange.decade.end -= 10;
        dp.selectedDate.year -= 10;
        this.fillData()
    },
    next: function() {
        dp.yearRange.decade.begin += 10;
        dp.yearRange.decade.end += 10;
        dp.selectedDate.year += 10;
        this.fillData();
    },
    selected: function(e) {
        if (dk.tagName(e.target) == 'a') {
            if (e.target.className == 'pre') {
                this.pre();
            } else if (e.target.className == 'next') {
                this.next();
            } else {
                dp.currState = dp.states.month;
                this.hide();
                dp.selectedDate.year = parseInt(e.target.innerHTML);
                dp.currState.show();
            }
        }
    },
    toUpperState: function() {
        dp.currState = dp.states.century;
    },
    fillData: function() {
        var yearRange, cYear, dom, sYear = dp.selectedDate.year;
        yearRange = dp.util.getYearRange(sYear, dp.yearRangeType.decade);
        for (var i = 0; i < 12; i++) {
            cYear = dp.yearArray[i].year = yearRange.begin - 1 + i;
            dom = dp.yearArray[i].dom;
            dom.innerHTML = dp.yearArray[i].year;
            dom.className = '';

            if (sYear == cYear) {
                dom.className = 'curr';
            }
            if (i == 0) {
                dom.className = 'pre';
            }
            if (i == 11) {
                dom.className = 'next';
            }
        }
        this.setTitle();
    },
    setTitle: function() {
        dp.setTitle(dp.yearRange.decade.begin + '-' + dp.yearRange.decade.end);
    },
    hide: function() {
        dp.doms.yearContainer.style.display = 'none';
    },
    show: function() {
        dp.initModDoms.initYearDoms.execed || dp.initModDoms.initYearDoms();
        this.fillData();
        dp.doms.yearContainer.style.display = 'block';
    }
};

var CenturyState = function() {//implements IState
};

CenturyState.prototype = {
    pre: function() {
        dp.yearRange.century.begin -= 100;
        dp.yearRange.century.end -= 100;
        dp.selectedDate.year -= 100;
        this.fillData();

    },
    next: function() {
        dp.yearRange.century.begin += 100;
        dp.yearRange.century.end += 100;
        dp.selectedDate.year += 100;
        this.fillData();
    },
    selected: function(e) {
        if (dk.tagName(e.target) == 'a') {
            if (e.target.className == 'pre') {
                this.pre();
            } else if (e.target.className == 'next') {
                this.next();
            } else {
                dp.currState = dp.states.decade;
                this.hide();
                dp.selectedDate.year = parseInt(e.target.innerHTML);
                dp.currState.show();
            }
        }
    },
    toUpperState: function() {
        //do nothing...
    },
    fillData: function() {
        var yearRange, cYear, dom, sYear = dp.selectedDate.year;
        yearRange = dp.util.getYearRange(sYear, dp.yearRangeType.century);
        for (var i = 0; i < 12; i++) {
            cYear = dp.yearRangeArray[i].year = yearRange.begin - 10 + (i * 10);
            dom = dp.yearRangeArray[i].dom;
            dom.innerHTML = dp.yearRangeArray[i].year + '-<br />' + (dp.yearRangeArray[i].year + 9);
            dom.className = '';
            if (sYear >= cYear && sYear <= cYear + 9) {
                dom.className = 'curr';
            }
            if (i == 0) {
                dom.className = 'pre';
            } else if (i == 11) {
                dom.className = 'next';
            }
        }
        this.setTitle();
    },
    setTitle: function() {
        dp.setTitle(dp.yearRange.century.begin + '-' + dp.yearRange.century.end);
    },
    hide: function() {
        dp.doms.yearRangeContainer.style.display = 'none';
    },
    show: function() {
        dp.initModDoms.initYearRangeDoms.execed || dp.initModDoms.initYearRangeDoms();
        this.fillData();
        dp.doms.yearRangeContainer.style.display = 'block';
    }
};

var dp = {
    selectedDate: {
        date: null,
        month: null,
        year: null
    },
    yearRange: {
        decade:{begin: null, end: null},
        century: {begin: null, end: null}
    },
    yearRangeType: {
        decade: 0,
        century: 1
    },
    now: {
        year: dk.now.getFullYear(),
        month: dk.now.getMonth() + 1,
        date: dk.now.getDate()
    },
    ele: {
        a: dk.$c('a'),
        fragment: dk.$c('fragment'),
        div: dk.$c('div'),
        span: dk.$c('span')
    },
    currState: null,
    disposed: true,
    states:{
        date: new DateState(),
        month: new MonthState(),
        decade: new DecadeState(),
        century: new CenturyState()
    },
    callBackFuncs: [],
    execCallBack: function() {//执行回调函数方法
        for (var i = 0, len = dp.callBackFuncs.length; i < len; i++) {
            dp.callBackFuncs[i]();
        }
    },
    dateArray: new Array(42),
    monthArray: [],
    yearArray: [],
    yearRangeArray: [],
    doms: {//所有引用到的dom
        mainContainer: null,
        navContainer: null,
        navBars: {
            pre: null,
            next: null
        },
        modContainer: null,
        dateContainer: null,
        weekdayContainer: null,
        monthContainer: null,
        yearContainer: null,
        yearRangeContainer: null,
        title:null
    },
    modDoms: {//包含四种状态的dom对象
        date: null,
        month: null,
        year: null,
        yearRange: null
    },
    setTitle: function(title) {
        dp.doms.title.innerHTML = title;
    },
    pre: function() {
        dp.currState.pre();
    },
    next: function() {
        dp.currState.next();
    },
    selected: function(e) {
        dp.currState.selected(e);
        e.preventDefault();
    },
    toUpperState: function() {
        dp.currState.hide();
        dp.currState.toUpperState();
        dp.currState.show();
    },
    init: function() {
        var currYear = dk.now.getFullYear(), currMonth = dk.now.getMonth() + 1, currDate = dk.now.getDate();
        dp.callBackFuncs.length = 0;
        dp.selectedDate.year = currYear;
        dp.selectedDate.month = currMonth;
        dp.selectedDate.date = currDate;
        dp.yearRange.decade = dp.util.getYearRange(currYear, dp.yearRangeType.decade);
        dp.yearRange.century = dp.util.getYearRange(currYear, dp.yearRangeType.century);
		if(dp.currState){
			dp.currState.hide();
		}
        dp.currState = dp.states.date;
        dp.disposed = false;
    },
    initDoms: function() {
        dp.ele.a.setAttribute('href', '#');//统一为a设置href属性
        dp.doms.mainContainer = dp.ele.div.cloneNode(true);
        dp.doms.mainContainer.className = 'dk_datepicker';
        dp.doms.navContainer = dp.ele.div.cloneNode(true);
        dp.doms.navContainer.className = 'dp_nav';
        dp.doms.navBars.pre = dp.ele.span.cloneNode(true);
        dp.doms.navBars.pre.innerHTML = "&lt;&lt;";
        dp.doms.navBars.next = dp.ele.span.cloneNode(true);
        dp.doms.navBars.next.innerHTML = '&gt;&gt;';
        dp.doms.navBars.pre.className = 'pre';
        dp.doms.navBars.next.className = 'next';
        dp.doms.title = dp.ele.span.cloneNode(true);
        dp.doms.title.className = 'dp_title';
        dp.doms.navContainer.appendChild(dp.doms.navBars.pre);//将导航按钮以及标题等添加到导航容器中
        dp.doms.navContainer.appendChild(dp.doms.title);
        dp.doms.navContainer.appendChild(dp.doms.navBars.next);
        dp.doms.modContainer = dp.ele.div.cloneNode(true);
        dp.doms.modContainer.className = 'dp_main';
        dp.doms.weekdayContainer = dk.$c('ul');
        dp.doms.weekdayContainer.className = 'dp_weekday';
        dp.doms.weekdayContainer.innerHTML = "<li class=\"red\">日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li class=\"red\">六</li>";
        dp.doms.dateContainer = dp.ele.div.cloneNode(true);
        dp.doms.dateContainer.className = 'dp_date';
        dp.doms.dateContainer.appendChild(dp.doms.weekdayContainer);//将星期标识添加到日期容器中
        dp.doms.monthContainer = dp.ele.div.cloneNode(true);
        dp.doms.yearContainer = dp.ele.div.cloneNode(true);
        dp.doms.yearRangeContainer = dp.ele.div.cloneNode(true);
        dp.doms.monthContainer.className = 'dp_month';
        dp.doms.yearContainer.className = 'dp_year';
        dp.doms.yearRangeContainer.className = 'dp_year_range';
        dp.doms.modContainer.appendChild(dp.doms.dateContainer);//将日期，月份，年，年段添加到mod容器中
        dp.doms.modContainer.appendChild(dp.doms.monthContainer);
        dp.doms.modContainer.appendChild(dp.doms.yearContainer);
        dp.doms.modContainer.appendChild(dp.doms.yearRangeContainer);
        dp.doms.mainContainer.appendChild(dp.doms.navContainer); //将导航容器和mod容器附加到主界面上
        dp.doms.mainContainer.appendChild(dp.doms.modContainer);
        //dp.doms.title = dk.$('dp_y_m');
        dp.doms.title.unselectable = 'on';//IE情况下将title设置为无法选中
        dp.modDoms.date = dp.doms.dateContainer; // dk.$('date_c');
        dp.modDoms.month = dp.doms.monthContainer; // dk.$('month_c');
        dp.modDoms.year = dp.doms.yearContainer; // dk.$('year_c');
        dp.modDoms.yearRange = dp.doms.yearRangeContainer; // dk.$('year_range_c');
        dp.initModDoms.initDateDoms();

        document.body.appendChild(dp.doms.mainContainer);
    },
    initModDoms: {
        initDateDoms: function() {
            var currYear = dp.selectedDate.year, currMonth = dp.selectedDate.month, currDate = dp.selectedDate.date;
            var firstWeekday = dp.util.getMonthStartWeekday(currYear, currMonth);
            var lastDate = dp.util.getMonthLastDate(currYear, currMonth);
            var preMonthLastDate = dp.util.getMonthLastDate(currYear, currMonth - 1);
            var fragment = dp.ele.fragment.cloneNode(true);
            var da = dp.dateArray;
            var currMonthStartDate = 1, nextMonthStartDate = 1;
            //dk.logs.write(preMonthLastDate + ' ' + firstWeekday);
            if (firstWeekday == 0) {//如果1号为周日则将游标设为7
                firstWeekday = 7;
            }
            for (var i = 0, len = da.length; i < len; i++) {//生成日期列表以及相关的DOM
                da[i] = {};
                var dateDom = da[i].dom = dp.ele.a.cloneNode(true);
                dateDom.setAttribute('href', '#');
                if (i < firstWeekday) {
                    da[i].date = preMonthLastDate - firstWeekday + i + 1;
                    dateDom.className = 'pre';
                } else if (i >= firstWeekday && i <= lastDate + firstWeekday - 1) {
                    da[i].date = currMonthStartDate;
                    if (currMonthStartDate == dk.now.getDate()) {
                        dateDom.className = 'curr';
                    }
                    currMonthStartDate++;
                } else {
                    da[i].date = nextMonthStartDate;
                    nextMonthStartDate++;
                    dateDom.className = 'next';
                }
                dateDom.innerHTML = da[i].date;
                fragment.appendChild(dateDom);
            }
            dp.modDoms.date.appendChild(fragment);
            dp.initModDoms.initDateDoms.execed = true;
        },
        initMonthDoms: function() {/*初始化monthContainer内部的DOM*/
            var monthFragment = dp.ele.fragment.cloneNode(true);
            for (var i = 0; i < 12; i++) {
                dp.monthArray[i] = {};
                var monthDom = dp.monthArray[i].dom = dp.ele.a.cloneNode(true);
                monthDom.innerHTML = (i + 1) + '月';
                monthFragment.appendChild(monthDom);
            }
            dp.modDoms.month.appendChild(monthFragment);
            dp.initModDoms.initMonthDoms.execed = true;
        },
        initYearDoms: function() {/*初始化yearContainer内部的DOM*/
            var yearFragment = dk.$c('fragment');
            for (var i = 0; i < 12; i++) {
                dp.yearArray[i] = {};
                var yearDom = dp.yearArray[i].dom = dp.ele.a.cloneNode(true);
                yearFragment.appendChild(yearDom);
            }
            dp.modDoms.year.appendChild(yearFragment);
            dp.initModDoms.initYearDoms.execed = true;
        },
        initYearRangeDoms: function() {/*初始化yearRangeContainer内部的DOM*/
            var yearRangeFragment = dk.$c('fragment');
            for (var i = 0; i < 12; i++) {
                dp.yearRangeArray[i] = {};
                var yearRangeDom = dp.yearRangeArray[i].dom = dp.ele.a.cloneNode(true);
                yearRangeDom.setAttribute('href', '#');
                yearRangeFragment.appendChild(yearRangeDom);
            }
            dp.modDoms.yearRange.appendChild(yearRangeFragment);
            dp.initModDoms.initYearRangeDoms.execed = true;
        }
    },
    initEvents: function() {
        dk.addEvent(dp.doms.navBars.pre, 'click', dp.pre);
        dk.addEvent(dp.doms.navBars.next, 'click', dp.next);
        dk.addEvent(dp.doms.dateContainer, 'click', dp.selected);
        dk.addEvent(dp.doms.monthContainer, 'click', dp.selected);
        dk.addEvent(dp.doms.yearContainer, 'click', dp.selected);
        dk.addEvent(dp.doms.yearRangeContainer, 'click', dp.selected);
        dk.addEvent(dp.doms.title, 'click', dp.toUpperState);//导航事件
    },
    render: function(referDom) {
		this.currDom = referDom;
        dp.init();
        if (!dp.doms.mainContainer) {
            dp.initDoms();
            dp.initEvents();
        }
        this.currState.show();
        var position = dk.pageDom(referDom);
        $$(dp.doms.mainContainer).css({left: position.left + 'px', top: position.top + $$(referDom).height() + 'px',display:'block'});
		//当鼠标移入日期选择框时删除document click事件，移出时添加事件
		function removeDisposeEvent(e){
			if (dk.checkHover(e, this)) {
				dk.removeEvent(window.document, 'click', dp.dispose);
			}
		}
		function addDisposeEvent(e){
			if (dk.checkHover(e, this)) {
				dk.addEvent(window.document, 'click', dp.dispose);
			}			
		}
		
		dk.addEvent(dp.doms.mainContainer, 'mouseover', removeDisposeEvent);
		dk.addEvent(dp.doms.mainContainer, 'mouseout', addDisposeEvent);
		
		dk.addEvent(window.document, 'click', dp.dispose);
    },
    dispose: function() {
        dp.doms.mainContainer.style.display = 'none';
		dp.currState.hide();
        dp.disposed = true;
		dk.removeEvent(document, 'click', dp.dispose)
    }
};
//实用工具
dp.util = {
    getMonthStartWeekday: function(year, month) {//获取指定年月的1号是星期几
        return (new Date(year, month - 1, 1)).getDay();
    },
    getMonthLastDate: function(year, month) {//获取本月的最后一天的日期
        if (month == 12) {
            year++;
            month = 0;
        }
        return (new Date(year, month, 0)).getDate();
    },
    formatDate: function(date, formater) {//yyyy-MM-dd hh:mm:ss
        var d = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        };

        function getValue2len(mStr, num) {
            if (mStr.length == 2) {
                if (num < 10) {
                    return '0' + num;
                }
            }
            return num.toString();
        }

        return formater.replace(/(y{4}|M{1,2}|d{1,2}|h{1,2}|m{1,2}|s{1,2})/g, function(mStr) {
            if (/y{4}/.test(mStr)) {
                return d.year;
            } else if (/M{1,2}/.test(mStr)) {
                return getValue2len(mStr, d.month);
            } else if (/d{1,2}/.test(mStr)) {
                return getValue2len(mStr, d.date);
            } else if (/h{1,2}/.test(mStr)) {
                return getValue2len(mStr, d.hour);
            } else if (/m{1,2}/.test(mStr)) {
                return getValue2len(mStr, d.minute);
            } else if (/s{1,2}/.test(mStr)) {
                return getValue2len(mStr, d.second);
            }
            return mStr;
        });
    },
    getYearRange: function(year, type) {
        var left;
        if (type == dp.yearRangeType.decade) {
            left = year % 10;
            var yearByTen = parseInt((year / 10)) * 10;
            return {begin: yearByTen, end: yearByTen + 9, remainder: left};
        } else if (type == dp.yearRangeType.century) {
            left = year % 100;
            var yearByHundred = parseInt(year / 100) * 100;
            return {begin: yearByHundred, end: yearByHundred + 99, remainder: left};
        }
    }
};

var datepicker = {
    setInputs: function() {
        var inputIds = [].slice.call(arguments);
        for (var i = 0, len = inputIds.length; i < len; i++) {
            dk.addEvent(dk.$(inputIds[i]), 'click', datepicker.setDate);
        }
    },
    setDate: function(e) {
		if(dp.currDom != this){
			dp.render(this);
		}else{
			if(dp.disposed){
				dp.render(this);
			}
		}
		
        var input = this;
        dp.callBackFuncs.push(function() {
            input.value = dp.util.formatDate(new Date(dp.selectedDate.year, --dp.selectedDate.month, dp.selectedDate.date), 'yyyy-MM-dd');
			datepicker.onSelect({target: input});
        });
		//dk.addEvent(window.document, 'click', datepicker.resetDatePicker);
		e.stopPropagation();
		return false;
    },
	onSelect: function(e){},
	setup: function(options){
		
	}
};
window.datepicker = datepicker;
})(window);