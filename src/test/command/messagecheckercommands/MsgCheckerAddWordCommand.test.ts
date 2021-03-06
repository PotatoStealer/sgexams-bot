/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { Permissions, RichEmbed } from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { MsgCheckerAddWordCommand } from '../../../main/command/messagecheckercommands/MsgCheckerAddWordCommand';
import { Command } from '../../../main/command/Command';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
let command: MsgCheckerAddWordCommand;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { ADDED_WORDS } = MsgCheckerAddWordCommand;
const { MAYBE_WORDS_ALREADY_ADDED } = MsgCheckerAddWordCommand;
const { UNABLE_TO_ADD_WORDS } = MsgCheckerAddWordCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
);
});

describe('MsgCheckerAddWordCommand test suite', (): void => {
    it('No permission check', (): void => {
        command = new MsgCheckerAddWordCommand([]);
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);

        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Adding words, no duplicates', (): void => {
        // Add some words
        const args = ['word1', 'word2', 'word3'];
        const addedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        command = new MsgCheckerAddWordCommand(args);

        // Embed check
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(ADDED_WORDS);
            field.value.should.equals(addedWordsStr);
        };

        // Execute
        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;
        commandResult.shouldSaveServers.should.be.true;

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;
    });
    it('Adding words, with duplicates', (): void => {
        // Add some words first
        const args = ['word1', 'word2', 'word3'];
        command = new MsgCheckerAddWordCommand(args.slice(0, 2));
        command.changeServerSettings(server, [], []);

        const unableToAddWordsStr = `${args[0]}\n${args[1]}\n${MAYBE_WORDS_ALREADY_ADDED}`;
        const addedWordsStr = `${args[2]}\n`;

        // Embed Check
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(2);

            const addedWordsField = embed.fields![0];
            addedWordsField.name.should.equals(ADDED_WORDS);
            addedWordsField.value.should.equals(addedWordsStr);

            const unableToAddWordsField = embed.fields![1];
            unableToAddWordsField.name.should.equals(UNABLE_TO_ADD_WORDS);
            unableToAddWordsField.value.should.equals(unableToAddWordsStr);
        };

        // Execute
        command = new MsgCheckerAddWordCommand(args);
        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;
        commandResult.shouldSaveServers.should.be.true;

        // Check if server has been updated, no duplicates inside
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;
    });
    it('Adding words, with duplicates in args', (): void => {
        // Add some words first
        const args = ['word1', 'word2', 'word3', 'word3'];
        command = new MsgCheckerAddWordCommand(args);
        const addedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const unableToAddWordsStr = `${args[3]}\n${MAYBE_WORDS_ALREADY_ADDED}`;

        // Embed check
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(2);

            const addedWordsField = embed.fields![0];
            addedWordsField.name.should.equals(ADDED_WORDS);
            addedWordsField.value.should.equals(addedWordsStr);

            const unableToAddWordsField = embed.fields![1];
            unableToAddWordsField.name.should.equals(UNABLE_TO_ADD_WORDS);
            unableToAddWordsField.value.should.equals(unableToAddWordsStr);
        };

        // Execute
        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;
        commandResult.shouldSaveServers.should.be.true;

        // Check if server has been updated, no duplicates inside
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length - 1);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;
    });
    it('No arguments', (): void => {
        const args: string[] = [];
        command = new MsgCheckerAddWordCommand(args);

        // Check embed
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(ERROR_EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        };

        // Execute
        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;
        commandResult.shouldSaveServers.should.be.true;

        // Check if server has been updated
        server.messageCheckerSettings.getBannedWords().length.should.equals(0);
    });
});
