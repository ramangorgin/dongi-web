
import { ExpenseManager } from './algorithm.js';


// State management
let appState = {
    currentStep: 0,
    numPeople: 0,
    peopleNames: [],
    numTransactions: 0,
    transactions: [],
    currentTransaction: 1 // تراکنش فعلی که کاربر در حال پر کردن آن است
};

// Step elements
const steps = [
    document.querySelector('.start-step'),
    document.querySelector('.step-1'),
    document.querySelector('.step-2'),
    document.querySelector('.step-3'),
    document.querySelector('.step-4'),
    document.querySelector('.step-6')
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showStep(0); // Show start step
});

// Setup all event listeners
function setupEventListeners() {
    // Start button
    const startBtn = document.querySelector('.start-step .btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => showStep(1));
    }

    // Step 1: Number of people
    const step1Btn = document.querySelector('.step-1 .btn');
    if (step1Btn) {
        step1Btn.addEventListener('click', handleStep1);
    }

    // Step 2: Names
    const step2Btn = document.querySelector('.step-2 .btn');
    if (step2Btn) {
        step2Btn.addEventListener('click', handleStep2);
    }

    // Step 3: Number of transactions
    const step3Btn = document.querySelector('.step-3 .btn');
    if (step3Btn) {
        step3Btn.addEventListener('click', handleStep3);
    }

    // Step 4: Next transaction button
    const nextTransactionBtn = document.getElementById('next-transaction');
    if (nextTransactionBtn) {
        nextTransactionBtn.addEventListener('click', handleTransactionSubmit);
    }

    // Final step: Back to home
    const backHomeBtn = document.getElementById('back-home');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', resetApp);
    }
}

// Show specific step and hide others
function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    // Hide all steps
    steps.forEach(step => step.classList.remove('active'));

    // Show current step
    steps[stepIndex].classList.add('active');
    appState.currentStep = stepIndex;

    // ✅ Correct progress bar index (skip start-step)
    const progressIndex = stepIndex > 0 ? stepIndex - 1 : 0;
    updateProgressBar(progressIndex);

    // Special handling for each step
    handleStepDisplay(stepIndex);

    // Progress bar updater
    function updateProgressBar(currentStepIndex) {
        const allProgressBars = document.querySelectorAll('.progress-bar ul');
        allProgressBars.forEach(bar => {
            const steps = bar.querySelectorAll('li');
            steps.forEach((li, liIndex) => {
                li.classList.toggle('active', liIndex === currentStepIndex);
            });
        });
    }
}


// Update progress bar active state
function updateProgressBar(currentStep) {
    const progressItems = document.querySelectorAll('.progress-bar li');
    progressItems.forEach((item, index) => {
        item.classList.remove('active');
        // Map step index to progress item index
        if (currentStep === 0 && index === 0) item.classList.add('active');
        else if (currentStep === 1 && index === 0) item.classList.add('active');
        else if (currentStep === 2 && index === 1) item.classList.add('active');
        else if (currentStep === 3 && index === 2) item.classList.add('active');
        else if (currentStep === 4 && index === 3) item.classList.add('active');
        else if (currentStep === 5 && index === 4) item.classList.add('active');
    });
}

// Handle special display logic for each step
function handleStepDisplay(stepIndex) {
    switch(stepIndex) {
        case 2: // Step 2: Create name fields
            createNameFields();
            break;
        case 4: // Step 4: Setup transaction form
            setupTransactionForm();
            break;
        case 5: // Final step: Calculate and show results
            calculateResults();
            break;
    }
}

// Step 1: Handle number of people
function handleStep1() {
    const numPeopleInput = document.getElementById('num-people');
    const numPeople = parseInt(numPeopleInput.value);

    if (!numPeople || numPeople < 1) {
        alert('لطفاً تعداد افراد را وارد کنید (حداقل ۱ نفر)');
        return;
    }

    appState.numPeople = numPeople;
    showStep(2);
}

