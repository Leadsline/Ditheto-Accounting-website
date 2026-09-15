import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Send } from "lucide-react";
import img1 from "@assets/1_1789318706811.jpeg";
import img2 from "@assets/2_1789318706812.jpeg";
import img3 from "@assets/3_1789318706812.jpeg";
import img4 from "@assets/4_1789318706813.jpeg";

export default function AdminCampaigns() {
  const posters = [
    { src: img1, title: "ITR12 Campaign" },
    { src: img2, title: "IRP6 Services" },
    { src: img3, title: "IRP6 Reminder" },
    { src: img4, title: "Payroll Services" }
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-500 text-sm">Media Library & WhatsApp Poster Blasts</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Upload className="h-4 w-4" /> Upload New Poster
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posters.map((poster, i) => (
          <Card key={i} className="overflow-hidden group border-gray-200">
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
              <img src={poster.src} alt={poster.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button className="bg-white text-secondary hover:bg-gray-100 gap-2 font-semibold">
                  <Send className="h-4 w-4" /> Send Blast
                </Button>
              </div>
            </div>
            <CardContent className="p-4 bg-white">
              <h4 className="font-bold text-secondary text-sm mb-1">{poster.title}</h4>
              <p className="text-xs text-gray-500">Uploaded: Oct 2023</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
