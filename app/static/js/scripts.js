var fadeTime = 300;

/* --- Sidebar scripts ------------------------------------------------------------------------- */
$(document).ready(function() {
    $(".sidebarButtons").click(function() {
        showSubitems($(this));
    });
});

function showSubitems(dropdownButton) {
    var item = $(dropdownButton).parent();
    var subitems = item.children(".sidebarSubitems");

    if(subitems.css("display") == "none") {
        subitems.slideDown(fadeTime, function() {
            subitems.css("display","block");
        });
    }
    else {
        subitems.slideUp(fadeTime, function() {
            subitems.css("display","none");
        });
    }
}

/* --- Loggin & Register scripts --------------------------------------------------------------- */
$(document).ready(function() {
    $(".regWrapper").submit(function(event) {
        if (checkRegister($(this)) == false) {
            event.preventDefault();
        }
    });
});

$(document).ready(function() {
    $(".logWrapper").submit(function(event) {
        if (checkLogin($(this)) == false) {
            event.preventDefault();
        }
    });
});

$(document).ready(function() {
    $(".password").keyup(function () {
        updatePasswordStrength($(this));
    });
});

function updatePasswordStrength (passwordField) {
    var password = $(passwordField).val();
    console.log(password);
    var strength = calculatePasswordStrenght(password)

    if(strength == "Strong") {
        $(".logRegPasswordText").css("visibility","visible");
        $(".logRegPasswordStrenghtText").text("fuerte").css("color", "green");
        $(".logRegPasswordWeak").css("background", "gray");
        $(".logRegPasswordMedium").css("background", "gray");
        $(".logRegPasswordStrong").css("background", "green");
        return;
    }
    if(strength == "Medium") {
        $(".logRegPasswordText").css("visibility","visible");
        $(".logRegPasswordStrenghtText").text("media").css("color", "orange");
        $(".logRegPasswordWeak").css("background", "gray");
        $(".logRegPasswordMedium").css("background", "orange");
        $(".logRegPasswordStrong").css("background", "gray");
        return;
    }
    if(strength == "Weak") {
        $(".logRegPasswordText").css("visibility","visible");
        $(".logRegPasswordStrenghtText").text("débil").css("color", "red");
        $(".logRegPasswordWeak").css("background", "red");
        $(".logRegPasswordMedium").css("background", "gray");
        $(".logRegPasswordStrong").css("background", "gray");
        return;
    }
}

function calculatePasswordStrenght (password) {
    // Fuerte si cumple que tiene todo
    var strong = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
    // Medio si cumple que es menos 6 de largo, si le falta numero, si le falta caracter especial, si le falta minusc o si le falta mayusc
    var medium = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))|((?=.*[a-z])(?=.*[^A-Za-z0-9])(?=.*[0-9])(?=.{8,}))|((?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.*[0-9])(?=.{8,}))');

    if(strong.test(password)) {
        return "Strong";
    }
    else if(medium.test(password)) {
        return "Medium";
    }
    else {
        return "Weak";
    }
}

function checkLogin(form) {
    var user = $(form).children(".logRegUser").children(".logRegFields").val();
    var userError = $(form).children(".logRegUser").children(".logRegError");

    var password =  $(form).children(".logRegPassword").children(".logRegFields").val();
    var passwordError = $(form).children(".logRegPassword").children(".logRegError");

    retVal = checkUser(user, userError) && retVal;
    retVal = checkPassword(password, passwordError) && retVal;

    return retVal;
}

function checkRegister(form) {
    var user = $(form).children(".logRegUser").children(".logRegFields").val();
    var userError = $(form).children(".logRegUser").children(".logRegError");

    var mail = $(form).children(".logRegMail").children(".logRegFields").val();
    var mailError = $(form).children(".logRegMail").children(".logRegError");

    var password =  $(form).children(".logRegPassword").children(".logRegFields").val();
    var passwordError = $(form).children(".logRegPassword").children(".logRegError");

    var passwordCnf = $(form).children(".logRegPasswordCnf").children(".logRegFields").val();
    var passwordCnfError = $(form).children(".logRegPasswordCnf").children(".logRegError");

    var card = $(form).children(".logRegCard").children(".logRegFields").val();
    var cardError = $(form).children(".logRegCard").children(".logRegError");

    var address = $(form).children(".logRegAddress").children(".logRegFields").val();
    var addressError = $(form).children(".logRegAddress").children(".logRegError");

    var retVal = true;

    retVal = checkUser(user, userError) && retVal;
    retVal = checkMail(mail, mailError) && retVal;
    retVal = checkPassword(password, passwordError) && retVal;
    retVal = checkPasswordCnf(password, passwordCnf, passwordCnfError) && retVal;
    retVal = checkCard(card, cardError) && retVal;
    retVal = checkAddress(address, addressError) && retVal;

    console.log(retVal);

    return retVal;
}

