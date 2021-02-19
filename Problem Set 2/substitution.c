#include <ctype.h>
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

int main(int argc, string argv[])
{

    // If user has not entered a proper number of arguments, print an error message and return exit code.
    if (argc != 2)
    {
        printf("Usage: ./substitution key\n");
        return 1;
    }
    
    // If user has entered the proper number of arguments, validate key.
    if (argc == 2)
    {
        // determine the length of the key
        int keyLength = strlen(argv[1]);

        // If the key is 26 characters, check for non-numeracy and repeating characters.
        if (keyLength == 26)
        {
            for (int i = 0; i < keyLength; i++)
            {
                if (!(isalpha(argv[1][i])))
                {
                    printf("Only letters are allowed in the key.\n");
                    return 1;
                }

                // printf("argv[1][i]: %c\n", argv[1][i]);
                for (int j = i + 1; j < 26; j++)
                {
                    // i stays the same but for each iteration of i you are comparing it against 26 versions of j. If the duplication is at the very end of the string, you will have run through the alphabet 26 times.
                    if (toupper(argv[1][i]) == toupper(argv[1][j]))
                    {
                        printf("Letters must not repeat.\n");
                        return 1;
                    }
                }
            }
        }
        
        // If the key isn't 26 characters, return error.
        else
        {
            printf("Keys must be 26 characters.\n");
            return 1;
        }
        
    }

    // If no errors are returned, key is valid and user may continue.
    
    string key = argv[1];

    // Get input from the user
    string plaintext = get_string("plaintext: ");

    // // Map plaintext by using a for loop and implementing the alphebetical modulo formula
    for (int i = 0; i < strlen(plaintext); i++)
    {
        // If the character in the plaintext is lowercase, encipher it by using the key's value (to lowercase) using the modulo formula.
        if (islower(plaintext[i]))
        {
            plaintext[i] = tolower(argv[1][((plaintext[i] - 97) % 26)]);
        }
        // If the character in the plaintext is uppercase, encipher it by using the key's value (to uppercase) using the modulo formula.
        else if (isupper(plaintext[i]))
        {
            plaintext[i] = toupper(argv[1][((plaintext[i] - 65) % 26)]);
        }
    }
    printf("ciphertext: %s\n", plaintext);
    return 0;
}