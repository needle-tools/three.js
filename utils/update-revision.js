import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

// Read package.json to get version
const packagePath = join( __dirname, '..', 'package.json' );
const packageJson = JSON.parse( readFileSync( packagePath, 'utf-8' ) );
const version = packageJson.version;

// Parse version: 0.169.16-experimental.0 -> 169.16-experimental.0
// We want minor.patch (and pre-release if present)
const versionMatch = version.match( /^\d+\.(\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/ );

if ( ! versionMatch ) {

	console.error( 'Could not parse version from package.json:', version );
	process.exit( 1 );

}

const revision = versionMatch[ 1 ];

console.log( `Updating REVISION to '${revision}'...` );

// Update src/constants.js
const constantsPath = join( __dirname, '..', 'src', 'constants.js' );
let constantsContent = readFileSync( constantsPath, 'utf-8' );

// Replace the REVISION line
constantsContent = constantsContent.replace(
	/export const REVISION = '[^']*';/,
	`export const REVISION = '${ revision }';`
);

writeFileSync( constantsPath, constantsContent, 'utf-8' );

console.log( `✓ Updated REVISION in src/constants.js to '${ revision }'` );
