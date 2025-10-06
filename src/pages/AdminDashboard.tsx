import { useState, useRef } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import AIChat from "@/components/AIChat";
import { LayoutDashboard, ChartBar as BarChart3, Users, FileText, Bell, Settings, Search, TrendingUp, TrendingDown, DollarSign, Activity, Percent, ChevronLeft, ChevronRight, FileText as FileTextIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, Upload, Video, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock data for analytics chart
const analyticsData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 5000 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 6000 },
  { month: "Jun", value: 5500 },
  { month: "Jul", value: 7000 },
];

// Mock data for recent activity
const recentActivity = [
  { id: 1, user: "John Doe", action: "Enrolled in Course", time: "2 minutes ago", status: "success" },
  { id: 2, user: "Jane Smith", action: "Completed Quiz", time: "15 minutes ago", status: "info" },
  { id: 3, user: "Mike Johnson", action: "Payment Received", time: "1 hour ago", status: "success" },
  { id: 4, user: "Sarah Wilson", action: "Course Review", time: "2 hours ago", status: "warning" },
  { id: 5, user: "Tom Brown", action: "Certificate Issued", time: "3 hours ago", status: "success" },
];

const AdminDashboardContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [textInput, setTextInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
    { icon: FileTextIcon, label: "AI Summary", value: "summary" },
    { icon: BarChart3, label: "Analytics", value: "analytics" },
    { icon: Users, label: "Users", value: "users" },
    { icon: Bell, label: "Notifications", value: "notifications" },
    { icon: Settings, label: "Settings", value: "settings" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSummarize = async (type: "text" | "video" | "image") => {
    setIsLoading(true);
    setSummary("");

    try {
      let content = "";
      if (type === "text") content = textInput;
      else if (type === "video") content = videoUrl;
      else if (type === "image") content = imagePreview || "";

      if (!content) {
        toast({
          title: "Error",
          description: "Please provide content to summarize",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-summarize", {
        body: { content, type },
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Success",
        description: "Summary generated successfully",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold">Admin Panel</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                activeTab === item.value
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-background"
              />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto bg-gradient-subtle p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === "dashboard" && (
              <>
                {/* Page Title */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                  <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,543</div>
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12.5%</span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231</div>
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.2%</span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <TrendingDown className="h-3 w-3" />
                    <span>-3.1%</span>
                    <span className="text-muted-foreground">from last week</span>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Rate */}
              <Card className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
                  <Percent className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15.3%</div>
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+2.4%</span>
                    <span className="text-muted-foreground">from last quarter</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analytics Chart */}
              <Card className="shadow-elegant lg:col-span-1">
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>Performance metrics over the last 7 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--accent))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity Feed */}
              <Card className="shadow-elegant lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {activity.user.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              activity.status === "success"
                                ? "default"
                                : activity.status === "warning"
                                ? "outline"
                                : "secondary"
                            }
                            className={cn(
                              "text-xs",
                              activity.status === "success" && "bg-success text-success-foreground",
                              activity.status === "warning" && "bg-warning text-warning-foreground border-warning",
                              activity.status === "info" && "bg-info text-info-foreground"
                            )}
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
              </>
            )}

            {activeTab === "summary" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">AI Content Summarizer</h1>
                  <p className="text-muted-foreground mt-1">Paste text, upload images, or provide video URLs for AI-powered summaries</p>
                </div>

                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="gap-2">
                      <FileTextIcon className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <CardTitle>Text Summarization</CardTitle>
                        <CardDescription>Paste any text content for a concise summary</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Paste your text here..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          className="min-h-[200px]"
                        />
                        <Button
                          onClick={() => handleSummarize("text")}
                          disabled={isLoading || !textInput}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Summary...
                            </>
                          ) : (
                            "Summarize Text"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <CardTitle>Image Analysis</CardTitle>
                        <CardDescription>Upload an image for AI description and summary</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        >
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-[300px] mx-auto rounded-lg" />
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to upload an image</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => handleSummarize("image")}
                          disabled={isLoading || !imagePreview}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing Image...
                            </>
                          ) : (
                            "Analyze Image"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <CardTitle>Video Summary</CardTitle>
                        <CardDescription>Provide a YouTube or video URL for summarization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          type="url"
                        />
                        <Button
                          onClick={() => handleSummarize("video")}
                          disabled={isLoading || !videoUrl}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Summary...
                            </>
                          ) : (
                            "Summarize Video"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {summary && (
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle>Summary Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{summary}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab !== "dashboard" && activeTab !== "summary" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  {menuItems.find(item => item.value === activeTab)?.label}
                </h2>
                <p className="text-muted-foreground mt-2">This section is coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <AIChat />
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
};

export default AdminDashboard;
