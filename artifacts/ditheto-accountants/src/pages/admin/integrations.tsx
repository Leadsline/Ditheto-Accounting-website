import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetOdooStatus } from "@workspace/api-client-react";
import { RefreshCw, CheckCircle2, XCircle, Database, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useRole } from "@/hooks/use-role";

export default function AdminIntegrations() {
  const { data: odooStatus, isLoading, error } = useGetOdooStatus();
  const { isSuperAdmin } = useRole();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary mb-1">Integrations</h1>
        <p className="text-gray-500 text-sm">Manage third-party connections and sync settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Odoo Integration Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#714B67] rounded-lg flex items-center justify-center text-white">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Odoo ERP</CardTitle>
                  <CardDescription>Accounting & CRM Sync</CardDescription>
                </div>
              </div>
              
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              ) : error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : odooStatus?.connected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Disconnected
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Checking status...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">Failed to load Odoo integration status.</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 border border-gray-100">
                  <p className="mb-2"><strong>Status Message:</strong> {odooStatus?.message}</p>
                  {odooStatus?.lastSyncAt && (
                    <p><strong>Last Global Sync:</strong> {format(new Date(odooStatus.lastSyncAt), 'MMM d, yyyy HH:mm')}</p>
                  )}
                  {!odooStatus?.connected && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded text-red-700 text-xs">
                      The Odoo connection is currently disabled or authorization was dismissed. Reconnect to resume client synchronization.
                    </div>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="flex gap-3">
                    {!odooStatus?.connected ? (
                      <Button disabled className="bg-[#714B67] hover:bg-[#5b3c53] text-white w-full">
                        Authorization required
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full text-gray-700">
                          Force Global Sync
                        </Button>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                          Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {!isSuperAdmin && (
                  <div className="text-xs text-gray-500 text-center">
                    Only Super Admins can manage integrations.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for future integrations */}
        <Card className="shadow-sm border-gray-200 border-dashed bg-gray-50/50">
          <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <ExternalLink className="w-8 h-8 mb-3 opacity-50" />
            <h3 className="font-medium text-gray-600 mb-1">More Integrations</h3>
            <p className="text-sm">Additional third-party connections will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}