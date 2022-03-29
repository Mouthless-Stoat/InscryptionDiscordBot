const fs = require("fs")

class Database {
    createProfile(userID) {
        fs.writeFileSync(
            `./database/player/${userID}.json`,
            JSON.stringify({
                sacMade: 0,
                misplay: 0,
                matchFight: 0,
                win: 0,
                loss: 0,
                deckIndex: 0,
                decks: [
                    "",
                    "",
                    ""
                ]
            })
        )
    }

    userExist(userID) {
        try {
            fs.readFileSync(`./database/player/${userID}.json`)
            return true
        } catch (e) {
            return false
        }
    }

    getUserProfilePath(userID) {
        // if user doesn't exist throw error
        if (!this.userExist(userID)) {
            throw new Error("User doesn't exist")
        }
        return `./database/player/${userID}.json`
    }
}

module.exports = {
    Database
}