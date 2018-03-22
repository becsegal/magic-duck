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
  "How does it work now?",
  "How can you be sure?", 
  "*Nods thoughtfully*"
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
