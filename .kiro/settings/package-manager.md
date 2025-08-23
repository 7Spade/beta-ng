# Package Manager Configuration

This project uses **pnpm** as the package manager.

## Detected Configuration
- ✅ `pnpm-lock.yaml` found
- ✅ `package-lock.json` found (legacy, should use pnpm)
- 📦 Package Manager: **pnpm**

## Commands to Use
```bash
# Install dependencies
pnpm install

# Run scripts
pnpm run dev
pnpm run build
pnpm run test
pnpm run lint
pnpm run typecheck

# Add dependencies
pnpm add <package>
pnpm add -D <package>

# Remove dependencies
pnpm remove <package>
```

## Notes
- This project has both `pnpm-lock.yaml` and `package-lock.json`
- Recommend using pnpm consistently
- Consider removing `package-lock.json` if switching fully to pnpm