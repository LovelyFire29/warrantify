import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Download,
  Eye,
  FileText,
  MapPin,
  Plus,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDevices } from "@/hooks/use-devices";
import { getDocumentUrl } from "@/hooks/use-device-detail";
import {
  useAllClaims,
  useClaimDocuments,
  useCreateAnyClaim,
  useUpdateClaimStatus,
  type ClaimWithDevice,
} from "@/hooks/use-claims";
import { EmptyState, LoadingState, PageHeader } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/claims")({
  head: () => ({
    meta: [
      { title: "Claims Board — Warrantify" },
      {
        name: "description",
        content:
          "Track every warranty repair claim on a kanban board from submission through inspection, repair, and completion.",
      },
      { property: "og:title", content: "Claims Board — Warrantify" },
      {
        property: "og:description",
        content: "Follow every warranty repair claim from submission to completion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClaimsPage,
});

const COLUMNS = [
  { id: "submitted", label: "Submitted", tone: "bg-accent" },
  { id: "accepted", label: "Accepted", tone: "bg-accent" },
  { id: "under_inspection", label: "Under Inspection", tone: "bg-warning" },
  { id: "repairing", label: "Repairing", tone: "bg-warning" },
  { id: "ready", label: "Ready", tone: "bg-success" },
  { id: "completed", label: "Completed", tone: "bg-success" },
  { id: "rejected", label: "Rejected", tone: "bg-destructive" },
] as const;

const STEPPER = COLUMNS.filter((c) => c.id !== "rejected");

function columnFor(status: string) {
  return COLUMNS.find((c) => c.id === status) ?? COLUMNS[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ClaimsPage() {
  const { data: claims = [], isLoading } = useAllClaims();
  const { data: devices = [] } = useDevices();
  const updateStatus = useUpdateClaimStatus();
  const createClaim = useCreateAnyClaim();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ device_id: "", issue: "", service_center: "" });

  const grouped = useMemo(() => {
    const map: Record<string, ClaimWithDevice[]> = {};
    COLUMNS.forEach((column) => (map[column.id] = []));
    claims.forEach((claim) => {
      (map[claim.status] ?? (map[COLUMNS[0].id] as ClaimWithDevice[])).push(claim);
    });
    return map;
  }, [claims]);

  const active = claims.find((claim) => claim.id === activeId) ?? null;

  function move(claim: ClaimWithDevice, status: string) {
    if (claim.status === status) return;
    updateStatus.mutate(
      { id: claim.id, status },
      {
        onSuccess: () => toast.success(`Moved to ${columnFor(status).label}`),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Could not update claim"),
      },
    );
  }

  function submitClaim() {
    if (!form.device_id) {
      toast.error("Pick a device for this claim.");
      return;
    }
    createClaim.mutate(form, {
      onSuccess: () => {
        toast.success("Claim submitted");
        setNewOpen(false);
        setForm({ device_id: "", issue: "", service_center: "" });
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Could not create claim"),
    });
  }

  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <PageHeader
          title="Claims"
          subtitle={<>{claims.length} claim{claims.length === 1 ? "" : "s"} across the repair workflow.</>}
          action={<Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" /> New Claim
          </Button>}
        />

        {isLoading ? (
          <LoadingState label="Loading claims…" className="flex-1" />
        ) : claims.length === 0 ? (
          <EmptyState
            className="flex-1 justify-center"
            icon={ClipboardList}
            title="No claims yet"
            description="File a claim when a device needs a warranty repair."
            action={<Button onClick={() => setNewOpen(true)}>
              <Plus className="size-4" /> File your first claim
            </Button>}
          />
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
            {COLUMNS.map((column, columnIndex) => (
              <section
                key={column.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(column.id);
                }}
                onDragLeave={() => setDragOver((prev) => (prev === column.id ? null : prev))}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(null);
                  const id = event.dataTransfer.getData("text/plain");
                  const claim = claims.find((item) => item.id === id);
                  if (claim) move(claim, column.id);
                }}
                className={cn(
                  "card-surface flex w-[230px] shrink-0 flex-col gap-3 p-4 transition-colors",
                  dragOver === column.id && "border-accent/70 bg-accent/5",
                )}
                style={{ animation: "var(--animate-fade-up)", animationDelay: `${columnIndex * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", column.tone)} />
                    <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {column.label}
                    </h2>
                  </div>
                  <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                    {grouped[column.id]?.length ?? 0}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {(grouped[column.id] ?? []).map((claim, index) => (
                    <Button
                      key={claim.id}
                      type="button"
                      variant="ghost"
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", claim.id)}
                      onClick={() => setActiveId(claim.id)}
                      className="group h-auto w-full cursor-grab flex-col items-stretch rounded-lg border border-border/60 bg-card p-4 text-left hover:border-accent/60 hover:bg-accent/5 active:cursor-grabbing"
                      style={{
                        animation: "var(--animate-fade-up)",
                        animationDelay: `${index * 40}ms`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {claim.device_image ? (
                          <img
                            src={claim.device_image}
                            alt=""
                            className="size-8 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50">
                            <Smartphone className="size-4 text-muted-foreground" />
                          </span>
                        )}
                        <p className="truncate text-sm font-medium">{claim.device_name}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {claim.issue ?? "No issue described"}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className={cn("size-1.5 rounded-full", column.tone)} />
                        {formatDate(claim.claim_date)}
                      </div>
                      {claim.service_center && (
                        <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
                          {claim.service_center}
                        </p>
                      )}
                    </Button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <ClaimDetail claim={active} onClose={() => setActiveId(null)} onMove={move} />

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New claim</DialogTitle>
            <DialogDescription>File a warranty repair claim for one of your devices.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Device</Label>
              <Select
                value={form.device_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, device_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-issue">Issue</Label>
              <Textarea
                id="claim-issue"
                value={form.issue}
                onChange={(event) => setForm((prev) => ({ ...prev, issue: event.target.value }))}
                placeholder="Describe what went wrong"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-center">Service center</Label>
              <Input
                id="claim-center"
                value={form.service_center}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, service_center: event.target.value }))
                }
                placeholder="e.g. Apple Store, Downtown"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitClaim} disabled={createClaim.isPending}>
              Submit claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ClaimDetail({
  claim,
  onClose,
  onMove,
}: {
  claim: ClaimWithDevice | null;
  onClose: () => void;
  onMove: (claim: ClaimWithDevice, status: string) => void;
}) {
  const { data: documents = [] } = useClaimDocuments(claim?.device_id ?? null);

  async function openDocument(path: string | null, download: boolean) {
    if (!path) {
      toast.error("This document has no file attached.");
      return;
    }
    try {
      const url = await getDocumentUrl(path, download);
      window.open(url, "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open document");
    }
  }

  const currentIndex = claim ? STEPPER.findIndex((step) => step.id === claim.status) : -1;
  const rejected = claim?.status === "rejected";

  return (
    <Sheet open={Boolean(claim)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {claim && (
          <>
            <SheetHeader>
              <SheetTitle className="text-base">Claim details</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <div className="flex items-center gap-3">
                {claim.device_image ? (
                  <img src={claim.device_image} alt="" className="size-12 rounded-lg object-cover" />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
                    <Smartphone className="size-5 text-muted-foreground" />
                  </span>
                )}
                <div className="min-w-0">
                  <Link
                    to="/devices/$deviceId"
                    params={{ deviceId: claim.device_id }}
                    className="truncate font-medium hover:text-accent"
                  >
                    {claim.device_name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {[claim.device_brand, claim.device_model].filter(Boolean).join(" · ") ||
                      "No model details"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={claim.status} onValueChange={(value) => onMove(claim, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/60 bg-card/50 p-4 text-sm">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> Claim date
                  </p>
                  <p className="mt-1">{formatDate(claim.claim_date)}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> Service center
                  </p>
                  <p className="mt-1">{claim.service_center ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Issue</p>
                  <p className="mt-1 whitespace-pre-line">{claim.issue ?? "No issue described"}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Progress</h3>
                {rejected ? (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    This claim was rejected.
                  </p>
                ) : (
                  <ol className="relative space-y-4 border-l border-border/70 pl-6">
                    {STEPPER.map((step, index) => {
                      const done = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      return (
                        <li key={step.id} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[31px] flex size-5 items-center justify-center rounded-full border",
                              done
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-card",
                            )}
                          >
                            {done && <Check className="size-3" />}
                          </span>
                          <p
                            className={cn(
                              "text-sm",
                              isCurrent
                                ? "font-medium text-foreground"
                                : done
                                  ? "text-foreground/80"
                                  : "text-muted-foreground",
                            )}
                          >
                            {step.label}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Documents</h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No documents uploaded for this device yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3"
                      >
                        <FileText className="size-4 shrink-0 text-accent" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {doc.file_url?.split("/").pop()?.replace(/^\d+-/, "") ?? doc.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(doc.uploaded_at)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDocument(doc.file_url, false)}
                          aria-label="View document"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDocument(doc.file_url, true)}
                          aria-label="Download document"
                        >
                          <Download className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
