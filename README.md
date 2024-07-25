> [!WARNING]
> DOES NOT WORK ANYMORE

# Inscryption Discord Bot
A simple Discord Bot that I'm not working on.

## About

So what is this project? It simply a discord bot that I'm working on, that try to mimic the game [Inscryption](https://store.steampowered.com/app/1092790/Inscryption/) but with multiplayer using [discord.js](https://discord.js.org/#/docs/discord.js/stable/general/welcome).

If you don't know what Inscryption is and somehow stumble into this repo I'm very surprise. But if you interested to play I do have [a how to play](#how-to-play-inscryption) down below

The bot isn't finished yet, but it's usable if you want to test/play with it join the [discord server](https://discord.gg/Qqkm8D7UsD). Why must you join the server and can't invite it to your owns server? Because I'm working on it and I need to see if there any bug and how the bug get produced so I can fix them.

## What can it do?

Well you can of course make decks and fight people with it. That basically it to be honest. If you want any feature just tell me or make an issue and I will try to add them.

## How to play Inscryption?

So Inscryption is a card game kinda like Magic the Gathering. It play on a 4x2 broad and in the bot it displayed like this

![unknown](https://user-images.githubusercontent.com/89868169/161122737-9e88ac9a-7718-4f7c-afe6-dd6b74af4e96.png)

the broad doesn't flip base on which side you on but I'm too lazy to do that. So if you are player 1 then the bottom row is your side and if you are player 2 then the top row is your side.

Ok now we done with the broad now let get start on how you can play card. Each card have a cost it can be either blood or bone. Let talk about blood first shall we. To summon a blood card it require sacrifice from other card so if you want to play a 2 blood cost card you must sacrifice 2 of your own card. Sacrificing will kill the card leaving a blank space. 

For bone cost you must use the bone token provided whenever a card die it produce 1 bone token.

## Changelog

- [v0.1](#v01)
- [v0.2](#v02)
- [v0.3](#v03)
- [v0.4](#v04)
- [v0.5](#v05)
- [v0.6](#v06)
- [v1.0](#v10)
- [v1.1](#v11)

---

## v1.1
Another update has come right before April Fool I can't choose a better time can't I. Alright let's get into the update log shall we

### New Card:
- Ram (🐏): 2/3, 3 Blood with Ram: It will ram the opposing card back to the opponent hand.
- AMB v2 (🧪): 2/2, 2 Blood, 2 bone with Mimick: It will mimic the opposing card.

### New Stuff:
- New command added: `/deck select`. You can use this to select one of your 3 available decks.
- You can now build your own deck using `/deck add_card` and `/deck remove_card`.

### Detail on how to build your deck using the new command:
It will take some time to build a deck but it the only way I can think of on how to do so. Ok so how do you use `/deck add_card` and `/deck remove_card`? 

When you run it you can see it require 2 arguments. The first argument is the method you want to use to add card either using id, name or portrait. The second argument is the value for the method you enter. So for example you want to add a wolf to your deck using it name you would run `/deck add_card name wolf`. There also an optional argument for how many card you want to add to you deck. you remove card the same way.

Do keep in mind that your deck can't go over 30 cards. So if you do it will say there was an error when loading your deck.

## v1.0

The bot is now for beta testing if you want to checkout the bot the invite link to the bot server is here

### New Card:
- The Scale (⚖): 5/2, 3 blood, with Scale Fate if it die you die
- Scared Cat (🐈): 1/2, 2 blood, with Panic If it get attack it attack the opposing card
- Wood Carver (🔪): 1/1, 2 blood, with Totem Maker Give you any og the random totem with place. What the totem scroll up
  
#### Changes

- New ID system that easier to remember Well not remember but it easier to make up and know which ID for which card just by looking at it
- New Database system to handle player profile  cus the old one kinda shit
- Converted all card to json file
- New Card

- Alot of bug fixes (again...)

#### Detail on new ID system
New ID system use the card name and stat instead of where the card get define in the code. The new system use the card name first and last letter then the length of the card name (counting the spaces) then it power and health. So for example if the card was "Adder" with 1 power and 1 health. Then it ID will be "Ar511". 

## v0.6
- Alot of bug fixes during the play test.

## v0.5

This week were tired af cus of alot of project due but here a devlog. I will be on march break so I willl have more time to work (yayyy :D)

#### New stuff

- Now you can load in deck with a deck string that can be generated.
- You can now build deck. By running a command and entering what card ID you want to add. Although it a lil slow cus the code not taht optimize cus im a dumbass. Maybe I will improve it if I know how ofc.
- Come with this deck building using ID ofc a command to see card by ID and ID now get shown on the card lookup embed.
- Added way to view your own as well as other ppl deck.

I will do some play test this weekend aka tmr if no bug is found I could prob do some polish and release for public beta or something, let hope that the case.

## v0.4

#### New stuff

- An actual profile system this time
- Added a profile command to see your profile and other user profile. It also generate a new profile is teh user don't have one.
- Some more card.
- Add a deny button to fight command so you no longer need to wait for 5 damn minutes for the bot to cancel the fight.

#### Changes

- Now your deck is no longer fixed you can now change it but a deck command is yet to be implemented (IDk how to do displace them)
- A new ID system for future deck building system the old one is just random number lol.
- Win and Loss will now be added to your profile as well as misplay and sacrifice made.
- You can no longer challenge yourself cus that bs
- Fix some more bugs cause by the new ID system.

## v0.3

#### New stuff

- Add more Sigil and Card. No we have 20 cards baby
- Add a some what useable profile system and database.
- Add a look up command so you don't have to enter a fight to do so.

#### Changes

- Slightly improve the speed of the bot adding reaction (the main way to input stuff for the bot)
- Fix some bug

## v0.2

#### New stuff

- Added a way to inspect card on the broad cus it hard to mentally keep track of thing.
- Sigil handler rewrite so it event base and not hard coded in.
- Added new Card and Sigil.
- Added fail condition so u can't just sit there and "think" for an hour.

#### Changes

- The channel now auto delete when the game end 
- New Control Panel embed

## v0.1
- First release
