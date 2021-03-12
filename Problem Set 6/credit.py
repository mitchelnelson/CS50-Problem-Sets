from cs50 import get_string
import re
import sys

# standardized lengths for credit companies
visaLength = [13, 16]
mastercardLength = [16]
amexLength = [15]

# regex patterns for the numbers at the beginning of the cards
visaPattern = "^4"
mastercardPattern = "^5[1-5]"
amexPattern = "^3[4|7]"

# Luhn's algorithm variables
oddDigits = 0
evenDigits = 0
isValidLuhn = False

# get a card number from the user and determine the length of the card
cardNumber = get_string("Number: ")
cardLength = len(cardNumber)

# to check the every-other digits, starting from the end of the card number
for i in range(cardLength - 2, -1, -2):
    
    # convert value to str to check if it's double digits (i.e. 10 or greater)
    value = str(int(cardNumber[i]) * 2)

    # if it's 10 or greater, we must index into the first and second values to add them together (instead of the entire number – e.g. 1 + 2, NOT 12)
    if len(value) > 1:
        oddDigits += int(value[0]) + int(value[1])
    else:
        oddDigits += int(value)

# to check for all other digits
for j in range(cardLength - 1, -1, -2):
    if int(cardNumber[j]) > 0:
        evenDigits += int(cardNumber[j])

# check the Luhn algorithm; if the oddDigits and evenDigits mod 2 returns 0, it is valid.
if (oddDigits + evenDigits) % 2 == 0:
    isValidLuhn = True

# final validation of cards, if the length, Luhn, and start of a card are all valid, it will either
# be a Visa, MasterCard, or Amex card. Otherwise, if any test fails, the card is invalid.

if cardLength in visaLength and isValidLuhn == True and re.match(visaPattern, cardNumber):
    print("VISA")
    sys.exit()
if cardLength in mastercardLength and isValidLuhn == True and re.match(mastercardPattern, cardNumber):
    print("MASTERCARD")
    sys.exit()
if cardLength in amexLength and isValidLuhn == True and re.match(amexPattern, cardNumber):
    print("AMEX")
    sys.exit()
else:
    print("INVALID")