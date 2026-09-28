import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostLikeRepository } from './repositories/post-like.repository';
import { PostRepository } from './repositories/post.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepository, PostLikeRepository],
})
export class PostsModule {}
