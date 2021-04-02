import os
import re

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Make sure API key is set
if not os.environ.get("API_KEY"):
    raise RuntimeError("API_KEY not set")


@app.route("/")
@login_required
def index():
    # Show portfolio of stocks

    # Query database for transactions and users
    rows = db.execute(
        "SELECT symbol, SUM(stock_qty) as stock_qty, SUM(stock_total) as stock_total, company FROM stocks WHERE person_id = ? GROUP BY company", session["user_id"])
    cash = db.execute("SELECT cash FROM users WHERE users.id = ?", session["user_id"])

    # Assign variables that will be dynamic and must be changed through arithmetic
    stockTotal = 0
    grandTotal = 0

    # For each stock obtained by the database query, lookup its current value. Keep track of the total value
    # of the individual stock, and use arithmetic to add to the global stockTotal.
    for row in rows:
        currentValue = lookup(row["symbol"])
        row["stock_price"] = currentValue["price"]
        row["stock_total"] = (row["stock_qty"] * row["stock_price"])
        stockTotal = stockTotal + row["stock_total"]

    # Update the grand total by adding the user's cash amount as well as the global stockTotal variable.
    grandTotal = stockTotal + cash[0]["cash"]

    db.execute("DELETE FROM stocks WHERE stock_qty = 0")

    # Pass all relevant information to the template.
    return render_template("index.html", rows=rows, cash=cash, grandTotal=grandTotal)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    # Buy shares of stock

    # Store current user as a variable.
    userId = session["user_id"]

    if request.method == "POST":

        # Determine how much cash current user has.
        cashQuery = db.execute("SELECT cash FROM users WHERE id = ?", userId)
        cashAvailable = float(cashQuery[0]["cash"])

        # Determine the total cost of stocks bought.

        stockQty = request.form.get("shares")

        if re.search('[^0-9]', stockQty):
            return apology("Share value must only contain numbers")

        # If stock symbol or stock shares not entered, return error.
        if not (request.form.get("symbol")) or not stockQty:
            return apology("Both stocks and shares must be entered.")

        # If stock symbol doesn't exist, return error.
        if lookup(request.form.get("symbol")) == None:
            return apology("Stock symbol does not exist.")

        # If non-positive integer or non-integer value of shares is entered, return error.
        if int(stockQty) < 1:
            return apology("Amount of shares must be an integer and not less than 1")

        # Lookup the stock to gather a total price of the holding.
        stock = lookup(request.form.get("symbol"))
        totalPrice = stock["price"] * int(stockQty)

        # Determine if user can afford to buy desired amount of stocks.
        if cashAvailable >= totalPrice:
            newBalance = cashAvailable - totalPrice
            db.execute(
                "INSERT INTO stocks (company, symbol, stock_price, stock_qty, stock_total, person_id) VALUES(?, ?, ?, ?, ?, ?)",
                stock["name"], stock["symbol"], stock["price"], stockQty, totalPrice, userId)
            db.execute(
                "INSERT INTO history (symbol, stock_price, qty, person_id) VALUES(?, ?, ?, ?)",
                request.form.get("symbol"), stock["price"], stockQty, userId)
            db.execute(
                "UPDATE users SET cash = ? WHERE id = ?", newBalance, userId)
            return redirect("/")
        else:
            return apology("Not enough funds to complete transaction.", 400)

        return apology("Sorry, something went wrong.", 404)

    # Get request
    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    # Show history of transactions

    # Select the entire history table and pass it to the history template.
    rows = db.execute("SELECT * FROM history WHERE person_id = ?", session["user_id"])
    return render_template("history.html", rows=rows)


@app.route("/login", methods=["GET", "POST"])
def login():
    # Log user in

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 400)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 400)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 400)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

    return apology("Sorry, something went wrong.", 404)


@app.route("/logout")
def logout():
    # Log user out

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    # Get stock quote.

    if request.method == "POST":

        # if stock symbol isn't entered, return error.
        if not request.form.get("symbol"):
            return apology("Stock symbol must be entered", 400)

        # store the result of lookup() being called on the user's form entry for a stock symbol.
        results = lookup(request.form.get("symbol"))

        # if symbol entered does not exist, return error. Otherwise, return the quoted webpage.
        if results == None:
            return apology("Invalid stock symbol.", 400)
        else:
            return render_template("quoted.html", results=results)

    else:
        # render a form when the current method is GET.
        return render_template("quote.html")

    # if there is some other unforeseen error, render a 404 error.
    return apology("Sorry, something went wrong.", 400)


