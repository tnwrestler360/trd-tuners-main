DecorRegister("custom-wheelfitment_applied", 2)
DecorRegister("custom-wheelfitment_w_width", 1)
DecorRegister("custom-wheelfitment_w_fl", 1)
DecorRegister("custom-wheelfitment_w_fr", 1)
DecorRegister("custom-wheelfitment_w_rl", 1)
DecorRegister("custom-wheelfitment_w_rr", 1)
DecorRegister("custom-wheelfitment_w_wfl", 1)
DecorRegister("custom-wheelfitment_w_wfr", 1)
DecorRegister("custom-wheelfitment_w_wrl", 1)
DecorRegister("custom-wheelfitment_w_wrr", 1)
--[[
cl_ply.lua
]] -- #[Local Variables]#--
local QBCore = nil
if Config.Version == "new" then
    QBCore = Config.Export
else
    Citizen.CreateThread(function()
        while true do
            Citizen.Wait(10)
            if QBCore == nil then
                TriggerEvent(Config.Trigger, function(obj) QBCore = obj end)
                Citizen.Wait(200)
            end
        end
    end)
end

local PlayerData = QBCore.Functions.GetPlayerData()
local WheelFitmentData = {}
local radialMenuItemId = nil

local plyVehFitments = {}
local vehiclesToCheckFitment = {}
local didPlyAdjustFitments = false
local performVehicleCheck = true
local isWheelFitmentInUse = false
local currentFitmentsToSet = {width = 0, fl = 0, fr = 0, rl = 0, rr = 0, wfl = 0, wfr = 0, wrl = 0, wrr = 0}
local isPlyWhitelisted = false
local inZone = false
local devmode = false

local VehiclesData = {}

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnGangUpdate', function(gang)
    PlayerData.gang = gang
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
    PlayerData.job = job
end)

local function saveVehicle()
    local plyPed = PlayerPedId()
    local veh = GetVehiclePedIsIn(plyPed, false)
    local myCar = QBCore.Functions.GetVehicleProperties(veh)
    TriggerServerEvent('script-customs:server:updateVehicle', myCar, "stancer")
end

-- #[Local Functions]#--
local function roundNum(num, numDecimalPlaces)
    local mult = 10 ^ (numDecimalPlaces or 0)
    return math.floor(num * mult + 0.5) / mult
end

local function isNear(pos1, pos2, distMustBe)
    local diff = #(pos2 - pos1)
    return (diff < (distMustBe))
end

local function checkVehicleFitment()
    vehiclesToCheckFitment = {}

    local vehicles = GetGamePool("CVehicle")

    for _, veh in ipairs(vehicles) do
        local plyPed = PlayerPedId()
        local plyPos = GetEntityCoords(plyPed)

        if isNear(plyPos, GetEntityCoords(veh), 150) then
            if DecorExistOn(veh, "custom-wheelfitment_applied") then
                vehiclesToCheckFitment[#vehiclesToCheckFitment + 1] = {
                    vehicle = veh,
                    w_width = DecorGetFloat(veh, "custom-wheelfitment_w_width"),
                    w_fl = DecorGetFloat(veh, "custom-wheelfitment_w_fl"),
                    w_fr = DecorGetFloat(veh, "custom-wheelfitment_w_fr"),
                    w_rl = DecorGetFloat(veh, "custom-wheelfitment_w_rl"),
                    w_rr = DecorGetFloat(veh, "custom-wheelfitment_w_rr"),
                    w_wfl = DecorGetFloat(veh, "custom-wheelfitment_w_wfl"),
                    w_wfr = DecorGetFloat(veh, "custom-wheelfitment_w_wfr"),
                    w_wrl = DecorGetFloat(veh, "custom-wheelfitment_w_wrl"),
                    w_wrr = DecorGetFloat(veh, "custom-wheelfitment_w_wrr")
                }
            end
        end
    end
end

local function CheckRestrictions(location)
    local PlayerPed = PlayerPedId()
    local _location = location
    local restrictions = _location.restrictions

    if Config.Debug then
        print('***************************************************************************')
        print('Restriction Debug')
        print('***************************************************************************')
    end


    local allowedJob = AllowJob(restrictions, PlayerData.job.name)
    local allowedGang = AllowGang(restrictions, PlayerData.gang.name)

    if Config.Debug then
        print(string.format('allowedJob: %s\nallowedGang: %s', allowedJob, allowedGang))
        print('***************************************************************************')
    end
    return allowedJob and allowedGang
