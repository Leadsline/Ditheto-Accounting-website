import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useGetAdminClient, 
  useListClientDocuments, 
  useUpdateClientDocument,
  useDeleteClientDocument,
  useSyncOdooClient,
  useListDocumentRequests,
  useCreateDocumentRequest,
  useCreateClientDocument,
  useRequestUploadUrl
} from "@workspace/api-client-react";
import { useParams } from "wouter";
import { 
  Building2, Phone, Mail, MapPin, RefreshCw, AlertTriangle, 
  CheckCircle2, FileText, UploadCloud, Trash2, Send, Download, Eye, Edit
} from "lucide-react";
import { format } from "date-fns";
import { useRole } from "@/hooks/use-role";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminClientProfile() {
  const { clientId: clientIdStr } = useParams();
  const clientId = parseInt(clientIdStr || "0", 10);
  const { role, isSuperAdmin } = useRole();
  const { toast } = useToast();

  const { data: client, isLoading: isClientLoading } = useGetAdminClient(clientId);
  const { data: documents, refetch: refetchDocs } = useListClientDocuments(clientId);
  const { data: requests, refetch: refetchRequests } = useListDocumentRequests(clientId);

  const syncOdoo = useSyncOdooClient();
  const deleteDoc = useDeleteClientDocument();
  const createReq = useCreateDocumentRequest();
  
  // Upload states
  const reqUploadUrl = useRequestUploadUrl();
  const createDoc = useCreateClientDocument();
  const updateDoc = useUpdateClientDocument();
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncOdoo = async () => {
    setIsSyncing(true);
    try {
      const res = await syncOdoo.mutateAsync({ data: { clientId } });
      if (res.success) {
        toast({ title: "Sync Successful", description: res.message });
      } else {
        toast({ variant: "destructive", title: "Sync Failed", description: res.message });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to sync" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDoc.mutateAsync({ documentId: id });
      toast({ title: "Document deleted" });
      refetchDocs();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error deleting document", description: e.message });
    }
  };

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Default to ID as first option
  const [docCategory, setDocCategory] = useState<"ID" | "Tax Clearance" | "IRP5" | "Bank Statements" | "Contracts" | "SARS Correspondence" | "Other">("ID");
  const [docStatus, setDocStatus] = useState<"received" | "outstanding" | "expired" | "under_review">("received");

  const [editOpen, setEditOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("received");
  const [editCategory, setEditCategory] = useState<string>("ID");
  const [updating, setUpdating] = useState(false);

  const openEditDoc = (doc: any) => {
    setEditingDocId(doc.id);
    setEditStatus(doc.status);
    setEditCategory(doc.category);
    setEditOpen(true);
  };

  const handleEditDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocId) return;
    setUpdating(true);
    try {
      await updateDoc.mutateAsync({
        documentId: editingDocId,
        data: {
          status: editStatus as any,
          category: editCategory as any
        }
      });
      toast({ title: "Document updated successfully" });
      setEditOpen(false);
      refetchDocs();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get presigned URL
      const { uploadURL, objectPath } = await reqUploadUrl.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          contentType: file.type
        }
      });

      // 2. Upload to GCS
      const gcsRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!gcsRes.ok) throw new Error("Failed to upload file to storage.");

      // 3. Persist document
      await createDoc.mutateAsync({
        clientId,
        data: {
          name: file.name,
          category: docCategory,
          status: docStatus,
          objectPath,
          mimeType: file.type,
          size: file.size
        }
      });

      toast({ title: "Document uploaded successfully" });
      setUploadOpen(false);
      refetchDocs();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Request Document Form
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqChannel, setReqChannel] = useState<"email" | "whatsapp">("email");
  const [reqSubject, setReqSubject] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [sendingReq, setSendingReq] = useState(false);

  const outstandingDocs = documents?.filter(d => d.status === "outstanding" || d.status === "expired") || [];

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    if (selectedDocs.length === 0) {
      toast({ variant: "destructive", title: "Select documents", description: "Please select at least one document to request." });
      return;
    }
    setSendingReq(true);
    try {
      await createReq.mutateAsync({
        clientId,
        data: {
          channel: reqChannel,
          documentIds: selectedDocs,
          subject: reqSubject,
          message: reqMessage
        }
      });
      const body = encodeURIComponent(reqMessage);
      if (reqChannel === "email") {
        window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(reqSubject)}&body=${body}`;
      } else {
        const number = client.phone.replace(/\D/g, "").replace(/^0/, "27");
        window.open(`https://wa.me/${number}?text=${body}`, "_blank", "noopener,noreferrer");
      }
      toast({ title: "Request logged", description: `Opening ${reqChannel === "email" ? "your email app" : "WhatsApp"} to send it.` });
      setRequestOpen(false);
      refetchRequests();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send", description: err.message });
    } finally {
      setSendingReq(false);
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch(status) {
      case "received": return <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Received</span>;
      case "outstanding": return <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Outstanding</span>;
      case "expired": return <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
      case "under_review": return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Under Review</span>;
      default: return <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (isClientLoading || !client) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-24 bg-gradient-to-r from-secondary to-secondary/80"></div>
        <div className="px-8 pb-8">
          <div className="flex justify-between items-start">
            <div className="relative -mt-12 flex items-end gap-6">
              <div className="h-24 w-24 rounded-xl bg-white p-2 shadow-sm border border-gray-100">
                <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center rounded-lg text-3xl font-bold uppercase">
                  {client.name[0]}
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" /> {client.company}
                </p>
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 min-w-[200px]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Odoo Sync Status</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {client.odooSyncStatus === "synced" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : client.odooSyncStatus === "error" ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="font-semibold text-gray-900 capitalize text-sm">
                      {client.odooSyncStatus.replace('_', ' ')}
                    </span>
                  </div>
                  {isSuperAdmin && (
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={handleSyncOdoo} disabled={isSyncing}>
                      {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Sync Now"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
              <span className="text-sm font-medium">{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
              <span className="text-sm font-medium">{client.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
              <span className="text-sm font-medium">{client.branch} Branch</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="bg-white border border-gray-200 p-1 w-full justify-start rounded-lg h-auto">
          <TabsTrigger value="documents" className="data-[state=active]:bg-gray-100 py-2.5 px-6 rounded-md font-medium text-sm">Document Library</TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-gray-100 py-2.5 px-6 rounded-md font-medium text-sm">Communication & Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-6 focus-visible:outline-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Client Documents</h3>
            <div className="flex gap-3">
              {isSuperAdmin && (
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                      <UploadCloud className="w-4 h-4" /> Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpload}>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                          Add a new document to {client.name}'s file.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>File</Label>
                          <Input type="file" ref={fileInputRef} required className="cursor-pointer" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select value={docCategory} onValueChange={(v: any) => setDocCategory(v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ID">ID</SelectItem>
                              <SelectItem value="Tax Clearance">Tax Clearance</SelectItem>
                              <SelectItem value="IRP5">IRP5</SelectItem>
                              <SelectItem value="Bank Statements">Bank Statements</SelectItem>
                              <SelectItem value="Contracts">Contracts</SelectItem>
                              <SelectItem value="SARS Correspondence">SARS Correspondence</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={docStatus} onValueChange={(v: any) => setDocStatus(v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">Received</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="outstanding">Outstanding</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={uploading} className="bg-primary hover:bg-primary/90">
                          {uploading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                          Upload to File
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Document Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Size</th>
                    <th className="px-6 py-4 font-semibold">Uploaded Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {!documents || documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-medium mb-1">No documents yet</h4>
                        <p className="text-gray-500 text-sm">Upload documents to get started.</p>
                      </td>
                    </tr>
                  ) : documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-secondary flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {doc.category}
                      </td>
                      <td className="px-6 py-4">
                        {getDocStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {doc.objectPath !== "pending" ? <>
                             <Button variant="ghost" size="icon" aria-label={`View ${doc.name}`} className="h-8 w-8 text-gray-500 hover:text-primary" onClick={() => window.open(`/api/storage${doc.objectPath}`, '_blank')}>
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" aria-label={`Download ${doc.name}`} className="h-8 w-8 text-gray-500 hover:text-primary" onClick={() => {
                               const a = document.createElement('a');
                               a.href = `/api/storage${doc.objectPath}`;
                               a.download = doc.name;
                               a.click();
                             }}>
                               <Download className="w-4 h-4" />
                             </Button>
                           </> : <span className="text-xs font-medium text-amber-700">Awaiting upload</span>}
                          {isSuperAdmin && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEditDoc(doc)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteDoc(doc.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <form onSubmit={handleEditDoc}>
                <DialogHeader>
                  <DialogTitle>Edit Document Metadata</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ID">ID</SelectItem>
                        <SelectItem value="Tax Clearance">Tax Clearance</SelectItem>
                        <SelectItem value="IRP5">IRP5</SelectItem>
                        <SelectItem value="Bank Statements">Bank Statements</SelectItem>
                        <SelectItem value="Contracts">Contracts</SelectItem>
                        <SelectItem value="SARS Correspondence">SARS Correspondence</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={updating} className="bg-primary hover:bg-primary/90">
                    {updating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </TabsContent>
        
        <TabsContent value="requests" className="mt-6 focus-visible:outline-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Document Requests</h3>
            
            {isSuperAdmin && <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
                  <Send className="w-4 h-4" /> Send Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSendRequest}>
                  <DialogHeader>
                    <DialogTitle>Request Documents</DialogTitle>
                    <DialogDescription>
                      Send a secure request for outstanding documents to the client.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-5">
                    <div className="grid gap-2">
                      <Label>Channel</Label>
                      <Select value={reqChannel} onValueChange={(v: any) => setReqChannel(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-3 border rounded-md p-3 bg-gray-50">
                      <Label>Select Outstanding Documents</Label>
                      {outstandingDocs.length === 0 ? (
                        <div className="text-sm text-gray-500 py-2">No outstanding documents found. Add placeholder documents first.</div>
                      ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                          {outstandingDocs.map(doc => (
                            <div key={doc.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`doc-${doc.id}`} 
                                checked={selectedDocs.includes(doc.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedDocs([...selectedDocs, doc.id]);
                                  else setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                }}
                              />
                              <label htmlFor={`doc-${doc.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {doc.category} - {doc.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Subject / Title</Label>
                      <Input 
                        placeholder="Action Required: Outstanding Documents" 
                        value={reqSubject}
                        onChange={e => setReqSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea 
                        className="min-h-[100px]"
                        placeholder="Please supply the requested documents so we can proceed with your application..."
                        value={reqMessage}
                        onChange={e => setReqMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={sendingReq} className="bg-primary hover:bg-primary/90">
                      {sendingReq ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Send via {reqChannel === 'email' ? 'Email' : 'WhatsApp'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>}
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date Sent</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Channel</th>
                    <th className="px-6 py-4 font-semibold">Docs Requested</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {!requests || requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                        No requests sent yet.
                      </td>
                    </tr>
                  ) : requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {format(new Date(req.sentAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 font-medium text-secondary">
                        {req.subject}
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">
                        {req.channel}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                          {req.documentIds.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.deliveryStatus === 'sent' ? 'bg-green-100 text-green-700' :
                          req.deliveryStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {req.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}