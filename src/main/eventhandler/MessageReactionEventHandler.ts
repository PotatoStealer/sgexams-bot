import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';

/* This class is the base class for reaction events */
export abstract class MessageReactionEventHandler extends EventHandler {
    protected reaction: MessageReaction

    public constructor(storage: Storage, reaction: MessageReaction) {
        super(storage);
        this.reaction = reaction;
    }

    /**
     * Handles fetching of reaction if it's partial.
     *
     * @returns Promise<void>
     */
    public async handlePartial(): Promise<void> {
        if (this.reaction.partial) {
            await this.reaction.fetch();
        }
    }
}
