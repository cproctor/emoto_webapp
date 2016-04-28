
var stream = getParameterByName('stream') || "demo"
var me = getParameterByName("me") || "chris"
var you = getParameterByName("you") || "zuz"
var myEmoto = ""
var yourEmoto = ""
var emotos = []

var ref = new Firebase("https://emoto.firebaseio.com/");
var refStream = ref.child("streams/" + stream)
var refEmotos = ref.child("emotos")
var refMyEmoto = ref.child("users/" + me + "/current_emoto")
var refYourEmoto = ref.child("users/" + you + "/current_emoto")

refMyEmoto.on("value", function(snapshot) {
    myEmoto = snapshot.val()
    d3.select('#emoto-status-mine')
        .style('background-image', 'url(' + myEmoto + ')')
})
refYourEmoto.on("value", function(snapshot) {
    yourEmoto = snapshot.val()
    d3.select('#emoto-status-yours')
        .style('background-image', 'url(' + yourEmoto + ')')
})

$('#send').click(function() {
    var text = $('input').val()
    console.log("text: " + text)
    if (text) {
        refStream.push({
            text: text, 
            username: me,
            emoto: myEmoto,
            timestamp: Firebase.ServerValue.TIMESTAMP
        })
        $('input').val("")
    }
})

// ---- RENDER -----
//
var render = function(stream) {
    console.log(stream)
    var messages = d3.select('#messages').selectAll('.message')
        .data(stream, function(d) { return d.timestamp })

    messages.enter()
        .append('div')
            .attr('class', function(d) {
                if (d.username == me) {
                    return "message my_message"
                }
                else {
                    return "message your_message"
                }
            })
            .style('background-image', function(d) {
                return "url(" + d.emoto + ")"
            })
            .append('div')
                .attr('class', 'text')
                .text(function(d) {
                    return d.text
                })

    messages.exit().remove()

    $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 200);
}

var renderEmotos = function(emotos) {
    d3.select('#emotos').selectAll('.emoto')
        .data(emotos)
        .enter()
            .append('div')
                .attr('class', 'emoto')
                .style('background-image', function(d) {
                    return "url(" + d + ")"
                })
                .on('click', function(d) {
                    refMyEmoto.set(d)
                    showMode("stream")
                })
}

refStream.on('value', function(snapshot) {
    var currStream = _.sortBy(_.values(snapshot.val()), "timestamp")
    render(currStream)
})

refEmotos.on('value', function(snapshot) {
    var currEmotos = _.values(snapshot.val())
    renderEmotos(currEmotos)
})

var showMode = function(mode) {
    if (mode == "stream") {
        $('#messages').show()
        $('#emotos').hide()
    } else if (mode == "emotos") {
        $('#messages').hide()
        $('#emotos').show()
    }
}

showMode("stream")
//showMode("emotos")

$('#emoto').click(function() {
    showMode('emotos')
})

// HELPERS

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
