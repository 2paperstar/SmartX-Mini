import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CryptoService } from '../common/crypto.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [CommentService, CryptoService],
})
export class CommentsModule {}
