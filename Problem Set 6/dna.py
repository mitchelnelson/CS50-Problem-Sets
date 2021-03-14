import sys
import csv
import re

# files to be opened
csvFile = sys.argv[1]
dnaFile = sys.argv[2]

# STR/name database (csv file contents)
csvData = []

# individual repeats that are matched in getRepeats()
repeats = []


def main():

    # counter variable for number of STRs in the STR/name database (csv file)
    nRepeats = 0

    # enforce correct command-line arguments
    if len(sys.argv) != 3:
        print('Usage: python dna.py data.csv sequence.txt')

    # open STR/name database and read each line, saving each row as its own array in csvData list.
    with open(csvFile) as file:
        reader = csv.reader(file)
        # next(reader)
        for row in reader:
            global csvData
            csvData += [row]

    # determine how many repeats will be matched between csvData[] and repeats[]
    for i in range(1, len(csvData[0]), 1):
        nRepeats += 1

    # open the DNA sequences and save as string
    with open(dnaFile) as file:
        dnaData = file.read()

    getRepeats(nRepeats, csvData, dnaData)
    checkDNA()


def getRepeats(n, csvData, dnaData):
    # determine the longest consecutive repetition of an STR

    # for the amount of STRs looked at in the database, find all matches for the STR nucleotide pattern
    for i in range(n):
        global repeats
        pattern = (f"{csvData[0][i + 1]}")
        matchLength = len(re.findall(pattern, dnaData))

        # for the amount of matches found, iterate backwards and search dnaData string for the longest
        # consecutive amount of the STR pattern repeating. Once the longest pattern is found, we know,
        # for that STR pattern, we can add that to a data structure called repeats[] which we will use
        # to compare to the csv file to determine the person in the checkDNA() function.
        for j in range(matchLength, 0, -1):
            if ((csvData[0][i + 1]) * j) in dnaData:
                repeats += [str(j)]
                break
    return


def checkDNA():
    # compare the repeats list with the csvData list. I used an equality comparison by truncating the first
    # element of the csvData list to remove the name. Then, if a match is found, print the name. If no match
    # is found, print "No match" and return false
    
    for i in range(1, len(csvData), 1):
        if repeats == csvData[i][1:]:
            print(f"{csvData[i][0]}")
            return True
    print("No match")
    return False


if __name__ == "__main__":
    main()