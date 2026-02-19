const M = globalThis.Module;

// When exiting (even with 0 exit code) this can sometimes manifest as an error.
// This boolean blocks any additional calls to exit.
let finished = false;

function isExitStatus(x) {
  // Chic if our event if from our _exit calls
  return !!x && (x.name === "ExitStatus" || x.constructor?.name === "ExitStatus");
}

function finish(code, msg) {
  if (finished) return;
  finished = true;

  if (msg) (code === 0 ? console.log : console.error)(msg);

  M._exit(code);
}

// Fail if there any promise errors
window.addEventListener("unhandledrejection", (ev) => {
  const r = ev.reason;
  if (isExitStatus(r)) {
    // This is normal termination; don't fail the test.
    ev.preventDefault?.();
    return;
  }
  finish(1, "Unhandled rejection: " + String(r));
});

// Fail if there are any window errors
window.addEventListener("error", (ev) => {
  if (isExitStatus(ev.error)) return;
  finish(1, "Uncaught error: " + (ev.message || ev.error));
});

function RunTest() {
  // Ensure our function is exported
  if (typeof M.HelloWorld === "undefined") {
    finish(1, String("HelloWorld not exported"));
    return;
  }

  // Ensure our function is the correct type
  if (typeof M.HelloWorld !== "function") {
    finish(1, String("HelloWorld is not a function"));
    return;
  }

  const result = M.HelloWorld();

  // Ensure our function returns the correct data.
  if (result !== "Hello World!") {
    finish(1, String("HelloWorld Invalid return: " + result));
    return;
  }

  finish(0, "PASS");
}

M.onRuntimeInitialized = async () => {
  try {
    RunTest();

  } catch (e) {
    finish(1, String(e));
  }
};