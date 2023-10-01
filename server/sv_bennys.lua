-----------------------
----   Variables   ----
-----------------------
QBCore = nil
if Config.Version == "new" then
    QBCore = Config.Export
else
    TriggerEvent(Config.Trigger, function(obj) QBCore = obj end)
end

local RepairCosts = {}

local VehiclesData = {}

-----------------------
----   Functions   ----
-----------------------

local function IsVehicleOwned(plate)
    local retval = false
    local result = MySQL.Sync.fetchScalar('SELECT plate FROM player_vehicles WHERE plate = ?', {plate})
    if result then retval = true end
    return retval
end

-----------------------
----   Threads     ----
-----------------------

-----------------------
---- Server Events ----
-----------------------

AddEventHandler("playerDropped", function()
	local source = source
    RepairCosts[source] = nil
end)

RegisterNetEvent('script-customs:server:attemptPurchase', function(type, upgradeLevel)
    local source = source
    local Player = QBCore.Functions.GetPlayer(source)
    local moneyType = Config.MoneyType
    local balance = Player.Functions.GetMoney(moneyType)

    if type == "repair" then
        local repairCost = RepairCosts[source] or 600
        moneyType = Config.RepairMoneyType
        balance = Player.Functions.GetMoney(moneyType)
        if balance >= repairCost then
            Player.Functions.RemoveMoney(moneyType, repairCost, "bennys")
            TriggerClientEvent('script-customs:client:purchaseSuccessful', source)
	exports['qb-management']:AddMoney("mechanic", repairCost)
        else
            TriggerClientEvent('script-customs:client:purchaseFailed', source)
        end
    elseif type == "performance" or type == "turbo" then
        if balance >= vehicleCustomisationPrices[type].prices[upgradeLevel] then
            TriggerClientEvent('script-customs:client:purchaseSuccessful', source)
            Player.Functions.RemoveMoney(moneyType, vehicleCustomisationPrices[type].prices[upgradeLevel], "bennys")
	exports['qb-management']:AddMoney("mechanic", vehicleCustomisationPrices[type].prices[upgradeLevel]) 
        else
            TriggerClientEvent('script-customs:client:purchaseFailed', source)
        end
    else
        if balance >= vehicleCustomisationPrices[type].price then
            TriggerClientEvent('script-customs:client:purchaseSuccessful', source)
            Player.Functions.RemoveMoney(moneyType, vehicleCustomisationPrices[type].price, "bennys")
	exports['qb-management']:AddMoney("mechanic", vehicleCustomisationPrices[type].price) 
        else
            TriggerClientEvent('script-customs:client:purchaseFailed', source)
        end
    end
end)

RegisterNetEvent('script-customs:server:updateRepairCost', function(cost)
    local source = source
    RepairCosts[source] = cost
end)

RegisterNetEvent("script-customs:server:updateVehicle", function(myCar, type)
    if type == "customs" then
        if IsVehicleOwned(myCar.plate) then
            MySQL.Async.execute('UPDATE player_vehicles SET mods = ? WHERE plate = ?', {json.encode(myCar), myCar.plate})
        end
    elseif type == "stancer" then
        if IsVehicleOwned(myCar.plate) then
            MySQL.Async.execute('UPDATE player_vehicles SET mods = ? WHERE plate = ?', {json.encode(myCar), myCar.plate})
            TriggerEvent('trd-tuners-main:server:SetTuns', myCar.plate, myCar)
        end
    end
end)

-- Use somthing like this to dynamically enable/disable a location. Can be used to change anything at a location.
-- TriggerEvent('script-customs:server:UpdateLocation', 'Hayes', 'settings', 'enabled', test)

RegisterNetEvent('script-customs:server:UpdateLocation', function(location, type, key, value)
    Config.Locations[location][type][key] = value
    TriggerClientEvent('script-customs:client:UpdateLocation', -1, location, type, key, value)
end)

QBCore.Functions.CreateCallback('script-customs:server:GetLocations', function(source, cb)
	cb(Config.Locations)
end)



RegisterNetEvent('trd-tuners-main:server:SetTuns', function(plate, config)
    if VehiclesData[plate] ~= nil then
        VehiclesData[plate]["vehicleconfig"] = config
        TriggerClientEvent("ReceiveInformation", -1, VehiclesData)
    else
        VehiclesData[plate] = {}
        VehiclesData[plate].plate = plate
        VehiclesData[plate].vehicleconfig = config
        TriggerClientEvent("ReceiveInformation", -1, VehiclesData)
    end
end)

RegisterNetEvent("SetCustom:server", function(netId, offset)
    TriggerClientEvent("SetCustom:client", -1, netId, offset, source)
end)