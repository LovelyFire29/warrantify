import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Armchair,
  FileText,
  Headphones,
  Image as ImageIcon,
  Laptop,
  Package,
  Smartphone,
  Sparkles,
  Tv,
  UploadCloud,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { computeEndDate, useRegisterDevice } from "@/hooks/use-register-device";
import { formatDate } from "@/lib/warranty";
import { PageHeader } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/devices/new")({
  head: () => ({
    meta: [
      { title: "Register a Device — Warrantify" },
      {
        name: "description",
        content:
          "Register a new household device with purchase details, warranty coverage and supporting documents.",
      },
      { property: "og:title", content: "Register a Device — Warrantify" },
      {
        property: "og:description",
        content: "Add purchase info, warranty duration and invoices for a new device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterDevicePage,
});

const categories = [
  { value: "Laptop", icon: Laptop },
  { value: "Phone", icon: Smartphone },
  { value: "TV", icon: Tv },
  { value: "Audio", icon: Headphones },
  { value: "Appliance", icon: Wrench },
  { value: "Furniture", icon: Armchair },
  { value: "Other", icon: Package },
] as const;

const warrantyTypes = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "extended", label: "Extended" },
  { value: "retailer", label: "Retailer" },
  { value: "insurance", label: "Insurance" },
];

const emptyForm = {
  name: "",
  brand: "",
  model: "",
  model_number: "",
  serial_number: "",
  category: "",
  purchase_date: "",
  purchase_price: "",
  seller: "",
  invoice_number: "",
  warranty_type: "manufacturer",
  duration: "12",
  duration_unit: "months" as "months" | "years",
};

