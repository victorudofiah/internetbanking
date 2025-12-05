// src/pages/dashboard.js
import React, { useEffect, useState, useRef } from "react";
import {
  getProfile,
  logout,
  transfer,
  buyBundle,
  payElectricity,
  requestLoan,
  repayLoan,
  internationalTransfer,
  availableBundles,
  fxRates
} from "../api";

/* --- Small UI helpers (local) --- */
function IconBell({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 17H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 9a7 7 0 0114 0v3l1 2H4l1-2V9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

/* Reusable Section */
function Section({ title, children, className = "" }) {
  return (
    <div className={`glass p-6 rounded-2xl ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* Transaction row */
function TxRow({ tx }) {
  const sign = tx.type === "credit" ? "+" : tx.type === "loan_credit" ? "+" : "-";
  const color = sign === "+" ? "text-green-300" : "text-red-300";
  return (
    <div className="flex justify-between items-start p-3 rounded-md bg-[rgba(255,255,255,0.02)]">
      <div>
        <div className="text-sm text-gray-300">{tx.note || tx.type}</div>
        <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</div>
      </div>
      <div className={`text-right ${color}`}> {sign}₦ {parseFloat(tx.amount).toFixed(2)} </div>
    </div>
  );
}

/* Header component (inside file for simplicity) */
function Header({ profile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ddRef = useRef();

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener("click", onDoc);
    return () => window.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="flex items-center justify-between gap-6 mb-6">
      {/* brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-white font-bold shadow-md">
            P
          </div>
          <div>
            <div className="text-xl font-bold">Posho Bank</div>
            <div className="text-xs text-gray-300">Online banking</div>
          </div>
        </div>
      </div>

      {/* nav & search */}
      <div className="flex-1 flex items-center gap-4">
        <nav className="hidden md:flex gap-4 text-sm text-gray-300">
          <a className="px-3 py-2 rounded-md hover:bg-white/5" href="/">Home</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/5" href="/dashboard">Accounts</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/5" href="/payments">Payments</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/5" href="/support">Support</a>
        </nav>

        <div className="ml-auto flex items-center gap-3 w-full max-w-lg">
          <div className="flex items-center gap-2 w-full bg-white/5 p-2 rounded-lg">
            <IconSearch className="w-4 h-4 text-gray-300" />
            <input aria-label="Search" placeholder="Search transactions, bills, contacts..." className="bg-transparent outline-none text-sm text-gray-200 w-full" />
          </div>
        </div>
      </div>

      {/* right side: balance, bell, avatar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <div className="text-xs text-gray-300">Balance</div>
          <div className="text-sm font-semibold">₦ {profile?.balance}</div>
        </div>

        <div className="relative">
          <button className="p-2 rounded-md hover:bg-white/5" aria-label="Notifications">
            <IconBell className="w-5 h-5 text-gray-200" />
            <span className="inline-block -ml-2 -mt-6 ml-2 bg-rose-500 text-xs rounded-full px-1.5 text-white">3</span>
          </button>
        </div>

        <div className="relative" ref={ddRef}>
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-semibold">
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm">{profile?.username}</div>
              <div className="text-xs text-gray-300">{profile?.email}</div>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg p-2 z-20">
              <a href="/profile" className="block px-3 py-2 rounded-md text-sm hover:bg-white/5">Profile</a>
              <a href="/settings" className="block px-3 py-2 rounded-md text-sm hover:bg-white/5">Settings</a>
              <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-white/5">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* Footer (inside file) */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-white/5 pt-6 text-sm text-gray-400">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="font-semibold">Posho Bank</div>
          <div>© {year} Posho Creative — All rights reserved</div>
        </div>

        <div className="flex items-center gap-4">
          <a className="hover:underline" href="/terms">Terms</a>
          <a className="hover:underline" href="/privacy">Privacy</a>
          <a className="hover:underline" href="/contact">Contact</a>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-3">
        This is a demo interface. For presentation purposes only.
      </div>
    </footer>
  );
}

/* ---------- Main Dashboard ---------- */
export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick transfer
  const [toAccount, setToAccount] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  // Intl transfer
  const [intlName, setIntlName] = useState("");
  const [intlBank, setIntlBank] = useState("");
  const [intlCurrency, setIntlCurrency] = useState("USD");
  const [intlAmount, setIntlAmount] = useState("");
  const [intlPreview, setIntlPreview] = useState(null);
  const [intlLoading, setIntlLoading] = useState(false);
  const [intlMsg, setIntlMsg] = useState("");

  // bundles
  const [bundleNetwork, setBundleNetwork] = useState("MTN");
  const [bundlesByNetwork, setBundlesByNetwork] = useState({});
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleMsg, setBundleMsg] = useState("");

  // electricity
  const [meterNumber, setMeterNumber] = useState("");
  const [meterAmount, setMeterAmount] = useState("");
  const [meterLoading, setMeterLoading] = useState(false);
  const [meterMsg, setMeterMsg] = useState("");

  // loans
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState(6);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanMsg, setLoanMsg] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayLoading, setRepayLoading] = useState(false);
  const [repayMsg, setRepayMsg] = useState("");

  // transactions filter
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setBundlesByNetwork(availableBundles());
    loadProfile();
    // eslint-disable-next-line
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (err) {
      // not authenticated -> go to login
      window.location.href = "/login";
    } finally {
      setLoading(false);
      setSendMsg(""); setBundleMsg(""); setMeterMsg(""); setLoanMsg(""); setRepayMsg(""); setIntlMsg("");
    }
  }

  async function handleSend(e) {
    e?.preventDefault();
    setSendMsg(""); setSendLoading(true);
    try {
      const res = await transfer({ toAccount: toAccount.trim(), amount: parseFloat(sendAmount) });
      if (res?.success) {
        setSendMsg("Transfer successful");
        setToAccount(""); setSendAmount("");
        await loadProfile();
      } else {
        setSendMsg(res?.message || "Transfer did not complete");
      }
    } catch (err) {
      setSendMsg(err?.response?.data?.detail || err.message || "Transfer failed");
    } finally { setSendLoading(false); }
  }

  async function previewIntl() {
    setIntlPreview(null);
    setIntlMsg("");
    if (!intlAmount || isNaN(Number(intlAmount)) || Number(intlAmount) <= 0) { setIntlMsg("Enter valid amount"); return; }
    const rates = fxRates();
    const fx = rates[intlCurrency];
    if (!fx) { setIntlMsg("Currency not supported"); return; }
    const converted = Number(intlAmount) * fx.rate;
    const fee = (fx.feePercent/100) * converted;
    setIntlPreview({ converted: decimal(converted), fee: decimal(fee), totalNgn: decimal(converted + fee) });
  }

  async function handleIntl(e){
    e?.preventDefault();
    setIntlLoading(true); setIntlMsg("");
    try {
      const res = await internationalTransfer({ toName:intlName, toBank:intlBank, currency:intlCurrency, amount:parseFloat(intlAmount) });
      if (res?.success){
        setIntlMsg(`Sent ${intlAmount} ${intlCurrency}. Fee: ₦${res.fee}`);
        setIntlName(""); setIntlBank(""); setIntlAmount(""); setIntlPreview(null);
        await loadProfile();
      } else {
        setIntlMsg(res?.message || "Intl transfer failed");
      }
    } catch (err){
      setIntlMsg(err?.response?.data?.detail || err.message || "Intl transfer failed");
    } finally { setIntlLoading(false); }
  }

  async function handleBuyBundle(bid){
    setBundleLoading(true); setBundleMsg("");
    try {
      const res = await buyBundle({ network: bundleNetwork, bundleId: bid });
      if (res?.success){
        setBundleMsg(`Bought ${res.bundle.name} for ₦${res.bundle.price}`);
        await loadProfile();
      } else {
        setBundleMsg(res?.message || "Bundle purchase failed");
      }
    } catch (err){
      setBundleMsg(err?.response?.data?.detail || err.message || "Bundle purchase failed");
    } finally { setBundleLoading(false); }
  }

  async function handlePayMeter(e){
    e?.preventDefault();
    setMeterLoading(true); setMeterMsg("");
    try {
      const res = await payElectricity({ meterNumber:meterNumber.trim(), amount:parseFloat(meterAmount), type:"prepaid" });
      if (res?.success){
        setMeterMsg(`Payment successful. Token: ${res.token || "N/A"}`);
        setMeterNumber(""); setMeterAmount("");
        await loadProfile();
      } else {
        setMeterMsg(res?.message || "Payment failed");
      }
    } catch (err){
      setMeterMsg(err?.response?.data?.detail || err.message || "Payment failed");
    } finally { setMeterLoading(false); }
  }

  async function handleRequestLoan(e){
    e?.preventDefault();
    setLoanLoading(true); setLoanMsg("");
    try {
      const res = await requestLoan({ amount:parseFloat(loanAmount), termMonths:parseInt(loanTerm) });
      if (res?.success){
        setLoanMsg(`Loan approved: ₦${res.loan.principal}. Monthly: ₦${res.loan.monthly}`);
        setLoanAmount(""); setLoanTerm(6);
        await loadProfile();
      } else {
        setLoanMsg(res?.message || "Loan request failed");
      }
    } catch (err){
      setLoanMsg(err?.response?.data?.detail || err.message || "Loan request failed");
    } finally { setLoanLoading(false); }
  }

  async function handleRepayLoan(e, loanId){
    e?.preventDefault();
    setRepayLoading(true); setRepayMsg("");
    try {
      const amt = parseFloat(repayAmount);
      const res = await repayLoan({ loanId, amount: amt });
      if (res?.success){
        setRepayMsg(`Repayment successful. Remaining: ₦${res.loan.outstanding}`);
        setRepayAmount("");
        await loadProfile();
      } else {
        setRepayMsg(res?.message || "Repayment failed");
      }
    } catch (err){
      setRepayMsg(err?.response?.data?.detail || err.message || "Repayment failed");
    } finally { setRepayLoading(false); }
  }

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const transactions = (profile?.transactions || []).filter(tx => filterType==="all" ? true : tx.type===filterType);

  return (
    <div className="min-h-screen p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 to-indigo-900 text-white">
      <Header profile={profile} onLogout={() => { logout(); window.location.href="/login"; }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Account card */}
          <div className="glass p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-300">Main account</div>
              <div className="text-2xl font-bold">₦ {profile?.balance}</div>
              <div className="text-xs text-gray-400 mt-1 font-mono">{profile?.account_number}</div>
            </div>
            <div className="flex gap-3">
              <a href="/fund" className="btn-gradient px-4 py-2 rounded-lg">Fund</a>
              <a href="/statements" className="px-4 py-2 rounded-lg bg-white/5">Statements</a>
            </div>
          </div>

          {/* Quick Transfer */}
          <Section title="Quick Transfer">
            <form className="flex gap-3" onSubmit={handleSend}>
              <input value={toAccount} onChange={e=>setToAccount(e.target.value)} placeholder="Recipient account number" className="flex-1 p-3 rounded-lg bg-transparent border border-gray-600" />
              <input value={sendAmount} onChange={e=>setSendAmount(e.target.value)} placeholder="Amount" className="w-40 p-3 rounded-lg bg-transparent border border-gray-600" />
              <button disabled={sendLoading} className="btn-gradient px-4 py-2 rounded-lg">{sendLoading ? "Sending..." : "Send"}</button>
            </form>
            {sendMsg && <div className="mt-3 text-sm">{sendMsg}</div>}
          </Section>

          {/* Data Bundles */}
          <Section title="Data Bundles">
            <div className="flex gap-3 items-center mb-3">
              <select value={bundleNetwork} onChange={e=>setBundleNetwork(e.target.value)} className="p-3 rounded-lg bg-transparent border border-gray-600">
                {Object.keys(bundlesByNetwork).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <div className="text-sm text-gray-300">Balance: ₦{profile?.balance}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(bundlesByNetwork[bundleNetwork]||[]).map(b => (
                <div key={b.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{b.data}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">₦{b.price}</div>
                    <button onClick={()=>handleBuyBundle(b.id)} disabled={bundleLoading} className="px-3 py-1 rounded-md bg-white/10">Buy</button>
                  </div>
                </div>
              ))}
            </div>
            {bundleMsg && <div className="mt-3 text-sm">{bundleMsg}</div>}
          </Section>

          {/* Electricity */}
          <Section title="Electricity / Meter Payment">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handlePayMeter}>
              <input value={meterNumber} onChange={e=>setMeterNumber(e.target.value)} placeholder="Meter number" className="p-3 rounded-lg bg-transparent border border-gray-600" />
              <input value={meterAmount} onChange={e=>setMeterAmount(e.target.value)} placeholder="Amount (₦)" className="p-3 rounded-lg bg-transparent border border-gray-600" />
              <div />
              <div className="md:col-span-4 flex gap-3 items-center">
                <button disabled={meterLoading} type="submit" className="btn-gradient px-4 py-2 rounded-lg">{meterLoading ? "Paying..." : "Pay Meter"}</button>
                <div className="text-sm text-gray-300">{meterMsg}</div>
              </div>
            </form>
          </Section>

          {/* Loans */}
          <Section title="Loans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} placeholder="Amount (₦)" className="p-3 rounded-lg bg-transparent border border-gray-600" />
              <select value={loanTerm} onChange={e=>setLoanTerm(e.target.value)} className="p-3 rounded-lg bg-transparent border border-gray-600">
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
              <button disabled={loanLoading} onClick={handleRequestLoan} className="btn-gradient px-4 py-2 rounded-lg">{loanLoading ? "Applying..." : "Request Loan"}</button>
            </div>

            {loanMsg && <div className="text-sm mb-3">{loanMsg}</div>}

            <div className="space-y-3">
              {profile?.loans?.length ? profile.loans.map(l => (
                <div key={l.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Loan #{l.id}</div>
                      <div className="text-xs text-gray-400">Outstanding: ₦{l.outstanding} • Monthly: ₦{l.monthly} • Term: {l.termMonths} months</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input placeholder="Repay amount" value={repayAmount} onChange={e=>setRepayAmount(e.target.value)} className="p-2 rounded-md bg-transparent border border-gray-600 w-28" />
                      <button disabled={repayLoading} onClick={(ev)=>handleRepayLoan(ev, l.id)} className="px-3 py-1 rounded-md bg-white/10">Repay</button>
                    </div>
                  </div>
                </div>
              )) : <div className="text-sm text-gray-400">No active loans</div>}
              {repayMsg && <div className="text-sm">{repayMsg}</div>}
            </div>
          </Section>

        </div>

        {/* Right column: transactions */}
        <aside className="space-y-6">
          <Section title="Transactions">
            <div className="flex gap-2 items-center mb-3">
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="p-2 rounded-md bg-transparent border border-gray-600">
                <option value="all">All</option>
                <option value="transfer">Transfer</option>
                <option value="data_bundle">Data</option>
                <option value="electricity">Electricity</option>
                <option value="loan_credit">Loan</option>
                <option value="loan_repayment">Loan Repayment</option>
                <option value="intl_transfer">International</option>
              </select>
              <button onClick={loadProfile} className="px-3 py-1 rounded-md bg-white/10">Refresh</button>
            </div>
            <div className="space-y-2 max-h-[45vh] overflow-auto">
              {transactions.length ? transactions.map(t => <TxRow tx={t} key={t.id} />) : <div className="text-sm text-gray-400">No transactions</div>}
            </div>
          </Section>

          <Section title="Security & Settings">
            <div className="text-sm text-gray-300">Last login: just now</div>
            <div className="mt-3 text-sm text-gray-400">For demo, data persists in local storage.</div>
            <div className="mt-3">
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-3 py-1 rounded-md bg-white/10">Reset demo data</button>
            </div>
          </Section>
        </aside>
      </div>

      <Footer />
    </div>
  );
}

/* small helper used inside preview */
function decimal(n){ return (Math.round((parseFloat(n)||0)*100)/100).toFixed(2); }
