import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Download,
  Eye,
  FileImage,
  FileText,
  FolderOpen,
  LayoutGrid,
  MoreVertical,
  Rows3,
  ReceiptText,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDocumentUrl } from "@/hooks/use-device-detail";
import {
  useAllDocuments,
  useDeleteAnyDocument,
  type DocumentWithDevice,
} from "@/hooks/use-documents";
import { EmptyState, LoadingState, PageHeader } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Warrantify" },
      {
        name: "description",
        content:
          "Store invoices, warranty cards, receipts, and service reports for each registered device.",
      },
      { property: "og:title", content: "Documents — Warrantify" },
      {
        property: "og:description",
        content: "Invoices, warranty cards, and service reports in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentsPage,
});

const ALL = "__all__";

const typeMeta: Record<string, { label: string; icon: typeof FileText; tone: string }> = {
  invoice: { label: "Invoice", icon: ReceiptText, tone: "text-accent" },
  warranty: { label: "Warranty card", icon: ShieldCheck, tone: "text-success" },
  service: { label: "Service report", icon: Wrench, tone: "text-warning" },
  photo: { label: "Photo", icon: FileImage, tone: "text-accent" },
  other: { label: "Other", icon: FileText, tone: "text-muted-foreground" },
};

function metaFor(type: string) {
  return typeMeta[type] ?? { label: type, icon: FileText, tone: "text-muted-foreground" };
}

function fileName(doc: DocumentWithDevice) {
  const raw = doc.file_url?.split("/").pop() ?? "";
  const stripped = raw.replace(/^\d+-/, "");
  return stripped || `${metaFor(doc.type).label}.pdf`;
}

function formatUploaded(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DocumentsPage() {
  const navigate = useNavigate();
  const { data: documents = [], isLoading } = useAllDocuments();
  const deleteDocument = useDeleteAnyDocument();

  const [query, setQuery] = useState("");
  const [device, setDevice] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [grouped, setGrouped] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const devices = useMemo(() => {
    const map = new Map<string, string>();
    documents.forEach((doc) => map.set(doc.device_id, doc.device_name));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [documents]);

  const types = useMemo(
    () => [...new Set(documents.map((doc) => doc.type))].sort(),
    [documents],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (device !== ALL && doc.device_id !== device) return false;
      if (type !== ALL && doc.type !== type) return false;
      if (!term) return true;
      return [fileName(doc), doc.device_name, metaFor(doc.type).label]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [documents, query, device, type]);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; docs: DocumentWithDevice[] }>();
    filtered.forEach((doc) => {
      const entry = map.get(doc.device_id) ?? { name: doc.device_name, docs: [] };
      entry.docs.push(doc);
      map.set(doc.device_id, entry);
    });
    return [...map.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [filtered]);

  const hasFilters = Boolean(query.trim()) || device !== ALL || type !== ALL;

  const openDocument = async (doc: DocumentWithDevice, download = false) => {
    if (!doc.file_url) {
      toast.error("This document has no file attached.");
      return;
    }
    try {
      const url = await getDocumentUrl(doc.file_url, download);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open the document.");
    }
  };

  const removeDocument = (doc: DocumentWithDevice) => {
    deleteDocument.mutate(doc, {
      onSuccess: () => toast.success("Document deleted."),
      onError: () => toast.error("Could not delete the document."),
    });
  };

  const DocumentCard = ({ doc, index }: { doc: DocumentWithDevice; index: number }) => {
    const meta = metaFor(doc.type);
    const Icon = meta.icon;
    return (
      <article
        className="card-surface animate-fade-up group relative overflow-hidden p-4 transition-colors hover:border-accent/50"
        style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-lg bg-muted/40",
              meta.tone,
            )}
          >
            <Icon className="size-5" strokeWidth={1.5} />
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label={`Actions for ${fileName(doc)}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => openDocument(doc)}>
                <Eye className="size-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openDocument(doc, true)}>
                <Download className="size-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  navigate({ to: "/devices/$deviceId", params: { deviceId: doc.device_id } })
                }
              >
                <FolderOpen className="size-4" /> Open device
              </DropdownMenuItem>
              <DropdownMenuItem className="text-danger" onSelect={() => removeDocument(doc)}>
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="mt-3 truncate text-sm font-medium" title={fileName(doc)}>
          {fileName(doc)}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.label}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to="/devices/$deviceId"
            params={{ deviceId: doc.device_id }}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            {doc.device_name}
          </Link>
          <span className="text-xs text-muted-foreground">{formatUploaded(doc.uploaded_at)}</span>
        </div>
      </article>
    );
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <PageHeader
          title="Documents"
          subtitle={<>{filtered.length} of {documents.length} {documents.length === 1 ? "document" : "documents"} shown</>}
        />

        <section
          className="card-surface animate-fade-up mt-6 flex flex-wrap items-center gap-3 p-4"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents by name, device, or type…"
              className="pl-9"
              aria-label="Search documents"
            />
          </div>

          <Select value={device} onValueChange={setDevice}>
            <SelectTrigger className="w-48" aria-label="Filter by device">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All devices</SelectItem>
              {devices.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-44" aria-label="Filter by document type">
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {types.map((item) => (
                <SelectItem key={item} value={item}>
                  {metaFor(item).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <Button
              variant={grouped ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGrouped(true)}
              aria-pressed={grouped}
            >
              <Rows3 className="size-4" /> By device
            </Button>
            <Button
              variant={!grouped ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGrouped(false)}
              aria-pressed={!grouped}
            >
              <LayoutGrid className="size-4" /> Flat grid
            </Button>
          </div>
        </section>

        {isLoading && <LoadingState label="Loading documents…" className="mt-6" />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            className="mt-6"
            icon={FileText}
            title={hasFilters ? "No matching documents" : "No documents yet"}
            description={
              hasFilters
                ? "Try a different search term or clear the filters to see everything."
                : "Upload invoices and warranty cards from a device page to keep proof of purchase handy."
            }
            action={hasFilters ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setDevice(ALL);
                  setType(ALL);
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link to="/devices">Go to your devices</Link>
              </Button>
            )}
          />
        )}

        {!isLoading && filtered.length > 0 && !grouped && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((doc, index) => (
              <DocumentCard key={doc.id} doc={doc} index={index} />
            ))}
          </section>
        )}

        {!isLoading && filtered.length > 0 && grouped && (
          <div className="mt-6 grid gap-5">
            {groups.map(([deviceId, group], groupIndex) => {
              const isCollapsed = collapsed[deviceId] ?? false;
              return (
                <section
                  key={deviceId}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(groupIndex, 8) * 60}ms` }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setCollapsed((prev) => ({ ...prev, [deviceId]: !isCollapsed }))
                    }
                    aria-expanded={!isCollapsed}
                    className="h-auto w-full justify-start px-1 py-2 text-left hover:text-accent"
                  >
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        !isCollapsed && "rotate-90",
                      )}
                    />
                    <h2 className="text-sm font-semibold tracking-tight">{group.name}</h2>
                    <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                      {group.docs.length}
                    </span>
                  </Button>

                  {!isCollapsed && (
                    <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.docs.map((doc, index) => (
                        <DocumentCard key={doc.id} doc={doc} index={index} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