function SectionCard({
  title,
  description,
  children,
  delay,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <section
      className="card-surface animate-fade-up p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
  full,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("grid gap-1.5", full && "sm:col-span-2")}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function RegisterDevicePage() {
  const navigate = useNavigate();
  const register = useRegisterDevice();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [aiDragging, setAiDragging] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "reading" | "done">("idle");
  const docInput = useRef<HTMLInputElement>(null);
  const aiInput = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof emptyForm) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const endDate = computeEndDate(form.purchase_date, form.duration, form.duration_unit);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    // Copy now: `input.files` is a live list that Chromium empties when the input is reset
    // (the file picker does that right after calling us), and the updater below runs later.
    const picked = Array.from(incoming);
    setFiles((prev) => [...prev, ...picked]);
  };

  /** Placeholder extraction — real invoice parsing gets wired up separately. */
  const runAutoFill = (file: File) => {
    setAiState("reading");
    setFiles((prev) => [...prev, file]);
    window.setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        name: prev.name || "Samsung 55\" QLED TV",
        brand: prev.brand || "Samsung",
        model: prev.model || "Q60D",
        model_number: prev.model_number || "QA55Q60DAULXL",
        category: prev.category || "TV",
        purchase_date: prev.purchase_date || new Date().toISOString().slice(0, 10),
        purchase_price: prev.purchase_price || "649",
        seller: prev.seller || "Best Buy",
        invoice_number: prev.invoice_number || "INV-2026-04182",
        duration: "24",
        duration_unit: "months",
      }));
      setAiState("done");
      toast.success("We filled in what we found on the invoice.", {
        description: "Double-check the details before saving.",
      });
    }, 1200);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Device name is required.");
      return;
    }
    register.mutate(
      { ...form, files },
      {
        onSuccess: ({ deviceId, failedFiles }) => {
          toast.success(`${form.name.trim()} registered.`);
          if (failedFiles.length > 0) {
            toast.error(
              `${failedFiles.length === 1 ? failedFiles[0] : `${failedFiles.length} files`} couldn't be uploaded.`,
              { description: "You can add files from the Documents tab on the device page." },
            );
          }
          navigate({ to: "/devices/$deviceId", params: { deviceId } });
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Could not register the device."),
      },
    );
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <Breadcrumb className="animate-fade-up">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/devices">Devices</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Register device</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          className="mt-4"
          title="Register a device"
          subtitle="Capture purchase and warranty details so Warrantify can track coverage for you."
        />

        {/* AI auto-fill callout */}
        <section
          className="animate-fade-up mt-6"
          style={{ animationDelay: "60ms" }}
          onDragOver={(event) => {
            event.preventDefault();
            setAiDragging(true);
          }}
          onDragLeave={() => setAiDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setAiDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) runAutoFill(file);
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => aiInput.current?.click()}
            className={cn(
              "h-auto w-full justify-start gap-4 whitespace-normal rounded-lg border border-dashed border-accent/50 bg-accent/5 p-4 text-left hover:border-accent hover:bg-accent/10",
              aiDragging && "border-accent bg-accent/15",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Sparkles className={cn("size-5", aiState === "reading" && "animate-pulse")} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-accent">AI Auto-fill from Invoice</span>
              <span className="block text-sm text-muted-foreground">
                {aiState === "reading"
                  ? "Reading your invoice…"
                  : aiState === "done"
                    ? "Fields filled from your invoice — review them below."
                    : "Upload an invoice and we'll fill this form for you."}
              </span>
            </span>
          </Button>
          <input
            ref={aiInput}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) runAutoFill(file);
              event.target.value = "";
            }}
          />
        </section>

        <form onSubmit={submit} className="mt-6 grid gap-6">
          <SectionCard
            title="Device Details"
            description="What is it, and how do we identify it?"
            delay={100}
          >
            <Field id="name" label="Device name" full>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="MacBook Pro 14”" />
            </Field>
            <Field id="brand" label="Brand">
              <Input id="brand" value={form.brand} onChange={set("brand")} placeholder="Apple" />
            </Field>
            <Field id="model" label="Model">
              <Input id="model" value={form.model} onChange={set("model")} placeholder="M3 Pro" />
            </Field>
            <Field id="model_number" label="Model number">
              <Input
                id="model_number"
                value={form.model_number}
                onChange={set("model_number")}
                placeholder="MRX33HN/A"
              />
            </Field>
            <Field id="serial_number" label="Serial / IMEI">
              <Input
                id="serial_number"
                value={form.serial_number}
                onChange={set("serial_number")}
                placeholder="C02X1234JGH7"
              />
            </Field>
            <Field id="category" label="Category" full>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ value, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <Icon className="size-4 text-accent" /> {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </SectionCard>

          <SectionCard
            title="Purchase Info"
            description="Proof of purchase makes claims far easier."
            delay={140}
          >
            <Field id="purchase_date" label="Purchase date">
              <Input
                id="purchase_date"
                type="date"
                value={form.purchase_date}
                onChange={set("purchase_date")}
              />
            </Field>
            <Field id="purchase_price" label="Price">
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={form.purchase_price}
                onChange={set("purchase_price")}
                placeholder="1999.00"
              />
            </Field>
            <Field id="seller" label="Seller">
              <Input id="seller" value={form.seller} onChange={set("seller")} placeholder="Apple Store" />
            </Field>
            <Field id="invoice_number" label="Invoice number">
              <Input
                id="invoice_number"
                value={form.invoice_number}
                onChange={set("invoice_number")}
                placeholder="INV-2026-00123"
              />
            </Field>
          </SectionCard>

          <SectionCard
            title="Warranty"
            description="We compute Active / Expiring Soon / Expired from the end date."
            delay={180}
          >
            <Field id="warranty_type" label="Warranty type">
              <Select
                value={form.warranty_type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, warranty_type: value }))}
              >
                <SelectTrigger id="warranty_type">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {warrantyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="duration" label="Duration">
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={set("duration")}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 rounded-md border border-border p-1">
                  {(["months", "years"] as const).map((unit) => (
                    <Button
                      key={unit}
                      type="button"
                      size="sm"
                      variant={form.duration_unit === unit ? "secondary" : "ghost"}
                      aria-pressed={form.duration_unit === unit}
                      onClick={() => setForm((prev) => ({ ...prev, duration_unit: unit }))}
                    >
                      {unit === "months" ? "Months" : "Years"}
                    </Button>
                  ))}
                </div>
              </div>
            </Field>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {endDate
                ? `Coverage ends ${formatDate(endDate)}.`
                : "Add a purchase date and duration to calculate the expiry date."}
            </p>
          </SectionCard>

          <section
            className="card-surface animate-fade-up p-6"
            style={{ animationDelay: "220ms" }}
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase">Documents</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Invoices, warranty cards, photos — drop them here.
            </p>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={cn(
                "mt-5 flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-10 text-center transition-colors",
                dragging && "border-accent bg-accent/10",
              )}
            >
              <UploadCloud className="size-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 text-sm">Drag & drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, PNG or JPG up to 10 MB each</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => docInput.current?.click()}
              >
                Browse files
              </Button>
              <input
                ref={docInput}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>

            {files.length > 0 && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {files.map((file, index) => {
                  const isImage = file.type.startsWith("image/");
                  return (
                    <li
                      key={`${file.name}-${index}`}
                      className="animate-fade-up group relative overflow-hidden rounded-lg border border-border bg-muted/40"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="flex h-24 items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <FileText className="size-8 text-accent" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 border-t border-border px-2.5 py-2">
                        {isImage ? (
                          <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate text-xs">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-1.5 right-1.5 size-7 bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-danger"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div
            className="animate-fade-up flex justify-end gap-3 pb-4"
            style={{ animationDelay: "260ms" }}
          >
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/devices" })}>
              Cancel
            </Button>
            <Button type="submit" disabled={register.isPending}>
              {register.isPending ? "Saving…" : "Save Device"}
            </Button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
