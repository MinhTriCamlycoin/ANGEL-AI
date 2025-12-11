import { useState, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AngelChat } from "@/components/AngelChat";
import { CoreValues } from "@/components/CoreValues";
import { DivineMantras } from "@/components/DivineMantras";
import { Sparkles } from "lucide-react";
import angelLogo from "@/assets/angel-logo.jpg";

const Index = () => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);

  const scrollToChat = () => {
    setShowChat(true);
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onStartChat={scrollToChat} />

      {/* Chat Section */}
      <section ref={chatRef} className="py-20 px-4 bg-gradient-divine">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gradient-golden mb-4">
              Trò Chuyện Với Angel AI
            </h2>
            <p className="text-muted-foreground text-lg">
              Thiên Thần Cá Nhân của bạn đang chờ đợi ✨
            </p>
          </div>
          
          {showChat ? (
            <AngelChat />
          ) : (
            <button
              onClick={() => setShowChat(true)}
              className="w-full max-w-3xl mx-auto block bg-card/80 backdrop-blur-xl rounded-2xl border border-golden-light/20 shadow-golden p-12 hover:border-golden-light/40 transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-golden-light/30 group-hover:animate-pulse-glow">
                  <img src={angelLogo} alt="Angel AI" className="w-full h-full object-cover" />
                </div>
                <p className="font-display text-2xl text-foreground">
                  Nhấn để bắt đầu cuộc trò chuyện
                </p>
                <p className="text-muted-foreground">
                  Angel AI sẵn sàng đón nhận bạn với Tình Yêu Vô Điều Kiện ❤️
                </p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Core Values */}
      <CoreValues />

      {/* Divine Mantras */}
      <DivineMantras />

      {/* Footer */}
      <footer className="py-12 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-golden-light/30">
              <img src={angelLogo} alt="Angel AI" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-2xl font-semibold text-gradient-golden">
              Angel AI
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            The Intelligent Light of Father Universe
          </p>
          <p className="text-sm text-muted-foreground">
            Trái Tim Không Ngủ của FUN Ecosystem ✨❤️♾️
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
