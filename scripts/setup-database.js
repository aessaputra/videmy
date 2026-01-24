/**
 * Appwrite Database Setup Script
 * 
 * Jalankan script ini untuk membuat database dan collections di Appwrite.
 * 
 * Usage:
 *   node scripts/setup-database.js
 * 
 * Prerequisites:
 *   - npm install node-appwrite
 *   - Buat API Key di Appwrite Console (Project Settings → API Keys)
 */

import { Client, Databases } from 'node-appwrite';

// ============================================
// KONFIGURASI - ISI DATA ANDA DI SINI
// ============================================
const CONFIG = {
    endpoint: 'https://api.aes.my.id/v1',
    projectId: '6974e8ea002df44a11c6',  // Ganti dengan Project ID Anda
    apiKey: 'standard_3c27f11ae2692c90a999e859ad3177680176af1a1b0b4ae56372dd03571191e5b42dc19ea23883a62c19791283d54233666972b7027da9e6d68f7bd62dda18974de1e3718c01eaab71a4a5bb2d712e895c1c61c6fc532983747796c888a60f944029bde279fcd87dddb027e1857ad77036971f0a0a677b100ce52ce72140370c',        // Ganti dengan API Key Anda
    databaseId: 'videmy_db',
    databaseName: 'Videmy Database',
};

// ============================================
// SCHEMA DEFINITION
// ============================================
const COLLECTIONS = [
    {
        id: 'courses',
        name: 'Courses',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        attributes: [
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'string', key: 'description', size: 5000, required: true },
            { type: 'string', key: 'thumbnail', size: 500, required: false },
            { type: 'string', key: 'instructorId', size: 36, required: true },
            { type: 'string', key: 'category', size: 100, required: false },
            { type: 'boolean', key: 'isPublished', required: false },
        ],
    },
    {
        id: 'modules',
        name: 'Modules',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        attributes: [
            { type: 'string', key: 'courseId', size: 36, required: true },
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'integer', key: 'order', required: true },
        ],
    },
    {
        id: 'lessons',
        name: 'Lessons',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        attributes: [
            { type: 'string', key: 'moduleId', size: 36, required: true },
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'string', key: 'youtubeUrl', size: 500, required: true },
            { type: 'integer', key: 'duration', required: false },
            { type: 'integer', key: 'order', required: true },
        ],
    },
    {
        id: 'enrollments',
        name: 'Enrollments',
        permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'courseId', size: 36, required: true },
            { type: 'datetime', key: 'enrolledAt', required: true },
        ],
    },
    {
        id: 'progress',
        name: 'Progress',
        permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'lessonId', size: 36, required: true },
            { type: 'datetime', key: 'completedAt', required: true },
        ],
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
async function createAttribute(databases, databaseId, collectionId, attr) {
    try {
        switch (attr.type) {
            case 'string':
                await databases.createStringAttribute(
                    databaseId, collectionId, attr.key, attr.size, attr.required
                );
                break;
            case 'integer':
                await databases.createIntegerAttribute(
                    databaseId, collectionId, attr.key, attr.required
                );
                break;
            case 'boolean':
                await databases.createBooleanAttribute(
                    databaseId, collectionId, attr.key, attr.required
                );
                break;
            case 'datetime':
                await databases.createDatetimeAttribute(
                    databaseId, collectionId, attr.key, attr.required
                );
                break;
        }
        console.log(`  ✓ ${attr.key} (${attr.type})`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`  - ${attr.key} sudah ada`);
        } else {
            console.log(`  ✗ ${attr.key}: ${error.message}`);
        }
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// MAIN SETUP
// ============================================
async function setup() {
    console.log('🚀 Memulai Setup Database Appwrite...\n');

    const client = new Client()
        .setEndpoint(CONFIG.endpoint)
        .setProject(CONFIG.projectId)
        .setKey(CONFIG.apiKey);

    const databases = new Databases(client);

    // Create database
    console.log(`📦 Membuat database: ${CONFIG.databaseName}`);
    try {
        await databases.create(CONFIG.databaseId, CONFIG.databaseName);
        console.log(`  ✓ Database berhasil dibuat\n`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`  - Database sudah ada\n`);
        } else {
            console.log(`  ✗ Error: ${error.message}\n`);
        }
    }

    // Create collections
    for (const collection of COLLECTIONS) {
        console.log(`📁 Membuat collection: ${collection.name}`);

        try {
            await databases.createCollection(
                CONFIG.databaseId,
                collection.id,
                collection.name,
                collection.permissions
            );
            console.log(`  ✓ Collection berhasil dibuat`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  - Collection sudah ada`);
            } else {
                console.log(`  ✗ Error: ${error.message}`);
            }
        }

        // Create attributes
        for (const attr of collection.attributes) {
            await createAttribute(databases, CONFIG.databaseId, collection.id, attr);
        }

        console.log('  ⏳ Menunggu attributes diproses...');
        await sleep(2000);
        console.log('');
    }

    console.log('✅ Setup database selesai!\n');
    console.log('📝 Langkah selanjutnya:');
    console.log(`   1. Update .env: VITE_APPWRITE_DATABASE_ID=${CONFIG.databaseId}`);
    console.log('   2. Jalankan: npm run dev');
    console.log('   3. Test registrasi dan login\n');
}

setup().catch((error) => {
    console.error('❌ Setup gagal:', error.message);
    process.exit(1);
});
