# TrolleyKing

Mobile-first daily price guessing game.

## Flow

1. Intro
2. How to play
3. 5 product rounds
4. Share

## Round logic

- Tap one of the 9 fixed prices.
- The chosen price appears in the answer box.
- Press ENTER.
- If correct:
  - tick appears,
  - trolley number image updates,
  - that price slot becomes blank.
- If incorrect:
  - cross appears,
  - trolley number does not increase,
  - price stays.
- Press NEXT to continue.

## Local run

```bash
cd C:\Users\User\Desktop\TrolleyKing
python -m http.server 8000
```

Open:

- Desktop: `http://localhost:8000/`
- iPhone on same Wi-Fi: `http://YOUR_PC_IP:8000/`

## Required assets

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
- `1.png`
- `2.png`
- `3.png`
- `4.png`
- `5.png`

### assets/products
- product PNGs used by `data/batch-1.txt`

### data
- `batch-1.txt`