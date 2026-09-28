import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LikeButton } from "@/features/likes/components/like-button";
import { getInitials } from "@/features/likes/lib/format";
import type { Post } from "@/services/likes/likes.service";

type PostCardProps = {
  post: Post;
  onToggleLike: (post: Post) => void;
  isTogglingLike: boolean;
};

export function PostCard({
  post,
  onToggleLike,
  isTogglingLike,
}: PostCardProps) {
  const authorName = post.author?.name ?? "Usuario";

  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
        <Avatar>
          <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="truncate text-sm font-semibold">
          {authorName}
        </CardTitle>
      </CardHeader>

      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt={post.caption ?? `Publicación de ${authorName}`}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={post.caption ?? `Publicación de ${authorName}`}
          className="aspect-square w-full bg-gradient-to-br from-rose-200 via-fuchsia-200 to-amber-100 dark:from-rose-900/40 dark:via-fuchsia-900/40 dark:to-amber-900/30"
        />
      )}

      <CardContent className="space-y-2 p-4">
        <LikeButton
          liked={post.likedByCurrentUser}
          likeCount={post.likeCount}
          onToggle={() => onToggleLike(post)}
          disabled={isTogglingLike}
        />
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{authorName}</span> {post.caption}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
