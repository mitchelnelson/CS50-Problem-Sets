from cs50 import get_string
import re
import sys

# Get string from user
text = get_string("Text: ")

# Use regex to find quantity of letters, words, and sentences.
letters = len(re.findall("[a-zA-Z]", text))
words = len(re.findall("\S+", text))
sentences = len(re.findall("[.!?]", text))

# Implement Coleman-Liau formula with avg. letters and avg. sentences per 100 words
index = round((0.0588 * ((100 * letters) / words) - 0.296 * ((100 * sentences) / words) - 15.8))

# control flow for print statements
if index < 1:
    print("Before Grade 1")
elif index >= 16:
    print("Grade 16+")
else:
    print(f"Grade: {index}")