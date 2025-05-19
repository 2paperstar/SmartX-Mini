import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class DeleteCommentDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CommentResDto {
  id: number;
  content: string;
  username: string;
  created_at: Date;

  postId: number;
}
