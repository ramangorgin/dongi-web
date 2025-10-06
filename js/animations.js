function showStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= steps.length) return;

  const currentStepEl = document.querySelector('.step.active');
  const nextStepEl = steps[stepIndex];

  if (currentStepEl === nextStepEl) return; // already active

  // Fade out current step
  if (currentStepEl) {
    currentStepEl.classList.remove('active');
    currentStepEl.classList.add('fade-out');
  }

  // Wait a short delay, then show the next step
  setTimeout(() => {
    steps.forEach(step => {
      step.classList.remove('active', 'fade-out');
    });

    nextStepEl.classList.add('active');
    appState.currentStep = stepIndex;
    updateProgressBar(stepIndex > 0 ? stepIndex - 1 : 0);
    handleStepDisplay(stepIndex);
  }, 400);
}
