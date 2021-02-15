// include libraries
#include <stdio.h>
#include <cs50.h>

int main(void){
    // prompt user for a positive integer for pyramid height and store in variable
    int n;
    do {
        n = get_int("Positive integer: ");
    }
    while (n < 1 || n > 8);
    
    // use a for loop to determine n height
    for (int i = 1; i < n + 1; i++) {
        for (int k = n; k > i; k--) {
            printf(" ");
        }
        for (int j = 0; j < i; j++) {
            printf("#");
        }
    
        printf("\n");
    }

}

// where n is 4:
//      ...#       (i = 0), 3 dots, n = 1
//      ..##      (1 = 1), 2 dots, n = 2
//      .###     (i = 2), 1 dot, n = 3
//      ####    (i = 3), 0 dot, n = 4