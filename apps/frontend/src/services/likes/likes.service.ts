import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/services/api";

export type PostAuthor = {
  id: string;
  name: string | null;
};

export type Post = {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  author: PostAuthor | null;
  likeCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
};

export type PostLikeState = {
  postId: string;
  likeCount: number;
  likedByCurrentUser: boolean;
};

export const postsQueryKey = ["posts"] as const;

export async function fetchPosts() {
  const { data } = await api.get<Post[]>("/posts");
  return data;
}

export async function likePost(postId: string) {
  const { data } = await api.post<PostLikeState>(`/posts/${postId}/likes`);
  return data;
}

export async function unlikePost(postId: string) {
  const { data } = await api.delete<PostLikeState>(`/posts/${postId}/likes`);
  return data;
}

export function usePosts() {
  return useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
  });
}

type ToggleLikeVariables = {
  postId: string;
  likedByCurrentUser: boolean;
};

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, likedByCurrentUser }: ToggleLikeVariables) =>
      likedByCurrentUser ? unlikePost(postId) : likePost(postId),
    onMutate: async ({ postId, likedByCurrentUser }) => {
      await queryClient.cancelQueries({ queryKey: postsQueryKey });
      const previousPosts = queryClient.getQueryData<Post[]>(postsQueryKey);

      queryClient.setQueryData<Post[]>(postsQueryKey, (posts) =>
        posts?.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByCurrentUser: !likedByCurrentUser,
                likeCount: Math.max(
                  0,
                  post.likeCount + (likedByCurrentUser ? -1 : 1),
                ),
              }
            : post,
        ),
      );

      return { previousPosts };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postsQueryKey, context.previousPosts);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });
}
