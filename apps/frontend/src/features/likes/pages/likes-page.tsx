import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/features/likes/components/post-card";
import { PostCardSkeleton } from "@/features/likes/components/post-card-skeleton";
import { usePostLikes } from "@/features/likes/hooks/use-post-likes";
import { getApiErrorMessage } from "@/services/api";

export function LikesPage() {
  const {
    posts,
    isLoading,
    isError,
    error,
    refetch,
    toggleLike,
    pendingPostId,
  } = usePostLikes();

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <header className="w-full space-y-1">
          <h1 className="text-xl font-semibold">Publicaciones</h1>
          <p className="text-sm text-muted-foreground">
            Dale me gusta y el contador se guarda en el servidor.
          </p>
        </header>

        {isLoading && (
          <div className="flex w-full flex-col items-center gap-6">
            <PostCardSkeleton />
          </div>
        )}

        {isError && (
          <Card className="w-full gap-0 py-0">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <AlertCircle
                aria-hidden="true"
                className="size-6 text-destructive"
              />
              <p className="text-sm text-destructive">
                {getApiErrorMessage(error)}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <Card className="w-full gap-0 py-0">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Todavía no hay publicaciones.
            </CardContent>
          </Card>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleLike={toggleLike}
            isTogglingLike={pendingPostId === post.id}
          />
        ))}
      </div>
    </main>
  );
}
