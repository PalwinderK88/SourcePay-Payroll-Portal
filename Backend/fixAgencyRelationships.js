const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('========================================');
console.log('  FIXING AGENCY RELATIONSHIPS');
console.log('========================================\n');

db.serialize(() => {
  // Step 1: Check current agency admin
  console.log('Step 1: Checking agency admin...');
  db.get("SELECT id, name, email, role, agency_id, agency_name FROM users WHERE email = 'agencyadmin@test.com'", (err, admin) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('Current admin data:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\n');
    
    // Step 2: Find contractors with same agency_name
    console.log('Step 2: Finding contractors for agency:', admin.agency_name);
    db.all("SELECT id, name, email, role, agency_id, agency_name FROM users WHERE role = 'contractor' AND agency_name = ?", [admin.agency_name], (err, contractors) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log(`Found ${contractors.length} contractors:`);
      contractors.forEach(c => {
        console.log(`  - ${c.name} (ID: ${c.id}, agency_id: ${c.agency_id})`);
      });
      console.log('\n');
      
      if (contractors.length === 0) {
        console.log('⚠️  No contractors found! Let me check all contractors...\n');
        
        db.all("SELECT id, name, email, role, agency_id, agency_name FROM users WHERE role = 'contractor'", (err, allContractors) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          
          console.log(`Total contractors in database: ${allContractors.length}`);
          allContractors.forEach(c => {
            console.log(`  - ${c.name} (agency: ${c.agency_name}, agency_id: ${c.agency_id})`);
          });
          console.log('\n');
          
          if (allContractors.length > 0) {
            // Use the first contractor's agency_name
            const targetAgency = allContractors[0].agency_name;
            console.log(`Updating admin to use agency: ${targetAgency}\n`);
            
            db.run(
              'UPDATE users SET agency_name = ? WHERE id = ?',
              [targetAgency, admin.id],
              (err) => {
                if (err) {
                  console.error('Error updating admin:', err);
                  return;
                }
                console.log('✅ Admin updated to match contractor agency\n');
                
                // Now update agency_id for all users in this agency
                updateAgencyIds(targetAgency);
              }
            );
          } else {
            console.log('❌ No contractors found in database!');
            db.close();
          }
        });
      } else {
        // Update agency_id for all users in this agency
        updateAgencyIds(admin.agency_name);
      }
    });
  });
});

function updateAgencyIds(agencyName) {
  console.log('Step 3: Ensuring all users have agency_id = 1...');
  
  db.run(
    'UPDATE users SET agency_id = 1 WHERE agency_name = ?',
    [agencyName],
    function(err) {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log(`✅ Updated ${this.changes} users with agency_id = 1\n`);
      
      // Verify the fix
      verifyFix(agencyName);
    }
  );
}

function verifyFix(agencyName) {
  console.log('Step 4: Verifying fix...');
  
  db.all(
    "SELECT id, name, email, role, agency_id, agency_name FROM users WHERE agency_name = ? ORDER BY role, id",
    [agencyName],
    (err, users) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log(`\nUsers in agency "${agencyName}":`);
      users.forEach(u => {
        console.log(`  ${u.role.padEnd(15)} - ${u.name.padEnd(20)} (ID: ${u.id}, agency_id: ${u.agency_id})`);
      });
      
      console.log('\n========================================');
      console.log('  FIX COMPLETE!');
      console.log('========================================');
      console.log(`All users now have:`);
      console.log(`  - agency_name: ${agencyName}`);
      console.log(`  - agency_id: 1`);
      console.log('\nContractors should now be visible!\n');
      
      db.close();
    }
  );
}
