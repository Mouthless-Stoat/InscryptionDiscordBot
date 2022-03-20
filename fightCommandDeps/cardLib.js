const { BroadManager } = require("./broadManager")
const emojiUnicode = require("emoji-unicode")

let cardPool = []
const blankID = 0

class Ability {
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
    }
}

//#region defining ability

//---- ATTACK OVERDRIVE SIGIL ----
const flying = new Ability(
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
const poison = new Ability(
    "onAttack",
    "Venomous",
    "This card kill the opposing card if it directly attack that card.",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (!opposingCard.sigilList.filter(sigil => sigil.name == "Poison Immunity").length > 0) { opposingCard.die() }
    }
)

//#endregion


//#region ---- IMMUNITY SIGIL ----
const leaping = new Ability(
    "immunity",
    "Fly Blocker",
    "This card block incoming flying card."
)

const poisonImmunity = new Ability(
    "immunity",
    "Poison Immunity",
    "This can can survive poisonous attack."
)

const bombImmunity = new Ability(
    "immunity",
    "Bomb Immunity",
    "This can can survive explosion."
)

//#endregion


//#region ---- ON TURN END SIGIL ----
const brittle = new Ability(
    "onTurnEnd",
    "Brittle",
    "This card die after the owner turn end",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.die()
    }
)

const photosynthesis = new Ability(
    "onTurnEnd",
    "Photosynthesis",
    "This card become stronger at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.buff()
    }
)

const boneDigger = new Ability(
    "onTurnEnd",
    "Grave Digger",
    "This card give it owner a bone token at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        broadManager.currentPlayer.boneTokens++
    }
)

const healthBuff = new Ability(
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

const powerBuff = new Ability(
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

const buff = new Ability(
    "onTurnEnd",
    "Buffer",
    "This card buff the health and power of it neighboring card at the end of the owner turn",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const neighboringCard = broadManager.getNeighboringCard(col, selfRow)
        neighboringCard.forEach(card => {
            if (card.id != blankID) card.buff(1, 1)
        })
    }
)
//#endregion


//#region ---- ON TAKING DAMAGE SIGIL ----
const spiky = new Ability(
    "onTakingDamage",
    "Spiky",
    "This card deal 1 damage back at the opposing card after begin attack",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        opposingCard.damage()
    }
)

//#endregion


//#region ---- ON KILL SIGIL ----
const absorption = new Ability(
    "onKill",
    "Absorption",
    "This card gain it opposing card stat when it kill them",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        const card = getCardByName(opposingCard.name)
        selfCard.buff(card.health, card.power)
    }
)

const devourer = new Ability(
    "onKill",
    "Devourer",
    "This card regain it health when it kill another card",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        selfCard.buff(1)
    }
)

//#endregion


//#region ---- ON PLACE SIGIL ----
const badLuck = new Ability(
    "onPlace",
    "Bad luck",
    "???",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (Math.random < 0.33) { selfCard.transform(selfCard.transformCard) }
    }
)

const pride = new Ability(
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

const rabbitHole = new Ability(
    "onPlace",
    "Rabbit Hole",
    "This card will give it owner a rabbit on place",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        broadManager.currentPlayer.giveCard(getCardByName("rabbit"))
    }
)

const markiplierFav = new Ability(
    "onPlace",
    "Markiplier's Favorite",
    'If the owner name is "Markiplier" this card get a 3/3 buff',
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        if (broadManager.currentPlayer.user.username.toLowerCase().includes("markiplier")) {
            selfCard.buff(3, 3)
        }
    }
)

//#endregion


//#region ---- ON DEAD SIGIL ----
const explosion = new Ability(
    "onDead",
    "Explosion",
    "If this card die the opposing card die as well",
    (broadManager, col, selfCard, selfRow, opposingCard, opposeRow) => {
        opposingCard.die()
    }
)

//#endregion

//#endregion

