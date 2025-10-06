import { ExpenseManager } from './algorithm.js';

/* ========= Helpers: Persian digits & money formatting ========= */
const MAP_EN_TO_FA = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };
const MAP_FA_TO_EN = { '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9' };

function enToFa(str) { return String(str).replace(/\d/g, d => MAP_EN_TO_FA[d]); }
function faToEnDigitsOnly(str, {keepComma=false} = {}) {
  let s = String(str).replace(/[۰-۹]/g, ch => MAP_FA_TO_EN[ch] ?? ch);
  if (!keepComma) s = s.replace(/[^\d]/g, '');
  return s;
}
function formatFaMoney(str) {
  const en = faToEnDigitsOnly(str);
  if (!en) return '';
  const num = Number(en);
  if (Number.isNaN(num)) return enToFa(en);
  return num.toLocaleString('fa-IR');
}
function keepFaDigitsOnly(el) {
  el.addEventListener('input', () => {
    const en = faToEnDigitsOnly(el.value);
    el.value = enToFa(en);
  });
}
function makeFaMoneyInput(el) {
  el.addEventListener('input', () => {
    el.value = formatFaMoney(el.value);
  });
}
function parseFaNumber(str) {
  const en = faToEnDigitsOnly(str);
  if (!en) return NaN;
  return Number(en);
}

/* ================== State management ================== */
let appState = {
  currentStep: 0,
  numPeople: 0,
  peopleNames: [],
  numTransactions: 0,
  transactions: [],
  currentTransaction: 1
};

const steps = [
  document.querySelector('.start-step'),
  document.querySelector('.step-1'),
  document.querySelector('.step-2'),
  document.querySelector('.step-3'),
  document.querySelector('.step-4'),
  document.querySelector('.step-6')
];

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  setupFaInputsAndFonts();
  showStep(0);
});

function setupFaInputsAndFonts() {
  const numPeopleInput = document.getElementById('num-people');
  if (numPeopleInput) keepFaDigitsOnly(numPeopleInput);
  const numTxInput = document.getElementById('num-transactions');
  if (numTxInput) keepFaDigitsOnly(numTxInput);
  const amountInput = document.getElementById('amount');
  if (amountInput) makeFaMoneyInput(amountInput);
}

function setupEventListeners() {
  const startBtn = document.querySelector('.start-step .btn');
  if (startBtn) startBtn.addEventListener('click', () => showStep(1));

  const step1Btn = document.querySelector('.step-1 .btn');
  if (step1Btn) step1Btn.addEventListener('click', handleStep1);

  const step2Btn = document.querySelector('.step-2 .btn');
  if (step2Btn) step2Btn.addEventListener('click', handleStep2);

  const step3Btn = document.querySelector('.step-3 .btn');
  if (step3Btn) step3Btn.addEventListener('click', handleStep3);

  const nextTransactionBtn = document.getElementById('next-transaction');
  if (nextTransactionBtn) nextTransactionBtn.addEventListener('click', handleTransactionSubmit);

  const backHomeBtn = document.getElementById('back-home');
  if (backHomeBtn) backHomeBtn.addEventListener('click', resetApp);
}

function showStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= steps.length) return;
  const currentStepEl = document.querySelector('.step.active');
  const nextStepEl = steps[stepIndex];
  if (currentStepEl === nextStepEl) return;
  if (currentStepEl) {
    currentStepEl.classList.remove('active');
    currentStepEl.classList.add('fade-out');
  }
  setTimeout(() => {
    steps.forEach(step => step.classList.remove('active', 'fade-out'));
    nextStepEl.classList.add('active');
    appState.currentStep = stepIndex;
    updateProgressBar(stepIndex > 0 ? stepIndex - 1 : 0);
    handleStepDisplay(stepIndex);
  }, 400);
}

function updateProgressBar(currentStepIndex) {
  const allBars = document.querySelectorAll('.progress-bar ul');
  allBars.forEach(bar => {
    const lis = bar.querySelectorAll('li');
    lis.forEach((li, i) => li.classList.toggle('active', i === currentStepIndex));
  });
}

function handleStepDisplay(stepIndex) {
  switch (stepIndex) {
    case 2: createNameFields(); break;
    case 4: setupTransactionForm(); break;
    case 5: calculateResults(); break;
  }
}

function handleStep1() {
  const numPeopleInput = document.getElementById('num-people');
  if (!validation.validateNumPeople(numPeopleInput)) return;
  appState.numPeople = parseFaNumber(numPeopleInput.value);
  showStep(2);
}

function createNameFields() {
  const container = document.getElementById('name-fields');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < appState.numPeople; i++) {
    const group = document.createElement('div');
    group.className = 'form-group';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = `نام فرد ${ (i + 1).toLocaleString('fa-IR') }:`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input name-input';
    input.placeholder = `مثلاً: فرد ${ (i + 1).toLocaleString('fa-IR') }`;
    input.addEventListener('input', () => { input.value = enToFa(input.value); });
    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  }
}

function handleStep2() {
  const nameInputs = Array.from(document.querySelectorAll('.name-input'));
  if (!validation.validateNames(nameInputs)) return;
  appState.peopleNames = nameInputs.map(i => i.value.trim());
  showStep(3);
}

