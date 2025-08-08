const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Configuration
const OSU_API_KEY = process.env.OSU_API_KEY;
const BASE_URL = 'https://osu.ppy.sh/api';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'mappers.json');
const STATE_FILE = path.join(__dirname, '..', 'data', 'fetch-state.json');
const CREATOR_MAPPING_FILE = path.join(__dirname, '..', 'data', 'creator-mappings.json');

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
    12469536, 2139130
];

// Helper function to make API requests with retry logic
async function makeApiRequest(url, params = {}, retries = MAX_RETRIES) {
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        if (retries > 0 && (error.response?.status === 429 || error.response?.status >= 500)) {
            console.log(`API request failed, retrying... (${retries} retries left)`);
            await delay(RATE_LIMIT_DELAY * 2);
            return makeApiRequest(url, params, retries - 1);
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

// Load creator name mappings (creator_name -> user_id)
async function loadCreatorMappings() {
    try {
        const data = await fs.readFile(CREATOR_MAPPING_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return empty mapping if file doesn't exist
        return {};
    }
}

// Save creator name mappings
async function saveCreatorMappings(mappings) {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(CREATOR_MAPPING_FILE), { recursive: true });
    await fs.writeFile(CREATOR_MAPPING_FILE, JSON.stringify(mappings, null, 2));
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
            totalBeatmapsets: 0,
            totalGuestDiffs: 0,
            mappers: []
        };
    }
}

// Helper function to categorize beatmaps into mapsets and guest difficulties
// NOTE: Guest difficulty detection is disabled due to API limitations
// The osu! API doesn't provide per-difficulty creator info, so accurate detection is impossible
function categorizeBeatmaps(beatmaps, mapperUsername) {
    const beatmapsets = new Map(); // beatmapset_id -> beatmapset info
    const guestDifficulties = []; // Placeholder - currently empty due to API limitations
    const ownBeatmaps = [];
    
    beatmaps.forEach(beatmap => {
        const beatmapsetId = beatmap.beatmapset_id;
        const creator = beatmap.creator;
        // DISABLED: Guest difficulty detection due to API limitations
        // const isGuestDiff = creator !== mapperUsername;
        const isGuestDiff = false; // All beatmaps treated as own beatmaps for now
        
        if (isGuestDiff) {
            guestDifficulties.push({
                ...beatmap,
                isGuestDiff: true,
                hostMapper: creator
            });
        } else {
            ownBeatmaps.push(beatmap);
        }
        
        // Track beatmapsets
        if (!beatmapsets.has(beatmapsetId)) {
            beatmapsets.set(beatmapsetId, {
                beatmapset_id: beatmapsetId,
                title: beatmap.title,
                artist: beatmap.artist,
                creator: creator,
                approved_date: beatmap.approved_date,
                difficulties: [],
                isOwnMapset: !isGuestDiff
            });
        }
        
        // Add difficulty to beatmapset
        const mapset = beatmapsets.get(beatmapsetId);
        mapset.difficulties.push({
            beatmap_id: beatmap.beatmap_id,
            version: beatmap.version,
            difficultyrating: beatmap.difficultyrating,
            mode: beatmap.mode,
            isGuestDiff: isGuestDiff
        });
    });
    
    return {
        beatmapsets: Array.from(beatmapsets.values()),
        guestDifficulties,
        ownBeatmaps,
        stats: {
            totalBeatmaps: beatmaps.length,
            totalBeatmapsets: beatmapsets.size,
            ownBeatmapsets: Array.from(beatmapsets.values()).filter(ms => ms.isOwnMapset).length,
            guestBeatmapsets: Array.from(beatmapsets.values()).filter(ms => !ms.isOwnMapset).length,
            totalGuestDiffs: guestDifficulties.length,
            ownDifficulties: ownBeatmaps.length
        }
    };
}