@app.route("/register", methods=["GET", "POST"])
def register():
    # Register user

    # When form is submitted via POST, insert the new user into users table.
    if request.method == "POST":

        # if user does not enter a username, return error.
        if not request.form.get("username"):
            return apology("Must provide username.", 400)

        # check against database if username already exists.
        usernames = db.execute("SELECT username FROM users")
        for username in usernames:
            if request.form.get("username") == username["username"]:
                return apology("Username already exists.", 400)

        # if user does not enter a password, return error.
        if not request.form.get("password"):
            return apology("Must provide password.", 400)

        # if user's passwords do not match, return error.
        if not request.form.get("password") == request.form.get("confirmation"):
            return apology("Passwords must match.", 400)

        # store username and hash as variables. Then, insert into the database these values.
        username = request.form.get("username")
        hashedPassword = generate_password_hash(request.form.get("password"))
        db.execute("INSERT INTO users (username, hash) VALUES(?, ?)", username, hashedPassword)

        # after storing data, redirect the user to the login page.
        return redirect("/login")

    # When requested via GET, should display registration form.
    else:
        return render_template("register.html")

    # If any other error occurs, safeguard with a 404 error.
    return apology("Sorry, something went wrong.", 404)


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    # Sell shares of stock

    # Make shorthand variable for logged in user.
    userId = session["user_id"]

    # Obtain the user's current cash amount from the database.
    cashQuery = db.execute("SELECT cash FROM users WHERE users.id = ?", userId)
    cash = cashQuery[0]["cash"]

    # Obtain information about the user's current stock inventories.
    owned = db.execute("SELECT symbol, stock_qty FROM stocks WHERE person_id = ? GROUP BY symbol", userId)

    # Add all of the stock symbols that the user has bought to an empty list.
    ownedSymbols = []
    for item in owned:
        ownedSymbols.append(item["symbol"])

    if request.method == "POST":

        # Obtain user entries for symbol and shares.
        symbol = request.form.get("symbol")
        stockQty = request.form.get("shares")

        # Sum together stock quantities that have the same symbols within the database.
        selectedStock = db.execute("SELECT SUM(stock_qty) as stock_qty, stock_price FROM stocks WHERE symbol = ?", symbol)

        # if the symbol entered in the form isn't in the list, return error.
        if symbol not in ownedSymbols:
            return apology("User does not own a stock of this kind.", 400)

        # if the quantity entered is non-positive, return error.
        if int(stockQty) < 1:
            return apology("Quantity of stocks sold must be at least 1.", 400)

        # if the user enters more stocks in the field than he/she has, return error.
        if int(stockQty) > selectedStock[0]["stock_qty"]:
            return apology("User does not have this many stocks to sell.", 400)

        # Create variables for the updated stock quantities and cash amount from the transaction.
        updatedStocks = selectedStock[0]["stock_qty"] - int(stockQty)
        updatedCash = cash + (int(stockQty) * selectedStock[0]["stock_price"])

        # Database queries; updating users and their stock inventories; recording transaction in history table.
        db.execute("UPDATE users SET cash = ? WHERE id = ?", updatedCash, userId)
        db.execute("UPDATE stocks SET stock_qty = ? WHERE person_id = ? AND symbol = ?", updatedStocks, userId, symbol)
        db.execute("INSERT INTO history (symbol, stock_price, qty, person_id) VALUES(?, ?, ?, ?)",
                   symbol, selectedStock[0]["stock_price"], -(int(stockQty)), userId)

        return redirect("/")

    else:
        # render a form when the current method is GET.
        return render_template("sell.html", owned=owned)

    # if there is some other unforeseen error, render a 404 error.
    return apology("Sorry, something went wrong.", 404)


@app.route("/add", methods=["GET", "POST"])
@login_required
def addCash():
    # Allow user to add cash to database

    if request.method == "POST":

        # Obtain the user's current cash amount and the amount of cash they want to add.
        cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
        formFunds = request.form.get("funds")

        # if the funds entered into the field are non-positive or greater than 1M, return error.
        if float(formFunds) < 0 or float(formFunds) > 1000000:
            return apology("Funds added must be between $0.01 and $1,000,000.", 400)

        # Define the new cash balance for the user by adding his/her current cash value with the entered value.
        newCashBalance = cash[0]["cash"] + float(formFunds)

        # Log the new cash balance to the users table.
        db.execute("UPDATE users SET cash = ? WHERE id = ?", newCashBalance, session["user_id"])

        return redirect("/")

    else:
        return render_template("add.html")


def errorhandler(e):
    # Handle error
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)