function handleStep3() {
  const txInput = document.getElementById('num-transactions');
  if (!validation.validateNumTransactions(txInput)) return;
  appState.numTransactions = parseFaNumber(txInput.value);
  appState.transactions = [];
  appState.currentTransaction = 1;
  showStep(4);
}

function setupTransactionForm() {
  const title = document.getElementById('transaction-step-title');
  const payerSelect = document.getElementById('payer');
  const participantsSelect = document.getElementById('participants');
  if (!title || !payerSelect || !participantsSelect) return;
  title.textContent = `جزئیات تراکنش ${appState.currentTransaction.toLocaleString('fa-IR')} از ${appState.numTransactions.toLocaleString('fa-IR')} را وارد کنید`;
  populateSelectWithNames(payerSelect, participantsSelect);
  payerSelect.value = '';
  const amountEl = document.getElementById('amount');
  if (amountEl) amountEl.value = '';
  if (window.choicesInstance) window.choicesInstance.destroy();
  window.choicesInstance = new Choices(participantsSelect, {
    removeItemButton: true,
    searchEnabled: true,
    placeholder: true,
    placeholderValue: 'افراد سهیم را انتخاب کنید'
  });
}

function populateSelectWithNames(payerSelect, participantsSelect) {
  while (payerSelect.children.length > 1) payerSelect.removeChild(payerSelect.lastChild);
  participantsSelect.innerHTML = '';
  appState.peopleNames.forEach(name => {
    const payerOpt = document.createElement('option');
    payerOpt.value = name; payerOpt.textContent = name;
    payerSelect.appendChild(payerOpt);
    const partOpt = document.createElement('option');
    partOpt.value = name; partOpt.textContent = name;
    participantsSelect.appendChild(partOpt);
  });
}

function handleTransactionSubmit() {
  const payer = document.getElementById('payer');
  const amount = document.getElementById('amount');
  const participants = document.getElementById('participants');
  if (!validation.validateTransaction(payer, amount, participants)) return;
  const payerVal = payer.value;
  const amountVal = parseFaNumber(amount.value);
  const participantsVals = Array.from(participants.selectedOptions).map(o => o.value);
  appState.transactions.push({ payer: payerVal, amount: amountVal, participants: participantsVals });
  if (appState.currentTransaction < appState.numTransactions) {
    appState.currentTransaction++;
    setupTransactionForm();
  } else showStep(5);
}

function calculateResults() {
  const manager = new ExpenseManager();
  appState.peopleNames.forEach(name => manager.addPerson(name));
  appState.transactions.forEach(t => manager.addExpense(t.payer, t.amount, t.participants));
  const balances = manager.getBalances();
  const settlements = manager.settleDebts();
  const creditors = balances.filter(p => p.balance > 0.01)
    .map(p => ({ person: p.name, amount: Math.round(p.balance) }));
  const debtors = balances.filter(p => p.balance < -0.01)
    .map(p => ({ person: p.name, amount: Math.round(-p.balance) }));
  displayResults(creditors, debtors, settlements);
}

function displayResults(creditors, debtors, settlements) {
  const resultBox = document.querySelector('.result-box');
  const summaryBox = document.querySelector('.summary-box');
  if (!resultBox || !summaryBox) return;
  resultBox.innerHTML = '';
  summaryBox.innerHTML = '';
  const credCol = document.createElement('div');
  credCol.className = 'result-column';
  const credTitle = document.createElement('h3');
  credTitle.textContent = 'طلبکار';
  credCol.appendChild(credTitle);
  creditors.forEach(c => {
    const item = document.createElement('div');
    item.className = 'result-item';
    const name = document.createElement('p'); name.textContent = c.person;
    const amt = document.createElement('span'); amt.textContent = c.amount.toLocaleString('fa-IR');
    item.appendChild(name); item.appendChild(amt);
    credCol.appendChild(item);
  });
  const debtCol = document.createElement('div');
  debtCol.className = 'result-column';
  const debtTitle = document.createElement('h3');
  debtTitle.textContent = 'بدهکار';
  debtCol.appendChild(debtTitle);
  debtors.forEach(d => {
    const item = document.createElement('div');
    item.className = 'result-item';
    const name = document.createElement('p'); name.textContent = d.person;
    const amt = document.createElement('span'); amt.textContent = d.amount.toLocaleString('fa-IR');
    item.appendChild(name); item.appendChild(amt);
    debtCol.appendChild(item);
  });
  resultBox.appendChild(credCol);
  resultBox.appendChild(debtCol);
  settlements.forEach(s => {
    const p = document.createElement('p');
    p.textContent = `${s.from} باید به ${s.to} مبلغ ${s.amount.toLocaleString('fa-IR')} ریال بدهد.`;
    summaryBox.appendChild(p);
  });
}

function resetApp() {
  appState = {
    currentStep: 0,
    numPeople: 0,
    peopleNames: [],
    numTransactions: 0,
    transactions: [],
    currentTransaction: 1
  };
  const np = document.getElementById('num-people');
  const nt = document.getElementById('num-transactions');
  if (np) np.value = '';
  if (nt) nt.value = '';
  showStep(0);
}
