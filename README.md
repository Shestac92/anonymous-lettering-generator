# anonymous-lettering-generator

run in parallel
`npm run start:dev`

run sequentially
`npm run build --workspaces`
`npm run build:prod --workspaces`


docker build --platform linux/x86_64 -t anonymous-lettering-generator:latest .
docker run -p 3001:3001 -d anonymous-lettering-generator:latest
docker exec -it 0cbecdab93ccd78e585302e9d9f6a4be5121592f6722acccb75828b755510ab9 /bin/sh

// TODO: fix ","
// TODO: update drawing logic for .,
// TODO: fix "ё"