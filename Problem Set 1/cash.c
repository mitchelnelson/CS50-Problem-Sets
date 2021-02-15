// include libraries
#include <stdio.h>
#include <cs50.h>
#include <math.h>

int main(void)
{
    // prompt user for amount in dollars;
    float dollars;
    do
    {
        dollars = get_float("How much is owed: ");
    }
    while (dollars < 0);
    
    // convert dollars to cents by multiplying by 100.
    int cents = round(dollars * 100);

    int quarters = 0;
    int dimes = 0;
    int nickels = 0;
    int pennies = 0;
    
    do
    {
        if (cents >= 25) 
        {
            quarters++;
            cents = cents - 25;
        }
        else if (cents >= 10)
        {
            dimes++;
            cents = cents - 10;
        }
        else if (cents >= 5)
        {
            nickels++;
            cents = cents - 5;
        }
        else
        {
            pennies++;
            cents = cents - 1;
        }
    }
    while (cents > 0);
    
    int totalCoins = quarters + dimes + nickels + pennies;

    printf("%i\n", totalCoins);
}