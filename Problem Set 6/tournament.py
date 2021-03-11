# Simulate a sports tournament

import csv
import sys
import random
import math

# Number of simluations to run
N = 1000


def main():

    # Ensure correct usage
    if len(sys.argv) != 2:
        sys.exit("Usage: python tournament.py FILENAME")

    teams = []

    # assign the .csv file as 'filename' and open it
    filename = sys.argv[1]
    open(filename)

    with open(filename) as file:
        reader = csv.DictReader(file)

        # for each line (which is team and rating), change the team's rating to an integer,
        # then, append the entire team to the teams list
        for team in reader:
            team["rating"] = int(team["rating"])
            teams.append(team)

    counts = {}
    
    # for 1000 tournaments, simulate a winner. Store it in a variable, and populate the counts dictionary.
    for i in range(N):
        winner = simulate_tournament(teams)
        
        # if winner already exists, increment by 1.
        if winner in counts:
            counts[winner] += 1
            
        # if winner doesn't exist in the dictionary yet, populate by setting the current team's value to 1.
        # on all subsequent wins for that team, they will encounter the if condition, not the else condition.
        else:
            counts[winner] = 1
    
    # Print each team's chances of winning, according to simulation
    for team in sorted(counts, key=lambda team: counts[team], reverse=True):
        print(f"{team}: {counts[team] * 100 / N:.1f}% chance of winning")


def simulate_game(team1, team2):
    """Simulate a game. Return True if team1 wins, False otherwise."""
    rating1 = team1["rating"]
    rating2 = team2["rating"]
    probability = 1 / (1 + 10 ** ((rating2 - rating1) / 600))
    return random.random() < probability


def simulate_round(teams):
    """Simulate a round. Return a list of winning teams."""
    winners = []

    # Simulate games for all pairs of teams
    for i in range(0, len(teams), 2):
        if simulate_game(teams[i], teams[i + 1]):
            winners.append(teams[i])
        else:
            winners.append(teams[i + 1])

    return winners


def simulate_tournament(teams):
    """Simulate a tournament. Return name of winning team."""

    # while there are still teams who need to play each other, recursively call simulate_round on the remaining teams.
    # once there is a winner of the round, the while loop will be exited and said team will be returned to the function.
    while (len(teams) > 1):
        teams = simulate_round(teams)

    return teams[0]['team']


if __name__ == "__main__":
    main()
