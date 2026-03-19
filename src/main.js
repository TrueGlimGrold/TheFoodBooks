import "./style.css";
import { getSupabaseClient } from "./supabase/client.js";
import { testSupabase } from "./supabase/testSupabase.js";

const app = document.querySelector("#app");
const supabase = getSupabaseClient();

app.innerHTML = `
  <main class="container">
    <header class="header">
      <h1>The Food Books</h1>
      <p class="muted">Ingredients (admin-managed) backed by Supabase (SQL).</p>
    </header>

    <section class="card">
      <h2>Static Hosting</h2>
      <p id="version">Version: loading…</p>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Ingredients</h2>
          <p class="muted">Read is public; writes require admin sign-in (RLS).</p>
        </div>
        <div class="row">
          <button id="btn-new" type="button">New ingredient</button>
          <button id="btn-refresh" type="button" class="btn-secondary">Refresh</button>
          <span id="ingredients-status" class="pill">Status: idle</span>
        </div>
      </div>

      <div id="ingredients-grid" class="grid" aria-live="polite"></div>
      <pre id="ingredients-output" class="output" aria-live="polite"></pre>
    </section>

    <section class="card">
      <h2>Admin</h2>
      <p class="muted">Uses Supabase Auth. Create the user in Supabase, then add their UID to <code>public.admins</code>.</p>
      <div class="inputs">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="admin@email.com" autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <div class="row">
          <button id="btn-sign-in" type="button">Sign in</button>
          <button id="btn-sign-out" type="button" class="btn-secondary">Sign out</button>
          <span id="auth-status" class="pill">Auth: unknown</span>
        </div>
      </div>
      <pre id="auth-output" class="output" aria-live="polite"></pre>
    </section>

    <footer class="footer muted">
      <span>Next: Recipes, Meal Prep, Inventory.</span>
    </footer>
  </main>
`;

