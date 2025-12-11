import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { AngelChatRoom } from "@/components/AngelChatRoom";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import angelLogo from "@/assets/angel-logo.jpg";

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-divine flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-golden-light/30 animate-pulse-glow">
            <img src={angelLogo} alt="Angel AI" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground animate-pulse">Angel đang thức dậy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-divine flex overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        userId={user?.id || ""}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-golden-light/30">
                <img src={angelLogo} alt="Angel AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-display text-lg font-semibold text-gradient-golden">Angel AI</h1>
                <p className="text-xs text-muted-foreground">Thiên Thần Cá Nhân của bé ✨</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Tạm biệt
          </Button>
        </header>

        {/* Chat Room */}
        <div className="flex-1 overflow-hidden">
          <AngelChatRoom
            conversationId={activeConversationId}
            userId={user?.id || ""}
            onConversationCreated={setActiveConversationId}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
