// Analyze individual beatmap playcount values
const fs = require('fs');

// Load the data
const data = JSON.parse(fs.readFileSync('public/data/mappers.json', 'utf8'));

console.log('Analyzing individual beatmap playcount values...\n');

// Check multiple mappers to find patterns
console.log('Analyzing first 5 mappers for playcount patterns:\n');

data.mappers.slice(0, 5).forEach((mapper, mapperIndex) => {
  console.log(`${mapperIndex + 1}. Mapper: ${mapper.username}`);
  console.log(`   Total beatmaps: ${mapper.beatmaps.length}`);
  
  // Check for patterns - how many have 0 playcount vs non-zero
  let zeroPlaycount = 0;
  let nonZeroPlaycount = 0;
  let undefinedPlaycount = 0;
  
  mapper.beatmaps.forEach(beatmap => {
    const playcount = parseInt(beatmap.playcount || '0');
    if (beatmap.playcount === undefined || beatmap.playcount === null) {
      undefinedPlaycount++;
    } else if (playcount === 0) {
      zeroPlaycount++;
    } else {
      nonZeroPlaycount++;
    }
  });
  
  console.log(`   - Zero playcount: ${zeroPlaycount}`);
  console.log(`   - Non-zero playcount: ${nonZeroPlaycount}`);
  console.log(`   - Undefined/null playcount: ${undefinedPlaycount}`);
  
  // Show examples of zero playcount beatmaps if they exist
  const zeroBeatmaps = mapper.beatmaps.filter(b => parseInt(b.playcount || '0') === 0);
  if (zeroBeatmaps.length > 0) {
    console.log(`   ⚠️  Examples of ZERO playcount beatmaps:`);
    zeroBeatmaps.slice(0, 3).forEach((beatmap, index) => {
      console.log(`      ${index + 1}. ${beatmap.title} (${beatmap.version}) - Playcount: ${beatmap.playcount}`);
    });
  }
  
  console.log('');
});

// Global statistics across all mappers
let totalZero = 0;
let totalNonZero = 0;
let totalUndefined = 0;

data.mappers.forEach(mapper => {
  mapper.beatmaps.forEach(beatmap => {
    const playcount = parseInt(beatmap.playcount || '0');
    if (beatmap.playcount === undefined || beatmap.playcount === null) {
      totalUndefined++;
    } else if (playcount === 0) {
      totalZero++;
    } else {
      totalNonZero++;
    }
  });
});

console.log('=== GLOBAL STATISTICS ===');
console.log(`Total mappers: ${data.mappers.length}`);
console.log(`Total beatmaps across all mappers: ${totalZero + totalNonZero + totalUndefined}`);
console.log(`- Zero playcount: ${totalZero}`);
console.log(`- Non-zero playcount: ${totalNonZero}`);
console.log(`- Undefined/null playcount: ${totalUndefined}`);

if (totalZero > 0) {
  console.log(`\n❌ Found ${totalZero} beatmaps with zero playcount!`);
  console.log('This could be the source of the issue you\'re seeing.');
} else {
  console.log('\n✅ No beatmaps found with zero playcount in the data.');
  console.log('The issue might be in the UI display logic or a specific component.');
}

// Check if this is a data fetching issue by looking at the fetch script
console.log('\n🔍 This suggests the issue might be in the data fetching process.');
console.log('Let\'s check the fetch-mappers.js script to see how playcount is being retrieved...');
