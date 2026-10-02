# Design rules

The playground is a place to learn AI security through simulated labs. A new visitor should understand its purpose and find a starting point in five seconds.

## Layout

- The home page explains the product, offers a first lab, and gives two learning paths.
- Keep theory and the full lab list in separate tabs.
- Group navigation into learning, defending with AI, and securing AI.
- On small screens, use a compact sidebar with an overlay when expanded.
- Give each lab a clear input, run action, and results area.
- Show evidence only after analysis. Empty states explain the next step.

## Color and type

- Default to warm white surfaces, charcoal text, and neutral borders.
- Offer a matching charcoal dark theme.
- Use one muted green accent for selection and actions. No theme color picker.
- Reserve red, amber, and green status colors for findings, risk, and progress.
- Use Inter for the interface. Use monospace only for logs, code, and technical data.
- Use sentence case. Keep headings short and readable.
- Use Lucide icons with a consistent 1.75 stroke and 16px interface size.
- No emoji icons, gradients, colored glow, or decorative textures.

## Interaction

- A new visitor can start a lab without choosing a path first.
- Show instant button feedback and loading skeletons while lab code or data loads.
- Load lab components on demand.
- Use motion only to explain work in progress. No cursor halos, tilt, radar sweeps, particle fields, or count-up numbers.
- Keep visible keyboard focus, clear button labels, and a skip link.
- Respect reduced motion. Maintain both themes and small-screen layouts.

## Copy

Use simple, direct English. Explain what the user can do and what happened. Avoid hype, filler, repeated explanations, em dashes, and fake system status labels. Make the simulated nature of the labs clear.

## Verification

Run type checking, frontend tests, and the production build. Review the rendered home, lab list, theory, and a lab run. Check a narrow layout and dark mode before release.