// Fetch all beatmaps for a specific user with pagination
async function fetchAllBeatmapsForUser(userId, sinceDate = null) {
    const beatmaps = [];
    const allBeatmapIds = new Set(); // Track unique beatmap IDs to avoid duplicates
    let requestCount = 0;
    const MAX_REQUESTS_PER_USER = 50; // Safety limit to prevent infinite loops
    
    console.log(`Fetching beatmaps for user ${userId}${sinceDate ? ` since ${sinceDate}` : ''}...`);
    
    // The osu! API doesn't support traditional pagination for get_beatmaps by user
    // Instead, we need to fetch all beatmaps and filter them
    // We'll use a different approach: fetch user's beatmaps in batches
    
    try {
        // First, get all beatmaps by this user (not filtered by approval status)
        const params = {
            k: OSU_API_KEY,
            u: userId,
            type: 'id',
            limit: 500 // Maximum allowed by API
        };
        
        if (sinceDate) {
            params.since = sinceDate;
        }
        
        console.log(`Making API request for user ${userId} beatmaps...`);
        const allUserBeatmaps = await makeApiRequest(`${BASE_URL}/get_beatmaps`, params);
        
        if (!allUserBeatmaps || allUserBeatmaps.length === 0) {
            console.log(`No beatmaps found for user ${userId}`);
            return [];
        }
        
        console.log(`Found ${allUserBeatmaps.length} total beatmaps for user ${userId}`);
        
        // Filter for ranked, approved, and loved beatmaps (approved = 1 for ranked, 2 for approved, 4 for loved)
        const rankedBeatmaps = allUserBeatmaps.filter(beatmap => {
            const isRankedOrLoved = beatmap.approved === '1' || beatmap.approved === '2' || beatmap.approved === '4';
            const isUnique = !allBeatmapIds.has(beatmap.beatmap_id);
            
            if (isRankedOrLoved && isUnique) {
                allBeatmapIds.add(beatmap.beatmap_id);
                return true;
            }
            return false;
        });
        
        beatmaps.push(...rankedBeatmaps);
        
        console.log(`Found ${rankedBeatmaps.length} ranked beatmaps for user ${userId}`);
        
        await delay(RATE_LIMIT_DELAY);
        
    } catch (error) {
        console.error(`Error fetching beatmaps for user ${userId}:`, error.message);
        
        // If there's an error, try to continue with other users
        if (error.response?.status === 429) {
            console.log(`Rate limited for user ${userId}, waiting longer...`);
            await delay(RATE_LIMIT_DELAY * 5);
        }
    }
    
    console.log(`Found ${beatmaps.length} ranked beatmaps for user ${userId}`);
    return beatmaps;
}

// Discover Korean mappers by fetching ranked beatmaps over a longer period and checking mapper countries
async function fetchKoreanMappersFromAPI() {
    const koreanMappers = new Set();
    const checkedUsers = new Set();
    
    console.log('Discovering Korean mappers from ranked beatmaps...');
    
    // Fetch ranked beatmaps over a longer period to discover Korean mappers
    // We'll check the last 180 days (6 months) to catch more mappers
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    const sinceDate = sixMonthsAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
        // Fetch recent ranked beatmaps
        let hasMore = true;
        let since = sinceDate;
        let requestCount = 0;
        const maxRequests = 50; // Increased limit to catch more mappers over 6 months
        
        while (hasMore && requestCount < maxRequests) {
            const beatmaps = await makeApiRequest(`${BASE_URL}/get_beatmaps`, {
                k: OSU_API_KEY,
                since: since,
                limit: MAX_BEATMAPS_PER_REQUEST
            });
            
            if (!beatmaps || beatmaps.length === 0) {
                hasMore = false;
                break;
            }
            
            console.log(`Checking ${beatmaps.length} recent beatmaps for Korean mappers...`);
            
            // Check each unique creator
            for (const beatmap of beatmaps) {
                const creatorId = beatmap.creator_id;
                
                if (!checkedUsers.has(creatorId)) {
                    checkedUsers.add(creatorId);
                    
                    try {
                        // Get user data to check country
                        const userData = await makeApiRequest(`${BASE_URL}/get_user`, {
                            k: OSU_API_KEY,
                            u: creatorId,
                            type: 'id'
                        });
                        
                        if (userData && userData.length > 0) {
                            const user = userData[0];
                            if (user.country === 'KR') {
                                koreanMappers.add(creatorId);
                                console.log(`Found Korean mapper: ${user.username} (${creatorId})`);
                            }
                        }
                        
                        await delay(RATE_LIMIT_DELAY);
                    } catch (error) {
                        console.error(`Error checking user ${creatorId}:`, error.message);
                    }
                }
            }
            
            // Update since date to the last beatmap's date for pagination
            if (beatmaps.length > 0) {
                const lastBeatmap = beatmaps[beatmaps.length - 1];
                since = lastBeatmap.last_update || lastBeatmap.approved_date;
            }
            
            requestCount++;
            await delay(RATE_LIMIT_DELAY);
        }
        
    } catch (error) {
        console.error('Error discovering Korean mappers:', error.message);
    }
    
    console.log(`Discovered ${koreanMappers.size} Korean mappers from recent beatmaps`);
    return Array.from(koreanMappers);
}

