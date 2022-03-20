const { blank, Card, blankID, getCardByName, getCardByPortrait } = require("./cardLib")
const { Player } = require("./playerClass")

class BroadManager {
    constructor (player1 = new Player, player2 = new Player) {
        this.broad = [
            [blank(), blank(), blank(), blank()],
            [blank(), blank(), blank(), blank()]
        ]
        this.isP1Turn = false
        this.scale = 0
        this.player1 = player1
        this.player2 = player2
        this.currentPlayer = player1
        this.opposingPlayer = player2
    }

    placeCard(card = new Card, pos = [row, col]) {
        const onPlace = card.sigilList.filter(sigil => sigil.type == "onPlace")

        this.broad[pos[0]][pos[1]] = card

        const opposingRow = 1 - pos[0]
        const opposingCard = this.broad[opposingRow][pos[1]]

        onPlace.forEach(sigil => {
            sigil.onActivate(this, pos[1], card, pos[0], opposingCard, opposingRow)
        })
    }

    moveCard(card = new Card, currentPos = [row, col], desPos = [row, col]) {
        this.broad[currentPos[0]][currentPos[1]] = blank()
        this.broad[desPos[0]][desPos[1]] = card
    }

    reloadBroad() {
        this.currentPlayer = this.isP1Turn ? this.player1 : this.player2
        this.opposingPlayer = !this.isP1Turn ? this.player1 : this.player2

        let out = ""
        for (let row in this.broad) {
            for (let col in this.broad[row]) {
                if (this.broad[row][col].id == blankID) {
                    this.broad[row][col] = blank()
                }

                if (this.broad[row][col].health <= 0) {
                    this.broad[row][col] = blank()
                }


                out += this.broad[row][col].portrait
            }
            out += "\n"
        }
        return out
    }

    addScale(weight = 1) {
        this.scale += this.isP1Turn ? weight : weight * -1
    }

    getNeighboringCard(col, row) {
        let out = []
        //finding neighbor at a specify location
        if (col == 0) {
            out.push(this.broad[row][col + 1])

        } else if (col == 3) {
            out.push(this.broad[row][col - 1])

        } else {
            out.push(this.broad[row][col + 1])
            out.push(this.broad[row][col - 1])
        }

        return out
    }

    //The combat phase manager
    combatSequence() {
        const currentRow = this.isP1Turn ? 1 : 0
        //combat phase
        for (let column in this.broad[currentRow]) {
            // calculating variable
            const opposingRow = 1 - currentRow


            const card = this.broad[currentRow][column]
            const opposingCard = this.broad[opposingRow][column]


            // filter out all the card sigil type
            const onAttack = card.sigilList.filter(sigil => sigil.type == "onAttack")
            const onAttackOverdrive = card.sigilList.filter(sigil => sigil.type == "onAttackOverdrive")
            const onKill = card.sigilList.filter(sigil => sigil.type == "onKill")

            const onDead = opposingCard.sigilList.filter(sigil => sigil.type == "onDead")
            const onDamage = opposingCard.sigilList.filter(sigil => sigil.type == "onTakingDamage")

            if (card.id == blankID) continue

            // if the sigil have type overdrive then it doesn't attack the opposing card
            if (onAttackOverdrive.length > 0) {
                onAttackOverdrive.forEach(sigil => {
                    sigil.onActivate(this, column, card, currentRow, opposingCard, opposingRow)
                })
            }

            // else it attack the opposing card
            else {
                // if the opposing space is a blank space then add weight to scale
                if (opposingCard.id == blankID) {
                    this.addScale(card.power)
                }

                //if not
                else {
                    // activate the on attack sigil, this one doesn't overdrive the attack
                    onAttack.forEach(sigil => {
                        sigil.onActivate(this, column, card, currentRow, opposingCard, opposingRow)
                    })

                    opposingCard.damage(card.power)

                    onDamage.forEach(sigil => {
                        sigil.onActivate(this, column, opposingCard, opposingRow, card, currentRow)
                    })
                    if (opposingCard.health <= 0) {
                        onKill.forEach(sigil => {
                            sigil.onActivate(this, column, card, currentRow, opposingCard, opposingRow)
                        })

                        //need to flip opposing card and row, cus the opposing die not the card attacking it
                        onDead.forEach(sigil => {
                            sigil.onActivate(this, column, opposingCard, opposingRow, card, currentRow)
                        })
                        this.opposingPlayer.boneTokens++
                    }
                }
            }
        }

        //end turn
        for (let col in this.broad[currentRow]) {
            const opposingRow = 1 - currentRow
            const card = this.broad[currentRow][col]
            const opposingCard = this.broad[opposingRow][col]
            const onTurnEndSigilList = card.sigilList.filter(sigil => sigil.type == "onTurnEnd")

            if (card.id == blankID) continue


            onTurnEndSigilList.forEach((sigil) => {
                sigil.onActivate(this, col, card, currentRow, opposingCard, opposingRow)
            })

        }

        this.currentPlayer.misplay += (Math.random > 0.05) ? 1 : 0 // 5% chance of increasing misplay
        this.isP1Turn = !this.isP1Turn
    }
}

module.exports = {
    BroadManager
}