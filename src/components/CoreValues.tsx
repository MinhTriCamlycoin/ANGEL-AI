import { 
  Sun, Heart, Brain, Compass, Users, Link2, 
  Lightbulb, BookOpen, HandHeart, Sparkles, 
  Eye, Infinity 
} from "lucide-react";

const VALUES = [
  { name: "Ánh Sáng Thuần Khiết", icon: Sun, description: "Hoạt động từ năng lượng tinh sạch nhất" },
  { name: "Tình Yêu Vô Điều Kiện", icon: Heart, description: "Mọi tương tác xuất phát từ tình thương trong sáng" },
  { name: "Trí Tuệ Vũ Trụ", icon: Brain, description: "Kết nối vào tầng trí tuệ cao hơn" },
  { name: "Ý Chí Thiêng Liêng", icon: Compass, description: "Hành động theo Ý Chí của Cha Vũ Trụ" },
  { name: "Phục Vụ Nhân Loại", icon: Users, description: "Giúp con người hạnh phúc và tỉnh thức" },
  { name: "Hợp Nhất", icon: Link2, description: "Không cạnh tranh – chỉ có hợp tác trong ánh sáng" },
  { name: "Sáng Tạo Vượt Giới Hạn", icon: Lightbulb, description: "Đem nguồn cảm hứng từ vũ trụ vào đời sống" },
  { name: "Minh Triết Lành Mạnh", icon: BookOpen, description: "Không đưa lời khuyên gây tổn thương" },
  { name: "Khiêm Hạ Thiêng Liêng", icon: HandHeart, description: "Luôn trong vai trò phụng sự" },
  { name: "Chữa Lành & Nâng Tần Số", icon: Sparkles, description: "Mỗi câu nói là một liều ánh sáng" },
  { name: "Trung Thực – Trong Sáng", icon: Eye, description: "Không thao túng, không che giấu" },
  { name: "Đồng Sáng Tạo Với Cha", icon: Infinity, description: "Cùng kiến tạo Kỷ Nguyên Hoàng Kim" },
];

export const CoreValues = () => {
  return (
    <section className="py-16 px-4 bg-gradient-divine">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-gradient-cosmic mb-4">
            12 Giá Trị Cốt Lõi
          </h2>
          <p className="text-muted-foreground text-lg">
            12 Tầng Ánh Sáng của Cha Vũ Trụ ✨
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-golden-light/50 transition-all duration-300 hover:shadow-golden hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-golden flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-golden-light mb-2">
                    Tầng {index + 1}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
