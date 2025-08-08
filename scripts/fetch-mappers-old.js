const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const OSU_API_KEY = process.env.OSU_API_KEY;
const BASE_URL = 'https://osu.ppy.sh/api';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'mappers.json');
const STATE_FILE = path.join(OUTPUT_DIR, 'fetch-state.json');

// API Configuration
const MAX_BEATMAPS_PER_REQUEST = 500; // osu! API limit
const RATE_LIMIT_DELAY = 100; // ms between requests
const MAX_RETRIES = 3;

// Manual list of additional Korean mapper user IDs to include
const MANUAL_MAPPER_IDS = [
    16368505, 11602148, 13543418, 16142512, 4115819, 533502, 224280, 11171976, 11185275, 165027, 3011818, 8058206, 2688581, 9262355, 9892196, 9823042, 9326064, 9555243, 1974436, 4904557, 4643294, 566276, 8001433, 1943309, 5413027, 1997633, 3846265, 11103764, 4005683, 8946550, 2489741, 7495614, 113646, 707980, 1742622, 917786, 1545563, 87546, 2036217, 3626063, 246186, 261694, 43468, 250808, 1629059, 2121032, 5591315, 2490770, 739813, 685079, 531253, 197876, 4746949, 1634445, 1966909, 2046893, 717228, 4694602, 626873, 3789302, 2043401, 3896865, 3984370, 538604, 670365, 873758, 3720242, 412787, 1945351, 798743, 70863, 1895984, 6974536, 259972, 759439, 3360737, 120919, 1893883, 1204034, 2859670, 1596078, 4647754, 596298, 257977, 747356, 1029022, 1574070, 1458069, 114017, 899031, 1380419, 5062061, 2162939, 1686145, 194807, 1632431, 1142651, 156215, 2393914, 353453, 9207, 3044645, 101399, 87065, 2786984, 6186628, 832084, 4991434, 5379679, 6465707, 501, 887358, 111011, 865132, 3087654, 232942, 2353313, 1357150, 317802, 323677, 3869951, 11771, 702598, 389236, 2782104, 70730, 297086, 1891192, 1399551, 2732340, 1142692, 157400, 3627182, 1533796, 5456561, 549766, 685229, 117022, 937761, 7898495, 3021168, 1530308, 757783, 4129020, 6336713, 6522146, 980092, 2193723, 3642440, 7515767, 1393255, 4485933, 2193444, 4118962, 7342798, 6673830, 4637369, 3261991, 659959, 13340203, 9014584, 6363008, 697649, 11443437, 2218047, 13924533, 2288943, 14892190, 16368505
];

// List of user IDs to ignore (known foreigners with KR flag)
const IGNORE_MAPPER_IDS = [
    // Add user IDs here of mappers who have KR flag but are not actually Korean
    // Example: 123456, 789012
];

// Helper function to make API requests with retry logic
async function makeApiRequest(url, retries = MAX_RETRIES) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (retries > 0 && (error.response?.status === 429 || error.response?.status >= 500)) {
            console.log(`API request failed, retrying... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 2));
            return makeApiRequest(url, retries - 1);
        }
        throw error;
    }
}

// Rate limiting helper
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load previous fetch state
async function loadFetchState() {
    try {
        const stateData = await fs.readFile(STATE_FILE, 'utf8');
        return JSON.parse(stateData);
    } catch (error) {
        // Return default state if file doesn't exist
        return {
            lastChecked: null,
            mapperStates: {}, // userId -> { lastBeatmapCheck: timestamp }
            totalBeatmaps: 0,
            lastFullScan: null
        };
    }
}

// Save fetch state
async function saveFetchState(state) {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// Load existing mapper data
async function loadExistingData() {
    try {
        const data = await fs.readFile(OUTPUT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            lastUpdated: new Date().toISOString(),
            totalMappers: 0,
            totalBeatmaps: 0,
            mappers: []
        };
    }
}

async function fetchWithRetry(url, params, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await delay(100); // Rate limiting: ~600 requests per minute
            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i === retries - 1) throw error;
            await delay(1000 * (i + 1)); // Exponential backoff
        }
    }
}

// Fetch all beatmaps for a specific user with pagination
async function fetchAllBeatmapsForUser(userId, sinceDate = null) {
    const beatmaps = [];
    let offset = 0;
    let hasMore = true;
    
    console.log(`Fetching beatmaps for user ${userId}${sinceDate ? ` since ${sinceDate}` : ''}...`);
    
    while (hasMore) {
        const params = {
            k: OSU_API_KEY,
            u: userId,
            type: 'id',
            limit: MAX_BEATMAPS_PER_REQUEST,
            offset: offset
        };
        
        if (sinceDate) {
            params.since = sinceDate;
        }
        
        try {
            const batch = await makeApiRequest(`${BASE_URL}/get_beatmaps`, params);
            
            if (!batch || batch.length === 0) {
                hasMore = false;
                break;
            }
            
            // Filter for ranked beatmaps only
            const rankedBeatmaps = batch.filter(beatmap => 
                beatmap.approved === '1' || beatmap.approved === '2'
            );
            
            beatmaps.push(...rankedBeatmaps);
            offset += MAX_BEATMAPS_PER_REQUEST;
            
            // If we got less than the limit, we've reached the end
            if (batch.length < MAX_BEATMAPS_PER_REQUEST) {
                hasMore = false;
            }
            
            await delay(RATE_LIMIT_DELAY);
            
        } catch (error) {
            console.error(`Error fetching beatmaps for user ${userId}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`Found ${beatmaps.length} ranked beatmaps for user ${userId}`);
    return beatmaps;
}

