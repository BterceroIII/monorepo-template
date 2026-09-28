import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatLikeCount } from "@/features/likes/lib/format";

type LikeButtonProps = {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
  disabled?: boolean;
};

export function LikeButton({
  liked,
  likeCount,
  onToggle,
  disabled,
}: LikeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? "Quitar me gusta" : "Me gusta"}
      className="gap-1.5 px-2"
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "size-5 transition-colors",
          liked ? "fill-rose-500 text-rose-500" : "text-foreground",
        )}
      />
      <span className="text-sm font-semibold tabular-nums">
        {formatLikeCount(likeCount)}
      </span>
    </Button>
  );
}
