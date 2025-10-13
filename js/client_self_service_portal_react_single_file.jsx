import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, FileText, MessageSquare, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

// ------- Utilities -------
const uid = () => Math.random().toString(36).slice(2,9);
const currency = (n:number) => n.toLocaleString(undefined, { style: "currency", currency: "CAD" });

// ------- Demo Data (client-facing) -------
const seedClient = () => ({
  id: uid(),
  name: "Acme Imports Ltd.",
  contact: { email: "gc@acmeimports.com", phone: "+1 (416) 555-0112" },
  notes: "Client-facing portal demo.",
  matters: [
    { id: uid(), title: "Acme v. Northport Logistics", number: "CV-24-1182", status: "Open", court: "Ontario Superior Court", nextMilestone: "Discoveries", nextDate: "2025-11-14" },
  ],
  hearings: [
    { id: uid(), date: "2025-10-21", time: "10:00", court: "ONSC (Toronto)", caseNumber: "CV-24-1182", appearanceType: "Case Conference" },
  ],
  messages: [
    { id: uid(), from: "Attorney", text: "Welcome to your client portal.", at: new Date().toISOString() },
  ],
  documents: [
    { id: uid(), name: "Retainer Agreement.pdf", type: "pdf", size: 188000, uploadedAt: "2025-09-02" },
  ],
  financial: {
    invoices: [
      { id: uid(), number: "INV-2025-101", issued: "2025-09-15", due: "2025-10-15", amount: 4800, paid: 3000, status: "Partially Paid" },
      { id: uid(), number: "INV-2025-124", issued: "2025-10-05", due: "2025-11-05", amount: 3200, paid: 0, status: "Open" },
    ],
    trustBalance: 2500,
  },
});

