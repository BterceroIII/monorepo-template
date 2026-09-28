import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';

type PostsServiceMock = jest.Mocked<
  Pick<PostsService, 'findAll' | 'like' | 'unlike'>
>;

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsServiceMock;

  const currentUser = {
    id: '11111111-1111-4111-8111-111111111111',
  } as Parameters<PostsController['findAll']>[0];
  const postId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    postsService = {
      findAll: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn(),
    };
    controller = new PostsController(postsService as unknown as PostsService);
  });

  it('delegates GET /posts to the service with the current user id', async () => {
    postsService.findAll.mockResolvedValue([]);

    await expect(controller.findAll(currentUser)).resolves.toEqual([]);
    expect(postsService.findAll).toHaveBeenCalledWith(currentUser.id);
  });

  it('delegates POST /posts/:postId/likes to the service', async () => {
    postsService.like.mockResolvedValue({
      postId,
      likeCount: 1,
      likedByCurrentUser: true,
    });

    await controller.like(postId, currentUser);

    expect(postsService.like).toHaveBeenCalledWith(postId, currentUser.id);
  });

  it('delegates DELETE /posts/:postId/likes to the service', async () => {
    postsService.unlike.mockResolvedValue({
      postId,
      likeCount: 0,
      likedByCurrentUser: false,
    });

    await controller.unlike(postId, currentUser);

    expect(postsService.unlike).toHaveBeenCalledWith(postId, currentUser.id);
  });
});
