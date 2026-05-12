import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

const BASE_BRANCH = process.env.BASE_BRANCH || 'main';

const BRANCH_RULES = [
  { prefix: 'feat/', expectedBump: 'minor' },
  { prefix: 'fix/', expectedBump: 'patch' },
  { prefix: 'task/', expectedBump: 'patch' },
];

function runGit(args) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function parseSemver(version) {
  const match = VERSION_PATTERN.exec(version);

  if (!match) {
    throw new Error(
      `Invalid package.json version "${version}". Expected x.y.z format.`
    );
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatSemver(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function refExists(ref) {
  try {
    runGit(['rev-parse', '--verify', ref]);
    return true;
  } catch {
    return false;
  }
}

function getBranchName() {
  return (
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    runGit(['rev-parse', '--abbrev-ref', 'HEAD'])
  );
}

function getBaseRef() {
  const candidates = [
    `origin/${BASE_BRANCH}`,
    BASE_BRANCH,
    `refs/remotes/origin/${BASE_BRANCH}`,
    `refs/heads/${BASE_BRANCH}`,
  ];

  return candidates.find(refExists) || null;
}

function getMergeBase(baseRef) {
  try {
    return runGit(['merge-base', 'HEAD', baseRef]);
  } catch (error) {
    throw new Error(
      [
        `Could not determine merge-base between HEAD and ${baseRef}.`,
        '',
        'If this is running in GitHub Actions, make sure checkout uses:',
        '',
        '  - uses: actions/checkout@v4',
        '    with:',
        '      fetch-depth: 0',
        '',
        error.message,
      ].join('\n')
    );
  }
}

function getVersionAtRef(ref) {
  try {
    const packageJsonAtRef = runGit(['show', `${ref}:package.json`]);
    const packageJson = JSON.parse(packageJsonAtRef);

    if (!packageJson.version) {
      throw new Error('package.json does not contain a version field.');
    }

    return packageJson.version;
  } catch (error) {
    throw new Error(
      `Could not read package.json version at ${ref}: ${error.message}`
    );
  }
}

function getCurrentVersion() {
  try {
    const packageJson = readFileSync(
      new URL('../package.json', import.meta.url),
      'utf8'
    );

    const parsedPackageJson = JSON.parse(packageJson);

    if (!parsedPackageJson.version) {
      throw new Error('package.json does not contain a version field.');
    }

    return parsedPackageJson.version;
  } catch (error) {
    throw new Error(
      `Could not read current package.json version: ${error.message}`
    );
  }
}

function hasValidMinorBump(baseVersion, currentVersion) {
  return (
    currentVersion.major === baseVersion.major &&
    currentVersion.minor > baseVersion.minor
  );
}

function hasValidPatchBump(baseVersion, currentVersion) {
  return (
    currentVersion.major === baseVersion.major &&
    currentVersion.minor === baseVersion.minor &&
    currentVersion.patch > baseVersion.patch
  );
}

function validateVersionBump({
  branchName,
  branchRule,
  baseRef,
  baseVersion,
  currentVersion,
}) {
  const isValid =
    branchRule.expectedBump === 'minor'
      ? hasValidMinorBump(baseVersion, currentVersion)
      : hasValidPatchBump(baseVersion, currentVersion);

  if (isValid) {
    return;
  }

  const expectedMessage =
    branchRule.expectedBump === 'minor'
      ? 'Expected package.json minor version to increase for feat/* branches.'
      : 'Expected package.json patch version to increase for fix/* and task/* branches.';

  throw new Error(
    [
      `Version check failed for branch "${branchName}".`,
      `Base ref: ${baseRef}`,
      `Base version: ${formatSemver(baseVersion)}`,
      `Current version: ${formatSemver(currentVersion)}`,
      expectedMessage,
    ].join('\n')
  );
}

function main() {
  const branchName = getBranchName();

  if (!branchName || branchName === 'HEAD') {
    console.log('Skipping version check: could not determine branch name.');
    process.exit(0);
  }

  const branchRule = BRANCH_RULES.find(({ prefix }) =>
    branchName.startsWith(prefix)
  );

  if (!branchRule) {
    console.log(
      `Skipping version check for branch "${branchName}". No version rule applies.`
    );
    process.exit(0);
  }

  const baseRef = getBaseRef();

  if (!baseRef) {
    console.log(
      `Skipping version check: no base branch ref found for "${BASE_BRANCH}".`
    );
    process.exit(0);
  }

  const mergeBase = getMergeBase(baseRef);

  const baseVersion = parseSemver(getVersionAtRef(mergeBase));
  const currentVersion = parseSemver(getCurrentVersion());

  validateVersionBump({
    branchName,
    branchRule,
    baseRef,
    baseVersion,
    currentVersion,
  });

  console.log(
    [
      `Version check passed for branch "${branchName}".`,
      `Base ref: ${baseRef}`,
      `Base version: ${formatSemver(baseVersion)}`,
      `Current version: ${formatSemver(currentVersion)}`,
      `Required bump: ${branchRule.expectedBump}`,
    ].join('\n')
  );
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
