-- Keep a log of any SQL queries you execute as you solve the mystery.

-- theft took place on July 28
-- theft took place on Chamberlin Street

-- Need to determine:
    -- who the thief is
    -- where the thief escaped to
    -- who the thief's accomplice was to escape town

-- Provided with:
    -- fiftyville.db: a SQLite database of different tables with data collected from around the town

-- Database structure:
    -- run .tables in SQLite to see the different tables
    -- to view the database schema for a table, run .schema <name_of_table>

----------------------------------------------------------------------------------------------------------------

-- view the crime description that occurred on July 28th on Chamberlin Street

-- SELECT description FROM crime_scene_reports
-- WHERE month = 7 AND day = 28
-- AND street = "Chamberlin Street";

    -- We learn that the theft occurred at 10:15am at Chamberlin St. courthouse.
    -- 3 witness interviews were conducted, and each transcript mentions courthouse.

----------------------------------------------------------------------------------------------------------------

-- read transcripts from witnesses that were conducted regarding the courthouse theft on July 28th

-- SELECT * FROM interviews
-- WHERE month = 7 AND day = 28;

    -- Ruth
        -- Sometime within ten minutes of the theft, I saw the thief get into a car in the courthouse parking
        -- lot and drive away. If you have security footage from the courthouse parking lot,
        -- you might want to look for cars that left the parking lot in that time frame.
    -- Eugene
        -- I don't know the thief's name, but it was someone I recognized. Earlier this morning,
        -- before I arrived at the courthouse, I was walking by the ATM on Fifer Street and saw the thief
        -- there withdrawing some money.
    -- Raymond
        -- As the thief was leaving the courthouse, they called someone who talked to them
        -- for less than a minute. In the call, I heard the thief say that they were planning
        -- to take the earliest flight out of Fiftyville tomorrow.
        -- The thief then asked the person on the other end of the phone to purchase the flight ticket.

----------------------------------------------------------------------------------------------------------------

-- find licence plates for vehicles that entered (before 10am) and exited the courthouse lot within the hour window that the crime occurred (past 10am).

-- SELECT license_plate FROM courthouse_security_logs
-- WHERE month = 7 AND day = 28 AND hour = 10 AND minute > 15 AND minute < 25 AND activity = "exit";

----------------------------------------------------------------------------------------------------------------

-- find withdrawal transactions from ATM on July 28th on Fifer Street

-- SELECT account_number FROM atm_transactions
-- WHERE month = 7 AND day = 28
-- AND atm_location = "Fifer Street"
-- AND transaction_type = "withdraw";

----------------------------------------------------------------------------------------------------------------

-- find phone calls that occurred that day < 60s; find earliest flight out of Fiftyville.

-- SELECT * FROM phone_calls
-- WHERE month = 7 AND day = 28 AND duration <= 60;

-- SELECT flights.id FROM flights
-- INNER JOIN airports ON flights.destination_airport_id = airports.id
-- WHERE month = 7 AND day = 29 AND hour < 9;

-- LOCATION:
    -- flight planned for July 29th at 8:20am. Fiftyville to London. Heathrow Airport. Flight ID 36.

----------------------------------------------------------------------------------------------------------------

-- find people who talked on the phone for less than 60s on July 28th on the plane

SELECT name from people
where id IN (

    SELECT id FROM people -- passport numbers of people who made calls < 60s on July 28th.
    WHERE phone_number IN (
        SELECT caller FROM phone_calls
        WHERE month = 7 AND day = 28 AND duration <= 60
    )

    INTERSECT

    SELECT id FROM people
    WHERE people.passport_number IN (
        SELECT passport_number FROM passengers
        WHERE passengers.flight_id = 36
    )

)

-- Bobby | 9878712108 | 30G67EN | (826) 555-1652
-- Roger | 1695452385 | G412CB7 | (130) 555-0289
-- Madison | 1988161715 | 1106N58 | (286) 555-6063
-- Evelyn | 8294398571 | 0NTHK55 | (499) 555-9472
-- Ernest | 5773159633 | 94KL13X | (367) 555-5533

----------------------------------------------------------------------------------------------------------------

-- intersect suspects above with people who withdrew money from an ATM on July 28th.

INTERSECT

SELECT name from people
WHERE people.id IN (

    SELECT person_id FROM bank_accounts
    WHERE bank_accounts.account_number IN (

        SELECT account_number FROM atm_transactions
        WHERE month = 7 AND day = 28
        AND atm_location = "Fifer Street"
        AND transaction_type = "withdraw"

    )

)

-- Bobby | 9878712108 | 30G67EN | (826) 555-1652
-- Ernest | 5773159633 | 94KL13X | (367) 555-5533
-- Madison | 1988161715 | 1106N58 | (286) 555-6063

----------------------------------------------------------------------------------------------------------------

-- intersect suspects above with license plates recorded at the courthouse.

INTERSECT

SELECT name FROM people
WHERE license_plate IN (

    SELECT license_plate FROM courthouse_security_logs
    WHERE month = 7 AND day = 28 AND hour = 10 AND minute > 15 AND minute < 25 AND activity = "exit"

)
GROUP BY name;

-- SUSPECT:
    -- Ernest | 5773159633 | 94KL13X | (367) 555-5533

-- We know that the thief (Ernest) called their accomplice to purchase the flight ticket to London.
-- Now, we can simply look at the recipient of his call to see who he was talking to to solve the crime.

----------------------------------------------------------------------------------------------------------------

-- find out who the accomplice was by looking at who Ernest was talking to

SELECT name FROM people
WHERE phone_number =  (

    SELECT receiver FROM phone_calls
    WHERE month = 7 AND day = 28 AND duration <= 60 AND caller = (

        SELECT phone_number FROM people
        WHERE name = "Ernest"

    )
);

-- ACCOMPLICE:
    -- Berthold