function checkUser(user, userError) {
    var userPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})|(?=.*[a-z])(?=.*[0-9])(?=.{6,})|(?=.*[A-Z])(?=.*[0-9])(?=.{6,})|(?=.*[a-z])(?=.*[A-Z])(?=.{6,})|(?=.*[a-z])(?=.{6,})|(?=.*[A-Z])(?=.{6,})|(?=.*[0-9])(?=.{6,})');
    if(user == "" || userPattern.test(user) == false) {
        $(userError).animate({opacity: 1.0});
        return false;
    }

    $(userError).animate({opacity: 0});
    return true;
}

function checkMail(mail, mailError) {
    var mailPattern = new RegExp(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);

    if(mail == "" || mailPattern.test(mail) == false) {
        $(mailError).animate({opacity: 1.0});
        return false;
    }

    $(mailError).animate({opacity: 0});
    return true;
}

function checkPassword(password, passwordError) {
    if(password == "" || calculatePasswordStrenght(password) == "Weak") {
        $(passwordError).animate({opacity: 1.0});
        return false;
    }

    $(passwordError).animate({opacity: 0});
    return true;
}

function checkPasswordCnf(password, passwordCnf, passwordCnfError) {
    if(passwordCnf == "" || password != passwordCnf) {
        $(passwordCnfError).animate({opacity: 1.0});
        return false;
    }
}

function checkCard(card, cardError) {
    var cardPattern = new RegExp('(?=.*[0-9])(?=.{16})');
    if(card = "" || cardPattern.test(card) == false) {
        $(cardError).animate({opacity: 1.0});
        return false;
    }

    $(cardError).animate({opacity: 0});
    return true;
}

function checkAddress(address, addressError) {
    var addressPattern = new RegExp('(?=.{1,50})');
    if(address = "" || addressPattern.test(address) == false) {
        $(addressError).animate({opacity: 1.0});
        return false;
    }

    $(addressError).animate({opacity: 0});
    return true;
}

/* --- Shopping Cart scripts ------------------------------------------------------------------- */
$(document).ready(function() {
    $(".cartFilm").each(function() {
        updateCartFilmCalc($(this).children(".cartFilmQuantity"), true);
    });
    updateCartCalc(true);
});

$(document).ready(function() {
    $(".cartFilmQuantity").change(function() {
        updateCartFilmCalc(this, false);
    });
});

$(document).ready(function() {
    $(".cartButtons").click(function() {
        removeCartFilm(this);
    });
});

function updateCartCalc(init) {
    var filmTotalPrice = 0;

    $(".cartFilm").each(function() {
        filmTotalPrice += parseFloat($(this).children(".cartFilmPartialTotalPrice").text());
    });

    if(init == true) {
        $(".cartCalc").children(".cartFilmTotalPrice").text(filmTotalPrice.toFixed(2));
    }
    else {
        $(".cartCalc").children(".cartFilmTotalPrice").each(function() {
            $(this).fadeOut(fadeTime, function() {
                $(this).text(filmTotalPrice.toFixed(2));
                $(this).fadeIn(fadeTime);
            });
        });
    }
    $(".cartCalc").children(".cartFilmTotalPriceInput").val(filmTotalPrice.toFixed(2))
}

function updateCartFilmCalc(quantityInput, init) {
    var film = $(quantityInput).parent();
    var filmId = $(film).children(".cartFilmData").children(".cartFilmDataTitle").children(".cartFilmDataId").text();
    var filmPrice = parseFloat(film.children(".cartFilmPrice").text());
    var filmQuantity = $(quantityInput).val();
    var filmPartialTotalPrice = filmPrice * filmQuantity;

    if(init == true) {
        film.children(".cartFilmPartialTotalPrice").text(filmPartialTotalPrice.toFixed(2));
    }
    else {
        film.children(".cartFilmPartialTotalPrice").each( function() {
            $(this).fadeOut(fadeTime, function() {
                $(this).text(filmPartialTotalPrice.toFixed(2));
                updateCartCalc(false);
                $(this).fadeIn(fadeTime);
            });
        });

        $.get("cart_update/" + filmId + "/" + filmQuantity);
    }
}

