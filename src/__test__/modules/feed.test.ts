import { expect, test, vi } from 'vitest';
import { randomUUID } from 'node:crypto';

vi.mock('ioredis', () => vi.importActual('ioredis-mock'));

test('Returns an array of posts', async () => {
    const { redis } = await import('@app/common/redis');
    const { getFeed } = await import('@app/modules/feed');

    // Create a post
    const postId = randomUUID();
    const createdAt = new Date().getTime();
    const updatedAt = new Date().getTime();
    const title = 'TEST POST PLEASE IGNORE';
    await redis.set(`post:${postId}`, JSON.stringify({ createdAt, updatedAt, title }));

    // Add the post to the feed
    const followerId = randomUUID();
    await redis.zadd(`feed:${followerId}`, createdAt, `post:${postId}`);

    // Bug: https://github.com/stipsan/ioredis-mock/issues/1188
    // This should return a string for the score but returns a number when mocked
    // await expect(redis.zrangebyscore(`feed:${followerId}`, '-inf', '+inf', 'WITHSCORES', 'LIMIT', 0, 100)).resolves.toStrictEqual([`post:${postId}`, `${createdAt}`]);
    await expect(redis.zrangebyscore(`feed:${followerId}`, '-inf', '+inf', 'WITHSCORES', 'LIMIT', 0, 100)).resolves.toStrictEqual([`post:${postId}`, createdAt]);
    
    // The post should be in the feed now
    await expect(getFeed(followerId)).resolves.toStrictEqual([{
        createdAt,
        title,
        updatedAt
    }]);
});

test('Returns no posts for a non-existant user', async () => {
    const { getFeed } = await import('@app/modules/feed');
    await expect(getFeed(randomUUID())).resolves.toStrictEqual([]);
});
