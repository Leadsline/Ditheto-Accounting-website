import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CalendarClock, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <h3 className="text-2xl font-bold text-secondary">1,248</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-teal-50 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">New RFQs (This Week)</p>
              <h3 className="text-2xl font-bold text-secondary">24</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-amber-50 text-accent">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
              <h3 className="text-2xl font-bold text-secondary">7</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Reminders</p>
              <h3 className="text-2xl font-bold text-secondary">412</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-heading">Recent Quote Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Services Requested</th>
                    <th className="px-6 py-4 font-semibold">Branch</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-secondary">Thabo Mokoena</td>
                    <td className="px-6 py-4 text-gray-600">IRP6, EMP201</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">Pretoria</span></td>
                    <td className="px-6 py-4 text-gray-500">Today, 09:41</td>
                    <td className="px-6 py-4 text-right"><button className="text-primary hover:underline font-medium">View</button></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-secondary">Sipho Logistics (Pty) Ltd</td>
                    <td className="px-6 py-4 text-gray-600">Company Registration, CIDB</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">Secunda</span></td>
                    <td className="px-6 py-4 text-gray-500">Yesterday, 14:22</td>
                    <td className="px-6 py-4 text-right"><button className="text-primary hover:underline font-medium">View</button></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-secondary">Maria Nel</td>
                    <td className="px-6 py-4 text-gray-600">ITR12 Return</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">Pretoria</span></td>
                    <td className="px-6 py-4 text-gray-500">Oct 12, 2023</td>
                    <td className="px-6 py-4 text-right"><button className="text-primary hover:underline font-medium">View</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-heading">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              <li className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-secondary">EMP201 Submission</h4>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">In 3 Days</span>
                </div>
                <p className="text-sm text-gray-500">Monthly PAYE, UIF, SDL for all payroll clients.</p>
              </li>
              <li className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-secondary">VAT201 (Category A)</h4>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">In 10 Days</span>
                </div>
                <p className="text-sm text-gray-500">Bi-monthly submission for assigned vendors.</p>
              </li>
              <li className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-secondary">ITR12 Tax Season Ends</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Next Month</span>
                </div>
                <p className="text-sm text-gray-500">Non-provisional individual taxpayers.</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
