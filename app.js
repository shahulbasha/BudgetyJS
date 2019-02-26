var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotals = function (type) {
        var sum = 0;
        var dataArr = data.allItems[type];
        dataArr.forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentageExp: -1

    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, ID) {
            var ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            })

            index = ids.indexOf(ID);
            if (index != -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {

            calculateTotals('exp');
            calculateTotals('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentageExp = (data.totals.exp / data.totals.inc) * 100;
            }
            else {
                data.percentageExp = -1;
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentageExp
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            var percentages = data.allItems.exp.map((current) => {
                return current.getPercentage();
            })
            return percentages;
        },
        testing: function () {
            console.log(data);
        }
    }

})();


var uiController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        buttonClick: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budget: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        expensePercentage: '.budget__expenses--percentage',
        eventContainer: '.container',
        itemPercentage: '.item__percentage',
        monthTitle:'.budget__title--month',
        dropdown:'.add__type'
    }

    var formatNumber=function(num,type){
        var numSplit,int,dec;
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        dec=numSplit[1];            
        return (type==='exp'?'-':'+')+" "+int+'.'+dec;
    }
        
    return {
        getInputValues: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML String to be replaced in DOM
            if (type === 'inc') {
                element = document.querySelector(DOMStrings.incomeList);
                html = `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            }
            else {
                element = document.querySelector(DOMStrings.expenseList);
                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            element.insertAdjacentHTML('beforeend', newHtml);


        },
        deleteListItem: function (selectorId) {
            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        displayBudget: function (budget) {
            var type;
            type=budget.budget>0?'inc':'exp';
            document.querySelector(DOMStrings.budget).textContent = formatNumber(budget.budget,type);
            document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(budget.totalInc,'inc');
            document.querySelector(DOMStrings.expenseValue).textContent = formatNumber(budget.totalExp,'exp');

            if (budget.percentage > 0) {
                document.querySelector(DOMStrings.expensePercentage).textContent = Math.round(budget.percentage) + ' %';
            } else {
                document.querySelector(DOMStrings.expensePercentage).textContent = '---';
            }
        },
        displayPercentages: function (percentages) {
            var fields, arr;
            fields = document.querySelectorAll(DOMStrings.itemPercentage);

            fields.forEach((element, index) => {
                if (percentages[index] > 0) {
                    element.textContent = percentages[index] + ' %';
                }
                else {
                    element.textContent = '---';
                }

            })
            // arr=Array.prototype.slice.call(fields);
            // arr.forEach((element,index)=>{
            //     if(percentages[index]>0){
            //         element.textContent=percentages[index]+' %';
            //     }
            //     else{
            //         element.textContent='---';
            //     }
            // })
        },
        displayMonth:function(){
            var now,year,month,monthNames;
            monthNames=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            now=new Date();
            month=monthNames[now.getMonth()];
            year=now.getFullYear();
            document.querySelector(DOMStrings.monthTitle).textContent=month+" "+year;
        },
        changeType:function(){
            var fields=document.querySelectorAll(DOMStrings.inputType+','+DOMStrings.inputDescription+','+DOMStrings.inputValue);
            fields.forEach((element,index)=>{
                element.classList.toggle('red-focus');
            })
            document.querySelector(DOMStrings.buttonClick).classList.toggle('red');
        },
        clearUI: function () {
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            var fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach((element, i, array) => {
                element.value = "";
            });

            fieldsArray[0].focus();
        },
        getDOMStrings: function () {
            return DOMStrings;
        }

    };
})();


var appController = (function (uiController, budgetController) {

    var setUpEventListeners = function () {
        var DOMStrings = uiController.getDOMStrings();
        document.querySelector(DOMStrings.buttonClick).addEventListener('click', ctrlAddItem);
        document.querySelector(DOMStrings.eventContainer).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOMStrings.dropdown).addEventListener('change',uiController.changeType);

        document.addEventListener('keydown', function (event) {
            if (event.keyCode == 13 || event.which == 13) {
                ctrlAddItem();
            }

        });
    }

    var updateBudget = function () {
        budgetController.calculateBudget();
        var budget = budgetController.getBudget();
        uiController.displayBudget(budget);
    }

    var updatePercentage = function () {
        budgetController.calculatePercentages();
        var percentages = budgetController.getPercentages();
        console.log(percentages);
        uiController.displayPercentages(percentages);
    }

    var ctrlAddItem = function () {
        var inputValues = uiController.getInputValues();
        //add item to budgetController
        if (inputValues.description != '' && inputValues.value != NaN && inputValues.value > 0) {
            var newItem = budgetController.addItem(inputValues.type, inputValues.description, inputValues.value);
            //add item to UI
            uiController.addListItem(newItem, inputValues.type);

            //clear the fields
            uiController.clearUI();
            //calculate budget
            updateBudget();
            //display budget
            updatePercentage();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            console.log(type + "," + ID);
            budgetController.deleteItem(type, ID);
            uiController.deleteListItem(itemId);
            updateBudget();
            updatePercentage();
        }
    }

    return {
        init: function () {
            console.log('Application has started');
            setUpEventListeners();
            uiController.displayMonth();
            uiController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    }

})(uiController, budgetController);

appController.init();