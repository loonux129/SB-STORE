const EMPTY_DATA = { suppliers: [], transactions: [], invoices: [] };

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function ownerEmail(context) {
  // The Pages middleware validates the Cloudflare Access JWT first.
  const email = context.data?.cloudflareAccess?.JWT?.payload?.email;
  return typeof email === "string" && email.length <= 320 ? email.toLowerCase() : null;
}

export async function onRequestGet(context) {
  const email = ownerEmail(context);
  if (!email) return json({ error: "Accès non autorisé." }, 401);

  const row = await context.env.DB.prepare(
    "SELECT payload FROM app_data WHERE owner_email = ?",
  ).bind(email).first();

  if (!row) return json(EMPTY_DATA);
  try {
    return json(JSON.parse(row.payload));
  } catch {
    return json({ error: "Données enregistrées invalides." }, 500);
  }
}

export async function onRequestPut(context) {
  const email = ownerEmail(context);
  if (!email) return json({ error: "Accès non autorisé." }, 401);

  let data;
  try {
    data = await context.request.json();
  } catch {
    return json({ error: "Corps JSON invalide." }, 400);
  }

  if (
    !data ||
    !Array.isArray(data.suppliers) ||
    !Array.isArray(data.transactions) ||
    !Array.isArray(data.invoices)
  ) {
    return json({ error: "Format de données invalide." }, 400);
  }

  const payload = JSON.stringify({
    suppliers: data.suppliers,
    transactions: data.transactions,
    invoices: data.invoices,
  });
  if (payload.length > 900_000) {
    return json({ error: "Sauvegarde trop volumineuse." }, 413);
  }

  await context.env.DB.prepare(`
    INSERT INTO app_data (owner_email, payload, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(owner_email) DO UPDATE SET
      payload = excluded.payload,
      updated_at = datetime('now')
  `).bind(email, payload).run();

  return json({ ok: true });
}
