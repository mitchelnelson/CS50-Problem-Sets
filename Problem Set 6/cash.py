from cs50 import get_float

owed = get_float("Change owed: ")

while owed < 0:
    owed = get_float("Change owed: ")

# convert dollars to cents
owed *= 100

# keep track of coins returned
coins = 0

# while pot is greater than a quarter, give a quarter. Repeat for each denomination following.
while owed >= 25:
    coins += 1
    owed -= 25

while owed >= 10:
    coins += 1
    owed -= 10

while owed >= 5:
    coins += 1
    owed -= 5

# while pot is less than a nickel (i.e. pennies), give a penny until all change has been given.
while owed < 5 and owed > 0:
    coins += 1
    owed -= 1

print(coins)