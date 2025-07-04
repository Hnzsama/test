"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

type CallResponse = {
  status: 'positive' | 'neutral' | 'negative' | '';
  notes: string;
};

export default function Page() {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState("");
  const [operator, setOperator] = useState("");
  const [response, setResponse] = useState<CallResponse>({ status: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to mask half the digits of the phone number
  function maskPhoneNumber(phone: string) {
    if (!phone) return "";
    const prefix = phone.slice(0, 4); // "+628"
    const rest = phone.slice(4);
    const half = Math.floor(rest.length / 2);
    const masked = rest
      .split("")
      .map((c, i) => (i < half ? "*" : c))
      .join("");
    return prefix + masked;
  }

  // Helper to generate a random customer name
  function randomCustomerName() {
    const firstNames = ["Andi", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi"];
    const lastNames = ["Santoso", "Wijaya", "Putri", "Saputra", "Pratama", "Utami", "Rahman"];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
  }

  // Helper to generate a random operator group
  function randomOperatorGroup() {
    const groups = ["Sales", "Support", "Marketing", "Technical", "Finance", "Admin"];
    return groups[Math.floor(Math.random() * groups.length)];
  }

  async function fetchPhone() {
    try {
      const res = await fetch("/api/unique-phone");
      const data = await res.json();
      setPhone(data.phone);
      setCustomer(randomCustomerName());
      setOperator(randomOperatorGroup());
      setResponse({ status: '', notes: '' }); // Reset response for new call
    } catch (error) {
      console.error("Failed to fetch phone number:", error);
    }
  }

  async function submitCurrentCall() {
    if (!phone) return;
    
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your backend
      const callData = {
        phone,
        customer,
        operator,
        responseStatus: response.status,
        notes: response.notes,
        timestamp: new Date().toISOString()
      };
      
      console.log("Submitting call data:", callData);
      // Example API call:
      // await fetch('/api/calls', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(callData)
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to submit call data:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Kirim pesan WhatsApp via Fonnte, return true jika sukses
  async function sendFonnteMessage() {
    if (!phone) return false;
    const target = phone.replace(/^\+/, "");
    const data = new FormData();
    data.append("target", target);
    data.append("message", `Halo ${customer}, ini pesan otomatis dari sistem kami.`);
    try {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: "ZfRgSu8FYnvRrdskFpRg",
        },
        body: data,
      });
      const res = await response.json();
      return res.status === 200;
    } catch (err) {
      return false;
    }
  }

  const handleNextCall = async () => {
    // First submit the current call data
    if (response.status) {
      await submitCurrentCall();
    }
    // Kirim pesan via Fonnte sebelum ganti nomor
    const sent = await sendFonnteMessage();
    if (sent) {
      toast.success("Pesan berhasil dikirim via Fonnte!");
    } else {
      toast.error("Gagal mengirim pesan via Fonnte.");
    }
    // Then fetch a new number
    await fetchPhone();
  };

  useEffect(() => {
    fetchPhone();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Customer Interaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-lg select-all">
                            {maskPhoneNumber(phone)}
                          </span>
                          {/* Button Call removed */}
                        </div>
                        {/* Debug info */}
                        <div className="text-xs text-muted-foreground break-all">
                          <span>DEBUG: {phone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="font-mono text-lg">{customer}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operator">Operator Group</Label>
                        <div className="font-mono text-lg">{operator}</div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                      <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                        <Phone className="h-4 w-4" />
                        Skype Call
                      </Button>
                      <a
                        href={phone ? `https://wa.me/${phone.replace(/^\+/, "")}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none"
                      >
                        <Button variant="outline" className="gap-2 w-full" type="button">
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </a>
                    </div>

                    <hr className="my-6" />

                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="font-medium">Response Tracking</h3>
                        <Button 
                          size="sm" 
                          className="self-end md:self-auto"
                          disabled={!response.status}
                          onClick={() => setResponse({ status: '', notes: '' })}
                        >
                          Clear
                        </Button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pick A Response</TableHead>
                            <TableHead>Keterangan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Select
                                value={response.status}
                                onValueChange={(value) => 
                                  setResponse({...response, status: value as 'positive' | 'neutral' | 'negative'})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select response" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="positive">Positive</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                  <SelectItem value="negative">Negative</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="Details" 
                                value={response.notes}
                                onChange={(e) => setResponse({...response, notes: e.target.value})}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end mt-8">
                  <Button 
                    className="gap-2" 
                    onClick={handleNextCall}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Next Call
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}