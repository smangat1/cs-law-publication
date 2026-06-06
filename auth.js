const HB_AUTH_STORAGE_KEY = "hb_account_session_v1";
const HB_AUTH_SITE_ROOT_URL = new URL(".", new URL(document.currentScript.src, window.location.href));
const HB_AUTH_ACCOUNTS = [
  {
    email: "editor@hb.local",
    password: "editor-demo",
    name: "HB Editor",
    role: "editor"
  },
  {
    email: "reader@hb.local",
    password: "reader-demo",
    name: "HB Reader",
    role: "reader"
  }
];

function hbAuthLoadSession() {
  try {
    const raw = localStorage.getItem(HB_AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function hbAuthSaveSession(session) {
  localStorage.setItem(HB_AUTH_STORAGE_KEY, JSON.stringify(session));
}

function hbAuthClearSession() {
  localStorage.removeItem(HB_AUTH_STORAGE_KEY);
}

function hbAuthCanAccessStudio(session = hbAuthLoadSession()) {
  return Boolean(session && (session.role === "editor" || session.role === "admin"));
}

function hbAuthInjectStyles() {
  if (document.getElementById("hb-auth-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "hb-auth-styles";
  style.textContent = `
    .account-shell {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .account-button {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: 1px solid rgba(22, 22, 22, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.68);
      color: inherit;
      padding: 0.55rem 0.8rem;
      font: inherit;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .account-button__badge {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #18a46b;
    }

    .account-dropdown {
      position: absolute;
      top: calc(100% + 0.55rem);
      right: 0;
      min-width: 220px;
      display: grid;
      gap: 0.6rem;
      padding: 0.9rem;
      border: 1px solid rgba(22, 22, 22, 0.12);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 24px 70px rgba(22, 22, 22, 0.16);
      backdrop-filter: blur(16px);
    }

    .account-dropdown[hidden] {
      display: none;
    }

    .account-dropdown__meta {
      display: grid;
      gap: 0.18rem;
    }

    .account-dropdown__meta strong {
      font-size: 0.98rem;
    }

    .account-dropdown__meta small {
      color: rgba(22, 22, 22, 0.63);
      font-size: 0.8rem;
    }

    .account-dropdown__link,
    .account-dropdown__action {
      color: inherit;
      text-decoration: none;
      border: 0;
      background: rgba(22, 22, 22, 0.05);
      border-radius: 0.8rem;
      padding: 0.7rem 0.8rem;
      text-align: left;
      font: inherit;
      cursor: pointer;
    }

    .account-dropdown__action--danger {
      color: #7d1f1f;
      background: rgba(125, 31, 31, 0.08);
    }

    .auth-backdrop {
      position: fixed;
      inset: 0;
      z-index: 90;
      background: rgba(22, 22, 22, 0.22);
      backdrop-filter: blur(8px);
    }

    .auth-backdrop[hidden] {
      display: none;
    }

    .auth-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 91;
      width: min(460px, calc(100vw - 2rem));
      transform: translate(-50%, -50%);
      display: grid;
      gap: 1rem;
      padding: 1.35rem;
      border: 1px solid rgba(22, 22, 22, 0.1);
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.97);
      box-shadow: 0 28px 90px rgba(22, 22, 22, 0.18);
    }

    .auth-dialog[hidden] {
      display: none;
    }

    .auth-dialog__head {
      display: grid;
      gap: 0.45rem;
    }

    .auth-dialog__head h2 {
      margin: 0;
      font-family: "Cormorant Garamond", serif;
      font-size: 2.3rem;
      line-height: 0.95;
    }

    .auth-dialog__head p,
    .auth-dialog__hint,
    .auth-dialog__error {
      margin: 0;
      color: rgba(22, 22, 22, 0.68);
    }

    .auth-dialog__error {
      color: #7d1f1f;
    }

    .auth-form {
      display: grid;
      gap: 0.85rem;
    }

    .auth-form label {
      display: grid;
      gap: 0.4rem;
      font-size: 0.92rem;
    }

    .auth-form input {
      width: 100%;
      padding: 0.85rem 0.95rem;
      border: 1px solid rgba(22, 22, 22, 0.12);
      border-radius: 0.8rem;
      background: rgba(244, 240, 232, 0.62);
      font: inherit;
    }

    .auth-form__actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .auth-button {
      border: 0;
      border-radius: 0.85rem;
      background: #3467eb;
      color: white;
      padding: 0.85rem 1rem;
      font: inherit;
      cursor: pointer;
    }

    .auth-button--ghost {
      background: rgba(22, 22, 22, 0.08);
      color: inherit;
    }

    .studio-access-gate {
      width: min(720px, calc(100vw - 2rem));
      margin: 5rem auto;
      display: grid;
      gap: 1.1rem;
      padding: 1.6rem;
      border: 1px solid rgba(22, 22, 22, 0.1);
      border-radius: 1.4rem;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 24px 80px rgba(22, 22, 22, 0.12);
    }

    .studio-access-gate h1 {
      margin: 0;
      font-family: "Cormorant Garamond", serif;
      font-size: clamp(2.8rem, 5vw, 4.6rem);
      line-height: 0.94;
      letter-spacing: -0.05em;
    }

    .studio-access-gate p {
      margin: 0;
      color: rgba(22, 22, 22, 0.66);
      font-size: 1rem;
      line-height: 1.72;
    }

    .studio-access-gate__actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `;

  document.head.appendChild(style);
}

function hbAuthEnsureModal() {
  if (document.getElementById("hb-auth-backdrop")) {
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.id = "hb-auth-backdrop";
  backdrop.className = "auth-backdrop";
  backdrop.hidden = true;

  const dialog = document.createElement("div");
  dialog.id = "hb-auth-dialog";
  dialog.className = "auth-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="auth-dialog__head">
      <p class="eyebrow">Account</p>
      <h2>Sign in to the HB desk.</h2>
      <p>Only editor accounts can open Studio. Reader accounts can sign in, but they won't see the editor link.</p>
    </div>
    <form class="auth-form" id="hb-auth-form">
      <label>
        Email
        <input id="hb-auth-email" type="email" placeholder="editor@hb.local" required>
      </label>
      <label>
        Password
        <input id="hb-auth-password" type="password" placeholder="editor-demo" required>
      </label>
      <p class="auth-dialog__hint">Demo accounts: editor@hb.local / editor-demo and reader@hb.local / reader-demo.</p>
      <p class="auth-dialog__error" id="hb-auth-error" hidden>That account was not recognized.</p>
      <div class="auth-form__actions">
        <button class="auth-button auth-button--ghost" type="button" id="hb-auth-cancel">Cancel</button>
        <button class="auth-button" type="submit">Sign in</button>
      </div>
    </form>
  `;

  document.body.append(backdrop, dialog);

  const hide = () => {
    backdrop.hidden = true;
    dialog.hidden = true;
  };

  backdrop.addEventListener("click", hide);
  dialog.querySelector("#hb-auth-cancel").addEventListener("click", hide);

  dialog.querySelector("#hb-auth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = dialog.querySelector("#hb-auth-email").value.trim().toLowerCase();
    const password = dialog.querySelector("#hb-auth-password").value;
    const error = dialog.querySelector("#hb-auth-error");
    const account = HB_AUTH_ACCOUNTS.find((entry) => entry.email === email && entry.password === password);

    if (!account) {
      error.hidden = false;
      return;
    }

    error.hidden = true;
    hbAuthSaveSession({
      email: account.email,
      name: account.name,
      role: account.role
    });
    hide();
    window.location.reload();
  });

  window.HBAuth = window.HBAuth || {};
  window.HBAuth.openDialog = () => {
    backdrop.hidden = false;
    dialog.hidden = false;
    dialog.querySelector("#hb-auth-email").focus();
  };
}

function hbAuthCreateAccountShell(session, studioHref) {
  const shell = document.createElement("div");
  shell.className = "account-shell";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "account-button";
  button.innerHTML = session
    ? `<span class="account-button__badge" aria-hidden="true"></span><span>${session.name}</span>`
    : `<span>Account</span>`;

  const dropdown = document.createElement("div");
  dropdown.className = "account-dropdown";
  dropdown.hidden = true;

  if (session) {
    dropdown.innerHTML = `
      <div class="account-dropdown__meta">
        <strong>${session.name}</strong>
        <small>${session.email} / ${session.role}</small>
      </div>
    `;

    if (hbAuthCanAccessStudio(session)) {
      const studioLink = document.createElement("a");
      studioLink.className = "account-dropdown__link";
      studioLink.href = studioHref;
      studioLink.textContent = "Open Studio";
      dropdown.appendChild(studioLink);
    } else {
      const note = document.createElement("div");
      note.className = "account-dropdown__meta";
      note.innerHTML = `<small>This account can browse the publication, but Studio is limited to editor access.</small>`;
      dropdown.appendChild(note);
    }

    const signOut = document.createElement("button");
    signOut.type = "button";
    signOut.className = "account-dropdown__action account-dropdown__action--danger";
    signOut.textContent = "Sign out";
    signOut.addEventListener("click", () => {
      hbAuthClearSession();
      window.location.reload();
    });
    dropdown.appendChild(signOut);
  } else {
    const signIn = document.createElement("button");
    signIn.type = "button";
    signIn.className = "account-dropdown__action";
    signIn.textContent = "Sign in";
    signIn.addEventListener("click", () => {
      dropdown.hidden = true;
      window.HBAuth.openDialog();
    });
    dropdown.appendChild(signIn);
  }

  button.addEventListener("click", () => {
    dropdown.hidden = !dropdown.hidden;
  });

  document.addEventListener("click", (event) => {
    if (!shell.contains(event.target)) {
      dropdown.hidden = true;
    }
  });

  shell.append(button, dropdown);
  return shell;
}

function hbAuthMountNavigation() {
  const session = hbAuthLoadSession();
  const studioHref = new URL("editor.html", HB_AUTH_SITE_ROOT_URL).href;
  const selectors = [".site-nav", ".masthead-links", ".studio-appbar-right"];

  selectors.forEach((selector) => {
    const nav = document.querySelector(selector);

    if (!nav) {
      return;
    }

    const studioLink = nav.querySelector('a[href$="editor.html"], a[href="../editor.html"]');
    const shell = hbAuthCreateAccountShell(session, studioHref);

    if (studioLink) {
      studioLink.replaceWith(shell);
      return;
    }

    nav.prepend(shell);
  });
}

function hbAuthRenderStudioGate() {
  const main = document.querySelector(".studio-app");

  if (!main || hbAuthCanAccessStudio()) {
    return false;
  }

  const session = hbAuthLoadSession();
  main.innerHTML = `
    <div class="studio-access-gate">
      <p class="eyebrow">Studio Access</p>
      <h1>Studio is limited to editor accounts.</h1>
      <p>${session
        ? `You are signed in as ${session.name} (${session.role}). This account cannot open the editor.`
        : "Sign in with an editor account to draft, publish, and manage pieces."}</p>
      <div class="studio-access-gate__actions">
        <button class="auth-button" type="button" id="studio-gate-signin">${session ? "Switch account" : "Sign in"}</button>
        <a class="auth-button auth-button--ghost" href="index.html">Return to site</a>
      </div>
    </div>
  `;

  main.querySelector("#studio-gate-signin").addEventListener("click", () => {
    hbAuthClearSession();
    window.HBAuth.openDialog();
  });

  return true;
}

hbAuthInjectStyles();
hbAuthEnsureModal();
hbAuthMountNavigation();

window.HBAuth = {
  ...(window.HBAuth || {}),
  canAccessStudio: hbAuthCanAccessStudio,
  current: hbAuthLoadSession(),
  openDialog: window.HBAuth?.openDialog,
  renderStudioGate: hbAuthRenderStudioGate
};
