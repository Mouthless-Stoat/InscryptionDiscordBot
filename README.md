# Inscryption Discord Bot
A simple Discord Bot that I'm working on

Server to test the bot: https://discord.gg/Qqkm8D7UsD (Perma link)

Ik that this don't give much info but when the bot done I gonna update this.

## Changelog

- [v0.1](#v01)
- [v0.2](#v02)
- [v0.3](#v03)
- [v0.4](#v04)
- [v0.5](#v05)
- [v0.6](#v06)
- [v1.0](#v10)

---

## v1.0

The bot is now for beta testing if you want to checkout the bot the invite link to the bot server is here: https://discord.gg/Qqkm8D7UsD

### New Card:
+ The Scale (⚖): 5/2, 3 blood, with Scale Fate if it die you die
+ Scared Cat (🐈): 1/2, 2 blood, with Panic If it get attack it attack the opposing card
+ Wood Carver (🔪): 1/1, 2 blood, with Totem Maker Give you any og the random totem with place. What the totem scroll up
  
#### Changes

+ New ID system that easier to remember Well not remember but it easier to make up and know which ID for which card just by looking at it
+ New Database system to handle player profile  cus the old one kinda shit
+ Converted all card to json file
+ New Card

- Alot of bug fixes (again...)

#### Detail on new ID system
New ID system use the card name and stat instead of where the card get define in the code. The new system use the card name first and last letter then the length of the card name (counting the spaces) then it power and health. So for example if the card was "Adder" with 1 power and 1 health. Then it ID will be "Ar511". 

## v0.6
- Alot of bug fixes during the play test.

## v0.5

This week were tired af cus of alot of project due but here a devlog. I will be on march break so i willl have more time to work (yayyy :D)

#### New stuff

+ Now you can load in deck with a deck string that can be generated.
+ You can now build deck. By running a command and entering what card ID you want to add. Although it a lil slow cus the code not taht optimize cus im a dumbass. Maybe i will improve it if i know how ofc.
+ Come with this deck building using ID ofc a command to see card by ID and ID now get shown on the card lookup embed.
+ Added way to view your own as well as other ppl deck.

I will do some play test this weekend aka tmr if no bug is found i could prob do some polish and release for public beta or something, let hope that the case.

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
