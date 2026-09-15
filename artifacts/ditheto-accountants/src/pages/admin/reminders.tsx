import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, MessageCircle, Mail } from "lucide-react";

export default function AdminReminders() {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500 text-sm">Automated Email & WhatsApp Scheduling</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">Create New Reminder</Button>
      </div>

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="mb-6 bg-white border h-auto p-1">
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-gray-100 px-6 py-2">Scheduled Campaigns</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-gray-100 px-6 py-2">Templates</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-100 px-6 py-2">Send History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduled" className="space-y-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-secondary">IRP6 Deadline Reminder (Batch 1)</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Email + WhatsApp</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">Targeting: All Provisional Tax Clients (342 recipients)</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Clock className="h-4 w-4 text-accent" /> Scheduled for: Oct 25, 2023 @ 09:00 AM
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20">Cancel</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-gray-300">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-secondary">Monthly Bookkeeping Docs Request</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Email Only</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">Targeting: Monthly Accounting Clients (89 recipients)</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Clock className="h-4 w-4 text-gray-400" /> Scheduled for: Nov 1, 2023 @ 08:00 AM (Recurring)
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>ITR12 Tax Season Launch</span>
                  <div className="flex gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-gray-50/50">
                <p className="text-sm font-mono text-gray-600 mb-4 whitespace-pre-wrap">
                  Hi {'{{client_name}}'},\n\nTax season is officially here! Don't miss the SARS deadline. Let Ditheto Accountants help you submit your ITR12 accurately and on time.\n\nReply to this message or email us to get started.
                </p>
                <Button variant="outline" size="sm" className="w-full">Use Template</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Outstanding Document Request</span>
                  <div className="flex gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-gray-50/50">
                <p className="text-sm font-mono text-gray-600 mb-4 whitespace-pre-wrap">
                  Dear {'{{client_name}}'},\n\nWe are preparing your {'{{service_name}}'} and require additional documentation to proceed. Please upload or email the requested files by {'{{deadline}}'}.
                </p>
                <Button variant="outline" size="sm" className="w-full">Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
