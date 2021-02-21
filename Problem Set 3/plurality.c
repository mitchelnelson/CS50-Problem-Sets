#include <cs50.h>
#include <stdio.h>
#include <string.h>

// Max number of candidates
#define MAX 9

// Candidates have name and vote count
typedef struct
{
    string name;
    int votes;
}
candidate;

// Array of candidates
candidate candidates[MAX];

// Number of candidates
int candidate_count;

// Function prototypes
bool vote(string name);
void print_winner(void);

int main(int argc, string argv[])
{
    // Check for invalid usage
    if (argc < 2)
    {
        printf("Usage: plurality [candidate ...]\n");
        return 1;
    }

    // Populate array of candidates
    candidate_count = argc - 1;
    if (candidate_count > MAX)
    {
        printf("Maximum number of candidates is %i\n", MAX);
        return 2;
    }
    for (int i = 0; i < candidate_count; i++)
    {
        candidates[i].name = argv[i + 1];
        candidates[i].votes = 0;
    }

    int voter_count = get_int("Number of voters: ");

    // Loop over all voters
    for (int i = 0; i < voter_count; i++)
    {
        string name = get_string("Vote: ");

        // Check for invalid vote
        if (!vote(name))
        {
            printf("Invalid vote.\n");
        }
    }

    // Display winner of election
    print_winner();
}

// Update vote totals given a new vote
bool vote(string name)
{
    // for each candidate, determine if the the candidate chosen by the voter is within the candidates array.
    for (int i = 0; i < candidate_count; i++)
    {
        // if candidate is in array, increment his/her vote by 1.
        if (strcmp(name, candidates[i].name) == 0)
        {
            candidates[i].votes++;
            return true;
        }
    }
    // if a candidate is not found within array, return false.
    return false;
}

// Print the winner (or winners) of the election
void print_winner(void)
{
    // create a variable to keep track of the highest vote when looping through the candidates' vote counts.
    int topVote = 0;
    for (int i = 0; i < candidate_count; i++)
    {
        // if the current candidate has more votes than the current top vote, update the variable count.
        if (candidates[i].votes > topVote)
        {
            topVote = candidates[i].votes;
        }
    }
    
    // for each of the candidates, loop again to determine winner(s)
    for (int i = 0; i < candidate_count; i++)
    {
        // if the candidate has the highest vote count, print out his/her name. This allows for multiple winners.
        if (candidates[i].votes == topVote)
        {
            printf("%s\n", candidates[i].name);
        }
    }
    return;
}