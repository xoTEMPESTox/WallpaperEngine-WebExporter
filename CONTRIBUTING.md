# Contributing to Wallpaper Engine Web Exporter

Thank you for your interest in contributing to the Wallpaper Engine Web Exporter! We welcome contributions from the community to help improve and expand this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Running Tests](#running-tests)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

1. Fork the repository on GitHub
2. Clone your forked repository to your local machine
3. Create a new branch for your feature or bug fix

## Development Setup

### Prerequisites

- Node.js 16+ (for the web application)
- Python 3.6+ (for the converter tools)
- npm or yarn package manager

### Setting Up the Web Application

1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Setting Up the Converter Tools (Optional)

1. Ensure you have Python 3.6+ installed
2. No additional Python packages are required for basic functionality

## Project Structure

```
WallpaperEngine-WebExporter/
├── converter/              # Python-based conversion tools
├── webapp/                 # Next.js web application
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── lib/                # Utility functions and libraries
│   └── public/             # Static assets and demo wallpapers
├── docs/                   # Documentation files
├── output/                 # Converted wallpaper output
├── src/                    # Core engine source code
└── templates/              # HTML template files
```

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please check if the issue has already been reported. If not, create a new issue with:

- A clear and descriptive title
- A detailed description of the problem
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your environment information (OS, browser, etc.)

### Suggesting Enhancements

We welcome feature requests! Please create an issue with:

- A clear and descriptive title
- A detailed explanation of the proposed feature
- The problem it solves or the value it adds
- Any implementation ideas you might have

### Code Contributions

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests as needed
5. Ensure your code follows our coding standards
6. Commit your changes with a clear and descriptive commit message
7. Push your branch to your fork
8. Open a pull request to the main repository

## Coding Standards

### JavaScript/TypeScript (Web Application)

- Follow the existing code style in the project
- Use functional components with React Hooks when possible
- Use TypeScript for type safety
- Write clear, self-documenting code with comments where necessary
- Follow the Airbnb JavaScript Style Guide with some exceptions
- Use ESLint and Prettier for code formatting

### Python (Converter Tools)

- Follow PEP 8 style guide
- Use clear, descriptive variable and function names
- Write docstrings for functions and classes
- Keep functions small and focused
- Use type hints where possible

### General Guidelines

- Write clean, readable, and maintainable code
- Keep pull requests focused on a single feature or bug fix
- Include tests for new functionality
- Update documentation when making changes to APIs or features
- Be respectful and constructive in all interactions

## Running Tests

### Web Application Tests

```bash
cd webapp
npm test
```

### Python Tests (if applicable)

```bash
python -m pytest tests/
```

## Submitting Changes

1. Ensure your code passes all tests
2. Update the documentation if you've made changes to APIs or features
3. Write clear, concise commit messages
4. Push your changes to your fork
5. Submit a pull request to the main repository with:
   - A clear title and description
   - A reference to any related issues
   - Screenshots or demos if applicable

### Pull Request Guidelines

- Keep pull requests small and focused
- Include a clear description of the changes
- Reference any related issues
- Ensure all tests pass
- Be responsive to feedback during the review process

## Reporting Issues

When reporting issues, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Screenshots if applicable
5. Your environment information (OS, browser, etc.)
6. Any error messages or logs

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Questions?

If you have any questions about contributing, feel free to create an issue asking for clarification or guidance. We're here to help!

Thank you for contributing to the Wallpaper Engine Web Exporter!