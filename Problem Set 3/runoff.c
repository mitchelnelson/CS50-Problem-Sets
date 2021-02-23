#include <ctype.h>
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Max voters and candidates
#define MAX_VOTERS 100
#define MAX_CANDIDATES 9

// preferences[i][j] is jth preference for voter i
int preferences[MAX_VOTERS][MAX_CANDIDATES];

// Candidates have name, vote count, eliminated status
typedef struct
{
    string name;
    int votes;
    bool eliminated;
}
candidate;

// Array of candidates
candidate candidates[MAX_CANDIDATES];

// Numbers of voters and candidates
int voter_count;
int candidate_count;

// Function prototypes
bool vote(int voter, int rank, string name);
void tabulate(void);
bool print_winner(void);
int find_min(void);
bool is_tie(int min);
void eliminate(int min);

int main(int argc, string argv[])
{
    // Check for invalid usage
    if (argc < 2)
    {
        printf("Usage: runoff [candidate ...]\n");
        return 1;
    }

    // Populate array of candidates
    candidate_count = argc - 1;
    if (candidate_count > MAX_CANDIDATES)
    {
        printf("Maximum number of candidates is %i\n", MAX_CANDIDATES);
        return 2;
    }
    for (int i = 0; i < candidate_count; i++)
    {
        candidates[i].name = argv[i + 1];
        candidates[i].votes = 0;
        candidates[i].eliminated = false;
    }

    voter_count = get_int("Number of voters: ");
    if (voter_count > MAX_VOTERS)
    {
        printf("Maximum number of voters is %i\n", MAX_VOTERS);
        return 3;
    }

    // Keep querying for votes
    for (int i = 0; i < voter_count; i++)
    {

        // Query for each rank
        for (int j = 0; j < candidate_count; j++)
        {
            string name = get_string("Rank %i: ", j + 1);

            // Record vote, unless it's invalid
            if (!vote(i, j, name))
            {
                printf("Invalid vote.\n");
                return 4;
            }
        }

        printf("\n");
    }

    // Keep holding runoffs until winner exists
    while (true)
    {
        // Calculate votes given remaining candidates
        tabulate();

        // Check if election has been won
        bool won = print_winner();
        if (won)
        {
            break;
        }

        // Eliminate last-place candidates
        int min = find_min();
        bool tie = is_tie(min);

        // If tie, everyone wins
        if (tie)
        {
            for (int i = 0; i < candidate_count; i++)
            {
                if (!candidates[i].eliminated)
                {
                    printf("%s\n", candidates[i].name);
                }
            }
            break;
        }

        // Eliminate anyone with minimum number of votes
        eliminate(min);

        // Reset vote counts back to zero
        for (int i = 0; i < candidate_count; i++)
        {
            candidates[i].votes = 0;
        }
    }
    return 0;
}

// Record preference if vote is valid
bool vote(int voter, int rank, string name)
{
    // For the amount of candidates times:
    for (int i = 0; i < candidate_count; i++)
    {
        // compare the inputted name by the voter against the current candidate in the array according to i
        if (strcmp(name, candidates[i].name) == 0)
        {
            // if the names are the same, the ith voter's preference of candidate is the candidate at that point in the iteration
            preferences[voter][rank] = i;
            return true;
        }
    }
    return false;
}

// Tabulate votes for non-eliminated candidates
void tabulate(void)
{
    // candidates[1].eliminated = true;
    // Iterate through each voter
    for (int i = 0; i < voter_count; i++)
    {
        // Iterate through each candidate in the candidates array.
        for (int j = 0; j < candidate_count; j++)
        {
            // If the candidate for the ith voter's first preference (the jth candidate stored in preferences) is not eliminated
            if (candidates[preferences[i][j]].eliminated == false)
            {
                // Update the candidate who is the jth preference for the ith voter (increment the votes by 1)
                candidates[preferences[i][j]].votes++;
                break;
            }
        }
    }
    return;
}

// Print the winner of the election, if there is one
bool print_winner(void)
{
    // initialize winningTotal, which is the amount of votes
    float winThreshold = (float) voter_count / 2;
    for (int i = 0; i < candidate_count; i++)
    {
        if (candidates[i].eliminated == false && candidates[i].votes > winThreshold)
        {
            printf("%s\n", candidates[i].name);
            return true;
        }
    }
    return false;
}

// Return the minimum number of votes any remaining candidate has
int find_min(void)
{
    // Keep track of the minimum vote while cycling through candidates
    int min;
    for (int i = 0; i < candidate_count; i++)
    {
        // If the current candidate has equal to/less than the current min vote, set the new min to that candidate's vote quantity
        if (candidates[i].eliminated == false && candidates[i].votes <= min)
        {
            min = candidates[i].votes;
        }
    }
    return min;
}

// Return true if the election is tied between all candidates, false otherwise
bool is_tie(int min)
{
    // Keep track of candidates who have not been eliminated, as well as a variable tiedCandidates to compare to remainingCandidates in the last step of the function
    int remainingCandidates = 0;
    int tiedCandidates = 0;

    // Iterate through candidates
    for (int i = 0; i < candidate_count; i++)
    {
        // If the ith candidate is not eliminated
        if (candidates[i].eliminated == false)
        {
            // Increment remainingCandidates by 1
            remainingCandidates++;

            // If the candidate hasn't been eliminated, he/she will hit this if statement; if the ith candidate has min number of votes, increment tiedCandidates by 1.
            if (candidates[i].votes == min)
            {
                tiedCandidates++;
            }
        }
    }

    // If these two variables we incremented are equal, we know that all the candidates remaining are tied with each other because they each have min number of votes.
    if (remainingCandidates == tiedCandidates)
    {
        return true;
    }
    return false;
}

// Eliminate the candidate (or candidates) in last place
void eliminate(int min)
{
    // Iterate through candidates
    for (int i = 0; i < candidate_count; i++)
    {
        // If a candidate has min votes, update his/her eliminated value to true,
        if (candidates[i].votes == min)
        {
            candidates[i].eliminated = true;
        }
    }
    return;
}