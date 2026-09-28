import { Injectable, Logger } from '@nestjs/common';
import { PostLikeStateDto } from './dto/post-like-state.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostLikeRepository } from './repositories/post-like.repository';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postLikeRepository: PostLikeRepository,
  ) {}

  async findAll(currentUserId: string): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.findAllWithAuthorAndLikeCount();
    const likedPostIds = await this.postLikeRepository.findLikedPostIds(
      currentUserId,
      posts.map((post) => post.id),
    );
    const likedPostIdSet = new Set(likedPostIds);

    return posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      imageUrl: post.imageUrl,
      author: post.author,
      likeCount: post._count.likes,
      likedByCurrentUser: likedPostIdSet.has(post.id),
      createdAt: post.createdAt,
    }));
  }

  async like(postId: string, currentUserId: string): Promise<PostLikeStateDto> {
    await this.postRepository.findByIdOrThrow(postId);
    await this.postLikeRepository.like(postId, currentUserId);

    this.logger.log(`Hiciste un nuevo like`);
    return this.getLikeState(postId, currentUserId);
  }

  async unlike(
    postId: string,
    currentUserId: string,
  ): Promise<PostLikeStateDto> {
    await this.postRepository.findByIdOrThrow(postId);
    await this.postLikeRepository.unlike(postId, currentUserId);

    return this.getLikeState(postId, currentUserId);
  }

  private async getLikeState(
    postId: string,
    userId: string,
  ): Promise<PostLikeStateDto> {
    const [likeCount, likedByCurrentUser] = await Promise.all([
      this.postLikeRepository.countByPost(postId),
      this.postLikeRepository.existsByPostAndUser(postId, userId),
    ]);

    return { postId, likeCount, likedByCurrentUser };
  }
}
