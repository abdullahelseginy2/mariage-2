# Wedding Invitation App Documentation

## Project Ideaa

This app is a romantic single-page wedding invitation website for **Walaa & Abdullah**. It presents the invitation as an interactive digital experience: guests open an animated envelope, read the invitation, explore the couple's story, view event details and photos, see a live countdown, submit an RSVP, and optionally listen to background music.

The experience is designed as a polished public-facing invitation page rather than a multi-screen dashboard. All visible content is assembled into one scrolling home screen.

## Tech Stack

- **React 19** with Create React App
- **Tailwind CSS** for utility styling and theme colors
- **Framer Motion** for entrance, scroll, and invitation animations
- **react-router-dom** for route management and future screens
- **i18next** and **react-i18next** for English/Arabic localization
- **react-scroll** for smooth section navigation
- **react-icons** for UI icons
- **canvas-confetti** for celebration effects
- **react-tsparticles** and **tsparticles-slim** for the loading screen particle layer
- Local image and audio assets from `src/assets`

## App Structure

The app entry point is `src/index.js`, which renders `App` into `public/index.html`.

`src/App.js` defines the app routes with `react-router-dom`:

- `/` renders `HomeScreen` from `src/screens/HomeScreen/index.js`
- `/home` renders `HomeScreen` from `src/screens/HomeScreen/index.js`
- unknown routes redirect to `/`

`HomeScreen` composes the full invitation page in this order:

1. `LoadingScreen` overlay, shown once before the invitation content
2. `LanguageSwitcher`
3. `AudioPlayer`
4. `Hero`
5. `LoveStory`
6. `EventDetails`
7. `Gallery`
8. `Countdown`
9. `RSVP`
10. `Footer`

## Screens

### Home Screen

File: `src/screens/HomeScreen/index.js`

The home screen is the only current app screen. It is a full-page, vertically scrolling wedding invitation. It wraps every section in a `home-screen` container and hides overflow for the animated hero effects.

HomeScreen section components live under `src/screens/HomeScreen/sections`. In-page navigation still happens through section IDs and smooth scrolling.

The home screen also manages a one-time loading overlay. It starts with `showLoader` set to `true`, renders `LoadingScreen` inside Framer Motion `AnimatePresence`, and hides the loader when the loader calls `onFinished`.

## Feature Sections

### 1. Loading Screen

Files:

- `src/screens/LoadingScreen/LoadingScreen.jsx`
- `src/screens/LoadingScreen/CurtainPanels.jsx`
- `src/screens/LoadingScreen/FloatingPetals.jsx`
- `src/screens/LoadingScreen/GoldenParticles.jsx`
- `src/screens/LoadingScreen/loadingScreen.css`
- `src/screens/LoadingScreen/index.js`

The loading screen is a fullscreen cinematic intro shown before the invitation page content. It creates a luxury curtain-opening moment that leads into the main envelope invitation.

Features:

- Rendered by `HomeScreen` before the page sections
- Wrapped in `AnimatePresence` for exit animation
- Default duration is `5000ms`
- Uses `role="status"` and `aria-live="polite"`
- Dark luxury background with radial glow layers
- Gold particle layer powered by `react-tsparticles` and `tsparticles-slim`
- Floating falling petal layer with 14 generated petals
- Two animated curtain panels that slide open horizontally
- Curtain panels display localized groom and bride names from `common.groom` and `common.bride`
- Bride and groom character cutouts move outward as if pulling the curtains open
- Hand-pull and grip-line decorative elements pulse while the characters pull
- Localized prompt copy fades in after the curtains start opening
- Loader fades, slightly scales, and blurs before being removed
- Responsive CSS adjusts curtain, character, prompt, and petal sizing on smaller screens
- Reduced-motion media query disables character tug and hand-pulse animations

Timing behavior for the current `duration={5000}`:

- Curtains start opening after about `1800ms`
- Prompt appears after about `2520ms`
- Leave/fade animation starts after about `4200ms`
- `onFinished` fires at `5000ms`, and `HomeScreen` removes the loader

Displayed loading copy:

- `The Invitation Is Ready`
- `Open the Invitation Letter`

Image assets:

- `src/assets/images/loading/groom-curtain.png`
- `src/assets/images/loading/bride-curtain.png`

### 2. Audio Player

File: `src/screens/HomeScreen/sections/AudioPlayer/index.js`

The audio player is a fixed circular button in the bottom-right corner of the page.

