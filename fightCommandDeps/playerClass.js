const { getCardById, getCardByName, genCardEmbed } = require("./cardLib")

class Player {
    constructor (user, deck = []) {
        this.user = user
        this.deck = deck
        this.hand = []
        this.sacsMade = 0
        this.misplay = 0
        this.boneTokens = 0
        if (deck.length >= 4) {
            this.drawCard(3)
        }
        this.hand.push(getCardById(1))
    }

    drawCard(numCard = 1) {
        for (let i = 0; i < numCard; i++) {
            let temp = Math.floor(Math.random() * this.deck.length)
            this.hand.push(this.deck[temp])
            this.deck.splice(temp, 1)
        }
    }

    giveCard(card) {
        this.hand.push(card)
    }
}

function loadDeck(deckString = "") {
    try {
        let temp = deckString.split("/")
        let out = []

        for (const i in temp) {
            // get the card id and count
            const count = parseInt(i.substring(0, 2))
            const id = i.substring(2, i.length)

            // get the card
            const card = getCardById(id)


            if (card == "error") {
                return "error"
            }

            // push the card to the output if not error
            for (let i = 0; i < count; i++) {
                out.push(card)
            }
        }

        if (out.length > 30) {
            return "error"
        }
        
        return out
    } catch {
        return "error"
    }
}

function objToDeckString(obj = {}) {
    let deckString = ""

    let sortedObj = Object.entries(obj).sort((a, b) => a[0] - b[0])

    for (const lst of sortedObj) {
        console.log(lst)
        const count = parseInt(lst[1])
        const id = lst[0]

        if (count < 10) deckString += `0${count}${id}/`
        else deckString += `${count}${id}`

    }
    return deckString
}

function genDeckEmbed(deckStr, user) {
    let deck = loadDeck(deckStr)
    if (deck == "error") {
        return "error"
    }

    let temp = ""
    deck.forEach(card => {
        temp += `**${card.portrait} | ${card.name}**\n`
    })

    //https://stackoverflow.com/a/8495740/17055233
    const makeChunk = (array, chunk_size) => {
        return Array(
            Math.ceil(array.length / chunk_size))
            .fill()
            .map((_, index) => index * chunk_size)
            .map(begin => array.slice(begin, begin + chunk_size)
            )
    }

    let c1 = []
    let c2 = []
    let c3 = []
    if (temp != "") {
        temp = temp.split("\n")
        let tempChunk
        tempChunk = makeChunk(temp, Math.round(temp.length / 3))
        c1 = tempChunk[0]
        c2 = tempChunk[1]
        c3 = tempChunk[2]
    }

    if (c3 == undefined) {
        c3 = []
    }
    const embed = {
        title: `${user.tag} Deck: `,
        description: "This is the user deck:",
        author: {
            name: user.tag,
            iconURL: user.displayAvatarURL()
        },
        thumbnail: { url: user.displayAvatarURL() },
        color: "YELLOW"
    }

    if (c1.length > 0 || c2.length > 0 || c3.length > 0) {
        embed.fields = []
        if (c1.length > 1) {
            embed.fields.push({
                name: "\u200b",
                value: c1.join("\n"),
                inline: true
            })
        }
        if (c2.length > 1) {
            embed.fields.push({
                name: "\u200b",
                value: c2.join("\n"),
                inline: true
            })
        }
        if (c3.length > 1) {
            embed.fields.push({
                name: "\u200b",
                value: c3.join("\n"),
                inline: true
            })
        }
    }
    return embed
}

module.exports = {
    Player,
    loadDeck,
    objToDeckString,
    genDeckEmbed
}