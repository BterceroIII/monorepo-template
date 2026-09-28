import { NotFoundException } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { PostLikeRepository } from '../repositories/post-like.repository';
import { PostRepository } from '../repositories/post.repository';

type PostRepositoryMock = jest.Mocked<
  Pick<PostRepository, 'findAllWithAuthorAndLikeCount' | 'findByIdOrThrow'>
>;

type PostLikeRepositoryMock = jest.Mocked<
  Pick<
    PostLikeRepository,
    | 'findLikedPostIds'
    | 'like'
    | 'unlike'
    | 'countByPost'
    | 'existsByPostAndUser'
  >
>;

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: PostRepositoryMock;
  let postLikeRepository: PostLikeRepositoryMock;

  const currentUserId = '11111111-1111-4111-8111-111111111111';
  const postId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    postRepository = {
      findAllWithAuthorAndLikeCount: jest.fn(),
      findByIdOrThrow: jest.fn(),
    };
    postLikeRepository = {
      findLikedPostIds: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn(),
      countByPost: jest.fn(),
      existsByPostAndUser: jest.fn(),
    };

    service = new PostsService(
      postRepository as unknown as PostRepository,
      postLikeRepository as unknown as PostLikeRepository,
    );
  });

  describe('findAll', () => {
    it('maps likeCount and likedByCurrentUser from the repositories', async () => {
      postRepository.findAllWithAuthorAndLikeCount.mockResolvedValue([
        {
          id: postId,
          caption: 'Atardecer',
          imageUrl: null,
          createdAt: new Date('2026-09-27T12:00:00.000Z'),
          author: { id: currentUserId, name: 'Ana Pérez' },
          _count: { likes: 2 },
        },
      ]);
      postLikeRepository.findLikedPostIds.mockResolvedValue([postId]);

      const result = await service.findAll(currentUserId);

      expect(postLikeRepository.findLikedPostIds).toHaveBeenCalledWith(
        currentUserId,
        [postId],
      );
      expect(result).toEqual([
        {
          id: postId,
          caption: 'Atardecer',
          imageUrl: null,
          createdAt: new Date('2026-09-27T12:00:00.000Z'),
          author: { id: currentUserId, name: 'Ana Pérez' },
          likeCount: 2,
          likedByCurrentUser: true,
        },
      ]);
    });

    it('marks posts that the current user has not liked', async () => {
      postRepository.findAllWithAuthorAndLikeCount.mockResolvedValue([
        {
          id: postId,
          caption: null,
          imageUrl: null,
          createdAt: new Date(),
          author: null,
          _count: { likes: 0 },
        },
      ]);
      postLikeRepository.findLikedPostIds.mockResolvedValue([]);

      const [post] = await service.findAll(currentUserId);

      expect(post.likedByCurrentUser).toBe(false);
      expect(post.likeCount).toBe(0);
      expect(post.author).toBeNull();
    });
  });

  describe('like', () => {
    it('returns the updated state after registering the like', async () => {
      postRepository.findByIdOrThrow.mockResolvedValue({ id: postId });
      postLikeRepository.countByPost.mockResolvedValue(1);
      postLikeRepository.existsByPostAndUser.mockResolvedValue(true);

      const result = await service.like(postId, currentUserId);

      expect(postLikeRepository.like).toHaveBeenCalledWith(
        postId,
        currentUserId,
      );
      expect(result).toEqual({
        postId,
        likeCount: 1,
        likedByCurrentUser: true,
      });
    });

    it('throws NotFoundException when the post does not exist', async () => {
      postRepository.findByIdOrThrow.mockRejectedValue(new NotFoundException());

      await expect(service.like(postId, currentUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(postLikeRepository.like).not.toHaveBeenCalled();
    });
  });

  describe('unlike', () => {
    it('returns the updated state after removing the like', async () => {
      postRepository.findByIdOrThrow.mockResolvedValue({ id: postId });
      postLikeRepository.countByPost.mockResolvedValue(0);
      postLikeRepository.existsByPostAndUser.mockResolvedValue(false);

      const result = await service.unlike(postId, currentUserId);

      expect(postLikeRepository.unlike).toHaveBeenCalledWith(
        postId,
        currentUserId,
      );
      expect(result).toEqual({
        postId,
        likeCount: 0,
        likedByCurrentUser: false,
      });
    });

    it('is idempotent when the like was already removed', async () => {
      postRepository.findByIdOrThrow.mockResolvedValue({ id: postId });
      postLikeRepository.countByPost.mockResolvedValue(0);
      postLikeRepository.existsByPostAndUser.mockResolvedValue(false);

      await expect(service.unlike(postId, currentUserId)).resolves.toEqual({
        postId,
        likeCount: 0,
        likedByCurrentUser: false,
      });
    });
  });
});
