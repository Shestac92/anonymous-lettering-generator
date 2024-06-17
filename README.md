# anonymous-lettering-generator

## Disclaimer

This repo is a personal pet project created for fun and Friday-evening-beer. It is not intended to showcase my best skills or to serve as a professional portfolio piece. The primary purpose of this project is to solve a real-life task I faced at a friend's birthday. As such, you may find a lack of tests of all kinds, Open API, and similar elements. It is tailored to personal preferences and needs rather than industry standards. Feedback and suggestions are always welcome, but please understand that this project may not reflect my professional work or be updated regularly.

## Motivation

Once, at a friend's birthday party, I decided to prepare a quest for him to find his present. The idea was to hide notes with quest tasks in random places and write them in a ransom/anonymous letter style. I discovered that the current AI tools (as of March 2024) were not able to generate these types of letters effectively. Other ransom letter generators I found had significant issues: they had dramatic bugs, lacked support for certain symbols or marks, didn't allow for customization, or simply looked too "digital."

So, I decided to create my own generator to achieve the desired result!

## Description

There are two primary ways to generate such notes:

1. Rendering Characters with Random Fonts and Styles Using HTML/CSS or Canvas.

This method runs fast and provides an unlimited number of combinations. The resulting image is of high quality since it uses vector graphics until it is exported as a raster image. However, it tends to look too "digital." The chars lack background image fragments, neighboring character artifacts, random shapes, and other imperfections found in real magazine or paper cutouts. While it's possible to mimic some of these attributes, doing so requires significant effort and time, which goes beyond my needs. This method is ideal if you need thousands of unique notes, but it wasn't suitable for my specific project.

Other [project1](https://codepen.io/breathing/full/eYdmXby) and [project2](https://www.ransomizer.com/) implementing this approach

2. Composing the Note from Character Images.

In this method, each character image is a real scanned character from paper or magazine. While it takes considerable time to prepare a collection of character images and the resulting image quality is limited by the quality of the scans, it provides the most authentic look. It's like comparing the experience of vinyl and a CD.

[Another projects implementing this approach](https://jenniferdewalt.com/ransom_note/page).

So, I chose option 2.

The project includes a collection of character images. The application sanitizes the prompt, wraps lines to fit the canvas, arranges the character images on the canvas, and returns the image buffer. During the composition step, it applies random shifts and offsets to each character.

## PR guide

## Build and run

Install deps
```
npm install
```

Run develop locally in watch mode in parallel (backend + frontend)
```
`npm run start:dev`
```

Build prod sequentially
```
npm run build:prod --workspaces
```

## API Reference

docker build --platform linux/x86_64 -t anonymous-lettering-generator:latest .
docker run -p 3001:3001 -d anonymous-lettering-generator:latest
docker exec -it 0cbecdab93ccd78e585302e9d9f6a4be5121592f6722acccb75828b755510ab9 /bin/sh

// TODO: the rest of symbols
// TODO: support of high profile chars
// TODO: adjust client for mobile devices
// TODO: readme