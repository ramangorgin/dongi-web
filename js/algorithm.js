// ========= Class Person =========
class Person {
  constructor(name) {
    this.name = name;
    this.paid = 0;
    this.share = 0;
  }

  addPayment(amount) {
    this.paid += amount;
  }

  setShare(amount) {
    this.share = amount;
  }

  getNetBalance() {
    return this.paid - this.share;
  }
}

// ========= Class Expense =========
class Expense {
  constructor(payer, amount, participants) {
    this.payer = payer;
    this.amount = amount;
    this.participants = participants;
  }

  split() {
    if (!this.participants || this.participants.length === 0) return;
    const sharePerPerson = this.amount / this.participants.length;

    this.participants.forEach((p) => {
      p.setShare(p.share + sharePerPerson);
    });

    this.payer.addPayment(this.amount);
  }
}

// ========= Class ExpenseManager =========
class ExpenseManager {
  constructor() {
    this.people = [];
    this.expenses = [];
  }

  // Add a new person
  addPerson(name) {
    const person = new Person(name);
    this.people.push(person);
    return person;
  }

  // Find person by name
  getPersonByName(name) {
    return this.people.find((p) => p.name === name) || null;
  }

  // Add a new expense
  addExpense(payerName, amount, participantNames) {
    const payer = this.getPersonByName(payerName);
    const participants = participantNames
      .map((n) => this.getPersonByName(n))
      .filter((p) => p !== null);

    const e = new Expense(payer, amount, participants);
    e.split();
    this.expenses.push(e);
  }

  // Calculate smart debt settlement
  settleDebts() {
    const debtors = [];
    const creditors = [];

    this.people.forEach((p) => {
      const bal = p.getNetBalance();
      if (bal < -0.01) debtors.push({ person: p, amount: -bal });
      else if (bal > 0.01) creditors.push({ person: p, amount: bal });
    });

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({
        from: debtors[i].person.name,
        to: creditors[j].person.name,
        amount: amount
      });

      debtors[i].amount -= amount;
      creditors[j].amount -= amount;

      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return settlements;
  }

  // Get balances (for display)
  getBalances() {
    return this.people.map((p) => ({
      name: p.name,
      balance: p.getNetBalance()
    }));
  }
}

// ========= Export the logic =========
export { Person, Expense, ExpenseManager };
