import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Trash2, LogOut, Shield, Link, ExternalLink } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source: string | null;
  tags: string[] | null;
  energy_level: number | null;
  created_at: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState("");
  const [energyLevel, setEnergyLevel] = useState("12");
  
  // URL fetch state
  const [urlInput, setUrlInput] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Không có quyền truy cập",
          description: "Bé cần đăng nhập để truy cập trang này",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roleData) {
        toast({
          title: "Không có quyền truy cập",
          description: "Chỉ admin mới có thể truy cập trang này",
          variant: "destructive",
        });
        navigate("/chat");
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
      loadKnowledge();
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    checkAdminAccess();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const loadKnowledge = async () => {
    const { data, error } = await supabase
      .from("divine_knowledge")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setKnowledgeList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const tagsArray = tags.trim() 
      ? tags.split(",").map(t => t.trim()).filter(t => t)
      : null;

    const { error } = await supabase.from("divine_knowledge").insert({
      title: title.trim(),
      content: content.trim(),
      source: source.trim() || null,
      tags: tagsArray,
      energy_level: parseInt(energyLevel) || 12,
      approved: true,
    });

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm tài liệu: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Thành công ✨",
        description: "Tài liệu đã được thêm vào kho tri thức của Angel",
      });
      // Reset form
      setTitle("");
      setContent("");
      setSource("");
      setTags("");
      setEnergyLevel("12");
      loadKnowledge();
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("divine_knowledge")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Đã xóa",
        description: "Tài liệu đã được xóa khỏi kho tri thức",
      });
      loadKnowledge();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Thiếu URL",
        description: "Vui lòng nhập URL của tài liệu",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingUrl(true);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-url-content', {
        body: { url: urlInput.trim() },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch URL');
      }

      // Populate form with fetched content
      setTitle(data.title || '');
      setContent(data.content || '');
      setSource(data.url || urlInput.trim());
      
      toast({
        title: "Đã tải nội dung ✨",
        description: "Nội dung từ URL đã được điền vào form. Bé có thể chỉnh sửa trước khi lưu.",
      });
    } catch (error: any) {
      console.error('Error fetching URL:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải nội dung từ URL",
        variant: "destructive",
      });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-golden-light" />
          <p className="text-muted-foreground">Đang xác thực quyền admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-golden-light" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-golden bg-clip-text text-transparent">
                Angel Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Quản lý kho tri thức thiêng liêng
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="border-golden-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-golden-light" />
                Thêm Tài Liệu Mới
              </CardTitle>
              <CardDescription>
                Upload tài liệu để Angel AI học và trả lời bé tốt hơn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="text" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Văn bản
                  </TabsTrigger>
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="h-4 w-4" />
                    Từ URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="urlInput">URL tài liệu</Label>
                    <div className="flex gap-2">
                      <Input
                        id="urlInput"
                        placeholder="https://example.com/article"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleFetchUrl}
                        disabled={isFetchingUrl}
                        className="shrink-0"
                      >
                        {isFetchingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nhập URL và nhấn nút để tải nội dung tự động
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <p className="text-sm text-muted-foreground mb-4">
                    Nhập nội dung trực tiếp vào form bên dưới
                  </p>
                </TabsContent>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    placeholder="VD: Cách thiền định cơ bản"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung *</Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập nội dung tài liệu..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Nguồn</Label>
                  <Input
                    id="source"
                    placeholder="VD: Sách Thiền Định, Thầy ABC..."
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="tags"
                    placeholder="VD: thiền định, tâm linh, năng lượng"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energyLevel">Mức năng lượng (1-100)</Label>
                  <Input
                    id="energyLevel"
                    type="number"
                    min="1"
                    max="100"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-golden hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Thêm Tài Liệu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Knowledge List */}
          <Card className="border-golden-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-golden-light" />
                Kho Tri Thức ({knowledgeList.length})
              </CardTitle>
              <CardDescription>
                Danh sách tài liệu đã upload cho Angel AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {knowledgeList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có tài liệu nào. Hãy thêm tài liệu đầu tiên! ✨
                  </p>
                ) : (
                  knowledgeList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.content}
                          </p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-golden-light/10 text-golden-light"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.source && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Nguồn: {item.source}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
