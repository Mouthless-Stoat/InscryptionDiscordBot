const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require("dotenv").config()

//const { clientId, guildId, token } = require('./config.json')

const testCommands = [

].map(command => command.toJSON())


const commands = [

    new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Show you your profile or another person profile")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user you want to see profile of")
        ),

    new SlashCommandBuilder()
        .setName("fight")
        .setDescription("Fight command")
        .addUserOption(option =>
            option.setName("opponent")
                .setDescription("The user want to challenge")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Look up stat of any card by either their name, id or even portrait")
        .addSubcommand(sub =>
            sub.setName("name")
                .setDescription("Help you look up card by name!")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("The name you want to look up")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("id")
                .setDescription("Help you look up card by ID!")
                .addIntegerOption(option =>
                    option.setName("id")
                        .setDescription("The id you want to look up")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("portrait")
                .setDescription("Help you look up card by portrait (the card emoji)!")
                .addStringOption(option =>
                    option.setName("portrait")
                        .setDescription("The portrait of the card you want to look up")
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName("deck")
        .setDescription("Show your deck or other player deck")
        .addSubcommand(sub =>
            sub.setName("see")
                .setDescription("See your or someone else deck")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user you want to see deck of")
                )
        )
        .addSubcommand(sub =>
            sub.setName("load")
                .setDescription("Load in a deck using a deck string")
                .addStringOption(option =>
                    option.setName("deck_string")
                        .setDescription("The deck string you want to load in")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("slot")
                        .setDescription("The slot you want to load this deck in")
                        .addChoices([
                            ["Slot 1", 0],
                            ["Slot 2", 1],
                            ["Slot 3", 2]
                        ])
                        .setRequired(true)
                )
        )

].map(command => command.toJSON())


const rest = new REST({ version: '9' }).setToken(process.env.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationCommands(process.env.clientId),
            { body: commands },
        )

        await rest.put(
            Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
            { body: testCommands },
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
})()

