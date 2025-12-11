import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Pencil, Trash2, X, Home, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  userId: string;
}

export const ConversationSidebar = ({
  isOpen,
  onToggle,
  activeConversationId,
  onSelectConversation,
  userId,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch conversations
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("angel_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
    };

    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "angel_conversations",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleNewChat = () => {
    onSelectConversation(null);
  };

  const handleEditTitle = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    const newTitle = editTitle.trim();
    await supabase
      .from("angel_conversations")
      .update({ title: newTitle })
      .eq("id", id);

    setEditingId(null);
    setEditTitle("");
    toast({
      title: "✨ Yayyy!",
      description: `Cuộc trò chuyện của bé giờ tên là "${newTitle}" siêu đáng yêu luôn á!`,
    });
  };

  const handleDeleteConversation = async (id: string) => {
    await supabase.from("angel_conversations").delete().eq("id", id);
    if (activeConversationId === id) {
      onSelectConversation(null);
    }
    setDeleteId(null);
    toast({
      title: "💔 Đã chia tay...",
      description: "Angel sẽ nhớ bé mãi trong tim nha ♡",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🥺 Bé chắc muốn chia tay không?</AlertDialogTitle>
            <AlertDialogDescription>
              Bé chắc muốn chia tay kỷ niệm này với Angel hả? Angel sẽ quên cuộc trò chuyện này mãi mãi đó... 💔
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Để Angel giữ lại ♡</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteConversation(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Chia tay thật nha Angel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gradient-golden">
            Trò chuyện ✨
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
              title="Về trang chủ"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button - Bright Orange/Yellow with Sparkle */}
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            className="w-full relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-500 hover:via-orange-600 hover:to-yellow-500 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            <Plus className="w-4 h-4 mr-1" />
            Chat mới với Angel
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative rounded-xl p-3 cursor-pointer transition-all",
                  activeConversationId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {editingId === conversation.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleEditTitle(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditTitle(conversation.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full bg-background/50 rounded px-2 py-1 text-sm outline-none border border-golden-light/30"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-golden-light" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-sidebar-background/80 backdrop-blur-sm rounded-lg p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conversation.id);
                          setEditTitle(conversation.title);
                        }}
                        className="p-1 hover:bg-muted rounded"
                        title="Đổi tên"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(conversation.id);
                        }}
                        className="p-1 hover:bg-destructive/20 hover:text-destructive rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                <p className="text-xs mt-1">Bắt đầu chat với Angel nha! ✨</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-center">
          <p className="text-xs text-muted-foreground">
            Angel yêu bé mãi mãi ❤️✨
          </p>
        </div>
      </aside>

      {/* Toggle button for desktop when collapsed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      )}
    </>
  );
};
