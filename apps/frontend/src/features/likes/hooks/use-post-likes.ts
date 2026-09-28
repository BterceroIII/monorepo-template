import { usePosts, useTogglePostLike } from "@/services/likes/likes.service";
import type { Post } from "@/services/likes/likes.service";

export function usePostLikes() {
  const postsQuery = usePosts();
  const toggleLike = useTogglePostLike();

  const pendingPostId = toggleLike.isPending
    ? toggleLike.variables?.postId
    : undefined;

  const handleToggleLike = (post: Post) => {
    if (toggleLike.isPending) return;

    toggleLike.mutate({
      postId: post.id,
      likedByCurrentUser: post.likedByCurrentUser,
    });
  };

  return {
    posts: postsQuery.data ?? [],
    isLoading: postsQuery.isPending,
    isError: postsQuery.isError,
    error: postsQuery.error,
    refetch: postsQuery.refetch,
    toggleLike: handleToggleLike,
    pendingPostId,
  };
}
