import { ApiProperty } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({
    description: 'Author user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Author display name',
    example: 'Ana Pérez',
    nullable: true,
  })
  name!: string | null;
}
