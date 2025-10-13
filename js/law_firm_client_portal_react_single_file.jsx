import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table"; // Optional: if unavailable, simple tables are used below
import { Download, FileText, Mail, MessageSquare, Plus, Search, Upload, X, Paperclip } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// --- Types ---
const uid = () => Math.random().toString(36).slice(2, 9);

/** Matter */
const matterStatuses = ["Open", "Pending", "Closed", "On Hold"] as const;

// --- Mock Data ---
const seedClients = () => [
  {
    id: uid(),
    name: "Acme Imports Ltd.",
    contact: { email: "gc@acmeimports.com", phone: "+1 (416) 555-0112" },
    notes: "Corporate litigation portfolio. Key contact: Dana.",
    matters: [
      { id: uid(), title: "Acme v. Northport Logistics", number: "CV-24-1182", status: "Open", court: "Ontario Superior Court", nextMilestone: "Discoveries", nextDate: "2025-11-14" },
      { id: uid(), title: "Acme Employment Counsel", number: "AD-25-004", status: "Pending", court: "HRTO", nextMilestone: "Draft submission", nextDate: "2025-10-25" },
    ],
    hearings: [
      { id: uid(), date: "2025-10-21", time: "10:00", court: "ONSC (Toronto)", caseNumber: "CV-24-1182", appearanceType: "Case Conference" },
    ],
    messages: [
      { id: uid(), from: "Attorney", text: "Welcome to your portal. Share documents anytime.", at: new Date().toISOString() },
    ],
    documents: [
      { id: uid(), name: "Retainer Agreement.pdf", type: "pdf", size: 192_000, uploadedAt: "2025-09-02" },
    ],
    financial: {
      invoices: [
        { id: uid(), number: "INV-2025-101", issued: "2025-09-15", due: "2025-10-15", amount: 4800, paid: 3000, status: "Partially Paid" },
        { id: uid(), number: "INV-2025-124", issued: "2025-10-05", due: "2025-11-05", amount: 3200, paid: 0, status: "Open" },
      ],
      trustBalance: 2500,
      outstanding: 5000,
    },
  },
  {
    id: uid(),
    name: "Jamal Ortega (Personal Injury)",
    contact: { email: "jamal.ortega@email.com", phone: "+1 (647) 555-7788" },
    notes: "MVA claim, mediation expected Q1 2026.",
    matters: [
      { id: uid(), title: "Ortega v. City Transit", number: "PI-25-771", status: "Open", court: "LAT", nextMilestone: "IME", nextDate: "2025-12-03" },
    ],
    hearings: [],
    messages: [],
    documents: [],
    financial: {
      invoices: [ { id: uid(), number: "INV-2025-091", issued: "2025-08-01", due: "2025-09-01", amount: 900, paid: 900, status: "Paid" } ],
      trustBalance: 0,
      outstanding: 0,
    },
  },
];

// --- Utilities ---
const currency = (n:number) => n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
const fileSize = (b:number) => {
  if (b < 1024) return `${b} B`; const kb=b/1024; if (kb<1024) return `${kb.toFixed(1)} KB`; const mb=kb/1024; return `${mb.toFixed(1)} MB`;
};

