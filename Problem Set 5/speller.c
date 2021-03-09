// Implements a dictionary's functionality
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <strings.h>
#include <stdlib.h>
#include <ctype.h>

#include "dictionary.h"

// Represents a node in a hash table
typedef struct node
{
    char word[LENGTH + 1];
    struct node *next;
}
node;

// Number of words in the dictionary
int wordCount;

// Number of buckets in hash table
const unsigned int N = 50;

// Hash table
node *table[N];

// return true if the word is in the provided dictionary, false otherwise.
bool check(const char *word)
{
    // hash the word to obtain a hash value
    int hashValue = hash(word);

    // set a cursor to point to the first value of the table
    node *cursor = table[hashValue];

    // look for the word (provided as input to the function) within the linked lists of that bucket.
    while (cursor != NULL)
    {
        // if the word exists at that node where cursor is currently pointing to, return true.
        if (strcasecmp(word, cursor->word) == 0)
        {
            return true;
        }
        // else, move the cursor to the next node (possibly iterating to the end until cursor == NULL if dictionary word is not in the linked list)
        else
        {
            cursor = cursor->next;
        }
    }
    // if the word is not found, return false.
    return false;
}

// Hashes word to a number
// Source: djib2 by Dan Bernstein (http://www.cse.yorku.ca/~oz/hash.html))
// Adapted by another user from reddit: (https://www.reddit.com/r/cs50/comments/eo4zro/good_hash_function_for_speller/)
unsigned int hash(const char *word)
{

    unsigned long hash = 5381;
    int c = *word;
    c = tolower(c);

    while (*word != 0)
    {
        hash = ((hash << 5) + hash) + c;
        c = *word++;
        c = tolower(c);
    }

    return hash % N;
}

// Loads dictionary into memory, returns true if word is in dictionary, else false.
// We will be opening up the dictionary file, and storing each word inside a hash table (an array of linked lists).
bool load(const char *dictionary)
{

    // a character array that will read into by fscanf() in step 2.)
    char word[LENGTH];

    // 1.) Open the dictionary file. Use fopen(), and remember to check if the return value is NULL.
    FILE *file = fopen(dictionary, "r");
    if (file == NULL)
    {
        return false;
    }

    // 2.) Read strings from the file one at a time.
    while (fscanf(file, "%s", word) != EOF)
    {
        // 3.) Create a new node for each word.
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            return false;
        }

        wordCount++;
        strcpy(n->word, word);
        n->next = NULL;

        // 4.) Hash the word to obtain a hash value.
        int hashValue = hash(word);

        // 5.) Insert node into the hash table at that location

        // if there is no collision at the current value in the hash table, store the address of the new node at that index.
        if (table[hashValue] == NULL)
        {
            table[hashValue] = n;
        }

        // if there is a collision at the current value, set the new node's next value to the 'head' of the current index,
        // then, set the new 'head' of the index to point at the new node.
        else
        {
            n->next = table[hashValue];
            table[hashValue] = n;
        }

    }

    fclose(file);
    return true;
}

// Returns number of words in dictionary if loaded, else 0 if not yet loaded
unsigned int size(void)
{
    // returns the global variable wordCount, incremented each time in load()
    return wordCount;
}

// Unloads dictionary from memory, returning true if successful, else false
// each linked list contains nodes we've malloc() that need to be freed
bool unload(void)
{
    // iterate over hashtable () (i.e. iterate over each linked list)
    for (int i = 0; i < N; i++)
    {
        // create cursor that points to what head is pointing to
        node *cursor = table[i];
        while (cursor != NULL)
        {
            // create tmp variable that points to the same thing as cursor
            node *tmp = cursor;

            // move cursor to next node (cursor = cursor->next)
            cursor = cursor->next;

            // call free(tmp) on tmp's current node
            free(tmp);
        }
    }
    return true;
}