async function loadVersion() {
  const el = document.querySelector("#version");
  try {
    const res = await fetch("/version.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`version.json HTTP ${res.status}`);
    const data = await res.json();
    el.textContent = `Version: ${data.commit ?? "unknown"} (${data.builtAt ?? "unknown"})`;
  } catch (err) {
    el.textContent = `Version: unavailable (${err.message})`;
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function numberOrZero(raw) {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function setIngredientsStatus(text) {
  document.querySelector("#ingredients-status").textContent = `Status: ${text}`;
}

function setIngredientsOutput(text) {
  document.querySelector("#ingredients-output").textContent = text;
}

function setAuthStatus(text) {
  document.querySelector("#auth-status").textContent = `Auth: ${text}`;
}

function setAuthOutput(text) {
  document.querySelector("#auth-output").textContent = text;
}

function promptIngredient(existing) {
  const name = prompt("Name", existing?.name ?? "");
  if (name === null) return null;
  const unit = prompt("Unit (e.g., 100g, tbsp)", existing?.unit ?? "g");
  if (unit === null) return null;
  const pricePerUnit = prompt("Price per unit", String(existing?.price_per_unit ?? 0));
  if (pricePerUnit === null) return null;

  const calories = prompt("Calories", String(existing?.calories ?? 0));
  if (calories === null) return null;
  const proteinG = prompt("Protein (g)", String(existing?.protein_g ?? 0));
  if (proteinG === null) return null;
  const carbsG = prompt("Carbs (g)", String(existing?.carbs_g ?? 0));
  if (carbsG === null) return null;
  const fatG = prompt("Fat (g)", String(existing?.fat_g ?? 0));
  if (fatG === null) return null;

  return {
    name: name.trim(),
    unit: unit.trim() || "g",
    price_per_unit: numberOrZero(pricePerUnit),
    calories: numberOrZero(calories),
    protein_g: numberOrZero(proteinG),
    carbs_g: numberOrZero(carbsG),
    fat_g: numberOrZero(fatG)
  };
}

function renderIngredients(items) {
  const grid = document.querySelector("#ingredients-grid");
  if (!items?.length) {
    grid.innerHTML = `<div class="ingredient"><div class="muted">No ingredients yet.</div></div>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (i) => `
        <article class="ingredient" data-id="${i.id}">
          <div class="ingredient-title">
            <h3>${escapeHtml(i.name ?? "")}</h3>
            <span class="ingredient-meta">${escapeHtml(i.unit ?? "")}</span>
          </div>
          <div class="ingredient-meta">
            Price: ${formatMoney(i.price_per_unit)} / ${escapeHtml(i.unit ?? "")}
          </div>
          <div class="ingredient-meta">
            Calories: ${formatNumber(i.calories)} | P: ${formatNumber(i.protein_g)}g | C: ${formatNumber(
        i.carbs_g
      )}g | F: ${formatNumber(i.fat_g)}g
          </div>
          <div class="ingredient-actions">
            <button type="button" class="btn-secondary" data-action="edit">Edit</button>
            <button type="button" class="btn-danger" data-action="delete">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

async function refreshIngredients() {
  setIngredientsStatus("loading");
  setIngredientsOutput("");
  try {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, name, unit, price_per_unit, calories, protein_g, carbs_g, fat_g, created_at")
      .order("name", { ascending: true });

    if (error) throw error;
    renderIngredients(data ?? []);
    setIngredientsStatus(`ok (${data?.length ?? 0})`);
  } catch (err) {
    setIngredientsStatus("error");
    setIngredientsOutput(err?.message ? `${err.message}\n${err?.details ?? ""}` : err?.stack || String(err));
  }
}

async function runSupabaseSmokeTest() {
  try {
    const result = await testSupabase();
    setIngredientsOutput(`Supabase smoke-test ok:\n${JSON.stringify(result, null, 2)}\n\n`);
  } catch (err) {
    setIngredientsOutput(`Supabase smoke-test failed:\n${err?.stack || String(err)}\n\n`);
  }
}

document.querySelector("#btn-refresh").addEventListener("click", async () => {
  await refreshIngredients();
});

document.querySelector("#btn-new").addEventListener("click", async () => {
  const draft = promptIngredient(null);
  if (!draft) return;
  if (!draft.name) {
    setIngredientsOutput("Name is required.");
    return;
  }

  setIngredientsStatus("creating");
  try {
    const { error } = await supabase.from("ingredients").insert(draft);
    if (error) throw error;
    setIngredientsStatus("created");
    await refreshIngredients();
  } catch (err) {
    setIngredientsStatus("error");
    setIngredientsOutput(err?.message ? `${err.message}\n${err?.details ?? ""}` : err?.stack || String(err));
  }
});

document.querySelector("#ingredients-grid").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const card = e.target.closest("[data-id]");
  const id = card?.getAttribute("data-id");
  if (!id) return;

  const action = btn.getAttribute("data-action");
  if (action === "edit") {
    setIngredientsStatus("loading");
    try {
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name, unit, price_per_unit, calories, protein_g, carbs_g, fat_g")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;

      const draft = promptIngredient(data);
      if (!draft) {
        setIngredientsStatus("idle");
        return;
      }
      if (!draft.name) {
        setIngredientsStatus("error");
        setIngredientsOutput("Name is required.");
        return;
      }

      setIngredientsStatus("updating");
      const { error: updateError } = await supabase.from("ingredients").update(draft).eq("id", id);
      if (updateError) throw updateError;

      setIngredientsStatus("updated");
      await refreshIngredients();
    } catch (err) {
      setIngredientsStatus("error");
      setIngredientsOutput(err?.message ? `${err.message}\n${err?.details ?? ""}` : err?.stack || String(err));
    }
  }

  if (action === "delete") {
    const ok = confirm("Delete this ingredient?");
    if (!ok) return;

    setIngredientsStatus("deleting");
    try {
      const { error } = await supabase.from("ingredients").delete().eq("id", id);
      if (error) throw error;
      setIngredientsStatus("deleted");
      await refreshIngredients();
    } catch (err) {
      setIngredientsStatus("error");
      setIngredientsOutput(err?.message ? `${err.message}\n${err?.details ?? ""}` : err?.stack || String(err));
    }
  }
});

async function refreshAuthStatus() {
  const { data } = await supabase.auth.getSession();
  const email = data?.session?.user?.email;
  setAuthStatus(email ? `signed in (${email})` : "signed out");
}

document.querySelector("#btn-sign-in").addEventListener("click", async () => {
  setAuthOutput("");
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  if (!email || !password) {
    setAuthOutput("Email and password are required.");
    return;
  }

  setAuthStatus("signing in...");
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshAuthStatus();
    setAuthOutput("Signed in.");
  } catch (err) {
    setAuthStatus("error");
    setAuthOutput(err?.message ?? String(err));
  }
});

document.querySelector("#btn-sign-out").addEventListener("click", async () => {
  setAuthOutput("");
  setAuthStatus("signing out...");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await refreshAuthStatus();
    setAuthOutput("Signed out.");
  } catch (err) {
    setAuthStatus("error");
    setAuthOutput(err?.message ?? String(err));
  }
});

supabase.auth.onAuthStateChange(async () => {
  await refreshAuthStatus();
});

loadVersion();
refreshAuthStatus();
runSupabaseSmokeTest();
refreshIngredients();