// --- Component ---
export default function ClientPortal() {
  const [clients, setClients] = useState(() => {
    try { const saved = localStorage.getItem("lawportal.clients"); return saved ? JSON.parse(saved) : seedClients(); } catch { return seedClients(); }
  });
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(clients[0]?.id);

  const active = useMemo(() => clients.find(c => c.id === activeId), [clients, activeId]);
  // Persist to localStorage
  React.useEffect(() => { try { localStorage.setItem("lawportal.clients", JSON.stringify(clients)); } catch {} }, [clients]);
  const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [clients, query]);

  // Message compose
  const [newMsg, setNewMsg] = useState("");

  // Document upload (simulated)
  const onUpload = (files: FileList | null) => {
    if (!files || !active) return;
    const uploaded = Array.from(files).map(f => ({ id: uid(), name: f.name, type: f.type.split("/")[1] || "file", size: f.size, uploadedAt: new Date().toISOString().slice(0,10) }));
    setClients(prev => prev.map(c => c.id === active.id ? { ...c, documents: [...c.documents, ...uploaded] } : c));
  };

  // Add Matter dialog state
  const [openMatter, setOpenMatter] = useState(false);
  const [matterDraft, setMatterDraft] = useState({ title: "", number: "", status: "Open", court: "", nextMilestone: "", nextDate: "" });

  const addMatter = () => {
    if (!active) return;
    const matter = { id: uid(), ...matterDraft } as any;
    setClients(prev => prev.map(c => c.id === active.id ? { ...c, matters: [matter, ...c.matters] } : c));
    setMatterDraft({ title: "", number: "", status: "Open", court: "", nextMilestone: "", nextDate: "" });
    setOpenMatter(false);
  };

  // Add Hearing dialog state
  const [openHearing, setOpenHearing] = useState(false);
  const [hearingDraft, setHearingDraft] = useState({ date: "", time: "", court: "", caseNumber: "", appearanceType: "" });

  const addHearing = () => {
    if (!active) return;
    const hearing = { id: uid(), ...hearingDraft } as any;
    setClients(prev => prev.map(c => c.id === active.id ? { ...c, hearings: [hearing, ...c.hearings] } : c));
    setHearingDraft({ date: "", time: "", court: "", caseNumber: "", appearanceType: "" });
    setOpenHearing(false);
  };

  // Invoice dialog + handlers
  const [openInvoice, setOpenInvoice] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState({ number: "", issued: new Date().toISOString().slice(0,10), due: "", amount: 0, paid: 0, status: "Open", notes: "" });

  const addInvoice = () => {
    if (!active) return;
    const amount = Number(invoiceDraft.amount) || 0;
    const paid = Number(invoiceDraft.paid) || 0;
    const status = paid >= amount ? "Paid" : paid > 0 ? "Partially Paid" : "Open";
    const inv = { id: uid(), ...invoiceDraft, amount, paid, status } as any;
    setClients(prev => prev.map(c => c.id === active.id ? { ...c, financial: { ...c.financial, invoices: [inv, ...c.financial.invoices] } } : c));
    setOpenInvoice(false);
    setInvoiceDraft({ number: "", issued: new Date().toISOString().slice(0,10), due: "", amount: 0, paid: 0, status: "Open", notes: "" });
  };

  const previewInvoice = (inv:any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const client = active!;
    win.document.write(`<!doctype html><html><head><meta charset='utf-8'/><title>${inv.number || 'Invoice'}</title><style>
      body{font-family:ui-sans-serif,system-ui,-apple-system; margin:40px;}
      h1{margin:0}
      .muted{color:#666}
      table{width:100%; border-collapse:collapse; margin-top:16px}
      th,td{border-top:1px solid #e5e7eb; text-align:left; padding:8px}
      .right{text-align:right}
      .pill{display:inline-block; padding:2px 8px; border-radius:9999px; background:#111; color:white; font-size:12px}
    </style></head><body>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px">
        <div>
          <h1>Invoice</h1>
          <div class='muted'>${inv.number}</div>
        </div>
        <div style='text-align:right'>
          <div><strong>${client.name}</strong></div>
          <div class='muted'>${client.contact.email}</div>
          <div class='muted'>${client.contact.phone}</div>
        </div>
      </div>
      <div style='margin-top:10px' class='muted'>Issued: ${inv.issued || ''} &nbsp; • &nbsp; Due: ${inv.due || ''} &nbsp; • &nbsp; <span class='pill'>${inv.status}</span></div>
      <table>
        <thead><tr><th>Description</th><th class='right'>Amount</th></tr></thead>
        <tbody>
          <tr><td>Legal services</td><td class='right'>${currency(inv.amount)}</td></tr>
        </tbody>
        <tfoot>
          <tr><td><strong>Total</strong></td><td class='right'><strong>${currency(inv.amount)}</strong></td></tr>
          <tr><td>Paid</td><td class='right'>${currency(inv.paid)}</td></tr>
          <tr><td><strong>Balance Due</strong></td><td class='right'><strong>${currency(Math.max(0, inv.amount - inv.paid))}</strong></td></tr>
        </tfoot>
      </table>
      <p>${inv.notes || ''}</p>
      <script>window.onload = () => window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const emailInvoice = (inv:any) => {
    if (!active) return;
    const subject = encodeURIComponent(`Invoice ${inv.number || ''}`);
    const url = getShareUrl(inv.id, active.id);
    const body = encodeURIComponent(
      `Hello ${active.name},%0D%0A%0D%0APlease view your invoice online here: ${url}%0D%0A%0D%0AInvoice ${inv.number || ''} issued on ${inv.issued || ''} and due on ${inv.due || ''}.%0D%0AAmount: ${currency(inv.amount)} | Paid: ${currency(inv.paid)} | Balance: ${currency(Math.max(0, inv.amount - inv.paid))}%0D%0A%0D%0AThank you.`
    );
    window.location.href = `mailto:${active.contact.email}?subject=${subject}&body=${body}`;
  };

  // --- Shareable public link helpers ---
  const getShareUrl = (invoiceId:string, clientId:string) => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#invoice/${clientId}/${invoiceId}`;
  };

  const sendInvoiceOnline = async (inv:any) => {
    if (!active) return;
    const url = getShareUrl(inv.id, active.id);
    try { await navigator.clipboard.writeText(url); alert("Share link copied to clipboard. You can paste it in an email or message."); }
    catch { prompt("Copy this link:", url); }
  };

  const PublicInvoiceView: React.FC<{client:any; invoice:any}> = ({ client, invoice }) => (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Invoice</h1>
            <div className="text-sm text-muted-foreground">{invoice.number}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{client.name}</div>
            <div className="text-muted-foreground">{client.contact.email}</div>
            <div className="text-muted-foreground">{client.contact.phone}</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Issued: {invoice.issued || '—'} • Due: {invoice.due || '—'} • <span className="inline-block px-2 py-0.5 rounded-full bg-black text-white">{invoice.status}</span></div>
        <div className="mt-6 border rounded-2xl">
          <div className="grid grid-cols-5 text-sm">
            <div className="col-span-4 border-t px-4 py-2">Legal services</div>
            <div className="border-t px-4 py-2 text-right">{currency(invoice.amount)}</div>
          </div>
          <div className="grid grid-cols-5 text-sm font-medium">
            <div className="col-span-4 border-t px-4 py-2">Total</div>
            <div className="border-t px-4 py-2 text-right">{currency(invoice.amount)}</div>
          </div>
          <div className="grid grid-cols-5 text-sm">
            <div className="col-span-4 border-t px-4 py-2">Paid</div>
            <div className="border-t px-4 py-2 text-right">{currency(invoice.paid)}</div>
          </div>
          <div className="grid grid-cols-5 text-sm font-semibold">
            <div className="col-span-4 border-t px-4 py-2">Balance Due</div>
            <div className="border-t px-4 py-2 text-right">{currency(Math.max(0, invoice.amount - invoice.paid))}</div>
          </div>
        </div>
        {invoice.notes ? <p className="mt-4 text-sm">{invoice.notes}</p> : null}
        <div className="mt-6 flex items-center gap-2">
          <Button onClick={()=>window.print()} className="rounded-2xl">Print / Save PDF</Button>
          <Button variant="secondary" className="rounded-2xl" onClick={()=>{ window.location.hash=''; }}>Back</Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">This secure link was generated for viewing your invoice online. If you were not expecting this, please contact the law firm.</p>
      </div>
    </div>
  );
  

  const sendMessage = () => {
    if (!active || !newMsg.trim()) return;
    const msg = { id: uid(), from: "Attorney", text: newMsg.trim(), at: new Date().toISOString() };
    setClients(prev => prev.map(c => c.id === active.id ? { ...c, messages: [...c.messages, msg] } : c));
    setNewMsg("");
  };

  const financialSummary = useMemo(() => {
    if (!active) return { open: 0, paid: 0, outstanding: 0 };
    const paid = active.financial.invoices.reduce((s,i)=>s+i.paid,0);
    const total = active.financial.invoices.reduce((s,i)=>s+i.amount,0);
    return { open: total - paid, paid, outstanding: active.financial.outstanding };
  }, [active]);

  // Public share view via URL hash: #invoice/<clientId>/<invoiceId>
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  if (hash.startsWith('#invoice/')) {
    const [, , clientId, invoiceId] = hash.split('/');
    const client = clients.find(c=>c.id===clientId);
    const invoice = client?.financial.invoices.find((i:any)=>i.id===invoiceId);
    if (client && invoice) {
      return <PublicInvoiceView client={client} invoice={invoice} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-black/90 text-white grid place-content-center font-semibold">L</div>
            <div>
              <h1 className="text-xl font-semibold">Law Firm Client Portal</h1>
              <p className="text-xs text-muted-foreground">Matters • Hearings • Messages • Documents • Financial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 opacity-60" />
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search clients" className="pl-8 w-64" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-2xl" variant="secondary"><Plus className="size-4 mr-1"/> New Client</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Client</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <Label>Name</Label>
                  <Input placeholder="Client name" />
                  <Label>Email</Label>
                  <Input placeholder="client@email.com" />
                  <Label>Phone</Label>
                  <Input placeholder="+1 (___) ___-____" />
                </div>
                <DialogFooter>
                  <Button onClick={()=>{
                    setClients(prev => [{ id: uid(), name: "New Client", contact: { email: "new@client.com", phone: "+1 (000) 000-0000" }, notes: "", matters: [], hearings: [], messages: [], documents: [], financial: { invoices: [], trustBalance: 0, outstanding: 0 } }, ...prev]);
                  }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-[280px,1fr] gap-6 p-4">
        {/* Sidebar: Clients */}
        <aside className="md:sticky md:top-16 h-fit">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {filtered.map(c => (
                  <button key={c.id} onClick={()=>setActiveId(c.id)} className={`text-left rounded-xl px-3 py-2 transition ${c.id===activeId?"bg-gray-900 text-white":"hover:bg-gray-100"}`}>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className={`text-xs ${c.id===activeId?"text-white/80":"text-muted-foreground"}`}>{c.contact.email}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main: Active Client */}
        <main>
          {active ? (
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{active.name}</h2>
                      <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
                        <span>Email: <a className="underline" href={`mailto:${active.contact.email}`}>{active.contact.email}</a></span>
                        <span>Phone: <a className="underline" href={`tel:${active.contact.phone}`}>{active.contact.phone}</a></span>
                      </div>
                      <p className="mt-3 text-sm">{active.notes || "No notes yet."}</p>
                    </div>
                    <div className="grid gap-2 text-right">
                      <div className="text-sm">Trust Balance</div>
                      <div className="text-2xl font-semibold">{currency(active.financial.trustBalance)}</div>
                      <div className="text-xs text-muted-foreground">Outstanding: {currency(financialSummary.open)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="matters" className="w-full">
                <TabsList className="grid grid-cols-5 rounded-2xl">
                  <TabsTrigger value="matters">Matters</TabsTrigger>
                  <TabsTrigger value="hearings">Hearings</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                {/* Matters */}
                <TabsContent value="matters" className="mt-4">
                  <Card className="rounded-2xl">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Invoices</CardTitle>
                        <Dialog open={openInvoice} onOpenChange={setOpenInvoice}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="rounded-2xl"><Plus className="size-4 mr-1"/>New Invoice</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
                            <div className="grid gap-3 py-2">
                              <Label>Invoice #</Label>
                              <Input value={invoiceDraft.number} onChange={e=>setInvoiceDraft(s=>({...s, number: e.target.value}))} placeholder="INV-2025-001" />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Issued</Label>
                                  <Input type="date" value={invoiceDraft.issued} onChange={e=>setInvoiceDraft(s=>({...s, issued: e.target.value}))} />
                                </div>
                                <div>
                                  <Label>Due</Label>
                                  <Input type="date" value={invoiceDraft.due} onChange={e=>setInvoiceDraft(s=>({...s, due: e.target.value}))} />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Amount</Label>
                                  <Input type="number" min="0" step="0.01" value={invoiceDraft.amount} onChange={e=>setInvoiceDraft(s=>({...s, amount: e.target.value}))} />
                                </div>
                                <div>
                                  <Label>Paid (optional)</Label>
                                  <Input type="number" min="0" step="0.01" value={invoiceDraft.paid} onChange={e=>setInvoiceDraft(s=>({...s, paid: e.target.value}))} />
                                </div>
                              </div>
                              <div>
                                <Label>Notes</Label>
                                <Textarea value={invoiceDraft.notes} onChange={e=>setInvoiceDraft(s=>({...s, notes: e.target.value}))} placeholder="Optional memo or line-item summary" />
                              </div>
                            </div>
                            <DialogFooter className="justify-between">
                              <div className="text-xs text-muted-foreground">Tip: After saving, use “Preview/Print” to save a PDF, then click “Email” to send to the client.</div>
                              <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>previewInvoice(inv)}>Preview/Print</Button>
                                        <Button size="sm" variant="secondary" className="rounded-2xl" onClick={()=>sendInvoiceOnline(inv)}>Send Link</Button>
                                        <Button size="sm" className="rounded-2xl" onClick={()=>emailInvoice(inv)}>Email</Button>
                                      </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                                <tr className="text-left text-muted-foreground">
                                  <th className="py-2">Invoice #</th>
                                  <th>Issued</th>
                                  <th>Due</th>
                                  <th>Amount</th>
                                  <th>Paid</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                          <tbody>
                            {active.matters.map(m => (
                              <tr key={m.id} className="border-t">
                                <td className="py-2 font-medium">{m.title}</td>
                                <td>{m.number}</td>
                                <td><Badge variant={m.status==="Open"?"default": m.status==="Pending"?"secondary":"outline"}>{m.status}</Badge></td>
                                <td>{m.court}</td>
                                <td>{m.nextMilestone || "—"}</td>
                                <td>{m.nextDate || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Hearings */}
                <TabsContent value="hearings" className="mt-4">
                  <Card className="rounded-2xl">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="text-base">Hearings</CardTitle>
                      <Dialog open={openHearing} onOpenChange={setOpenHearing}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="rounded-2xl"><Plus className="size-4 mr-1"/>Add Hearing</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>New Hearing</DialogTitle></DialogHeader>
                          <div className="grid gap-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Date</Label>
                                <Input type="date" value={hearingDraft.date} onChange={e=>setHearingDraft(s=>({...s,date:e.target.value}))} />
                              </div>
                              <div>
                                <Label>Time</Label>
                                <Input type="time" value={hearingDraft.time} onChange={e=>setHearingDraft(s=>({...s,time:e.target.value}))} />
                              </div>
                            </div>
                            <Label>Court</Label>
                            <Input value={hearingDraft.court} onChange={e=>setHearingDraft(s=>({...s,court:e.target.value}))} />
                            <Label>Case #</Label>
                            <Input value={hearingDraft.caseNumber} onChange={e=>setHearingDraft(s=>({...s,caseNumber:e.target.value}))} />
                            <Label>Appearance Type</Label>
                            <Input value={hearingDraft.appearanceType} onChange={e=>setHearingDraft(s=>({...s,appearanceType:e.target.value}))} />
                          </div>
                          <DialogFooter>
                            <Button onClick={addHearing}>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {active.hearings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hearings yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-2">Date</th>
                                <th>Time</th>
                                <th>Court</th>
                                <th>Case #</th>
                                <th>Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {active.hearings.map(h => (
                                <tr key={h.id} className="border-t">
                                  <td className="py-2">{h.date}</td>
                                  <td>{h.time}</td>
                                  <td>{h.court}</td>
                                  <td>{h.caseNumber}</td>
                                  <td>{h.appearanceType}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages */}
                <TabsContent value="messages" className="mt-4">
                  <Card className="rounded-2xl">
                    <CardHeader><CardTitle className="text-base">Secure Messages</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72 overflow-y-auto rounded-xl border p-3 bg-white">
                        <AnimatePresence>
                          {active.messages.map(m => (
                            <motion.div key={m.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0}} className={`max-w-[80%] mb-3 ${m.from==="Attorney"?"ml-auto":""}`}>
                              <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from==="Attorney"?"bg-gray-900 text-white":"bg-gray-100"}`}>
                                <div className="text-xs opacity-70 mb-1">{m.from}</div>
                                <div>{m.text}</div>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.at).toLocaleString()}</div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Input value={newMsg} onChange={(e)=>setNewMsg(e.target.value)} placeholder="Write a message…" />
                        <Button onClick={sendMessage} className="rounded-2xl" size="sm"><MessageSquare className="size-4 mr-1"/>Send</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents" className="mt-4">
                  <Card className="rounded-2xl">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="text-base">Documents</CardTitle>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm px-3 py-2 border rounded-xl hover:bg-gray-50">
                        <Upload className="size-4"/> Upload
                        <input type="file" multiple className="hidden" onChange={(e)=>onUpload(e.target.files)} />
                      </label>
                    </CardHeader>
                    <CardContent>
                      {active.documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {active.documents.map(d => (
                            <div key={d.id} className="border rounded-2xl p-3 bg-white flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="size-9 rounded-xl bg-gray-900 text-white grid place-content-center"><FileText className="size-4"/></div>
                                <div>
                                  <div className="text-sm font-medium truncate max-w-[14rem]" title={d.name}>{d.name}</div>
                                  <div className="text-xs text-muted-foreground">{d.type?.toUpperCase()} • {fileSize(d.size)} • {d.uploadedAt}</div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="rounded-full" title="Download"><Download className="size-4"/></Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financial */}
                <TabsContent value="financial" className="mt-4">
                  <div className="grid lg:grid-cols-3 gap-4">
                    <Card className="rounded-2xl lg:col-span-2">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Invoices</CardTitle>
                        <Button size="sm" className="rounded-2xl"><Plus className="size-4 mr-1"/>New Invoice</Button>
                      </CardHeader>
                      <CardContent>
                        {active.financial.invoices.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No invoices yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-muted-foreground">
                                  <th className="py-2">Invoice #</th>
                                  <th>Issued</th>
                                  <th>Due</th>
                                  <th>Amount</th>
                                  <th>Paid</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {active.financial.invoices.map(inv => (
                                  <tr key={inv.id} className="border-t">
                                    <td className="py-2 font-medium">{inv.number}</td>
                                    <td>{inv.issued}</td>
                                    <td>{inv.due}</td>
                                    <td>{currency(inv.amount)}</td>
                                    <td>{currency(inv.paid)}</td>
                                    <td><Badge variant={inv.status==="Paid"?"default": inv.status==="Open"?"secondary":"outline"}>{inv.status}</Badge></td>
                                    <td className="whitespace-nowrap">
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>previewInvoice(inv)}>Preview/Print</Button>
                                        <Button size="sm" className="rounded-2xl" onClick={()=>emailInvoice(inv)}>Email</Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                      <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-100 rounded-xl p-3">
                            <div className="text-xs text-muted-foreground">Total Paid</div>
                            <div className="text-lg font-semibold">{currency(financialSummary.paid)}</div>
                          </div>
                          <div className="bg-gray-100 rounded-xl p-3">
                            <div className="text-xs text-muted-foreground">Open Balance</div>
                            <div className="text-lg font-semibold">{currency(financialSummary.open)}</div>
                          </div>
                          <div className="bg-gray-100 rounded-xl p-3">
                            <div className="text-xs text-muted-foreground">Trust Balance</div>
                            <div className="text-lg font-semibold">{currency(active.financial.trustBalance)}</div>
                          </div>
                          <div className="bg-gray-100 rounded-xl p-3">
                            <div className="text-xs text-muted-foreground">Outstanding (All)</div>
                            <div className="text-lg font-semibold">{currency(active.financial.outstanding)}</div>
                          </div>
                        </div>
                        <Separator className="my-4"/>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={active.financial.invoices.map(i=>({ name: i.number, amount: i.amount, paid: i.paid }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="amount" />
                              <Bar dataKey="paid" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No client selected.</div>
          )}
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 pb-8 pt-2 text-xs text-muted-foreground">
        Built for demonstration purposes. Replace mock data with your API/database of choice.
      </footer>
    </div>
  );
}
