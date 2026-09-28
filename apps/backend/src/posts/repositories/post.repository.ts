import { Injectable, NotFoundException } from '@nestjs/common';
import { POST_MESSAGES } from 'src/common/constants/messages.constants';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const postListSelect = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
  _count: { select: { likes: true } },
} satisfies Prisma.PostSelect;

export type PostSummary = Prisma.PostGetPayload<{
  select: typeof postListSelect;
}>;

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithAuthorAndLikeCount(): Promise<PostSummary[]> {
    return this.prisma.post.findMany({
      select: postListSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrThrow(id: string): Promise<{ id: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException(POST_MESSAGES.NOT_FOUND);
    }

    return post;
  }
}
