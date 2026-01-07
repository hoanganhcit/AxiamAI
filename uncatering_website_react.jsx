import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Users,
  ShieldCheck,
  ChefHat,
  Truck,
  Salad,
  Star,
  Check,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  X,
  Plus,
  Minus,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// -------- Mock Data ----------
// Added distanceKm to support "closest vendors" grouping logic
const restaurants = [
  {
    name: "Saffron & Steam",
    cuisine: "Indian Fusion",
    distanceKm: 1.2,
    img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Bento Planet",
    cuisine: "Japanese",
    distanceKm: 2.8,
    img: "https://images.unsplash.com/photo-1604908554007-089840f0b30d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Verdant Bowl",
    cuisine: "Vegan",
    distanceKm: 0.9,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Tortilla Republic",
    cuisine: "Mexican",
    distanceKm: 11.4,
    img: "https://images.unsplash.com/photo-1601050690597-9d5e5f2a3c80?q=80&w=1200&auto=format&fit=crop",
  },
];

const menuItems = [
  { title: "Grilled Chicken Power Bowl", tags: ["GF", "High‑Protein"], calories: 620 },
  { title: "Miso Tofu Bento", tags: ["Vegan", "Low‑Sugar"], calories: 480 },
  { title: "Beef Bulgogi & Rice", tags: ["Dairy‑Free"], calories: 710 },
  { title: "Harissa Roasted Veg & Halloumi", tags: ["Veg", "GF"], calories: 540 },
];

// Catalog used by the Order flow
const catalog: Record<string, { id: string; name: string; price: number; tags?: string[] }[]> = {
  "Saffron & Steam": [
    { id: "ss1", name: "Butter Chicken Bowl", price: 16.5, tags: ["GF"] },
    { id: "ss2", name: "Chana Masala (V)", price: 13.0, tags: ["Vegan"] },
    { id: "ss3", name: "Tandoori Paneer Wrap", price: 14.5 },
  ],
  "Bento Planet": [
    { id: "bp1", name: "Salmon Teriyaki Bento", price: 18.0 },
    { id: "bp2", name: "Miso Tofu Bento", price: 14.0, tags: ["Vegan"] },
    { id: "bp3", name: "Chicken Karaage Bowl", price: 16.0 },
  ],
  "Verdant Bowl": [
    { id: "vb1", name: "Falafel Rainbow Bowl", price: 13.5, tags: ["Vegan"] },
    { id: "vb2", name: "Tahini Cauli Power", price: 14.5, tags: ["GF", "Veg"] },
    { id: "vb3", name: "Smoky Tempeh Greens", price: 15.0, tags: ["Vegan"] },
  ],
  "Tortilla Republic": [
    { id: "tr1", name: "Chicken Burrito", price: 12.5 },
    { id: "tr2", name: "Veggie Burrito (V)", price: 11.5, tags: ["Vegan"] },
    { id: "tr3", name: "Carnitas Bowl", price: 13.5, tags: ["GF"] },
  ],
};

const faqs = [
  {
    q: "What is Uncatering?",
    a: "A modern office meal program where each teammate orders an individual meal from rotating local restaurants—delivered together, labelled by name.",
  },
  {
    q: "How do budgets work?",
    a: "Set per‑person daily or weekly budgets. Teammates see their allowance at checkout and can top‑up personally if they wish.",
  },
  {
    q: "Can you handle dietary restrictions?",
    a: "Yes. Filters for vegan, vegetarian, halal, gluten‑free, and allergy notes are built‑in and passed to restaurants.",
  },
  {
    q: "What group sizes do you support?",
    a: "From teams of 10 to offices of 500+. We scale delivery waves to your building and timing preferences.",
  },
];

