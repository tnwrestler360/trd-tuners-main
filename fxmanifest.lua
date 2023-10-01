fx_version 'cerulean'
game 'gta5'

ui_page 'html/index.html'

files {
    'html/images/*.jpg',
    'html/images/*.jpeg',
    'html/images/*.png',
    'html/index.html',
    'html/css/*.css',
    'html/js/*.js',
    'html/sounds/*.ogg',
}

shared_scripts {
    'shared/*.lua'
}

client_scripts {
    '@PolyZone/client.lua',
    '@PolyZone/BoxZone.lua',
    'client/cl_*.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/sv_*.lua',
}

escrow_ignore {
    'shared/*.lua',
    'client/cl_*.lua',
    'server/sv_*.lua',
}

lua54 'yes'
dependency '/assetpacks'