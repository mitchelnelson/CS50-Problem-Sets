// Simulate genetic inheritance of blood type

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Each person has two parents and two alleles
typedef struct person
{
    struct person *parents[2];
    char alleles[2];
}
person;

const int GENERATIONS = 3;
const int INDENT_LENGTH = 4;

person *create_family(int generations);
void print_family(person *p, int generation);
void free_family(person *p);
char random_allele();

int main(void)
{
    // Seed random number generator
    srand(time(0));

    // Create a new family with three generations
    person *p = create_family(GENERATIONS);

    // Print family tree of blood types
    print_family(p, 0);

    // Free memory
    free_family(p);
}

// Create a new individual with `generations`
person *create_family(int generations)
{
    // TODO: Allocate memory for new person
    // Here we are creating a person by mallocing the size of a person struct; we do this each time create_family is called
    person *newPerson = malloc(sizeof(person));

    // Generation with parent data
    if (generations > 1)
    {
        // TODO: Recursively create blood type histories for parents
        
        // If the generation has parents, call create_family to make parents for that specific person. We call it twice because each person regarded will have two parents under this condition.
        newPerson->parents[0] = create_family(generations - 1);
        newPerson->parents[1] = create_family(generations - 1);

        // TODO: Randomly assign child alleles based on parents
        
        // Here, we set the alleles based on the parents by looking at the specific person's parents (either parent is looked at).
        // On the parent's alleles, we index into. Then we assign the child's allele (which there are 2 of, so we do this twice)
        // by using the rand() function to choose, at random, the specified parent's allele within the alleles array.
        
        newPerson->alleles[0] = newPerson->parents[0]->alleles[rand() % 2];
        newPerson->alleles[1] = newPerson->parents[1]->alleles[rand() % 2];

    }

    // Generation without parent data
    else
    {
        // TODO: Set parent pointers to NULL
        
        // If we hit this statement, we know we are at the grandparents. Thus, their parents are 'not' looked at within the program, so we set their parents' pointers to NULL.
        newPerson->parents[0] = NULL;
        newPerson->parents[1] = NULL;

        // TODO: Randomly assign alleles
        
        // Again, if we hit this statement, we know the grandparents' parents are not looked at. Therefore, we need to create random alleles to seed the rest of the children.
        newPerson->alleles[0] = random_allele();
        newPerson->alleles[1] = random_allele();
    }

    // TODO: Return newly created person
    
    // newPerson is a pointer, so we just have to return it.
    
    return newPerson;
}

// Free `p` and all ancestors of `p`.
void free_family(person *p)
{
    
    // TODO: Handle base case
    
    // If the person doesn't exist, return. (Base case)
    if (p == NULL)
    {
        return;
    }

    // TODO: Free parents
    
    // If the specific person's parents exist in memory still (aka they are not null) then we should call free_family() on each parent.
    // As such, the free_family() function will take in one person as input. Therefore, if we start with the youngest child, his parents will
    // call free_family on their parents (aka grandparents).
    
    // Once we reach the end of the line, the grandparents escape the if statement because their parents are NULL. Now, the free child line of
    // code will execute at the bottom, taking in the specific person at that current place in the callstack as input and freeing it from memory.
    // This will occur from the 'top-down' recursively until we get to the youngest child. At that point, we free the child and exit the program.
    
    if (p->parents[0] != NULL && p->parents[1] != NULL)
    {
        free_family(p->parents[0]);
        free_family(p->parents[1]);
    }

    // TODO: Free child
    free(p);
}

// Print each family member and their alleles.
void print_family(person *p, int generation)
{
    // Handle base case
    if (p == NULL)
    {
        return;
    }

    // Print indentation
    for (int i = 0; i < generation * INDENT_LENGTH; i++)
    {
        printf(" ");
    }

    // Print person
    printf("Generation %i, blood type %c%c\n", generation, p->alleles[0], p->alleles[1]);
    print_family(p->parents[0], generation + 1);
    print_family(p->parents[1], generation + 1);
}

// Randomly chooses a blood type allele.
char random_allele()
{
    int r = rand() % 3;
    if (r == 0)
    {
        return 'A';
    }
    else if (r == 1)
    {
        return 'B';
    }
    else
    {
        return 'O';
    }
}
