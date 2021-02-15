// include libraries
#include <stdio.h>
#include <cs50.h>
#include <math.h>

int main(void)
{

    // Declare global variables
    int visaLength = 13;
    int visaLength2 = 16;
    int masterCardLength = 16;
    int amexLength = 15;
    int cardLength = 0;
    bool isVisaStart = false;
    bool isMasterCardStart = false;
    bool isAmexStart = false;
    int digitTimesTwo = 0;
    int sum = 0;

    // prompt user for input, make a copy to determine the card length for verification at the end
    long cardNumber = get_long("Enter card number: ");
    long numberCopy = cardNumber;

    // determine card length by iterating each time over the copy and truncating one number each time
    for (int i = 0; i <= numberCopy; i++)
    {
        // printf("i: %i\n", i);
        numberCopy = numberCopy / 10;
        // printf("numberCopy: %li\n", numberCopy);
        cardLength = i + 2;
        if (numberCopy > 50 && numberCopy < 56)
        {
            isMasterCardStart = true;
        }
        else if (numberCopy == 34 || numberCopy == 37)
        {
            isAmexStart = true;
        }
        else if (numberCopy == 4)
        {
            isVisaStart = true;
        }
    }

    // using a for-loop, isolate each digit and then multiply it by two
    for (int i = 2; i < cardLength + 1; i += 2)
    {

        // multiply every other digit by two, starting with the second-to-last digit
        long power = pow(10, i);
        long isolator = pow(10, i - 1);
        int digit = (cardNumber % power) / isolator;


        // add the products' digits together
        digitTimesTwo = digit * 2;

        // if digitTimesTwo is non-zero, and a positive number that is single digits
        if (digitTimesTwo > 0 && digitTimesTwo < 10)
        {
            sum = sum + digitTimesTwo;
        }
        // else if digitTimesTwo is a positive number that is double digits
        else if (digitTimesTwo >= 10)
        {
            int lastIndex = digitTimesTwo % 10;
            int firstIndex = (digitTimesTwo % 100) / 10;
            sum = sum + firstIndex + lastIndex;
        }
    }

    // using a for-loop, isolate each "other" digit
    for (int i = 1; i < 17; i += 2)
    {
        // multiply every other digit by two, starting with the last digit
        long power = pow(10, i);
        long isolator = pow(10, i - 1);
        int otherDigit = (cardNumber % power) / isolator;

        // barring zeros, add these digits to the total sum
        if (otherDigit != 0)
        {
            sum = sum + otherDigit;
        }
    }

    // check if the total sum's last digit is 0 (valid card)
    if (sum % 10 == 0)
    {
        if ((visaLength2 == cardLength || visaLength == cardLength) && isVisaStart == true)
        {
            printf("VISA\n");
        }
        else if (masterCardLength == cardLength && isMasterCardStart == true)
        {
            printf("MASTERCARD\n");
        }
        else if (amexLength == cardLength && isAmexStart == true)
        {
            printf("AMEX\n");
        }
        else
        {
            printf("INVALID\n");
        }
    }
    else
    {
        printf("INVALID\n");
    }
}