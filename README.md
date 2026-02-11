# University of Westminster Degree Classification Calculator

A web-based calculator that helps students and staff understand how module scores translate into final degree classifications at the University of Westminster.

## About

This calculator implements the official University of Westminster degree classification rules, including the two provisional score system. It provides clear, immediate feedback on degree trajectory and helps students make informed decisions about their studies.

## Features

- **Accurate Classification**: Implements official University degree classification rules
- **Two Provisional Scores**: Handles the complexity of the dual provisional score system automatically
- **User-Friendly Interface**: Clean, intuitive design built with Next.js and Tailwind CSS
- **Instant Feedback**: Real-time calculation as module scores are entered
- **Accessible**: Works on desktop and mobile devices

## Who Is This For?

- **Students**: Understand how your module scores impact your final degree classification
- **Academic Staff**: Reliable tool for advising students during tutorials and planning sessions
- **Administrative Staff**: Quick reference for handling student queries about degree progression

## Usage

Visit the live calculator at: [https://agcolom.github.io/westminster-degree-calc/](https://agcolom.github.io/westminster-degree-calc/)

## Technology Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety

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

```bash
npm run export
```

This creates a static build in the `out/` directory, including a `standalone.html` file that can be hosted anywhere.

### Deployment

Deploy to GitHub Pages:

```bash
./deploy.sh
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main calculator page
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
├── public/                 # Static assets
├── process-html.js         # Script to create standalone HTML
├── deploy.sh               # Deployment script
└── next.config.js          # Next.js configuration
```

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contact

For questions or feedback about this calculator, please contact the University of Westminster Academic Support team.

## Disclaimer

This calculator is provided as a guide only. Official degree classifications are determined by the University's examination boards following the complete academic regulations. Always refer to official University documentation for authoritative information.
