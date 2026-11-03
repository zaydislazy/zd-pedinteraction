# zd-pedinteraction

Client-side dialogue for FiveM. Spawn a local ped, target it with [ox_target](https://github.com/overextended/ox_target), and open a conversation UI. Your resource decides what each choice does.

The resource does not ship missions, jobs, or server logic. You create the ped, open the UI, and react when the player picks an option.

## Features

- Local, frozen, invincible peds. Each client has their own copy, so the ped is not a networked entity.
- An ox_target option on the ped (`Talk To` by default).
- A dialogue screen with NPC and player lines, choices, and a hold-to-leave hint.
- A scripted camera on the ped while the UI is open.
- Peds are removed when the resource that created them stops, and when `zd-pedinteraction` itself stops.

## Requirements

- FiveM server, artifact with `cerulean` and Lua 5.4
- [ox_target](https://github.com/overextended/ox_target)

ox_lib, oxmysql, and any framework are not required.

## Installation

1. Put this folder in your resources directory. The resource name must stay `zd-pedinteraction` if you call the exports as written below. FiveM category folders such as `[zaydev]` are fine; they are not part of the name.
2. Add it to `server.cfg` after ox_target:

```cfg
ensure ox_target
ensure zd-pedinteraction
```

3. Do not add your dialogue to this resource. Call the exports from your own resource.

The UI in `ui/dist` is already built. You only need Node if you change the interface. See [Building the UI](#building-the-ui).

## How a conversation works

1. Your resource creates a ped with `CreatePedInteraction`.
2. The player targets the ped. Your `onSelect` function or client event runs.
3. You call `Open` with the first lines and choices.
4. The player clicks a choice, or presses its key. This resource fires `zd-pedinteraction:client:select` with that choice's `id` and `key`.
5. Your handler checks `data.id` and either calls `Update` with the next lines or `Close` to end the conversation.
6. Holding Escape runs the leave path and fires `zd-pedinteraction:client:leave`.

`zd-pedinteraction:client:select` is a global client event. Every handler on the client runs for every dialogue. Keep your own `active` flag, and use choice ids that belong to that conversation, so a click in one dialogue does not advance another.

`Open` replaces the transcript. `Update` appends lines and keeps the earlier ones on screen.

## Exports

All exports are client-side.

```lua
exports['zd-pedinteraction']:CreatePedInteraction(...)
exports['zd-pedinteraction']:RemovePedInteraction(id)
exports['zd-pedinteraction']:Open(data)
exports['zd-pedinteraction']:Update(data)
exports['zd-pedinteraction']:Close()
```

### CreatePedInteraction

Spawns the ped and, when you provide `onSelect` or `event`, registers one ox_target option on it.

Table form:

```lua
local ped, id = exports['zd-pedinteraction']:CreatePedInteraction({
    id = 'fleeca_sienna',          -- optional, unique id used by RemovePedInteraction
    model = 'a_f_m_beach_01',      -- model name or hash, required
    coords = vector4(x, y, z, h),  -- required. `pos` is accepted as an alias
    heading = 0.0,                 -- used when coords has no `.w`
    scenario = 'WORLD_HUMAN_STAND_IMPATIENT', -- optional
    label = 'Talk To',             -- ox_target label
    icon = 'fa-solid fa-comment',  -- ox_target icon
    name = 'zd_pedinteraction:fleeca_sienna', -- ox_target option name
    distance = 2.0,                -- ox_target distance
    onSelect = function(data) end, -- called when the player selects the ped
    event = 'my-resource:client:talk', -- client event fired instead, when onSelect is absent
})
```

Positional form:

```lua
local ped, id = exports['zd-pedinteraction']:CreatePedInteraction(model, coords, onSelect, options)
```

`options` is the same table as above, without `model`, `coords`, and `onSelect` (those are the first three arguments).

| Field | Default | Notes |
| --- | --- | --- |
| `id` | `ped_<modelHash>`, then `ped_<modelHash>_2`, ... | Re-creating the same id deletes the previous ped first. |
| `model` | none | Required. A string is hashed with `joaat`. An invalid model prints an error and returns nothing. |
| `coords` / `pos` | none | Required. `vector3`, `vector4`, or a table with `x`, `y`, `z`, and optional `w`. |
| `heading` | `coords.w` or `0.0` | Ped heading. |
| `scenario` | none | Started with `TaskStartScenarioInPlace` when it is a string. |
| `label` | `Talk To` | Text on the target option. |
| `icon` | `fa-solid fa-comment` | |
| `name` | `zd_pedinteraction:<id>` | ox_target option name. |
| `distance` | `2.0` | |
| `onSelect` | none | Receives the ox_target data table (`entity`, coords, distance, and so on). |
| `event` | none | `TriggerEvent(event, data)` with that same ox_target data. Ignored when `onSelect` is a function. |

Returns the ped entity and the id. Returns nothing if `model` or `coords` is missing, or the model is not in the CD image.

The ped is created with `CreatePed` as a local entity (`networked = false`) at `z - 1.0`. Pass the ground position you would normally use for a ped; the offset matches the usual player-coordinate adjustment. The ped is invincible, frozen, non-ragdoll, and set as a mission entity.

If both `onSelect` and `event` are missing, the ped still spawns, a message is printed, and no target option is added.

The creating resource is remembered. When that resource stops, its peds are deleted. `RemovePedInteraction` does the same for one id.

### RemovePedInteraction

```lua
exports['zd-pedinteraction']:RemovePedInteraction('fleeca_sienna')
```

Removes the ox_target option, deletes the ped, and drops it from the registry. Unknown ids are ignored.

### Open

```lua
exports['zd-pedinteraction']:Open({
    ped = ped,          -- optional entity. `entity` is an alias
    messages = { },     -- see Dialogue payload
    choices = { },
    hint = { key = 'ESC', text = 'HOLD TO LEAVE' },
})
```

Gives the dialogue NUI focus, replaces whatever transcript is on screen, and aims the camera at a ped:

1. `data.ped` or `data.entity`, if that entity exists
2. otherwise the ped the player just targeted

Targeting a ped sets that entity before your `onSelect` or `event` runs, so a normal `Open` call inside that handler does not need `ped`. Pass it when you open the UI from somewhere else.

`Open` does not append. Calling it again wipes the current transcript and plays the camera intro again.

### Update

```lua
exports['zd-pedinteraction']:Update({
    messages = { },   -- appended. Omit to leave the transcript as it is
    choices = { },    -- replaces the buttons. Omit to keep the current buttons
    hint = { },       -- replaces the hint. `nil` keeps it. `false` is not special; use an explicit null from JSON only. In Lua, pass a table to replace it.
})
```

`Update` does not move the camera and does not change NUI focus. The UI is already open.

Append rules:

- New messages are added under the existing ones.
- If any new message has `active = true`, every older active line is cleared.
- If you omit `active` on the new lines, the last new NPC line is marked active.
- Give each line a stable `id` if you need to recognise it later. Omitted ids are generated once and stay with that bubble.
- History fades as it ages. From the newest line backward the opacities are `1`, `0.85`, `0.7`, `0.7`, `0.62`. Set `opacity` on a line to override that. The active NPC line is drawn at full opacity anyway.

Omit `hint` to keep the one already on screen. Pass a table to replace the label. Lua drops `nil` fields before they reach the UI, so an update cannot clear a hint that `Open` already showed.

### Close

```lua
exports['zd-pedinteraction']:Close()
```

Drops NUI focus, hides the dialogue, and blends the camera back over one second. `zd-pedinteraction:client:leave` stays quiet on this path. Clear your own conversation state in the choice handler that calls `Close`.

## Events

### `zd-pedinteraction:client:select`

Fired when the player clicks a choice or presses its key.

```lua
AddEventHandler('zd-pedinteraction:client:select', function(data)
    -- data.id   string you set on the choice, or "choice-0", "choice-1", ...
    -- data.key  the key label, such as "1"
end)
```

The payload is only `id` and `key`. `label`, `text`, and `variant` are not sent back. Branch on `id`.

The UI does not close or change lines by itself. Your handler calls `Update` or `Close`.

### `zd-pedinteraction:client:leave`

Fired after the player holds Escape for about 700ms.

```lua
AddEventHandler('zd-pedinteraction:client:leave', function()
end)
```

The resource has already closed the UI and released the camera before this runs. Use it to clear state. It does not run when you call `Close()` yourself.

There is no payload. The hold key is always Escape. The hint's `key` and `text` are labels only.

### Your ped event

If you pass `event` to `CreatePedInteraction` and do not pass `onSelect`, targeting the ped runs:

```lua
AddEventHandler('my-resource:client:talk', function(data)
    -- data is the ox_target payload. data.entity is the ped.
end)
```

`onSelect` and `event` only start the conversation. They are not called again when a dialogue choice is clicked. Choices always come through `zd-pedinteraction:client:select`.

## Dialogue payload

`messages`, `choices`, and `hint` are accepted by both `Open` and `Update`.

### Messages

```lua
{
    id = 'babies',                 -- optional
    speaker = 'npc',               -- 'npc' or 'player'
    label = 'SIENNA WESTON · FLEECA HARMONY',
    initials = 'SW',               -- NPC avatar. Derived from the label when omitted
    text = 'Oh my god. *Hi, babies.*',
    active = true,                 -- highlighted NPC line
    opacity = 0.7,                 -- optional override
}
```

`speaker = 'npc'` draws an avatar and a named bubble. `speaker = 'player'` draws the smaller player line. Player lines use `label` as the small heading (`ASK`, `DEAL`, and so on) and `text` as what they said.

`initials`, when omitted, comes from the label. The label is split on `·`, then the first and last words of the name supply the letters. `SIENNA WESTON · FLEECA HARMONY` becomes `SW`. A single word uses its first two letters.

### Choices

```lua
{
    id = 'ask',          -- sent back on zd-pedinteraction:client:select. Make this unique
    key = '1',           -- shown on the button, and pressed on the keyboard
    label = 'ASK',       -- short heading
    text = 'So... about Harmony?',
    variant = 'primary', -- 'primary' or 'secondary'. Defaults to primary for the first, secondary after that
}
```

Keys are matched case-insensitively against `event.key`. `1` is the `1` key, not the numpad unless the browser reports that key as `1`. If two choices share a key, the first one wins. The player can also click the button.

Put the real work in the select handler, not in the choice table. A choice cannot carry a function through NUI.

### Hint

```lua
hint = { key = 'ESC', text = 'HOLD TO LEAVE' }
```

Both fields are optional and default to those values. This only changes the widget in the corner. Leaving is always a 700ms Escape hold.

Pass `hint` on `Open` when you want the widget. If you leave it out, no hint is shown until an update includes one.

## Text formatting

`text` is a string. A newline starts a new paragraph. Blank lines are dropped.

Inline markup inside `text`:

| Write | Result |
| --- | --- |
| `*Hi, babies.*` | italic |
| `**Slowly.**` | bold |

`**bold**` is matched before `*italic*`. Markers do not nest, so keep each phrase to one pair.

For more control, use `paragraphs` instead of `text`. Each entry is a string (markup still works) or a list of parts:

```lua
{
    speaker = 'npc',
    label = 'SIENNA WESTON · FLEECA HARMONY',
    initials = 'SW',
    active = true,
    paragraphs = {
        {
            { text = 'Wait. Are those… are those ' },
            { text = 'my bracelets', italic = true },
            { text = '?' },
        },
        {
            { text = 'Hand them over. ' },
            { text = 'Slowly.', bold = true },
            { text = " If either of them has a scratch, I'm telling Daddy it was you." },
        },
    },
}
```

When `paragraphs` is a non-empty list, `text` is ignored.

## Reacting to a choice

This is the whole click path. The numbers match a two-step conversation: ask, then leave.

1. Opening the UI sets `active` so this handler ignores selects from other scripts.
2. The select handler returns immediately unless this conversation is the one on screen.
3. `data.id == 'ask'` appends what the player said, appends the NPC reply, and replaces the buttons. The old lines stay visible.
4. `data.id == 'leave'` clears `active` and calls `Close`. `Close` does not emit the leave event, so this branch is the one that records "the player chose leave".
5. A separate leave handler clears `active` when the player holds Escape instead of choosing leave.

```lua
local active = false

AddEventHandler('zd-pedinteraction:client:select', function(data)
    if not active or type(data) ~= 'table' then return end

    if data.id == 'ask' then
        exports['zd-pedinteraction']:Update({
            messages = {
                { speaker = 'player', label = 'ASK', text = 'So... about Harmony?' },
                {
                    speaker = 'npc',
                    label = 'SIENNA WESTON · FLEECA HARMONY',
                    initials = 'SW',
                    text = "Here's what I've stolen off his desk so far.",
                    active = true,
                },
            },
            choices = {
                { id = 'leave', key = '1', label = 'LEAVE', text = 'Enjoy the red car.' },
            },
        })
        return
    end

    if data.id == 'leave' then
        active = false
        -- Give the item, pay the player, set a state bag, trigger a server event, then close.
        TriggerServerEvent('my-resource:server:finishDialogue', 'leave')
        exports['zd-pedinteraction']:Close()
    end
end)

AddEventHandler('zd-pedinteraction:client:leave', function()
    active = false
end)
```

Anything you want the choice to do belongs in that `if data.id == ...` branch: a server event, a progress bar, another `Update`, or `Close`. Call your own events from there.

Choice ids are just strings. `ask` and `leave` are fine inside one conversation. If several resources listen to the same event, guard with `active` (or a conversation id you set yourself) before you trust `data.id`.

## Full example

Put this in **your** resource, not in `zd-pedinteraction`. It spawns Sienna at Fleeca Harmony, opens on the target, answers one question, and closes when the player leaves.

```lua
local active = false

CreateThread(function()
    exports['zd-pedinteraction']:CreatePedInteraction({
        id = 'fleeca_sienna',
        model = 'a_f_m_beach_01',
        coords = vector4(1065.284, -1446.672, 36.744, 0.0),
        label = 'Talk To',
        event = 'my-resource:client:talk',
    })
end)

AddEventHandler('my-resource:client:talk', function()
    active = true
    exports['zd-pedinteraction']:Open({
        messages = {
            {
                speaker = 'npc',
                label = 'SIENNA WESTON · FLEECA HARMONY',
                initials = 'SW',
                text = 'Oh my god. *Hi, babies.*',
                active = true,
            },
        },
        choices = {
            { id = 'ask', key = '1', label = 'ASK', text = 'So... about Harmony?' },
            { id = 'leave', key = '2', label = 'LEAVE', text = 'Enjoy the red car.' },
        },
        hint = { key = 'ESC', text = 'HOLD TO LEAVE' },
    })
end)

AddEventHandler('zd-pedinteraction:client:select', function(data)
    if not active or type(data) ~= 'table' then return end

    if data.id == 'ask' then
        exports['zd-pedinteraction']:Update({
            messages = {
                { speaker = 'player', label = 'ASK', text = 'So... about Harmony?' },
                {
                    speaker = 'npc',
                    label = 'SIENNA WESTON · FLEECA HARMONY',
                    initials = 'SW',
                    text = "Here's what I've stolen off his desk so far.",
                    active = true,
                },
            },
            choices = {
                { id = 'leave', key = '1', label = 'LEAVE', text = 'Enjoy the red car.' },
            },
        })
        return
    end

    if data.id == 'leave' then
        active = false
        exports['zd-pedinteraction']:Close()
    end
end)

AddEventHandler('zd-pedinteraction:client:leave', function()
    active = false
end)
```

The same ped, written with `onSelect` instead of `event`:

```lua
exports['zd-pedinteraction']:CreatePedInteraction({
    id = 'fleeca_sienna',
    model = 'a_f_m_beach_01',
    coords = vector4(1065.284, -1446.672, 36.744, 0.0),
    label = 'Talk To',
    onSelect = function()
        active = true
        exports['zd-pedinteraction']:Open({
            messages = {
                {
                    speaker = 'npc',
                    label = 'SIENNA WESTON · FLEECA HARMONY',
                    initials = 'SW',
                    text = 'Oh my god. *Hi, babies.*',
                    active = true,
                },
            },
            choices = {
                { id = 'ask', key = '1', label = 'ASK', text = 'So... about Harmony?' },
                { id = 'leave', key = '2', label = 'LEAVE', text = 'Enjoy the red car.' },
            },
            hint = { key = 'ESC', text = 'HOLD TO LEAVE' },
        })
    end,
})
```

The select and leave handlers stay the same. `onSelect` only replaces the "player targeted the ped" step.

Removing it later:

```lua
exports['zd-pedinteraction']:RemovePedInteraction('fleeca_sienna')
```

## Camera

While the UI is open, a scripted camera sits in front-right of the ped (offset `0.55, 1.15, 0.38` in the ped's local space), looks at a point `0.58` above the ped origin, and uses a FOV of `38`. The blend in and out is one second.

`Close`, and the Escape hold, both clear the camera. Stopping `zd-pedinteraction` clears it immediately.

You do not call the camera yourself. `Open` starts it and `Close` ends it.

## Cleanup

- `RemovePedInteraction(id)` removes one ped.
- Stopping the resource that called `CreatePedInteraction` removes every ped that resource created.
- Stopping `zd-pedinteraction` removes every ped and the camera.

Create peds from the resource that owns the conversation. An export call is attributed to the invoking resource, so a restart of that resource cleans up its own peds.

## Building the UI

From `ui/`:

```bash
npm install
npm run dev    # browser preview with the mock conversation
npm run build  # writes ui/dist, which fxmanifest serves
```

Ship `ui/dist` with the resource. Players do not need Node, and the server does not compile the UI.

`npm run dev` loads sample copy from `ui/src/data/mockDialogue.ts` so you can work on layout without starting FiveM. In game, that mock is replaced by whatever you pass to `Open`.

## Notes for a public release

- This resource is client-only. Validate rewards, items, and money on your own server when a choice should change persisted state. The select event can be triggered by any client script.
- Add a license file before you publish. The repository does not include one yet.
- Keep `ui/dist` in the repository you publish. `ui/node_modules` is gitignored.
