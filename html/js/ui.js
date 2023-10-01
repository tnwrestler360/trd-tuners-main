window.onload = function(e)
{
    let menuStructure = {};
    let maxMenuItems = 10;

    function toggleMenuContainer(state, image)
    {
        if(state)
        {
            $("#menu_container").fadeIn("fast", "swing");
            $("#menu_banner").attr("src", `images/${image}.jpg`);
        }
        else
        {
            $("#menu_container").fadeOut("fast", "swing");
        }
    }

    function createMenu(menu, heading, subheading)
    {
        menuStructure[menu] = 
        {
            menu: menu,
            heading: heading,
            subheading: subheading,
            selectedItem: 0,
            previousSelectedItemID: null,
            container: "<ul id = 'menu_items' class = '" + menu + "' style = 'display: none; order: 6;'></ul>",
            items: {},
            itemsArray: {}
        }

        $("#menu_container").append(menuStructure[menu].container);
    }

    function destroyMenus()
    {
        for(var k in menuStructure)
        {
            $("." + menuStructure[k].menu).remove();
        }
        
        menuStructure = {}
    }

    function populateMenu(menu, id, item, item2)
    {
        menuStructure[menu].items[id] = 
        {
            id: id,
            item: item,
            item2: item2
        }

        if(item2 == "none")
        {
            $("." + menu).append("<li class = '" + id + "'><span class = 'item1'>" + item + "</span></li>");
        }
        else
        {
            $("." + menu).append("<li class = '" + id + "'><span class = 'item1'>" + item + "</span> <span class = 'item2' style = 'float: right;'>" + item2 + "</span></li>");
        }
    }

    function finishPopulatingMenu(menu)
    {
        menuStructure[menu].itemsArray = $("." + menu + " li").toArray();
    }

    function updateMenuHeading(menu)
    {
        $("#menu_heading span").text(menuStructure[menu].heading);
    }

    function updateMenuSubheading(menu)
    {
        $("#menu_subheading span").text(menuStructure[menu].subheading);
    }

    function updateMenuStatus(text)
    {
        $("#menu_status span").text(text);
    }

    function toggleMenu(state, menu)
    {
        if(state)
        {
            if(menuStructure[menu].selectedItem < maxMenuItems)
            {
                $("." + menu).empty();

                for(var i = 0; i < Object.keys(menuStructure[menu].itemsArray).length; i++)
                {
                    if(i < maxMenuItems)
                    {
                        $("." + menu).append(menuStructure[menu].itemsArray[i]);
                    }
                }

                $("." + menu + " .item_selected").find("i").remove();
                menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                var currentHTML = $("." + menu + " .item_selected").html();
                $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                var val2 = $("." + menu + " .item_selected .item1").text();
                var val3 = $("." + menu + " .item_selected .item2").text();
                $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                    id: val1,
                    item: val2,
                    item2: val3
                }));
            }
            else
            {
                $("." + menu).empty();

                for(var i = 0; i < Object.keys(menuStructure[menu].itemsArray).length; i++)
                {
                    if(i > (menuStructure[menu].selectedItem - maxMenuItems) && i <= (maxMenuItems + (menuStructure[menu].selectedItem - maxMenuItems)))
                    {
                        $("." + menu).append(menuStructure[menu].itemsArray[i]);
                    }
                }

                $("." + menu + " .item_selected").find("i").remove();
                menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                var currentHTML = $("." + menu + " .item_selected").html();
                $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                var val2 = $("." + menu + " .item_selected .item1").text();
                var val3 = $("." + menu + " .item_selected .item2").text();
                $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                    id: val1,
                    item: val2,
                    item2: val3
                }));
            }

            $("." + menu).show();
        }
        else
        {
            $("." + menu).hide();
        }
    }

    function updateItem2TextOnly(menu, id, text)
    {
        $("." + menu + " ." + id + " .item2").text(text);
        $.post(`https://${GetParentResourceName()}/updateItem2`, JSON.stringify({
            item: text
        }));
    }

    function updateItem2Text(menu, id, text)
    {
        if(menuStructure[menu].previousSelectedItemID == null)
        {
            $("." + menu + " ." + id + " .item2").text(text);

            menuStructure[menu].previousSelectedItemID = id
        }
        else if(id != menuStructure[menu].previousSelectedItemID)
        {
            var prevID = menuStructure[menu].previousSelectedItemID
            if(menuStructure[menu].itemsArray[prevID] != undefined) {
                $("." + menu + " ." + prevID + " .item2").text(menuStructure[menu].items[prevID].item2);
                menuStructure[menu].itemsArray[prevID].getElementsByClassName("item2")[0].textContent = menuStructure[menu].items[prevID].item2;
            } else {
                for (let i = 0; i < menuStructure[menu].itemsArray.length; i++) {
                    if(menuStructure[menu].itemsArray[i].classList.contains(prevID)) {
                        $("." + menu + " ." + prevID + " .item2").text(menuStructure[menu].items[prevID].item2);
                        menuStructure[menu].itemsArray[i].getElementsByClassName("item2")[0].textContent = menuStructure[menu].items[prevID].item2;
                    }
                }
            }
            menuStructure[menu].previousSelectedItemID = id;

            $("." + menu + " .item_selected .item2").text(text);
        }
        else
        {
            $("." + menu + " ." + id + " .item2").text(text);

            menuStructure[menu].previousSelectedItemID = null
        }

        $.post(`https://${GetParentResourceName()}/updateItem2`, JSON.stringify({
            item: text
        }));
    }

    function updateItem2ID(menu, id, text)
    {
        menuStructure[menu].previousSelectedItemID = id
    }

    function scrollMenuFunctionality(direction, menu)
    {
        switch(direction)
        {
            case "down":
                if(menuStructure[menu].selectedItem < (maxMenuItems - 1) && menuStructure[menu].selectedItem < (Object.keys(menuStructure[menu].itemsArray).length - 1))
                {
                    menuStructure[menu].selectedItem++;

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    $("." + menu + " .item_selected").find("i").remove();

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem - 1].classList.remove("item_selected");
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
                else if(menuStructure[menu].selectedItem < (Object.keys(menuStructure[menu].itemsArray).length - 1))
                {
                    menuStructure[menu].selectedItem++;

                    $("." + menu).append(menuStructure[menu].itemsArray[menuStructure[menu].selectedItem]);
                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    $("." + menu + " .item_selected").find("i").remove();

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem - 1].classList.remove("item_selected");
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem - maxMenuItems].remove();

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
                else if(menuStructure[menu].selectedItem == (Object.keys(menuStructure[menu].itemsArray).length - 1))
                {
                    menuStructure[menu].selectedItem = 0;
                    $("." + menu + " .item_selected").find("i").remove();
                    $("." + menu).empty();

                    for(var i = 0; i < Object.keys(menuStructure[menu].itemsArray).length; i++)
                    {
                        if(i < maxMenuItems)
                        {
                            $("." + menu).append(menuStructure[menu].itemsArray[i]);
                        }
                    }
                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    if (Object.keys(menuStructure[menu].itemsArray).length - 1 != 0) {
                        menuStructure[menu].itemsArray[Object.keys(menuStructure[menu].itemsArray).length - 1].classList.remove("item_selected");
                    }
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
            break;

            case "up":
                if(menuStructure[menu].selectedItem == 0)
                {
                    menuStructure[menu].selectedItem = Object.keys(menuStructure[menu].itemsArray).length - 1;

                    $("." + menu + " .item_selected").find("i").remove();
                    $("." + menu).empty();

                    for(var i = 0; i < Object.keys(menuStructure[menu].itemsArray).length; i++)
                    {
                        if(i > (menuStructure[menu].selectedItem - maxMenuItems) && i <= (maxMenuItems + (menuStructure[menu].selectedItem - maxMenuItems)))
                        {
                            $("." + menu).append(menuStructure[menu].itemsArray[i]);
                        }
                    }

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    if (Object.keys(menuStructure[menu].itemsArray).length - 1 != 0) {
                        menuStructure[menu].itemsArray[0].classList.remove("item_selected");
                    }
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
                else if(menuStructure[menu].selectedItem < (maxMenuItems) && menuStructure[menu].selectedItem > 0)
                {
                    menuStructure[menu].selectedItem--;

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    $("." + menu + " .item_selected").find("i").remove();

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem + 1].classList.remove("item_selected");
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
                else if(menuStructure[menu].selectedItem > (maxMenuItems - 1))
                {
                    menuStructure[menu].selectedItem--;

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem].classList.add("item_selected");
                    $("." + menu + " .item_selected").find("i").remove();

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem + 1].classList.remove("item_selected");
                    var currentHTML = $("." + menu + " .item_selected").html();
                    $("." + menu + " .item_selected").html("<i class='fas fa-angle-double-right'></i> " + currentHTML);

                    menuStructure[menu].itemsArray[menuStructure[menu].selectedItem + 1].remove();

                    $("." + menu).prepend(menuStructure[menu].itemsArray[(menuStructure[menu].selectedItem - maxMenuItems) + 1]);

                    var val1 = $("." + menu + " .item_selected").attr("class").split(" ")[0];
                    var val2 = $("." + menu + " .item_selected .item1").text();
                    var val3 = $("." + menu + " .item_selected .item2").text();
                    $.post(`https://${GetParentResourceName()}/selectedItem`, JSON.stringify({
                        id: val1,
                        item: val2,
                        item2: val3
                    }));
                }
            break;
        }
    }

    function playSoundEffect(soundEffect, volume)
    {
        var audioPlayer = null;

        if(audioPlayer != null)
        {
            audioPlayer.pause();
        }

        audioPlayer = new Howl({src: ["./sounds/" + soundEffect + ".ogg"]});
        audioPlayer.volume(volume);
        audioPlayer.play();
    }

    window.addEventListener("message", function(event)
    {
        var eventData = event.data;

        if(eventData.toggleMenuContainer)
        {
            toggleMenuContainer(eventData.state, eventData.image);
        }

        if(eventData.createMenu)
        {
            createMenu(eventData.menu, eventData.heading, eventData.subheading);
        }

        if(eventData.destroyMenus)
        {
            destroyMenus();
        }

        if(eventData.populateMenu)
        {
            populateMenu(eventData.menu, eventData.id, eventData.item, eventData.item2);
        }

        if(eventData.finishPopulatingMenu)
        {
            finishPopulatingMenu(eventData.menu);
        }

        if(eventData.updateMenuHeading)
        {
            updateMenuHeading(eventData.menu);
        }

        if(eventData.updateMenuSubheading)
        {
            updateMenuSubheading(eventData.menu);
        }

        if(eventData.updateMenuStatus)
        {
            updateMenuStatus(eventData.statusText)
        }

        if(eventData.toggleMenu)
        {
            toggleMenu(eventData.state, eventData.menu);
        }

        if(eventData.updateItem2Text)
        {
            updateItem2Text(eventData.menu, eventData.id, eventData.item2)
        }

        if(eventData.updateItem2TextOnly)
        {
            updateItem2TextOnly(eventData.menu, eventData.id, eventData.item2)
        }

        if(eventData.scrollMenuFunctionality)
        {
            scrollMenuFunctionality(eventData.direction, eventData.menu);
        }

        if(eventData.playSoundEffect)
        {
            playSoundEffect(eventData.soundEffect, eventData.volume);
        }
    });


























    let activeMenuIndex = 0;

    function toggleMenu2(state)
    {
        var menu = menuStructure[0];
        
        if(state)
        {
            if(menu.currentItem < maxMenuItems)
            {
                $(`.${menu.menu}`).empty();

                for(var i = 0; i < Object.keys(menu.itemsArray).length; i++)
                {
                    if(i < maxMenuItems)
                    {
                        $(`.${menu.menu}`).append(menu.itemsArray[i]);
                    }
                }

                $(`.${menu.menu} .item_selected`).find("i").remove();
                menu.itemsArray[menu.currentItem].classList.add("item_selected");
                var currentHTML = $(`.${menu.menu} .item_selected`).html();
                $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                    menu: menu.menu,
                    name: val1,
                    item_1: val2,
                    item_2: val3,
                    type_1: val4,
                    type_2: val5,
                    sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                    sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                    sliderPos: menu.items[menu.currentItem].currentSlider
                }));
            }
            else
            {
                $(`.${menu.menu}`).empty();

                for(var i = 0; i < Object.keys(menu.itemsArray).length; i++)
                {
                    if(i > (menu.currentItem - maxMenuItems) && i <= (maxMenuItems + (menu.currentItem - maxMenuItems)))
                    {
                        $(`.${menu.menu}`).append(menu.itemsArray[i]);
                    }
                }

                $(`.${menu.menu} .item_selected`).find("i").remove();
                menu.itemsArray[menu.currentItem].classList.add("item_selected");
                var currentHTML = $(`.${menu.menu} .item_selected`).html();
                $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                    menu: menu.menu,
                    name: val1,
                    item_1: val2,
                    item_2: val3,
                    type_1: val4,
                    type_2: val5,
                    sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                    sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                    sliderPos: menu.items[menu.currentItem].currentSlider
                }));
            }

            $("#menu_heading span").text(menu.heading);
            $("#menu_subheading span").text(menu.subheading);
            $(`.${menu.menu}`).show();
            $("#menu_container").fadeIn("fast", "swing");
            $("#menu_banner").attr("src", `images/6str.jpg`);
        }
        else
        {
            $("#menu_container").fadeOut("fast", "swing");
            $(`.${menu.menu}`).hide();
        }
    }

    function createMenu2(structure)
    {
        menuStructure = structure

        for(var i in menuStructure)
        {
            var menu = menuStructure[i];

            $("#menu_container").append(`<ul id = "menu_items" class = "${menu.menu}" style = "display: none; order: 5;"></ul>`);

            for(var j in menu.items)
            {
                var item = menu.items[j];

                if(item.type_1 == "slider")
                {
                    item.label_1 = "< " + item.sliderItems_1[item.sliderStartPos - 1] + " >";

                    item.currentSlider = item.sliderStartPos - 1;
                }

                if(item.type_2 == "slider")
                {
                    item.label_2 = "< " + item.sliderItems_2[item.sliderStartPos - 1] + " >";

                    item.currentSlider = item.sliderStartPos - 1;
                }

                $(`.${menu.menu}`).append(`<li class = "${item.name}"><span class = "item_1 ${item.type_1}">${item.label_1}</span> <span class = "item_2 ${item.type_2}" style = "float: right;">${item.label_2}</span></li>`);
            }

            menu.itemsArray = $(`.${menu.menu} li`).toArray();
            menu.currentItem = 0;
            menu.previousItem = 0;
        }

        activeMenuIndex = 0;
    }

    function destroyMenu2()
    {
        for(var i in menuStructure)
        {
            $(`.${menuStructure[i].menu}`).remove();
        }

        menuStructure = {}
    }

    function addMenu2(structure)
    {
        menuStructure[Object.keys(menuStructure).length + 1] = structure;

        var menu = menuStructure[Object.keys(menuStructure).length];

        $("#menu_container").append(`<ul id = "menu_items" class = "${menu.menu}" style = "display: none; order: 6;"></ul>`);

        for(var j in menu.items)
        {
            var item = menu.items[j];

            if(item.type_1 == "slider")
            {
                item.label_1 = "< " + item.sliderItems_1[item.sliderStartPos - 1] + " >";

                item.currentSlider = item.sliderStartPos - 1;
            }

            if(item.type_2 == "slider")
            {
                item.label_2 = "< " + item.sliderItems_2[item.sliderStartPos - 1] + " >";

                item.currentSlider = item.sliderStartPos - 1;
            }

            $(`.${menu.menu}`).append(`<li class = "${item.name}"><span class = "item_1 ${item.type_1}">${item.label_1}</span> <span class = "item_2 ${item.type_2}" style = "float: right;">${item.label_2}</span></li>`);
        }

        menu.itemsArray = $(`.${menu.menu} li`).toArray();
        menu.currentItem = 0;
        menu.previousItem = 0;
    }

    function removeMenu2(menu)
    {
        for(var i in menuStructure)
        {
            if(menuStructure[i].menu == menu)
            {
                $(`.${menuStructure[i].menu}`).remove();
                menuStructure.splice(i, 1);

                break;
            }
        }
    }

    function switchMenu2(menu)
    {
        $(`.${menuStructure[activeMenuIndex].menu}`).hide();

        for(var i in menuStructure)
        {
            if(menuStructure[i].menu == menu)
            {
                activeMenuIndex = i;

                break;
            }
        }

        $("#menu_heading span").text(menuStructure[activeMenuIndex].heading);
        $("#menu_subheading span").text(menuStructure[activeMenuIndex].subheading);

        if(menuStructure[activeMenuIndex].currentItem < maxMenuItems)
        {
            $(`.${menuStructure[activeMenuIndex].menu}`).empty();

            for(var i = 0; i < Object.keys(menuStructure[activeMenuIndex].itemsArray).length; i++)
            {
                if(i < maxMenuItems)
                {
                    $(`.${menuStructure[activeMenuIndex].menu}`).append(menuStructure[activeMenuIndex].itemsArray[i]);
                }
            }
        }
        else
        {
            $(`.${menuStructure[activeMenuIndex].menu}`).empty();

            for(var i = 0; i < Object.keys(menuStructure[activeMenuIndex].itemsArray).length; i++)
            {
                if(i > (menuStructure[activeMenuIndex].currentItem - maxMenuItems) && i <= (maxMenuItems + (menuStructure[activeMenuIndex].currentItem - maxMenuItems)))
                {
                    $(`.${menuStructure[activeMenuIndex].menu}`).append(menuStructure[activeMenuIndex].itemsArray[i]);
                }
            }
        }

        $(`.${menuStructure[activeMenuIndex].menu} .item_selected`).find("i").remove();
        menuStructure[activeMenuIndex].itemsArray[menuStructure[activeMenuIndex].currentItem].classList.add("item_selected");
        var currentHTML = $(`.${menuStructure[activeMenuIndex].menu} .item_selected`).html();
        $(`.${menuStructure[activeMenuIndex].menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

        var val1 = $(`.${menuStructure[activeMenuIndex].menu} .item_selected`).attr("class").split(" ")[0];
        var val2 = $(`.${menuStructure[activeMenuIndex].menu} .item_selected .item_1`).text();
        var val3 = $(`.${menuStructure[activeMenuIndex].menu} .item_selected .item_2`).text();
        var val4 = $(`.${menuStructure[activeMenuIndex].menu} .item_selected .item_1`).attr("class").split(" ")[1];
        var val5 = $(`.${menuStructure[activeMenuIndex].menu} .item_selected .item_2`).attr("class").split(" ")[1];

        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
            menu: menuStructure[activeMenuIndex].menu,
            name: val1,
            item_1: val2,
            item_2: val3,
            type_1: val4,
            type_2: val5,
            sliderItems_1: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].sliderItems_1,
            sliderItems_2: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].sliderItems_2,
            sliderPos: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].currentSlider
        }));

        $.post(`https://${GetParentResourceName()}/switchedMenuSuccessfully`, JSON.stringify({
            menu: menuStructure[activeMenuIndex].menu,
            name: val1,
            item_1: val2,
            item_2: val3,
            type_1: val4,
            type_2: val5,
            sliderItems_1: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].sliderItems_1,
            sliderItems_2: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].sliderItems_2,
            sliderPos: menuStructure[activeMenuIndex].items[menuStructure[activeMenuIndex].currentItem].currentSlider
        }));

        $(`.${menuStructure[activeMenuIndex].menu}`).show();
    }

    function updateMenuStatus2(text)
    {
        $("#menu_status span").text(text);
    }

    function updateItemSliderItems2(menu, item, name, sliderItems)
    {
        for(var i in menuStructure)
        {
            if(menuStructure[i].menu == menu)
            {
                if(item == 1)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].currentSlider = 0;
                            menuStructure[i].items[j].sliderItems_1 = sliderItems;

                            menuStructure[i].items[j].label_1 = menuStructure[i].items[j].sliderItems_1[menuStructure[i].items[j].currentSlider];

                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_1`).text("< " + menuStructure[i].items[j].label_1 + " >");
                        }
                    }
                }
                else if(item == 2)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].currentSlider = 0;
                            menuStructure[i].items[j].sliderItems_2 = sliderItems;

                            menuStructure[i].items[j].label_2 = menuStructure[i].items[j].sliderItems_2[menuStructure[i].items[j].currentSlider];
                            
                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_2`).text("< " + menuStructure[i].items[j].label_2 + " >");
                        }
                    }
                }

                var val1 = $(`.${menuStructure[i].menu} .item_selected`).attr("class").split(" ")[0];
                var val2 = $(`.${menuStructure[i].menu} .item_selected .item_1`).text();
                var val3 = $(`.${menuStructure[i].menu} .item_selected .item_2`).text();
                var val4 = $(`.${menuStructure[i].menu} .item_selected .item_1`).attr("class").split(" ")[1];
                var val5 = $(`.${menuStructure[i].menu} .item_selected .item_2`).attr("class").split(" ")[1];

                $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                    menu: menuStructure[i].menu,
                    name: val1,
                    item_1: val2,
                    item_2: val3,
                    type_1: val4,
                    type_2: val5,
                    sliderItems_1: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_1,
                    sliderItems_2: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_2,
                    sliderPos: menuStructure[i].items[menuStructure[i].currentItem].currentSlider
                }));

                break;
            }
        }
    }

    function updateItemSlider2(menu, item, name, sliderPos)
    {
        for(var i in menuStructure)
        {
            if(menuStructure[i].menu == menu)
            {
                if(item == 1)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].currentSlider = sliderPos - 1;

                            menuStructure[i].items[j].label_1 = menuStructure[i].items[j].sliderItems_1[menuStructure[i].items[j].currentSlider];

                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_1`).text("< " + menuStructure[i].items[j].label_1 + " >");
                        }
                    }
                }
                else if(item == 2)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].currentSlider = sliderPos - 1;

                            menuStructure[i].items[j].label_2 = menuStructure[i].items[j].sliderItems_2[menuStructure[i].items[j].currentSlider];
                            
                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_2`).text("< " + menuStructure[i].items[j].label_2 + " >");
                        }
                    }
                }

                var val1 = $(`.${menuStructure[i].menu} .item_selected`).attr("class").split(" ")[0];
                var val2 = $(`.${menuStructure[i].menu} .item_selected .item_1`).text();
                var val3 = $(`.${menuStructure[i].menu} .item_selected .item_2`).text();
                var val4 = $(`.${menuStructure[i].menu} .item_selected .item_1`).attr("class").split(" ")[1];
                var val5 = $(`.${menuStructure[i].menu} .item_selected .item_2`).attr("class").split(" ")[1];

                $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                    menu: menuStructure[i].menu,
                    name: val1,
                    item_1: val2,
                    item_2: val3,
                    type_1: val4,
                    type_2: val5,
                    sliderItems_1: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_1,
                    sliderItems_2: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_2,
                    sliderPos: menuStructure[i].items[menuStructure[i].currentItem].currentSlider
                }));

                break;
            }
        }
    }

    function updateItemText2(menu, item, name, label)
    {
        for(var i in menuStructure)
        {
            if(menuStructure[i].menu == menu)
            {
                if(item == 1)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].label_1 = label;

                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_1`).text(menuStructure[i].items[j].label_1);
                        }
                    }
                }
                else if(item == 2)
                {
                    for(var j in menuStructure[i].items)
                    {
                        if(menuStructure[i].items[j].name == name)
                        {
                            menuStructure[i].items[j].label_2 = label;

                            $(`.${menuStructure[i].menu} .${menuStructure[i].items[j].name} .item_2`).text(menuStructure[i].items[j].label_2);
                        }
                    }
                }

                var val1 = $(`.${menuStructure[i].menu} .item_selected`).attr("class").split(" ")[0];
                var val2 = $(`.${menuStructure[i].menu} .item_selected .item_1`).text();
                var val3 = $(`.${menuStructure[i].menu} .item_selected .item_2`).text();
                var val4 = $(`.${menuStructure[i].menu} .item_selected .item_1`).attr("class").split(" ")[1];
                var val5 = $(`.${menuStructure[i].menu} .item_selected .item_2`).attr("class").split(" ")[1];

                $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                    menu: menuStructure[i].menu,
                    name: val1,
                    item_1: val2,
                    item_2: val3,
                    type_1: val4,
                    type_2: val5,
                    sliderItems_1: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_1,
                    sliderItems_2: menuStructure[i].items[menuStructure[i].currentItem].sliderItems_2,
                    sliderPos: menuStructure[i].items[menuStructure[i].currentItem].currentSlider
                }));

                break;
            }
        }
    }

    function scrollFunctionality2(direction)
    {
        var menu = menuStructure[activeMenuIndex];

        switch(direction)
        {
            case "left":
                if(menu.items[menu.currentItem].type_1 == "slider")
                {
                    if(menu.items[menu.currentItem].currentSlider == 0)
                    {
                        menu.items[menu.currentItem].currentSlider = Object.keys(menu.items[menu.currentItem].sliderItems_1).length - 1;

                        menu.items[menu.currentItem].label_1 = menu.items[menu.currentItem].sliderItems_1[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_1`).text("< " + menu.items[menu.currentItem].label_1 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.items[menu.currentItem].currentSlider > 0)
                    {
                        menu.items[menu.currentItem].currentSlider--;

                        menu.items[menu.currentItem].label_1 = menu.items[menu.currentItem].sliderItems_1[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_1`).text("< " + menu.items[menu.currentItem].label_1 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }

                if(menu.items[menu.currentItem].type_2 == "slider")
                {
                    if(menu.items[menu.currentItem].currentSlider == 0)
                    {
                        menu.items[menu.currentItem].currentSlider = Object.keys(menu.items[menu.currentItem].sliderItems_2).length - 1;

                        menu.items[menu.currentItem].label_2 = menu.items[menu.currentItem].sliderItems_2[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_2`).text("< " + menu.items[menu.currentItem].label_2 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.items[menu.currentItem].currentSlider > 0)
                    {
                        menu.items[menu.currentItem].currentSlider--;

                        menu.items[menu.currentItem].label_2 = menu.items[menu.currentItem].sliderItems_2[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_2`).text("< " + menu.items[menu.currentItem].label_2 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }
            break;

            case "right":
                if(menu.items[menu.currentItem].type_1 == "slider")
                {
                    if(menu.items[menu.currentItem].currentSlider < (Object.keys(menu.items[menu.currentItem].sliderItems_1).length - 1))
                    {
                        menu.items[menu.currentItem].currentSlider++;

                        menu.items[menu.currentItem].label_1 = menu.items[menu.currentItem].sliderItems_1[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_1`).text("< " + menu.items[menu.currentItem].label_1 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.items[menu.currentItem].currentSlider == (Object.keys(menu.items[menu.currentItem].sliderItems_1).length - 1))
                    {
                        menu.items[menu.currentItem].currentSlider = 0;

                        menu.items[menu.currentItem].label_1 = menu.items[menu.currentItem].sliderItems_1[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_1`).text("< " + menu.items[menu.currentItem].label_1 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }

                if(menu.items[menu.currentItem].type_2 == "slider")
                {
                    if(menu.items[menu.currentItem].currentSlider < (Object.keys(menu.items[menu.currentItem].sliderItems_2).length - 1))
                    {
                        menu.items[menu.currentItem].currentSlider++;

                        menu.items[menu.currentItem].label_2 = menu.items[menu.currentItem].sliderItems_2[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_2`).text("< " + menu.items[menu.currentItem].label_2 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.items[menu.currentItem].currentSlider == (Object.keys(menu.items[menu.currentItem].sliderItems_2).length - 1))
                    {
                        menu.items[menu.currentItem].currentSlider = 0;

                        menu.items[menu.currentItem].label_2 = menu.items[menu.currentItem].sliderItems_2[menu.items[menu.currentItem].currentSlider];

                        $(`.${menu.menu} .${menu.items[menu.currentItem].name} .item_2`).text("< " + menu.items[menu.currentItem].label_2 + " >");

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }
            break;

            case "down":
                if(Object.keys(menu.itemsArray).length > 1)
                {
                    if(menu.currentItem < (maxMenuItems - 1) && menu.currentItem < (Object.keys(menu.itemsArray).length - 1))
                    {
                        menu.currentItem++;

                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        $(`.${menu.menu} .item_selected`).find("i").remove();

                        menu.itemsArray[menu.currentItem - 1].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.currentItem < (Object.keys(menu.itemsArray).length - 1))
                    {
                        menu.currentItem++;

                        $(`.${menu.menu}`).append(menu.itemsArray[menu.currentItem]);
                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        $(`.${menu.menu} .item_selected`).find("i").remove();

                        menu.itemsArray[menu.currentItem - 1].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        menu.itemsArray[menu.currentItem - maxMenuItems].remove();

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.currentItem == (Object.keys(menu.itemsArray).length - 1))
                    {
                        menu.currentItem = 0;

                        $(`.${menu.menu} .item_selected`).find("i").remove();
                        $(`.${menu.menu}`).empty();

                        for(var i = 0; i < Object.keys(menu.itemsArray).length; i++)
                        {
                            if(i < maxMenuItems)
                            {
                                $(`.${menu.menu}`).append(menu.itemsArray[i]);
                            }
                        }

                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        menu.itemsArray[Object.keys(menu.itemsArray).length - 1].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }
            break;

            case "up":
                if(Object.keys(menu.itemsArray).length > 1)
                {
                    if(menu.currentItem == 0)
                    {
                        menu.currentItem = Object.keys(menu.itemsArray).length - 1;

                        $(`.${menu.menu} .item_selected`).find("i").remove();
                        $(`.${menu.menu}`).empty();

                        for(var i = 0; i < Object.keys(menu.itemsArray).length; i++)
                        {
                            if(i > (menu.currentItem - maxMenuItems) && i <= (maxMenuItems + (menu.currentItem - maxMenuItems)))
                            {
                                $(`.${menu.menu}`).append(menu.itemsArray[i]);
                            }
                        }

                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        menu.itemsArray[0].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.currentItem < (maxMenuItems) && menu.currentItem > 0)
                    {
                        menu.currentItem--;

                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        $(`.${menu.menu} .item_selected`).find("i").remove();

                        menu.itemsArray[menu.currentItem + 1].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                    else if(menu.currentItem > (maxMenuItems - 1))
                    {
                        menu.currentItem--;

                        menu.itemsArray[menu.currentItem].classList.add("item_selected");
                        $(`.${menu.menu} .item_selected`).find("i").remove();

                        menu.itemsArray[menu.currentItem + 1].classList.remove("item_selected");
                        var currentHTML = $(`.${menu.menu} .item_selected`).html();
                        $(`.${menu.menu} .item_selected`).html(`<i class = "fas fa-angle-double-right"></i> ${currentHTML}`);

                        menu.itemsArray[menu.currentItem + 1].remove();

                        $(`.${menu.menu}`).prepend(menu.itemsArray[(menu.currentItem - maxMenuItems) + 1]);

                        var val1 = $(`.${menu.menu} .item_selected`).attr("class").split(" ")[0];
                        var val2 = $(`.${menu.menu} .item_selected .item_1`).text();
                        var val3 = $(`.${menu.menu} .item_selected .item_2`).text();
                        var val4 = $(`.${menu.menu} .item_selected .item_1`).attr("class").split(" ")[1];
                        var val5 = $(`.${menu.menu} .item_selected .item_2`).attr("class").split(" ")[1];

                        $.post(`https://${GetParentResourceName()}/currentItem`, JSON.stringify({
                            menu: menu.menu,
                            name: val1,
                            item_1: val2,
                            item_2: val3,
                            type_1: val4,
                            type_2: val5,
                            sliderItems_1: menu.items[menu.currentItem].sliderItems_1,
                            sliderItems_2: menu.items[menu.currentItem].sliderItems_2,
                            sliderPos: menu.items[menu.currentItem].currentSlider
                        }));
                    }
                }
            break;
        }
    }

    window.addEventListener("message", function(event) 
    {
        var eventData = event.data;

        if(eventData.toggleMenu2)
        {
            toggleMenu2(eventData.state);
        }

        if(eventData.createMenu2)
        {
            createMenu2(eventData.structure);
        }

        if(eventData.destroyMenu2)
        {
            destroyMenu2();
        }

        if(eventData.addMenu2)
        {
            addMenu2(eventData.structure);
        }

        if(eventData.removeMenu2)
        {
            removeMenu2(eventData.menu);
        }

        if(eventData.switchMenu2)
        {
            switchMenu2(eventData.menu);
        }

        if(eventData.updateMenuStatus2)
        {
            updateMenuStatus2(eventData.textData);
        }

        if(eventData.updateItemSliderItems2)
        {
            updateItemSliderItems2(eventData.menu, eventData.item, eventData.name, eventData.sliderItems);
        }

        if(eventData.updateItemSlider2)
        {
            updateItemSlider2(eventData.menu, eventData.item, eventData.name, eventData.sliderPos);
        }

        if(eventData.updateItemText2)
        {
            updateItemText2(eventData.menu, eventData.item, eventData.name, eventData.label);
        }

        if(eventData.scrollFunctionality2)
        {
            scrollFunctionality2(eventData.direction);
        }
    });
}