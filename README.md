# TrolleyKing

Mobile-first daily price guessing game.

## Flow

1. Intro screen
2. How to play screen
3. 5 product rounds
4. Share screen

## Rules

- Tap one of the 9 fixed prices.
- Your selected price appears in the answer box.
- Press ENTER.
- If correct:
  - the tick appears,
  - trolley count increases,
  - that price slot becomes blank for the rest of the game.
- If incorrect:
  - the cross appears,
  - trolley count stays the same,
  - the price remains available.
- Press NEXT to continue.

## Local run

Use a local server so `fetch()` can read `data/batch-1.txt`.

```bash
cd C:\Users\User\Desktop\TrolleyKing
python -m http.server 8000
```

Then open:

- On desktop: `http://localhost:8000/`
- On iPhone on same Wi-Fi: `http://YOUR_PC_IP:8000/`

## Assets expected

### Root
- `index.html`
- `style.css`
- `app.js`

### assets
- `trolleykinglogo.png`
- `trolley.png`
- `tick.png`
- `cross.png`
- `Special.png`

### assets/products
- product PNG files matching paths in `data/batch-1.txt`

### data
- `batch-1.txt`