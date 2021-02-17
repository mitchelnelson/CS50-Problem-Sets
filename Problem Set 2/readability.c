#include <ctype.h>
#include <cs50.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

int main(void)
{
    // Obtain a string from the user, and count its length.
    string str = get_string("Enter text: ");
    
    int letters = 0;
    int words = 1; // Set to one to signal the beginning of the next word.
    int sentences = 0;
    
    // use a for-loop to iterate over the text entered.
    for (int i = 0, n = strlen(str); i < n; i++)
    {
        // using the ctype function isalpha(), we check each character in the provided string.
        // If it's alphebetical, we increment letters. If it's non-alphabetical, we move onto the else if statement.
        if (isalpha(str[i]))
        {
            letters += 1;
        }
        // Checking our specified non-alphabetical cases.
        else if (str[i] == 32 || str[i] == 33 || str[i] == 46 || str[i] == 63)
        {
            // If the ith character is 32 (i.e. a space) then increment words.
            if (str[i] == 32)
            {
                words += 1;   
            }
            // If the ith character is an exclamation mark (33), period (46), or question mark (63), increment sentences.
            if (str[i] == 33 || str[i] == 46 || str[i] == 63)
            {
                sentences += 1;
            }
        }
    }
    // printf("letters: %i\nwords: %i\nsentences: %i\n", letters, words, sentences);
    
    // Determine the average sentences and letters per 100 words.
    float s = 100 * ((float) sentences / words);
    float l = 100 * ((float) letters / words);
    // printf("avgS: %f\navgL: %f\n", s, l);
    
    // Determine the Coleman-Liau index by using the formula and inputting the averages
    int index = round(0.0588 * l - 0.296 * s - 15.8);
    
    // If the index is lower than 1...
    if (index < 1)
    {
        printf("Before Grade 1\n");
    }
    // If the index is greater than or equal to 16...
    else if (index >= 16)
    {
        printf("Grade 16+\n");
    }
    // If neither of those conditions is true, print the grade with its corresponding index value.
    else
    {
        printf("Grade %i\n", index);
    }
}