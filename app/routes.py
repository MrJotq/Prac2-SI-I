#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from app import app, database
from flask import render_template, request, url_for, redirect, session
from pathlib import Path
from hashlib import blake2b
from hmac import compare_digest
from datetime import datetime
import json
import os
import sys
import random


# --- Métodos privados -----"/")------------------------------------------

"""
    Método privado para cargar el catálogo del videoclub
"""


def _loadCatalogue():
    return database.db_catalogue(30)

"""
    Método privado para obtener un conjunto con todas las categorias de las películas
    y un diccionario indexado por categoria
"""


def _loadCategoriesDict(films):
    aux_categories = set()
    aux_category_films = dict()

    for film in films:
        aux_categories.update(film["categories"])

    aux_categories = sorted(aux_categories)

    for category in aux_categories:
        aux_category_films[category] = []
        for film in films:
            if category in film["categories"]:
                aux_category_films[category].append(film)

    return aux_categories, aux_category_films


"""
    Método privado para obtener un diccionario indexado por título
"""


def _loadTitleDict(films):
    aux_title_films = dict()

    for film in films:
        aux_title_films[film["title"]] = film

    return aux_title_films


"""
    Método privado para obtener un diccionario indexado por ids
"""


def _loadIdDict(films):
    aux_id_films = dict()

    for film in films:
        aux_id_films[film["id"]] = film

    return aux_id_films


"""
    Método privado para calcular el total de la cesta
"""


def _cart_total():
    total = 0
    for film_id, quantity in session["cart"].items():
        total += id_films[film_id]["price"] * quantity

    return round(total, 2)


"""
    Método privado para obtener el precio de cada película
"""


# -------------------------------------------------------------------------------------------------

salt = "cadenaindescifrable"
catalogue = _loadCatalogue()
categories, category_films = _loadCategoriesDict(catalogue["films"])
title_films = _loadTitleDict(catalogue["films"])
id_films = _loadIdDict(catalogue["films"])


@app.route("/")
@app.route("/index")
def index():
    return render_template(
        "index.html",
        title="Home",
        films=catalogue["films"],
        categories=categories)


@app.route("/search")
def search():
    searchText = request.args.get("searchText").lower()
    searchResult = list()

    for title in title_films.keys():
        if searchText in title.lower():
            searchResult.append(title_films[title])

    return render_template(
        "index.html",
        title="Home",
        films=searchResult,
        categories=categories)


@app.route("/films/<category>")
def films(category):
    return render_template(
        "index.html",
        title="Category",
        films=category_films[category],
        categories=categories)


@app.route("/film/<film_id>")
def film(film_id):
    return render_template("film.html",
                           title="Film",
                           film=catalogue["films"][int(film_id) - 1],
                           categories=categories)


@app.route("/login", methods=["GET", "POST"])
def login():
    # doc sobre request object en
    # http://flask.pocoo.org/docs/1.0/api/#incoming-request-data
    if "username" in request.form:
        path = os.path.join(
            app.root_path,
            "usuarios/" +
            request.form["username"])
        if os.path.exists(path + "/data.dat"):
            formDict_data = open(
                os.path.join(
                    app.root_path,
                    "usuarios/" +
                    request.form["username"] +
                    "/data.dat"),
                encoding="utf-8").read()
            formDict = json.loads(formDict_data)

            if compare_digest(
                blake2b(
                    formDict["password"].encode("utf-8")).hexdigest(),
                blake2b(
                    (salt + request.form["password"]).encode("utf-8")).hexdigest()):
                session["user"] = request.form["username"]
                session["last_user"] = request.form["username"]
                session.modified = True
                return url_for("index")

            session["user"] = formDict
            session.modified = True

            return redirect(url_for("index"))

        else:
            # aqui se le puede pasar como argumento un mensaje de login
            # invalido
            return render_template(
                "login.html",
                title="Log In",
                categories=categories)

    else:
        # se puede guardar la pagina desde la que se invoca
        session["url_origen"] = request.referrer
        session.modified = True
        # print a error.log de Apache si se ejecuta bajo mod_wsgi
        print(request.referrer, file=sys.stderr)
        return render_template(
            "login.html",
            title="Log In",
            categories=categories)


