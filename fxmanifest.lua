fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'zd-pedinteraction'
author 'zaydev'
description 'Local interaction peds and a dialogue UI'
version '1.0.0'

dependencies {
    'ox_target',
}

client_scripts {
    'client/*.lua',
}

ui_page 'ui/dist/index.html'

files {
    'ui/dist/index.html',
    'ui/dist/**/*',
}
