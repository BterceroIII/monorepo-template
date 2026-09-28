import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostLikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLikedPostIds(userId: string, postIds: string[]): Promise<string[]> {
    if (postIds.length === 0) {
      return [];
    }

    const likes = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });

    return likes.map((like) => like.postId);
  }

  async like(postId: string, userId: string): Promise<void> {
    await this.prisma.postLike.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.prisma.postLike.deleteMany({ where: { postId, userId } });
  }

  async countByPost(postId: string): Promise<number> {
    return this.prisma.postLike.count({ where: { postId } });
  }

  async existsByPostAndUser(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });

    return like !== null;
  }
}
