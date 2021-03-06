/*global d3 $ */

d3.select(".send").style("display", "none");

//SCOREBOARD
var alphabet = [],
    values = {},
    suggestions = true;
    
document.getElementById("sentence").contentEditable='true';
    
for (var a = 65; a < 91; a += 1) {
    alphabet.push(String.fromCharCode(a));
    values[String.fromCharCode(a)] = 0;
}    

d3.select("#letters").selectAll(".letter")
    .data(alphabet)
    .enter()
    .append("td")
    .attr("class", "letter")
    .html(function(d) {
        return d; 
    });

d3.select("#counts").selectAll(".count")
    .data(d3.entries(values))
    .enter()
    .append("td")
    .attr("class", function(d) {
        return "count none";
    })
    .html(0);

var allowed = [8, 32, 37, 38, 39, 40];

d3.select("#sentence").on("keydown", function(e) { 
    //console.log(d3.event.keyCode);
    if (allowed.indexOf(d3.event.keyCode) == -1 && (d3.event.keyCode < 65 || d3.event.keyCode > 90)) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
    }
});

//there's an invisible input field (#sentence) over the one (#display) that has HTML markup for strikethroughs
d3.select("#sentence").on("keyup", function(e) {
    var message = d3.select("#sentence").text();

    //update scoreboard
    alphabet.forEach(function(d) {
        values[d] = 0; 
    });

    message.toUpperCase().split("").forEach(function(d) {
        values[d] += 1;
    });

    var badwords = false,
        score = 0,
        missing = [];

    d3.select("#counts").selectAll(".count")
        .data(d3.entries(values))
        .html(function(d) {
            if (!d.value) {
                missing.push(d.key);
            } else if (score !== -1) {
                score += d.value;
            }
            return d.value;
        })
        .attr("class", function(d) {
            if (d.value === 0) {
                return "count none";
            } else if (d.value === 1) {
                return "count one";
            } else if (d.value < 5) {
                return "count some";
            }
            return "count many";
        });

    var pos = getCaretPosition(document.getElementById("sentence"));

    document.getElementById("sentence").innerHTML = message;
    
    // tokenize
    message = message.split(/\s+/);
    
    var html = "",
        current_pos = 0;        
        
    message.forEach(function(d) {
        // skip if the cursor is on this word
        if (!d || d === "" || d === " ") return;
        if (pos >= current_pos && pos <= (current_pos + d.length)) {
            html += "<span class='maybeword'>" + d + "</span> ";
            if (!isWord(d.toLowerCase(), dict)) {
                badwords = true;
            }
        } else {
            if (isWord(d.toLowerCase(), dict)) {
                html += "<span class='aword'>" + d + "</span> ";
            } else {
                badwords = true;
                html += "<span class='notword'>" + d + "</span> ";
            }
        }
        current_pos += d.length + 1;
    });
    d3.select("#display").html(html);
    
    // get suggestions         
    if (!suggestions) {
        return;
    }
    var remains = d3.entries(values).filter(function(d) {
        return d.value === 0;
    }).map(function(d) {
        return d.key;
    });

    console.log(missing);

    if (missing.length > 0) {
        d3.select(".send").style("display", "none");
        d3.select("#myscore").html("Unused: " + missing.join(""));
    } else if (badwords) {
        d3.select(".send").style("display", "none");
        d3.select("#myscore").html("Invalid word in sentence");
    } else {
        d3.select(".send").style("display", "inline-block");
        d3.select("#myscore").html(score);
        d3.select(".send").html('<a href="https://twitter.com/share" class="twitter-share-button" id="tweet" data-text="' + (d3.select("#sentence").text() + " #a2z") + '" data-lang="en" data-url="http://mech.sc/18WFtjP">Tweet</a>');
        twttr.widgets.load()        
    }
});