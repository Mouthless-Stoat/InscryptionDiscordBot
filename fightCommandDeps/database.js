const fs = require("fs")

class Database {
    createProfile(userID) {
        fs.writeFileSync(
            `./database/player/${user}.json`,
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
        var userExist = false
        // find player json file in the database
        fs.watchFile(`./database/player/${userID}.json`, () => { })
        fs.readdirSync("./database/player").forEach(file => {
            if (file.endsWith(".json") && file.startsWith(userID)) {
                userExist = true
            }
        })

        return userExist
    }

    getUserProfilePath(userID) {
        let out = ""
        fs.watchFile(`./database/player/${userID}.json`, () => { })
        fs.readdirSync("./database/player").forEach(file => {
            if (file.endsWith(".json") && file.startsWith(userID)) {
                out = `./database/player/${userID}.json`
            }
        })
        return out
    }
}

module.exports = {
    Database
}