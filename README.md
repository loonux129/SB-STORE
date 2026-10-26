# Comptes fournisseurs sur Cloudflare

Ce paquet publie l'application avec Cloudflare Pages, enregistre les données dans D1 et protège l'application avec Cloudflare Access. Les données locales de GitHub Pages ne sont pas visibles depuis le nouveau domaine Cloudflare : exportez-les avant de changer de site, puis importez la sauvegarde dans l'application Cloudflare après connexion.

## Fichiers à mettre à la racine du dépôt GitHub

Téléversez le contenu de ce dossier à la racine du dépôt, en remplaçant l'ancien `index.html` et en ajoutant `functions/`, `schema.sql` et `package.json`.

## Configuration Cloudflare

1. Dans **Workers & Pages**, créez un projet **Pages** en le connectant au dépôt GitHub.
2. Configurez la racine du projet comme répertoire du projet, la commande de build `npm run build` et le répertoire de sortie `.`. Le projet doit être déployé depuis Git; le téléversement direct ne prend pas en charge Pages Functions.
3. Dans **D1 SQL Database**, créez une base nommée `comptes-fournisseurs`. Ouvrez son éditeur SQL et exécutez le contenu de `schema.sql`.
4. Dans le projet Pages, ouvrez **Settings → Bindings → Add → D1 database**. Nommez la variable de liaison `DB`, sélectionnez la base, puis redéployez.
5. Configurez Cloudflare Access pour protéger l'adresse de production `*.pages.dev`, avec une règle qui autorise uniquement votre adresse courriel. Pour un domaine personnalisé, créez aussi une application Access pour ce domaine.
6. Dans **Settings → Variables and Secrets**, ajoutez les variables `ACCESS_TEAM_DOMAIN` (par exemple `https://votre-equipe.cloudflareaccess.com`) et `ACCESS_AUD` (Audience Tag de l'application Access). Ajoutez-les à l'environnement Production puis redéployez.

Le middleware vérifie le jeton Cloudflare Access pour toutes les pages et les routes API. L'API identifie les données par le courriel contenu dans ce jeton. La base ne reçoit jamais de mot de passe ou de clé secrète du navigateur.

## Première ouverture et sauvegarde

Avant le changement de domaine, ouvrez l'ancienne application et choisissez **Exporter les données**. Conservez le fichier JSON. Après le premier accès à l'application Cloudflare, choisissez **Importer une sauvegarde** et sélectionnez ce fichier : les données seront copiées dans D1. Ensuite, chaque modification sera enregistrée localement puis synchronisée avec D1. Le message en haut indique l'état de la synchronisation. Gardez une sauvegarde exportée de temps en temps.

Ne déployez pas la fonction API sans configurer Cloudflare Access. Elle protège l'accès aux données.

