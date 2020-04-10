var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
        
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
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
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allperc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allperc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }

    };

})();

var uIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list ',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expencesPercentageLabels: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formateNumber =  function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3 , 3);
        }
        dec = numSplit[1];

        return  (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    }
    var nodeListForEach = function(list, callback){
        for(var i = 0; i<list.length; i++){
            callback(list[i], i); 
        }
    }
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,  //inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDomStrings: function(){
            return DOMstrings;
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">'+
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'+
                '</div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>'+
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                '</div></div></div>';
            }

            //replace placeholder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));

            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        displayMonth: function(){
            var now = new Date();
            var month = now.getMonth();
            var year = now.getFullYear();
            var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', '+year;
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFeilds: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.description = '';
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 
            document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formateNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType+','+DOMstrings.inputDescription+','+DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expencesPercentageLabels);
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index]+'%';
                }else{
                    current.textContent = '--';
                }
            });
        }
        
    };

})();


var controller = (function(budgetCtrl, uICtrl){

    var setupEventListeners = function(){
        var DOM = uICtrl.getDomStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uICtrl.changeType);
    }

    var updateBudget = function(){
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget();

        //display the budget on the ui
        uIController.displayBudget(budget);

    }

    var updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //update the UI with the new percentages
        uICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        //get input data
        input = uICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            //add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the new item to ui
            uIController.addListItem(newItem, input.type);
            uIController.clearFeilds();

            //calculate and update budget
            updateBudget(); 

            //calculate and update percentages
            updatePercentages();


        }else{
            if(input.description === '' && !isNaN(input.value) && input.value > 0 ){
                alert('Please enter description');
            }else if(input.description !== '' && isNaN(input.value) || input.value <= 0){
                alert('Please enter the correct value');
            }
        }
    }

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //Delete item form the data structure
            budgetCtrl.deleteItem(type, ID);
            //delete the item from the user interface
            uICtrl.deleteListItem(itemID);
            //update and show the new budget
            updateBudget();
            //calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function(){
            console.log('App has started.');
            uICtrl.displayMonth();  
            uICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, uIController);


controller.init();