@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.pop("user", None)
    session.pop("cart", None)
    return redirect(url_for("index"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if "username" in request.form:
        path = os.path.join(
            app.root_path,
            "usuarios/" +
            request.form["username"])

        if os.path.exists(path):
            return render_template(
                "register.html",
                title="Register",
                categories=categories)

        Path(path).mkdir(parents=True, exist_ok=True)

        with open(path + "/data.dat", "w") as userData:
            formDict = request.form.to_dict()

            formDict["points"] = random.randint(1, 500)
            formDict["money"] = round(random.uniform(100, 500), 2)
            formDict["password"] = blake2b(
                (salt + formDict["password"]).encode("utf-8")).hexdigest()

            json.dump(formDict, userData)
            userData.close()

        with open(path + "/history.json", "w") as userHistory:
            userHistory.close()

        session["user"] = formDict
        session["last_user"] = formDict["username"]
        session.modified = True

        return redirect(url_for("index"))

    else:
        return render_template(
            "register.html",
            title="Register",
            categories=categories)


@app.route("/history")
def history():
    path = os.path.join(
        app.root_path,
        "usuarios/" +
        session["user"]["username"])
    if os.path.exists(path + "/history.json"):
        historyDict_data = open(
            os.path.join(
                app.root_path,
                "usuarios/" +
                session["user"]["username"] +
                "/history.json"),
            encoding="utf-8").read()

        if historyDict_data != "":
            historyDict = json.loads(historyDict_data)

            history_orders = list()

            for date, products in historyDict.items():
                films = list()
                for film_id, quantity in products["films"].items():
                    films.append([id_films[int(film_id)], quantity])

                history_orders.append([date, films, products["total"]])

            return render_template(
                "history.html",
                title="History",
                money=session["user"]["money"],
                history=history_orders,
                categories=categories)

        else:
            return render_template(
                "history.html",
                title="History",
                money=session["user"]["money"],
                categories=categories)

    else:
        return render_template(
            "history.html",
            title="History",
            money=session["user"]["money"],
            categories=categories)


@app.route("/cart")
def cart():
    cart_films = list()

    if "cart" in session:
        for film_id, quantity in session["cart"].items():
            cart_films.append([id_films[film_id], quantity])

        return render_template(
            "cart.html",
            title="Cart",
            cart_films=cart_films,
            categories=categories)

    else:
        return render_template(
            "cart.html",
            title="Cart",
            categories=categories)


@app.route("/cart_add/<film_id>")
def cart_add(film_id):
    film_id = int(film_id)

    if "cart" not in session:
        session["cart"] = dict()

    if int(film_id) in session["cart"].keys():
        session["cart"][film_id] += 1
    else:
        session["cart"][film_id] = 1

    return redirect(url_for("cart"))


@app.route("/cart_remove/<film_id>")
def cart_remove(film_id):
    film_id = int(film_id)

    if "cart" in session:
        del session["cart"][film_id]

    return redirect(url_for("cart"))


@app.route("/cart_update/<film_id>/<quantity>")
def cart_increase(film_id, quantity):
    film_id = int(film_id)
    quantity = int(quantity)

    if "cart" in session:
        session["cart"][film_id] = quantity

    return redirect(url_for("cart"))


@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    if "total" in request.form:
        path = os.path.join(
            app.root_path,
            "usuarios/" +
            session["user"]["username"])
        if os.path.exists(path + "/data.dat"):
            formDict_data = open(
                os.path.join(
                    app.root_path,
                    "usuarios/" +
                    session["user"]["username"] +
                    "/data.dat"),
                encoding="utf-8").read()
            formDict = json.loads(formDict_data)

            points = int(formDict["points"]) - int(request.form["points"]
                                                   ) + round(float(request.form["total"]) * 0.05)
            if points < 0:
                return redirect(url_for("checkout"))

            money = float(formDict["money"]) - float(request.form["total"])
            if money < 0:
                return redirect(url_for("checkout"))

            with open(path + "/data.dat", "w") as userData:
                formDict["points"] = points
                session["user"]["points"] = points
                formDict["money"] = round(money, 2)
                session["user"]["money"] = round(money, 2)

                session.modified = True

                json.dump(formDict, userData)
                userData.close()

            historyDict_data = open(
                os.path.join(
                    app.root_path,
                    "usuarios/" +
                    session["user"]["username"] +
                    "/history.json"),
                encoding="utf-8").read()
            if historyDict_data != "":
                historyDict = json.loads(historyDict_data)
            else:
                historyDict = dict()

            with open(path + "/history.json", "w") as userHistory:
                productsDict = dict()
                productsDict["films"] = session["cart"]
                productsDict["total"] = request.form["total"]

                historyDict[datetime.now().strftime(
                    "%d/%m/%Y, %H:%M")] = productsDict

                session.pop("cart", None)

                json.dump(historyDict, userHistory)
                userHistory.close()

            return redirect(url_for("index"))

        else:
            return render_template(
                "checkout.html",
                title="Checkout",
                categories=categories)

    else:
        if "user" in session:
            if "cart" in session and bool(session["cart"]):
                return render_template(
                    "checkout.html",
                    title="Checkout",
                    points=session["user"]["points"],
                    cart_total=_cart_total(),
                    categories=categories)

            return redirect(url_for("cart"))
        else:
            return redirect(url_for("login"))


@app.route("/money_add", methods=["GET", "POST"])
def money_add():
    if "money" in request.form:
        path = os.path.join(
            app.root_path,
            "usuarios/" +
            session["user"]["username"])
        if os.path.exists(path + "/data.dat"):
            formDict_data = open(
                os.path.join(
                    app.root_path,
                    "usuarios/" +
                    session["user"]["username"] +
                    "/data.dat"),
                encoding="utf-8").read()
            formDict = json.loads(formDict_data)

            money = float(formDict["money"]) + float(request.form["money"])

            with open(path + "/data.dat", "w") as userData:
                formDict["money"] = round(money, 2)
                session["user"]["money"] = round(money, 2)

                session.modified = True

                json.dump(formDict, userData)
                userData.close()

            return redirect(url_for("history"))


@app.route("/concurrent_users", methods=["GET", "POST"])
def concurrent_users():
    concurrent_users = random.randint(1, 100)
    return str(concurrent_users)
