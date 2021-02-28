#include "helpers.h"
#include <stdio.h>
#include <math.h>
#include <cs50.h>

void swapPixels(RGBTRIPLE *a, RGBTRIPLE *b);

// Convert image to grayscale
void grayscale(int height, int width, RGBTRIPLE image[height][width])
{
    // iterate by row
    for (int i = 0; i < height; i++)
    {
        // iterate by each column within the row (i.e. go through each pixel)
        for (int j = 0; j < width; j++)
        {
            // determine the average of a pixel by adding the RGB values together, and dividing by 3
            // rounding the entire average and converting ints to floats to capture pixels rounding up and down
            float avg = round((((float) image[i][j].rgbtBlue + image[i][j].rgbtGreen + image[i][j].rgbtRed) / 3));

            // assign the variable avg to each RGBTRIPLE property to create an equivalent shade of grey
            image[i][j].rgbtBlue = image[i][j].rgbtGreen = image[i][j].rgbtRed = avg;
        }

    }
    return;
}

// Convert image to sepia
void sepia(int height, int width, RGBTRIPLE image[height][width])
{

    int originalRed, originalGreen, originalBlue;
    float sepiaRed, sepiaGreen, sepiaBlue;
    int maxValue = 255;

    // iterate by row
    for (int i = 0; i < height; i++)
    {
        // iterate by each column within the row (i.e. go through each pixel)
        for (int j = 0; j < width; j++)
        {
            // store the original RGB values for each pixel
            originalRed = image[i][j].rgbtRed;
            originalGreen = image[i][j].rgbtGreen;
            originalBlue = image[i][j].rgbtBlue;

            // assign sepia values for each pixel by applying each sepia formula by RGB value
            // ensure that the value is rounded properly and does not exceed 255.

            sepiaRed = round(.393 * (float) originalRed + .769 * originalGreen + .189 * originalBlue);
            if (sepiaRed > maxValue)
            {
                sepiaRed = maxValue;
            }

            sepiaGreen = round(.349 * (float) originalRed + .686 * originalGreen + .168 * originalBlue);
            if (sepiaGreen > maxValue)
            {
                sepiaGreen = maxValue;
            }

            sepiaBlue = round(.272 * (float) originalRed + .534 * originalGreen + .131 * originalBlue);
            if (sepiaBlue > maxValue)
            {
                sepiaBlue = maxValue;
            }

            // store the new sepia values inside each RGBtriple
            image[i][j].rgbtRed = sepiaRed;
            image[i][j].rgbtGreen = sepiaGreen;
            image[i][j].rgbtBlue = sepiaBlue;
        }

    }
    return;
}

// Reflect image horizontally
void reflect(int height, int width, RGBTRIPLE image[height][width])
{

    // iterate by row
    for (int i = 0; i < height; i++)
    {
        // iterate by each column within the row (i.e. go through each pixel)
        // However, because we are swapping the pixels to mirror them, only width/2 iterations are necessary
        // (Draw out an even/odd array to see why width/2 iterations are necessary; if we only do width, we will get a mirrored image of the image.)
        for (int j = 0; j < width / 2; j++)
        {
            swapPixels(&image[i][j], &image[i][width - j - 1]);
        }
    }

    return;
}

// Helper function for reflect function; swapping the values in memory of a and b.
// In this case, we are passing in the individual pixels (RGBTRIPLE VALUES) at opposite ends of the row, and swapping them with a temporary variable.
void swapPixels(RGBTRIPLE *a, RGBTRIPLE *b)
{
    RGBTRIPLE tmp;
    tmp = *a;
    *a = *b;
    *b = tmp;
}

// Blur image
void blur(int height, int width, RGBTRIPLE image[height][width])
{
    
    /////////////////////// ORIGINAL IMAGE COPYING ////////////////////////
    
    // Make a copy of the original image to preserve the average value of each color type.
    // We update the image's color values upon each iteration for a pixel. If we were to use the original image each time, we would be
    // skewing the true value in each pixel every iteration.
    
    RGBTRIPLE copy[height][width];
    
    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width; j++)
        {
            copy[i][j] = image[i][j];
        }
    }

    //////////////////////////// BOX BLUR //////////////////////////////////
    
    // For height columns
    for (int i = 0; i < height; i++)
    {

        // For width rows
        for (int j = 0; j < width; j++)
        {
            // initialize a counter variable to determine if the pixel is technically within the 3x3 grid.
            int goodValQty = 0;
            
            // initialize three copied color values to zero (to be eventually updated if the pixel is valid)
            float blurRed = 0;
            float blurGreen = 0;
            float blurBlue = 0;

            // Testing the 3x3 grid heights (visualize a cartesian plane, where the pixel is the middle of a 3x3 grid, the box above or below 'may or may not' exist in memory)
            for (int gridHeight = 1; gridHeight >= -1; gridHeight--)
            {
                
                if (i - gridHeight < 0 || i - gridHeight > height - 1)
                {
                    // If the pixel doesn't exist in memory, reiterate
                    continue;
                }
                
                // Testing the 3x3 grid widths (visualize a cartesian plane, where the pixel is the middle of a 3x3 grid, the box left or right 'may or may not' exist in memory)
                for (int gridWidth = -1; gridWidth <= 1; gridWidth++)
                {

                    if (j + gridWidth < 0 || j + gridWidth > width - 1)
                    {
                        // If the pixel doesn't exist in memory, reiterate
                        continue;
                    }

                    // If all conditions are satisfied (i.e. the pixel at the current iteration of the 3x3 BOX BLUR exists both in height and width),
                    // we increment the good value quantity variable, and start counting the copied color values by indexing into the copy values
                    // that exist in the 3x3 and view their RGBTRIPLE values.
                    
                    else
                    {
                        goodValQty++;

                        blurRed += copy[i - gridHeight][j + gridWidth].rgbtRed;
                        blurGreen += copy[i - gridHeight][j + gridWidth].rgbtGreen;
                        blurBlue += copy[i - gridHeight][j + gridWidth].rgbtBlue;
                    }

                }

            }
            
            // As an error check, if the pixel exists in memory at least once, we should update the actual image's RGBTRIPLE values and ensure rounding.
            if (goodValQty > 0)
            {
                image[i][j].rgbtRed = round(blurRed / goodValQty);
                image[i][j].rgbtGreen = round(blurGreen / goodValQty);
                image[i][j].rgbtBlue = round(blurBlue / goodValQty);

            }

        }

    }

    return;
}


