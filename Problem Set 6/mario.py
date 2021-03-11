# Single Pyramid

from cs50 import get_int

height = get_int("Enter height: ")

while height < 1 or height > 8:
    height = get_int("Enter height: ")

for i in range(height):
    for j in range(height - (i + 1)):
        print(" ", end='')
    print("#" * (i + 1))

####################################################

# Double Pyramid

from cs50 import get_int

height = get_int("Enter height: ")

while height < 1 or height > 8:
    height = get_int("Enter height: ")

for i in range(height):
    for j in range(height - (i + 1)):
        print(" ", end='')
        
    print("#" * (i + 1) + '  ' + "#" * (i + 1))