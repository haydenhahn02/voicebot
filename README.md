# Voicebot — talk to Claude in your browser

This is a tiny web page that lets you talk (or type) to Claude, and hear it talk back.
Follow these steps in order — none of them require knowing how to code.

## What's in this folder

```
voicebot/
├── server.js          the small program that talks to Claude on your behalf
├── package.json        list of two tools the server needs
├── .env.example         template for your secret API key
└── public/
    ├── index.html       the page you'll see
    ├── style.css         how it looks
    └── app.js           handles your voice + typing
```

You don't need to understand any of that code to use it — but feel free to open
the files in VS Code and poke around once it's working.

## Step 1 — Install Node.js

Node.js lets your computer run the small server.

1. Go to **https://nodejs.org**
2. Download the version marked **LTS** (it'll say something like "Recommended for most users")
3. Run the installer, clicking "Next" through the defaults

To check it worked, open a terminal (in VS Code: **Terminal → New Terminal**) and type:

```
node -v
```

If you see a version number like `v22.x.x`, you're good.

## Step 2 — Open this folder in VS Code

In VS Code: **File → Open Folder…** and select this `voicebot` folder.

## Step 3 — Get a Claude API key

1. Go to **https://console.anthropic.com**
2. Sign up or log in
3. Go to **API Keys** and create a new key
4. Copy it (it starts with `sk-ant-...`) — you won't be able to see it again, so paste it somewhere safe for now

This is separate from a normal claude.ai subscription, and usage is billed by how much you chat (a casual conversation costs a few cents, not dollars).

## Step 4 — Add your key to the project

1. In VS Code's file list, find `.env.example`
2. Make a copy of it and rename the copy to exactly `.env` (no `.example`)
3. Open `.env` and replace `paste_your_key_here` with the key you copied, so it looks like:

```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

4. Save the file. **Never share this file or paste it anywhere public** — it's your private key.

## Step 5 — Install the project's dependencies

In the VS Code terminal, run:

```
npm install
```

This downloads the two small libraries the server uses (takes a few seconds).

## Step 6 — Start the voicebot

```
npm start
```

You should see:

```
Voicebot is running.
Open http://localhost:3000 in Chrome
```

Leave this terminal running — it's your live server.

## Step 7 — Open it in your browser

Open **Google Chrome** (voice input works best there) and go to:

```
http://localhost:3000
```

Click the orb in the middle, allow microphone access when your browser asks, and start talking. You can also just type into the box at the bottom.

## Stopping the server

Click into the terminal and press `Ctrl + C`. Run `npm start` again any time you want to use it.

## If something goes wrong

- **"command not found: npm"** → Node.js isn't installed yet, or you need to restart your terminal/VS Code after installing it.
- **Page loads but the orb does nothing when clicked** → Make sure you're using Chrome, and that you allowed microphone permission (check the lock/info icon in the address bar).
- **An error message appears in the chat about a missing API key** → Double-check your `.env` file is named exactly `.env`, is in the same folder as `server.js`, and that you restarted the server (`Ctrl+C` then `npm start`) after editing it.
- **"Couldn't reach the server"** → Make sure the terminal running `npm start` is still open.

## Ideas for what to customize once it's working

- In `server.js`, change the `system` prompt to give Claude a different personality
- In `style.css`, change the `--accent` and `--accent-listen` color variables
- In `app.js`, change `recognizer.lang = "en-US"` to another language code
