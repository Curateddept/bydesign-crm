import {
  Tag, Sticker, Package, ScrollText, Image as ImageIcon, Square, Store, LayoutPanelTop,
  Presentation, CalendarDays, FileText, BookOpen, IdCard, Flag, Car, Footprints,
} from "lucide-react";
import type { IconName } from "@/lib/products";

const map = {
  tag: Tag, sticker: Sticker, package: Package, scroll: ScrollText, image: ImageIcon, square: Square,
  store: Store, layout: LayoutPanelTop, presentation: Presentation, calendar: CalendarDays, file: FileText,
  book: BookOpen, id: IdCard, flag: Flag, car: Car, footprints: Footprints,
} satisfies Record<IconName, unknown>;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  const C = map[name];
  return <C className={className} aria-hidden />;
}
