function t() {
    Typer.addText({
        keyCode: 123748
    }),
    Typer.index > Typer.text.length && clearInterval(timer)
}
var timer, Typer = {
    text: null,
    accessCountimer: null,
    index: 0,
    speed: 2,
    file: "",
    accessCount: 0,
    deniedCount: 0,
    init: function() {
        accessCountimer = setInterval(function() {
            Typer.updLstChr()
        },
        500),
        $.get(Typer.file,
        function(a) {
            Typer.text = a,
            Typer.text = Typer.text.slice(0, Typer.text.length - 1)
        })
    },
    content: function() {
        return $("#console").html()
    },
    write: function(a) {
        return $("#console").append(a),
        !1
    },
    makeAccess: function() {
        Typer.hidepop(),
        Typer.accessCount = 0;
        var a = $("<div id='gran'>").html("");
        return a.addClass("accessGranted"),
        a.html("<h1>ACCESS GRANTED</h1>"),
        $(document.body).prepend(a),
        !1
    },
    makeDenied: function() {
        Typer.hidepop(),
        Typer.deniedCount = 0;
        var a = $("<div id='deni'>").html("");
        return a.addClass("accessDenied"),
        a.html("<h1>ACCESS DENIED</h1>"),
        $(document.body).prepend(a),
        !1
    },
    hidepop: function() {
        $("#deni").remove(),
        $("#gran").remove()
    },
    addText: function(a) {
        var b, c, d;
        18 == a.keyCode ? (Typer.accessCount++, Typer.accessCount >= 3 && Typer.makeAccess()) : 20 == a.keyCode ? (Typer.deniedCount++, Typer.deniedCount >= 3 && Typer.makeDenied()) : 27 == a.keyCode ? Typer.hidepop() : Typer.text && (b = Typer.content(), "|" == b.substring(b.length - 1, b.length) && $("#console").html($("#console").html().substring(0, b.length - 1)), 8 != a.keyCode ? Typer.index += Typer.speed: Typer.index > 0 && (Typer.index -= Typer.speed), c = Typer.text.substring(0, Typer.index), d = new RegExp("\n", "g"), $("#console").html(c.replace(d, "<br/>")), window.scrollBy(0, 50)),
        a.preventDefault && 122 != a.keyCode && a.preventDefault(),
        122 != a.keyCode && (a.returnValue = !1)
    },
    updLstChr: function() {
        var a = this.content();
        "|" == a.substring(a.length - 1, a.length) ? $("#console").html($("#console").html().substring(0, a.length - 1)) : this.write("|")
    }
};
Typer.speed = 4,
Typer.file = "resume",
Typer.init(),
timer = setInterval("t();", 30);
