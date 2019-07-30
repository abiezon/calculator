class CalcController {

  constructor(){

    /** para metodos privados adiciona-se o underline antes do nome da "variável" */
    this._audio = new Audio('click.mp3');
    this._audioOnOff = true;
    this._lastOperator = '';
    this._lastNumber = '';
    this._operation = [];
    this._lastNumberInsert = [];
    this._historyDisplay = [];
    this._locale = 'pt-BR';
    this._displayCalcEl = document.querySelector('#display');
    this._dateEl = document.querySelector('#date');
    this._timeEl = document.querySelector('#time');
    this._displayHistoryCalcEl = document.querySelector('#display-history');
    this._currentDate;
    this.initialize();
    this.initButtonsEvents();
    this.initKeyboard();
  }

  pasteFromClipboard() {

    document.addEventListener('paste', e => {
      let text = e.clipboardData.getData('Text');
      this.displayCalc = parseFloat(text);
    });

  }

  copyToClipboard() {

    let input = document.createElement('input');
    input.value = this.displayCalc;

    document.body.appendChild(input);

    input.select();

    document.execCommand('Copy');

    input.remove();
  }

  initialize(){

    this.setDisplayDateTime();

    setInterval(() => {
      this.setDisplayDateTime();
    }, 1000);

    this.setLastNumberToDisplay();

    this.pasteFromClipboard();

    document.querySelectorAll('.btn-ac').forEach(btn => {
      btn.addEventListener('dblclick', en => {
        this.toggleAudio();
      });
    });

  }

  toggleAudio() {
    this._audioOnOff = !this._audioOnOff;
  }

  playAudio() {
    if (this._audioOnOff) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }  

  addEventListenerAll(element, events, fn) {
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn, false);
    });
  }

  clearAll() {
    this._operation = [];
    this._lastNumber = '';
    this._lastOperator = '';
    this._lastNumberInsert = [];
    this._historyDisplay = [];

    this.restoreFontSize();
    this.setLastNumberToDisplay();
    this.setHistoryDisplay();
  }

  clearEntry() {
    this._operation.pop();
    this._historyDisplay.pop();
    this.setLastNumberToDisplay();
    this.setHistoryDisplay();
    this.restoreFontSize();
  }

  restoreFontSize() {
    document.getElementById("display").style.fontSize = "48px";
  }

  removeOneNumber() {
    let numbers = this._lastNumberInsert.toString().split("");
    let newValue = '';
    numbers.pop();
    numbers.join("");

    numbers.forEach(number => {
      newValue = newValue+number;
    });

    this.setLastOperation(newValue);
    this.setLastNumberToDisplay();
  }

  getLastOperation() {
    return this._operation[this._operation.length-1];
  }

  setLastOperation(value) {
    this._operation[this._operation.length-1] = value;
  }

  isOperator(value) {
    return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
  }

  pushOperation(value) {
    this._operation.push(value);
    if (this._operation.length > 3) {
      this.calc();
    }
  }

  getResult() {
    try {
      return eval(this._operation.join(""));
    } catch (e) {
      setTimeout(() => {
        this.setError();
      }, 1);
    }
    
  }

  calc() {
    let last = '';
    this._lastOperator = this.getLastItem();
    
    if (this._operation.length < 3) {
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
      this._historyDisplay.push(this._lastOperator.toString());
      this._historyDisplay.push(this._lastNumber.toString());
      this.setHistoryDisplay();
    }

    if (this._operation.length > 3) {
      last = this._operation.pop();     
      this._lastNumber = this.getResult();
    } else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false);
    }

    let result = this.getResult();

    if (last == '%') {
      result /= 100;
      this._operation = [result];
    } else {           
      this._operation = [result];

      if (last) this._operation.push(last);
    }
    this.setLastNumberToDisplay();
  }

  setHistoryDisplay() {

    this.displayHistoryCalc = this._historyDisplay.join('').toString().replace(".", ",");
  }

  getLastItem(isOperator = true) {
    let lastItem;

    for (let i = this._operation.length-1; i >= 0; i--) {      
      if (this.isOperator(this._operation[i]) == isOperator) {    
        lastItem = this._operation[i];
        break;
      }    
    }

    if (!lastItem) {
      lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
    }
   
    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);
    if (!lastNumber) lastNumber = 0;

    this._lastNumberInsert = lastNumber;
    this.displayCalc = lastNumber;
  }

  addOperation(value) {
    if (isNaN(this.getLastOperation())) {
      
      if (this.isOperator(value)) {
        this.setLastOperation(value);
      } else {
        this._historyDisplay.push(value);
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
    } else {
      
      if (this.isOperator(value)) {
        this._historyDisplay.push(value);
        this.pushOperation(value);
      } else {
        let newValue = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(newValue);
        this._historyDisplay.pop();
        this._historyDisplay.push(newValue.toString().replace(".", ","));
        this.setLastNumberToDisplay();
      }
      
    }
    this.setHistoryDisplay();
  }

  setError() {
    this.displayCalc = "Error";
  }

  addDot() {
    let lastOperation = this.getLastOperation();

    if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation('0.');
    } else {
      this.setLastOperation(lastOperation.toString() + '.');
    }

    this.setLastNumberToDisplay();
    
  }

  initKeyboard() {
    document.addEventListener('keyup', e=> {
      this.playAudio();

      switch (e.key) {
        case 'Escape':
            this.clearAll();
          break;
        case 'Backspace':
          this.clearEntry();
          break;
        case ' ':
            this.clearEntry();
            break;
        case '+':
        case '-':
        case '/':
        case '*':
        case '%':
            this.addOperation(e.key);
          break;
        case 'Enter':
        case '=':
            this.calc();
          break;
  
        case '.':
        case ',':
            this.addDot();
          break;
  
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            this.addOperation(parseInt(e.key));
          break;
        case 'c':
            if (e.ctrlKey) this.copyToClipboard();            
          break
      }
    });
  }

  execBtn(value) {
    this.playAudio();

    switch (value) {
      case 'CE':
          this.clearAll();
        break;
      case 'C':
        this.clearEntry();
        break;
      case '←':
          this.removeOneNumber();
        break;
      case '+':
          this.addOperation('+');
        break;
      case '-':
          this.addOperation('-');
        break;
      case '÷':
          this.addOperation('/');
        break;
      case 'X':
          this.addOperation('*');
        break;
      case '%':
          this.addOperation('%');
        break;
      case '√':
          this.squareRoot('√');
        break;
      case '=':
          this.calc();
        break;

        case '.':
        case ',':
            this.addDot();
          break;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
          this.addOperation(parseInt(value));
        break;
      default:
          this.setError();
        break;
    }
  }

  initButtonsEvents() {
    let buttons = document.querySelectorAll(".btn");

    buttons.forEach((btn, index) => {
      this.addEventListenerAll(btn, 'click drag', e => {
        let textBtn = btn.innerHTML;
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
        btn.style.cursor = "pointer";
      });
    });
  }

  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
  }

  squareRoot() {

    let sqr = Math.sqrt(this._operation.join());
    this._historyDisplay = [];
    this.displayCalc = sqr;
    this._operation[0] = sqr;
    this._historyDisplay.push(sqr);
    this.setHistoryDisplay();
  }

  /** getters and setters */

  get displayCalc() {
    return this._displayCalcEl.value;
  }

  set displayCalc(value) {

    let str = value;
    

    // console.log(value.toString());
    // if (!value.toString().indexOf('.') == -1) {
    //   console.log('aaa');
    //   this._displayCalcEl.value = value.toString().replace('.', ',');
    // } else {
    //   this._displayCalcEl.value = value.toLocaleString();
    // }

    if (str.toString().length > 10) {
      str = str.toLocaleString();
      if (str.length > 10) {
        document.getElementById("display").style.fontSize = eval(document.getElementById("display").offsetWidth/str.length+5)+'px';
      }
      this._displayCalcEl.value = str;
    } else {
      if(value.toString().length <=3 ) {
        value = value.toString().replace('.',',');
        this._displayCalcEl.value = value.toLocaleString();
      } else {
        value = parseInt(value);
        this._displayCalcEl.value = value.toLocaleString();
      }

      
    }
  }

  get displayHistoryCalc() {
    return this._displayHistoryCalcEl.value;
  }

  set displayHistoryCalc(value) {

    if (value.toString().length > 10) {
      document.getElementById("display-history").style.fontSize = "20px";
    }

    this._displayHistoryCalcEl.value = value.toLocaleString();
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(value) {
    this._dateEl.innerHTML = value;
  }

  get currentDate(){
    return new Date();
  }

  set currentDate(value){
    this._currentDate = value;
  }
}