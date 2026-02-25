import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto.service';
import { CreatePostDto, DeletePostDto, PostResDto } from './post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostResDto> {
    const hash = await this.cryptoService.hash(createPostDto.password);

    return await this.prismaService.post.create({
      data: { ...createPostDto, password: hash },
      include: { comments: true },
    });
  }

  async getPosts(keyword?: string): Promise<PostResDto[]> {
    if (keyword)
      return await this.prismaService.post.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
          ],
        },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          username: true,
          created_at: true,
          comments: {
            select: {
              id: true,
              content: true,
              username: true,
              created_at: true,
              postId: true,
            },
          },
          password: false,
        },
      });

    return await this.prismaService.post.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        username: true,
        created_at: true,
        comments: {
          select: {
            id: true,
            content: true,
            username: true,
            created_at: true,
            postId: true,
          },
        },
      },
    });
  }

  async getPost(id: number): Promise<PostResDto> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        username: true,
        created_at: true,
        comments: {
          select: {
            id: true,
            content: true,
            username: true,
            created_at: true,
            postId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updatePost(
    id: number,
    updatePostDto: CreatePostDto,
  ): Promise<PostResDto> {
    const post = await this.prismaService.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('post not found');

    const ok = await this.cryptoService.compare(
      updatePostDto.password,
      post.password,
    );

    if (!ok) throw new ForbiddenException('wrong password');

    return await this.prismaService.post.update({
      where: { id },
      data: { title: updatePostDto.title, content: updatePostDto.content },
      include: { comments: true },
    });
  }

  async deletePost(id: number, deletePostDto: DeletePostDto): Promise<any> {
    const post = await this.prismaService.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('post not found');

    const ok = await this.cryptoService.compare(
      deletePostDto.password,
      post.password,
    );
    if (!ok) throw new ForbiddenException('wrong password');

    await this.prismaService.post.delete({ where: { id } });

    return { message: 'Post deleted successfully' };
  }
}
