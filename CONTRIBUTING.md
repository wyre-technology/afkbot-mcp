# Contributing

Thank you for your interest in contributing! This project is maintained by [WYRE Technology](https://github.com/wyre-technology).

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm ci`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development

```bash
npm run build       # Build the project
npm run dev         # Run with tsx (hot reload)
npm run lint        # Type-check
```

## Pull Request Process

1. Ensure the build passes and types check
2. Update documentation if you're changing public APIs
3. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `chore:` for maintenance tasks
4. Open a pull request against the `main` branch

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce, expected behavior, and actual behavior
- Include your Node.js version and OS

## Code Style

- TypeScript with strict mode
- ESM modules (`import`/`export`)
- Prefer `async`/`await` over Promise chains

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
