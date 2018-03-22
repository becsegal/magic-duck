var prompts = [
  "But what if you didn't?",
  "What have you found so far?",
  "What have you tried already?",
  "What has happened in your previous attempts?",
  "Explain it again a different way",
  "List your assumptions",
  "Try working through it from a different direction",
  "Explain it like I'm 5",
  "What if you had half the time?",
  "Just stop. Try it.",
  "How have other people solved similar problems?",
  "How does it work now?"
];

var app = new Vue({
  el: '#content',
  data: {
    prompt: "What's up? - Duck",
    overlayIsHidden: true
  },
  methods: {
    updatePrompt: function () {
      this.prompt = prompts[Math.floor(Math.random() * prompts.length)]
    },
    toggleOverlay: function () {
      this.overlayIsHidden = !this.overlayIsHidden
    }
  }
});

var shakeDetector = new Shake({
  threshold: 15, // optional shake strength threshold
  timeout: 1000  // optional, determines the frequency of event generation
});
shakeDetector.start();