function removeCartFilm(removeButton) {
    var film = $(removeButton).parent();
    var filmId = $(film).children(".cartFilmData").children(".cartFilmDataTitle").children(".cartFilmDataId").text();

    film.slideUp(fadeTime, function() {
        film.remove();
        updateCartCalc();
    });

    $.get("cart_remove/" + filmId);
}

/* --- Checkout Scripts ------------------------------------------------------------------------ */
$(document).ready(function() {
    updateCheckoutCalc($(".checkoutInputPoints"), true);
});

$(document).ready(function() {
    $(".checkoutInputPoints").change(function() {
        updateCheckoutCalc(this, false);
    })
});

function updateCheckoutCalc(updateField, init) {
    var checkout = $(updateField).parent().parent();
    var infoPoints = $(updateField).parent();

    var points = parseInt($(infoPoints).children(".checkoutPoints").text());
    var discountPoints = $(updateField).val();
    var discountPrice = discountPoints/100;

    var cart = parseFloat($(".checkoutCartTotal").text());

    var total = cart - discountPrice;
    var newPoints = Math.round(total * 0.05);

    if(init == false && points < discountPoints) {
        $(checkout).children(".checkoutError").text("No dispones de suficientes puntos").animate({opacity: 1.0});
        return;
    }

    if(init == false && total < 0) {
        $(checkout).children(".checkoutError").text("No puedes canjear tantos puntos").animate({opacity: 1.0});
        return;
    }

    $(checkout).children(".checkoutInfoCalc").children(".checkoutDiscount").text(discountPrice);
    $(checkout).children(".checkoutInfoCalc").children(".checkoutTotal").text(total.toFixed(2))
    $(checkout).children(".checkoutInfoCalc").children(".checkoutNewPoints").text(newPoints);
    $(checkout).children(".checkoutInfoCalc").children(".checkoutInputTotal").val(total.toFixed(2))
    console.log($(checkout).children(".checkoutInfoCalc").children(".checkoutInputTotal").val())
}

/* --- History Scripts ------------------------------------------------------------------------- */
$(document).ready(function() {
    $(".historyFilmData").each(function (){
        updateHistoryFilmCalc(this);
    });
});

$(document).ready(function() {
    $(".historyButton").click(function() {
        showDetails(this);
    })
});

$(document).ready(function() {
    $(".historyInputMoneyButton").click(function() {
        addMoney();
    })
});

function addMoney() {
    var moneyPattern = new RegExp('(?=.*[0-9])');
    var money = parseFloat($(".historyMoney").text());
    var inputMoney = parseInt($(".historyInputMoneyField").val());

    if(inputMoney == "") {
        return;
    }
    if(moneyPattern.test(money) == false) {
        return;
    }

    money += inputMoney;
    $(".historyMoney").each( function() {
        $(this).fadeOut(fadeTime, function() {
            $(this).text(money.toFixed(2));
            $(this).fadeIn(fadeTime);
        });
    });
    $(".historyInputMoneyField").val(0);

    $.post("money_add", {"money": inputMoney});
}

function showDetails(showButton) {
    var row = $(showButton).parent().parent();

    $(row).find(".historyFilmData").each(function (){
        if($(this).css("display") != "none") {
            $(this).hide();
            changeDisplay(row);
            return;
        }
        $(this).show();
        changeDisplay(row);
        return;
    });
}

function updateHistoryFilmCalc(filmData) {
    var price = parseFloat($(filmData).children(".historyFilmDetails").children(".historyFilmPrice").text());
    var quantity = parseInt($(filmData).children(".historyFilmDetails").children(".historyFilmQuantity").text());
    var total = price * quantity;

    $(filmData).children(".historyFilmDetails").children(".historyFilmTotal").text(total);
}

function changeDisplay(row) {
    var ret = true;
    $(row).find(".historyFilmData").each(function (){
        if($(this).css("display") != "none") {
            ret = false;
        }
    });

    if(ret == false) {
        $(row).find(".historyFilm").css({
            "display": "grid",
            "grid-template-columns": "1fr 9fr",
            "grid-gap": "20px",
            "margin-right": "10px"
        });
        return;
    }

    $(row).find(".historyFilm").css({
        "display": "inline-block",
        "margin-right": "10px"
    });
    return;
}

/* --- Footer Scripts -------------------------------------------------------------------------- */

$(document).ready(function worker(){
    $.ajaxSetup ({
        cache: false,
        complete: function() {
          setTimeout(worker, 3000);
        }
    });

    $.post("concurrent_users", function(users){
        $(".footerUsers").text(users);
    });
});
