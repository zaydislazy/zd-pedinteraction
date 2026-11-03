local peds = {}
local activeCam
interactionPed = nil

function FocusCameraOnPed(targetPed, duration)
    if not targetPed or not DoesEntityExist(targetPed) then return end

    if activeCam and DoesCamExist(activeCam) then
        DestroyCam(activeCam, false)
        activeCam = nil
    end

    local pedCoords = GetEntityCoords(targetPed)
    -- Same 3/4 view every time, in the ped's local space: right, forward, below the head.
    local camCoords = GetOffsetFromEntityInWorldCoords(targetPed, 0.55, 1.15, 0.38)

    local customCam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)
    SetCamCoord(customCam, camCoords.x, camCoords.y, camCoords.z)
    PointCamAtEntity(customCam, targetPed, 0.0, 0.0, 0.58, true)
    SetCamFov(customCam, 38.0)
    SetCamActive(customCam, true)
    SetFocusPosAndVel(pedCoords.x, pedCoords.y, pedCoords.z, 0.0, 0.0, 0.0)
    RenderScriptCams(true, true, duration or 1000, true, true)

    activeCam = customCam
    return customCam
end

function ResetCameraFocus(customCam, duration)
    customCam = customCam or activeCam
    if activeCam == customCam then
        activeCam = nil
    end

    interactionPed = nil

    if not customCam or not DoesCamExist(customCam) then return end

    local blend = duration or 1000
    RenderScriptCams(false, true, blend, true, true)
    ClearFocus()

    SetTimeout(blend, function()
        if DoesCamExist(customCam) then
            DestroyCam(customCam, false)
        end
    end)
end


local function deletePed(id)
    local entry = peds[id]
    if not entry then return end

    if entry.entity and DoesEntityExist(entry.entity) then
        exports.ox_target:removeLocalEntity(entry.entity)
        DeleteEntity(entry.entity)
    end

    peds[id] = nil
end

local function CreatePedInteraction(model, pos, onSelect, options)
    if type(model) == 'table' then
        options = model
        model = options.model
        pos = options.coords or options.pos
        onSelect = options.onSelect
    end

    options = options or {}
    local owner = GetInvokingResource() or GetCurrentResourceName()

    if not model or not pos then
        print('CreatePedInteraction requires a model and coords')
        return
    end

    local modelHash = type(model) == 'string' and joaat(model) or model

    if not IsModelInCdimage(modelHash) then
        print(('Invalid ped model: %s'):format(model))
        return
    end

    local id = options.id
    if not id then
        local suffix = 0
        repeat
            suffix += 1
            id = suffix == 1 and ('ped_%s'):format(modelHash) or ('ped_%s_%s'):format(modelHash, suffix)
        until not peds[id]
    end

    if peds[id] then
        deletePed(id)
    end

    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Wait(10)
    end

    local heading = pos.w or options.heading or 0.0
    -- local (non-networked) ped so each client has their own copy
    local ped = CreatePed(4, modelHash, pos.x, pos.y, pos.z - 1.0, heading, false, false)

    SetEntityInvincible(ped, true)
    SetEntityAsMissionEntity(ped, true, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedFleeAttributes(ped, 0, false)
    SetPedCanRagdoll(ped, false)
    SetPedDiesWhenInjured(ped, false)
    FreezeEntityPosition(ped, true)

    if type(options.scenario) == 'string' then
        TaskStartScenarioInPlace(ped, options.scenario, 0, true)
    end

    SetModelAsNoLongerNeeded(modelHash)

    local target = {
        name = options.name or ('zd_pedinteraction:%s'):format(id),
        icon = options.icon or 'fa-solid fa-comment',
        label = options.label or 'Talk To',
        distance = options.distance or 2.0,
    }

    if type(onSelect) ~= 'function' and type(options.event) ~= 'string' then
        print(('CreatePedInteraction "%s" has no onSelect or event'):format(id))
    else
        local pedEntity = ped
        local userEvent = options.event

        target.onSelect = function(data)
            interactionPed = (type(data) == 'table' and data.entity) or pedEntity

            if type(onSelect) == 'function' then
                onSelect(data)
            elseif type(userEvent) == 'string' then
                TriggerEvent(userEvent, data)
            end
        end

        exports.ox_target:addLocalEntity(ped, { target })
    end

    peds[id] = {
        entity = ped,
        resource = owner,
    }

    return ped, id
end

exports('CreatePedInteraction', CreatePedInteraction)

exports('RemovePedInteraction', function(id)
    deletePed(id)
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        ResetCameraFocus(nil, 0)
        for id in pairs(peds) do
            deletePed(id)
        end
        return
    end

    for id, entry in pairs(peds) do
        if entry.resource == resource then
            deletePed(id)
        end
    end
end)