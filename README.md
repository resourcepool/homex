# Homex

Intégration Home Assistant pour créer rapidement des **automatisations
d'éclairage par pièce**. Tout se gère depuis un **panneau dédié** dans la barre
latérale — pas de YAML à écrire.

## Modèle

Homex s'installe en **un clic** : une seule entrée de configuration, le *hub*
« Homex ». Chaque **pièce** est ensuite un **sous-élément (subentry)** du hub,
créé et géré entièrement depuis le panneau. Les pièces apparaissent imbriquées
sous Homex dans *Paramètres → Appareils et services*, et leurs entités sont
rattachées à la pièce.

### Ce que crée une pièce / un groupe

Pour une pièce `Chambre` (id `chambre`) — `slug` = `chambre` ; pour un groupe
`Table de chevet` (id `table_de_chevet`) — `slug` = `chambre_table_de_chevet` :

| Entité | Nom affiché | Rôle |
| --- | --- | --- |
| `switch.homex_{slug}_lights_toggle` | `HX - {pièce}[ - {groupe}] - toggle lights` | État allumé / éteint (géré par Homex). |
| `light.homex_{slug}_lights` | `HX - {pièce}[ - {groupe}] - lights` | Groupe de tous les appareils. |
| `scene.homex_{slug}_turn_on` | `HX - {pièce} - on` | Scène native « tout allumé ». |
| `scene.homex_{slug}_turn_off` | `HX - {pièce} - off` | Scène native « tout éteint ». |

Les scènes sont **natives** : Homex les écrit dans `config/scenes.yaml` et les
déclenche via `scene.turn_on`. Elles appartiennent ensuite à l'utilisateur
(éditables dans l'éditeur de scènes HA) — Homex n'écrase jamais une scène
existante. On peut ajouter d'autres scènes (`HX - {pièce} - on - {nom}`).

Un **groupe** pilote un sous-ensemble des appareils de la pièce, avec son propre
switch, son groupe de lumières, ses scènes et ses déclencheurs.

### Déclencheurs

Deux types, configurables par pièce et par groupe :

- **toggle** — bascule l'état (allumé ⇄ éteint) ;
- **changement de scène** — fait défiler les scènes (stratégie *recall first* /
  *recall last*).

Chaque déclencheur est soit une **entité** (changement d'état), soit un
**device** (action native, ex. bouton). Les déclenchements provoqués par les
propres actions de Homex sont ignorés (pas de boucle scène → device → trigger).

## Installation

> Nécessite Home Assistant **≥ 2025.1** (config subentries) et
> `scene: !include scenes.yaml` dans `configuration.yaml` — **présent par
> défaut** sur une installation HAOS standard (via `default_config`).

### Via HACS (dépôt personnalisé)

1. HACS → menu ⋮ → **Dépôts personnalisés**.
2. Ajouter l'URL du dépôt, catégorie **Integration**.
3. Installer **Homex**, puis **redémarrer** Home Assistant.
4. *Paramètres → Appareils et services → Ajouter une intégration → Homex*
   (installation en un clic, sans champ).

### Manuelle (HAOS / Container / Core)

1. Copier le dossier `custom_components/homex/` dans `/config/custom_components/`
   (via Samba, *File editor*, *Studio Code Server* ou SSH).
2. Redémarrer Home Assistant.
3. *Ajouter une intégration → Homex*.

Une fois installé, ouvrir **Homex** dans la barre latérale et cliquer
**＋ Nouvelle pièce**.

## Développement

Environnement de dev jetable (HA dans Docker, intégration montée en direct) :

```bash
docker compose up -d          # HA sur http://localhost:8124
```

L'intégration (`./custom_components/homex`) est montée dans
`/config/custom_components`. Le panneau est un composant **Lit + Vite**
(`frontend/`), compilé en un bundle ES unique servi par l'intégration :

```bash
cd frontend
npm install
npm run build                 # -> custom_components/homex/panel/homex-panel.js
```

`PANEL_VERSION` (`panel.py`) et `BUILD` (`homex-panel.ts`) sont incrémentés
ensemble pour casser le cache ; le badge `Homex vN` en haut du panneau confirme
la version chargée (rechargement dur : Cmd/Ctrl+Shift+R).

> Le dossier `config/` est l'instance HA de dev. `config/scenes.yaml` et
> `config/.storage/` sont ignorés par git (état runtime).

## Notes mainteneur

Avant publication, renseigner dans `custom_components/homex/manifest.json` les
champs `documentation`, `issue_tracker` et `codeowners` avec la vraie URL du
dépôt et le compte GitHub.