end

-- #[Global Functions]#--
function SyncWheelFitment()
    --if isPlyWhitelisted then
        local plyPed = PlayerPedId()
        local plyVeh = GetVehiclePedIsIn(plyPed, false)

        if didPlyAdjustFitments then
            if not DecorExistOn(plyVeh, "custom-wheelfitment_applied") then
                DecorSetBool(plyVeh, "custom-wheelfitment_applied", true)
            end

            DecorSetFloat(plyVeh, "custom-wheelfitment_w_width", roundNum(GetVehicleWheelWidth(plyVeh), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_fl", roundNum(GetVehicleWheelXOffset(plyVeh, 0), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_fr", roundNum(GetVehicleWheelXOffset(plyVeh, 1), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_rl", roundNum(GetVehicleWheelXOffset(plyVeh, 2), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_rr", roundNum(GetVehicleWheelXOffset(plyVeh, 3), 2))

            DecorSetFloat(plyVeh, "custom-wheelfitment_w_wfl", roundNum(GetVehicleWheelYRotation(plyVeh, 0), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_wfr", roundNum(GetVehicleWheelYRotation(plyVeh, 1), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_wrl", roundNum(GetVehicleWheelYRotation(plyVeh, 2), 2))
            DecorSetFloat(plyVeh, "custom-wheelfitment_w_wrr", roundNum(GetVehicleWheelYRotation(plyVeh, 3), 2))

            
            didPlyAdjustFitments = false
        end

        currentFitmentsToSet = {width = 0, fl = 0, fr = 0, rl = 0, rr = 0, wfl = 0, wfr = 0, wrl = 0, wrr = 0}

        performVehicleCheck = true

        checkVehicleFitment()

        FreezeEntityPosition(plyVeh, false)
        SetEntityCollision(plyVeh, true, true)

        saveVehicle()
    --end
end

function AdjustWheelFitment(state, wheel, amount)
    --if isPlyWhitelisted then
        if amount == -1 then
            amount = -1.00
        elseif amount == 1 then
            amount = 1.00
        elseif amount == 0 then
            amount = 0.00
        end

        if state then
            if wheel == "w_fl" then
                wheel = 0

                currentFitmentsToSet.fl = amount
            elseif wheel == "w_fr" then
                wheel = 1

                currentFitmentsToSet.fr = amount
            elseif wheel == "w_rl" then
                wheel = 2

                currentFitmentsToSet.rl = amount
            elseif wheel == "w_rr" then
                wheel = 3

                currentFitmentsToSet.rr = amount
            elseif wheel == "w_wfl" then
                wheel = 0

                currentFitmentsToSet.wfl = amount
            elseif wheel == "w_wfr" then
                wheel = 1

                currentFitmentsToSet.wfr = amount
            elseif wheel == "w_wrl" then
                wheel = 2

                currentFitmentsToSet.wrl = amount
            elseif wheel == "w_wrr" then
                wheel = 3

                currentFitmentsToSet.wrr = amount
            end

            if not didPlyAdjustFitments then
                didPlyAdjustFitments = true
            end
        else
            if not didPlyAdjustFitments then
                didPlyAdjustFitments = true
            end

            currentFitmentsToSet.width = amount
        end
    --end
end

-- #[Citizen Threads]#--

Citizen.CreateThread(function()
    while true do
        if performVehicleCheck then
            for _, vehData in ipairs(vehiclesToCheckFitment) do
                if vehData.vehicle ~= nil and DoesEntityExist(vehData.vehicle) then
                    if GetVehicleWheelWidth(vehData.vehicle) ~=vehData.w_width then
                        SetVehicleWheelWidth(vehData.vehicle, vehData.w_width)
                    end
                    if GetVehicleWheelXOffset(vehData.vehicle, 0) ~= vehData.w_fl then
                        SetVehicleWheelXOffset(vehData.vehicle, 0, vehData.w_fl)
                        SetVehicleWheelXOffset(vehData.vehicle, 1, vehData.w_fr)
                        SetVehicleWheelXOffset(vehData.vehicle, 2, vehData.w_rl)
                        SetVehicleWheelXOffset(vehData.vehicle, 3, vehData.w_rr)
                    end
                    if GetVehicleWheelYRotation(vehData.vehicle, 0) ~= vehData.w_wfl then
                        SetVehicleWheelYRotation(vehData.vehicle, 0, vehData.w_wfl)
                        SetVehicleWheelYRotation(vehData.vehicle, 1, vehData.w_wfr)
                        SetVehicleWheelYRotation(vehData.vehicle, 2, vehData.w_wrl)
                        SetVehicleWheelYRotation(vehData.vehicle, 3, vehData.w_wrr)
                    end
                end
            end
        else
            if isMenuShowing then
                local plyPed = PlayerPedId()
                local plyVeh = GetVehiclePedIsIn(plyPed, false)

                SetVehicleWheelWidth(plyVeh, currentFitmentsToSet.width)
                SetVehicleWheelXOffset(plyVeh, 0, currentFitmentsToSet.fl)
                SetVehicleWheelXOffset(plyVeh, 1, currentFitmentsToSet.fr)
                SetVehicleWheelXOffset(plyVeh, 2, currentFitmentsToSet.rl)
                SetVehicleWheelXOffset(plyVeh, 3, currentFitmentsToSet.rr)

                SetVehicleWheelYRotation(plyVeh,0,currentFitmentsToSet.wfl)
				SetVehicleWheelYRotation(plyVeh,1,currentFitmentsToSet.wfr)
				SetVehicleWheelYRotation(plyVeh,2,currentFitmentsToSet.wrl)
				SetVehicleWheelYRotation(plyVeh,3,currentFitmentsToSet.wrr)
            end
        end
        Citizen.Wait(10)
    end
end)

Citizen.CreateThread(function()
    while true do
        if performVehicleCheck then
            checkVehicleFitment()
        end

        Citizen.Wait(Config.LocationsFitment['WheelFitment'].settings.timer)
    end
end)

RegisterNetEvent('script-customs:client:EnterWheelFitment', function()
    if not IsPedInAnyVehicle(PlayerPedId(), false) then
        return
    end
    if next(WheelFitmentData) and not CheckRestrictions(Config.LocationsFitment[WheelFitmentData.location]) then
        return
    end

    EnterWheelFitment()
end)

exports("EnterFitment", function()
    if not IsPedInAnyVehicle(PlayerPedId(), false) then
        return
    end
    if next(WheelFitmentData) and not CheckRestrictions(Config.LocationsFitment[WheelFitmentData.location]) then
        return
    end

    EnterWheelFitment()
end)

function SetupInteractionFitment()
    local text = WheelFitmentData.drawtextui
    if not radialMenuItemId then
        radialMenuItemId = exports['qb-radialmenu']:AddOption({
            id = 'customs',
            title = 'Adjust Wheel Fitment',
            icon = 'wrench',
            type = 'client',
            event = 'script-customs:client:EnterWheelFitment',
            shouldClose = true
        })
    end
    exports['qb-core']:DrawText(text, 'left')
end

function EnterWheelFitment()
    local plyPed = PlayerPedId()
    if Config.AdminMenu == 'qb-adminmenu' then
        if IsPedInAnyVehicle(plyPed, false) and devmode then
            local slider_wWidth = {}
            local slider_wfFL = {}
            local slider_wfFR = {}
            local slider_wfRL = {}
            local slider_wfRR = {}
            local slider_wwfFL = {}
            local slider_wwfFR = {}
            local slider_wwfRL = {}
            local slider_wwfRR = {}
            local sliderStartPos = {}
            local plyVeh = GetVehiclePedIsIn(plyPed, false)

            performVehicleCheck = false

            SetEntityCoords(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].coords)
            SetEntityHeading(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].heading)
            FreezeEntityPosition(plyVeh, true)
            SetEntityCollision(plyVeh, false, true)


            for i = 0.0, 1.56, 0.01 do
                slider_wWidth[#slider_wWidth + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelWidth(plyVeh), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wWidth
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfFL[#slider_wfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfFR[#slider_wfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfRL[#slider_wfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfRR[#slider_wfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfFL[#slider_wwfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfFR[#slider_wwfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfRL[#slider_wwfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfRR[#slider_wwfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRR
                end
            end

            currentFitmentsToSet.width = GetVehicleWheelWidth(plyVeh)
            currentFitmentsToSet.fl = GetVehicleWheelXOffset(plyVeh, 0)
            currentFitmentsToSet.fr = GetVehicleWheelXOffset(plyVeh, 1)
            currentFitmentsToSet.rl = GetVehicleWheelXOffset(plyVeh, 2)
            currentFitmentsToSet.rr = GetVehicleWheelXOffset(plyVeh, 3)
            currentFitmentsToSet.wfl = GetVehicleWheelYRotation(plyVeh, 0)
            currentFitmentsToSet.wfr = GetVehicleWheelYRotation(plyVeh, 1)
            currentFitmentsToSet.wrl = GetVehicleWheelYRotation(plyVeh, 2)
            currentFitmentsToSet.wrr = GetVehicleWheelYRotation(plyVeh, 3)
            checkVehicleFitment()

            exports['qb-core']:HideText()

            DisplayMenu2(true, slider_wWidth, slider_wfFL, slider_wfFR, slider_wfRL, slider_wfRR, slider_wwfFL, slider_wwfFR, slider_wwfRL, slider_wwfRR, sliderStartPos)
        end
    elseif Config.AdminMenu == 'script-menuadmin' then
        if IsPedInAnyVehicle(plyPed, false) and devmode then
            local slider_wWidth = {}
            local slider_wfFL = {}
            local slider_wfFR = {}
            local slider_wfRL = {}
            local slider_wfRR = {}
            local slider_wwfFL = {}
            local slider_wwfFR = {}
            local slider_wwfRL = {}
            local slider_wwfRR = {}
            local sliderStartPos = {}
            local plyVeh = GetVehiclePedIsIn(plyPed, false)

            performVehicleCheck = false

            SetEntityCoords(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].coords)
            SetEntityHeading(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].heading)
            FreezeEntityPosition(plyVeh, true)
            SetEntityCollision(plyVeh, false, true)


            for i = 0.0, 1.56, 0.01 do
                slider_wWidth[#slider_wWidth + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelWidth(plyVeh), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wWidth
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfFL[#slider_wfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfFR[#slider_wfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfRL[#slider_wfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfRR[#slider_wfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfFL[#slider_wwfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfFR[#slider_wwfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfRL[#slider_wwfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfRR[#slider_wwfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRR
                end
            end

            currentFitmentsToSet.width = GetVehicleWheelWidth(plyVeh)
            currentFitmentsToSet.fl = GetVehicleWheelXOffset(plyVeh, 0)
            currentFitmentsToSet.fr = GetVehicleWheelXOffset(plyVeh, 1)
            currentFitmentsToSet.rl = GetVehicleWheelXOffset(plyVeh, 2)
            currentFitmentsToSet.rr = GetVehicleWheelXOffset(plyVeh, 3)
            currentFitmentsToSet.wfl = GetVehicleWheelYRotation(plyVeh, 0)
            currentFitmentsToSet.wfr = GetVehicleWheelYRotation(plyVeh, 1)
            currentFitmentsToSet.wrl = GetVehicleWheelYRotation(plyVeh, 2)
            currentFitmentsToSet.wrr = GetVehicleWheelYRotation(plyVeh, 3)
            checkVehicleFitment()

            exports['qb-core']:HideText()

            DisplayMenu2(true, slider_wWidth, slider_wfFL, slider_wfFR, slider_wfRL, slider_wfRR, slider_wwfFL, slider_wwfFR, slider_wwfRL, slider_wwfRR, sliderStartPos)
        end
    else
        if IsPedInAnyVehicle(plyPed, false) then
            local slider_wWidth = {}
            local slider_wfFL = {}
            local slider_wfFR = {}
            local slider_wfRL = {}
            local slider_wfRR = {}
            local slider_wwfFL = {}
            local slider_wwfFR = {}
            local slider_wwfRL = {}
            local slider_wwfRR = {}
            local sliderStartPos = {}
            local plyVeh = GetVehiclePedIsIn(plyPed, false)

            performVehicleCheck = false

            SetEntityCoords(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].coords)
            SetEntityHeading(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].heading)
            FreezeEntityPosition(plyVeh, true)
            SetEntityCollision(plyVeh, false, true)


            for i = 0.0, 1.56, 0.01 do
                slider_wWidth[#slider_wWidth + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelWidth(plyVeh), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wWidth
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfFL[#slider_wfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfFR[#slider_wfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wfRL[#slider_wfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wfRR[#slider_wfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelXOffset(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wfRR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfFL[#slider_wwfFL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 0), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfFR[#slider_wwfFR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 1), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfFR
                end
            end

            for i = 0.0, -1.56, -0.01 do
                slider_wwfRL[#slider_wwfRL + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 2), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRL
                end
            end

            for i = 0.0, 1.56, 0.01 do
                slider_wwfRR[#slider_wwfRR + 1] = roundNum(i, 2)

                if math.abs(i - roundNum(GetVehicleWheelYRotation(plyVeh, 3), 2)) < 0.00000001 then
                    sliderStartPos[#sliderStartPos + 1] = #slider_wwfRR
                end
            end

            currentFitmentsToSet.width = GetVehicleWheelWidth(plyVeh)
            currentFitmentsToSet.fl = GetVehicleWheelXOffset(plyVeh, 0)
            currentFitmentsToSet.fr = GetVehicleWheelXOffset(plyVeh, 1)
            currentFitmentsToSet.rl = GetVehicleWheelXOffset(plyVeh, 2)
            currentFitmentsToSet.rr = GetVehicleWheelXOffset(plyVeh, 3)
            currentFitmentsToSet.wfl = GetVehicleWheelYRotation(plyVeh, 0)
            currentFitmentsToSet.wfr = GetVehicleWheelYRotation(plyVeh, 1)
            currentFitmentsToSet.wrl = GetVehicleWheelYRotation(plyVeh, 2)
            currentFitmentsToSet.wrr = GetVehicleWheelYRotation(plyVeh, 3)
            checkVehicleFitment()

            exports['qb-core']:HideText()

            DisplayMenu2(true, slider_wWidth, slider_wfFL, slider_wfFR, slider_wfRL, slider_wfRR, slider_wwfFL, slider_wwfFR, slider_wwfRL, slider_wwfRR, sliderStartPos)
        end
    end
end

if Config.AdminMenu == 'qb-adminmenu' then
    RegisterNetEvent("qb-admin:client:ToggleDevmode", function(pDevmode)
        devmode = pDevmode
    end)
end

if Config.AdminMenu == 'script-menuadmin' then
    RegisterNetEvent("script-menuadmin:client:ToggleDevmode", function(pDevmode)
        devmode = pDevmode
    end)
end

-- #[Event Handlers]#--
RegisterNetEvent("script-customs:client:applySavedWheelFitment")
AddEventHandler("script-customs:client:applySavedWheelFitment", function(wheelFitments, plyVeh)
    performVehicleCheck = false

    SetVehicleWheelWidth(plyVeh, wheelFitments.width)
    SetVehicleWheelXOffset(plyVeh, 0, wheelFitments.fl)
    SetVehicleWheelXOffset(plyVeh, 1, wheelFitments.fr)
    SetVehicleWheelXOffset(plyVeh, 2, wheelFitments.rl)
    SetVehicleWheelXOffset(plyVeh, 3, wheelFitments.rr)

    SetVehicleWheelYRotation(plyVeh, 0, wheelFitments.wfl)
    SetVehicleWheelYRotation(plyVeh, 1, wheelFitments.wfr)
    SetVehicleWheelYRotation(plyVeh, 2, wheelFitments.wrl)
    SetVehicleWheelYRotation(plyVeh, 3, wheelFitments.wrr)

    if not DecorExistOn(plyVeh, "custom-wheelfitment_applied") then
        DecorSetBool(plyVeh, "custom-wheelfitment_applied", true)
    end

    DecorSetFloat(plyVeh, "custom-wheelfitment_w_width", wheelFitments.width)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_fl", wheelFitments.fl)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_fr", wheelFitments.fr)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_rl", wheelFitments.rl)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_rr", wheelFitments.rr)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_wfl", wheelFitments.wfl)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_wfr", wheelFitments.wfr)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_wrl", wheelFitments.wrl)
    DecorSetFloat(plyVeh, "custom-wheelfitment_w_wrr", wheelFitments.wrr)

    performVehicleCheck = true
    checkVehicleFitment()
end)

RegisterNetEvent("script-customs:client:forceMenuClose")
AddEventHandler("script-customs:client:forceMenuClose", function()
    if isMenuShowing then
        local plyPed = PlayerPedId()
        local plyVeh = GetVehiclePedIsIn(plyPed, false)

        if plyVeh ~= 0 or plyVeh ~= nil then
            SetEntityCoords(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].coords)
            SetEntityHeading(plyVeh, Config.LocationsFitment['WheelFitment'].zones[1].heading)
            FreezeEntityPosition(plyVeh, false)
            SetEntityCollision(plyVeh, true, true)
        end
    end

    SyncWheelFitment()
    ToggleMenu(false)
end)

CreateThread(function()
    for location, data in pairs(Config.LocationsFitment) do
        -- PolyZone + Drawtext + Locations Management
        for i, spot in ipairs(data.zones) do
            local _name = location.."-fitment-"..i
            local newSpot = BoxZone:Create(spot.coords, spot.length, spot.width, {
                name = _name,
                debugPoly = Config.DebugPoly,
                heading = spot.heading,
                minZ = spot.minZ,
                maxZ = spot.maxZ,
            })

            newSpot:onPlayerInOut(function(isPointInside, point)
                if isPointInside then
                    WheelFitmentData = {
                        ['location'] = location,
                        ['spot'] = _name,
                        ['coords'] = vector3(spot.coords.x, spot.coords.y, spot.coords.z),
                        ['heading'] = spot.heading,
                        ['drawtextui'] = data.drawtextui.text,
                    }
                    SetupInteractionFitment()
                    CheckForGhostVehicle()
                elseif WheelFitmentData['location'] == location and WheelFitmentData['spot'] == _name then
                    WheelFitmentData = {}
                    exports['qb-radialmenu']:RemoveOption(radialMenuItemId)
                    radialMenuItemId = nil

                    exports['qb-core']:HideText()
                end
            end)
        end

        -- Blips
        local blipData = data.blip
        if blipData and blipData.enabled then CreateBlip(blipData) end
    end
end)


exports('GetWheelFitmentData', function() if next(WheelFitmentData) ~= nil then return WheelFitmentData else return nil end end)








RegisterNetEvent("ReceiveInformation", function(VehiclesDataServer)
    VehiclesData = VehiclesDataServer
end)

RegisterNetEvent("SetCustom:client", function(vehicle, offset, stanceId)
    if LocalPlayer.state.isLoggedIn and not isPlyInBennys and not isMenuShowing then
        local vehId = NetToVeh(vehicle)
        local myid = GetPlayerServerId(PlayerId())
        if vehId ~= 0 then
            if myid ~= stanceId then
                -- Wheel Fitment:
                SetVehicleWheelXOffset(vehId, 0, offset.wheelOffsetFrontLeft)
                SetVehicleWheelXOffset(vehId, 1, offset.wheelOffsetFrontRight)
                SetVehicleWheelXOffset(vehId, 2, offset.wheelOffsetRearLeft)
                SetVehicleWheelXOffset(vehId, 3, offset.wheelOffsetRearRight)

                SetVehicleWheelYRotation(vehId, 0, offset.wheelRotationFrontLeft)
                SetVehicleWheelYRotation(vehId, 1, offset.wheelRotationFrontRight)
                SetVehicleWheelYRotation(vehId, 2, offset.wheelRotationRearLeft)
                SetVehicleWheelYRotation(vehId, 3, offset.wheelRotationRearRight)
            end
        end
    end
end)

CreateThread(function()
    while true do
        if LocalPlayer.state.isLoggedIn and not isPlyInBennys and not isMenuShowing then
            local plyPed = PlayerPedId()
            local plyVeh = GetVehiclePedIsIn(plyPed)
            if plyVeh then
                local plate = QBCore.Functions.GetPlate(plyVeh)
                if VehiclesData[plate] ~= nil then
                    local NetworkVehicle = VehToNet(plyVeh)
                    -- Wheel Fitment:
                    TriggerServerEvent("SetCustom:server", NetworkVehicle, VehiclesData[plate].vehicleconfig)

                    SetVehicleWheelXOffset(plyVeh, 0, VehiclesData[plate].vehicleconfig.wheelOffsetFrontLeft)
                    SetVehicleWheelXOffset(plyVeh, 1, VehiclesData[plate].vehicleconfig.wheelOffsetFrontRight)
                    SetVehicleWheelXOffset(plyVeh, 2, VehiclesData[plate].vehicleconfig.wheelOffsetRearLeft)
                    SetVehicleWheelXOffset(plyVeh, 3, VehiclesData[plate].vehicleconfig.wheelOffsetRearRight)
                
                    SetVehicleWheelYRotation(plyVeh, 0, VehiclesData[plate].vehicleconfig.wheelRotationFrontLeft)
                    SetVehicleWheelYRotation(plyVeh, 1, VehiclesData[plate].vehicleconfig.wheelRotationFrontRight)
                    SetVehicleWheelYRotation(plyVeh, 2, VehiclesData[plate].vehicleconfig.wheelRotationRearLeft)
                    SetVehicleWheelYRotation(plyVeh, 3, VehiclesData[plate].vehicleconfig.wheelRotationRearRight)
                end
            end
        end
        Wait(10)
    end
end)