import {
 MessageReaction, RichEmbed, TextChannel, Message, MessageAttachment, MessageEmbed, Collection,
} from 'discord.js';
import { StarboardSettings } from '../../storage/StarboardSettings';
import { StarboardCache } from '../../storage/StarboardCache';

export class StarboardResponse {
    public static EMBED_COLOUR = 'f6ff73';

    private starboardSettings: StarboardSettings;

    private reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings, reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    /**
     * Adds a message with enough reactions to the starboard.
     *
     * @param  {number} numberOfReacts Number of reacts.
     * @returns Promise
     */
    public async addToStarboard(numberOfReacts: number): Promise<void> {
        // This function handles attaching of images to the embed
        const handleAttachmentAndEmbeds
            = (embed: RichEmbed,
               embeds: MessageEmbed[],
               attachments: Collection <string, MessageAttachment>): void => {
            // Check embeds for image
            if (embeds.length > 0) {
                const msgEmbed = embeds[0];
                const { thumbnail } = msgEmbed;

                // We're using thumbnail url here because instagram and imgur.
                // Still works though!
                if (msgEmbed.type === 'image' && thumbnail) {
                    embed.setImage(thumbnail.url);
                }
            }

            // Check attachments
            // setImage is overriden if img because attachment takes presidence.
            if (attachments.size > 0) {
                const file = attachments.array()[0];
                const { url, filename } = file;
                const splittedFileUrl = url.split('.');
                const typeOfImage = splittedFileUrl[splittedFileUrl.length - 1];
                const image = /(jpg|jpeg|png|gif|webp)/gi.test(typeOfImage);
                if (image) {
                    embed.setImage(url);
                } else {
                    // It is an attachment that is not an image, send as attachment.
                    embed.addField('Attachment', `[${filename}](${url})`, false);
                }
            }
        };

        return new Promise<void>((): void => {
            const starboardChannelId = this.starboardSettings.getChannel()!;
            const { emoji } = this.reaction;
            const { message } = this.reaction;
            const starboardChannel = message.guild.channels.get(starboardChannelId)!;
            const { tag } = message.author;
            const { nickname } = message.member;
            const channel = `<#${message.channel.id.toString()}>`;
            const {
                url, id, attachments, embeds,
            } = message;
            const content = message.cleanContent;

            // Add message to cache first
            const cacheArr = StarboardCache.addMessageToCacheFirst(message.guild.id, id);

            // Generate embed
            let username = '';
            if (nickname === null) {
                username = `${tag}`;
            } else {
                username = `${nickname}, aka ${tag}`;
            }

            const embed = new RichEmbed()
                .setColor(StarboardResponse.EMBED_COLOUR)
                .setAuthor(`${username}`, message.author.avatarURL)
                .setTimestamp(message.createdTimestamp)
                .setDescription(content);

            // Handle attachments and embeds in message
            handleAttachmentAndEmbeds(embed, embeds, attachments);

            // Continue with rest of fields
            const details = `**[Message Link](${url})**`;
            embed.addField('Original', details);

            const outputMsg
                = `**${numberOfReacts}** <:${emoji.name}:${emoji.id}> **In:** ${channel} **ID:** ${id}`;
            (starboardChannel as TextChannel).send(outputMsg, embed)
                // Don't forget to set the starboard channel in the cache.
                .then((m: Message | Message[]): void => {
                    if (m instanceof Message) {
                        cacheArr[1] = m.id;
                    }
                });
        });
    }

    /**
     * Edits the starboard message count with the new number of reacts.
     *
     * @param  {number} numberOfReacts
     * @param  {string} messageId
     * @returns Promise
     */
    public async editStarboardMessageCount(numberOfReacts: number,
                                           messageId: string): Promise<void> {
        return new Promise<void>((): void => {
            // Get channel, then message
            const starboardChannel
                = this.reaction.message.guild.channels.get(this.starboardSettings.getChannel()!);
            (starboardChannel as TextChannel).fetchMessage(messageId)
                .then((message: Message): void => {
                    let replacementValue: number;
                    if (Number.isNaN(numberOfReacts)) {
                        replacementValue = 0;
                    } else {
                        replacementValue = numberOfReacts;
                    }
                    const content = message.content.split(' ');
                    content[0] = `**${replacementValue}**`;

                    let newContent = '';
                    for (const str of content) {
                        newContent += str;
                        newContent += ' ';
                    }
                    message.edit(newContent);
                });
        });
    }

    /**
     * Deletes message from starboard channel
     *
     * @param  {string} messageId
     * @returns Promise
     */
    public async deleteStarboardMessage(messageId: string): Promise<void> {
        return new Promise<void>((): void => {
            // Get channel, then message
            const starboardChannel
                = this.reaction.message.guild.channels.get(this.starboardSettings.getChannel()!);
            (starboardChannel as TextChannel).fetchMessage(messageId)
                .then((message: Message): void => {
                    message.delete();
                });
        });
    }
}
