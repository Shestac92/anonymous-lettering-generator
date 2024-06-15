# anonymous-lettering-generator

## Disclaimer

This repo is a personal pet project created for fun and Friday-evening-beer. It is not intended to showcase my best skills or to serve as a professional portfolio piece. The primary purpose of this project is to solve a real-life task I faced at a friend's birthday. As such, you may find a lack of tests of all kinds, Open API, and similar elements. It is tailored to personal preferences and needs rather than industry standards. Feedback and suggestions are always welcome, but please understand that this project may not reflect my professional work or be updated regularly.

## Motivation

## Description

## PR guide

## Build and run

## API Reference

run in parallel
`npm run start:dev`

run sequentially
`npm run build --workspaces`
`npm run build:prod --workspaces`


docker build --platform linux/x86_64 -t anonymous-lettering-generator:latest .
docker run -p 3001:3001 -d anonymous-lettering-generator:latest
docker exec -it 0cbecdab93ccd78e585302e9d9f6a4be5121592f6722acccb75828b755510ab9 /bin/sh

// TODO: the rest of symbols
// TODO: support of high profile chars
// TODO: adjust client for mobile devices
// TODO: readme