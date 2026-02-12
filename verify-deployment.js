#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to ensure everything is configured correctly
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

console.log('🔍 WanderLust Pre-Deployment Verification\n');
console.log('='.repeat(50));

let errors = [];
let warnings = [];
let passed = 0;

// Check 1: Environment Variables
console.log('\n📋 Checking Environment Variables...');
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_KEY',
    'CLOUDINARY_SECRET',
    'Map_Token',
    'ATLASDB_URL',
    'SESSION_SECRET'
];

const optionalEnvVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL'
];

requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName} is set`);
        passed++;
    } else {
        console.log(`   ❌ ${varName} is MISSING`);
        errors.push(`Missing required environment variable: ${varName}`);
    }
});

optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName} is set (optional)`);
    } else {
        console.log(`   ⚠️  ${varName} is not set (optional)`);
        warnings.push(`Optional environment variable not set: ${varName}`);
    }
});

// Check 2: Required Files
console.log('\n📁 Checking Required Files...');
const requiredFiles = [
    'app.js',
    'package.json',
    '.env',
    '.gitignore',
    'middleware.js',
    'schema.js',
    'cloudConfig.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✅ ${file} exists`);
        passed++;
    } else {
        console.log(`   ❌ ${file} is MISSING`);
        errors.push(`Missing required file: ${file}`);
    }
});

// Check 3: Required Directories
console.log('\n📂 Checking Required Directories...');
const requiredDirs = [
    'models',
    'routes',
    'controllers',
    'views',
    'public',
    'utils',
    'init'
];

requiredDirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, dir))) {
        console.log(`   ✅ ${dir}/ exists`);
        passed++;
    } else {
        console.log(`   ❌ ${dir}/ is MISSING`);
        errors.push(`Missing required directory: ${dir}`);
    }
});

// Check 4: .gitignore Configuration
console.log('\n🔒 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const requiredIgnores = ['.env', 'node_modules', 'uploads'];

    requiredIgnores.forEach(pattern => {
        if (gitignoreContent.includes(pattern)) {
            console.log(`   ✅ ${pattern} is in .gitignore`);
            passed++;
        } else {
            console.log(`   ❌ ${pattern} is NOT in .gitignore`);
            errors.push(`.gitignore missing pattern: ${pattern}`);
        }
    });
}

// Check 5: Package.json Configuration
console.log('\n📦 Checking package.json...');
if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.scripts && packageJson.scripts.start) {
        console.log(`   ✅ "start" script is defined: ${packageJson.scripts.start}`);
        passed++;
    } else {
        console.log('   ❌ "start" script is MISSING');
        errors.push('package.json missing "start" script');
    }

    if (packageJson.engines && packageJson.engines.node) {
        console.log(`   ✅ Node version specified: ${packageJson.engines.node}`);
        passed++;
    } else {
        console.log('   ⚠️  Node version not specified in engines');
        warnings.push('Consider specifying Node version in package.json engines field');
    }

    const requiredDeps = [
        'express',
        'mongoose',
        'ejs',
        'passport',
        'cloudinary',
        'dotenv'
    ];

    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`   ✅ ${dep} is installed`);
            passed++;
        } else {
            console.log(`   ❌ ${dep} is MISSING from dependencies`);
            errors.push(`Missing dependency: ${dep}`);
        }
    });
}

// Check 6: MongoDB Connection String
console.log('\n🗄️  Checking Database Configuration...');
if (process.env.ATLASDB_URL) {
    if (process.env.ATLASDB_URL.includes('mongodb+srv://')) {
        console.log('   ✅ Using MongoDB Atlas (cloud database)');
        passed++;
    } else if (process.env.ATLASDB_URL.includes('mongodb://127.0.0.1') ||
        process.env.ATLASDB_URL.includes('localhost')) {
        console.log('   ⚠️  Using local MongoDB (not recommended for production)');
        warnings.push('Using local MongoDB - switch to Atlas for production');
    } else {
        console.log('   ✅ Using remote MongoDB');
        passed++;
    }
}

// Check 7: Session Secret Strength
console.log('\n🔐 Checking Session Security...');
if (process.env.SESSION_SECRET) {
    if (process.env.SESSION_SECRET.length >= 32) {
        console.log('   ✅ Session secret is strong (32+ characters)');
        passed++;
    } else if (process.env.SESSION_SECRET === 'mysupersecretcode') {
        console.log('   ⚠️  Using default session secret (change for production!)');
        warnings.push('Change SESSION_SECRET to a strong random string for production');
    } else {
        console.log('   ⚠️  Session secret is weak (< 32 characters)');
        warnings.push('Use a stronger session secret (32+ characters recommended)');
    }
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 VERIFICATION SUMMARY\n');
console.log(`✅ Passed Checks: ${passed}`);
console.log(`❌ Errors: ${errors.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);

if (errors.length > 0) {
    console.log('\n❌ ERRORS (Must Fix):');
    errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (Recommended):');
    warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
}

console.log('\n' + '='.repeat(50));

if (errors.length === 0) {
    console.log('\n✅ ✅ ✅  ALL CRITICAL CHECKS PASSED! ✅ ✅ ✅');
    console.log('\n🚀 Your application is ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. Commit your changes: git add . && git commit -m "Ready for deployment"');
    console.log('2. Push to GitHub: git push origin main');
    console.log('3. Deploy to Render/Heroku (see DEPLOYMENT.md)');
    console.log('4. Add environment variables on hosting platform');
    console.log('5. Test deployed application');
    process.exit(0);
} else {
    console.log('\n❌ DEPLOYMENT BLOCKED - Fix errors above first!');
    process.exit(1);
}