// Step 2: Create name input fields
function createNameFields() {
    const nameFieldsContainer = document.getElementById('name-fields');
    if (!nameFieldsContainer) return;

    nameFieldsContainer.innerHTML = '';

    for (let i = 0; i < appState.numPeople; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = `نام فرد ${i + 1}:`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input name-input';
        input.placeholder = `مثلاً: فرد ${i + 1}`;
        input.required = true;
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        nameFieldsContainer.appendChild(inputGroup);
    }
}

// Step 2: Handle names submission
function handleStep2() {
    const nameInputs = document.querySelectorAll('.name-input');
    const names = [];

    for (let input of nameInputs) {
        const name = input.value.trim();
        if (!name) {
            alert('لطفاً تمام اسامی را وارد کنید');
            return;
        }
        names.push(name);
    }

    // Check for duplicate names
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length !== names.length) {
        alert('اسامی نمی‌توانند تکراری باشند');
        return;
    }

    appState.peopleNames = names;
    showStep(3);
}

// Step 3: Handle number of transactions
function handleStep3() {
    const numTransactionsInput = document.getElementById('num-transactions');
    const numTransactions = parseInt(numTransactionsInput.value);

    if (!numTransactions || numTransactions < 1) {
        alert('لطفاً تعداد تراکنش‌ها را وارد کنید (حداقل ۱ تراکنش)');
        return;
    }

    appState.numTransactions = numTransactions;
    appState.transactions = []; // Reset transactions
    appState.currentTransaction = 1; // شروع از تراکنش اول
    showStep(4);
}

// Step 4: Setup transaction form with people names
function setupTransactionForm() {
    const titleElement = document.getElementById('transaction-step-title');
    const payerSelect = document.getElementById('payer');
    const participantsSelect = document.getElementById('participants');
    
    if (!titleElement || !payerSelect || !participantsSelect) return;

    // به‌روزرسانی عنوان
    titleElement.textContent = `جزئیات تراکنش ${appState.currentTransaction} از ${appState.numTransactions} را وارد کنید`;

    // پر کردن selectها با اسامی افراد
    populateSelectWithNames(payerSelect, participantsSelect);

    // پاک کردن مقادیر قبلی
    payerSelect.value = '';
    document.getElementById('amount').value = '';
    
    // پاک کردن انتخاب‌های participants
    if (window.choicesInstance) {
        window.choicesInstance.destroy();
    }
    
    // Initialize Choices.js for multi-select
    window.choicesInstance = new Choices(participantsSelect, {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'افراد سهیم را انتخاب کنید'
    });
}

// پر کردن selectها با اسامی افراد
function populateSelectWithNames(payerSelect, participantsSelect) {
    // پاک کردن options قبلی (به جز option اول)
    while (payerSelect.children.length > 1) {
        payerSelect.removeChild(payerSelect.lastChild);
    }
    
    // پاک کردن تمام options در participantsSelect
    participantsSelect.innerHTML = '';

    // اضافه کردن اسامی افراد به هر دو select
    appState.peopleNames.forEach(name => {
        // برای payer select
        const payerOption = document.createElement('option');
        payerOption.value = name;
        payerOption.textContent = name;
        payerSelect.appendChild(payerOption);

        // برای participants select
        const participantOption = document.createElement('option');
        participantOption.value = name;
        participantOption.textContent = name;
        participantsSelect.appendChild(participantOption);
    });
}

