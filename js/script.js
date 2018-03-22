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
  "Think bigger"
];

var app = new Vue({
  el: '#content',
  data: {
    prompt: "What's up? - Duck",
    overlayIsVisible: false
  },
  methods: {
    updatePrompt: function () {
      this.prompt = prompts[Math.floor(Math.random() * prompts.length)]
    },
    toggleOverlay: function () {
      this.overlayIsVisible = !this.overlayIsVisible;
    }
  }
});

var shakeDetector = new Shake({
  threshold: 15, // optional shake strength threshold
  timeout: 1000  // optional, determines the frequency of event generation
});
shakeDetector.start();
window.addEventListener('shake', shakeEventDidOccur, false);
function shakeEventDidOccur () {
  app.updatePrompt();
}
