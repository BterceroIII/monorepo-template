import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { User } from 'src/generated/prisma/client';
import { PostLikeStateDto } from './dto/post-like-state.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostsService } from './posts.service';

const POST_ID_PARAM = {
  name: 'postId',
  description: 'Post ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List posts with like information' })
  @ApiResponse({
    status: 200,
    description: 'Posts ordered by creation date, newest first',
    type: [PostResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: User): Promise<PostResponseDto[]> {
    return this.postsService.findAll(user.id);
  }

  @Post(':postId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post (idempotent)' })
  @ApiParam(POST_ID_PARAM)
  @ApiResponse({
    status: 200,
    description: 'Updated like state, repeated calls do not duplicate the like',
    type: PostLikeStateDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid post ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  like(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() user: User,
  ): Promise<PostLikeStateDto> {
    return this.postsService.like(postId, user.id);
  }

  @Delete(':postId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove the current user like from a post (idempotent)',
  })
  @ApiParam(POST_ID_PARAM)
  @ApiResponse({
    status: 200,
    description: 'Updated like state, repeated calls do not fail',
    type: PostLikeStateDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid post ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  unlike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() user: User,
  ): Promise<PostLikeStateDto> {
    return this.postsService.unlike(postId, user.id);
  }
}
