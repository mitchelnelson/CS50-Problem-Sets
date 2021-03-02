#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <cs50.h>

int main(int argc, char *argv[])
{
    // defining BYTE, and buffers for image contents and image file name strings
    typedef uint8_t BYTE;
    BYTE byteBuffer[512];
    char fileBuffer[8];

    // command-line argument usage
    if (argc != 2)
    {
        printf("Usage: ./recover image\n");
        return 1;
    }

    // initializing pointer files
    FILE *card = fopen(argv[1], "r");
    FILE *img = NULL;
    
    // initializing a jpeg counter variable to be used for sprintf() and conditional flow within 512 byte blocks
    int jpegCount = 0;
    
    // while a memory card file made up of 512 byte chunks, where each 512 byte chunk from the card is read at a time into a buffer called byteBuffer...
    // and while the return value of fread() is number (i.e. the EOF has not been reached)...
    while (fread(byteBuffer, 512, 1, card) == 1)
    {
        // If this is the start of a new jpeg:
        if (byteBuffer[0] == 0xff && byteBuffer[1] == 0xd8 && byteBuffer[2] == 0xff && (byteBuffer[3] & 0xf0) == 0xe0)
        {
            // we know we have found a jpeg because the jpeg markers have been permitted by the conditional
            jpegCount++;
            
            // if this is the first jpeg, start writing the first jpeg file
            if (jpegCount == 1)
            {
                sprintf(fileBuffer, "%03i.jpg", jpegCount - 1);
                img = fopen(fileBuffer, "w");
                fwrite(byteBuffer, 512, 1, img);
            }
            
            // if this is a jpeg found (excluding the first jpeg), close the image being written to, and make a new image file.
            // then, write to the new image file
            else if (jpegCount > 1)
            {
                fclose(img);
                sprintf(fileBuffer, "%03i.jpg", jpegCount - 1);
                img = fopen(fileBuffer, "w");
                fwrite(byteBuffer, 512, 1, img);
            }
            
        }
        
        // If this block is NOT the start of a new jpeg, but the image has not been closed yet, continue writing to the image file.
        else if (img)
        {
            fwrite(byteBuffer, 512, 1, img);
        }
        
    }
}

