import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostsController } from './post.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CryptoService } from '../common/crypto.service';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostService, CryptoService],
})
export class PostsModule {}
