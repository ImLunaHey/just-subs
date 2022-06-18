import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getInbox } from '@app/modules/inbox';

const sleep = (ms: number) => new Promise<void>(resolve => {
    setTimeout(() => {
        resolve();
    }, ms);
});

test('Returns an array of messages', async () => {
    const { addMessageToInbox, createInbox } = await import('@app/modules/inbox');

    // Create an inbox
    const initalMessageBody = 'Test message <3';
    const inboxId = await createInbox([randomUUID()], { body: initalMessageBody });

    // The inital message was added to the inbox
    const initalInbox = await getInbox(inboxId);
    expect(initalInbox.length).toStrictEqual(1);
    expect(initalInbox[0].body).toStrictEqual(initalMessageBody);

    // Add a message to an inbox
    const secondMessageBody = 'second message sent :)';
    await addMessageToInbox(inboxId, { body: secondMessageBody });

    // Wait 1s
    await sleep(1_000);

    // Check the inbox for the second message
    const inboxWithTwoMessages = await getInbox(inboxId);
    expect(inboxWithTwoMessages.length).toStrictEqual(2);
    expect(inboxWithTwoMessages[1].body).toStrictEqual(secondMessageBody);
});
