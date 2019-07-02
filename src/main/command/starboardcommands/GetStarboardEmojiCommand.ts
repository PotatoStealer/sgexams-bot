import { Permissions, Message, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class GetStarboardEmojiCommand extends Command {
    public static COMMAND_NAME = 'GetStarboardEmoji';

    public static COMMAND_NAME_LOWER_CASE = GetStarboardEmojiCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Displays the currently set Starboard emoji';

    public static EMOJI_NOT_SET = 'There is no Starboard emoji set for this server.';

    public static EMBED_TITLE = 'Starboard Emoji';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
     *
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        message.channel.send(this.generateEmbed(server));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {Server} server
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(server: Server): RichEmbed {
        const emoji = server.starboardSettings.getEmoji();
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (emoji === null) {
            embed.addField(GetStarboardEmojiCommand.EMBED_TITLE,
                GetStarboardEmojiCommand.EMOJI_NOT_SET);
        } else {
            const msg = `Starboard emoji is currently set to <:${emoji.name}:${emoji.id}>.`;
            embed.addField(GetStarboardEmojiCommand.EMBED_TITLE, msg);
        }
        return embed;
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    public changeServerSettings(server: Server, ...args: any): void {
        throw new Error(Command.THIS_METHOD_SHOULD_NOT_BE_CALLED);
    }
    /* eslint-enable class-methods-use-this */
}
