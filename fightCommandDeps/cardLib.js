const { BroadManager } = require("./broadManager")
const fs = require("fs")

let cardPool = []
let sigilPool = []
const blankID = 0

class Sigil {
    constructor (type = "", name = "", description = "", onActivate = (
        broadManager = new BroadManager,
        col,
        selfCard = new Card,
        selfRow = 0,
        opposingCard = new Card,
        opposeRow = 0
    ) => { }) {
        this.type = type
        this.name = name
        this.description = description
        this.onActivate = onActivate

        sigilPool.push(this)
    }
}

//#region defining sigil

//---- ATTACK OVERDRIVE SIGIL ----
const flying = new Sigil(
    "onAttackOverdrive",
    "Airborne",
    "This card flying over the opposing card and attack directly to the scale.",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const flag = opposingCard.sigilList.filter(sigil => sigil.name == "Fly Blocker").length > 0
        if (flag) {
            opposingCard.damage(selfCard.power)
        } else {
            broadManager.addScale(selfCard.power)
        }
    }
)

//#region ---- ON ATTACK SIGIL ----
const poison = new Sigil(
    "onAttack",
    "Venomous",
    "This card kill the opposing card if it directly attack that card.",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (!opposingCard.sigilList.filter(sigil => sigil.name == "Poison Immunity").length > 0) { opposingCard.die() }
    }
)
//#endregion


//#region ---- IMMUNITY SIGIL ----
const leaping = new Sigil(
    "immunity",
    "Fly Blocker",
    "This card block incoming flying card."
)

const poisonImmunity = new Sigil(
    "immunity",
    "Poison Immunity",
    "This can can survive poisonous attack."
)

const bombImmunity = new Sigil(
    "immunity",
    "Bomb Immunity",
    "This can can survive explosion."
)

//#endregion


//#region ---- ON TURN END SIGIL ----
const brittle = new Sigil(
    "onTurnEnd",
    "Brittle",
    "This card die after the owner turn end",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.die()
    }
)

const photosynthesis = new Sigil(
    "onTurnEnd",
    "Photosynthesis",
    "This card become stronger at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.buff()
    }
)

const boneDigger = new Sigil(
    "onTurnEnd",
    "Grave Digger",
    "This card give it owner a bone token at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        broadManager.currentPlayer.boneTokens++
    }
)

const healthBuff = new Sigil(
    "onTurnEnd",
    "Healer",
    "This card health it neighboring card at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const neighboringCard = broadManager.getNeighboringCard(col, selfRow)
        neighboringCard.forEach(card => {
            if (card.id != blankID) card.buff(1) //heal the card
        })
    }
)

const powerBuff = new Sigil(
    "onTurnEnd",
    "Power Buffer",
    "This card buff it neighboring card power at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const neighboringCard = broadManager.getNeighboringCard(col, selfRow)
        neighboringCard.forEach(card => {
            if (card.id != blankID) card.buff(0, 1)
        })
    }
)
//#endregion


//#region ---- ON TAKING DAMAGE SIGIL ----
const spiky = new Sigil(
    "onTakingDamage",
    "Spiky",
    "This card deal 1 damage back at the opposing card after begin attack",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        opposingCard.damage()
    }
)

const panic = new Sigil(
    "onTalkingDamage",
    "Panic",
    "This card attack the opposing card upon talking damage",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        opposingCard.damage(selfCard.power)
    }
)
//#endregion


//#region ---- ON KILL SIGIL ----
const absorption = new Sigil(
    "onKill",
    "Absorption",
    "This card gain it opposing card stat when it kill them",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const card = getCardByName(opposingCard.name)
        selfCard.buff(card.health, card.power)
    }
)

const devourer = new Sigil(
    "onKill",
    "Devourer",
    "This card regain it health when it kill another card",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.buff(1)
    }
)

//#endregion


//#region ---- ON PLACE SIGIL ----
const badLuck = new Sigil(
    "onPlace",
    "Bad luck",
    "???",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (Math.random < 0.33) { selfCard.transform(selfCard.transformCard) }
    }
)

const pride = new Sigil(
    "onPlace",
    "Pride",
    "This card will have a 20% chance of calling it ally on place",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const neighboringCard = broadManager.getNeighboringCard(col, selfRow)
        neighboringCard.forEach(card => {
            if (card.id == blankID && Math.random() < 0.2) {
                card.transform(selfCard)
            }
        })
    }
)

const rabbitHole = new Sigil(
    "onPlace",
    "Rabbit Hole",
    "This card will give it owner a rabbit on place",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        broadManager.currentPlayer.giveCard(getCardByName("rabbit"))
    }
)

const markiplierFav = new Sigil(
    "onPlace",
    "Markiplier's Favorite",
    'If the owner name is "Markiplier" this card get a 3/3 buff',
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (broadManager.currentPlayer.user.username.toLowerCase().includes("markiplier")) {
            selfCard.buff(3, 3)
        }
    }
)

const NollReedFav = new Sigil(
    "onPlace",
    "Noll Reed Favorite",
    'If the owner name is "Noll Reed" this card gain 3 additional attack',
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (broadManager.currentPlayer.user.username.toLowerCase().includes("noll reed")) {
            selfCard.buff(0, 3)
        }
    }
)

const totemMaker = new Sigil(
    "onPlace",
    "Totem Maker",
    "This card will give the owner a random totem when place",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const totemList = [buffTotem, HealingTotem, powerTotem]
        broadManager.currentPlayer.giveCard(totemList[Math.floor(Math.random() * totemList.length)])
    }
)

