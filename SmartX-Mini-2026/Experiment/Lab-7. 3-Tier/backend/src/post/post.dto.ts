import { IsNotEmpty, IsString } from 'class-validator';
import { CommentResDto } from 'src/comment/comment.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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

export class DeletePostDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PostResDto {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: Date;

  comments: CommentResDto[];
}
