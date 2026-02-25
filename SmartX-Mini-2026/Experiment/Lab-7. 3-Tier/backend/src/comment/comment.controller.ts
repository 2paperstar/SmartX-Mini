import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import {
  CommentResDto,
  CreateCommentDto,
  DeleteCommentDto,
} from './comment.dto';

@Controller('post/:postId/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Create a new comment for a specific post
  @Post()
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResDto> {
    return this.commentService.createComment(postId, createCommentDto);
  }

  @Patch(':id')
  updateComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: CreateCommentDto,
  ): Promise<CommentResDto> {
    return this.commentService.updateComment(postId, id, updateCommentDto);
  }

  // Get all comments for a specific post

  // Delete a comment by comment ID for a specific post
  @Delete(':id')
  deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteCommentDto: DeleteCommentDto,
  ): Promise<void> {
    return this.commentService.deleteComment(postId, id, deleteCommentDto);
  }
}
