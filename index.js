const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js")
const { BroadManager } = require("./fightCommandDeps/broadManager")
const { getCardByName, getCardByPortrait, blankID, genCardEmbed, findCardInList, getCardById } = require("./fightCommandDeps/cardLib")
const { Player, loadDeck, genDeckEmbed, objToDeckString } = require("./fightCommandDeps/playerClass")
const fs = require("fs")
const { Database } = require("./fightCommandDeps/database")

require("dotenv").config()

//const config = require("./config.json")

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// making our client aka the bot thingy
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    restTimeOffset: 0
})


//some function that useful to the bot
async function getReaction(message, userID, reactionList = ["👍", "👎"], delay = 60000) {
    let out

    // remove all previous reaction to add new one
    message.reactions.removeAll()

    reactionList.forEach((reaction) => {
        message.react(reaction)
    })

    const filter = (reaction, user) => {
        return reactionList.includes(reaction.emoji.name) && user.id === userID
    }

    await message.awaitReactions({ filter, max: 1, time: delay, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first()
            out = reaction.emoji.name
        })
        .catch(collected => {
            console.log("Error while collection reaction")
            console.log(collected)
            out = "error"
        })

    message.reactions.removeAll()
    return out
}


client.once("ready", () => {
    console.log("Bot Ready")
})


