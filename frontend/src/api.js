// src/api.js
// Mock API with transfers, data bundles, electricity, loans, international transfer, transactions
// Works offline using localStorage. Exports consistent functions used by the UI.

const NETWORK_DELAY = 350;
const wait = (ms = NETWORK_DELAY) => new Promise((res) => setTimeout(res, ms));

const LS_USERS = "mock_users_v2";
const LS_TX = "mock_tx_v2";
const LS_TOKEN = "mock_token_v2";
const LS_USER = "mock_user_v2";
const LS_LOANS = "mock_loans_v2";

const STD_TOKEN = "token";
const STD_USER = "user";

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function writeJSON(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
function loadUsers() { return readJSON(LS_USERS) || []; }
function saveUsers(u) { writeJSON(LS_USERS, u); }
function loadTx() { return readJSON(LS_TX) || []; }
function saveTx(t) { writeJSON(LS_TX, t); }
function loadLoans() { return readJSON(LS_LOANS) || []; }
function saveLoans(l) { writeJSON(LS_LOANS, l); }

function nowISO() { return new Date().toISOString(); }
function genToken() { return Math.random().toString(36).slice(2) + "." + Date.now().toString(36); }
function decimal(v){ return (Math.round((parseFloat(v)||0) * 100) / 100).toFixed(2); }

function findUserByUsername(username){ const u = loadUsers(); return u.find(x => x.username.toLowerCase() === (username||"").toLowerCase()); }
function findUserByAccount(accountNumber){ const u = loadUsers(); return u.find(x => x.account_number === String(accountNumber)); }
function findUserById(id){ const u = loadUsers(); return u.find(x => x.id === id); }

function persistAuth(token, user){
  writeJSON(LS_USER, user);
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(STD_TOKEN, token);
  localStorage.setItem(STD_USER, JSON.stringify(user));
}
function clearAuth(){
  localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER);
  localStorage.removeItem(STD_TOKEN); localStorage.removeItem(STD_USER);
}

function pushTx(tx){
  const txs = loadTx();
  txs.unshift(tx);
  saveTx(txs);
  return tx;
}

// Pre-defined data bundles (sample)
const BUNDLES = {
  MTN: [
    { id: "mtn-100", name: "50MB - 1 Day", price: 100, data: "50MB" },
    { id: "mtn-500", name: "500MB - 7 Days", price: 500, data: "500MB" },
    { id: "mtn-1500", name: "2GB - 30 Days", price: 1500, data: "2GB" }
  ],
  Airtel: [
    { id: "air-100", name: "100MB - 1 Day", price: 120, data: "100MB" },
    { id: "air-600", name: "600MB - 7 Days", price: 600, data: "600MB" }
  ],
  Glo: [
    { id: "glo-200", name: "200MB - 3 Days", price: 200, data: "200MB" }
  ],
  "9Mobile": [
    { id: "9-300", name: "300MB - 7 Days", price: 300, data: "300MB" }
  ]
};

// Mock exchange rates (to NGN)
const FX = {
  USD: { rate: 1500, feePercent: 1.2 }, // 1 USD = 1500 NGN, fee 1.2%
  EUR: { rate: 1650, feePercent: 1.3 },
  GBP: { rate: 1900, feePercent: 1.4 }
};

