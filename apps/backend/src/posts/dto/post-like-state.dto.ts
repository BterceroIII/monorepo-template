import { ApiProperty } from '@nestjs/swagger';

export class PostLikeStateDto {
  @ApiProperty({
    description: 'Post ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  postId!: string;

  @ApiProperty({ description: 'Total number of likes', example: 43 })
  likeCount!: number;

  @ApiProperty({
    description: 'Whether the current user liked this post',
    example: true,
  })
  likedByCurrentUser!: boolean;
}