// --------- UI helpers ----------
const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how", label: "How it works" },
    { href: "#why", label: "Why Uncatering" },
    { href: "#restaurants", label: "Restaurants" },
    { href: "#order", label: "Order" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <div className="fixed top-0 inset-x-0 z-50 backdrop-blur bg-white/70 border-b">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <UtensilsCrossed className="h-5 w-5" />
          <span>Uncatering</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Button asChild>
            <a href="#get-started">Get started</a>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </nav>
      {open && (
        <div className="md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-3 top-3 bg-white rounded-2xl p-4 shadow-xl w-[86vw] max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold">
                <UtensilsCrossed className="h-5 w-5" />
                Uncatering
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid gap-3">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm px-2 py-2 rounded-lg hover:bg-muted">
                  {l.label}
                </a>
              ))}
              <Button asChild className="mt-2">
                <a href="#get-started" onClick={() => setOpen(false)}>Get started</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28">
      <div className="absolute -z-10 inset-0 bg-gradient-to-b from-emerald-50 via-white to-white" />
      <div className="mx-auto max-w-7xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge className="mb-4" variant="secondary">New</Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Order individually. <span className="text-emerald-600">Eat as a team.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Uncatering is an office meal program that lets everyone choose their own lunch from rotating local restaurants—delivered together, labelled by name.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild>
              <a href="#get-started" className="inline-flex items-center gap-2">
                Start free trial <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#how" className="inline-flex items-center gap-2">
                See how it works
              </a>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4" /> Individually sealed</div>
            <div className="flex items-center justify-center gap-2"><Clock className="h-4 w-4" /> On‑time delivery windows</div>
            <div className="flex items-center justify-center gap-2"><Users className="h-4 w-4" /> 10–500+ people</div>
            <div className="flex items-center justify-center gap-2"><Star className="h-4 w-4" /> 4.8★ avg meal rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <ShoppingBag className="h-5 w-5" />, title: "Set budgets & invite", desc: "Create your workspace, set per‑person budgets, and invite teammates." },
    { icon: <Menu className="h-5 w-5" />, title: "Everyone chooses", desc: "Teammates pick from a rotating menu with dietary filters and add‑ons." },
    { icon: <ChefHat className="h-5 w-5" />, title: "Made to order", desc: "Local restaurants prepare meals to spec—no buffet trays." },
    { icon: <Truck className="h-5 w-5" />, title: "Delivered together", desc: "Meals arrive labelled by name at your chosen time window." },
  ];
  return (
    <section id="how" className="py-20 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.h2 variants={item} className="text-3xl md:text-4xl font-semibold text-center">
            How it works
          </motion.h2>
          <motion.p variants={item} className="mt-2 text-center text-muted-foreground max-w-2xl mx-auto">
            Launch in minutes. Enjoy forever.
          </motion.p>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={item} className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">{s.icon}</div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Restaurants() {
  const sorted = [...restaurants].sort((a, b) => a.distanceKm - b.distanceKm);
  return (
    <section id="restaurants" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold">Restaurants we partner with</h2>
            <p className="text-muted-foreground mt-1">Closest first, based on sample distances.</p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">See full roster</Button>
        </div>
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          {sorted.map((r) => (
            <Card key={r.name} className="overflow-hidden">
              <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
                <img src={r.img} alt={r.name} className="h-full w-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{r.name}</span>
                  <Badge variant="secondary">{r.distanceKm} km</Badge>
                </CardTitle>
                <CardDescription>{r.cuisine}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuShowcase() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">This week’s hits</h2>
        <p className="text-muted-foreground text-center mt-2">A small taste of the variety your team gets every week.</p>
        <div className="mt-10 grid md:grid-cols-4 gap-6">
          {menuItems.map((m) => (
            <Card key={m.title}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <Salad className="h-5 w-5 mt-0.5" /> {m.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-2">
                  {m.tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">~{m.calories} kcal</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- ORDER SECTION -----------------

const MAX_DISTANCE_KM = 10;

type CartItem = { id: string; name: string; vendor: string; price: number; qty: number; notes?: string };

type Vendor = { name: string; distanceKm: number };

export function selectClosestWithin(vendors: Vendor[], limit: number, maxKm: number) {
  return vendors
    .filter((v) => v.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, Math.max(0, limit))
    .map((v) => v.name);
}

function calcTotal(items: CartItem[]) {
  return Number(items.reduce((sum, it) => sum + it.price * it.qty, 0).toFixed(2));
}

// Business rule: vendor limit by team size
export function allowedVendorsByTeamSize(teamSize: number) {
  if (teamSize <= 20) return 1;
  if (teamSize > 20 && teamSize <= 40) return 2;
  if (teamSize > 40 && teamSize <= 80) return 3;
  if (teamSize > 80 && teamSize <= 100) return 4; // confirmed
  if (teamSize > 100) return 5;
  return 1;
}

function OrderSection() {
  const [teamSize, setTeamSize] = useState<number | "">(10);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [allowance, setAllowance] = useState<number | "">(15);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dietNotes, setDietNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const vendorLimit = useMemo(() => allowedVendorsByTeamSize(Number(teamSize || 0)), [teamSize]);
  const sortedVendors = useMemo(() => [...restaurants].sort((a, b) => a.distanceKm - b.distanceKm), []);
  const nearVendors = useMemo(() => sortedVendors.filter((v) => v.distanceKm <= MAX_DISTANCE_KM), [sortedVendors]);

  // Auto-select closest vendors within 10km up to the limit
  React.useEffect(() => {
    const auto = selectClosestWithin(nearVendors, vendorLimit, MAX_DISTANCE_KM);
    setSelectedVendors(auto);
  }, [vendorLimit, nearVendors]);

  const availableMenus = useMemo(() => {
    const vendors = selectedVendors.length > 0 ? selectedVendors : [];
    return vendors.flatMap((v) => (catalog[v] || []).map((it) => ({ ...it, vendor: v })));
  }, [selectedVendors]);

  const subtotal = useMemo(() => calcTotal(cart), [cart]);
  const overage = useMemo(() => {
    const a = allowance === "" ? 0 : Number(allowance);
    return Math.max(0, Number((subtotal - a).toFixed(2)));
  }, [subtotal, allowance]);

  const toggleVendor = (v: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedVendors((curr) => {
      if (curr.includes(v)) return curr.filter((x) => x !== v);
      if (curr.length >= vendorLimit) return curr; // enforce max
      return [...curr, v];
    });
  };

  const addItem = (it: { id: string; name: string; price: number; vendor: string }) => {
    setCart((c) => {
      const key = `${it.vendor}:${it.id}`;
      const idx = c.findIndex((x) => `${x.vendor}:${x.id}` === key);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...c, { id: it.id, name: it.name, vendor: it.vendor, price: it.price, qty: 1 }];
    });
  };
  const decItem = (vendor: string, id: string) => {
    setCart((c) => c.map((x) => (x.vendor === vendor && x.id === id ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0));
  };
  const removeItem = (vendor: string, id: string) => setCart((c) => c.filter((x) => !(x.vendor === vendor && x.id === id)));

  const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const canSubmit = () => {
    return (
      name.trim() && isEmail(email) && cart.length > 0 && date && time && (allowance !== "" && Number(allowance) > 0)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return alert("Please complete all required fields and add at least one item.");
    const payload = {
      employee: { name, email, dietNotes },
      teamSize: Number(teamSize || 0),
      vendorLimit,
      selectedVendors,
      order: {
        date,
        time,
        allowance: Number(allowance),
        items: cart,
        subtotal,
        overage,
      },
    };
    console.log("Uncatering ORDER", payload);
    alert(`Order created! Vendors used: ${selectedVendors.length} / ${vendorLimit}. Subtotal: $${subtotal.toFixed(2)}${overage > 0 ? ` (over by $${overage.toFixed(2)})` : ""}`);
    setCart([]);
  };

  const limitReached = selectedVendors.length >= vendorLimit;

  return (
    <section id="order" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold">Create your order</h2>
            <p className="text-muted-foreground mt-1">Vendors auto-selected by proximity (≤ {MAX_DISTANCE_KM} km) up to your team-size limit.</p>
            <div className="mt-3 text-sm inline-flex items-center gap-2 p-2 rounded-lg border bg-card">
              <Info className="h-4 w-4" />
              <span>
                Team size: {teamSize || 0} → Allowed vendors: <span className="font-medium">{vendorLimit}</span>
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>≤ 20 → 1 vendor</div>
            <div>21–40 → 2 vendors</div>
            <div>41–80 → 3 vendors</div>
            <div>81–100 → 4 vendors</div>
            <div>≥ 101 → 5 vendors</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm">Team size</label>
            <Input type="number" value={teamSize as number | ""} onChange={(e) => setTeamSize(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Allowance (company)</label>
            <Input type="number" value={allowance as number | ""} onChange={(e) => setAllowance(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Delivery date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Delivery time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendors within {MAX_DISTANCE_KM} km</CardTitle>
              <CardDescription>Auto-selected closest vendors up to {vendorLimit}. You can deselect/reselect within the limit.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedVendors.map((r) => {
                  const inRange = r.distanceKm <= MAX_DISTANCE_KM;
                  const checked = selectedVendors.includes(r.name);
                  const disabled = (!inRange) || (!checked && limitReached);
                  return (
                    <label key={r.name} className={`border rounded-xl p-4 flex items-center justify-between ${disabled && !checked ? "opacity-50" : ""}`} title={!inRange ? `Outside ${MAX_DISTANCE_KM} km` : undefined}>
                      <div>
                        <div className="font-medium flex items-center gap-2">{r.name} <Badge variant="secondary">{r.distanceKm} km</Badge></div>
                        <div className="text-sm text-muted-foreground">{r.cuisine}</div>
                      </div>
                      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleVendor(r.name, disabled)} />
                    </label>
                  );
                })}
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Menu</div>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableMenus.map((it) => (
                    <div key={`${it.vendor}:${it.id}`} className="border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">{it.vendor} • ${it.price.toFixed(2)} {it.tags && it.tags.length > 0 && (
                          <span className="inline-flex gap-1">{it.tags.map((t: string) => (<Badge key={t} variant="secondary">{t}</Badge>))}</span>
                        )}</div>
                      </div>
                      <Button size="sm" onClick={() => addItem(it as any)} className="inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your cart</CardTitle>
              <CardDescription>Review items and checkout</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {cart.length === 0 ? (
                <div className="text-sm text-muted-foreground">No items yet.</div>
              ) : (
                <div className="grid gap-3">
                  {cart.map((c) => (
                    <div key={`${c.vendor}:${c.id}`} className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.vendor} • ${c.price.toFixed(2)} × {c.qty}</div>
                        <Textarea
                          className="mt-2"
                          placeholder="Add notes (e.g., no onions)"
                          value={c.notes || ""}
                          onChange={(e) => setCart((prev) => prev.map((x) => (x.vendor === c.vendor && x.id === c.id ? { ...x, notes: e.target.value } : x)))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => decItem(c.vendor, c.id)} aria-label="Decrease"><Minus className="h-4 w-4" /></Button>
                        <div className="w-8 text-center">{c.qty}</div>
                        <Button variant="outline" size="icon" onClick={() => addItem(c)} aria-label="Increase"><Plus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(c.vendor, c.id)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-3 text-sm grid gap-1">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Allowance</span><span>${(allowance === "" ? 0 : Number(allowance)).toFixed(2)}</span></div>
                {overage > 0 && (
                  <div className="flex justify-between text-red-600 font-medium"><span>Overage</span><span>${overage.toFixed(2)}</span></div>
                )}
              </div>
              <form className="grid gap-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Your name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
                  </div>
                  <div>
                    <label className="text-sm">Your email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm">Dietary notes (optional)</label>
                  <Textarea value={dietNotes} onChange={(e) => setDietNotes(e.target.value)} placeholder="e.g., peanut allergy, gluten‑free" />
                </div>
                <Button disabled={!canSubmit()} type="submit" className="w-full">Create order</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote: "The team actually looks forward to lunch now. Setup took 10 minutes, and delivery has been spot‑on.",
      author: "Alex P., Office Manager",
    },
    {
      quote: "Finally something that respects allergies and preferences without turning lunch into admin.",
      author: "Maya R., People Ops",
    },
  ];
  return (
    <section className="py-20 bg-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">Loved by modern teams</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {quotes.map((q, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-lg leading-relaxed">
                “{q.quote}”
                <div className="mt-4 text-sm text-muted-foreground">{q.author}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">FAQs</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// Simple client-side validation for the admin form
function validateAdminForm(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  teamSize: number | "";
  meal: "Breakfast" | "Lunch" | "Dinner" | "";
  date: string;
  time: string;
  cadence: "Daily" | "Weekly" | "";
  allowance: number | "";
  cuisines: string[];
}) {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push("Admin name is required");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.push("Valid email is required");
  if (!data.company.trim()) errors.push("Company is required");
  if (!data.teamSize || Number(data.teamSize) <= 0) errors.push("Team size must be greater than 0");
  if (!data.meal) errors.push("Please select a meal (breakfast/lunch/dinner)");
  if (!data.date) errors.push("Please choose a delivery date");
  if (!data.time) errors.push("Please choose a delivery time");
  if (!data.cadence) errors.push("Please select ordering cadence (daily/weekly)");
  if (data.allowance === "" || Number(data.allowance) <= 0) errors.push("Allowance must be greater than 0");
  return errors;
}

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    teamSize: "" as number | "",
    meal: "" as "Breakfast" | "Lunch" | "Dinner" | "",
    date: "",
    time: "",
    cadence: "" as "Daily" | "Weekly" | "",
    allowance: "" as number | "",
    cuisines: [] as string[],
    notes: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const toggleCuisine = (c: string) => {
    setForm((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c)
        ? f.cuisines.filter((x) => x !== c)
        : [...f.cuisines, c],
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAdminForm(form);
    setErrors(errs);
    if (errs.length === 0) {
      // In real app, post to API/Email/CRM
      console.log("Uncatering admin submission", form);
      alert("Thanks! We received your details.");
    }
  };

  const cuisineOptions = [
    "Indian",
    "Japanese",
    "Mexican",
    "Italian",
    "Mediterranean",
    "American",
    "Thai",
    "Vegan",
  ];

  return (
    <section id="get-started" className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="order-2 md:order-1">
            <CardHeader>
              <CardTitle>Tell us about your office</CardTitle>
              <CardDescription>Share basics so we can configure Uncatering for your team.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                  <div className="font-medium mb-1">Please fix the following:</div>
                  <ul className="list-disc ml-5">
                    {errors.map((er) => (
                      <li key={er}>{er}</li>
                    ))}
                  </ul>
                </div>
              )}
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Office admin name</label>
                    <Input
                      placeholder="Jordan Lee"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Work email</label>
                    <Input
                      type="email"
                      placeholder="jordan@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Phone</label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Company</label>
                    <Input
                      placeholder="Acme Inc."
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Team size</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={form.teamSize as number | ""}
                      onChange={(e) => setForm({ ...form, teamSize: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Meal</label>
                    <select
                      className="w-full border rounded-md h-10 px-3 text-sm"
                      value={form.meal}
                      onChange={(e) => setForm({ ...form, meal: e.target.value as any })}
                    >
                      <option value="">Select…</option>
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm">Delivery date</label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Delivery time</label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Ordering cadence</label>
                    <select
                      className="w-full border rounded-md h-10 px-3 text-sm"
                      value={form.cadence}
                      onChange={(e) => setForm({ ...form, cadence: e.target.value as any })}
                    >
                      <option value="">Select…</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Per‑person allowance (budget)</label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={form.allowance as number | ""}
                      onChange={(e) => setForm({ ...form, allowance: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Preferred cuisines</label>
                    <div className="grid grid-cols-2 gap-2 text-sm border rounded-md p-3">
                      {cuisineOptions.map((c) => (
                        <label key={c} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.cuisines.includes(c)}
                            onChange={() => toggleCuisine(c)}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm">Anything else we should know?</label>
                  <Textarea
                    placeholder="e.g., allergy policy, building access, delivery dock details"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button className="w-full" type="submit">Submit details</Button>
              </form>
            </CardContent>
          </Card>
          <div className="order-1 md:order-2 flex flex-col justify-center rounded-2xl border bg-card p-8">
            <div className="text-sm text-muted-foreground">CONTACT</div>
            <h3 className="text-2xl font-semibold mt-2">We’re nearby and ready to roll</h3>
            <p className="text-muted-foreground mt-2">
              Serving major Canadian hubs with expanding coverage. Delivery waves tuned to your building.
            </p>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Toronto & GTA, Kitchener/Waterloo, Calgary, Greater Vancouver</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@uncatering.example</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> (555) 123‑4567</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UtensilsCrossed className="h-4 w-4" /> © {new Date().getFullYear()} Uncatering
        </div>
        <div className="text-sm text-muted-foreground">Made for teams that lunch better.</div>
      </div>
    </footer>
  );
}

export default function UncateringSite() {
  // ---- Runtime tests ----
  React.useEffect(() => {
    // Vendor limit tests
    console.assert(allowedVendorsByTeamSize(5) === 1, "Limit Test: <=20 should be 1");
    console.assert(allowedVendorsByTeamSize(25) === 2, "Limit Test: 21–40 should be 2");
    console.assert(allowedVendorsByTeamSize(60) === 3, "Limit Test: 41–80 should be 3");
    console.assert(allowedVendorsByTeamSize(90) === 4, "Limit Test: 81–100 should be 4");
    console.assert(allowedVendorsByTeamSize(150) === 5, "Limit Test: >=101 should be 5");

    // selectClosestWithin tests
    const vendors: Vendor[] = [
      { name: "A", distanceKm: 0.5 },
      { name: "B", distanceKm: 5 },
      { name: "C", distanceKm: 12 },
      { name: "D", distanceKm: 2 },
    ];
    const pick2 = selectClosestWithin(vendors, 2, 10);
    console.assert(JSON.stringify(pick2) === JSON.stringify(["A", "D"]), `Auto-select Test failed: got ${JSON.stringify(pick2)}`);

    // Cart total tests
    const c: CartItem[] = [
      { id: "a", vendor: "V1", name: "Item A", price: 10, qty: 1 },
      { id: "b", vendor: "V2", name: "Item B", price: 5.25, qty: 2 },
    ];
    console.assert(calcTotal(c) === 20.5, `Order Test 1 failed: got ${calcTotal(c)}`);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Restaurants />
        <MenuShowcase />
        <OrderSection />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