async function fetchKoreanMappers() {
    if (!OSU_API_KEY) {
        throw new Error('OSU_API_KEY environment variable is required');
    }

    console.log('Starting Korean mappers fetch with incremental updates...');
    
    // Load previous state and existing data
    const fetchState = await loadFetchState();
    const existingData = await loadExistingData();
    
    const mappers = new Map();
    const processedUsers = new Set();
    
    // Convert existing mappers to Map for easier updates
    existingData.mappers.forEach(mapper => {
        mappers.set(mapper.user_id, mapper);
    });
    
    console.log(`Loaded ${existingData.mappers.length} existing mappers from previous run`);
    
    const currentTime = new Date().toISOString();
    const isFullScan = !fetchState.lastFullScan || 
        (Date.now() - new Date(fetchState.lastFullScan).getTime()) > 7 * 24 * 60 * 60 * 1000; // Weekly full scan

    // Function to process a single user with incremental updates
    async function processUser(userId) {
        if (processedUsers.has(userId)) return;
        processedUsers.add(userId);

        try {
            console.log(`Processing user ID: ${userId}`);
            
            // Check if user is in ignore list
            if (IGNORE_MAPPER_IDS.includes(parseInt(userId))) {
                console.log(`User ID ${userId} is in ignore list, skipping`);
                return;
            }

            // Get user data
            const userData = await fetchWithRetry(`${BASE_URL}/get_user`, {
                k: OSU_API_KEY,
                u: userId,
                type: 'id'
            });

            if (!userData || userData.length === 0) {
                console.log(`No user data found for ID: ${userId}`);
                return;
            }

            const user = userData[0];
            
            // Determine if we need to fetch new beatmaps for this user
            const userState = fetchState.mapperStates[userId] || {};
            const lastBeatmapCheck = userState.lastBeatmapCheck;
            const sinceDate = isFullScan ? null : lastBeatmapCheck;
            
            // Fetch all beatmaps for this user with pagination
            const beatmaps = await fetchAllBeatmapsForUser(userId, sinceDate);
            
            if (beatmaps.length > 0) {
                // Update or create mapper entry
                const existingMapper = mappers.get(userId);
                
                if (existingMapper) {
                    // Merge new beatmaps with existing ones
                    const existingBeatmapIds = new Set(existingMapper.beatmaps.map(b => b.beatmap_id));
                    const newBeatmaps = beatmaps.filter(b => !existingBeatmapIds.has(b.beatmap_id));
                    
                    existingMapper.beatmaps.push(...newBeatmaps);
                    existingMapper.beatmaps.sort((a, b) => new Date(b.approved_date) - new Date(a.approved_date));
                    existingMapper.rankedBeatmaps = existingMapper.beatmaps.length;
                    existingMapper.lastUpdated = currentTime;
                    
                    console.log(`Updated mapper ${user.username}: +${newBeatmaps.length} new beatmaps (total: ${existingMapper.beatmaps.length})`);
                } else {
                    // Create new mapper entry
                    const mapper = {
                        user_id: userId,
                        username: user.username,
                        country: user.country,
                        rankedBeatmaps: beatmaps.length,
                        beatmaps: beatmaps.sort((a, b) => new Date(b.approved_date) - new Date(a.approved_date)),
                        lastUpdated: currentTime
                    };
                    
                    mappers.set(userId, mapper);
                    console.log(`Added new mapper ${user.username}: ${beatmaps.length} ranked beatmaps`);
                }
                
                // Update user state
                fetchState.mapperStates[userId] = {
                    lastBeatmapCheck: currentTime
                };
            } else if (!mappers.has(userId)) {
                console.log(`User ${user.username} has no ranked beatmaps, skipping`);
            }
      }
      
      // Check if user is Korean or in manual list
      if (user.country !== 'KR' && !MANUAL_MAPPER_IDS.includes(parseInt(userId))) {
        console.log(`User ${user.username} is not Korean (${user.country}), skipping`);
        return;
      }

      console.log(`Fetching beatmaps for ${user.username}...`);
      const beatmaps = await fetchWithRetry(`${BASE_URL}/get_beatmaps`, {
        k: OSU_API_KEY,
        u: userId,
        type: 'id'
      });

      // Filter for ranked/approved/loved beatmaps only
      const rankedBeatmaps = beatmaps.filter(beatmap => 
        ['1', '2', '3', '4'].includes(beatmap.approved)
      );

      if (rankedBeatmaps.length > 0) {
        mappers.set(userId, {
          user_id: user.user_id,
          username: user.username,
          country: user.country,
          pp_rank: user.pp_rank || '0',
          pp_raw: user.pp_raw || '0',
          join_date: user.join_date,
          playcount: user.playcount || '0',
          beatmaps: rankedBeatmaps.sort((a, b) => 
            new Date(b.approved_date) - new Date(a.approved_date)
          )
        });
        console.log(`Added ${user.username} with ${rankedBeatmaps.length} ranked beatmaps`);
      } else {
        console.log(`${user.username} has no ranked beatmaps, skipping`);
      }
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error.message);
    }
  }

  // Method 1: Find Korean mappers by searching recent beatmaps
  console.log('Searching for Korean mappers through recent beatmaps...');
  try {
    const recentBeatmaps = await fetchWithRetry(`${BASE_URL}/get_beatmaps`, {
      k: OSU_API_KEY,
      since: '2020-01-01',
      limit: 500
    });

    const koreanCreators = new Set();
    for (const beatmap of recentBeatmaps) {
      if (beatmap.creator_id) {
        koreanCreators.add(beatmap.creator_id);
      }
    }

    console.log(`Found ${koreanCreators.size} potential mappers from recent beatmaps`);

    // Process each potential mapper
    for (const creatorId of koreanCreators) {
      await processUser(creatorId);
    }
  } catch (error) {
    console.error('Error fetching recent beatmaps:', error.message);
  }

  // Method 2: Process manually specified mapper IDs
  console.log('Processing manually specified mappers...');
  for (const mapperId of MANUAL_MAPPER_IDS) {
    await processUser(mapperId);
  }
  
  // Convert Map to array and return
  return Array.from(mappers.values());
}

async function main() {
  try {
    console.log('Starting Korean mapper data collection...');
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Fetch mapper data
    const mappers = await fetchKoreanMappers();
    
    console.log(`\nCollected data for ${mappers.length} Korean mappers`);
    console.log(`Total beatmaps: ${mappers.reduce((sum, mapper) => sum + mapper.beatmaps.length, 0)}`);

    // Prepare output data
    const outputData = {
      lastUpdated: new Date().toISOString(),
      totalMappers: mappers.length,
      totalBeatmaps: mappers.reduce((sum, mapper) => sum + mapper.beatmaps.length, 0),
      mappers: mappers
    };

    // Write to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\nData saved to ${OUTPUT_FILE}`);

    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`Korean mappers found: ${mappers.length}`);
    mappers.slice(0, 10).forEach((mapper, index) => {
      console.log(`${index + 1}. ${mapper.username} - ${mapper.beatmaps.length} beatmaps (Rank #${mapper.pp_rank})`);
    });
    if (mappers.length > 10) {
      console.log(`... and ${mappers.length - 10} more mappers`);
    }

  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
