import { FeedLimit, redis } from '@app/common/redis';

/**
 * Get $limit=100 posts for a $feedId
 */
export const getFeed = async (feedId: string, limit = 100, startOffset = '-inf' as FeedLimit, endOffset = '+inf' as FeedLimit) => {
    const posts = await redis.getFeed(feedId, startOffset, endOffset, limit);
    return posts.map(post => JSON.parse(post));
};
