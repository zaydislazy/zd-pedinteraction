local function send(action, data)
    SendNUIMessage({
        action = action,
        data = data,
    })
end

exports('Open', function(data)
    SetNuiFocus(true, true)
    send('open', data)

    local ped = interactionPed
    if type(data) == 'table' and (data.ped or data.entity) then
        ped = data.ped or data.entity
    end

    if ped and DoesEntityExist(ped) then
        FocusCameraOnPed(ped)
    end
end)

exports('Update', function(data)
    send('update', data)
end)

exports('Close', function()
    SetNuiFocus(false, false)
    send('close')
    ResetCameraFocus()
end)

RegisterNUICallback('select', function(data, cb)
    TriggerEvent('zd-pedinteraction:client:select', data)
    cb({ ok = true })
end)

RegisterNUICallback('leave', function(_, cb)
    SetNuiFocus(false, false)
    send('close')
    ResetCameraFocus()
    TriggerEvent('zd-pedinteraction:client:leave')
    cb({ ok = true })
end)