async function fetchKoreanMappers() {
    if (!OSU_API_KEY) {
        throw new Error('OSU_API_KEY environment variable is required');
    }

    console.log('Starting Korean mappers fetch with incremental updates...');
    
    // Load previous fetch state, existing data, and creator mappings
    const fetchState = await loadFetchState();
    const existingData = await loadExistingData();
    const creatorMappings = await loadCreatorMappings();
    
    const mappers = new Map();
    const processedUsers = new Set();
    
    // Convert existing mappers to Map for easier updates
    existingData.mappers.forEach(mapper => {
        mappers.set(mapper.user_id, mapper);
    });
    
    console.log(`Loaded ${existingData.mappers.length} existing mappers from previous run`);
    
    // Remove mappers that are in the ignore list
    let removedCount = 0;
    const mappersToRemove = [];
    
    for (const [userId, mapper] of mappers.entries()) {
        if (IGNORE_MAPPER_IDS.includes(parseInt(userId))) {
            mappersToRemove.push({ userId, username: mapper.username });
            mappers.delete(userId);
            removedCount++;
        }
    }
    
    if (removedCount > 0) {
        console.log(`🗑️  Removed ${removedCount} mappers from database (in ignore list):`);
        mappersToRemove.forEach(({ userId, username }) => {
            console.log(`   - ${username} (ID: ${userId})`);
        });
        
        // Also remove from fetch state
        mappersToRemove.forEach(({ userId }) => {
            if (fetchState.mapperStates[userId]) {
                delete fetchState.mapperStates[userId];
            }
        });
    }
    
    const currentTime = new Date().toISOString();
    
    // Check if force refresh is requested via environment variable
    const forceRefresh = process.env.FORCE_REFRESH === 'true';
    const isFullScan = forceRefresh || !fetchState.lastFullScan || 
        (Date.now() - new Date(fetchState.lastFullScan).getTime()) > 7 * 24 * 60 * 60 * 1000; // Weekly full scan
    
    // Force start date for data collection (set to 2020-01-01)
    const FORCE_START_DATE = '2020-01-01';
    console.log(`Forcing data collection from ${FORCE_START_DATE}...`);
    
    console.log(`Running ${isFullScan ? 'FULL' : 'INCREMENTAL'} scan${forceRefresh ? ' (FORCE REFRESH REQUESTED)' : ''}`);

    // Function to process a single user with incremental updates
    async function processUser(userId) {
        if (processedUsers.has(userId)) return;
        processedUsers.add(userId);

        // Add timeout to prevent getting stuck on problematic users
        const USER_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout per user
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout processing user ${userId}`)), USER_TIMEOUT);
        });

        try {
            console.log(`Processing user ID: ${userId}`);
            
            // Check if user is in ignore list
            if (IGNORE_MAPPER_IDS.includes(parseInt(userId))) {
                console.log(`User ID ${userId} is in ignore list, skipping`);
                return;
            }

            // Wrap the processing in a timeout
            await Promise.race([processUserInternal(userId), timeoutPromise]);
            
        } catch (error) {
            if (error.message.includes('Timeout')) {
                console.error(`⚠️  User ${userId} timed out after 5 minutes, skipping...`);
            } else {
                console.error(`Error processing user ${userId}:`, error.message);
            }
        }
    }

    // Internal function to process user without timeout wrapper
    async function processUserInternal(userId) {
        try {

            // Get user data
            const userData = await makeApiRequest(`${BASE_URL}/get_user`, {
                k: OSU_API_KEY,
                u: userId,
                type: 'id'
            });

            if (!userData || userData.length === 0) {
                console.log(`No user data found for ID: ${userId}`);
                return;
            }

            const user = userData[0];
            
            // Check if user is Korean or in manual list
            if (user.country !== 'KR' && !MANUAL_MAPPER_IDS.includes(parseInt(userId))) {
                console.log(`User ${user.username} is not Korean (${user.country}), skipping`);
                return;
            }
            
            // Determine if we need to fetch new beatmaps for this user
            const userState = fetchState.mapperStates[userId] || {};
            const lastBeatmapCheck = userState.lastBeatmapCheck;
            // Use forced start date instead of null for full scans
            const sinceDate = isFullScan ? FORCE_START_DATE : lastBeatmapCheck;
            
            // Fetch all beatmaps for this user with pagination
            const beatmaps = await fetchAllBeatmapsForUser(userId, sinceDate);
            
            if (beatmaps.length > 0) {
                // Categorize beatmaps into mapsets and guest difficulties
                const categorizedData = categorizeBeatmaps(beatmaps, user.username);
                
                // Update or create mapper entry
                const existingMapper = mappers.get(userId);
                
                if (existingMapper) {
                    // Merge new beatmaps with existing ones
                    const existingBeatmapIds = new Set(existingMapper.beatmaps.map(b => b.beatmap_id));
                    const newBeatmaps = beatmaps.filter(b => !existingBeatmapIds.has(b.beatmap_id));
                    
                    // Merge and recategorize all beatmaps
                    const allBeatmaps = [...existingMapper.beatmaps, ...newBeatmaps];
                    const updatedCategorizedData = categorizeBeatmaps(allBeatmaps, user.username);
                    
                    // Update aliases - collect all unique creator names from beatmaps
                    const allCreatorNames = new Set();
                    allBeatmaps.forEach(beatmap => {
                        if (beatmap.creator && beatmap.creator.trim()) {
                            const creatorName = beatmap.creator.trim();
                            allCreatorNames.add(creatorName);
                            // Update creator mapping for future reference
                            creatorMappings[creatorName] = userId;
                        }
                    });
                    // Add current username
                    allCreatorNames.add(user.username);
                    creatorMappings[user.username] = userId;
                    // Remove current username from aliases and convert to array
                    const aliases = Array.from(allCreatorNames).filter(name => name !== user.username).sort();
                    
                    existingMapper.username = user.username; // Update to current username
                    existingMapper.aliases = aliases;
                    existingMapper.beatmaps = allBeatmaps.sort((a, b) => new Date(b.approved_date) - new Date(a.approved_date));
                    existingMapper.beatmapsets = updatedCategorizedData.beatmapsets;
                    existingMapper.guestDifficulties = updatedCategorizedData.guestDifficulties;
                    existingMapper.stats = updatedCategorizedData.stats;
                    existingMapper.rankedBeatmaps = updatedCategorizedData.stats.totalBeatmaps;
                    existingMapper.rankedBeatmapsets = updatedCategorizedData.stats.totalBeatmapsets;
                    existingMapper.ownBeatmapsets = updatedCategorizedData.stats.ownBeatmapsets;
                    existingMapper.guestBeatmapsets = updatedCategorizedData.stats.guestBeatmapsets;
                    existingMapper.totalGuestDiffs = updatedCategorizedData.stats.totalGuestDiffs;
                    existingMapper.lastUpdated = currentTime;
                    
                    console.log(`Updated mapper ${user.username}: +${newBeatmaps.length} new beatmaps (total: ${existingMapper.rankedBeatmaps}, ${existingMapper.rankedBeatmapsets} mapsets, ${existingMapper.totalGuestDiffs} guest diffs)`);
                } else {
                    // Create new mapper entry
                    // Collect aliases - all unique creator names from beatmaps
                    const allCreatorNames = new Set();
                    beatmaps.forEach(beatmap => {
                        if (beatmap.creator && beatmap.creator.trim()) {
                            const creatorName = beatmap.creator.trim();
                            allCreatorNames.add(creatorName);
                            // Update creator mapping for future reference
                            creatorMappings[creatorName] = userId;
                        }
                    });
                    // Add current username
                    allCreatorNames.add(user.username);
                    creatorMappings[user.username] = userId;
                    // Remove current username from aliases and convert to array
                    const aliases = Array.from(allCreatorNames).filter(name => name !== user.username).sort();
                    
                    const mapper = {
                        user_id: userId,
                        username: user.username,
                        aliases: aliases,
                        country: user.country,
                        rankedBeatmaps: categorizedData.stats.totalBeatmaps,
                        rankedBeatmapsets: categorizedData.stats.totalBeatmapsets,
                        ownBeatmapsets: categorizedData.stats.ownBeatmapsets,
                        guestBeatmapsets: categorizedData.stats.guestBeatmapsets,
                        totalGuestDiffs: categorizedData.stats.totalGuestDiffs,
                        ownDifficulties: categorizedData.stats.ownDifficulties,
                        beatmaps: categorizedData.ownBeatmaps.concat(categorizedData.guestDifficulties).sort((a, b) => new Date(b.approved_date) - new Date(a.approved_date)),
                        beatmapsets: categorizedData.beatmapsets,
                        guestDifficulties: categorizedData.guestDifficulties,
                        stats: categorizedData.stats,
                        lastUpdated: currentTime
                    };
                    
                    mappers.set(userId, mapper);
                    console.log(`Added new mapper ${user.username}: ${mapper.rankedBeatmaps} beatmaps, ${mapper.rankedBeatmapsets} mapsets (${mapper.ownBeatmapsets} own, ${mapper.guestBeatmapsets} guest), ${mapper.totalGuestDiffs} guest diffs`);
                }
                
                // Update user state
                fetchState.mapperStates[userId] = {
                    lastBeatmapCheck: currentTime
                };
            } else if (!mappers.has(userId)) {
                console.log(`User ${user.username} has no ranked beatmaps, skipping`);
            }
            
        } catch (error) {
            console.error(`Error processing user ${userId}:`, error.message);
        }
    }

    // Process manual mapper IDs
    console.log(`Processing ${MANUAL_MAPPER_IDS.length} manual mapper IDs...`);
    for (const userId of MANUAL_MAPPER_IDS) {
        await processUser(userId.toString());
    }

    // If it's a full scan, also fetch Korean mappers from API
    if (isFullScan) {
        try {
            const apiKoreanMappers = await fetchKoreanMappersFromAPI();
            console.log(`Processing ${apiKoreanMappers.length} Korean mappers from API...`);
            
            for (const userId of apiKoreanMappers) {
                await processUser(userId.toString());
            }
        } catch (error) {
            console.error('Error fetching Korean mappers from API:', error.message);
        }
    }

    // Convert Map back to array and sort by ranked beatmaps
    const mappersArray = Array.from(mappers.values())
        .filter(mapper => mapper.rankedBeatmaps > 0)
        .sort((a, b) => b.rankedBeatmaps - a.rankedBeatmaps);

    // Update fetch state
    fetchState.lastChecked = currentTime;
    fetchState.totalBeatmaps = mappersArray.reduce((sum, mapper) => sum + mapper.rankedBeatmaps, 0);
    if (isFullScan) {
        fetchState.lastFullScan = currentTime;
    }

    // Save updated state and creator mappings
    await saveFetchState(fetchState);
    await saveCreatorMappings(creatorMappings);
    
    console.log(`💾 Saved creator mappings: ${Object.keys(creatorMappings).length} creator names tracked`);

    // Calculate aggregate statistics
    const totalBeatmapsets = mappersArray.reduce((sum, mapper) => sum + (mapper.rankedBeatmapsets || 0), 0);
    const totalOwnBeatmapsets = mappersArray.reduce((sum, mapper) => sum + (mapper.ownBeatmapsets || 0), 0);
    const totalGuestBeatmapsets = mappersArray.reduce((sum, mapper) => sum + (mapper.guestBeatmapsets || 0), 0);
    const totalGuestDiffs = mappersArray.reduce((sum, mapper) => sum + (mapper.totalGuestDiffs || 0), 0);
    const totalOwnDifficulties = mappersArray.reduce((sum, mapper) => sum + (mapper.ownDifficulties || 0), 0);

    // Prepare output data
    const outputData = {
        lastUpdated: currentTime,
        totalMappers: mappersArray.length,
        totalBeatmaps: fetchState.totalBeatmaps,
        totalBeatmapsets: totalBeatmapsets,
        totalOwnBeatmapsets: totalOwnBeatmapsets,
        totalGuestBeatmapsets: totalGuestBeatmapsets,
        totalGuestDiffs: totalGuestDiffs,
        totalOwnDifficulties: totalOwnDifficulties,
        scanType: isFullScan ? 'full' : 'incremental',
        mappers: mappersArray
    };

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Write the data to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(outputData, null, 2));

    console.log(`\n✅ Fetch completed successfully!`);
    console.log(`📊 Total mappers: ${outputData.totalMappers}`);
    console.log(`🎵 Total ranked beatmaps: ${outputData.totalBeatmaps}`);
    console.log(`📦 Total beatmapsets: ${outputData.totalBeatmapsets}`);
    console.log(`   ├─ Own mapsets: ${outputData.totalOwnBeatmapsets}`);
    console.log(`   └─ Guest mapsets: ${outputData.totalGuestBeatmapsets}`);
    console.log(`🎯 Total guest difficulties: ${outputData.totalGuestDiffs}`);
    console.log(`🔧 Total own difficulties: ${outputData.totalOwnDifficulties}`);
    console.log(`📁 Data saved to: ${OUTPUT_FILE}`);
    console.log(`💾 State saved to: ${STATE_FILE}`);

    return mappersArray;
}

// Main execution
if (require.main === module) {
    fetchKoreanMappers()
        .then(() => {
            console.log('Korean mappers data fetch completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error fetching Korean mappers:', error);
            process.exit(1);
        });
}

module.exports = { fetchKoreanMappers };
