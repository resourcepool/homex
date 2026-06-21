# Homex

Intégration Home Assistant pour créer rapidement des **automatisations
d'éclairage par pièce**. Une pièce se configure en trois volets et devient
immédiatement active.

## Ce que crée une pièce

Pour une pièce de nom `Chambre` / id `bedroom`, Homex crée :

| Entité | Rôle |
| --- | --- |
| `switch.room_lights_bedroom` | État d'allumage de la pièce (allumée / éteinte). Géré par Homex. |
| `light.room_lights_bedroom_group` | Groupe de tous les appareils de la pièce. Géré par Homex. |
| `scene.room_lights_bedroom_turn_on` | Scène native « tout allumé » (par défaut), écrite dans `scenes.yaml`. |
| `scene.room_lights_bedroom_turn_off` | Scène native « tout éteint » (par défaut), écrite dans `scenes.yaml`. |
| `room_lights_switcher_bedroom` | Automatisation interne : à chaque déclencheur, applique `turn_on` ou `turn_off` selon l'état du switch de la pièce. |

Le `switch` et le `light` group sont **gérés par l'intégration**. Les deux
**scènes sont natives** : Homex les écrit dans `config/scenes.yaml` (si elles
n'existent pas encore) et les déclenche via `scene.turn_on`. Elles
appartiennent ensuite à l'utilisateur, qui les édite dans l'éditeur de scènes
HA — Homex n'écrase jamais une scène existante.

**Suppression** : supprimer la pièce (l'entrée d'intégration) retire de
`scenes.yaml` toutes les scènes de la pièce **et de ses groupes**
(`async_remove_entry`).

## Les trois volets

1. **Pièce** — nom + id → crée `switch.room_lights_<id>`.
2. **Appareils** — sélection des lampes/interrupteurs → crée le groupe de
   lumières et seed les deux scènes natives dans `scenes.yaml` (`turn_on` =
   tout allumé, `turn_off` = tout éteint).
3. **Déclencheurs** — sélection d'entités (interrupteur, capteur de présence…).
   Quand une d'elles change d'état, l'automatisation lit l'état de la pièce et
   applique la scène correspondante.

Une fois les trois volets validés, la pièce est active.

### Configurer la pièce / les groupes

**Paramètres → Appareils et services → Homex → Configurer** ouvre un menu :

- **Appareils et déclencheurs de la pièce** — modifier la liste.
- **Ajouter un groupe** — voir ci-dessous.
- **Modifier / supprimer un groupe** — éditer ou retirer un groupe existant.

### Groupes dans une pièce

Un groupe pilote un **sous-ensemble** des appareils de la pièce (ex. « Table de
chevet L », id `bedside_l`). On choisit le nom, l'id, les appareils (parmi ceux
de la pièce) et un ou plusieurs déclencheurs. À la création, Homex crée, en
miroir de la pièce :

| Entité (groupe `bedside_l` de `bedroom`) | Rôle |
| --- | --- |
| `switch.room_lights_bedroom_bedside_l` | État du groupe (allumé / éteint). |
| `light.room_lights_bedroom_bedside_l_group` | Group HA du sous-ensemble. |
| `scene.room_lights_bedroom_bedside_l_turn_on` | Scène native « groupe allumé ». |
| `scene.room_lights_bedroom_bedside_l_turn_off` | Scène native « groupe éteint ». |

Quand un déclencheur du groupe change d'état, Homex lit l'état du switch du
groupe et applique la scène `turn_on` ou `turn_off` correspondante (même logique
que la pièce, scopée au sous-ensemble).

**Éteindre la pièce éteint aussi les groupes** : quand on éteint
`switch.room_lights_<id>`, Homex éteint également le switch de chaque
sous-groupe (qui applique sa propre scène `turn_off`).

> Supprimer un groupe retire ses entités, mais laisse ses scènes dans
> `scenes.yaml` (Homex ne touche jamais aux scènes existantes) — supprime-les
> manuellement dans l'éditeur de scènes si besoin.

### Éditer les scènes (éditeur natif HA)

Les scènes sont de vraies scènes Home Assistant. Pour les modifier :
**Paramètres → Automatisations et scènes → Scènes** →
`room_lights_<id>_turn_on` / `room_lights_<id>_turn_off`. Tu y règles l'état de
chaque appareil (allumé/éteint, luminosité, couleur…) avec l'éditeur natif.
Homex applique ensuite ces scènes telles quelles via `scene.turn_on`.

## Menu latéral (panel custom)

Homex enregistre une entrée **Homex** dans la barre latérale de Home Assistant
(un *custom panel*, pas besoin de HACS — HACS ne sert qu'à *distribuer* des
intégrations/cartes). Le panneau est un **centre de configuration complet**,
piloté par des **modales** :

