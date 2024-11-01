import { backend } from 'declarations/backend';

let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

const display = document.getElementById('display');
const loading = document.getElementById('loading');

document.querySelector('.keypad').addEventListener('click', function(event) {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }

    if (target.classList.contains('operator')) {
        handleOperator(target.dataset.action);
        updateDisplay();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal();
        updateDisplay();
        return;
    }

    if (target.classList.contains('clear')) {
        clear();
        updateDisplay();
        return;
    }

    if (target.classList.contains('equals')) {
        handleEquals();
        return;
    }

    inputDigit(target.textContent);
    updateDisplay();
});

function inputDigit(digit) {
    if (waitingForSecondOperand) {
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal() {
    if (!displayValue.includes('.')) {
        displayValue += '.';
    }
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        performCalculation();
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

async function performCalculation() {
    const inputValue = parseFloat(displayValue);
    loading.style.display = 'block';

    try {
        let result;
        switch (operator) {
            case 'add':
                result = await backend.add(firstOperand, inputValue);
                break;
            case 'subtract':
                result = await backend.subtract(firstOperand, inputValue);
                break;
            case 'multiply':
                result = await backend.multiply(firstOperand, inputValue);
                break;
            case 'divide':
                result = await backend.divide(firstOperand, inputValue);
                break;
            default:
                return;
        }

        displayValue = String(result);
        firstOperand = result;
    } catch (error) {
        console.error('Error performing calculation:', error);
        displayValue = 'Error';
    } finally {
        loading.style.display = 'none';
    }
}

function handleEquals() {
    if (operator === null) {
        return;
    }
    performCalculation();
    updateDisplay();
    waitingForSecondOperand = false;
    operator = null;
    firstOperand = null;
}

function clear() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

function updateDisplay() {
    display.textContent = displayValue;
}