// Step 4: Handle transaction submission
function handleTransactionSubmit() {
    const payerSelect = document.getElementById('payer');
    const amountInput = document.getElementById('amount');
    const participantsSelect = document.getElementById('participants');

    const payer = payerSelect.value;
    const amount = parseInt(amountInput.value);
    const participants = Array.from(participantsSelect.selectedOptions).map(option => option.value);

    // Validation
    if (!payer) {
        alert('لطفاً پرداخت‌کننده را انتخاب کنید');
        return;
    }

    if (!amount || amount < 1) {
        alert('لطفاً مبلغ معتبر وارد کنید');
        return;
    }

    if (participants.length === 0) {
        alert('لطفاً حداقل یک نفر را به عنوان فرد سهیم انتخاب کنید');
        return;
    }

    // ذخیره اطلاعات تراکنش
    appState.transactions.push({
        payer,
        amount,
        participants
    });

    // اگر تراکنش بعدی وجود دارد
    if (appState.currentTransaction < appState.numTransactions) {
        appState.currentTransaction++;
        setupTransactionForm(); // نمایش فرم برای تراکنش بعدی
    } else {
        // اگر تمام تراکنش‌ها پر شده‌اند، به مرحله نتیجه برو
        showStep(5);
    }
}

// Calculate final results using ExpenseManager
function calculateResults() {
    // Create ExpenseManager instance
    const manager = new ExpenseManager();
    
    // Add people to manager
    appState.peopleNames.forEach(name => {
        manager.addPerson(name);
    });
    
    // Add expenses to manager
    appState.transactions.forEach(transaction => {
        manager.addExpense(
            transaction.payer,
            transaction.amount,
            transaction.participants
        );
    });
    
    // Get balances and settlements
    const balances = manager.getBalances();
    const settlements = manager.settleDebts();
    
    // Separate creditors and debtors
    const creditors = balances.filter(p => p.balance > 0.01)
                              .map(p => ({ person: p.name, amount: Math.round(p.balance) }));
    
    const debtors = balances.filter(p => p.balance < -0.01)
                           .map(p => ({ person: p.name, amount: Math.round(-p.balance) }));
    
    // Display results
    displayResults(creditors, debtors, settlements);
}


// Display results in the final step
function displayResults(creditors, debtors, settlements) {
    const resultBox = document.querySelector('.result-box');
    const summaryBox = document.querySelector('.summary-box');

    if (!resultBox || !summaryBox) return;

    // Clear previous results
    resultBox.innerHTML = '';
    summaryBox.innerHTML = '';

    // Create creditors column
    const creditorsColumn = document.createElement('div');
    creditorsColumn.className = 'result-column';
    
    const creditorsTitle = document.createElement('h3');
    creditorsTitle.textContent = 'طلبکار';
    creditorsColumn.appendChild(creditorsTitle);

    creditors.forEach(creditor => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const name = document.createElement('p');
        name.textContent = creditor.person;
        
        const amount = document.createElement('span');
        amount.textContent = creditor.amount.toLocaleString();
        
        resultItem.appendChild(name);
        resultItem.appendChild(amount);
        creditorsColumn.appendChild(resultItem);
    });

    // Create debtors column
    const debtorsColumn = document.createElement('div');
    debtorsColumn.className = 'result-column';
    
    const debtorsTitle = document.createElement('h3');
    debtorsTitle.textContent = 'بدهکار';
    debtorsColumn.appendChild(debtorsTitle);

    debtors.forEach(debtor => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const name = document.createElement('p');
        name.textContent = debtor.person;
        
        const amount = document.createElement('span');
        amount.textContent = debtor.amount.toLocaleString();
        
        resultItem.appendChild(name);
        resultItem.appendChild(amount);
        debtorsColumn.appendChild(resultItem);
    });

    resultBox.appendChild(creditorsColumn);
    resultBox.appendChild(debtorsColumn);

    // Create settlement summary
    settlements.forEach(settlement => {
        const settlementText = document.createElement('p');
        settlementText.textContent = 
            `${settlement.from} باید به ${settlement.to} مبلغ ${settlement.amount.toLocaleString()} ریال بدهد.`;
        summaryBox.appendChild(settlementText);
    });
}

// Reset app to initial state
function resetApp() {
    appState = {
        currentStep: 0,
        numPeople: 0,
        peopleNames: [],
        numTransactions: 0,
        transactions: [],
        currentTransaction: 1
    };
    
    // Clear all inputs
    document.getElementById('num-people').value = '';
    document.getElementById('num-transactions').value = '';
    
    showStep(0);
}