- **Créer une pièce** : bouton « ＋ Nouvelle pièce » dans l'en-tête → modale
  (nom, id, appareils). Crée le config entry via le config flow (`import`).
- **Contrôle** : pour chaque pièce et groupe, toggle du switch, boutons des
  scènes ON/OFF, état du light group (rafraîchi en direct).
- **Par pièce, des boutons ouvrent une modale** : *Modifier la pièce* (nom, id
  — renomme scènes + entités —, appareils), *Déclencheurs*, *＋ Groupe*.
- **Par groupe**, un bouton ⚙︎ ouvre la modale d'édition (nom, appareils du
  sous-ensemble, déclencheurs) avec suppression.
- La sélection d'entités utilise `ha-entities-picker` (autocomplétion native,
  ajout entité par entité).

Implémentation :

- **Backend** (`panel.py`) : commandes WebSocket `homex/rooms` (lecture),
  `homex/room/update`, `homex/group/add|update|delete` (mutations, admin) qui
  modifient le config entry via `async_update_entry` ; le renommage d'id migre
  `scenes.yaml` et les `entity_id` du registre.
- **Frontend** : écrit en **Lit + TypeScript** (comme le frontend de HA),
  sources découpées en composants dans `frontend/src/`, **buildé avec Vite**
  vers le module ESM `config/custom_components/homex/panel/homex-panel.js`
  servi en statique (`/homex_static/...`) et enregistré via `panel_custom`.
- **Composants natifs HA** : le panneau utilise `ha-card`, `ha-textfield` et
  surtout `ha-entities-picker` (sélection multi-entités native, ajout entité par
  entité). Ces éléments vivent dans le chunk éditeur de HA ; ils sont chargés à
  la demande via `loadCardHelpers()` (`lib/ha-elements.ts`). Si indisponibles
  (vieille version HA), `homex-entity-picker` retombe sur un widget maison
  (puces + autocomplétion).
- L'enregistrement est **différé à `homeassistant_started`** pour ne jamais
  bloquer le démarrage. Le panneau apparaît dès qu'au moins une pièce existe.

### Développer / rebuilder le panel

```bash
cd frontend
npm install        # une fois
npm run build      # build unique -> ../config/.../panel/homex-panel.js
npm run watch      # rebuild auto pendant le dev
```

Après un build, recharge la page Homex (Cmd/Ctrl+Shift+R) ; bump
`PANEL_VERSION` dans `panel.py` pour forcer le cache-busting du module.

## Lancer l'environnement de dev

```bash
docker compose up
```

Puis ouvrir http://localhost:8123, créer le compte initial, et ajouter
l'intégration : **Paramètres → Appareils et services → Ajouter une
intégration → Homex**.

Le fichier `config/configuration.yaml` fournit déjà des appareils factices
(`input_boolean.lamp_*`, `input_boolean.wall_switch_bedroom`,
`input_boolean.motion_bedroom`) pour tester sans matériel réel.

### Exemple de test

1. Crée une pièce `Chambre` / `bedroom`.
2. Appareils : `Bedroom Lamp 1`, `Bedroom Lamp 2`.
3. Déclencheur : `Bedroom Motion (trigger)`.
4. Allume `switch.room_lights_bedroom` → les deux lampes s'allument.
5. Bascule `input_boolean.motion_bedroom` → la scène correspondant à l'état de
   la pièce est ré-appliquée.

## Structure

```
docker-compose.yml
frontend/              # sources du panel (Lit + TS), buildées par Vite
  package.json vite.config.ts tsconfig.json
  src/
    homex-panel.ts     # élément racine <homex-panel> (orchestration)
    types.ts api.ts    # types partagés + client WebSocket homex/*
    lib/               # ha-elements (chargement natif), styles, fields, domains
    components/        # homex-room-card, homex-group-row, homex-unit-controls,
                       #   homex-entity-picker, homex-dialog + *-dialog (modales)
config/
  configuration.yaml   # default_config + scene: !include scenes.yaml
  scenes.yaml          # scènes natives (seedées par Homex, éditables)
  custom_components/homex/
    __init__.py        # setup / unload du config entry
    config_flow.py     # les 3 volets + options (reconfiguration)
    room.py            # RoomController + Unit (pièce & groupes) : scènes + auto
    switch.py          # switch.room_lights_<id>
    light.py           # light.room_lights_<id>_group
    panel.py           # WebSocket homex/* + enregistrement du panel
    panel/homex-panel.js  # module ESM buildé (ne pas éditer à la main)
    const.py manifest.json strings.json translations/
```

> Note : `config/configuration.yaml` contient `scene: !include scenes.yaml`,
> indispensable pour que les scènes natives seedées par Homex soient chargées
> et éditables.
