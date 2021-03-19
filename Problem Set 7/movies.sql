-- In 1.sql, write a SQL query to list the titles of all movies released in 2008.

SELECT title FROM movies
WHERE year = 2008;

-- In 2.sql, write a SQL query to determine the birth year of Emma Stone.

SELECT birth FROM people
WHERE name = 'Emma Stone';

-- In 3.sql, write a SQL query to list the titles of all movies with a release date on or after 2018, in alphabetical order.

SELECT title FROM movies
WHERE year > 2017
ORDER BY title;

-- In 4.sql, write a SQL query to determine the number of movies with an IMDb rating of 10.0.

SELECT COUNT(rating) FROM ratings
WHERE rating = 10.0;

-- In 5.sql, write a SQL query to list the titles and release years of all Harry Potter movies, in chronological order.

SELECT title, year FROM movies
WHERE title LIKE 'Harry Potter%'
ORDER BY year;

-- In 6.sql, write a SQL query to determine the average rating of all movies released in 2012.

SELECT AVG(rating)
FROM ratings
WHERE movie_id IN (
    SELECT id FROM movies
    WHERE year = 2012
);

-- In 7.sql, write a SQL query to list all movies released in 2010 and their ratings, in descending order by rating. For movies with the same rating, order them alphabetically by title.

SELECT title, rating FROM movies
JOIN ratings ON movies.id = ratings.movie_id -- join movies and ratings
WHERE year = 2010
ORDER BY rating DESC, title;

-- In 8.sql, write a SQL query to list the names of all people who starred in Toy Story.

SELECT name FROM people
WHERE id IN (
    SELECT person_id FROM stars -- find person_ids for people who are stars...
    INNER JOIN movies ON stars.movie_id = movies.id -- join movies and stars
    WHERE movies.title = 'Toy Story' -- ...where the movie is Toy Story
);

-- In 9.sql, write a SQL query to list the names of all people who starred in a movie released in 2004, ordered by birth year.

SELECT name FROM people
INNER JOIN stars ON people.id = stars.person_id -- Join stars and people
WHERE stars.movie_id IN ( -- predicate where all of the stars who have a movie id in
    SELECT id FROM movies -- movie IDs
    WHERE year = 2004     -- where the year was 2004.
)
GROUP BY name -- group rows where stars have the same name
ORDER BY birth; -- order stars by birth year

-- In 10.sql, write a SQL query to list the names of all people who have directed a movie that received a rating of at least 9.0.

SELECT name FROM people
INNER JOIN directors ON people.id = directors.person_id -- join directors and people
WHERE directors.movie_id IN ( -- predicate where a director's movies in
    SELECT id FROM movies -- ids of movies
    INNER JOIN ratings ON movies.id = ratings.movie_id -- joining ratings and movies
    WHERE rating >= 9.0
);

-- In 11.sql, write a SQL query to list the titles of the five highest rated movies (in order) that Chadwick Boseman starred in, starting with the highest rated.

SELECT title FROM movies

INNER JOIN people on stars.person_id = people.id -- join people and stars
INNER JOIN stars ON movies.id = stars.movie_id -- join movies and stars
INNER JOIN ratings ON movies.id = ratings.movie_id -- join movies and ratings

WHERE name = "Chadwick Boseman"
ORDER BY rating DESC -- highest rated to lowest rated
LIMIT 5; -- limit results for top 5 movies

-- In 12.sql, write a SQL query to list the titles of all movies in which both Johnny Depp and Helena Bonham Carter starred.

SELECT title FROM movies
INNER JOIN stars ON stars.movie_id = movies.id -- join stars and movies
WHERE stars.person_id IN ( -- predicate where the person id (one who stars within movies)
    SELECT id FROM people -- is the id
    WHERE name = "Johnny Depp"
)

INTERSECT -- find the intersections between the titles above and the titles below

SELECT title FROM movies
INNER JOIN stars ON stars.movie_id = movies.id -- join stars and movies
WHERE stars.person_id IN ( -- predicate where the person id (one who stars within movies)
    SELECT id FROM people  -- is the id
    WHERE name = "Helena Bonham Carter"
);

-- In 13.sql, write a SQL query to list the names of all people who starred in a movie in which Kevin Bacon also starred.

SELECT name FROM people
WHERE name != "Kevin Bacon" AND id IN
(

    SELECT person_id FROM stars -- select stars using person_id
    WHERE stars.movie_id IN -- predicate where miscellaneous stars act in
    (

        SELECT id FROM movies -- id of movies
        INNER JOIN stars ON movies.id = stars.movie_id -- joining stars and movies
        WHERE stars.person_id IN -- predicate where Kevin Bacon is singled out
        (

            SELECT id FROM people -- id of Kevin Bacon
            WHERE name = "Kevin Bacon"
        )
    )
);