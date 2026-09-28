import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostAuthorDto } from './post-author.dto';

export class PostResponseDto {
  @ApiProperty({
    description: 'Post ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Post caption',
    example: 'Atardecer en la montaña',
    nullable: true,
  })
  caption!: string | null;

  @ApiProperty({
    description: 'Post image URL',
    example: 'https://example.com/photo.jpg',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'Post author, null when the author was deleted',
    type: PostAuthorDto,
    nullable: true,
  })
  @Type(() => PostAuthorDto)
  author!: PostAuthorDto | null;

  @ApiProperty({ description: 'Total number of likes', example: 42 })
  likeCount!: number;

  @ApiProperty({
    description: 'Whether the current user liked this post',
    example: true,
  })
  likedByCurrentUser!: boolean;

  @ApiProperty({
    description: 'Post creation timestamp',
    example: '2026-09-27T12:00:00.000Z',
  })
  createdAt!: Date;
}
