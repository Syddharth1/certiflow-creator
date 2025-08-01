import { useEffect, useState } from "react";
import { Award, Plus, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

const UserDashboard = () => {
  const { user } = useAuth();
  const [myCertificates, setMyCertificates] = useState([]);
  const [receivedCertificates, setReceivedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      // Fetch certificates created by the user
      const { data: created } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user?.id);

      // Fetch certificates received by the user (by email)
      const { data: received } = await supabase
        .from("certificates")
        .select("*")
        .eq("recipient_email", user?.email);

      setMyCertificates(created || []);
      setReceivedCertificates(received || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your certificates and create new ones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates Created
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCertificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates Received
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receivedCertificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/editor">
                  <Button className="w-full btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Certificate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="created">My Certificates</TabsTrigger>
            <TabsTrigger value="received">Received Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificates I Created</CardTitle>
                <CardDescription>
                  Certificates you have created and issued
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : myCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any certificates yet
                    </p>
                    <Link to="/editor">
                      <Button className="btn-hero">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Certificate
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Recipient: {cert.recipient_name || cert.recipient_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">Created</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="received" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificates I Received</CardTitle>
                <CardDescription>
                  Certificates that were issued to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : receivedCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You haven't received any certificates yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Received</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;