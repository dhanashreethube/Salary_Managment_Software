import { db } from "./connection.js";
import { users, employees, compensation } from "./schema.js";
import bcrypt from "bcryptjs";

const firstNames = [
  "Amit", "Rahul", "Priya", "Neha", "John", "Emily", "Michael", "Sarah", "David", "Jessica",
  "James", "Emma", "Robert", "Olivia", "William", "Sophia", "Oliver", "Amelie", "Lucas", "Charlotte",
  "Raj", "Vikram", "Sanjay", "Anjali", "Karan", "Deepak", "Sunita", "Rohan", "Thomas", "Sophie",
  "Hans", "Anna", "Peter", "Marie", "Wolfgang", "Sabine", "Dieter", "Helga", "Jürgen", "Ursula",
  "George", "Mary", "Arthur", "Elizabeth", "Charles", "Victoria", "Edward", "Margaret", "Harry", "Diana"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Kumar", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
  "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore",
  "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis",
  "Robinson", "Walker", "Perez", "Hall", "Young", "Allen", "Sanchez", "Wright", "King", "Scott",
  "Green", "Baker", "Adams", "Nelson", "Hill", "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter"
];

const departments = ["Engineering", "Product", "HR", "Sales", "Marketing"];

const rolesByDept = {
  Engineering: ["Software Engineer", "Senior Developer", "Tech Lead", "Architect", "DevOps Engineer"],
  Product: ["Product Manager", "UX Designer", "Product Owner", "Business Analyst"],
  HR: ["HR Specialist", "Recruiter", "HR Generalist", "HR Business Partner"],
  Sales: ["Sales Representative", "Account Manager", "Sales Executive", "Sales Director"],
  Marketing: ["Marketing Specialist", "Content Strategist", "SEO Specialist", "Marketing Manager"]
};

const locations = [
  { country: "India", currency: "INR", baseSalaryRange: [60000000, 300000000], bonusRange: [5000000, 30000000], allowanceRange: [3000000, 10000000], deductionRange: [2000000, 15000000] }, // in Paise (1 INR = 100 Paise)
  { country: "United States", currency: "USD", baseSalaryRange: [6000000, 18000000], bonusRange: [500000, 4000000], allowanceRange: [200000, 1000000], deductionRange: [500000, 3000000] }, // in Cents (1 USD = 100 Cents)
  { country: "United Kingdom", currency: "GBP", baseSalaryRange: [5000000, 14000000], bonusRange: [400000, 3000000], allowanceRange: [150000, 800000], deductionRange: [400000, 2500000] }, // in Pence (1 GBP = 100 Pence)
  { country: "Germany", currency: "EUR", baseSalaryRange: [5000000, 13000000], bonusRange: [400000, 2500000], allowanceRange: [150000, 800000], deductionRange: [400000, 2000000] } // in Cents (1 EUR = 100 Cents)
];

async function seed() {
  console.log("Starting Seeding Process...");

  // 1. Create HR Manager User
  console.log("Seeding Administrative HR User...");
  const adminId = "admin-uuid";
  const passwordHash = bcrypt.hashSync("Password123", 10);
  
  // Clean existing tables
  try {
    db.delete(compensation).run();
    db.delete(employees).run();
    db.delete(users).run();
  } catch (err) {
    console.log("Database tables might be empty or uncreated yet. Continuing...");
  }

  db.insert(users).values({
    id: adminId,
    username: "admin",
    passwordHash: passwordHash
  }).run();
  console.log("Admin seeded successfully.");

  // 2. Generate and batch seed 10,000 Employees
  console.log("Generating 10,000 employee records...");
  const batchSize = 1000;
  const totalRecords = 10000;

  for (let batchStart = 0; batchStart < totalRecords; batchStart += batchSize) {
    const employeeValues = [];
    const compensationValues = [];

    for (let i = 0; i < batchSize; i++) {
      const idx = batchStart + i;
      const id = `emp-${idx + 1}`;
      const employeeId = `ACME-${10000 + idx + 1}`;

      const fNameIdx = idx % firstNames.length;
      const lNameIdx = Math.floor(idx / firstNames.length) % lastNames.length;
      const suffix = Math.floor(idx / (firstNames.length * lastNames.length)) + 1;
      
      const firstName = firstNames[fNameIdx];
      const lastName = suffix > 1 ? `${lastNames[lNameIdx]} ${suffix}` : lastNames[lNameIdx];
      const email = `${firstName.toLowerCase()}.${lastNames[lNameIdx].toLowerCase()}.${idx + 1}@acme.com`;

      const deptIdx = idx % departments.length;
      const department = departments[deptIdx];
      
      const roles = rolesByDept[department];
      const role = roles[idx % roles.length];

      const locIdx = idx % locations.length;
      const { country, currency, baseSalaryRange, bonusRange, allowanceRange, deductionRange } = locations[locIdx];

      // Random within bounds based on index to be deterministic
      const baseSalary = Math.floor(baseSalaryRange[0] + ((idx * 7919) % (baseSalaryRange[1] - baseSalaryRange[0])));
      const bonus = Math.floor(bonusRange[0] + ((idx * 8311) % (bonusRange[1] - bonusRange[0])));
      const allowances = Math.floor(allowanceRange[0] + ((idx * 8581) % (allowanceRange[1] - allowanceRange[0])));
      const deductions = Math.floor(deductionRange[0] + ((idx * 9011) % (deductionRange[1] - deductionRange[0])));

      employeeValues.push({
        id,
        employeeId,
        firstName,
        lastName,
        email,
        department,
        role,
        country,
        currency
      });

      compensationValues.push({
        id: `comp-${idx + 1}`,
        employeeId: id,
        baseSalary,
        bonus,
        allowances,
        deductions
      });
    }

    console.log(`Inserting batch ${batchStart / batchSize + 1} of ${totalRecords / batchSize}...`);
    
    // Execute inserts in a transaction to guarantee atomic execution and maximum speed
    db.transaction((tx) => {
      tx.insert(employees).values(employeeValues).run();
      tx.insert(compensation).values(compensationValues).run();
    });
  }

  console.log("Database seeded successfully with 10,000 employee records.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