let idCounter = 0
let idBank = {}
class Card {
    constructor (name = "", portrait = "", bloodCost = 0, boneCost = 0, power = 0, health = 1, sigilList = [], transformCard, id = -1) {
        this.name = name
        this.portrait = portrait
        this.bloodCost = bloodCost
        this.boneCost = boneCost
        this.power = power
        this.health = health
        this.sigilList = sigilList
        this.transformCard = transformCard

        if (id != -1) {
            this.id = id
        } else {
            if (this.name in idBank) {
                this.id = idBank[this.name]
            } else {
                this.id = `${emojiUnicode(this.portrait).slice(-3)}`
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
            `Card Name 🏷️: **${card.name}**\n` +
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
blank()
console.log("Loading Cards!")

//#region defining cards

//#region og card
const squirrel = new Card("Squirrel", "🐿️")
const rabbit = new Card("Rabbit", "🐰")

//---- NON SIGIL CARD ----
const boar = new Card("Boar", "🐗", 2, 0, 3, 2)
const tiger = new Card("Tiger", "🐯", 0, 6, 3, 3)
const coyote = new Card("Coyote", "🦴", 0, 4, 2, 1)
//const geck = new Card("Geck", "🦎", 0, 0, 1, 1)
const opossum = new Card("Opossum", "🐭", 0, 2, 1, 1)
const urayuli = new Card("Urayuli", "🦧", 4, 0, 4, 4)
const stoat = new Card("Stoat", "🦦", 1, 0, 1, 2)

//---- SIGIL CARD ----

//---- ON ATTACK ----
const bee = new Card("Bee", "🐝", 0, 1, 1, 1, [flying])
const bird = new Card("Cardinal", "🐦", 2, 0, 2, 3, [flying])
const bat = new Card("Bat", "🦇", 0, 4, 1, 2, [flying])
const turkey = new Card("Turkey", "🦃", 0, 8, 3, 3, [flying])

const scorpio = new Card("Scorpio", "🦂", 0, 4, 1, 1, [poison])
const bug = new Card("Bug", "🐛", 1, 0, 1, 1, [poison])

//---- IMMUNITY ----
const bullfrog = new Card("Bullfrog", "🐸", 1, 0, 1, 2, [leaping])
const iceberg = new Card("Iceberg", "🧊", 2, 0, 0, 6, [leaping])
const tree = new Card("T H I C C  TREE", "🌳", 0, 6, 0, 6, [leaping])

const badger = new Card("Honey Badger", "🦡", 1, 0, 1, 3, [poisonImmunity])
const turtle = new Card("River Snapper", "🐢", 2, 0, 0, 6, [poisonImmunity])

//---- ON TURN END ----
const plant = new Card("Growing Seedling", "🌱", 2, 0, 1, 1, [photosynthesis])
const sunflower = new Card("Sunflower", "🌻", 0, 6, 1, 1, [photosynthesis])

const digger = new Card("Grave Digger", "🪦", 1, 0, 0, 3, [boneDigger])
const dog = new Card("Doggo", "🐕", 2, 0, 2, 2, [boneDigger])

const skeleton = new Card("Skeleton", "💀", 0, 1, 1, 1, [brittle])

const HealingTotem = new Card("Healing Totem", "💞", 2, 0, 0, 3, [healthBuff])

const powerTotem = new Card("Power Totem", "🦾", 0, 6, 0, 3, [powerBuff])

const buffTotem = new Card("Buff Totem", "⏫", 2, 6, 0, 6, [buff])

//---- ON TALKING DAMAGE ----
const blowfish = new Card("Blowfish", "🐡", 0, 4, 1, 2, [spiky])
const hedgehog = new Card("Hedgehog", "🦔", 1, 0, 1, 2, [spiky])
const cactus = new Card("Cactus", "🌵", 0, 4, 0, 4, [spiky])

//---- ON KILL ----
const blankHole = new Card("Black Hole", "⚫", 2, 2, 1, 1, [absorption])
const shark = new Card("Shark", "🦈", 0, 10, 2, 2, [absorption])
const dragon = new Card("Dragon", "🐲", 2, 4, 2, 2, [absorption])

const anaconda = new Card("Anaconda", "🐍", 2, 0, 1, 3, [devourer])

//---- ON PLACE ----
const undeadCat = new Card("Undead Cat", "🐾", 0, 0, 3, 6)
cardPool.pop() //removing the undead cat from the card pool so the player can't get them
const cat = new Card("Black Cat", "🐈‍⬛", 1, 0, 1, 1, [badLuck], undeadCat)

const clover = new Card("Clover", "🍀", 0, 0, 2, 2, [boneDigger])
cardPool.pop()
const shamrock = new Card("Shamrock", "☘️", 0, 2, 1, 1, [badLuck], clover)

const lion = new Card("Lion", "🦁", 3, 0, 3, 3, [pride])
const wolf = new Card("Wolf", "🐺", 2, 0, 2, 2, [pride])

const flyingUrayuli = new Card("THE FLYING URAYULI", "🪶", 4, 8, 4, 4, [flying, markiplierFav])

const warren = new Card("Warren", "🕳️", 1, 0, 0, 3, [rabbitHole])

//---- ON DEAD ---- 
const bomb = new Card("Bomb", "💣", 2, 0, 0, 1, [explosion])


//#endregion

//#endregion


cardPool.forEach(card => {
    console.log(`Card [${card.name}] Loaded! With ID [${card.id}]`)
})

console.log(`${cardPool.length} Cards Loaded!`)

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