import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Filter, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useListAdminClients } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminClients() {
  const { data: clients, isLoading, error } = useListAdminClients();
  const [search, setSearch] = useState("");

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary mb-1">Client Database</h1>
          <p className="text-gray-500 text-sm">Manage your clients, their documents, and integration sync state.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 cursor-pointer bg-white"><Filter className="h-4 w-4" /> Filter</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 cursor-pointer"><Plus className="h-4 w-4" /> Add Client</Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-white flex items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name, email, or company..." 
              className="pl-9 bg-gray-50 border-gray-200" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Client Name</th>
                  <th className="px-6 py-4 font-semibold">Company / Entity</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Odoo Sync</th>
                  <th className="px-6 py-4 font-semibold">Added</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading clients...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      Failed to load clients.
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No clients found.
                    </td>
                  </tr>
                ) : filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{client.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{client.branch} Branch</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {client.company}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{client.email}</div>
                      <div className="text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {client.odooSyncStatus === 'synced' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Synced
                        </span>
                      )}
                      {client.odooSyncStatus === 'not_synced' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">
                          Unsynced
                        </span>
                      )}
                      {client.odooSyncStatus === 'error' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/clients/${client.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/5 hover:text-primary text-primary h-8 px-3 cursor-pointer">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}