// ------- Component -------
export default function ClientPortalPublic() {
  const [client, setClient] = useState(() => {
    try { const saved = localStorage.getItem("client.portal"); return saved ? JSON.parse(saved) : seedClient(); } catch { return seedClient(); }
  });
  React.useEffect(()=>{ try { localStorage.setItem("client.portal", JSON.stringify(client)); } catch {} }, [client]);

  const [tab, setTab] = useState("matters");
  const [newMsg, setNewMsg] = useState("");
  // --- External Email Integrations (Gmail / Outlook)
  const [emailConn, setEmailConn] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('client.emailConn')||'{}'); } catch { return {}; }
  });
  React.useEffect(()=>{ try { localStorage.setItem('client.emailConn', JSON.stringify(emailConn)); } catch {} }, [emailConn]);
  const [msgFilter, setMsgFilter] = useState<'all'|'portal'|'email'>('all');

  const connectGoogle = () => {
    // In production: redirect to your backend OAuth endpoint
    // window.location.href = '/api/oauth/google/start?provider=gmail&portal=client';
    alert('Demo: Simulating Gmail connection. Replace with OAuth redirect to your backend.');
    setEmailConn((c:any)=>({...c, gmail:true}));
  };
  const connectOutlook = () => {
    // In production: redirect to Microsoft identity platform OAuth endpoint via your backend
    // window.location.href = '/api/oauth/outlook/start?provider=outlook&portal=client';
    alert('Demo: Simulating Outlook connection. Replace with OAuth redirect to your backend.');
    setEmailConn((c:any)=>({...c, outlook:true}));
  };

  const importEmailsDemo = () => {
    // Simulate pulling recent email thread and mapping into portal messages
    const now = new Date();
    const demo = [
      { id: uid(), from: 'Email (Gmail)', text: 'Subject: Retainer questions — Could you clarify the billing cycle?', at: new Date(now.getTime()-1000*60*60*24*3).toISOString() },
      { id: uid(), from: 'Attorney', text: 'Reply via email: Billing is monthly with detailed line items.', at: new Date(now.getTime()-1000*60*60*24*3 + 1000*60*30).toISOString() },
      { id: uid(), from: 'Email (Outlook)', text: 'Subject: Hearing date change — I am available next Wednesday.', at: new Date(now.getTime()-1000*60*60*24*1).toISOString() },
    ];
    setClient((c:any)=> ({ ...c, messages: [...c.messages, ...demo] }));
  };

  const filteredMessages = useMemo(()=>{
    const ordered = [...client.messages].sort((a:any,b:any)=> new Date(a.at).getTime()-new Date(b.at).getTime());
    if (msgFilter==='portal') return ordered.filter((m:any)=> m.from==='Client' || m.from==='Attorney');
    if (msgFilter==='email') return ordered.filter((m:any)=> String(m.from).startsWith('Email'));
    return ordered;
  }, [client.messages, msgFilter]);
  // --- Document Upload (client → firm) ---
  const onUpload = (files: FileList | null) => {
    if (!files) return;
    const uploaded = Array.from(files).map(f => ({ id: uid(), name: f.name, type: f.type.split('/')[1] || 'file', size: f.size, uploadedAt: new Date().toISOString().slice(0,10) }));
    setClient((c:any)=> ({ ...c, documents: [...c.documents, ...uploaded] }));
  };

  const financialSummary = useMemo(() => {
    const paid = client.financial.invoices.reduce((s,i)=>s+i.paid,0);
    const total = client.financial.invoices.reduce((s,i)=>s+i.amount,0);
    const open = total - paid;
    const outstandingInvoices = client.financial.invoices.filter(i=> i.amount>i.paid);
    return { paid, total, open, countOutstanding: outstandingInvoices.length };
  }, [client]);

  // ------- Messaging (client can send to attorney) -------
  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const msg = { id: uid(), from: "Client", text: newMsg.trim(), at: new Date().toISOString() };
    setClient((c:any)=> ({ ...c, messages: [...c.messages, msg] }));
    setNewMsg("");
  };

  // ------- Payments -------
  const [payOpen, setPayOpen] = useState(false);
  const [payDraft, setPayDraft] = useState<{invoiceId:string, amount:number, useTrust:boolean}>({ invoiceId: "", amount: 0, useTrust: false });

  const beginPay = (invoice:any) => {
    const balance = Math.max(0, invoice.amount - invoice.paid);
    setPayDraft({ invoiceId: invoice.id, amount: balance, useTrust: false });
    setPayOpen(true);
  };

  // Simulate trust application
  const applyTrust = (invoiceId:string, amount:number) => {
    setClient((c:any)=>{
      const inv = c.financial.invoices.find((i:any)=>i.id===invoiceId);
      if (!inv) return c;
      const apply = Math.min(amount, c.financial.trustBalance, Math.max(0, inv.amount - inv.paid));
      const paid = inv.paid + apply;
      const status = paid >= inv.amount ? "Paid" : paid>0 ? "Partially Paid" : "Open";
      return {
        ...c,
        financial: {
          ...c.financial,
          trustBalance: c.financial.trustBalance - apply,
          invoices: c.financial.invoices.map((i:any)=> i.id===invoiceId ? { ...i, paid, status } : i)
        }
      };
    });
  };

  // Simulate card checkout (replace with backend → Stripe/MercadoPago/etc.)
  const processCardPayment = async (invoiceId:string, amount:number) => {
    // Placeholder; integrate with backend to create Stripe Checkout Session, then redirect
    // const res = await fetch("/api/create-checkout-session", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ invoiceId, amountCents: Math.round(amount*100) })});
    // const { url } = await res.json(); window.location.href = url;
    // For demo: mark paid immediately
    setClient((c:any)=>{
      const inv = c.financial.invoices.find((i:any)=>i.id===invoiceId);
      if (!inv) return c;
      const paid = inv.paid + amount;
      const status = paid >= inv.amount ? "Paid" : paid>0 ? "Partially Paid" : "Open";
      return { ...c, financial: { ...c.financial, invoices: c.financial.invoices.map((i:any)=> i.id===invoiceId ? { ...i, paid, status } : i) } };
    });
    alert("Payment recorded (demo). Replace with real checkout to collect funds.");
  };

  const paySubmit = async () => {
    const invoice = client.financial.invoices.find((i:any)=>i.id===payDraft.invoiceId);
    if (!invoice) return;
    const balance = Math.max(0, invoice.amount - invoice.paid);
    const amt = Math.min(payDraft.amount, balance);
    if (amt <= 0) return setPayOpen(false);

    if (payDraft.useTrust) {
      applyTrust(invoice.id, amt);
    } else {
      await processCardPayment(invoice.id, amt);
    }
    setPayOpen(false);
  };

  const invoiceBuckets = useMemo(()=>{
    const paid = client.financial.invoices.filter(i=> i.status === "Paid");
    const partial = client.financial.invoices.filter(i=> i.status === "Partially Paid");
    const outstanding = client.financial.invoices.filter(i=> i.status === "Open" || (i.amount>i.paid));
    return { paid, partial, outstanding };
  }, [client.financial.invoices]);

  // ------- Render -------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-black text-white grid place-content-center font-semibold">C</div>
            <div>
              <h1 className="text-xl font-semibold">Client Portal</h1>
              <p className="text-xs text-muted-foreground">Access your matters, hearings, messages, and invoices.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.contact.email}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-muted-foreground">Trust Balance</div>
                <div className="text-lg font-semibold flex items-center gap-2"><Wallet className="size-4"/>{currency(client.financial.trustBalance)}</div>
              </div>
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-muted-foreground">Paid to Date</div>
                <div className="text-lg font-semibold">{currency(financialSummary.paid)}</div>
              </div>
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-muted-foreground">Outstanding Balance</div>
                <div className="text-lg font-semibold">{currency(financialSummary.open)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-5 rounded-2xl">
              <TabsTrigger value="matters">Matters</TabsTrigger>
              <TabsTrigger value="hearings">Hearings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Matters */}
            <TabsContent value="matters" className="mt-4">
              <Card className="rounded-2xl">
                <CardHeader><CardTitle className="text-base">Your Matters</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2">Title</th>
                          <th>Case #</th>
                          <th>Status</th>
                          <th>Court</th>
                          <th>Next Milestone</th>
                          <th>Next Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.matters.map((m:any) => (
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
                <CardHeader><CardTitle className="text-base">Upcoming Hearings</CardTitle></CardHeader>
                <CardContent>
                  {client.hearings.length===0 ? <p className="text-sm text-muted-foreground">No hearings scheduled.</p> : (
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
                          {client.hearings.map((h:any)=> (
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

            {/* Messages (chronological) */}
            <TabsContent value="messages" className="mt-4">
              <Card className="rounded-2xl">
                <CardHeader className="flex-row justify-between items-center">
                  <CardTitle className="text-base">Secure Messages</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={msgFilter} onValueChange={(v:any)=>setMsgFilter(v)}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Filter"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All (Portal + Email)</SelectItem>
                        <SelectItem value="portal">Portal Only</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="secondary" className="rounded-2xl" onClick={()=>{
                      const ordered = filteredMessages; let text = `Client Messages for ${client.name}

`;
                      ordered.forEach((m:any)=>{ text += `${new Date(m.at).toLocaleString()} | ${m.from}: ${m.text}
`; });
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href=url; a.download=`${client.name.replace(/[^a-z0-9]/gi,'_')}_messages.txt`; a.click(); URL.revokeObjectURL(url);
                    }}>Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex flex-wrap gap-2 items-center text-xs">
                    <div className={`px-2 py-1 rounded-full ${emailConn.gmail? 'bg-emerald-600 text-white':'bg-gray-200'}`}>Gmail {emailConn.gmail? 'Connected':'Not Connected'}</div>
                    <div className={`px-2 py-1 rounded-full ${emailConn.outlook? 'bg-emerald-600 text-white':'bg-gray-200'}`}>Outlook {emailConn.outlook? 'Connected':'Not Connected'}</div>
                    <Button size="sm" variant={emailConn.gmail? 'outline':'default'} className="rounded-2xl" onClick={connectGoogle}>{emailConn.gmail? 'Reconnect Gmail':'Connect Gmail'}</Button>
                    <Button size="sm" variant={emailConn.outlook? 'outline':'default'} className="rounded-2xl" onClick={connectOutlook}>{emailConn.outlook? 'Reconnect Outlook':'Connect Outlook'}</Button>
                    <Button size="sm" variant="outline" className="rounded-2xl" onClick={importEmailsDemo}>Import recent emails (demo)</Button>
                  </div>
                  <div className="h-72 overflow-y-auto rounded-xl border p-3 bg-white">
                    {filteredMessages.map((m:any)=> (
                      <div key={m.id} className={`max-w-[80%] mb-3 ${m.from==="Client"?"ml-auto":""}`}>
                        <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from==="Client"?"bg-gray-900 text-white": String(m.from).startsWith('Email')? 'bg-blue-50':'bg-gray-100'}`}>
                          <div className="text-xs opacity-70 mb-1">{m.from}</div>
                          <div>{m.text}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Input value={newMsg} onChange={(e)=>setNewMsg(e.target.value)} placeholder="Write a message to your lawyer…" />
                    <Button onClick={sendMessage} className="rounded-2xl" size="sm"><MessageSquare className="size-4 mr-1"/>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices */}
            <TabsContent value="invoices" className="mt-4">
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="rounded-2xl lg:col-span-2">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base">Your Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.financial.invoices.length===0 ? <p className="text-sm text-muted-foreground">No invoices available.</p> : (
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
                            {client.financial.invoices.map((inv:any)=> (
                              <tr key={inv.id} className="border-t">
                                <td className="py-2 font-medium">{inv.number}</td>
                                <td>{inv.issued}</td>
                                <td>{inv.due}</td>
                                <td>{currency(inv.amount)}</td>
                                <td>{currency(inv.paid)}</td>
                                <td><Badge variant={inv.status==="Paid"?"default": inv.status==="Open"?"secondary":"outline"}>{inv.status}</Badge></td>
                                <td className="whitespace-nowrap">
                                  <div className="flex gap-2">
                                    {inv.amount>inv.paid && (
                                      <Button size="sm" className="rounded-2xl" onClick={()=>beginPay(inv)}><CreditCard className="size-4 mr-1"/>Pay Now</Button>
                                    )}
                                    {client.financial.trustBalance>0 && inv.amount>inv.paid && (
                                      <Button size="sm" variant="secondary" className="rounded-2xl" onClick={()=>applyTrust(inv.id, Math.max(0, inv.amount - inv.paid))}><ShieldCheck className="size-4 mr-1"/>Apply Trust</Button>
                                    )}
                                    <Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>{
                                      const data = `Invoice ${inv.number}
Issued: ${inv.issued}
Due: ${inv.due}
Amount: ${currency(inv.amount)}
Paid: ${currency(inv.paid)}
Status: ${inv.status}`;
                                      const blob = new Blob([data], {type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${inv.number}.txt`; a.click(); URL.revokeObjectURL(url);
                                    }}><Download className="size-4 mr-1"/>Receipt</Button>
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
                        <div className="text-xs text-muted-foreground">Trust Balance</div>
                        <div className="text-lg font-semibold">{currency(client.financial.trustBalance)}</div>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground">Outstanding</div>
                        <div className="text-lg font-semibold">{currency(financialSummary.open)}</div>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground">Paid to Date</div>
                        <div className="text-lg font-semibold">{currency(financialSummary.paid)}</div>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground">Open Invoices</div>
                        <div className="text-lg font-semibold">{financialSummary.countOutstanding}</div>
                      </div>
                    </div>
                    <Separator className="my-4"/>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={client.financial.invoices.map((i:any)=>({ name: i.number, amount: i.amount, paid: i.paid }))}>
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

              {/* Payment Dialog */}
              <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Pay Invoice</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-2">
                    <Label>Amount</Label>
                    <Input type="number" min="0" step="0.01" value={payDraft.amount} onChange={(e)=> setPayDraft(s=>({ ...s, amount: Number(e.target.value) }))} />
                    <div className="flex items-center justify-between gap-3 text-sm bg-gray-50 rounded-xl p-3">
                      <div>
                        <div className="font-medium">Use Trust Balance</div>
                        <div className="text-xs text-muted-foreground">Available: {currency(client.financial.trustBalance)}</div>
                      </div>
                      <Select value={String(payDraft.useTrust)} onValueChange={(v)=> setPayDraft(s=>({ ...s, useTrust: v==='true' }))}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-xs text-muted-foreground">Card payments are processed securely. For demo purposes, this marks the invoice as paid without collecting funds.</div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={()=>setPayOpen(false)}>Cancel</Button>
                    <Button onClick={paySubmit}><CreditCard className="size-4 mr-1"/>Continue <ArrowRight className="size-4 ml-1"/></Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="mt-4">
              <Card className="rounded-2xl">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Documents</CardTitle>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm px-3 py-2 border rounded-xl hover:bg-gray-50">
                    Upload
                    <input type="file" multiple className="hidden" onChange={(e)=>onUpload(e.target.files)} />
                  </label>
                </CardHeader>
                <CardContent>
                  {client.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {client.documents.map((d:any) => (
                        <div key={d.id} className="border rounded-2xl p-3 bg-white flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium truncate max-w-[14rem]" title={d.name}>{d.name}</div>
                            <div className="text-xs text-muted-foreground">{(d.type || 'FILE').toUpperCase()} • {(d.size/1024).toFixed(1)} KB • {d.uploadedAt}</div>
                          </div>
                          <Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>{
                            const blob = new Blob([`Placeholder for ${d.name}`], {type:'text/plain'});
                            const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=d.name; a.click(); URL.revokeObjectURL(url);
                          }}>Download</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto px-4 pb-8 pt-2 text-xs text-muted-foreground">
        Client-facing demo. Hook up to your authentication + billing backend (e.g., Stripe) for production.
      </footer>
    </div>
  );
}
