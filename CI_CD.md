# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Secret Recipe Protection project.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Code Quality Tools](#code-quality-tools)
- [Test Coverage](#test-coverage)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses GitHub Actions for automated testing, code quality checks, and deployment workflows. All workflows are located in `.github/workflows/` directory.

### CI/CD Features

- ✅ **Automated Testing** - Runs on every push and pull request
- ✅ **Multi-Node Support** - Tests on Node.js 18.x and 20.x
- ✅ **Cross-Platform** - Tests on Ubuntu and Windows
- ✅ **Code Quality** - Solhint, Prettier, and ESLint checks
- ✅ **Security Audits** - npm audit for vulnerabilities
- ✅ **Coverage Reports** - Codecov integration
- ✅ **Gas Reports** - Gas usage tracking

## GitHub Actions Workflows

### Main Workflow: `test.yml`

**Triggers:**
- Push to `main` branch
- Push to `develop` branch
- All pull requests to `main` or `develop`

**Jobs:**

#### 1. Test Job

Runs test suite across multiple configurations:

**Matrix:**
- Node.js: 18.x, 20.x
- OS: Ubuntu Latest, Windows Latest

**Steps:**
1. Checkout code
2. Setup Node.js with cache
3. Install dependencies (`npm ci`)
4. Compile contracts
5. Run tests
6. Generate coverage (Ubuntu + Node 20.x only)
7. Upload to Codecov

**Example:**
```yaml
strategy:
  matrix:
    node: ['18.x', '20.x']
    os: [ubuntu-latest, windows-latest]
```

#### 2. Lint Job

Performs code quality checks:

**Checks:**
- Solhint for Solidity code
- Prettier formatting
- Format consistency

**Commands:**
```bash
npm run lint:sol       # Solidity linting
npm run prettier:check # Format checking
npm run format:check   # Additional format checks
```

#### 3. Security Job

Runs security audits:

**Checks:**
- npm audit (moderate level)
- Dependency vulnerabilities
- Continue on error (non-blocking)

**Commands:**
```bash
npm audit --audit-level=moderate
npm run audit:check
```

#### 4. Gas Report Job

Generates gas usage reports:

**Steps:**
1. Compile contracts
2. Run tests with gas reporting
3. Upload gas report as artifact

**Retention:** 30 days

## Code Quality Tools

### Solhint

Solidity linter for identifying potential issues.

**Configuration:** `.solhint.json`

**Key Rules:**
- `code-complexity`: Maximum complexity of 10
- `compiler-version`: Require ^0.8.0
- `func-visibility`: Enforce function visibility
- `max-line-length`: 120 characters (warning)
- `named-parameters-mapping`: Warn on mapping parameters

**Usage:**
```bash
npm run lint:sol      # Check Solidity files
npm run lint:fix      # Auto-fix issues
```

**Example Output:**
```
contracts/SecretRecipeProtection.sol
  ✓ 0 problems (0 errors, 0 warnings)
```

### Prettier

Code formatter for consistent style.

**Configuration:** `.prettierrc.json`

**Settings:**
- Print Width: 120
- Tab Width: 2 spaces
- Semi: Required
- Single Quote: No
- Trailing Comma: ES5
- End of Line: LF

**Solidity Override:**
- Tab Width: 4 spaces
- No bracket spacing

**Usage:**
```bash
npm run prettier:check  # Check formatting
npm run prettier:write  # Format files
npm run format          # Alias for write
```

**Example:**
```bash
$ npm run prettier:check
Checking formatting...
All matched files use Prettier code style!
```

### Combined Linting

Run all code quality checks:

```bash
npm run lint
```

This runs:
1. Solhint on all Solidity files
2. Prettier format check on all files

## Test Coverage

### Codecov Integration

**Configuration:** `codecov.yml`

**Settings:**
- Target Coverage: 80% (project)
- Patch Coverage: 70%
- Precision: 2 decimal places
- Range: 70-100%

**Status Checks:**
- ✅ Project coverage must meet 80% target
- ✅ Patch coverage must meet 70% target
- ✅ Threshold: 2% drop allowed for project
- ✅ Threshold: 5% drop allowed for patches

**Ignored Paths:**
- `node_modules/`
- `test/`
- `scripts/`
- `*.config.js`

**Flags:**
- `unittests`: Tracks contract coverage
- Carryforward enabled for missing reports

### Viewing Coverage

**Local Coverage:**
```bash
npm run test:coverage
```

**Online Reports:**
- Codecov Dashboard: `https://codecov.io/gh/YOUR_ORG/secret-recipe-protection`
- Pull Request Comments: Automatic coverage diff

**Coverage Report Structure:**
```
Coverage summary
  Statements   : 95.23% ( 320/336 )
  Branches     : 87.50% ( 98/112 )
  Functions    : 100.00% ( 42/42 )
  Lines        : 94.12% ( 304/323 )
```

## Local Development

### Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Compile Contracts:**
   ```bash
   npm run compile
   ```

3. **Run Tests:**
   ```bash
   npm test
   ```

### Pre-Commit Checks

Before committing code, run:

```bash
# Format code
npm run format

# Run linter
npm run lint

# Run tests
npm test

# Check coverage
npm run test:coverage
```

### Git Hooks (Optional)

Install Husky for automatic pre-commit checks:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## Quality Scripts Reference

### Testing

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:basic` | Run basic test suite |
| `npm run test:comprehensive` | Run comprehensive tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:gas` | Run with gas reporting |

### Code Quality

| Script | Description |
|--------|-------------|
| `npm run lint` | Run all linters |
| `npm run lint:sol` | Lint Solidity files |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run prettier:check` | Check formatting |
| `npm run prettier:write` | Format files |
| `npm run format` | Alias for prettier:write |
| `npm run format:check` | Alias for prettier:check |

### Security

| Script | Description |
|--------|-------------|
| `npm run audit:check` | Check for vulnerabilities |
| `npm audit` | Full audit report |
| `npm audit fix` | Auto-fix vulnerabilities |

### Build & Deploy

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile contracts |
| `npm run clean` | Clean build artifacts |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia |
| `npm run verify:sepolia` | Verify on Etherscan |

## Troubleshooting

### Common Issues

**1. Tests Failing in CI**

**Symptom:** Tests pass locally but fail in CI

**Solutions:**
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Review environment variables
- Check for platform-specific issues (Windows vs Linux)

**2. Linter Errors**

**Symptom:** `npm run lint` fails

**Solutions:**
```bash
# Auto-fix Solidity issues
npm run lint:fix

# Auto-format files
npm run format

# Check specific file
npx solhint contracts/YourContract.sol
```

**3. Coverage Upload Fails**

**Symptom:** Codecov upload fails in CI

**Solutions:**
- Check `CODECOV_TOKEN` secret in GitHub
- Verify `codecov.yml` configuration
- Ensure coverage report is generated
- Check Codecov service status

**4. Gas Report Not Generated**

**Symptom:** Missing gas report artifact

**Solutions:**
```bash
# Run locally
npm run test:gas

# Check hardhat.config.js
# Ensure gasReporter is configured
```

**5. Prettier Formatting Conflicts**

**Symptom:** Files keep getting reformatted

**Solutions:**
```bash
# Check .prettierrc.json
# Run format once
npm run format

# Add to .prettierignore if needed
```

### CI/CD Debugging

**View Workflow Runs:**
1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. Review job logs

**Download Artifacts:**
1. Go to failed/successful run
2. Scroll to "Artifacts" section
3. Download gas reports or coverage data

**Re-run Failed Jobs:**
1. Click "Re-run jobs" button
2. Select specific job or all jobs
3. Monitor for success

## Best Practices

### 1. Commit Frequency

- Run `npm run lint` before committing
- Commit early and often
- Keep commits focused and atomic

### 2. Pull Request Workflow

1. Create feature branch from `develop`
2. Make changes and add tests
3. Run full test suite locally
4. Push and create PR
5. Wait for CI checks to pass
6. Request code review
7. Merge after approval

### 3. Code Review Checklist

- ✅ All CI checks passing
- ✅ Coverage maintained or improved
- ✅ No linting errors
- ✅ Gas usage acceptable
- ✅ Security audit clean
- ✅ Tests added for new features

### 4. Maintenance

**Weekly:**
- Review dependency updates
- Check for security advisories
- Monitor gas usage trends

**Monthly:**
- Update CI/CD configurations
- Review and update linter rules
- Optimize test performance

## Configuration Files

### File Overview

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Main CI/CD workflow |
| `.solhint.json` | Solhint configuration |
| `.solhintignore` | Solhint ignore patterns |
| `.prettierrc.json` | Prettier configuration |
| `.prettierignore` | Prettier ignore patterns |
| `codecov.yml` | Codecov configuration |

### Updating Configuration

**Add New Linter Rule:**
```json
// .solhint.json
{
  "rules": {
    "new-rule": "error"
  }
}
```

**Modify Coverage Target:**
```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 85%  # Increase from 80%
```

**Add Ignored Path:**
```
# .prettierignore
new-directory/
*.generated.js
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Codecov Documentation](https://docs.codecov.com/)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)

## Support

For CI/CD issues:
1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Consult team lead or DevOps
4. Create issue in repository

---

**Last Updated:** 2025-10-30
**Maintained By:** Development Team
**CI/CD Version:** 1.0.0
