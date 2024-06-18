# Anonymous Letter Generator

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

## Policy for PR Suggestions
If you have any ideas on how to:

- Improve the tool
- Add new functionality, such as extra parameters, textures, etc.
- Add new symbols and languages

Feel free to suggest a PR!

### Requirements for New Symbols:
- Format: PNG
- No background
- (recommended) Use 256 colors only to minimize image size
- (recommended) Image dimensions between 100x100 and 200x200 pixels to provide optimal quality and minimal file size
- Create a directory `api/assets/{CHAR_CODE}` for the collection of images for the given symbol. You can get the character code like this: `"&".charCodeAt() // returns 38`. Add images to this directory. For consistency, I recommend using names like 1.png, 2.png, etc., but the server will handle any file name.

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

Build Docker image from source
```
docker build --platform linux/x86_64 -t anonymous-lettering-generator:latest .
```

Run Docker image locally in detached mode
```
docker run -p 3001:3001 -d --name anon-letter.online anonymous-lettering-generator:latest
```

Connect to shell in the running container for debugging purposes
```
docker exec -it anon-letter.online /bin/sh
```

## API Reference

<details>
<summary><code>POST</code> <code>/api/generate</code></summary>

Payload
```json
{
    "prompt": "text of my ransom letter",
    "transparent": false,
    "lineSpacingFactor": 0.2, // 0 - 1
    "letterSpacingFactor": 0.2,
    "positionRandomOffsetFactor": 0.2,
    "rotationRandomDegreeFactor": 0.2,
    "sizeRandomFactor": 0.2
}
```

## Further plans

- create Telegram bot
- add different paper textured backgrounds

Response is a base64 encoded PNG image.

// TODO: adjust client for mobile devices