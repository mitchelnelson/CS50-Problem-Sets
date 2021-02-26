// Modifies the volume of an audio file

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

// Number of bytes in .wav header
const int HEADER_SIZE = 44;

int main(int argc, char *argv[])
{
    // Check command-line arguments
    if (argc != 4)
    {
        printf("Usage: ./volume input.wav output.wav factor\n");
        return 1;
    }

    // Open files and determine scaling factor
    FILE *input = fopen(argv[1], "r");
    if (input == NULL)
    {
        printf("Could not open file.\n");
        return 1;
    }

    FILE *output = fopen(argv[2], "w");
    if (output == NULL)
    {
        printf("Could not open file.\n");
        return 1;
    }

    float factor = atof(argv[3]);

    // TODO: Copy header from input file to output file

    // Create an array of 44 bytes for the header file
    uint8_t header[HEADER_SIZE];

    // Read from the file input. For header size 44 bytes (which all headers in this case are), we have one quantity that we want to
    // read from. Thus, we store it in the first element of header. Because this is an array, the parameter 'header' we pass into
    // is technically a pointer.
    fread(header, HEADER_SIZE, 1, input);

    // Here, we are doing the reverse of fread(). From header, we write the contents of the header to our output file. This is an
    // equivalent size writing, with the same quantity being written.
    fwrite(header, HEADER_SIZE, 1, output);

    // For the samples following the header, we declare an int type of 16 bits called "buffer" to store our sample data in.
    int16_t buffer;
    
    // While there are int16_t data to be read from the input file, change the current buffer property (for that sample element)
    // to be multiplied by the factor (which is entered on the command line by the user), and then write this updated property
    // to restore the current value at buffer.
    while (fread(&buffer, sizeof(int16_t), 1, input))
    {
        // printf("buffer address: %p\n", &buffer);
        buffer *= factor;
        fwrite(&buffer, sizeof(int16_t), 1, output);
    }

    // Close files
    fclose(input);
    fclose(output);
}
