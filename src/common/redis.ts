// import IORedisMock from 'ioredis-mock';
import dedent from 'dedent';
import IORedis, { Result } from 'ioredis';

export const redis = new IORedis();

redis.defineCommand('getFeed', {
    numberOfKeys: 4,
    lua: dedent`
        local result={}
        local items=redis.call('zrangebyscore', 'feed:'..KEYS[1], KEYS[2], KEYS[3], 'withscores', 'limit', 0, KEYS[4])
        for i=1,#items,2 do
            result[i]=redis.call('get', items[i])
        end
        return result
    `
});

redis.defineCommand('getInboxes', {
    numberOfKeys: 4,
    lua: dedent`
        local result={}
        local items=redis.call('zrangebyscore', 'inboxes:'..KEYS[1], KEYS[2], KEYS[3], 'withscores', 'limit', 0, KEYS[4])
        for i=1,#items,2 do
            result[i]=redis.call('get', items[i])
        end
        return result
    `
});

redis.defineCommand('getInbox', {
    numberOfKeys: 4,
    lua: dedent`
        local result={}
        local items=redis.call('zrangebyscore', 'inbox:'..KEYS[1], KEYS[2], KEYS[3], 'withscores', 'limit', 0, KEYS[4])
        for i=1,#items,2 do
            result[i]=redis.call('get', items[i])
        end
        return result
    `
});

export type FeedLimit = '-inf' | '+inf' | `${number}` | number;

declare module 'ioredis' {
    interface RedisCommander<Context> {
        getFeed(
            ownerId: string,
            min: FeedLimit,
            max: FeedLimit,
            count: number
        ): Result<string[], Context>;
        getInboxes(
            memberId: string,
            min: FeedLimit,
            max: FeedLimit,
            count: number
        ): Result<string[], Context>;
        getInbox(
            memberId: string,
            min: FeedLimit,
            max: FeedLimit,
            count: number
        ): Result<string[], Context>;
    }
}
