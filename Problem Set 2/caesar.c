#include <ctype.h>
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

int main(int argc, string argv[])
{
    int key;
    
    // If user has entered successfully ./caesar with another argument (hopefully valid key)
    if (argc == 2)
    {
        // determine the length of the key
        int keyLength = strlen(argv[1]);
        // Iterate over the key's characters to check if any of the characters are non-numerical.
        for (int i = 0; i < keyLength; i++)
        {
            if (!(isdigit(argv[1][i])))
            {
                printf("Usage: ./caesar key\n");
                return 1;
            }
        }
    }
    // If user has not entered a proper number of arguments, print an error message and return exit code.
    else if (argc != 2)
    {
        printf("Usage: ./caesar key\n");
        return 1;
    }

    // Convert the key into an integer, and assign it.
    key = atoi(argv[1]);

    // Get input from the user
    string plaintext = get_string("plaintext: ");
    int plaintextLength = strlen(plaintext);

    // Map plaintext by using a for loop and implementing the alphebetical modulo formula
    for (int i = 0; i < plaintextLength; i++)
    {
        // if the character is lowercase, we must subtract 97 to allow the modulo to "wrap the alphabet", then add it at the end to reconvert to ASCII.
        if (islower(plaintext[i]))
        {
            plaintext[i] = ((plaintext[i] - 97 + key) % 26) + 97;
        }
        // if the character is uppercase, we must subtract 65 to allow the modulo to "wrap the alphabet", then add it at the end to reconvert to ASCII.
        else if (isupper(plaintext[i]))
        {
            plaintext[i] = ((plaintext[i] - 65 + key) % 26) + 65;
        }
    }
    printf("ciphertext: %s\n", plaintext);
    return 0;
}