Features:

- Loads `src/assets/sounds/music.m4a`
- Loops the music continuously
- Uses volume `0.4`
- Attempts autoplay on mount
- Falls back to starting playback after the first user interaction:
  - pointer down
  - key down
  - scroll
- Toggles between play and pause
- Shows play/pause icons from `react-icons/fa`
- Displays a hover tooltip: `Play Music` or `Pause Music`
- Adds a pulsing ring animation while audio is playing

### 3. Hero / Invitation Envelope

Files:

- `src/screens/HomeScreen/sections/Hero/index.js`
- `src/screens/HomeScreen/sections/Hero/index.css`

The hero is the first viewport and the main invitation moment. It displays an animated envelope that guests can click to open.

Features:

- Full-height dark romantic background
- Floating decorative paper pieces, rings, and butterflies
- Envelope attention animation while waiting to be opened
- Clickable invitation envelope
- Animated envelope flap opening
- Invitation paper slides out of the envelope
- Confetti paper-rain effect when opened
- Fullscreen invitation overlay after the opening animation
- Close button inside the fullscreen invitation
- `Save the Date` button that closes the fullscreen invitation and scrolls to event details
- `View Details` link using `react-scroll`

Displayed copy:

- `We are getting married`
- `Walaa & Abdullah`
- `Together with their families, invite you to celebrate their wedding.`
- `Save the Date`

Timing behavior:

- Envelope opens immediately on click
- Paper transitions to fullscreen after about `1.2s`
- Fullscreen invitation automatically closes after about `15s`
- Closing animation waits about `1.5s` before clearing the open state

### 4. Love Story Timeline

File: `src/screens/HomeScreen/sections/LoveStory/index.js`

This section tells the couple's story as a vertical timeline.

Features:

- Section ID: `love-story`
- Dark background with radial accent gradients
- Animated timeline items using Framer Motion
- Alternating left/right layout on desktop
- Numbered milestone markers
- Responsive single-column timeline on smaller screens

Timeline events:

- `30/1/2026` - First Meet
- `31/1/2026` - Second Meet
- `8/2/2026` - Reciting Al-Fatiha
- `13/2/2026` - The Engagement
- `2/10/2026` - Marriage Contract Ceremony
- `30/10/2026` - The Marriage Celebration

### 5. Event Details

File: `src/screens/HomeScreen/sections/EventDetails/index.js`

This section gives guests the wedding date, time, venue, embedded map, key location facts, and external map link.

Features:

- Section ID: `event-details`
- Professional two-column responsive layout
- Date/time card with invitation copy
- Venue/map card with address and landmark details
- Icons from `react-icons`
- Embedded Google Maps iframe
- External Google Maps/search link

Displayed event details:

- Event title: `The Wedding Day`
- Date: `Friday, October 30, 2026`
- Time: `8:00 PM`
- Venue: `Cleopatra Hall`
- Location: `Qutour Center, Gharbia Governorate`
- Extra location note: `Next to the train station`

### 6. Gallery

File: `src/screens/HomeScreen/sections/Gallery/index.js`

The gallery displays wedding memories in a responsive masonry-style layout.

Features:

- Section ID: `gallery`
- Imports local images `1.jpg` through `8.jpg`
- Responsive CSS columns:
  - 1 column on small screens
  - 2 columns on small/tablet screens
  - 3 columns on large screens
  - 4 columns on extra-large screens
- Lazy-loaded images
- Framer Motion reveal animations
- Hover zoom effect
- Dark gradient hover overlay

Image assets:

- `src/assets/images/1.jpg`
- `src/assets/images/2.jpg`
- `src/assets/images/3.jpg`
- `src/assets/images/4.jpg`
- `src/assets/images/5.jpg`
- `src/assets/images/6.jpg`
- `src/assets/images/7.jpg`
- `src/assets/images/8.jpg`

The folder also contains matching `.png` files, but the current gallery imports only `.jpg` files.

### 7. Countdown

File: `src/screens/HomeScreen/sections/Countdown/index.js`

The countdown displays the remaining time until a configured wedding date.

Features:

- Live countdown updated every second
- Displays days, hours, minutes, and seconds
- Uses circular timer blocks
- Animated reveal with Framer Motion
- Stops at zero when the target date has passed

Current countdown target:

- `2026-10-30T20:00:00`

Displayed timer labels:

- `days`
- `hours`
- `minutes`
- `seconds`

### 8. RSVP Form

