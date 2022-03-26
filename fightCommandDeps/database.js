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

// make a database folder if one doesn't exist
try {
    fs.readdirSync("./database/player")
} catch {
    console.log("No Player Database found")
    console.log("Creating Player Database")
    
    fs.mkdirSync("./database/player")
}
module.exports = {
    Database
}