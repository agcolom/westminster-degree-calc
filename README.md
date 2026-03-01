# University of Westminster Degree Classification Calculator

A comprehensive web-based calculator that helps students and staff understand how module scores translate into final degree classifications at the University of Westminster, covering both undergraduate and postgraduate programmes.

## About

This calculator implements the official University of Westminster degree classification rules for both undergraduate and postgraduate awards. It provides clear, immediate feedback on degree trajectory and helps students make informed decisions about their studies.

## Features

### Core Functionality
- **Undergraduate Calculator**: Implements the two provisional score system for Level 5 and Level 6 modules
- **Postgraduate Calculator**: Supports PgCert, PgDip, Masters, and Integrated Masters programmes
- **Accurate Classification**: Implements official University degree classification rules
- **Save & Load Progress**: Browser-based storage allows students to save their module marks and return later
- **Print & Export**: Export results to PDF for record-keeping

### User Experience
- **Color-Coded Sliders**: Visual feedback showing performance levels as marks are adjusted
- **Real-Time Calculation**: Instant updates as module scores are entered or changed
- **Mobile Optimized**: Fully responsive design works seamlessly on all devices
- **Accessible Interface**: Clean, intuitive design built with modern UI components
- **Standalone Files**: Self-contained HTML files available for offline use or alternative hosting

### Analytics
- **Google Analytics**: Track calculator usage to understand student engagement

## Who Is This For?

- **Students**: Understand how your module scores impact your final degree classification
- **Academic Staff**: Reliable tool for advising students during tutorials and planning sessions
- **Administrative Staff**: Quick reference for handling student queries about degree progression

## Usage

### Live Calculator
Visit the calculator at: [https://agcolom.github.io/westminster-degree-calc/](https://agcolom.github.io/westminster-degree-calc/)

- **Undergraduate**: [https://agcolom.github.io/westminster-degree-calc/](https://agcolom.github.io/westminster-degree-calc/)
- **Postgraduate**: [https://agcolom.github.io/westminster-degree-calc/postgraduate](https://agcolom.github.io/westminster-degree-calc/postgraduate)

### Standalone Versions
Self-contained HTML files with all assets inlined:
- **UG Standalone**: [ugStandalone.html](https://agcolom.github.io/westminster-degree-calc/ugStandalone.html)
- **PG Standalone**: [pgStandalone.html](https://agcolom.github.io/westminster-degree-calc/pgStandalone.html)

## Technology Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) - Accessible UI components
- [Google Analytics 4](https://analytics.google.com/) - Usage tracking

## Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/agcolom/westminster-degree-calc.git
   cd westminster-degree-calc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

Build the static site and generate standalone HTML files:

```bash
npm run export
```

This creates:
- Static site in the `out/` directory
- `ugStandalone.html` - Self-contained undergraduate calculator
- `pgStandalone.html` - Self-contained postgraduate calculator

### Deployment

The site is deployed to GitHub Pages. To deploy manually:

1. Build the project:
   ```bash
   npm run export
   ```

2. Switch to gh-pages branch and copy the output:
   ```bash
   git checkout gh-pages
   cp -r out/* .
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy updates"
   git push origin gh-pages
   ```

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with metadata and Google Analytics
│   ├── page.tsx                # Undergraduate calculator
│   ├── postgraduate/
│   │   └── page.tsx            # Postgraduate calculator
│   └── globals.css             # Global styles and Tailwind directives
├── components/
│   └── ui/                     # shadcn/ui components (Button, Card, Slider, etc.)
├── lib/
│   └── utils.ts                # Utility functions
├── public/                     # Static assets (favicon, icons)
├── process-html.js             # Script to create standalone HTML files
├── next.config.ts              # Next.js configuration for static export
└── package.json                # Dependencies and scripts
```

## Key Implementation Details

### Undergraduate Classification
- Implements the two provisional score system
- Level 5 weighted 1/3, Level 6 weighted 2/3
- Automatically determines best 220 credits
- Excludes lowest module from either level for each provisional score

### Postgraduate Classification
- Supports multiple award types with different credit requirements
- Handles Level 6 and Level 7 modules with different passing thresholds
- Special rules for Integrated Masters (first-attempt Pass requirement)
- Credit-weighted average calculation

### Save/Load Feature
- Uses browser localStorage for client-side persistence
- Saves module details and award type selection
- No server required - completely private and local

## License

MIT License - See [LICENSE](LICENSE) file for details

## Developer

Developed by Anne-Gaelle Colom, University of Westminster (2026)

## Contact

For questions or feedback about this calculator, please contact the University of Westminster Academic Support team.

## Disclaimer

This calculator is provided as a guide only and provides estimates based on the marks entered. Official degree classifications are determined by the University's examination boards following the complete academic regulations. Always refer to official University documentation for authoritative information.