client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return
    const { commandName, options } = interaction

    const serverDatabase = new Database()

    if (commandName == "fight") {
        //#region getting p2 acceptant

        const p2User = options.getUser("opponent")
        const acceptMessage = await interaction.reply({
            content: `<@${p2User.id}> please press the accept button`,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("accept")
                        .setStyle("SUCCESS")
                        .setLabel("Accept")
                )
            ],
            fetchReply: true
        })

        //ANCHOR getting p2 accept
        let flag = false
        const p2Filter = i => { return i.user.id === p2User.id }
        await acceptMessage.awaitMessageComponent({ filter: p2Filter, componentType: "BUTTON", max: 1, time: 60000, errors: ['time'] })
            .then(i => {
                i.update({
                    content: "Fight started please look in your respective channel to play. You should get ping there.",
                    components: []
                })
            })
            .catch(collected => {
                interaction.editReply({
                    content: "Player 2 didn't press accept in time so this battle get canceled",
                    components: []
                })
                flag = true
            })

        if (flag) {
            return
        }

        //#endregion


        //#region setting up variable

        //making a broad handler and important variable
        console.log(`User ${interaction.user.tag} started a fight`)


        //reading each player profile file
        //p1

        let tempFile
        try {
            tempFile = fs.readFileSync(`./database/${interaction.user.id}.json`, { encoding: 'utf8', flag: 'r' })
        } catch {
            interaction.editReply(`<@${interaction.user.id}> Don't yet have a profile you need one to battle`)
            return
        }

        const p1File = `./database/${interaction.user.id}.json`
        const p1Json = JSON.parse(tempFile)

        let tempDeck = loadDeck(p1Json.decks[p1Json.deckIndex])
        if (tempDeck == "error") {
            await interaction.reply("Error ❗: An error occur when loading your deck. Maybe the deck string is invalid.")
            return
        }

        const player1 = new Player(
            interaction.user,
            tempDeck
        )

        //p2

        try {
            tempFile = fs.readFileSync(`./database/${p2User.id}.json`, { encoding: 'utf8', flag: 'r' })
        } catch {
            interaction.editReply(`<@${p2User.id}> Don't yet have a profile you need one to battle`)
            return
        }

        const p2File = `./database/${p2User.id}.json`
        const p2Json = JSON.parse(tempFile)

        tempDeck = loadDeck(p2Json.decks[p2Json.deckIndex])
        if (tempDeck == "error") {
            await interaction.reply({
                content: "Error ❗: An error occur when loading your deck. Maybe the deck string is invalid.",
                ephemeral: true
            })
            return
        }

        const player2 = new Player(
            p2User,
            tempDeck
        )


        const broadManager = new BroadManager(player1, player2)

        let controlPanelMessage
        let currentPlayer
        let currentRow
        let fightChannel

        //#endregion


        //#region setting up the 2 fight channel
        const category = interaction.guild.channels.cache.find(c => c.name == "Current Game" && c.type == "GUILD_CATEGORY")

        //making a channel for fighting
        const p1FightChannel = await interaction.guild.channels.create(
            `${interaction.user.tag.replace("#", " ")} Fight`,
            {
                type: "GUILD_TEXT",
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ["VIEW_CHANNEL", "USE_APPLICATION_COMMANDS", "SEND_TTS_MESSAGES", "START_EMBEDDED_ACTIVITIES"]
                    },
                    {
                        id: interaction.user.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    }
                ]
            }
        )

        const p2FightChannel = await interaction.guild.channels.create(
            `${p2User.tag.replace("#", " ")} Fight`,
            {
                type: "GUILD_TEXT",
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ["VIEW_CHANNEL", "USE_APPLICATION_COMMANDS", "SEND_TTS_MESSAGES", "START_EMBEDDED_ACTIVITIES"]
                    },
                    {
                        id: p2User.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    }
                ]
            }
        )

        const p1BroadMessage = await p1FightChannel.send({
            content: `<@${interaction.user.id}> This your fight channel where you can enter input for the bot`,
            fetchReply: true
        })

        const p2BroadMessage = await p2FightChannel.send({
            content: `<@${p2User.id}> This your fight channel where you can enter input for the bot`,
            fetchReply: true
        })

        //sending the 2 important message to the fight channel

        const controlPanelEmbed = new MessageEmbed()
            .setTitle("Control Panel!")
            .setColor("DARK_BLUE")
            .setDescription(
                "This is the control panel. You can press the reaction below to use fight.\n" +
                "Warning ⚠️: Please don't press the reaction too fast the bot won't be able to react in time so that might broke the bot.\n" +
                "Here are what each reaction do:\n"
            )
            .addFields([
                {
                    name: "Play Card ⏬:",
                    value:
                        "This reaction let you place down card to your side of the broad.\n"
                    // 'After pressing this reaction this message will change into another message telling you to "Choose what card you want to play", follow by a few reaction of cards in your hand.\n' +
                    // "After pressing one of those reaction it will change again to prompt you to do different thing, just follow what it say and you should be good to go.\n" +
                    // "At any point if the placement process fail it will reset meaning it canceled everything you just did, So you need to press this reaction (⏬) again from the Control Panel"
                },
                {
                    name: "Show Hand 🖐️:",
                    value:
                        "This reaction let you see your current hand.\n"
                    // "After pressing this reaction this message will change into a list of card in your hand for about 2-3 second(Base on your latency)"
                },
                {
                    name: "Inspect Card 🔍:",
                    value:
                        "This reaction let you inspect a card on the broad. Showing it name, portrait, health, power"
                },
                {
                    name: "Look Up Card 📙:",
                    value:
                        "Not useable yet!"
                },
                {
                    name: "Surrender 🏳️:",
                    value:
                        "Not useable yet!"
                },
                {
                    name: "End Turn 🛎️:",
                    value:
                        "This reaction end your turn and then start the combat phase.\n"
                    // "After pressing this reaction the combat phase started. Card attack from left to right and only on your side of the broad, column by column.\n" +
                    // "If a card stand opposing an empty space (🔳) the card damage get add directly to the scale\n" +
                    // "If a card stand opposing a another card. It attack the opposing card dealing damage and take away the card health.\n" +
                    // "After the combat phase end, it is your opponent turn and you can not do anything except wait until it your turn again"
                }
            ])

        //ANCHOR p1 stuff
        p1BroadMessage.edit({
            content: "broad",
            fetchReply: true
        })

        const p1ControlPanelMessage = await p1FightChannel.send({
            content: "** **",
            embeds: [controlPanelEmbed.setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            })],
            fetchReply: true
        })

        //ANCHOR p2 stuff
        p2BroadMessage.edit({
            content: "broad",
            fetchReply: true
        })

        const p2ControlPanelMessage = await p2FightChannel.send({
            content: "** **",
            embeds: [controlPanelEmbed.setAuthor({
                name: p2User.tag,
                iconURL: p2User.avatarURL()
            })],
            fetchReply: true
        })

        //#endregion


        while (broadManager.scale < 5 && broadManager.scale > -5) {
            //#region setting up stuff
            //ANCHOR setting variable to the correct player variable
            if (broadManager.isP1Turn) {
                controlPanelMessage = p1ControlPanelMessage
                fightChannel = p1FightChannel
                currentPlayer = player1
                currentRow = 1
            } else {
                controlPanelMessage = p2ControlPanelMessage
                fightChannel = p2FightChannel
                currentPlayer = player2
                currentRow = 0
            }

            const infoCardEmbed = new MessageEmbed()
                .setTitle("Info Card")
                .setColor("GREEN")
                .setDescription("This is the info card. It show every information about this fight\nGeneral:\n" + `Current Player: ${currentPlayer.user.tag}\n` +
                    `Scale Position: ${(broadManager.scale < 0) ? "-" : "+"} ${Math.abs(broadManager.scale)}`)
                .addFields(
                    {
                        name: "Player 1 Stat",
                        value:
                            `Name: ${player1.user.tag}\n` +
                            `Sacrifices Made: ${player1.sacsMade}\n` +
                            `Misplays: ${player1.misplay}\n\n` +
                            `Bone Tokens: ${player1.boneTokens}\n` +
                            `Cards Left in Deck: ${player1.deck.length}\n` +
                            `Cards in Hand: ${player1.hand.length}`,
                        inline: true
                    },
                    {
                        name: "Player 2 Stat",
                        value:
                            `Name: ${player2.user.tag}\n` +
                            `Sacrifices Made: ${player2.sacsMade}\n` +
                            `Misplays: ${player2.misplay}\n\n` +
                            `Bone Tokens: ${player2.boneTokens}\n` +
                            `Cards Left in Deck: ${player2.deck.length}\n` +
                            `Cards in Hand: ${player2.hand.length}`,
                        inline: true
                    }
                )

            //ANCHOR edit both broad message cus that juts make the game better
            //i could be lazy and only edit one but yee this is better and more polish
            await p1BroadMessage.edit({
                embeds: [infoCardEmbed],
                content: broadManager.reloadBroad()
            })

            await p2BroadMessage.edit({
                embeds: [infoCardEmbed],
                content: broadManager.reloadBroad()
            })
            //#endregion

            //edit the control panel to reset it if some command change it
            await controlPanelMessage.edit({
                embeds: [controlPanelEmbed.setAuthor({
                    name: currentPlayer.user.tag,
                    iconURL: currentPlayer.user.avatarURL()
                })],
            })

            //getting the reaction thingy
            //this getReaction thingy so damn good
            const command = await getReaction(
                controlPanelMessage,
                currentPlayer.user.id,
                ["⏬", "🖐️", "🔍", "📙", "🛎️", "🏳️"]
            )

            //removing the embed afterward cus im too lazy to add this line in all of the edit method below
            controlPanelMessage.edit({
                embeds: []
            })

            //testing for all the command/reaction the player can press
            //ik switch, case is better but yee this work and my brain can understand this

            //ANCHOR Playing card reaction
            if (command == "⏬") {
                controlPanelMessage.edit("What card do you want to play")

                //add all card as reaction so the user can select
                let temp = []
                currentPlayer.hand.forEach((card) => {
                    temp.push(card.portrait)
                })

                //await for the user input
                temp = await getReaction(
                    controlPanelMessage,
                    currentPlayer.user.id,
                    temp
                )

                const tempCard = getCardByPortrait(temp)

                console.log("Temp Card:")
                console.log(tempCard)
                const cardToPlace = findCardInList(tempCard, currentPlayer.hand)

                console.log("Card To Place:")
                console.log(cardToPlace)

                const sacCols = []
                let flag = false

                if (cardToPlace.bloodCost > 0) {
                    console.log("Card need blood sac doing it rn")
                    let sacAmount = cardToPlace.bloodCost
                    controlPanelMessage.edit(
                        `This card need ${sacAmount}. So please choose ${sacAmount} column to sacrifice card from. \n` +
                        "Warning ⚠️: You choose 1 column then wait for the bot to reset the selection then you choose again for how many sacrifice you have to do. Please don't go too fast it will break the bot.")

                    for (let i = 0; i < sacAmount; i++) {
                        let temp = await getReaction(
                            controlPanelMessage,
                            currentPlayer.user.id,
                            ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
                        )
                        const sacCol = (temp == "1️⃣") ? 0 : (temp == "2️⃣") ? 1 : (temp == "3️⃣") ? 2 : 3

                        if (broadManager.broad[currentRow][sacCol].id == blankID) {
                            await controlPanelMessage.edit("Error ❗: You can't sacrifice a blank space. Press the play card reaction again")
                            flag = true
                            break
                        }

                        sacCols.push(sacCol)
                    }
                }

                if (cardToPlace.boneCost > 0) {
                    if (currentPlayer.boneTokens < cardToPlace.boneCost) {
                        controlPanelMessage.edit("Error ❗: You don't have enough bone tokens to summon this card.")
                        continue
                    }
                }

                if (flag) {
                    continue
                }

                controlPanelMessage.edit("which column do you want to play this card on")
                temp = await getReaction(
                    controlPanelMessage,
                    currentPlayer.user.id,
                    ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
                )

                const placeCol = (temp == "1️⃣") ? 0 : (temp == "2️⃣") ? 1 : (temp == "3️⃣") ? 2 : 3

                if (broadManager.broad[currentRow][placeCol].id != blankID && !sacCols.includes(placeCol)) {
                    controlPanelMessage.edit("Error ❗: There a card where you want to place card! Press the play card reaction again")
                    continue
                }

                sacCols.forEach((col) => {
                    broadManager.broad[currentRow][col].die()
                    currentPlayer.boneTokens++
                    currentPlayer.sacMade++
                })

                currentPlayer.boneTokens -= cardToPlace.boneCost

                broadManager.placeCard(cardToPlace, [currentRow, placeCol])

                currentPlayer.hand.splice(currentPlayer.hand.indexOf(cardToPlace), 1)

                controlPanelMessage.edit("Card Placed")
            }

            //ANCHOR showing hand reaction 
            else if (command == "🖐️") {
                let temp = ""
                currentPlayer.hand.forEach((card) => {
                    temp += `[ ${card.name} | ${card.portrait} ]\n`
                })
                controlPanelMessage.edit(`Your Current Hand:\n${temp}`)

                await sleep(5000)
            }

            //ANCHOR inspecting card reaction
            else if (command == "🔍") {
                controlPanelMessage.edit("Select the row the card you want to inspect on")
                let temp = await getReaction(
                    controlPanelMessage,
                    currentPlayer.user.id,
                    ["1️⃣", "2️⃣"]
                )

                controlPanelMessage.edit("Select the col the card you want to inspect on")
                const row = (temp == "1️⃣") ? 0 : 1 // converting the emoji to number to be use

                temp = await getReaction(
                    controlPanelMessage,
                    currentPlayer.user.id,
                    ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
                )
                const col = (temp == "1️⃣") ? 0 : (temp == "2️⃣") ? 1 : (temp == "3️⃣") ? 2 : 3

                controlPanelMessage.edit({
                    embeds: [genCardEmbed(broadManager.broad[row][col])]
                })
                await sleep(5000) // sleep for 5 second for the player to read the result
            }

            else if (command == "📙") {
                controlPanelMessage.edit("Please send the name of the card you want to look up in this channel")

                const messageFilter = m => m.author.id == currentPlayer.user.id

                let card
                let flag = false
                await fightChannel.awaitMessages({ filter: messageFilter, max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        card = getCardByName(collected.first().content)
                    })
                    .catch(collected => {
                        controlPanelMessage.edit("Error ❗: You take too long this interaction fail")
                        flag = true
                    })

                if (flag) {
                    continue
                }

                if (card == "error") {
                    controlPanelMessage.edit("Error ❗: This card doesn't exist, did you make a typo?")
                    continue
                }

                controlPanelMessage.edit({
                    embeds: [genCardEmbed(card)]
                })
                await sleep(5000)
            }

            //end turn reaction
            else if (command == "🛎️") {
                broadManager.combatSequence()
                console.log("Turn ended")
                console.log(`isP1Turn: ${broadManager.isP1Turn}`)
                console.log(`Scale: ${broadManager.scale}`)
                controlPanelMessage.edit({
                    content: "** **",
                    embeds: []
                })

                currentPlayer.drawCard(2)
            }

            else if (command == "🏳️") {
                broadManager.addScale(-20)
            }

            else if (command == "error") {
                controlPanelMessage.edit("You take too long to reply you lost.")
                broadManager.addScale(-20)
            }
        }

        let temp = ""

        p1Json.sacMade += player1.sacsMade
        p1Json.misplay += player1.misplay
        p1Json.matchFight++

        p2Json.sacMade += player2.sacsMade
        p2Json.misplay += player2.misplay
        p2Json.matchFight++


        if (broadManager.scale >= 5) {
            temp = `Fight Ended. <@${player1.user.id}> you won, good job buddy.`
            p1Json.win++
            p2Json.loss++
        } else if (broadManager.scale <= -5) {
            temp = `Fight Ended <@${player2.user.id}> you won well play, well play`
            p2Json.win++
            p1Json.loss++
        }

        fs.writeFileSync(p1File, JSON.stringify(p1Json))
        fs.writeFileSync(p2File, JSON.stringify(p2Json))

        await interaction.followUp(temp)
        await p1FightChannel.delete()
        await p2FightChannel.delete()
    }

    else if (commandName == "deck") {
        if (options.getSubcommand() == "see") {
            const user = options.getUser("user") ? options.getUser("user") : interaction.user
            var userExist = false

            if (!serverDatabase.userExist(user.id)) {
                await interaction.reply({
                    content: "Error ❗: This user don't have a profile yet.",
                    ephemeral: true
                })
                return
            }

            const dataFile = fs.readFileSync(serverDatabase.getUserProfilePath(user.id), { encoding: 'utf8', flag: 'r' })
            const playerData = JSON.parse(dataFile)

            let deckStr = playerData.decks[playerData.deckIndex]

            const embed = genDeckEmbed(deckStr, user)

            if (embed == "error") {
                await interaction.reply("Error ❗: An error occur while loading your deck.")
                return
            }

            interaction.reply({
                embeds: [embed]
            })

        }

        else if (options.getSubcommand() == "load") {
            const slot = options.getInteger("slot")
            const deckStr = options.getString("deck_string")

            if (!serverDatabase.userExist(interaction.user.id)) {
                await interaction.reply({
                    content: "Error ❗: This user don't have a profile yet.",
                    ephemeral: true
                })
                return
            }
            const path = serverDatabase.getUserProfilePath(interaction.user.id)

            const dataFile = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
            const playerData = JSON.parse(dataFile)

            playerData.decks[slot] = deckStr

            fs.writeFileSync(path, JSON.stringify(playerData))

            await interaction.reply({
                content: "Deck Loaded!",
                ephemeral: true
            })
        }

        else if (options.getSubcommand() == "select") {
            if (!serverDatabase.userExist(interaction.user.id)) {
                await interaction.reply({
                    content: "Error ❗: This user don't have a profile yet.",
                    ephemeral: true
                })
                return
            }

            const path = serverDatabase.getUserProfilePath(interaction.user.id)
            const slot = options.getInteger("slot")

            const dataFile = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
            const playerData = JSON.parse(dataFile)

            //change playerData deckIndex
            playerData.deckIndex = slot

            // write to file
            fs.writeFileSync(path, JSON.stringify(playerData))

            // send user a confirm message
            await interaction.reply({
                content: `Deck ${slot + 1} Selected!`,
                ephemeral: true
            })
        }
    }

    else if (commandName == "lookup") {
        const card =
            (options.getSubcommand() == "name") ? getCardByName(options.getString("name")) :
                (options.getSubcommand() == "id") ? getCardById(options.getString("id")) :
                    getCardByPortrait(options.getString("portrait"))

        if (card == "error") {
            interaction.reply({
                content: "Error ❗: No card have this name!",
                ephemeral: true
            })
        } else {
            interaction.reply({
                embeds: [genCardEmbed(card)],
                ephemeral: true
            })
        }
    }

    else if (commandName == "profile") {
        var user = options.getUser("user") ? options.getUser("user") : interaction.user

        if (!serverDatabase.userExist(user.id)) {
            if (user == interaction.user) {
                serverDatabase.createProfile(user.id)
            } else {
                await interaction.followUp("Error ❗: This user don't have a profile")
                return
            }
        }

        let temp = fs.readFileSync(serverDatabase.getUserProfilePath(user.id), { encoding: 'utf8', flag: 'r' })

        const playerData = JSON.parse(temp)
        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("DARK_GOLD")
                    .setAuthor({
                        name: user.tag,
                        iconURL: user.displayAvatarURL()
                    })
                    .setThumbnail(user.displayAvatarURL())
                    .addFields(
                        {
                            name: "Stats:",
                            value:
                                `Sacrifice Made: ${playerData.sacMade}\n` +
                                `Misplay: ${playerData.misplay}\n` +
                                `Match Fight: ${playerData.matchFight}\n` +
                                `Win / Loss ratio: ` +
                                `${playerData.win} / ${playerData.loss} ` +
                                `(${isNaN(Math.round(playerData.win / playerData.matchFight * 100)) ? 0 : Math.round(playerData.win / playerData.matchFight * 100)}` +
                                `% Win Rate)`
                        }
                    )
            ]
        })
    }
})


client.login(process.env.token)