const api = {
  // --- auth basics (register/login/getProfile/logout) ---
  async register({ username, email, password }){
    await wait();
    const errors = {};
    if (!username || username.trim().length < 3) errors.username = ["At least 3 chars."];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ["Invalid email"];
    if (!password || password.length < 6) errors.password = ["Min 6 chars"];

    if (findUserByUsername(username)) errors.username = ["Username exists"];
    if (loadUsers().some(u => u.email === email)) errors.email = ["Email exists"];

    if (Object.keys(errors).length) { const e = new Error("Validation"); e.status=400; e.response={data:errors}; throw e; }

    const users = loadUsers();
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: email.trim(),
      password, // mock only!
      account_number: (Math.floor(1000000000 + Math.random()*9000000000)).toString(),
      balance: decimal(1000 + Math.random()*15000) // initial balance
    };
    users.push(newUser);
    saveUsers(users);

    // initial welcome tx
    pushTx({ id: Date.now(), type: "credit", amount: parseFloat(newUser.balance), date: nowISO(), from: "system", to: newUser.account_number, note: "Welcome balance", user_id: newUser.id });

    const token = genToken();
    persistAuth(token, newUser);
    return { token, user: newUser };
  },

  async login({ username, password }){
    await wait();
    const user = findUserByUsername(username);
    if (!user || user.password !== password) { const e = new Error("Invalid credentials"); e.status=401; e.response={data:{detail:"Invalid credentials"}}; throw e; }
    const token = genToken();
    persistAuth(token, user);
    return { token, user };
  },

  async logout(){ await wait(120); clearAuth(); return { ok:true }; },

  async getProfile(){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e = new Error("Not auth"); e.status=401; e.response={data:{detail:"Auth required"}}; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER);
    if (!raw){ const e = new Error("User not found"); e.status=404; e.response={data:{detail:"User missing"}}; throw e; }
    const user = JSON.parse(raw);
    const allTx = loadTx();
    const recent = allTx.filter(t => t.user_id === user.id || t.to === user.account_number || t.from === user.account_number).slice(0,20);
    const loans = loadLoans().filter(l => l.user_id === user.id);
    return { ...user, transactions: recent, loans };
  },

  // --- transactions & transfer ---
  async transfer({ toAccount, amount }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e = new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const sender = JSON.parse(raw);
    if (!sender) { const e = new Error("User not found"); e.status=404; throw e; }
    const amt = parseFloat(amount); if (!amt || amt <= 0){ const e=new Error("Invalid amount"); e.status=400; e.response={data:{amount:["Invalid"]}}; throw e; }
    const recipient = findUserByAccount(String(toAccount));
    if (!recipient){ const e = new Error("Recipient not found"); e.status=404; e.response={data:{detail:"Recipient not found"}}; throw e; }
    if (parseFloat(sender.balance) < amt){ const e = new Error("Insufficient funds"); e.status=400; e.response={data:{detail:"Insufficient funds"}}; throw e; }

    sender.balance = decimal(parseFloat(sender.balance) - amt);
    recipient.balance = decimal(parseFloat(recipient.balance) + amt);

    // persist users
    const users = loadUsers();
    const si = users.findIndex(u => u.id === sender.id); const ri = users.findIndex(u => u.id === recipient.id);
    users[si] = sender; users[ri] = recipient; saveUsers(users);

    // update auth store
    persistAuth(localStorage.getItem(LS_TOKEN) || genToken(), sender);

    const tx = { id: Date.now(), type:"transfer", amount: decimal(amt), date: nowISO(), from: sender.account_number, to: recipient.account_number, note:`Transfer to ${recipient.username}`, user_id: sender.id };
    pushTx(tx);
    const txRec = { ...tx, id: Date.now()+1, user_id: recipient.id, note:`Received from ${sender.username}` };
    pushTx(txRec);

    return { success:true, tx, sender, recipient };
  },

  // --- buy data bundle (bundleId or free-form) ---
  async buyBundle({ network, bundleId }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e=new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const user = JSON.parse(raw);
    if (!user){ const e=new Error("User missing"); e.status=404; throw e; }
    const bundles = BUNDLES[network] || [];
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle){ const e = new Error("Bundle not found"); e.status=404; e.response={data:{detail:"Bundle not found"}}; throw e; }
    const price = parseFloat(bundle.price);
    if (parseFloat(user.balance) < price){ const e = new Error("Insufficient funds"); e.status=400; throw e; }
    user.balance = decimal(parseFloat(user.balance) - price);
    // persist user update
    const users = loadUsers(); const idx = users.findIndex(u=>u.id===user.id); users[idx]=user; saveUsers(users);
    persistAuth(localStorage.getItem(LS_TOKEN)||genToken(), user);

    const tx = { id:Date.now(), type:"data_bundle", amount: decimal(price), date: nowISO(), network, bundleId, note: `Bought ${bundle.name}`, user_id: user.id };
    pushTx(tx);
    return { success:true, tx, user, bundle };
  },

  // --- buy electricity / pay meter ---
  async payElectricity({ meterNumber, amount, type="prepaid" }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e=new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const user = JSON.parse(raw);
    if (!user){ const e=new Error("User missing"); e.status=404; throw e; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0){ const e=new Error("Invalid amount"); e.status=400; throw e; }
    if (parseFloat(user.balance) < amt){ const e=new Error("Insufficient funds"); e.status=400; throw e; }
    user.balance = decimal(parseFloat(user.balance) - amt);
    const users = loadUsers(); const idx = users.findIndex(u=>u.id===user.id); users[idx]=user; saveUsers(users);
    persistAuth(localStorage.getItem(LS_TOKEN)||genToken(), user);

    // If prepaid, emulate token issued
    const tokenCode = type==="prepaid" ? Math.floor(100000000000 + Math.random()*899999999999).toString() : null;
    const tx = { id:Date.now(), type:"electricity", amount: decimal(amt), date: nowISO(), meterNumber, type, token: tokenCode, note: `Paid electricity (${type})`, user_id: user.id };
    pushTx(tx);
    return { success:true, tx, user, token: tokenCode };
  },

  // --- loans (simple mock) ---
  // Request loan: simple eligibility rule, approve up to 5x salary or fixed
  async requestLoan({ amount, termMonths }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e=new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const user = JSON.parse(raw);
    if (!user){ const e=new Error("User missing"); e.status=404; throw e; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0){ const e=new Error("Invalid amount"); e.status=400; throw e; }
    // simple approval rule: max loan = 500000 or 10x current balance (demo)
    const max = Math.max(500000, parseFloat(user.balance) * 10);
    if (amt > max){ const e=new Error("Loan amount exceeds limit"); e.status=400; e.response={data:{detail:"Exceeds limit"}}; throw e; }

    // create loan record
    const principal = decimal(amt);
    const annualRate = 12; // 12% annual for demo
    const interestTotal = decimal((amt * (annualRate/100) * (termMonths/12)));
    const totalPayable = decimal(parseFloat(principal) + parseFloat(interestTotal));
    const monthly = decimal(parseFloat(totalPayable) / termMonths);

    const loans = loadLoans();
    const loan = {
      id: Date.now(),
      user_id: user.id,
      principal: principal,
      interest: interestTotal,
      total: totalPayable,
      termMonths,
      monthly,
      outstanding: totalPayable,
      created: nowISO(),
      status: "active"
    };
    loans.push(loan); saveLoans(loans);

    // credit user balance with loan principal
    user.balance = decimal(parseFloat(user.balance) + parseFloat(principal));
    const users = loadUsers(); const idx = users.findIndex(u=>u.id===user.id); users[idx]=user; saveUsers(users);
    persistAuth(localStorage.getItem(LS_TOKEN)||genToken(), user);

    // transaction
    const tx = { id:Date.now()+1, type:"loan_credit", amount: principal, date: nowISO(), note:`Loan disbursed (${loan.id})`, user_id: user.id, loan_id: loan.id };
    pushTx(tx);

    return { success:true, loan, user };
  },

  async repayLoan({ loanId, amount }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e=new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const user = JSON.parse(raw);
    if (!user){ const e=new Error("User missing"); e.status=404; throw e; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0){ const e=new Error("Invalid amount"); e.status=400; throw e; }
    if (parseFloat(user.balance) < amt){ const e=new Error("Insufficient funds"); e.status=400; throw e; }

    const loans = loadLoans(); const loanIdx = loans.findIndex(l => l.id === loanId && l.user_id === user.id);
    if (loanIdx < 0){ const e=new Error("Loan not found"); e.status=404; throw e; }

    // deduct balance
    user.balance = decimal(parseFloat(user.balance) - amt);
    loans[loanIdx].outstanding = decimal(Math.max(0, parseFloat(loans[loanIdx].outstanding) - amt));
    if (parseFloat(loans[loanIdx].outstanding) <= 0) loans[loanIdx].status = "closed";
    saveLoans(loans);

    const users = loadUsers(); const uidx = users.findIndex(u=>u.id===user.id); users[uidx]=user; saveUsers(users);
    persistAuth(localStorage.getItem(LS_TOKEN)||genToken(), user);

    const tx = { id:Date.now(), type:"loan_repayment", amount: decimal(amt), date: nowISO(), loan_id: loanId, note:`Loan repayment`, user_id: user.id };
    pushTx(tx);
    return { success:true, loan: loans[loanIdx], user, tx };
  },

  // --- international transfer ---
  async internationalTransfer({ toName, toBank, currency, amount }){
    await wait();
    const token = localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN);
    if (!token) { const e=new Error("Auth"); e.status=401; throw e; }
    const raw = localStorage.getItem(STD_USER) || localStorage.getItem(LS_USER); const user = JSON.parse(raw);
    if (!user){ const e=new Error("User missing"); e.status=404; throw e; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0){ const e=new Error("Invalid amount"); e.status=400; throw e; }
    const fx = FX[currency];
    if (!fx){ const e=new Error("Unsupported currency"); e.status=400; throw e; }
    // amount in NGN = amount * rate, fees = feePercent% of converted value
    const converted = amt * fx.rate;
    const fee = (fx.feePercent/100) * converted;
    const totalNgn = decimal(converted + fee);
    if (parseFloat(user.balance) < parseFloat(totalNgn)){ const e=new Error("Insufficient funds (including fees)"); e.status=400; throw e; }

    // deduct
    user.balance = decimal(parseFloat(user.balance) - parseFloat(totalNgn));
    const users = loadUsers(); const idx = users.findIndex(u=>u.id===user.id); users[idx]=user; saveUsers(users);
    persistAuth(localStorage.getItem(LS_TOKEN)||genToken(), user);

    const tx = { id:Date.now(), type:"intl_transfer", amount: decimal(totalNgn), date: nowISO(), currency, remote_amount: decimal(amt), fee: decimal(fee), toName, toBank, note:`Intl transfer to ${toName} (${currency})`, user_id: user.id };
    pushTx(tx);
    return { success:true, tx, user, fee: decimal(fee), converted: decimal(converted), totalNgn };
  },

  // helper to get available bundles & rates externally
  availableBundles(){ return BUNDLES; },
  fxRates(){ return FX; },

  // dev helpers
  isAuthenticated(){ return !!(localStorage.getItem(STD_TOKEN) || localStorage.getItem(LS_TOKEN)); },
  resetAll(){ localStorage.removeItem(LS_USERS); localStorage.removeItem(LS_TX); localStorage.removeItem(LS_LOANS); clearAuth(); }
};

export const register = api.register;
export const login = api.login;
export const logout = api.logout;
export const getProfile = api.getProfile;
export const transfer = api.transfer;
export const buyBundle = api.buyBundle;
export const payElectricity = api.payElectricity;
export const requestLoan = api.requestLoan;
export const repayLoan = api.repayLoan;
export const internationalTransfer = api.internationalTransfer;
export const availableBundles = api.availableBundles;
export const fxRates = api.fxRates;
export const isAuthenticated = api.isAuthenticated;
export const resetAll = api.resetAll;
export default api;
