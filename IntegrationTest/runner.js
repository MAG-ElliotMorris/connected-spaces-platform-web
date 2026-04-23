import createModule from "./test_module.js";

let finished = false;
let M = null;

function isExitStatus(x) {
  return !!x && (x.name === "ExitStatus" || x.constructor?.name === "ExitStatus");
}

function finish(code, msg) {
  if (finished) return;
  finished = true;

  if (msg) (code === 0 ? console.log : console.error)(msg);

  if (M && typeof M._exit === "function") {
    M._exit(code);
  }
}

window.addEventListener("unhandledrejection", (ev) => {
  const r = ev.reason;
  if (isExitStatus(r)) {
    ev.preventDefault?.();
    return;
  }
  finish(1, "Unhandled rejection: " + String(r));
});

window.addEventListener("error", (ev) => {
  if (isExitStatus(ev.error)) return;
  finish(1, "Uncaught error: " + (ev.message || ev.error));
});

function runTest() {
  if (typeof M.GetVersion === "undefined") {
    finish(1, "GetVersion not exported");
    return;
  }

  if (typeof M.GetVersion !== "function") {
    finish(1, "GetVersion is not a function");
    return;
  }

  const result = M.GetVersion();

  if (typeof result !== "string" || result.length === 0) {
    finish(1, "GetVersion returned invalid value: " + String(result));
    return;
  }

  console.log("GetVersion returned:", result);
  finish(0, "PASS");
}

try {
  M = await createModule();
  console.log("module created");
  runTest();
} catch (e) {
  finish(1, String(e));
}