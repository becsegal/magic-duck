var prompts = [
    "But what if you didn't?",
    "What have you found so far?",
    "What have you tried already?",
    "Explain it again a different way",
    "List your assumptions",
    "Try working through it in reverse",
    "Explain it like I'm 5",
    "What if you had half the time?",
    "Just stop. Try it.",
    "How have people solved similar problems?",
    "Are you sure about that?",
    "*Nods thoughtfully*",
    "What is happening now?",
    "What should be happening?",
    "Describe the problem in 1 sentence",
    "What are some more options?",
    "Go on...",
    "A 20 minute walk could clear your head",
    "That sounds difficult",
    "I believe in you",
    "What does Google say on the subject?",
    "What's the use case?",
    "What are you leaning toward?",
    "Is this a priority?",
    "Tackle something else for a while and let this one simmer",
    "What would the smartest person you know do?",
    "What would your boss want you to do?",
    "Are you hungry? Maybe get a snack",
    "Think bigger",
    "..."
];

function updatePrompt() {
    $("#prompt").text( prompts[Math.floor(Math.random() * prompts.length)]);
}

$( document ).ready(function() {
    updatePrompt();
});

$("#duck").on( "click", function() {
    updatePrompt();
    $("#wtf").hide();
});

$("#footer").on( "click", function() {
    $("#wtf").toggle();
});