File: `src/screens/HomeScreen/sections/RSVP/index.js`

The RSVP section lets guests submit a simple local RSVP response.

Features:

- Section ID: `rsvp`
- Full name input
- Attendance radio options:
  - `Yes, I will attend`
  - `No, I can't make it`
- Optional message textarea
- Submit button
- Required name validation through the native `required` input attribute
- Confirmation state after submit
- Confetti celebration when the guest selects `yes`

Important implementation note:

- RSVP data is currently stored only in React component state.
- There is no backend, database, email submission, or persistent storage.
- Refreshing the page resets the RSVP form.

### 9. Footer

File: `src/screens/HomeScreen/sections/Footer/index.js`

The footer closes the invitation with the couple's names, date text, and a small heart icon.

Displayed footer content:

- `Walaa & Abdullah`
- `Friday, 30 October 2026`
- `Made with [heart] for our special day`

## Styling And Theme

Global styles are defined in:

- `src/index.css`
- `src/globals.css`
- `src/App.css`
- `src/screens/HomeScreen/index.css`
- `src/screens/LoadingScreen/loadingScreen.css`
- `src/screens/HomeScreen/sections/Hero/index.css`
- `tailwind.config.js`

Theme direction:

- Dark romantic base
- Gold accents
- Champagne and muted purple tones
- Serif headings using `Playfair Display`
- Sans body text using `Lato`

Tailwind theme colors:

- `blush`: `#17101A`
- `champagne`: `#3A2D3A`
- `gold`: `#D6B15C`
- `olive`: `#C9B56A`
- `dark`: `#F7EBD2`
- `cream`: `#0B0A10`

The global stylesheet overrides some utility classes, including white and cream backgrounds, so many sections that look like `bg-white` in JSX are rendered as dark themed surfaces.

## Assets

Image assets:

- Stored in `src/assets/images`
- Current gallery uses `.jpg` files numbered `1` through `8`
- Matching `.png` files also exist
- Loading screen character images are stored in `src/assets/images/loading`

Audio asset:

- `src/assets/sounds/music.m4a`

Public assets:

- `public/favicon.ico`
- `public/logo192.png`
- `public/logo512.png`
- `public/manifest.json`
- `public/robots.txt`

## Navigation

Route-level navigation is handled by `react-router-dom` in `src/App.js`. The current routes are `/` and `/home`, both rendering the HomeScreen, with unknown routes redirecting to `/`.

Within the HomeScreen, section navigation uses IDs and smooth scrolling.

Important IDs:

- `hero`
- `love-story`
- `event-details`
- `gallery`
- `rsvp`

The `Hero` component uses:

- `react-scroll` `Link` to scroll to `event-details`
- Native `document.getElementById('event-details')?.scrollIntoView(...)` after clicking fullscreen `Save the Date`

## Localization

The app supports English and Arabic through `i18next` and `react-i18next`.

Localization files:

- `src/locales/en.json`
- `src/locales/ar.json`

Setup file:

- `src/i18n.js`

The app imports `src/i18n.js` from `src/index.js`, so translations are available globally. The active language is saved in `localStorage` under `i18nextLng`.

The language switcher lives in:

- `src/components/LanguageSwitcher/LanguageSwitcher.jsx`

It is rendered on the HomeScreen after the loading overlay and updates both:

- `document.documentElement.lang`
- `document.documentElement.dir`

English uses `ltr`; Arabic uses `rtl`.

Loading screen translation keys:

- `loading.prompt_kicker`
- `loading.open_prompt`
- `common.groom`
- `common.bride`

## Current Data And Copy

Couple:

- `Walaa & Abdullah`

Venue:

- `Cleopatra Hall`
- `Qutour Center, Gharbia Governorate`
- `Next to the train station`

Wedding time:

- `8:00 PM`

Dates currently appearing in the app:

- Event details: `Friday, October 30, 2026`
- Countdown target: `2026-10-30T20:00:00`
- Footer: `Friday, 30 October 2026`

## Known Notes And Improvement Opportunities

- The RSVP form is front-end only and does not persist submissions.
- The RSVP thank-you message contains garbled heart characters in the source; this likely came from an encoding issue.
- The Google Maps link is a long search URL. It could be replaced with a cleaner canonical maps link.
- Some visual cards use large border radii from Tailwind classes such as `rounded-3xl`; this is part of the current design.
- The app is currently a single-screen public invitation and does not include admin tools or guest management.

## Development Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```
