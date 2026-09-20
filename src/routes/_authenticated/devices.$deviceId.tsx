import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Download,
  Eye,
  FileText,
  MonitorSmartphone,
  Plus,
  QrCode,
  ShieldCheck,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteDevice, useDevices, type DeviceRow } from "@/hooks/use-devices";
import {
  documentFileName,
  getDocumentUrl,
  useCreateClaim,
  useDeleteDocument,
  useDeviceExtras,
  useUploadDocument,
  type DocumentRecord,
} from "@/hooks/use-device-detail";
import { daysRemaining, formatDate } from "@/lib/warranty";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingState, WarrantyStatusPill } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/devices/$deviceId")({
  head: () => ({
    meta: [
      { title: "Device details — Warrantify" },
      {
        name: "description",
        content: "Warranty timeline, documents, service history, and claims for a registered device.",
      },
      { property: "og:title", content: "Device details — Warrantify" },
      { property: "og:description", content: "Warranty coverage, documents, and claims for this device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeviceDetailPage,
});

const statusTone: Record<string, string> = {
  submitted: "bg-primary-soft text-primary border-primary/30",
  under_inspection: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  repaired: "bg-success/15 text-success border-success/30",
  under_repair: "bg-warning/15 text-warning border-warning/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
};

function prettyStatus(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function Pill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
        statusTone[status] ?? "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {prettyStatus(status)}
    </span>
  );
}

function DeviceDetailPage() {
  const { deviceId } = useParams({ from: "/_authenticated/devices/$deviceId" });
  const navigate = useNavigate();
  const { data: devices = [], isLoading } = useDevices();
  const deleteDevice = useDeleteDevice();
  const device = devices.find((item) => item.id === deviceId);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/devices">Devices</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{device?.name ?? "Device"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {isLoading && <LoadingState label="Loading device…" className="mt-6" />}

        {!isLoading && !device && (
          <EmptyState
            className="mt-6"
            icon={MonitorSmartphone}
            title="Device not found"
            description="It may have been deleted or belongs to another account."
            action={<Button asChild>
              <Link to="/devices">Back to devices</Link>
            </Button>}
          />
        )}

        {device && (
          <DeviceBody
            device={device}
            onDelete={() =>
              deleteDevice.mutate(device.id, {
                onSuccess: () => {
                  toast.success(`${device.name} deleted.`);
                  navigate({ to: "/devices" });
                },
                onError: () => toast.error("Could not delete this device."),
              })
            }
          />
        )}
      </main>
    </AppShell>
  );
}

