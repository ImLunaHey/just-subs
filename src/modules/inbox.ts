import { randomUUID } from 'crypto';
import { FeedLimit, redis } from '@app/common/redis';

type Message = {
    body: string;
    createdAt: number;
    updatedAt: number;
};

// /**
//  * Get inboxes for a member
//  */
// export const getInboxes = async (memberId: string, limit = 100, startOffset = '-inf' as FeedLimit, endOffset = '+inf' as FeedLimit):  => {
//     const inboxes = await redis.getInboxes(memberId, startOffset, endOffset, limit);
//     return inboxes.map(inbox => JSON.parse(inbox) as Inbox);
// };

/**
 * Get first $limit messages for an inbox
 */
export const getInbox = async (inboxId: string, limit = 100, startOffset = '-inf' as FeedLimit, endOffset = '+inf' as FeedLimit): Promise<Message[]> => {
    // const messages = await redis.getInbox(inboxId, startOffset, endOffset, limit);
    const messages = await redis.zrangebyscore(`inbox:${inboxId}`, startOffset, endOffset, 'WITHSCORES', 'LIMIT', 0, limit);
    console.log(messages);
    return messages.map(message => JSON.parse(message) as Message);
};

/**
 * Create a new inbox with an initial message
 */
export const createInbox = async (memberIds: string[], message: Partial<Message>): Promise<string> => {
    // Create an inbox
    const inboxId = randomUUID();
    await addMessageToInbox(inboxId, message);

    // Add the inbox to each member
    await Promise.all(memberIds.map(memberId => redis.zadd(`inboxes:${memberId}`, new Date().getTime(), `inbox:${inboxId}`)));

    // Return inbox ID
    return inboxId;
};

/**
 * Add a message to an inbox
 */
export const addMessageToInbox = async (inboxId: string, message: Partial<Message>): Promise<string> => {
    // Create a message
    const messageId = randomUUID();
    await redis.set(`message:${messageId}`, JSON.stringify({ createdAt: new Date().getTime(), updatedAt: new Date().getTime(), body: message.body }));

    // Add message to inbox
    await redis.zadd(`inbox:${inboxId}`, new Date().getTime(), `message:${messageId}`);

    // Return message ID
    return messageId;
};

/**
 * Add a member to an inbox
 */
export const addMemberToInbox = async (memberId: string, inboxId: string): Promise<void> => {
    await redis.zadd(`inboxes:${memberId}`, new Date().getTime(), `inbox:${inboxId}`);
};

/**
 * Remove a member from an inbox
 */
export const removeMemberFromInbox = async (memberId: string, inboxId: string): Promise<void> => {
    await redis.zrem(`inboxes:${memberId}`, `inbox:${inboxId}`);
};

/**
 * Delete an inbox
 */
export const deleteInbox = async (inboxId: string) => {
    await redis.del(`inbox:${inboxId}`);
};
