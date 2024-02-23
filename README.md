# Popup Wink Mod
### This repo is a work in progress.
This project aims to create a custom "Wink Mod" for cars equipped with popup headlights. The mod will involve modifying the wiring system of the headlights to enable remote control using an Arduino Nano 33 BLE and a custom-built mobile application. This README serves as an initial outline of the project's goals and components.
#### Note: I will be performing this on a 1993 Mazda Miata, but the main project should function with any car that has popups. (Just research your wiring harness)

## Objective
The primary objective of this project is to create a modification for cars with popup headlights. This modification will use a bluetooth capable arduino as the main controller, allowing you to wink at people while outside of your car. 
### [Inspiration](https://mx5tech.co.uk/wink-sleepy-eye-mod)
Originall inspired by the MX-5 Tech wink mod. While buying this is likely a much better option for many, as it connects into the OEM Wiring harness, I wanted to see if I could achieve the same/similar results for less money.

**Target to beat**: £119.99 or $152.12 (as of 02/23/2024)

## Components (Planned)
- Arduino Nano 33 BLE: To serve as the main controller for the system. ($24)
- 4x 12V Relays: Required for transmitting power to the headlights, as the Nano does not provide enough voltage. ($6.95)
- Solder Breadboard: Facilitates easy and secure connections during the setup. ($2.25)
- Battery Bank: Provides power to the Arduino when the car is turned off. ($16.95)
- 12V to 5V DC to DC Power Converter: Not a necessity, but if you want to set it and forget it, you'll want it to charge the battery bank while the car is running. ($12.99)
- Spade Connectors: Allow for easy removal and semi-restoration of the stock wiring system. (~$0.10 per connection)
- Plenty of wire to connect from under the cars dash to the headlight harness. (~$0.23/foot for 24AWG and ~$0.04/foot for 30AWG)

**Total so far** (not including wires): $63.14

## Project Plan
- [ ] Collect all necessary components
- [ ] Write code for arduino to test project out of car
- [ ] Test wiring outside of car
- [ ] Finalize design
- [ ] Create phone app to connect to arduino
- [ ] Modify arduino code to connect to phone app
- [ ] Modify stock wiring harness to allow for new connections
- [ ] Wire system into car and connect everything
- [ ] Test system
- [ ] Probably a lot of debugging

I will be documenting my entire process with this project to ensure that it is easily doable by someone else.


### Disclaimers
1. I am not responsible for any damage you cause to yourself or your vehicle. This is done on your own terms, and this is only supposed to be used as a general guide. Do your research on your own vehicle and saftey before proceeding.
2. I am not a professional, but I understand the potential risks involved in doing this project. I am ok with this.
3. Idk don't be stupid, this is supposed to be fun.


# License

This project (will be) licensed under the [MIT License](https://opensource.org/license/mit).