function DeviceBody({ device, onDelete }: { device: DeviceRow; onDelete: () => void }) {
  const { warranties, documents, service, claims } = useDeviceExtras(device.id);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const warranty = warranties.data?.[0];

  const openQr = async () => {
    setQrOpen(true);
    if (qrSrc) return;
    const url = `${window.location.origin}/devices/${device.id}`;
    try {
      setQrSrc(
        await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          color: { dark: "#0f1a2e", light: "#ffffff" },
        }),
      );
    } catch {
      toast.error("Could not generate the QR code.");
    }
  };

  return (
    <>
      <header className="animate-fade-up mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {device.image_url ? (
            <img
              src={device.image_url}
              alt={device.name}
              className="size-16 rounded-lg border border-border object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-lg border border-border bg-primary-soft text-primary">
              <MonitorSmartphone className="size-6" strokeWidth={1.5} />
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">{device.name}</h1>
              <WarrantyStatusPill status={device.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[device.brand, device.model, device.category].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openQr}>
            <QrCode className="size-4" /> View QR Code
          </Button>
          <Button variant="ghost" onClick={onDelete}>
            <Trash2 className="size-4" />
            <span className="sr-only">Delete device</span>
          </Button>
        </div>
      </header>

      <WarrantyTimeline
        purchaseDate={warranty?.start_date ?? device.purchase_date}
        endDate={device.endDate}
        days={device.days}
      />

      <Tabs defaultValue="timeline" className="animate-fade-up mt-6" style={{ animationDelay: "160ms" }}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="service">Service History</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <section className="card-surface p-6">
            <h2 className="text-base font-semibold tracking-tight">Warranty details</h2>
            <dl className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              <Detail label="Type" value={warranty ? prettyStatus(warranty.type) : "—"} />
              <Detail
                label="Duration"
                value={
                  warranty?.start_date && warranty.end_date
                    ? `${formatDate(warranty.start_date)} – ${formatDate(warranty.end_date)}`
                    : formatDate(device.endDate)
                }
              />
              <Detail label="Seller" value={device.seller ?? "—"} />
              <Detail label="Invoice Number" value={device.invoice_number ?? "—"} />
              <Detail
                label="Purchase Price"
                value={device.purchase_price != null ? `$${device.purchase_price.toLocaleString()}` : "—"}
              />
              <Detail label="Serial Number" value={device.serial_number ?? "—"} />
            </dl>
            {warranty?.notes && <p className="mt-5 text-sm text-muted-foreground">{warranty.notes}</p>}
          </section>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab deviceId={device.id} documents={documents.data ?? []} loading={documents.isLoading} />
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <section className="card-surface p-6">
            <h2 className="text-base font-semibold tracking-tight">Service history</h2>
             {service.isLoading && <LoadingState label="Loading service history…" />}
            {!service.isLoading && (service.data ?? []).length === 0 && (
              <EmptyBlock icon={<Wrench className="size-6" strokeWidth={1.25} />} title="No service records" />
            )}
            <ul className="mt-4 divide-y divide-border">
              {(service.data ?? []).map((record, index) => (
                <li
                  key={record.id}
                  className="animate-fade-up flex flex-wrap items-center justify-between gap-3 py-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <p className="text-sm font-medium">{record.issue ?? "Service visit"}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(record.date)}
                      {record.service_center ? ` · ${record.service_center}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {record.cost != null ? `$${record.cost.toLocaleString()}` : "—"}
                    </span>
                    <Pill status={record.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <ClaimsTab deviceId={device.id} claims={claims.data ?? []} loading={claims.isLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{device.name}</DialogTitle>
            <DialogDescription>Scan to open this device record on another device.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            {qrSrc ? (
              <img src={qrSrc} alt={`QR code for ${device.name}`} className="size-56 rounded-lg bg-qr-surface p-3" />
            ) : (
              <div className="size-56 animate-pulse rounded-lg bg-muted" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WarrantyTimeline({
  purchaseDate,
  endDate,
  days,
}: {
  purchaseDate: string | null;
  endDate: string | null;
  days: number;
}) {
  const percent = useMemo(() => {
    if (!purchaseDate || !endDate) return 0;
    const total = daysRemaining(endDate, new Date(`${purchaseDate}T00:00:00`));
    if (total <= 0) return 100;
    const used = total - days;
    return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
  }, [purchaseDate, endDate, days]);

  return (
    <section className="card-surface animate-fade-up mt-6 p-6" style={{ animationDelay: "80ms" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Warranty timeline</h2>
        <p className="text-sm text-muted-foreground">
          {days < 0 ? `Expired ${Math.abs(days)} days ago` : `${days} days remaining`} · {percent}% used
        </p>
      </div>

      <div className="relative mt-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-[width] duration-1000 ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span
          className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-card bg-primary transition-[left] duration-1000 ease-out"
          style={{ left: `${percent}%` }}
        />
        <div className="mt-3 flex justify-between text-xs">
          <div>
            <p className="font-medium">Purchased</p>
            <p className="text-muted-foreground">{formatDate(purchaseDate)}</p>
          </div>
          <div className="text-center" style={{ marginLeft: "auto", marginRight: "auto" }}>
            <p className="font-medium text-primary">Today</p>
            <p className="text-muted-foreground">{formatDate(new Date().toISOString().slice(0, 10))}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Expiry</p>
            <p className="text-muted-foreground">{formatDate(endDate)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentsTab({
  deviceId,
  documents,
  loading,
}: {
  deviceId: string;
  documents: DocumentRecord[];
  loading: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument(deviceId);
  const remove = useDeleteDocument(deviceId);

  const open = async (doc: DocumentRecord, download: boolean) => {
    if (!doc.file_url) {
      toast.error("This document has no file attached.");
      return;
    }
    try {
      const url = await getDocumentUrl(doc.file_url, download);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open this document.");
    }
  };

  return (
    <section className="card-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">Documents</h2>
        <Button onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
          <Upload className="size-4" /> {upload.isPending ? "Uploading…" : "Upload document"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            upload.mutate(
              { file, type: "invoice" },
              {
                onSuccess: () => toast.success("Document uploaded."),
                onError: () => toast.error("Upload failed."),
              },
            );
          }}
        />
      </div>

      {loading && <LoadingState label="Loading documents…" />}
      {!loading && documents.length === 0 && (
        <EmptyBlock icon={<FileText className="size-6" strokeWidth={1.25} />} title="No documents yet" />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {documents.map((doc, index) => (
          <article
            key={doc.id}
            className="animate-fade-up flex items-center gap-3 rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-primary/40"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileText className="size-5" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{documentFileName(doc)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {prettyStatus(doc.type)} · {formatDate(doc.uploaded_at.slice(0, 10))}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => open(doc, false)} aria-label="View document">
                <Eye className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => open(doc, true)} aria-label="Download document">
                <Download className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete document"
                onClick={() =>
                  remove.mutate(doc, {
                    onSuccess: () => toast.success("Document deleted."),
                    onError: () => toast.error("Could not delete this document."),
                  })
                }
              >
                <Trash2 className="size-4 text-danger" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClaimsTab({
  deviceId,
  claims,
  loading,
}: {
  deviceId: string;
  claims: { id: string; issue: string | null; status: string; claim_date: string; service_center: string | null }[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [center, setCenter] = useState("");
  const createClaim = useCreateClaim(deviceId);

  return (
    <section className="card-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">Claims</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> File New Claim
        </Button>
      </div>

      {loading && <LoadingState label="Loading claims…" />}
      {!loading && claims.length === 0 && (
        <EmptyBlock icon={<ShieldCheck className="size-6" strokeWidth={1.25} />} title="No claims filed" />
      )}

      <ul className="mt-4 divide-y divide-border">
        {claims.map((claim, index) => (
          <li
            key={claim.id}
            className="animate-fade-up flex flex-wrap items-center justify-between gap-3 py-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div>
              <p className="text-sm font-medium">{claim.issue ?? "Warranty claim"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Filed {formatDate(claim.claim_date)}
                {claim.service_center ? ` · ${claim.service_center}` : ""}
              </p>
            </div>
            <Pill status={claim.status} />
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File a new claim</DialogTitle>
            <DialogDescription>Describe the issue and where the device will be serviced.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="claim-issue">Issue</Label>
              <Input
                id="claim-issue"
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                placeholder="Screen flickers after 10 minutes"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="claim-center">Service center</Label>
              <Input
                id="claim-center"
                value={center}
                onChange={(event) => setCenter(event.target.value)}
                placeholder="Authorized service center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!issue.trim() || createClaim.isPending}
              onClick={() =>
                createClaim.mutate(
                  { issue: issue.trim(), service_center: center.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Claim filed.");
                      setIssue("");
                      setCenter("");
                      setOpen(false);
                    },
                    onError: () => toast.error("Could not file this claim."),
                  },
                )
              }
            >
              {createClaim.isPending ? "Filing…" : "File claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function EmptyBlock({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground">
        {icon}
      </span>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
