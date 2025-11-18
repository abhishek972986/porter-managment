import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Carrier from '../models/Carrier.js';
import Porter from '../models/Porter.js';
import Location from '../models/Location.js';
import CommuteCost from '../models/CommuteCost.js';
import logger from '../utils/logger.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Carrier.deleteMany({});
    await Porter.deleteMany({});
    await Location.deleteMany({});
    await CommuteCost.deleteMany({});
    logger.info('Cleared existing data');

    // Seed Admin User
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@porter.com',
      password: process.env.ADMIN_PASSWORD || 'password123',
      role: 'Admin',
    });
    logger.info(`Admin user created: ${admin.email}`);

    // Seed Carriers
    const carriers = await Carrier.create([
      { name: 'porter', capacityKg: 20 },
      { name: 'small-donkey', capacityKg: 40 },
      { name: 'pickup-truck', capacityKg: 1500 },
    ]);
    logger.info(`Created ${carriers.length} carriers`);

    // Seed Porters
    const porters = await Porter.create([
      { uid: 'P001', name: 'Ahmed Ali', designation: 'Senior Porter', active: true },
      { uid: 'P002', name: 'Mohamed Hassan', designation: 'Porter', active: true },
      { uid: 'P003', name: 'Fatima Ibrahim', designation: 'Porter', active: true },
      { uid: 'P004', name: 'Ali Omar', designation: 'Junior Porter', active: true },
      { uid: 'P005', name: 'Sara Khalil', designation: 'Porter', active: true },
      { uid: 'P006', name: 'Ibrahim Youssef', designation: 'Senior Porter', active: true },
      { uid: 'P007', name: 'Amina Ahmed', designation: 'Porter', active: true },
      { uid: 'P008', name: 'Khaled Mahmoud', designation: 'Porter', active: true },
    ]);
    logger.info(`Created ${porters.length} porters`);

    // Seed Locations
    const locations = await Location.create([
      { code: 'WH01', name: 'Main Warehouse' },
      { code: 'WH02', name: 'North Warehouse' },
      { code: 'WH03', name: 'South Warehouse' },
      { code: 'DC01', name: 'Distribution Center 1' },
      { code: 'DC02', name: 'Distribution Center 2' },
      { code: 'ST01', name: 'Store 1 - Downtown' },
      { code: 'ST02', name: 'Store 2 - Mall' },
      { code: 'ST03', name: 'Store 3 - Market' },
      { code: 'OFF01', name: 'Head Office' },
      { code: 'OFF02', name: 'Branch Office' },
    ]);
    logger.info(`Created ${locations.length} locations`);

    // Seed Commute Costs
    const commuteCosts = [];
    
    // Create costs for all carrier types between key locations
    const routes = [
      { from: 'WH01', to: 'DC01', costs: { porter: 50, 'small-donkey': 80, 'pickup-truck': 150 } },
      { from: 'WH01', to: 'DC02', costs: { porter: 60, 'small-donkey': 90, 'pickup-truck': 180 } },
      { from: 'WH01', to: 'ST01', costs: { porter: 40, 'small-donkey': 70, 'pickup-truck': 120 } },
      { from: 'WH01', to: 'ST02', costs: { porter: 55, 'small-donkey': 85, 'pickup-truck': 160 } },
      { from: 'WH02', to: 'DC01', costs: { porter: 45, 'small-donkey': 75, 'pickup-truck': 140 } },
      { from: 'WH02', to: 'ST01', costs: { porter: 35, 'small-donkey': 65, 'pickup-truck': 110 } },
      { from: 'WH03', to: 'DC02', costs: { porter: 50, 'small-donkey': 80, 'pickup-truck': 150 } },
      { from: 'WH03', to: 'ST03', costs: { porter: 40, 'small-donkey': 70, 'pickup-truck': 130 } },
      { from: 'DC01', to: 'ST01', costs: { porter: 30, 'small-donkey': 50, 'pickup-truck': 90 } },
      { from: 'DC01', to: 'ST02', costs: { porter: 35, 'small-donkey': 55, 'pickup-truck': 100 } },
      { from: 'DC02', to: 'ST02', costs: { porter: 25, 'small-donkey': 45, 'pickup-truck': 80 } },
      { from: 'DC02', to: 'ST03', costs: { porter: 30, 'small-donkey': 50, 'pickup-truck': 90 } },
    ];

    for (const route of routes) {
      const fromLoc = locations.find((l) => l.code === route.from);
      const toLoc = locations.find((l) => l.code === route.to);

      for (const [carrierName, cost] of Object.entries(route.costs)) {
        const carrier = carriers.find((c) => c.name === carrierName);
        
        if (fromLoc && toLoc && carrier) {
          commuteCosts.push({
            fromLocation: fromLoc._id,
            toLocation: toLoc._id,
            carrier: carrier._id,
            cost,
          });
        }
      }
    }

    await CommuteCost.create(commuteCosts);
    logger.info(`Created ${commuteCosts.length} commute cost entries`);

    logger.info('✅ Database seeded successfully!');
    logger.info('\n📝 Login Credentials:');
    logger.info(`   Email: ${admin.email}`);
    logger.info(`   Password: ${process.env.ADMIN_PASSWORD || 'password123'}`);

    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
