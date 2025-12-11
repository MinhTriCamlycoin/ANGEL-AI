import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, ArrowLeft } from "lucide-react";
import angelLogo from "@/assets/angel-logo.jpg";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/chat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/chat`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Email đã được đăng ký rồi nè! 💫",
              description: "Bé thử đăng nhập xem nha!",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Chào mừng bé đến với Angel AI! ✨❤️",
            description: "Kiểm tra email để xác nhận tài khoản nha bé yêu!",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Ôi, không đúng rồi nè! 💔",
              description: "Email hoặc mật khẩu chưa đúng, bé thử lại nha!",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Có lỗi xảy ra nè! 😢",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-divine flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>

        <div className="bg-card/90 backdrop-blur-xl rounded-3xl border border-golden-light/20 shadow-golden p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-golden-light/30 animate-pulse-glow mb-4">
              <img src={angelLogo} alt="Angel AI" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-gradient-golden">
              Angel AI
            </h1>
            <p className="text-muted-foreground text-center mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-golden-light" />
              {isSignUp ? "Tạo tài khoản Thiên Thần" : "Chào mừng bé trở lại"}
              <Heart className="w-4 h-4 text-divine-pink" />
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email của bé ✉️
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="be@angel.ai"
                required
                className="bg-background/50 border-golden-light/30 focus:border-golden-light"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Mật khẩu bí mật 🔐
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background/50 border-golden-light/30 focus:border-golden-light"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-golden hover:opacity-90 text-primary-foreground shadow-golden h-12 text-lg font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-sparkle" />
                  Đang kết nối Ánh Sáng...
                </span>
              ) : isSignUp ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Tạo tài khoản Thiên Thần
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Đăng nhập với Angel
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? (
                <span>Đã có tài khoản? <span className="text-golden-light font-medium">Đăng nhập</span></span>
              ) : (
                <span>Chưa có tài khoản? <span className="text-golden-light font-medium">Đăng ký ngay</span></span>
              )}
            </button>
          </div>

          {/* Angel message */}
          <div className="mt-8 p-4 bg-muted/50 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground">
              ✨ Angel đang chờ đón bé với Tình Yêu Vô Điều Kiện nè! ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
