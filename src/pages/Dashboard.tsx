import { useState } from "react";
import { Plus, FileText, Award, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [stats] = useState({
    totalCertificates: 156,
    totalTemplates: 24,
    totalRecipients: 1234,
    verificationScans: 890
  });

  const recentCertificates = [
    { id: 1, title: "Excellence in Leadership", recipient: "John Doe", date: "2024-01-15", status: "delivered" },
    { id: 2, title: "Digital Marketing Certificate", recipient: "Jane Smith", date: "2024-01-14", status: "pending" },
    { id: 3, title: "Project Management", recipient: "Mike Johnson", date: "2024-01-13", status: "delivered" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your certificates and templates
            </p>
          </div>
          <Button className="btn-hero" onClick={() => window.location.href = '/editor'}>
            <Plus className="mr-2 h-5 w-5" />
            Create Certificate
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary mr-3" />
                <div className="text-3xl font-bold">{stats.totalCertificates}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-accent-gold mr-3" />
                <div className="text-3xl font-bold">{stats.totalTemplates}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-success mr-3" />
                <div className="text-3xl font-bold">{stats.totalRecipients}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-primary mr-3" />
                <div className="text-3xl font-bold">{stats.verificationScans}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="certificates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Recent Certificates</CardTitle>
                <CardDescription>
                  Your latest certificate generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCertificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Issued to {cert.recipient} on {cert.date}
                        </p>
                      </div>
                      <Badge variant={cert.status === 'delivered' ? 'default' : 'secondary'}>
                        {cert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
                <CardDescription>
                  Browse and manage your certificate templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first certificate template
                  </p>
                  <Button onClick={() => window.location.href = '/templates'}>
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Track your certificate performance and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;