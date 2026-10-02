import Icon from "./Icon";
import type { CategorySlug, IconName } from "@/lib/products";

// Placeholder product visuals until real product photography is added.
const tones: Record<CategorySlug, string> = {
  "labels-packaging": "from-[#ff4b1f] to-[#ff9a3c]",
  "wide-format": "from-[#0d0d0f] to-[#3a3a42]",
  "display-design": "from-[#2643ff] to-[#6a7bff]",
  "events-promotional": "from-[#7a1fff] to-[#d14bff]",
};

export default function ProductArt({
  category, icon, className = "", size = "md",
}: { category: CategorySlug; icon: IconName; className?: string; size?: "md" | "lg" }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tones[category]} ${className}`}>
      <div className="stripe-bg absolute inset-0" />
      <div className="absolute inset-0 grid place-items-center">
        <Icon name={icon} className={`${size === "lg" ? "h-28 w-28" : "h-14 w-14"} text-white/90 drop-shadow`} />
      </div>
    </div>
  );
}