//#endregion


//#region ---- ON DEAD SIGIL ----
const explosion = new Sigil(
    "onDead",
    "Explosion",
    "If this card die the opposing card die as well",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        opposingCard.die()
    }
)

const scaleFate = new Sigil(
    "onDead",
    "Scale Fate",
    "This card fate is link to the scale, if it die the owner lost the game",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        broadManager.addScale(-10)
    }
)

//#endregion

//#endregion

function getSigilByName(name = "") {
    let out = "error"
    sigilPool.forEach((sigil) => {
        if (sigil.name.toLowerCase() == name.toLocaleLowerCase()) {
            out = sigil
        }
    })
    return out
}


let idBank = {}
class Card {
    constructor (name = "", portrait = "", bloodCost = 0, boneCost = 0, power = 0, health = 1, sigilList = [], transformCard = null, id = -1) {
        this.name = name
        this.portrait = portrait
        this.bloodCost = bloodCost
        this.boneCost = boneCost
        this.power = power
        this.health = health
        this.sigilList = sigilList
        this.sigilListName = []
        sigilList.forEach(sigil => {
            this.sigilListName.push(sigil.name)
        })
        this.transformCard = transformCard


        if (id != -1) {
            this.id = id
        } else {
            if (this.name in idBank) {
                this.id = idBank[this.name]
            } else {
                this.id = `${this.name.slice(0, 1)}${this.name.slice(-1)}${this.name.length}${this.power}${this.health}`
                idBank[this.name] = this.id
            }
        }

        if (this.name in idBank) { cardPool.push(this) }
    }

    die() {
        this.id = blankID
    }

    damage(dmg = 1) {
        this.health -= dmg
    }

    buff(health = 0, power = 0) {
        this.health += health
        this.power += power
    }

    transform(card = new Card) {
        this.name = card.name
        this.portrait = card.portrait
        this.bloodCost = card.bloodCost
        this.boneCost = card.boneCost
        this.power = card.power
        this.health = card.health
        this.sigilList = card.sigilList
        this.id = card.id
    }
}

function getCardByName(name = "") {
    let out = "error"
    cardPool.forEach((card) => {
        if (card.name.toLowerCase() == name.toLocaleLowerCase()) {
            out = new Card(
                card.name,
                card.portrait,
                card.bloodCost,
                card.boneCost,
                card.power,
                card.health,
                card.sigilList,
                card.transformCard,
                card.id
            )
        }
    })
    return out
}

function getCardByPortrait(portrait = "") {
    let out = "error"
    cardPool.forEach((card) => {
        if (card.portrait == portrait) {
            out = new Card(
                card.name,
                card.portrait,
                card.bloodCost,
                card.boneCost,
                card.power,
                card.health,
                card.sigilList,
                card.transformCard,
                card.id
            )
        }
    })
    return out
}

function getCardById(id = 0) {
    let out = "error"
    cardPool.forEach((card) => {
        if (card.id == id) {
            out = new Card(
                card.name,
                card.portrait,
                card.bloodCost,
                card.boneCost,
                card.power,
                card.health,
                card.sigilList,
                card.transformCard,
                card.id
            )
        }
    })
    return out
}

function genCardEmbed(card = new Card) {
    let out = ""

    card.sigilList.forEach((sigil) => {
        out += `Sigil Name 🏷️: **${sigil.name}**\n` +
            `Description ℹ️: **${sigil.description}**\n\n`
    })

    return {
        color: "PURPLE",
        title: `${card.name} | ID: ${card.id}`,
        description:
            `Card Portrait 🖼️: **${card.portrait}**\n` +
            `${card.bloodCost > 0 ? `Card Blood Cost 🩸: **${card.bloodCost}**\n` : ""}${card.boneCost > 0 ? `Card Bone Cost 🦴: **${card.boneCost}**\n` : ""}` +
            `Power 🔪: **${card.power}**\n` +
            `Health ❤️: **${card.health}**\n\n` +
            `Sigil ✨:\n` +
            out

    }
}

function findCardInList(cardToFind = new Card, list = []) {
    let out = cardToFind
    for (let card of list) {
        if (card.id == cardToFind.id) {
            console.log("eeeeee")
            out = card
            break
        }
    }
    return out
}

const blank = () => { return new Card("", "🔳", 0, 0, 0, 0, [], 0, 0) }

fs.readdir("./database/card", (err, files) => {
    console.log("Loading Cards!")

    files.forEach(fileName => {
        let temp = fs.readFileSync(`./database/card/${fileName}`, { encoding: "utf-8", flag: "r" })
        const cardData = JSON.parse(temp)
        let sigilList = []
        cardData.sigilList.forEach(sigilName => {
            sigilList.push(getSigilByName(sigilName))
        })

        new Card(
            cardData.name,
            cardData.portrait,
            cardData.bloodCost,
            cardData.boneCost,
            cardData.power,
            cardData.health,
            sigilList,
            cardData.transformCard
        )
    })

    cardPool.forEach(card => {
        console.log(`Card [${card.name}] Loaded! With ID [${card.id}]`)
    })

    console.log(`${cardPool.length} Cards Loaded!`)
})

module.exports = {
    Card,
    blankID,
    getCardByName,
    getCardByPortrait,
    getCardById,
    genCardEmbed,
    findCardInList,
    cardPool,
    blank
}
